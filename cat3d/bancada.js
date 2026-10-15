/* Bancada de montagem 2D · FC Consultoria */
(function(){
const R=document.getElementById('banc');if(!R)return;
const NS='http://www.w3.org/2000/svg',CORES=['#c9d2d8','#b9c9d6','#d5cdbf','#c3d6c8','#d6c3cf','#c8c4dc'];
const ex=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
let B=null,P=[],sel=null,seq=0,vb={x:-120,y:-70,w:240,h:140},ima=true;
const ev=(e,r)=>{try{if(typeof hit==='function')hit(e,r||'');}catch(_){}};
R.innerHTML=`<div class="bk-top"><div><b>🧩 Bancada de montagem</b><span class="bk-sub">Adicione os perfis e monte o encaixe em 2D, tudo com o mouse ou o dedo.</span></div><span class="bk-btns"><button type="button" class="bk-fs">⛶ Tela cheia</button><button type="button" class="bk-hide">▴ Ocultar bancada</button></span></div><div class="bk-body">
<div class="bk-aviso">⚠ <b>Ferramenta demonstrativa:</b> serve para mostrar como os perfis se encaixam e a função de cada um. Não use para medir: confira sempre as medidas no catálogo do fabricante.</div><form class="bk-add"><input class="bk-in" list="bkL" placeholder="Código do perfil (ex.: LG-021)" autocomplete="off" aria-label="Código do perfil"><datalist id="bkL"></datalist><button type="submit">＋ Adicionar</button><span class="bk-msg" role="status"></span></form>
<div class="bk-cv"><svg class="bk-svg" xmlns="${NS}"><defs><pattern id="bkG5" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M5 0H0V5" fill="none" stroke="#e6ecef" stroke-width=".15"/></pattern><pattern id="bkG" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="url(#bkG5)"/><path d="M50 0H0V50" fill="none" stroke="#cfdbe1" stroke-width=".3"/></pattern></defs><rect class="bk-grid" x="-5000" y="-5000" width="10000" height="10000" fill="url(#bkG)"/><g class="bk-ps"></g><g class="bk-lb"></g><g class="bk-hd"></g></svg>
<div class="bk-vazio">Digite um código acima e toque em <b>＋ Adicionar</b>.<br>Arraste as peças, gire e encaixe. O 🧲 ímã gruda uma na outra.</div>
<div class="bk-zoom"><button type="button" data-z="1" aria-label="Aproximar">＋</button><button type="button" data-z="-1" aria-label="Afastar">－</button><button type="button" data-z="0" aria-label="Enquadrar tudo">⤢</button></div><div class="bk-esc"></div></div>
<div class="bk-bar" hidden><b class="bk-sc"></b><button type="button" data-a="l" title="Girar 90° à esquerda">⟲ 90°</button><button type="button" data-a="r" title="Girar 90° à direita">⟳ 90°</button><label class="bk-ang">Ângulo <input type="range" min="-180" max="180" step="1"><span></span></label><button type="button" data-a="fx" title="Espelhar na horizontal">⇋ Espelhar</button><button type="button" data-a="fy" title="Virar de cabeça para baixo">⇵ Virar</button><button type="button" data-a="up" title="Trazer para frente">⬆ Frente</button><button type="button" data-a="dn" title="Levar para trás">⬇ Trás</button><button type="button" data-a="dup">⧉ Duplicar</button><label class="bk-escala">Tamanho <input type="range" min="0.2" max="5" step="0.05"><span></span></label><button type="button" data-a="del" class="bk-del">🗑 Apagar</button></div>
<div class="bk-foot"><label><input type="checkbox" class="bk-ima" checked> 🧲 Ímã</label><span class="note">🖱 Arraste a peça para mover · ● laranja gira · ■ muda o tamanho · duplo clique espelha · roda do mouse aproxima</span><span style="margin-left:auto"></span><button type="button" class="bk-png">⬇ Baixar imagem</button><button type="button" class="bk-clr">Limpar</button></div></div>`;
const svg=R.querySelector('.bk-svg'),HD=R.querySelector('.bk-hd'),G=R.querySelector('.bk-ps'),LB=R.querySelector('.bk-lb'),bar=R.querySelector('.bk-bar'),msg=R.querySelector('.bk-msg'),cv=R.querySelector('.bk-cv');
const setVB=()=>{const r=cv.getBoundingClientRect(),asp=(r.width||600)/(r.height||400);vb.h=vb.w/asp;svg.setAttribute('viewBox',`${vb.x} ${vb.y} ${vb.w} ${vb.h}`);svg.style.setProperty('--fz',(vb.w/70).toFixed(2)+'px');R.querySelector('.bk-esc').textContent=`${Math.round(vb.w)} mm de largura na tela`;drawLabels();};
new ResizeObserver(()=>setVB()).observe(cv);
/* dados */
fetch(window.BANC_URL||'banc.json').then(r=>r.json()).then(j=>{B=j;const L=R.querySelector('#bkL');L.innerHTML=Object.keys(B).sort().map(c=>`<option value="${ex(c)}">${ex(B[c].n||'')}</option>`).join('');}).catch(()=>{msg.textContent='Não foi possível carregar os desenhos.';});
const pts=c=>{const d=B[c];if(d._p)return d._p;const n=d.d.match(/-?\d+(\.\d+)?/g).map(Number),a=[];for(let i=0;i<n.length;i+=2)a.push([n[i],n[i+1]]);const st=Math.max(1,Math.floor(a.length/260));d._p=a.filter((_,i)=>i%st===0);return d._p;};
const T=(p,x,y)=>{const s=p.s||1,r=p.a*Math.PI/180,X=x*p.fx*s,Y=y*p.fy*s;return [p.x+X*Math.cos(r)-Y*Math.sin(r),p.y+X*Math.sin(r)+Y*Math.cos(r)];};
const tr=p=>`translate(${p.x.toFixed(3)} ${p.y.toFixed(3)}) rotate(${p.a.toFixed(2)}) scale(${(p.fx*(p.s||1)).toFixed(3)} ${(p.fy*(p.s||1)).toFixed(3)})`;
function draw(){G.innerHTML='';P.forEach(p=>{const g=document.createElementNS(NS,'g');g.setAttribute('transform',tr(p));g.dataset.id=p.id;g.classList.add('bk-p');if(sel===p)g.classList.add('on');
  const pa=document.createElementNS(NS,'path');pa.setAttribute('d',B[p.c].d);pa.setAttribute('fill',p.col);pa.setAttribute('fill-rule','evenodd');g.appendChild(pa);const hz=document.createElementNS(NS,'path');hz.setAttribute('d',B[p.c].d);hz.setAttribute('class','bk-hit');g.appendChild(hz);G.appendChild(g);});
  R.querySelector('.bk-vazio').hidden=P.length>0;drawLabels();syncBar();}
function handles(){HD.innerHTML='';if(!sel)return;const b=bb([sel]),r=vb.w/95,m=r*.8,x0=b[0]-m,y0=b[1]-m,x1=b[2]+m,y1=b[3]+m,cx=sel.x;
  HD.innerHTML=`<rect x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" class="bk-sel"/><line x1="${cx}" y1="${y0}" x2="${cx}" y2="${y0-r*3}" class="bk-sel"/><circle cx="${cx}" cy="${y0-r*3}" r="${r}" class="bk-rot" data-h="rot"/><rect x="${x1-r}" y="${y1-r}" width="${r*2}" height="${r*2}" class="bk-sca" data-h="sc"/>`;}
function drawLabels(){if(!LB)return;LB.innerHTML='';handles();P.forEach(p=>{const b=bb([p]);const t=document.createElementNS(NS,'text');t.setAttribute('x',(b[0]+b[2])/2);t.setAttribute('y',b[1]-vb.w/120);t.setAttribute('text-anchor','middle');t.classList.add('bk-t');if(sel===p)t.classList.add('on');t.textContent=p.c;LB.appendChild(t);});}
function bb(L){let a=1e9,b=1e9,c=-1e9,d=-1e9;L.forEach(p=>pts(p.c).forEach(([x,y])=>{const [X,Y]=T(p,x,y);a=Math.min(a,X);b=Math.min(b,Y);c=Math.max(c,X);d=Math.max(d,Y);}));return [a,b,c,d];}
function fit(){if(!P.length){vb={x:-120,y:-70,w:240,h:140};setVB();return;}const [a,b,c,d]=bb(P),r=cv.getBoundingClientRect(),asp=(r.width||600)/(r.height||400),m=Math.max(c-a,d-b)*.25+15;let w=Math.max(c-a+m*2,(d-b+m*2)*asp,60);vb.w=w;vb.h=w/asp;vb.x=(a+c)/2-w/2;vb.y=(b+d)/2-vb.h/2;setVB();}
function add(c){c=String(c||'').trim().toUpperCase().replace(/\s+/g,'');if(!B){msg.textContent='Carregando…';return;}
  const k=Object.keys(B).find(x=>x.replace(/\W/g,'')===c.replace(/\W/g,''));if(!k){msg.textContent='Código não encontrado.';return;}
  if(window.BANC_OK&&!BANC_OK(k))return;
  const d=B[k],n=P.length;let x0=vb.x+vb.w/2,y0=vb.y+vb.h/2;if(n){const q=bb(P);x0=q[2]+d.w/2+12;y0=(q[1]+q[3])/2;}const p={id:++seq,c:k,x:x0,y:y0,a:0,fx:1,fy:1,s:1,col:CORES[n%CORES.length]};
  P.push(p);sel=p;msg.textContent='';draw();fit();ev('banc_add',k);}
R.querySelector('.bk-add').onsubmit=e=>{e.preventDefault();const i=R.querySelector('.bk-in');add(i.value);i.value='';};
/* barra */
function syncBar(){bar.hidden=!sel;if(!sel)return;bar.querySelector('.bk-sc').textContent=sel.c;const ra=bar.querySelector('.bk-ang input');ra.value=Math.round(((sel.a+180)%360+360)%360-180);bar.querySelector('.bk-ang span').textContent=ra.value+'°';
  const es=bar.querySelector('.bk-escala');es.querySelector('input').value=sel.s||1;es.querySelector('span').textContent=Math.round((sel.s||1)*100)+'%';}
bar.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||!sel)return;const a=b.dataset.a;
  if(a==='l')sel.a-=90;if(a==='r')sel.a+=90;if(a==='fx')sel.fx*=-1;if(a==='fy')sel.fy*=-1;
  if(a==='up'){P=P.filter(x=>x!==sel);P.push(sel);}if(a==='dn'){P=P.filter(x=>x!==sel);P.unshift(sel);}
  if(a==='dup'){const q=Object.assign({},sel,{id:++seq,x:sel.x+8,y:sel.y+8});P.push(q);sel=q;}
  if(a==='del'){P=P.filter(x=>x!==sel);sel=null;}draw();});
