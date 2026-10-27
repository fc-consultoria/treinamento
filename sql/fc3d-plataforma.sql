-- Plataforma FC 3D · banco em São Paulo (projeto fc3d-plataforma-sp, sa-east-1) · já aplicado em 27/10/2026
-- Portal multiempresa: Administração FC + empresas licenciadas. Dados de clientes NÃO ficam neste arquivo.
-- Acesso por código (como a Precificação): sessões por token, tudo via funções SECURITY DEFINER.
-- As tabelas ficam com RLS ligado e sem políticas: ninguém lê direto, só pelas funções.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.fc3d_empresas(
  id text primary key, nome text not null, sigla text, linhas jsonb not null default '[]',
  contrato jsonb not null default '{}', etapa int not null default 1, ativo boolean not null default true,
  criado timestamptz not null default now());
create table if not exists public.fc3d_acessos(
  id uuid primary key default gen_random_uuid(), empresa_id text not null references public.fc3d_empresas(id) on delete cascade,
  nome text not null, login text not null unique, senha_hash text, papel text not null check (papel in ('gestor','vendedor','arquiteto')),
  whatsapp text, ativo boolean not null default true, perms jsonb not null default '{}', criado timestamptz not null default now(), ultimo timestamptz);
create table if not exists public.fc3d_sessoes(
  token uuid primary key default gen_random_uuid(), acesso_id uuid references public.fc3d_acessos(id) on delete cascade,
  empresa_id text, papel text not null, nome text, matriz boolean not null default false,
  criado timestamptz not null default now(), visto timestamptz not null default now(), expira timestamptz not null default now()+interval '30 days');
create table if not exists public.fc3d_entregas(
  id bigserial primary key, empresa_id text not null references public.fc3d_empresas(id) on delete cascade,
  data date, titulo text not null, descricao text, link text, status text not null default 'fazer'
    check (status in ('fazer','andamento','aguardando','revisar','aprovado','ajuste','entregue')),
  ordem int not null default 0, parecer text, parecer_por text, parecer_em timestamptz, criado timestamptz not null default now());
create table if not exists public.fc3d_pendencias(
  id bigserial primary key, empresa_id text not null references public.fc3d_empresas(id) on delete cascade,
  texto text not null, feito boolean not null default false, ordem int not null default 0);
create table if not exists public.fc3d_msgs(
  id bigserial primary key, empresa_id text not null references public.fc3d_empresas(id) on delete cascade,
  autor text not null, de_fc boolean not null default false, texto text not null, criado timestamptz not null default now());
create table if not exists public.fc3d_anexos(
  id uuid primary key default gen_random_uuid(), empresa_id text not null references public.fc3d_empresas(id) on delete cascade,
  area text not null default 'projeto' check (area in ('projeto','contrato')), nome text not null, tipo text, tam bigint,
  partes int not null, completo boolean not null default false, enviado_por text, criado timestamptz not null default now());
create table if not exists public.fc3d_anexo_partes(
  anexo_id uuid not null references public.fc3d_anexos(id) on delete cascade, idx int not null, dados text not null,
  primary key(anexo_id, idx));

alter table public.fc3d_empresas enable row level security;
alter table public.fc3d_acessos enable row level security;
alter table public.fc3d_sessoes enable row level security;
alter table public.fc3d_entregas enable row level security;
alter table public.fc3d_pendencias enable row level security;
alter table public.fc3d_msgs enable row level security;
alter table public.fc3d_anexos enable row level security;
alter table public.fc3d_anexo_partes enable row level security;

create or replace function public.fc3d_sess(p_token uuid) returns public.fc3d_sessoes
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes; a public.fc3d_acessos;
begin
  select * into s from fc3d_sessoes where token=p_token and expira>now();
  if s.token is null then raise exception 'Sessão expirada. Entre de novo.'; end if;
  if not s.matriz then
    select * into a from fc3d_acessos where id=s.acesso_id;
    if a.id is null or not a.ativo then delete from fc3d_sessoes where token=p_token; raise exception 'Acesso pausado. Fale com a FC Consultoria.'; end if;
    if not exists(select 1 from fc3d_empresas where id=s.empresa_id and ativo) then raise exception 'Licença pausada. Fale com a FC Consultoria.'; end if;
  end if;
  update fc3d_sessoes set visto=now() where token=p_token and visto<now()-interval '1 minute';
  return s;
end $$;

create or replace function public.fc3d_emp(s public.fc3d_sessoes, p_empresa text) returns text
language plpgsql stable as $$
begin
  if s.matriz then
    if p_empresa is null then raise exception 'Escolha a empresa'; end if;
    return p_empresa;
  end if;
  return s.empresa_id;
