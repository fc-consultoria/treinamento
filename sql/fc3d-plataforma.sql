-- Plataforma FC 3D (portal multiempresa: FC Admin + empresas licenciadas, piloto Claiton · Ladore)
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

-- ===== sessão =====
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

create or replace function public.fc3d_login(p_login text, p_codigo text) returns jsonb
language plpgsql security definer set search_path to 'public','extensions' as $$
declare a public.fc3d_acessos; t uuid; e public.fc3d_empresas;
begin
  select * into a from fc3d_acessos where login=lower(trim(p_login));
  if a.id is null or a.senha_hash is null or a.senha_hash<>crypt(upper(trim(p_codigo)),a.senha_hash) then raise exception 'Login ou código incorretos'; end if;
  if not a.ativo then raise exception 'Acesso pausado. Fale com a FC Consultoria.'; end if;
  select * into e from fc3d_empresas where id=a.empresa_id;
  if not e.ativo then raise exception 'Licença pausada. Fale com a FC Consultoria.'; end if;
  delete from fc3d_sessoes where expira<now();
  insert into fc3d_sessoes(acesso_id,empresa_id,papel,nome) values(a.id,a.empresa_id,a.papel,a.nome) returning token into t;
  update fc3d_acessos set ultimo=now() where id=a.id;
  return jsonb_build_object('token',t,'nome',a.nome,'papel',a.papel,'empresa',e.id,'empresa_nome',e.nome,'matriz',false);
end $$;

create or replace function public.fc3d_login_matriz() returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare t uuid;
begin
  if not public.trein_is_admin() then raise exception 'Login ou senha incorretos'; end if;
  delete from fc3d_sessoes where expira<now();
  insert into fc3d_sessoes(papel,nome,matriz) values('fc','FC Consultoria',true) returning token into t;
  return jsonb_build_object('token',t,'nome','FC Consultoria','papel','fc','matriz',true);
end $$;

create or replace function public.fc3d_sair(p_token uuid) returns void
language sql security definer set search_path to 'public' as $$ delete from fc3d_sessoes where token=p_token $$;

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

revoke all on function public.fc3d_sess(uuid) from public, anon, authenticated;
grant execute on function public.fc3d_login(text,text), public.fc3d_login_matriz(), public.fc3d_sair(uuid), public.fc3d_painel(uuid,text),
  public.fc3d_empresas_lista(uuid), public.fc3d_msg(uuid,text,text), public.fc3d_parecer(uuid,bigint,text,text), public.fc3d_pend_marcar(uuid,bigint,boolean),
  public.fc3d_anexo_novo(uuid,text,text,text,text,bigint,int), public.fc3d_anexo_parte(uuid,uuid,int,text), public.fc3d_anexo_baixar(uuid,uuid,int),
  public.fc3d_anexo_excluir(uuid,uuid), public.fc3d_acesso_salvar(uuid,text,jsonb), public.fc3d_admin_salvar(uuid,text,jsonb) to anon, authenticated;

-- ===== dados iniciais do piloto =====
insert into public.fc3d_empresas(id,nome,sigla,linhas,etapa) values
 ('ladore','Claiton · Ladore','LD','[{"nome":"Ladore · portas em ACM","exclusiva":true},{"nome":"Otimiza","exclusiva":true,"obs":"aguardando catálogo"}]',1)
on conflict (id) do nothing;
insert into public.fc3d_entregas(empresa_id,data,titulo,descricao,link,status,ordem)
select 'ladore',d::date,t,ds,l,st,o from (values
 ('2026-10-27','Porta pivotante Ladore com perfis reais do catálogo','Apresentar qualidades com ficha técnica, montagem peça por peça, corte técnico em planta e troca de cores do perfil e do ACM.','porta.html','revisar',1),
 ('2026-10-23','Residência Ladore · modo apresentação','Casa térrea de 160 m² com a pivotante em ACM e 8 cenas automáticas para o telão.',null,'entregue',2),
 ('2026-10-18','Painel Ladore 3D','Primeira versão: planta virando casa e troca de cores.',null,'entregue',3),
 (null,'Planta da casa vazia · vendedor aplica a porta','O vendedor apresenta a porta e depois aplica no vão escolhido da planta.',null,'andamento',0),
 (null,'Portas de giro e de correr · PACM-01 a 05',null,null,'fazer',-1),
 (null,'Linha Otimiza',null,null,'aguardando',-2)
) v(d,t,ds,l,st,o) where not exists(select 1 from public.fc3d_entregas where empresa_id='ladore');
insert into public.fc3d_pendencias(empresa_id,texto,feito,ordem)
select 'ladore',t,f,o from (values ('Catálogo da linha Otimiza',false,1),('Data do evento',false,2),('Fotos de obras realizadas (pivotante, giro e correr)',false,3),('Catálogo técnico Ladore 2025',true,4)) v(t,f,o)
where not exists(select 1 from public.fc3d_pendencias where empresa_id='ladore');
insert into public.fc3d_msgs(empresa_id,autor,de_fc,texto)
select 'ladore','Fernando · FC',true,'Claiton, este é o seu painel do projeto. Aqui você acompanha cada entrega, aprova ou pede ajuste, envia catálogos e fotos de obras e fala direto comigo.'
where not exists(select 1 from public.fc3d_msgs where empresa_id='ladore');
insert into public.fc3d_acessos(empresa_id,nome,login,papel)
select 'ladore','Claiton','claiton','gestor' where not exists(select 1 from public.fc3d_acessos where login='claiton');
