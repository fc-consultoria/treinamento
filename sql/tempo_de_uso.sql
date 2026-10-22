-- FC · Tempo de uso de cada acesso (Central do Gestor, acompanhamento, Precificação de Kits, Equipe FC e links de teste)
-- Rodar tudo de uma vez no SQL Editor do Supabase.

create table if not exists public.fc_tempo(chave text primary key, seg integer not null default 0, ult timestamptz);
alter table public.fc_tempo enable row level security;

create or replace function public.fc_tempo_add(p_chave text)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  insert into fc_tempo(chave, seg, ult) values (p_chave, 0, now())
  on conflict (chave) do update set
    seg = fc_tempo.seg + case when fc_tempo.ult > now() - interval '120 seconds' then greatest(0, extract(epoch from now() - fc_tempo.ult))::int else 0 end,
    ult = now();
end $$;
revoke all on function public.fc_tempo_add(text) from public, anon, authenticated;

create or replace function public.emp_ping(p_token text)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare v uuid;
begin
  update emp_sessoes set ultimo = now() where token = p_token and ativo returning pessoa_id into v;
  if v is null then return false; end if;
  perform fc_tempo_add('emp:'||v);
  return true;
end $$;

create or replace function public.impl_portal_presenca(p_chave text, p_nome text default '')
returns void language plpgsql security definer set search_path to 'public' as $function$
declare v_cli uuid; v_nome text := left(coalesce(trim(p_nome),''), 80);
begin
  select cliente_id into v_cli from public.impl_portal where chave = p_chave and ativo;
  if v_cli is null then return; end if;
  insert into public.impl_portal_presenca(cliente_id, nome, entrou_em, visto_em)
  values (v_cli, v_nome, now(), now())
  on conflict (cliente_id, nome) do update
    set entrou_em = case when public.impl_portal_presenca.visto_em < now() - interval '3 minutes'
                         then now() else public.impl_portal_presenca.entrou_em end,
        visto_em = now();
  perform fc_tempo_add('portal:'||v_cli||':'||v_nome);
end $function$;

create or replace function public.fc_presenca_ping(p_app text, p_nome text default null, p_onde text default null)
returns void language plpgsql security definer set search_path to 'public' as $function$
declare v_email text := lower(coalesce(auth.jwt()->>'email',''));
begin
  if v_email = '' then return; end if;
  if exists (select 1 from public.impl_acesso a where lower(a.email)=v_email and not a.aparecer_online) then
    delete from public.fc_presenca where email = v_email;
    return;
  end if;
  insert into public.fc_presenca(app, email, nome, onde, entrou_em, visto_em)
  values (left(p_app,40), v_email, left(p_nome,80), left(p_onde,160), now(), now())
  on conflict (app, email) do update
    set nome = excluded.nome, onde = excluded.onde,
        entrou_em = case when public.fc_presenca.visto_em < now() - interval '3 minutes' then now() else public.fc_presenca.entrou_em end,
        visto_em = now();
  perform fc_tempo_add('eq:'||v_email);
end $function$;

