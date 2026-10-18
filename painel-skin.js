/* ===== Painel da Matriz · visual moderno =====
   Cabeçalho em destaque (saudação, relógio, atalhos em blocos), KPIs com ícone, abas em pílulas,
   cartões com faixa colorida e 🎨 Cor da tela (6 cores, Claro/Escuro). Só aparência: não mexe nos dados. */
(function(){
  const TEMAS = {
    oceano:   ['#0b3a53','#1f8fb3','#1f6f9a'],
    petroleo: ['#0d3b3e','#14857b','#0f6b70'],
    noite:    ['#1b1f3b','#4f46e5','#4f46e5'],
    vinho:    ['#3b0d24','#b4235a','#a3214f'],
    floresta: ['#0f2e1d','#2f8f4e','#237a41'],
    grafite:  ['#16191d','#4b5563','#374151']
  };
  const NOMES = {oceano:'Oceano',petroleo:'Petróleo',noite:'Noite',vinho:'Vinho',floresta:'Floresta',grafite:'Grafite'};
  const ler = (k,d)=>{ try{ return localStorage.getItem(k)||d; }catch(_){ return d; } };
  const grava = (k,v)=>{ try{ localStorage.setItem(k,v); }catch(_){ } };

  const css = `
  :root{--H1:var(--g1,#0b3a53);--H2:var(--g2,#1f8fb3);--accent-soft:#e3f0f7;--bg:#eef2f6;--r:16px;--sh:0 1px 2px rgba(16,32,48,.06),0 8px 24px rgba(16,32,48,.07)}
  body{background:radial-gradient(1200px 500px at 85% -120px,color-mix(in srgb,var(--H2) 18%,transparent),transparent 70%),var(--bg)}
  header.mx{max-width:none;margin:0;padding:0;display:block;background:linear-gradient(120deg,var(--H1),var(--H2));color:#fff;position:relative;overflow:hidden}
  header.mx::after{content:'';position:absolute;right:-120px;top:-160px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.16),transparent 65%);pointer-events:none}
  header.mx .mxin{max-width:1280px;margin:0 auto;padding:22px 24px 18px;position:relative;z-index:1}
  header.mx .mxtop{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
  header.mx .mxtop img{border-radius:14px!important;box-shadow:0 6px 18px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.35)}
  header.mx .eb{color:rgba(255,255,255,.75)}
  header.mx h1{color:#fff!important;-webkit-text-fill-color:#fff;background:none!important;font-size:30px;letter-spacing:-.01em}
  header.mx .mxola{font:500 15px var(--f-display);color:rgba(255,255,255,.88);margin-top:2px}
  header.mx .mxutil{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  header.mx .mxutil>*:not(#recarregar):not(#fcOn):not(.mxtw){background:rgba(255,255,255,.14)!important;border:1px solid rgba(255,255,255,.28)!important;color:#fff!important}
  header.mx .mxutil>*:not(.mxtw){border-radius:999px!important;padding:7px 13px!important;font:600 13px var(--f-display)!important;text-decoration:none!important;backdrop-filter:blur(6px);box-shadow:none!important}
  header.mx .mxutil>*:not(#recarregar):not(#fcOn):not(.mxtw):hover{background:rgba(255,255,255,.26)!important}
  header.mx .mxrel{font:600 22px var(--f-mono);letter-spacing:.02em;color:#fff;padding:4px 12px;border-radius:12px;background:rgba(0,0,0,.18)}
  header.mx .mxapps{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:18px}
  header.mx .mxapps>*{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:14px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);color:#fff;font:600 14px/1.15 var(--f-display);transition:transform .15s,background .15s;backdrop-filter:blur(6px);position:relative}
  header.mx .mxapps>*:hover,header.mx .mxapps>*:focus-visible{transform:translateY(-2px);background:rgba(255,255,255,.22)}
  header.mx .mxapps .ai{width:34px;height:34px;flex:none;border-radius:10px;display:grid;place-items:center;font-size:18px;background:var(--c,#1fb3c9);box-shadow:0 4px 10px rgba(0,0,0,.2)}
  header.mx .mxlinks{display:flex;gap:14px;flex-wrap:wrap;margin-top:12px}
  header.mx .mxlinks a{color:rgba(255,255,255,.9)!important;font:600 13.5px var(--f-display)}
  .kpis{margin-top:-2px}
  .kpi{border:0!important;border-radius:var(--r)!important;box-shadow:var(--sh);padding:16px 18px!important;display:grid!important;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:14px;align-items:center;position:relative;overflow:hidden}
  .kpi::before{content:attr(data-ic);grid-row:1/3;width:46px;height:46px;border-radius:13px;display:grid;place-items:center;font-size:22px;background:linear-gradient(135deg,var(--H1),var(--H2));box-shadow:0 6px 14px color-mix(in srgb,var(--H2) 35%,transparent)}
  .kpi b{font-size:30px!important;color:var(--H1)}
  .kpi::after{content:'';position:absolute;right:-30px;bottom:-30px;width:110px;height:110px;border-radius:50%;background:color-mix(in srgb,var(--H2) 8%,transparent)}
  .ptabs{background:#fff;border-radius:var(--r);box-shadow:var(--sh);padding:12px 14px;gap:10px!important}
  .ptabs .pg>i{color:var(--H1)!important}
  .ptabs button{border:0!important;background:#f1f4f7!important;border-radius:999px!important;padding:8px 14px!important;font-size:13.5px!important;transition:background .15s,transform .15s}
  .ptabs button:hover{background:color-mix(in srgb,var(--accent) 14%,#fff)!important;transform:translateY(-1px)}
  .ptabs button[aria-selected=true]{background:linear-gradient(135deg,var(--H1),var(--H2))!important;color:#fff!important;box-shadow:0 6px 14px color-mix(in srgb,var(--H2) 35%,transparent)}
  main .card{border:0!important;border-radius:var(--r)!important;box-shadow:var(--sh)}
  main>.card.mxfeat{position:relative;border-left:0!important}
  main>.card.mxfeat::before{content:'';position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--fc,linear-gradient(var(--H1),var(--H2)))}
  main>.card.mxfeat>div:first-child{padding:18px 20px 18px 24px!important}
  main>.card.mxfeat>div:first-child>span:first-child{width:58px;height:58px;border-radius:16px;display:grid;place-items:center;font-size:30px!important;background:var(--fs,#eef6f6)}
  main>.card.mxfeat h2{border:0!important;padding:0!important;font-size:17px!important;letter-spacing:.02em}
  main>.card.mxfeat a,main>.card.mxfeat button{border-radius:999px!important;padding:10px 18px!important;box-shadow:0 4px 12px rgba(0,0,0,.12)}
  .card h2{border-bottom-color:#eef1f4}
  .hmt{border:0!important;box-shadow:var(--sh);border-radius:14px!important}
  .hmt:hover{box-shadow:0 12px 28px rgba(16,32,48,.14)!important}
  #mxTema{position:relative}
  header.mx .mxutil>span.mxtw{all:unset;position:relative;display:inline-flex}
  header.mx #mxTema{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);color:#fff;border-radius:999px;padding:7px 13px;font:600 13px var(--f-display)}
  header.mx #recarregar,header.mx #fcOn{color:#1b232a!important}
  body>button[title="Cor da minha tela"]{display:none!important}
  .mxpop{position:absolute;right:0;top:calc(100% + 8px);z-index:50;background:#fff;color:#1b232a;border-radius:14px;box-shadow:0 18px 40px rgba(0,0,0,.25);padding:12px;width:250px;display:flex;flex-direction:column;gap:10px}
  .mxpop[hidden]{display:none}
  .mxpop .sw{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .mxpop .sw button{all:unset;cursor:pointer;border-radius:10px;height:46px;display:flex;align-items:flex-end;padding:5px 7px;box-sizing:border-box;font:600 11.5px system-ui;color:#fff;outline-offset:2px}
  .mxpop .sw button.on{outline:3px solid #1b232a}
  .mxpop .md{display:flex;gap:6px}.mxpop .md button{flex:1;padding:6px 0;border-radius:8px;font-size:13px}.mxpop .md button.on{background:#1b232a;color:#fff;border-color:#1b232a}
  /* escuro */
  html[data-mx=escuro]{--bg:#0e141a;--panel:#151d25;--fg:#e6edf2;--muted:#9fb0bc;--line:#26323d;--accent-soft:#1c2a35}
  html[data-mx=escuro] .ptabs,html[data-mx=escuro] main .card,html[data-mx=escuro] .kpi,html[data-mx=escuro] .hmt{background:var(--panel)!important;color:var(--fg)}
  html[data-mx=escuro] .ptabs button{background:#1d2731!important;color:var(--fg)!important}
  html[data-mx=escuro] .kpi b{color:#fff}
  html[data-mx=escuro] main .card [style*="background:#fff"],html[data-mx=escuro] main .card [style*="background:#f"]{background:#1d2731!important;color:var(--fg)!important}
  html[data-mx=escuro] tbody tr:hover td{background:#1d2731}
  html[data-mx=escuro] input,html[data-mx=escuro] select,html[data-mx=escuro] textarea,html[data-mx=escuro] main button:not(.ok):not(.pri){background:#1d2731;color:var(--fg);border-color:var(--line)}
  @media(max-width:700px){header.mx h1{font-size:23px}header.mx .mxutil{margin-left:0}header.mx .mxapps{grid-template-columns:repeat(2,1fr)}.kpi b{font-size:24px!important}}
  `;
  const st = document.createElement('style'); st.id='mxSkin'; st.textContent = css; document.head.appendChild(st);

  function aplicaTema(){
    let m = ler('fc_mx_modo','claro');
    if(m==='auto') m = matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
    document.documentElement.dataset.mx = m;
  }
  aplicaTema();

  function montar(){
    const h = document.querySelector('body>header'); if(!h || h.classList.contains('mx')) return;
    const marca = h.children[0], acts = h.querySelector('.acts'); if(!marca || !acts) return;
    h.classList.add('mx');
    const inn = document.createElement('div'); inn.className='mxin';
    const top = document.createElement('div'); top.className='mxtop';
    const ola = document.createElement('div'); ola.className='mxola';
    const txt = marca.querySelector('div'); if(txt) txt.appendChild(ola);
    top.appendChild(marca);
    const util = document.createElement('div'); util.className='mxutil';
    const rel = document.createElement('span'); rel.className='mxrel'; rel.setAttribute('aria-label','Hora');
    const apps = document.createElement('div'); apps.className='mxapps';
    const links = document.createElement('div'); links.className='mxlinks';
    // classifica os itens do cabeçalho
    [...acts.children].forEach(el=>{
      const sty = el.getAttribute('style')||''; let bg = sty.match(/background:\s*(#[0-9a-f]{3,8})/i);
      if(!bg && /background:\s*linear-gradient/i.test(sty)) bg = [0,'#9333ea'];
      const isApp = !!bg;
      if(isApp){
        const t = el.textContent.trim(); const m = t.match(/^(\p{Extended_Pictographic}️?|\S{1,2})\s+(.*)$/u);
        el.removeAttribute('style'); el.style.setProperty('--c', bg[1]);
        el.innerHTML = `<span class="ai">${m?m[1]:'•'}</span><span>${m?m[2]:t}</span>`;
        apps.appendChild(el);
      } else if(el.tagName==='A'){ links.appendChild(el); }
      else util.appendChild(el);
    });
    // seletor de cor
    const tb = document.createElement('button'); tb.type='button'; tb.id='mxTema'; tb.textContent='🎨 Cor da tela';
    const pop = document.createElement('div'); pop.className='mxpop'; pop.hidden=true;
    const desenhaPop = ()=>{
      const at = ler('fc_mx_tema','oceano'), md = ler('fc_mx_modo','claro');
      pop.innerHTML = `<b style="font:700 14px var(--f-display)">Cor da tela</b><button type="button" data-cor="1" style="padding:9px;border-radius:10px;font-weight:700;background:linear-gradient(135deg,var(--H1),var(--H2));color:#fff;border:0">🎨 Escolher a cor</button><span style="font-size:12.5px;color:#5d6b76">Fundo da tela</span>
        <div class="md">${[['auto','Automático'],['claro','Claro'],['escuro','Escuro']].map(([k,n])=>`<button type="button" data-m="${k}" class="${k===md?'on':''}">${n}</button>`).join('')}</div>`;
    };
    pop.addEventListener('click',e=>{ e.stopPropagation(); const b=e.target.closest('button'); if(!b) return; if(b.dataset.cor){ pop.hidden=true; const t=document.querySelector('button[title="Cor da minha tela"]'); if(t) t.click(); return; } if(b.dataset.m) grava('fc_mx_modo',b.dataset.m); aplicaTema(); desenhaPop(); });
    tb.onclick = e=>{ e.stopPropagation(); desenhaPop(); pop.hidden=!pop.hidden; };
    document.addEventListener('click',()=>{ pop.hidden=true; });
    const tw = document.createElement('span'); tw.className='mxtw'; tw.append(tb,pop);
    util.prepend(tw); util.prepend(rel);
    top.appendChild(util);
    inn.append(top, apps, links);
    h.innerHTML=''; h.appendChild(inn);
    const tick = ()=>{ const d=new Date(), hr=d.getHours();
      rel.textContent = d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      const nome = (window.MEU_NOME || 'Fernando');
      ola.textContent = (hr<12?'Bom dia':hr<18?'Boa tarde':'Boa noite')+', '+nome+' · '+d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'}); };
    tick(); setInterval(tick, 20000);
    // KPIs com ícone
    const ic = ['🏢','🚪','⏱️','🏆']; document.querySelectorAll('.kpis .kpi').forEach((k,i)=>k.dataset.ic=ic[i]||'📌');
    // cartões de destaque
    const F = {enqCard:['#0f6b70','#e6f4f3'], convCard:['#1f6fb2','#e8f1fb'], esqCard:['#f2a51e','#fff4e0']};
    Object.entries(F).forEach(([id,c])=>{ const s=document.getElementById(id); if(!s) return; s.classList.add('mxfeat'); s.style.setProperty('--fc',c[0]); s.style.setProperty('--fs',c[1]); s.style.border='0'; });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
