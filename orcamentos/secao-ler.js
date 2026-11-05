/* FC Consultoria em Esquadria · Obra em 3D · seção real do perfil a partir do desenho do Orientativo
   Recebe a imagem recortada do desenho (ImageData) e o peso por metro do perfil (kg/m, da própria lista de corte).
   Tira só o formato do perfil: as paredes grossas ficam, cotas, setas, textos (código, peso) saem.
   Escala: área da seção = kg/m ÷ 2,7 g/cm³ (alumínio), então mm por pixel = √(área real ÷ área em pixels).
   Devolve {f:[{c:[[x,y]…], h:[[[x,y]…]…]}], w, h} em milímetros, centrado em (0,0), y para cima.
   © FC Consultoria em Esquadria (FC Desenvolvimento de Projetos de Compra e Venda LTDA · CNPJ 52.985.682/0001-32)
   Criação e desenvolvimento: FC Consultoria em Esquadria · uso exclusivo · proibida a cópia ou reprodução */
(function(root){
"use strict";
function cinza(img){const {data,width:W,height:H}=img,g=new Uint8Array(W*H);
 for(let i=0,j=0;i<W*H;i++,j+=4){const a=data[j+3]/255;g[i]=Math.round((data[j]*.299+data[j+1]*.587+data[j+2]*.114)*a+255*(1-a))}return g}
/* erosão/dilatação com quadrado 3×3, r vezes */
function morf(m,W,H,r,dil){let a=m;for(let k=0;k<r;k++){const b=new Uint8Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let v=dil?0:1;
   for(let dy=-1;dy<=1&&(dil?!v:v);dy++){const yy=y+dy;for(let dx=-1;dx<=1;dx++){const xx=x+dx;
     const p=(yy<0||yy>=H||xx<0||xx>=W)?0:a[yy*W+xx];if(dil){if(p){v=1;break}}else if(!p){v=0;break}}}
   b[y*W+x]=v}a=b}return a}
function componentes(m,W,H){const lab=new Int32Array(W*H),cs=[];let n=0;const st=[];
 for(let i=0;i<W*H;i++){if(!m[i]||lab[i])continue;n++;let area=0,x0=W,x1=0,y0=H,y1=0;st.push(i);lab[i]=n;
  while(st.length){const p=st.pop(),x=p%W,y=(p/W)|0;area++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const q=yy*W+xx;if(m[q]&&!lab[q]){lab[q]=n;st.push(q)}}}
  cs.push({id:n,area,x0,x1,y0,y1})}
 return {lab,cs}}
/* contornos pelas bordas dos pixels: laços fechados, perfil sempre do mesmo lado */
function contornos(m,W,H){const V=W+1,out=new Map();const add=(a,b,dir)=>{let l=out.get(a);if(!l){l=[];out.set(a,l)}l.push({b,dir,u:false})};
 const f=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m[y*W+x];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!m[y*W+x])continue;
  if(!f(x,y-1))add(y*V+x,y*V+x+1,0);if(!f(x+1,y))add(y*V+x+1,(y+1)*V+x+1,1);
  if(!f(x,y+1))add((y+1)*V+x+1,(y+1)*V+x,2);if(!f(x-1,y))add((y+1)*V+x,y*V+x,3)}
 const laços=[];
 out.forEach((l,a0)=>l.forEach(e0=>{if(e0.u)return;const pts=[];let a=a0,e=e0;
  while(e&&!e.u){e.u=true;pts.push([a%V,(a/V)|0]);a=e.b;const nx=out.get(a)||[];const d=e.dir;
   /* na quina em diagonal, vira para o mesmo lado sempre (direita, reto, esquerda) */
   e=[(d+1)%4,d,(d+3)%4].map(dd=>nx.find(q=>!q.u&&q.dir===dd)).find(Boolean)}
  if(pts.length>=4)laços.push(pts)}));
 return laços}
