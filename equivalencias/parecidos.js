/* Onde comprar · perfis parecidos por DESENHO e PESO.
   Quando um código só tem uma opção de compra, procura na mesma linha os perfis dos outros fornecedores
   com desenho parecido (assinatura do desenho em foto-ext.json: forma + proporção largura/altura) e peso próximo.
   A FC confirma o par (vira equiv_edit na Conversão de códigos); o cliente vê as sugestões para conferir o desenho.
   Usa as globais da página: IDX, BY, visivel, imgDe, calc, norm, esc, rs, n3, ADM, sb, tela, toast. */
(function(){
  let SIG=null,carSig=null;const G=16;
  function sigs(){if(SIG)return Promise.resolve(SIG);return carSig=carSig||fetch('foto-ext.json?v=2').then(r=>r.json()).then(j=>{const M={};
    (j.d||[]).forEach(x=>{const v=new Uint8Array(G*G);for(let i=0;i<G*G;i++)v[i]=parseInt(x[5][i],16);M[x[1]+'|'+norm(x[0])]={ar:+x[4]||0,v};});SIG=M;return M;}).catch(()=>{SIG={};return SIG;});}
  sigs();
  const vira=[(x,y)=>[x,y],(x,y)=>[G-1-x,y],(x,y)=>[x,G-1-y],(x,y)=>[G-1-x,G-1-y],(x,y)=>[y,x],(x,y)=>[G-1-y,x],(x,y)=>[y,G-1-x],(x,y)=>[G-1-y,G-1-x]];/* espelhos e giros de 90° (desenho em pé ou deitado) */
  function forma(a,b){/* 0 = igual · 1 = nada a ver (aceita espelhado) */let best=1e9;
    for(const f of vira){let s=0;for(let y=0;y<G;y++)for(let x=0;x<G;x++){const [i,j]=f(x,y);s+=Math.abs(a.v[j*G+i]-b.v[y*G+x]);}if(s<best)best=s;}return best/(G*G*15);}
  let TOL=+(localStorage.getItem('par-tol')||15);
  const fornDe=g=>new Set(g.m.filter(m=>m[0]!=='alcoa'&&(ADM||visivel(g,m))).map(m=>m[0]));
  function candidatos(g,ref){if(!SIG||!ref||!(ref.p>0))return [];const ja=fornDe(g);const sa=SIG[ref.f+'|'+norm(ref.c)];const out=[];
    IDX.g.forEach(h=>{if(h===g||h.l!==g.l)return;h.m.forEach(m=>{if(m[0]==='alcoa'||ja.has(m[0])||!(m[2]>0))return;if(!ADM&&!visivel(h,m))return;
      const dw=Math.abs(m[2]/ref.p-1);if(dw*100>TOL)return;const sb_=SIG[m[0]+'|'+norm(m[1])];let df=null,dar=null,sc;
      if(sa&&sb_){df=forma(sa,sb_);dar=sa.ar&&sb_.ar?Math.min(Math.abs(Math.log(sb_.ar/sa.ar)),Math.abs(Math.log(sb_.ar*sa.ar))):1;sc=df*2+dar*.25+dw;}else sc=dw+.35;
      out.push({h,m,dw,df,dar,sc});});});
    out.sort((a,b)=>a.sc-b.sc);const vis=new Set();return out.filter(o=>{const k=o.m[0]+'|'+norm(o.m[1]);if(vis.has(k))return false;vis.add(k);return true;}).slice(0,12);}
  function nota(o){return o.df==null?{t:'sem desenho para comparar · só peso',c:'b'}:{t:'confira o desenho',c:'m'};}
  const css=`.par{margin-top:14px;border:2px solid #b45309;background:#fffbeb;border-radius:14px;padding:14px 16px}.par h3{margin:0 0 4px;font-size:17px;color:#92400e}.par p{margin:0 0 10px;font-size:13.5px;color:#5d6b76}
.par .tl{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;font-size:13px}.par .tl button{border:1px solid #d6c08a;background:#fff;border-radius:999px;padding:4px 10px;font:600 13px inherit;cursor:pointer}.par .tl button.on{background:#92400e;color:#fff;border-color:#92400e}
.par .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}.par .it{background:#fff;border:1px solid #eadfc2;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:6px}
.par .it .th{height:90px;display:flex;align-items:center;justify-content:center;background:#fafafa;border-radius:8px;cursor:zoom-in;overflow:hidden}.par .it .th img{max-width:100%;max-height:86px;object-fit:contain}
.par .it b{font-size:15px}.par .it small{color:#5d6b76;font-size:12.5px}.par .tg{display:inline-block;border-radius:999px;padding:2px 8px;font-size:11.5px;font-weight:700}.par .tg.a{background:#dcfce7;color:#166534}.par .tg.m{background:#fef9c3;color:#854d0e}.par .tg.b{background:#f1f5f9;color:#475569}
.par .bts{display:flex;gap:6px;flex-wrap:wrap}.par .bts button{border:1px solid #0f6b70;background:#fff;color:#0f6b70;border-radius:8px;padding:5px 9px;font:600 12.5px inherit;cursor:pointer}.par .bts button.ok{background:#0f6b70;color:#fff}`;
  function st(){if(document.getElementById('parCss'))return;const s=document.createElement('style');s.id='parCss';s.textContent=css+css2;document.head.appendChild(s);}
  const card=(g,ref,o,mini)=>{const n=nota(o);const c=calc(o.h,o.m);const img=imgDe(o.h,o.m);
    return `<div class="it"><div class="th" data-zoom="${esc(img)}" data-t="${esc(IDX.forn[o.m[0]]+' '+o.m[1])}">${img?`<img src="${esc(img)}" alt="" loading="lazy" onerror="this.replaceWith(document.createTextNode('sem desenho'))">`:'<small>sem desenho</small>'}</div>
      <div><b>${esc(IDX.forn[o.m[0]]||o.m[0])} · ${esc(o.m[1])}</b><br><small>${n3(o.m[2])} kg/m · ${o.dw<.005?'mesmo peso':(o.m[2]>ref.p?'+':'−')+(o.dw*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%'}${c.sem?'':' · barra '+rs(c.vb)}</small></div>
      ${mini?'':`<span class="tg ${n.c}">${n.t}</span>`}
      <div class="bts">${mini?'':`<button type="button" data-sug="${esc(o.m[1])}">Abrir</button>`}${ADM?`<button type="button" class="ok" data-parok="${esc(g.i+'|'+o.h.l+'|'+o.h.k+'|'+o.m[0]+'|'+o.m[1])}">✔ É o mesmo perfil</button>`:''}</div></div>`;};
  const refDe=g=>{const m=g.m.find(m=>m[0]!=='alcoa')||g.m[0];return m?{f:m[0],c:m[1],p:m[2],img:imgDe(g,m)}:null;};
  const tolBts=()=>`<div class="tl">Peso até ${[5,10,15,25].map(t=>`<button type="button" data-partol="${t}" class="${TOL===t?'on':''}">±${t}%</button>`).join('')}</div>`;
  function bloco(g,ref){if(!g||g.l==='tc'||fornDe(g).size>1)return '';st();
    if(!SIG){sigs().then(()=>{if(typeof tela==='function')tela();});return `<div class="par"><h3>🔎 Procurando o mesmo perfil nos outros fornecedores…</h3></div>`;}
    const L=candidatos(g,ref);
    return `<div class="par noprint"><h3>🔎 Mesmo perfil em outros fornecedores (por desenho e peso)</h3>
      <p>Este código só tem uma opção de compra. Abaixo, os perfis da linha ${esc(IDX.linhas[g.l].n)} com peso mais próximo de ${esc(ref.c)} (${n3(ref.p)} kg/m), começando pelos de desenho mais parecido. ${ADM?'Confira o desenho e clique em <b>✔ É o mesmo perfil</b>: o par entra na Conversão de códigos e passa a aparecer na comparação de preço.':'Confira o desenho antes de comprar; a FC confirma o par.'}</p>${tolBts()}
      ${L.length?`<div class="gr">${L.map(o=>card(g,ref,o)).join('')}</div>`:`<p><b>Nenhum perfil com peso até ±${TOL}%.</b> Aumente a tolerância.</p>`}</div>`;}
  /* ===== varredura (só FC): todos os perfis com uma opção de compra ===== */
  const EXCL=new Set(['doro','sha','vg','urb','tc']);/* linhas exclusivas (CDA, Texa Urban) e tubos ficam fora */
  let VQ='cli',VL='',VN=30;let DIS={};try{DIS=JSON.parse(localStorage.getItem('par-dis')||'{}');}catch(_){}
  function doCliente(g){const A=(typeof DADOS!=='undefined'&&DADOS.abc)||{};const ks=new Set(Object.keys(A).map(norm));
    return g.m.some(m=>ks.has(norm(m[1]))||(typeof CLIV!=='undefined'&&CLIV.has(norm(m[1]))))||(window.FCCli&&FCCli.ativo&&FCCli.ativo()&&g.m.some(m=>FCCli.acha&&FCCli.acha(m[1]).length));}
  function tela_(){st();if(!SIG){sigs().then(()=>tela());return '<div class="box"><p class="vazio">Carregando os desenhos…</p></div>';}
    const todos=IDX.g.filter(g=>!EXCL.has(g.l)&&g.m.some(m=>m[0]!=='alcoa')&&fornDe(g).size<=1&&!DIS[g.l+'|'+g.k]);
    const cli=todos.filter(doCliente);let L=VQ==='cli'?cli:todos;if(VL)L=L.filter(g=>g.l===VL);
    const lin=[...new Set(todos.map(g=>g.l))];
    const linhas=L.slice(0,VN).map(g=>{const ref=refDe(g);const C=candidatos(g,ref).slice(0,4);
      return `<div class="vr"><div class="vo"><div class="th" data-zoom="${esc(ref.img)}" data-t="${esc(IDX.forn[ref.f]+' '+ref.c)}">${ref.img?`<img src="${esc(ref.img)}" alt="" loading="lazy" onerror="this.replaceWith(document.createTextNode('sem desenho'))">`:'<small>sem desenho</small>'}</div>
        <b>${esc(ref.c)}</b><small>${esc(IDX.forn[ref.f]||ref.f)} · ${esc(IDX.linhas[g.l].n)} · ${n3(ref.p)} kg/m</small>
        <div class="bts"><button type="button" data-sug="${esc(ref.c)}" data-aba2="busca">Abrir</button><button type="button" data-pardis="${esc(g.l+'|'+g.k)}">Nenhum é igual</button></div></div>
        <div class="gr">${C.length?C.map(o=>card(g,ref,o,1)).join(''):`<p><small>Nenhum perfil com peso até ±${TOL}%.</small></p>`}</div></div>`;}).join('');
    return `<section class="box par" style="background:#fff"><h1 class="t" style="margin:0">🔁 Varredura · perfis com uma só opção de compra</h1>
      <p>Para cada perfil que hoje só tem um fornecedor, o sistema mostra os perfis dos outros fornecedores da mesma linha com peso próximo, começando pelos de desenho mais parecido. Confira os desenhos e clique em <b>✔ É o mesmo perfil</b>: o par entra na Conversão de códigos e o item passa a ter comparação de preço. Linhas exclusivas (CDA, Texa Urban) e tubos ficam fora.</p>
      <div class="tl"><button type="button" data-varq="cli" class="${VQ==='cli'?'on':''}">Itens do cliente (${cli.length})</button><button type="button" data-varq="todos" class="${VQ==='todos'?'on':''}">Todos (${todos.length})</button>
        <select data-varl style="border:1px solid #d6c08a;border-radius:999px;padding:4px 10px;font:600 13px inherit"><option value="">Todas as linhas</option>${lin.map(l=>`<option value="${l}" ${VL===l?'selected':''}>${esc(IDX.linhas[l].n)}</option>`).join('')}</select></div>
      ${tolBts()}<p><b>${L.length}</b> perfis nesta lista.</p>${linhas||'<p class="vazio">Nenhum perfil com uma só opção nesta lista. 👏</p>'}
      ${L.length>VN?`<p style="text-align:center"><button type="button" class="bt p" data-varmais>Ver mais ${Math.min(30,L.length-VN)}</button></p>`:''}</section>`;}
  const css2=`.par .vr{display:grid;grid-template-columns:200px 1fr;gap:12px;border-top:1px solid #eadfc2;padding:12px 0}.par .vo{display:flex;flex-direction:column;gap:4px}.par .vo .th{height:80px;display:flex;align-items:center;justify-content:center;background:#fafafa;border-radius:8px;cursor:zoom-in;overflow:hidden}.par .vo .th img{max-width:100%;max-height:76px;object-fit:contain}.par .vo small{color:#5d6b76;font-size:12.5px}.par .vr .gr{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}.par .vr .it .th{height:64px}.par .vr .it .th img{max-height:60px}
@media(max-width:640px){.par .vr{grid-template-columns:1fr}}`;
  /* confirma o par: o código que está sozinho vai para o grupo que tem mais fornecedores */
  async function confirma(dados){const [gi,l,k2,f2,c2]=dados.split('|');const g=IDX.g[+gi],h=IDX.g.find(y=>y.l===l&&y.k===k2);if(!g||!h)return;
    const m2=h.m.find(m=>m[0]===f2&&m[1]===c2);const ref=g.m.find(m=>m[0]!=='alcoa');if(!m2||!ref)return;
    const nG=fornDe(g).size,nH=fornDe(h).size;let mov,alvo;if(nH>nG||(nH===nG&&!h.sp&&g.sp)){mov=ref;alvo=h;}else{mov=m2;alvo=g;}
    if(!confirm(`Confirmar que ${IDX.forn[ref[0]]} ${ref[1]} e ${IDX.forn[m2[0]]} ${m2[1]} são o mesmo perfil?\n\n${IDX.forn[mov[0]]} ${mov[1]} entra no grupo ${alvo.k}.`))return;
    const ed={l,f:mov[0],c:mov[1],a:alvo.k,p:mov[2],n:'alta',t:'padrao',o:'Confirmado pela FC por desenho e peso (Onde comprar).',pg:mov[5]||'—',img:/^https?:/.test(mov[4]||'')?mov[4]:'',em:new Date().toLocaleDateString('pt-BR')};
    const {error}=await sb.from('trein_eventos').insert({tipo:'equiv_edit',detalhe:ed});if(error){toast('Não gravou: '+error.message);return;}
    IDX.g.forEach(y=>{if(y.l===l&&y!==alvo)y.m=y.m.filter(m=>!(m[0]===mov[0]&&m[1]===mov[1]));});alvo.m.push([mov[0],mov[1],mov[2],'alta',ed.img,ed.pg,1]);
    BY={};IDX.g.forEach((y,i)=>{y.i=i;y.m.forEach(m=>{(BY[norm(m[1])]=BY[norm(m[1])]||[]).push(i);});if(y.mc)(BY[norm(y.k)]=BY[norm(y.k)]||[]).push(i);(y.al||[]).forEach(c=>{(BY[norm(c)]=BY[norm(c)]||[]).push(i);});});
    if(ABA==='busca')SEL=alvo;toast('✔ Par gravado na Conversão de códigos: '+mov[1]+' → '+alvo.k);tela();}
  document.addEventListener('click',e=>{const t=e.target.closest('[data-partol],[data-parok],[data-varq],[data-varmais],[data-pardis],[data-aba2]');if(!t)return;const d=t.dataset;
    if(d.partol){TOL=+d.partol;try{localStorage.setItem('par-tol',TOL);}catch(_){}tela();}
    else if(d.parok)confirma(d.parok);
    else if(d.varq){VQ=d.varq;VN=30;tela();}
    else if(d.varmais!=null){VN+=30;tela();}
    else if(d.pardis){DIS[d.pardis]=1;try{localStorage.setItem('par-dis',JSON.stringify(DIS));}catch(_){}tela();}
    else if(d.aba2){ABA=d.aba2;}});
  document.addEventListener('change',e=>{const t=e.target.closest('[data-varl]');if(!t)return;VL=t.value;VN=30;tela();});
  window.FCPar={bloco,candidatos,sigs,fornDe,tela:tela_};
})();
