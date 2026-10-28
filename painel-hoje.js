/* ===== Painel da Matriz · arrumação (28/10/2026) =====
   1. Cabeçalho limpo: título certo, ajustes de uso raro dentro de ⚙ Ajustes, "Para responder" só no número.
   2. Faixa "Hoje": os 🔔 das consultorias (pedidos novos, despesas a acertar, agenda da semana) por empresa, na cor de cada uma.
   3. Números mais úteis: "online agora" (já está no selo On-line) vira "avisos das consultorias"; zero aparece como "em dia".
   4. Plataformas dos clientes agrupadas, com a sigla e a cor de cada empresa.
   © FC Consultoria em Esquadria · uso exclusivo */
(function(){
const h=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CORV={'var(--gb)':'#0e7c7b','var(--cb)':'#7a4bc4','var(--cde)':'#c2410c','var(--accent)':'#1f6fb2','var(--ok)':'#1f8a4c','var(--warn)':'#b45309'};
const cor=c=>CORV[c]||(/^#|^rgb/.test(c||'')?c:'#1f6fb2');
const sig=n=>String(n||'').split(/\s|·/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const css=`
header.mx #cxBtn,header.mx #bAtu,header.mx #bNot{display:none!important}
header.mx .mxutil>span.mxaj{all:unset;position:relative;display:inline-flex;background:none!important;border:0!important;padding:0!important;backdrop-filter:none!important}
header.mx #mxAj{all:unset;cursor:pointer;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);color:#fff;border-radius:999px;padding:7px 13px;font:600 13px var(--f-display,system-ui)}
header.mx #mxAj:hover{background:rgba(255,255,255,.26)}header.mx #mxAj:focus-visible{outline:3px solid #fff;outline-offset:2px}
.mxajp{position:fixed;z-index:400;background:#fff;color:#1b232a;border-radius:14px;box-shadow:0 18px 40px rgba(0,0,0,.25);padding:8px;width:250px;display:flex;flex-direction:column;gap:2px}
.mxajp[hidden]{display:none}
.mxajp>button,.mxajp .mxtw>button{all:unset;box-sizing:border-box;cursor:pointer;display:block;width:100%;padding:9px 11px;border-radius:9px;font:600 13.5px var(--f-display,system-ui)!important;color:#1b232a!important;background:none!important;border:0!important}
.mxajp>button:hover,.mxajp .mxtw>button:hover{background:#eef2f5!important}
.mxajp .mxtw{all:unset;position:relative;display:block}.mxajp .mxpop{right:auto;left:0;top:calc(100% + 4px)}
.mxajp small{display:block;padding:4px 11px 6px;color:#6b7a85;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;font-weight:700}
/* faixa Hoje */
#fcHoje{background:#fff;border-radius:var(--r,16px);box-shadow:var(--sh,0 8px 24px rgba(16,32,48,.07));padding:14px 16px;margin-bottom:14px}
#fcHoje .hjh{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}
#fcHoje .hjh b{font:700 16px var(--f-display,system-ui)}#fcHoje .hjh small{color:var(--muted,#6b7a85);font-size:13px}
#fcHoje .hjh a{margin-left:auto;font:600 13px var(--f-display,system-ui);color:var(--H1,#1f6fb2)}
#fcHoje .hjg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr));gap:10px}
#fcHoje .hjc{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:6px;padding:12px 13px;border-radius:13px;border:1px solid #e3e9ee;border-left:5px solid var(--c);background:color-mix(in srgb,var(--c) 5%,#fff);transition:transform .15s}
#fcHoje .hjc:hover{transform:translateY(-1px);border-color:var(--c)}#fcHoje .hjc:focus-visible{outline:3px solid var(--c);outline-offset:2px}
#fcHoje .hjt{display:flex;align-items:center;gap:9px}#fcHoje .hjt b{font:700 14.5px var(--f-display,system-ui);flex:1;min-width:0}
#fcHoje .av{width:30px;height:30px;border-radius:9px;background:var(--c);color:#fff;display:grid;place-items:center;font:800 11.5px system-ui;flex:none}
#fcHoje .hjl{font-size:13.5px;line-height:1.35;display:flex;gap:7px}#fcHoje .hjl.al{color:#b42318;font-weight:600}
#fcHoje .hjok{font-size:13px;color:#1f8a4c}
#fcHoje .hjvz{font-size:14px;color:#1f8a4c;padding:4px 0}
/* números */
#kpiTop{gap:10px!important}
#kpiTop .kpi{padding:12px 14px!important}#kpiTop .kpi::before{width:38px;height:38px;font-size:18px;border-radius:11px}
#kpiTop .kpi b{font-size:24px!important}#kpiTop .kpi.zero b{font-size:0!important;color:#1f8a4c!important}#kpiTop .kpi.zero b::after{content:'✓ em dia';font-size:20px}
#kpiTop .kpi[data-go="live"]{display:none!important}
/* plataformas */
#hmG .hmt.plat .ic{color:#fff!important;font:800 12px system-ui!important;background:var(--pc)!important}
#hmG .hmt.plat{border-color:color-mix(in srgb,var(--pc) 40%,#fff)!important;background:linear-gradient(180deg,color-mix(in srgb,var(--pc) 9%,#fff),#fff 55%)!important}
html[data-mx=escuro] #fcHoje{background:var(--panel,#151d25)}html[data-mx=escuro] #fcHoje .hjc{background:#1d2731;border-color:#26323d;border-left-color:var(--c)}
html[data-mx=escuro] .mxajp{background:#151d25;color:#e6edf2}html[data-mx=escuro] .mxajp>button,html[data-mx=escuro] .mxajp .mxtw>button{color:#e6edf2!important}
html[data-mx=escuro] .mxajp>button:hover,html[data-mx=escuro] .mxajp .mxtw>button:hover{background:#1d2731!important}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---------- 1. cabeçalho ---------- */
function cab(){const u=document.querySelector('header.mx .mxutil');if(!u){setTimeout(cab,400);return;}
  const eb=document.querySelector('header.mx .eb');if(eb)eb.textContent='Painel da Matriz · FC Consultoria em Esquadria';
  if(document.getElementById('mxAj'))return;
  const w=document.createElement('span');w.className='mxaj';
  w.innerHTML='<button type="button" id="mxAj" aria-haspopup="true" aria-expanded="false">⚙ Ajustes</button><div class="mxajp" hidden role="menu"><small>Ajustes desta tela</small></div>';
  const b=w.querySelector('#mxAj'),p=w.querySelector('.mxajp');
  const tw=u.querySelector('.mxtw');if(tw)p.appendChild(tw);
  [['bAtu','🔄 Atualizar versão nova'],['bNot',null]].forEach(([id,tx])=>{const o=document.getElementById(id);if(!o)return;
    const x=document.createElement('button');x.type='button';x.title=o.title||'';const sync=()=>{x.textContent=tx||o.textContent;};sync();
    new MutationObserver(sync).observe(o,{childList:true,characterData:true,subtree:true});x.onclick=()=>{o.click();setTimeout(sync,300);};p.appendChild(x);});
  b.onclick=ev=>{ev.stopPropagation();const r=b.getBoundingClientRect();p.style.top=(r.bottom+8)+'px';p.style.right=Math.max(8,innerWidth-r.right)+'px';p.hidden=!p.hidden;b.setAttribute('aria-expanded',String(!p.hidden));};
  p.addEventListener('click',ev=>ev.stopPropagation());
  document.addEventListener('click',()=>{p.hidden=true;b.setAttribute('aria-expanded','false');});
  addEventListener('scroll',()=>{p.hidden=true;},{passive:true});
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){p.hidden=true;b.setAttribute('aria-expanded','false');}});
  const fo=document.getElementById('fcOn');(fo&&fo.parentElement===u?fo:u.lastElementChild).before(w);
}
cab();

/* ---------- 2. faixa Hoje + 3. números ---------- */
let AV=0;
function dias(d){const n=Math.round((new Date(d+'T12:00')-new Date(new Date().toLocaleDateString('sv-SE',{timeZone:'America/Cuiaba'})+'T12:00'))/864e5);return n;}
const brl=v=>(+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
async function hoje(){
  if(typeof sb==='undefined')return;const {data:{session}}=await sb.auth.getSession();if(!session)return;
  const kp=document.getElementById('kpiTop');if(!kp)return;
  let box=document.getElementById('fcHoje');
  if(!box){box=document.createElement('section');box.id='fcHoje';box.setAttribute('aria-label','Hoje');kp.before(box);}
  const [r1,r2]=await Promise.all([sb.from('rotina_docs').select('id,data').eq('col','consultoria'),sb.from('cons_solicitacoes').select('empresa_id,status').eq('status','nova')]);
  const E=(r1.data||[]).map(r=>[r.id,r.data||{}]),SOL=r2.data||[];
  AV=0;
  const cards=E.map(([k,e])=>{const L=[];
    const s=SOL.filter(x=>x.empresa_id===k).length;if(s)L.push(['📨',`${s} pedido${s>1?'s':''} novo${s>1?'s':''} do cliente`,1,'sol']);
    const pd=(e.desp||[]).filter(d=>d.quem!=='cliente'&&!d.acertado);if(pd.length)L.push(['💳',`${brl(pd.reduce((a,d)=>a+(+d.valor||0),0))} a acertar (${pd.length} despesa${pd.length>1?'s':''})`,1,'dsp']);
    (e.agenda||[]).filter(a=>!a.feito&&a.data).map(a=>[a,dias(a.data)]).filter(([,n])=>n>=0&&n<=7).sort((x,y)=>x[1]-y[1]).slice(0,2)
      .forEach(([a,n])=>L.push(['🗓',`${n===0?'Hoje':n===1?'Amanhã':'Em '+n+' dias'}${a.hora?' · '+a.hora:''} · ${a.titulo||'agenda'}`,n<=1,'age']));
    const da=(e.dem||[]).filter(d=>d[3]==='p-acc').length;
    AV+=L.filter(x=>x[2]).length;
    return {k,e,L,da};});
  const tem=cards.filter(c=>c.L.length);
  const dt=new Date().toLocaleDateString('pt-BR',{timeZone:'America/Cuiaba',weekday:'long',day:'2-digit',month:'2-digit'});
  box.innerHTML=`<div class="hjh"><b>📌 Hoje</b><small>${h(dt)} · consultorias</small><a href="consultorias.html">Abrir consultorias →</a></div>`+
    (tem.length?`<div class="hjg">${cards.map(({k,e,L,da})=>{const c=cor(e.c),nm=String(e.nome||k).split(' · ')[0];
      return `<button type="button" class="hjc" style="--c:${c}" data-k="${h(k)}" data-t="${h((L.find(x=>x[2])||L[0]||[])[3]||'')}"><span class="hjt"><span class="av">${h(sig(nm))}</span><b>${h(nm)}</b></span>${L.length?L.map(([i,t,al])=>`<span class="hjl${al?' al':''}"><span>${i}</span><span>${h(t)}</span></span>`).join(''):'<span class="hjok">✓ nada pendente</span>'}${da?`<span class="hjl"><span>🔵</span><span>${da} demanda${da>1?'s':''} em andamento</span></span>`:''}</button>`;}).join('')}</div>`
    :`<div class="hjvz">✓ Nenhuma pendência nas consultorias: sem pedidos novos, despesas a acertar ou agenda nos próximos 7 dias.</div>`);
  box.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{location.href='consultorias.html?ver='+encodeURIComponent(b.dataset.k)+(b.dataset.t?'&t='+b.dataset.t:'');});
  kpis();
}
function kpis(){const kp=document.getElementById('kpiTop');if(!kp)return;
  let a=document.getElementById('kpAv');
  if(!a){a=document.createElement('button');a.type='button';a.className='kpi';a.id='kpAv';a.dataset.ic='🔔';a.innerHTML='<b id="nAv">–</b><span>avisos das consultorias</span>';
    a.onclick=()=>{const x=document.getElementById('fcHoje');if(x)x.scrollIntoView({behavior:'smooth',block:'start'});};
    const l=kp.querySelector('[data-go="live"]');(l||kp.lastElementChild).after(a);}
  document.getElementById('nAv').textContent=AV;zeros();}
function zeros(){document.querySelectorAll('#kpiTop .kpi').forEach(k=>{const b=k.querySelector('b');if(b)k.classList.toggle('zero',b.textContent.trim()==='0');});}
setInterval(zeros,1000);
setTimeout(hoje,2500);setInterval(()=>{if(!document.hidden)hoje().catch(()=>{});},60000);

/* ---------- 4. plataformas dos clientes ---------- */
const PLAT=[[/guapor/i,'#0e7c7b','GV'],[/bandeirante/i,'#7a4bc4','CB'],[/cde|espelhos/i,'#c2410c','CDE'],[/fc 3d/i,'#1f6fb2','FC']];
function plataformas(){const G=document.getElementById('hmG');if(!G||G.querySelector('.hms.platS'))return;
  const its=[...G.querySelectorAll('.hmt')].filter(t=>/^Plataforma\b/i.test((t.querySelector('b')||{}).textContent||''));if(!its.length)return;
  const sec1=its[0].closest('.hms');if(!sec1)return;
  const s=document.createElement('div');s.className='hms platS';
  s.innerHTML='<div class="hmh" style="--hc:#7a4bc4">🏢 Plataformas dos clientes</div><div class="hmg"></div>';
  const g=s.querySelector('.hmg');
  its.forEach(t=>{const nm=(t.querySelector('b').textContent||'').replace(/&\s*FC 3D/i,'').replace(/^Plataforma\s*/i,'').trim()||'FC 3D';
    const p=PLAT.find(([re])=>re.test(t.textContent))||[0,'#1f6fb2',sig(nm)];
    t.classList.add('plat');t.style.setProperty('--pc',p[1]);const ic=t.querySelector('.ic');if(ic)ic.textContent=p[2];g.appendChild(t);});
  sec1.after(s);}
/* o Início é redesenhado a cada 15 s: reagrupa sempre que ele muda */
const po=new MutationObserver(()=>{try{plataformas();}catch(_){}});
(function ligaP(){const G=document.getElementById('hmG');if(G){po.observe(G,{childList:true});try{plataformas();}catch(_){}}else setTimeout(ligaP,500);})();
})();
