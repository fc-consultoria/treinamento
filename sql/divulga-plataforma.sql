-- Projeto treinamento (cpkjphodruyxfouirhpd) · já aplicado em 29/10/2026
-- Leitura pública da divulgação enviada para a Plataforma FC 3D (faixas e boas-vindas).
create policy trein_eventos_sel_pl_divulga on public.trein_eventos for select to anon, authenticated
  using (tipo = 'pl_divulga' and user_id = '0cf32a33-c9dd-4249-acbd-7f448562ba94'::uuid);
