-- =====================================================================
-- Baixa de estoque pelos pedidos + inativar orçamentos/pedidos
-- 1) Pedido fechado pelo vendedor (status 'aguardando') dá baixa no estoque da plataforma.
-- 2) Se o pedido sair de fechado (devolvido, perdido, cancelado, inativado) ANTES da
--    importação de estoque, a quantidade volta. Depois da importação, não volta:
--    o estoque do sistema da empresa passa a ser a referência.
-- 3) Importação de sábado grava o saldo do sistema por cima (sem somar pedidos);
--    as baixas anteriores à importação deixam de contar automaticamente.
-- 4) Status 'inativo' para orçamentos e pedidos de teste; simulações de compra também.
-- =====================================================================

-- status aceitos (o check antigo não tinha 'negociando' nem 'aguardando')
alter table orc_orcamentos drop constraint if exists orc_orcamentos_status_check;
alter table orc_orcamentos add constraint orc_orcamentos_status_check
  check (status = any (array['aberto','enviado','negociando','aguardando','aprovado','perdido','cancelado','inativo']));

create table if not exists orc_est_baixa (
  id bigserial primary key,
  empresa_id text not null,
  pedido_id uuid not null,
  numero int,
  item_id text not null,
  cod text,
  qtd numeric not null,
  criado_em timestamptz not null default now(),
  estornado_em timestamptz
);
create index if not exists orc_est_baixa_emp on orc_est_baixa(empresa_id, criado_em) where estornado_em is null;
create index if not exists orc_est_baixa_ped on orc_est_baixa(pedido_id);
alter table orc_est_baixa enable row level security;
drop policy if exists orc_est_baixa_adm on orc_est_baixa;
create policy orc_est_baixa_adm on orc_est_baixa for select using (public.trein_is_admin());

-- gatilho: fechou -> baixa; saiu de fechado -> estorna
create or replace function public.orc_est_baixa_trg() returns trigger
language plpgsql security definer set search_path to 'public' as $$
declare fechado boolean := new.status in ('aguardando','aprovado');
        antes boolean := old.status in ('aguardando','aprovado');
begin
  if new.status is not distinct from old.status then return new; end if;
  if fechado and not antes then
    update orc_est_baixa set estornado_em = now() where pedido_id = new.id and estornado_em is null;
    insert into orc_est_baixa(empresa_id, pedido_id, numero, item_id, cod, qtd)
    select new.empresa_id, new.id, new.numero, i->>'id', i->>'cod', (i->>'qtd')::numeric
      from jsonb_array_elements(coalesce(new.itens,'[]'::jsonb)) i
     where coalesce(i->>'id','') <> '' and nullif(i->>'qtd','')::numeric > 0;
  elsif antes and not fechado then
    update orc_est_baixa set estornado_em = now() where pedido_id = new.id and estornado_em is null;
  end if;
  return new;
end $$;
drop trigger if exists orc_est_baixa_t on orc_orcamentos;
create trigger orc_est_baixa_t after update of status on orc_orcamentos
  for each row execute function public.orc_est_baixa_trg();

-- quanto já saiu em pedidos depois da última importação, por item: {"item_id": qtd}
create or replace function public.orc_est_pend_emp(p_emp text) returns jsonb
language sql stable security definer set search_path to 'public' as $$
  select coalesce(jsonb_object_agg(item_id, q), '{}'::jsonb) from (
    select b.item_id, sum(b.qtd) q
      from orc_est_baixa b, orc_cfg c
     where c.empresa_id = p_emp and b.empresa_id = p_emp and b.estornado_em is null
       and b.criado_em > coalesce(
             case when b.item_id like 'c\_%' then nullif(c.cab->>'compEstEm','')::timestamptz end,
             nullif(c.cab->>'estEm','')::timestamptz, '-infinity'::timestamptz)
     group by b.item_id) x;
$$;

-- para a tela de importação (gestor/compras pela chave, ou a FC logada)
create or replace function public.orc_est_pend(p_chave text, p_emp text default null) returns jsonb
language plpgsql stable security definer set search_path to 'public' as $$
declare e text;
begin
  e := public.emp_chave_venda(p_chave);
  if e is null and public.trein_is_admin() then e := p_emp; end if;
  if e is null then return null; end if;
  return public.orc_est_pend_emp(e);
end $$;
revoke execute on function public.orc_est_pend_emp(text) from public, anon, authenticated;
grant execute on function public.orc_est_pend(text, text) to anon, authenticated;

