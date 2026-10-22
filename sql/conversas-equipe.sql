-- Central de Conversas das empresas clientes (22/10/2026 · migração emp_conversas)
-- dm  = conversa individual entre duas pessoas da empresa (só as duas escrevem).
-- fc  = conversa individual de uma pessoa com a FC Consultoria.
-- O gestor da empresa lê o histórico de todas (só leitura). A FC lê tudo e responde as conversas "fc".

create table if not exists public.emp_conversas (
  id uuid primary key default gen_random_uuid(),
  empresa_id text not null,
  tipo text not null check (tipo in ('dm','fc')),
  a uuid not null references public.emp_pessoas(id) on delete cascade,
  b uuid references public.emp_pessoas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  ultima_em timestamptz not null default now(),
  check ((tipo = 'dm' and b is not null and a < b) or (tipo = 'fc' and b is null))
);
create unique index if not exists emp_conversas_dm_uk on public.emp_conversas (a, b) where tipo = 'dm';
create unique index if not exists emp_conversas_fc_uk on public.emp_conversas (a) where tipo = 'fc';
create index if not exists emp_conversas_emp on public.emp_conversas (empresa_id, ultima_em desc);

create table if not exists public.emp_msgs (
  id bigserial primary key,
  conversa_id uuid not null references public.emp_conversas(id) on delete cascade,
  de uuid references public.emp_pessoas(id) on delete set null,   -- null = FC
  nome text not null,
  texto text not null,
  em timestamptz not null default now()
);
create index if not exists emp_msgs_conv on public.emp_msgs (conversa_id, id);

create table if not exists public.emp_lidos (
  conversa_id uuid not null references public.emp_conversas(id) on delete cascade,
  leitor text not null,              -- id da pessoa ou 'fc'
  ultima_id bigint not null default 0,
  primary key (conversa_id, leitor)
);

alter table public.emp_conversas enable row level security;
alter table public.emp_msgs enable row level security;
alter table public.emp_lidos enable row level security;

-- resumo de uma conversa para a lista
create or replace function public.emp_conv_json(c public.emp_conversas, p_leitor text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', c.id, 'tipo', c.tipo, 'ultima_em', c.ultima_em,
    'a', (select jsonb_build_object('id',id,'nome',nome,'papel',papel) from emp_pessoas where id = c.a),
    'b', (select jsonb_build_object('id',id,'nome',nome,'papel',papel) from emp_pessoas where id = c.b),
    'ultima', (select jsonb_build_object('nome',m.nome,'texto',left(m.texto,120),'em',m.em,'fc',m.de is null) from emp_msgs m where m.conversa_id = c.id order by m.id desc limit 1),
    'nao_lidas', case when p_leitor is null then 0 else (select count(*) from emp_msgs m where m.conversa_id = c.id
        and m.id > coalesce((select ultima_id from emp_lidos l where l.conversa_id = c.id and l.leitor = p_leitor), 0)
        and (case when p_leitor = 'fc' then m.de is not null else m.de::text is distinct from p_leitor end)) end) $$;
revoke all on function public.emp_conv_json(public.emp_conversas, text) from public, anon, authenticated;

-- ---------- Equipe (sessão da pessoa) ----------
create or replace function public.emp_chat_lista(p_token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me emp_pessoas;
begin
  me := emp_token_pessoa(p_token);
  if me.id is null then return null; end if;
  return jsonb_build_object(
    'eu', jsonb_build_object('id', me.id, 'nome', me.nome, 'papel', me.papel),
    'contatos', coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'nome',p.nome,'papel',p.papel,
        'online', exists(select 1 from emp_eventos v where v.pessoa_id = p.id and v.em > now() - interval '10 minutes')) order by p.nome)
        from emp_pessoas p where p.empresa_id = me.empresa_id and p.ativo and p.id <> me.id), '[]'::jsonb),
    'minhas', coalesce((select jsonb_agg(emp_conv_json(c, me.id::text) order by c.ultima_em desc) from emp_conversas c
        where c.empresa_id = me.empresa_id and (c.a = me.id or c.b = me.id)), '[]'::jsonb),
    'historico', case when me.papel = 'gestor' then coalesce((select jsonb_agg(emp_conv_json(c, null) order by c.ultima_em desc)
        from emp_conversas c where c.empresa_id = me.empresa_id and c.a <> me.id and c.b is distinct from me.id
        and exists(select 1 from emp_msgs m where m.conversa_id = c.id)), '[]'::jsonb) end);
