/* FC Consultoria em Esquadria · Obra em 3D · Filme da obra
   Abre o link da apresentação com um filme gerado ao vivo a partir do próprio orçamento:
   abertura com a marca da vidraçaria e o nome do cliente, ambiente por ambiente com cada esquadria em 3D
   (folhas abrindo, persiana subindo, fachada se montando), resumo da obra e fechamento. Sem preço.
   Usa o THREE global (r128) e o TIP3D.filme (mesmas tipologias do "Ver em 3D").
   © FC Consultoria em Esquadria (FC Desenvolvimento de Projetos de Compra e Venda LTDA · CNPJ 52.985.682/0001-32) · uso exclusivo */
(function(){
"use strict";
const T=()=>window.THREE;
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ease=x=>x<0?0:x>1?1:x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const easeOut=x=>x<0?0:x>1?1:1-Math.pow(1-x,3);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const nf=(v,d)=>Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:d||0,maximumFractionDigits:d||0});
/* "PORTA DE CORRER - 4 FOLHAS SEQUENCIAIS - COM ABA…" → "Porta de correr · 4 folhas sequenciais" */
const tit=s=>String(s||"").toLowerCase().replace(/(^|\s)(\p{L})/gu,(m,a,b)=>a+b.toUpperCase()).replace(/\b(De|Da|Do|Das|Dos|Com|E|Em|Na|No)\b/g,w=>w.toLowerCase());
function nomeCurto(tp){const p=String(tp||"").split(/\s+-\s+|-\s+(?=[A-ZÁÉÍÓÚ])/).map(x=>x.trim()).filter(Boolean);let n=p.slice(0,2).join(" · ");if(n.length>58)n=p[0];return tit(n.length>58?n.slice(0,56)+"…":n)}
function selos(t){const d=String(t.tipo||"").toUpperCase(),o=[];
 if(t.kind==="atlanta")o.push("Fachada pele de vidro");
 if(t.kind==="seq")o.push("Abertura sequencial");
 if(t.per)o.push(/MOTORIZ/.test(d)?"Persiana motorizada":"Persiana integrada");
 if(/CONTROLE REMOTO/.test(d))o.push("Controle remoto");
 if(/TEMPERADO/.test(String(t.desc||"").toUpperCase()))o.push("Vidro temperado");
 if(/LAMINADO/.test(String(t.desc||"").toUpperCase()))o.push("Vidro laminado");
 return o.slice(0,3)}
function vidroTxt(t){const m=String(t.desc||"").split(" · ")[0];return tit(m.replace(/VIDRO\s*/i,"").replace(/\bincolor\b/i,"incolor"))}

/* ---------- trilha: pad suave gerado no navegador (sem arquivo de música, sem direitos autorais) ---------- */
function Trilha(){let ac=null,master=null,on=true,timer=0,step=0;
 const CH=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]];/* Lá m · Fá · Dó · Sol */
 const hz=n=>440*Math.pow(2,(n-69)/12);
 function nota(f,t0,dur,g){const o=ac.createOscillator(),o2=ac.createOscillator(),v=ac.createGain(),lp=ac.createBiquadFilter();
  o.type="sawtooth";o2.type="triangle";o.frequency.value=f;o2.frequency.value=f*1.003;lp.type="lowpass";lp.frequency.value=900;lp.Q.value=.4;
  v.gain.setValueAtTime(0,t0);v.gain.linearRampToValueAtTime(g,t0+1.2);v.gain.setValueAtTime(g,t0+dur-1.4);v.gain.linearRampToValueAtTime(0,t0+dur+.4);
  o.connect(lp);o2.connect(lp);lp.connect(v);v.connect(master);o.start(t0);o2.start(t0);o.stop(t0+dur+.5);o2.stop(t0+dur+.5)}
 function acorde(){if(!ac)return;const t0=ac.currentTime+.05,c=CH[step%CH.length];c.forEach((n,i)=>nota(hz(n),t0,4.2,.035-i*.006));nota(hz(c[0]-12),t0,4.2,.05);step++}
 return {iniciar(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume();
   master=master||(()=>{const g=ac.createGain();g.gain.value=on?.9:0;g.connect(ac.destination);return g})();
   clearInterval(timer);step=0;acorde();timer=setInterval(acorde,4000)}catch(e){}},
  whoosh(){if(!ac||!on)return;try{const n=ac.sampleRate*.7,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
   const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type="bandpass";f.Q.value=.8;f.frequency.setValueAtTime(400,ac.currentTime);f.frequency.exponentialRampToValueAtTime(2400,ac.currentTime+.6);
   g.gain.value=.05;s.connect(f);f.connect(g);g.connect(master);s.start()}catch(e){}},
  som(v){on=v;if(master)master.gain.setTargetAtTime(v?.9:0,ac.currentTime,.2)},
  parar(){clearInterval(timer);if(master&&ac)master.gain.setTargetAtTime(0,ac.currentTime,.4)},
  ligado:()=>on}}