end $$;

-- ===== leitura do painel =====
create or replace function public.fc3d_painel(p_token uuid, p_empresa text default null) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); emp text; e public.fc3d_empresas; ger boolean;
begin
  emp:=fc3d_emp(s,p_empresa); select * into e from fc3d_empresas where id=emp;
  if e.id is null then raise exception 'Empresa não encontrada'; end if;
  ger:= s.matriz or s.papel='gestor';
  return jsonb_build_object(
    'eu',jsonb_build_object('nome',s.nome,'papel',s.papel,'matriz',s.matriz),
    'empresa',jsonb_build_object('id',e.id,'nome',e.nome,'sigla',e.sigla,'linhas',e.linhas,'etapa',e.etapa,'ativo',e.ativo),
    'entregas',coalesce((select jsonb_agg(to_jsonb(x) order by x.ordem, x.id) from fc3d_entregas x where empresa_id=emp),'[]'),
    'pendencias',coalesce((select jsonb_agg(to_jsonb(x) order by x.feito, x.ordem, x.id) from fc3d_pendencias x where empresa_id=emp),'[]'),
    'msgs',coalesce((select jsonb_agg(to_jsonb(y) order by y.id) from (select id,autor,de_fc,texto,criado from fc3d_msgs where empresa_id=emp order by id desc limit 150) y),'[]'),
    'anexos',coalesce((select jsonb_agg(jsonb_build_object('id',id,'area',area,'nome',nome,'tipo',tipo,'tam',tam,'partes',partes,'enviado_por',enviado_por,'criado',criado) order by criado desc)
       from fc3d_anexos where empresa_id=emp and completo and (area='projeto' or ger)),'[]'),
    'contrato',case when ger then e.contrato else null end,
    'acessos',case when ger then coalesce((select jsonb_agg(jsonb_build_object('id',id,'nome',nome,'login',login,'papel',papel,'whatsapp',whatsapp,'ativo',ativo,'perms',perms,'tem_codigo',senha_hash is not null,'ultimo',ultimo,'criado',criado) order by papel, nome) from fc3d_acessos where empresa_id=emp),'[]') else null end);
end $$;

create or replace function public.fc3d_empresas_lista(p_token uuid) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token);
begin
  if not s.matriz then raise exception 'Sem permissão'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'nome',e.nome,'sigla',e.sigla,'linhas',e.linhas,'etapa',e.etapa,'ativo',e.ativo,'contrato',e.contrato,
     'acessos',(select count(*) from fc3d_acessos a where a.empresa_id=e.id and a.ativo and a.papel<>'arquiteto'),
     'revisar',(select count(*) from fc3d_entregas x where x.empresa_id=e.id and x.status in ('revisar','ajuste')),
     'msgs',(select count(*) from fc3d_msgs m where m.empresa_id=e.id and not m.de_fc and m.criado>now()-interval '7 days')) order by e.criado) from fc3d_empresas e),'[]');
end $$;

-- ===== ações do cliente =====
create or replace function public.fc3d_msg(p_token uuid, p_empresa text, p_texto text) returns void
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); emp text:=fc3d_emp(s,p_empresa);
begin
  if coalesce(trim(p_texto),'')='' then return; end if;
  insert into fc3d_msgs(empresa_id,autor,de_fc,texto) values(emp,coalesce(s.nome,'—'),s.matriz,left(trim(p_texto),3000));
end $$;

create or replace function public.fc3d_parecer(p_token uuid, p_id bigint, p_status text, p_texto text) returns void
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); x public.fc3d_entregas;
begin
  if not (s.matriz or s.papel='gestor') then raise exception 'Só o gestor aprova entregas'; end if;
  if p_status not in ('aprovado','ajuste') then raise exception 'Situação inválida'; end if;
  select * into x from fc3d_entregas where id=p_id; if x.id is null or (not s.matriz and x.empresa_id<>s.empresa_id) then raise exception 'Entrega não encontrada'; end if;
  update fc3d_entregas set status=p_status,parecer=left(nullif(trim(p_texto),''),2000),parecer_por=s.nome,parecer_em=now() where id=p_id;
  insert into fc3d_msgs(empresa_id,autor,de_fc,texto) values(x.empresa_id,s.nome,s.matriz,
    case when p_status='aprovado' then 'Aprovou a entrega "'||x.titulo||'".' else 'Pediu ajuste em "'||x.titulo||'": '||coalesce(nullif(trim(p_texto),''),'(sem comentário)') end);
