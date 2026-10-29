-- Plataforma FC 3D Clientes · banco São Paulo (pawwncmfadzxfahfvhry) · 28/10/2026
-- Confere a sessão e devolve só quem está logado (nome, papel, empresa). Não traz nada das linhas exclusivas.
create or replace function public.fc3d_cli_sessao(p_token uuid) returns jsonb
language plpgsql security definer set search_path to 'public' as $$
declare s public.fc3d_sessoes:=fc3d_sess(p_token); e public.fc3d_empresas;
begin
  if s.matriz then return jsonb_build_object('nome','FC Consultoria','papel','fc','matriz',true); end if;
  select * into e from fc3d_empresas where id=s.empresa_id;
  return jsonb_build_object('nome',s.nome,'papel',s.papel,'empresa',e.id,'empresa_nome',e.nome,'sigla',e.sigla,'matriz',false);
end $$;
revoke all on function public.fc3d_cli_sessao(uuid) from public;
grant execute on function public.fc3d_cli_sessao(uuid) to anon, authenticated;
