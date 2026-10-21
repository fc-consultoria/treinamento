/* ===== Painel de Vendas · abas extras do vendedor e do gestor =====
   🛟 Suporte Técnico FC: conversa com a equipe da FC, com print e PDF (orc_sup_*).
   🎓 Guia de Treinamento: acesso ao FC Mostruário 3D (Esquadrias 3D) e ao guia de uso.
   📣 Folder de divulgação: as ofertas da vitrine do catálogo, para mandar ao cliente que veio pelo site. */
(function(){
  const VX={};window.VX=VX;
  const e=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const key=()=>VKEY;const seenK=()=>'fc_sup_visto_'+String(VKEY).slice(0,12);
  let MSG=null,ANX=null,POLL=null,NOVAS=0,VIT=null;
  const dt=v=>new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
  const css=`.vx-chat{display:flex;flex-direction:column;gap:8px;max-height:min(58vh,560px);overflow:auto;padding:10px;border:1px solid var(--ln,#d8e2e6);border-radius:12px;background:#f6f9f9}
  .vx-m{max-width:78%;padding:9px 12px;border-radius:12px;font-size:15px;line-height:1.4;white-space:pre-wrap;word-break:break-word}.vx-m small{display:block;font-size:11.5px;opacity:.7;margin-top:3px}
  .vx-m.v{align-self:flex-end;background:#0f6b70;color:#fff;border-bottom-right-radius:4px}.vx-m.fc{align-self:flex-start;background:#fff;border:1px solid #d8e2e6;border-bottom-left-radius:4px}
  .vx-m img{display:block;max-width:240px;max-height:200px;border-radius:8px;margin-top:6px;cursor:zoom-in;background:#fff}.vx-m .pdf{display:inline-block;margin-top:6px;padding:6px 10px;border-radius:8px;background:rgba(255,255,255,.18);border:1px solid currentColor;cursor:pointer;font-weight:700}
  .vx-cmp{display:flex;flex-direction:column;gap:8px;margin-top:10px}.vx-cmp textarea{width:100%;min-height:74px;border:1px solid #c4ccd2;border-radius:10px;padding:10px;font:500 15px inherit;resize:vertical;box-sizing:border-box}
  .vx-drop{border:2px dashed #0f6b70;border-radius:12px;background:#eef6f5;padding:10px 12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:14px;color:#3d5560}.vx-drop.on{background:#d9efec;border-color:#f2a51e}
  .vx-anx{display:flex;gap:8px;align-items:center;font-size:14px;font-weight:600}.vx-anx img{height:54px;border-radius:6px;border:1px solid #ccd}
  .vx-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}.vx-f{border:1px solid var(--ln,#d8e2e6);border-radius:14px;overflow:hidden;background:#fff;display:flex;flex-direction:column}
  .vx-f .im{aspect-ratio:4/5;background:#f2f5f4 center/contain no-repeat}.vx-f .bd{padding:10px 12px;display:flex;flex-direction:column;gap:6px;flex:1}.vx-f .ac{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto}
  .vx-lb{position:fixed;inset:0;z-index:9999;background:rgba(5,15,20,.85);display:flex;align-items:center;justify-content:center;padding:20px;cursor:zoom-out}.vx-lb img{max-width:96vw;max-height:92vh;border-radius:8px;background:#fff}
  .vx-card{border:1px solid var(--ln,#d8e2e6);border-radius:14px;padding:14px 16px;background:#fff;display:flex;gap:14px;align-items:center;flex-wrap:wrap}`;
  let cssOk=false;const st=()=>{if(cssOk)return;const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);cssOk=true;};
  VX.abas=()=>[['sup','🛟 Suporte Técnico FC'+(NOVAS?' ('+NOVAS+')':'')],['gui','🎓 Guia de Treinamento'],['fol','📣 Folder de divulgação']];
  VX.tem=a=>a==='sup'||a==='gui'||a==='fol';
  VX.tela=a=>{st();if(a==='sup')return telaSup();if(a==='gui')return telaGui();return telaFol();};
  VX.wire=a=>{clearInterval(POLL);if(a==='sup')wireSup();else if(a==='fol')wireFol();};

  /* ---------- 🛟 suporte ---------- */
  function telaSup(){return `<div class="box"><div class="row" style="margin-bottom:6px"><h3 style="margin:0;flex:1">🛟 Suporte Técnico FC</h3><span class="nota">Atendimento de segunda a sexta, 08:00–11:00 e 13:00–17:00</span></div>
   <p class="nota" style="margin:0 0 10px">Fale com a equipe da FC Consultoria: dúvida no painel, no orçamento, no estoque ou em um produto. Pode mandar print (cole com Ctrl+V) ou PDF.</p>
   <div class="vx-chat" id="vxChat"><p class="nota" style="margin:auto">Carregando a conversa…</p></div>
   <div class="vx-cmp"><textarea id="vxTx" placeholder="Escreva aqui a sua mensagem para a FC…"></textarea>
    <div class="vx-drop" id="vxDrop">📎 <span style="flex:1;min-width:200px">Anexe um <b>print</b> (Ctrl+V ou arraste aqui) ou um <b>PDF</b> (até 4 MB)</span><label class="btn" style="cursor:pointer">📁 Escolher arquivo<input type="file" id="vxF" accept="image/*,application/pdf" hidden></label></div>
    <div id="vxAnx"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn pri" id="vxEnv">📨 Enviar para a FC</button><a class="btn" style="background:#1f9d55;border-color:#1f9d55;color:#fff" target="_blank" rel="noopener" href="https://wa.me/5566999867984?text=${encodeURIComponent('Olá, FC! Sou do Painel de Vendas'+(D&&D.nome?' da '+D.nome:'')+' e mandei uma mensagem no Suporte Técnico.')}">💬 Avisar no WhatsApp</a></div></div></div>`;}
  async function carregaMsgs(){const r=await sb.rpc('orc_sup_msgs',{p_chave:key()});if(r.error)throw r.error;MSG=r.data||[];return MSG;}
  function desenhaMsgs(){const c=document.getElementById('vxChat');if(!c)return;
    if(!MSG||!MSG.length){c.innerHTML='<p class="nota" style="margin:auto;text-align:center">Nenhuma mensagem ainda.<br>Escreva abaixo: a FC responde aqui mesmo.</p>';return;}
    c.innerHTML=MSG.map(m=>`<div class="vx-m ${m.de==='fc'?'fc':'v'}">${m.de==='fc'?'<b>FC Consultoria</b>\n':''}${e(m.texto||'')}${m.anexo_nome?(/^image\//.test(m.anexo_tipo||'')?`<img data-vxim="${m.id}" alt="${e(m.anexo_nome)}">`:`<br><span class="pdf" data-vxpdf="${m.id}">📄 ${e(m.anexo_nome)}</span>`):''}<small>${m.de==='fc'?'':e(m.nome||'')+' · '}${dt(m.em)}</small></div>`).join('');
    c.scrollTop=c.scrollHeight;
    c.querySelectorAll('[data-vxim]').forEach(async im=>{const d=await anexo(im.dataset.vxim);if(d)im.src=d.dados;});
    const ult=MSG.filter(m=>m.de==='fc').map(m=>m.em).sort().pop();if(ult)try{localStorage.setItem(seenK(),ult);}catch(_){}NOVAS=0;}
  const CACHE={};async function anexo(id){if(CACHE[id])return CACHE[id];const r=await sb.rpc('orc_sup_anexo',{p_chave:key(),p_id:id});if(r.data)CACHE[id]=r.data;return r.data;}
  function prepara(f){const box=document.getElementById('vxAnx');if(!f||!box)return;
    if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)){if(f.size>4*1024*1024){toast('PDF grande demais (máx. 4 MB).');return;}const rd=new FileReader();rd.onload=()=>{ANX={nome:f.name,tipo:'application/pdf',dados:rd.result};box.innerHTML=`<div class="vx-anx">📄 ${e(f.name)} <button type="button" class="btn" data-vxrm>✕ Tirar</button></div>`;};rd.readAsDataURL(f);return;}
    if(!/^image\//.test(f.type)){toast('Mande imagem (print) ou PDF.');return;}
    const im=new Image();im.onload=()=>{const k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
      const d=c.toDataURL('image/jpeg',.82);ANX={nome:(f.name&&f.name!=='image.png'?f.name.replace(/\.\w+$/,''):'print')+'.jpg',tipo:'image/jpeg',dados:d};box.innerHTML=`<div class="vx-anx"><img src="${d}" alt=""> ${e(ANX.nome)} <button type="button" class="btn" data-vxrm>✕ Tirar</button></div>`;};
    im.src=URL.createObjectURL(f);}
  function wireSup(){ANX=null;carregaMsgs().then(desenhaMsgs).catch(()=>{const c=document.getElementById('vxChat');if(c)c.innerHTML='<p class="nota" style="margin:auto">Não foi possível carregar a conversa. Tente de novo.</p>';});
    POLL=setInterval(()=>{if(!document.getElementById('vxChat'))return clearInterval(POLL);const n=(MSG||[]).length;carregaMsgs().then(L=>{if(L.length!==n)desenhaMsgs();}).catch(()=>{});},15000);
    const f=document.getElementById('vxF');if(f)f.onchange=()=>{if(f.files[0])prepara(f.files[0]);f.value='';};
    const dz=document.getElementById('vxDrop');if(dz){dz.ondragover=ev=>{ev.preventDefault();dz.classList.add('on');};dz.ondragleave=()=>dz.classList.remove('on');dz.ondrop=ev=>{ev.preventDefault();dz.classList.remove('on');const x=ev.dataTransfer.files[0];if(x)prepara(x);};}
    document.getElementById('vxEnv').onclick=envia;}
  document.addEventListener('paste',ev=>{if(!document.getElementById('vxChat'))return;const it=[...((ev.clipboardData||{}).items||[])].find(i=>i.kind==='file'&&(/^image\//.test(i.type)||/pdf$/.test(i.type)));if(!it)return;ev.preventDefault();prepara(it.getAsFile());});
  document.addEventListener('click',async ev=>{const t=ev.target;
    if(t.closest&&t.closest('[data-vxrm]')){ANX=null;document.getElementById('vxAnx').innerHTML='';return;}
    const im=t.closest&&t.closest('[data-vxim]');if(im&&im.src){const o=document.createElement('div');o.className='vx-lb';o.innerHTML=`<img src="${im.src}" alt="">`;o.onclick=()=>o.remove();document.body.appendChild(o);return;}
    const pf=t.closest&&t.closest('[data-vxpdf]');if(pf){const d=await anexo(pf.dataset.vxpdf);if(!d)return;const b=await (await fetch(d.dados)).blob();window.open(URL.createObjectURL(b),'_blank');return;}
    const fo=t.closest&&t.closest('[data-vxfo]');if(fo)acaoFolder(fo.dataset.vxfo,+fo.dataset.i);});
  async function envia(){const tx=document.getElementById('vxTx'),b=document.getElementById('vxEnv');const texto=tx.value.trim();if(!texto&&!ANX){toast('Escreva a mensagem ou anexe um print.');return;}
    let nm='';try{nm=localStorage.getItem('cons-nome')||'';}catch(_){}
    b.disabled=true;b.textContent='Enviando…';const r=await sb.rpc('orc_sup_enviar',{p_chave:key(),p_texto:texto||'',p_nome:nm||null,p_anexo_nome:ANX&&ANX.nome||null,p_anexo_tipo:ANX&&ANX.tipo||null,p_dados:ANX&&ANX.dados||null});
    b.disabled=false;b.textContent='📨 Enviar para a FC';if(r.error||!r.data){toast('Não enviou: '+((r.error&&r.error.message)||'tente de novo'));return;}
    tx.value='';ANX=null;document.getElementById('vxAnx').innerHTML='';await carregaMsgs();desenhaMsgs();toast('✓ Mensagem enviada para a FC');}
  /* aviso de resposta nova da FC (aba com contador) */
  VX.checar=async()=>{try{const L=await carregaMsgs();let s='';try{s=localStorage.getItem(seenK())||'';}catch(_){}const n=L.filter(m=>m.de==='fc'&&m.em>s).length;if(n!==NOVAS){NOVAS=n;if(typeof tela==='function'&&ABA!=='sup')tela();}}catch(_){}};

  let INI=false;VX.iniciar=()=>{if(INI||typeof DEMO!=='undefined'&&DEMO||typeof FC!=='undefined'&&FC||!VKEY)return;INI=true;VX.checar();setInterval(()=>{if(document.visibilityState==='visible')VX.checar();},60000);};
  /* o script pode carregar depois da primeira tela: redesenha com as abas novas */
  setTimeout(()=>{try{if(typeof D!=='undefined'&&D&&typeof tela==='function'){tela();VX.iniciar();}}catch(_){}},0);
  /* ---------- 🎓 guia ---------- */
  function telaGui(){return `<div class="box"><h3 style="margin:0 0 6px">🎓 Guia de Treinamento</h3><p class="nota" style="margin:0 0 12px">Treinamento da FC Consultoria em esquadrias de alumínio, com as tipologias em 3D das linhas Suprema e Gold, para estudar e para mostrar ao cliente.</p>
   <div style="display:grid;gap:12px">
    <div class="vx-card"><span style="font-size:40px">🪟</span><div style="flex:1;min-width:240px"><b style="font-size:18px">FC Mostruário 3D · Esquadrias 3D</b><div class="nota">Gire, abra as folhas, desmonte e veja os cortes de cada tipologia; monte a esquadria e faça os desafios. Entre com o login e a senha que a FC liberou para você.</div></div><a class="btn pri" href="${BASE}" target="_blank" rel="noopener">Abrir o Mostruário 3D ↗</a></div>
    <div class="vx-card" style="align-items:stretch;flex-direction:column"><div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><span style="font-size:40px">📘</span><div style="flex:1;min-width:240px"><b style="font-size:18px">Guia de uso</b><div class="nota">Passo a passo de como usar o Mostruário.</div></div><a class="btn" href="${BASE}guia/" target="_blank" rel="noopener">Abrir em outra aba ↗</a></div>
     <iframe src="${BASE}guia/" title="Guia de uso do Mostruário" loading="lazy" style="width:100%;height:max(620px,70vh);border:1px solid var(--ln,#d8e2e6);border-radius:10px;background:#fff"></iframe></div>
    <div class="nota">Não tem login? Peça ao gestor da loja ou fale com a FC na aba 🛟 Suporte Técnico FC.</div></div></div>`;}

  /* ---------- 📣 folder ---------- */
  const catUrl=v=>v&&(v.dominio?'https://'+String(v.dominio).replace(/^https?:\/\//,'').replace(/\/$/,'')+'/':'https://fc-consultoria.github.io/catalogo/'+v.slug);
  function telaFol(){return `<div class="box"><div class="row" style="margin-bottom:6px"><h3 style="margin:0;flex:1">📣 Folder de divulgação</h3></div><p class="nota" style="margin:0 0 12px">As mesmas ofertas que aparecem em destaque no catálogo da loja. Use na conversa com o cliente que chegou pelo site: copie a imagem e cole na conversa, baixe ou mande pelo WhatsApp.</p><div id="vxFol"><p class="nota">Carregando…</p></div></div>`;}
  async function wireFol(){const box=document.getElementById('vxFol');if(!box)return;
    if(!VIT){const r=await sb.rpc('orc_vend_vitrine',{p_chave:key()});VIT=r.data||{};}
    const it=((VIT.vit&&VIT.vit.it)||[]).filter(x=>x.k==='o'&&(x.img||x.t));const pf=((VIT.vit&&VIT.vit.it)||[]).filter(x=>x.k==='p');const cu=VIT.slug?catUrl(VIT):'';
    box.innerHTML=(it.length?`<div class="vx-g">${it.map((x,i)=>`<div class="vx-f"><div class="im" style="${x.img?`background-image:url('${e(x.img)}')`:''}">${x.img?'':'<div style="display:grid;place-items:center;height:100%;font-size:40px">📣</div>'}</div><div class="bd"><b>${e(x.t||'Oferta')}</b>${x.x?`<span class="nota">${e(x.x)}</span>`:''}
      <div class="ac">${x.img?`<button type="button" class="btn pri" data-vxfo="copiar" data-i="${i}">📋 Copiar imagem</button><button type="button" class="btn" data-vxfo="baixar" data-i="${i}">⬇️ Baixar</button>`:''}<button type="button" class="btn" style="background:#1f9d55;border-color:#1f9d55;color:#fff" data-vxfo="zap" data-i="${i}">💬 WhatsApp</button></div></div></div>`).join('')}</div>`
      :`<div class="vx-card"><span style="font-size:34px">🗂</span><div style="flex:1;min-width:240px"><b>Ainda não há folder na vitrine do catálogo.</b><div class="nota">Quando a loja cadastrar uma oferta na vitrine do catálogo, ela aparece aqui para você usar com o cliente.</div></div></div>`)
      +(pf.length?`<p class="nota" style="margin:12px 0 4px"><b>Perfis em destaque no catálogo:</b> ${pf.map(x=>e(x.c)).join(' · ')}</p>`:'')
      +(cu?`<div style="margin-top:10px"><a class="btn" href="${e(cu)}" target="_blank" rel="noopener">📚 Abrir o catálogo da loja ↗</a></div>`:'');
    VX._it=it;VX._cu=cu;}
  async function acaoFolder(a,i){const x=(VX._it||[])[i];if(!x)return;
    if(a==='zap'){const t=`${x.t||'Oferta'}${x.x?'\n'+x.x:''}${x.img?'\n'+x.img:''}${VX._cu?'\n\nVeja o catálogo: '+VX._cu:''}`;window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank');return;}
    try{const b=await (await fetch(x.img,{mode:'cors'})).blob();
      if(a==='baixar'){const u=URL.createObjectURL(b);const l=document.createElement('a');l.href=u;l.download=(x.t||'folder').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-')+'.'+((b.type.split('/')[1]||'jpg').replace('jpeg','jpg'));l.click();return;}
      let png=b;if(b.type!=='image/png'){const im=await createImageBitmap(b);const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d').drawImage(im,0,0);png=await new Promise(ok=>c.toBlob(ok,'image/png'));}
      await navigator.clipboard.write([new ClipboardItem({'image/png':png})]);toast('✓ Imagem copiada: cole na conversa com Ctrl+V');}
    catch(_){if(a==='baixar'){window.open(x.img,'_blank');return;}toast('O navegador não deixou copiar: use ⬇️ Baixar e anexe na conversa.');}}
})();
