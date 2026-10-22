-- Precificação de Kits · acesso "gestor" compartilhado (até 4 pessoas), presença, travas e histórico
-- Pode rodar mais de uma vez sem problema.

-- 1) Colunas novas
alter table public.precif_acessos add column if not exists max_usuarios int;
alter table public.precif_sessoes add column if not exists usuario text;
alter table public.precif_sessoes add column if not exists visto timestamptz not null default now();
alter table public.precif_sessoes add column if not exists estado jsonb;
alter table public.precif_modelos add column if not exists atualizado_token uuid;
alter table public.precif_modelos add column if not exists atualizado_nome text;

-- 2) Histórico de acessos e travas de edição
create table if not exists public.precif_eventos(
  id bigserial primary key, em timestamptz not null default now(), token uuid, login text, empresa text,
  usuario text, tipo text not null, detalhe jsonb);
create index if not exists precif_eventos_em on public.precif_eventos(em desc);
create table if not exists public.precif_travas(
  empresa text not null, modelo text not null, token uuid not null, nome text, desde timestamptz not null default now(),
  visto timestamptz not null default now(), primary key(empresa, modelo));
alter table public.precif_eventos enable row level security;
alter table public.precif_travas enable row level security;

-- 3) Acesso gestor (CDE, até 4 pessoas ao mesmo tempo)
insert into public.precif_acessos(login, senha_hash, empresa, nome, linhas_ocultas, ativo, max_usuarios)
select 'gestor', extensions.crypt('administrador', extensions.gen_salt('bf')), 'cde', 'CDE Vidros & Esquadrias', linhas_ocultas, true, 4
  from public.precif_acessos where login = 'cde'
on conflict (login) do update set max_usuarios = 4, ativo = true;

-- 4) Funções
create or replace function public.precif_nome(s public.precif_sessoes) returns text language sql stable as $$
  select coalesce(nullif(trim(s.usuario), ''), case when s.login = 'fc' then 'FC Consultoria' when s.login = 'cde' then 'CDE' else initcap(s.login) end)
$$;

create or replace function public.precif_sessao(p_token uuid) returns public.precif_sessoes
language plpgsql security definer set search_path to 'public' as $$
declare s public.precif_sessoes; mx int;
begin
  select s2.* into s from public.precif_sessoes s2 join public.precif_acessos a on a.login = s2.login and a.ativo
   where s2.token = p_token and s2.expira > now();
  if s.token is null then raise exception 'Sessão expirada. Entre novamente.'; end if;
  select max_usuarios into mx from public.precif_acessos where login = s.login;
  if mx is not null and s.visto < now() - interval '3 minutes'
     and (select count(*) from public.precif_sessoes x where x.login = s.login and x.token <> s.token and x.visto > now() - interval '3 minutes') >= mx then
    raise exception 'Acesso cheio agora, tente em alguns minutos';
  end if;
  return s;
end $$;

drop function if exists public.precif_login(text, text);
create or replace function public.precif_login(p_login text, p_senha text, p_usuario text default null) returns jsonb
language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare a public.precif_acessos; t uuid; u text := nullif(trim(coalesce(p_usuario, '')), '');
begin
  select * into a from public.precif_acessos where login = lower(trim(p_login)) and ativo;
  if a.login is null or a.senha_hash <> crypt(p_senha, a.senha_hash) then raise exception 'Empresa ou senha incorretas'; end if;
  delete from public.precif_sessoes where expira < now();
  if a.max_usuarios is not null then
    if u is null then raise exception 'Digite o seu nome'; end if;
    u := left(u, 40);
    if exists (select 1 from public.precif_sessoes where login = a.login and lower(usuario) = lower(u) and visto > now() - interval '3 minutes') then
      raise exception 'Já tem alguém usando com o nome %. Digite outro nome (ex.: % e a inicial do sobrenome).', u, u;
    end if;
    delete from public.precif_sessoes where login = a.login and lower(usuario) = lower(u);
    if (select count(*) from public.precif_sessoes where login = a.login and visto > now() - interval '3 minutes') >= a.max_usuarios then
      raise exception 'Acesso cheio agora, tente em alguns minutos';
    end if;
  else
    u := null;
  end if;
  insert into public.precif_sessoes(login, empresa, usuario, visto) values (a.login, a.empresa, u, now()) returning token into t;
  if a.login <> 'fc' then
    insert into public.precif_eventos(token, login, empresa, usuario, tipo) values (t, a.login, a.empresa, u, 'entrou');
  end if;
  return jsonb_build_object('token', t, 'empresa', a.empresa, 'nome', coalesce(a.nome, a.login), 'ocultas', to_jsonb(a.linhas_ocultas),
                            'login', a.login, 'usuario', u, 'max', a.max_usuarios);
end $$;

create or replace function public.precif_sair(p_token uuid) returns void
language sql security definer set search_path to 'public' as $$
  delete from public.precif_travas where token = p_token;
  delete from public.precif_sessoes where token = p_token;
