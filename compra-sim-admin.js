/* ===== Painel da Matriz · Novo orçamento e compra de clientes =====
   Cada simulação de pedido que o cliente faz no link dele (Onde comprar · Simular pedido) chega aqui,
   separada por cliente. Status: 🆕 novo · 🔄 atualizado (mexeu depois que a FC viu) · 🧾 pedido gerado · ✔ visto · 🚫 inativo (teste, fora da lista). */
(function(){
  const S={L:[],EMP:{},aberto:{},filtro:'pend',A2:{},ED:null};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const n2=v=>v==null||isNaN(v)?'—':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const rs=v=>v==null||isNaN(v)?'—':Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const dt=v=>v?new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'—';
  const ST={novo:['🆕 Novo','#e8912d'],atualizado:['🔄 Atualizado','#1f6f9a'],pedido:['🧾 Pedido gerado','#1f9d55'],visto:['✔ Visto','#7a8794'],inativo:['🚫 Inativo','#b42318']};
  const cli=()=>(typeof sb!=='undefined'&&sb)||window.sb;
  async function carrega(){const box=$('csimBody');if(!box)return;const C=cli();if(!C){setTimeout(carrega,1500);return;}
    const r=await C.from('compra_sim').select('id,empresa_id,nome,oc,itens,kg,total,forn,pedidos,status,criado_em,atualizado_em,visto_em').order('atualizado_em',{ascending:false}).limit(500);
    if(r.error){box.innerHTML=`<p class="note" style="padding:12px 16px">Não carregou: ${esc(r.error.message)}</p>`;return;}
    S.L=r.data||[];
    try{const e=await C.from('rotina_docs').select('id,data').eq('col','consultoria');(e.data||[]).forEach(x=>S.EMP[x.id]=(x.data&&x.data.nome)||x.id);}catch(_){}
    desenha();}
  const pend=x=>x.status!=='visto'&&x.status!=='inativo',inat=x=>x.status==='inativo';
  function desenha(){const box=$('csimBody');if(!box)return;const np=S.L.filter(pend).length;
    const nb=$('csimN');if(nb)nb.textContent=np?np+' para ver':'';const tb=$('tbCsim');if(tb)tb.textContent=np?' '+np:'';
    const ni=S.L.filter(inat).length;const L=S.filtro==='pend'?S.L.filter(pend):S.filtro==='inat'?S.L.filter(inat):S.L.filter(x=>!inat(x));
    const por={};L.forEach(x=>{(por[x.empresa_id]=por[x.empresa_id]||[]).push(x);});
    const fil=`<div style="display:flex;gap:6px;flex-wrap:wrap;padding:12px 16px 0"><button type="button" data-csf="pend" style="${S.filtro==='pend'?'background:#0f6b70;color:#fff;border-color:#0f6b70':''}">Só o que tem novidade (${np})</button><button type="button" data-csf="todos" style="${S.filtro==='todos'?'background:#0f6b70;color:#fff;border-color:#0f6b70':''}">Todos (${S.L.length-ni})</button>${ni?`<button type="button" data-csf="inat" style="${S.filtro==='inat'?'background:#b42318;color:#fff;border-color:#b42318':''}">🚫 Inativos (${ni})</button>`:''}</div>`;
    if(!L.length){box.innerHTML=fil+`<p class="note" style="padding:12px 16px">${S.filtro==='pend'?'Nenhum orçamento novo dos clientes. 👍':S.filtro==='inat'?'Nenhum orçamento inativo.':'Nenhum cliente simulou pedido ainda.'}</p>`;return;}
    box.innerHTML=fil+Object.entries(por).map(([e,X])=>{const n=X.filter(pend).length;
      return `<div style="margin:12px 16px;border:1px solid var(--line);border-radius:12px;overflow:hidden"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 14px;background:#f2f5f4"><b style="font-size:16px">🏢 ${esc(S.EMP[e]||e)}</b><span class="note">${X.length} ${X.length===1?'orçamento':'orçamentos'}${n?' · <b style="color:#e8912d">'+n+' com novidade</b>':''}</span><a href="equivalencias/comprar.html" target="_blank" rel="noopener" style="margin-left:auto;font-size:13px">Abrir Onde comprar ↗</a></div>
      ${X.map(lin).join('')}</div>`;}).join('');}
  function lin(x){const [t,c]=ST[x.status]||ST.novo;const ab=S.aberto[x.id];
    return `<div style="border-top:1px solid var(--line);padding:10px 14px"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <span style="background:${c};color:#fff;border-radius:99px;padding:2px 10px;font:700 12px system-ui">${t}</span>
      <b>${x.oc?esc(x.oc):'Sem nº de OC'}</b><span class="note">${esc(x.nome||'cliente')} · ${dt(x.atualizado_em)}${x.criado_em!==x.atualizado_em?' · começou '+dt(x.criado_em):''}</span>
      <span style="margin-left:auto;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span>${x.itens} itens</span><span>${n2(x.kg)} kg</span><b>${rs(x.total)}</b></span></div>
      <div class="note" style="margin-top:4px">Fornecedores: <b>${(x.forn||[]).map(esc).join(' + ')||'—'}</b>${(x.pedidos||[]).length?' · 🧾 pedido gerado para: <b>'+x.pedidos.map(esc).join(', ')+'</b>':''}</div>
      <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><button type="button" data-csv="${x.id}">${ab?'▲ Fechar':'▼ Ver itens'}</button>${pend(x)?`<button type="button" data-csok="${x.id}">✔ Marcar como visto</button>`:''}${inat(x)?`<button type="button" data-csin="${x.id}|0">↩ Reativar</button>`:`<button type="button" data-csin="${x.id}|1" style="color:#b42318;border-color:#f3b4ae">🚫 Inativar</button>`}</div>
      ${ab?`<div id="csd-${x.id}" style="margin-top:8px"><p class="note">Carregando…</p></div>`:''}</div>`;}
  async function det(id){const el=$('csd-'+id);if(!el)return;const r=await cli().from('compra_sim').select('dados').eq('id',id).single();
    const d=r.data&&r.data.dados;if(!d){el.innerHTML='<p class="note">Sem itens.</p>';return;}
    const pf=Object.entries(d.pf||{}).map(([f,v])=>`<span style="border:1px solid var(--line);border-radius:9px;padding:4px 10px;font-size:13px"><b>${esc(f)}</b> · ${v.n} ${v.n===1?"item":"itens"} · ${n2(v.kg)} kg · ${rs(v.v)}${v.falta>0?' · <span style="color:#c2410c">faltam '+n2(v.falta)+' kg do mínimo</span>':''}</span>`).join('');
    const nz=c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'');await edits();const A={};(d.it||[]).forEach(i=>{if(i.a2&&i.a2.c&&i.a2.fid)A[i.a2.fid+'|'+nz(i.a2.c)]=A[i.a2.fid+'|'+nz(i.a2.c)]||{...i.a2,l:i.l,k:i.k,cods:[]};const z=i.a2&&A[i.a2.fid+'|'+nz(i.a2.c)];if(z)z.cods.push(i.cod);});
    const al=Object.entries(A).map(([key,a])=>{const th=(d.th||{})[key];const ja=S.ED[key];return `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;border:1px solid #ddd6fe;background:#f5f3ff;border-radius:10px;padding:8px 10px">${th?`<img src="${th}" alt="" style="height:64px;border-radius:6px;border:1px solid #ddd">`:''}<span style="flex:1;min-width:200px"><b>${esc(a.c)}</b> · ${esc(a.f)} · ${n2(a.p).replace(/0$/,'')} kg/m<br><small>2ª opção do cliente para ${a.cods.map(esc).join(', ')}${a.k?' · par Alcoa '+esc(a.k):''}</small></span>${ja?'<b style="color:#1f9d55">✓ já está no catálogo</b>':a.k?`<button type="button" data-cscat="${id}|${esc(key)}" style="background:#7c3aed;color:#fff;border-color:#7c3aed">📚 Incluir no catálogo</button>`:'<small>perfil fora do banco: inclua o par na Conversão de códigos</small>'}</div>`;}).join('');
    S.A2[id]={A,th:d.th||{}};
    el.innerHTML=`${al?'<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px"><b style="font-size:14px">2ª opção informada pelo cliente</b>'+al+'</div>':''}<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${pf}</div><div class="tw"><table><thead><tr><th>Código do cliente</th><th>Perfil</th><th>Cor</th><th>Barras</th><th>Comprar em</th><th>Código no fornecedor</th><th>kg</th><th>R$/kg</th><th>Total</th></tr></thead><tbody>${(d.it||[]).map(i=>`<tr${i.fora?' style="opacity:.55"':''}><td><b>${esc(i.cod)}</b>${i.cl?' <small>· '+esc(i.cl)+'</small>':''}</td><td>${i.nf?'<span style="color:#c2410c">não encontrado</span>':esc(i.per)}${i.fora?'<br><small>fora desta reposição</small>':''}</td><td>${esc(i.cor)}</td><td>${i.b} × ${String(i.m).replace('.',',')} m${i.br&&i.br!==i.b?'<br><small>compra '+i.br+'</small>':''}</td><td>${i.f?esc(i.f):'<span style="color:#c2410c">sem preço</span>'}${i.fix?'<br><small>✋ escolha do comprador</small>':''}${i.mov?'<br><small>saiu da '+esc(i.mov)+' (mínimo)</small>':''}</td><td>${esc(i.c||'')}${i.alt?'<br><small style="color:#7c3aed">2ª opção do comprador</small>':''}${i.a2&&!i.alt?'<br><small style="color:#7c3aed">2ª opção: '+esc(i.a2.f)+' '+esc(i.a2.c)+'</small>':''}${i.a2&&(i.a2.img||i.a2.pdf)?' <small>📎</small>':''}</td><td>${n2(i.kg)}</td><td>${n2(i.rkg)}</td><td>${rs(i.v)}</td></tr>`).join('')}
      <tr><td colspan="6"><b>Total</b></td><td><b>${n2(d.kg)}</b></td><td></td><td><b>${rs(d.tot)}</b></td></tr></tbody></table></div>`;}
  async function edits(){if(S.ED)return;S.ED={};try{const r=await cli().from('trein_eventos').select('detalhe').eq('tipo','equiv_edit');(r.data||[]).forEach(x=>{const e=x.detalhe;if(e&&e.f&&e.c&&e.a)S.ED[e.f+'|'+String(e.c).toUpperCase().replace(/[^A-Z0-9]/g,'')]=1;});}catch(_){}}
  async function catalogo(id,key,bt){const z=S.A2[id];const a=z&&z.A[key];if(!a)return;bt.disabled=true;bt.textContent='Incluindo…';const C=cli();let url='';
    try{const th=z.th[key];if(th){const b=await (await fetch(th)).blob();const path='equiv-2op/'+a.fid+'-'+key.split('|')[1]+'-'+Date.now()+'.jpg';const r=await C.storage.from('fc-anexos').upload(path,b,{contentType:'image/jpeg',upsert:false});if(!r.error)url=C.storage.from('fc-anexos').getPublicUrl(path).data.publicUrl;}}catch(_){}
    const ed={l:a.l,f:a.fid,c:String(a.c).toUpperCase(),a:a.k,p:+a.p,n:'alta',t:'padrao',o:'Incluído pela 2ª opção de compra do cliente (print do catálogo do fornecedor).',pg:'—',img:url,em:new Date().toLocaleDateString('pt-BR')};
    const r=await C.from('trein_eventos').insert({tipo:'equiv_edit',detalhe:ed});if(r.error){bt.disabled=false;bt.textContent='Não incluiu: '+r.error.message;return;}
    S.ED[key]=1;bt.outerHTML='<b style="color:#1f9d55">✓ incluído no catálogo (matriz e cliente)</b>';}
  async function visto(id){const x=S.L.find(y=>y.id===id);if(!x)return;const r=await cli().from('compra_sim').update({status:'visto',visto_em:new Date().toISOString()}).eq('id',id);if(!r.error){x.status='visto';desenha();}}
  document.addEventListener('click',e=>{const t=e.target.closest('[data-cscat],[data-csv],[data-csok],[data-csin],[data-csf],#csimRe');if(!t||!t.closest('#csimCard'))return;
    if(t.dataset.cscat){const [id,key]=[t.dataset.cscat.slice(0,t.dataset.cscat.indexOf('|')),t.dataset.cscat.slice(t.dataset.cscat.indexOf('|')+1)];catalogo(id,key,t);return;}
    if(t.id==='csimRe'){carrega();return;}
    if(t.dataset.csf){S.filtro=t.dataset.csf;desenha();return;}
    if(t.dataset.csok){visto(t.dataset.csok);return;}
    if(t.dataset.csin){const [id,v]=t.dataset.csin.split('|');inativar(id,v==='1');return;}
    const id=t.dataset.csv;S.aberto[id]=!S.aberto[id];desenha();if(S.aberto[id]){det(id);const x=S.L.find(y=>y.id===id);if(x&&x.status==='novo'||x&&x.status==='atualizado')visto(id).then(()=>{S.aberto[id]=true;desenha();det(id);});}});
  async function inativar(id,on){const x=S.L.find(y=>y.id===id);if(!x)return;
    if(on&&!confirm('Inativar o orçamento '+(x.oc||'sem nº de OC')+' de '+(x.nome||'cliente')+'?\n\nEle sai da lista (fica em "Inativos") e pode ser reativado depois.'))return;
    const r=await cli().rpc('compra_sim_inativar',{p_id:id,p_inativo:on});
    if(r.error||!r.data){alert('Não foi possível '+(on?'inativar':'reativar')+(r.error&&/function/i.test(r.error.message)?': falta rodar o SQL de estoque/inativar.':'.'));return;}
    x.status=on?'inativo':'visto';desenha();}
  window.csimLoad=carrega;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(carrega,1200));else setTimeout(carrega,1200);
  setInterval(()=>{if(!document.hidden)carrega();},120000);
})();
