/* ===== Painel da Matriz · Convites para a vitrine de clientes =====
   A FC escolhe os clientes, gera um link de convite para cada um e acompanha:
   aberto → respondido (logo enviada e autorizada) → publicado na vitrine do mapa FC no Brasil. */
(function(){
  const URLC='https://fc-consultoria.github.io/treinamento/vitrine/convite.html?c=';
  const TT={o:'🧊 Mostruário 3D',on:'💻 Consultoria on-line',pr:'📍 Consultoria presencial'};
  const ST={aberto:['⏳ Aguardando','#5d6b76'],respondido:['🖼 Logo enviada · conferir','#b86a00'],publicado:['✔ Publicada','#1d7a45'],recusado:['↩ Pedimos outra logo','#a33'],cancelado:['Cancelado','#999']};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nk=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
  const tok=()=>{const a=new Uint8Array(18);crypto.getRandomValues(a);return [...a].map(b=>b.toString(16).padStart(2,'0')).join('');};
  const fD=t=>t?new Date(t).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
  const V={cv:[],cli:[],sel:new Set(),q:'',erro:false};
  const msgW=(c)=>`Olá, ${c.nome}! 👋\n\nA FC Consultoria tem o mapa *FC no Brasil*, no site e no Mostruário 3D, com a vitrine das empresas parceiras. Queremos colocar a logo da sua empresa lá, com a cidade. É gratuito e opcional.\n\nNo link abaixo você vê como fica e envia a logo em 1 minuto:\n🔗 ${URLC}${c.token}\n\nQualquer dúvida: FC Consultoria · (66) 9 9986-7984`;
  function aviso(t,ruim){const e=document.createElement('div');e.textContent=t;e.style.cssText=`position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:${ruim?'#b42318':'#1b232a'};color:#fff;padding:9px 16px;border-radius:99px;font:600 14px var(--f-body);z-index:9999`;document.body.appendChild(e);setTimeout(()=>e.remove(),3200);}
  async function carregar(){const el=document.getElementById('vcBox');if(!el)return;el.innerHTML='<p class="note">Carregando…</p>';
    const [cv,co]=await Promise.all([sb.from('vit_convite').select('*').order('criado_em',{ascending:false}),sb.from('rotina_docs').select('id,data').eq('col','consultoria')]);
    if(cv.error){V.erro=true;el.innerHTML='<p class="note" style="color:#a33">Falta rodar o SQL dos convites no Supabase (arquivo vitrine-convite.sql).</p>';return;}
    V.erro=false;V.cv=cv.data||[];
    const L=[],vis=new Set();const add=(nome,o)=>{const k=nk(nome);if(!k||vis.has(k))return;vis.add(k);L.push(Object.assign({nome},o));};
    (typeof ALUNOS!=='undefined'?ALUNOS:[]).filter(a=>!(typeof livre==='function'&&livre(a))).forEach(a=>add(a.nome||a.login,{uid:a.user_id,tipo:'o',orig:'Mostruário 3D'}));
    (co.data||[]).forEach(r=>{const d=r.data||{};if(d.nome)add(d.nome,{cons:r.id,tipo:'on',orig:'Consultoria'});});
    V.cli=L.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));window.VC_OK=typeof ALUNOS!=='undefined'&&ALUNOS.length>0;tela();}
  function ultimo(c){return V.cv.find(x=>x.status!=='cancelado'&&((c.uid&&x.uid===c.uid)||(c.cons&&x.cons_id===c.cons)||nk(x.nome)===nk(c.nome)));}
  function tela(){const el=document.getElementById('vcBox');if(!el||V.erro)return;
    const q=nk(V.q),L=V.cli.filter(c=>!q||nk(c.nome).includes(q));
    const resp=V.cv.filter(x=>x.status==='respondido').length;
    el.innerHTML=`<div style="display:grid;gap:14px;grid-template-columns:minmax(260px,360px) 1fr" class="vcG">
     <div style="border:1px solid var(--line);border-radius:10px;padding:12px;background:#fafcfd">
      <b>1. Escolha os clientes</b><input id="vcQ" value="${esc(V.q)}" placeholder="Buscar cliente…" style="width:100%;margin:8px 0">
      <div style="max-height:320px;overflow:auto;display:grid;gap:4px">${L.map(c=>{const u=ultimo(c),i=V.cli.indexOf(c);return `<label style="display:flex;gap:8px;align-items:center;font-size:14px;padding:4px 6px;border-radius:6px;background:${V.sel.has(i)?'#eef4ff':'transparent'}"><input type="checkbox" data-vcs="${i}"${V.sel.has(i)?' checked':''}> <span style="flex:1">${esc(c.nome)} <small class="note">· ${c.orig}</small></span>${u?`<small style="color:${ST[u.status][1]}">${ST[u.status][0].split(' ')[0]}</small>`:''}</label>`;}).join('')||'<p class="note">Nenhum cliente encontrado.</p>'}</div>
      <div style="display:flex;gap:6px;margin-top:8px"><input id="vcN" placeholder="Ou digite o nome de outro cliente" style="flex:1"><button type="button" id="vcAdd">＋</button></div>
      <label class="note" style="display:block;margin-top:8px">Atendimento que aparece na vitrine (para os marcados)<select id="vcT" style="width:100%"><option value="">Automático (Mostruário 3D ou on-line)</option>${Object.keys(TT).map(k=>`<option value="${k}">${TT[k]}</option>`).join('')}</select></label>
      <button type="button" class="pri" id="vcGer" style="width:100%;margin-top:10px"${V.sel.size?'':' disabled'}>2. Gerar convite${V.sel.size>1?'s':''} (${V.sel.size})</button>
      <p class="note" style="margin:8px 0 0">Cada cliente recebe um link próprio. Ele vê como a logo fica no mapa, envia e autoriza. Você confere e publica aqui.</p></div>
     <div><b>3. Convites enviados</b> <span class="note">· ${V.cv.filter(x=>x.status!=='cancelado').length} convite(s)${resp?` · <b style="color:#b86a00">${resp} para conferir</b>`:''}</span>
      <div style="display:grid;gap:8px;margin-top:8px">${V.cv.filter(x=>x.status!=='cancelado').map(x=>{const r=x.resposta||{},s=ST[x.status]||ST.aberto;return `<div style="border:1px solid ${x.status==='respondido'?'#e8912d':'var(--line)'};background:${x.status==='respondido'?'#fff7e8':'#fff'};border-radius:10px;padding:10px 12px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        ${r.img?`<img src="${r.img}" alt="" style="width:56px;height:56px;object-fit:contain;border:1px solid var(--line);border-radius:8px;background:#fff">`:'<div style="width:56px;height:56px;border:1px dashed var(--line);border-radius:8px;display:grid;place-items:center;color:#aab">🖼</div>'}
        <div style="flex:1;min-width:200px"><b>${esc(x.nome)}</b> <small class="note">· ${TT[x.tipo]||''}</small><br><small style="color:${s[1]};font-weight:700">${s[0]}</small> <small class="note">· criado ${fD(x.criado_em)}${x.aberto_em?' · abriu '+fD(x.aberto_em):' · ainda não abriu'}${x.resp_em?' · respondeu '+fD(x.resp_em):''}</small>${r.c?`<br><small>📍 ${esc(r.c)}/${esc(r.u)}${r.resp?' · autorizado por '+esc(r.resp):''}${r.tel?' · '+esc(r.tel):''}</small>`:''}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${x.status==='respondido'?`<button type="button" class="ok" data-vcpub="${x.token}">✅ Publicar na vitrine</button><button type="button" data-vcrec="${x.token}">↩ Pedir outra</button>`:''}
         <button type="button" data-vccp="${x.token}">📋 Copiar convite</button><button type="button" data-vcwa="${x.token}">💬 WhatsApp</button><button type="button" data-vcver="${x.token}">👁 Ver página</button>${x.status!=='publicado'?`<button type="button" class="no" data-vccx="${x.token}">Cancelar</button>`:''}</div></div>`;}).join('')||'<p class="note">Nenhum convite ainda. Escolha os clientes ao lado e gere os links.</p>'}</div></div></div>`;
    const q1=document.getElementById('vcQ');q1.oninput=()=>{V.q=q1.value;const p=q1.selectionStart;tela();const n=document.getElementById('vcQ');n.focus();n.setSelectionRange(p,p);};
    el.querySelectorAll('[data-vcs]').forEach(b=>b.onchange=()=>{const i=+b.dataset.vcs;if(b.checked)V.sel.add(i);else V.sel.delete(i);tela();});
    const nn=document.getElementById('vcN');document.getElementById('vcAdd').onclick=()=>{const n=nn.value.trim().replace(/\s+/g,' ');if(n.length<2)return;let i=V.cli.findIndex(c=>nk(c.nome)===nk(n));if(i<0){V.cli.push({nome:n,tipo:'on',orig:'Novo'});i=V.cli.length-1;}V.sel.add(i);V.q='';tela();};nn.onkeydown=e=>{if(e.key==='Enter')document.getElementById('vcAdd').click();};
    document.getElementById('vcGer').onclick=async e=>{const b=e.target,t=document.getElementById('vcT').value;b.disabled=true;b.textContent='Gerando…';
      const rows=[...V.sel].map(i=>V.cli[i]).map(c=>({token:tok(),nome:c.nome.slice(0,120),uid:c.uid||null,cons_id:c.cons||null,tipo:t||c.tipo||'on'}));
      const r=await sb.from('vit_convite').insert(rows);if(r.error){aviso('Não gerou: '+r.error.message,1);b.disabled=false;return;}
      V.sel.clear();aviso(rows.length+' convite(s) gerado(s). Copie ou envie pelo WhatsApp.');carregar();};
    const achar=t=>V.cv.find(x=>x.token===t);
    el.querySelectorAll('[data-vccp]').forEach(b=>b.onclick=async()=>{const t=msgW(achar(b.dataset.vccp));try{await navigator.clipboard.writeText(t);}catch(_){prompt('Copie a mensagem:',t);}b.textContent='✔ Copiado';setTimeout(()=>b.textContent='📋 Copiar convite',1800);});
    el.querySelectorAll('[data-vcwa]').forEach(b=>b.onclick=()=>window.open('https://wa.me/?text='+encodeURIComponent(msgW(achar(b.dataset.vcwa))),'_blank'));
    el.querySelectorAll('[data-vcver]').forEach(b=>b.onclick=()=>window.open(URLC+b.dataset.vcver,'_blank'));
    el.querySelectorAll('[data-vccx]').forEach(b=>b.onclick=async()=>{if(!confirm('Cancelar este convite? O link para de funcionar.'))return;b.disabled=true;await sb.from('vit_convite').update({status:'cancelado'}).eq('token',b.dataset.vccx);carregar();});
    el.querySelectorAll('[data-vcrec]').forEach(b=>b.onclick=async()=>{const m=prompt('Motivo (o cliente vê na página do convite):','A imagem ficou com baixa qualidade. Pode enviar a logo em melhor resolução?');if(m===null)return;b.disabled=true;await sb.from('vit_convite').update({status:'recusado',motivo:m.trim()||null}).eq('token',b.dataset.vcrec);carregar();});
    el.querySelectorAll('[data-vcpub]').forEach(b=>b.onclick=async()=>{const x=achar(b.dataset.vcpub),r=x.resposta||{};b.disabled=true;b.textContent='Publicando…';
      try{if(!MPD||!VIT)await mpCarregar();const id='cv'+x.token.slice(0,10);
        VIT=(VIT||[]).filter(y=>y.id!==id).concat([{id,img:r.img,c:r.c,u:r.u,t:x.tipo||'on'}]);
        await ins('vit_nome',{id,nome:r.nome||x.nome,aut:true,convite:x.token,resp:r.resp||null});EV.push({tipo:'vit_nome',criado_em:new Date().toISOString(),detalhe:{id,nome:r.nome||x.nome,aut:true}});
        await mpSalvar();await sb.from('vit_convite').update({status:'publicado'}).eq('token',x.token);try{mpRender();}catch(_){}
        aviso('✔ Logo publicada na vitrine de clientes.');carregar();}catch(err){aviso('Não publicou: '+(err.message||err),1);b.disabled=false;}});}
  window.vcLoad=carregar;
})();