end $$;

-- abre (ou cria) a conversa com uma pessoa (p_com = id) ou com a FC (p_com = 'fc')
create or replace function public.emp_chat_abrir(p_token text, p_com text) returns uuid
language plpgsql security definer set search_path = public as $$
declare me emp_pessoas; o emp_pessoas; cid uuid; x uuid; y uuid;
begin
  me := emp_token_pessoa(p_token);
  if me.id is null then return null; end if;
  if p_com = 'fc' then
    select id into cid from emp_conversas where tipo = 'fc' and a = me.id;
    if cid is null then insert into emp_conversas(empresa_id, tipo, a) values (me.empresa_id, 'fc', me.id) returning id into cid; end if;
    return cid;
  end if;
  select * into o from emp_pessoas where id = p_com::uuid and empresa_id = me.empresa_id and ativo;
  if o.id is null or o.id = me.id then return null; end if;
  x := least(me.id, o.id); y := greatest(me.id, o.id);
  select id into cid from emp_conversas where tipo = 'dm' and a = x and b = y;
  if cid is null then insert into emp_conversas(empresa_id, tipo, a, b) values (me.empresa_id, 'dm', x, y) returning id into cid; end if;
  return cid;
end $$;

-- mensagens de uma conversa: participante (marca como lida) ou gestor da empresa (só leitura)
create or replace function public.emp_chat_msgs(p_token text, p_conversa uuid, p_desde bigint default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me emp_pessoas; c emp_conversas; part boolean; mx bigint;
begin
  me := emp_token_pessoa(p_token);
  select * into c from emp_conversas where id = p_conversa;
  if me.id is null or c.id is null or c.empresa_id <> me.empresa_id then return null; end if;
  part := c.a = me.id or c.b = me.id;
  if not part and me.papel <> 'gestor' then return null; end if;
  if part then
    select max(id) into mx from emp_msgs where conversa_id = c.id;
    if mx is not null then
      insert into emp_lidos(conversa_id, leitor, ultima_id) values (c.id, me.id::text, mx)
        on conflict (conversa_id, leitor) do update set ultima_id = greatest(emp_lidos.ultima_id, excluded.ultima_id);
    end if;
  end if;
  return jsonb_build_object('conversa', emp_conv_json(c, null), 'pode_escrever', part,
    'lido_outro', case when c.tipo = 'fc' then (select ultima_id from emp_lidos where conversa_id = c.id and leitor = 'fc')
                       else (select ultima_id from emp_lidos where conversa_id = c.id and leitor = (case when c.a = me.id then c.b else c.a end)::text) end,
    'msgs', coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'de',m.de,'nome',m.nome,'texto',m.texto,'em',m.em,'fc',m.de is null) order by m.id)
      from emp_msgs m where m.conversa_id = c.id and m.id > coalesce(p_desde,0)), '[]'::jsonb));
end $$;

create or replace function public.emp_chat_enviar(p_token text, p_conversa uuid, p_texto text) returns bigint
language plpgsql security definer set search_path = public as $$
declare me emp_pessoas; c emp_conversas; mid bigint;
begin
  me := emp_token_pessoa(p_token);
  select * into c from emp_conversas where id = p_conversa;
  if me.id is null or c.id is null or not (c.a = me.id or c.b = me.id) then return null; end if;
  if coalesce(trim(p_texto),'') = '' then return null; end if;
  insert into emp_msgs(conversa_id, de, nome, texto) values (c.id, me.id, me.nome, left(trim(p_texto), 4000)) returning id into mid;
  update emp_conversas set ultima_em = now() where id = c.id;
  insert into emp_lidos(conversa_id, leitor, ultima_id) values (c.id, me.id::text, mid)
    on conflict (conversa_id, leitor) do update set ultima_id = excluded.ultima_id;
  return mid;