create or replace function public.precif_ping(p_token uuid, p_estado jsonb default null, p_editando text default null, p_desde timestamptz default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare s public.precif_sessoes := public.precif_sessao(p_token); tr jsonb := null; mx int;
begin
  update public.precif_sessoes set visto = now(), estado = coalesce(p_estado, estado) where token = s.token;
  if s.login is not null then perform fc_tempo_add('precif:'||s.login||':'||coalesce(s.usuario,'')); end if;
  if p_editando is null then delete from public.precif_travas where token = s.token;
  else tr := public.precif_trava_pegar(s, p_editando); end if;
  delete from public.precif_travas where visto < now() - interval '60 seconds';
  select max_usuarios into mx from public.precif_acessos where login = s.login;
  return jsonb_build_object(
    'agora', now(), 'trava', tr, 'max', mx,
    'usuarios', case when mx is null then '[]'::jsonb else coalesce((select jsonb_agg(public.precif_nome(x) order by x.visto) from public.precif_sessoes x
                  where x.login = s.login and x.visto > now() - interval '3 minutes' and x.token <> s.token), '[]'::jsonb) end,
    'travas', coalesce((select jsonb_agg(jsonb_build_object('id', modelo, 'por', nome)) from public.precif_travas
                  where empresa = s.empresa and token <> s.token), '[]'::jsonb),
    'alteracoes', case when p_desde is null then '[]'::jsonb else coalesce((select jsonb_agg(jsonb_build_object('id', id, 'nome', dados->>'nome', 'por', atualizado_nome, 'em', atualizado_em) order by atualizado_em)
                  from public.precif_modelos where empresa = s.empresa and atualizado_em > p_desde and atualizado_token is distinct from s.token), '[]'::jsonb) end);
end $function$;

create or replace function public.fc_acessos_todos()
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  return jsonb_build_object(
    'pessoas', coalesce((select jsonb_agg(jsonb_build_object('emp',p.empresa_id,'nome',p.nome,'login',p.login,'papel',p.papel,'ativo',p.ativo,
        'ult',greatest(p.ultimo_acesso,(select max(s.ultimo) from emp_sessoes s where s.pessoa_id=p.id)),
        'seg',(select seg from fc_tempo where chave='emp:'||p.id))) from emp_pessoas p),'[]'::jsonb),
    'cat', coalesce((select jsonb_agg(jsonb_build_object('emp',c.emp,'nome',c.nome,'empresa',c.empresa,'login',c.email,'status',c.status,'ult',c.ult_acesso)) from cat_contas c),'[]'::jsonb),
    'catcli', coalesce((select jsonb_agg(jsonb_build_object('id',id,'nome',nome)) from cat_clientes),'[]'::jsonb),
    'precif', coalesce((select jsonb_agg(jsonb_build_object('emp',a.empresa,'login',a.login,'nome',a.nome,'ativo',a.ativo,
        'ult',(select max(s.visto) from precif_sessoes s where s.login=a.login),
        'seg',(select sum(t.seg) from fc_tempo t where t.chave like 'precif:'||a.login||':%'),
        'usuarios',(select jsonb_agg(distinct s.usuario) from precif_sessoes s where s.login=a.login and s.usuario is not null)))
        from precif_acessos a),'[]'::jsonb),
    'portal', coalesce((select jsonb_agg(jsonb_build_object('cli',c.nome,'nome',u.nome,'ativo',coalesce(pt.ativo,false),
        'ult',(select max(x.em) from impl_portal_acessos x where x.usuario_id=u.id),
        'visto',(select max(pr.visto_em) from impl_portal_presenca pr where pr.cliente_id=u.cliente_id and pr.nome=u.nome),
        'seg',(select seg from fc_tempo where chave='portal:'||u.cliente_id||':'||u.nome)))
        from impl_portal_usuarios u join impl_clientes c on c.id=u.cliente_id left join impl_portal pt on pt.cliente_id=u.cliente_id),'[]'::jsonb),
    'cons', coalesce((select jsonb_agg(jsonb_build_object('emp',empresa_id,'nome',nome,'em',em,'ate',ate)) from cons_acessos),'[]'::jsonb),
    'demo', coalesce((select jsonb_agg(jsonb_build_object('code',d.code,'nome',d.nome,'cidade',d.cidade,'horas',d.horas,'inicio',d.inicio,'ult',d.ultimo,'encerrado',d.encerrado,'criado',d.criado_em,
        'seg',(select sum(coalesce((e.detalhe->>'s')::int,60)) from trein_demo_ev e where e.code=d.code and e.tipo='tempo')) order by d.criado_em desc) from trein_demo d),'[]'::jsonb),
    'equipe', coalesce((select jsonb_agg(jsonb_build_object('nome',i.nome,'email',i.email,'admin',i.admin,
        'ult',(select max(f.visto_em) from fc_presenca f where f.email=i.email),
        'seg',(select seg from fc_tempo where chave='eq:'||lower(i.email)))) from impl_acesso i),'[]'::jsonb)
  );
end $$;