$$;

-- aba fechada: libera a vaga e a trava na hora (a sessão continua válida para quando voltar)
create or replace function public.precif_ausente(p_token uuid) returns void
language sql security definer set search_path to 'public' as $$
  delete from public.precif_travas where token = p_token;
  update public.precif_sessoes set visto = now() - interval '1 day' where token = p_token;
$$;

create or replace function public.precif_evento(p_token uuid, p_tipo text, p_detalhe jsonb default null) returns void
language plpgsql security definer set search_path to 'public' as $$
declare s public.precif_sessoes := public.precif_sessao(p_token);
begin
  if s.login = 'fc' then return; end if;
  insert into public.precif_eventos(token, login, empresa, usuario, tipo, detalhe) values (s.token, s.login, s.empresa, s.usuario, left(p_tipo, 30), p_detalhe);
end $$;

-- pega/renova a trava de um kit (modelo); devolve {ok, por, versao}
create or replace function public.precif_trava_pegar(s public.precif_sessoes, p_id text) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare t public.precif_travas;
begin
  delete from public.precif_travas where visto < now() - interval '60 seconds';
  delete from public.precif_travas where token = s.token and (modelo <> p_id or empresa <> s.empresa);
  insert into public.precif_travas(empresa, modelo, token, nome) values (s.empresa, p_id, s.token, public.precif_nome(s))
  on conflict (empresa, modelo) do update set visto = now() where public.precif_travas.token = s.token;
  select * into t from public.precif_travas where empresa = s.empresa and modelo = p_id;
  if t.token <> s.token then return jsonb_build_object('ok', false, 'por', t.nome); end if;
  return jsonb_build_object('ok', true, 'versao', (select atualizado_em from public.precif_modelos where empresa = s.empresa and id = p_id));
end $$;

create or replace function public.precif_travar(p_token uuid, p_id text) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s public.precif_sessoes := public.precif_sessao(p_token);
begin
  update public.precif_sessoes set visto = now() where token = s.token;
  return public.precif_trava_pegar(s, p_id);
end $$;

-- a cada poucos segundos: presença, quem está usando, travas e alterações de outras pessoas
drop function if exists public.precif_ping(uuid, jsonb);
create or replace function public.precif_ping(p_token uuid, p_estado jsonb default null, p_editando text default null, p_desde timestamptz default null) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s public.precif_sessoes := public.precif_sessao(p_token); tr jsonb := null; mx int;
begin
  update public.precif_sessoes set visto = now(), estado = coalesce(p_estado, estado) where token = s.token;
  if p_editando is null then delete from public.precif_travas where token = s.token;
  else tr := public.precif_trava_pegar(s, p_editando); end if;
  delete from public.precif_travas where visto < now() - interval '60 seconds';
  select max_usuarios into mx from public.precif_acessos where login = s.login;
  return jsonb_build_object(
    'agora', now(), 'trava', tr, 'max', mx,
    'usuarios', case when mx is null then '[]'::jsonb else coalesce((select jsonb_agg(public.precif_nome(x) order by x.visto) from public.precif_sessoes x
                  where x.login = s.login and x.visto > now() - interval '3 minutes' and x.token <> s.token), '[]'::jsonb) end,
    'travas', coalesce((select jsonb_agg(jsonb_build_object('id', modelo, 'por', nome)) from public.precif_travas
                  where empresa = s.empresa and token <> s.token), '[]'::jsonb),
    'alteracoes', case when p_desde is null then '[]'::jsonb else coalesce((select jsonb_agg(jsonb_build_object('id', id, 'nome', dados->>'nome', 'por', atualizado_nome, 'em', atualizado_em) order by atualizado_em)
                  from public.precif_modelos where empresa = s.empresa and atualizado_em > p_desde and atualizado_token is distinct from s.token), '[]'::jsonb) end);
end $$;

