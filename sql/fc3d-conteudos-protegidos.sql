-- Plataforma FC 3D · Conteúdos protegidos (blindagem)
-- Os desenhos, imagens e textos de cada linha ficam no banco, e não no HTML público.
-- A página só recebe o conteúdo depois do login, e cada empresa só recebe o que é dela.
-- Registro de acessos (log) para atender ao controle de acesso e à guarda de logs (mín. 6 meses).

create table if not exists public.fc3d_conteudos(
  id text primary key check (id ~ '^[a-z0-9-]{2,60}$'),
  empresa_id text not null references public.fc3d_empresas(id) on delete cascade,
  titulo text not null,
  html text not null,
  tam int not null default 0,
  versao int not null default 1,
  atualizado timestamptz not null default now());

create table if not exists public.fc3d_log(
  id bigserial primary key,
  quando timestamptz not null default now(),
  empresa_id text, acesso_id uuid, nome text, matriz boolean not null default false,
  acao text not null, ref text);
create index if not exists fc3d_log_quando on public.fc3d_log(quando);
create index if not exists fc3d_log_emp on public.fc3d_log(empresa_id, quando desc);

alter table public.fc3d_conteudos enable row level security;
alter table public.fc3d_log enable row level security;

-- registra um evento (uso interno das funções)
create or replace function public.fc3d_logar(s public.fc3d_sessoes, p_emp text, p_acao text, p_ref text) returns void
language plpgsql security definer set search_path to 'public' as $$
begin
  insert into fc3d_log(empresa_id,acesso_id,nome,matriz,acao,ref)
  values(coalesce(p_emp,s.empresa_id),s.acesso_id,s.nome,s.matriz,p_acao,p_ref);
  -- guarda 13 meses (o acordo pede no mínimo 6)
  if random()<0.02 then delete from fc3d_log where quando<now()-interval '13 months'; end if;
end $$;

-- entrega o conteúdo protegido só para quem está logado e é da empresa dona (ou a matriz FC)
create or replace function public.fc3d_conteudo(p_token uuid, p_id text) returns text
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); c public.fc3d_conteudos;
begin
  select * into c from fc3d_conteudos where id=p_id;
  if c.id is null then raise exception 'Conteúdo ainda não publicado.'; end if;
  if not s.matriz and c.empresa_id is distinct from s.empresa_id then
    perform fc3d_logar(s,s.empresa_id,'negado',p_id);
    raise exception 'Este conteúdo não faz parte da sua licença.';
  end if;
  perform fc3d_logar(s,c.empresa_id,'abriu',p_id);
  return c.html;
end $$;

-- lista os conteúdos (só matriz)
create or replace function public.fc3d_conteudos_lista(p_token uuid) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token);
begin
  if not s.matriz then raise exception 'Somente a FC Consultoria'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'empresa_id',c.empresa_id,'titulo',c.titulo,'tam',c.tam,'versao',c.versao,'atualizado',c.atualizado,
    'aberturas',(select count(*) from fc3d_log l where l.ref=c.id and l.acao='abriu' and l.quando>now()-interval '30 days'))
    order by c.empresa_id,c.id) from fc3d_conteudos c),'[]');
end $$;

-- publica ou atualiza um conteúdo (só matriz)
create or replace function public.fc3d_conteudo_salvar(p_token uuid, p_id text, p_empresa text, p_titulo text, p_html text) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); v int;
begin
  if not s.matriz then raise exception 'Somente a FC Consultoria'; end if;
  if p_html is null or length(p_html)<100 then raise exception 'Arquivo vazio ou inválido'; end if;
  if not exists(select 1 from fc3d_empresas where id=p_empresa) then raise exception 'Empresa não encontrada'; end if;
  insert into fc3d_conteudos(id,empresa_id,titulo,html,tam) values(lower(trim(p_id)),p_empresa,p_titulo,p_html,octet_length(p_html))
  on conflict (id) do update set empresa_id=excluded.empresa_id,titulo=excluded.titulo,html=excluded.html,tam=excluded.tam,
    versao=fc3d_conteudos.versao+1,atualizado=now()
  returning versao into v;
  perform fc3d_logar(s,p_empresa,'publicou',lower(trim(p_id)));
  return jsonb_build_object('id',lower(trim(p_id)),'versao',v);
end $$;

-- exclui um conteúdo (só matriz)
create or replace function public.fc3d_conteudo_excluir(p_token uuid, p_id text) returns void
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); e text;
begin
  if not s.matriz then raise exception 'Somente a FC Consultoria'; end if;
  delete from fc3d_conteudos where id=p_id returning empresa_id into e;
  perform fc3d_logar(s,e,'excluiu',p_id);
end $$;

-- relatório de acessos da empresa (matriz vê qualquer uma; gestor vê a própria)
create or replace function public.fc3d_log_lista(p_token uuid, p_empresa text default null, p_dias int default 30) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); emp text:=fc3d_emp(s,p_empresa);
begin
  if not s.matriz and s.papel<>'gestor' then raise exception 'Somente o gestor'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('quando',l.quando,'nome',l.nome,'matriz',l.matriz,'acao',l.acao,'ref',l.ref) order by l.quando desc)
    from (select * from fc3d_log where empresa_id=emp and quando>now()-make_interval(days=>least(greatest(p_dias,1),400)) order by quando desc limit 500) l),'[]');
end $$;

revoke all on function public.fc3d_logar(public.fc3d_sessoes,text,text,text) from public, anon, authenticated;
grant execute on function public.fc3d_conteudo(uuid,text), public.fc3d_conteudos_lista(uuid),
  public.fc3d_conteudo_salvar(uuid,text,text,text,text), public.fc3d_conteudo_excluir(uuid,text),
  public.fc3d_log_lista(uuid,text,int) to anon, authenticated;
