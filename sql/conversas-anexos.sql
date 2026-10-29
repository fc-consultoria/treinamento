-- ===== 29/10/2026 · Anexos (print/foto e PDF) nas Conversas das equipes =====
-- O arquivo fica no banco (emp_anexos), com a mesma regra de acesso das mensagens:
--   participante da conversa, gestor da empresa (só leitura) e a FC.
-- Imagens chegam já reduzidas pelo navegador (JPEG ~1600px). PDF até 5 MB.

alter table public.emp_msgs add column if not exists anexo jsonb;   -- {id, nome, tipo, tamanho}

create table if not exists public.emp_anexos (
  id bigserial primary key,
  conversa_id uuid not null references public.emp_conversas(id) on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('image/jpeg','image/png','image/webp','image/gif','application/pdf')),
  tamanho int not null,
  dados bytea not null,
  em timestamptz not null default now()
);
create index if not exists emp_anexos_conv on public.emp_anexos (conversa_id);
alter table public.emp_anexos enable row level security;

-- prévia na lista: mensagem só com anexo aparece como "📎 nome"
create or replace function public.emp_conv_json(c public.emp_conversas, p_leitor text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', c.id, 'tipo', c.tipo, 'ultima_em', c.ultima_em,
    'a', (select jsonb_build_object('id',id,'nome',nome,'papel',papel) from emp_pessoas where id = c.a),
    'b', (select jsonb_build_object('id',id,'nome',nome,'papel',papel) from emp_pessoas where id = c.b),
    'ultima', (select jsonb_build_object('nome',m.nome,'texto',left(coalesce(nullif(m.texto,''),'📎 '||coalesce(m.anexo->>'nome','anexo')),120),'em',m.em,'fc',m.de is null) from emp_msgs m where m.conversa_id = c.id order by m.id desc limit 1),
    'nao_lidas', case when p_leitor is null then 0 else (select count(*) from emp_msgs m where m.conversa_id = c.id
        and m.id > coalesce((select ultima_id from emp_lidos l where l.conversa_id = c.id and l.leitor = p_leitor), 0)
        and (case when p_leitor = 'fc' then m.de is not null else m.de::text is distinct from p_leitor end)) end) $$;
revoke all on function public.emp_conv_json(public.emp_conversas, text) from public, anon, authenticated;

-- grava o anexo (uso interno das funções de envio)
create or replace function public.emp_anexo_gravar(p_conversa uuid, p_nome text, p_tipo text, p_b64 text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare b bytea; aid bigint; nm text;
begin
  if p_tipo not in ('image/jpeg','image/png','image/webp','image/gif','application/pdf') then raise exception 'tipo de arquivo não aceito'; end if;
  b := decode(p_b64, 'base64');
  if length(b) = 0 then raise exception 'arquivo vazio'; end if;
  if length(b) > 5 * 1024 * 1024 then raise exception 'arquivo maior que 5 MB'; end if;
  nm := left(coalesce(nullif(trim(p_nome),''), case when p_tipo = 'application/pdf' then 'documento.pdf' else 'imagem.jpg' end), 120);
  insert into emp_anexos(conversa_id, nome, tipo, tamanho, dados) values (p_conversa, nm, p_tipo, length(b), b) returning id into aid;
  return jsonb_build_object('id', aid, 'nome', nm, 'tipo', p_tipo, 'tamanho', length(b));
end $$;
revoke all on function public.emp_anexo_gravar(uuid,text,text,text) from public, anon, authenticated;

-- equipe: envia mensagem com anexo (texto opcional)
create or replace function public.emp_chat_enviar_anexo(p_token text, p_conversa uuid, p_texto text, p_nome text, p_tipo text, p_b64 text) returns bigint
language plpgsql security definer set search_path = public as $$
declare me emp_pessoas; c emp_conversas; mid bigint; ax jsonb;
begin
  me := emp_token_pessoa(p_token);
  select * into c from emp_conversas where id = p_conversa;
  if me.id is null or c.id is null or not (c.a = me.id or c.b = me.id) then return null; end if;
  ax := emp_anexo_gravar(c.id, p_nome, p_tipo, p_b64);
  insert into emp_msgs(conversa_id, de, nome, texto, anexo) values (c.id, me.id, me.nome, left(coalesce(trim(p_texto),''), 4000), ax) returning id into mid;
  update emp_conversas set ultima_em = now() where id = c.id;
  insert into emp_lidos(conversa_id, leitor, ultima_id) values (c.id, me.id::text, mid)
    on conflict (conversa_id, leitor) do update set ultima_id = excluded.ultima_id;
  return mid;
end $$;

-- FC: envia mensagem com anexo
create or replace function public.emp_chat_fc_enviar_anexo(p_conversa uuid, p_texto text, p_nome text, p_tipo text, p_b64 text) returns bigint
language plpgsql security definer set search_path = public as $$
declare c emp_conversas; mid bigint; ax jsonb;
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  select * into c from emp_conversas where id = p_conversa and tipo = 'fc';
  if c.id is null then return null; end if;
  ax := emp_anexo_gravar(c.id, p_nome, p_tipo, p_b64);
  insert into emp_msgs(conversa_id, de, nome, texto, anexo) values (c.id, null, 'FC Consultoria', left(coalesce(trim(p_texto),''), 4000), ax) returning id into mid;
  update emp_conversas set ultima_em = now() where id = c.id;
  insert into emp_lidos(conversa_id, leitor, ultima_id) values (c.id, 'fc', mid)
    on conflict (conversa_id, leitor) do update set ultima_id = excluded.ultima_id;
  return mid;
end $$;

-- abrir anexo: equipe (participante ou gestor da empresa)
create or replace function public.emp_chat_anexo(p_token text, p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me emp_pessoas; x emp_anexos; c emp_conversas;
begin
  me := emp_token_pessoa(p_token);
  select * into x from emp_anexos where id = p_id;
  select * into c from emp_conversas where id = x.conversa_id;
  if me.id is null or c.id is null or c.empresa_id <> me.empresa_id then return null; end if;
  if not (c.a = me.id or c.b = me.id or me.papel = 'gestor') then return null; end if;
  return jsonb_build_object('nome', x.nome, 'tipo', x.tipo, 'b64', encode(x.dados, 'base64'));
end $$;

-- abrir anexo: FC
create or replace function public.emp_chat_fc_anexo(p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare x emp_anexos;
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  select * into x from emp_anexos where id = p_id;
  if x.id is null then return null; end if;
  return jsonb_build_object('nome', x.nome, 'tipo', x.tipo, 'b64', encode(x.dados, 'base64'));
end $$;

-- mensagens passam a trazer o campo "anexo"
create or replace function public.emp_chat_msgs(p_token text, p_conversa uuid, p_desde bigint default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me emp_pessoas; c emp_conversas; part boolean; mx bigint;
begin
  me := emp_token_pessoa(p_token);
  select * into c from emp_conversas where id = p_conversa;
  if me.id is null or c.id is null or c.empresa_id <> me.empresa_id then return null; end if;
  part := c.a = me.id or c.b = me.id;
  if not part and me.papel <> 'gestor' then return null; end if;
  if part then
    select max(id) into mx from emp_msgs where conversa_id = c.id;
    if mx is not null then
      insert into emp_lidos(conversa_id, leitor, ultima_id) values (c.id, me.id::text, mx)
        on conflict (conversa_id, leitor) do update set ultima_id = greatest(emp_lidos.ultima_id, excluded.ultima_id);
    end if;
  end if;
  return jsonb_build_object('conversa', emp_conv_json(c, null), 'pode_escrever', part,
    'lido_outro', case when c.tipo = 'fc' then (select ultima_id from emp_lidos where conversa_id = c.id and leitor = 'fc')
                       else (select ultima_id from emp_lidos where conversa_id = c.id and leitor = (case when c.a = me.id then c.b else c.a end)::text) end,
    'msgs', coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'de',m.de,'nome',m.nome,'texto',m.texto,'em',m.em,'fc',m.de is null,'anexo',m.anexo) order by m.id)
      from emp_msgs m where m.conversa_id = c.id and m.id > coalesce(p_desde,0)), '[]'::jsonb));