function css(cor){if(document.getElementById("fm-css"))return;const st=document.createElement("style");st.id="fm-css";st.textContent=`
.fm{position:fixed;inset:0;z-index:2147483000;background:#071316;color:#fff;font-family:"Inter",system-ui,sans-serif;overflow:hidden;opacity:0;transition:opacity .5s}
.fm.on{opacity:1}
.fm-bg{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 38%,var(--fc2) 0%,#0b1d22 55%,#040b0d 100%)}
.fm-bg:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0 1px,transparent 1px 90px),repeating-linear-gradient(0deg,rgba(255,255,255,.02) 0 1px,transparent 1px 90px);mask:radial-gradient(70% 60% at 50% 50%,#000,transparent)}
.fm canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.fm-cut{position:absolute;inset:0;background:#040b0d;opacity:0;pointer-events:none;transition:opacity .35s}
.fm-vh{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55) 100%)}
.fm-lay{position:absolute;inset:0;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px}
.fm-k{font:700 12px Inter,sans-serif;letter-spacing:.32em;text-transform:uppercase;color:var(--fc)}
.fm-h{font:700 clamp(30px,6vw,64px)/1.04 "Space Grotesk",Inter,sans-serif;letter-spacing:-.02em;margin:.25em 0 .2em;text-wrap:balance}
.fm-p{font:500 clamp(14px,1.8vw,18px)/1.4 Inter,sans-serif;color:rgba(255,255,255,.78);max-width:46ch}
.fm-logo{max-height:84px;max-width:min(260px,60vw);object-fit:contain;background:#fff;border-radius:16px;padding:10px 16px;box-shadow:0 18px 60px rgba(0,0,0,.45);margin-bottom:18px}
.fm-line{width:0;height:3px;background:var(--fc);margin:14px auto 0;border-radius:3px;transition:width 1.2s cubic-bezier(.2,.8,.2,1)}
.fm-in>*{opacity:0;transform:translateY(18px);transition:opacity .8s,transform .9s cubic-bezier(.2,.8,.2,1)}
.fm-in.vis>*{opacity:1;transform:none}.fm-in.vis>*:nth-child(2){transition-delay:.15s}.fm-in.vis>*:nth-child(3){transition-delay:.3s}.fm-in.vis>*:nth-child(4){transition-delay:.45s}.fm-in.vis>*:nth-child(5){transition-delay:.6s}
.fm-in.vis .fm-line{width:120px}
.fm-out>*{transition:opacity .45s,transform .5s;opacity:0!important;transform:translateY(-12px)!important}
.fm-amb{justify-content:flex-start;align-items:flex-start;text-align:left;padding:calc(26px + env(safe-area-inset-top,0px)) max(24px,env(safe-area-inset-left,0px))}
.fm-amb .fm-h{font-size:clamp(26px,4.4vw,46px)}
.fm-num{font:700 clamp(54px,9vw,110px)/1 "Space Grotesk",sans-serif;color:transparent;-webkit-text-stroke:1.5px var(--fc);opacity:.9}
.fm-lt{text-align:left;position:absolute;left:max(24px,env(safe-area-inset-left,0px));bottom:calc(86px + env(safe-area-inset-bottom,0px));max-width:min(560px,calc(100% - 48px));pointer-events:none}
.fm-lt .fm-k{font-size:11px}
.fm-lt b{display:block;font:700 clamp(20px,3.2vw,30px)/1.12 "Space Grotesk",sans-serif;margin:6px 0 8px;text-wrap:balance}
.fm-lt .mt{display:flex;flex-wrap:wrap;gap:6px 14px;font:500 13px Inter,sans-serif;color:rgba(255,255,255,.82)}
.fm-lt .mt span:before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--fc);margin-right:7px;vertical-align:middle}
.fm-sl{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.fm-sl i{font:600 11.5px Inter,sans-serif;font-style:normal;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(6px)}
.fm-st{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;width:min(760px,100%);margin-top:22px}
.fm-st div{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:16px 14px;backdrop-filter:blur(8px)}
.fm-st b{display:block;font:700 clamp(26px,4vw,40px)/1 "Space Grotesk",sans-serif}.fm-st span{font:500 12.5px Inter,sans-serif;color:rgba(255,255,255,.7)}
.fm-ui[hidden]{display:none!important}
.fm-ui{position:absolute;left:0;right:0;bottom:0;padding:0 max(18px,env(safe-area-inset-left,0px)) calc(18px + env(safe-area-inset-bottom,0px));display:flex;gap:10px;align-items:center;z-index:3}
.fm-bar{flex:1;height:4px;background:rgba(255,255,255,.18);border-radius:4px;overflow:hidden}.fm-bar i{display:block;height:100%;width:0;background:var(--fc)}
.fm-b{font:600 13px Inter,sans-serif;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:9px 14px;min-height:40px;cursor:pointer;backdrop-filter:blur(8px)}
.fm-b:focus-visible,.fm-go:focus-visible{outline:3px solid #ffd27a;outline-offset:2px}
.fm-go{pointer-events:auto;font:700 16px Inter,sans-serif;color:var(--fc-ink);background:var(--fc);border:0;border-radius:999px;padding:16px 26px;min-height:54px;cursor:pointer;box-shadow:0 14px 40px rgba(0,0,0,.4);display:inline-flex;gap:10px;align-items:center;margin-top:26px}
.fm-go svg{width:18px;height:18px}
.fm-sec{pointer-events:auto;margin-top:12px;font:600 13px Inter,sans-serif;color:rgba(255,255,255,.8);background:none;border:0;text-decoration:underline;cursor:pointer;min-height:40px}
.fm-wm{position:absolute;right:max(18px,env(safe-area-inset-right,0px));top:calc(16px + env(safe-area-inset-top,0px));font:600 9.5px Inter,sans-serif;letter-spacing:.14em;color:rgba(255,255,255,.55);text-align:right;pointer-events:none;z-index:3}
.fm-wm img{display:block;max-height:34px;max-width:120px;margin:0 0 6px auto;background:#fff;border-radius:8px;padding:3px 6px}
@media (max-width:560px){.fm-lt{bottom:calc(78px + env(safe-area-inset-bottom,0px))}.fm-wm{display:none}}
@media (prefers-reduced-motion:reduce){.fm-in>*,.fm-out>*,.fm,.fm-cut{transition:none}}
`;document.head.appendChild(st)}

