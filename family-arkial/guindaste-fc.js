/* Instalação pela equipe · complemento das plantas e ambientes 3D (16/11/2026)
   A esquadria que já está no vão (perfis reais) sai do lugar e volta carregada por dois montadores,
   com o encarregado orientando pelo tablet; ela é erguida e encaixada no vão. Ao terminar tudo volta exatamente como estava.
   © FC Consultoria em Esquadria · CNPJ 52.985.682/0001-32 */
(function(){
'use strict';
if(window.FCGuindaste)return;
var CSS='.fcgd-cap{position:absolute;left:50%;top:70px;transform:translateX(-50%);z-index:7;pointer-events:none;background:rgba(10,12,15,.72);color:#fff;border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px);padding:8px 16px;border-radius:999px;font:700 14px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:0;transition:opacity .35s;white-space:nowrap}'+
'.fcgd-cap.on{opacity:1}';
function css(){if(document.getElementById('fcgd-css'))return;var s=document.createElement('style');s.id='fcgd-css';s.textContent=CSS;document.head.appendChild(s);}
function init(o){
 css();var T=window.THREE,SC=o.SC,CAM=o.CAM,CT=o.CT||null;if(!T||!SC||!CAM)return null;
 var V=function(x,y,z){return new T.Vector3(x||0,y||0,z||0)},UP=V(0,1,0);
 var api={ativo:false};
 /* ---------- materiais ---------- */
 var M={amar:new T.MeshStandardMaterial({color:0xf2b705,metalness:.35,roughness:.42}),
  amar2:new T.MeshStandardMaterial({color:0xd99a00,metalness:.4,roughness:.38}),
  preto:new T.MeshStandardMaterial({color:0x1b1c1e,metalness:.3,roughness:.6}),
  branco:new T.MeshStandardMaterial({color:0xf3f3f1,metalness:.2,roughness:.35}),
  vidroCab:new T.MeshStandardMaterial({color:0x2a3a46,metalness:.6,roughness:.12}),
  aco:new T.MeshStandardMaterial({color:0x8a9096,metalness:.85,roughness:.3}),
  cabo:new T.MeshStandardMaterial({color:0x222426,metalness:.6,roughness:.4}),
  cinta:new T.MeshStandardMaterial({color:0xff6a1a,roughness:.7}),
  pneu:new T.MeshStandardMaterial({color:0x151515,roughness:.9}),
  pele:new T.MeshStandardMaterial({color:0xb67a56,roughness:.62}),
  calca:new T.MeshStandardMaterial({color:0x2e3a4f,roughness:.9}),
  colete:new T.MeshStandardMaterial({color:0xff6f12,roughness:.65,emissive:0x2a0c00}),
  faixa:new T.MeshStandardMaterial({color:0xe8eef2,metalness:.5,roughness:.3,emissive:0x444444}),
  bota:new T.MeshStandardMaterial({color:0x4a3322,roughness:.75}),
  camisa:new T.MeshStandardMaterial({color:0x5d6670,roughness:.85}),
  luva:new T.MeshStandardMaterial({color:0x7a5a2c,roughness:.8}),
  brilho:new T.LineBasicMaterial({color:0xffd27a,transparent:true,opacity:0})};
 function bx(w,h,d,m,x,y,z,par){var ms=new T.Mesh(new T.BoxGeometry(w,h,d),m);ms.position.set(x||0,y||0,z||0);ms.castShadow=true;ms.receiveShadow=true;if(par)par.add(ms);return ms}
 function cil(r,h,m,par,seg){var ms=new T.Mesh(new T.CylinderGeometry(r,r,h,seg||20),m);ms.castShadow=true;if(par)par.add(ms);return ms}
 /* ===== montador realista (≈1,76 m): anatomia proporcional, rosto, mãos com dedos, uniforme com a marca e EPI completo ===== */
 function membro(r1,r2,len,m,seg){var g=new T.Group(),c=new T.Mesh(new T.CylinderGeometry(r2,r1,len,seg||22,4,true),m);c.position.y=-len/2;c.castShadow=true;c.receiveShadow=true;g.add(c);
  var a=new T.Mesh(new T.SphereGeometry(r1,20,14),m);a.castShadow=true;g.add(a);var b=new T.Mesh(new T.SphereGeometry(r2,20,14),m);b.position.y=-len;b.castShadow=true;g.add(b);return g;}
 function lathe(pts,m,sz,seg){var g=new T.LatheGeometry(pts.map(function(p){return new T.Vector2(p[0],p[1])}),seg||36);var ms=new T.Mesh(g,m);ms.scale.z=sz||.62;ms.castShadow=true;ms.receiveShadow=true;return ms;}
 function txt(c,w,h,fn){var cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'),w,h);var tx=new T.CanvasTexture(cv);tx.encoding=T.sRGBEncoding;tx.anisotropy=4;return tx;}
 /* tecido com trama leve (dá leitura de roupa de verdade) */
 function tecido(cor,amp){return txt(0,128,128,function(g,w,h){g.fillStyle=cor;g.fillRect(0,0,w,h);for(var y=0;y<h;y+=2){g.fillStyle='rgba(0,0,0,'+(.04+Math.random()*amp)+')';g.fillRect(0,y,w,1)}for(var x=0;x<w;x+=3){g.fillStyle='rgba(255,255,255,'+(Math.random()*amp*.6)+')';g.fillRect(x,0,1,h)}});}
 var MAT=null;function mats(){if(MAT)return MAT;var tc=function(c,a){var t=tecido(c,a||.05);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,3);return t};
  MAT={calca:new T.MeshStandardMaterial({map:tc('#2b3546',.06),roughness:.92}),camisa:new T.MeshStandardMaterial({map:tc('#1f3a5a',.05),roughness:.88}),
   colete:new T.MeshStandardMaterial({map:tc('#ff6a10',.04),roughness:.7,emissive:0x2a0b00}),faixa:new T.MeshStandardMaterial({color:0xdfe6ea,metalness:.6,roughness:.25,emissive:0x555555}),
   luva:new T.MeshStandardMaterial({map:tc('#8a6a3a',.08),roughness:.85}),bota:new T.MeshStandardMaterial({color:0x3b2a1d,roughness:.55,metalness:.05}),sola:new T.MeshStandardMaterial({color:0x151515,roughness:.9}),
   capacete:new T.MeshPhysicalMaterial({color:0xf5f5f2,roughness:.28,clearcoat:.8,clearcoatRoughness:.2}),capacete2:new T.MeshPhysicalMaterial({color:0xf2b705,roughness:.3,clearcoat:.8}),
   oculos:new T.MeshPhysicalMaterial({color:0x1a2a33,metalness:.2,roughness:.05,transparent:true,opacity:.55}),olho:new T.MeshStandardMaterial({color:0xf4f1ea,roughness:.3}),iris:new T.MeshStandardMaterial({color:0x2c1d12,roughness:.2}),
   sobr:new T.MeshStandardMaterial({color:0x2a1d14,roughness:.9}),barba:new T.MeshStandardMaterial({color:0x2a1d14,roughness:1,transparent:true,opacity:.55}),
   cinto:new T.MeshStandardMaterial({color:0x1d1a17,roughness:.6}),fivela:new T.MeshStandardMaterial({color:0xb9bec2,metalness:1,roughness:.25}),bolsa:new T.MeshStandardMaterial({color:0x5a4630,roughness:.8}),
   trena:new T.MeshStandardMaterial({color:0xf2b705,roughness:.4}),boca:new T.MeshStandardMaterial({color:0x7a3e33,roughness:.6})};return MAT;}
 var PELES=[0xc58c66,0x9c6a4b,0xe0ac8a];
 function logoCostas(nome){return txt(0,512,160,function(g,w,h){g.clearRect(0,0,w,h);g.fillStyle='#fff';g.font='900 92px Arial Black,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(nome,w/2,h/2+4);});}
 function montador(k){k=k||0;var A=mats(),g=new T.Group(),u={};var pele=new T.MeshStandardMaterial({color:PELES[k%3],roughness:.55});
  var sc=[1,1.03,.97][k%3];g.scale.setScalar(sc);
  /* pernas: calça de brim com joelheira, botina de couro com biqueira */
  [-1,1].forEach(function(sd){var q=new T.Group();q.position.set(sd*.098,.94,0);g.add(q);q.add(membro(.088,.068,.44,A.calca));
   var jo=new T.Mesh(new T.SphereGeometry(.072,16,10),A.calca);jo.scale.set(1,.9,.9);jo.position.set(0,-.43,.012);q.add(jo);
   var j=new T.Group();j.position.y=-.44;q.add(j);j.add(membro(.066,.052,.42,A.calca));
   var bt=new T.Group();bt.position.y=-.43;j.add(bt);var cano=new T.Mesh(new T.CylinderGeometry(.058,.06,.13,18),A.bota);cano.position.y=-.01;bt.add(cano);
   var pe=new T.Mesh(new T.SphereGeometry(.07,20,12),A.bota);pe.scale.set(.82,.62,1.75);pe.position.set(0,-.045,.055);pe.castShadow=true;bt.add(pe);
   var so=new T.Mesh(new T.BoxGeometry(.105,.022,.27),A.sola);so.position.set(0,-.083,.05);bt.add(so);
   u[sd<0?'qe':'qd']=q;u[sd<0?'je':'jd']=j;});
  /* quadril, cinto de ferramentas */
  g.add(lathe([[0,.84],[.152,.855],[.172,.93],[.16,1.0],[.148,1.04],[0,1.05]],A.calca,.72));
  var ci=new T.Mesh(new T.TorusGeometry(.162,.02,10,36),A.cinto);ci.rotation.x=Math.PI/2;ci.scale.y=.72;ci.position.y=1.0;g.add(ci);
  var fv=new T.Mesh(new T.BoxGeometry(.05,.035,.012),A.fivela);fv.position.set(0,1.0,.12);g.add(fv);
  var bo=new T.Mesh(new T.BoxGeometry(.09,.11,.05),A.bolsa);bo.position.set(.15,.95,.04);bo.rotation.y=.6;g.add(bo);
  var tr=new T.Mesh(new T.CylinderGeometry(.034,.034,.03,20),A.trena);tr.rotation.z=Math.PI/2;tr.position.set(-.17,.97,.02);g.add(tr);
  /* tronco: camisa manga longa + colete refletivo com faixas e a marca nas costas */
  var to=lathe([[0,.99],[.15,1.0],[.145,1.1],[.165,1.26],[.19,1.39],[.19,1.43],[.15,1.48],[.08,1.52],[0,1.53]],A.camisa,.6);g.add(to);
  var co=lathe([[0,1.03],[.158,1.04],[.153,1.12],[.172,1.27],[.196,1.385],[.17,1.44],[.09,1.465],[0,1.47]],A.colete,.64);co.scale.x=1.03;g.add(co);
  [1.13,1.25].forEach(function(y){var f=new T.Mesh(new T.TorusGeometry(.163+(y-1.13)*.13,.011,6,40),A.faixa);f.rotation.x=Math.PI/2;f.scale.y=.64*.99;f.position.y=y;g.add(f)});
  [-1,1].forEach(function(sd){var f=new T.Mesh(new T.BoxGeometry(.022,.3,.008),A.faixa);f.position.set(sd*.07,1.33,.112);f.rotation.x=-.12;g.add(f)});
  if(o.marcaUniforme){var lg=new T.Mesh(new T.PlaneGeometry(.26,.08),new T.MeshStandardMaterial({map:logoCostas(o.marcaUniforme),transparent:true,roughness:.6}));lg.position.set(0,1.335,-.122);lg.rotation.y=Math.PI;g.add(lg);}
  /* pescoço e cabeça com rosto */
  var pc=new T.Mesh(new T.CylinderGeometry(.046,.054,.1,16),pele);pc.position.y=1.56;g.add(pc);
  var gola=new T.Mesh(new T.TorusGeometry(.055,.014,8,22),A.camisa);gola.rotation.x=Math.PI/2;gola.position.y=1.525;g.add(gola);
  var cb=new T.Group();cb.position.y=1.665;g.add(cb);u.cab=cb;
  var cr=new T.Mesh(new T.SphereGeometry(.1,32,24),pele);cr.scale.set(.86,1.06,.97);cr.castShadow=true;cb.add(cr);
  var qx=new T.Mesh(new T.SphereGeometry(.07,20,14),pele);qx.scale.set(.95,.8,.9);qx.position.set(0,-.055,.02);cb.add(qx);
  if(k===1){var bb=new T.Mesh(new T.SphereGeometry(.074,20,14,0,Math.PI*2,Math.PI*.45,Math.PI*.55),A.barba);bb.scale.set(.98,.85,.95);bb.position.set(0,-.05,.022);cb.add(bb);}
  var na=new T.Mesh(new T.ConeGeometry(.017,.05,10),pele);na.rotation.x=Math.PI/2+.25;na.position.set(0,-.008,.1);cb.add(na);
  [-1,1].forEach(function(sd){var ol=new T.Mesh(new T.SphereGeometry(.012,12,10),A.olho);ol.position.set(sd*.032,.018,.085);cb.add(ol);var ir=new T.Mesh(new T.SphereGeometry(.0065,10,8),A.iris);ir.position.set(sd*.032,.018,.096);cb.add(ir);
   var so2=new T.Mesh(new T.BoxGeometry(.034,.007,.01),A.sobr);so2.position.set(sd*.033,.04,.09);so2.rotation.z=-sd*.12;cb.add(so2);
   var or=new T.Mesh(new T.SphereGeometry(.022,12,10),pele);or.scale.set(.45,1,.75);or.position.set(sd*.088,.005,0);cb.add(or);});
  var bc=new T.Mesh(new T.BoxGeometry(.034,.006,.008),A.boca);bc.position.set(0,-.045,.088);cb.add(bc);
  var oc=new T.Mesh(new T.CylinderGeometry(.092,.092,.032,28,1,true,-1.1,2.2),A.oculos);oc.position.set(0,.018,.005);oc.scale.z=1.08;cb.add(oc);
  /* capacete com aba, nervura e jugular */
  var cm=k===2?A.capacete2:A.capacete;var ca=new T.Mesh(new T.SphereGeometry(.118,32,16,0,Math.PI*2,0,Math.PI/2),cm);ca.scale.set(1,.92,1.13);ca.position.y=.04;ca.castShadow=true;cb.add(ca);
  var ab=new T.Mesh(new T.CylinderGeometry(.128,.131,.012,32),cm);ab.scale.z=1.16;ab.position.set(0,.04,.012);cb.add(ab);
  var pk=new T.Mesh(new T.CylinderGeometry(.06,.06,.01,24,1,false,-.9,1.8),cm);pk.position.set(0,.04,.11);cb.add(pk);
  var nv=new T.Mesh(new T.BoxGeometry(.018,.014,.22),cm);nv.position.set(0,.145,0);cb.add(nv);
  var jg=new T.Mesh(new T.TorusGeometry(.085,.004,6,30,Math.PI),A.cinto);jg.rotation.y=Math.PI/2;jg.rotation.z=Math.PI;jg.position.set(0,.0,.0);jg.scale.set(1,1.15,1);cb.add(jg);
  /* braços: ombro, cotovelo, mão com luva e dedos */
  [-1,1].forEach(function(sd){var om=new T.Group();om.position.set(sd*.205,1.45,0);g.add(om);var ma=new T.Mesh(new T.SphereGeometry(.07,16,12),A.camisa);om.add(ma);
   om.add(membro(.06,.047,.29,A.camisa));var cv=new T.Group();cv.position.y=-.29;om.add(cv);cv.add(membro(.047,.038,.26,A.camisa));
   var pu=new T.Mesh(new T.CylinderGeometry(.041,.041,.03,16),A.luva);pu.position.y=-.255;cv.add(pu);
   var mao=new T.Group();mao.position.y=-.28;cv.add(mao);var pa=new T.Mesh(new T.BoxGeometry(.075,.085,.03),A.luva);pa.position.y=-.03;mao.add(pa);
   for(var d=0;d<4;d++){var dd=new T.Mesh(new T.CylinderGeometry(.009,.008,.055,8),A.luva);dd.position.set(-.027+d*.018,-.095,.006);dd.rotation.x=.35;mao.add(dd);}
   var po=new T.Mesh(new T.CylinderGeometry(.01,.009,.045,8),A.luva);po.position.set(sd*.04,-.04,.018);po.rotation.z=sd*.7;mao.add(po);
   u[sd<0?'oe':'od']=om;u[sd<0?'ce':'cd']=cv;});
  var tab=new T.Mesh(new T.BoxGeometry(.2,.28,.012),M.preto);tab.position.set(0,-.36,.06);tab.rotation.x=-.5;tab.visible=false;u.cd.add(tab);u.tab=tab;
  var tela=new T.Mesh(new T.PlaneGeometry(.18,.25),new T.MeshStandardMaterial({color:0x2a7fb8,emissive:0x1a5c88,emissiveIntensity:.6}));tela.position.z=.007;tab.add(tela);
  u.sc=sc;g.userData=u;return g;}
 /* ---------- utilidades ---------- */
 function liga(ms,a,b){var d=b.clone().sub(a),L=d.length();ms.position.copy(a).add(b).multiplyScalar(.5);ms.scale.set(1,Math.max(.001,L),1);ms.quaternion.setFromUnitVectors(UP,d.normalize());}
 var ease=function(t){t=Math.max(0,Math.min(1,t));return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},lin=function(a,b,t){return a+(b-a)*Math.max(0,Math.min(1,t))};
 var cap=null;function legenda(txt){var p=o.legendaEm||null;if(!p)return;if(!cap){cap=document.createElement('div');cap.className='fcgd-cap';if(getComputedStyle(p).position==='static')p.style.position='relative';p.appendChild(cap);}if(txt){cap.textContent=txt;cap.classList.add('on')}else cap.classList.remove('on');}
 /* ---------- a cena ---------- */
 /* braço por cinemática inversa: a mão vai exatamente ao ponto da esquadria */
 var _q=new T.Quaternion(),_d=V(),_e=V(),_p=V(),_u=V(),_f=V(),DOWN=V(0,-1,0);
 function braco(m,lado_,alvoW,pole){var u=m.userData,om=lado_<0?u.oe:u.od,cv=lado_<0?u.ce:u.cd,L1=.29,L2=.32;
  m.updateMatrixWorld(true);var h=m.worldToLocal(alvoW.clone()),o=om.position;_d.copy(h).sub(o);var dist=Math.min(_d.length(),L1+L2-.005);dist=Math.max(dist,.12);_d.normalize();
  var ca=Math.max(-1,Math.min(1,(L1*L1+dist*dist-L2*L2)/(2*L1*dist))),a=Math.acos(ca);
  _p.copy(pole).sub(_d.clone().multiplyScalar(pole.dot(_d)));if(_p.lengthSq()<1e-6)_p.set(0,-1,0);_p.normalize();
  _e.copy(o).add(_d.clone().multiplyScalar(L1*Math.cos(a))).add(_p.clone().multiplyScalar(L1*Math.sin(a)));
  _u.copy(_e).sub(o).normalize();om.quaternion.setFromUnitVectors(DOWN,_u);om.rotation.setFromQuaternion(om.quaternion);
  var hh=o.clone().add(_d.clone().multiplyScalar(dist));_f.copy(hh).sub(_e).normalize();_q.copy(om.quaternion).invert();_f.applyQuaternion(_q);
  cv.quaternion.setFromUnitVectors(DOWN,_f);cv.rotation.setFromQuaternion(cv.quaternion);}
 function solta(m){var u=m.userData;[u.oe,u.od,u.ce,u.cd].forEach(function(x){x.rotation.set(0,0,0)});u.oe.rotation.z=-.1;u.od.rotation.z=.1;u.ce.rotation.x=u.cd.rotation.x=-.15;}
 function parafusadeira(){var g=new T.Group();bx(.05,.16,.05,M.preto,0,-.02,0,g);bx(.06,.07,.2,M.amar,0,.08,.05,g);var bt=cil(.006,.07,M.aco,g,8);bt.rotation.x=Math.PI/2;bt.position.set(0,.08,.18);bx(.07,.05,.07,M.preto,0,-.11,0,g);g.visible=false;return g;}
 api.instala=function(alvo){if(api.ativo||!alvo||!alvo.obj)return Promise.resolve(false);api.ativo=true;
  var ob=alvo.obj,par=ob.parent;if(!par){api.ativo=false;return Promise.resolve(false);}
  SC.updateMatrixWorld(true);
  var p0=ob.position.clone(),r0=ob.rotation.clone();
  var bb=new T.Box3().setFromObject(ob),C=bb.getCenter(V()),S=bb.getSize(V());
  var foraP=(alvo.fora||V(0,0,-1)).clone().applyQuaternion(ob.quaternion).normalize();
  var pq=par.getWorldQuaternion(new T.Quaternion()),foraW=foraP.clone().applyQuaternion(pq).setY(0).normalize();
  var ps=par.getWorldScale(V()),esc=1/Math.max(1e-6,ps.x);
  var chao=alvo.chao!=null?alvo.chao:0,solo=alvo.solo!=null?alvo.solo:0,dentro=chao>solo+.6,sg=dentro?-1:1;
  var dirW=foraW.clone().multiplyScalar(sg),dirP=foraP.clone().multiplyScalar(sg);/* lado de onde a equipe chega */
  var lado=V().crossVectors(UP,dirW).normalize(),larg=Math.max(S.x,S.z),alt=S.y,tam=Math.max(larg,alt);
  var baseY=bb.min.y,carga=(chao+.22)-baseY;/* deslocamento vertical durante o transporte: base a ~22 cm do piso */
  /* equipe: dois carregando, um encarregado com tablet */
  var mt=[montador(0),montador(1),montador(2)],enc=mt[2];enc.userData.tab.visible=true;
  mt.forEach(function(m){m.userData.y0=chao;m.visible=false;var f=parafusadeira();f.position.set(0,-.33,.02);m.userData.cd.add(f);m.userData.fur=f;SC.add(m)});
  var eg=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(S.x+.06,S.y+.06,S.z+.06)),M.brilho);eg.position.copy(C);SC.add(eg);
  var ray=new T.Raycaster(),escondidos=new Set(),meus=function(x){while(x){if(x===ob||mt.indexOf(x)>=0||x===eg)return true;x=x.parent}return false};
  /* candidatos a sair da frente da câmera: só peças pequenas da cena, fora das esquadrias (lista feita uma vez, para não pesar) */
  var raizes=((o.alvos&&o.alvos())||[]).map(function(a){return a.obj});raizes.push(ob);
  var dentroDe=function(x){while(x){if(raizes.indexOf(x)>=0)return true;x=x.parent}return false};
  var cand=[],tb=new T.Box3(),tv=V();SC.traverse(function(x){if(!x.isMesh||!x.visible||dentroDe(x))return;var mm=Array.isArray(x.material)?x.material[0]:x.material;if(mm&&mm.transparent&&mm.opacity===0)return;tb.setFromObject(x).getSize(tv);if(Math.max(tv.x,tv.y,tv.z)<=6)cand.push(x);});
  /* câmera na altura das pessoas */
  var k=Math.max(5.2,tam*2.1);
  /* a câmera fica sempre do lado de fora da obra (nunca dentro de um cômodo) e nunca atrás de parede */
  var ladoF=V().crossVectors(UP,foraW).normalize(),hC=dentro?Math.max(1.6,C.y-solo+.6):1.7;
  var c0=C.clone().add(foraW.clone().multiplyScalar(k*1.05)).add(ladoF.clone().multiplyScalar(-k*.95)).setY(solo+hC+.1);
  var c1=C.clone().add(foraW.clone().multiplyScalar(k*1.0)).add(ladoF.clone().multiplyScalar(-k*.12)).setY(solo+hC);
  var livre=function(cp){var alvoC=C.clone(),d=cp.clone().sub(alvoC),L=d.length();var rc=new T.Raycaster(alvoC.clone().add(d.clone().normalize().multiplyScalar(.45)),d.clone().normalize(),0,L-.45);
   var hs=rc.intersectObjects(SC.children,true).filter(function(h){var x=h.object;if(!x.isMesh||!x.visible)return false;var p=x;while(p){if(p===ob)return false;p=p.parent}var mm=Array.isArray(x.material)?x.material[0]:x.material;if(mm&&mm.transparent&&mm.opacity<.3)return false;var sz=new T.Box3().setFromObject(x).getSize(V());return Math.max(sz.x,sz.y,sz.z)>6;});
   if(hs.length){var dd=Math.max(1.6,hs[0].distance+.45-.35);return alvoC.add(d.normalize().multiplyScalar(dd));}return cp;};
  c0=livre(c0);c1=livre(c1);
  /* paredes e lajes (peças grandes) para a câmera de perto não entrar nelas */
  var grandes=[];SC.traverse(function(x){if(!x.isMesh||!x.visible)return;var p=x;while(p){if(p===ob)return;p=p.parent}var mm=Array.isArray(x.material)?x.material[0]:x.material;if(mm&&mm.transparent&&mm.opacity<.3)return;var sz=new T.Box3().setFromObject(x).getSize(V());if(Math.max(sz.x,sz.y,sz.z)>3)grandes.push(x);});
  var rcF=new T.Raycaster();function semParede(cp,alvoC){var d=cp.clone().sub(alvoC),L=d.length();d.normalize();rcF.set(alvoC.clone().add(d.clone().multiplyScalar(.3)),d);rcF.far=Math.max(.01,L-.3);var h=rcF.intersectObjects(grandes,false)[0];return h?alvoC.clone().add(d.multiplyScalar(Math.max(1.2,h.distance+.3-.3))):cp;}
  var kf=Math.max(2.9,tam*1.25),hO=dentro?Math.max(1.5,chao-solo+1.45):1.5;
  var camP=CAM.position.clone(),camT=CT?CT.target.clone():null,lim=null;if(CT){CT.enabled=false;lim=[CT.minDistance,CT.maxDistance,CT.minPolarAngle,CT.maxPolarAngle];CT.minDistance=0;CT.maxDistance=Infinity;CT.minPolarAngle=0;CT.maxPolarAngle=Math.PI;}
  var DUR=13,t0=performance.now(),longe=3.6,perto=.85,ultR=-1;
  o.aoInicio&&o.aoInicio(alvo);legenda('Instalação · '+(alvo.nome||'esquadria'));
  var face=function(m,d){m.rotation.y=Math.atan2(d.x,d.z)};
  return new Promise(function(res){
   function quadro(){var s=(performance.now()-t0)/1000;
    /* 0–4,6 s carregam andando; 4,6–6,4 erguem no vão; 6,4–7,8 empurram para dentro; 7,8–10,4 fixam (parafusadeira); depois se afastam */
    var anda=ease(s/4.6),out=s<4.6?lin(longe,perto,anda):lin(perto,0,ease((s-6.4)/1.4));
    var sub=s<4.6?carga:lin(carga,0,ease((s-4.6)/1.8));
    var passoF=s<4.6?Math.sin(s*7.2):0,bob=Math.abs(passoF)*.018;
    ob.position.copy(p0).add(dirP.clone().multiplyScalar(out*esc)).add(UP.clone().multiplyScalar((sub+bob)*esc));
    ob.rotation.copy(r0);ob.rotateZ(Math.sin(s*3.6)*.008*(s<4.6?1:0));
    SC.updateMatrixWorld(true);
    var wc=C.clone().add(dirW.clone().multiplyScalar(out)).add(V(0,sub+bob,0)),wb=baseY+sub+bob;
    var fixa=ease((s-7.8)/.9),sai=ease((s-10.4)/.9);
    [0,1].forEach(function(i){var m=mt[i],u=m.userData,sd=i?1:-1;m.visible=s<11.6;
     /* posição: carregando de lado (de frente para a esquadria) -> fixando de frente para a parede */
     var pc=V(wc.x,chao,wc.z).add(lado.clone().multiplyScalar(sd*(larg/2+.34)));
     var pf=V(C.x,chao,C.z).add(lado.clone().multiplyScalar(sd*(larg/2+.12))).add(dirW.clone().multiplyScalar(.5+sai*1.1));
     m.position.lerpVectors(pc,pf,fixa);m.position.y=chao-bob*.6;
     var ac=Math.atan2(-sd*lado.x,-sd*lado.z),af=Math.atan2(-dirW.x,-dirW.z),da=af-ac;da=Math.atan2(Math.sin(da),Math.cos(da));m.rotation.y=ac+da*fixa;
     /* mãos na esquadria */
     var lat=wc.clone().add(lado.clone().multiplyScalar(sd*(larg/2+.015)));
     var y1=Math.min(Math.max(chao+.82,wb+.12),wb+alt-.15),y2=Math.min(Math.max(chao+1.32,wb+.35),wb+alt-.08);
     var fr=C.clone().add(lado.clone().multiplyScalar(sd*(larg/2-.035))).add(dirW.clone().multiplyScalar(S.z<S.x?S.z/2+.01:S.x/2+.01));
     var vib=s>8.6&&s<10.2&&i===1?Math.sin(s*90)*.004:0;
     var h1=lat.clone().setY(y1),h2=lat.clone().setY(y2);
     var f1=fr.clone().setY(Math.min(Math.max(chao+1.0,baseY+.2),baseY+alt-.2)+vib),f2=fr.clone().setY(Math.min(Math.max(chao+1.35,baseY+.45),baseY+alt-.1));
     var poleE=V(sd*.6,-1,-.3),poleD=V(-sd*.6,-1,-.3);
     if(s<11){var ka=h1.clone().lerp(f1,fixa),kb=h2.clone().lerp(f2,fixa);var near=sd<0?'d':'e';
      /* braço mais perto da esquadria pega embaixo, o outro em cima */
      braco(m,-1,sd<0?kb:ka,V(-.7,-1,-.2));braco(m,1,sd<0?ka:kb,V(.7,-1,-.2));
      if(sai>0){var r=sai;u.oe.rotation.x*=1-r;u.od.rotation.x*=1-r;u.ce.rotation.x*=1-r;u.cd.rotation.x*=1-r;}}else solta(m);
     u.fur.visible=i===1&&s>8.2&&s<10.3;
     /* pernas: passo lateral durante o transporte */
     var ph=passoF*(i?1:-1)*.38;u.qe.rotation.x=ph;u.qd.rotation.x=-ph;u.je.rotation.x=Math.max(0,-ph)*.9+.05;u.jd.rotation.x=Math.max(0,ph)*.9+.05;
     if(s>10.4&&s<11.4){var w=Math.sin((s-10.4)*9)*.32;u.qe.rotation.x=w;u.qd.rotation.x=-w;}});
    /* encarregado: orienta com o tablet e faz sinal de ok no final */
    var ue=enc.userData;enc.visible=s>.8&&s<11.6;
    var pe=V(C.x,chao,C.z).add(dirW.clone().multiplyScalar(1.9)).add(lado.clone().multiplyScalar(-(larg/2+1.2)));enc.position.copy(pe);
    var olha=wc.clone().setY(chao).sub(pe).normalize();face(enc,olha);
    ue.cd.rotation.x=-.9;ue.od.rotation.x=-.55;ue.od.rotation.z=.18;
    var ok=s>10.2?ease((s-10.2)/.6):0,apon=s>2.6&&s<7.6?Math.sin(Math.min(1,(s-2.6)/.5)*Math.PI/2)*(s<7.1?1:1-(s-7.1)/.5):0;
    ue.oe.rotation.x=-.2-1.3*apon-2.4*ok+Math.sin(s*5)*.06*apon;ue.oe.rotation.z=-.15-.35*apon;ue.ce.rotation.x=-.15-.5*ok;
    ue.qe.rotation.x=ue.qd.rotation.x=0;ue.je.rotation.x=ue.jd.rotation.x=0;
    M.brilho.opacity=s>10.2&&s<12?Math.max(0,Math.sin((s-10.2)/1.8*Math.PI))*.95:0;
    if(s>7.8&&s<7.9)legenda('Fixando no vão');if(s>10.2&&s<10.3)legenda('Instalada · perfis reais do catálogo');
    if(o.limpaVista!==false&&Math.floor(s*2)!==ultR){ultR=Math.floor(s*2);var alvosR=[wc.clone()];mt.forEach(function(m){if(m.visible)alvosR.push(m.getWorldPosition(V()).add(V(0,1.3,0)))});
     alvosR.forEach(function(pt){var dir=pt.clone().sub(CAM.position),dd=dir.length();ray.set(CAM.position,dir.normalize());ray.far=dd-.3;
      ray.intersectObjects(cand,false).forEach(function(h){var g=h.object;if(!g.visible||meus(g))return;if(o.naoOcultar&&o.naoOcultar(g))return;
       if(!escondidos.has(g)){escondidos.add(g);g.visible=false;}});});}
    /* câmera acompanha a equipe */
    /* câmera de perto, acompanhando os montadores: lateral no transporte, frente no encaixe, close na fixação, plano médio no ok */
    var y0c=solo+hO,m0=mt[0].position,pA=m0.clone().add(foraW.clone().multiplyScalar(2.5)).add(ladoF.clone().multiplyScalar(-1.7)).setY(y0c+.1),tA=m0.clone().lerp(wc,.35).setY(chao+1.2);
    var pB=C.clone().add(foraW.clone().multiplyScalar(kf*1.05)).add(ladoF.clone().multiplyScalar(-kf*.25)).setY(y0c),tB=C.clone().setY(chao+1.15);
    var lp=mt[1].position.clone(),pC=lp.clone().add(foraW.clone().multiplyScalar(1.55)).add(ladoF.clone().multiplyScalar(.75)).setY(chao+1.45),tC=lp.clone().add(foraW.clone().multiplyScalar(-.2)).setY(chao+1.2);
    var pD=C.clone().add(foraW.clone().multiplyScalar(kf*1.25)).add(ladoF.clone().multiplyScalar(kf*.35)).setY(y0c+.2),tD=C.clone().setY(chao+1.05);
    var cp,tg;if(s<4.2){cp=pA;tg=tA;}else if(s<5.6){var q=ease((s-4.2)/1.4);cp=pA.clone().lerp(pB,q);tg=tA.clone().lerp(tB,q);}else if(s<7.9){cp=pB;tg=tB;}
    else if(s<9.0){var q2=ease((s-7.9)/1.1);cp=pB.clone().lerp(pC,q2);tg=tB.clone().lerp(tC,q2);}else if(s<10.1){cp=pC;tg=tC;}else{var q3=ease((s-10.1)/1.3);cp=pC.clone().lerp(pD,q3);tg=tC.clone().lerp(tD,q3);}
    cp=semParede(cp,tg);CAM.position.lerp(cp,s<.05?1:.12);
    if(s>DUR-1.3&&!api.seq){var kk=ease((s-(DUR-1.3))/1.3);if(camT){CAM.position.lerp(camP,kk);tg.lerp(camT,kk)}}
    if(!api._tg||s<.05)api._tg=tg.clone();else api._tg.lerp(tg,.12);if(CT)CT.target.copy(api._tg);else CAM.lookAt(api._tg);
    if(s<DUR){requestAnimationFrame(quadro);return;}
    escondidos.forEach(function(g){g.visible=true});ob.position.copy(p0);ob.rotation.copy(r0);mt.forEach(function(m){SC.remove(m)});SC.remove(eg);
    if(CT){CT.enabled=true;if(!api.seq){CAM.position.copy(camP);CT.target.copy(camT);}else{CT.target.copy(api._tg);}CT.minDistance=lim[0];CT.maxDistance=lim[1];CT.minPolarAngle=lim[2];CT.maxPolarAngle=lim[3];}
    legenda(null);api.ativo=false;o.aoFim&&o.aoFim(alvo);res(true);}
   requestAnimationFrame(quadro);});};
 api.alvo=function(){var l=(o.alvos&&o.alvos())||[];return l.length?((o.escolhe&&o.escolhe(l))||l[0]):null};
 api.instalaAtual=function(){return api.instala(api.alvo());};
 api.parar=false;api.instalaTodas=function(){var l=(o.alvos&&o.alvos())||[],i=0;api.parar=false;function prox(){if(i>=l.length||api.parar){api.seq=false;return Promise.resolve(true);}api.seq=i<l.length-1;var a=l[i++];return api.instala(a).then(prox);}return prox();};
 api.total=function(){return ((o.alvos&&o.alvos())||[]).length};
 /* ---------- botão ---------- */
 if(o.barra||o.flutuar){var b=document.createElement('button');b.type='button';b.className=o.cls||'fcrx-b';b.innerHTML='👷 Instalação';b.title='Ver a equipe trazendo a esquadria e encaixando no vão';
  b.onclick=function(){if(api.ativo)return;var l=(o.alvos&&o.alvos())||[];if(!l.length){o.semAlvo&&o.semAlvo();return;}Promise.resolve(o.antesDe&&o.antesDe()).then(function(){if(o.todas&&l.length>1)api.instalaTodas();else api.instala((o.escolhe&&o.escolhe(l))||l[0]);});};
  var bar=o.barra;if(!bar){bar=document.querySelector('.fcrx-flt');if(!bar){bar=document.createElement('div');bar.className='fcrx-bar fcrx-flt';o.flutuar.appendChild(bar);if(o.pos)Object.assign(bar.style,o.pos);}}
  if(o.antes&&o.antes.parentNode===bar)bar.insertBefore(b,o.antes);else bar.appendChild(b);api.botao=b;}
 return api;}
window.FCGuindaste={init:init};
})();
