-- Abas de estudo (Mostruário e Treinamento 3D) dentro do Painel de Vendas
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
    'estudo', jsonb_build_object('on', coalesce((c.cab->>'estudo')::boolean, false),
       'sala', (select data->>'treinSala' from rotina_docs where col='consultoria' and id=q.emp),
       'cda', q.emp = 'cb' or coalesce((select (data->>'cda')::boolean from rotina_docs where col='consultoria' and id=q.emp), false)),
    'cab', coalesce(c.cab,'{}'::jsonb), 'pag', coalesce(c.pag,'[]'::jsonb),
    'desc_max', coalesce(c.desc_max,5), 'validade_dias', coalesce(c.validade_dias,7), 'obs', c.obs, 'itens_em', c.itens_em,
    'orcs', coalesce((select jsonb_agg(to_jsonb(o) order by o.numero desc) from (
        select * from orc_orcamentos where empresa_id = q.emp and (q.adm or vend_id = q.vend)
        order by numero desc limit 300) o), '[]'::jsonb));
end $function$;

-- liga para a Casa Bandeirante
update orc_cfg set cab = coalesce(cab,'{}'::jsonb) || '{"estudo":true}'::jsonb where empresa_id = 'cb';