-- status: aceita 'inativo' (vendedor inativa orçamento não fechado; pedido fechado só FC/gestor)
create or replace function public.orc_status(p_chave text, p_id uuid, p_status text, p_emp text default null, p_info jsonb default null)
returns boolean language plpgsql security definer set search_path to 'public' as $function$
declare q record; o record; inf jsonb; h jsonb;
begin
  select * into q from public.orc_quem(p_chave, p_emp);
  if q.emp is null or p_status not in ('aberto','enviado','negociando','aguardando','aprovado','perdido','cancelado','inativo') then return false; end if;
  select * into o from orc_orcamentos where id = p_id and empresa_id = q.emp and (q.adm or vend_id = q.vend);
  if not found then return false; end if;
  -- vendedor: não aprova e não mexe em pedido já fechado ou inativado (pode inativar orçamento ainda não fechado)
  if not q.adm and (p_status = 'aprovado' or o.status in ('aguardando','aprovado','inativo')) then return false; end if;
  inf := coalesce(o.info,'{}'::jsonb);
  if p_info is not null and jsonb_typeof(p_info) = 'object' and length(p_info::text) < 4000 then
    inf := inf || (p_info - 'hist' - 'fin');
  end if;
  if p_status = 'aprovado' then inf := inf || jsonb_build_object('fin', jsonb_build_object('por', q.vnome, 'em', now())); end if;
  h := coalesce(inf->'hist','[]'::jsonb) || jsonb_build_array(jsonb_build_object('s', p_status, 'por', q.vnome, 'em', now(), 'obs', left(coalesce(p_info->>'obs',''),300)));
  if jsonb_array_length(h) > 40 then h := h - 0; end if;
  inf := jsonb_set(inf, '{hist}', h);
  update orc_orcamentos set status = p_status, info = inf, atualizado_em = now() where id = p_id;
  return true;
end $function$;

-- dados do Painel do Comercial: estoque já descontado dos pedidos fechados depois da importação
create or replace function public.orc_dados(p_chave text, p_emp text default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $function$
declare q record; c record; cu text; pd jsonb;
begin
  select * into q from public.orc_quem(p_chave, p_emp);
  if q.emp is null then return null; end if;
  select * into c from orc_cfg where empresa_id = q.emp;
  pd := public.orc_est_pend_emp(q.emp);
  select case when k.dominio is not null and k.dominio<>'' then 'https://'||regexp_replace(regexp_replace(k.dominio,'^https?://',''),'/$','')||'/' else 'https://fc-consultoria.github.io/catalogo/'||k.slug end
    into cu from cat_clientes k where k.ativo and k.id = (select data->>'catalogo' from rotina_docs where col='consultoria' and id=q.emp);
  return jsonb_build_object(
    'emp', q.emp, 'adm', q.adm, 'papel', (public.emp_token_pessoa(p_chave)).papel, 'vend', jsonb_build_object('id', q.vend, 'nome', q.vnome),
    'nome', (select data->>'nome' from rotina_docs where col='consultoria' and id=q.emp),
    'cat', cu,
    'itens', coalesce((select jsonb_agg(case when pd ? (i->>'id') and jsonb_typeof(i->'est') = 'number'
                         then jsonb_set(i, '{est}', to_jsonb((i->>'est')::numeric - (pd->>(i->>'id'))::numeric)) else i end - 'forn')
                       from jsonb_array_elements(c.itens) i), '[]'::jsonb)
          || coalesce((select jsonb_agg(case when pd ? (i->>'id') and jsonb_typeof(i->'est') = 'number'
                         then jsonb_set(i, '{est}', to_jsonb((i->>'est')::numeric - (pd->>(i->>'id'))::numeric)) else i end
                         - 'compra' - 'ipi' - 'precoPlan' - 'estQ' - 'estUn' - 'fator' - 'fatorMan')
                       from jsonb_array_elements(c.comp) i), '[]'::jsonb),
    'est_pend', pd,
    'cab', coalesce(c.cab,'{}'::jsonb), 'pag', coalesce(c.pag,'[]'::jsonb),
    'desc_max', coalesce(c.desc_max,5), 'validade_dias', coalesce(c.validade_dias,7), 'obs', c.obs, 'itens_em', c.itens_em,
    'orcs', coalesce((select jsonb_agg(to_jsonb(o) order by o.numero desc) from (
        select * from orc_orcamentos where empresa_id = q.emp and (q.adm or vend_id = q.vend)
        order by numero desc limit 300) o), '[]'::jsonb));
end $function$;

-- simulações de compra: aceitar 'inativo' (a FC inativa pelo Painel da Matriz)
create or replace function public.compra_sim_inativar(p_id uuid, p_inativo boolean) returns boolean
language plpgsql security definer set search_path to 'public' as $$
begin
  if not public.trein_is_admin() then return false; end if;
  update compra_sim set status = case when p_inativo then 'inativo' else 'visto' end,
         visto_em = coalesce(visto_em, now()) where id = p_id;
  return found;
end $$;
grant execute on function public.compra_sim_inativar(uuid, boolean) to authenticated;

-- rotina de importação da Casa Bandeirante: toda semana, aos sábados (1º prazo 24/10/2026)
update orc_cfg set cab = jsonb_set(coalesce(cab,'{}'::jsonb), '{estFx}',
  coalesce(cab->'estFx','{}'::jsonb) || '{"dias":7,"ini":"2026-10-24"}'::jsonb)
 where empresa_id = 'cb';
