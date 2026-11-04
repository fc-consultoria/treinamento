/* FC Consultoria em Esquadria · Tipologias 3D dos Orçamentos de obra
   Monta a esquadria em 3D a partir do item do croqui (tipo, folhas, L × H), com a cor do
   acabamento da obra e a cor do vidro do item. Usa o THREE global (r128, igual à Plataforma FC 3D).
   © FC Consultoria em Esquadria · uso exclusivo */
(function(){
"use strict";
const T=()=>window.THREE;

/* ---------- cores ---------- */
const PERFIS=[
 {id:"preto",nome:"Preto",hex:"#1f2225",met:.25,rug:.62,re:/PRETO|BLACK|RAL\s*9005|RAL\s*9011|RAL\s*9017/},
 {id:"branco",nome:"Branco",hex:"#eeefec",met:.1,rug:.45,re:/BRANCO|WHITE|RAL\s*90(03|10|16)/},
 {id:"bronze",nome:"Bronze",hex:"#4e3b2d",met:.35,rug:.5,re:/BRONZE|RAL\s*80(14|17|19|22)/},
 {id:"grafite",nome:"Grafite",hex:"#43484d",met:.35,rug:.5,re:/GRAFITE|CINZA|GRAY|GREY|RAL\s*70(16|21|22|24)/},
 {id:"champanhe",nome:"Champanhe",hex:"#bfa77d",met:.6,rug:.35,re:/CHAMPAN|DOURAD|OURO|GOLD\b/},
 {id:"corten",nome:"Corten",hex:"#8a4b2a",met:.2,rug:.7,re:/CORTEN|FERRUGEM/},
 {id:"madeira",nome:"Amadeirado",hex:"#8b5e3c",met:.05,rug:.7,re:/MADEIRA|AMADEIRAD|CARVALHO|NOGUEIRA|IMBUIA/},
 {id:"natural",nome:"Anodizado natural",hex:"#c4c8cb",met:.75,rug:.32,re:/ANODIZ|NATURAL|FOSCO|BRUTO/}
];
const VIDROS=[
 {id:"incolor",nome:"Incolor",hex:"#8fc3d1",op:.38,met:0,re:/INCOLOR|CRISTAL|TRANSPARENTE/},
 {id:"verde",nome:"Verde",hex:"#3f7d5f",op:.5,met:0,re:/VERDE/},
 {id:"fume",nome:"Fumê",hex:"#4d575c",op:.55,met:0,re:/FUM[EÊ]|CINZA/},
 {id:"bronze",nome:"Bronze",hex:"#8a6a4c",op:.5,met:0,re:/BRONZE/},
 {id:"azul",nome:"Azul",hex:"#5d93c2",op:.45,met:0,re:/AZUL/},
 {id:"refletivo",nome:"Refletivo prata",hex:"#a9b9c3",op:.82,met:.85,re:/REFLET|ESPELH|PRATA|MIRROR/},
 {id:"jateado",nome:"Jateado / leitoso",hex:"#f1f4f4",op:.86,met:0,re:/JATEAD|LEITOS|ACIDAD|MINI ?BOREAL|CANELAD|PONTILHAD/}
];
function perfilDe(txt,forcado){if(forcado){const f=PERFIS.find(p=>p.id===forcado);if(f)return f}const s=String(txt||"").toUpperCase();return PERFIS.find(p=>p.re.test(s))||PERFIS[PERFIS.length-1]}
function vidroDe(txt,forcado){if(forcado){const f=VIDROS.find(v=>v.id===forcado);if(f)return f}const s=String(txt||"").toUpperCase();
 /* ordem: refletivo/jateado antes de "incolor" (ex.: "REFLETIVO INCOLOR") */
 for(const id of ["refletivo","jateado","verde","fume","bronze","azul","incolor"]){const v=VIDROS.find(x=>x.id===id);if(v.re.test(s))return v}return VIDROS[0]}

/* ---------- geometria ---------- */
/* medidas em metros; faces dos perfis aproximadas (é apresentação, não desenho técnico) */
const MARCO=.045,PROF=.07,FOLHA=.038,PFOL=.032,VID=.008;
function box(w,h,d,mat,x,y,z){const m=new (T().Mesh)(new (T().BoxGeometry)(Math.max(w,.001),Math.max(h,.001),Math.max(d,.001)),mat);m.position.set(x||0,y||0,z||0);m.castShadow=true;m.receiveShadow=true;return m}
/* perfil com quinas levemente arredondadas (reflexo realista do alumínio) */
function perf(w,h,d,mat,x,y,z){w=Math.max(w,.001);h=Math.max(h,.001);d=Math.max(d,.001);
 const RB=T().RoundedBoxGeometry;const geo=RB?new RB(w,h,d,2,Math.min(.0035,w/3,h/3,d/3)):new (T().BoxGeometry)(w,h,d);
 const m=new (T().Mesh)(geo,mat);m.position.set(x||0,y||0,z||0);m.castShadow=true;m.receiveShadow=true;return m}
function quadro(w,h,face,d,mat){const g=new (T().Group)();
 g.add(perf(w,face,d,mat,0,h/2-face/2,0),perf(w,face,d,mat,0,-h/2+face/2,0),perf(face,h-2*face,d,mat,-w/2+face/2,0,0),perf(face,h-2*face,d,mat,w/2-face/2,0,0));return g}
/* chapa de vidro: faces na cor do vidro, bordas com o verde da lapidação */
function vidro(w,h,m){const v=new (T().Mesh)(new (T().BoxGeometry)(Math.max(w,.001),Math.max(h,.001),VID),[m.borda,m.borda,m.borda,m.borda,m.vid,m.vid]);v.renderOrder=2;v.receiveShadow=true;return v}
/* folha com vidro; o grupo tem a origem no centro da folha */
function folha(w,h,m,opts){const g=new (T().Group)();const face=(opts&&opts.face)||FOLHA;
 g.add(quadro(w,h,face,PFOL,m.alu));
 g.add(vidro(w-2*face+.01,h-2*face+.01,m));
 if(opts&&opts.puxador){const px=opts.puxador==="esq"?-w/2+face/2:w/2-face/2;g.add(box(.018,Math.min(.28,h*.18),.03,m.pux,px,opts.ph||0,PFOL/2+.016))}
 return g}
function vidroFixo(w,h,m){return vidro(w+.01,h+.01,m)}

/* monta a tipologia: devolve {grupo, animar(t 0..1)} */
function montar(t,m){
 const L=Math.max(+t.L||1000,200)/1000,H=Math.max(+t.H||1000,200)/1000;
 const g=new (T().Group)();const moveis=[];
 const f=Math.max(1,Math.min(+t.f||1,12));const kind=t.kind||"gen";
 g.add(quadro(L,H,MARCO,PROF,m.alu));
 const iw=L-2*MARCO,ih=H-2*MARCO;
 const montantes=(n,x0,w,y,h)=>{const pw=(w-(n-1)*MARCO)/n;const xs=[];for(let i=0;i<n;i++){const cx=x0+pw/2+i*(pw+MARCO);xs.push(cx);if(i<n-1)g.add(perf(MARCO*.9,h,PROF*.85,m.alu,cx+pw/2+MARCO/2,y,0))}return {pw,xs}};
 if(kind==="fixo"||kind==="gen"){
  /* fixos: só o quadro no perímetro; entre as chapas, junta seca vidro com vidro (silicone incolor) */
  const J=.004,pw=(iw-(f-1)*J)/f;
  for(let i=0;i<f;i++){const x=-iw/2+pw/2+i*(pw+J);const v=vidro(pw,ih+.01,m);v.position.x=x;g.add(v);
   if(i<f-1){const jx=x+pw/2+J/2;const sl=box(J,ih,VID*1.15,m.sil,jx,0,0);sl.castShadow=false;g.add(sl);
    /* risco do encontro dos vidros: linha fina e leve nas duas faces (aparece em qualquer tamanho) */
    [1,-1].forEach(sd=>{const z=sd*(VID*.6+.0006);const ln=new (T().Line)(new (T().BufferGeometry)().setFromPoints([new (T().Vector3)(jx,-ih/2,z),new (T().Vector3)(jx,ih/2,z)]),m.junta);ln.renderOrder=3;g.add(ln)})}}
 }else if(kind==="correr"){
  const n=Math.max(f,2);const sob=.04;const pw=(iw+(n-1)*sob)/n;
  for(let i=0;i<n;i++){const x=-iw/2+pw/2+i*(pw-sob);const z=(i%2?-1:1)*PFOL*.6;
   const lado=i<n/2?"dir":"esq";const fo=folha(pw,ih-.006,m,{puxador:n===2?(i===0?"dir":"esq"):lado,ph:0});fo.position.set(x,0,z);g.add(fo);
   /* folhas pares (trilho externo) correm sobre as vizinhas */
   const alvo=i%2===0?(i+1<n?x+(pw-sob)*.82:x):x;const xi=x;
   if(i%2===0&&i+1<n)moveis.push(k=>{fo.position.x=xi+(alvo-xi)*k});}
 }else if(kind==="giro"){
  const n=f>=2?2:1;const pw=iw/n;
  for(let i=0;i<n;i++){const piv=new (T().Group)();const ladoEsq=n===1||i===0;
   piv.position.set(ladoEsq?-iw/2+i*pw:iw/2,0,PROF*.25);
   const fo=folha(pw,ih-.004,m,{face:FOLHA*1.25,puxador:ladoEsq?"dir":"esq",ph:-ih*.05});fo.position.x=ladoEsq?pw/2:-pw/2;piv.add(fo);g.add(piv);
   moveis.push(k=>{piv.rotation.y=(ladoEsq?-1:1)*k*1.25});}
 }else if(kind==="max"||kind==="maxp"){
  const top=kind==="maxp"?ih*.68:ih;const {pw,xs}=montantes(f,-iw/2,iw,ih/2-top/2,top);
  if(kind==="maxp"){g.add(perf(iw,MARCO*.9,PROF*.85,m.alu,0,ih/2-top-MARCO/2,0));const bh=ih-top-MARCO;
   const vb=vidroFixo(iw,bh,m);vb.position.y=-ih/2+bh/2;g.add(vb)}
  xs.forEach(x=>{const piv=new (T().Group)();piv.position.set(x,ih/2,PROF*.2);
   const fo=folha(pw,top-.004,m,{});fo.position.y=-top/2;piv.add(fo);g.add(piv);
   moveis.push(k=>{piv.rotation.x=k*.55})});
 }else if(kind==="piv"){
  const a=iw*.42;g.add(perf(MARCO*.9,ih,PROF*.85,m.alu,-iw/2+a+MARCO/2,0,0));
  const vf=vidroFixo(a,ih,m);vf.position.x=-iw/2+a/2;g.add(vf);
  const dw=iw-a-MARCO;const piv=new (T().Group)();piv.position.set(-iw/2+a+MARCO+dw*.18,0,0);
  const fo=folha(dw,ih-.004,m,{face:FOLHA*1.3,puxador:"dir"});fo.position.x=dw/2-dw*.18;piv.add(fo);g.add(piv);
  moveis.push(k=>{piv.rotation.y=-k*1.2});
 }
 return {grupo:g,animar:k=>moveis.forEach(fn=>fn(k)),temMovel:moveis.length>0,L,H};
}

/* faixas de reflexo no vidro (textura gerada, sem imagem externa) */
let REF=null;
function reflexo(){if(REF)return REF;const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d");
 g.fillStyle="#c9d3d6";g.fillRect(0,0,256,256);
 const faixa=(x,w,a)=>{const gr=g.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,"rgba(255,255,255,0)");gr.addColorStop(.5,`rgba(255,255,255,${a})`);gr.addColorStop(1,"rgba(255,255,255,0)");g.save();g.translate(128,128);g.rotate(-.55);g.translate(-128,-128);g.fillStyle=gr;g.fillRect(x,-200,w,700);g.restore()};
 faixa(40,70,.95);faixa(125,22,.8);faixa(175,50,.55);
 REF=new (T().CanvasTexture)(c);if(T().sRGBEncoding)REF.encoding=T().sRGBEncoding;return REF}
function materiais(t,cfg){
 const p=perfilDe(cfg.cor,t.corPerfil),v=vidroDe(t.desc,t.vidroCor);const lin=h=>{const c=new (T().Color)(h);if(c.convertSRGBToLinear)c.convertSRGBToLinear();return c};
 return {p,v,
  alu:new (T().MeshStandardMaterial)({color:lin(p.hex),metalness:p.met,roughness:p.rug,envMapIntensity:.7}),
  vid:new (T().MeshPhysicalMaterial)({map:reflexo(),color:lin(v.hex),transparent:true,opacity:v.op,roughness:.02,metalness:v.met,reflectivity:.9,envMapIntensity:1.4,side:T().DoubleSide,depthWrite:false}),
  borda:new (T().MeshStandardMaterial)({color:lin("#5f9c8b"),transparent:true,opacity:.9,roughness:.15,metalness:0}),
  junta:new (T().LineBasicMaterial)({color:"#5d7076",transparent:true,opacity:.45,depthWrite:false}),
  sil:new (T().MeshStandardMaterial)({color:lin("#8fa4a9"),transparent:true,opacity:.7,roughness:.35,depthWrite:false}),
  pux:new (T().MeshStandardMaterial)({color:lin(p.id==="preto"?"#3a3f44":"#2b2f33"),metalness:.6,roughness:.35})};
}

/* ---------- cena ---------- */
function cena(r,sz){const s=new (T().Scene)();const k=Math.max(1,(sz||3)/3);
 s.add(new (T().HemisphereLight)(0xffffff,0xb9c4c6,.85));
 const d=new (T().DirectionalLight)(0xffffff,.95);d.position.set(-2.2*k,3.2*k,4*k);d.castShadow=true;d.shadow.mapSize.set(2048,2048);d.shadow.bias=-.0005;
 const sc=d.shadow.camera;sc.left=sc.bottom=-3*k;sc.right=sc.top=3*k;sc.far=30*k;sc.updateProjectionMatrix();s.add(d);
 const d2=new (T().DirectionalLight)(0xffffff,.35);d2.position.set(3,1,-2);s.add(d2);
 if(r&&T().PMREMGenerator&&T().RoomEnvironment){try{const pm=new (T().PMREMGenerator)(r);s.environment=pm.fromScene(new (T().RoomEnvironment)(),.04).texture;s.userData.env=.55}catch(e){}}
 return s}
function enquadrar(cam,L,H,asp,margem){const fov=cam.fov*Math.PI/180;const dh=(H*margem)/2/Math.tan(fov/2);const dw=(L*margem)/2/Math.tan(fov/2)/asp;return Math.max(dh,dw)}

/* ---------- miniatura em alta (PNG) ---------- */
let R=null;
function renderer(){if(R)return R;R=new (T().WebGLRenderer)({antialias:true,alpha:true,preserveDrawingBuffer:true});
 R.setPixelRatio(1);R.toneMapping=T().ACESFilmicToneMapping;R.toneMappingExposure=1.05;R.shadowMap.enabled=true;R.shadowMap.type=T().PCFSoftShadowMap;if(T().sRGBEncoding)R.outputEncoding=T().sRGBEncoding;return R}
const cache=new Map();
function chave(t,cfg){return [t.kind,t.f,t.L,t.H,t.desc,t.vidroCor||"",t.corPerfil||"",cfg.cor||"",cfg.px||0,cfg.aberto?1:0].join("|")}
function imagem(t,cfg){cfg=cfg||{};const k=chave(t,cfg);if(cache.has(k))return cache.get(k);
 if(!T())return "";const r=renderer();const px=cfg.px||900;
 const mt=materiais(t,cfg),mo=montar(t,mt);if(cfg.aberto)mo.animar(.55);
 const asp=Math.max(.35,Math.min(mo.L/mo.H,3.2));const w=asp>=1?px:Math.round(px*asp),h=asp>=1?Math.round(px/asp):px;
 r.setSize(w,h,false);const s=cena(r,Math.max(mo.L,mo.H));mo.grupo.rotation.y=-.22;s.add(mo.grupo);
 const ch=new (T().Mesh)(new (T().PlaneGeometry)(mo.L*3,3),new (T().ShadowMaterial)({opacity:.16}));ch.rotation.x=-Math.PI/2;ch.position.y=-mo.H/2-.001;ch.receiveShadow=true;s.add(ch);
 const cam=new (T().PerspectiveCamera)(16,w/h,.01,200);const dist=enquadrar(cam,mo.L,mo.H,w/h,1.22);cam.position.set(0,dist*.07,dist);cam.lookAt(0,-mo.H*.02,0);
 r.setClearColor(0xffffff,0);r.render(s,cam);const url=r.domElement.toDataURL("image/png");
 descartar(s);cache.set(k,url);return url}
function descartar(o){o.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){(Array.isArray(x.material)?x.material:[x.material]).forEach(mm=>{if(mm.map&&mm.map!==REF)mm.map.dispose();mm.dispose()})}})}

