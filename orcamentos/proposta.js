/* FC Consultoria em Esquadria · Modelo da proposta (painel e link do cliente)
   Um único modelo: capa com a tipologia em 3D, resumo da obra, itens em cards por local.
   Com `precos` mostra valores (proposta do painel); sem `precos` é o link do cliente (nunca leva preço).
   Usa TIP3D (tip3d.js) para as imagens e o Ver em 3D. © FC Consultoria em Esquadria · uso exclusivo */
(function(){
"use strict";
const CSS=`
.pp-sim-d{margin:0 0 16px}.pp-sim-d>summary{cursor:pointer;display:inline-flex;gap:6px;align-items:center;font:600 13px var(--txt);border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 13px;list-style:none}.pp-sim-d>summary::-webkit-details-marker{display:none}
.pp-sim{display:grid;gap:8px;margin:0 0 16px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--wash)}
.pp-sim .rw{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.pp-sim .rw>span{font-size:12.5px;color:var(--muted);min-width:96px}
.pp-sim button{display:inline-flex;gap:6px;align-items:center;font:600 12.5px var(--txt);border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:999px;padding:6px 11px;cursor:pointer;min-height:34px}
.pp-sim button[aria-pressed="true"]{border-color:var(--pc);box-shadow:0 0 0 2px var(--pc) inset}
.pp-sim button i{width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,.18);flex:none}
.pp-sim .rs{margin-left:auto}
.pp-av{padding:10px 12px;border-radius:10px;background:#fff6e5;border:1px solid #f0d49a;color:#7a4b07;font-size:13px;margin:0 0 16px}
@media print{.pp-sim,.pp-sim-d{display:none!important}}

.pp{--pc:#0d5c63;--pc-ink:#fff;--ink:#14232a;--muted:#5d6e73;--paper:#fff;--wash:#f2f5f5;--line:#dfe6e7;--amb:#c9831a;
 --disp:"Space Grotesk",system-ui,sans-serif;--txt:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;
 color:var(--ink);font:14px/1.5 var(--txt);background:var(--paper);border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(10,30,35,.06),0 12px 40px rgba(10,30,35,.08);color-scheme:light}
.pp *{box-sizing:border-box}
.pp .num{font-variant-numeric:tabular-nums}
/* capa: cor da empresa com a grade de uma esquadria ao fundo */
.pp-capa{position:relative;background:var(--pc);color:var(--pc-ink);padding:28px clamp(18px,4vw,44px) 26px;overflow:hidden}
.pp-capa:before{content:"";position:absolute;inset:0;opacity:.13;pointer-events:none;
 background:repeating-linear-gradient(90deg,transparent 0 calc(25% - 1px),#fff calc(25% - 1px) 25%),linear-gradient(transparent calc(62% - 1px),#fff calc(62% - 1px) 62%,transparent 62%)}
.pp-top{position:relative;display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}
.pp-logo{display:block;max-height:52px;max-width:200px;object-fit:contain;background:#fff;border-radius:8px;padding:5px 8px;margin-bottom:8px}
.pp-marca{font:700 22px/1.1 var(--disp);letter-spacing:.01em}.pp-marca small{display:block;font:600 10.5px var(--txt);letter-spacing:.14em;text-transform:uppercase;opacity:.8;margin-top:4px}
.pp-doc{text-align:right;font-size:12px;opacity:.92}.pp-doc b{display:block;font:700 18px var(--disp);letter-spacing:.02em}
.pp-hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:clamp(16px,3vw,36px);align-items:center;margin-top:22px}
.pp-eye{font:600 11px var(--txt);letter-spacing:.16em;text-transform:uppercase;opacity:.82}
.pp-hero h1{font:700 clamp(26px,4.2vw,44px)/1.05 var(--disp);margin:8px 0 12px;text-wrap:balance;letter-spacing:-.01em}
.pp-cli{font-size:14px;opacity:.92}.pp-cli b{font-weight:600}
.pp-fig{margin:0;display:grid;place-items:center;min-height:220px;border-radius:14px;background:radial-gradient(120% 90% at 50% 35%,rgba(255,255,255,.96),rgba(255,255,255,.78));box-shadow:0 18px 40px rgba(0,0,0,.22);padding:14px;position:relative}
.pp-fig img{max-width:100%;max-height:260px;display:block}
.pp-fig figcaption{position:absolute;left:12px;bottom:10px;font:600 11px var(--txt);color:var(--muted)}
.pp-stats{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:22px}
.pp-stat{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);border-radius:12px;padding:10px 12px;min-width:0}
.pp-stat span{display:block;font:600 10.5px var(--txt);letter-spacing:.12em;text-transform:uppercase;opacity:.8}
.pp-stat b{display:block;font:700 22px/1.2 var(--disp);margin-top:2px;overflow-wrap:anywhere}
.pp-stat b small{font:600 12px var(--txt);opacity:.85}
.pp-sw{display:inline-block;width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.7);vertical-align:-2px;margin-right:6px}
.pp-stat .acab{font:600 13px/1.3 var(--txt)}
/* corpo */
.pp-body{padding:8px clamp(18px,4vw,44px) 10px}
.pp-linhas{display:flex;gap:6px;flex-wrap:wrap;margin:18px 0 4px}
.pp-chip{font:600 11.5px var(--txt);border:1px solid var(--line);border-radius:999px;padding:3px 10px;color:var(--muted);background:var(--wash)}
.pp-loc{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin:26px 0 12px;padding-bottom:8px;border-bottom:2px solid var(--pc)}
.pp-loc h2{font:700 20px var(--disp);margin:0;color:var(--pc);letter-spacing:.01em}
.pp-loc span{font-size:12.5px;color:var(--muted)}
.pp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.pp-card{border:1px solid var(--line);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;background:#fff;break-inside:avoid}
.pp-card figure{margin:0;position:relative;height:200px;display:grid;place-items:center;background:radial-gradient(110% 90% at 50% 30%,#fdfefe,#e9efef);padding:10px}
.pp-card figure img{max-width:100%;max-height:180px;display:block}
.pp-card .ld{font-size:11px;color:var(--muted)}
.pp-badge{position:absolute;left:10px;top:10px;font:700 11px var(--txt);background:#fff;color:var(--ink);border-radius:999px;padding:3px 9px;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.pp-alt{position:absolute;right:10px;top:10px;font:700 10px var(--txt);background:#fbefd9;color:#8a5a0c;border-radius:999px;padding:3px 8px}
.pp-vr{position:absolute;right:10px;bottom:10px;font:700 12px var(--txt);border:0;background:var(--pc);color:var(--pc-ink);border-radius:999px;padding:7px 12px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.18)}
.pp-vr:focus-visible,.pp-ed:focus-visible{outline:3px solid var(--amb);outline-offset:2px}
.pp-cb{padding:12px 14px 14px;display:flex;flex-direction:column;gap:10px;flex:1}
.pp-lc{font:700 10.5px/1.3 var(--txt);letter-spacing:.08em;text-transform:uppercase;color:var(--pc);margin-bottom:3px;overflow-wrap:anywhere}
.pp-cod{font:700 19px/1.15 var(--disp);letter-spacing:.01em}
.pp-desc{font-size:12px;color:var(--muted);line-height:1.4;margin-top:2px}
.pp-specs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.pp-specs div{background:var(--wash);border-radius:8px;padding:6px 7px;min-width:0}
.pp-specs span{display:block;font:600 9.5px var(--txt);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.pp-specs b{display:block;font:700 13.5px var(--disp);overflow-wrap:anywhere}
.pp-meta{display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px;color:var(--muted);align-items:center}
.pp-meta i{display:inline-block;width:10px;height:10px;border-radius:50%;border:1px solid rgba(0,0,0,.25);margin-right:4px;vertical-align:-1px}
.pp-price{margin-top:auto;display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-top:1px dashed var(--line);padding-top:9px}
.pp-price span{font-size:11.5px;color:var(--muted)}.pp-price b{font:700 17px var(--disp)}
.pp-ed{font:600 12px var(--txt);border:1px dashed var(--pc);color:var(--pc);background:transparent;border-radius:8px;padding:6px 9px;cursor:pointer;align-self:flex-start}
.pp-edit{grid-column:1/-1}
/* fechamento */
.pp-total{margin:26px clamp(18px,4vw,44px) 0;border-radius:14px;background:var(--pc);color:var(--pc-ink);padding:18px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;break-inside:avoid}
.pp-total span{font:600 12px var(--txt);letter-spacing:.12em;text-transform:uppercase;opacity:.85}.pp-total b{font:700 clamp(24px,3.6vw,32px) var(--disp)}
.pp-total small{display:block;font:500 12px var(--txt);opacity:.85;letter-spacing:0;text-transform:none;margin-top:2px}
.pp-cond{margin:14px clamp(18px,4vw,44px) 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;break-inside:avoid}
.pp-cond div{border:1px solid var(--line);border-radius:12px;padding:10px 12px}.pp-cond span{display:block;font:600 10.5px var(--txt);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}.pp-cond b{font-weight:600}
.pp-foot{padding:18px clamp(18px,4vw,44px) 22px;display:grid;gap:6px;font-size:11.5px;color:var(--muted)}
.pp-foot .wm{font:600 10.5px var(--txt);letter-spacing:.12em;text-transform:uppercase;text-align:center;border-top:1px solid var(--line);padding-top:12px;margin-top:6px}
@media (max-width:720px){.pp-hero{grid-template-columns:minmax(0,1fr)}.pp-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.pp-doc{text-align:left}}
@media (max-width:380px){.pp-specs{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media print{
 @page{size:A4;margin:12mm 11mm 14mm;@bottom-right{content:"Página " counter(page) " de " counter(pages);font:8.5pt Inter,sans-serif;color:#7a8a8e}}
 @page :first{margin:0;@bottom-right{content:none}}
 html,body{margin:0!important;padding:0!important;background:#fff!important}
 .pp{border-radius:0;box-shadow:none}
 .pp *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
 .pp-capa{height:296mm;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:16mm 14mm 14mm;break-after:page}
 .pp-hero{grid-template-columns:minmax(0,1fr);margin-top:0}.pp-hero h1{font-size:34pt}
 .pp-fig{min-height:100mm}.pp-fig img{max-height:92mm}
 .pp-body,.pp-foot{padding-left:0;padding-right:0}.pp-total,.pp-cond{margin-left:0;margin-right:0}
 .pp-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:3mm}
 .pp-card{font-size:9.5px;border-radius:3mm}.pp-card figure{height:27mm;padding:1.2mm}.pp-card figure img{max-height:25mm}
 .pp-cb{padding:2mm 2.4mm 2.4mm;gap:1.5mm}.pp-lc{font-size:7.5px;margin-bottom:.6mm}.pp-cod{font-size:11.5px}.pp-desc{font-size:8px;line-height:1.3}
 .pp-specs{gap:1mm}.pp-specs div{padding:.8mm 1.1mm;border-radius:1.5mm}.pp-specs span{font-size:6.5px;letter-spacing:.04em}.pp-specs b{font-size:10px}
 .pp-meta{font-size:8px;gap:2mm}.pp-meta i{width:7px;height:7px}.pp-price{padding-top:1.4mm}.pp-price span{font-size:8px}.pp-price b{font-size:11.5px}.pp-badge{font-size:8px;left:1.5mm;top:1.5mm;padding:.5mm 2mm}
 .pp-linhas{margin-top:0}.pp-loc{break-after:avoid;margin:4mm 0 3mm}
 .pp-vr,.pp-ed,.pp-edit,.pp-alt{display:none!important}
}`;
function css(){if(document.getElementById("pp-css"))return;const s=document.createElement("style");s.id="pp-css";s.textContent=CSS;document.head.appendChild(s)}
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const n0=v=>Number(v||0).toLocaleString("pt-BR");
const m2=v=>Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const brl=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const area=t=>(+t.L||0)*(+t.H||0)*(+t.q||0)/1e6;
/* tipologia da capa: a de maior área com proporção que fica bem na capa */
function heroIdx(it){let best=-1,bv=-1;it.forEach((t,i)=>{const r=(+t.L||1)/(+t.H||1),a=(+t.L||0)*(+t.H||0),v=a*(r>=.7&&r<=2.4?1:.35);if(v>bv){bv=v;best=i}});return best}

/* D: {marca, marcaCor, numero, obra, cliente, cor, emitida, itens:[...]}
   op: {precos:[valor por item]|null, total, condicoes:{validade,cond,prazo,obs}, editar:bool, editor:(t,i)=>html, aberto:i, rotulo, adiar:bool (não gera as imagens agora)} */
function render(el,D,op){op=op||{};css();const it=D.itens||[];const P=op.precos||null;
 if(op.simular&&op.estado){D._sim=op.estado.obra||null;it.forEach((t,i)=>{const s=op.estado.itens&&op.estado.itens[i];if(s)t._s=s;else delete t._s});aplicarSim(D)}
 const T3=window.TIP3D;const pc=D.marcaCor||"";
 const pecas=it.reduce((s,t)=>s+(+t.q||0),0),totM2=it.reduce((s,t)=>s+area(t),0);
 const linhas=[...new Set(it.map(t=>t.linha).filter(Boolean))];
 const p0=T3?T3.perfilDe(D.cor):null;const hi=heroIdx(it);
 const marca=(D.logo?`<img class="pp-logo" src="${esc(D.logo)}" alt="">`:"")+(D.marca?`${esc(D.marca)}`:`FC Consultoria<small>e Representação</small>`);
 const data=D.emitida?new Date(D.emitida).toLocaleDateString("pt-BR"):new Date().toLocaleDateString("pt-BR");
 let h=`<article class="pp"${pc?` style="--pc:${esc(pc)}"`:""}>
 <header class="pp-capa">
  <div class="pp-top"><div class="pp-marca">${marca}</div><div class="pp-doc">${esc(op.rotulo||(P?"Proposta comercial":"Apresentação de tipologias"))}<b class="num">${esc(D.numero||"—")}</b>${P?"Emitida":"Atualizada"} em ${data}</div></div>
  <div class="pp-hero"><div><div class="pp-eye">Esquadrias de alumínio e vidro</div><h1>${esc(D.obra||"Obra")}</h1><div class="pp-cli">Cliente: <b>${esc(D.cliente||"—")}</b></div></div>
   <figure class="pp-fig">${hi>=0&&T3?`<img data-pp="${hi}" data-px="1400" alt="Tipologia ${esc(it[hi].tipo)} em 3D" hidden><span class="ld">Gerando 3D…</span><figcaption>${esc(it[hi].tipo)} · ${n0(it[hi].L)} × ${n0(it[hi].H)} mm</figcaption>`:""}</figure></div>
  <div class="pp-stats">
   <div class="pp-stat"><span>Tipologias</span><b class="num">${it.length}</b></div>
   <div class="pp-stat"><span>Peças</span><b class="num">${pecas}</b></div>
   <div class="pp-stat"><span>Área de vãos</span><b class="num">${m2(totM2)} <small>m²</small></b></div>
   <div class="pp-stat"><span>Acabamento</span><b class="acab">${D._sim&&D._sim.p&&T3?`<i class="pp-sw" style="background:${T3.perfilDe("",D._sim.p).hex}"></i>${esc(SIMP.find(x=>x[0]===D._sim.p)[1])} <small>(simulação)</small>`:`${p0?`<i class="pp-sw" style="background:${p0.hex}"></i>`:""}${esc(D.cor||"—")}`}</b></div>
  </div>
 </header>
 <div class="pp-body">${op.simular&&T3?(D._simRot=op.simRotulo,barraSim(D,T3)):""}${simAtivo(D)?`<div class="pp-av">⚠ <b>Cor alterada apenas para demonstração.</b> A troca de cor pode alterar o valor — confirme com a vidraçaria.</div>`:""}${linhas.length?`<div class="pp-linhas"><span class="pp-chip" style="background:none;border-color:transparent;padding-left:0">Linhas da obra</span>${linhas.map(l=>`<span class="pp-chip">${esc(l)}</span>`).join("")}</div>`:""}`;
 /* itens agrupados por local, na ordem do croqui */
 const grupos=[];it.forEach((t,i)=>{const g=grupos[grupos.length-1];if(g&&g.loc===t.loc)g.ix.push(i);else grupos.push({loc:t.loc,ix:[i]})});
 /* grade contínua: o local vai dentro do card, para não sobrar meia linha vazia nem pular página a cada local */
 h+=`<div class="pp-loc"><h2>Itens da obra</h2><span class="num">${it.length} ${it.length===1?"tipologia":"tipologias"} · ${pecas} ${pecas===1?"peça":"peças"} · ${m2(totM2)} m²</span></div><div class="pp-grid">`;
 grupos.forEach(g=>{
  g.ix.forEach(i=>{const t=it[i];const p=T3?T3.perfilDe(D.cor,t.corPerfil):null,v=T3?T3.vidroDe(t.desc,t.vidroCor):null;const pv=P?+P[i]||0:0;
   h+=`<div class="pp-card"><figure>${t._s&&op.simular?`<span style="position:absolute;top:10px;right:10px;z-index:2;background:#fff6e5;color:#7a4b07;border:1px solid #f0d49a;border-radius:999px;padding:2px 9px;font-size:11.5px;font-weight:600">cor simulada neste item</span>`:""}${T3?`<img data-pp="${i}" alt="Tipologia ${esc(t.tipo)} em 3D" hidden><span class="ld">Gerando 3D…</span><button class="pp-vr" type="button" data-pv="${i}">Ver em 3D</button>`:""}<span class="pp-badge">Item ${esc(t.item)}</span>${op.editar&&t.orig?'<span class="pp-alt">alterado</span>':""}</figure>
   <div class="pp-cb"><div>${t.loc?`<div class="pp-lc">${esc(t.loc)}</div>`:""}<div class="pp-cod">${esc(t.tipo)}</div><div class="pp-desc">${esc(t.desc)}</div></div>
    <div class="pp-specs num"><div><span>Larg. mm</span><b>${n0(t.L)}</b></div><div><span>Alt. mm</span><b>${n0(t.H)}</b></div><div><span>Área m²</span><b>${m2(area(t))}</b></div><div><span>Qtde</span><b>${esc(t.q)}</b></div></div>
    <div class="pp-meta">${t.linha?`<span>Linha <b>${esc(t.linha)}</b></span>`:""}${p?`<span><i style="background:${p.hex}"></i>Perfil ${p.nome.toLowerCase()}</span>${/SEM\s+VIDRO/i.test(t.desc||"")?"":`<span><i style="background:${v.hex}"></i>Vidro ${v.nome.toLowerCase()}</span>`}`:""}</div>
    ${op.editar?`<button class="pp-ed" type="button" data-pe="${i}">✎ Editar medida, vidro ou desenho</button>`:""}
    ${P?`<div class="pp-price num"><span>${(+t.q||0)>1&&pv>0?"Unit. "+brl(pv/t.q):"Valor do item"}</span><b>${pv>0?brl(pv):"—"}</b></div>`:""}
   </div></div>`;
   if(op.editar&&op.aberto===i&&op.editor)h+=`<div class="pp-edit">${op.editor(t,i)}</div>`;});
  });
 h+=`</div></div>`;
 if(P)h+=`<div class="pp-total"><div><span>Valor total da obra</span><small>${it.length} tipologias · ${pecas} peças · ${m2(totM2)} m²</small></div><b class="num">${brl(op.total!=null?op.total:P.reduce((s,v)=>s+(+v||0),0))}</b></div>`;
 const c=op.condicoes||{};const cs=[["Validade da proposta",c.validade],["Condições de pagamento",c.cond],["Prazo de entrega",c.prazo],["Observações",c.obs]].filter(x=>x[1]);
 if(P&&cs.length)h+=`<div class="pp-cond">${cs.map(([k,v])=>`<div><span>${k}</span><b>${esc(v)}</b></div>`).join("")}</div>`;
 h+=`<footer class="pp-foot"><div>Medidas e quantidades conforme projeto, sujeitas a conferência na obra. Imagens 3D ilustrativas.</div>${typeof D.rodape==="string"?(D.rodape.trim()?`<div class="wm">${esc(D.rodape)}</div>`:""):`<div class="wm">${D.marca?"Desenvolvido por FC Consultoria em Esquadria · ©":"FC Consultoria em Esquadria · uso exclusivo · © FC Consultoria em Esquadria"}</div>`}</footer></article>`;
 el.innerHTML=h;
 if(T3){el.querySelectorAll("[data-pv]").forEach(b=>b.onclick=()=>T3.abrir(it[+b.dataset.pv],Object.assign({cor:D.cor,origem:b.closest("figure")},op.simular?{cores:{p:SIMP,v:SIMV},temVidro:temVidro(it[+b.dataset.pv]),onCor:(k,id,obra)=>{const t=it[+b.dataset.pv];if(k==="reset")delete t._s;else if(obra){D._sim=Object.assign({},D._sim);D._sim[k]=id;(D.itens||[]).forEach(x=>{if(x._s){delete x._s[k];if(!x._s.p&&!x._s.v)delete x._s}})}else{t._s=Object.assign({},t._s);t._s[k]=id}aplicarSim(D);clearTimeout(el._simT);el._simT=setTimeout(()=>repinta(el,D,op),50)}}:{})));if(op.simular)ligarSim(el,D,op);if(!op.adiar)preencher(el,D)}
}
/* 05/11/2026 · simular cor de perfil e de vidro na negociação (só demonstração; preço não muda) */
const SIMP=[["branco","Branco"],["preto","Preto"],["natural","Fosco"],["madeira","Madeira"],["linheiro","Linheiro"]];
const SIMV=[["incolor","Incolor"],["verde","Verde"],["fume","Fumê"],["champanhe","Champanhe"]];
const temVidro=t=>!/SEM\s*VIDRO/i.test(String(t.desc||""))&&/VIDRO|INCOLOR|TEMPERAD|LAMINAD|FUM|VERDE|MM/i.test(String(t.desc||""));
function barraSim(D,T3){const s=D._sim||{};const it=D.itens||[];const algumVidro=it.some(temVidro);
 const b=(k,id,nm,hex)=>`<button type="button" data-sim="${k}:${id}" aria-pressed="${s[k]===id}"><i style="background:${hex}"></i>${nm}</button>`;
 return `<details class="pp-sim-d"${D._simAberto||simAtivo(D)?" open":""}><summary>🎨 Trocar cores <span style="font-weight:500;color:var(--muted)">· ${esc(D._simRot||"só a vidraçaria vê")}</span></summary><div class="pp-sim" role="group" aria-label="Simular cores" style="margin-top:8px"><div class="rw"><span>Cor do perfil</span>${SIMP.map(([id,nm])=>b("p",id,nm,T3.perfilDe("",id).hex)).join("")}</div>
  ${algumVidro?`<div class="rw"><span>Cor do vidro</span>${SIMV.map(([id,nm])=>b("v",id,nm,T3.vidroDe("",id).hex)).join("")}</div>`:""}
  <div class="rw"><span class="hint" style="min-width:0"><b>Obra toda:</b> escolha acima. <b>Por item:</b> abra o Ver em 3D e toque na cor do perfil ou do vidro. Os valores não mudam.</span>${simAtivo(D)?`<button type="button" class="rs" data-sim="reset">↺ Cor do orçamento (tudo)</button>`:""}</div></div></details>`}
/* obra toda (D._sim) e por item (t._s): o item vale mais que a obra */
function aplicarSim(D){const it=D.itens||[];it.forEach(t=>{if(!("_cp0" in t)){t._cp0=t.corPerfil;t._vc0=t.vidroCor}
  const s=D._sim||{},i=t._s||{};t.corPerfil=i.p||s.p||t._cp0;t.vidroCor=temVidro(t)?(i.v||s.v||t._vc0):t._vc0;if(t.corPerfil==null)delete t.corPerfil;if(t.vidroCor==null)delete t.vidroCor})}
const guardaSim=(D,op)=>{if(op.estado){op.estado.obra=D._sim||null;op.estado.itens=(D.itens||[]).map(t=>t._s||null)}};
const repinta=(el,D,op)=>{guardaSim(D,op);if(op.onSim)return op.onSim();const y=scrollY;render(el,D,op);scrollTo(0,y)};
const simAtivo=D=>!!(D._sim||(D.itens||[]).some(t=>t._s));
function ligarSim(el,D,op){const dd=el.querySelector(".pp-sim-d");if(dd)dd.ontoggle=()=>{D._simAberto=dd.open};el.querySelectorAll("[data-sim]").forEach(b=>b.onclick=()=>{const v=b.dataset.sim;
  if(v==="reset"){D._sim=null;(D.itens||[]).forEach(t=>delete t._s)}else{const [k,id]=v.split(":");D._sim=Object.assign({},D._sim);D._sim[k]=D._sim[k]===id?undefined:id;if(!D._sim.p&&!D._sim.v)D._sim=null;(D.itens||[]).forEach(t=>{if(t._s){delete t._s[k];if(!t._s.p&&!t._s.v)delete t._s}})}
  aplicarSim(D);repinta(el,D,op)})}
/* gera as imagens aos poucos (uma por quadro) para a página não travar */
const filas=new WeakMap();
function preencher(el,D,tudo){const T3=window.TIP3D;if(!T3)return;cancelAnimationFrame(filas.get(el)||0);const it=D.itens||[];
 const um=im=>{const t=it[+im.dataset.pp];if(t){try{im.src=T3.imagem(t,{cor:D.cor,px:+im.dataset.px||900})}catch(e){}}im.hidden=false;const ld=im.parentNode.querySelector(".ld");if(ld)ld.remove()};
 if(tudo){el.querySelectorAll("img[data-pp][hidden]").forEach(um);return}
 const passo=()=>{const im=el.querySelector("img[data-pp][hidden]");if(!im)return;um(im);filas.set(el,requestAnimationFrame(passo))};passo()}
window.PROPOSTA={render,preencher,css};
})();
