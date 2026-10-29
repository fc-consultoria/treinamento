-- Plataforma FC 3D Clientes · banco São Paulo (pawwncmfadzxfahfvhry) · 28/10/2026
-- Projeto ISOLADO: tabelas e funções próprias (prefixo pfc_). Não lê nem grava nada das tabelas fc3d_ (projeto Ladore).
-- Senha da FC copiada uma vez da Plataforma FC 3D; depois disso as duas senhas são independentes.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.pfc_empresas(
  id text primary key, nome text not null, sigla text, ativo boolean not null default true,
  licenca_ate date, criado timestamptz not null default now());
create table if not exists public.pfc_acessos(
  id uuid primary key default gen_random_uuid(), empresa_id text not null references public.pfc_empresas(id) on delete cascade,
  nome text not null, login text not null unique, senha_hash text,
  papel text not null check (papel in ('gestor','vendedor','arquiteto')),
  ativo boolean not null default true, criado timestamptz not null default now(), ultimo timestamptz);
create table if not exists public.pfc_sessoes(
  token uuid primary key default gen_random_uuid(), acesso_id uuid references public.pfc_acessos(id) on delete cascade,
  empresa_id text, papel text not null, nome text, matriz boolean not null default false,
  criado timestamptz not null default now(), visto timestamptz not null default now(), expira timestamptz not null default now()+interval '30 days');
create table if not exists public.pfc_tentativas(chave text not null, quando timestamptz not null default now());
create table if not exists public.pfc_config(k text primary key, v text not null);

alter table public.pfc_empresas enable row level security;
alter table public.pfc_acessos enable row level security;
alter table public.pfc_sessoes enable row level security;
alter table public.pfc_tentativas enable row level security;
alter table public.pfc_config enable row level security;

insert into public.pfc_config(k,v) select 'matriz_hash',v from public.fc3d_config where k='matriz_hash' on conflict (k) do nothing;

create or replace function public.pfc_bloqueado(p_chave text) returns text
language plpgsql security definer set search_path to 'public' as $$
begin
  delete from pfc_tentativas where quando<now()-interval '1 day';
  if (select count(*) from pfc_tentativas where chave=p_chave and quando>now()-interval '15 minutes')>=8 then
    return 'Muitas tentativas. Aguarde 15 minutos e tente de novo.'; end if;
  return null;
end $$;

create or replace function public.pfc_login(p_login text, p_codigo text) returns jsonb
language plpgsql security definer set search_path to 'public','extensions' as $$
declare a public.pfc_acessos; e public.pfc_empresas; t uuid; lg text:=lower(trim(coalesce(p_login,''))); b text;
begin
  b:=pfc_bloqueado('acesso:'||lg); if b is not null then return jsonb_build_object('erro',b); end if;
  select * into a from pfc_acessos where login=lg;
  if a.id is null or a.senha_hash is null or a.senha_hash<>crypt(upper(trim(coalesce(p_codigo,''))),a.senha_hash) then
    insert into pfc_tentativas(chave) values('acesso:'||lg); return jsonb_build_object('erro','Login ou código incorretos'); end if;
  if not a.ativo then return jsonb_build_object('erro','Acesso pausado. Fale com a FC Consultoria.'); end if;
  select * into e from pfc_empresas where id=a.empresa_id;
  if not e.ativo or (e.licenca_ate is not null and e.licenca_ate<current_date) then return jsonb_build_object('erro','Licença pausada ou vencida. Fale com a FC Consultoria.'); end if;
  delete from pfc_tentativas where chave='acesso:'||lg; delete from pfc_sessoes where expira<now();
  insert into pfc_sessoes(acesso_id,empresa_id,papel,nome) values(a.id,a.empresa_id,a.papel,a.nome) returning token into t;
  update pfc_acessos set ultimo=now() where id=a.id;
  return jsonb_build_object('token',t,'nome',a.nome,'papel',a.papel,'empresa',e.id,'empresa_nome',e.nome,'matriz',false);
end $$;

