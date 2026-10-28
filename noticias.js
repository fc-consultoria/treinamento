/* ===== Notícias (G1, Só Notícias e Revista Contramarco) no Painel da Matriz e no Painel de Implantação (matriz e Antonia) =====
   Faixa de manchetes rolando no topo do painel + card de destaques por assunto (abre ao clicar em "Notícias").
   Manchetes vêm da função "noticias" do Supabase (feeds RSS públicos do G1 e do Só Notícias/Sinop). Atualiza a cada 30 min.
   © FC Consultoria em Esquadria · uso exclusivo */
(function(){
  const URL_N='https://cpkjphodruyxfouirhpd.supabase.co/functions/v1/noticias';
  const CATS=['Contramarco','Economia','Sinop','MT','Agro','Últimas'];
  const FONTE={'Sinop':'Só Notícias','Contramarco':'Revista Contramarco (setor de esquadrias)'};
  /* Outros canais de informação de cada fonte (aparecem no card, na aba da fonte) */
  const CANAIS={'Contramarco':[
    ['🌐','Site','https://www.contramarco.com/'],
    ['📰','Notícias','https://www.contramarco.com/blog'],
    ['📸','Instagram','https://www.instagram.com/contramarco/'],
    ['▶️','YouTube','https://www.youtube.com/channel/UCsUmEZ0ZWTwH1Qzcb8G59hw'],
    ['💼','LinkedIn','https://www.linkedin.com/company/revista-contramarco/'],
    ['👍','Facebook','https://www.facebook.com/contramarco'],
    ['🏛️','FESQUA (feira)','https://fesqua.com.br/']]};
  const ATUALIZA_MIN=30;
  const esc=v=>String(v==null?'':v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const LS={g(k){try{return localStorage.getItem(k);}catch(_){return null;}},s(k,v){try{localStorage.setItem(k,v);}catch(_){}}};
  let dados=null,cat=LS.g('fc-not-cat')||'Contramarco',aberto=false,quando=0;
  if(!CATS.includes(cat))cat='Últimas';

  const css=`#fcNot{position:relative;font-family:var(--f-body,system-ui)}
#fcNot .nbar{display:flex;align-items:stretch;background:#0f5f63;border-radius:12px;overflow:hidden;min-height:38px}
#fcNot .nlab{all:unset;cursor:pointer;flex:none;display:flex;align-items:center;gap:6px;padding:0 14px;background:#e8912d;color:#3b2203;font:700 13.5px var(--f-display,system-ui);letter-spacing:.03em}
#fcNot .nlab:hover,#fcNot .nlab:focus-visible{background:#f0a447}
#fcNot .nlab .sv{transition:transform .2s;font-size:11px}#fcNot.ab .nlab .sv{transform:rotate(180deg)}
#fcNot .ntw{flex:1;overflow:hidden;display:flex;align-items:center;mask-image:linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent)}
#fcNot .ntk{display:flex;gap:44px;white-space:nowrap;padding-left:18px;animation:fcNotRola var(--dur,90s) linear infinite}
#fcNot .ntw:hover .ntk{animation-play-state:paused}
#fcNot .ntk a{color:#e6f6f4;text-decoration:none;font-size:14.5px}#fcNot .ntk a:hover{color:#fff;text-decoration:underline}
#fcNot .ntk a b{color:#f6c27a;font-weight:600;margin-right:6px;font-size:12px;letter-spacing:.04em}
#fcNot.rod{position:fixed;left:0;right:0;bottom:0;z-index:60;padding:6px 12px calc(6px + env(safe-area-inset-bottom));background:rgba(241,244,247,.92);backdrop-filter:blur(6px);box-shadow:0 -6px 18px rgba(15,30,39,.1)}
#fcNot.rod .nbar{max-width:1280px;margin:0 auto}
#fcNot.rod .ncard{top:auto;bottom:calc(100% + 4px);left:max(12px,calc((100vw - 1280px)/2 + 12px))}#fcNot.rod .nlab .sv{transform:rotate(180deg)}#fcNot.rod.ab .nlab .sv{transform:none}
body.fcnot-rod{padding-bottom:64px}body.fcnot-rod .fcs-av{bottom:66px}
@media print{#fcNot.rod{display:none}body.fcnot-rod{padding-bottom:0}}
@keyframes fcNotRola{from{transform:translateX(0)}to{transform:translateX(-50%)}}
#fcNot .ncard{position:absolute;left:0;top:calc(100% + 6px);z-index:80;box-sizing:border-box;width:min(440px,100%);background:#fff;color:#13232e;border:1px solid var(--line,#d5dce1);border-radius:14px;box-shadow:0 18px 40px rgba(15,30,39,.18);padding:12px 14px}
#fcNot .nch{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
#fcNot .nch b{font:700 15px var(--f-display,system-ui)}#fcNot .nch small{font-size:12px;color:#5d6b76}
#fcNot .nch button{all:unset;cursor:pointer;width:26px;height:26px;display:grid;place-items:center;border-radius:50%;background:#eef1f3;font-size:14px}
#fcNot .nabas{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px}
#fcNot .nabas button{all:unset;cursor:pointer;font:600 13px var(--f-body,system-ui);padding:4px 11px;border-radius:999px;border:1px solid #c9d6dd;color:#3d4c56}
#fcNot .nabas button.on{background:#e1f3f1;border-color:#0f5f63;color:#0b4a4d}
#fcNot .ncan{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px;padding:8px;border-radius:10px;background:#fff6ea;border:1px solid #f3d9b4}
#fcNot .ncan>small{flex-basis:100%;font-size:11.5px;color:#8a5a12;font-weight:600;letter-spacing:.03em}
#fcNot .ncan a{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;background:#fff;border:1px solid #ecc994;color:#6b4208;text-decoration:none;font:600 12.5px var(--f-body,system-ui)}
#fcNot .ncan a:hover{background:#e8912d;color:#3b2203;border-color:#e8912d}
#fcNot .ntk a.st b{color:#ffd28f}
#fcNot .nlist{max-height:min(420px,60vh);overflow:auto}
#fcNot .nlist a{display:block;padding:9px 2px;border-top:1px solid #edf1f3;text-decoration:none;color:#13232e}
#fcNot .nlist a:hover span{color:#1f6f9a;text-decoration:underline}
#fcNot .nlist a span{display:block;font-size:14.5px;line-height:1.35}#fcNot .nlist a small{font-size:12px;color:#5d6b76}
#fcNot .nrod{font-size:11.5px;color:#7a8892;margin-top:6px}
#fcNot .nvaz{padding:14px 2px;font-size:14px;color:#5d6b76}
@media(max-width:640px){#fcNot .nlab span.tx{display:none}#fcNot .ntk a{font-size:13.5px}}
#fcNotWrap{flex:1;min-width:0;max-width:1240px}#fcNotWrap>#fcNot{margin:20px 34px 0}
@media(max-width:880px){#fcNotWrap>#fcNot{margin:10px 14px 0}}
@media print{#fcNot{display:none!important}}
@media(prefers-reduced-motion:reduce){#fcNot .ntk{animation:none}#fcNot .ntw{overflow-x:auto}}`;

  function hora(iso){if(!iso)return '';const d=new Date(iso),h=new Date();const min=Math.round((h-d)/60000);
    if(min<1)return 'agora';if(min<60)return 'há '+min+' min';if(min<24*60&&d.getDate()===h.getDate())return 'hoje, '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}
  function link(x,cls){return `<a href="${esc(x.l)}" target="_blank" rel="noopener noreferrer"${cls?` class="${cls}"`:''}>`;}

  function faixa(){
    const tk=document.querySelector('#fcNot .ntk');if(!tk)return;
    /* Faixa só com o que interessa à FC: Contramarco (setor) primeiro; dos outros assuntos, só manchetes com palavras do setor ou da economia/região (28/10) */
    const SETOR=/esquadri|alum[ií]ni|vidr|janela|porta|constru|obra|im[óo]ve|habita|minha casa|cimento|a[çc]o\b|ind[úu]stri|com[ée]rcio|varej|juros|selic|cr[ée]dito|financiamento|infla|d[óo]lar|imposto|tribut|reforma|empres|neg[óo]ci|sinop|cuiab|mato grosso|\bmt\b|frete|log[íi]stic|arquitet|engenhar/i;
    const vistos=new Set(),it=[];
    CATS.forEach(c=>((dados&&dados.cats&&dados.cats[c])||[]).filter(x=>c==='Contramarco'||SETOR.test(x.t||'')).slice(0,c==='Contramarco'?8:4).forEach(x=>{if(!vistos.has(x.l)){vistos.add(x.l);it.push([c,x]);}}));
    if(!it.length)['Economia','MT','Sinop'].forEach(c=>((dados&&dados.cats&&dados.cats[c])||[]).slice(0,4).forEach(x=>{if(!vistos.has(x.l)){vistos.add(x.l);it.push([c,x]);}}));
    if(!it.length){tk.innerHTML='<a>Manchetes indisponíveis no momento. Tentando de novo em breve.</a>';tk.style.animation='none';return;}
    const h=it.map(([c,x])=>`${link(x,CANAIS[c]?'st':'')}<b>${esc(c.toUpperCase())}</b>${esc(x.t)}</a>`).join('');
    tk.innerHTML=h+h;tk.style.animation='';tk.style.setProperty('--dur',Math.max(60,it.length*7)+'s');
  }
  function card(){
    const c=document.querySelector('#fcNot .ncard');if(!c)return;
    const cn=CANAIS[cat],nc=c.querySelector('.ncan');nc.hidden=!cn;
    nc.innerHTML=cn?'<small>CANAIS DA '+esc(cat.toUpperCase())+'</small>'+cn.map(([i,n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${i} ${esc(n)}</a>`).join(''):'';
    c.querySelector('.nabas').innerHTML=CATS.map(k=>`<button type="button" class="${k===cat?'on':''}" data-k="${esc(k)}">${esc(k)}</button>`).join('');
    const l=(dados&&dados.cats&&dados.cats[cat])||[];
    c.querySelector('.nlist').innerHTML=l.length?l.map(x=>`${link(x)}<span>${esc(x.t)}</span><small>${esc(hora(x.d))}</small></a>`).join(''):'<div class="nvaz">Sem manchetes deste assunto agora.</div>';
    c.querySelector('.nrod').textContent='Fonte: '+(FONTE[cat]||'G1')+' · abre em nova aba';
    c.querySelector('.nch small').textContent=quando?'atualizado '+hora(new Date(quando).toISOString()):'';
    c.querySelectorAll('.nabas button').forEach(b=>b.onclick=()=>{cat=b.dataset.k;LS.s('fc-not-cat',cat);card();});
  }
  function abrir(v){aberto=v;const r=document.getElementById('fcNot');r.classList.toggle('ab',v);r.querySelector('.ncard').hidden=!v;r.querySelector('.nlab').setAttribute('aria-expanded',String(v));if(v)card();}

  async function carregar(){
    try{const r=await fetch(URL_N,{cache:'no-store'});if(!r.ok)throw 0;dados=await r.json();quando=Date.now();}catch(_){}
    faixa();if(aberto)card();
  }
  function montar(op){
    op=op||{};if(document.getElementById('fcNot'))return;
    const main=document.querySelector(op.envolver||'main');if(!main)return;
    const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
    const w=document.createElement('section');w.id='fcNot';w.setAttribute('aria-label','Notícias');
    w.innerHTML=`<div class="nbar"><button type="button" class="nlab" aria-expanded="false" aria-controls="fcNotCard" title="Ver destaques por assunto">📰 <span class="tx">Notícias</span> <span class="sv">▼</span></button><div class="ntw"><div class="ntk"><a>Carregando manchetes…</a></div></div></div>
<div class="ncard" id="fcNotCard" hidden><div class="nch"><b>Destaques</b><small></small><button type="button" class="nx" aria-label="Fechar">✕</button></div><div class="nabas"></div><div class="ncan" hidden></div><div class="nlist"></div><div class="nrod"></div></div>`;
    if(op.envolver){ /* página que redesenha o conteúdo inteiro: a faixa fica num invólucro acima dele */
      const wr=document.createElement('div');wr.id='fcNotWrap';main.parentNode.insertBefore(wr,main);wr.appendChild(w);wr.appendChild(main);
    }else if(op.rodape){ /* faixa fixa no rodapé da tela (Painel da Matriz, 27/10) */
      w.classList.add('rod');document.body.appendChild(w);document.body.classList.add('fcnot-rod');
    }else main.prepend(w);
    w.querySelector('.nlab').onclick=()=>abrir(!aberto);
    w.querySelector('.nx').onclick=()=>abrir(false);
    document.addEventListener('click',e=>{if(aberto&&!e.composedPath().includes(w))abrir(false);});
    document.addEventListener('keydown',e=>{if(aberto&&e.key==='Escape')abrir(false);});
    carregar();setInterval(carregar,ATUALIZA_MIN*60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-quando>ATUALIZA_MIN*60000)carregar();});
  }
  /* Só monta depois que o login confirma o perfil da matriz (chamado no gateUI do painel.html) */
  window.FCNoticias={iniciar(op){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>montar(op));else montar(op);}};
})();
