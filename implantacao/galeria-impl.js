/* ===== Painel de Implantação · 📸 Galeria do processo (fotos/prints que o cliente vê no link de acompanhamento) =====
   Mesma tabela impl_portal_galeria que antes ficava no Painel da Matriz (aba Acompanhamento do cliente). */
(function(){
  const ETAPAS=['Geral (sem etapa)',...['Acesso ao sistema e definição das 05 linhas','Definição das cores dos perfis e dos componentes','Preço de custo dos vidros','Cotação das listas de componentes','Preço de custo dos perfis por cor','Ajuste do cadastro de componentes conforme comprado no fornecedor','Ajuste das tipologias liberadas no sistema','Conferência e simulação de orçamento','Ajuste de margem para o preço de venda','Finalização e feedback'].map((t,i)=>(i+1)+' · '+t)];
  const G={dados:{},carregando:{},erro:{},pend:null,abertos:{}};
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $=id=>document.getElementById(id);
  const aviso=(t,ruim)=>{const e=document.createElement('div');e.textContent=t;e.style.cssText=`position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:${ruim?'#b42318':'#1b232a'};color:#fff;padding:9px 16px;border-radius:99px;font:600 14px system-ui;z-index:99999`;document.body.appendChild(e);setTimeout(()=>e.remove(),2600);};
  const redesenha=()=>{try{if(typeof render==='function')render();}catch(e){console.warn(e);}};

  async function carregar(id){if(G.carregando[id])return;G.carregando[id]=true;
    try{const r=await sb.from('impl_portal_galeria').select('id,etapa,legenda,mini,criado_em').eq('cliente_id',id).order('criado_em',{ascending:false});
      if(r.error)throw r.error;G.dados[id]=r.data||[];G.erro[id]='';}catch(e){G.erro[id]=e.message||String(e);G.dados[id]=G.dados[id]||[];}
    G.carregando[id]=false;redesenha();}

  window.renderGaleriaImpl=function(c){
    try{if(typeof PORTAIS!=='undefined'&&!PORTAIS[c.id])return '';}catch(_){}
    if(!G.dados[c.id]){carregar(c.id);return `<div class="panel" style="padding:14px 18px"><b>📸 Galeria do processo</b> <span class="desc">carregando…</span></div>`;}
    const L=G.dados[c.id],ab=!!G.abertos[c.id];
    return `<div class="panel" style="padding:0" data-galbox="${c.id}">
      <div class="panel-head" style="cursor:pointer" data-galtog="${c.id}"><div><h3>📸 Galeria do processo <span class="badge">${L.length} foto${L.length===1?'':'s'}</span></h3>
      <div class="desc">Fotos e prints que ${esc(c.nome)} vê no link de acompanhamento, em cada etapa. Só este cliente vê.</div></div><span style="margin-left:auto;color:var(--muted,#6b7d88)">${ab?'▲ ocultar':'▼ abrir'}</span></div>
      ${ab?`<div style="padding:0 18px 16px">
        ${G.erro[c.id]?`<p class="desc" style="color:#b42318">Não carregou: ${esc(G.erro[c.id])}</p>`:''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <select id="giEt-${c.id}" class="select-inline" style="padding:7px 9px;border:1px solid var(--border,#d7e0e5);border-radius:8px">${ETAPAS.map(e=>`<option>${esc(e)}</option>`).join('')}</select>
          <input id="giLeg-${c.id}" placeholder="Legenda (opcional). Ex.: Print do fornecedor enviando a tabela" style="flex:1;min-width:220px;padding:7px 9px;border:1px solid var(--border,#d7e0e5);border-radius:8px">
          <label style="font:600 13.5px system-ui;padding:8px 14px;border-radius:8px;cursor:pointer;background:#1f6f9a;color:#fff">📷 Adicionar fotos<input type="file" accept="image/*" multiple hidden data-gifile="${c.id}"></label></div>
        <div tabindex="0" data-gicola="${c.id}" style="margin-top:8px;border:2px dashed var(--border,#d7e0e5);border-radius:10px;padding:12px;text-align:center;color:var(--muted,#6b7d88);font:500 13.5px system-ui;cursor:text">📋 Tirou o print? Clique aqui e aperte <b>Ctrl+V</b> para colar na etapa e com a legenda escolhidas acima.</div>
        <p class="desc" style="margin:6px 0 0">⚠️ Antes de enviar, confira se o print não mostra senha, preço de fornecedor ou dados de outro cliente.</p>
        ${L.length?`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;margin-top:10px">${L.map(g=>`<div style="position:relative;border:1px solid var(--border,#d7e0e5);border-radius:8px;overflow:hidden;background:#f4f7f8" title="${esc((g.etapa||'')+' · '+(g.legenda||''))}"><img src="${g.mini}" alt="" style="display:block;width:100%;aspect-ratio:4/3;object-fit:cover"><span style="display:block;font-size:11px;padding:3px 5px;color:#5b6d78;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(g.etapa||'')}${g.legenda?' · '+esc(g.legenda):''}</span><button type="button" data-gidel="${g.id}" data-cli="${c.id}" style="position:absolute;top:4px;right:4px;border:0;border-radius:6px;padding:2px 6px;font:600 11px system-ui;cursor:pointer;background:${G.pend===g.id?'#b42318':'rgba(255,255,255,.9)'};color:${G.pend===g.id?'#fff':'#b42318'}">${G.pend===g.id?'Confirmar':'🗑'}</button></div>`).join('')}</div>`:'<p class="desc" style="margin-top:10px">Nenhuma foto ainda.</p>'}
      </div>`:''}</div>`;};

  function reduzir(file,max,q){return new Promise((ok,no)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,cv.width,cv.height);cx.drawImage(im,0,0,cv.width,cv.height);URL.revokeObjectURL(u);ok(cv.toDataURL('image/jpeg',q));};im.onerror=()=>{URL.revokeObjectURL(u);no(new Error('Imagem inválida: '+file.name));};im.src=u;});}
  async function enviar(id,fs){if(!fs.length)return;
    const et=$('giEt-'+id),lg=$('giLeg-'+id),etapa=!et||et.value.startsWith('Geral')?'Geral':et.value,legenda=lg&&lg.value.trim()||null;
    try{for(let i=0;i<fs.length;i++){aviso(`Enviando foto ${i+1} de ${fs.length}…`);const [foto,mini]=await Promise.all([reduzir(fs[i],1800,.82),reduzir(fs[i],360,.7)]);
        const {error}=await sb.from('impl_portal_galeria').insert({cliente_id:id,etapa,legenda,foto,mini});if(error)throw error;}
      aviso(fs.length>1?fs.length+' fotos adicionadas':'Foto adicionada à galeria');G.dados[id]=null;carregar(id);}
    catch(e){aviso('Não salvou: '+(e.message||e),true);}}

  document.addEventListener('click',async ev=>{
    const t=ev.target.closest('[data-galtog]');if(t){const id=t.dataset.galtog;G.abertos[id]=!G.abertos[id];redesenha();return;}
    const d=ev.target.closest('[data-gidel]');if(d){ev.preventDefault();const gid=d.dataset.gidel,id=d.dataset.cli;
      if(G.pend!==gid){G.pend=gid;redesenha();return;}
      const {error}=await sb.from('impl_portal_galeria').delete().eq('id',gid);G.pend=null;if(error){aviso('Não apagou: '+error.message,true);return;}aviso('Foto apagada');G.dados[id]=null;carregar(id);}});
  document.addEventListener('change',async ev=>{const i=ev.target;if(!i.dataset||!i.dataset.gifile)return;await enviar(i.dataset.gifile,[...(i.files||[])]);i.value='';});
  document.addEventListener('paste',ev=>{const z=ev.target&&ev.target.closest&&ev.target.closest('[data-gicola]');if(!z)return;
    const fs=[...((ev.clipboardData&&ev.clipboardData.files)||[])].filter(f=>/^image\//.test(f.type));if(!fs.length)return;ev.preventDefault();enviar(z.dataset.gicola,fs);});
})();
