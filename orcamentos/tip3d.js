/* FC Consultoria em Esquadria · Tipologias 3D dos Orçamentos de obra
   Monta a esquadria em 3D a partir do item do croqui (tipo, folhas, L × H), com a cor do
   acabamento da obra e a cor do vidro do item. Usa o THREE global (r128, igual à Plataforma FC 3D).
   © FC Consultoria em Esquadria (FC Desenvolvimento de Projetos de Compra e Venda LTDA · CNPJ 52.985.682/0001-32)
   Criação e desenvolvimento: FC Consultoria em Esquadria · uso exclusivo · proibida a cópia ou reprodução */
(function(){
"use strict";
const T=()=>window.THREE;
/* logo da FC Consultoria em Esquadria (logo normal, sobre fundo branco) */
const LOGO="data:image/png;base64,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";

/* ---------- cores ---------- */
const PERFIS=[
 {id:"preto",nome:"Preto",hex:"#1f2225",met:.25,rug:.62,re:/PRETO|BLACK|RAL\s*9005|RAL\s*9011|RAL\s*9017/},
 {id:"branco",nome:"Branco",hex:"#eeefec",met:.1,rug:.45,re:/BRANCO|WHITE|RAL\s*90(03|10|16)/},
 {id:"bronze",nome:"Bronze",hex:"#4e3b2d",met:.35,rug:.5,re:/BRONZE|RAL\s*80(14|17|19|22)/},
 {id:"grafite",nome:"Grafite",hex:"#43484d",met:.35,rug:.5,re:/GRAFITE|CINZA|GRAY|GREY|RAL\s*70(16|21|22|24)/},
 {id:"champanhe",nome:"Champanhe",hex:"#bfa77d",met:.6,rug:.35,re:/CHAMPAN|DOURAD|OURO|GOLD\b/},
 {id:"corten",nome:"Corten",hex:"#8a4b2a",met:.2,rug:.7,re:/CORTEN|FERRUGEM/},
 {id:"madeira",nome:"Madeira cerejeira",hex:"#5c2617",met:.05,rug:.58,re:/MADEIRA|AMADEIRAD|CEREJEIRA|CARVALHO|NOGUEIRA|IMBUIA/},
 {id:"linheiro",nome:"Linheiro",hex:"#d6cab0",met:.08,rug:.6,re:/LINHEIRO|LINHO/},
 {id:"fosco",nome:"Fosco",hex:"#b3b7ba",met:.4,rug:.78,re:/FOSCO/},
 {id:"natural",nome:"Anodizado natural",hex:"#c4c8cb",met:.75,rug:.32,re:/ANODIZ|NATURAL|BRUTO/}
];
const VIDROS=[
 {id:"incolor",nome:"Incolor",hex:"#8fc3d1",op:.38,met:0,re:/INCOLOR|CRISTAL|TRANSPARENTE/},
 {id:"verde",nome:"Verde",hex:"#3f7d5f",op:.5,met:0,re:/VERDE/},
 {id:"fume",nome:"Fumê",hex:"#4d575c",op:.55,met:0,re:/FUM[EÊ]|CINZA/},
 {id:"bronze",nome:"Bronze",hex:"#8a6a4c",op:.5,met:0,re:/BRONZE/},
 {id:"azul",nome:"Azul",hex:"#5d93c2",op:.45,met:0,re:/AZUL/},
 {id:"refletivo",nome:"Refletivo prata",hex:"#a9b9c3",op:.82,met:.85,re:/REFLET|ESPELH|PRATA|MIRROR/},
 {id:"champanhe",nome:"Champanhe",hex:"#b8995f",op:.5,met:0,re:/CHAMPAN/},
 {id:"jateado",nome:"Fosco / jateado",hex:"#f1f4f4",op:.86,met:0,re:/JATEAD|LEITOS|ACIDAD|MINI ?BOREAL|CANELAD|PONTILHAD|VIDRO[^-]*\bFOSCO/}
];
/* 05/11/2026 · vidro inteligente (PDLC): desligado fica leitoso (privacidade), ligado fica transparente */
const INTEL=/INTELIGENT|PDLC|SMART\s*GLASS|G-?TECH/i;
const ehIntel=t=>INTEL.test(String((t&&t.desc)||""));
function perfilDe(txt,forcado){if(forcado){const f=PERFIS.find(p=>p.id===forcado);if(f)return f}const s=String(txt||"").toUpperCase();return PERFIS.find(p=>p.re.test(s))||PERFIS[PERFIS.length-1]}
function vidroDe(txt,forcado){if(forcado){const f=VIDROS.find(v=>v.id===forcado);if(f)return f}const s=String(txt||"").toUpperCase();
 /* ordem: refletivo/jateado antes de "incolor" (ex.: "REFLETIVO INCOLOR") */
 for(const id of ["refletivo","jateado","verde","fume","bronze","champanhe","azul","incolor"]){const v=VIDROS.find(x=>x.id===id);if(v.re.test(s))return v}return VIDROS[0]}

/* ---------- geometria ---------- */
/* medidas em metros; faces dos perfis aproximadas (é apresentação, não desenho técnico) */
const MARCO=.045,PROF=.07,FOLHA=.038,PFOL=.032,VID=.008;
/* nome da peça (aparece no detalhe da montagem; sem códigos de perfil) */
let NM="Peça";
function box(w,h,d,mat,x,y,z){const m=new (T().Mesh)(new (T().BoxGeometry)(Math.max(w,.001),Math.max(h,.001),Math.max(d,.001)),mat);m.position.set(x||0,y||0,z||0);m.castShadow=true;m.receiveShadow=true;m.userData.nm=NM;return m}
/* perfil com quinas levemente arredondadas (reflexo realista do alumínio) */
function perf(w,h,d,mat,x,y,z){w=Math.max(w,.001);h=Math.max(h,.001);d=Math.max(d,.001);
 const RB=T().RoundedBoxGeometry;const geo=RB?new RB(w,h,d,2,Math.min(.0035,w/3,h/3,d/3)):new (T().BoxGeometry)(w,h,d);
 const m=new (T().Mesh)(geo,mat);m.position.set(x||0,y||0,z||0);m.castShadow=true;m.receiveShadow=true;m.userData.nm=NM;return m}
function quadro(w,h,face,d,mat){const g=new (T().Group)();
 g.add(perf(w,face,d,mat,0,h/2-face/2,0),perf(w,face,d,mat,0,-h/2+face/2,0),perf(face,h-2*face,d,mat,-w/2+face/2,0,0),perf(face,h-2*face,d,mat,w/2-face/2,0,0));
 /* no detalhe da peça, o quadro mostra a medida externa (corte 45°) */
 g.children.forEach((c,i)=>{c.userData.len=i<2?w:h;c.userData.lado=["sup","inf","esq","dir"][i]});return g}
/* chapa de vidro: faces na cor do vidro, bordas com o verde da lapidação */
function vidro(w,h,m){const v=new (T().Mesh)(new (T().BoxGeometry)(Math.max(w,.001),Math.max(h,.001),VID),[m.borda,m.borda,m.borda,m.borda,m.vid,m.vid]);v.renderOrder=2;v.receiveShadow=true;v.userData.nm="Vidro";return v}
/* folha com vidro; o grupo tem a origem no centro da folha */
/* enchimento de um vão (vidro, lambri ou veneziana); o vão tem o centro em (0,cy) */
function encher(g,w,h,cy,m,enc){
  if(enc==="lambri"){NM="Fundo do lambri";
  /* lambri: réguas horizontais de ~100 mm com o friso (sombra) entre elas */
  const fu=box(w,h,.006,m.fundo,0,cy,0);fu.castShadow=false;fu.userData.fundo=1;g.add(fu);NM="Lambri";
  const n=Math.max(2,Math.round(h/.1)),rh=h/n;
  for(let i=0;i<n;i++)g.add(perf(w,rh-.005,.018,m.alu,0,cy-h/2+rh/2+i*rh,0));
  }else if(enc==="veneziana"){NM="Aleta da veneziana";
  /* veneziana: aletas inclinadas, com passagem de ar entre elas */
  const n=Math.max(3,Math.round(h/.038)),rh=h/n;
  for(let i=0;i<n;i++){const a=box(w,rh*1.15,.004,m.alu,0,cy-h/2+rh/2+i*rh,0);a.rotation.x=.75;g.add(a)}
 }else{const v=vidro(w+.01,h+.01,m);v.position.y=cy;g.add(v)}
}
function folha(w,h,m,opts){const g=new (T().Group)();const face=(opts&&opts.face)||FOLHA;const enc=(opts&&opts.enc)||"vidro";
NM="Folha"; g.add(quadro(w,h,face,PFOL,m.alu));
 const iw=w-2*face,ih=h-2*face;
 if(enc==="vidlam"){
  /* vidro em cima, lambri embaixo, com a travessa no meio (lambri até ~0,95 m) */
  const hb=Math.min(ih*.45,.95),ht=ih-hb-face;
  encher(g,iw,hb,-ih/2+hb/2,m,"lambri");
  NM="Travessa";g.add(perf(iw,face,PFOL,m.alu,0,-ih/2+hb+face/2,0));
  encher(g,iw,ht,ih/2-ht/2,m,"vidro");
 }else encher(g,iw,ih,0,m,enc);
if(opts&&opts.puxador){NM="Puxador";const px=opts.puxador==="esq"?-w/2+face/2:w/2-face/2;g.add(box(.018,Math.min(.28,h*.18),.03,m.pux,px,opts.ph||0,PFOL/2+.016))}
 return g}
function vidroFixo(w,h,m){return vidro(w+.01,h+.01,m)}

/* monta a tipologia: devolve {grupo, animar(t 0..1)} */
function montarBase(t,m){
 const L=Math.max(+t.L||1000,200)/1000,H=Math.max(+t.H||1000,200)/1000;
 const g=new (T().Group)();const moveis=[];
 const f=Math.max(1,Math.min(+t.f||1,12));const kind=t.kind||"gen";
 const enc=t.enc||"vidro";
 /* painel fixo de vidro temperado: só o perfil U fino no perímetro */
 const MQ=kind==="painel"?.022:MARCO;
NM=kind==="painel"?"Perfil U":"Marco"; g.add(quadro(L,H,MQ,kind==="painel"?.03:PROF,m.alu));
 const iw=L-2*MQ,ih=H-2*MQ;
 const montantes=(n,x0,w,y,h)=>{const pw=(w-(n-1)*MARCO)/n;const xs=[];for(let i=0;i<n;i++){const cx=x0+pw/2+i*(pw+MARCO);xs.push(cx);if(i<n-1){NM="Montante";g.add(perf(MARCO*.9,h,PROF*.85,m.alu,cx+pw/2+MARCO/2,y,0))}}return {pw,xs}};
 if(kind==="painel"){
  const J=.004,pw=(iw-(f-1)*J)/f;
  for(let i=0;i<f;i++){const v=vidro(pw,ih+.01,m);v.position.x=-iw/2+pw/2+i*(pw+J);g.add(v)}
 }else if(kind==="correr4"){
  /* 4 folhas: 2 fixas nas pontas (trilho interno) e 2 móveis no centro (trilho externo), que abrem sobre as fixas */
  const sob=.04,pw=(iw+3*sob)/4;const xs=[0,1,2,3].map(i=>-iw/2+pw/2+i*(pw-sob));
  xs.forEach((x,i)=>{const mov=i===1||i===2;const fo=folha(pw,ih-.006,m,{enc,puxador:mov?(i===1?"dir":"esq"):null,ph:0});fo.position.set(x,0,(mov?1:-1)*PFOL*.6);fo.userData.fi=i;fo.userData.fn=4;g.add(fo);
   if(mov){const alvo=xs[i===1?0:3]+(i===1?1:-1)*pw*.06;moveis.push(k=>{fo.position.x=x+(alvo-x)*k})}});
 }else if(kind==="fixo"||kind==="gen"){
  /* fixos: só o quadro no perímetro; entre as chapas, junta seca vidro com vidro (silicone incolor) */
  const J=.004,pw=(iw-(f-1)*J)/f;
  for(let i=0;i<f;i++){const x=-iw/2+pw/2+i*(pw+J);const v=vidro(pw,ih+.01,m);v.position.x=x;g.add(v);
   if(i<f-1){const jx=x+pw/2+J/2;NM="Silicone";const sl=box(J,ih,VID*1.15,m.sil,jx,0,0);sl.castShadow=false;g.add(sl);
    /* risco do encontro dos vidros: linha fina e leve nas duas faces (aparece em qualquer tamanho) */
    [1,-1].forEach(sd=>{const z=sd*(VID*.6+.0006);const ln=new (T().Line)(new (T().BufferGeometry)().setFromPoints([new (T().Vector3)(jx,-ih/2,z),new (T().Vector3)(jx,ih/2,z)]),m.junta);ln.renderOrder=3;g.add(ln)})}}
 }else if(kind==="correr"){
  const n=Math.max(f,2);const sob=.04;const pw=(iw+(n-1)*sob)/n;
  for(let i=0;i<n;i++){const x=-iw/2+pw/2+i*(pw-sob);const z=(i%2?-1:1)*PFOL*.6;
   const lado=i<n/2?"dir":"esq";const fo=folha(pw,ih-.006,m,{enc,puxador:n===2?(i===0?"dir":"esq"):lado,ph:0});fo.position.set(x,0,z);fo.userData.fi=i;fo.userData.fn=n;g.add(fo);
   /* folhas pares (trilho externo) correm sobre as vizinhas */
   const alvo=i%2===0?(i+1<n?x+(pw-sob)*.82:x):x;const xi=x;
   if(i%2===0&&i+1<n)moveis.push(k=>{fo.position.x=xi+(alvo-xi)*k});}
 }else if(kind==="giro"){
  const n=f>=2?2:1;const pw=iw/n;
  for(let i=0;i<n;i++){const piv=new (T().Group)();const ladoEsq=n===1||i===0;
   piv.position.set(ladoEsq?-iw/2+i*pw:iw/2,0,PROF*.25);
   const fo=folha(pw,ih-.004,m,{enc,face:FOLHA*1.25,puxador:ladoEsq?"dir":"esq",ph:-ih*.05});fo.position.x=ladoEsq?pw/2:-pw/2;piv.add(fo);g.add(piv);
   moveis.push(k=>{piv.rotation.y=(ladoEsq?-1:1)*k*1.25});}
 }else if(kind==="max"||kind==="maxp"){
  const top=kind==="maxp"?ih*.68:ih;const {pw,xs}=montantes(f,-iw/2,iw,ih/2-top/2,top);
  if(kind==="maxp"){NM="Travessa";g.add(perf(iw,MARCO*.9,PROF*.85,m.alu,0,ih/2-top-MARCO/2,0));const bh=ih-top-MARCO;
   const vb=vidroFixo(iw,bh,m);vb.position.y=-ih/2+bh/2;g.add(vb)}
  xs.forEach(x=>{const piv=new (T().Group)();piv.position.set(x,ih/2,PROF*.2);
   const fo=folha(pw,top-.004,m,{enc});fo.position.y=-top/2;piv.add(fo);g.add(piv);
   moveis.push(k=>{piv.rotation.x=k*.55})});
 }else if(kind==="piv"){
  const a=iw*.42;NM="Montante";g.add(perf(MARCO*.9,ih,PROF*.85,m.alu,-iw/2+a+MARCO/2,0,0));
  const vf=vidroFixo(a,ih,m);vf.position.x=-iw/2+a/2;g.add(vf);
  const dw=iw-a-MARCO;const piv=new (T().Group)();piv.position.set(-iw/2+a+MARCO+dw*.18,0,0);
  const fo=folha(dw,ih-.004,m,{face:FOLHA*1.3,puxador:"dir"});fo.position.x=dw/2-dw*.18;piv.add(fo);g.add(piv);
  moveis.push(k=>{piv.rotation.y=-k*1.2});
 }
 return {grupo:g,animar:k=>moveis.forEach(fn=>fn(k)),temMovel:moveis.length>0,L,H,kind};
}

/* 05/11/2026 · porta/janela com persiana integrada: caixa da persiana em cima, guias nas laterais e a cortina meio descida
   (é apresentação: medidas aproximadas, a esquadria fica abaixo da caixa dentro do L × A do orçamento) */
function laminas(hex,rep){const c=document.createElement("canvas");c.width=8;c.height=64;const x=c.getContext("2d");
 x.fillStyle=hex;x.fillRect(0,0,8,64);x.fillStyle="rgba(255,255,255,.18)";x.fillRect(0,4,8,10);x.fillStyle="rgba(0,0,0,.38)";x.fillRect(0,58,8,6);
 const tx=new (T().CanvasTexture)(c);tx.wrapS=tx.wrapT=T().RepeatWrapping;tx.repeat.set(1,rep);if(T().sRGBEncoding)tx.encoding=T().sRGBEncoding;return tx}
function montar(t,m){
 if(!t.per)return montarBase(t,m);
 const Hmm=Math.max(+t.H||1000,400),hcm=Math.round(Math.min(260,Math.max(170,Hmm*.09)));
 const base=montarBase(Object.assign({},t,{per:"",H:Hmm-hcm}),m);
 const g=new (T().Group)();const L=base.L,H=Hmm/1000,hc=hcm/1000,hl=H-hc;
 base.grupo.position.y=-hc/2;g.add(base.grupo);
 const zf=PROF/2+.022;
 NM="Caixa da persiana";const cx=perf(L,hc,PROF+.05,m.alu,0,H/2-hc/2,.025);cx.userData.len=L;g.add(cx);
 NM="Guia da persiana";[-1,1].forEach(sd=>{const gu=perf(.028,hl,.03,m.alu,sd*(L/2-.014),-hc/2,zf);gu.userData.len=hl;g.add(gu)});
 /* cortina: uma peça só, lâminas desenhadas na textura; desce cerca de 1/3 da altura livre */
 const dc=Math.max(.12,hl*.34),cw=L-.05;
 const mat=new (T().MeshStandardMaterial)({map:laminas(m.p.hex,dc/.045),metalness:m.p.met,roughness:Math.min(.85,m.p.rug+.1)});
 NM="Cortina da persiana";const ct=box(cw,dc,.012,mat,0,H/2-hc-dc/2,zf);g.add(ct);
 NM="Lâmina final";g.add(perf(cw,.03,.02,m.alu,0,H/2-hc-dc-.012,zf));
 return {grupo:g,animar:base.animar,temMovel:base.temMovel,L,H,kind:base.kind}}

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
  fundo:new (T().MeshStandardMaterial)({color:lin(p.hex).multiplyScalar(.45),metalness:p.met,roughness:.8}),
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
function chave(t,cfg){return [t.kind,t.f,t.enc||"",t.per?"P":"",t.L,t.H,t.desc,t.vidroCor||"",t.corPerfil||"",cfg.cor||"",cfg.px||0,cfg.aberto?1:0].join("|")}
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
.t3d .tt .cs{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;pointer-events:auto;max-width:min(560px,calc(100vw - 140px))}
.t3d .tt .cs button.chip{border:0}
.t3d #t3d-pal[hidden]{display:none!important}
.t3d .chip{background:rgba(255,255,255,.94);color:#16262a;border-radius:999px;padding:4px 10px;font:600 12px Inter,system-ui,sans-serif;display:flex;gap:6px;align-items:center;text-shadow:none}
.t3d .sw{width:12px;height:12px;border-radius:50%;border:1px solid rgba(0,0,0,.25)}
.t3d .x{position:absolute;right:max(16px,env(safe-area-inset-right,0px));top:calc(14px + env(safe-area-inset-top,0px));font:600 13px Inter,system-ui,sans-serif;background:#fff;color:#16262a;border:0;border-radius:999px;padding:9px 14px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.25)}
.t3d .bt{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(18px + env(safe-area-inset-bottom,0px));display:flex;gap:8px;flex-wrap:wrap;justify-content:center;width:max-content;max-width:calc(100% - 32px)}
.t3d .bt button{font:600 13px Inter,system-ui,sans-serif;border:0;background:#fff;color:#16262a;border-radius:999px;padding:9px 14px;cursor:pointer;min-height:38px;box-shadow:0 6px 18px rgba(0,0,0,.25)}
.t3d .bt button.pri{background:#c9831a;color:#1d1405}
.t3d .x:focus-visible,.t3d .bt button:focus-visible{outline:3px solid #ffd27a;outline-offset:2px}
.t3d .wm{display:flex;flex-direction:column;align-items:flex-end;gap:3px;text-align:right;max-width:52vw;position:absolute;right:max(16px,env(safe-area-inset-right,0px));top:calc(62px + env(safe-area-inset-top,0px));font:600 10px Inter,system-ui,sans-serif;letter-spacing:.12em;color:rgba(255,255,255,.75);pointer-events:none}
.t3d .cap{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(72px + env(safe-area-inset-bottom,0px));width:max-content;max-width:calc(100% - 32px);background:rgba(255,255,255,.96);color:#16262a;border-left:4px solid #c9831a;border-radius:10px;padding:7px 12px;font:500 13px/1.35 Inter,system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.22);pointer-events:none}
.t3d .wm .lg{width:78px;height:auto;background:#fff;border-radius:12px;padding:2px;box-shadow:0 2px 10px rgba(0,0,0,.25)}.t3d .wm span:last-child{font-weight:500;letter-spacing:.02em;font-size:9.5px;line-height:1.3}
.t3d .cap[hidden]{display:none}.t3d .cap b{font-weight:700}
.t3d .cap:has(.sc){display:flex;gap:10px;align-items:center}.t3d .cap .sc{flex:none;color:#24363b}.t3d .cap small{color:#5d6b6e;font-size:11.5px}
@media (prefers-reduced-motion:reduce){.t3d,.t3d canvas{transition:none}}
`;document.head.appendChild(st)}
function abrir(t,cfg){cfg=cfg||{};if(!T()){alert("O 3D não carregou. Verifique a internet e tente de novo.");return}css();
 if(!V){const d=document.createElement("div");d.className="t3d";d.hidden=true;d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-label","Tipologia em 3D");
  d.innerHTML=`<div class="tt"><span id="t3d-t"></span><small id="t3d-s"></small><div class="cs" id="t3d-ch"></div></div>
  <button type="button" class="x" id="t3d-x">✕ Fechar</button><div class="wm"><img class="lg" alt="FC Consultoria em Esquadria" src="${LOGO}"><span>IMAGENS DEMONSTRATIVAS</span><span>Desenvolvido por FC Consultoria em Esquadria · CNPJ 52.985.682/0001-32</span></div>
  <div class="cap" id="t3d-cap" hidden></div>
  <div class="bt"><button type="button" class="pri" id="t3d-mo">Ver montagem</button><button type="button" id="t3d-de">Desmontar</button><button type="button" id="t3d-ab">Abrir folhas</button><button type="button" id="t3d-gi">Girar 360°</button><button type="button" id="t3d-fr">Frente</button><button type="button" id="t3d-in" hidden title="Simula o controle do vidro inteligente">💡 Desligar vidro</button></div>`;
  document.body.appendChild(d);
  const r=new (T().WebGLRenderer)({antialias:true,alpha:true});r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));r.toneMapping=T().ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.shadowMap.enabled=true;r.shadowMap.type=T().PCFSoftShadowMap;if(T().sRGBEncoding)r.outputEncoding=T().sRGBEncoding;r.setClearColor(0x000000,0);
  d.prepend(r.domElement);
  const cam=new (T().PerspectiveCamera)(28,1,.01,200);const ctl=T().OrbitControls?new (T().OrbitControls)(cam,r.domElement):null;
  if(ctl){ctl.enableDamping=true;ctl.dampingFactor=.08;ctl.enablePan=false;ctl.addEventListener("start",()=>{V.giro=0;V.mexeu=true})}
  V={d,r,cam,ctl,s:null,mo:null,k:0,alvo:0,giro:0,raf:0,dist:3,mexeu:false};
  const fechar=()=>{d.classList.remove("on");setTimeout(()=>{if(V.vit){V.conj.remove(V.vit.g);V.vit.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});V.vit=null}d.hidden=true;cancelAnimationFrame(V.raf);if(V.s)descartar(V.s);V.s=null;if(V.volta)V.volta.focus()},300)};
  d.querySelector("#t3d-x").onclick=fechar;
  /* clique fora da esquadria (sem arrastar) fecha */
  let px=0,py=0;r.domElement.addEventListener("pointerdown",e=>{px=e.clientX;py=e.clientY});
  r.domElement.addEventListener("click",e=>{if(Math.hypot(e.clientX-px,e.clientY-py)>4||V.modo!=="ok")return;const ray=new (T().Raycaster)();const p=new (T().Vector2)(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(p,V.cam);if(!ray.intersectObject(V.conj,true).length)fechar()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!d.hidden)fechar()});
  d.querySelector("#t3d-ab").onclick=e=>{V.alvo=V.alvo?0:1;e.target.textContent=V.alvo?"Fechar folhas":"Abrir folhas"};
  d.querySelector("#t3d-gi").onclick=()=>girar();
  d.querySelector("#t3d-mo").onclick=()=>montagem();
  d.querySelector("#t3d-de").onclick=()=>{V.modo==="v"?sairVitrine():V.modo==="k"||V.modo==="f"?montagem():desmontar()};
  /* dois toques numa peça desmontada: ela vem para a frente com nome e medida */
  let tq=0,tx=0,ty=0;r.domElement.addEventListener("pointerup",e=>{if(V.modo==="k"&&Math.hypot(e.clientX-px,e.clientY-py)<=8){const p=acertar(e.clientX,e.clientY);if(p&&p.gr){vitrine(p);return}}
   if(V.modo!=="k"&&V.modo!=="f")return;if(Math.hypot(e.clientX-px,e.clientY-py)>8)return;const n=performance.now();
   if(n-tq<380&&Math.hypot(e.clientX-tx,e.clientY-ty)<30){tq=0;escolher(e.clientX,e.clientY)}else{tq=n;tx=e.clientX;ty=e.clientY}});
  d.querySelector("#t3d-fr").onclick=()=>{V.giro=0;frente(0)};
  d.querySelector("#t3d-in").onclick=()=>{V.intelAlvo=V.intelAlvo?0:1;intelBotao();const cap=d.querySelector("#t3d-cap");cap.hidden=false;
   cap.innerHTML=V.intelAlvo?"<b>Vidro desligado</b> · fica leitoso: de fora não se vê o ambiente interno":"<b>Vidro ligado</b> · volta a ficar transparente";clearTimeout(V.capT);V.capT=setTimeout(()=>{cap.hidden=true},3500)};
  window.addEventListener("resize",()=>{if(!d.hidden)tam()});}
 V.volta=document.activeElement;
 const mt=materiais(t,cfg);V.mo=montar(t,mt);if(V.s)descartar(V.s);V.s=cena(V.r,Math.max(V.mo.L,V.mo.H)+2);V.conj=new (T().Group)();V.conj.add(V.mo.grupo);V.s.add(V.conj);V.k=0;V.alvo=0;V.mexeu=false;
 const ab=V.d.querySelector("#t3d-ab");ab.textContent="Abrir folhas";ab.hidden=!V.mo.temMovel;
 V.d.querySelector("#t3d-t").textContent=cfg.titulo||("Item "+(t.item||"")+" · "+(t.tipo||""));
 V.d.querySelector("#t3d-s").textContent=(t.L||"")+" × "+(t.H||"")+" mm"+(t.q>1?" · "+t.q+" peças":"")+(t.linha?" · Linha "+t.linha:"");
 V.mt=mt;V.tA=t;V.cfgA=cfg;V.intelK=0;V.intelAlvo=0;V.d.querySelector("#t3d-in").hidden=!ehIntel(t);intelBotao();chipsCor();
 if(V.pc)V.pc.forEach(p=>{if(p.gr)p.gr.dispose()});
 V.cortes=t.cortes&&t.cortes.perfis&&t.cortes.perfis.length?t.cortes:null;pecas();ligarCortes();reais();kit();V.modo="ok";botoes();V.d.querySelector("#t3d-cap").hidden=true;
 V.d.hidden=false;tam();frente(-.35);
 /* sai da miniatura: o canvas começa no tamanho/posição da imagem clicada e cresce até a tela */
 const cv=V.r.domElement,o=cfg.origem&&cfg.origem.getBoundingClientRect?cfg.origem.getBoundingClientRect():null;
 const reduz=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(o&&!reduz){const sc=Math.max(o.width/innerWidth,o.height/innerHeight);cv.style.transition="none";cv.style.transform=`translate(${o.left+o.width/2-innerWidth*sc/2}px,${o.top+o.height/2-innerHeight*sc/2}px) scale(${sc})`;cv.getBoundingClientRect();cv.style.transition="";}
 requestAnimationFrame(()=>{V.d.classList.add("on");cv.style.transform="none"});
 V.giro=0;if(!reduz)girar();cancelAnimationFrame(V.raf);loop();
 setTimeout(()=>V.d.querySelector("#t3d-x").focus(),60);
}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function lc(h){const c=new (T().Color)(h);if(c.convertSRGBToLinear)c.convertSRGBToLinear();return c}
function tam(){const w=innerWidth,h=innerHeight;V.r.setSize(w,h,false);V.cam.aspect=w/Math.max(h,1);V.cam.updateProjectionMatrix();V.dist=enquadrar(V.cam,V.mo.L,V.mo.H,V.cam.aspect,1.55)}
function frente(ry){const d=V.dist;V.cam.position.set(0,d*.06,d);V.cam.lookAt(0,0,0);V.conj.rotation.y=ry;if(V.ctl){V.ctl.target.set(0,0,0);V.ctl.update()}}
/* ---------- montagem peça por peça, desmontar e detalhe da peça ---------- */
function pecas(){const L=[];V.mo.grupo.children.forEach((ch,ti)=>ch.traverse(o=>{if(o.isMesh&&!o.userData.fundo){o.userData.top=ti;L.push(o)}}));
 V.pc=L.map(o=>{o.geometry.computeBoundingBox();const z=new (T().Vector3)();o.geometry.boundingBox.getSize(z);
  return {o,len:o.userData.len||0,hp:o.position.clone(),hr:[o.rotation.x,o.rotation.y,o.rotation.z],nm:o.userData.nm||"Peça",sx:z.x,sy:z.y,top:o.userData.top,tg:"home",t0:0,pend:false,ex:null,er:null}});
}
/* bancada: peças pequenas, separadas por tipo, deitadas de frente para a câmera */
function kit(){
 const nomes=[];V.pc.forEach(p=>{if(nomes.indexOf(p.nm)<0)nomes.push(p.nm)});
 const L0=V.mo.L,H0=V.mo.H,AW=Math.max(L0,H0*.9)*1.3,AH=H0*.92,cw=AW/nomes.length;
 nomes.forEach((nm,ci)=>{const ps=V.pc.filter(p=>p.nm===nm);let mx=0;ps.forEach(p=>{p.krz=p.sy>p.sx?Math.PI/2:0;mx=Math.max(mx,p.kx||p.sx,p.ky||p.sy)});
  let ks=Math.min(1,.82*cw/Math.max(mx,.01));let soma=0;ps.forEach(p=>soma+=Math.min(p.kx||p.sx,p.ky||p.sy)*1.25);
  if(soma*ks>AH*.85)ks=AH*.85/soma;const livre=Math.max(0,AH-soma*ks),sp=Math.min(livre/Math.max(ps.length,1),H0*.12);
  const tot=soma*ks+sp*(ps.length-1);let y=tot/2;ps.forEach(p=>{const t=Math.min(p.kx||p.sx,p.ky||p.sy)*1.25*ks;y-=t/2;p.kp=new (T().Vector3)(-AW/2+cw/2+ci*cw,y,0);y-=t/2+sp;p.ks=ks})});}
/* ---------- medidas reais do Orientativo de Montagem (quando a obra tem o PDF) ----------
   cada peça do 3D procura a linha da lista de corte pelo papel dela (marco superior, folha, mão-de-amigo…);
   peças repetidas do quadro consomem a quantidade da linha (ex.: porta sem soleira não tem marco embaixo) */
function fiDe(o){let x=o;while(x){if(x.userData&&x.userData.fi!=null)return x.userData;x=x.parent}return null}
function regra(p,kind){const nm=p.nm,lado=p.o.userData.lado||"",hor=p.sx>=p.sy,pos=hor?"L":"H",correr=kind==="correr"||kind==="correr4";
 if(nm==="Marco"){if(correr)return lado==="sup"?{re:/MARCO SUP|TRILHO SUP/,cap:1}:lado==="inf"?{re:/MARCO INF|GUIA INF/,cap:1}:{re:/MARCO LAT/,cap:1};return {re:/^MARCO/,pos,cap:1}}
 if(nm==="Perfil U")return {re:/PERFIL\s*"?U/,pos,cap:1};
 if(nm==="Folha"){if(correr){if(hor)return {re:/LARG\S* FOLHA|FOLHA LARG/,cap:1};const f=fiDe(p.o);if(!f)return {re:/MONTANTE|M[ÃA]O.?(DE.?)?AMIGO/,cap:1};
   const i=f.fi,n=f.fn,ext=(i===0&&lado==="esq")||(i===n-1&&lado==="dir"),meio=n===4&&((i===1&&lado==="dir")||(i===2&&lado==="esq"));
   return ext?{re:/MONTANTE LAT/,lbl:"Montante lateral",cap:1}:meio?{re:/MONTANTE CENT/,lbl:"Montante central",cap:1}:{re:/M[ÃA]O.?(DE.?)?AMIGO/,lbl:"Mão-de-amigo",cap:1}}
  return {re:/^FOLHA/,pos,cap:1}}
 if(nm==="Travessa")return {re:/^TRAVESSA/,pos,cap:1};
 if(nm==="Montante")return {re:kind==="max"||kind==="maxp"?/COLUNA|^TRAVESSA|MONTANTE/:/MONTANTE/,cap:1};
 if(nm==="Lambri")return {re:/^LAMBRI/};
 if(nm==="Aleta da veneziana")return {re:/VENEZIANA/};
 return null}
const frase=s=>{s=String(s||"").split(/\s[-|]\s/)[0].trim().toLowerCase();return s.charAt(0).toUpperCase()+s.slice(1)};
function ligarCortes(){if(!V.pc)return;V.pc.forEach(p=>p.ct=null);if(!V.cortes)return;
 const C=V.cortes,grupos={};
 V.pc.forEach(p=>{if(p.nm==="Vidro"){/* vidro: a chapa da lista mais parecida com a do desenho */
   const w=p.sx*1000,h=p.sy*1000;let best=null,bd=1e9;(C.vidros||[]).forEach(v=>{const d=Math.abs(v.larg-w)+Math.abs(v.alt-h);if(d<bd){bd=d;best=v}});if(best)p.ct={vid:best};return}
  const r=regra(p,V.mo.kind);if(!r){p.ct={sem:1};return}
  let rows=C.perfis.filter(x=>r.re.test(String(x.nome||"").toUpperCase()));
  if(r.pos&&rows.some(x=>x.pos===r.pos))rows=rows.filter(x=>x.pos===r.pos);
  if(!rows.length)return;
  if(!r.cap){/* peças repetidas (réguas, aletas): a linha de medida mais próxima */
   const l=(p.len||Math.max(p.sx,p.sy))*1000;rows.sort((a,b)=>Math.abs(a.tam-l)-Math.abs(b.tam-l));p.ct={row:rows[0],lbl:r.lbl};return}
  const k=r.re.source+"|"+(r.pos||"");(grupos[k]=grupos[k]||{rows,ps:[],lbl:r.lbl}).ps.push(Object.assign(p,{_lbl:r.lbl}))});
 Object.values(grupos).forEach(g=>{const slots=[];g.rows.forEach(x=>{for(let i=0;i<Math.max(1,Math.round(x.q));i++)slots.push(x)});
  g.ps.forEach((p,i)=>{p.ct=slots[i]?{row:slots[i],lbl:p._lbl}:null})});
}
const qt=v=>{const n=+v||0;return Number.isInteger(n)?String(n):String(Math.round(n*100)/100).replace(".",",")};
function txtCorte(c){return c==="45/45"?"corte 45° nas duas pontas":c==="90/90"?"corte reto":/^(90\/45|45\/90)$/.test(c)?"uma ponta reta e outra a 45°":"corte "+c}
function svgSecao(r){const S=r&&r.s&&V.cortes&&V.cortes.secoes&&V.cortes.secoes[r.s];if(!S)return "";const k=30/Math.max(S.w,S.h,1);
 const d=S.f.map(f=>[f.c,...f.h].map(q=>"M"+q.map(t=>(t[0]*k).toFixed(1)+" "+(-t[1]*k).toFixed(1)).join("L")+"Z").join("")).join("");
 return `<svg class="sc" viewBox="-17 -17 34 34" width="34" height="34" aria-hidden="true"><path d="${d}" fill="currentColor" fill-rule="evenodd"/></svg>`}
function detalhe(p){const nm=esc(p.nm);
 if(!V.cortes)return `<b>${nm}</b> · medida aproximada ${medida(p)} · toque duas vezes para voltar`;
 const c=p.ct;
 if(c&&c.vid)return `<b>Vidro</b> · <b>${c.vid.larg} × ${c.vid.alt} mm</b> · ${qt(c.vid.q)} por esquadria`;
 if(c&&c.row){const lb=c.lbl||frase(c.row.desc||c.row.nome);const r=c.row;
  return `${p.gr?svgSecao(r):""}<span><b>${nm}</b>${lb&&lb.toUpperCase()!==p.nm.toUpperCase()?" · "+esc(lb):""} · corte <b>${r.tam} mm</b> · ${txtCorte(r.corte)} · ${qt(r.q)} por esquadria</span>`}
 if(c&&c.sem)return `<b>${nm}</b> · sem medida de corte`;
 return `<b>${nm}</b> · não consta na lista de corte desta tipologia`}
/* peça real: a seção do desenho do Orientativo, extrudada no comprimento de corte, com as pontas em 45° quando o corte pede */
function reais(){if(!V.pc)return;const sec=V.cortes&&V.cortes.secoes;
 V.pc.forEach(p=>{p.gb=p.o.geometry;p.gr=null;p.ar=null;p.kx=p.ky=0;const r=p.ct&&p.ct.row;if(!sec||!r||!r.s||!sec[r.s]||!r.tam)return;
  try{const S=sec[r.s],k=.001,V2=(q)=>new (T().Vector2)(q[0]*k,q[1]*k);
   const formas=S.f.map(f=>{const sh=new (T().Shape)(f.c.map(V2));f.h.forEach(h=>sh.holes.push(new (T().Path)(h.map(V2))));return sh});
   const L=r.tam*k,g=new (T().ExtrudeGeometry)(formas,{depth:L,bevelEnabled:false,curveSegments:1});g.translate(0,0,-L/2);
   const [a,b]=String(r.corte||"").split("/").map(Number),ym=(S.h*k)/2,ps=g.attributes.position;
   for(let i=0;i<ps.count;i++){const z=ps.getZ(i),y=ps.getY(i),d=Math.max(0,ym-y);
    if(z>0&&b===45)ps.setZ(i,z-d);else if(z<0&&a===45)ps.setZ(i,z+d)}
   ps.needsUpdate=true;g.computeVertexNormals();
   if(p.sx>=p.sy)g.rotateY(Math.PI/2);else g.rotateX(-Math.PI/2);
   g.computeBoundingBox();const z=new (T().Vector3)();g.boundingBox.getSize(z);
   p.gr=g;p.kx=z.x;p.ky=z.y;p.sx=Math.max(p.sx,z.x);p.sy=Math.max(p.sy,z.y);
   if(!V.matAresta)V.matAresta=new (T().LineBasicMaterial)({color:0x24363b,transparent:true,opacity:.6});
   const ar=new (T().LineSegments)(new (T().EdgesGeometry)(g,28),V.matAresta);ar.userData.aresta=1;ar.visible=false;p.o.add(ar);p.ar=ar}catch(e){p.gr=null}});
}
/* ---------- vitrine do perfil: um toque no perfil desmontado e ele vem grande para o centro ----------
   pedaço curto do perfil real (a seção aparece inteira), gira devagar, o cliente arrasta para girar e afasta os dedos para aproximar */
function acertar(cx,cy){const r=V.r.domElement.getBoundingClientRect();const ray=new (T().Raycaster)();ray.setFromCamera(new (T().Vector2)((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1),V.cam);
 const h=ray.intersectObjects(V.pc.map(p=>p.o),false)[0];return h?V.pc.find(q=>q.o===h.object):null}
function vitrine(p){const r=p.ct&&p.ct.row,S=r&&V.cortes.secoes[r.s];if(!S)return;
 const k=.001,V2=q=>new (T().Vector2)(q[0]*k,q[1]*k),mx=Math.max(S.w,S.h);
 const formas=S.f.map(f=>{const sh=new (T().Shape)(f.c.map(V2));f.h.forEach(h=>sh.holes.push(new (T().Path)(h.map(V2))));return sh});
 const Lp=Math.max(mx*2.6,60)*k,g=new (T().ExtrudeGeometry)(formas,{depth:Lp,bevelEnabled:false,curveSegments:1});g.translate(0,0,-Lp/2);g.computeVertexNormals();
 const grp=new (T().Group)(),m=new (T().Mesh)(g,p.o.material);m.castShadow=true;m.receiveShadow=true;grp.add(m);
 if(!V.matAresta)V.matAresta=new (T().LineBasicMaterial)({color:0x24363b,transparent:true,opacity:.6});
 grp.add(new (T().LineSegments)(new (T().EdgesGeometry)(g,28),V.matAresta));
 /* tamanho: a peça ocupa boa parte da tela */
 const alvo=Math.min(V.dist*.6,2*Math.tan(V.cam.fov*Math.PI/360)*V.dist*V.cam.aspect*.72),sc=alvo/Math.max(Lp,mx*k);
 grp.scale.set(.01,.01,.01);grp.rotation.set(.32,1.05,0);grp.userData.sc=sc;
 V.pc.forEach(q=>q.o.visible=false);V.giro=0;V.conj.rotation.set(0,0,0);frente(0);
 V.vit={g:grp,p,t0:performance.now()};V.conj.add(grp);V.focus=null;V.modo="v";V.mexeu=false;botoes();
 const cap=V.d.querySelector("#t3d-cap");cap.hidden=false;cap.innerHTML=legendaVitrine(p)}
function legendaVitrine(p){const r=p.ct.row,lb=p.ct.lbl||frase(r.desc||r.nome),nm=esc(p.nm);
 return `${svgSecao(r).replace('width="34" height="34"','width="54" height="54"')}<span><b>${nm}</b>${lb&&lb.toUpperCase()!==p.nm.toUpperCase()?" · "+esc(lb):""}<br>Perfil usado nesta obra · corte <b>${r.tam} mm</b> · ${txtCorte(r.corte)} · ${qt(r.q)} por esquadria<br><small>Imagem demonstrativa · arraste para girar · afaste os dedos para aproximar</small></span>`}
function passoVitrine(){const v=V.vit;if(!v)return;const g=v.g,now=performance.now(),e=Math.min(1,(now-v.t0)/650),ez=1-Math.pow(1-e,3),sc=g.userData.sc*ez;
 g.scale.set(Math.max(sc,.001),Math.max(sc,.001),Math.max(sc,.001));}
function sairVitrine(){const v=V.vit;if(v){V.conj.remove(v.g);v.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});V.vit=null}
 V.pc.forEach(q=>q.o.visible=true);frente(0);V.modo="k";botoes()}
/* 05/11/2026 · o fundo escuro atrás das réguas do lambri é só sombra da montagem: não é peça, some ao desmontar */
function fundos(v){if(V.mo&&V.mo.grupo)V.mo.grupo.traverse(o=>{if(o.userData&&o.userData.fundo)o.visible=v})}
function linhas(v){V.mo.grupo.traverse(o=>{if(o.isLine&&!o.userData.aresta)o.visible=v})}
function botoes(){const k=V.modo==="k"||V.modo==="f"||V.modo==="v";const de=V.d.querySelector("#t3d-de");de.textContent=V.modo==="v"?"Voltar às peças":k?"Montar":"Desmontar";de.className=k?"pri":"";
 V.d.querySelector("#t3d-mo").hidden=k;V.d.querySelector("#t3d-ab").hidden=k||!V.mo.temMovel||V.modo==="m";}
function fecharFolhas(){V.alvo=0;V.k=0;V.mo.animar(0);const ab=V.d.querySelector("#t3d-ab");if(ab)ab.textContent="Abrir folhas"}
const rnd=a=>(Math.random()-.5)*a;
function montagem(){if(!V.pc||!V.pc.length)return;V.pc.forEach(p=>{if(p.gr){p.o.geometry=p.gb;p.ar.visible=false}});fecharFolhas();V.giro=0;V.focus=null;const doKit=V.modo==="k"||V.modo==="f";if(!doKit)frente(-.35);
 const now=performance.now(),N=V.pc.length,g=Math.min(90,4200/N);let t=now+250,top=-1;
 V.pc.forEach(p=>{if(p.top!==top){if(top>=0)t+=220;top=p.top}p.tg="home";p.t0=t;t+=g;
  if(!doKit){p.ex=p.hp.clone().add(new (T().Vector3)(rnd(V.mo.L*2.2),rnd(V.mo.H*1.4)+V.mo.H*.1,V.dist*(.45+Math.random()*.3)));p.er=[rnd(3),rnd(3),rnd(3)];p.pend=true;p.o.visible=false}});
 V.fimM=t+1300;linhas(false);V.modo="m";botoes();V.d.querySelector("#t3d-cap").hidden=false}
function desmontar(){if(!V.pc||!V.pc.length)return;fundos(false);V.pc.forEach(p=>{if(p.gr){p.o.geometry=p.gr;p.ar.visible=true}});fecharFolhas();V.giro=0;V.focus=null;frente(0);const now=performance.now();
 V.pc.forEach((p,i)=>{p.o.visible=true;p.pend=false;p.tg="kit";p.t0=now+80+(V.pc.length-1-i)*Math.min(25,1500/V.pc.length)});
 linhas(false);V.modo="k";botoes();V.d.querySelector("#t3d-cap").hidden=false}
function escolher(cx,cy){const r=V.r.domElement.getBoundingClientRect();const ray=new (T().Raycaster)();ray.setFromCamera(new (T().Vector2)((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1),V.cam);
 const h=ray.intersectObjects(V.pc.map(p=>p.o),false)[0];const p=h?V.pc.find(q=>q.o===h.object):null;
 if(V.focus)V.focus.tg="kit";if(!p||p===V.focus){V.focus=null;V.modo="k"}else{V.focus=p;p.tg="foco";V.modo="f";
  const vw=2*Math.tan(V.cam.fov*Math.PI/360)*V.dist*.55*V.cam.aspect;p.fs=Math.min(8,Math.min(vw*(p.gr?.75:.55),V.dist*(p.gr?.5:.35))/Math.max(p.sx,p.sy,.01))}botoes()}
const mm=v=>Math.round(v*1000/5)*5;
function medida(p){return p.nm==="Vidro"?`${mm(p.sx)} × ${mm(p.sy)} mm`:`${mm(p.len||Math.max(p.sx,p.sy))} mm`}
const TMP=()=>V.tmp||(V.tmp=new (T().Vector3)());
function passoPecas(){const now=performance.now();V.s.updateMatrixWorld();const v=TMP();let ult=-1;
 /* suavização pelo tempo (mesma velocidade em aparelho lento ou rápido) */
 const dt=Math.min(250,now-(V.lt||now));V.lt=now;const a=1-Math.pow(.91,Math.max(dt,1)/16.7);
 V.pc.forEach((p,i)=>{const o=p.o;if(now<p.t0)return;ult=i;if(p.pend){p.pend=false;o.visible=true;o.position.copy(p.ex);o.rotation.set(p.er[0],p.er[1],p.er[2]);o.scale.set(1,1,1)}
  let tp,tr,ts;if(p.tg==="home"){tp=p.hp;tr=p.hr;ts=1}
  else if(p.tg==="kit"){tp=o.parent.worldToLocal(V.conj.localToWorld(v.copy(p.kp)));tr=p.gr?(p.krz?[.5,.45,p.krz]:[.5,.45,0]):[0,0,p.krz];ts=p.ks}
  else{tp=o.parent.worldToLocal(v.copy(V.cam.position).multiplyScalar(.45));tr=p.gr?[.32,.75,p.krz]:[.3,.6,p.krz];ts=p.fs}
  o.position.lerp(tp,a);o.rotation.set(o.rotation.x+(tr[0]-o.rotation.x)*a,o.rotation.y+(tr[1]-o.rotation.y)*a,o.rotation.z+(tr[2]-o.rotation.z)*a);const sc=o.scale.x+(ts-o.scale.x)*a;o.scale.set(sc,sc,sc)});
 const cap=V.d.querySelector("#t3d-cap");
 if(V.modo==="m"){if(ult>=0)cap.innerHTML=`Montagem · <b>${esc(V.pc[ult].nm)}</b> · peça ${ult+1} de ${V.pc.length}`;
  if(now>V.fimM){V.pc.forEach(p=>{p.o.position.copy(p.hp);p.o.rotation.set(p.hr[0],p.hr[1],p.hr[2]);p.o.scale.set(1,1,1);p.o.visible=true});linhas(true);fundos(true);V.modo="ok";botoes();
   cap.innerHTML="<b>Montagem concluída</b> · arraste para girar";clearTimeout(V.capT);V.capT=setTimeout(()=>{if(V.modo==="ok")cap.hidden=true},3500)}}
 else if(V.modo==="k")cap.innerHTML=V.cortes?(V.pc.some(p=>p.gr)?"Perfis reais da lista de corte · <b>toque em um perfil</b> para ver em destaque":"Peças separadas · <b>toque duas vezes em uma peça</b> para ver a medida de corte"):"Peças separadas · <b>toque duas vezes em uma peça</b> para ver o detalhe";
 else if(V.modo==="f")cap.innerHTML=detalhe(V.focus);}
/* 05/11/2026 · chips de cor: com cfg.onCor viram botões para simular outra cor de perfil/vidro (só demonstração) */
function chipsCor(){const mt=V.mt,t=V.tA,cfg=V.cfgA,el=V.d.querySelector("#t3d-ch");const sim=!!(cfg.onCor&&cfg.cores);
 const nm=(k,id,d)=>{const f=sim&&(cfg.cores[k]||[]).find(x=>x[0]===id);return f?f[1]:d};const nP=t.corPerfil?nm("p",mt.p.id,mt.p.nome):(cfg.cor||mt.p.nome),alt=sim&&(cfg.simAtivo?cfg.simAtivo():!!(t.corPerfil||t.vidroCor));
 const chip=(k,hex,tx)=>sim?`<button type="button" class="chip" data-ck="${k}" style="cursor:pointer;font:inherit" aria-haspopup="true"><span class="sw" style="background:${hex}"></span>${tx} ▾</button>`:`<span class="chip"><span class="sw" style="background:${hex}"></span>${tx}</span>`;
 el.innerHTML=chip("p",mt.p.hex,"Perfil: "+esc(nP))+(sim&&cfg.temVidro===false?"":chip("v",mt.v.hex,"Vidro: "+esc(nm("v",mt.v.id,mt.v.nome))))
  +(alt?`<span class="chip" style="background:#fff6e5;color:#7a4b07;border:1px solid #f0d49a">⚠ Cor só para demonstração · confirme o valor com a vidraçaria</span>`:"")
  +(alt&&cfg.onSalvar?`<button type="button" class="chip" id="t3d-sv" style="cursor:pointer;font:inherit;background:#0d6b68;color:#fff">💾 Salvar cores</button>`:"")
  +`<div id="t3d-pal" hidden style="flex-basis:100%;display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;padding:8px;border-radius:12px;background:rgba(10,25,30,.55)"></div>`;
 if(!sim)return;
 const sv=el.querySelector("#t3d-sv");if(sv)sv.onclick=()=>{sv.textContent="Salvando…";cfg.onSalvar();setTimeout(()=>chipsCor(),900)};
 el.querySelectorAll("[data-ck]").forEach(b=>b.onclick=()=>{const k=b.dataset.ck,pal=el.querySelector("#t3d-pal");
  if(!pal.hidden&&pal.dataset.k===k){pal.hidden=true;return}pal.dataset.k=k;pal.hidden=false;
  const lista=k==="p"?cfg.cores.p:cfg.cores.v,cur=k==="p"?mt.p.id:mt.v.id;
  pal.innerHTML=lista.map(([id,nm])=>{const hx=k==="p"?perfilDe("",id).hex:vidroDe("",id).hex;return`<button type="button" class="chip" data-cid="${id}" style="cursor:pointer;font:inherit;${id===cur?"outline:2px solid #fff":""}"><span class="sw" style="background:${hx}"></span>${esc(nm)}</button>`}).join("")
   +`<label class="chip" style="cursor:pointer;font:inherit;gap:6px"><input type="checkbox" id="t3d-obra"${V.obraToda?" checked":""}> Aplicar na obra toda</label>`
   +(alt?`<button type="button" class="chip" data-cid="__orig" style="cursor:pointer;font:inherit">↺ Cor do orçamento neste item</button>`:"");
  pal.querySelector("#t3d-obra").onchange=e=>{V.obraToda=e.target.checked};
  pal.querySelectorAll("[data-cid]").forEach(x=>x.onclick=()=>{const id=x.dataset.cid;if(id==="__orig")cfg.onCor("reset");else cfg.onCor(k,id,!!V.obraToda);recolorir();chipsCor()})})}
function intelBotao(){const b=V.d.querySelector("#t3d-in");if(b){b.textContent=V.intelAlvo?"💡 Ligar vidro (transparente)":"💡 Desligar vidro (leitoso)";b.className=V.intelAlvo?"pri":""}}
/* aplica o estado do vidro inteligente por cima da cor do vidro (k: 0 transparente → 1 leitoso) */
function intelAplicar(){const mt=V.mt;if(!mt||!mt.vid)return;const k=V.intelK||0,v=mt.v;const a=new (T().Color)(v.hex),b=new (T().Color)("#f4f6f6");
 if(a.convertSRGBToLinear){a.convertSRGBToLinear();b.convertSRGBToLinear()}mt.vid.color.copy(a.lerp(b,k));mt.vid.opacity=v.op+(.94-v.op)*k;mt.vid.roughness=.02+.55*k;mt.vid.metalness=v.met*(1-k);mt.vid.needsUpdate=true}
function recolorir(){const mt=V.mt,t=V.tA,cfg=V.cfgA;const lin=h=>{const c=new (T().Color)(h);if(c.convertSRGBToLinear)c.convertSRGBToLinear();return c};
 const p=perfilDe(cfg.cor,t.corPerfil),v=vidroDe(t.desc,t.vidroCor);mt.p=p;mt.v=v;
 mt.alu.color.copy(lin(p.hex));mt.alu.metalness=p.met;mt.alu.roughness=p.rug;mt.fundo.color.copy(lin(p.hex).multiplyScalar(.45));mt.fundo.metalness=p.met;
 mt.pux.color.copy(lin(p.id==="preto"?"#3a3f44":"#2b2f33"));
 mt.vid.color.copy(lin(v.hex));mt.vid.opacity=v.op;mt.vid.metalness=v.met;[mt.alu,mt.fundo,mt.vid,mt.pux].forEach(m=>m.needsUpdate=true);if(V.intelK)intelAplicar()}
const GIRO_MS=10000;
function girar(){V.giro=1;V.giroT0=performance.now();V.giroBase=V.conj.rotation.y}
function loop(){V.raf=requestAnimationFrame(loop);if(V.modo==="v")passoVitrine();else if(V.modo&&V.modo!=="ok")passoPecas();else V.lt=0;if(V.intelAlvo!=null&&V.intelK!==V.intelAlvo){V.intelK+=(V.intelAlvo-V.intelK)*.12;if(Math.abs(V.intelAlvo-V.intelK)<.005)V.intelK=V.intelAlvo;intelAplicar()}V.k+=(V.alvo-V.k)*.08;if(Math.abs(V.alvo-V.k)<.001)V.k=V.alvo;V.mo.animar(V.k);
 if(V.giro>0){/* volta de 360° lenta e suave: começa e termina devagar */
  const p=Math.min(1,(performance.now()-V.giroT0)/GIRO_MS),e=.5-.5*Math.cos(Math.PI*p);V.conj.rotation.y=V.giroBase+e*Math.PI*2;
  if(p>=1){V.giro=0;if(!V.mexeu)V.conj.rotation.y=V.giroBase}}
 if(V.ctl)V.ctl.update();V.r.render(V.s,V.cam)}
window.TIP3D={imagem,abrir,PERFIS,VIDROS,perfilDe,vidroDe,ehIntel,limparCache:()=>cache.clear()};
})();
