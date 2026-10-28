/* Plataforma Casa Bandeirante & FC 3D — visual em cards (modelo Guaporé) sobre o link real da CB.
   Usa o login por pessoa e as abas liberadas de cada papel (consultorias.html?e=cb).
   Também aparece em "Como o cliente vê" na Matriz, para conferir. */
(function(){
const EMP='cb',COR='#5b3fc4',COR2='#3c2a8a',CLARO='#efeafd';
const ehCB=()=>{try{return typeof E!=='undefined'&&E[at]&&at===EMP&&cli;}catch(_){return false;}};
let modo='home',homeTab;
const h=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const css=`
#platCapa{position:fixed;inset:0;z-index:9998;background:${COR};display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:24px;color:#fff;cursor:pointer}
#platCapa .lg{width:92px;height:92px;border-radius:22px;background:#fff;color:${COR2};display:flex;align-items:center;justify-content:center;font:800 34px var(--f-h,inherit);margin-bottom:18px}
#platCapa h1{color:#fff;margin:0;font-size:30px}#platCapa p{color:#d8cff7;margin:6px 0 0}
#platCapa .bt{margin-top:28px;background:#fff;color:${COR2};border-radius:12px;padding:12px 28px;font-weight:700;font-size:15px}
#platCapa .wm{position:absolute;bottom:18px;font-size:11px;letter-spacing:.06em;color:#b9acef}
.platHero{background:${COR};color:#fff;border-radius:16px;padding:18px 20px;margin:14px 18px 0;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.platHero .lg{width:46px;height:46px;border-radius:12px;background:#fff;color:${COR2};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px}
.platHero h2{color:#fff;margin:0;font-size:19px}.platHero .s{color:#d8cff7;font-size:13px}
.platHero .bts{margin-left:auto;display:flex;gap:6px}.platHero button{all:unset;cursor:pointer;border:1px solid #8f7ae0;color:#fff;border-radius:999px;padding:6px 13px;font-size:13px;font-weight:600}
.platHero button:hover{background:${COR2}}
.platGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;padding:16px 18px 20px}
.platK{all:unset;box-sizing:border-box;cursor:pointer;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:7px;min-height:118px}
.platK:hover{border-color:${COR};transform:translateY(-1px)}
.platK .ic{width:40px;height:40px;border-radius:10px;background:${CLARO};display:flex;align-items:center;justify-content:center;font-size:20px}
:root[data-theme="dark"] .platK .ic{background:#2b2160}
.platK b{font-size:14.5px;color:var(--fg);line-height:1.25}.platK span.d{font-size:12.5px;color:var(--muted);line-height:1.35}
.platK.dest{border:2px solid ${COR}}
.platVolta{display:flex;align-items:center;gap:10px;padding:12px 18px 0;flex-wrap:wrap}
.platVolta button{all:unset;cursor:pointer;border:1px solid ${COR};color:${COR};border-radius:10px;padding:7px 13px;font-weight:700;font-size:13.5px}
:root[data-theme="dark"] .platVolta button{color:#c9bdf6;border-color:#8f7ae0}
.platVolta b{font-size:15px;color:var(--fg)}
.platOn #cgTools{display:none!important}
.platWm{font-size:11px;color:var(--muted);text-align:center;padding:0 0 14px}
@media (max-width:560px){.platGrid{grid-template-columns:1fr 1fr;gap:9px;padding:12px}.platK{min-height:104px;padding:12px}.platHero{margin:10px 10px 0}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* capa fixa: sempre aparece ao abrir o link da CB */
try{const q=new URLSearchParams(location.search);if((q.get('e')||'').toLowerCase()===EMP){
  const c=document.createElement('div');c.id='platCapa';c.setAttribute('role','button');c.tabIndex=0;
  c.innerHTML=`<div class="lg">CB</div><h1>Casa Bandeirante</h1><p>Plataforma Casa Bandeirante &amp; FC 3D</p><div class="bt">Entrar</div><div class="wm">FC CONSULTORIA EM ESQUADRIA · uso exclusivo</div>`;
  const fecha=()=>{c.remove();const u=document.getElementById('lgU');if(u)u.focus();};
  c.onclick=fecha;c.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' ')fecha();};
  (document.body?document.body.appendChild(c):document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(c)));}}catch(_){}

const tema=()=>{const r=document.documentElement,esc=r.getAttribute('data-theme')!=='dark';r.setAttribute('data-theme',esc?'dark':'light');try{localStorage.setItem('plat-cb-tema',esc?'dark':'light');}catch(_){}pinta(true);};
try{const t=localStorage.getItem('plat-cb-tema');if(t&&new URLSearchParams(location.search).get('e')===EMP)document.documentElement.setAttribute('data-theme',t);}catch(_){}

const nomePapel=()=>{try{return PESSOA?(PAPEL_NOME[PESSOA.papel]||PESSOA.papel):'Visão do cliente';}catch(_){return '';}};
const sair=()=>{const b=document.getElementById('pesSair');if(b)b.click();else location.reload();};

function pinta(forca){
  const f=document.getElementById('ficha');if(!f||!ehCB())return;
  const tg=f.querySelector('.tabg');if(!tg)return;
  if(f.querySelector('.platHero')&&!forca)return;
  f.classList.add('platOn');
  const tAtual=(typeof tab!=='undefined')?tab:null;
  if(homeTab===undefined)homeTab=tAtual;
  if(modo==='home'&&tAtual!==homeTab)modo='aba';
  f.querySelectorAll('.platHero,.platGrid,.platVolta,.platWm').forEach(x=>x.remove());
  const fh=f.querySelector('.fh'),bar=f.querySelector('.cliente-bar'),body=f.querySelector(':scope > .body');
  if(fh)fh.style.display='none';if(bar&&bar.parentElement)bar.parentElement.style.display='none';
  tg.style.display='none';
  const escuro=document.documentElement.getAttribute('data-theme')==='dark';
  const nome=(typeof PESSOA!=='undefined'&&PESSOA)?PESSOA.nome.split(' ')[0]:'equipe';
  const hero=document.createElement('div');hero.className='platHero';
  hero.innerHTML=`<div class="lg">CB</div><div><h2>Olá, ${h(nome)}</h2><div class="s">Plataforma Casa Bandeirante &amp; FC 3D · ${h(nomePapel())}</div></div>
   <div class="bts"><button type="button" data-a="tema">${escuro?'☀ Fundo claro':'🌙 Fundo escuro'}</button>${(typeof PESSOA!=='undefined'&&PESSOA)?'<button type="button" data-a="sair">Sair</button>':''}</div>`;
  hero.querySelector('[data-a="tema"]').onclick=tema;const bs=hero.querySelector('[data-a="sair"]');if(bs)bs.onclick=sair;
  tg.before(hero);
  const btns=[...tg.querySelectorAll('button.tab[data-t]')];
  if(modo==='home'){
    if(body)body.style.display='none';
    const ord=k=>k==='cen'?-1:btns.findIndex(b=>b.dataset.t===k);
    const g=document.createElement('div');g.className='platGrid';
    g.innerHTML=btns.slice().sort((a,b)=>ord(a.dataset.t)-ord(b.dataset.t)).map(b=>{const k=b.dataset.t,tx=b.textContent.trim(),m=tx.match(/^(\S+)\s+(.*)$/),ic=m?m[1]:'▪',lb=m?m[2]:tx;
      let d=(b.getAttribute('title')||'').trim();if(d.length>70)d=d.slice(0,68).replace(/\s\S*$/,'')+'…';
      return `<button type="button" class="platK${k==='cen'?' dest':''}" data-t="${h(k)}"><span class="ic" aria-hidden="true">${h(ic)}</span><b>${h(lb)}</b>${d?`<span class="d">${h(d)}</span>`:''}</button>`;}).join('');
    g.querySelectorAll('.platK').forEach(k=>k.onclick=()=>{modo='aba';const o=btns.find(b=>b.dataset.t===k.dataset.t);if(o)o.click();else pinta(true);window.scrollTo({top:0,behavior:'smooth'});});
    hero.after(g);
    const wm=document.createElement('div');wm.className='platWm';wm.textContent='© FC Consultoria em Esquadria';g.after(wm);
  }else{
    if(body)body.style.display='';
    const atual=btns.find(b=>b.getAttribute('aria-selected')==='true');
    const v=document.createElement('div');v.className='platVolta';
    v.innerHTML=`<button type="button">← Todos os cards</button><b>${h(atual?atual.textContent.trim():'')}</b>`;
    v.querySelector('button').onclick=()=>{modo='home';homeTab=(typeof tab!=='undefined')?tab:null;pinta(true);window.scrollTo({top:0,behavior:'smooth'});};
    hero.after(v);
  }
}
const ob=new MutationObserver(()=>pinta(false));
const liga=()=>{const f=document.getElementById('ficha');if(f)ob.observe(f,{childList:true});else setTimeout(liga,200);};liga();
window.FCPlataformaCB={home:()=>{modo='home';homeTab=(typeof tab!=='undefined')?tab:null;pinta(true);}};
})();