function areaPol(p){let s=0;for(let i=0,j=p.length-1;i<p.length;j=i++)s+=(p[j][0]+p[i][0])*(p[j][1]-p[i][1]);return s/2}
function rdp(p,eps){if(p.length<4)return p;const d=(q,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;return Math.abs(dy*q[0]-dx*q[1]+b[0]*a[1]-b[1]*a[0])/L};
 /* laço fechado: divide no ponto mais distante do primeiro e fecha de volta no primeiro */
 let far=0,fd=0;p.forEach((q,i)=>{const v=Math.hypot(q[0]-p[0][0],q[1]-p[0][1]);if(v>fd){fd=v;far=i}});
 const q=p.concat([p[0]]);const R=(a,b)=>{let mx=0,k=-1;for(let i=a+1;i<b;i++){const v=d(q[i],q[a],q[b]);if(v>mx){mx=v;k=i}}return mx>eps?R(a,k).slice(0,-1).concat(R(k,b)):[q[a],q[b]]};
 return R(0,far).slice(0,-1).concat(R(far,q.length-1)).slice(0,-1)}
function dentro(pt,pol){let c=false;for(let i=0,j=pol.length-1;i<pol.length;j=i++){const a=pol[i],b=pol[j];
 if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])c=!c}return c}

function extrair(img,kgm,opt){opt=opt||{};const W=img.width,H=img.height,g=cinza(img);
 const esc=opt.limiar||95,r=opt.raio||2;
 let m=new Uint8Array(W*H);for(let i=0;i<W*H;i++)m[i]=g[i]<esc?1:0;
 m=morf(morf(m,W,H,r,false),W,H,r,true);                 /* abertura: some cota e texto fino */
 const {lab,cs}=componentes(m,W,H);if(!cs.length)return null;
 const big=Math.max(...cs.map(c=>c.area)),lim=.12*Math.max(W,H);
 const L=c=>Math.max(c.x1-c.x0,c.y1-c.y0)+1,mc=cs.find(c=>c.area===big),esp=mc.area/L(mc);
 /* 05/11/2026 · linha de cota e seta: parte comprida e fina (área ÷ comprimento bem menor que a do perfil) sai */
 const keep=new Set(cs.filter(c=>c.area>=big*.06&&L(c)>=lim&&c.area/L(c)>=esp*.35).map(c=>c.id));
 let k=new Uint8Array(W*H);for(let i=0;i<W*H;i++)k[i]=keep.has(lab[i])?1:0;
 k=morf(morf(k,W,H,r,true),W,H,r,false);                 /* fechamento: junta partes separadas por pouco */
 let area=0,x0=W,x1=0,y0=H,y1=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(k[y*W+x]){area++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 if(area<50)return null;
 const mmpx=kgm>0?Math.sqrt(kgm/.0027/area):(opt.mmpx||.1);
 const cx=(x0+x1+1)/2,cy=(y0+y1+1)/2,cv=p=>[+((p[0]-cx)*mmpx).toFixed(2),+(-(p[1]-cy)*mmpx).toFixed(2)];
 const ls=contornos(k,W,H).map(p=>rdp(p,opt.eps||1.1)).filter(p=>p.length>=3).map(p=>({p,a:areaPol(p)}));
 if(!ls.length)return null;
 const maior=ls.reduce((a,b)=>Math.abs(b.a)>Math.abs(a.a)?b:a),sg=Math.sign(maior.a);
 const ext=ls.filter(l=>Math.sign(l.a)===sg&&Math.abs(l.a)>area*.004),fur=ls.filter(l=>Math.sign(l.a)!==sg&&Math.abs(l.a)>area*.004);
 const f=ext.sort((a,b)=>Math.abs(b.a)-Math.abs(a.a)).map(e=>({e,h:[]}));
 fur.forEach(h=>{const dono=f.filter(o=>dentro(h.p[0],o.e.p)).sort((a,b)=>Math.abs(a.e.a)-Math.abs(b.e.a))[0];if(dono)dono.h.push(h.p)});
 return {f:f.map(o=>({c:o.e.p.map(cv),h:o.h.map(h=>h.map(cv))})),w:+((x1-x0+1)*mmpx).toFixed(1),h:+((y1-y0+1)*mmpx).toFixed(1)};
}
const API={extrair};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.SECAO=API;
})(typeof window!=="undefined"?window:globalThis);