end $$;

create or replace function public.emp_chat_nao_lidas(p_token text) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum((emp_conv_json(c, p.id::text)->>'nao_lidas')::int), 0)::int
  from emp_token_pessoa(p_token) p join emp_conversas c on c.a = p.id or c.b = p.id where p.id is not null $$;

-- ---------- FC (Painel da Matriz) ----------
create or replace function public.emp_chat_fc_lista() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  return jsonb_build_object(
    'empresas', coalesce((select jsonb_object_agg(id, data->>'nome') from rotina_docs where col = 'consultoria'), '{}'::jsonb),
    'conversas', coalesce((select jsonb_agg(emp_conv_json(c, case when c.tipo = 'fc' then 'fc' end) || jsonb_build_object('emp', c.empresa_id) order by c.ultima_em desc)
      from emp_conversas c where exists(select 1 from emp_msgs m where m.conversa_id = c.id)), '[]'::jsonb),
    'sup_novas', (select count(*) from orc_sup where de <> 'fc' and not coalesce(lido,false)));
end $$;

create or replace function public.emp_chat_fc_msgs(p_conversa uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c emp_conversas; mx bigint;
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  select * into c from emp_conversas where id = p_conversa;
  if c.id is null then return null; end if;
  if c.tipo = 'fc' then
    select max(id) into mx from emp_msgs where conversa_id = c.id;
    if mx is not null then
      insert into emp_lidos(conversa_id, leitor, ultima_id) values (c.id, 'fc', mx)
        on conflict (conversa_id, leitor) do update set ultima_id = greatest(emp_lidos.ultima_id, excluded.ultima_id);
    end if;
  end if;
  return jsonb_build_object('conversa', emp_conv_json(c, null) || jsonb_build_object('emp', c.empresa_id), 'pode_escrever', c.tipo = 'fc',
    'lido_outro', (select ultima_id from emp_lidos where conversa_id = c.id and leitor = c.a::text),
    'msgs', coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'de',m.de,'nome',m.nome,'texto',m.texto,'em',m.em,'fc',m.de is null) order by m.id)
      from emp_msgs m where m.conversa_id = c.id), '[]'::jsonb));
end $$;

create or replace function public.emp_chat_fc_enviar(p_conversa uuid, p_texto text) returns bigint
language plpgsql security definer set search_path = public as $$
declare c emp_conversas; mid bigint;
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  select * into c from emp_conversas where id = p_conversa and tipo = 'fc';
  if c.id is null or coalesce(trim(p_texto),'') = '' then return null; end if;
  insert into emp_msgs(conversa_id, de, nome, texto) values (c.id, null, 'FC Consultoria', left(trim(p_texto), 4000)) returning id into mid;
  update emp_conversas set ultima_em = now() where id = c.id;
  insert into emp_lidos(conversa_id, leitor, ultima_id) values (c.id, 'fc', mid)
    on conflict (conversa_id, leitor) do update set ultima_id = excluded.ultima_id;
  return mid;
end $$;

create or replace function public.emp_chat_fc_nao_lidas() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not trein_is_admin() then return null; end if;
  return jsonb_build_object(
    'conversas', (select count(*) from emp_msgs m join emp_conversas c on c.id = m.conversa_id
       where c.tipo = 'fc' and m.de is not null
         and m.id > coalesce((select ultima_id from emp_lidos l where l.conversa_id = c.id and l.leitor = 'fc'), 0)),
    'sup', (select count(*) from orc_sup where de <> 'fc' and not coalesce(lido,false)),
    'ultima', (select max(m.id) from emp_msgs m join emp_conversas c on c.id = m.conversa_id where c.tipo = 'fc' and m.de is not null));
end $$;

grant execute on function public.emp_chat_lista(text), public.emp_chat_abrir(text,text), public.emp_chat_msgs(text,uuid,bigint),
  public.emp_chat_enviar(text,uuid,text), public.emp_chat_nao_lidas(text),
  public.emp_chat_fc_lista(), public.emp_chat_fc_msgs(uuid), public.emp_chat_fc_enviar(uuid,text), public.emp_chat_fc_nao_lidas()
  to anon, authenticated;
