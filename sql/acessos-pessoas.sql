-- Acessos por pessoa nas empresas clientes (CB, Guaporé, CDE...)
-- Cada pessoa tem login e senha próprios e um papel; tudo o que faz é registrado com o nome dela.

create table if not exists public.emp_pessoas (
  id uuid primary key default gen_random_uuid(),
  empresa_id text not null,
  nome text not null,
  login text not null,
  senha_hash text not null,
  papel text not null check (papel in ('gestor','compras','vendas','gerente','marketing','fabrica')),
  abas text[],                       -- null = padrão do papel
  vend_id uuid references public.orc_vend(id) on delete set null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  ultimo_acesso timestamptz
);
create unique index if not exists emp_pessoas_login_uk on public.emp_pessoas (empresa_id, lower(login));

create table if not exists public.emp_sessoes (
  token text primary key,
  pessoa_id uuid not null references public.emp_pessoas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  ultimo timestamptz not null default now(),
  ativo boolean not null default true
);
create index if not exists emp_sessoes_pessoa on public.emp_sessoes (pessoa_id);

create table if not exists public.emp_eventos (
  id bigserial primary key,
  empresa_id text not null,
  pessoa_id uuid references public.emp_pessoas(id) on delete set null,
  nome text,
  papel text,
  area text,
  acao text,
  detalhe jsonb,
  em timestamptz not null default now()
);
create index if not exists emp_eventos_emp_em on public.emp_eventos (empresa_id, em desc);

alter table public.emp_pessoas enable row level security;
alter table public.emp_sessoes enable row level security;
alter table public.emp_eventos enable row level security;

-- Abas padrão de cada papel (null = todas as liberadas da empresa)
create or replace function public.emp_abas_padrao(p_papel text) returns text[]
language sql immutable as $$
  select case p_papel
    when 'gestor'    then null
    when 'compras'   then array['comp','dist','est','pla','conv','age','sol']
    when 'vendas'    then array['orc']
    when 'gerente'   then array['orc']
    when 'marketing' then array['cat']
    when 'fabrica'   then array['esq','cat']
  end::text[] $$;

create or replace function public.emp_payload(p public.emp_pessoas, p_token text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'token', p_token, 'id', p.id, 'emp', p.empresa_id, 'nome', p.nome, 'login', p.login, 'papel', p.papel,
    'abas', to_jsonb(coalesce(p.abas, emp_abas_padrao(p.papel))),
    'chave', case when p.papel <> 'vendas' then (select c.chave from cons_portal c where c.empresa_id = p.empresa_id and c.ativo) end,
    'vchave', (select v.chave from orc_vend v where v.id = p.vend_id and v.ativo)) $$;
revoke all on function public.emp_payload(public.emp_pessoas, text) from public, anon, authenticated;

-- Nome da empresa para a tela de entrada
create or replace function public.emp_info(p_emp text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', id, 'nome', data->>'nome', 'cor', data->>'c')
  from rotina_docs where col = 'consultoria' and id = p_emp $$;

create or replace function public.emp_entrar(p_emp text, p_login text, p_senha text, p_ua text default '')
returns jsonb language plpgsql security definer set search_path = public as $$
declare p emp_pessoas; tk text; falhas int;
begin
  select count(*) into falhas from emp_eventos
   where empresa_id = p_emp and acao = 'falha' and detalhe->>'login' = lower(p_login) and em > now() - interval '15 minutes';
  if falhas >= 8 then return jsonb_build_object('erro','bloqueado'); end if;
  select * into p from emp_pessoas where empresa_id = p_emp and lower(login) = lower(trim(p_login)) and ativo;
  if p.id is null or p.senha_hash <> extensions.crypt(p_senha, p.senha_hash) then
    insert into emp_eventos(empresa_id, area, acao, detalhe) values (p_emp, 'entrada', 'falha', jsonb_build_object('login', lower(p_login)));
    return jsonb_build_object('erro','senha');
  end if;
  tk := encode(extensions.gen_random_bytes(24), 'hex');
  insert into emp_sessoes(token, pessoa_id) values (tk, p.id);
  update emp_pessoas set ultimo_acesso = now() where id = p.id;
  insert into emp_eventos(empresa_id, pessoa_id, nome, papel, area, acao, detalhe)
   values (p.empresa_id, p.id, p.nome, p.papel, 'entrada', 'login', jsonb_build_object('ua', left(coalesce(p_ua,''),200)));
  return emp_payload(p, tk);
end $$;

create or replace function public.emp_sessao(p_token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p emp_pessoas;
begin
  select e.* into p from emp_sessoes s join emp_pessoas e on e.id = s.pessoa_id
   where s.token = p_token and s.ativo and e.ativo and s.ultimo > now() - interval '30 days';
  if p.id is null then return null; end if;
  update emp_sessoes set ultimo = now() where token = p_token;
  update emp_pessoas set ultimo_acesso = now() where id = p.id;
  return emp_payload(p, p_token);
end $$;

create or replace function public.emp_sair(p_token text) returns void
language sql security definer set search_path = public as $$
  update emp_sessoes set ativo = false where token = p_token $$;

create or replace function public.emp_registrar(p_token text, p_area text, p_acao text, p_detalhe jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
declare p emp_pessoas;
begin
  select e.* into p from emp_sessoes s join emp_pessoas e on e.id = s.pessoa_id where s.token = p_token and s.ativo and e.ativo;
  if p.id is null then return; end if;
  insert into emp_eventos(empresa_id, pessoa_id, nome, papel, area, acao, detalhe)
   values (p.empresa_id, p.id, p.nome, p.papel, left(p_area,40), left(p_acao,80), p_detalhe);
end $$;

-- ---------- Matriz (FC) ----------
create or replace function public.emp_pessoas_lista(p_emp text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id',id,'nome',nome,'login',login,'papel',papel,'abas',abas,
    'vend_id',vend_id,'ativo',ativo,'criado_em',criado_em,'ultimo_acesso',ultimo_acesso) order by ativo desc, papel, nome)
    from emp_pessoas where empresa_id = p_emp), '[]'::jsonb);
