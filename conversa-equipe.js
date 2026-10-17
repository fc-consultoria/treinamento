/* ===== Conversa da equipe (Matriz ⇄ equipe) dentro do Painel de Implantação =====
   Botão 💬 no canto. Texto e imagem (anexar, ou colar com Ctrl+V). Aviso de mensagem nova com número no botão. */
(function(){
  if(typeof sb==='undefined') return;
  const S = {aberto:false, msgs:[], eu:'', nome:'', ultimaId:0, ok:true, img:null, carregando:false};
  const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lidoKey = ()=>'fc_chat_lido_'+S.eu;
  const lido = ()=>{ try{ return Number(localStorage.getItem(lidoKey())||0); }catch(_){ return 0; } };
  const marcarLido = ()=>{ const m = S.msgs[S.msgs.length-1]; if(m){ try{ localStorage.setItem(lidoKey(), String(m.id)); }catch(_){ } } badge(); };
  const hora = d=>{ const x=new Date(d), h=new Date(); const mesmoDia = x.toDateString()===h.toDateString(); return (mesmoDia?'':x.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' ')+x.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); };
  function linkify(t){ return esc(t).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\n/g,'<br>'); }

  let btn, box, lista, txt, prev, fileInp;
  function montar(){
    if(btn) return;
    const st = document.createElement('style'); st.textContent = `
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
      .fcchat-zoom{position:fixed;inset:0;z-index:10000;background:rgba(10,14,20,.85);display:grid;place-items:center;cursor:zoom-out}
      .fcchat-zoom img{max-width:94vw;max-height:92vh;border-radius:10px}`;
    document.head.appendChild(st);
    btn = document.createElement('button'); btn.type='button'; btn.className='fcchat-btn'; btn.title='Conversa da equipe'; btn.innerHTML='💬<span class="fcchat-badge" style="display:none"></span>';
    box = document.createElement('div'); box.className='fcchat-box';
    box.innerHTML = `<div class="fcchat-head"><div style="font-size:20px">💬</div><div style="flex:1"><div style="font-weight:700">Conversa da equipe</div><div style="font-size:12px;opacity:.9">Matriz e equipe · texto e imagem</div></div><button type="button" data-x style="background:rgba(255,255,255,.2);border:0;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px">✕</button></div>
      <div class="fcchat-list"></div>
      <div class="fcchat-prev"><img style="width:44px;height:44px;object-fit:cover;border-radius:8px"><span style="flex:1">Imagem pronta para enviar</span><button type="button" data-tirar style="border:0;background:none;cursor:pointer;color:#b42318;font-weight:600">remover</button></div>
      <div class="fcchat-foot"><button type="button" class="fcchat-ico" data-anexo title="Anexar imagem">📎</button><input type="file" accept="image/*" hidden><textarea rows="1" placeholder="Escreva… (Enter envia · Shift+Enter quebra linha · Ctrl+V cola print)"></textarea><button type="button" class="fcchat-ico fcchat-send" data-enviar title="Enviar">➤</button></div>`;
    document.body.appendChild(box); document.body.appendChild(btn);
    lista = box.querySelector('.fcchat-list'); txt = box.querySelector('textarea'); prev = box.querySelector('.fcchat-prev'); fileInp = box.querySelector('input[type=file]');
    btn.onclick = ()=>{ S.aberto = !S.aberto; box.style.display = S.aberto?'flex':'none'; if(S.aberto){ desenhar(true); marcarLido(); setTimeout(()=>txt.focus(),50); } };
    box.querySelector('[data-x]').onclick = ()=>{ S.aberto=false; box.style.display='none'; };
    box.querySelector('[data-anexo]').onclick = ()=>fileInp.click();
    fileInp.onchange = ()=>{ const f=fileInp.files&&fileInp.files[0]; fileInp.value=''; if(f) prepararImagem(f); };
    box.querySelector('[data-tirar]').onclick = ()=>{ S.img=null; prev.style.display='none'; };
    box.querySelector('[data-enviar]').onclick = enviar;
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
    txt.value=''; txt.style.height='auto'; S.img=null; prev.style.display='none';
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
    const b = btn.querySelector('.fcchat-badge'); b.style.display = n?'block':'none'; b.textContent = n>9?'9+':n;
  }
  function avisar(m){
    try{ const c=new (window.AudioContext||window.webkitAudioContext)(), o=c.createOscillator(), g=c.createGain(); o.frequency.value=880; g.gain.value=.06; o.connect(g); g.connect(c.destination); o.start(); setTimeout(()=>{o.frequency.value=1175;},120); setTimeout(()=>{o.stop(); c.close();},260); }catch(_){ }
    try{ if('Notification' in window && Notification.permission==='granted' && document.hidden) new Notification('💬 '+(m.autor_nome||'Equipe FC'), {body: m.texto || '📷 Imagem', tag:'fcchat'}); }catch(_){ }
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
      novos.forEach(m=>{ if(!S.msgs.some(x=>x.id===m.id)){ S.msgs.push(m); if(!primeira && String(m.autor_email||'').toLowerCase()!==S.eu) avisar(m); } S.ultimaId = Math.max(S.ultimaId, m.id); });
      if(novos.length){ desenhar(S.aberto); if(S.aberto) marcarLido(); }
      badge();
    } finally { S.carregando = false; }
  }
  async function iniciar(){
    const {data:{session}} = await sb.auth.getSession();
    if(!session){ setTimeout(iniciar, 4000); return; }
    S.eu = String(session.user.email||'').toLowerCase();
    S.nome = (typeof MEU_ACESSO!=='undefined' && MEU_ACESSO && MEU_ACESSO.nome) || S.eu.split('@')[0];
    montar(); await carregar();
    if(!S.ok) return;
    setInterval(()=>{ if(typeof MEU_ACESSO!=='undefined' && MEU_ACESSO && MEU_ACESSO.nome) S.nome = MEU_ACESSO.nome; carregar(); }, 10000);
    try{ if('Notification' in window && Notification.permission==='default') btn.addEventListener('click', ()=>Notification.requestPermission(), {once:true}); }catch(_){ }
  }
  setTimeout(iniciar, 1500);
})();
