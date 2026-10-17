/* ===== Cor da tela por pessoa (Painel de Implantação e Painel da Matriz) =====
   Botão 🎨 no canto da tela. Cada login escolhe a sua cor; fica salva neste navegador para aquele e-mail
   e não muda a tela de ninguém mais. */
(function(){
  const CORES = [
    {id:'padrao',   nome:'Padrão',      c:null},
    {id:'oceano',   nome:'Oceano',      c:'#2563eb', c2:'#06b6d4'},
    {id:'esmeralda',nome:'Esmeralda',   c:'#059669', c2:'#84cc16'},
    {id:'por-do-sol',nome:'Pôr do sol', c:'#ea580c', c2:'#ec4899'},
    {id:'uva',      nome:'Uva',         c:'#7c3aed', c2:'#db2777'},
    {id:'rubi',     nome:'Rubi',        c:'#dc2626', c2:'#f59e0b'},
    {id:'menta',    nome:'Menta',       c:'#0d9488', c2:'#22d3ee'},
    {id:'aurora',   nome:'Aurora',      c:'#4f46e5', c2:'#10b981'},
    {id:'grafite',  nome:'Grafite',     c:'#334155', c2:'#64748b'}
  ];

  const CSS = `
html[data-fc-tema] .sidebar{background:linear-gradient(170deg,var(--g1),var(--g2)) !important;border-right:0 !important;}
html[data-fc-tema] .sidebar, html[data-fc-tema] .sidebar *{color:rgba(255,255,255,.92);}
html[data-fc-tema] .sidebar .navitem:hover{background:rgba(255,255,255,.14) !important;}
html[data-fc-tema] .sidebar .navitem.active{background:rgba(255,255,255,.24) !important;color:#fff !important;box-shadow:inset 3px 0 0 #fff;}
html[data-fc-tema] .btn-primary, html[data-fc-tema] .chip.active, html[data-fc-tema] button.pri{background:linear-gradient(135deg,var(--g1),var(--g2)) !important;border-color:transparent !important;color:#fff !important;box-shadow:0 4px 14px -6px var(--g1);}
html[data-fc-tema] .pbar-fill{background:linear-gradient(90deg,var(--g1),var(--g2)) !important;}
html[data-fc-tema] .pagehead h1, html[data-fc-tema] header h1{background:linear-gradient(90deg,var(--g1),var(--g2));-webkit-background-clip:text;background-clip:text;color:transparent !important;}
html[data-fc-tema] .statcard{position:relative;overflow:hidden;}
html[data-fc-tema] .statcard::before{content:"";position:absolute;left:0;top:0;right:0;height:3px;background:linear-gradient(90deg,var(--g1),var(--g2));}
html[data-fc-tema] .statcard .num{background:linear-gradient(90deg,var(--g1),var(--g2));-webkit-background-clip:text;background-clip:text;color:transparent;}
html[data-fc-tema] .clientcard:hover{border-color:var(--g1) !important;box-shadow:0 8px 24px -12px var(--g1);}
html[data-fc-tema] .tabbtn.active{border-bottom-color:var(--g1) !important;color:var(--g1) !important;}
html[data-fc-tema][data-fc-fundo="tingido"] body{background:radial-gradient(1200px 600px at 100% -10%, color-mix(in srgb, var(--g2) 18%, transparent), transparent 60%), radial-gradient(900px 500px at -10% 110%, color-mix(in srgb, var(--g1) 16%, transparent), transparent 60%), var(--bg) !important;background-attachment:fixed !important;}
html[data-fc-tema][data-fc-fundo="tingido"] .panel, html[data-fc-tema][data-fc-fundo="tingido"] .statcard, html[data-fc-tema][data-fc-fundo="tingido"] .clientcard{border-color:color-mix(in srgb, var(--g1) 18%, #e3e6ea) !important;}
`;
  function injetarCSS(){ if(document.getElementById('fc-tema-css')) return; const st=document.createElement('style'); st.id='fc-tema-css'; st.textContent=CSS; document.head.appendChild(st); }
  const FUNDOS = [{id:'claro', nome:'Suave'}, {id:'tingido', nome:'Vivo'}];
  function email(){
    try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(/^sb-.*-auth-token$/.test(k)){ const v=JSON.parse(localStorage.getItem(k)||'{}'); const e=(v.user&&v.user.email)||(v.currentSession&&v.currentSession.user&&v.currentSession.user.email); if(e) return String(e).toLowerCase(); } } }catch(_){ }
    return 'anon';
  }
  const chave = ()=>'fc_tema_cor_'+email();
  function ler(){ try{ return JSON.parse(localStorage.getItem(chave())||'null')||{cor:'padrao',fundo:'claro'}; }catch(_){ return {cor:'padrao',fundo:'claro'}; } }
  function salvar(t){ try{ localStorage.setItem(chave(), JSON.stringify(t)); }catch(_){ } }
  const hex = h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const mix = (h, w, p)=>{ const a=hex(h), b=hex(w); return '#'+a.map((x,i)=>Math.round(x*(1-p)+b[i]*p).toString(16).padStart(2,'0')).join(''); };
  const root = document.documentElement;
  const VARS = ['--accent','--accent-2','--accent-dark','--accent-soft','--bg','--panel-2'];
  let originais = null;
  function aplicar(t){
    if(!originais){ const cs=getComputedStyle(root); originais={}; VARS.forEach(v=>originais[v]=cs.getPropertyValue(v)); }
    VARS.forEach(v=>root.style.removeProperty(v));
    injetarCSS();
    const tema = CORES.find(x=>x.id===t.cor)||CORES[0]; const cor = tema.c;
    if(cor){ root.setAttribute('data-fc-tema', tema.id); root.setAttribute('data-fc-fundo', t.fundo||'claro'); root.style.setProperty('--g1', cor); root.style.setProperty('--g2', tema.c2||cor); }
    else { root.removeAttribute('data-fc-tema'); root.removeAttribute('data-fc-fundo'); }
    if(cor){
      root.style.setProperty('--accent', cor);
      root.style.setProperty('--accent-dark', mix(cor,'#000000',0.35));
      root.style.setProperty('--accent-2', mix(cor,'#ffffff',0.9));
      root.style.setProperty('--accent-soft', mix(cor,'#ffffff',0.88));
      if(t.fundo==='tingido'){ root.style.setProperty('--bg', mix(cor,'#ffffff',0.93)); root.style.setProperty('--panel-2', mix(cor,'#ffffff',0.96)); }
    } else if(t.fundo==='tingido'){ /* padrão não tinge */ }
    atualizarBotao(t);
  }
  let btn, pop;
  function atualizarBotao(t){ if(!btn) return; const c=(CORES.find(x=>x.id===t.cor)||CORES[0]).c; const tt=CORES.find(x=>x.id===t.cor)||CORES[0]; btn.style.background = c?`linear-gradient(135deg,${c},${tt.c2||c})`:'#ffffff'; btn.style.color = c?'#ffffff':'#333'; }
  function montar(){
    if(btn) return;
    btn = document.createElement('button'); btn.type='button'; btn.title='Cor da minha tela'; btn.textContent='🎨';
    btn.style.cssText='position:fixed;right:14px;bottom:14px;z-index:9998;width:38px;height:38px;border-radius:50%;border:1px solid rgba(0,0,0,.15);box-shadow:0 4px 14px rgba(0,0,0,.15);font-size:18px;line-height:1;cursor:pointer;padding:0';
    pop = document.createElement('div');
    pop.style.cssText='position:fixed;right:14px;bottom:60px;z-index:9999;background:#fff;color:#1c2126;border:1px solid #dde1e6;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.18);padding:12px;width:236px;font:500 13px system-ui,-apple-system,Segoe UI,sans-serif;display:none';
    btn.onclick = ()=>{ pop.style.display = pop.style.display==='none' ? 'block' : 'none'; desenhar(); };
    document.addEventListener('click', e=>{ if(pop.style.display!=='none' && !pop.contains(e.target) && e.target!==btn) pop.style.display='none'; });
    document.body.appendChild(pop); document.body.appendChild(btn);
    atualizarBotao(ler());
  }
  function desenhar(){
    const t = ler();
    pop.innerHTML = `<div style="font-weight:700;margin-bottom:2px">Tema da minha tela</div>
      <div style="font-weight:400;font-size:12px;color:#6b7480;margin-bottom:10px">Só muda para você (${email()==='anon'?'este navegador':email()}).</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${CORES.map(c=>`<button type="button" data-cor="${c.id}" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 2px;border-radius:8px;border:2px solid ${t.cor===c.id?'#1c2126':'transparent'};background:#f6f7f9;cursor:pointer;font:500 11.5px system-ui"><span style="width:22px;height:22px;border-radius:50%;background:${c.c?`linear-gradient(135deg,${c.c},${c.c2||c.c})`:'linear-gradient(135deg,#3452eb 50%,#1f6f9a 50%)'};border:1px solid rgba(0,0,0,.12)"></span>${c.nome}</button>`).join('')}</div>
      <div style="display:flex;gap:6px;margin-top:10px">${FUNDOS.map(f=>`<button type="button" data-fundo="${f.id}" style="flex:1;padding:6px;border-radius:8px;border:2px solid ${t.fundo===f.id?'#1c2126':'#dde1e6'};background:#fff;cursor:pointer;font:500 12px system-ui">${f.nome}</button>`).join('')}</div>`;
    pop.querySelectorAll('[data-cor]').forEach(b=>b.onclick=(e)=>{ e.stopPropagation(); const n={...ler(), cor:b.dataset.cor}; salvar(n); aplicar(n); desenhar(); });
    pop.querySelectorAll('[data-fundo]').forEach(b=>b.onclick=(e)=>{ e.stopPropagation(); const n={...ler(), fundo:b.dataset.fundo}; salvar(n); aplicar(n); desenhar(); });
  }
  function iniciar(){ aplicar(ler()); montar(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
  // troca de login na mesma aba: reaplica a cor da pessoa que entrou
  let ultimo = email(); setInterval(()=>{ const e=email(); if(e!==ultimo){ ultimo=e; aplicar(ler()); } }, 3000);
})();
