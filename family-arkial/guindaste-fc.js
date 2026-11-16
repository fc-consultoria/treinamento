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
  var tab=new T.Mesh(new T.BoxGeometry(.2,.28,.012),M.preto);tab.position.set(0,-.36,.06);tab.rotation.x=-.5;tab.visible=false;u.cd.add(tab);u.tab=tab;
  g.userData=u;return g;}
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
  var mt=[montador(),montador(),montador()],enc=mt[2];enc.userData.tab.visible=true;
  mt.forEach(function(m){m.userData.y0=chao;m.visible=false;var f=parafusadeira();f.position.set(0,-.33,.02);m.userData.cd.add(f);m.userData.fur=f;SC.add(m)});
  var eg=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(S.x+.06,S.y+.06,S.z+.06)),M.brilho);eg.position.copy(C);SC.add(eg);
  var ray=new T.Raycaster(),escondidos=new Set(),meus=function(x){while(x){if(x===ob||mt.indexOf(x)>=0||x===eg)return true;x=x.parent}return false};
  /* câmera na altura das pessoas */
  var k=Math.max(5.2,tam*2.1);
  var c0=C.clone().add(dirW.clone().multiplyScalar(k*1.05)).add(lado.clone().multiplyScalar(-k*.95)).add(V(0,chao-C.y+1.75,0));
  var c1=C.clone().add(dirW.clone().multiplyScalar(k*1.0)).add(lado.clone().multiplyScalar(-k*.12)).add(V(0,chao-C.y+1.6,0));
  var camP=CAM.position.clone(),camT=CT?CT.target.clone():null,lim=null;if(CT){CT.enabled=false;lim=[CT.minDistance,CT.maxDistance,CT.minPolarAngle,CT.maxPolarAngle];CT.minDistance=0;CT.maxDistance=Infinity;CT.minPolarAngle=0;CT.maxPolarAngle=Math.PI;}
  var DUR=13,t0=performance.now(),longe=3.6,perto=.85;
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
    var pe=V(C.x,chao,C.z).add(dirW.clone().multiplyScalar(1.25)).add(lado.clone().multiplyScalar(larg/2+.8));enc.position.copy(pe);
    var olha=wc.clone().setY(chao).sub(pe).normalize();face(enc,olha);
    ue.cd.rotation.x=-.9;ue.od.rotation.x=-.55;ue.od.rotation.z=.18;
    var ok=s>10.2?ease((s-10.2)/.6):0,apon=s>2.6&&s<7.6?Math.sin(Math.min(1,(s-2.6)/.5)*Math.PI/2)*(s<7.1?1:1-(s-7.1)/.5):0;
    ue.oe.rotation.x=-.2-1.3*apon-2.4*ok+Math.sin(s*5)*.06*apon;ue.oe.rotation.z=-.15-.35*apon;ue.ce.rotation.x=-.15-.5*ok;
    ue.qe.rotation.x=ue.qd.rotation.x=0;ue.je.rotation.x=ue.jd.rotation.x=0;
    M.brilho.opacity=s>10.2&&s<12?Math.max(0,Math.sin((s-10.2)/1.8*Math.PI))*.95:0;
    if(s>7.8&&s<7.9)legenda('Fixando no vão');if(s>10.2&&s<10.3)legenda('Instalada · perfis reais do catálogo');
    if(o.limpaVista!==false&&(Math.floor(s*10)%3===0)){var alvosR=[wc.clone()];mt.forEach(function(m){if(m.visible)alvosR.push(m.getWorldPosition(V()).add(V(0,1.3,0)))});
     alvosR.forEach(function(pt){var dir=pt.clone().sub(CAM.position),dd=dir.length();ray.set(CAM.position,dir.normalize());ray.far=dd-.3;
      ray.intersectObjects(SC.children,true).forEach(function(h){var g=h.object;if(!g.visible||meus(g))return;if(o.naoOcultar&&o.naoOcultar(g))return;
       var b3=new T.Box3().setFromObject(g).getSize(V());if(Math.max(b3.x,b3.y,b3.z)>6)return;if(!escondidos.has(g)){escondidos.add(g);g.visible=false;}});});}
    /* câmera acompanha a equipe */
    var kc=ease(s/10.5);CAM.position.lerpVectors(c0,c1,kc);var tg=wc.clone().lerp(C,ease(s/7)).setY(lin(chao+1.15,C.y,ease((s-3)/5)));
    if(s>DUR-1.3){var kk=ease((s-(DUR-1.3))/1.3);if(camT){CAM.position.lerp(camP,kk);tg.lerp(camT,kk)}}
    if(CT)CT.target.copy(tg);else CAM.lookAt(tg);
    if(s<DUR){requestAnimationFrame(quadro);return;}
    escondidos.forEach(function(g){g.visible=true});ob.position.copy(p0);ob.rotation.copy(r0);mt.forEach(function(m){SC.remove(m)});SC.remove(eg);
    if(CT){CT.enabled=true;CAM.position.copy(camP);CT.target.copy(camT);CT.minDistance=lim[0];CT.maxDistance=lim[1];CT.minPolarAngle=lim[2];CT.maxPolarAngle=lim[3];}
    legenda(null);api.ativo=false;o.aoFim&&o.aoFim(alvo);res(true);}
   requestAnimationFrame(quadro);});};
 api.alvo=function(){var l=(o.alvos&&o.alvos())||[];return l.length?((o.escolhe&&o.escolhe(l))||l[0]):null};
 api.instalaAtual=function(){return api.instala(api.alvo());};
 /* ---------- botão ---------- */
 if(o.barra||o.flutuar){var b=document.createElement('button');b.type='button';b.className=o.cls||'fcrx-b';b.innerHTML='👷 Instalação';b.title='Ver a equipe trazendo a esquadria e encaixando no vão';
  b.onclick=function(){if(api.ativo)return;var l=(o.alvos&&o.alvos())||[];if(!l.length){o.semAlvo&&o.semAlvo();return;}var a=(o.escolhe&&o.escolhe(l))||l[0];Promise.resolve(o.antesDe&&o.antesDe()).then(function(){api.instala(a)});};
  var bar=o.barra;if(!bar){bar=document.querySelector('.fcrx-flt');if(!bar){bar=document.createElement('div');bar.className='fcrx-bar fcrx-flt';o.flutuar.appendChild(bar);if(o.pos)Object.assign(bar.style,o.pos);}}
  if(o.antes&&o.antes.parentNode===bar)bar.insertBefore(b,o.antes);else bar.appendChild(b);api.botao=b;}
 return api;}
window.FCGuindaste={init:init};
})();