end $$;

create or replace function public.fc3d_pend_marcar(p_token uuid, p_id bigint, p_feito boolean) returns void
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token);
begin
  if not (s.matriz or s.papel='gestor') then raise exception 'Sem permissão'; end if;
  update fc3d_pendencias set feito=p_feito where id=p_id and (s.matriz or empresa_id=s.empresa_id);
end $$;

-- ===== anexos em partes (até 40 partes de ~2 MB) =====
create or replace function public.fc3d_anexo_novo(p_token uuid, p_empresa text, p_area text, p_nome text, p_tipo text, p_tam bigint, p_partes int) returns uuid
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); emp text:=fc3d_emp(s,p_empresa); i uuid;
begin
  if p_area='contrato' and not s.matriz then raise exception 'Só a FC anexa documentos do contrato'; end if;
  if s.papel='arquiteto' then raise exception 'Sem permissão'; end if;
  if p_partes<1 or p_partes>40 then raise exception 'Arquivo grande demais (máximo 60 MB)'; end if;
  insert into fc3d_anexos(empresa_id,area,nome,tipo,tam,partes,enviado_por) values(emp,coalesce(p_area,'projeto'),left(p_nome,160),left(p_tipo,100),p_tam,p_partes,s.nome) returning id into i;
  return i;
end $$;

create or replace function public.fc3d_anexo_parte(p_token uuid, p_id uuid, p_idx int, p_dados text) returns void
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); a public.fc3d_anexos;
begin
  select * into a from fc3d_anexos where id=p_id; if a.id is null or (not s.matriz and a.empresa_id<>s.empresa_id) or a.completo then raise exception 'Anexo inválido'; end if;
  if length(p_dados)>3000000 then raise exception 'Parte grande demais'; end if;
  insert into fc3d_anexo_partes(anexo_id,idx,dados) values(p_id,p_idx,p_dados) on conflict (anexo_id,idx) do update set dados=excluded.dados;
  if (select count(*) from fc3d_anexo_partes where anexo_id=p_id)=a.partes then update fc3d_anexos set completo=true where id=p_id; end if;
end $$;

create or replace function public.fc3d_anexo_baixar(p_token uuid, p_id uuid, p_idx int) returns text
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); a public.fc3d_anexos;
begin
  select * into a from fc3d_anexos where id=p_id;
  if a.id is null or (not s.matriz and a.empresa_id<>s.empresa_id) or (a.area='contrato' and not (s.matriz or s.papel='gestor')) then raise exception 'Anexo não encontrado'; end if;
  return (select dados from fc3d_anexo_partes where anexo_id=p_id and idx=p_idx);
end $$;

create or replace function public.fc3d_anexo_excluir(p_token uuid, p_id uuid) returns void
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token);
begin
  delete from fc3d_anexos where id=p_id and (s.matriz or (empresa_id=s.empresa_id and enviado_por=s.nome and area='projeto'));
end $$;

-- ===== equipe (gestor cadastra vendedores; FC cadastra todos) =====
create or replace function public.fc3d_acesso_salvar(p_token uuid, p_empresa text, p jsonb) returns jsonb
language plpgsql security definer set search_path to 'public','extensions' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); emp text:=fc3d_emp(s,p_empresa); a public.fc3d_acessos; cod text; papel_ text:=coalesce(p->>'papel','vendedor'); lg text;
begin
  if not (s.matriz or s.papel='gestor') then raise exception 'Sem permissão'; end if;
  if not s.matriz and papel_<>'vendedor' then raise exception 'O gestor cadastra só vendedores'; end if;
  if p->>'id' is not null then
    select * into a from fc3d_acessos where id=(p->>'id')::uuid and empresa_id=emp;
    if a.id is null then raise exception 'Acesso não encontrado'; end if;
    if not s.matriz and a.papel<>'vendedor' then raise exception 'Sem permissão'; end if;
    update fc3d_acessos set nome=coalesce(nullif(trim(p->>'nome'),''),nome), whatsapp=coalesce(p->>'whatsapp',whatsapp),
      ativo=coalesce((p->>'ativo')::boolean,ativo), perms=coalesce(p->'perms',perms) where id=a.id returning * into a;
    if not a.ativo then delete from fc3d_sessoes where acesso_id=a.id; end if;
  else
    if coalesce(trim(p->>'nome'),'')='' then raise exception 'Digite o nome'; end if;
    lg:=lower(regexp_replace(coalesce(nullif(trim(p->>'login'),''),split_part(trim(p->>'nome'),' ',1)||'.'||emp),'[^a-zA-Z0-9.]','','g'));
    while exists(select 1 from fc3d_acessos where login=lg) loop lg:=lg||floor(random()*10)::int; end loop;
    insert into fc3d_acessos(empresa_id,nome,login,papel,whatsapp,perms) values(emp,left(trim(p->>'nome'),80),lg,papel_,p->>'whatsapp',coalesce(p->'perms','{}')) returning * into a;
  end if;
  if coalesce((p->>'novo_codigo')::boolean,false) then
    cod:=upper(substr(translate(encode(gen_random_bytes(9),'base64'),'+/=0O1IL','XYZ'),1,6));
    update fc3d_acessos set senha_hash=crypt(cod,gen_salt('bf')) where id=a.id;
    delete from fc3d_sessoes where acesso_id=a.id;
  end if;
  return jsonb_build_object('id',a.id,'login',a.login,'codigo',cod);
