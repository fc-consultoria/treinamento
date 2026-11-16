/* Raio-X + Vídeo Reels · complemento das tipologias 3D (16/11/2026)
   Soma ao que já existe na tela (cortes, desmontar, abrir folha, ambientes):
   - Raio-X: perfis ficam transparentes com o contorno aceso; componentes (borracha, roldana, ferragem) em destaque.
   - Vídeo Reels: grava em pé (1080×1920) um roteiro usando os próprios comandos da tela, com legenda e marca.
   Nada é alterado no 3D original: ao desligar, os materiais voltam como estavam.
   © FC Consultoria em Esquadria · CNPJ 52.985.682/0001-32 */
(function(){
'use strict';
if(window.FCRaioX)return;
var CSS='.fcrx-bar{display:flex;gap:6px;flex-wrap:wrap}'+
'.fcrx-flt{position:absolute;z-index:6;left:12px;top:12px}'+
'.fcrx-b{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:7px 14px;border-radius:999px;font:600 13px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:rgba(20,22,26,.78);color:#f1efea;border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px)}'+
'.fcrx-b:hover{border-color:rgba(255,255,255,.45)}.fcrx-b.on{background:#38c6f4;color:#04202c;border-color:#38c6f4}'+
'.fcrx-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(5,8,11,.88);display:flex;align-items:center;justify-content:center;gap:22px;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#eef4f7}'+
'.fcrx-ov canvas{height:min(88vh,1920px);width:auto;aspect-ratio:9/16;border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.6);background:#000}'+
'.fcrx-cd{max-width:300px;display:flex;flex-direction:column;gap:10px}.fcrx-cd b{font-size:17px}.fcrx-cd p{margin:0;color:#a9b8c1}'+
'.fcrx-cd .r{display:flex;gap:8px;flex-wrap:wrap}.fcrx-cd .fcrx-b.p{background:#c8243a;border-color:#c8243a}.fcrx-cd .fcrx-b.s{background:#38c6f4;color:#04202c;border-color:#38c6f4}'+
'.fcrx-dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#e5334b;margin-right:6px;animation:fcrxp 1s infinite}@keyframes fcrxp{50%{opacity:.3}}'+
'@media(max-width:760px){.fcrx-ov{flex-direction:column;gap:10px}.fcrx-ov canvas{height:min(66vh,1920px)}}';
function css(){if(document.getElementById('fcrx-css'))return;var s=document.createElement('style');s.id='fcrx-css';s.textContent=CSS;document.head.appendChild(s);}
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}

function init(o){
 css();
 var T=window.THREE,R=o.R,SC=o.SC,CAM=o.CAM,CT=o.CT||null;
 if(!T||!R||!SC||!CAM)return null;
 var api={},st={rx:false,k:0,orb:0,rec:null,tour:null};
 /* ---------- materiais do raio-x ---------- */
 var xAlu=new T.MeshStandardMaterial({color:0x9fdcff,metalness:.2,roughness:.35,transparent:true,opacity:1,depthWrite:false,side:T.DoubleSide,emissive:0x0a3a55});
 var xComp=new T.MeshStandardMaterial({color:0xff8a3d,metalness:.1,roughness:.5,emissive:0xff5a1a,emissiveIntensity:.55});
 var xVid=new T.MeshStandardMaterial({color:0xbfe3ef,transparent:true,opacity:.05,depthWrite:false,side:T.DoubleSide});
 var xEdge=new T.LineBasicMaterial({color:0x5fdcff,transparent:true,opacity:0});
 var ORIG=new Map(),EDG=new Map(),GEO=new WeakMap();
 function alvo(){try{return (typeof o.alvo==='function'?o.alvo():o.alvo)||null}catch(e){return null}}
 function mat0(m){return Array.isArray(m)?m[0]:m}
 function tipo(m){if(!m)return null;
  if(!(m.isMeshStandardMaterial||m.isMeshPhysicalMaterial||m.isMeshPhongMaterial||m.isMeshLambertMaterial))return null;/* mantém cortes (MeshBasic), textos e etiquetas */
  if(o.ehVidro&&o.ehVidro(m))return 'vid';
  if((m.transparent&&m.opacity<.6)||m.transmission>0)return 'vid';
  if(o.ehPerfil&&o.ehPerfil(m))return 'alu';
  if((m.metalness||0)>=.35)return 'alu';
  return 'comp';}
 function aplica(){var a=alvo();if(!a)return;
  a.traverse(function(ms){if(!ms.isMesh||ORIG.has(ms)||ms.userData.fcrx)return;var m=mat0(ms.material),t=tipo(m);if(!t)return;
   ORIG.set(ms,ms.material);
   if(t==='alu'){ms.material=xAlu;var e=EDG.get(ms);if(!e){var g=GEO.get(ms.geometry);if(!g){g=new T.EdgesGeometry(ms.geometry,28);GEO.set(ms.geometry,g);}e=new T.LineSegments(g,xEdge);e.userData.fcrx=1;e.raycast=function(){};EDG.set(ms,e);}ms.add(e);}
   else if(t==='vid')ms.material=xVid;else ms.material=xComp;});}
 function restaura(){ORIG.forEach(function(m,ms){ms.material=m;var e=EDG.get(ms);if(e&&e.parent)e.parent.remove(e);});ORIG.clear();}
 function limpaMortos(){/* peças refeitas pela tela (medidas, montagem) saem da lista */
  ORIG.forEach(function(m,ms){var p=ms;while(p.parent)p=p.parent;if(p!==SC){ORIG.delete(ms);EDG.delete(ms);}});}
 api.raiox=function(on){on=!!on;if(on===st.rx)return;st.rx=on;if(on){st.k=0;aplica();}btR&&btR.classList.toggle('on',on);};
 /* ---------- giro lento da câmera ---------- */
 api.orbita=function(v){st.orb=v?(+v||1):0;};
 api.clica=function(sel,i){var l=document.querySelectorAll(sel);if(!l.length)return false;var b=i==null?l[0]:(i<0?l[l.length+i]:l[i]);if(!b)return false;b.click();return true;};
 api.foco=function(obj,k,seg){if(!obj||!CT)return;var b=new T.Box3().setFromObject(obj),c=b.getCenter(new T.Vector3()),s=b.getSize(new T.Vector3()),r=Math.max(s.x,s.y,s.z)*(k||1.6);var dir=CAM.position.clone().sub(c).setY(0).normalize();var p1=c.clone().add(dir.multiplyScalar(r)).add(new T.Vector3(0,r*.25,0)),p0=CAM.position.clone(),t0c=CT.target.clone(),i0=performance.now(),d=(seg||1.6)*1000;st.orb=0;(function f(){var q=Math.min(1,(performance.now()-i0)/d),e=q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2;CAM.position.lerpVectors(p0,p1,e);CT.target.lerpVectors(t0c,c,e);if(q<1)requestAnimationFrame(f);})();};
 api.existe=function(sel){return !!document.querySelector(sel);};
 api.desliza=function(sel,de,ate,seg){var r=document.querySelector(sel);if(!r)return false;var t0=performance.now();
  (function f(t){var k=Math.min(1,(t-t0)/(seg*1000)),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;r.value=de+(ate-de)*e;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));if(k<1&&st.tour)requestAnimationFrame(f);})(t0);return true;};
 /* ---------- laço próprio ---------- */
 var n=0,last=performance.now(),Y=new T.Vector3(0,1,0),tmp=new T.Vector3();
 function laco(t){requestAnimationFrame(laco);var dr=Math.max(0,Math.min(.5,(t-last)/1000)),dt=Math.min(.05,dr);last=t;n++;
  if(st.rx){st.k=Math.min(1,st.k+dt*2.2);if(n%20===0){limpaMortos();aplica();}
   var pl=null;ORIG.forEach(function(m){var mm=mat0(m);if(!pl&&mm.clippingPlanes&&mm.clippingPlanes.length)pl=mm.clippingPlanes;});pl=pl||[];
   if(xAlu.clippingPlanes!==pl){xAlu.clippingPlanes=xComp.clippingPlanes=xVid.clippingPlanes=xEdge.clippingPlanes=pl;xAlu.needsUpdate=xComp.needsUpdate=xVid.needsUpdate=xEdge.needsUpdate=true;}
   xAlu.opacity=1-.84*st.k;xEdge.opacity=.9*st.k;}
  else if(ORIG.size)restaura();
  if(st.orb){var c=CT?CT.target:(o.centro?o.centro():tmp.set(0,0,0));CAM.position.sub(c).applyAxisAngle(Y,dt*.32*st.orb).add(c);if(!CT)CAM.lookAt(c);}
  if(st.tour)passo(dr);}
 requestAnimationFrame(laco);

 /* ---------- roteiro ---------- */
 function passo(dt){var tr=st.tour;tr.t+=dt;var c=tr.cenas[tr.i];if(tr.t>=c.d){tr.i++;tr.t=0;if(tr.i>=tr.cenas.length){fimTour();return;}tr.cenas[tr.i].fn&&tr.cenas[tr.i].fn(api);}}
 function iniciaTour(gravar){var cenas=(o.roteiro&&o.roteiro(api))||[];if(!cenas.length)return;
  if(CT)CT.enabled=false;st.tour={cenas:cenas,i:0,t:0,gravar:gravar};abreTela(gravar);if(gravar)iniciaGravacao();cenas[0].fn&&cenas[0].fn(api);}
 function fimTour(cancelado){var tr=st.tour;if(!tr)return;st.tour=null;st.orb=0;if(CT)CT.enabled=true;
  if(tr.gravar)pararGravacao(cancelado);else fechaTela();
  o.aoTerminar&&o.aoTerminar(api);}
 api.legenda=function(){var tr=st.tour;if(!tr)return null;var c=tr.cenas[tr.i];return {txt:c.cap||'',a:Math.max(0,Math.min(1,tr.t/.45,(c.d-tr.t)/.35))};};

 /* ---------- quadro 9:16 ---------- */
 var VC=document.createElement('canvas');VC.width=1080;VC.height=1920;var vx=VC.getContext('2d');
 var salvo=null,ov=null,cd=null;
 function quebra(t,w){var p=String(t).split(' '),ls=[],l='';p.forEach(function(x){var nn=l?l+' '+x:x;if(vx.measureText(nn).width>w&&l){ls.push(l);l=x;}else l=nn;});ls.push(l);return ls;}
 var FN='-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
 function rr(x,y,w,h,r){vx.beginPath();vx.moveTo(x+r,y);vx.arcTo(x+w,y,x+w,y+h,r);vx.arcTo(x+w,y+h,x,y+h,r);vx.arcTo(x,y+h,x,y,r);vx.arcTo(x,y,x+w,y,r);vx.closePath();}
 function logoImg(){try{var e=o.logo&&o.logo();if(e&&e.complete&&e.naturalWidth)return e;}catch(x){}return null;}
 function quadro(){var W=1080,H=1920,cv=R.domElement,E=o.estilo||{},cor=E.cor||'#38c6f4',tr=st.tour,c=tr&&tr.cenas[tr.i];
  vx.fillStyle=o.fundo||'#0f1012';vx.fillRect(0,0,W,H);
  try{vx.drawImage(cv,0,0,cv.width,cv.height,0,0,W,H);}catch(e){}
  var g=vx.createLinearGradient(0,0,0,420);g.addColorStop(0,'rgba(0,0,0,.66)');g.addColorStop(1,'rgba(0,0,0,0)');vx.fillStyle=g;vx.fillRect(0,0,W,420);
  var g2=vx.createLinearGradient(0,1500,0,H);g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,.78)');vx.fillStyle=g2;vx.fillRect(0,1500,W,420);
  var lg=api.legenda(),m=o.marca||{},img=logoImg();
  /* cartão cheio (abertura / fechamento) */
  if(c&&c.card){var a=lg?lg.a:1;vx.globalAlpha=.82*a;vx.fillStyle='#07090b';vx.fillRect(0,0,W,H);vx.globalAlpha=a;
   var y0=760;if(img){var lw=560,lh=lw*img.naturalHeight/img.naturalWidth;vx.drawImage(img,540-lw/2,y0-lh-40,lw,lh);}
   vx.fillStyle=cor;vx.fillRect(540-60,y0,120,5);vx.textAlign='center';
   vx.fillStyle='#fff';vx.font='800 70px '+FN;quebra(c.card.t1||'',920).forEach(function(l,k){vx.fillText(l,540,y0+110+k*84)});
   vx.fillStyle='rgba(235,240,244,.82)';vx.font='500 36px '+FN;quebra(c.card.t2||'',900).forEach(function(l,k){vx.fillText(l,540,y0+260+k*48)});
   if(c.card.t3){rr(540-330,y0+390,660,92,46);vx.fillStyle=cor;vx.fill();vx.fillStyle='#111';vx.font='800 36px '+FN;vx.fillText(c.card.t3,540,y0+449);}
   vx.globalAlpha=1;}
  else{
   /* selo da linha, fixo no alto */
   if(img){var sw=250,sh=sw*img.naturalHeight/img.naturalWidth;vx.drawImage(img,64,70,sw,sh);}
   if(E.selo){vx.font='700 24px '+FN;var tw=vx.measureText(E.selo).width;rr(1016-tw-44,74,tw+44,48,24);vx.fillStyle='rgba(0,0,0,.45)';vx.fill();vx.strokeStyle=cor;vx.lineWidth=2;vx.stroke();vx.fillStyle=cor;vx.textAlign='center';vx.fillText(E.selo,1016-(tw+44)/2,106);}
   /* legenda moderna: barra de cor + texto à esquerda, embaixo */
   if(lg&&lg.txt){vx.globalAlpha=lg.a;var ls=(vx.font='800 64px '+FN,quebra(lg.txt,880)),yb=1500-(ls.length-1)*76,dx=(1-lg.a)*-40;
    var gp=vx.createLinearGradient(0,yb-140,0,yb+ls.length*76+80);gp.addColorStop(0,'rgba(0,0,0,0)');gp.addColorStop(.4,'rgba(0,0,0,.45)');gp.addColorStop(1,'rgba(0,0,0,.55)');vx.fillStyle=gp;vx.fillRect(0,yb-140,W,ls.length*76+220);
    vx.shadowColor='rgba(0,0,0,.6)';vx.shadowBlur=14;vx.fillStyle=cor;vx.fillRect(64+dx,yb-62,10,ls.length*76+4);vx.fillStyle='#fff';vx.textAlign='left';ls.forEach(function(l,k){vx.fillText(l,98+dx,yb+k*76)});
    if(c&&c.sub){vx.fillStyle='rgba(235,240,244,.9)';vx.font='500 32px '+FN;vx.fillText(c.sub,98+dx,yb+ls.length*76+4);}vx.shadowBlur=0;vx.globalAlpha=1;}
   vx.textAlign='center';vx.fillStyle='rgba(255,255,255,.9)';vx.font='700 30px '+FN;vx.fillText(m.l1||'',540,1760);
   vx.fillStyle='rgba(225,236,242,.75)';vx.font='500 24px '+FN;vx.fillText(m.l2||'',540,1800);if(m.l3)vx.fillText(m.l3,540,1834);}
  /* barra de progresso */
  if(tr){var tot=tr.cenas.reduce(function(s,x){return s+x.d},0),feito=tr.cenas.slice(0,tr.i).reduce(function(s,x){return s+x.d},0)+tr.t;
   vx.fillStyle='rgba(255,255,255,.18)';vx.fillRect(64,1872,952,6);vx.fillStyle=cor;vx.fillRect(64,1872,952*Math.min(1,feito/tot),6);}}
 /* depois de cada desenho da tela, copia para o quadro do vídeo (sem precisar de preserveDrawingBuffer) */
 var render0=R.render.bind(R);
 R.render=function(s,c){if(st.tour){var v=R.getSize(new T.Vector2());if(v.x!==1080||v.y!==1920||R.getPixelRatio()!==1){R.setPixelRatio(1);R.setSize(1080,1920,false);}if(c===CAM&&Math.abs(CAM.aspect-9/16)>1e-3){CAM.aspect=9/16;CAM.updateProjectionMatrix();}}
  render0(s,c);if(st.tour&&c===CAM)quadro();};
 function abreTela(gravar){ov=el('div','fcrx-ov');ov.appendChild(VC);cd=el('div','fcrx-cd');
  cd.innerHTML=(gravar?'<b><span class="fcrx-dot"></span>Gravando o vídeo</b><p>Formato em pé para Reels e Status (1080×1920). Não feche esta tela até terminar.</p>':'<b>Prévia do vídeo</b><p>É assim que o vídeo vai ficar. Para gerar o arquivo, use “Gravar”.</p>')+'<div class="r"><button class="fcrx-b" type="button">■ Parar</button></div><p class="m" style="font-size:12px"></p>';
  cd.querySelector('button').onclick=function(){fimTour(true);};ov.appendChild(cd);document.body.appendChild(ov);
  salvo={pr:R.getPixelRatio(),sz:R.getSize(new T.Vector2()),asp:CAM.aspect};
  if(!gravar){R.setPixelRatio(1);R.setSize(1080,1920,false);CAM.aspect=9/16;CAM.updateProjectionMatrix();}}
 function fechaTela(){if(ov){ov.remove();ov=null;}
  if(salvo){R.setPixelRatio(salvo.pr);R.setSize(salvo.sz.x,salvo.sz.y,false);CAM.aspect=salvo.asp;CAM.updateProjectionMatrix();salvo=null;}
  try{window.dispatchEvent(new Event('resize'));}catch(e){}o.restaurar&&o.restaurar();}
 /* ---------- gravação ---------- */
 var rec=null,pedacos=[];
 function iniciaGravacao(){
  if(!VC.captureStream||!window.MediaRecorder){aviso('Este navegador não grava vídeo. Use o Chrome ou o Edge no computador.');return;}
  var tipos=['video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm'],tp='';for(var i=0;i<tipos.length;i++){if(MediaRecorder.isTypeSupported(tipos[i])){tp=tipos[i];break;}}
  pedacos=[];try{rec=new MediaRecorder(VC.captureStream(30),tp?{mimeType:tp,videoBitsPerSecond:12e6}:{videoBitsPerSecond:12e6});}catch(e){aviso('Não foi possível iniciar a gravação.');rec=null;return;}
  rec.ondataavailable=function(e){if(e.data&&e.data.size)pedacos.push(e.data);};
  rec.start(250);}
 function pararGravacao(cancelado){var r=rec;rec=null;
  if(!r||r.state==='inactive'){fechaTela();return;}
  r.onstop=function(){fechaTela();if(cancelado){aviso('Gravação cancelada.');return;}
   var ext=(r.mimeType||'').indexOf('mp4')>=0?'mp4':'webm',b=new Blob(pedacos,{type:r.mimeType||'video/webm'}),u=URL.createObjectURL(b),nm=(o.arquivo||'video-3d')+'.'+ext;
   var a=document.createElement('a');a.href=u;a.download=nm;document.body.appendChild(a);a.click();a.remove();
   aviso('Vídeo pronto: <b>'+nm+'</b> (1080×1920). Se o download não começou, <a href="'+u+'" download="'+nm+'" style="color:#5fdcff">clique aqui</a>.'+(ext==='webm'?'<br>O Instagram aceita melhor MP4: no Chrome atualizado o arquivo já sai em MP4.':''),16000);};
  r.stop();}
 function aviso(h,ms){var a=el('div','fcrx-ov','<div class="fcrx-cd"><b>Vídeo Reels</b><p>'+h+'</p><div class="r"><button class="fcrx-b s" type="button">Ok</button></div></div>');a.style.background='rgba(5,8,11,.6)';a.querySelector('button').onclick=function(){a.remove();};document.body.appendChild(a);setTimeout(function(){a.remove();},ms||6000);}
 function pergunta(){var a=el('div','fcrx-ov','<div class="fcrx-cd"><b>🎬 Vídeo para Reels</b><p>Roteiro automático de cerca de '+Math.round(((o.roteiro&&o.roteiro(api))||[]).reduce(function(s,c){return s+c.d;},0))+' segundos usando os comandos desta tela, com legenda e marca, em pé (1080×1920).</p><div class="r"><button class="fcrx-b p" data-a="g" type="button">● Gravar</button><button class="fcrx-b s" data-a="v" type="button">▶ Só ver</button><button class="fcrx-b" data-a="x" type="button">Cancelar</button></div><p style="font-size:12px">Melhor no computador, com o Chrome. O arquivo baixa sozinho no final.</p></div>');
  a.style.background='rgba(5,8,11,.6)';a.onclick=function(e){var b=e.target.closest('[data-a]');if(!b&&e.target!==a)return;a.remove();if(!b)return;if(b.dataset.a==='g')iniciaTour(true);if(b.dataset.a==='v')iniciaTour(false);};document.body.appendChild(a);}
 /* ---------- botões ---------- */
 var bar=o.barra||null,btR=null,btV=null,cls=o.cls||'fcrx-b';
 if(!bar&&o.flutuar){bar=el('div','fcrx-bar fcrx-flt');var p=o.flutuar;if(getComputedStyle(p).position==='static')p.style.position='relative';p.appendChild(bar);if(o.pos)Object.assign(bar.style,o.pos);cls='fcrx-b';}
 if(bar){if(!o.semRaioX){btR=el('button',cls,'🩻 Raio-X');btR.type='button';btR.title='Ver a esquadria por dentro: perfis transparentes e componentes em destaque';btR.onclick=function(){api.raiox(!st.rx);};}
  btV=el('button',cls,'🎬 Vídeo Reels');btV.type='button';btV.title='Gerar um vídeo em pé para Instagram e WhatsApp';btV.onclick=pergunta;
  if(o.antes){bar.insertBefore(btV,o.antes);if(btR)bar.insertBefore(btR,btV);}else{if(btR)bar.appendChild(btR);bar.appendChild(btV);}}
 api.gravar=function(){iniciaTour(true);};api.ver=function(){iniciaTour(false);};api.estado=st;
 return api;}
window.FCRaioX={init:init};
})();
