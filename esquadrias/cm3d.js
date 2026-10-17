/* Treinamento em Esquadrias 3D · Contramarco em 3D (parede, contramarco CM-200 e componentes)
   FC Consultoria em Esquadria · peças ilustrativas, sem escala de fabricação */
(function(){
 const L3={three:'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',orbit:'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'};
 let carregando=null;
 function carregar(){if(window.THREE&&THREE.OrbitControls)return Promise.resolve();if(carregando)return carregando;
  const sc=u=>new Promise((ok,er)=>{const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=er;document.head.appendChild(s);});
  carregando=(window.THREE?Promise.resolve():sc(L3.three)).then(()=>THREE.OrbitControls?null:sc(L3.orbit));return carregando;}
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
 function mats(){if(M)return M;const tij=texTijolo();
  M={tij,parede:new THREE.MeshStandardMaterial({map:tij,roughness:.95}),
   alu:new THREE.MeshStandardMaterial({color:0xd7dcdf,metalness:.35,roughness:.38}),
   aluEsc:new THREE.MeshStandardMaterial({color:0x9aa3a9,metalness:.7,roughness:.4}),
   pvc:new THREE.MeshStandardMaterial({color:0x1d1f22,roughness:.55}),
   zinco:new THREE.MeshStandardMaterial({color:0xc4c9cc,metalness:.45,roughness:.3,side:THREE.DoubleSide}),
   arg:new THREE.MeshStandardMaterial({map:texRuido('#9a9893',.12),roughness:1}),
   madeira:new THREE.MeshStandardMaterial({map:texRuido('#b98b55',.15),roughness:.8}),
   amarelo:new THREE.MeshStandardMaterial({color:0xf2b705,roughness:.45}),
   vidro:new THREE.MeshPhysicalMaterial({color:0xcfe9f5,transparent:true,opacity:.35,roughness:.05,metalness:0}),
   linha:new THREE.MeshBasicMaterial({color:0x222222}),
   chumbo:new THREE.MeshStandardMaterial({color:0x5a5f63,metalness:.6,roughness:.35})};return M;}
 /* ---------- peças (1 unidade = 1 metro) ---------- */
 function perfilCM(comp){/* CM-200: L com aba de 26 mm, altura 25,6 mm e retorno de 13,6 mm */
  const s=new THREE.Shape(),e=.0015;s.moveTo(0,0);s.lineTo(.026,0);s.lineTo(.026,e);s.lineTo(e,e);s.lineTo(e,.0256);s.lineTo(-.006,.0256);s.lineTo(-.006,.0256-e);s.lineTo(-e*.5,.0256-e);s.lineTo(-e*.5,.012);s.lineTo(-.0136*.5,.012);s.lineTo(-.0136*.5,.012-e);s.lineTo(0,.012-e);s.lineTo(0,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:comp,bevelEnabled:false});g.translate(0,0,-comp/2);return new THREE.Mesh(g,mats().alu);}
 function grapa(){/* CHU-787: chapa dobrada com ponta em forquilha */
  const G=new THREE.Group(),m=mats().zinco,t=.002,w=.02;
  const pts=[[0,0],[.045,0],[.11,.028]];const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>sh.lineTo(p[0],p[1]));[...pts].reverse().forEach(p=>sh.lineTo(p[0]+0,p[1]+t));
  const g=new THREE.ExtrudeGeometry(sh,{depth:w,bevelEnabled:false});g.translate(0,0,-w/2);G.add(new THREE.Mesh(g,m));
  [-1,1].forEach(sz=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.04,t,.007),m);p.position.set(.11+.016,.028+.007,sz*.009);p.rotation.set(0,-sz*.45,.4);G.add(p);});
  for(let k=0;k<2;k++){const f=new THREE.Mesh(new THREE.CylinderGeometry(.0032,.0032,t*2,14),mats().linha);f.position.set(.014+k*.016,t/2,0);G.add(f);}
  return G;}
 function esquadro(){/* ESQ160: esquadro plástico triangular com nervuras */
  const s=new THREE.Shape(),L=.16,w=.022;s.moveTo(0,0);s.lineTo(L,0);s.lineTo(0,L);s.lineTo(0,0);
  const h=new THREE.Path();h.moveTo(w,w);h.lineTo(L-w*2.4,w);h.lineTo(w,L-w*2.4);h.lineTo(w,w);s.holes.push(h);
  const g=new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:true,bevelSize:.0015,bevelThickness:.0015,bevelSegments:1});const G=new THREE.Group();G.add(new THREE.Mesh(g,mats().pvc));
  const r=new THREE.Mesh(new THREE.BoxGeometry(.006,.085,.01),mats().pvc);r.position.set(.045,.045,.006);r.rotation.z=-Math.PI/4;G.add(r);return G;}
 function canto(){/* CON063: cantoneira de conexão em L */
  const G=new THREE.Group(),m=mats().pvc;const a=new THREE.Mesh(new THREE.BoxGeometry(.06,.014,.02),m);a.position.set(.03,0,0);const b=new THREE.Mesh(new THREE.BoxGeometry(.014,.06,.02),m);b.position.set(0,.03,0);
  const c=new THREE.Mesh(new THREE.BoxGeometry(.018,.018,.022),m);G.add(a,b,c);for(const [x,y] of [[.045,0],[0,.045]]){const f=new THREE.Mesh(new THREE.BoxGeometry(.004,.016,.024),mats().aluEsc);f.position.set(x,y,0);if(y)f.rotation.z=Math.PI/2;G.add(f);}return G;}
 function cantoneira(comp){/* CL-006: cantoneira (perfil L) */
  const s=new THREE.Shape(),a=.02,e=.0015;s.moveTo(0,0);s.lineTo(a,0);s.lineTo(a,e);s.lineTo(e,e);s.lineTo(e,a);s.lineTo(0,a);s.lineTo(0,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:comp||.25,bevelEnabled:false});g.translate(0,0,-(comp||.25)/2);return new THREE.Mesh(g,mats().alu);}
 function cunha(){/* CL-011: macho e cunha */
  const G=new THREE.Group();const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.12,0);s.lineTo(0,.025);s.lineTo(0,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:.03,bevelEnabled:false});const a=new THREE.Mesh(g,mats().madeira);const b=new THREE.Mesh(g,mats().madeira);b.rotation.z=Math.PI;b.position.set(.15,.032,0);G.add(a,b);return G;}
 function nivel(){const G=new THREE.Group();const c=new THREE.Mesh(new THREE.BoxGeometry(.5,.035,.025),mats().amarelo);G.add(c);
  const v=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.06,16),new THREE.MeshStandardMaterial({color:0x9be37a,transparent:true,opacity:.85}));v.rotation.z=Math.PI/2;v.position.z=.014;G.add(v);return G;}
 function prumo(h){const G=new THREE.Group();const f=new THREE.Mesh(new THREE.CylinderGeometry(.0008,.0008,h,6),mats().linha);f.position.y=-h/2;G.add(f);
  const p=new THREE.Mesh(new THREE.ConeGeometry(.014,.04,16),mats().chumbo);p.rotation.x=Math.PI;p.position.y=-h-.02;G.add(p);return G;}
 const PECAS={'CM-200':()=>{const m=perfilCM(.3);m.scale.set(2.2,2.2,1);m.rotation.set(.35,-.9,0);return m;},'CHU-787':grapa,'ESQ160':esquadro,'CON063':canto,'CL-006':()=>{const m=cantoneira(.25);m.scale.set(2.2,2.2,1);m.rotation.set(.35,-.9,0);return m;},'CL-011':cunha};
 /* ---------- cena da parede ---------- */
 const VW=1.2,VH=1.0,FOL=.02,PE=.14;/* vão, folga para argamassa, espessura da parede */
 function cena(el){const S={el};const W=el.clientWidth,H=el.clientHeight;
  const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setPixelRatio(Math.min(2,devicePixelRatio));r.setSize(W,H);r.shadowMap.enabled=true;r.localClippingEnabled=true;el.appendChild(r.domElement);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0xe9eef1);const cam=new THREE.PerspectiveCamera(38,W/H,.01,50);cam.position.set(1.15,.55,2.2);
  const ctl=new THREE.OrbitControls(cam,r.domElement);ctl.enableDamping=true;ctl.target.set(0,0,0);ctl.minDistance=.25;ctl.maxDistance=5;
  sc.add(new THREE.HemisphereLight(0xffffff,0x8a8070,.75));const sol=new THREE.DirectionalLight(0xffffff,.85);sol.position.set(2.5,3,3);sol.castShadow=true;sol.shadow.mapSize.set(2048,2048);
  Object.assign(sol.shadow.camera,{left:-2,right:2,top:2,bottom:-2});sc.add(sol);
  const corte=new THREE.Plane(new THREE.Vector3(0,0,-1),-.005);S.corte=corte;
  const m=mats();const pm=m.parede.clone();pm.clippingPlanes=[];const am=m.arg.clone();
  /* parede com o vão */
  const G=new THREE.Group();sc.add(G);const tw=2.6,th=2.2;
  const blocos=[[(tw-VW)/2/2+VW/2,0,(tw-VW)/2,th],[-((tw-VW)/2/2+VW/2),0,(tw-VW)/2,th],[0,(th-VH)/2/2+VH/2,VW,(th-VH)/2],[0,-((th-VH)/2/2+VH/2),VW,(th-VH)/2]];
  blocos.forEach(([x,y,w,h])=>{const g=new THREE.BoxGeometry(w,h,PE);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,uv.getX(i)*w*2.4,uv.getY(i)*h*2.4);}const ms=new THREE.Mesh(g,pm);ms.position.set(x,y,0);ms.castShadow=ms.receiveShadow=true;G.add(ms);});
  /* reboco nas bordas para dar acabamento (aparece no passo 5) */
  /* contramarco */
  const CM=new THREE.Group();G.add(CM);const iw=VW-2*FOL,ih=VH-2*FOL;
  const lados=[[0,ih/2,iw,0],[0,-ih/2,iw,Math.PI],[iw/2,0,ih,-Math.PI/2],[-iw/2,0,ih,Math.PI/2]];
  lados.forEach(([x,y,c,rz])=>{const p=perfilCM(c);p.rotation.set(0,Math.PI/2,0);const g=new THREE.Group();g.add(p);p.position.set(0,0,0);g.rotation.z=rz;g.position.set(x,y,0);
   p.rotation.set(0,Math.PI/2,Math.PI/2);p.position.set(0,0,-PE/2+.03);CM.add(g);});
  CM.children.forEach(o=>o.traverse(c=>{if(c.isMesh){c.castShadow=true;}}));
  const cantos=new THREE.Group();G.add(cantos);[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sy])=>{const c=canto();c.scale.set(.8,.8,.8);c.position.set(sx*(iw/2-.012),sy*(ih/2-.012),-PE/2+.045);c.rotation.z=sx<0&&sy<0?0:sx>0&&sy<0?Math.PI/2:sx>0&&sy>0?Math.PI:-Math.PI/2;cantos.add(c);});
  const esq=new THREE.Group();G.add(esq);[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sy])=>{const e=esquadro();e.position.set(sx*(iw/2-.028),sy*(ih/2-.028),.01);e.rotation.z=sx<0&&sy<0?0:sx>0&&sy<0?Math.PI/2:sx>0&&sy>0?Math.PI:-Math.PI/2;esq.add(e);});
  const gr=new THREE.Group();G.add(gr);const pos=(L)=>{const o=[.15];let p=.15+.45;while(p<L-.1){o.push(p);p+=.45;}if(L-.15-o[o.length-1]>.08)o.push(L-.15);return o;};
  pos(ih).forEach(d=>[-1,1].forEach(sx=>{const g=grapa();g.position.set(sx*(iw/2),-ih/2+d,-PE/2+.045);g.rotation.y=sx>0?0:Math.PI;gr.add(g);}));
  pos(iw).forEach(d=>[-1,1].forEach(sy=>{const g=grapa();g.position.set(-iw/2+d,sy*(ih/2),-PE/2+.045);g.rotation.set(0,0,sy>0?Math.PI/2:-Math.PI/2);gr.add(g);}));
  /* cotas 150 / 450 */
  const cota=(txt,x,y)=>{const c=document.createElement('canvas');c.width=256;c.height=96;const k=c.getContext('2d');k.fillStyle='rgba(19,35,46,.88)';k.beginPath();k.roundRect?k.roundRect(4,8,248,80,18):k.rect(4,8,248,80);k.fill();k.fillStyle='#ffd58a';k.font='bold 46px system-ui';k.textAlign='center';k.fillText(txt,128,66);
   const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));sp.scale.set(.16,.06,1);sp.position.set(x,y,.08);return sp;};
  const cotas=new THREE.Group();G.add(cotas);cotas.add(cota('150 mm',-iw/2-.16,-ih/2+.075),cota('450 mm',-iw/2-.16,-ih/2+.15+.225));
  /* nível, prumo e cunhas */
  const ferr=new THREE.Group();G.add(ferr);const nv=nivel();nv.position.set(0,-ih/2+.02,.04);ferr.add(nv);const pr=prumo(ih*.8);pr.position.set(iw/2-.06,ih/2-.03,.03);ferr.add(pr);
  [[-iw/2-FOL/2,0,Math.PI/2],[iw/2+FOL/2,0,-Math.PI/2],[0,-ih/2-FOL/2,0],[0,ih/2+FOL/2,Math.PI]].forEach(([x,y,rz])=>{const c=cunha();c.scale.set(.5,.6,.8);c.position.set(x-(rz===0||rz===Math.PI?.03:0),y,-.015);c.rotation.z=rz;ferr.add(c);});
  /* argamassa na folga */
  const arg=new THREE.Group();G.add(arg);[[0,VH/2-FOL/2,VW,FOL],[0,-VH/2+FOL/2,VW,FOL],[VW/2-FOL/2,0,FOL,VH-2*FOL],[-VW/2+FOL/2,0,FOL,VH-2*FOL]].forEach(([x,y,w,h])=>{const ms=new THREE.Mesh(new THREE.BoxGeometry(w,h,PE*.98),am);ms.position.set(x,y,0);ms.receiveShadow=true;arg.add(ms);});
  /* esquadria final (janela de correr simples) */
  const esd=new THREE.Group();G.add(esd);const fw=iw-.01,fh=ih-.01;const mf=m.alu;
  [[0,fh/2,fw,.035],[0,-fh/2,fw,.045],[fw/2,0,.03,fh],[-fw/2,0,.03,fh]].forEach(([x,y,w,h])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.07),mf);b.position.set(x,y,.0);b.castShadow=true;esd.add(b);});
  [-1,1].forEach((sx,k)=>{const lw=fw/2+.02,lh=fh-.06;const f=new THREE.Group();[[0,lh/2,lw,.04],[0,-lh/2,lw,.05],[lw/2,0,.04,lh],[-lw/2,0,.04,lh]].forEach(([x,y,w,h])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.03),mf);b.position.set(x,y,0);f.add(b);});
   const v=new THREE.Mesh(new THREE.BoxGeometry(lw-.06,lh-.07,.006),m.vidro);f.add(v);f.position.set(sx*(fw/4-.005),0,k?.012:-.012);esd.add(f);});
  S.parts={CM,cantos,esq,gr,cotas,ferr,arg,esd};S.pm=pm;S.am=am;
  S.r=r;S.sc=sc;S.cam=cam;S.ctl=ctl;S.alvo=null;
  const loop=()=>{if(!S.r)return;S.raf=requestAnimationFrame(loop);
   if(S.alvo){const [p,t]=S.alvo;S.cam.position.lerp(p,.08);S.ctl.target.lerp(t,.08);if(S.cam.position.distanceTo(p)<.005)S.alvo=null;}
   S.ctl.update();Object.values(S.parts).forEach(g=>{const tgt=g.userData.on?1:0;g.userData.k=(g.userData.k??tgt)+(tgt-(g.userData.k??tgt))*.15;const k=g.userData.k;g.visible=k>.02;g.scale.setScalar(.6+.4*k);});r.render(sc,cam);};loop();
  const ro=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;r.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();});ro.observe(el);S.ro=ro;
  return S;}
 const VIS=[/* o que aparece em cada passo */
  ['CM','cantos'],['CM','cantos','esq'],['CM','cantos','esq','gr','cotas'],['CM','cantos','esq','gr','ferr'],['CM','cantos','gr','arg'],['CM','cantos','gr','arg','esd']];
 const CAMS=[[[.75,.35,1.25],[-.25,-.2,0]],[[-.25,-.55,.85],[-.45,-.38,0]],[[-1.05,.05,.9],[-.55,-.2,0]],[[.2,-.1,1.7],[0,-.1,0]],[[1.2,.4,1.6],[0,0,0]],[[1.1,.45,2.1],[0,0,0]]];
 function passo(S,k){if(!S)return;const on=new Set(VIS[k]||VIS[0]);Object.entries(S.parts).forEach(([n,g])=>{g.userData.on=on.has(n);});const c=CAMS[k]||CAMS[0];S.alvo=[new THREE.Vector3(...c[0]),new THREE.Vector3(...c[1])];}
 function cortar(S,on,k){if(!S)return;on=on||k===2||k===4;S.pm.clippingPlanes=on?[S.corte]:[];S.pm.side=on?THREE.DoubleSide:THREE.FrontSide;S.am.side=on?THREE.DoubleSide:THREE.FrontSide;S.am.clippingPlanes=on?[S.corte]:[];S.pm.needsUpdate=S.am.needsUpdate=true;}
 function camGet(S){if(!S)return null;const r=v=>Math.round(v*1000)/1000;return [r(S.cam.position.x),r(S.cam.position.y),r(S.cam.position.z),r(S.ctl.target.x),r(S.ctl.target.y),r(S.ctl.target.z)];}
 function camSet(S,c){if(!S||!c)return;S.alvo=null;S.cam.position.set(c[0],c[1],c[2]);S.ctl.target.set(c[3],c[4],c[5]);S.ctl.update();}
 function destruir(S){if(!S)return;cancelAnimationFrame(S.raf);try{S.ro.disconnect();}catch(_){}S.r.dispose();S.r.domElement.remove();S.r=null;}
 /* ---------- peça isolada (visualizador e miniaturas) ---------- */
 function pecaCena(code,el,auto){const W=el.clientWidth||400,H=el.clientHeight||300;const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(Math.min(2,devicePixelRatio));r.setSize(W,H);el.appendChild(r.domElement);
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x707a80,.9));const l=new THREE.DirectionalLight(0xffffff,.9);l.position.set(1,2,2);sc.add(l);
  const o=PECAS[code]();const box=new THREE.Box3().setFromObject(o),c=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3()).length();o.position.sub(c);const g=new THREE.Group();g.add(o);sc.add(g);
  const cam=new THREE.PerspectiveCamera(35,W/H,.001,10);cam.position.set(sz*.9,sz*.55,sz*1.25);cam.lookAt(0,0,0);
  const ctl=new THREE.OrbitControls(cam,r.domElement);ctl.enableDamping=true;ctl.autoRotate=!!auto;ctl.autoRotateSpeed=2.2;
  const P={r,sc,cam,ctl};const loop=()=>{if(!P.r)return;P.raf=requestAnimationFrame(loop);ctl.update();r.render(sc,cam);};loop();P.fim=()=>{cancelAnimationFrame(P.raf);r.dispose();r.domElement.remove();P.r=null;};return P;}
 let FOTOS=null;
 function fotos(){if(FOTOS)return FOTOS;const d=document.createElement('div');d.style.cssText='position:fixed;left:-9999px;top:0;width:420px;height:300px';document.body.appendChild(d);FOTOS={};
  Object.keys(PECAS).forEach(k=>{const P=pecaCena(k,d,false);P.ctl.update();P.r.render(P.sc,P.cam);FOTOS[k]=P.r.domElement.toDataURL('image/png');P.fim();});d.remove();return FOTOS;}
 window.CM3D={carregar,cena,passo,cortar,camGet,camSet,destruir,pecaCena,fotos,PECAS};
})();