bar.querySelector('.bk-ang input').oninput=e=>{if(!sel)return;sel.a=+e.target.value;draw();};
bar.querySelector('.bk-escala input').oninput=e=>{if(!sel)return;sel.s=+e.target.value;draw();};
R.querySelector('.bk-ima').onchange=e=>{ima=e.target.checked;};
R.querySelector('.bk-clr').onclick=()=>{if(P.length&&!confirm('Limpar a bancada?'))return;P=[];sel=null;draw();fit();};
R.querySelector('.bk-zoom').onclick=e=>{const b=e.target.closest('[data-z]');if(!b)return;const z=+b.dataset.z;if(!z)return fit();zoomAt(vb.x+vb.w/2,vb.y+vb.h/2,z>0?.8:1.25);};
function zoomAt(cx,cy,f){const w=Math.max(15,Math.min(3000,vb.w*f));f=w/vb.w;vb.x=cx-(cx-vb.x)*f;vb.y=cy-(cy-vb.y)*f;vb.w=w;setVB();}
/* arrastar */
const toW=e=>{const m=svg.getScreenCTM().inverse(),q=svg.createSVGPoint();q.x=e.clientX;q.y=e.clientY;const r=q.matrixTransform(m);return [r.x,r.y];};
const PT=new Map();let drag=null,pin=null;
function snap(p){if(!ima||P.length<2)return;const thr=vb.w/90;let best=null;const A=pts(p.c).map(([x,y])=>T(p,x,y));
  P.forEach(q=>{if(q===p)return;const Q=pts(q.c).map(([x,y])=>T(q,x,y));A.forEach(([ax,ay])=>Q.forEach(([bx,by])=>{const d=Math.hypot(ax-bx,ay-by);if(d<thr&&(!best||d<best[0]))best=[d,bx-ax,by-ay];}));});
  if(best){p.x+=best[1];p.y+=best[2];}}
