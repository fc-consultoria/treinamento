/* Visão FC em cards — consultorias.html (Painel da Matriz).
   Ao abrir uma empresa na Visão FC, as abas viram cartões agrupados por setor, na cor da empresa:
   👁 o cliente vê · 🔒 bloqueado para o cliente (toque para liberar) · só FC = aba interna · 🔔 tem algo pendente.
   Também troca o "+ Nova empresa" por um painel modelo "Novo cliente", com opção de copiar a configuração de outra empresa. */
(function(){
if(typeof PUB!=='undefined'&&PUB)return;
const h=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let modo='home',homeTab,ultAt=null;
const ativo=()=>{try{return !PUB&&at&&E[at]&&!cli;}catch(_){return false;}};

const css=`
#ficha.vfOn{border:0;background:none;box-shadow:none}
.vfHero{background:var(--c);color:#fff;border-radius:18px;padding:18px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.vfHero .lg{width:52px;height:52px;border-radius:14px;background:#fff;color:var(--c);display:flex;align-items:center;justify-content:center;font:800 18px var(--f-h,inherit);flex:none}
.vfHero h2{color:#fff;margin:0;font-size:21px;line-height:1.2}.vfHero .s{color:rgba(255,255,255,.82);font-size:13px;margin-top:2px}
.vfHero .rs{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.vfHero .rs span{background:rgba(255,255,255,.16);border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600}
.vfHero .bts{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}
.vfHero button{all:unset;cursor:pointer;border:1px solid rgba(255,255,255,.45);color:#fff;border-radius:999px;padding:7px 13px;font-size:13px;font-weight:600;white-space:nowrap}
.vfHero button:hover{background:rgba(0,0,0,.18)}.vfHero button:focus-visible{outline:3px solid #fff;outline-offset:2px}
.vfLeg{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:var(--muted);margin:12px 2px 0}
.vfG{margin-top:18px}.vfG>h3{font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin:0 0 8px 2px}
.vfGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(230px,100%),1fr));gap:10px}
.vfK{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:14px;transition:border-color .15s,transform .15s}
.vfK:hover{border-color:var(--c);transform:translateY(-1px)}
.vfK.off{background:var(--surface-2)}.vfK.off .vfO b,.vfK.off .vfO .ic{opacity:.62}
.vfO{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:4px;width:100%;padding:14px 14px 13px;min-height:112px;border-radius:14px}
.vfO:focus-visible{outline:3px solid var(--c);outline-offset:2px}
.vfO .ic{font-size:22px;line-height:1;margin-bottom:4px}.vfO b{font-size:14.5px;line-height:1.3;padding-right:64px}.vfO .d{font-size:12.5px;color:var(--muted);line-height:1.4}
.vfMk{position:absolute;top:10px;right:10px;display:flex;gap:4px;align-items:center}
.vfMk button,.vfMk span{all:unset;font-size:12px;font-weight:700;border-radius:999px;padding:3px 8px;line-height:1.3;white-space:nowrap}
.vfMk button{cursor:pointer}.vfMk button:focus-visible{outline:2px solid var(--c);outline-offset:1px}
.vfMk .ve{background:var(--ok-soft);color:var(--ok)}.vfMk .bl{background:var(--surface-2);color:var(--muted);border:1px solid var(--line)}
.vfMk .fc{background:var(--accent-soft);color:var(--accent)}.vfMk .al{background:var(--bad-soft);color:var(--bad)}
.vfVolta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:12px 0 0;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
.vfVolta>button{all:unset;cursor:pointer;font-weight:700;color:var(--c);padding:4px 8px;border-radius:8px}.vfVolta>button:hover{background:var(--surface-2)}
.vfVolta b{font-size:15px}.vfVolta .vfMk{position:static;margin-left:auto}
#ficha.vfOn>.body{margin-top:12px;background:var(--surface);border:1px solid var(--line);border-radius:14px}
/* Novo cliente */
.ncOv{position:fixed;inset:0;z-index:9990;background:rgba(10,16,22,.55);display:flex;align-items:flex-start;justify-content:center;padding:28px 16px;overflow:auto}
.ncBox{width:min(760px,100%);background:var(--surface);color:var(--fg);border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden}
.ncHd{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--line)}.ncHd h2{margin:0;font-size:19px;flex:1}
.ncHd button{all:unset;cursor:pointer;font-size:20px;padding:2px 8px;border-radius:8px;color:var(--muted)}.ncHd button:hover{background:var(--surface-2)}
.ncBd{padding:16px 18px;display:grid;gap:16px}
.ncBd label.f{display:grid;gap:4px;font-size:13px;font-weight:600}
.ncBd input[type=text]{font:14px var(--f-b);padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:var(--surface-2);color:var(--fg)}
.ncRow{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:560px){.ncRow{grid-template-columns:1fr}}
.ncT{font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:6px}
.ncCores{display:flex;gap:8px;flex-wrap:wrap}.ncCores button{all:unset;cursor:pointer;width:32px;height:32px;border-radius:10px;border:3px solid transparent}
.ncCores button[aria-pressed=true]{border-color:var(--fg)}.ncCores button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.ncMod{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(200px,100%),1fr));gap:8px}
.ncMod button{all:unset;cursor:pointer;display:flex;gap:10px;align-items:center;padding:10px 12px;border:2px solid var(--line);border-radius:12px;background:var(--surface)}
.ncMod button[aria-pressed=true]{border-color:var(--accent);background:var(--accent-soft)}.ncMod button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.ncMod .av{width:34px;height:34px;border-radius:10px;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;flex:none}
.ncMod small{display:block;color:var(--muted);font-size:12px}
.ncCp{display:grid;gap:6px}.ncCp label{display:flex;gap:8px;align-items:flex-start;font-size:13.5px}.ncCp label small{color:var(--muted)}
.ncPrev{border-radius:14px;padding:14px 16px;color:#fff;display:flex;gap:12px;align-items:center}
.ncPrev .lg{width:42px;height:42px;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}
.ncPrev b{display:block;font-size:16px}.ncPrev small{color:rgba(255,255,255,.85)}
.ncFt{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;padding:14px 18px;border-top:1px solid var(--line);background:var(--surface-2)}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

const INTERNAS=k=>!CLI_ABAS.includes(k);
function alertaDe(k,e,m){
  if(k==='sol'&&m.sol)return `${m.sol} pedido${m.sol>1?'s':''} novo${m.sol>1?'s':''}`;
  if(k==='dsp'&&m.np)return `${m.np} despesa${m.np>1?'s':''} a acertar`;
  if(k==='dem'){const n=(e.dem||[]).filter(d=>d[3]==='p-acc').length;if(n)return `${n} em andamento`;}
  if(k==='age'&&m.prox){const n=Math.round((new Date(m.prox.data+'T12:00')-new Date(new Date().toISOString().slice(0,10)+'T12:00'))/864e5);if(n>=0&&n<=7)return n===0?'agenda hoje':n===1?'agenda amanhã':`agenda em ${n} dias`;}
  return '';}
function marcas(k,e,m){
  const al=alertaDe(k,e,m),bell=al?`<span class="al" title="${h(al)}">🔔${al.match(/^\d+/)?' '+al.match(/^\d+/)[0]:''}</span>`:'';
  if(INTERNAS(k))return `<div class="vfMk">${bell}<span class="fc" title="Aba interna: só a FC vê">só FC</span></div>`;
  const on=abasLib(e).includes(k);
  return `<div class="vfMk">${bell}<button type="button" class="${on?'ve':'bl'}" data-abalib="${h(k)}" title="${on?'O cliente vê esta aba. Toque para bloquear.':'O cliente não vê esta aba. Toque para liberar.'}" aria-label="${on?'Bloquear para o cliente':'Liberar para o cliente'}">${on?'👁':'🔒'}</button></div>`;}

function pinta(forca){
  const f=document.getElementById('ficha');if(!f)return;
  if(!ativo()){if(f.classList.contains('vfOn')){f.classList.remove('vfOn');f.querySelectorAll('.vfHero,.vfLeg,.vfGs,.vfVolta').forEach(x=>x.remove());}return;}
  const tg=f.querySelector('.tabg');if(!tg)return;
  if(f.querySelector('.vfHero')&&!forca)return;
  if(ultAt!==at){ultAt=at;modo=tab==='proc'?'home':'aba';homeTab=modo==='home'?tab:null;}
  if(modo==='home'&&tab!==homeTab)modo='aba';
  const e=E[at];let m={};try{m=metricas(at,e);}catch(_){}
  f.classList.add('vfOn');
  f.querySelectorAll('.vfHero,.vfLeg,.vfGs,.vfVolta').forEach(x=>x.remove());
  const fh=f.querySelector('.fh'),body=f.querySelector(':scope > .body');
  if(fh)fh.style.display='none';tg.style.display='none';
  const abas=[...tg.querySelectorAll('button.tab[data-t]')].map(b=>b.dataset.t);
  const cliK=abas.filter(k=>!INTERNAS(k)),lib=cliK.filter(k=>abasLib(e).includes(k)).length;
  const avisos=abas.filter(k=>alertaDe(k,e,m)).length;
  let F=null;try{F=FASES[faseDe(e)];}catch(_){}
  const lk=PORT[at]&&PORT[at].ativo;
  const hero=document.createElement('div');hero.className='vfHero';
  hero.innerHTML=`<div class="lg">${sigla(e)}</div><div style="min-width:0;flex:1"><h2>${h(e.nome)}</h2><div class="s">${h(e.cid||'')}${e.mod?' · '+h(e.mod):''}</div>
    <div class="rs"><span>${h((e.st||[])[1]||'')}</span>${F?`<span>${F[0]} ${h(F[1])}</span>`:''}<span>👁 ${lib} de ${cliK.length} painéis liberados</span>${avisos?`<span>🔔 ${avisos} aviso${avisos>1?'s':''}</span>`:''}</div></div>
   <div class="bts"><button type="button" data-a="lk">🔗 Link do cliente${lk?' ✓':''}</button><button type="button" data-a="ap">👥 Acessos</button><button type="button" data-a="acc">🔐 Liberar painéis</button><button type="button" data-a="cli">Como o cliente vê →</button></div>`;
  const clk=id=>{const b=document.getElementById(id);if(b)b.click();};
  hero.querySelector('[data-a="lk"]').onclick=()=>clk('lkTog');
  hero.querySelector('[data-a="ap"]').onclick=()=>clk('apBtn');
  hero.querySelector('[data-a="acc"]').onclick=()=>{try{abrirAcesso(at);}catch(_){}};
  hero.querySelector('[data-a="cli"]').onclick=()=>clk('vCli');
  f.prepend(hero);
  if(modo==='home'){
    if(body)body.style.display='none';
    const leg=document.createElement('div');leg.className='vfLeg';
    leg.innerHTML='<span>👁 o cliente vê</span><span>🔒 bloqueado para o cliente · toque para liberar</span><span>só FC · aba interna</span><span>🔔 tem algo pendente</span>';
    const gs=document.createElement('div');gs.className='vfGs';
    gs.innerHTML=GRUPOS_ABA.map(([g,ks])=>{const L=ks.filter(k=>abas.includes(k));if(!L.length)return '';
      return `<section class="vfG"><h3>${h(typeof g==='function'?g(e):g)}</h3><div class="vfGrid">${L.map(k=>{const ab=ABAS.find(a=>a[0]===k),tx=lblAba(ab?ab[1]:k,e),mm=tx.match(/^(\S+)\s+(.*)$/),ic=mm?mm[1]:'▪',lb=mm?mm[2]:tx;
        let d=(DESC_ABA[k]||'').trim();if(d.length>90)d=d.slice(0,88).replace(/\s\S*$/,'')+'…';
        const off=!INTERNAS(k)&&!abasLib(e).includes(k);
        return `<div class="vfK${off?' off':''}"><button type="button" class="vfO" data-vf="${h(k)}"><span class="ic" aria-hidden="true">${h(ic)}</span><b>${h(lb)}</b>${d?`<span class="d">${h(d)}</span>`:''}</button>${marcas(k,e,m)}</div>`;}).join('')}</div></section>`;}).join('');
    gs.querySelectorAll('[data-vf]').forEach(b=>b.onclick=()=>{modo='aba';const o=tg.querySelector('button.tab[data-t="'+b.dataset.vf+'"]');if(o)o.click();window.scrollTo({top:0,behavior:'smooth'});});
    const ref=[...f.children].filter(x=>x!==tg&&x!==body&&!x.classList.contains('fh')).pop();
    ref.after(gs);gs.before(leg);
  }else{
    if(body)body.style.display='';
    const ab=ABAS.find(a=>a[0]===tab);
    const v=document.createElement('div');v.className='vfVolta';
    v.innerHTML=`<button type="button">← Todos os cards</button><b>${h(ab?lblAba(ab[1],e):'')}</b>${marcas(tab,e,m)}`;
    v.querySelector('button').onclick=()=>{modo='home';homeTab=tab;pinta(true);window.scrollTo({top:0,behavior:'smooth'});};
    tg.before(v);
  }
}
const ob=new MutationObserver(()=>pinta(false));
const liga=()=>{const f=document.getElementById('ficha');if(f)ob.observe(f,{childList:true});else setTimeout(liga,200);};liga();
document.addEventListener('click',ev=>{if(ev.target.closest&&ev.target.closest('#vFC,#vCli,#crumb'))setTimeout(()=>pinta(true),0);});

/* ---------- Novo cliente ---------- */
const CORES=['#0e7c7b','#7a4bc4','#c2410c','#1d6fb8','#2f8a4c','#b0306a','#8a6d1f','#3d4b5c'];
const ITENS=[['abas','Painéis liberados ao cliente','quais abas o cliente vê no link'],['pcod','Fornecedores da Pesquisa de código','quem o cliente pode pesquisar'],['fluxo','Etapas do fluxo do processo','mesmas frentes e etapas, todas como pendentes'],['vis','Checklist de visita','antes, durante e depois da visita'],['acao','Estrutura do plano de ação','temas e colunas, sem marcações nem anexos']];
function novoCliente(){
  const ks=Object.keys(E);let cor=CORES[(ks.length)%CORES.length],src='';
  const ov=document.createElement('div');ov.className='ncOv';
  ov.innerHTML=`<div class="ncBox" role="dialog" aria-modal="true" aria-labelledby="ncT"><div class="ncHd"><h2 id="ncT">Novo cliente</h2><button type="button" data-x aria-label="Fechar">✕</button></div>
   <div class="ncBd">
    <div class="ncPrev" id="ncPrev"><div class="lg" id="ncLg">NC</div><div><b id="ncNm">Nome da empresa</b><small id="ncSb">Cidade · estado</small></div></div>
    <div class="ncRow"><label class="f">Nome da empresa<input type="text" id="ncNome" placeholder="Ex.: Vidraçaria Exemplo" autocomplete="off"></label><label class="f">Cidade / estado<input type="text" id="ncCid" placeholder="Ex.: Sinop · MT" autocomplete="off"></label></div>
    <label class="f">Modalidade<input type="text" id="ncMd" value="Consultoria presencial" autocomplete="off"></label>
    <div><div class="ncT">Cor da empresa</div><div class="ncCores">${CORES.map(c=>`<button type="button" data-cor="${c}" style="background:${c}" aria-label="Cor ${c}" aria-pressed="${c===cor}"></button>`).join('')}</div></div>
    <div><div class="ncT">Começar de</div><div class="ncMod"><button type="button" data-src="" aria-pressed="true"><span class="av" style="background:var(--muted)">FC</span><span><b>Modelo FC em branco</b><small>abas padrão, sem etapas</small></span></button>${ks.map(k=>`<button type="button" data-src="${h(k)}" aria-pressed="false"><span class="av" style="background:${E[k].c}">${sigla(E[k])}</span><span><b>Copiar de ${h(E[k].nome.split(' · ')[0])}</b><small>${h(E[k].cid||'')}</small></span></button>`).join('')}</div></div>
    <div id="ncCpW" hidden><div class="ncT">O que copiar</div><div class="ncCp">${ITENS.map(([id,t,d])=>`<label><input type="checkbox" data-cp="${id}" checked><span>${t} <small>· ${d}</small></span></label>`).join('')}</div>
     <p class="nota" style="margin:8px 0 0">Não são copiados: logins das pessoas, agenda, horas, despesas, arquivos, fotos, planilhas e pedidos. Isso é de cada empresa.</p></div>
   </div>
   <div class="ncFt"><button class="btn" type="button" data-x>Cancelar</button><button class="btn pri" type="button" id="ncOk">Criar cliente</button></div></div>`;
  document.body.appendChild(ov);
  const $q=s=>ov.querySelector(s);
  const prev=()=>{const n=$q('#ncNome').value.trim();$q('#ncPrev').style.background=cor;$q('#ncLg').style.color=cor;$q('#ncNm').textContent=n||'Nome da empresa';$q('#ncSb').textContent=($q('#ncCid').value.trim()||'Cidade · estado')+(src?' · base: '+E[src].nome.split(' · ')[0]:'');
    $q('#ncLg').textContent=(n?n.split(/\s|·/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase():'NC');};
  const fecha=()=>{ov.remove();document.removeEventListener('keydown',esc_);};
  const esc_=ev=>{if(ev.key==='Escape')fecha();};document.addEventListener('keydown',esc_);
  ov.querySelectorAll('[data-x]').forEach(b=>b.onclick=fecha);ov.onclick=ev=>{if(ev.target===ov)fecha();};
  ov.querySelectorAll('[data-cor]').forEach(b=>b.onclick=()=>{cor=b.dataset.cor;ov.querySelectorAll('[data-cor]').forEach(x=>x.setAttribute('aria-pressed',x===b));prev();});
  ov.querySelectorAll('[data-src]').forEach(b=>b.onclick=()=>{src=b.dataset.src;ov.querySelectorAll('[data-src]').forEach(x=>x.setAttribute('aria-pressed',x===b));$q('#ncCpW').hidden=!src;
    if(src){ov.querySelectorAll('[data-cp]').forEach(c=>{const tem={abas:true,pcod:true,fluxo:(E[src].frentes||[]).length>0,vis:!!E[src].vis,acao:!!E[src].acao}[c.dataset.cp];c.disabled=!tem;c.checked=tem;});}prev();});
  $q('#ncNome').oninput=prev;$q('#ncCid').oninput=prev;prev();setTimeout(()=>$q('#ncNome').focus(),30);
  $q('#ncOk').onclick=()=>{const nome=$q('#ncNome').value.trim();if(!nome){$q('#ncNome').focus();return;}
    const k='e'+Date.now().toString(36),n={nome,cid:$q('#ncCid').value.trim(),c:cor,mod:$q('#ncMd').value.trim()||'Consultoria presencial',st:['p-mut','Novo'],visita:'a definir',frentes:[{n:'Antes da visita',p:[]}],dem:[],vis:{tit:'Próxima visita',prep:[],dur:[],dep:[],ok:{}},arq:[]};
    if(src){const s=JSON.parse(JSON.stringify(E[src])),q=id=>{const c=ov.querySelector('[data-cp="'+id+'"]');return c&&c.checked&&!c.disabled;};
      if(q('abas')){n.abasLib=CLI_ABAS.filter(x=>abasLib(E[src]).includes(x));n.casaMig=true;}
      if(q('pcod'))n.pcodForn=pcodLib(E[src],src).filter(x=>x!=='guapore');
      if(q('fluxo'))n.frentes=s.frentes.map(f=>({n:f.n,p:(f.p||[]).map(p=>['',p[1],''])}));
      if(q('vis'))n.vis={tit:s.vis.tit||'Próxima visita',prep:(s.vis.prep||[]).slice(),dur:(s.vis.dur||[]).slice(),dep:(s.vis.dep||[]).slice(),ok:{}};
      if(q('acao')){const a=s.acao;a.st={};a.anx={};n.acao=a;}
      n.base=src;}
    E[k]=n;at=k;tab='proc';cli=false;fecha();render();salvar(k);window.scrollTo({top:0,behavior:'smooth'});};
}
const nv=document.getElementById('nova');if(nv)nv.onclick=novoCliente;
window.FCVisaoCards={home:()=>{modo='home';homeTab=tab;pinta(true);},novoCliente};
})();
