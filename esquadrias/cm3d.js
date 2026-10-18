/* Esquadrias 3D · Passo a passo · Contramarco em 3D (parede, contramarco CM-200 e componentes)
   FC Consultoria em Esquadria · peças ilustrativas, sem escala de fabricação */
(function(){
 const L3={three:'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',orbit:'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'};
 let carregando=null;
 const BASE=(document.currentScript&&document.currentScript.src||'').replace(/[^/]*$/,'');let JSH=null;
 function janCarregar(){if(JSH)return Promise.resolve(JSH);return fetch(BASE+'jan_shapes.json?v=1').then(r=>r.json()).then(j=>JSH=j).catch(()=>null);}
 function carregar(){if(window.THREE&&THREE.OrbitControls)return janCarregar();if(carregando)return carregando;
  const sc=u=>new Promise((ok,er)=>{const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=er;document.head.appendChild(s);});
  carregando=(window.THREE?Promise.resolve():sc(L3.three)).then(()=>THREE.OrbitControls?null:sc(L3.orbit)).then(janCarregar);return carregando;}
 /* ---------- materiais ---------- */
 let M=null;
 function texTijolo(){const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');x.fillStyle='#b9b2a6';x.fillRect(0,0,512,512);
  const bh=48,bw=104,j=7;for(let r=0;r*bh<512;r++){const off=(r%2)*bw/2;for(let k=-1;k*bw<512+bw;k++){const X=k*bw+off,Y=r*bh;const h=14+Math.random()*8,s=52+Math.random()*10,l=40+Math.random()*9;
    const g=x.createLinearGradient(X,Y,X,Y+bh);g.addColorStop(0,`hsl(${h},${s}%,${l+5}%)`);g.addColorStop(1,`hsl(${h},${s}%,${l-4}%)`);x.fillStyle=g;x.fillRect(X+j/2,Y+j/2,bw-j,bh-j);
    for(let n=0;n<40;n++){x.fillStyle=`rgba(${Math.random()<.5?0:255},0,0,${Math.random()*.06})`;x.fillRect(X+Math.random()*bw,Y+Math.random()*bh,3,2);}
    x.fillStyle='rgba(70,30,20,.35)';x.fillRect(X+bw*.3,Y+bh*.35,bw*.12,bh*.3);x.fillRect(X+bw*.58,Y+bh*.35,bw*.12,bh*.3);}}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
 function texRuido(cor,amp){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=cor;x.fillRect(0,0,256,256);
  for(let n=0;n<4000;n++){const v=Math.random()*amp;x.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()<.5?0:255},${v})`;x.fillRect(Math.random()*256,Math.random()*256,2,2);}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
 function texMadeira(){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'#7a4a24');g.addColorStop(.5,'#94603a');g.addColorStop(1,'#6e4220');x.fillStyle=g;x.fillRect(0,0,512,128);
  for(let n=0;n<70;n++){const y=Math.random()*128,a=.05+Math.random()*.18;x.strokeStyle=`rgba(${Math.random()<.5?40:200},${Math.random()<.5?20:140},10,${a})`;x.lineWidth=.6+Math.random()*1.8;x.beginPath();x.moveTo(0,y);for(let i=0;i<=512;i+=32)x.lineTo(i,y+Math.sin(i/60+n)*3+Math.random()*1.5);x.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,1);return t;}
 const CORES={natural:{color:0xd9dde0,metalness:.85,roughness:.32},preto:{color:0x1d1f21,metalness:.45,roughness:.38},branco:{color:0xf4f4f1,metalness:.15,roughness:.35},madeira:{color:0xffffff,metalness:.1,roughness:.6}};
 function mats(){if(M)return M;const tij=texTijolo();
  M={tij,parede:new THREE.MeshStandardMaterial({map:tij,roughness:.95,envMapIntensity:.35}),
   alu:new THREE.MeshStandardMaterial({color:0xd9dde0,metalness:.85,roughness:.32}),
   aluEsc:new THREE.MeshStandardMaterial({color:0x9aa3a9,metalness:.7,roughness:.4}),
   pvc:new THREE.MeshStandardMaterial({color:0x202224,roughness:.62,metalness:.05,envMapIntensity:.5}),
   zinco:new THREE.MeshStandardMaterial({color:0xb9b4a6,metalness:.8,roughness:.38,side:THREE.DoubleSide}),
   arg:new THREE.MeshStandardMaterial({map:texRuido('#9a9893',.12),roughness:1}),
   reboco:new THREE.MeshStandardMaterial({map:texRuido('#d9d3c7',.04),roughness:1,envMapIntensity:.3}),
   madeira:new THREE.MeshStandardMaterial({map:texRuido('#b98b55',.15),roughness:.8}),
   amarelo:new THREE.MeshStandardMaterial({color:0xf2b705,roughness:.45}),
   vidro:new THREE.MeshPhysicalMaterial({color:0xcfe9f5,transparent:true,opacity:.35,roughness:.05,metalness:0}),
   linha:new THREE.MeshBasicMaterial({color:0x222222}),
   chumbo:new THREE.MeshStandardMaterial({color:0x5a5f63,metalness:.6,roughness:.35})};return M;}
 /* ---------- peças (1 unidade = 1 metro) ---------- */
 function ambiente(r){/* reflexo de estúdio para o alumínio e o aço parecerem reais */
  const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#ffffff');g.addColorStop(.45,'#dfe6ea');g.addColorStop(.5,'#9aa5ab');g.addColorStop(1,'#4b5257');x.fillStyle=g;x.fillRect(0,0,512,256);
  x.fillStyle='rgba(255,255,255,.95)';x.fillRect(60,40,120,30);x.fillRect(320,30,140,26);x.fillStyle='rgba(255,255,255,.6)';x.fillRect(200,90,90,16);
  const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;const pm=new THREE.PMREMGenerator(r);const env=pm.fromEquirectangular(t).texture;pm.dispose();return env;}
 function serra(sh,x0,x1,y,dente,alt,cima){/* borda serrilhada */const n=Math.max(2,Math.round((x1-x0)/dente));for(let k=0;k<=n;k++){const x=x0+(x1-x0)*k/n;sh.lineTo(x,y+(k%2?(cima?alt:-alt):0));}}
 function perfilCM(comp){/* CM-200 conforme o desenho: altura 23,6 · aba a 11,6 · largura 26 mm, com serrilhado de fixação */
  const s=new THREE.Shape(),t=.0014;
  s.moveTo(0,0);s.lineTo(.0045,0);s.lineTo(.0045,.0022);s.lineTo(.0032,.0022);s.lineTo(.0032,t);s.lineTo(t,t);s.lineTo(t,.0116-t);
  s.lineTo(.026-t,.0116-t);s.lineTo(.026-t,.0012);s.lineTo(.0215,.0012);s.lineTo(.0215,0);s.lineTo(.026,0);
  for(let k=0;k<5;k++){const y=.0012+k*.0021;s.lineTo(.026,y+.001);s.lineTo(.0268,y+.0016);s.lineTo(.026,y+.0021);}
  s.lineTo(.026,.0116);s.lineTo(t,.0116);s.lineTo(t,.0236);s.lineTo(-.0012,.0236);s.lineTo(-.0012,.0224);s.lineTo(0,.0224);s.lineTo(0,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:comp,bevelEnabled:false,curveSegments:2});g.translate(0,0,-comp/2);return new THREE.Mesh(g,mats().alu);}
 function grapa(dobra){/* CHU-787: chapa de aço zincada com recortes e furos (grapa ou chumbador) */
  const L=.11,W=.026,t=.0015,s=new THREE.Shape();s.moveTo(0,0);
  const borda=(y,dir)=>{const pts=[];for(let k=0;k<=6;k++){const x=k*L/6;pts.push([x,y]);if(k<6){pts.push([x+L/24,y]);pts.push([x+L/16,y+dir*.0045]);pts.push([x+L/9.5,y+dir*.0045]);pts.push([x+L/8.2,y]);}}return pts;};
  borda(0,1).forEach(([x,y])=>s.lineTo(x,y));s.lineTo(L,W);borda(W,-1).reverse().forEach(([x,y])=>s.lineTo(x,y));s.lineTo(0,0);
  [[.016],[.05],[.084]].forEach(([x],k)=>{const h=new THREE.Path();if(k===1){h.absellipse(x,W/2,.007,.0035,0,Math.PI*2,false,0);}else{h.absarc(x,W/2,.0035,0,Math.PI*2,false);}s.holes.push(h);});
  const g=new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:false,curveSegments:16});g.translate(0,-W/2,-t/2);
  const m=new THREE.Mesh(g,mats().zinco);m.rotation.x=Math.PI/2;const G=new THREE.Group();
  if(dobra){/* dobrada em L: uma parte presa no contramarco, outra na parede */const a=m.clone();a.scale.x=.38;const b=m.clone();b.scale.x=.62;b.position.x=L*.38;b.rotation.z=.6;G.add(a,b);}else G.add(m);
  return G;}
 function esquadro(){/* ESQ160: esquadro plástico preto em treliça, com abas e furos */
  const L=.16,s=new THREE.Shape();s.moveTo(0,0);s.lineTo(L,0);s.lineTo(0,L);s.lineTo(0,0);
  const tri=(a,b,c)=>{const h=new THREE.Path();h.moveTo(...a);h.lineTo(...b);h.lineTo(...c);h.lineTo(...a);s.holes.push(h);};
  const e=.013,m=L/2;
  tri([e,e*1.6],[m-e*.8,e*1.6],[e,m-e*.8]);tri([m+e*.8,e*1.6],[L-e*3.2,e*1.6],[m+e*.8,m-e*2.6]);tri([e*1.6,m+e*.8],[m-e*2.6,m+e*.8],[e*1.6,L-e*3.2]);tri([m-e*.2,e*2.4],[m-e*.2,m-e*2.4],[e*2.4,m-e*.2]);
  const g=new THREE.ExtrudeGeometry(s,{depth:.006,bevelEnabled:true,bevelSize:.0008,bevelThickness:.0008,bevelSegments:1});const G=new THREE.Group();G.add(new THREE.Mesh(g,mats().pvc));
  /* abas laterais que abraçam o contramarco */
  [[L/2,-.004,L,.008,0],[-.004,L/2,.008,L,0]].forEach(([x,y,w,h])=>{const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,.022),mats().pvc);a.position.set(x,y,.008);G.add(a);});
  for(let k=1;k<7;k++){[[k*L/7.5,-.004],[-.004,k*L/7.5]].forEach(([x,y])=>{const f=new THREE.Mesh(new THREE.CylinderGeometry(.0018,.0018,.024,10),new THREE.MeshStandardMaterial({color:0x3a3d40}));f.rotation.x=Math.PI/2;f.position.set(x,y,.008);G.add(f);});}
  return G;}
 function canto(){/* CON063: cantoneira de conexão em PVC, em L, com nervuras */
  const G=new THREE.Group(),m=mats().pvc,c=.055,w=.016,t=.012;
  const perna=(rot)=>{const P=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(c,w,t),m);b.position.x=c/2;P.add(b);
   for(let k=0;k<6;k++){const r=new THREE.Mesh(new THREE.BoxGeometry(.003,w+.003,t+.002),new THREE.MeshStandardMaterial({color:0x141516,roughness:.5}));r.position.x=.012+k*.0075;P.add(r);}
   const ponta=new THREE.Mesh(new THREE.BoxGeometry(.006,w-.004,t-.003),m);ponta.position.x=c+.002;P.add(ponta);P.rotation.z=rot;return P;};
  G.add(perna(0),perna(Math.PI/2));const n=new THREE.Mesh(new THREE.CylinderGeometry(w*.75,w*.75,t+.004,4,1),m);n.rotation.set(Math.PI/2,0,Math.PI/4);G.add(n);return G;}
 function cantoneira(comp){/* CL-006: cantoneira de PVC preta em L (barra de 6 m) */
  const s=new THREE.Shape(),a=.022,e=.0022;s.moveTo(0,0);s.lineTo(a,0);s.lineTo(a,e);s.lineTo(e,e);s.lineTo(e,a);s.lineTo(0,a);s.lineTo(0,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:comp||.25,bevelEnabled:true,bevelSize:.0005,bevelThickness:.0005,bevelSegments:1});g.translate(0,0,-(comp||.25)/2);return new THREE.Mesh(g,mats().pvc);}
 function cunha(){/* CL-011: macho e cunha, perfil de PVC cinza em "telhado" com dentes */
  const G=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:0x6f7579,roughness:.65,metalness:0,side:THREE.DoubleSide,envMapIntensity:.4}),Lc=.18;
  const s=new THREE.Shape(),e=.0018;s.moveTo(-.02,0);s.lineTo(0,.016);s.lineTo(.02,0);s.lineTo(.02-e,0);s.lineTo(0,.016-e*1.4);s.lineTo(-.02+e,0);s.lineTo(-.02,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:Lc,bevelEnabled:false});g.translate(0,0,-Lc/2);G.add(new THREE.Mesh(g,m));
  for(let k=0;k<9;k++){[-1,1].forEach(sx=>{const d=new THREE.Mesh(new THREE.BoxGeometry(.004,.012,.012),m);d.position.set(sx*.021,-.004,-Lc/2+.012+k*.019);d.rotation.z=sx*.25;G.add(d);});}
  return G;}
 function calco(){/* calço de madeira usado junto com o macho e cunha no vão */
  const G=new THREE.Group();const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.12,0);s.lineTo(0,.025);s.lineTo(0,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:.03,bevelEnabled:false});const a=new THREE.Mesh(g,mats().madeira);const b=new THREE.Mesh(g,mats().madeira);b.rotation.z=Math.PI;b.position.set(.12,.026,0);G.add(a,b);return G;}
 function nivel(){const G=new THREE.Group();const c=new THREE.Mesh(new THREE.BoxGeometry(.5,.035,.025),mats().amarelo);G.add(c);
  const v=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.06,16),new THREE.MeshStandardMaterial({color:0x9be37a,transparent:true,opacity:.85}));v.rotation.z=Math.PI/2;v.position.z=.014;G.add(v);return G;}
 function prumo(h){const G=new THREE.Group();const f=new THREE.Mesh(new THREE.CylinderGeometry(.0008,.0008,h,6),mats().linha);f.position.y=-h/2;G.add(f);
  const p=new THREE.Mesh(new THREE.ConeGeometry(.014,.04,16),mats().chumbo);p.rotation.x=Math.PI;p.position.y=-h-.02;G.add(p);return G;}
 const PECAS={'CM-200':()=>{const m=perfilCM(.12);m.rotation.set(.25,-.75,0);return m;},'CHU-787':()=>{const g=grapa(false);g.rotation.set(.9,.25,.15);return g;},'ESQ160':()=>{const e=esquadro();e.rotation.set(-.5,.35,0);return e;},'CON063':()=>{const c=canto();c.rotation.set(-.55,.4,-.1);return c;},'CL-006':()=>{const m=cantoneira(.12);m.rotation.set(.3,-.75,0);return m;},'CL-011':()=>{const g=cunha();g.rotation.set(.45,-.7,0);return g;},};
 /* ---------- cena da parede ---------- */
 const VW=1.2,VH=1.0,FOL=.02,PE=.14;/* vão, folga para argamassa, espessura da parede */
 function cena(el){const S={el};const W=el.clientWidth,H=el.clientHeight;
  const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,alpha:true});r.setPixelRatio(Math.min(2,devicePixelRatio));r.setSize(W,H);r.shadowMap.enabled=true;r.localClippingEnabled=true;el.appendChild(r.domElement);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0xe9eef1);sc.environment=ambiente(r);const cam=new THREE.PerspectiveCamera(38,W/H,.01,50);cam.position.set(1.15,.55,2.2);
  const ctl=new THREE.OrbitControls(cam,r.domElement);ctl.enableDamping=true;ctl.target.set(0,0,0);ctl.minDistance=.25;ctl.maxDistance=5;
  sc.add(new THREE.HemisphereLight(0xffffff,0x8a8070,.35));const sol=new THREE.DirectionalLight(0xffffff,.6);sol.position.set(2.5,3,3);sol.castShadow=true;sol.shadow.mapSize.set(2048,2048);
  Object.assign(sol.shadow.camera,{left:-2,right:2,top:2,bottom:-2});sc.add(sol);
  const corte=new THREE.Plane(new THREE.Vector3(0,0,-1),-.005);S.corte=corte;
  const m=mats();const pm=m.parede.clone();pm.clippingPlanes=[];const am=m.arg.clone();
  /* parede com o vão */
  const G=new THREE.Group();sc.add(G);const tw=2.6,th=2.2;
  const blocos=[[(tw-VW)/2/2+VW/2,0,(tw-VW)/2,th],[-((tw-VW)/2/2+VW/2),0,(tw-VW)/2,th],[0,(th-VH)/2/2+VH/2,VW,(th-VH)/2],[0,-((th-VH)/2/2+VH/2),VW,(th-VH)/2]];
  blocos.forEach(([x,y,w,h])=>{const g=new THREE.BoxGeometry(w,h,PE);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,uv.getX(i)*w*2.4,uv.getY(i)*h*2.4);}const ms=new THREE.Mesh(g,pm);ms.position.set(x,y,0);ms.castShadow=ms.receiveShadow=true;G.add(ms);});
  /* reboco: camada de massa sobre a alvenaria (botão "Rebocar a parede") */
  const rm=m.reboco.clone();const reb=new THREE.Group();G.add(reb);const RE=.012;
  blocos.forEach(([x,y,w,h])=>[-1,1].forEach(sz=>{const ms=new THREE.Mesh(new THREE.BoxGeometry(w,h,RE),rm);ms.position.set(x,y,sz*(PE/2+RE/2));ms.receiveShadow=true;reb.add(ms);}));
  [[0,VH/2-.001,VW,.002,PE+2*RE],[0,-VH/2+.001,VW,.002,PE+2*RE],[VW/2-.001,0,.002,VH,PE+2*RE],[-VW/2+.001,0,.002,VH,PE+2*RE]].forEach(([x,y,w,h,d])=>{const ms=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),rm);ms.position.set(x,y,0);reb.add(ms);});
  /* contramarco */
  const CM=new THREE.Group();G.add(CM);const iw=VW-2*FOL,ih=VH-2*FOL;
  const lados=[[0,ih/2,iw,0],[0,-ih/2,iw,Math.PI],[iw/2,0,ih,-Math.PI/2],[-iw/2,0,ih,Math.PI/2]];
  lados.forEach(([x,y,c,rz])=>{const p=perfilCM(c);p.rotation.set(0,Math.PI/2,0);const g=new THREE.Group();g.add(p);p.position.set(0,0,0);g.rotation.z=rz;g.position.set(x,y,0);
   p.rotation.set(0,Math.PI/2,Math.PI/2);p.position.set(0,0,-PE/2+.03);CM.add(g);});
  CM.children.forEach(o=>o.traverse(c=>{if(c.isMesh){c.castShadow=true;}}));
  const cantos=new THREE.Group();G.add(cantos);[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sy])=>{const c=canto();c.scale.set(.8,.8,.8);c.position.set(sx*(iw/2-.012),sy*(ih/2-.012),-PE/2+.045);c.rotation.z=sx<0&&sy<0?0:sx>0&&sy<0?Math.PI/2:sx>0&&sy>0?Math.PI:-Math.PI/2;cantos.add(c);});
  const esq=new THREE.Group();G.add(esq);[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sy])=>{const e=esquadro();e.position.set(sx*(iw/2-.028),sy*(ih/2-.028),.01);e.rotation.z=sx<0&&sy<0?0:sx>0&&sy<0?Math.PI/2:sx>0&&sy>0?Math.PI:-Math.PI/2;esq.add(e);});
  const gr=new THREE.Group();G.add(gr);const pos=(L)=>{const o=[.15];let p=.15+.45;while(p<L-.1){o.push(p);p+=.45;}if(L-.15-o[o.length-1]>.08)o.push(L-.15);return o;};
  pos(ih).forEach(d=>[-1,1].forEach(sx=>{const g=grapa(true);g.position.set(sx*(iw/2),-ih/2+d,-PE/2+.045);g.rotation.y=sx>0?0:Math.PI;gr.add(g);}));
  pos(iw).forEach(d=>[-1,1].forEach(sy=>{const g=grapa(true);g.position.set(-iw/2+d,sy*(ih/2),-PE/2+.045);g.rotation.set(0,0,sy>0?Math.PI/2:-Math.PI/2);gr.add(g);}));
  /* cotas 150 / 450 */
  const cota=(txt,x,y)=>{const c=document.createElement('canvas');c.width=256;c.height=96;const k=c.getContext('2d');k.fillStyle='rgba(19,35,46,.88)';k.beginPath();k.roundRect?k.roundRect(4,8,248,80,18):k.rect(4,8,248,80);k.fill();k.fillStyle='#ffd58a';k.font='bold 46px system-ui';k.textAlign='center';k.fillText(txt,128,66);
   const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));sp.scale.set(.16,.06,1);sp.position.set(x,y,.08);return sp;};
  const cotas=new THREE.Group();G.add(cotas);cotas.add(cota('150 mm',-iw/2-.16,-ih/2+.075),cota('450 mm',-iw/2-.16,-ih/2+.15+.225));
  /* nível, prumo e cunhas */
  const ferr=new THREE.Group();G.add(ferr);const nv=nivel();nv.position.set(0,-ih/2+.02,.04);ferr.add(nv);const pr=prumo(ih*.8);pr.position.set(iw/2-.06,ih/2-.03,.03);ferr.add(pr);
  [[-iw/2-FOL/2,0,Math.PI/2],[iw/2+FOL/2,0,-Math.PI/2],[0,-ih/2-FOL/2,0],[0,ih/2+FOL/2,Math.PI]].forEach(([x,y,rz])=>{const c=calco();c.scale.set(.5,.6,.8);c.position.set(x-(rz===0||rz===Math.PI?.03:0),y,-.015);c.rotation.z=rz;ferr.add(c);});
  /* argamassa na folga */
  const arg=new THREE.Group();G.add(arg);[[0,VH/2-FOL/2,VW,FOL],[0,-VH/2+FOL/2,VW,FOL],[VW/2-FOL/2,0,FOL,VH-2*FOL],[-VW/2+FOL/2,0,FOL,VH-2*FOL]].forEach(([x,y,w,h])=>{const ms=new THREE.Mesh(new THREE.BoxGeometry(w,h,PE*.98),am);ms.position.set(x,y,0);ms.receiveShadow=true;arg.add(ms);});
  /* esquadria final (janela de correr simples) */
  const esd=new THREE.Group();G.add(esd);const fw=iw-.01,fh=ih-.01;const mf=m.alu.clone();mf.side=THREE.DoubleSide;S.mJan=mf;S.fol=[];S.jPecas=[];
  if(JSH&&JSH['SU-001']){/* Janela de correr 2 folhas Suprema (SUP JCR 200) montada com as seções reais dos perfis do catálogo, como no Mostruário 3D */
   const jr=new THREE.Group();jr.rotation.y=Math.PI;esd.add(jr);/* +Z local = lado interno da janela (virado para o contramarco) */
   const X=new THREE.Vector3(1,0,0),Y=new THREE.Vector3(0,1,0),Z=new THREE.Vector3(0,0,1),N=v=>v.clone().negate();
   const PW=c=>JSH[c].w*.001,PH=c=>JSH[c].h*.001;
   const pf=(par,c,len,ex,ey,ez,x,y,z,nm)=>{const d=JSH[c];const sh=d.s.map(o=>{const q=new THREE.Shape(o.o.map(([a,b])=>new THREE.Vector2(a*.001,b*.001)));o.h.forEach(h=>q.holes.push(new THREE.Path(h.map(([a,b])=>new THREE.Vector2(a*.001,b*.001)))));return q;});
    const g=new THREE.ExtrudeGeometry(sh,{depth:len,bevelEnabled:false,curveSegments:1});g.translate(0,0,-len/2);g.applyMatrix4(new THREE.Matrix4().makeBasis(ex,ey,ez));g.computeVertexNormals();
    const ms=new THREE.Mesh(g,mf);ms.position.set(x,y,z);ms.castShadow=true;ms.receiveShadow=true;ms.userData.code=c;ms.userData.nm=nm;par.add(ms);return ms;};
   const W=fw,H=fh,FT=PH('SU-001'),FB=PH('SU-002'),FS=PH('SU-003'),TL=W-2*.013;
   pf(jr,'SU-001',TL,Z,Y,X,0,H/2-FT/2,0,'Marco superior SU-001');
   pf(jr,'SU-002',TL,Z,Y,X,0,-H/2+FB/2,0,'Trilho inferior SU-002');
   pf(jr,'SU-003',H,Z,X,N(Y),-W/2+FS/2,0,0,'Marco lateral SU-003');
   pf(jr,'SU-003',H,N(Z),N(X),N(Y),W/2-FS/2,0,0,'Marco lateral SU-003');
   const EDGE=.0144,OV=.03,Wi=W-2*EDGE,sW=(Wi+OV)/2,step=sW-OV,sH=H-.05,SDs=.025,gwC=(W-.1432)/2;
   const mz=c=>c==='SU-040'?SDs/2-PH(c)/2:c==='SU-041'?-SDs/2+PH(c)/2:0,exF=(c,t)=>c==='SU-041'?N(t):t;
   const OB=JSH['SU-102'].off053||[2.98,18.02],oz=OB[0]/1000,inset=PH('SU-053')/2-OB[1]/1000;
   [{z:.0175,L:'SU-039',R:'SU-040',nm:'Folha interna'},{z:-.0175,L:'SU-041',R:'SU-039',nm:'Folha externa'}].forEach((sd,i)=>{
    const f=new THREE.Group(),Lc=sd.L,Rc=sd.R,RW=PH('SU-053');
    const xL=-sW/2+PW(Lc),xR=sW/2-PW(Rc),xLc=-sW/2+PW(Lc)/2,xRc=sW/2-PW(Rc)/2,LFZ=i===0;
    pf(f,Lc,sH,exF(Lc,X),LFZ?N(Z):Z,Y,xLc,0,LFZ?-mz(Lc):mz(Lc),'Montante '+Lc);
    pf(f,Rc,sH,exF(Rc,N(X)),Z,Y,xRc,0,mz(Rc),(Rc==='SU-040'||Lc==='SU-041'&&Rc!=='SU-039'?'Mão de amigo ':'Montante ')+Rc);
    const tl=xR-xL+.004,tx=(xL+xR)/2;
    pf(f,'SU-053',tl,Z,N(Y),X,tx,sH/2-RW/2,0,'Travessa SU-053');pf(f,'SU-053',tl,Z,Y,X,tx,-sH/2+RW/2,0,'Travessa SU-053');
    const yTi=sH/2-RW,yBi=-sH/2+RW,v=new THREE.Mesh(new THREE.BoxGeometry(gwC,yTi-yBi+.012,.006),m.vidro);v.position.set(tx,(yTi+yBi)/2,-.0035);v.userData.nm='Vidro';f.add(v);
    const bxL=xL-inset,bxR=xR+inset,bl=bxR-bxL,yT=yTi+inset,yB=yBi-inset,bh=yT-yB,yc=(yT+yB)/2;
    pf(f,'SU-102',bl,Z,N(Y),X,tx,yT,oz,'Baguete SU-102');pf(f,'SU-102',bl,Z,Y,X,tx,yB,oz,'Baguete SU-102');
    pf(f,'SU-102',bh,Z,X,Y,bxL,yc,oz,'Baguete SU-102');pf(f,'SU-102',bh,Z,N(X),Y,bxR,yc,oz,'Baguete SU-102');
    const x=-Wi/2+sW/2+i*(sW-OV);f.position.set(x,0,sd.z);f.userData.x0=x;f.userData.dx=(i?-1:1)*step;f.userData.k=0;f.userData.nm=sd.nm;jr.add(f);S.fol.push(f);});
   S.jr=jr;}
  else{
  [[0,fh/2,fw,.035],[0,-fh/2,fw,.045],[fw/2,0,.03,fh],[-fw/2,0,.03,fh]].forEach(([x,y,w,h])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.07),mf);b.position.set(x,y,.0);b.castShadow=true;esd.add(b);});
  [-1,1].forEach((sx,k)=>{const lw=fw/2+.02,lh=fh-.06;const f=new THREE.Group();[[0,lh/2,lw,.04],[0,-lh/2,lw,.05],[lw/2,0,.04,lh],[-lw/2,0,.04,lh]].forEach(([x,y,w,h])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.03),mf);b.position.set(x,y,0);f.add(b);});
   const v=new THREE.Mesh(new THREE.BoxGeometry(lw-.06,lh-.07,.006),m.vidro);f.add(v);f.position.set(sx*(fw/4-.005),0,k?.012:-.012);f.userData.x0=f.position.x;f.userData.dx=-sx*(fw/2-.03);f.userData.k=0;esd.add(f);S.fol.push(f);});}
  /* vista explodida: cada peça sai do vão em direção à tela */
  S.exK=0;S.exOn=false;S.exItems=[];
  const exAdd=(o,z,spread)=>{o.userData.p0=o.position.clone();o.userData.ex=new THREE.Vector3(o.position.x*spread,o.position.y*spread,z);S.exItems.push(o);};
  CM.children.forEach(g=>exAdd(g,.3,.7));cantos.children.forEach(c=>exAdd(c,.42,1.05));gr.children.forEach(g=>exAdd(g,.16,.45));
  if(S.jr){/* grupo girado 180°: o z local aponta para dentro da parede, então a saída para a tela é negativa */
   S.jr.children.forEach(o=>{if(S.fol.includes(o))return;exAdd(o,-.62,.5);});
   S.fol.forEach((f,i)=>{exAdd(f,-(1.0+(1-i)*.3),0);f.userData.isFol=true;f.userData.ex.x=(i?-1:1)*.42;f.userData.ex.y=.05*(i?-1:1);
    f.children.forEach(c=>{exAdd(c,c.userData.nm==='Vidro'?-.0:-.06-(/Baguete/.test(c.userData.nm||'')?.06:0),c.userData.nm==='Vidro'?0:.7);});});}
  else{
  esd.children.forEach(o=>{if(S.fol.includes(o))return;exAdd(o,.62,.42);});
  S.fol.forEach((f,i)=>{exAdd(f,.95+i*.22,0);f.userData.isFol=true;f.userData.ex.x=(i?1:-1)*.36;f.userData.ex.y=.06*(i?-1:1);});}
  const lab=(t,o,dx,dy)=>{const c=document.createElement('canvas');c.width=560;c.height=96;const k=c.getContext('2d');k.font='bold 44px system-ui';const w=Math.min(552,k.measureText(t).width+44);k.fillStyle='rgba(15,79,83,.92)';k.beginPath();k.roundRect?k.roundRect((560-w)/2,8,w,80,22):k.rect((560-w)/2,8,w,80);k.fill();k.fillStyle='#ffd58a';k.textAlign='center';k.fillText(t,280,64);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));sp.renderOrder=10;sp.scale.set(.35,.06,1);sp.material.opacity=0;sp.material.transparent=true;G.add(sp);
   const lg=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),lm=new THREE.LineBasicMaterial({color:0x0f4f53,transparent:true,opacity:0,depthTest:false}),ln=new THREE.Line(lg,lm);ln.renderOrder=9;G.add(ln);
   const dt=new THREE.Mesh(new THREE.SphereGeometry(.009,12,8),new THREE.MeshBasicMaterial({color:0xf2a51e,transparent:true,opacity:0,depthTest:false}));dt.renderOrder=9;G.add(dt);S.exLab.push({sp,o,dx,dy,ln,dt});};S.exLab=[];
  lab('Contramarco CM-200',CM.children[0],-.45,.32);if(S.jr){const J=S.jr.children;lab('Marco superior SU-001',J[0],.22,.3);lab('Trilho SU-002',J[1],.18,-.32);lab('Marco lateral SU-003',J[2],.42,.28);lab('Folha interna',S.fol[0],-.12,.62);lab('Folha externa',S.fol[1],.12,.66);lab('Montante SU-039',S.fol[0].children[0],-.42,-.22);lab('Mão de amigo SU-040',S.fol[0].children[1],.4,-.3);lab('Baguete SU-102',S.fol[1].children[6],.35,-.1);}else{lab('Marco da janela',esd.children[0],0,.07);lab('Folha',S.fol[0],0,.5);lab('Folha',S.fol[1],0,.5);}lab('Cantoneira CON063',cantos.children[2],-.25,.12);
  S.parts={CM,cantos,esq,gr,cotas,ferr,arg,esd,reb};S.pm=pm;S.am=am;S.rm=rm;S.rebOn=false;S.folA=0;
  S.r=r;S.sc=sc;S.cam=cam;S.ctl=ctl;S.alvo=null;el.__S=S;
  const loop=()=>{if(!S.r)return;S.raf=requestAnimationFrame(loop);
   if(S.alvo){const [p,t]=S.alvo;S.cam.position.lerp(p,.08);S.ctl.target.lerp(t,.08);if(S.cam.position.distanceTo(p)<.005)S.alvo=null;}
   S.fol.forEach((f,i)=>{const t=S.folA===i+1?1:0;f.userData.k+=(t-f.userData.k)*.1;f.position.x=f.userData.x0+f.userData.dx*f.userData.k;});
   S.exK+=((S.exOn?1:0)-S.exK)*.06;if(S.exK<.0005)S.exK=0;const ek=S.exK*S.exK*(3-2*S.exK);
   S.exLab.forEach(l=>{const wp=l.o.getWorldPosition(new THREE.Vector3());G.worldToLocal(wp);const op=Math.max(0,(ek-.5)*2),lp=new THREE.Vector3(wp.x+l.dx,wp.y+l.dy,wp.z+.14);l.sp.position.copy(lp);l.sp.material.opacity=op;l.sp.visible=ek>.5;
   if(l.ln){const a=l.ln.geometry.attributes.position;const tip=lp.clone().add(new THREE.Vector3(0,l.dy>0?-.03:.03,0));a.setXYZ(0,wp.x,wp.y,wp.z);a.setXYZ(1,tip.x,tip.y,tip.z);a.needsUpdate=true;l.ln.material.opacity=op*.9;l.ln.visible=ek>.5;l.dt.position.copy(wp);l.dt.material.opacity=op;l.dt.visible=ek>.5;}});
   S.exItems.forEach(o=>{const p0=o.userData.p0,e=o.userData.ex;if(o.userData.isFol){o.position.x+=e.x*ek;o.position.y=p0.y+e.y*ek;o.position.z=p0.z+e.z*ek;}else o.position.set(p0.x+e.x*ek,p0.y+e.y*ek,p0.z+e.z*ek);});
   S.ctl.update();Object.values(S.parts).forEach(g=>{const tgt=g.userData.on?1:0;g.userData.k=(g.userData.k??tgt)+(tgt-(g.userData.k??tgt))*.15;const k=g.userData.k;g.visible=k>.02;g.scale.setScalar(.6+.4*k);});r.render(sc,cam);};loop();
  const ro=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;r.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();});ro.observe(el);S.ro=ro;
  return S;}
 const VIS=[/* o que aparece em cada passo */
  ['CM','cantos'],['CM','cantos','esq'],['CM','cantos','esq','gr','cotas'],['CM','cantos','esq','gr','ferr'],['CM','cantos','gr','arg'],['CM','cantos','gr','arg','esd']];
 const CAMS=[[[1.05,.55,3.0],[0,0,0]],[[-.25,-.55,.85],[-.45,-.38,0]],[[-1.05,.05,.9],[-.55,-.2,0]],[[.2,-.1,1.7],[0,-.1,0]],[[1.2,.4,1.6],[0,0,0]],[[1.1,.45,2.1],[0,0,0]]];
 function passo(S,k){if(!S)return;const on=new Set(VIS[k]||VIS[0]);Object.entries(S.parts).forEach(([n,g])=>{g.userData.on=on.has(n);});S.parts.reb.userData.on=!!S.rebOn;const c=CAMS[k]||CAMS[0];S.alvo=[new THREE.Vector3(...c[0]),new THREE.Vector3(...c[1])];}
 function cortar(S,on,k){if(!S)return;on=on||k===2||k===4;S.pm.clippingPlanes=on?[S.corte]:[];S.pm.side=on?THREE.DoubleSide:THREE.FrontSide;S.am.side=on?THREE.DoubleSide:THREE.FrontSide;S.am.clippingPlanes=on?[S.corte]:[];S.rm.clippingPlanes=on?[S.corte]:[];S.rm.side=on?THREE.DoubleSide:THREE.FrontSide;S.pm.needsUpdate=S.am.needsUpdate=S.rm.needsUpdate=true;}
 function camGet(S){if(!S)return null;const r=v=>Math.round(v*1000)/1000;return [r(S.cam.position.x),r(S.cam.position.y),r(S.cam.position.z),r(S.ctl.target.x),r(S.ctl.target.y),r(S.ctl.target.z)];}
 function camSet(S,c){if(!S||!c)return;S.alvo=null;S.cam.position.set(c[0],c[1],c[2]);S.ctl.target.set(c[3],c[4],c[5]);S.ctl.update();}
 function destruir(S){if(!S)return;cancelAnimationFrame(S.raf);try{S.ro.disconnect();}catch(_){}S.r.dispose();S.r.domElement.remove();S.r=null;}
 /* ---------- peça isolada (visualizador e miniaturas) ---------- */
 function pecaCena(code,el,auto){const W=el.clientWidth||400,H=el.clientHeight||300;const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(Math.min(2,devicePixelRatio));r.setSize(W,H);el.appendChild(r.domElement);
  const sc=new THREE.Scene();sc.environment=ambiente(r);sc.add(new THREE.HemisphereLight(0xffffff,0x707a80,.35));const l=new THREE.DirectionalLight(0xffffff,.6);l.position.set(1,2,2);sc.add(l);
  const o=(PECAS[code]||GPECAS[code])();const box=new THREE.Box3().setFromObject(o),c=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3()).length();o.position.sub(c);const g=new THREE.Group();g.add(o);sc.add(g);
  const cam=new THREE.PerspectiveCamera(35,W/H,.001,10);cam.position.set(sz*.9,sz*.55,sz*1.25);cam.lookAt(0,0,0);
  const ctl=new THREE.OrbitControls(cam,r.domElement);ctl.enableDamping=true;ctl.autoRotate=!!auto;ctl.autoRotateSpeed=2.2;
  const P={r,sc,cam,ctl,g};const loop=()=>{if(!P.r)return;P.raf=requestAnimationFrame(loop);ctl.update();r.render(sc,cam);};loop();let ro=null;try{ro=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h||!P.r)return;r.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();});ro.observe(el);}catch(_){}P.fim=()=>{cancelAnimationFrame(P.raf);try{ro&&ro.disconnect();}catch(_){}r.dispose();r.domElement.remove();P.r=null;};return P;}
 let FOTOS=null;
 function fotos(){if(FOTOS)return FOTOS;const d=document.createElement('div');d.style.cssText='position:fixed;left:-9999px;top:0;width:420px;height:300px';document.body.appendChild(d);FOTOS={};
  Object.keys(PECAS).forEach(k=>{const P=pecaCena(k,d,false);P.ctl.update();P.r.render(P.sc,P.cam);FOTOS[k]=P.r.domElement.toDataURL('image/png');P.fim();});d.remove();return FOTOS;}
 /* giro da peça em quadros (controle de ângulo nas fotos dos cards) */
 const QN=24,QUADROS={};let qRod=null;
 function quadros(cb){if(qRod)return qRod;const ks=Object.keys(PECAS);const d=document.createElement('div');d.style.cssText='position:fixed;left:-9999px;top:0;width:420px;height:300px';document.body.appendChild(d);
  qRod=new Promise(ok=>{let i=0;const um=()=>{if(i>=ks.length){d.remove();ok(QUADROS);return;}const k=ks[i++];try{const P=pecaCena(k,d,false);P.ctl.update();const a=[];const fmt=P.r.domElement.toDataURL('image/webp').startsWith('data:image/webp')?'image/webp':'image/png';
   for(let q=0;q<QN;q++){P.g.rotation.y=q*Math.PI*2/QN;P.r.render(P.sc,P.cam);a.push(P.r.domElement.toDataURL(fmt,.9));}P.fim();QUADROS[k]=a;if(cb)cb(k,a);}catch(e){console.warn(e);}setTimeout(um,30);};setTimeout(um,60);});return qRod;}
 let TMAD=null;
 function janela(S,o){if(!S||!S.mJan)return;o=o||{};const c=CORES[o.cor]||CORES.natural;const m=S.mJan;m.color.setHex(c.color);m.metalness=c.metalness;m.roughness=c.roughness;m.map=o.cor==='madeira'?(TMAD||(TMAD=texMadeira())):null;m.needsUpdate=true;S.folA=o.fol||0;}
 /* ---------- guarnições (seção traçada da referência) e espumas ---------- */
 const GPECAS={};let GSH=null;
 function epdm(){return new THREE.MeshStandardMaterial({color:0x3a3d41,roughness:.62,metalness:0,envMapIntensity:.7});}
 function perfilGua(d,comp){const g=new THREE.Group(),K=.04,mt=epdm();
  d.s.forEach(sh=>{const S=new THREE.Shape(sh.o.map(([x,y])=>new THREE.Vector2(x*K,y*K)));sh.h.forEach(h=>S.holes.push(new THREE.Path(h.map(([x,y])=>new THREE.Vector2(x*K,y*K)))));
   const ge=new THREE.ExtrudeGeometry(S,{depth:comp,bevelEnabled:false,curveSegments:2});ge.translate(0,0,-comp/2);ge.computeVertexNormals();const m=new THREE.Mesh(ge,mt);m.castShadow=true;g.add(m);});return g;}
 function espuma(w,h,comp){const g=new THREE.Group(),W=w*.0028,H=h*.0028;
  const fm=new THREE.MeshStandardMaterial({map:texRuido('#2d3033',.22),color:0xffffff,roughness:1,envMapIntensity:.25});const f=new THREE.Mesh(new THREE.BoxGeometry(W,H,comp),fm);g.add(f);
  const ad=new THREE.Mesh(new THREE.BoxGeometry(W,.0008,comp*.72),new THREE.MeshStandardMaterial({color:0xf3f3ef,roughness:.5}));ad.position.set(0,-H/2-.0004,-comp*.14);g.add(ad);
  const lv=new THREE.Mesh(new THREE.BoxGeometry(W,.0008,comp*.3),new THREE.MeshStandardMaterial({color:0xf3f3ef,roughness:.5,side:THREE.DoubleSide}));lv.geometry.translate(0,0,comp*.15);lv.position.set(0,-H/2-.0004,comp*.22);lv.rotation.x=.45;g.add(lv);return g;}
 function guaCarregar(url){if(GSH)return Promise.resolve(GSH);return fetch(url).then(r=>r.json()).then(j=>{GSH=j;Object.keys(j).forEach(k=>{GPECAS[k]=()=>{const o=perfilGua(j[k],.06);o.rotation.set(.3,-.55,0);return o;};});return j;});}
 function perfilReg(code,d){if(GPECAS[code])return;GPECAS[code]=()=>{const g=new THREE.Group(),K=.01,L=Math.max(d.w,d.h)*K*1.0,mt=mats().alu.clone();mt.side=THREE.DoubleSide;
  d.s.forEach(o=>{const S=new THREE.Shape(o.o.map(([x,y])=>new THREE.Vector2(x*K,y*K)));o.h.forEach(h=>S.holes.push(new THREE.Path(h.map(([x,y])=>new THREE.Vector2(x*K,y*K)))));const ge=new THREE.ExtrudeGeometry(S,{depth:L,bevelEnabled:false,curveSegments:2});ge.translate(0,0,-L/2);ge.computeVertexNormals();const m=new THREE.Mesh(ge,mt);m.castShadow=true;g.add(m);});
  g.rotation.set(.25,.6,0);return g;};}
 function guaEspuma(k,w,h){GPECAS[k]=()=>{const o=espuma(w,h,.07);o.rotation.set(.4,-.6,0);return o;};}
 let TPINT=null;const TINTAS={reboco:null,branco:0xf3f1ea,amarelo:0xf2c230,azul:0x2f6db5,vermelho:0xc23a2c};
 function pintar(S,c){if(!S||!S.rm)return;const h=TINTAS[c];const m=S.rm;if(h==null){m.map=mats().reboco.map;m.color.setHex(0xffffff);}else{m.map=TPINT||(TPINT=texRuido('#ffffff',.035));m.color.setHex(h);}m.needsUpdate=true;}
 function desmontar(S,on){if(!S)return;S.exOn=!!on;if(on){S.alvo=[new THREE.Vector3(1.25,.55,4.1),new THREE.Vector3(0,0,.5)];}else{S.alvo=[new THREE.Vector3(1.1,.45,2.1),new THREE.Vector3(0,0,0)];}}
 function reboco(S,on){if(!S)return;S.rebOn=!!on;S.parts.reb.userData.on=!!on;}

 /* lupa de verdade: renderiza de novo só o pedaço sob o mouse, com mais detalhe (sem esticar pixels) */
 function lupa(el,x,y,Z,out,semNomes){const S=el&&el.__S;if(!S||!S.r||!S.cam)return false;const r=S.r,cam=S.cam,W=el.clientWidth,H=el.clientHeight,N=out.width;
  if(!S.lrt||S.lrt.width!==N){if(S.lrt)S.lrt.dispose();S.lrt=new THREE.WebGLRenderTarget(N,N,{samples:4});S.lpx=new Uint8Array(N*N*4);S.lim=null;}
  const rw=(out.clientWidth||N/2)/Z;const esc=[];if(semNomes&&S.exLab)S.exLab.forEach(l=>[l.sp,l.ln,l.dt].forEach(o=>{if(o&&o.visible){esc.push(o);o.visible=false;}}));
  cam.setViewOffset(W,H,x-rw/2,y-rw/2,rw,rw);
  const pr=r.getPixelRatio();r.setRenderTarget(S.lrt);r.render(S.sc,cam);r.readRenderTargetPixels(S.lrt,0,0,N,N,S.lpx);r.setRenderTarget(null);
  cam.clearViewOffset();esc.forEach(o=>o.visible=true);
  const c=out.getContext('2d');if(!S.lim)S.lim=c.createImageData(N,N);const d=S.lim.data,px=S.lpx,row=N*4;for(let j=0;j<N;j++){d.set(px.subarray((N-1-j)*row,(N-j)*row),j*row);}c.putImageData(S.lim,0,0);return true;}
 window.CM3D={lupa,perfilReg,desmontar,guaCarregar,guaEspuma,GPECAS,janela,reboco,pintar,carregar,cena,passo,cortar,camGet,camSet,destruir,pecaCena,fotos,quadros,QUADROS,QN,PECAS};
})();
