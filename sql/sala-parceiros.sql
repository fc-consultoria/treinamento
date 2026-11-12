-- 12/11/2026 · Sala de demonstração · Parceiros (sistemistas, white label)
-- Chave por parceiro com validade máxima de 2 dias; o parceiro só vê dados fictícios.
create table if not exists sala_chaves(
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nome text not null,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null,
  ativa boolean not null default true,
  desligada_em timestamptz
);
create table if not exists sala_eventos(
  id bigint generated always as identity primary key,
  chave_id uuid not null references sala_chaves(id) on delete cascade,
  modulo text not null check (modulo in ('entrada','obra','vendas','trein')),
  em timestamptz not null default now(),
  segundos int not null default 0
);
create index if not exists sala_eventos_chave on sala_eventos(chave_id);
alter table sala_chaves enable row level security;
alter table sala_eventos enable row level security;
revoke all on sala_chaves, sala_eventos from anon, authenticated;

-- FC: criar chave (máx. 48 h)
create or replace function sala_criar(p_token uuid, p_nome text, p_horas int)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c text; h int := least(greatest(coalesce(p_horas,48),1),48); r sala_chaves;
begin
  if not pfc_eh_matriz(p_token) then return jsonb_build_object('erro','sem acesso'); end if;
  if coalesce(char_length(trim(p_nome)),0) not between 2 and 80 then return jsonb_build_object('erro','nome'); end if;
  loop
    c := upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
    exit when not exists(select 1 from sala_chaves where codigo=c);
  end loop;
  insert into sala_chaves(codigo,nome,expira_em) values(c,left(trim(p_nome),80),now()+make_interval(hours=>h)) returning * into r;
  return to_jsonb(r);
end $$;

-- FC: lista com o que cada parceiro abriu
create or replace function sala_lista(p_token uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if not pfc_eh_matriz(p_token) then return jsonb_build_object('erro','sem acesso'); end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id',k.id,'codigo',k.codigo,'nome',k.nome,'criado_em',k.criado_em,'expira_em',k.expira_em,
      'ativa',(k.ativa and k.expira_em>now()),'desligada_em',k.desligada_em,
      'mods',(select coalesce(jsonb_object_agg(m.modulo,jsonb_build_object('vezes',m.v,'seg',m.s,'ultima',m.u)),'{}'::jsonb)
              from (select modulo,count(*) v,sum(segundos) s,max(em) u from sala_eventos where chave_id=k.id group by modulo) m))
    order by (k.ativa and k.expira_em>now()) desc, k.criado_em desc) from sala_chaves k),'[]'::jsonb);
end $$;

-- FC: desligar ou excluir
create or replace function sala_definir(p_token uuid, p_id uuid, p_acao text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  if not pfc_eh_matriz(p_token) then return false; end if;
  if p_acao='excluir' then delete from sala_chaves where id=p_id; return found; end if;
  if p_acao='desligar' then update sala_chaves set ativa=false, desligada_em=now() where id=p_id; return found; end if;
  return false;
end $$;

-- Parceiro: abrir a sala (devolve só nome e validade)
create or replace function sala_abrir(p_codigo text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare k sala_chaves;
begin
  select * into k from sala_chaves where codigo=upper(trim(p_codigo));
  if k.id is null or not k.ativa or k.expira_em<=now() then return jsonb_build_object('ok',false); end if;
  if not exists(select 1 from sala_eventos where chave_id=k.id and modulo='entrada' and em>now()-interval '10 minutes') then
    insert into sala_eventos(chave_id,modulo) values(k.id,'entrada');
  end if;
  return jsonb_build_object('ok',true,'nome',k.nome,'expira_em',k.expira_em);
end $$;

-- Parceiro: registra módulo aberto (devolve o id para contar o tempo)
create or replace function sala_evento(p_codigo text, p_modulo text)
returns bigint language plpgsql security definer set search_path=public as $$
declare k sala_chaves; i bigint;
begin
  if p_modulo not in ('obra','vendas','trein') then return null; end if;
  select * into k from sala_chaves where codigo=upper(trim(p_codigo));
  if k.id is null or not k.ativa or k.expira_em<=now() then return null; end if;
  if (select count(*) from sala_eventos where chave_id=k.id) >= 500 then return null; end if;
  insert into sala_eventos(chave_id,modulo) values(k.id,p_modulo) returning id into i;
  return i;
end $$;

-- Parceiro: soma 30 s de uso; responde se a chave ainda vale
create or replace function sala_ping(p_codigo text, p_evento bigint)
returns boolean language plpgsql security definer set search_path=public as $$
declare k sala_chaves;
begin
  select * into k from sala_chaves where codigo=upper(trim(p_codigo));
  if k.id is null or not k.ativa or k.expira_em<=now() then return false; end if;
  if p_evento is not null then
    update sala_eventos set segundos=least(segundos+30,7200) where id=p_evento and chave_id=k.id;
  end if;
  return true;
end $$;

grant execute on function sala_criar(uuid,text,int), sala_lista(uuid), sala_definir(uuid,uuid,text),
  sala_abrir(text), sala_evento(text,text), sala_ping(text,bigint) to anon, authenticated;