end $$;

-- ===== administração FC =====
create or replace function public.fc3d_admin_salvar(p_token uuid, p_tipo text, p jsonb) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); r jsonb;
begin
  if not s.matriz then raise exception 'Sem permissão'; end if;
  if p_tipo='empresa' then
    insert into fc3d_empresas(id,nome,sigla,linhas,etapa,ativo) values(lower(p->>'id'),p->>'nome',p->>'sigla',coalesce(p->'linhas','[]'),coalesce((p->>'etapa')::int,1),coalesce((p->>'ativo')::boolean,true))
    on conflict (id) do update set nome=excluded.nome,sigla=excluded.sigla,linhas=excluded.linhas,etapa=excluded.etapa,ativo=excluded.ativo;
    r:=jsonb_build_object('id',lower(p->>'id'));
  elsif p_tipo='contrato' then
    update fc3d_empresas set contrato=p->'contrato' where id=p->>'empresa_id';
  elsif p_tipo='entrega' then
    if coalesce((p->>'excluir')::boolean,false) then delete from fc3d_entregas where id=(p->>'id')::bigint;
    elsif p->>'id' is not null then
      update fc3d_entregas set data=nullif(p->>'data','')::date,titulo=p->>'titulo',descricao=p->>'descricao',link=nullif(p->>'link',''),status=p->>'status',ordem=coalesce((p->>'ordem')::int,ordem) where id=(p->>'id')::bigint;
    else
      insert into fc3d_entregas(empresa_id,data,titulo,descricao,link,status,ordem) values(p->>'empresa_id',nullif(p->>'data','')::date,p->>'titulo',p->>'descricao',nullif(p->>'link',''),coalesce(p->>'status','fazer'),
        coalesce((p->>'ordem')::int,(select coalesce(min(ordem),0)-1 from fc3d_entregas where empresa_id=p->>'empresa_id')));
    end if;
  elsif p_tipo='pendencia' then
    if coalesce((p->>'excluir')::boolean,false) then delete from fc3d_pendencias where id=(p->>'id')::bigint;
    else insert into fc3d_pendencias(empresa_id,texto,ordem) values(p->>'empresa_id',p->>'texto',coalesce((p->>'ordem')::int,99)); end if;
  else raise exception 'Tipo inválido'; end if;
  return coalesce(r,'{}');
end $$;

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


create or replace function public.fc3d_sair(p_token uuid) returns void
language sql security definer set search_path to 'public' as $$ delete from fc3d_sessoes where token=p_token $$;

-- ===== Banco em São Paulo (sa-east-1) · login com limite de tentativas =====
create table if not exists public.fc3d_config(k text primary key, v text not null);
create table if not exists public.fc3d_tentativas(id bigserial primary key, chave text not null, quando timestamptz not null default now());
create index if not exists fc3d_tent_chave on public.fc3d_tentativas(chave, quando);
alter table public.fc3d_config enable row level security;
alter table public.fc3d_tentativas enable row level security;

-- devolve null se pode tentar; senão a mensagem de bloqueio
create or replace function public.fc3d_bloqueado(p_chave text) returns text
language plpgsql security definer set search_path to 'public' as $$
begin
  delete from fc3d_tentativas where quando<now()-interval '1 day';
  if (select count(*) from fc3d_tentativas where chave=p_chave and quando>now()-interval '15 minutes')>=8 then
    return 'Muitas tentativas. Aguarde 15 minutos e tente de novo.';
  end if;
  return null;
end $$;

