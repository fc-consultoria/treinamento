/* ===== Central das consultorias · tamanho de cada painel =====
   Cada cartão de empresa ganha o botão ⤢ com: Compacto, Normal, Largo, Linha inteira. Tudo fica salvo neste navegador. */
(function(){
  const KEY='fc_cx_tam';
  const ler=()=>{ try{ return JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(_){ return {}; } };
  const grava=o=>{ try{ localStorage.setItem(KEY, JSON.stringify(o)); }catch(_){ } };
  const OP=[['compacto','Compacto','só o essencial'],['normal','Normal',''],['largo','Largo','2 colunas'],['inteiro','Linha inteira','toda a largura']];
  const css=`
  .cn-card,.cn-box{position:relative}
  .tz-b{position:absolute;top:8px;right:8px;z-index:3;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;font:700 14px system-ui;cursor:pointer;background:color-mix(in srgb,var(--surface,#fff) 85%,transparent);border:1px solid var(--line,#d5dce1);color:var(--muted,#5d6b76);opacity:0;transition:opacity .15s}
  .cn-card:hover .tz-b,.cn-box:hover .tz-b,.tz-b:focus-visible,.tz-b[aria-expanded=true]{opacity:1}
  @media(hover:none){.tz-b{opacity:.85}}
  .cn-card .cn-ch{padding-right:30px}
  .tz-m{position:absolute;top:40px;right:8px;z-index:20;background:var(--surface,#fff);color:var(--fg,#1b232a);border:1px solid var(--line,#d5dce1);border-radius:12px;box-shadow:0 14px 34px rgba(0,0,0,.25);padding:6px;display:flex;flex-direction:column;min-width:180px;cursor:default}
  .tz-m span[data-tz]{display:flex;justify-content:space-between;gap:10px;padding:7px 10px;border-radius:8px;cursor:pointer;font:600 13px system-ui}
  .tz-m span[data-tz]:hover{background:color-mix(in srgb,var(--cx1,#1f6f9a) 14%,transparent)}
  .tz-m span[data-tz].on{background:var(--cx1,#1f6f9a);color:#fff}
  .tz-m small{opacity:.7;font-weight:500}
  .tz-m .tzh{font:600 11.5px system-ui;color:var(--muted,#5d6b76);padding:6px 10px 2px;border-top:1px solid var(--line,#d5dce1);margin-top:4px}
  .tz-m input[type=range]{margin:4px 10px 6px;width:calc(100% - 20px)}
  .cn-card.tz-largo{grid-column:span 2}
  .cn-card.tz-inteiro{grid-column:1/-1}
  .cn-card.tz-compacto .cn-bars,.cn-card.tz-compacto .cn-now{display:none}
  .cn-box.tz-compacto{max-height:190px;overflow:auto}
  .cn-box.tz-largo,.cn-box.tz-inteiro{max-height:none}
  .tz-rs{display:flex;justify-content:flex-end;margin:-4px 0 8px}
  .tz-rs button{font:600 12px system-ui;padding:4px 10px;border-radius:999px;border:1px solid var(--line,#d5dce1);background:var(--surface,#fff);color:var(--muted,#5d6b76);cursor:pointer}
  @media(max-width:900px){.cn-card.tz-largo{grid-column:auto}}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  function idDe(el){
    if(el.classList.contains('cn-card')) return 'c:'+(el.dataset.k||'');
    const h=el.querySelector('h3'); return 'b:'+(h?h.textContent.replace(/[^\p{L}\p{N} ]/gu,'').trim():'');
  }
  function aplica(el,T){ const v=T[idDe(el)]||'normal'; OP.forEach(([k])=>el.classList.toggle('tz-'+k,k===v)); }

  let menu=null;
  function fecha(){ if(menu){ const b=menu.parentNode&&menu.parentNode.querySelector('.tz-b'); if(b) b.setAttribute('aria-expanded','false'); menu.remove(); menu=null; } }
  function abre(el,btn){
    fecha(); const T=ler(), id=idDe(el), at=T[id]||'normal';
    menu=document.createElement('div'); menu.className='tz-m'; menu.setAttribute('role','menu');
    menu.innerHTML='<div class="tzh" style="border:0;margin:0">Tamanho deste painel</div>'+OP.map(([k,n,d])=>`<span role="menuitemradio" tabindex="0" data-tz="${k}" class="${k===at?'on':''}">${n}<small>${d}</small></span>`).join('')
      +(el.classList.contains('cn-box')?'<div class="tzh">Altura</div><input type="range" min="0" max="900" step="20" value="'+(T[id+':h']||0)+'" aria-label="Altura do quadro (0 = automática)">':'');
    menu.addEventListener('click',e=>{ e.stopPropagation(); e.preventDefault(); const o=e.target.closest('[data-tz]'); if(!o) return; const T2=ler(); T2[id]=o.dataset.tz; grava(T2); aplicaTudo(); fecha(); });
    menu.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ const o=e.target.closest('[data-tz]'); if(o){ e.preventDefault(); o.click(); } } if(e.key==='Escape') fecha(); });
    const rg=menu.querySelector('input[type=range]');
    if(rg){ rg.addEventListener('click',e=>e.stopPropagation()); rg.addEventListener('input',()=>{ const T2=ler(); T2[id+':h']=+rg.value; grava(T2); altura(el,T2); }); }
    el.appendChild(menu); btn.setAttribute('aria-expanded','true');
    const f=menu.querySelector('.on'); if(f) f.focus();
  }
  function altura(el,T){ const h=T[idDe(el)+':h']; el.style.maxHeight=h?h+'px':''; el.style.overflow=h?'auto':''; }

  function aplicaTudo(){
    const g=document.querySelector('.cn-grid'); if(!g) return;
    const T=ler();
    g.querySelectorAll('.cn-card,.cn-box').forEach(el=>{
      if(!el.querySelector(':scope>.tz-b')){
        const b=document.createElement('span'); b.className='tz-b'; b.setAttribute('role','button'); b.tabIndex=0; b.title='Ajustar o tamanho deste painel'; b.setAttribute('aria-haspopup','menu'); b.textContent='⤢';
        const go=e=>{ e.stopPropagation(); e.preventDefault(); if(menu&&menu.parentNode===el){ fecha(); return; } abre(el,b); };
        b.addEventListener('click',go); b.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' ') go(e); });
        el.appendChild(b);
      }
      aplica(el,T); if(el.classList.contains('cn-box')) altura(el,T);
    });
    // barra: coluna do lado embaixo / voltar tudo ao normal
    const sec=g.querySelector('.cn-sec');
    if(sec && !g.querySelector('.tz-rs')){
      const r=document.createElement('div'); r.className='tz-rs';
      r.innerHTML='<button type="button" data-tzr>↺ Tamanhos padrão</button>';
      r.querySelector('[data-tzr]').onclick=()=>{ grava({}); g.style.removeProperty('--tz-side'); g.querySelectorAll('.cn-box').forEach(b=>{b.style.maxHeight='';b.style.overflow='';}); aplicaTudo(); };
      sec.after(r);
    }
  }
  document.addEventListener('click',e=>{ if(menu && !menu.contains(e.target)) fecha(); });
  new MutationObserver(()=>{ const g=document.querySelector('.cn-grid'); if(g && !g.querySelector('.tz-b')) aplicaTudo(); }).observe(document.body,{childList:true,subtree:true});
  aplicaTudo();
})();
