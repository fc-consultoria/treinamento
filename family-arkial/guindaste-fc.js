/* Instalação com guindaste · complemento das plantas e ambientes 3D (16/11/2026)
   A esquadria que já está no vão (perfis reais) sai do lugar, chega pendurada num guindaste,
   desce, os montadores recebem e ela encaixa no vão. Ao terminar tudo volta exatamente como estava.
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
 /* ---------- caminhão guindaste (medidas em metros) ---------- */
 function guindaste(){var G=new T.Group(),cam=new T.Group();G.add(cam);
  bx(2.4,.5,7.4,M.amar,0,1.0,0,cam);bx(2.45,.12,7.5,M.preto,0,.72,0,cam);
  var cab=new T.Group();cab.position.set(0,0,3.05);cam.add(cab);bx(2.3,1.55,1.5,M.branco,0,1.75,0,cab);bx(2.32,.7,.06,M.vidroCab,0,2.1,.76,cab);bx(.06,.6,1.2,M.vidroCab,1.16,2.1,0,cab);bx(.06,.6,1.2,M.vidroCab,-1.16,2.1,0,cab);
  [[-1.0,2.7],[1.0,2.7],[-1.0,-1.6],[1.0,-1.6],[-1.0,-2.7],[1.0,-2.7]].forEach(function(p){var r=cil(.48,.42,M.pneu,cam,24);r.rotation.z=Math.PI/2;r.position.set(p[0]*1.08,.48,p[1]);var c=cil(.22,.44,M.aco,cam,14);c.rotation.z=Math.PI/2;c.position.copy(r.position)});
  [[1,2.0],[-1,2.0],[1,-2.4],[-1,-2.4]].forEach(function(p){bx(1.3,.18,.22,M.amar2,p[0]*1.75,.75,p[1],cam);bx(.16,.7,.16,M.aco,p[0]*2.35,.4,p[1],cam);bx(.6,.06,.6,M.preto,p[0]*2.35,.04,p[1],cam)});
  for(var i=0;i<6;i++)bx(.3,.08,.02,i%2?M.preto:M.amar,-1.0+i*.4,.85,-3.72,cam);
  var tor=new T.Group();tor.position.set(0,1.25,-1.4);cam.add(tor);var b=cil(.85,.35,M.amar2,tor,28);b.position.y=.18;bx(1.3,1.0,1.6,M.amar,0,.85,.1,tor);bx(.5,.35,.5,M.preto,.55,1.2,.7,tor);
  var piv=new T.Group();piv.position.set(0,1.25,-.4);tor.add(piv);
  var lanca=new T.Group();piv.add(lanca);
  var s1=bx(.62,.62,1,M.amar,0,0,0,lanca),s2=bx(.5,.5,1,M.amar2,0,0,0,lanca),s3=bx(.4,.4,1,M.amar,0,0,0,lanca);
  var ponta=new T.Group();lanca.add(ponta);var pol=cil(.22,.3,M.preto,ponta,20);pol.rotation.z=Math.PI/2;bx(.46,.5,.5,M.amar2,0,0,0,ponta);
  var hid=bx(.2,1,.2,M.aco,0,0,0);tor.add(hid);
  var cabo=cil(.022,1,M.cabo,G,8);
  var gancho=new T.Group();G.add(gancho);bx(.42,.55,.3,M.amar,0,.1,0,gancho);bx(.44,.12,.32,M.preto,0,-.12,0,gancho);var gh=new T.Mesh(new T.TorusGeometry(.12,.035,10,20,Math.PI*1.4),M.aco);gh.position.y=-.3;gh.rotation.z=-.5;gancho.add(gh);
  var cintas=[cil(.03,1,M.cinta,G,6),cil(.03,1,M.cinta,G,6)];
  return {G:G,cam:cam,tor:tor,piv:piv,lanca:lanca,s:[s1,s2,s3],ponta:ponta,hid:hid,cabo:cabo,gancho:gancho,cintas:cintas};}
 /* montador com proporção humana (≈1,75 m): membros arredondados, articulações, uniforme de obra e EPI */
 function membro(r1,r2,len,m){var g=new T.Group(),c=new T.Mesh(new T.CylinderGeometry(r2,r1,len,18,1,true),m);c.position.y=-len/2;c.castShadow=true;g.add(c);
  var a=new T.Mesh(new T.SphereGeometry(r1,16,12),m);a.castShadow=true;g.add(a);var b=new T.Mesh(new T.SphereGeometry(r2,16,12),m);b.position.y=-len;b.castShadow=true;g.add(b);return g;}
 function lathe(pts,m,sz){var g=new T.LatheGeometry(pts.map(function(p){return new T.Vector2(p[0],p[1])}),28);var ms=new T.Mesh(g,m);ms.scale.z=sz||.62;ms.castShadow=true;return ms;}
 function montador(){var g=new T.Group(),u={};
  /* pernas: calça de brim, joelheira e botina */
  [-1,1].forEach(function(sd){var q=new T.Group();q.position.set(sd*.1,.93,0);g.add(q);var co=membro(.085,.065,.44,M.calca);q.add(co);
   var j=new T.Group();j.position.y=-.44;q.add(j);var ca=membro(.062,.05,.42,M.calca);j.add(ca);
   var bt=new T.Group();bt.position.y=-.43;j.add(bt);var b1=new T.Mesh(new T.SphereGeometry(.07,16,10),M.bota);b1.scale.set(.85,.75,1.65);b1.position.set(0,-.02,.05);b1.castShadow=true;bt.add(b1);
   var sola=new T.Mesh(new T.BoxGeometry(.11,.025,.27),M.preto);sola.position.set(0,-.07,.05);bt.add(sola);
   u[sd<0?'qe':'qd']=q;u[sd<0?'je':'jd']=j;});
  /* quadril e tronco */
  var qd=lathe([[0,.84],[.15,.86],[.17,.95],[.155,1.02],[0,1.04]],M.calca,.7);g.add(qd);
  var cinto=new T.Mesh(new T.TorusGeometry(.158,.018,8,28),M.preto);cinto.rotation.x=Math.PI/2;cinto.scale.y=.7;cinto.position.y=1.0;g.add(cinto);
  var tr=lathe([[0,.98],[.155,1.0],[.15,1.12],[.17,1.3],[.185,1.42],[.16,1.48],[.07,1.52],[0,1.53]],M.camisa,.6);g.add(tr);
  var co=lathe([[0,1.02],[.165,1.04],[.16,1.14],[.178,1.3],[.192,1.41],[.12,1.47],[0,1.475]],M.colete,.64);co.scale.x=1.03;g.add(co);
  [1.12,1.24].forEach(function(y){var f=new T.Mesh(new T.TorusGeometry(.172,.012,6,30),M.faixa);f.rotation.x=Math.PI/2;f.scale.y=.64*.98;f.position.y=y;g.add(f)});
  /* pescoço e cabeça */
  var pe=new T.Mesh(new T.CylinderGeometry(.045,.05,.09,14),M.pele);pe.position.y=1.56;g.add(pe);
  var cb=new T.Group();cb.position.y=1.66;g.add(cb);var ca=new T.Mesh(new T.SphereGeometry(.1,24,18),M.pele);ca.scale.set(.88,1.08,.98);ca.castShadow=true;cb.add(ca);
  var na=new T.Mesh(new T.ConeGeometry(.016,.04,8),M.pele);na.rotation.x=Math.PI/2;na.position.set(0,-.005,.1);cb.add(na);
  [-1,1].forEach(function(sd){var o=new T.Mesh(new T.SphereGeometry(.022,10,8),M.pele);o.scale.set(.5,1,.7);o.position.set(sd*.088,0,0);cb.add(o)});
  var cpt=new T.Mesh(new T.SphereGeometry(.118,26,14,0,Math.PI*2,0,Math.PI/2),M.amar);cpt.scale.set(1,.9,1.12);cpt.position.y=.035;cpt.castShadow=true;cb.add(cpt);
  var ab=new T.Mesh(new T.CylinderGeometry(.13,.13,.012,28),M.amar);ab.scale.z=1.18;ab.position.set(0,.03,.018);cb.add(ab);
  var ns=new T.Mesh(new T.BoxGeometry(.02,.012,.2),M.amar2);ns.position.set(0,.14,0);cb.add(ns);
  /* braços: ombro, cotovelo, luva */
  [-1,1].forEach(function(sd){var om=new T.Group();om.position.set(sd*.2,1.45,0);g.add(om);var ma=new T.Mesh(new T.SphereGeometry(.068,14,10),M.colete);om.add(ma);
   var br=membro(.058,.045,.29,M.camisa);om.add(br);var cv=new T.Group();cv.position.y=-.29;om.add(cv);var ab2=membro(.045,.036,.26,M.pele);cv.add(ab2);
   var lu=new T.Mesh(new T.SphereGeometry(.045,12,10),M.luva);lu.scale.set(.8,1.3,.55);lu.position.y=-.3;cv.add(lu);
   u[sd<0?'oe':'od']=om;u[sd<0?'ce':'cd']=cv;});
  g.userData=u;return g;}
 /* ---------- utilidades ---------- */
 function liga(ms,a,b){var d=b.clone().sub(a),L=d.length();ms.position.copy(a).add(b).multiplyScalar(.5);ms.scale.set(1,Math.max(.001,L),1);ms.quaternion.setFromUnitVectors(UP,d.normalize());}
 var ease=function(t){t=Math.max(0,Math.min(1,t));return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},lin=function(a,b,t){return a+(b-a)*Math.max(0,Math.min(1,t))};
 var cap=null;function legenda(txt){var p=o.legendaEm||null;if(!p)return;if(!cap){cap=document.createElement('div');cap.className='fcgd-cap';if(getComputedStyle(p).position==='static')p.style.position='relative';p.appendChild(cap);}if(txt){cap.textContent=txt;cap.classList.add('on')}else cap.classList.remove('on');}
 /* ---------- a cena ---------- */
 api.instala=function(alvo){if(api.ativo||!alvo||!alvo.obj)return Promise.resolve(false);api.ativo=true;
  var ob=alvo.obj,par=ob.parent;if(!par){api.ativo=false;return Promise.resolve(false);}
  SC.updateMatrixWorld(true);
  var p0=ob.position.clone(),r0=ob.rotation.clone();
  var bb=new T.Box3().setFromObject(ob),C=bb.getCenter(V()),S=bb.getSize(V());
  var wp0=ob.getWorldPosition(V()),topo=V(C.x,bb.max.y,C.z).sub(wp0);
  /* para fora da parede, no espaço do pai e no mundo */
  var foraP=(alvo.fora||V(0,0,-1)).clone().applyQuaternion(ob.quaternion).normalize();
  var pq=par.getWorldQuaternion(new T.Quaternion()),foraW=foraP.clone().applyQuaternion(pq).setY(0).normalize();
  var ps=par.getWorldScale(V()),esc=1/Math.max(1e-6,ps.x);/* metros do mundo -> unidades do pai */
  var lado=V().crossVectors(UP,foraW).normalize(),chao=alvo.chao!=null?alvo.chao:0,solo=alvo.solo!=null?alvo.solo:0;
  var tam=Math.max(S.x,S.y,S.z);
  var gd=guindaste(),dist=Math.max(5.2,tam*1.6+3.2);
  var base=V(C.x,solo,C.z).add(foraW.clone().multiplyScalar(dist)).add(lado.clone().multiplyScalar(2.4));
  gd.G.position.copy(base);gd.G.rotation.y=Math.atan2(lado.x,lado.z);SC.add(gd.G);
  /* montadores: no chão de fora (térreo) ou do lado de dentro (andar de cima) */
  var mt=[montador(),montador()],dentro=chao>solo+.6;
  mt.forEach(function(m,i){var s=(i?1:-1)*(Math.max(S.x,S.z)*.5+.35);var p=V(C.x,chao,C.z).add(lado.clone().multiplyScalar(s)).add(foraW.clone().multiplyScalar(dentro?-.55:.55));m.position.copy(p);m.userData.y0=p.y;m.rotation.y=Math.atan2(-foraW.x*(dentro?-1:1),-foraW.z*(dentro?-1:1));m.visible=false;SC.add(m)});
  /* brilho do encaixe */
  var eg=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(S.x+.06,S.y+.06,S.z+.06)),M.brilho);eg.position.copy(C);SC.add(eg);
  /* câmera */
  var alvoCam0=C.clone().add(lado.clone().multiplyScalar(1.2)).add(foraW.clone().multiplyScalar(1.5)),alvoCam=C.clone().add(V(0,.6,0)),k=Math.max(9.5,tam*3.2);
  var c0=C.clone().add(foraW.clone().multiplyScalar(k*1.35)).add(lado.clone().multiplyScalar(-k*.85)).add(V(0,k*.5,0));
  var c1=C.clone().add(foraW.clone().multiplyScalar(k*.8)).add(lado.clone().multiplyScalar(-k*.45)).add(V(0,k*.22,0));
  var camP=CAM.position.clone(),camT=CT?CT.target.clone():null,lim=null;if(CT){CT.enabled=false;lim=[CT.minDistance,CT.maxDistance,CT.minPolarAngle,CT.maxPolarAngle];CT.minDistance=0;CT.maxDistance=Infinity;CT.minPolarAngle=0;CT.maxPolarAngle=Math.PI;}
  var DUR=10.5,t0=performance.now(),sobe=3.6,sai=2.8;
  var ray=new T.Raycaster(),escondidos=new Set(),meus=function(x){while(x){if(x===gd.G||x===ob||mt.indexOf(x)>=0||x===eg)return true;x=x.parent}return false};
  o.aoInicio&&o.aoInicio(alvo);legenda('Instalação · '+(alvo.nome||'esquadria'));
  return new Promise(function(res){
   function quadro(){var s=(performance.now()-t0)/1000;
    /* trajetória da esquadria: chega alta e afastada, desce, entra no vão */
    var up=s<5.2?lin(sobe,.18,ease((s-.6)/4.6)):lin(.18,0,ease((s-6.6)/1.0));
    var out=s<5.6?sai:lin(sai,0,ease((s-5.6)/1.6));
    var bal=Math.exp(-s*.55)*Math.sin(s*2.6)*.06*(s<7.6?1:0);
    ob.position.copy(p0).add(foraP.clone().multiplyScalar(out*esc)).add(UP.clone().multiplyScalar(up*esc));
    ob.rotation.copy(r0);ob.rotateY(bal);ob.rotateZ(bal*.4);
    SC.updateMatrixWorld(true);
    var wp=ob.getWorldPosition(V()),gan=wp.clone().add(topo).add(V(0,.85,0));
    var fim=s>8.4,cabL=fim?lin(1.2,.35,(s-8.4)/1.4):1.2;
    var tip=gan.clone().add(V(0,cabL+.35,0));if(fim){tip.copy(gd.ponta.getWorldPosition(V()));gan.copy(tip).add(V(0,-cabL,0));}
    /* lança: gira a torre e aponta para a ponta */
    var tp=gd.tor.getWorldPosition(V()),dh=tip.clone().sub(tp);gd.tor.rotation.y=Math.atan2(dh.x,dh.z)-gd.G.rotation.y;
    gd.G.updateMatrixWorld(true);var pv=gd.piv.getWorldPosition(V());
    if(!fim){var lp=gd.piv.worldToLocal(tip.clone());var L=lp.length();gd.lanca.quaternion.setFromUnitVectors(V(0,0,1),lp.clone().normalize());
     var a=L*.42;gd.s[0].scale.z=a;gd.s[0].position.z=a/2;gd.s[1].scale.z=a;gd.s[1].position.z=L*.36+a/2;gd.s[2].scale.z=L*.32;gd.s[2].position.z=L*.68+L*.16;gd.ponta.position.z=L;
     gd.ponta.quaternion.copy(gd.lanca.quaternion).invert();
     var hb=gd.tor.worldToLocal(pv.clone().add(tip.clone().sub(pv).multiplyScalar(.3)));liga(gd.hid,V(0,.6,.6),hb);}
    var pt=gd.ponta.getWorldPosition(V()),GL=function(v){return gd.G.worldToLocal(v.clone())};liga(gd.cabo,GL(pt),GL(gan));window.__gdDbg={pt:pt,tip:tip,gan:gan};gd.gancho.position.copy(gd.G.worldToLocal(gan.clone()));
    gd.cintas.forEach(function(c,i){c.visible=!fim;if(fim)return;var q=V(C.x,bb.max.y,C.z).sub(wp0).add(wp).add(lado.clone().multiplyScalar((i?1:-1)*Math.max(S.x,S.z)*.38));liga(c,GL(gan.clone().add(V(0,-.3,0))),GL(q))});
    /* montadores: aparecem quando ela chega, braços para cima */
    mt.forEach(function(m,i){m.visible=s>3.6&&s<10.2;var u=m.userData,ag=Math.min(1,Math.max(0,(s-4)/1.2))*(s<8.2?1:Math.max(0,1-(s-8.2)/.8)),ag=ag*ag*(3-2*ag),r=Math.sin(s*1.7+i*2)*.04;
     u.oe.rotation.x=u.od.rotation.x=-2.25*ag+r;u.oe.rotation.z=-.12-.1*ag;u.od.rotation.z=.12+.1*ag;u.ce.rotation.x=u.cd.rotation.x=-.25-.35*ag;
     u.je.rotation.x=u.jd.rotation.x=.12*ag;u.qe.rotation.x=u.qd.rotation.x=-.06*ag;u.qe.rotation.z=-.05;u.qd.rotation.z=.05;m.position.y=m.userData.y0-.025*ag;});
    gd.G.visible=s<10.2;
    M.brilho.opacity=s>7.4&&s<9.4?Math.max(0,Math.sin((s-7.4)/2*Math.PI))*.95:0;
    if(s>7.6&&s<7.7)legenda('Encaixada no vão · perfis reais');
    /* o que ficar entre a câmera e a esquadria (árvore, muro baixo, móvel) some durante a cena */
    if(o.limpaVista!==false&&(Math.floor(s*10)%3===0)){var alvosR=[wp.clone().add(topo).add(V(0,-S.y*.5,0)),gan.clone()];if(!dentro)mt.forEach(function(m){if(m.visible)alvosR.push(m.getWorldPosition(V()).add(V(0,1.2,0)))});
     alvosR.forEach(function(pt){var dir=pt.clone().sub(CAM.position),dd=dir.length();ray.set(CAM.position,dir.normalize());ray.far=dd-.3;
      ray.intersectObjects(SC.children,true).forEach(function(h){var x=h.object;if(!x.visible||meus(x))return;var g=x;if(o.naoOcultar&&o.naoOcultar(g))return;
       var bb3=new T.Box3().setFromObject(g).getSize(V());if(Math.max(bb3.x,bb3.y,bb3.z)>6)return;if(!escondidos.has(g)){escondidos.add(g);g.visible=false;}});});}
    /* câmera */
    var kc=ease(s/DUR);CAM.position.lerpVectors(c0,c1,kc);var tg=alvoCam0.clone().lerp(alvoCam,ease(s/7)).add(V(0,lin(1.8,0,ease(s/6)),0));
    if(s>DUR-1.2){var kk=ease((s-(DUR-1.2))/1.2);if(camT){CAM.position.lerp(camP,kk);tg.lerp(camT,kk)}}
    if(CT)CT.target.copy(tg);else CAM.lookAt(tg);
    if(s<DUR){requestAnimationFrame(quadro);return;}
    escondidos.forEach(function(g){g.visible=true});    ob.position.copy(p0);ob.rotation.copy(r0);SC.remove(gd.G);mt.forEach(function(m){SC.remove(m)});SC.remove(eg);
    gd.G.traverse(function(x){x.geometry&&x.geometry.dispose()});
    if(CT){CT.enabled=true;CAM.position.copy(camP);CT.target.copy(camT);CT.minDistance=lim[0];CT.maxDistance=lim[1];CT.minPolarAngle=lim[2];CT.maxPolarAngle=lim[3];}
    legenda(null);api.ativo=false;o.aoFim&&o.aoFim(alvo);res(true);}
   requestAnimationFrame(quadro);});};
 api.alvo=function(){var l=(o.alvos&&o.alvos())||[];return l.length?((o.escolhe&&o.escolhe(l))||l[0]):null};
 api.instalaAtual=function(){return api.instala(api.alvo());};
 /* ---------- botão ---------- */
 if(o.barra||o.flutuar){var b=document.createElement('button');b.type='button';b.className=o.cls||'fcrx-b';b.innerHTML='🏗️ Instalação';b.title='Ver a esquadria chegando com o guindaste e encaixando no vão';
  b.onclick=function(){if(api.ativo)return;var l=(o.alvos&&o.alvos())||[];if(!l.length){o.semAlvo&&o.semAlvo();return;}var a=(o.escolhe&&o.escolhe(l))||l[0];Promise.resolve(o.antesDe&&o.antesDe()).then(function(){api.instala(a)});};
  var bar=o.barra;if(!bar){bar=document.querySelector('.fcrx-flt');if(!bar){bar=document.createElement('div');bar.className='fcrx-bar fcrx-flt';o.flutuar.appendChild(bar);if(o.pos)Object.assign(bar.style,o.pos);}}
  if(o.antes&&o.antes.parentNode===bar)bar.insertBefore(b,o.antes);else bar.appendChild(b);api.botao=b;}
 return api;}
window.FCGuindaste={init:init};
})();
