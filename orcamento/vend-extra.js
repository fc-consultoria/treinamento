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
  VX.wire=a=>{clearInterval(POLL);setTimeout(()=>{if(DST)pinta();},0);if(a==='sup')wireSup();else if(a==='fol')wireFol();};

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
    });
  async function envia(){const tx=document.getElementById('vxTx'),b=document.getElementById('vxEnv');const texto=tx.value.trim();if(!texto&&!ANX){toast('Escreva a mensagem ou anexe um print.');return;}
    let nm='';try{nm=localStorage.getItem('cons-nome')||'';}catch(_){}
    b.disabled=true;b.textContent='Enviando…';const r=await sb.rpc('orc_sup_enviar',{p_chave:key(),p_texto:texto||'',p_nome:nm||null,p_anexo_nome:ANX&&ANX.nome||null,p_anexo_tipo:ANX&&ANX.tipo||null,p_dados:ANX&&ANX.dados||null});
    b.disabled=false;b.textContent='📨 Enviar para a FC';if(r.error||!r.data){toast('Não enviou: '+((r.error&&r.error.message)||'tente de novo'));return;}
    tx.value='';ANX=null;document.getElementById('vxAnx').innerHTML='';await carregaMsgs();desenhaMsgs();toast('✓ Mensagem enviada para a FC');}
  /* aviso de resposta nova da FC (aba com contador) */
  VX.checar=async()=>{try{const L=await carregaMsgs();let s='';try{s=localStorage.getItem(seenK())||'';}catch(_){}const n=L.filter(m=>m.de==='fc'&&m.em>s).length;if(n!==NOVAS){NOVAS=n;if(typeof tela==='function'&&ABA!=='sup')tela();}}catch(_){}};

  let INI=false;VX.iniciar=()=>{if(INI||typeof DEMO!=='undefined'&&DEMO||typeof FC!=='undefined'&&FC||!VKEY)return;INI=true;flutuante();VX.checar();setInterval(()=>{if(document.visibilityState==='visible')VX.checar();},60000);};
  /* o script pode carregar depois da primeira tela: redesenha com as abas novas */
  setTimeout(()=>{try{if(typeof D!=='undefined'&&D&&typeof tela==='function'){tela();VX.iniciar();}}catch(_){}},0);
  /* ---------- 🎓 guia ---------- */
  function telaGui(){return `<div class="box"><h3 style="margin:0 0 6px">🎓 Guia de Treinamento</h3><p class="nota" style="margin:0 0 12px">Treinamento da FC Consultoria em esquadrias de alumínio, com as tipologias em 3D das linhas Suprema e Gold, para estudar e para mostrar ao cliente.</p>
   <div style="display:grid;gap:12px">
    <div class="vx-card"><span style="font-size:40px">🪟</span><div style="flex:1;min-width:240px"><b style="font-size:18px">FC Mostruário 3D · Esquadrias 3D</b><div class="nota">Gire, abra as folhas, desmonte e veja os cortes de cada tipologia; monte a esquadria e faça os desafios. Entre com o login e a senha que a FC liberou para você.</div></div><a class="btn pri" href="${BASE}" target="_blank" rel="noopener">Abrir o Mostruário 3D ↗</a></div>
    <div class="vx-card" style="align-items:stretch;flex-direction:column"><div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><span style="font-size:40px">📘</span><div style="flex:1;min-width:240px"><b style="font-size:18px">Guia de uso</b><div class="nota">Passo a passo de como usar o Mostruário.</div></div><a class="btn" href="${BASE}guia/" target="_blank" rel="noopener">Abrir em outra aba ↗</a></div>
     <iframe src="${BASE}guia/" title="Guia de uso do Mostruário" loading="lazy" style="width:100%;height:max(620px,70vh);border:1px solid var(--ln,#d8e2e6);border-radius:10px;background:#fff"></iframe></div>
    <div class="nota">Não tem login? Peça ao gestor da loja ou fale com a FC na aba 🛟 Suporte Técnico FC.</div></div></div>`;}

  /* ---------- 📣 folder · destaques um por vez (igual ao site da FC) ---------- */
  const catUrl=v=>v&&(v.dominio?'https://'+String(v.dominio).replace(/^https?:\/\//,'').replace(/\/$/,'')+'/':'https://fc-consultoria.github.io/catalogo/'+v.slug);
  const PIMG='https://fc-consultoria.github.io/perfis/img/',P3D='https://fc-consultoria.github.io/perfis/?ver=';
  let DST=null,DI=0,DT=null,DPAUSA=false;
  async function destaques(){if(DST)return DST;
    if(!VIT){try{const r=await sb.rpc('orc_vend_vitrine',{p_chave:key()});VIT=r.data||{};}catch(_){VIT={};}}
    let PF={};try{PF=(await fetch('../esquadrias/perfis.json?v=1').then(r=>r.json())).P||{};}catch(_){}
    const pf=c=>PF[c]||PF[Object.keys(PF).find(k=>k.split(' / ')[0]===c)];
    DST=((VIT.vit&&VIT.vit.it)||[]).map(x=>{if(x.k==='p'){const q=pf(x.c);return {k:'p',c:x.c,t:x.t||x.c,x:x.x||(q&&q.n)||'',img:q?PIMG+(q.d3?q.i:'c'+q.i)+'.webp':''};}
      if(x.k==='o'&&(x.t||x.img))return {k:'o',t:x.t||'Oferta',x:x.x||'',img:x.img||''};return null;}).filter(Boolean);
    VX._cu=VIT.slug?catUrl(VIT):'';return DST;}
  const segs=()=>Math.max(4,Math.min(12,+((VIT&&VIT.vit&&VIT.vit.seg)||6)));
  function cardDst(x,grande){return `<div class="vx-dst${grande?' gr':''}"><div class="vx-dh">📣 <span>Destaques · ${e((typeof D!=='undefined'&&D&&D.nome)||'')}</span>${grande?'':'<button type="button" data-vxd="min" title="Minimizar">–</button>'}</div>
    <div class="vx-di${x.k==='o'?' of':''}" style="${x.img?`background-image:url('${e(x.img)}')`:''}" data-vxd="ver">${x.img?'':`<div class="sx">${e(x.t)}</div>`}${x.k==='o'?'<span class="cvo">OFERTA</span>':''}</div>
    <div class="vx-dt"><b>${e(x.t)}</b><small>${e(x.x)}</small>
     <div class="vx-da">${x.k==='p'?`<button type="button" class="btn pri" data-vxd="ver">↻ Ver em 3D</button>`:''}${x.img?`<button type="button" class="btn${x.k==='o'?' pri':''}" data-vxd="copiar">📋 Copiar imagem</button>`:''}${grande&&x.img?'<button type="button" class="btn" data-vxd="baixar">⬇️ Baixar</button>':''}<button type="button" class="btn" style="background:#1f9d55;border-color:#1f9d55;color:#fff" data-vxd="zap">💬 WhatsApp</button></div></div>
    <div class="vx-dd">${grande?'<button type="button" data-vxd="ant" aria-label="Anterior">‹</button>':''}${DST.map((_,k)=>`<i class="${k===DI?'on':''}" data-vxd="ir" data-k="${k}"></i>`).join('')}${grande?'<button type="button" data-vxd="prox" aria-label="Próximo">›</button>':''}</div></div>`;}
  /* cabe na margem ao lado do painel? (igual ao site: só flutua onde não cobre o trabalho) */
  const margem=()=>{const m=document.querySelector('main');return m?m.getBoundingClientRect().left:0;};
  function pinta(){const g=document.getElementById('vxDstG');if(g&&DST&&DST.length)g.innerHTML=cardDst(DST[DI],true);
    const md=document.getElementById('vxDstM');if(md&&DST&&DST.length)md.firstElementChild.innerHTML=cardDst(DST[DI],false);
    const mg=margem(),cabe=mg-28>=210,f=document.getElementById('vxDstF');
    if(f){if(DST&&DST.length&&!g&&!mini()&&cabe){f.hidden=false;f.style.width=Math.min(300,mg-28)+'px';f.innerHTML=cardDst(DST[DI],false);}else f.hidden=true;}
    const tb=document.getElementById('vxDstT');if(tb){const x=DST&&DST[DI];tb.hidden=!(x&&!g&&!md&&(mini()||!cabe));if(x){tb.querySelector('.ti').style.backgroundImage=x.img?`url('${x.img}')`:'';tb.querySelector('small').textContent=x.t;}}}
  const mini=()=>{try{return sessionStorage.getItem('vx_dst_min')==='1';}catch(_){return false;}};
  function giro(){clearInterval(DT);DT=setInterval(()=>{if(DPAUSA||!DST||DST.length<2)return;DI=(DI+1)%DST.length;pinta();},segs()*1000);}
  /* janela flutuante em todas as abas (minimiza para um botão) */
  async function flutuante(){const L=await destaques();if(!L.length)return;
    if(!document.getElementById('vxDstF')){const f=document.createElement('div');f.id='vxDstF';f.className='vx-flt';f.hidden=true;f.onmouseenter=()=>DPAUSA=true;f.onmouseleave=()=>DPAUSA=false;document.body.appendChild(f);
      const t=document.createElement('button');t.type='button';t.id='vxDstT';t.className='vx-tab';t.hidden=true;t.innerHTML='<span class="ti"></span><span>📣 Destaques<small></small></span>';t.onclick=()=>{try{sessionStorage.removeItem('vx_dst_min');}catch(_){}if(margem()-28>=210){pinta();return;}
        /* tela sem margem: abre como janela por cima, fecha clicando fora */
        const m=document.createElement('div');m.id='vxDstM';m.className='vx-mod';m.innerHTML='<div style="width:min(360px,92vw)"></div>';m.onclick=ev=>{if(ev.target===m){m.remove();pinta();}};
        m.onmouseenter=()=>DPAUSA=true;m.onmouseleave=()=>DPAUSA=false;document.body.appendChild(m);pinta();};document.body.appendChild(t);addEventListener('resize',()=>{if(DST)pinta();});}
    pinta();giro();}
  VX.flutuante=flutuante;VX.pos=()=>{if(DST)pinta();};
  function telaFol(){return `<div class="box"><div class="row" style="margin-bottom:6px"><h3 style="margin:0;flex:1">📣 Folder de divulgação</h3></div><p class="nota" style="margin:0 0 12px">Os mesmos destaques que giram no catálogo da loja, um por vez. Use na conversa com o cliente que chegou pelo site: copie a imagem e cole na conversa, baixe ou mande pelo WhatsApp. Passe o mouse para pausar.</p><div id="vxDstG" class="vx-gw"><p class="nota">Carregando…</p></div><div id="vxCat"></div></div>`;}
  async function wireFol(){const L=await destaques();const g=document.getElementById('vxDstG');if(!g)return;
    if(!L.length){g.innerHTML=`<div class="vx-card"><span style="font-size:34px">🗂</span><div style="flex:1;min-width:240px"><b>Ainda não há destaques na vitrine do catálogo.</b><div class="nota">Quando a loja colocar perfis em destaque ou ofertas na vitrine do catálogo, eles aparecem aqui, um por vez.</div></div></div>`;return;}
    g.onmouseenter=()=>DPAUSA=true;g.onmouseleave=()=>DPAUSA=false;pinta();giro();
    const c=document.getElementById('vxCat');if(c&&VX._cu)c.innerHTML=`<div style="margin-top:12px"><a class="btn" href="${e(VX._cu)}" target="_blank" rel="noopener">📚 Abrir o catálogo da loja ↗</a></div>`;}
  document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-vxd]');if(!b||!DST)return;const a=b.dataset.vxd,x=DST[DI];
    if(a==='min'){try{sessionStorage.setItem('vx_dst_min','1');}catch(_){}const md=document.getElementById('vxDstM');if(md)md.remove();pinta();return;}
    if(a==='ir'){DI=+b.dataset.k;pinta();giro();return;}if(a==='prox'||a==='ant'){DI=(DI+(a==='prox'?1:DST.length-1))%DST.length;pinta();giro();return;}
    if(a==='ver'){if(x.k==='p')window.open(P3D+encodeURIComponent(x.c),'_blank');return;}
    acaoFolder(a,x);});
  async function acaoFolder(a,x){if(!x)return;
    if(a==='zap'){const t=`${x.k==='p'?x.c+' · ':''}${x.t===x.c?'':x.t}${x.x?(x.k==='p'?'':'\n')+x.x:''}${x.k==='p'?'\nVeja em 3D: '+P3D+encodeURIComponent(x.c):x.img?'\n'+x.img:''}${VX._cu?'\n\nCatálogo: '+VX._cu:''}`;window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank');return;}
    try{const b=await (await fetch(x.img,{mode:'cors'})).blob();
      if(a==='baixar'){const u=URL.createObjectURL(b);const l=document.createElement('a');l.href=u;l.download=(x.k==='p'?x.c:(x.t||'folder')).replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-')+'.'+((b.type.split('/')[1]||'jpg').replace('jpeg','jpg'));l.click();return;}
      const im=await createImageBitmap(b);const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const cx=c.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,c.width,c.height);cx.drawImage(im,0,0);const png=await new Promise(ok=>c.toBlob(ok,'image/png'));
      await navigator.clipboard.write([new ClipboardItem({'image/png':png})]);toast('✓ Imagem copiada: cole na conversa com Ctrl+V');}
    catch(_){if(a==='baixar'){window.open(x.img,'_blank');return;}toast('O navegador não deixou copiar: use ⬇️ Baixar e anexe na conversa.');}}
  {const k=document.createElement('style');k.textContent=`.vx-dst{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 14px 34px rgba(10,25,35,.22);display:flex;flex-direction:column}
  .vx-dh{background:#0f6b70;color:#fff;display:flex;align-items:center;gap:8px;padding:8px 12px;font:700 12.5px system-ui;letter-spacing:.06em;text-transform:uppercase}.vx-dh span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vx-dh button{all:unset;cursor:pointer;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.22);display:grid;place-items:center;font-weight:800}
  .vx-di{position:relative;aspect-ratio:16/10;background:#eef2f4 center/contain no-repeat;cursor:pointer;transition:background-image .3s}.vx-di.of{background-size:cover}.vx-di .sx{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:16px;color:#fff;font:800 20px/1.2 system-ui;background:linear-gradient(135deg,#0f6b70,#1b232a)}.vx-di .cvo{position:absolute;left:8px;top:8px;background:#e8912d;color:#fff;font:800 11px system-ui;border-radius:99px;padding:2px 8px}
  .vx-dt{padding:10px 12px}.vx-dt b{display:block;font-size:17px}.vx-dt small{display:block;color:#5d6b76;margin:2px 0 8px;min-height:18px}.vx-da{display:flex;gap:6px;flex-wrap:wrap}.vx-da .btn{padding:6px 10px;font-size:13px}
  .vx-dd{display:flex;gap:5px;justify-content:center;align-items:center;padding:0 0 10px}.vx-dd i{width:7px;height:7px;border-radius:50%;background:#d0d8de;cursor:pointer}.vx-dd i.on{background:#0f6b70}.vx-dd button{all:unset;cursor:pointer;font:800 22px system-ui;color:#0f6b70;padding:0 10px}
  .vx-gw{max-width:640px}.vx-dst.gr .vx-dt b{font-size:20px}
  .vx-flt{position:fixed;left:12px;top:50%;transform:translateY(-50%);z-index:900;width:290px}.vx-flt .vx-di{aspect-ratio:4/3}.vx-mod{position:fixed;inset:0;z-index:9990;background:rgba(8,16,22,.6);display:grid;place-items:center;padding:16px}
  .vx-tab{position:fixed;right:12px;bottom:12px;z-index:900;border:0;border-radius:14px;background:#0f6b70;color:#fff;font:700 12.5px/1.2 system-ui;padding:5px 12px 5px 5px;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.3);display:flex;align-items:center;gap:8px;max-width:240px;text-align:left}.vx-tab[hidden],.vx-flt[hidden]{display:none}.vx-tab .ti{width:44px;height:44px;flex:none;border-radius:9px;background:#fff center/contain no-repeat}.vx-tab small{display:block;font-weight:500;opacity:.88;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  @media print{.vx-flt,.vx-tab{display:none!important}}`;document.head.appendChild(k);}
})();