svg.addEventListener('pointerdown',e=>{svg.setPointerCapture(e.pointerId);PT.set(e.pointerId,[e.clientX,e.clientY]);
  if(PT.size===2){const v=[...PT.values()];pin={d:Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1])};drag=null;return;}
  const h=e.target.closest('[data-h]'),g=e.target.closest('.bk-p'),w=toW(e);
  if(h&&sel){const a0=Math.atan2(w[1]-sel.y,w[0]-sel.x),d0=Math.hypot(w[0]-sel.x,w[1]-sel.y);drag={k:h.dataset.h,a0,d0,ang:sel.a,s:sel.s||1};return;}
  if(g){sel=P.find(x=>x.id==g.dataset.id);drag={k:'p',w,x:sel.x,y:sel.y};draw();}else{drag={k:'v',c:[e.clientX,e.clientY],x:vb.x,y:vb.y};if(sel){sel=null;draw();}}});
svg.addEventListener('pointermove',e=>{if(!PT.has(e.pointerId))return;PT.set(e.pointerId,[e.clientX,e.clientY]);
  if(pin&&PT.size===2){const v=[...PT.values()],d=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]);const m=svg.getScreenCTM().inverse(),q=svg.createSVGPoint();q.x=(v[0][0]+v[1][0])/2;q.y=(v[0][1]+v[1][1])/2;const c=q.matrixTransform(m);zoomAt(c.x,c.y,pin.d/d);pin.d=d;return;}
  if(!drag)return;
  if(drag.k==='rot'){const w=toW(e);let a=drag.ang+(Math.atan2(w[1]-sel.y,w[0]-sel.x)-drag.a0)*180/Math.PI;const q=Math.round(a/45)*45;if(!e.shiftKey&&Math.abs(a-q)<4)a=q;sel.a=a;const g=G.querySelector(`[data-id="${sel.id}"]`);if(g)g.setAttribute('transform',tr(sel));drawLabels();syncBar();return;}
  if(drag.k==='sc'){const w=toW(e);sel.s=Math.max(.2,Math.min(5,drag.s*Math.hypot(w[0]-sel.x,w[1]-sel.y)/drag.d0));const g=G.querySelector(`[data-id="${sel.id}"]`);if(g)g.setAttribute('transform',tr(sel));drawLabels();syncBar();return;}
  if(drag.k==='p'){const w=toW(e);sel.x=drag.x+w[0]-drag.w[0];sel.y=drag.y+w[1]-drag.w[1];snap(sel);const g=G.querySelector(`[data-id="${sel.id}"]`);if(g)g.setAttribute('transform',tr(sel));drawLabels();}
  else{const r=cv.getBoundingClientRect(),k=vb.w/r.width;vb.x=drag.x-(e.clientX-drag.c[0])*k;vb.y=drag.y-(e.clientY-drag.c[1])*k;setVB();}});
