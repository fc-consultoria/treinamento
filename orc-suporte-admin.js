/* ===== Painel da Matriz · Suporte técnico dos vendedores (Painel de Vendas) =====
   Mensagens que os vendedores e gestores mandam pela aba 🛟 Suporte Técnico FC, com print e PDF.
   Separado por cliente e por vendedor; a FC responde aqui e a resposta aparece na tela do vendedor. */
(function(){
  const S={L:[],EMP:{},ab:null,anx:null};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const dt=v=>new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
  const cli=()=>(typeof sb!=='undefined'&&sb)||window.sb;
  const st=document.createElement('style');st.textContent=`#osupBody .om{max-width:78%;padding:8px 11px;border-radius:12px;font-size:14.5px;white-space:pre-wrap;word-break:break-word;margin:4px 0}#osupBody .om small{display:block;font-size:11px;opacity:.7}
  #osupBody .om.v{background:#fff;border:1px solid #d8e2e6}#osupBody .om.fc{background:#0f6b70;color:#fff;margin-left:auto}#osupBody .om img{display:block;max-width:220px;max-height:180px;border-radius:8px;margin-top:5px;cursor:zoom-in;background:#fff}
  #osupBody .ochat{display:flex;flex-direction:column;max-height:420px;overflow:auto;background:#f6f9f9;border:1px solid #d8e2e6;border-radius:10px;padding:8px}#osupBody textarea{width:100%;min-height:60px;box-sizing:border-box;border:1px solid #c4ccd2;border-radius:9px;padding:8px;font:inherit}`;document.head.appendChild(st);
  async function carrega(){const box=$('osupBody');if(!box)return;const C=cli();if(!C){setTimeout(carrega,1500);return;}
    const r=await C.from('orc_sup').select('id,emp,thr,thr_nome,de,nome,texto,anexo_nome,anexo_tipo,lido,criado_em').order('criado_em').limit(2000);
    if(r.error){box.innerHTML=`<p class="note" style="padding:12px 16px">Não carregou: ${esc(r.error.message)}</p>`;return;}
    S.L=r.data||[];try{const e=await C.from('rotina_docs').select('id,data').eq('col','consultoria');(e.data||[]).forEach(x=>S.EMP[x.id]=(x.data&&x.data.nome)||x.id);}catch(_){}
    desenha();}
  const nlid=L=>L.filter(m=>m.de==='v'&&!m.lido).length;
  function desenha(){const box=$('osupBody');if(!box)return;const T={};S.L.forEach(m=>{const k=m.emp+'|'+m.thr;(T[k]=T[k]||[]).push(m);});
    const n=nlid(S.L);const nb=$('osupN');if(nb)nb.textContent=n?n+' sem resposta':'';
    const ks=Object.keys(T).sort((a,b)=>{const ua=nlid(T[a]),ub=nlid(T[b]);return (ub>0)-(ua>0)||T[b][T[b].length-1].criado_em.localeCompare(T[a][T[a].length-1].criado_em);});
    if(!ks.length){box.innerHTML='<p class="note" style="padding:12px 16px">Nenhuma mensagem dos vendedores ainda. Eles escrevem pela aba 🛟 Suporte Técnico FC do Painel de Vendas.</p>';return;}
    const por={};ks.forEach(k=>{const e=k.split('|')[0];(por[e]=por[e]||[]).push(k);});
    box.innerHTML=Object.entries(por).map(([e,K])=>`<div style="margin:12px 16px;border:1px solid var(--line);border-radius:12px;overflow:hidden"><div style="padding:9px 14px;background:#f2f5f4"><b>🏢 ${esc(S.EMP[e]||e)}</b></div>${K.map(k=>{const L=T[k],u=nlid(L),ult=L[L.length-1],ab=S.ab===k;
      return `<div style="border-top:1px solid var(--line);padding:9px 14px"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b>${esc(L[0].thr_nome||'Vendedor')}</b>${u?`<span style="background:#e8912d;color:#fff;border-radius:99px;padding:1px 9px;font:700 12px system-ui">${u} nova${u>1?'s':''}</span>`:''}<span class="note" style="flex:1;min-width:160px">${esc((ult.de==='fc'?'Você: ':'')+(ult.texto||ult.anexo_nome||'')).slice(0,90)} · ${dt(ult.criado_em)}</span><button type="button" data-osab="${esc(k)}">${ab?'▲ Fechar':'💬 Abrir conversa'}</button></div>
       ${ab?`<div style="margin-top:8px"><div class="ochat" id="osChat">${L.map(m=>`<div class="om ${m.de==='fc'?'fc':'v'}">${esc(m.texto||'')}${m.anexo_nome?(/^image\//.test(m.anexo_tipo||'')?`<img data-osim="${m.id}" alt="">`:`<br><a href="#" data-ospdf="${m.id}" style="color:inherit;font-weight:700">📄 ${esc(m.anexo_nome)}</a>`):''}<small>${m.de==='fc'?'FC':esc(m.nome||'')} · ${dt(m.criado_em)}</small></div>`).join('')}</div>
        <textarea id="osTx" placeholder="Resposta da FC (pode colar print com Ctrl+V)"></textarea><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px"><label style="cursor:pointer;border:1px solid #c4ccd2;border-radius:8px;padding:5px 10px">📎 Print ou PDF<input type="file" id="osF" accept="image/*,application/pdf" hidden></label><span class="note" id="osAn"></span><button type="button" data-osenv="${esc(k)}" style="margin-left:auto;background:#0f6b70;color:#fff;border-color:#0f6b70">📨 Responder</button></div></div>`:''}</div>`;}).join('')}</div>`).join('');
    if(S.ab){const c=$('osChat');if(c){c.scrollTop=c.scrollHeight;c.querySelectorAll('[data-osim]').forEach(async im=>{const r=await cli().from('orc_sup').select('dados').eq('id',im.dataset.osim).single();if(r.data)im.src=r.data.dados;});}
      const f=$('osF');if(f)f.onchange=()=>{if(f.files[0])prep(f.files[0]);};}}
  function prep(f){const an=$('osAn');if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)){if(f.size>4*1024*1024){alert('PDF até 4 MB.');return;}const rd=new FileReader();rd.onload=()=>{S.anx={nome:f.name,tipo:'application/pdf',dados:rd.result};an.textContent='📄 '+f.name;};rd.readAsDataURL(f);return;}
    const im=new Image();im.onload=()=>{const k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);S.anx={nome:'print.jpg',tipo:'image/jpeg',dados:c.toDataURL('image/jpeg',.82)};an.textContent='🖼 print anexado';};im.src=URL.createObjectURL(f);}
  async function abrir(k){S.ab=S.ab===k?null:k;S.anx=null;desenha();if(!S.ab)return;const [e,t]=k.split('|');const ids=S.L.filter(m=>m.emp===e&&m.thr===t&&m.de==='v'&&!m.lido).map(m=>m.id);
    if(ids.length){const r=await cli().from('orc_sup').update({lido:true}).in('id',ids);if(!r.error){S.L.forEach(m=>{if(ids.includes(m.id))m.lido=true;});const nb=$('osupN');if(nb)nb.textContent=nlid(S.L)?nlid(S.L)+' sem resposta':'';}}}
  async function responder(k,b){const tx=$('osTx').value.trim();if(!tx&&!S.anx){alert('Escreva a resposta ou anexe um arquivo.');return;}const [e,t]=k.split('|');const L=S.L.filter(m=>m.emp===e&&m.thr===t);
    b.disabled=true;const r=await cli().from('orc_sup').insert({emp:e,thr:t,thr_nome:L[0]&&L[0].thr_nome,de:'fc',nome:'FC Consultoria',texto:tx||'',anexo_nome:S.anx&&S.anx.nome,anexo_tipo:S.anx&&S.anx.tipo,dados:S.anx&&S.anx.dados,lido:true}).select('id,emp,thr,thr_nome,de,nome,texto,anexo_nome,anexo_tipo,lido,criado_em').single();
    b.disabled=false;if(r.error){alert('Não enviou: '+r.error.message);return;}S.L.push(r.data);S.anx=null;desenha();}
  document.addEventListener('click',async ev=>{const t=ev.target.closest('[data-osab],[data-osenv],[data-osim],[data-ospdf],#osupRe');if(!t||!t.closest('#osupCard'))return;
    if(t.id==='osupRe'){carrega();return;}if(t.dataset.osab){abrir(t.dataset.osab);return;}if(t.dataset.osenv){responder(t.dataset.osenv,t);return;}
    if(t.dataset.osim&&t.src){const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;cursor:zoom-out';o.innerHTML=`<img src="${t.src}" style="max-width:95vw;max-height:92vh;background:#fff;border-radius:8px">`;o.onclick=()=>o.remove();document.body.appendChild(o);return;}
    if(t.dataset.ospdf){ev.preventDefault();const r=await cli().from('orc_sup').select('dados').eq('id',t.dataset.ospdf).single();if(r.data){const b=await (await fetch(r.data.dados)).blob();window.open(URL.createObjectURL(b),'_blank');}}});
  document.addEventListener('paste',ev=>{if(!$('osTx')||document.activeElement!==$('osTx'))return;const it=[...((ev.clipboardData||{}).items||[])].find(i=>i.kind==='file');if(it){ev.preventDefault();prep(it.getAsFile());}});
  window.osupLoad=carrega;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(carrega,1400));else setTimeout(carrega,1400);
  setInterval(()=>{if(!document.hidden&&!S.ab)carrega();},90000);
})();