end $$;

create or replace function public.emp_chat_fc_msgs(p_conversa uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c emp_conversas; mx bigint;
begin
  if not trein_is_admin() then raise exception 'sem permissão'; end if;
  select * into c from emp_conversas where id = p_conversa;
  if c.id is null then return null; end if;
  if c.tipo = 'fc' then
    select max(id) into mx from emp_msgs where conversa_id = c.id;
    if mx is not null then
      insert into emp_lidos(conversa_id, leitor, ultima_id) values (c.id, 'fc', mx)
        on conflict (conversa_id, leitor) do update set ultima_id = greatest(emp_lidos.ultima_id, excluded.ultima_id);
    end if;
  end if;
  return jsonb_build_object('conversa', emp_conv_json(c, null) || jsonb_build_object('emp', c.empresa_id), 'pode_escrever', c.tipo = 'fc',
    'lido_outro', (select ultima_id from emp_lidos where conversa_id = c.id and leitor = c.a::text),
    'msgs', coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'de',m.de,'nome',m.nome,'texto',m.texto,'em',m.em,'fc',m.de is null,'anexo',m.anexo) order by m.id)
      from emp_msgs m where m.conversa_id = c.id), '[]'::jsonb));
end $$;

revoke all on function public.emp_chat_enviar_anexo(text,uuid,text,text,text,text), public.emp_chat_fc_enviar_anexo(uuid,text,text,text,text),
  public.emp_chat_anexo(text,bigint), public.emp_chat_fc_anexo(bigint) from public;
grant execute on function public.emp_chat_enviar_anexo(text,uuid,text,text,text,text), public.emp_chat_fc_enviar_anexo(uuid,text,text,text,text),
  public.emp_chat_anexo(text,bigint), public.emp_chat_fc_anexo(bigint) to anon, authenticated;

-- Prévia "📎 nome" também na caixa Para responder (fc_caixa) e nos avisos (fc_avisos_novos):
-- aplicado com replace() na definição atual de cada função (migração emp_chat_anexos_previas).

-- ===== 29/10/2026 · migração emp_chat_fc_inclui_suporte =====
-- emp_chat_fc_msgs passa a devolver também 'sup': mensagens da aba Suporte técnico do Painel de Vendas (orc_sup)
-- da mesma pessoa (mesma empresa + mesmo nome em thr_nome), e marca essas mensagens como lidas ao abrir.
-- emp_chat_fc_sup_anexo(uuid): devolve o anexo do suporte (dados em data URL → base64) só para a FC.
