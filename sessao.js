/* ===== Sessão: selo On-line / Off-line + botão Sair (27/10/2026) =====
   Vale para todos os painéis com login (Matriz, vendedor, consultoria, implantação…).
   - O selo fica sempre ao lado do botão "Sair" da tela (acha sozinho, mesmo quando o botão aparece depois).
   - Passando o mouse (ou tocando) no selo aparece "Você está on-line" / "Você está off-line".
   - Confere a conexão com a internet e com o servidor da FC a cada 30 s.
   - Tela que ainda não tem "Sair" pode chamar FCSessao.botaoSair(lugar, funcao). */
(function(){
  if(window.FCSessao)return;
  if(window.top!==window){window.FCSessao={botaoSair(){},nome(){}};return;} // dentro de outro painel: quem mostra é o painel de fora
  const SB='https://cpkjphodruyxfouirhpd.supabase.co',KEY='sb_publishable_d0HEeWsaqOeZIQKGftlF-Q_B8BUOWWg';
  const css=`.fcs-st{position:relative;display:inline-flex;align-items:center;gap:6px;flex:none;font:700 13px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1d2a33;background:#fff;border:1.5px solid #cfd8de;border-radius:999px;padding:6px 11px 6px 9px;cursor:default;white-space:nowrap;vertical-align:middle;margin:0 8px 0 0;user-select:none}
.fcs-st i{width:10px;height:10px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.2);flex:none}
.fcs-st.on{border-color:#86d3a4}.fcs-st.on i{animation:fcsPulso 2.2s ease-in-out infinite}
.fcs-st.off{color:#7a2a22;border-color:#e3a39b;background:#fff5f4}.fcs-st.off i{background:#9aa5ad;box-shadow:0 0 0 3px rgba(154,165,173,.25)}
.fcs-st.chk i{background:#eab308;box-shadow:0 0 0 3px rgba(234,179,8,.25)}
.fcs-tip{position:absolute;top:calc(100% + 9px);right:0;z-index:99990;min-width:220px;max-width:290px;background:#13232e;color:#fff;border-radius:10px;padding:9px 12px;font:400 13px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;white-space:normal;text-align:left;box-shadow:0 10px 28px rgba(0,0,0,.28);opacity:0;visibility:hidden;transform:translateY(-3px);transition:opacity .15s,transform .15s;pointer-events:none}
.fcs-tip b{display:block;font-size:14px;margin-bottom:2px}.fcs-tip::before{content:"";position:absolute;top:-6px;right:18px;border:6px solid transparent;border-top:0;border-bottom-color:#13232e}
.fcs-st:hover .fcs-tip,.fcs-st:focus .fcs-tip,.fcs-st.ver .fcs-tip{opacity:1;visibility:visible;transform:none}
.fcs-st.col{align-self:flex-start;margin:0 0 8px 10px}.fcs-st.esq .fcs-tip{right:auto;left:0}.fcs-st.esq .fcs-tip::before{right:auto;left:18px}
.fcs-sair{font:700 14px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;border:1.5px solid #c46a62;background:#fff;color:#9b2c22;border-radius:9px;padding:8px 13px;cursor:pointer;flex:none}
.fcs-sair:hover{background:#fdecea}
.fcs-av{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99995;background:#7a2a22;color:#fff;border-radius:12px;padding:11px 16px;font:600 14px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.3);max-width:calc(100vw - 32px);text-align:center}
.fcs-av.ok{background:#15803d}
@keyframes fcsPulso{50%{box-shadow:0 0 0 5px rgba(22,163,74,.08)}}
@media print{.fcs-st,.fcs-av{display:none!important}}`;
  const st=document.createElement('style');st.textContent=css;(document.head||document.documentElement).appendChild(st);

  let ON=navigator.onLine,DESDE=new Date(),NOME='',chip=null,ultimo=null;
  const hm=d=>String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  const esc=t=>String(t||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function pinta(){if(!chip)return;
    chip.classList.toggle('on',ON);chip.classList.toggle('off',!ON);chip.classList.remove('chk');
    chip.querySelector('b.fcs-t').textContent=ON?'On-line':'Off-line';
    const quem=NOME?esc(NOME.split(' ')[0])+', v':'V';
    chip.querySelector('.fcs-tip').innerHTML=ON
      ?`<b>🟢 ${quem}ocê está on-line</b>Conectado ao painel da FC desde ${hm(DESDE)}. Tudo o que você fizer é salvo na hora.`
      :`<b>⚪ ${quem}ocê está off-line</b>Sem conexão desde ${hm(DESDE)}. Confira a internet: o que fizer agora pode não ser salvo.`;
    chip.setAttribute('aria-label',ON?'Você está on-line':'Você está off-line');}

  function aviso(on){const a=document.createElement('div');a.className='fcs-av'+(on?' ok':'');a.setAttribute('role','status');
    a.textContent=on?'🟢 Conexão de volta: você está on-line de novo.':'⚪ Você ficou off-line. Confira a internet antes de salvar.';
    document.querySelectorAll('.fcs-av').forEach(x=>x.remove());document.body.appendChild(a);setTimeout(()=>a.remove(),on?3500:7000);}

  function muda(on){if(on===ON){pinta();return;}ON=on;DESDE=new Date();pinta();if(document.body)aviso(on);}

  async function confere(){
    if(!navigator.onLine){muda(false);return;}
    const ac=new AbortController(),t=setTimeout(()=>ac.abort(),9000);
    try{const r=await fetch(SB+'/auth/v1/health?t='+Date.now(),{headers:{apikey:KEY},cache:'no-store',signal:ac.signal});muda(r.status<500);}
    catch(_){muda(false);}finally{clearTimeout(t);}}

  function criaChip(){const c=document.createElement('span');c.className='fcs-st on';c.tabIndex=0;c.setAttribute('role','status');c.dataset.fcs='1';
    c.innerHTML='<i></i><b class="fcs-t">On-line</b><span class="fcs-tip"></span>';
    c.addEventListener('click',()=>{c.classList.toggle('ver');if(c.classList.contains('ver'))setTimeout(()=>c.classList.remove('ver'),3500);});
    return c;}

  /* acha o botão "Sair" visível da tela */
  const ehSair=el=>{if(el.dataset.fcsIgnora!=null)return false;const t=(el.textContent||'').replace(/\s+/g,' ').trim();return /^(?:\S{1,3}\s)?Sair$/i.test(t);};
  const visivel=el=>el.isConnected&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden'&&!el.closest('[hidden]');
  function acha(){const l=[...document.querySelectorAll('button,a,[role=button]')].filter(e=>ehSair(e)&&visivel(e));
    return l.find(e=>e.dataset.fcsSair!=null)||l[0]||null;}
  function posiciona(){const b=acha();
    if(!b){if(chip)chip.style.display='none';return;}
    if(!chip){chip=criaChip();pinta();}
    chip.style.display='';
    if(chip.nextElementSibling!==b||ultimo!==b){b.parentNode.insertBefore(chip,b);ultimo=b;
      const r=b.getBoundingClientRect();chip.classList.toggle('esq',r.left<innerWidth/2);
      const pc=getComputedStyle(b.parentNode);chip.classList.toggle('col',/flex/.test(pc.display)&&/column/.test(pc.flexDirection));}}

  let fila=0;const agenda=()=>{if(fila)return;fila=requestAnimationFrame(()=>{fila=0;try{posiciona();}catch(_){}});};
  function inicia(){new MutationObserver(m=>{if(m.every(x=>chip&&(x.target===chip||chip.contains(x.target))))return;agenda();})
      .observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','style','class']});
    posiciona();confere();setInterval(()=>{if(document.visibilityState==='visible')confere();},30000);}
  addEventListener('online',confere);addEventListener('offline',()=>muda(false));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')confere();});
  if(document.body)inicia();else document.addEventListener('DOMContentLoaded',inicia);

  window.FCSessao={
    /* cria um botão Sair padrão dentro de "lugar" (elemento) */
    botaoSair(lugar,fn,txt){if(!lugar||lugar.querySelector('[data-fcs-sair]'))return null;
      const b=document.createElement('button');b.type='button';b.className='fcs-sair';b.dataset.fcsSair='1';b.textContent=txt||'Sair';b.title='Sair deste acesso neste aparelho';
      b.onclick=async()=>{b.disabled=true;b.textContent='Saindo…';try{await fn();}catch(_){b.disabled=false;b.textContent=txt||'Sair';}};
      lugar.appendChild(b);agenda();return b;},
    /* nome de quem está usando (aparece na dica) */
    nome(n){NOME=String(n||'').trim();pinta();},
    online:()=>ON};
})();
