/* ===== Busca por foto (só painel matriz / FC) =====
   1) lê o código escrito no print (OCR · tesseract.js)
   2) compara o formato do perfil com os desenhos do banco (índice gerado por gera.py, mesmo algoritmo)
   Uso: FCFoto.ligar({idx:'foto-ext.json', tem:codigo=>bool, ir:codigo=>void}) */
(function(){
  const G=16,TESS='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  let CFG=null,IDX=null,IMG=null,SELR=null;
  const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const css=`#fbFoto{border:1px solid #c4ccd2;background:#fff;border-radius:10px;padding:0 12px;font-weight:700;cursor:pointer;white-space:nowrap;margin-left:6px;color:#13232e}
  #fbM{position:fixed;inset:0;background:rgba(10,20,28,.6);z-index:9999;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px}
  #fbM .cx{background:#fff;color:#13232e;border-radius:14px;max-width:880px;width:100%;padding:16px 18px;font:15px/1.45 system-ui,Segoe UI,Arial,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.3)}
  #fbM h3{margin:0 0 4px;font:800 19px system-ui}#fbM .n{color:#5d6b76;font-size:13px;margin:2px 0 10px}
  #fbM .dz{border:2px dashed #9fb3bf;border-radius:12px;padding:18px;text-align:center;color:#40525e;cursor:pointer;background:#f6f9fa}
  #fbM .dz.on{background:#e7f3f4;border-color:#0f6b70}
  #fbM .pv{position:relative;display:inline-block;max-width:100%;margin-top:10px;cursor:crosshair;user-select:none}
  #fbM .pv canvas{max-width:100%;max-height:340px;display:block;border:1px solid #d6dee4;border-radius:8px}
  #fbM .sel{position:absolute;border:2px solid #ef7d00;background:rgba(239,125,0,.12);pointer-events:none}
  #fbM .bts{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
  #fbM button{border:1px solid #c4ccd2;background:#fff;border-radius:9px;padding:7px 12px;font-weight:700;cursor:pointer;color:#13232e}
  #fbM button.p{background:#0f6b70;border-color:#0f6b70;color:#fff}#fbM button:disabled{opacity:.5;cursor:wait}
  #fbM .st{font-size:13px;color:#0f4f53;margin:4px 0}
  #fbM .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-top:6px}
  #fbM .cd{border:1px solid #d6dee4;border-radius:10px;padding:6px;cursor:pointer;background:#fff;text-align:center}
  #fbM .cd:hover{border-color:#0f6b70;box-shadow:0 0 0 2px #0f6b7033}
  #fbM .cd img{width:100%;height:80px;object-fit:contain;background:#fff}
  #fbM .cd b{display:block;font-size:14px}#fbM .cd small{color:#5d6b76;font-size:11.5px}
  #fbM .cod{display:inline-block;border:2px solid #0f6b70;color:#0f4f53;border-radius:8px;padding:4px 10px;font-weight:800;margin:0 6px 6px 0;cursor:pointer;background:#e7f3f4}
  #fbM .cod.x{border-color:#c4ccd2;color:#8a979f;background:#fff;cursor:default;text-decoration:line-through}`;
  function st(){if(document.getElementById('fbCss'))return;const s=document.createElement('style');s.id='fbCss';s.textContent=css;document.head.appendChild(s);}
  function botao(){const f=document.getElementById('fb');if(!f||f.querySelector('#fbFoto'))return;
    const b=document.createElement('button');b.type='button';b.id='fbFoto';b.textContent='📷 Buscar por foto';b.title='Anexe ou cole (Ctrl+V) o print do perfil';b.onclick=abrir;f.appendChild(b);}
  /* ---------- modal ---------- */
  function abrir(){st();fechar();IMG=null;SELR=null;const m=document.createElement('div');m.id='fbM';
    m.innerHTML=`<div class="cx"><div style="display:flex;align-items:center;gap:10px"><h3 style="flex:1">📷 Buscar por foto do perfil</h3><button type="button" data-x>✕ Fechar</button></div>
     <p class="n">Anexe, arraste ou cole (Ctrl+V) o print. Se tiver muita coisa na imagem, <b>arraste o mouse em cima do perfil</b> para marcar só ele.</p>
     <div class="dz" data-dz>📎 Clique para escolher a imagem · ou arraste aqui · ou Ctrl+V<input type="file" accept="image/*" hidden></div>
     <div data-pv></div><div class="bts" data-bts hidden><button type="button" class="p" data-go>🔎 Buscar</button><button type="button" data-limpa>Tirar a marcação</button><button type="button" data-nova>Outra imagem</button></div>
     <div data-res></div></div>`;
    document.body.appendChild(m);
    const inp=m.querySelector('input[type=file]'),dz=m.querySelector('[data-dz]');
    dz.onclick=()=>inp.click();inp.onchange=()=>inp.files[0]&&carrega(inp.files[0]);
    dz.ondragover=e=>{e.preventDefault();dz.classList.add('on');};dz.ondragleave=()=>dz.classList.remove('on');
    dz.ondrop=e=>{e.preventDefault();dz.classList.remove('on');const f=e.dataTransfer.files[0];if(f)carrega(f);};
    m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-x]'))fechar();else if(e.target.closest('[data-go]'))buscar();
      else if(e.target.closest('[data-limpa]')){SELR=null;desenha();}else if(e.target.closest('[data-nova]'))inp.click();
      else{const c=e.target.closest('[data-cod]');if(c){const v=c.dataset.cod;fechar();CFG.ir(v);}}});
    document.addEventListener('paste',colar);document.addEventListener('keydown',tecla);}
  function fechar(){const m=document.getElementById('fbM');if(m)m.remove();document.removeEventListener('paste',colar);document.removeEventListener('keydown',tecla);}
  function tecla(e){if(e.key==='Escape')fechar();}
  function colar(e){const it=[...(e.clipboardData||{}).items||[]].find(x=>x.type&&x.type.startsWith('image/'));if(it){e.preventDefault();carrega(it.getAsFile());}}
  function carrega(file){const u=URL.createObjectURL(file);const im=new Image();im.onload=()=>{IMG=im;SELR=null;mostra();};im.src=u;}
  function mostra(){const m=document.getElementById('fbM');if(!m)return;m.querySelector('[data-dz]').hidden=true;m.querySelector('[data-bts]').hidden=false;
    const pv=m.querySelector('[data-pv]');pv.innerHTML='<div class="pv"><canvas></canvas><div class="sel" hidden></div></div>';
    const cv=pv.querySelector('canvas');cv.width=IMG.naturalWidth;cv.height=IMG.naturalHeight;cv.getContext('2d').drawImage(IMG,0,0);
    const box=pv.querySelector('.pv');let ini=null;
    const pt=e=>{const r=cv.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))];};
    box.onmousedown=e=>{ini=pt(e);e.preventDefault();};
    window.onmousemove=e=>{if(!ini)return;const p=pt(e);SELR=[Math.min(ini[0],p[0]),Math.min(ini[1],p[1]),Math.abs(p[0]-ini[0]),Math.abs(p[1]-ini[1])];desenha();};
    window.onmouseup=()=>{if(ini&&SELR&&(SELR[2]<.02||SELR[3]<.02))SELR=null;ini=null;desenha();};
    m.querySelector('[data-res]').innerHTML='';buscar();}
  function desenha(){const s=document.querySelector('#fbM .sel');if(!s)return;if(!SELR){s.hidden=true;return;}s.hidden=false;
    s.style.left=SELR[0]*100+'%';s.style.top=SELR[1]*100+'%';s.style.width=SELR[2]*100+'%';s.style.height=SELR[3]*100+'%';}
  function recorte(){const w=IMG.naturalWidth,h=IMG.naturalHeight;const r=SELR?[SELR[0]*w,SELR[1]*h,SELR[2]*w,SELR[3]*h]:[0,0,w,h];
    const c=document.createElement('canvas');c.width=Math.max(1,Math.round(r[2]));c.height=Math.max(1,Math.round(r[3]));
    const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(IMG,r[0],r[1],r[2],r[3],0,0,c.width,c.height);return c;}
  /* ---------- 1) OCR ---------- */
  let tessP=null;
  function tess(){if(window.Tesseract)return Promise.resolve();if(!tessP)tessP=new Promise((ok,no)=>{const s=document.createElement('script');s.src=TESS;s.onload=ok;s.onerror=()=>{tessP=null;no(new Error('ocr'));};document.head.appendChild(s);});return tessP;}
  const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  function candidatos(txt){const T=String(txt||'').toUpperCase().replace(/[—–_]/g,'-');const out=new Set();
    const re=/\b([A-Z]{1,5})\s?[-.]?\s?([0-9OISBLZ]{2,5}[A-Z]?)\b|\b(\d{2,3})\s?[-.]\s?(\d{2,4})\b|\b([A-Z]{1,4}\d{1,2}[A-Z]?)\s?-\s?(\d{2,4})\b/g;let m;
    while((m=re.exec(T))){let c;
      if(m[1]){if((m[2].match(/\d/g)||[]).length<2)continue;const d=m[2].replace(/O/g,'0').replace(/[IL]/g,'1').replace(/S/g,'5').replace(/B/g,'8').replace(/Z/g,'2');if(!/\d/.test(d))continue;c=m[1]+'-'+d;}
      else if(m[3])c=m[3]+'-'+m[4];else c=m[5]+'-'+m[6];out.add(c);}
    return [...out];}
  async function ocr(cv){await tess();const big=document.createElement('canvas');const k=Math.max(1,Math.min(3,1600/Math.max(cv.width,cv.height)));
    big.width=Math.round(cv.width*k);big.height=Math.round(cv.height*k);big.getContext('2d').drawImage(cv,0,0,big.width,big.height);
    const r=await Tesseract.recognize(big,'eng');return (r&&r.data&&r.data.text)||'';}
  /* ---------- 2) forma ---------- */
  async function indice(){if(IDX)return IDX;const r=await fetch(CFG.idx+'?v=1');IDX=await r.json();IDX.d.forEach(x=>{const v=new Uint8Array(G*G);for(let i=0;i<G*G;i++)v[i]=parseInt(x[5][i],16);x.v=v;});return IDX;}
  function desc(cv){const w=cv.width,h=cv.height,s=400/Math.max(w,h),W=Math.max(1,Math.round(w*s)),H=Math.max(1,Math.round(h*s));
    const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.fillStyle='#fff';x.fillRect(0,0,W,H);x.drawImage(cv,0,0,W,H);
    const p=x.getImageData(0,0,W,H).data;const m=new Uint8Array(W*H);for(let i=0;i<W*H;i++){const L=p[i*4]*.299+p[i*4+1]*.587+p[i*4+2]*.114;m[i]=L<128?1:0;}
    const e=new Uint8Array(W*H);for(let y=0;y<H-1;y++)for(let X=0;X<W-1;X++){const i=y*W+X;e[i]=m[i]&m[i+W]&m[i+1]&m[i+W+1];}
    let o=new Uint8Array(W*H),n=0;for(let y=0;y<H;y++)for(let X=0;X<W;X++){const i=y*W+X;const v=e[i]|(y>0?e[i-W]:0)|(X>0?e[i-1]:0)|(y>0&&X>0?e[i-W-1]:0);o[i]=v;n+=v;}
    if(n<30)o=m;o=principal(o,W,H);let x0=W,x1=-1,y0=H,y1=-1;for(let y=0;y<H;y++)for(let X=0;X<W;X++)if(o[y*W+X]){if(X<x0)x0=X;if(X>x1)x1=X;if(y<y0)y0=y;if(y>y1)y1=y;}
    if(x1<0)return null;x1++;y1++;const bw=x1-x0,bh=y1-y0,S=Math.max(bw,bh),ox=x0-(S-bw)/2,oy=y0-(S-bh)/2;const acc=new Float64Array(G*G);
    for(let y=y0;y<y1;y++)for(let X=x0;X<x1;X++)if(o[y*W+X]){const gx=Math.min(G-1,Math.floor((X-ox)*G/S)),gy=Math.min(G-1,Math.floor((y-oy)*G/S));acc[gy*G+gx]++;}
    const cell=(S/G)**2,v=new Uint8Array(G*G);for(let i=0;i<G*G;i++)v[i]=Math.min(15,Math.round(Math.min(1,acc[i]/cell)*15));return {ar:bw/bh,v};}
  function principal(o,W,H){/* só as peças grandes (o perfil): tira textos e números soltos · conectividade 8 */
    const lb=new Int32Array(W*H),sz=[0],st=new Int32Array(W*H);let n=0;
    for(let i=0;i<W*H;i++){if(!o[i]||lb[i])continue;n++;let t=0,c=0;st[t++]=i;lb[i]=n;
      while(t){const j=st[--t];c++;const y=(j/W)|0,x=j-y*W;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const yy=y+dy,xx=x+dx;if(yy<0||xx<0||yy>=H||xx>=W)continue;const k=yy*W+xx;if(o[k]&&!lb[k]){lb[k]=n;st[t++]=k;}}}sz.push(c);}
    if(n<=1)return o;const mx=Math.max(...sz),r=new Uint8Array(W*H);for(let i=0;i<W*H;i++)if(lb[i]&&sz[lb[i]]>=mx*.15)r[i]=1;return r;}
  function variantes(d){/* 8 orientações: espelhos e giros de 90° */const out=[];const at=(v,f)=>{const r=new Uint8Array(G*G);for(let y=0;y<G;y++)for(let x=0;x<G;x++){const [a,b]=f(x,y);r[y*G+x]=v[b*G+a];}return r;};
    const N=G-1,fs=[[(x,y)=>[x,y],0],[(x,y)=>[N-x,y],0],[(x,y)=>[x,N-y],0],[(x,y)=>[N-x,N-y],0],[(x,y)=>[y,x],1],[(x,y)=>[N-y,x],1],[(x,y)=>[y,N-x],1],[(x,y)=>[N-y,N-x],1]];
    fs.forEach(([f,t])=>out.push({v:at(d.v,f),ar:t?1/d.ar:d.ar}));return out;}
  function compara(d){const vs=variantes(d);const sc=IDX.d.map(x=>{let best=1e9;for(const q of vs){let s=0;for(let i=0;i<G*G;i++)s+=Math.abs(q.v[i]-x.v[i]);
      s=s/(G*G*15)+.35*Math.abs(Math.log((q.ar||1)/(x[4]||1)));if(s<best)best=s;}return [best,x];}).sort((a,b)=>a[0]-b[0]);
    const vis=new Set(),top=[];for(const [s,x] of sc){const k=norm(x[0]);if(vis.has(k)||!CFG.tem(x[0]))continue;vis.add(k);top.push([s,x]);if(top.length>=12)break;}return top;}
  /* ---------- buscar ---------- */
  async function buscar(){const m=document.getElementById('fbM');if(!m||!IMG)return;const res=m.querySelector('[data-res]'),bt=m.querySelector('[data-go]');bt.disabled=true;
    res.innerHTML='<p class="st">⏳ Lendo o texto do print e comparando o desenho… (a primeira vez demora uns segundos)</p>';const cv=recorte();
    let cods=[],txt='',errO='';try{txt=await ocr(cv);cods=candidatos(txt);}catch(_){errO='Não consegui ler o texto agora (sem internet para o leitor).';}
    const achou=cods.filter(c=>CFG.tem(c)),nao=cods.filter(c=>!CFG.tem(c));
    let h='<h3 style="font-size:16px;margin-top:6px">1) Código lido no print</h3>';
    if(achou.length)h+='<p class="n">Clique no código para ver as opções por fornecedor:</p>'+achou.map(c=>`<span class="cod" data-cod="${esc(c)}">${esc(c)} →</span>`).join('');
    else h+=`<p class="n">${errO||'Nenhum código do nosso banco foi encontrado no texto do print.'}</p>`;
    if(nao.length)h+='<p class="n" style="margin-top:4px">Lidos, mas não estão no banco: '+nao.map(c=>`<span class="cod x">${esc(c)}</span>`).join('')+'</p>';
    res.innerHTML=h+'<p class="st">⏳ Comparando o desenho…</p>';
    try{await indice();const d=desc(cv);if(!d)throw 0;const top=compara(d);
      h+=`<h3 style="font-size:16px;margin-top:12px">2) Desenhos mais parecidos</h3><p class="n">${achou.length?'Para conferir: ':''}clique no perfil certo para ver as opções. Se nenhum servir, marque só o perfil na imagem (arrastando o mouse) e clique em Buscar de novo.</p>
       <div class="gr">${top.map(([s,x],i)=>`<div class="cd" data-cod="${esc(x[0])}" title="semelhança ${Math.max(0,Math.round((1-s)*100))}%"><img loading="lazy" src="${esc(x[3])}?v=2" alt=""><b>${esc(x[0])}</b><small>${esc((CFG.forn&&CFG.forn(x[1]))||x[1])}${i===0?' · mais parecido':''}</small></div>`).join('')}</div>`;}
    catch(_){h+='<p class="n">Não consegui comparar o desenho desta imagem.</p>';}
    res.innerHTML=h;bt.disabled=false;}
  window.FCFoto={ligar(cfg){CFG=cfg;st();botao();new MutationObserver(botao).observe(document.body,{childList:true,subtree:true});},_cand:candidatos,_desc:desc};
})();
