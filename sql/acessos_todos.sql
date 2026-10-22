-- Empresas e logins: todos os acessos de todas as ferramentas, para o Painel da Matriz.
create or replace function public.fc_acessos_todos()
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  return jsonb_build_object(
    'pessoas', coalesce((select jsonb_agg(jsonb_build_object('emp',p.empresa_id,'nome',p.nome,'login',p.login,'papel',p.papel,'ativo',p.ativo,
        'ult',greatest(p.ultimo_acesso,(select max(s.ultimo) from emp_sessoes s where s.pessoa_id=p.id)))) from emp_pessoas p),'[]'::jsonb),
    'cat', coalesce((select jsonb_agg(jsonb_build_object('emp',c.emp,'nome',c.nome,'empresa',c.empresa,'login',c.email,'status',c.status,'ult',c.ult_acesso)) from cat_contas c),'[]'::jsonb),
    'catcli', coalesce((select jsonb_agg(jsonb_build_object('id',id,'nome',nome)) from cat_clientes),'[]'::jsonb),
    'precif', coalesce((select jsonb_agg(jsonb_build_object('emp',a.empresa,'login',a.login,'nome',a.nome,'ativo',a.ativo,
        'ult',(select max(s.visto) from precif_sessoes s where s.login=a.login),
        'usuarios',(select jsonb_agg(distinct s.usuario) from precif_sessoes s where s.login=a.login and s.usuario is not null)))
        from precif_acessos a),'[]'::jsonb),
    'portal', coalesce((select jsonb_agg(jsonb_build_object('cli',c.nome,'nome',u.nome,'ativo',coalesce(pt.ativo,false),
        'ult',(select max(x.em) from impl_portal_acessos x where x.usuario_id=u.id),
        'visto',(select max(pr.visto_em) from impl_portal_presenca pr where pr.cliente_id=u.cliente_id and pr.nome=u.nome)))
        from impl_portal_usuarios u join impl_clientes c on c.id=u.cliente_id left join impl_portal pt on pt.cliente_id=u.cliente_id),'[]'::jsonb),
    'cons', coalesce((select jsonb_agg(jsonb_build_object('emp',empresa_id,'nome',nome,'em',em,'ate',ate)) from cons_acessos),'[]'::jsonb),
    'demo', coalesce((select jsonb_agg(jsonb_build_object('code',code,'nome',nome,'cidade',cidade,'horas',horas,'inicio',inicio,'ult',ultimo,'encerrado',encerrado,'criado',criado_em) order by criado_em desc) from trein_demo),'[]'::jsonb),
    'equipe', coalesce((select jsonb_agg(jsonb_build_object('nome',i.nome,'email',i.email,'admin',i.admin,
        'ult',(select max(f.visto_em) from fc_presenca f where f.email=i.email))) from impl_acesso i),'[]'::jsonb)
  );
end $$;
grant execute on function public.fc_acessos_todos() to authenticated;

-- Online no Painel do Gestor: batida a cada 45 s (emp_ping) e emp_central considera sessão viva < 2 min ou evento < 3 min.
-- (aplicado no Supabase pela migração emp_ping_online)