/* ---------- "Ver em 3D": a tipologia sai da tela, gira 360° e pode ser girada à mão ---------- */
let V=null;
function css(){if(document.getElementById("t3d-css"))return;const st=document.createElement("style");st.id="t3d-css";st.textContent=`
.t3d{position:fixed;inset:0;z-index:9500;background:rgba(14,26,29,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);opacity:0;transition:opacity .35s}
.t3d.on{opacity:1}.t3d[hidden]{display:none}
.t3d canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;transform-origin:0 0;transition:transform .55s cubic-bezier(.2,.8,.25,1)}
.t3d .tt{position:absolute;left:max(16px,env(safe-area-inset-left,0px));top:calc(14px + env(safe-area-inset-top,0px));color:#fff;font:700 16px "Space Grotesk",system-ui,sans-serif;text-shadow:0 1px 6px rgba(0,0,0,.4);pointer-events:none}
.t3d .tt small{display:block;font:500 12.5px Inter,system-ui,sans-serif;opacity:.9}
.t3d .tt .cs{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.t3d .chip{background:rgba(255,255,255,.94);color:#16262a;border-radius:999px;padding:4px 10px;font:600 12px Inter,system-ui,sans-serif;display:flex;gap:6px;align-items:center;text-shadow:none}
.t3d .sw{width:12px;height:12px;border-radius:50%;border:1px solid rgba(0,0,0,.25)}
.t3d .x{position:absolute;right:max(16px,env(safe-area-inset-right,0px));top:calc(14px + env(safe-area-inset-top,0px));font:600 13px Inter,system-ui,sans-serif;background:#fff;color:#16262a;border:0;border-radius:999px;padding:9px 14px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.25)}
.t3d .bt{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(18px + env(safe-area-inset-bottom,0px));display:flex;gap:8px;flex-wrap:wrap;justify-content:center;width:max-content;max-width:calc(100% - 32px)}
.t3d .bt button{font:600 13px Inter,system-ui,sans-serif;border:0;background:#fff;color:#16262a;border-radius:999px;padding:9px 14px;cursor:pointer;min-height:38px;box-shadow:0 6px 18px rgba(0,0,0,.25)}
.t3d .bt button.pri{background:#c9831a;color:#1d1405}
.t3d .x:focus-visible,.t3d .bt button:focus-visible{outline:3px solid #ffd27a;outline-offset:2px}
.t3d .wm{position:absolute;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(70px + env(safe-area-inset-bottom,0px));font:600 10px Inter,system-ui,sans-serif;letter-spacing:.12em;color:rgba(255,255,255,.75);pointer-events:none}
@media (prefers-reduced-motion:reduce){.t3d,.t3d canvas{transition:none}}
`;document.head.appendChild(st)}
function abrir(t,cfg){cfg=cfg||{};if(!T()){alert("O 3D não carregou. Verifique a internet e tente de novo.");return}css();
 if(!V){const d=document.createElement("div");d.className="t3d";d.hidden=true;d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-label","Tipologia em 3D");
  d.innerHTML=`<div class="tt"><span id="t3d-t"></span><small id="t3d-s"></small><div class="cs" id="t3d-ch"></div></div>
  <button type="button" class="x" id="t3d-x">✕ Fechar</button><div class="wm">FC CONSULTORIA EM ESQUADRIA · USO EXCLUSIVO</div>
  <div class="bt"><button type="button" class="pri" id="t3d-ab">Abrir folhas</button><button type="button" id="t3d-gi">Girar 360°</button><button type="button" id="t3d-fr">Frente</button></div>`;
  document.body.appendChild(d);
  const r=new (T().WebGLRenderer)({antialias:true,alpha:true});r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));r.toneMapping=T().ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.shadowMap.enabled=true;r.shadowMap.type=T().PCFSoftShadowMap;if(T().sRGBEncoding)r.outputEncoding=T().sRGBEncoding;r.setClearColor(0x000000,0);
  d.prepend(r.domElement);
  const cam=new (T().PerspectiveCamera)(28,1,.01,200);const ctl=T().OrbitControls?new (T().OrbitControls)(cam,r.domElement):null;
  if(ctl){ctl.enableDamping=true;ctl.dampingFactor=.08;ctl.enablePan=false;ctl.addEventListener("start",()=>{V.giro=0;V.mexeu=true})}
  V={d,r,cam,ctl,s:null,mo:null,k:0,alvo:0,giro:0,raf:0,dist:3,mexeu:false};
  const fechar=()=>{d.classList.remove("on");setTimeout(()=>{d.hidden=true;cancelAnimationFrame(V.raf);if(V.s)descartar(V.s);V.s=null;if(V.volta)V.volta.focus()},300)};
  d.querySelector("#t3d-x").onclick=fechar;
  /* clique fora da esquadria (sem arrastar) fecha */
  let px=0,py=0;r.domElement.addEventListener("pointerdown",e=>{px=e.clientX;py=e.clientY});
  r.domElement.addEventListener("click",e=>{if(Math.hypot(e.clientX-px,e.clientY-py)>4)return;const ray=new (T().Raycaster)();const p=new (T().Vector2)(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(p,V.cam);if(!ray.intersectObject(V.conj,true).length)fechar()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!d.hidden)fechar()});
  d.querySelector("#t3d-ab").onclick=e=>{V.alvo=V.alvo?0:1;e.target.textContent=V.alvo?"Fechar folhas":"Abrir folhas"};
  d.querySelector("#t3d-gi").onclick=()=>{V.giro=Math.PI*2};
  d.querySelector("#t3d-fr").onclick=()=>{V.giro=0;frente(0)};
  window.addEventListener("resize",()=>{if(!d.hidden)tam()});}
 V.volta=document.activeElement;
 const mt=materiais(t,cfg);V.mo=montar(t,mt);if(V.s)descartar(V.s);V.s=cena(V.r,Math.max(V.mo.L,V.mo.H)+2);V.conj=new (T().Group)();V.conj.add(V.mo.grupo);V.s.add(V.conj);V.k=0;V.alvo=0;V.mexeu=false;
 const ab=V.d.querySelector("#t3d-ab");ab.textContent="Abrir folhas";ab.hidden=!V.mo.temMovel;
 V.d.querySelector("#t3d-t").textContent=cfg.titulo||("Item "+(t.item||"")+" · "+(t.tipo||""));
 V.d.querySelector("#t3d-s").textContent=(t.L||"")+" × "+(t.H||"")+" mm"+(t.q>1?" · "+t.q+" peças":"")+(t.linha?" · Linha "+t.linha:"");
 V.d.querySelector("#t3d-ch").innerHTML=`<span class="chip"><span class="sw" style="background:${mt.p.hex}"></span>Perfil: ${esc(cfg.cor||mt.p.nome)}</span><span class="chip"><span class="sw" style="background:${mt.v.hex}"></span>Vidro: ${mt.v.nome}</span>`;
 V.d.hidden=false;tam();frente(-.35);
 /* sai da miniatura: o canvas começa no tamanho/posição da imagem clicada e cresce até a tela */
 const cv=V.r.domElement,o=cfg.origem&&cfg.origem.getBoundingClientRect?cfg.origem.getBoundingClientRect():null;
 const reduz=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(o&&!reduz){const sc=Math.max(o.width/innerWidth,o.height/innerHeight);cv.style.transition="none";cv.style.transform=`translate(${o.left+o.width/2-innerWidth*sc/2}px,${o.top+o.height/2-innerHeight*sc/2}px) scale(${sc})`;cv.getBoundingClientRect();cv.style.transition="";}
 requestAnimationFrame(()=>{V.d.classList.add("on");cv.style.transform="none"});
 V.giro=reduz?0:Math.PI*2;cancelAnimationFrame(V.raf);loop();
 setTimeout(()=>V.d.querySelector("#t3d-x").focus(),60);
}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function lc(h){const c=new (T().Color)(h);if(c.convertSRGBToLinear)c.convertSRGBToLinear();return c}
function tam(){const w=innerWidth,h=innerHeight;V.r.setSize(w,h,false);V.cam.aspect=w/Math.max(h,1);V.cam.updateProjectionMatrix();V.dist=enquadrar(V.cam,V.mo.L,V.mo.H,V.cam.aspect,1.55)}
function frente(ry){const d=V.dist;V.cam.position.set(0,d*.06,d);V.cam.lookAt(0,0,0);V.conj.rotation.y=ry;if(V.ctl){V.ctl.target.set(0,0,0);V.ctl.update()}}
function loop(){V.raf=requestAnimationFrame(loop);V.k+=(V.alvo-V.k)*.08;if(Math.abs(V.alvo-V.k)<.001)V.k=V.alvo;V.mo.animar(V.k);
 if(V.giro>0){const p=Math.min(V.giro,.035);V.giro-=p;V.conj.rotation.y+=p;if(V.giro<=0&&!V.mexeu)V.conj.rotation.y=-.35}
 if(V.ctl)V.ctl.update();V.r.render(V.s,V.cam)}
window.TIP3D={imagem,abrir,PERFIS,VIDROS,perfilDe,vidroDe,limparCache:()=>cache.clear()};
})();
