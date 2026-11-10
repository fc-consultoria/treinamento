-- 10/11/2026 · Simulador na obra (Family CDE): só aparelhos liberados pela FC
create table if not exists fam_aparelhos(
  id uuid primary key default gen_random_uuid(),
  disp text unique not null,
  nome text not null,
  telefone text not null,
  empresa text not null default 'CDE',
  status text not null default 'pendente' check (status in ('pendente','liberado','bloqueado')),
  criado_em timestamptz not null default now(),
  liberado_em timestamptz,
  ultimo_uso timestamptz
);
alter table fam_aparelhos enable row level security;
revoke all on fam_aparelhos from anon, authenticated;

create or replace function fam_ap_pedir(p_disp text, p_nome text, p_tel text)
returns text language plpgsql security definer set search_path=public as $$
declare s text;
begin
  if coalesce(char_length(p_disp),0) not between 16 and 80 then return 'erro'; end if;
  if coalesce(char_length(trim(p_nome)),0) not between 2 and 120 then return 'erro'; end if;
  if coalesce(char_length(regexp_replace(p_tel,'\D','','g')),0) not between 8 and 15 then return 'erro'; end if;
  select status into s from fam_aparelhos where disp=p_disp;
  if s is null then
    if (select count(*) from fam_aparelhos where status='pendente') >= 200 then return 'erro'; end if;
    insert into fam_aparelhos(disp,nome,telefone) values(p_disp,left(trim(p_nome),120),left(trim(p_tel),30));
    return 'pendente';
  end if;
  if s='pendente' then update fam_aparelhos set nome=left(trim(p_nome),120),telefone=left(trim(p_tel),30) where disp=p_disp; end if;
  return s;
end $$;

create or replace function fam_ap_status(p_disp text)
returns text language plpgsql security definer set search_path=public as $$
declare s text;
begin
  update fam_aparelhos set ultimo_uso=now() where disp=p_disp and status='liberado' returning status into s;
  if s is null then select status into s from fam_aparelhos where disp=p_disp; end if;
  return coalesce(s,'novo');
end $$;

create or replace function fam_ap_lista(p_token uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if not pfc_eh_matriz(p_token) then return jsonb_build_object('erro','sem acesso'); end if;
  return coalesce((select jsonb_agg(to_jsonb(a)-'disp' order by (a.status='pendente') desc, a.criado_em desc) from fam_aparelhos a),'[]'::jsonb);
end $$;

create or replace function fam_ap_definir(p_token uuid, p_id uuid, p_status text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  if not pfc_eh_matriz(p_token) then return false; end if;
  if p_status='excluir' then delete from fam_aparelhos where id=p_id; return true; end if;
  if p_status not in ('liberado','bloqueado','pendente') then return false; end if;
  update fam_aparelhos set status=p_status, liberado_em=case when p_status='liberado' then now() else liberado_em end where id=p_id;
  return found;
end $$;

grant execute on function fam_ap_pedir(text,text,text), fam_ap_status(text), fam_ap_lista(uuid), fam_ap_definir(uuid,uuid,text) to anon, authenticated;
