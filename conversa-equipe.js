/* ===== Conversa da equipe (Matriz ⇄ equipe) dentro do Painel de Implantação =====
   Botão 💬 no canto. Texto e imagem (anexar, ou colar com Ctrl+V). Aviso de mensagem nova com número no botão. */
(function(){
  if(typeof sb==='undefined') return;
  const S = {aberto:false, msgs:[], eu:'', nome:'', ultimaId:0, ok:true, img:null, carregando:false};
  const MARCA = '[[FC_ATUALIZAR]]';   // aviso "atualize o painel" que a matriz dispara (não aparece na conversa)
  const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lidoKey = ()=>'fc_chat_lido_'+S.eu;
  const lido = ()=>{ try{ return Number(localStorage.getItem(lidoKey())||0); }catch(_){ return 0; } };
  const marcarLido = ()=>{ const m = S.msgs[S.msgs.length-1]; if(m){ try{ localStorage.setItem(lidoKey(), String(m.id)); }catch(_){ } } badge(); };
  const hora = d=>{ const x=new Date(d), h=new Date(); const mesmoDia = x.toDateString()===h.toDateString(); return (mesmoDia?'':x.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' ')+x.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); };
  function linkify(t){ return esc(t).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\n/g,'<br>'); }

  let btn, box, lista, txt, prev, fileInp;
  const tam = ()=>{ try{ return JSON.parse(localStorage.getItem('fc_chat_tam')||'{}'); }catch(_){ return {}; } };
  const salvaTam = o=>{ try{ localStorage.setItem('fc_chat_tam', JSON.stringify(o)); }catch(_){ } };
  function aplicaTam(){ if(!box) return; const t=tam(); if(t.g){ box.style.width='min(760px,calc(100vw - 28px))'; box.style.height='calc(100vh - 140px)'; } else if(t.w){ box.style.width=Math.min(t.w,innerWidth-28)+'px'; box.style.height=Math.min(t.h,innerHeight-130)+'px'; } else { box.style.width=''; box.style.height=''; } }
  let aba=null;
  function ocultar(on){ try{ localStorage.setItem('fc_chat_oculto', on?'1':''); }catch(_){ }
    if(on){ if(btn) btn.style.display='none'; if(!aba){ aba=document.createElement('button'); aba.type='button'; aba.className='fcchat-aba'; aba.title='Mostrar a conversa da equipe'; aba.innerHTML='💬<span class="fcchat-badge" style="display:none"></span>'; aba.onclick=()=>ocultar(false); document.body.appendChild(aba); } aba.style.display='block'; }
    else { if(aba) aba.style.display='none'; if(btn) btn.style.display=''; } }

  function montar(){
    if(btn) return;
    const st = document.createElement('style'); st.textContent = `
      .fcchat-grip{position:absolute;left:0;top:0;width:18px;height:18px;cursor:nwse-resize;z-index:2;background:linear-gradient(135deg,rgba(255,255,255,.85) 0 2px,transparent 2px 5px,rgba(255,255,255,.85) 5px 7px,transparent 7px)}
      .fcchat-aba{position:fixed;right:0;bottom:120px;z-index:9998;width:30px;height:44px;border:0;border-radius:10px 0 0 10px;cursor:pointer;color:#fff;font-size:15px;background:linear-gradient(135deg,var(--g1,var(--accent,#3452eb)),var(--g2,var(--accent,#3452eb)));box-shadow:0 6px 16px -6px rgba(0,0,0,.45)}
      .fcchat-aba .fcchat-badge{top:-6px;right:auto;left:-8px}
      .fcchat-btn{position:fixed;right:14px;bottom:60px;z-index:9998;width:46px;height:46px;border-radius:50%;border:0;cursor:pointer;color:#fff;font-size:21px;
        background:linear-gradient(135deg,var(--g1,var(--accent,#3452eb)),var(--g2,var(--accent,#3452eb)));box-shadow:0 8px 22px -8px rgba(0,0,0,.45);}
      .fcchat-badge{position:absolute;top:-4px;right:-4px;min-width:19px;height:19px;padding:0 5px;border-radius:10px;background:#e11d48;color:#fff;font:700 11px/19px system-ui;text-align:center;border:2px solid #fff}
      .fcchat-box{position:fixed;right:14px;bottom:114px;z-index:9999;width:min(370px,calc(100vw - 28px));height:min(540px,calc(100vh - 140px));display:none;flex-direction:column;
        background:#fff;border:1px solid #dde1e6;border-radius:16px;box-shadow:0 18px 50px -12px rgba(15,23,42,.35);overflow:hidden;font:400 14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;color:#1c2126}
      .fcchat-head{padding:12px 14px;color:#fff;background:linear-gradient(135deg,var(--g1,var(--accent,#3452eb)),var(--g2,var(--accent,#3452eb)));display:flex;align-items:center;gap:10px}
      .fcchat-list{flex:1;overflow:auto;padding:12px;background:#f5f7fa;display:flex;flex-direction:column;gap:8px}
      .fcchat-m{max-width:82%;padding:8px 11px;border-radius:14px;background:#fff;border:1px solid #e6e9ee;align-self:flex-start;word-wrap:break-word}
      .fcchat-m.eu{align-self:flex-end;background:var(--accent-2,#eef1ff);border-color:transparent}
      .fcchat-m img{display:block;max-width:100%;border-radius:10px;margin:4px 0;cursor:zoom-in}
      .fcchat-meta{font-size:11px;color:#8a929c;margin-top:2px}
      .fcchat-foot{border-top:1px solid #e6e9ee;padding:8px;display:flex;gap:6px;align-items:flex-end;background:#fff}
      .fcchat-foot textarea{flex:1;resize:none;border:1px solid #dde1e6;border-radius:12px;padding:8px 10px;font:400 14px system-ui;max-height:110px;min-height:38px}
      .fcchat-ico{width:38px;height:38px;border-radius:50%;border:1px solid #dde1e6;background:#fff;cursor:pointer;font-size:17px;flex-shrink:0}
      .fcchat-send{border:0;color:#fff;background:linear-gradient(135deg,var(--g1,var(--accent,#3452eb)),var(--g2,var(--accent,#3452eb)))}
      .fcchat-prev{padding:6px 10px;border-top:1px solid #e6e9ee;display:none;align-items:center;gap:8px;background:#fafbfc;font-size:12px}
      .fcchat-e{border:0;background:none;font-size:26px;width:44px;height:44px;border-radius:10px;cursor:pointer;transition:transform .12s ease, background .12s;position:relative}
      .fcchat-e:hover,.fcchat-e:focus-visible{transform:scale(1.9);background:#fff;box-shadow:0 6px 18px rgba(0,0,0,.18);z-index:2}
      .fcchat-emojis{padding:12px !important;max-height:190px !important}
      .fcchat-zoom{position:fixed;inset:0;z-index:10000;background:rgba(10,14,20,.85);display:grid;place-items:center;cursor:zoom-out}
      .fcchat-zoom img{max-width:94vw;max-height:92vh;border-radius:10px}`;
    document.head.appendChild(st);
    btn = document.createElement('button'); btn.type='button'; btn.className='fcchat-btn'; btn.title='Conversa da equipe'; btn.innerHTML='💬<span class="fcchat-badge" style="display:none"></span>';
    box = document.createElement('div'); box.className='fcchat-box';
    box.innerHTML = `<div class="fcchat-head"><div style="font-size:20px">💬</div><div style="flex:1"><div style="font-weight:700">Conversa da equipe</div><div style="font-size:12px;opacity:.9">Matriz e equipe · texto e imagem</div></div>${/\/implantacao\//.test(location.pathname)?'':'<button type="button" data-atu title="Mandar para a equipe o aviso de atualizar o Painel de Implantação" style="background:rgba(255,255,255,.2);border:0;color:#fff;height:30px;border-radius:15px;padding:0 10px;cursor:pointer;font:700 12px system-ui;white-space:nowrap">📣 Pedir atualização</button>'}<button type="button" data-max title="Aumentar / diminuir a conversa" style="background:rgba(255,255,255,.2);border:0;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:15px">⤢</button><button type="button" data-ocultar title="Ocultar a conversa (fica só uma aba no canto da tela)" style="background:rgba(255,255,255,.2);border:0;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:15px">▁</button><button type="button" data-x style="background:rgba(255,255,255,.2);border:0;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px">✕</button></div><div class="fcchat-grip" title="Arraste para aumentar ou diminuir"></div>
      <div class="fcchat-list"></div>
      <div class="fcchat-prev"><img style="width:44px;height:44px;object-fit:cover;border-radius:8px"><span style="flex:1">Imagem pronta para enviar</span><button type="button" data-tirar style="border:0;background:none;cursor:pointer;color:#b42318;font-weight:600">remover</button></div>
      <div class="fcchat-emojis" style="display:none;flex-wrap:wrap;gap:2px;padding:8px;border-top:1px solid #e6e9ee;background:#fff;max-height:150px;overflow:auto"></div><div class="fcchat-foot"><button type="button" class="fcchat-ico" data-anexo title="Anexar imagem">📎</button><button type="button" class="fcchat-ico" data-emoji title="Emoji">😊</button><input type="file" accept="image/*" hidden><textarea rows="1" placeholder="Escreva uma mensagem…" title="Enter envia · Shift+Enter quebra linha · Ctrl+V cola print"></textarea><button type="button" class="fcchat-ico fcchat-send" data-enviar title="Enviar">➤</button></div>`;
    document.body.appendChild(box);aplicaTam(); document.body.appendChild(btn); try{ if(localStorage.getItem('fc_chat_oculto')) ocultar(true); }catch(_){ }
    lista = box.querySelector('.fcchat-list'); txt = box.querySelector('textarea'); prev = box.querySelector('.fcchat-prev'); fileInp = box.querySelector('input[type=file]');
    btn.onclick = ()=>{ S.aberto = !S.aberto; box.style.display = S.aberto?'flex':'none'; if(S.aberto){ desenhar(true); marcarLido(); setTimeout(()=>txt.focus(),50); } };
    const ba = box.querySelector('[data-atu]'); if(ba) ba.onclick = async ()=>{
      if(!confirm('Mandar para a equipe o aviso de atualizar o Painel de Implantação?')) return;
      ba.disabled=true; const {error} = await sb.from('impl_chat').insert({texto:MARCA, autor_nome:S.nome||'Matriz'});
      ba.disabled=false; const ok=!error; const msg = ok?'📣 Aviso de atualização enviado para a equipe':'Não consegui enviar o aviso: '+(error.message||'');
      if(typeof toast==='function') toast(msg); else alert(msg);
    };
    box.querySelector('[data-x]').onclick = ()=>{ S.aberto=false; box.style.display='none'; };
    box.querySelector('[data-max]').onclick = ()=>{ const t=tam(); const g=!t.g; salvaTam(g?{g:true,w:t.w,h:t.h}:{w:t.w,h:t.h}); aplicaTam(); };
    box.querySelector('[data-ocultar]').onclick = ()=>{ S.aberto=false; box.style.display='none'; ocultar(true); };
    const grip=box.querySelector('.fcchat-grip');
    grip.onpointerdown = e=>{ e.preventDefault(); grip.setPointerCapture(e.pointerId); const r=box.getBoundingClientRect(),x0=e.clientX,y0=e.clientY;
      grip.onpointermove = ev=>{ const w=Math.max(300,Math.min(innerWidth-28,r.width+(x0-ev.clientX))),h=Math.max(320,Math.min(innerHeight-130,r.height+(y0-ev.clientY))); box.style.width=w+'px'; box.style.height=h+'px'; };
      grip.onpointerup = ()=>{ grip.onpointermove=null; const r2=box.getBoundingClientRect(); salvaTam({w:Math.round(r2.width),h:Math.round(r2.height)}); }; };
    box.querySelector('[data-anexo]').onclick = ()=>fileInp.click();
    fileInp.onchange = ()=>{ const f=fileInp.files&&fileInp.files[0]; fileInp.value=''; if(f) prepararImagem(f); };
    box.querySelector('[data-tirar]').onclick = ()=>{ S.img=null; prev.style.display='none'; };
    box.querySelector('[data-enviar]').onclick = enviar;
    const EMO='😊 😀 😁 😂 🤣 😅 😉 😍 🥰 😘 😎 🤩 🤔 😐 😕 😢 😭 😡 🙏 👍 👎 👏 🙌 💪 👋 🤝 👀 ✅ ❌ ⚠️ ❓ ❗ 💡 🔥 ⭐ 🎉 🎯 🚀 ⏰ 📌 📎 📷 📝 📊 💰 🏠 🪟 🚪 🔧 🛠️ 📦 ☕ ❤️ 💙 💚 💜 🧡 💛'.split(' ');
    const emoBox = box.querySelector('.fcchat-emojis');
    emoBox.innerHTML = EMO.map(e=>`<button type="button" data-e="${e}" class="fcchat-e">${e}</button>`).join('');
    emoBox.addEventListener('click', e=>{ const b=e.target.closest('[data-e]'); if(!b) return; const a=txt.selectionStart??txt.value.length, z=txt.selectionEnd??txt.value.length; txt.value = txt.value.slice(0,a)+b.dataset.e+txt.value.slice(z); const p=a+b.dataset.e.length; txt.focus(); txt.setSelectionRange(p,p); });
    box.querySelector('[data-emoji]').onclick = ()=>{ emoBox.style.display = emoBox.style.display==='none' ? 'flex' : 'none'; };
    txt.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); enviar(); } });
    txt.addEventListener('input', ()=>{ txt.style.height='auto'; txt.style.height=Math.min(110,txt.scrollHeight)+'px'; });
    txt.addEventListener('paste', e=>{ const it=[...(e.clipboardData&&e.clipboardData.items||[])].find(i=>i.type.startsWith('image/')); if(it){ e.preventDefault(); prepararImagem(it.getAsFile()); } });
    lista.addEventListener('click', e=>{ const im=e.target.closest('img[data-full]'); if(!im) return; const z=document.createElement('div'); z.className='fcchat-zoom'; z.innerHTML='<img src="'+im.src+'">'; z.onclick=()=>z.remove(); document.body.appendChild(z); });
  }
  function prepararImagem(f){
    if(!f || !/^image\//.test(f.type)) return;
    const r = new FileReader(); r.onload = ()=>{ const im = new Image(); im.onload = ()=>{
      const max=1400, k=Math.min(1, max/Math.max(im.width, im.height)); const c=document.createElement('canvas'); c.width=Math.round(im.width*k); c.height=Math.round(im.height*k);
      c.getContext('2d').drawImage(im,0,0,c.width,c.height); S.img = c.toDataURL('image/jpeg', 0.82);
      prev.querySelector('img').src = S.img; prev.style.display='flex'; txt.focus(); }; im.src = r.result; }; r.readAsDataURL(f);
  }
  async function enviar(){
    const t = txt.value.trim(); if(!t && !S.img) return;
    const corpo = {autor_nome:S.nome||null, texto:t||null, imagem:S.img||null};
    txt.value=''; txt.style.height='auto'; S.img=null; prev.style.display='none'; const eb=box.querySelector('.fcchat-emojis'); if(eb) eb.style.display='none';
    const {data, error} = await sb.from('impl_chat').insert(corpo).select().single();
    if(error){ alert('Não foi possível enviar: '+error.message); return; }
    if(data && !S.msgs.some(m=>m.id===data.id)){ S.msgs.push(data); S.ultimaId=Math.max(S.ultimaId,data.id); }
    desenhar(true); marcarLido();
  }
  function desenhar(rolar){
    if(!lista) return;
    if(!S.msgs.length){ lista.innerHTML = '<div style="margin:auto;text-align:center;color:#8a929c;font-size:13px;padding:20px">Nenhuma mensagem ainda.<br>Escreva aqui ou cole um print (Ctrl+V) para explicar algo.</div>'; return; }
    let dia = '';
    lista.innerHTML = S.msgs.map(m=>{ const d = new Date(m.criado_em).toLocaleDateString('pt-BR',{weekday:'long', day:'2-digit', month:'2-digit'}); const sep = d!==dia ? (dia=d, `<div style="align-self:center;font-size:11px;color:#8a929c;background:#e9edf2;padding:2px 10px;border-radius:10px">${esc(d)}</div>`) : '';
      const eu = String(m.autor_email||'').toLowerCase()===S.eu;
      return sep+`<div class="fcchat-m ${eu?'eu':''}">${eu?'':`<div style="font-size:12px;font-weight:700;color:var(--accent-dark,#22348f)">${esc(m.autor_nome||m.autor_email)}</div>`}${m.imagem?`<img data-full src="${m.imagem}" alt="imagem">`:''}${m.texto?`<div>${linkify(m.texto)}</div>`:''}<div class="fcchat-meta">${hora(m.criado_em)}</div></div>`; }).join('');
    if(rolar) lista.scrollTop = lista.scrollHeight;
  }
  function badge(){
    if(!btn) return; const l = lido(); const n = S.msgs.filter(m=>m.id>l && String(m.autor_email||'').toLowerCase()!==S.eu).length;
    const b = btn.querySelector('.fcchat-badge'); b.style.display = n?'block':'none'; b.textContent = n>9?'9+':n; if(aba){ const b2=aba.querySelector('.fcchat-badge'); b2.style.display=n?'block':'none'; b2.textContent=n>9?'9+':n; }
    document.querySelectorAll('.fcchat-count').forEach(e=>{ e.style.display = n?'inline-block':'none'; e.textContent = n>9?'9+':n; });
  }
  function avisar(m){
    try{ const k='fc_chat_avisado'; if(Number(localStorage.getItem(k)||0)>=m.id){ return; } localStorage.setItem(k,String(m.id)); }catch(_){ }
    try{ if(typeof toast==='function' && !S.aberto) toast('💬 '+(m.autor_nome||'Equipe')+': '+(m.texto? String(m.texto).slice(0,80) : '📷 imagem')); }catch(_){ }
    try{ const c=new (window.AudioContext||window.webkitAudioContext)(), o=c.createOscillator(), g=c.createGain(); o.frequency.value=880; g.gain.value=.06; o.connect(g); g.connect(c.destination); o.start(); setTimeout(()=>{o.frequency.value=1175;},120); setTimeout(()=>{o.stop(); c.close();},260); }catch(_){ }
    try{ if('Notification' in window && Notification.permission==='granted' && (document.hidden || !document.hasFocus() || !S.aberto)){
      const n = new Notification('💬 '+(m.autor_nome||'Equipe FC')+' mandou mensagem', {body: (m.texto ? String(m.texto).slice(0,140) : '📷 Imagem'), tag:'fcchat-'+m.id, requireInteraction:true, icon: m.imagem && m.imagem.length<200000 ? m.imagem : undefined});
      n.onclick = ()=>{ try{ window.focus(); }catch(_){ } n.close(); if(!S.aberto && btn) btn.click(); };
    } }catch(_){ }
    piscarTitulo();
  }
  // título da aba piscando com o número de mensagens novas (aparece na barra de abas e na barra de tarefas)
  let tituloOrig = document.title, piscaT = null;
  function piscarTitulo(){
    if(piscaT) return; tituloOrig = document.title; let on = false;
    piscaT = setInterval(()=>{ const n = naoLidas(); if(!n || (document.hasFocus() && S.aberto)){ clearInterval(piscaT); piscaT=null; document.title = tituloOrig; return; } on=!on; document.title = on ? '('+n+') 💬 Nova mensagem' : tituloOrig; }, 1000);
  }
  function naoLidas(){ const l = lido(); return S.msgs.filter(m=>m.id>l && String(m.autor_email||'').toLowerCase()!==S.eu).length; }
  // pede uma vez para o navegador liberar os avisos do Windows (só precisa aceitar 1 vez)
  function pedirAvisos(){
    try{ if(!('Notification' in window) || Notification.permission!=='default' || localStorage.getItem('fc_chat_pediu_aviso') || document.getElementById('fcAvisoPede')) return; }catch(_){ return; }
    const d=document.createElement('div'); d.id='fcAvisoPede';
    d.style.cssText='position:fixed;right:14px;bottom:118px;z-index:9999;width:min(330px,calc(100vw - 28px));background:#fff;border:1px solid #dde1e6;border-radius:14px;box-shadow:0 14px 40px -12px rgba(15,23,42,.35);padding:12px 14px;font:400 13.5px system-ui,-apple-system,Segoe UI,sans-serif;color:#1c2126';
    d.innerHTML='<b>🔔 Receber aviso de mensagem?</b><div style="margin:6px 0 10px;color:#5b6570">Mesmo com o painel minimizado ou em outra aba, o Windows mostra um aviso quando chegar mensagem na conversa da equipe.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button data-n style="border:1px solid #dde1e6;background:#fff;border-radius:9px;padding:6px 10px;cursor:pointer">Agora não</button><button data-s style="border:0;color:#fff;background:linear-gradient(135deg,var(--g1,#3452eb),var(--g2,#6f8bff));border-radius:9px;padding:6px 12px;font-weight:700;cursor:pointer">Ativar avisos</button></div>';
    const fim=()=>{ try{ localStorage.setItem('fc_chat_pediu_aviso','1'); }catch(_){ } d.remove(); };
    d.querySelector('[data-n]').onclick=fim; d.querySelector('[data-s]').onclick=()=>{ fim(); try{ const r=Notification.requestPermission(); if(r&&r.catch) r.catch(()=>{}); }catch(_){ } };
    document.body.appendChild(d);
  }
  async function carregar(){
    if(S.carregando) return; S.carregando = true;
    try{
      const q = S.ultimaId ? sb.from('impl_chat').select('*').gt('id', S.ultimaId).order('id') : sb.from('impl_chat').select('*').order('id',{ascending:false}).limit(150);
      const {data, error} = await q;
      if(error){ if(/impl_chat|relation|permission|policy/i.test(error.message||'')){ S.ok=false; if(btn) btn.style.display='none'; } return; }
      S.ok = true; if(btn) btn.style.display='';
      let novos = (data||[]); if(!S.ultimaId) novos = novos.reverse();
      const primeira = !S.ultimaId;
      novos.forEach(m=>{ if(m.texto===MARCA){ S.ultimaId = Math.max(S.ultimaId, m.id); return; } if(!S.msgs.some(x=>x.id===m.id)){ S.msgs.push(m); if(!primeira && String(m.autor_email||'').toLowerCase()!==S.eu) avisar(m); } S.ultimaId = Math.max(S.ultimaId, m.id); });
      if(novos.length){ desenhar(S.aberto); if(S.aberto) marcarLido(); }
      badge();
    } finally { S.carregando = false; }
  }
  async function iniciar(){
    const {data:{session}} = await sb.auth.getSession();
    if(!session||!session.user){ setTimeout(iniciar, 4000); return; }
    S.eu = String(session.user.email||'').toLowerCase();
    // Só equipe FC: nunca em link de cliente (?k=) ou de aluno
    const qs=new URLSearchParams(location.search);
    if(qs.get('k')||qs.get('aluno')||qs.get('sala')||(typeof ALUNO!=='undefined'&&ALUNO)||(typeof PUB!=='undefined'&&PUB)||(typeof KEY!=='undefined'&&KEY)) return;
    if(!/painel\.html$|\/implantacao\//.test(location.pathname)){
      try{ const r=await sb.from('impl_acesso').select('nome').eq('email', S.eu).maybeSingle(); if(!r.data) return; if(r.data.nome) S.nome=r.data.nome; }catch(_){ return; }
    }
    S.nome = (typeof MEU_ACESSO!=='undefined' && MEU_ACESSO && MEU_ACESSO.nome) || S.nome || S.eu.split('@')[0];
    if(typeof MEU_ACESSO==='undefined' || !MEU_ACESSO){ try{ const r=await sb.from('impl_acesso').select('nome').eq('email', S.eu).maybeSingle(); if(r.data && r.data.nome) S.nome=r.data.nome; }catch(_){ } }
    montar(); await carregar();
    if(!S.ok) return;
    setTimeout(pedirAvisos, 3000);
    setInterval(()=>{ if(typeof MEU_ACESSO!=='undefined' && MEU_ACESSO && MEU_ACESSO.nome) S.nome = MEU_ACESSO.nome; carregar(); }, 10000);
    try{ if('Notification' in window && Notification.permission==='default') btn.addEventListener('click', ()=>Notification.requestPermission(), {once:true}); }catch(_){ }
  }
  window.fcChatAbrir = ()=>{ if(!btn) return; if(!S.aberto) btn.click(); };
  setTimeout(iniciar, 1500);
})();