create or replace function public.pfc_login_matriz(p_senha text) returns jsonb
language plpgsql security definer set search_path to 'public','extensions' as $$
declare h text; t uuid; b text;
begin
  b:=pfc_bloqueado('matriz'); if b is not null then return jsonb_build_object('erro',b); end if;
  select v into h from pfc_config where k='matriz_hash';
  if h is null or h<>crypt(coalesce(p_senha,''),h) then insert into pfc_tentativas(chave) values('matriz'); return jsonb_build_object('erro','Senha incorreta'); end if;
  delete from pfc_tentativas where chave='matriz'; delete from pfc_sessoes where expira<now();
  insert into pfc_sessoes(papel,nome,matriz) values('fc','FC Consultoria',true) returning token into t;
  return jsonb_build_object('token',t,'nome','FC Consultoria','papel','fc','matriz',true);
end $$;

create or replace function public.pfc_sessao(p_token uuid) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s public.pfc_sessoes; a public.pfc_acessos; e public.pfc_empresas;
begin
  select * into s from pfc_sessoes where token=p_token and expira>now();
  if s.token is null then raise exception 'Sessão expirada. Entre de novo.'; end if;
  update pfc_sessoes set visto=now() where token=p_token and visto<now()-interval '1 minute';
  if s.matriz then return jsonb_build_object('nome','FC Consultoria','papel','fc','matriz',true); end if;
  select * into a from pfc_acessos where id=s.acesso_id;
  select * into e from pfc_empresas where id=s.empresa_id;
  if a.id is null or not a.ativo or e.id is null or not e.ativo or (e.licenca_ate is not null and e.licenca_ate<current_date) then
    delete from pfc_sessoes where token=p_token; raise exception 'Acesso pausado. Fale com a FC Consultoria.'; end if;
  return jsonb_build_object('nome',s.nome,'papel',s.papel,'empresa',e.id,'empresa_nome',e.nome,'sigla',e.sigla,'matriz',false);
end $$;

create or replace function public.pfc_sair(p_token uuid) returns void
language sql security definer set search_path to 'public' as $$ delete from pfc_sessoes where token=p_token; $$;

revoke all on function public.pfc_bloqueado(text) from public, anon, authenticated;
revoke all on function public.pfc_login(text,text), public.pfc_login_matriz(text), public.pfc_sessao(uuid), public.pfc_sair(uuid) from public;
grant execute on function public.pfc_login(text,text), public.pfc_login_matriz(text), public.pfc_sessao(uuid), public.pfc_sair(uuid) to anon, authenticated;

-- a função da versão anterior lia a sessão do projeto Ladore: removida
drop function if exists public.fc3d_cli_sessao(uuid);

-- 29/10/2026 · Ajuste técnico das peças do 3D (só a Matriz grava; todas as empresas com sessão leem)
create table if not exists public.pfc_ajustes_3d(
  tipologia text not null, peca text not null,
  dx numeric not null default 0, dy numeric not null default 0, dz numeric not null default 0,
  atualizado timestamptz not null default now(), primary key(tipologia,peca));
alter table public.pfc_ajustes_3d enable row level security;
-- colunas rx, ry, rz (giro em graus) e funções pfc_ajustes_3d_ler(token) e pfc_ajuste_3d_salvar(token,tipologia,peca,dx,dy,dz,rx,ry,rz): migrações pfc_ajustes_3d e pfc_ajustes_3d_giro
-- coluna oculto (boolean, peça ou acessório escondido para as empresas; a Matriz vê em vermelho transparente): migração pfc_ajustes_3d_ocultar. pfc_ajuste_3d_salvar recebe p_oculto
-- 29/10/2026 · Empresas e acessos (página fc3d/clientes/empresas/, só a Matriz): colunas contato e obs em pfc_empresas;
-- funções pfc_eh_matriz, pfc_adm_lista, pfc_adm_empresa, pfc_adm_acesso (só gestor/vendedor: Portal do Cliente ainda não liberado),
-- pfc_adm_novo_codigo, pfc_adm_acesso_excluir e pfc_adm_codigo_novo (código de 6 letras/números): migração pfc_adm_empresas_acessos