drop function if exists public.precif_salvar(uuid, text, jsonb);
create or replace function public.precif_salvar(p_token uuid, p_id text, p_dados jsonb, p_base timestamptz default null) returns timestamptz
language plpgsql security definer set search_path to 'public' as $$
declare s public.precif_sessoes := public.precif_sessao(p_token); t public.precif_travas; m public.precif_modelos; r timestamptz;
begin
  select * into t from public.precif_travas where empresa = s.empresa and modelo = p_id and token <> s.token and visto > now() - interval '60 seconds';
  if t.token is not null then raise exception 'Em edição por %', t.nome; end if;
  select * into m from public.precif_modelos where empresa = s.empresa and id = p_id;
  if p_base is not null and m.id is not null and m.atualizado_em > p_base and m.atualizado_token is distinct from s.token then
    raise exception 'Alterado por % enquanto você editava', coalesce(m.atualizado_nome, 'outra pessoa');
  end if;
  insert into public.precif_modelos(empresa, id, dados, atualizado_em, atualizado_por, atualizado_token, atualizado_nome)
  values (s.empresa, p_id, p_dados, clock_timestamp(), s.login, s.token, public.precif_nome(s))
  on conflict (empresa, id) do update set dados = excluded.dados, atualizado_em = excluded.atualizado_em, atualizado_por = excluded.atualizado_por,
     atualizado_token = excluded.atualizado_token, atualizado_nome = excluded.atualizado_nome
  returning atualizado_em into r;
  update public.precif_sessoes set visto = now() where token = s.token;
  if s.login <> 'fc' and not exists (select 1 from public.precif_eventos where token = s.token and tipo = 'alterou' and detalhe->>'id' = p_id and em > now() - interval '2 minutes') then
    insert into public.precif_eventos(token, login, empresa, usuario, tipo, detalhe)
    values (s.token, s.login, s.empresa, s.usuario, 'alterou', jsonb_build_object('id', p_id, 'modelo', p_dados->>'nome'));
  end if;
  return r;
end $$;

create or replace function public.precif_excluir(p_token uuid, p_id text) returns void
language plpgsql security definer set search_path to 'public' as $$
declare s public.precif_sessoes := public.precif_sessao(p_token); t public.precif_travas; n text;
begin
  select * into t from public.precif_travas where empresa = s.empresa and modelo = p_id and token <> s.token and visto > now() - interval '60 seconds';
  if t.token is not null then raise exception 'Em edição por %', t.nome; end if;
  delete from public.precif_modelos where empresa = s.empresa and id = p_id returning dados->>'nome' into n;
  delete from public.precif_travas where empresa = s.empresa and modelo = p_id;
  if s.login <> 'fc' then
    insert into public.precif_eventos(token, login, empresa, usuario, tipo, detalhe) values (s.token, s.login, s.empresa, s.usuario, 'excluiu', jsonb_build_object('id', p_id, 'modelo', n));
  end if;
end $$;

-- Acompanhar (dentro da precificação, só FC)
create or replace function public.precif_monitor(p_token uuid, p_empresa text default null, p_limite int default 300) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s public.precif_sessoes := public.precif_sessao(p_token);
begin
  if s.login <> 'fc' then raise exception 'Sem permissão'; end if;
  return jsonb_build_object(
    'online', coalesce((select jsonb_agg(jsonb_build_object('token', token, 'login', login, 'usuario', usuario, 'empresa', empresa, 'estado', estado, 'visto', visto) order by visto desc)
                 from public.precif_sessoes where login <> 'fc' and visto > now() - interval '2 minutes' and (p_empresa is null or empresa = p_empresa)), '[]'::jsonb),
    'eventos', coalesce((select jsonb_agg(jsonb_build_object('em', em, 'empresa', empresa, 'login', login, 'usuario', usuario, 'tipo', tipo, 'detalhe', detalhe) order by em desc)
                 from (select * from public.precif_eventos where p_empresa is null or empresa = p_empresa order by em desc limit least(greatest(p_limite, 1), 1000)) e), '[]'::jsonb));
end $$;

-- Card do Painel da Matriz (login matriz)
create or replace function public.precif_monitor_matriz() returns jsonb
language plpgsql security definer set search_path to 'public' as $$
begin
  if not exists (select 1 from public.trein_alunos where user_id = auth.uid() and papel = 'admin' and ativo) then raise exception 'Sem permissão'; end if;
  return jsonb_build_object(
    'online', (select count(*) from public.precif_sessoes where login <> 'fc' and visto > now() - interval '2 minutes'),
    'pessoas', coalesce((select jsonb_agg(jsonb_build_object('login', login, 'usuario', usuario, 'empresa', empresa)) from public.precif_sessoes where login <> 'fc' and visto > now() - interval '2 minutes'), '[]'::jsonb),
    'ultimo', (select jsonb_build_object('login', login, 'usuario', usuario, 'em', em, 'tipo', tipo, 'detalhe', detalhe) from public.precif_eventos order by em desc limit 1));
end $$;

revoke execute on function public.precif_nome(public.precif_sessoes) from public, anon, authenticated;
revoke execute on function public.precif_trava_pegar(public.precif_sessoes, text) from public, anon, authenticated;
revoke execute on function public.precif_sessao(uuid) from public, anon, authenticated;
revoke execute on function public.precif_monitor_matriz() from public, anon;
grant execute on function public.precif_monitor_matriz() to authenticated;
grant execute on function public.precif_login(text, text, text), public.precif_ping(uuid, jsonb, text, timestamptz), public.precif_salvar(uuid, text, jsonb, timestamptz),
  public.precif_travar(uuid, text), public.precif_ausente(uuid), public.precif_evento(uuid, text, jsonb), public.precif_monitor(uuid, text, int) to anon, authenticated;
notify pgrst, 'reload schema';
