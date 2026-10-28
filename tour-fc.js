/* Tutorial guiado da FC (legenda + voz), no mesmo formato da Plataforma Guaporé.
   Uso: FCTour.iniciar({titulo:'Tutorial · Compras', passos:[['#seletor','Texto'],...], cor:'#5b3fc4', voz:true, auto:true, aoFim:fn})
   Passos cujo seletor não existe na tela são pulados (texto aparece no centro se o seletor for null). */
(function(){
if(window.FCTour)return;
const st=document.createElement('style');st.textContent=`
.fct-hole{position:fixed;z-index:10001;border-radius:12px;box-shadow:0 0 0 9999px rgba(12,10,30,.62);border:2px solid var(--fct,#5b3fc4);pointer-events:none;transition:all .35s}
.fct-cap{position:fixed;z-index:10002;left:50%;transform:translateX(-50%);bottom:calc(18px + env(safe-area-inset-bottom,0px));width:min(620px,calc(100vw - 24px));background:var(--surface,#fff);color:var(--fg,#111);border-radius:14px;padding:14px 16px;border:1px solid var(--line,#ddd);box-shadow:0 10px 30px rgba(0,0,0,.25);font-family:inherit}
.fct-cap .s{font-size:11px;letter-spacing:.06em;font-weight:700;color:var(--fct,#5b3fc4)}
.fct-cap p{margin:5px 0 12px;font-size:15px;line-height:1.5}
.fct-cap .a{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.fct-cap button{all:unset;cursor:pointer;border:1px solid var(--line,#ccc);border-radius:9px;padding:6px 12px;font-size:13px;font-weight:600;color:var(--fg,#111)}
.fct-cap button.p{background:var(--fct,#5b3fc4);border-color:var(--fct,#5b3fc4);color:#fff}
.fct-cap button[disabled]{opacity:.4;cursor:default}
.fct-bg{position:fixed;inset:0;z-index:10000}`;
document.head.appendChild(st);
let T=null;
const vozes=()=>{try{return speechSynthesis.getVoices();}catch(_){return [];}};vozes();
/* voz feminina em português do Brasil: procura pelos nomes das vozes femininas mais comuns (Windows, Chrome, Android, iPhone, Mac) */
const FEM=/francisca|maria|luciana|fernanda|thalita|leila|manuela|brenda|elza|giovanna|leticia|letícia|yara|camila|vit[oó]ria|raquel|joana|female|feminina|google portugu[eê]s do brasil/i,MASC=/antonio|antônio|daniel|felipe|donato|fabio|fábio|julio|júlio|nicolau|valerio|valério|humberto|\bmale\b|masculin/i;
const vozFem=()=>{const L=vozes().filter(v=>/pt(-|_)BR/i.test(v.lang));return L.find(v=>FEM.test(v.name)&&!MASC.test(v.name))||L.find(v=>!MASC.test(v.name))||L[0]||null;};
function fala(txt,cb){
  try{if(!T||!T.voz||!window.speechSynthesis)throw 0;speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(txt);u.lang='pt-BR';u.rate=1.02;const v=vozFem();if(v){u.voice=v;if(MASC.test(v.name))u.pitch=1.25;}
    u.onend=cb;u.onerror=()=>{if(T)T.timer=setTimeout(cb,6500);};speechSynthesis.speak(u);}
  catch(_){if(T&&T.auto)T.timer=setTimeout(cb,Math.max(5000,txt.length*55));}}
function limpa(){document.querySelectorAll('.fct-hole,.fct-cap,.fct-bg').forEach(x=>x.remove());}
function fim(concluiu){if(!T)return;clearTimeout(T.timer);try{speechSynthesis.cancel();}catch(_){}const f=T.aoFim;T=null;limpa();if(f)try{f(concluiu);}catch(_){}}
function passo(){if(!T)return;clearTimeout(T.timer);
  while(T.i<T.passos.length&&T.passos[T.i][0]&&!document.querySelector(T.passos[T.i][0]))T.i++;
  if(T.i>=T.passos.length){fim(true);return;}
  const [sel,txt]=T.passos[T.i],el=sel?document.querySelector(sel):null;
  if(el)el.scrollIntoView({block:'center',behavior:'smooth'});
  setTimeout(()=>{if(!T)return;limpa();
    const bg=document.createElement('div');bg.className='fct-bg';document.body.appendChild(bg);
    if(el){const r=el.getBoundingClientRect(),hd=document.createElement('div');hd.className='fct-hole';
      Object.assign(hd.style,{left:(r.left-6)+'px',top:(r.top-6)+'px',width:(r.width+12)+'px',height:(r.height+12)+'px'});document.body.appendChild(hd);}
    else bg.style.background='rgba(12,10,30,.62)';
    const tot=T.passos.length,c=document.createElement('div');c.className='fct-cap';c.setAttribute('role','dialog');c.setAttribute('aria-live','polite');
    c.innerHTML=`<div class="s">${T.titulo.toUpperCase()} · ${T.i+1}/${tot}</div><p></p>
      <div class="a"><button type="button" data-k="voz">${T.voz?'🔊 Voz ligada':'🔈 Voz desligada'}</button><button type="button" data-k="auto">${T.auto?'⏸ Pausar':'⏵ Automático'}</button>
      <span style="flex:1"></span><button type="button" data-k="ant" ${T.i?'':'disabled'}>Voltar</button><button type="button" data-k="sair">Sair</button><button type="button" class="p" data-k="prox">${T.i===tot-1?'Concluir':'Próximo'}</button></div>`;
    c.querySelector('p').textContent=txt;document.body.appendChild(c);
    c.querySelector('[data-k="prox"]').onclick=()=>{T.i++;passo();};
    c.querySelector('[data-k="ant"]').onclick=()=>{if(!T.i)return;T.i--;while(T.i>0&&T.passos[T.i][0]&&!document.querySelector(T.passos[T.i][0]))T.i--;passo();};
    c.querySelector('[data-k="sair"]').onclick=()=>fim(false);
    c.querySelector('[data-k="voz"]').onclick=()=>{T.voz=!T.voz;if(!T.voz)try{speechSynthesis.cancel();}catch(_){}passo();};
    c.querySelector('[data-k="auto"]').onclick=()=>{T.auto=!T.auto;passo();};
    if(T.voz||T.auto)fala(txt,()=>{if(T&&T.auto){T.i++;passo();}});
  },380);}
addEventListener('resize',()=>{if(T)passo();});
addEventListener('keydown',e=>{if(T&&e.key==='Escape')fim(false);});
window.FCTour={iniciar(o){if(T)fim(false);T={titulo:o.titulo||'Tutorial',passos:(o.passos||[]).filter(Boolean),i:0,voz:o.voz!==false,auto:o.auto!==false,aoFim:o.aoFim,timer:null};
  document.documentElement.style.setProperty('--fct',o.cor||'#5b3fc4');passo();},
  ativo:()=>!!T,parar:()=>fim(false)};
})();
