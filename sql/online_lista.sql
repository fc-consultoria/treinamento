-- 27/10/2026 · Painel da Matriz: lista de quem está on-line (selo On-line) + abrir conversa com a pessoa.
-- On-line = sinal nos últimos 2 minutos (fc_presenca para a equipe FC; emp_sessoes.ultimo para as equipes dos clientes).
-- Rodar tudo de uma vez no SQL Editor do Supabase.

create or replace function public.fc_online_lista() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare eu text := lower(coalesce(auth.jwt()->>'email',''));
begin
  if not trein_is_admin() then return null; end if;
  return jsonb_build_object(
    'equipe', coalesce((select jsonb_agg(x order by x->>'nome') from (
        select distinct on (lower(p.email)) jsonb_build_object('email', lower(p.email),
          'nome', coalesce(nullif(a.nome,''), nullif(p.nome,''), p.email), 'app', p.app, 'onde', p.onde, 'desde', p.entrou_em) x
        from fc_presenca p left join impl_acesso a on lower(a.email) = lower(p.email)
        where p.visto_em > now() - interval '2 minutes' and coalesce(a.aparecer_online, true) and lower(p.email) <> eu
        order by lower(p.email), p.visto_em desc) t), '[]'::jsonb),
    'clientes', coalesce((select jsonb_agg(x order by x->>'emp_nome', x->>'nome') from (
        select distinct on (pe.id) jsonb_build_object('id', pe.id, 'nome', pe.nome, 'papel', pe.papel, 'emp', pe.empresa_id,
          'emp_nome', coalesce((select r.data->>'nome' from rotina_docs r where r.col = 'consultoria' and r.id = pe.empresa_id), pe.empresa_id),
          'nao_lidas', coalesce((select count(*) from emp_conversas c join emp_msgs m on m.conversa_id = c.id
              where c.tipo = 'fc' and c.a = pe.id and m.de is not null
                and m.id > coalesce((select ultima_id from emp_lidos l where l.conversa_id = c.id and l.leitor = 'fc'), 0)), 0)) x
        from emp_sessoes s join emp_pessoas pe on pe.id = s.pessoa_id
        where s.ativo and s.ultimo > now() - interval '2 minutes' and coalesce(pe.ativo, true)
        order by pe.id, s.ultimo desc) t), '[]'::jsonb));
end $$;

-- Abre (ou cria) a conversa da pessoa com a FC e devolve o id
create or replace function public.emp_chat_fc_abrir(p_pessoa uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare v uuid; e text;
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  select id into v from emp_conversas where tipo = 'fc' and a = p_pessoa;
  if v is null then
    select empresa_id into e from emp_pessoas where id = p_pessoa;
    if e is null then return null; end if;
    insert into emp_conversas(empresa_id, tipo, a) values (e, 'fc', p_pessoa) on conflict do nothing returning id into v;
    if v is null then select id into v from emp_conversas where tipo = 'fc' and a = p_pessoa; end if;
  end if;
  return v;
end $$;

revoke all on function public.fc_online_lista(), public.emp_chat_fc_abrir(uuid) from public;
grant execute on function public.fc_online_lista(), public.emp_chat_fc_abrir(uuid) to authenticated;