-- falhas não lançam exceção (senão o registro da tentativa seria desfeito): devolvem {"erro": "..."}
create or replace function public.fc3d_login(p_login text, p_codigo text) returns jsonb
language plpgsql security definer set search_path to 'public','extensions' as $$
declare a public.fc3d_acessos; t uuid; e public.fc3d_empresas; lg text:=lower(trim(coalesce(p_login,''))); b text;
begin
  b:=fc3d_bloqueado('acesso:'||lg); if b is not null then return jsonb_build_object('erro',b); end if;
  select * into a from fc3d_acessos where login=lg;
  if a.id is null or a.senha_hash is null or a.senha_hash<>crypt(upper(trim(coalesce(p_codigo,''))),a.senha_hash) then
    insert into fc3d_tentativas(chave) values('acesso:'||lg);
    return jsonb_build_object('erro','Login ou código incorretos');
  end if;
  if not a.ativo then return jsonb_build_object('erro','Acesso pausado. Fale com a FC Consultoria.'); end if;
  select * into e from fc3d_empresas where id=a.empresa_id;
  if not e.ativo then return jsonb_build_object('erro','Licença pausada. Fale com a FC Consultoria.'); end if;
  delete from fc3d_tentativas where chave='acesso:'||lg;
  delete from fc3d_sessoes where expira<now();
  insert into fc3d_sessoes(acesso_id,empresa_id,papel,nome) values(a.id,a.empresa_id,a.papel,a.nome) returning token into t;
  update fc3d_acessos set ultimo=now() where id=a.id;
  insert into fc3d_log(empresa_id,acesso_id,nome,acao) values(a.empresa_id,a.id,a.nome,'entrou');
  return jsonb_build_object('token',t,'nome',a.nome,'papel',a.papel,'empresa',e.id,'empresa_nome',e.nome,'matriz',false);
end $$;

-- Administração FC: senha própria deste banco (guardada criptografada em fc3d_config)
create or replace function public.fc3d_login_matriz(p_senha text) returns jsonb
language plpgsql security definer set search_path to 'public','extensions' as $$
declare h text; t uuid; b text;
begin
  b:=fc3d_bloqueado('matriz'); if b is not null then return jsonb_build_object('erro',b); end if;
  select v into h from fc3d_config where k='matriz_hash';
  if h is null or h<>crypt(coalesce(p_senha,''),h) then
    insert into fc3d_tentativas(chave) values('matriz');
    return jsonb_build_object('erro','Login ou senha incorretos');
  end if;
  delete from fc3d_tentativas where chave='matriz';
  delete from fc3d_sessoes where expira<now();
  insert into fc3d_sessoes(papel,nome,matriz) values('fc','FC Consultoria',true) returning token into t;
  insert into fc3d_log(nome,matriz,acao) values('FC Consultoria',true,'entrou');
  return jsonb_build_object('token',t,'nome','FC Consultoria','papel','fc','matriz',true);
end $$;

-- trocar a senha da matriz (precisa estar logado como matriz e informar a senha atual)
create or replace function public.fc3d_matriz_senha(p_token uuid, p_atual text, p_nova text) returns void
language plpgsql security definer set search_path to 'public','extensions' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); h text;
begin
  if not s.matriz then raise exception 'Sem permissão'; end if;
  select v into h from fc3d_config where k='matriz_hash';
  if h<>crypt(coalesce(p_atual,''),h) then raise exception 'Senha atual incorreta'; end if;
  if length(coalesce(p_nova,''))<8 then raise exception 'A nova senha precisa ter 8 caracteres ou mais'; end if;
  update fc3d_config set v=crypt(p_nova,gen_salt('bf',10)) where k='matriz_hash';
  delete from fc3d_sessoes where matriz and token<>p_token;
end $$;


revoke all on function public.fc3d_sess(uuid) from public, anon, authenticated;
revoke all on function public.fc3d_bloqueado(text) from public, anon, authenticated;
grant execute on function public.fc3d_login(text,text), public.fc3d_login_matriz(text), public.fc3d_matriz_senha(uuid,text,text), public.fc3d_sair(uuid), public.fc3d_painel(uuid,text),
  public.fc3d_empresas_lista(uuid), public.fc3d_msg(uuid,text,text), public.fc3d_parecer(uuid,bigint,text,text), public.fc3d_pend_marcar(uuid,bigint,boolean),
  public.fc3d_anexo_novo(uuid,text,text,text,text,bigint,int), public.fc3d_anexo_parte(uuid,uuid,int,text), public.fc3d_anexo_baixar(uuid,uuid,int),
  public.fc3d_anexo_excluir(uuid,uuid), public.fc3d_acesso_salvar(uuid,text,jsonb), public.fc3d_admin_salvar(uuid,text,jsonb) to anon, authenticated;