const up=e=>{PT.delete(e.pointerId);if(PT.size<2)pin=null;if(!PT.size)drag=null;};
svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);
svg.addEventListener('dblclick',e=>{const g=e.target.closest('.bk-p');if(!g)return;const p=P.find(x=>x.id==g.dataset.id);if(!p)return;p.fx*=-1;sel=p;draw();});
svg.addEventListener('wheel',e=>{e.preventDefault();const w=toW(e);zoomAt(w[0],w[1],e.deltaY>0?1.12:.89);},{passive:false});
R.tabIndex=0;R.addEventListener('keydown',e=>{if(!sel||e.target.matches('input'))return;const st=e.shiftKey?5:.5;
  if(e.key==='ArrowLeft')sel.x-=st;else if(e.key==='ArrowRight')sel.x+=st;else if(e.key==='ArrowUp')sel.y-=st;else if(e.key==='ArrowDown')sel.y+=st;
  else if(e.key==='Delete'||e.key==='Backspace'){P=P.filter(x=>x!==sel);sel=null;}else if(e.key==='r'||e.key==='R')sel.a+=90;else return;e.preventDefault();draw();});
/* tela cheia */
R.querySelector('.bk-fs').onclick=()=>{const on=!R.classList.contains('bk-full');R.classList.toggle('bk-full',on);document.body.classList.toggle('bk-lock',on);R.querySelector('.bk-fs').textContent=on?'✕ Sair da tela cheia':'⛶ Tela cheia';setTimeout(fit,60);};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&R.classList.contains('bk-full'))R.querySelector('.bk-fs').click();});
/* PNG */
R.querySelector('.bk-png').onclick=()=>{if(!P.length){msg.textContent='Adicione pelo menos um perfil.';return;}
  const [a,b,c,d]=bb(P),m=Math.max(c-a,d-b)*.12+8,x=a-m,y=b-m-8,w=c-a+m*2,h=d-b+m*2+8,W=2000,H=Math.round(W*h/w)+120;
  let s=`<svg xmlns="${NS}" width="${W}" height="${H-120}" viewBox="${x} ${y} ${w} ${h}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>`;
  P.forEach(p=>{s+=`<g transform="${tr(p)}"><path d="${B[p.c].d}" fill="${p.col}" fill-rule="evenodd" stroke="#1b232a" stroke-width="${(w/900/(p.s||1)).toFixed(3)}"/></g>`;});
  P.forEach(p=>{const q=bb([p]);s+=`<text x="${(q[0]+q[2])/2}" y="${q[1]-w/120}" text-anchor="middle" font-family="Arial" font-weight="700" font-size="${(w/45).toFixed(2)}" fill="#17606b">${ex(p.c)}</text>`;});
  s+='</svg>';const img=new Image();img.onload=()=>{const cn=document.createElement('canvas');cn.width=W;cn.height=H;const x2=cn.getContext('2d');x2.fillStyle='#fff';x2.fillRect(0,0,W,H);x2.drawImage(img,0,0,W,H-120);
    x2.save();x2.globalAlpha=.07;x2.fillStyle='#17606b';x2.font='700 34px Arial';x2.rotate(-.42);for(let yy=-H;yy<H*1.6;yy+=150)for(let xx=-W;xx<W*1.4;xx+=330)x2.fillText('FC Consultoria',xx,yy);x2.restore();
    x2.fillStyle='#17606b';x2.fillRect(0,H-110,W,110);x2.fillStyle='#fff';x2.font='700 34px Arial';x2.fillText('Montagem ilustrativa · '+P.map(p=>p.c).filter((v,i,A)=>A.indexOf(v)===i).join(' + '),40,H-62);
    x2.font='24px Arial';x2.fillText('FC Consultoria em Esquadria · material de apoio técnico · confirme as medidas no catálogo do fabricante',40,H-26);
    const aa=document.createElement('a');aa.download='montagem-fc-'+P.map(p=>p.c).join('-').slice(0,60)+'.png';aa.href=cn.toDataURL('image/png');document.body.appendChild(aa);aa.click();aa.remove();ev('banc_png',P.map(p=>p.c).join('+'));};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);};
{const hb=R.querySelector('.bk-hide'),set=on=>{R.classList.toggle('bk-off',on);hb.textContent=on?'▾ Mostrar bancada de montagem':'▴ Ocultar bancada';R.querySelector('.bk-fs').hidden=on;try{localStorage.setItem('fc_bk_off',on?'1':'0');}catch(_){}if(!on)setTimeout(()=>{setVB();if(P.length)fit();},30);};
 hb.onclick=()=>set(!R.classList.contains('bk-off'));let o=false;try{o=localStorage.getItem('fc_bk_off')==='1';}catch(_){}if(o)set(true);}
window.FCBanc={add,fit,get P(){return P;}};
setVB();
})();
