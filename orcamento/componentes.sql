-- Componentes (acessórios) no Painel de Vendas: estoque + tabela de preços
-- orc_cfg.comp = lista de componentes, separada dos perfis (orc_cfg.itens)
alter table public.orc_cfg add column if not exists comp jsonb not null default '[]'::jsonb;

-- Leitura do painel: componentes entram junto com os itens, sem custo nem saldo bruto
CREATE OR REPLACE FUNCTION public.orc_dados(p_chave text, p_emp text DEFAULT NULL::text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare q record; c record; cu text;
begin
  select * into q from public.orc_quem(p_chave, p_emp);
  if q.emp is null then return null; end if;
  select * into c from orc_cfg where empresa_id = q.emp;
  select case when k.dominio is not null and k.dominio<>'' then 'https://'||regexp_replace(regexp_replace(k.dominio,'^https?://',''),'/$','')||'/' else 'https://fc-consultoria.github.io/catalogo/'||k.slug end
    into cu from cat_clientes k where k.ativo and k.id = (select data->>'catalogo' from rotina_docs where col='consultoria' and id=q.emp);
  return jsonb_build_object(
    'emp', q.emp, 'adm', q.adm, 'papel', (public.emp_token_pessoa(p_chave)).papel, 'vend', jsonb_build_object('id', q.vend, 'nome', q.vnome),
    'nome', (select data->>'nome' from rotina_docs where col='consultoria' and id=q.emp),
    'cat', cu,
    'itens', coalesce((select jsonb_agg(i - 'forn') from jsonb_array_elements(c.itens) i), '[]'::jsonb)
          || coalesce((select jsonb_agg(i - 'compra' - 'ipi' - 'precoPlan' - 'estQ' - 'estUn' - 'fator' - 'fatorMan') from jsonb_array_elements(c.comp) i), '[]'::jsonb),
    'cab', coalesce(c.cab,'{}'::jsonb), 'pag', coalesce(c.pag,'[]'::jsonb),
    'desc_max', coalesce(c.desc_max,5), 'validade_dias', coalesce(c.validade_dias,7), 'obs', c.obs, 'itens_em', c.itens_em,
    'orcs', coalesce((select jsonb_agg(to_jsonb(o) order by o.numero desc) from (
        select * from orc_orcamentos where empresa_id = q.emp and (q.adm or vend_id = q.vend)
        order by numero desc limit 300) o), '[]'::jsonb));
end $function$;

-- Salvar orçamento: o preço do componente vem do servidor, como nos perfis
CREATE OR REPLACE FUNCTION public.orc_salvar(p_chave text, p_orc jsonb, p_emp text DEFAULT NULL::text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare q record; c record; it jsonb; ref jsonb; L jsonb := '[]'::jsonb; sub numeric := 0; qt numeric; pr numeric;
  dsc numeric; fr numeric; oid uuid; num int; old record;
begin
  select * into q from public.orc_quem(p_chave, p_emp);
  if q.emp is null then return null; end if;
  select * into c from orc_cfg where empresa_id = q.emp;
  if not found then raise exception 'sem configuracao'; end if;
  if jsonb_array_length(coalesce(p_orc->'itens','[]'::jsonb)) > 400 then raise exception 'itens demais'; end if;
  for it in select * from jsonb_array_elements(coalesce(p_orc->'itens','[]'::jsonb)) loop
    qt := nullif(it->>'qtd','')::numeric;
    if qt is null or qt <= 0 or qt > 100000 then continue; end if;
    ref := null;
    select r.value into ref from jsonb_array_elements(coalesce(c.itens,'[]'::jsonb) || coalesce(c.comp,'[]'::jsonb)) as r(value) where r.value->>'id' = it->>'id' limit 1;
    if ref is null then
      if not q.adm then continue; end if;
      pr := coalesce(nullif(it->>'preco','')::numeric, 0);
      ref := jsonb_build_object('id', it->>'id', 'cod', left(coalesce(it->>'cod',''),40), 'desc', left(coalesce(it->>'desc',''),200), 'un', left(coalesce(it->>'un','UN'),6), 'foto', it->>'foto', 'peso', null);
    else
      pr := coalesce(nullif(ref->>'preco','')::numeric, 0);
      if q.adm and nullif(it->>'preco','') is not null and pr > 0 then pr := (it->>'preco')::numeric; end if;
    end if;
    pr := round(pr, 2);
    if pr <= 0 then raise exception 'Item % sob consulta: sem preco de venda. Tire o item do orcamento.', coalesce(ref->>'cod',''); end if;
    L := L || jsonb_build_object('id', ref->>'id', 'cod', ref->>'cod', 'desc', ref->>'desc', 'cor', ref->>'cor', 'un', coalesce(ref->>'un','BR'),
      'peso', ref->'peso', 'foto', ref->>'foto', 'cref', left(nullif(it->>'cref',''),40), 'qtd', qt, 'preco', pr, 'total', round(pr*qt, 2));
    sub := sub + round(pr*qt, 2);
  end loop;
  dsc := greatest(0, coalesce(nullif(p_orc->>'desconto','')::numeric, 0));
  if not q.adm and sub > 0 and dsc > round(sub * greatest(c.desc_max, coalesce((select (x.desc_aut->>'pct')::numeric from orc_orcamentos x where x.id = nullif(p_orc->>'id','')::uuid and x.empresa_id = q.emp), 0)) / 100, 2) + 0.01 then raise exception 'desconto acima do limite'; end if;
  if dsc > sub then dsc := sub; end if;
  fr := greatest(0, coalesce(nullif(p_orc->>'frete','')::numeric, 0));
  oid := nullif(p_orc->>'id','')::uuid;
  if oid is not null then
    select * into old from orc_orcamentos where id = oid and empresa_id = q.emp;
    if not found or (not q.adm and old.vend_id is distinct from q.vend) then raise exception 'sem acesso'; end if;
    if not q.adm and old.status in ('aguardando','aprovado') then raise exception 'pedido ja enviado ao financeiro'; end if;
    update orc_orcamentos set cliente = coalesce(p_orc->'cliente','{}'::jsonb), itens = L, pagamento = coalesce(p_orc->'pagamento','{}'::jsonb),
      subtotal = sub, desconto = dsc, frete = fr, total = sub - dsc + fr, validade = nullif(p_orc->>'validade','')::date,
      obs = left(p_orc->>'obs', 2000),
      status = case when q.adm then coalesce(nullif(p_orc->>'status',''), status) else status end,
      atualizado_em = now()
    where id = oid;
    return jsonb_build_object('id', oid, 'numero', old.numero);
  end if;
  perform pg_advisory_xact_lock(hashtext('orc_'||q.emp));
  select coalesce(max(numero), 1000) + 1 into num from orc_orcamentos where empresa_id = q.emp;
  insert into orc_orcamentos(empresa_id, numero, vend_id, vend_nome, cliente, itens, pagamento, subtotal, desconto, frete, total, validade, obs)
  values (q.emp, num, q.vend, q.vnome, coalesce(p_orc->'cliente','{}'::jsonb), L, coalesce(p_orc->'pagamento','{}'::jsonb), sub, dsc, fr, sub - dsc + fr,
    nullif(p_orc->>'validade','')::date, left(p_orc->>'obs', 2000))
  returning id into oid;
  return jsonb_build_object('id', oid, 'numero', num);
end $function$;

-- Salvar configuração: Compras grava só estoque (perfis e componentes); gestor grava tudo, componentes só se vierem
CREATE OR REPLACE FUNCTION public.orc_g_cfg_salvar(p_chave text, p_cfg jsonb)
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare e text; pes emp_pessoas; old orc_cfg; its jsonb; cps jsonb; cb jsonb;
begin
  e := public.emp_chave_venda(p_chave);
  if e is null then return false; end if;
  if length(p_cfg::text) > 3000000 then raise exception 'grande demais'; end if;
  pes := public.emp_token_pessoa(p_chave);
  if pes.id is not null and pes.papel = 'compras' then
    select * into old from orc_cfg where empresa_id = e;
    if not found then return false; end if;
    select coalesce(jsonb_agg(case when y.v is null then x.v else (x.v - 'est' - 'estCor') || jsonb_strip_nulls(jsonb_build_object('est', y.v->'est', 'estCor', y.v->'estCor')) end order by x.o), '[]'::jsonb)
      into its
      from jsonb_array_elements(old.itens) with ordinality x(v, o)
      left join lateral (select z.value v from jsonb_array_elements(coalesce(p_cfg->'itens','[]'::jsonb)) z where z.value->>'id' = x.v->>'id' limit 1) y on true;
    if p_cfg ? 'comp' then
      select coalesce(jsonb_agg(case when y.v is null then x.v else (x.v - 'est' - 'estCor' - 'estQ' - 'estUn' - 'estConf' - 'fator' - 'fatorMan')
          || jsonb_strip_nulls(jsonb_build_object('est', y.v->'est', 'estCor', y.v->'estCor', 'estQ', y.v->'estQ', 'estUn', y.v->'estUn', 'estConf', y.v->'estConf', 'fator', y.v->'fator', 'fatorMan', y.v->'fatorMan')) end order by x.o), '[]'::jsonb)
        into cps
        from jsonb_array_elements(old.comp) with ordinality x(v, o)
        left join lateral (select z.value v from jsonb_array_elements(p_cfg->'comp') z where z.value->>'id' = x.v->>'id' limit 1) y on true;
    else cps := old.comp; end if;
    cb := (coalesce(old.cab,'{}'::jsonb) - 'estEm' - 'estFx' - 'estMsg' - 'compEstEm' - 'compEstMsg')
          || jsonb_strip_nulls(jsonb_build_object('estEm', p_cfg->'cab'->'estEm', 'estFx', p_cfg->'cab'->'estFx', 'estMsg', p_cfg->'cab'->'estMsg',
               'compEstEm', p_cfg->'cab'->'compEstEm', 'compEstMsg', p_cfg->'cab'->'compEstMsg'));
    update orc_cfg set itens = its, comp = cps, cab = cb, atualizado_em = now() where empresa_id = e;
    insert into emp_eventos(empresa_id, pessoa_id, nome, papel, area, acao, detalhe)
     values (e, pes.id, pes.nome, pes.papel, 'compras', 'estoque_importado', jsonb_build_object('itens', jsonb_array_length(its), 'componentes', jsonb_array_length(cps)));
    return true;
  end if;
  insert into orc_cfg(empresa_id, itens, comp, cab, pag, desc_max, validade_dias, obs, planilha_id, itens_em, atualizado_em)
  values (e, coalesce(p_cfg->'itens','[]'::jsonb), coalesce(p_cfg->'comp','[]'::jsonb), coalesce(p_cfg->'cab','{}'::jsonb), coalesce(p_cfg->'pag','[]'::jsonb),
    coalesce(nullif(p_cfg->>'desc_max','')::numeric, 5), coalesce(nullif(p_cfg->>'validade_dias','')::int, 7), p_cfg->>'obs',
    nullif(p_cfg->>'planilha_id','')::uuid, nullif(p_cfg->>'itens_em','')::timestamptz, now())
  on conflict (empresa_id) do update set itens = excluded.itens,
    comp = case when p_cfg ? 'comp' then excluded.comp else orc_cfg.comp end,
    cab = excluded.cab, pag = excluded.pag, desc_max = excluded.desc_max,
    validade_dias = excluded.validade_dias, obs = excluded.obs, planilha_id = excluded.planilha_id, itens_em = excluded.itens_em, atualizado_em = now();
  return true;
end $function$;
