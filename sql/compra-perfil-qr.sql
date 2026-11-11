-- QR do perfil (Onde comprar): página pública perfil.html, sem preços, vale até 2 horas.
create table if not exists public.compra_perfil_qr(
  id text primary key,
  empresa_id text not null,
  hash text,
  dados jsonb not null,
  ativo boolean not null default true,
  acessos int not null default 0,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null default now() + interval '2 hours'
);
create index if not exists compra_perfil_qr_emp on public.compra_perfil_qr(empresa_id, hash);
alter table public.compra_perfil_qr enable row level security;
revoke all on public.compra_perfil_qr from anon, authenticated;

create or replace function public.compra_perfil_qr_criar(p_chave text, p_emp text, p_dados jsonb)
returns text language plpgsql security definer set search_path to 'public' as $$
declare eid text; h text; nid text; d jsonb; im jsonb;
begin
  eid := public.compra_emp(p_chave, p_emp);
  if eid is null or p_dados is null or jsonb_typeof(p_dados) <> 'object' then return null; end if;
  if length(p_dados::text) > 8000 then return null; end if;
  /* só os campos permitidos (nada de preço) */
  select coalesce(jsonb_agg(x), '[]'::jsonb) into im from (
    select x from jsonb_array_elements_text(case when jsonb_typeof(p_dados->'img')='array' then p_dados->'img' else '[]'::jsonb end) x
    where x ~* '^https?://' and length(x) < 600 limit 3) s;
  d := jsonb_build_object('c', left(coalesce(p_dados->>'c',''),60), 'n', left(coalesce(p_dados->>'n',''),160),
        'lin', left(coalesce(p_dados->>'lin',''),80),
        'kg', case when (p_dados->>'kg') ~ '^[0-9]+(\.[0-9]+)?$' then (p_dados->>'kg')::numeric else null end,
        'img', im);
  if d->>'c' = '' then return null; end if;
  h := md5(d::text);
  select id into nid from compra_perfil_qr where empresa_id = eid and hash = h and ativo and expira_em > now() + interval '30 minutes' limit 1;
  if nid is not null then return nid; end if;
  /* trava de segurança: no máximo 200 links por empresa a cada 2 horas */
  if (select count(*) from compra_perfil_qr where empresa_id = eid and criado_em > now() - interval '2 hours') >= 200 then return null; end if;
  nid := replace(gen_random_uuid()::text, '-', '') || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  insert into compra_perfil_qr(id, empresa_id, hash, dados) values (nid, eid, h, d);
  return nid;
end $$;

create or replace function public.compra_perfil_qr_ver(p_id text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare r compra_perfil_qr;
begin
  if p_id is null or length(p_id) <> 40 then return null; end if;
  select * into r from compra_perfil_qr where id = p_id;
  if not found then return null; end if;
  if not r.ativo or r.expira_em < now() then return jsonb_build_object('expirado', true); end if;
  update compra_perfil_qr set acessos = acessos + 1 where id = p_id;
  return r.dados || jsonb_build_object('expira', r.expira_em);
end $$;

create or replace function public.compra_perfil_qr_encerrar(p_chave text, p_emp text)
returns int language plpgsql security definer set search_path to 'public' as $$
declare eid text; n int;
begin
  eid := public.compra_emp(p_chave, p_emp);
  if eid is null then return null; end if;
  update compra_perfil_qr set ativo = false where empresa_id = eid and ativo and expira_em > now();
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.compra_perfil_qr_criar(text,text,jsonb) from public;
revoke all on function public.compra_perfil_qr_ver(text) from public;
revoke all on function public.compra_perfil_qr_encerrar(text,text) from public;
grant execute on function public.compra_perfil_qr_criar(text,text,jsonb) to anon, authenticated;
grant execute on function public.compra_perfil_qr_ver(text) to anon, authenticated;
grant execute on function public.compra_perfil_qr_encerrar(text,text) to anon, authenticated;
