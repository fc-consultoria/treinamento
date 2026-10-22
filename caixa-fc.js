/* ===== Painel da Matriz · 📥 Para responder =====
   Um contador só no topo do painel, com tudo o que espera a FC:
   conversas das equipes, suporte dos vendedores, solicitações dos clientes, pedidos do site parados na fila
   (RPC fc_caixa) e o que o próprio painel já conta (conversas pelo site, dúvidas dos alunos, interessados…). */
(function(){
  if(typeof sb==='undefined')return;
  const h=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const PAPEL={gestor:'Gestor',compras:'Compras',vendas:'Vendas',gerente:'Gerente comercial',marketing:'Marketing',fabrica:'Fábrica'};
  const quando=t=>{if(!t)return '';const m=Math.round((Date.now()-new Date(t))/60000);if(m<1)return 'agora';if(m<60)return 'há '+m+' min';const hr=Math.round(m/60);if(hr<24)return 'há '+hr+' h';const d=Math.round(hr/24);return d===1?'ontem':'há '+d+' dias';};
  const TIPO={conv:['💬','Conversas das equipes','Responder'],sup:['🛟','Suporte dos vendedores','Responder'],sol:['📨','Solicitações dos clientes','Abrir'],fila:['🛒','Pedidos do site sem vendedor','Ver fila']};
  const S={d:null,ult:null,aberto:false,prim:true};
  const CSS=`
#cxBtn{display:inline-flex;align-items:center;gap:7px;font-weight:800}
#cxBtn .cx-n{min-width:22px;height:22px;border-radius:99px;background:#e11d48;color:#fff;font-size:12.5px;display:inline-grid;place-items:center;padding:0 7px}
#cxBtn .cx-n.zero{background:#1f9d55}
.cx-ov{position:fixed;inset:0;z-index:9980;background:rgba(15,23,42,.35);display:none}.cx-ov.on{display:block}
.cx-dr{position:fixed;top:0;right:0;bottom:0;z-index:9981;width:min(520px,100vw);background:#fff;color:#15232b;box-shadow:-20px 0 50px -20px rgba(15,23,42,.45);display:flex;flex-direction:column;transform:translateX(105%);transition:transform .2s ease;font:14.5px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
.cx-dr.on{transform:none}
@media (prefers-reduced-motion:reduce){.cx-dr{transition:none}}
.cx-hd{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #d9e1e6}.cx-hd b{flex:1;font-size:18px}
.cx-hd button{border:1px solid #d9e1e6;background:#fff;border-radius:9px;padding:6px 10px;font:600 13.5px inherit;cursor:pointer;color:inherit}
.cx-bd{flex:1;overflow:auto;padding:6px 14px 18px}
.cx-sec{display:flex;align-items:center;gap:8px;margin:16px 2px 6px;font:800 12px inherit;letter-spacing:.08em;text-transform:uppercase;color:#5d6f7a}
.cx-sec i{font-style:normal;background:#e3eef6;color:#0d5c8f;border-radius:99px;padding:0 8px;letter-spacing:0}
.cx-it{display:flex;gap:10px;align-items:flex-start;border:1px solid #d9e1e6;border-radius:12px;padding:10px 12px;margin-bottom:6px;background:#fff}
.cx-it.urg{border-color:#e11d48;background:#fff5f6}
.cx-it .tx{flex:1;min-width:0}.cx-it .tx b{display:block}.cx-it .tx small{display:block;color:#5d6f7a;font-size:12.5px}
.cx-it .tx p{margin:3px 0 0;font-size:13.5px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.cx-it .n{background:#e11d48;color:#fff;border-radius:99px;font-size:12px;padding:0 7px;align-self:flex-start}
.cx-it .go{border:0;background:#0d5c8f;color:#fff;border-radius:9px;padding:7px 12px;font:700 13px inherit;cursor:pointer;white-space:nowrap;align-self:center}
.cx-it .go:focus-visible,.cx-hd button:focus-visible{outline:3px solid #f2a51e;outline-offset:2px}
.cx-ok{margin:40px auto;text-align:center;color:#5d6f7a}.cx-ok div{font-size:40px}
.cx-ft{border-top:1px solid #d9e1e6;padding:10px 14px;display:flex;gap:8px;flex-wrap:wrap}
.cx-ft button{border:1px solid #d9e1e6;background:#f6f8f9;border-radius:9px;padding:8px 12px;font:600 13.5px inherit;cursor:pointer;color:inherit}
.cx-emp{display:inline-block;font-size:11.5px;font-weight:700;border-radius:6px;padding:0 6px;background:#f2f5f4;color:#36454f;margin-right:4px}
@media (prefers-color-scheme:dark){.cx-dr{background:#16222a;color:#e4ecf0}.cx-it{background:#1b2a33;border-color:#2a3b46}.cx-it.urg{background:#3d1d1a}.cx-hd,.cx-ft{border-color:#2a3b46}
 .cx-hd button,.cx-ft button{background:#1b2a33;border-color:#2a3b46}.cx-emp{background:#2a3b46;color:#cfe3f1}.cx-it .tx small,.cx-sec{color:#97a9b4}}`;

  /* contadores que o painel já calcula (lidos da tela) */
  function locais(){const t=id=>{const e=document.getElementById(id);return e?e.textContent:'';},n=(id,re)=>+((t(id).match(re)||[0,0])[1]);
    const vis=id=>{const e=document.getElementById(id);return e&&!e.hidden;};
    const ant=(()=>{const e=document.querySelector('.fcchat-count');if(!e||e.style.display==='none')return 0;const v=e.textContent.trim();return v==='9+'?10:(+v||0);})();
    return [[ant,'🗨','Conversa com a Antonia (Painel de Implantação)','fcchat'],[n('cvN',/(\d+) aguardando/),'🛒','Conversas pelo site (Engefitas, Nopla, site da FC)','ped'],
      [n('csimN',/^(\d+)/),'🧾','Simulações de pedido dos clientes','sim','csimCard'],
      [n('sugN',/(\d+) sem resposta/),'💡','Dúvidas e sugestões dos alunos','sug'],
      [n('intN',/^(\d+)/),'🤝','Interessados para atender','ped'],
      [window.IND_NOVOS||0,'🎁','Indicações novas para confirmar','ped'],
      [vis('pedCard')?document.querySelectorAll('#pedList > *').length:0,'⏱','Pedidos de mais tempo','ped']].filter(x=>x[0]>0);}

  async function carregar(){const r=await sb.rpc('fc_caixa');if(r.error||!r.data)return false;S.d=r.data;
    const msgs=S.d.itens.filter(i=>i.tipo!=='fila'),topo=msgs.reduce((m,i)=>i.em>m?i.em:m,'');
    if(!S.prim&&topo&&topo!==S.ult)bip();S.ult=topo;S.prim=false;badge();if(S.aberto)pinta();return true;}
  function total(){const it=(S.d&&S.d.itens)||[];return it.length+locais().reduce((s,x)=>s+x[0],0);}
  const tit0=document.title.replace(/^\(\d+\)\s*/,'');
  function badge(){const n=total(),b=document.getElementById('cxBtn');if(!b)return;const c=b.querySelector('.cx-n');c.textContent=n||'✓';c.classList.toggle('zero',!n);
    b.title=n?n+' item(ns) esperando a FC':'Nada esperando resposta';document.title=(n?'('+n+') ':'')+tit0;}
  function bip(){try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.frequency.value=880;g.gain.value=.07;o.connect(g);g.connect(a.destination);o.start();setTimeout(()=>{o.frequency.value=1175},130);setTimeout(()=>{o.stop();a.close()},280);}catch(_){}}

  function pinta(){const dr=document.getElementById('cxDr');if(!dr)return;const D=S.d||{itens:[],empresas:{}},emp=k=>((D.empresas||{})[k]||k||'').split(' · ')[0];
    const grupos=Object.keys(TIPO).map(k=>[k,D.itens.filter(i=>i.tipo===k)]).filter(g=>g[1].length),L=locais();
    let b='';
    grupos.forEach(([k,L2])=>{const [ic,t,acao]=TIPO[k];b+=`<div class="cx-sec">${ic} ${t} <i>${L2.length}</i></div>`+L2.map(i=>{
      const urg=k==='fila'||(Date.now()-new Date(i.em))>4*36e5;
      const quem=k==='conv'?`${h(i.quem)} <span style="font-weight:500;color:#5d6f7a">· ${h(PAPEL[i.papel]||i.papel||'')}</span>`:h(i.quem||'Sem nome');
      const sub=k==='sol'?(i.status==='aceita'?'Em andamento':'Nova')+(i.sub?' · '+h(i.sub):''):'';
      return `<div class="cx-it ${urg?'urg':''}"><div class="tx"><b><span class="cx-emp">${h(emp(i.emp))}</span>${quem}</b><small>${quando(i.em)}${sub?' · '+sub:''}</small><p>${h(i.texto||'')}</p></div>${i.n>1?`<span class="n">${i.n}</span>`:''}<button type="button" class="go" data-cx="${k}" data-id="${h(i.id)}" data-emp="${h(i.emp)}">${acao} →</button></div>`;}).join('');});
    if(L.length){b+=`<div class="cx-sec">📋 No painel <i>${L.reduce((s,x)=>s+x[0],0)}</i></div>`+L.map(x=>`<div class="cx-it"><div class="tx"><b>${x[1]} ${h(x[2])}</b></div><span class="n">${x[0]}</span><button type="button" class="go" data-tab="${x[3]}" data-card="${x[4]||''}">Abrir →</button></div>`).join('');}
    if(!b)b='<div class="cx-ok"><div>👍</div><b>Tudo respondido.</b><p>Quando chegar mensagem, solicitação ou pedido parado, aparece aqui e o número acende no topo.</p></div>';
    dr.querySelector('.cx-bd').innerHTML=b;}

  function fechar(){S.aberto=false;document.getElementById('cxDr').classList.remove('on');document.getElementById('cxOv').classList.remove('on');document.getElementById('cxBtn').focus();}
  function abrir(){S.aberto=true;document.getElementById('cxDr').classList.add('on');document.getElementById('cxOv').classList.add('on');pinta();carregar();document.getElementById('cxX').focus({preventScroll:true});}
  function irCard(tab,card){try{ptab(tab);}catch(_){}if(card){const c=document.getElementById(card);if(c)setTimeout(()=>c.scrollIntoView({behavior:'smooth',block:'start'}),120);}}

  async function iniciar(){const ok=await sb.rpc('fc_caixa');if(ok.error||!ok.data){setTimeout(iniciar,15000);return;}if(document.getElementById('cxBtn'))return;
    const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
    const ref=document.getElementById('bAtu'),acts=ref?ref.parentElement:document.querySelector('header .acts');const b=document.createElement('button');b.type='button';b.id='cxBtn';b.innerHTML='📥 Para responder <span class="cx-n"></span>';
    if(ref){b.className=ref.className;b.setAttribute('style',ref.getAttribute('style')||'');ref.parentElement.insertBefore(b,ref);}else if(acts)acts.prepend(b);else document.body.prepend(b);
    document.body.insertAdjacentHTML('beforeend',`<div class="cx-ov" id="cxOv"></div><aside class="cx-dr" id="cxDr" role="dialog" aria-modal="true" aria-label="Para responder">
      <div class="cx-hd"><b>📥 Para responder</b><button type="button" id="cxAt">↻ Atualizar</button><button type="button" id="cxX" aria-label="Fechar">✕</button></div>
      <div class="cx-bd"></div>
      <div class="cx-ft"><button type="button" id="cxConv">💬 Todas as conversas e histórico das equipes</button></div></aside>`);
    b.onclick=abrir;document.getElementById('cxOv').onclick=fechar;document.getElementById('cxX').onclick=fechar;
    document.getElementById('cxAt').onclick=()=>carregar();
    document.getElementById('cxConv').onclick=()=>{fechar();window.FCConversas&&FCConversas.abrirMatriz&&FCConversas.abrirMatriz();};
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.aberto)fechar();});
    document.getElementById('cxDr').addEventListener('click',e=>{const g=e.target.closest('.go');if(!g)return;
      if(g.dataset.tab==='fcchat'){fechar();window.fcChatAbrir&&fcChatAbrir();return;}
      if(g.dataset.tab){fechar();irCard(g.dataset.tab,g.dataset.card);return;}
      const k=g.dataset.cx,id=g.dataset.id,emp=g.dataset.emp;
      if(k==='conv'){fechar();if(window.FCConversas&&FCConversas.abrirMatriz)FCConversas.abrirMatriz(id).then(()=>carregar());return;}
      if(k==='sup'){fechar();irCard('sim','osupCard');setTimeout(()=>{window.osupAbrir&&osupAbrir(id);},300);return;}
      if(k==='sol'){window.open('consultorias.html#'+encodeURIComponent(emp)+'/t=sol','_blank','noopener');return;}
      if(k==='fila'){window.open('orcamento/?e='+encodeURIComponent(emp)+'&aba=atd','_blank','noopener');return;}});
    S.d=ok.data;S.ult=S.d.itens.filter(i=>i.tipo!=='fila').reduce((m,i)=>i.em>m?i.em:m,'');S.prim=false;badge();
    setInterval(()=>{if(!document.hidden)carregar();else badge();},30000);
    setInterval(badge,5000);}  /* os contadores do painel chegam aos poucos */
  window.FCCaixa={abrir,carregar};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(iniciar,2000));else setTimeout(iniciar,2000);
})();
