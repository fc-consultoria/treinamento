-- Projeto fc3d-plataforma-sp (pawwncmfadzxfahfvhry)
-- Lista pública (só id e nome) das empresas ativas da Plataforma FC 3D,
-- usada no formulário "Nova dica" do Painel da Matriz para escolher quem recebe.
create or replace function public.pfc_empresas_nomes() returns table(id text, nome text)
language sql stable security definer set search_path to 'public' as $$
  select e.id, e.nome from pfc_empresas e where e.ativo order by e.nome, e.id;
$$;
revoke all on function public.pfc_empresas_nomes() from public;
grant execute on function public.pfc_empresas_nomes() to anon, authenticated;