end $$;

create or replace function public.emp_pessoa_salvar(p_id uuid, p_emp text, p_nome text, p_login text, p_papel text,
  p_abas text[], p_ativo boolean, p_senha text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare rid uuid; vid uuid; atual emp_pessoas;
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  if coalesce(trim(p_nome),'') = '' or coalesce(trim(p_login),'') = '' then raise exception 'Preencha nome e login'; end if;
  if exists(select 1 from emp_pessoas where empresa_id = p_emp and lower(login) = lower(trim(p_login)) and id is distinct from p_id)
    then raise exception 'Esse login já existe nesta empresa'; end if;
  if p_senha is not null and length(p_senha) < 4 then raise exception 'A senha precisa ter pelo menos 4 caracteres'; end if;
  if p_id is null then
    if p_senha is null then raise exception 'Informe a senha'; end if;
    insert into emp_pessoas(empresa_id, nome, login, senha_hash, papel, abas, ativo)
     values (p_emp, trim(p_nome), trim(p_login), extensions.crypt(p_senha, extensions.gen_salt('bf')), p_papel, p_abas, coalesce(p_ativo,true))
     returning id into rid;
  else
    update emp_pessoas set nome = trim(p_nome), login = trim(p_login), papel = p_papel, abas = p_abas, ativo = coalesce(p_ativo,true),
      senha_hash = case when p_senha is null then senha_hash else extensions.crypt(p_senha, extensions.gen_salt('bf')) end
     where id = p_id and empresa_id = p_emp returning id into rid;
    if p_senha is not null or not coalesce(p_ativo,true) then update emp_sessoes set ativo = false where pessoa_id = p_id; end if;
  end if;
  -- vendedor: cria ou atualiza o cadastro no Painel de Vendas
  select * into atual from emp_pessoas where id = rid;
  if atual.papel = 'vendas' then
    if atual.vend_id is null then
      insert into orc_vend(empresa_id, nome, chave, ativo) values (p_emp, atual.nome, encode(extensions.gen_random_bytes(18),'hex'), atual.ativo) returning id into vid;
      update emp_pessoas set vend_id = vid where id = rid;
    else
      update orc_vend set nome = atual.nome, ativo = atual.ativo where id = atual.vend_id;
    end if;
  elsif atual.vend_id is not null then
    update orc_vend set ativo = false where id = atual.vend_id;
  end if;
  return rid;
end $$;

create or replace function public.emp_eventos_lista(p_emp text, p_lim int default 200) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  return coalesce((select jsonb_agg(to_jsonb(x) order by x.em desc) from
    (select id, nome, papel, area, acao, detalhe, em from emp_eventos where empresa_id = p_emp order by em desc limit least(p_lim,1000)) x), '[]'::jsonb);
end $$;

grant execute on function public.emp_info(text), public.emp_entrar(text,text,text,text), public.emp_sessao(text),
  public.emp_sair(text), public.emp_registrar(text,text,text,jsonb), public.emp_pessoas_lista(text),
  public.emp_pessoa_salvar(uuid,text,text,text,text,text[],boolean,text), public.emp_eventos_lista(text,int)
  to anon, authenticated;

-- ===== 22/10/2026 · sessão da pessoa vira a chave; Painel de Vendas travado por papel =====
-- emp_token_pessoa(p_chave): pessoa da sessão ativa.
-- cons_portal_empresa(p_chave): chave da empresa OU sessão de pessoa (menos vendas).
-- emp_chave_venda(p_chave): chave da empresa OU sessão de gestor, gerente ou compras (compras só vê o estoque).
-- compra_emp, cons_portal_ver, equiv_edits_lista, equiv_ok_lista passaram a usar cons_portal_empresa.
-- orc_quem, orc_g_cfg, orc_g_cfg_salvar, orc_g_vend, orc_portal_lista passaram a usar emp_chave_venda.
-- orc_dados devolve 'papel'. emp_payload devolve a sessão como 'chave'.
-- CB recebeu chave nova (link ?k= antigo desativado).
-- (Aplicado direto no Supabase pela migração emp_token_acesso_restrito.)

-- ===== 22/10/2026 · Etapa 2: aprovação de desconto (migrações orc_aprovacao_desconto e orc_compras_so_estoque) =====
-- orc_orcamentos.desc_ped (pedido do vendedor) e desc_aut (aprovação: pct, por, em).
-- orc_desc_pedir(p_chave, p_id, p_pct, p_motivo): vendedor pede; orçamento já salvo com o desconto do limite.
-- orc_desc_decidir(p_chave, p_id, p_aprovar, p_pct, p_resposta, p_emp): só gestor/gerente (ou chave da empresa / FC);
--   ao aprovar aplica o desconto no orçamento na hora. Tudo registrado em emp_eventos (area 'vendas').
-- orc_salvar: limite do vendedor = maior entre desc_max e o % aprovado naquele orçamento.
-- orc_g_cfg_salvar: sessão de Compras grava só est/estCor dos itens e estEm/estFx/estMsg do cabeçalho.
-- orc_g_vend: Compras não cria/edita vendedores.

-- ===== 22/10/2026 · Etapa 3: Central do Gestor (migração emp_central_gestor) =====
-- emp_central(p_token, p_emp): resumo da empresa para a Central do Gestor.
--   Sessão de gestor → empresa dele. FC (admin) → empresa de p_emp (serve também para a Central do Cliente na Matriz).
create or replace function public.emp_central(p_token text, p_emp text default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare pes emp_pessoas; e text; m0 timestamptz := date_trunc('month', now() at time zone 'America/Cuiaba') at time zone 'America/Cuiaba';
begin
  pes := emp_token_pessoa(p_token);
  if pes.id is not null and pes.papel = 'gestor' then e := pes.empresa_id;
  elsif p_emp is not null and trein_is_admin() then e := p_emp;
  else return null; end if;
  return jsonb_build_object(
    'emp', e,
    'pessoas', coalesce((select jsonb_agg(jsonb_build_object('nome',p.nome,'papel',p.papel,'ativo',p.ativo,
        'ultimo', greatest(p.ultimo_acesso, (select max(v.em) from emp_eventos v where v.pessoa_id = p.id)),
        'online', exists(select 1 from emp_eventos v where v.pessoa_id = p.id and v.em > now() - interval '10 minutes'))
        order by p.papel, p.nome) from emp_pessoas p where p.empresa_id = e and p.ativo), '[]'::jsonb),
    'eventos', coalesce((select jsonb_agg(x order by x.em desc) from
        (select nome, papel, area, acao, detalhe - 'ua' as detalhe, em from emp_eventos
          where empresa_id = e and acao <> 'falha' order by em desc limit 200) x), '[]'::jsonb),
    'orc', (select jsonb_build_object(
        'mes_n', count(*) filter (where criado_em >= m0),
        'mes_total', coalesce(sum(total) filter (where criado_em >= m0), 0),
        'abertos', count(*) filter (where status = 'aberto'),
        'total_n', count(*),
        'desc_pend', count(*) filter (where desc_ped is not null and coalesce(desc_ped->>'status','') not in ('aprovado','recusado')),
        'ultimo', max(criado_em)) from orc_orcamentos where empresa_id = e),
    'vend_ativos', (select count(*) from orc_vend where empresa_id = e and ativo),
    'estoque', (select jsonb_build_object('em', coalesce(c.cab->>'estEm', c.itens_em::text), 'itens', jsonb_array_length(coalesce(c.itens,'[]'::jsonb)))
        from orc_cfg c where c.empresa_id = e),
    'portal', (select jsonb_build_object('ultimo', ultimo_acesso, 'acessos', acessos) from cons_portal where empresa_id = e));
end $$;
grant execute on function public.emp_central(text, text) to anon, authenticated;
