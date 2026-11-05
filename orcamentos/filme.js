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
  destino(){if(!ac)return null;const ds=ac.createMediaStreamDestination();master.connect(ds);return ds},
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
.fm-rec{position:absolute;left:50%;top:calc(16px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:4;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:8px 14px;font:600 13px Inter,sans-serif;display:flex;gap:8px;align-items:center}.fm-rec i{width:10px;height:10px;border-radius:50%;background:#e53935;animation:fmp 1s infinite}@keyframes fmp{50%{opacity:.3}}
.fm.grav canvas{object-fit:contain}
.fm-dl{pointer-events:auto;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:14px}
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
 const corte=(ms)=>{cut.style.opacity=1;setTimeout(()=>{cut.style.opacity=0},ms||380);F.cut0=F.t;F.cutMs=(ms||380)/1000};
 /* o que está escrito na tela também vai para o vídeo baixado (desenhado no quadro) */
 const cap=(pos,L,extra)=>{F.cap=Object.assign({pos,L,t0:F.t+(pos==="lt"?.25:0),out:null},extra||{})};
 const tiraCap=()=>{if(F.cap&&F.cap.out==null)F.cap.out=F.t};
 let LOGO=null;if(D.logo){const im=new Image();im.crossOrigin="anonymous";im.onload=()=>{LOGO=im};im.src=D.logo}

 /* ---------- roteiro ---------- */
 const amb=[];itens.forEach(t=>{const k=String(t.loc||"Obra").trim().toUpperCase();let a=amb.find(x=>x.k===k);if(!a){a={k,nome:tit(t.loc||"Obra"),it:[]};amb.push(a)}a.it.push(t)});
 const n=itens.length,durIt=clamp(48/n,3.4,5.2);
 const area=itens.reduce((s,t)=>s+(+t.L)*(+t.H)*(+t.q||1)/1e6,0),pecas=itens.reduce((s,t)=>s+(+t.q||1),0);
 const S=[];
 /* abertura */
 S.push({dur:5.2,ini(){tirar();cap("c",[["k",D.marca||"Apresentação da obra"],["h",D.cliente?tit(D.cliente):D.obra||"Sua obra"],["p",[D.obra&&D.obra!==D.cliente?tit(D.obra):"",D.numero?"Proposta "+D.numero:""].filter(Boolean).join(" · ")]],{logo:true,linha:true});mostra(`${D.logo?`<img class="fm-logo" src="${esc(D.logo)}" alt="${esc(D.marca||"")}">`:""}<div class="fm-k">${esc(D.marca||"Apresentação da obra")}</div><div class="fm-h">${esc(D.cliente?tit(D.cliente):D.obra||"Sua obra")}</div><div class="fm-p">${esc([D.obra&&D.obra!==D.cliente?tit(D.obra):"",D.numero?"Proposta "+D.numero:""].filter(Boolean).join(" · "))}</div><div class="fm-line"></div>`)},
  fim(){some();tiraCap()}});
 S.push({dur:2.6,ini(){cap("c",[["k","Sua obra em 3D"],["h2",`${n} ${n===1?"esquadria":"esquadrias"} em ${amb.length} ${amb.length===1?"ambiente":"ambientes"}`],["p",amb.map(a=>a.nome).join(" · ")]]);mostra(`<div class="fm-k">Sua obra em 3D</div><div class="fm-h" style="font-size:clamp(24px,4.4vw,44px)">${n} ${n===1?"esquadria":"esquadrias"} em ${amb.length} ${amb.length===1?"ambiente":"ambientes"}</div><div class="fm-p">${esc(amb.map(a=>a.nome).join(" · "))}</div>`)},fim(){some();tiraCap()}});
 amb.forEach((a,ai)=>{
  S.push({dur:1.9,ini(){tirar();mus.whoosh();cap("c",[["num",String(ai+1).padStart(2,"0")],["h",a.nome],["p",a.it.length+" "+(a.it.length===1?"item":"itens")]]);mostra(`<div class="fm-num">${String(ai+1).padStart(2,"0")}</div><div class="fm-h">${esc(a.nome)}</div><div class="fm-p">${a.it.length} ${a.it.length===1?"item":"itens"}</div>`)},fim(){some();tiraCap()}});
  a.it.forEach((t,ii)=>S.push({dur:durIt+(t.kind==="atlanta"?1.4:0),t,ini(){corte(420);F.cap=null;cap("lt",[["k",a.nome+(a.it.length>1?" · "+(ii+1)+" de "+a.it.length:"")],["h3",nomeCurto(t.tipo)],["m",[nf(t.L)+" × "+nf(t.H)+" mm",t.q>1?t.q+" peças":"",t.linha?"Linha "+tit(t.linha):"","Vidro "+vidroTxt(t)].filter(Boolean)],["sl",selos(t)]]);setTimeout(()=>{if(F&&F.seg[F.idx]===this){por(t);
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
   fim(){tiraCap();const lt=lay.querySelector(".fm-lt");if(lt){lt.classList.remove("vis");lt.classList.add("fm-out")}}}));
 });
 /* resumo */
 S.push({dur:4.6,ini(){corte(500);setTimeout(()=>{if(F&&F.seg[F.idx]===this){tirar();
   const corP0=tit(String(D.cor||itens[0].corPerfil||"").replace(/PINTURA ELETROST[ÁA]TICA\s*/i,"").split(" - ")[0]);
   const corP=corP0;cap("c",[["k","Resumo da obra"],["h2","Tudo pensado para o seu projeto"],["st",[[pecas,0,pecas===1?"esquadria":"esquadrias"],[+area.toFixed(1),1,"m² de esquadrias"],[amb.length,0,amb.length===1?"ambiente":"ambientes"]].concat(corP?[[corP,-1,"acabamento dos perfis"]]:[])]]);
   mostra(`<div class="fm-k">Resumo da obra</div><div class="fm-h" style="font-size:clamp(26px,4.6vw,48px)">Tudo pensado para o seu projeto</div>
    <div class="fm-st"><div><b data-n="${pecas}">0</b><span>${pecas===1?"esquadria":"esquadrias"}</span></div><div><b data-n="${area.toFixed(1)}" data-d="1">0</b><span>m² de esquadrias</span></div><div><b data-n="${amb.length}">0</b><span>${amb.length===1?"ambiente":"ambientes"}</span></div>${corP?`<div><b style="font-size:clamp(18px,2.6vw,24px);line-height:1.15">${esc(corP)}</b><span>acabamento dos perfis</span></div>`:""}</div>`);
   const t0=performance.now();const nums=lay.querySelectorAll("[data-n]");const up=()=>{if(!F)return;const k=easeOut((performance.now()-t0)/1600);nums.forEach(b=>{b.textContent=nf(+b.dataset.n*k,+b.dataset.d||0)});if(k<1)requestAnimationFrame(up)};up()}},250)},fim(){some();tiraCap()}});
 /* fechamento */
 S.push({dur:999,final:true,ini(){tirar();mus.parar();$("#fm-ui").hidden=true;
  cap("c",[["k",D.marca||""],["h2","Sua obra, do projeto à realidade"],["p","Veja cada esquadria em 3D no link da apresentação."],["s","Imagens demonstrativas · Desenvolvido por FC Consultoria em Esquadria"]],{logo:true});
  if(F.rec){F.rec.fimT=F.t;}
  mostra(`${D.logo?`<img class="fm-logo" src="${esc(D.logo)}" alt="">`:""}<div class="fm-k">${esc(D.marca||"")}</div><div class="fm-h" style="font-size:clamp(26px,4.6vw,48px)">Agora é com você</div><div class="fm-p">Veja cada esquadria em 3D, gire, abra as folhas e confira os detalhes da sua obra.</div>
   <button class="fm-go" type="button" id="fm-ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Ver a apresentação completa</button>
   <div class="fm-dl" id="fm-dl">${podeGravar()?`<button class="fm-b" type="button" id="fm-bx">⬇ Baixar o vídeo</button>`:""}<button class="fm-b" type="button" id="fm-re">↺ Assistir de novo</button></div>
   <div class="fm-p" style="font-size:11.5px;margin-top:22px;color:rgba(255,255,255,.55)">Imagens demonstrativas · Desenvolvido por FC Consultoria em Esquadria</div>`);
  setTimeout(()=>{const ok=$("#fm-ok"),re=$("#fm-re");if(ok){ok.onclick=fechar;ok.focus()}if(re)re.onclick=()=>comecar(true);const bx=$("#fm-bx");if(bx)bx.onclick=gravar},60)}});
 F.seg=S;const total=S.filter(s=>!s.final).reduce((a,s)=>a+s.dur,0);

 /* ---------- relógio ---------- */
 function irPara(i){const a=F.seg[F.idx];if(a&&a.fim)a.fim();F.idx=i;F.t0=F.t;const b=F.seg[i];if(b&&b.ini)b.ini.call(b)}
 function passo(now,fixo){if(!F)return;if(!fixo)F.raf=requestAnimationFrame(passo);const dt=fixo||Math.min(.05,(now-(F.last||now))/1000);F.last=now;
  if(!F.pausa&&F.idx>=0){F.t+=dt;let s=F.seg[F.idx];if(!s.final&&F.t-F.t0>=s.dur)irPara(F.idx+1);s=F.seg[F.idx];
   const p=clamp((F.t-F.t0)/s.dur,0,1);if(s.quadro)s.quadro.call(s,p);$("#fm-pr").style.width=Math.min(100,F.t/total*100)+"%"}
  /* a esquadria fica deslocada do texto: para a direita na tela deitada, para cima no celular em pé */
  if(F.s){const w=innerWidth,h=innerHeight;const G=F.rec;const w2=G?1280:w,h2=G?720:h;if(G){if(w2>=h2)cam.setViewOffset(w2,h2,-w2*.14,0,w2,h2)}else if(w>=h*1.05)cam.setViewOffset(w,h,-w*.14,0,w,h);else cam.setViewOffset(w,h,0,h*.11,w,h);r.render(F.s,cam)}else r.clear();
  if(F.rec){compor();if(F.rec.fimT!=null&&F.t-F.rec.fimT>3.2&&F.rec.mr.state==="recording")F.rec.mr.stop()}}
 function comecar(som){$("#fm-ui").hidden=false;if(som)mus.iniciar();F.t=0;F.last=0;F.idx=-1;irPara(0)}
 function fechar(){if(!F)return;const f=F;F=null;cancelAnimationFrame(f.raf);f.mus.parar();removeEventListener("resize",f.tam);d.classList.remove("on");
  setTimeout(()=>{if(f.s)TIP3D.filme.descartar(f.s);f.r.dispose();d.remove();document.documentElement.style.overflow="";if(f.fim)f.fim()},500)}
 F.fechar=fechar;
 /* ---------- baixar o vídeo: o filme roda uma vez e é gravado (imagem + trilha) direto no navegador ---------- */
 function podeGravar(){return !!(window.MediaRecorder&&HTMLCanvasElement.prototype.captureStream)}
 function tipoVideo(){const L=["video/mp4;codecs=avc1.42E01E,mp4a.40.2","video/mp4;codecs=avc1","video/mp4","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"];return L.find(t=>MediaRecorder.isTypeSupported(t))||""}
 function gravar(){if(!podeGravar())return;const W=1280,H=720,cv=document.createElement("canvas");cv.width=W;cv.height=H;
  const ctx=cv.getContext("2d");r.setPixelRatio(1);r.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();d.classList.add("grav");
  mus.iniciar();const st=cv.captureStream(30),ds=mus.destino();if(ds&&mus.ligado())ds.stream.getAudioTracks().forEach(t=>st.addTrack(t));
  const tp=tipoVideo();let mr;try{mr=new MediaRecorder(st,tp?{mimeType:tp,videoBitsPerSecond:6e6}:{videoBitsPerSecond:6e6})}catch(e){alert("Este navegador não consegue gravar o vídeo. Tente pelo Chrome.");return}
  const ch=[];mr.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data)};
  mr.onstop=()=>{const tipo=(mr.mimeType||tp||"video/webm").split(";")[0],ext=/mp4/.test(tipo)?"mp4":"webm",blob=new Blob(ch,{type:tipo});
   const nome=("Filme da obra - "+(D.cliente?tit(D.cliente):D.obra||"obra")).replace(/[\\/:*?"<>|]+/g,"")+"."+ext;
   const g=F&&F.rec;if(F){F.rec=null;d.classList.remove("grav");r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));tam();const rc=$("#fm-rec");if(rc)rc.remove()}
   const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=nome;document.body.appendChild(a);a.click();a.remove();
   const dl=$("#fm-dl");if(dl){const fl=new File([blob],nome,{type:tipo});const comp=navigator.canShare&&navigator.canShare({files:[fl]});
    dl.insertAdjacentHTML("afterbegin",`<a class="fm-b" href="${url}" download="${esc(nome)}" style="text-decoration:none">⬇ Vídeo pronto · baixar de novo</a>${comp?`<button class="fm-b" type="button" id="fm-sh">📤 Enviar (WhatsApp…)</button>`:""}`);
    const sh=$("#fm-sh");if(sh)sh.onclick=()=>navigator.share({files:[fl],title:nome}).catch(()=>{});
    if(ext!=="mp4")dl.insertAdjacentHTML("beforeend",`<div class="fm-p" style="font-size:12px;flex-basis:100%">Este navegador grava em .webm. Para WhatsApp, prefira baixar pelo celular (Chrome ou Safari atualizados), que gravam em .mp4.</div>`)}};
  F.rec={mr,cv,ctx,W,H,fimT:null};mr.start(500);
  d.insertAdjacentHTML("beforeend",`<div class="fm-rec" id="fm-rec"><i></i>Gravando o vídeo… deixe esta tela aberta até o fim</div>`);
  const bx=$("#fm-bx");if(bx)bx.disabled=true;comecar(true);$("#fm-ui").hidden=true}
 /* desenha o quadro do vídeo: fundo na cor da marca, o 3D e os textos que aparecem na tela */
 const wrap=(c,txt,max)=>{const w=String(txt||"").split(" "),L=[];let l="";w.forEach(x=>{const t=l?l+" "+x:x;if(c.measureText(t).width>max&&l){L.push(l);l=x}else l=t});if(l)L.push(l);return L};
 function compor(){const G=F.rec,c=G.ctx,W=G.W,H=G.H;
  const gr=c.createRadialGradient(W/2,H*.38,0,W/2,H*.38,W*.75);gr.addColorStop(0,cor);gr.addColorStop(.55,"#0b1d22");gr.addColorStop(1,"#040b0d");c.globalAlpha=1;c.fillStyle="#071316";c.fillRect(0,0,W,H);c.globalAlpha=.6;c.fillStyle=gr;c.fillRect(0,0,W,H);c.globalAlpha=1;
  if(F.s)c.drawImage(r.domElement,0,0,W,H);
  const vg=c.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,W*.75);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,.55)");c.fillStyle=vg;c.fillRect(0,0,W,H);
  const k=F.cap;if(k){const a=clamp((F.t-k.t0)/.7,0,1)*(k.out==null?1:clamp(1-(F.t-k.out)/.45,0,1)),dy=(1-easeOut(clamp((F.t-k.t0)/.8,0,1)))*16;
   if(a>0){c.save();c.globalAlpha=a;c.textBaseline="alphabetic";const DS='"Space Grotesk",Inter,sans-serif',TX="Inter,sans-serif";
    if(k.pos==="c"){c.textAlign="center";let blocos=[];
     if(k.logo&&LOGO){const lh=70,lw=Math.min(240,LOGO.width*lh/LOGO.height);blocos.push({h:lh+30,d:y=>{c.fillStyle="#fff";const x=W/2-lw/2-14;c.beginPath();c.roundRect?c.roundRect(x,y,lw+28,lh+16,14):c.rect(x,y,lw+28,lh+16);c.fill();c.drawImage(LOGO,W/2-lw/2,y+8,lw,lh)}})}
     k.L.forEach(([t,v])=>{if(t==="k"){c.font="700 15px "+TX;blocos.push({h:30,d:y=>{c.fillStyle=fc;c.letterSpacing="6px";c.fillText(String(v).toUpperCase(),W/2,y+18);c.letterSpacing="0px"}})}
      else if(t==="h"||t==="h2"){const fs=t==="h"?66:50;c.font="700 "+fs+"px "+DS;const ls=wrap(c,v,W*.8);blocos.push({h:ls.length*fs*1.06+10,d:y=>{c.fillStyle="#fff";c.font="700 "+fs+"px "+DS;ls.forEach((l,i)=>c.fillText(l,W/2,y+fs*.9+i*fs*1.06))}})}
      else if(t==="num"){blocos.push({h:110,d:y=>{c.font="700 110px "+DS;c.strokeStyle=fc;c.lineWidth=2;c.strokeText(v,W/2,y+96)}})}
      else if(t==="p"&&v){c.font="500 20px "+TX;const ls=wrap(c,v,W*.62);blocos.push({h:ls.length*28+6,d:y=>{c.fillStyle="rgba(255,255,255,.8)";c.font="500 20px "+TX;ls.forEach((l,i)=>c.fillText(l,W/2,y+22+i*28))}})}
      else if(t==="s"){blocos.push({h:40,d:y=>{c.fillStyle="rgba(255,255,255,.55)";c.font="500 14px "+TX;c.fillText(v,W/2,y+32)}})}
      else if(t==="st"){const n=v.length,bw=Math.min(210,(W*.8-(n-1)*16)/n),x0=W/2-(n*bw+(n-1)*16)/2,pk=easeOut(clamp((F.t-k.t0-.25)/1.6,0,1));
       blocos.push({h:120,d:y=>{v.forEach(([val,dd,lab],i)=>{const x=x0+i*(bw+16);c.fillStyle="rgba(255,255,255,.07)";c.strokeStyle="rgba(255,255,255,.16)";c.lineWidth=1;c.beginPath();c.roundRect?c.roundRect(x,y+14,bw,96,16):c.rect(x,y+14,bw,96);c.fill();c.stroke();
        c.fillStyle="#fff";c.textAlign="center";if(dd<0){c.font="700 20px "+DS;wrap(c,val,bw-20).slice(0,2).forEach((l,j)=>c.fillText(l,x+bw/2,y+52+j*24))}else{c.font="700 40px "+DS;c.fillText(nf(val*pk,dd),x+bw/2,y+64)}
        c.font="500 14px "+TX;c.fillStyle="rgba(255,255,255,.7)";c.fillText(lab,x+bw/2,y+94)})}})}});
     if(k.linha)blocos.push({h:24,d:y=>{c.fillStyle=fc;const lw=120*easeOut(clamp((F.t-k.t0-.4)/1.2,0,1));c.fillRect(W/2-lw/2,y+12,lw,3)}});
     const tot=blocos.reduce((s,b)=>s+b.h,0);let y=H/2-tot/2+dy;blocos.forEach(b=>{b.d(y);y+=b.h})}
    else{c.textAlign="left";const x=40;let y=H-120+dy;const it=Object.fromEntries(k.L);c.font="700 30px "+DS;const ls=wrap(c,it.h3,620);const sl=(it.sl||[]).length?34:0;y-=ls.length*34+sl;
     c.font="700 13px "+TX;c.fillStyle=fc;c.letterSpacing="4px";c.fillText(String(it.k).toUpperCase(),x,y);c.letterSpacing="0px";y+=10;
     c.fillStyle="#fff";c.font="700 30px "+DS;ls.forEach(l=>{y+=34;c.fillText(l,x,y)});y+=28;
     c.font="500 15px "+TX;let xx=x;(it.m||[]).forEach(m=>{c.fillStyle=fc;c.beginPath();c.arc(xx+3,y-5,3,0,7);c.fill();c.fillStyle="rgba(255,255,255,.85)";c.fillText(m,xx+12,y);xx+=c.measureText(m).width+30});
     if(sl){y+=16;xx=x;c.font="600 13px "+TX;it.sl.forEach(s2=>{const w=c.measureText(s2).width+22;c.fillStyle="rgba(255,255,255,.12)";c.strokeStyle="rgba(255,255,255,.25)";c.beginPath();c.roundRect?c.roundRect(xx,y,w,26,13):c.rect(xx,y,w,26);c.fill();c.stroke();c.fillStyle="#fff";c.fillText(s2,xx+11,y+18);xx+=w+8})}}
    c.restore()}}
  /* corte preto entre as cenas */
  if(F.cut0!=null){const q=(F.t-F.cut0)/F.cutMs;if(q>=0&&q<1.4){c.fillStyle="rgba(4,11,13,"+(q<1?1:1-(q-1)/.4)+")";c.fillRect(0,0,W,H)}}
  c.font="600 12px Inter,sans-serif";c.fillStyle="rgba(255,255,255,.55)";c.textAlign="right";c.fillText("IMAGENS DEMONSTRATIVAS",W-24,32)}
 $("#fm-pa").onclick=e=>{F.pausa=!F.pausa;e.currentTarget.textContent=F.pausa?"▶":"❚❚";e.currentTarget.setAttribute("aria-label",F.pausa?"Continuar":"Pausar")};
 $("#fm-so").onclick=e=>{const v=!mus.ligado();mus.som(v);e.currentTarget.textContent=v?"🔊":"🔇"};
 $("#fm-sk").onclick=()=>irPara(F.seg.length-1);
 d.addEventListener("keydown",e=>{if(e.key==="Escape")fechar();if(e.key===" "&&F&&F.idx>=0&&!F.seg[F.idx].final){e.preventDefault();$("#fm-pa").click()}});

 /* capa: o toque no play libera o som (o navegador só deixa tocar depois de um toque) */
 mostra(`${D.logo?`<img class="fm-logo" src="${esc(D.logo)}" alt="${esc(D.marca||"")}">`:""}<div class="fm-k">${esc(D.marca||"Apresentação da obra")}</div><div class="fm-h">${esc(D.cliente?tit(D.cliente):"Sua obra")}</div><div class="fm-p">Preparamos um filme da sua obra em 3D, com cada esquadria do seu projeto.</div>
  <button class="fm-go" type="button" id="fm-play"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>Assistir à apresentação</button>
  <button class="fm-sec" type="button" id="fm-pular">Ir direto para a proposta</button>${podeGravar()?`<button class="fm-sec" type="button" id="fm-bx0" style="margin-top:0">⬇ Baixar o vídeo para enviar</button>`:""}`);
 setTimeout(()=>{const pl=$("#fm-play");if(pl){pl.onclick=()=>{some();setTimeout(()=>comecar(true),450)};pl.focus()}const pu=$("#fm-pular");if(pu)pu.onclick=fechar;const b0=$("#fm-bx0");if(b0)b0.onclick=()=>{some();setTimeout(gravar,450)}},60);
 requestAnimationFrame(()=>d.classList.add("on"));
 /* gravação quadro a quadro (gerar o MP4): window.__fmTick(dt) avança o filme num passo fixo */
 if(window.__FM_MANUAL){window.__fmTick=dt=>passo(0,dt);window.__fmPlay=()=>{comecar(true)}}else F.raf=requestAnimationFrame(passo);
}
window.FILME={abrir};
})();