/* cor de texto legível sobre a cor da marca */
function tinta(hex){const h=String(hex||"#0d5c63").replace("#","");const n=parseInt(h.length===3?h.split("").map(c=>c+c).join(""):h,16);const r=n>>16&255,g=n>>8&255,b=n&255;return (r*299+g*587+b*114)/1000>150?"#10201f":"#fff"}
function clara(hex){/* versão mais viva da cor para destaques sobre o fundo escuro */
 const c=new (T().Color)(hex||"#0d5c63");const hsl={};c.getHSL(hsl);c.setHSL(hsl.h,Math.max(.45,hsl.s),Math.max(.55,hsl.l));return "#"+c.getHexString()}

let F=null;
function abrir(D,op){op=op||{};if(!T()||!window.TIP3D||!TIP3D.filme){if(op.fim)op.fim();return}
 const itens=(D.itens||[]).filter(t=>t&&t.L&&t.H);if(!itens.length){if(op.fim)op.fim();return}
 const cor=D.marcaCor||"#0d5c63",fc=clara(cor);css();
 const d=document.createElement("div");d.className="fm";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-label","Filme da obra");
 d.style.setProperty("--fc",fc);d.style.setProperty("--fc2",cor+"99");d.style.setProperty("--fc-ink",tinta(fc));
 d.innerHTML=`<div class="fm-bg"></div><div class="fm-vh"></div><div class="fm-lay" id="fm-l"></div><div class="fm-cut" id="fm-c"></div>
  <div class="fm-wm">${D.logo?`<img src="${esc(D.logo)}" alt="">`:""}IMAGENS DEMONSTRATIVAS</div>
  <div class="fm-ui" id="fm-ui" hidden><button class="fm-b" type="button" id="fm-pa" aria-label="Pausar">❚❚</button><div class="fm-bar"><i id="fm-pr"></i></div><button class="fm-b" type="button" id="fm-so" aria-label="Som">🔊</button><button class="fm-b" type="button" id="fm-sk">Pular ▸</button></div>`;
 document.body.appendChild(d);document.documentElement.style.overflow="hidden";
 const $=s=>d.querySelector(s),lay=$("#fm-l"),cut=$("#fm-c");
 const r=new (T().WebGLRenderer)({antialias:true,alpha:true});r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
 r.toneMapping=T().ACESFilmicToneMapping;r.toneMappingExposure=1.08;r.shadowMap.enabled=true;r.shadowMap.type=T().PCFSoftShadowMap;if(T().sRGBEncoding)r.outputEncoding=T().sRGBEncoding;r.setClearColor(0,0);
 d.insertBefore(r.domElement,$(".fm-vh"));
 const cam=new (T().PerspectiveCamera)(24,1,.01,300);
 const mus=Trilha();
 F={d,r,cam,s:null,mo:null,raf:0,pausa:false,t:0,last:0,seg:[],idx:-1,mus,fim:op.fim};
 const tam=()=>{const w=innerWidth,h=innerHeight;r.setSize(w,h,false);cam.aspect=w/Math.max(1,h);cam.updateProjectionMatrix()};tam();addEventListener("resize",tam);F.tam=tam;

 /* ---------- cenas 3D ---------- */
 const tirar=()=>{if(F.s){TIP3D.filme.descartar(F.s);F.s=null;F.mo=null}};
 function por(t){tirar();const mo=TIP3D.filme.montar(t,{cor:D.cor});const s=TIP3D.filme.cena(r,Math.max(mo.L,mo.H)+2);
  const ch=new (T().Mesh)(new (T().PlaneGeometry)(mo.L*5,6),new (T().ShadowMaterial)({opacity:.28}));ch.rotation.x=-Math.PI/2;ch.position.y=-mo.H/2-.002;ch.receiveShadow=true;s.add(ch);
  const g=new (T().Group)();g.add(mo.grupo);s.add(g);
  /* peças da fachada: cada uma guarda a posição para entrar voando na montagem */
  const pcs=[];if(t.kind==="atlanta")mo.grupo.children.forEach((c,i)=>{pcs.push({o:c,p:c.position.clone(),d:i})});
  F.s=s;F.mo=mo;F.g=g;F.pcs=pcs;F.dist=TIP3D.filme.enquadrar(cam,mo.L,mo.H,cam.aspect,1.5);return mo}

 /* ---------- textos ---------- */
 const mostra=(html,cls)=>{lay.className="fm-lay "+(cls||"");lay.innerHTML=`<div class="fm-in" style="display:flex;flex-direction:column;align-items:inherit">${html}</div>`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const i=lay.firstChild;if(i)i.classList.add("vis")}))};
 const some=()=>{const i=lay.firstChild;if(i){i.classList.remove("vis");i.classList.add("fm-out")}};
 const corte=(ms)=>{cut.style.opacity=1;setTimeout(()=>{cut.style.opacity=0},ms||380)};

 /* ---------- roteiro ---------- */
 const amb=[];itens.forEach(t=>{const k=String(t.loc||"Obra").trim().toUpperCase();let a=amb.find(x=>x.k===k);if(!a){a={k,nome:tit(t.loc||"Obra"),it:[]};amb.push(a)}a.it.push(t)});
 const n=itens.length,durIt=clamp(48/n,3.4,5.2);
 const area=itens.reduce((s,t)=>s+(+t.L)*(+t.H)*(+t.q||1)/1e6,0),pecas=itens.reduce((s,t)=>s+(+t.q||1),0);
 const S=[];
 /* abertura */
 S.push({dur:5.2,ini(){tirar();mostra(`${D.logo?`<img class="fm-logo" src="${esc(D.logo)}" alt="${esc(D.marca||"")}">`:""}<div class="fm-k">${esc(D.marca||"Apresentação da obra")}</div><div class="fm-h">${esc(D.cliente?tit(D.cliente):D.obra||"Sua obra")}</div><div class="fm-p">${esc([D.obra&&D.obra!==D.cliente?tit(D.obra):"",D.numero?"Proposta "+D.numero:""].filter(Boolean).join(" · "))}</div><div class="fm-line"></div>`)},
  fim(){some()}});
 S.push({dur:2.6,ini(){mostra(`<div class="fm-k">Sua obra em 3D</div><div class="fm-h" style="font-size:clamp(24px,4.4vw,44px)">${n} ${n===1?"esquadria":"esquadrias"} em ${amb.length} ${amb.length===1?"ambiente":"ambientes"}</div><div class="fm-p">${esc(amb.map(a=>a.nome).join(" · "))}</div>`)},fim(){some()}});
 amb.forEach((a,ai)=>{
  S.push({dur:1.9,ini(){tirar();mus.whoosh();mostra(`<div class="fm-num">${String(ai+1).padStart(2,"0")}</div><div class="fm-h">${esc(a.nome)}</div><div class="fm-p">${a.it.length} ${a.it.length===1?"item":"itens"}</div>`)},fim(){some()}});
  a.it.forEach((t,ii)=>S.push({dur:durIt+(t.kind==="atlanta"?1.4:0),t,ini(){corte(420);setTimeout(()=>{if(F&&F.seg[F.idx]===this){por(t);
     lay.className="fm-lay";lay.innerHTML="";
     const lt=document.createElement("div");lt.className="fm-lt fm-in";
     lt.innerHTML=`<div class="fm-k">${esc(a.nome)}${a.it.length>1?" · "+(ii+1)+" de "+a.it.length:""}</div><b>${esc(nomeCurto(t.tipo))}</b><div class="mt"><span>${nf(t.L)} × ${nf(t.H)} mm</span>${t.q>1?`<span>${t.q} peças</span>`:""}${t.linha?`<span>Linha ${esc(tit(t.linha))}</span>`:""}<span>Vidro ${esc(vidroTxt(t))}</span></div>${selos(t).length?`<div class="fm-sl">${selos(t).map(x=>`<i>${esc(x)}</i>`).join("")}</div>`:""}`;
     lay.appendChild(lt);requestAnimationFrame(()=>requestAnimationFrame(()=>lt.classList.add("vis")))}},200)},
   quadro(p){if(!F.mo)return;const mo=F.mo,t=this.t;
    /* câmera: chega de lado e gira devagar para a frente */
    const ang=-.62+ease(p)*.82,dist=F.dist*(1.18-.16*easeOut(p*1.4)),y=mo.H*.06+dist*.05;
    cam.position.set(Math.sin(ang)*dist,y,Math.cos(ang)*dist);cam.lookAt(0,-mo.H*.02,0);
    /* entrada: sobe do piso e encaixa */
    F.g.position.y=-(1-easeOut(p/.18))*.25;
    if(t.kind==="atlanta"&&F.pcs.length){/* a fachada se monta: estrutura primeiro, vidros por último */
     const N=F.pcs.length;F.pcs.forEach(q=>{const k=ease(clamp((p-.06-q.d/N*.5)/.22,0,1));q.o.position.set(q.p.x,q.p.y+(1-k)*.9,q.p.z+(1-k)*1.6);q.o.visible=k>0.001})}
    else{const k=p<.35?0:p<.62?ease((p-.35)/.27):p<.82?1:1-ease((p-.82)/.18);if(mo.temMovel)mo.animar(k*.9);
     if(mo.per){/* persiana: sobe, mostra a porta abrindo e desce de novo no fim */
      const pu=p<.12?.66:p<.34?.66+.34*ease((p-.12)/.22):p<.8?1:1-.34*ease((p-.8)/.2);mo.per(pu)}}},
   fim(){const lt=lay.querySelector(".fm-lt");if(lt){lt.classList.remove("vis");lt.classList.add("fm-out")}}}));
 });
 /* resumo */
 S.push({dur:4.6,ini(){corte(500);setTimeout(()=>{if(F&&F.seg[F.idx]===this){tirar();
   const corP=tit(String(D.cor||itens[0].corPerfil||"").replace(/PINTURA ELETROST[ÁA]TICA\s*/i,"").split(" - ")[0]);
   mostra(`<div class="fm-k">Resumo da obra</div><div class="fm-h" style="font-size:clamp(26px,4.6vw,48px)">Tudo pensado para o seu projeto</div>
    <div class="fm-st"><div><b data-n="${pecas}">0</b><span>${pecas===1?"esquadria":"esquadrias"}</span></div><div><b data-n="${area.toFixed(1)}" data-d="1">0</b><span>m² de esquadrias</span></div><div><b data-n="${amb.length}">0</b><span>${amb.length===1?"ambiente":"ambientes"}</span></div>${corP?`<div><b style="font-size:clamp(18px,2.6vw,24px);line-height:1.15">${esc(corP)}</b><span>acabamento dos perfis</span></div>`:""}</div>`);
   const t0=performance.now();const nums=lay.querySelectorAll("[data-n]");const up=()=>{if(!F)return;const k=easeOut((performance.now()-t0)/1600);nums.forEach(b=>{b.textContent=nf(+b.dataset.n*k,+b.dataset.d||0)});if(k<1)requestAnimationFrame(up)};up()}},250)},fim(){some()}});
 /* fechamento */
 S.push({dur:999,final:true,ini(){tirar();mus.parar();$("#fm-ui").hidden=true;
  mostra(`${D.logo?`<img class="fm-logo" src="${esc(D.logo)}" alt="">`:""}<div class="fm-k">${esc(D.marca||"")}</div><div class="fm-h" style="font-size:clamp(26px,4.6vw,48px)">Agora é com você</div><div class="fm-p">Veja cada esquadria em 3D, gire, abra as folhas e confira os detalhes da sua obra.</div>
   <button class="fm-go" type="button" id="fm-ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Ver a apresentação completa</button>
   <button class="fm-sec" type="button" id="fm-re">↺ Assistir de novo</button>
   <div class="fm-p" style="font-size:11.5px;margin-top:22px;color:rgba(255,255,255,.55)">Imagens demonstrativas · Desenvolvido por FC Consultoria em Esquadria</div>`);
  setTimeout(()=>{const ok=$("#fm-ok"),re=$("#fm-re");if(ok){ok.onclick=fechar;ok.focus()}if(re)re.onclick=()=>comecar(true)},60)}});
 F.seg=S;const total=S.filter(s=>!s.final).reduce((a,s)=>a+s.dur,0);

 /* ---------- relógio ---------- */
 function irPara(i){const a=F.seg[F.idx];if(a&&a.fim)a.fim();F.idx=i;F.t0=F.t;const b=F.seg[i];if(b&&b.ini)b.ini.call(b)}
 function passo(now,fixo){if(!F)return;if(!fixo)F.raf=requestAnimationFrame(passo);const dt=fixo||Math.min(.05,(now-(F.last||now))/1000);F.last=now;
  if(!F.pausa&&F.idx>=0){F.t+=dt;let s=F.seg[F.idx];if(!s.final&&F.t-F.t0>=s.dur)irPara(F.idx+1);s=F.seg[F.idx];
   const p=clamp((F.t-F.t0)/s.dur,0,1);if(s.quadro)s.quadro.call(s,p);$("#fm-pr").style.width=Math.min(100,F.t/total*100)+"%"}
  /* a esquadria fica deslocada do texto: para a direita na tela deitada, para cima no celular em pé */
  if(F.s){const w=innerWidth,h=innerHeight;if(w>=h*1.05)cam.setViewOffset(w,h,-w*.14,0,w,h);else cam.setViewOffset(w,h,0,h*.11,w,h);r.render(F.s,cam)}else r.clear()}
 function comecar(som){$("#fm-ui").hidden=false;if(som)mus.iniciar();F.t=0;F.last=0;F.idx=-1;irPara(0)}
 function fechar(){if(!F)return;const f=F;F=null;cancelAnimationFrame(f.raf);f.mus.parar();removeEventListener("resize",f.tam);d.classList.remove("on");
  setTimeout(()=>{if(f.s)TIP3D.filme.descartar(f.s);f.r.dispose();d.remove();document.documentElement.style.overflow="";if(f.fim)f.fim()},500)}
 F.fechar=fechar;
 $("#fm-pa").onclick=e=>{F.pausa=!F.pausa;e.currentTarget.textContent=F.pausa?"▶":"❚❚";e.currentTarget.setAttribute("aria-label",F.pausa?"Continuar":"Pausar")};
 $("#fm-so").onclick=e=>{const v=!mus.ligado();mus.som(v);e.currentTarget.textContent=v?"🔊":"🔇"};
 $("#fm-sk").onclick=()=>irPara(F.seg.length-1);
 d.addEventListener("keydown",e=>{if(e.key==="Escape")fechar();if(e.key===" "&&F&&F.idx>=0&&!F.seg[F.idx].final){e.preventDefault();$("#fm-pa").click()}});

 /* capa: o toque no play libera o som (o navegador só deixa tocar depois de um toque) */
 mostra(`${D.logo?`<img class="fm-logo" src="${esc(D.logo)}" alt="${esc(D.marca||"")}">`:""}<div class="fm-k">${esc(D.marca||"Apresentação da obra")}</div><div class="fm-h">${esc(D.cliente?tit(D.cliente):"Sua obra")}</div><div class="fm-p">Preparamos um filme da sua obra em 3D, com cada esquadria do seu projeto.</div>
  <button class="fm-go" type="button" id="fm-play"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>Assistir à apresentação</button>
  <button class="fm-sec" type="button" id="fm-pular">Ir direto para a proposta</button>`);
 setTimeout(()=>{const pl=$("#fm-play");if(pl){pl.onclick=()=>{some();setTimeout(()=>comecar(true),450)};pl.focus()}const pu=$("#fm-pular");if(pu)pu.onclick=fechar},60);
 requestAnimationFrame(()=>d.classList.add("on"));
 /* gravação quadro a quadro (gerar o MP4): window.__fmTick(dt) avança o filme num passo fixo */
 if(window.__FM_MANUAL){window.__fmTick=dt=>passo(0,dt);window.__fmPlay=()=>{comecar(true)}}else F.raf=requestAnimationFrame(passo);
}
window.FILME={abrir};
})();
