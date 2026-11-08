/* Girar / espelhar desenhos — Onde comprar
   Coloca botões ↻ (girar 90°) e ⇋ (espelhar) em cada miniatura com desenho
   ([data-zoom] com <img>) e na tela ampliada (#zm). O giro fica guardado por
   desenho durante a sessão: girou na miniatura, abre ampliado já girado (e vice-versa). */
(function(){
  const EST=new Map(); // src -> {r:0..3, e:bool}
  const get=k=>EST.get(k)||{r:0,e:false};
  const css=`[data-zoom]{position:relative}
.gr-bx{position:absolute;top:3px;right:3px;display:flex;gap:3px;z-index:2}
.gr-b{width:26px;height:26px;border:1px solid #c4ccd2;border-radius:7px;background:rgba(255,255,255,.92);color:#0f6b70;font:700 15px/1 system-ui,sans-serif;cursor:pointer;display:grid;place-items:center;padding:0}
.gr-b:hover{background:#0f6b70;color:#fff;border-color:#0f6b70}
.gr-b.on{background:#0f6b70;color:#fff;border-color:#0f6b70}
.zm .gr-zt{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.zm .gr-zt button{align-self:auto}
.zm .gr-zt .gr-sp{flex:1}
[data-zoom] img,#zmI{transition:transform .18s ease}
@media print{.gr-bx,.gr-zt .gr-g{display:none!important}}`;
  const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);

  // aplica giro/espelho mantendo o desenho inteiro dentro da área
  function aplica(img,maxW,maxH){
    const k=img.getAttribute('src')||'';const st=get(k);const imp=st.r%2===1;
    img.style.transform=(st.r||st.e)?`rotate(${st.r*90}deg)${st.e?' scaleX(-1)':''}`:'';
    if(imp){img.style.maxWidth=maxH;img.style.maxHeight=maxW;}else{img.style.maxWidth='';img.style.maxHeight='';}
    img.style.margin='';
    if(imp&&img.complete&&img.naturalWidth){const w=img.offsetWidth,h=img.offsetHeight,d=(w-h)/2;img.style.margin=`${d}px ${-d}px`;}
  }
  const caixa=el=>{const cs=getComputedStyle(el);return[(el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-4)+'px',(el.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-4)+'px'];};
  function aplicaMini(box){const img=box.querySelector(':scope > img');if(!img)return;const [w,h]=caixa(box);aplica(img,w,h);
    const st=get(img.getAttribute('src')||'');const b=box.querySelector('.gr-b[data-gre]');if(b)b.classList.toggle('on',st.e);}
  const zmI=()=>document.getElementById('zmI');
  function aplicaZoom(){const i=zmI();if(!i)return;aplica(i,'calc(min(1000px, 96vw) - 28px)','78vh');
    const st=get(i.getAttribute('src')||'');const b=document.querySelector('.gr-zt [data-gre]');if(b)b.classList.toggle('on',st.e);}
  function todosDe(k){document.querySelectorAll('[data-zoom]').forEach(b=>{const i=b.querySelector(':scope > img');if(i&&i.getAttribute('src')===k)aplicaMini(b);});if(zmI()&&zmI().getAttribute('src')===k)aplicaZoom();}
  function muda(k,acao){if(!k)return;const st={...get(k)};
    if(acao==='d')st.r=(st.r+1)%4;else if(acao==='a')st.r=(st.r+3)%4;else if(acao==='e')st.e=!st.e;else{st.r=0;st.e=false;}
    if(!st.r&&!st.e)EST.delete(k);else EST.set(k,st);todosDe(k);}

  // botões nas miniaturas
  function prepara(box){if(box.dataset.grOk)return;const img=box.querySelector(':scope > img');if(!img)return;box.dataset.grOk='1';
    const bx=document.createElement('span');bx.className='gr-bx';
    bx.innerHTML='<button type="button" class="gr-b" data-grd title="Girar 90°" aria-label="Girar desenho">↻</button><button type="button" class="gr-b" data-gre title="Espelhar" aria-label="Espelhar desenho">⇋</button>';
    box.appendChild(bx);img.addEventListener('load',()=>aplicaMini(box));aplicaMini(box);}
  const varre=()=>document.querySelectorAll('[data-zoom]').forEach(prepara);

  // barra na tela ampliada
  function preparaZoom(){const z=document.getElementById('zm');if(!z||z.dataset.grOk)return;const x=document.getElementById('zmX');if(!x)return;z.dataset.grOk='1';
    const bar=document.createElement('span');bar.className='gr-zt';
    bar.innerHTML='<button type="button" class="gr-g" data-gra title="Girar para a esquerda">↺ Girar</button><button type="button" class="gr-g" data-grd2 title="Girar para a direita">↻ Girar</button><button type="button" class="gr-g" data-gre title="Espelhar">⇋ Espelhar</button><button type="button" class="gr-g" data-grz title="Voltar ao original">Original</button><span class="gr-sp"></span>';
    x.parentNode.insertBefore(bar,x);bar.appendChild(x);
    const i=zmI();i.addEventListener('load',aplicaZoom);
    new MutationObserver(aplicaZoom).observe(i,{attributes:true,attributeFilter:['src']});}

  // cliques (captura: não deixa abrir o ampliado ao clicar no botão)
  document.addEventListener('click',ev=>{const b=ev.target.closest('.gr-b,.gr-g');if(!b)return;ev.stopPropagation();ev.preventDefault();
    const naZoom=!!b.closest('.gr-zt');let k;
    if(naZoom)k=zmI().getAttribute('src');else{const box=b.closest('[data-zoom]');const i=box&&box.querySelector(':scope > img');k=i&&i.getAttribute('src');}
    const a=b.hasAttribute('data-gra')?'a':(b.hasAttribute('data-grd')||b.hasAttribute('data-grd2'))?'d':b.hasAttribute('data-gre')?'e':'z';
    muda(k,a);},true);

  // teclado na tela ampliada: ← → girar, E espelhar
  document.addEventListener('keydown',ev=>{const z=document.getElementById('zm');if(!z||z.hidden)return;if(/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))return;
    const k=zmI().getAttribute('src');if(ev.key==='ArrowRight')muda(k,'d');else if(ev.key==='ArrowLeft')muda(k,'a');else if(ev.key==='e'||ev.key==='E')muda(k,'e');else if(ev.key==='Escape')z.hidden=true;else return;ev.preventDefault();});

  function ini(){preparaZoom();varre();let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(varre,60);}).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ini);else ini();
})();
