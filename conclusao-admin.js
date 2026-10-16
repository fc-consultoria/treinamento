/* ===== Painel da Matriz · Empresas e logins · Conclusões do orientativo =====
   Quem concluiu o Orientativo FC 3D completo (com nome, só para a FC) e quantos alunos com menos de 20% receberam o aviso. */
(function(){
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dh=s=>new Date(s).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});
  let C=[],V=[],ok=false;
  async function carregar(){
    try{const [a,b]=await Promise.all([sb.from('trein_eventos').select('id,user_id,detalhe,criado_em').eq('tipo','conclusao').order('criado_em',{ascending:false}).limit(200),
      sb.from('trein_eventos').select('user_id,detalhe,criado_em').eq('tipo','conc_visto').order('criado_em',{ascending:false}).limit(2000)]);
      C=a.data||[];V=b.data||[];ok=true;}catch(e){console.error('conclusoes',e);}
    desenhar();}
  function desenhar(){const B=$('concBody');if(!B)return;
    if(!ok){B.innerHTML='<p class="note" style="padding:12px 16px">Carregando…</p>';return;}
    const emp=uid=>{const a=(typeof ALUNOS!=='undefined'?ALUNOS:[]).find(x=>x.user_id===uid);return a?(a.nome||a.login):'—';};
    const rec=id=>V.filter(v=>String((v.detalhe||{}).ref)===String(id));
    B.innerHTML=`<p class="note" style="padding:10px 16px 0">Concluir = todas as tipologias vistas + desafio Monte a esquadria + desafios de sistema liberados para a empresa (a mesma régua do relatório do gestor). Quem conclui recebe os parabéns na tela. Alunos com menos de 20% recebem o aviso "Mais um aluno concluiu", sem nome nem empresa, no máximo 1 por semana.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;padding:10px 16px"><div class="lvk"><b>${C.length}</b><span>conclusões</span></div><div class="lvk"><b>${V.length}</b><span>avisos entregues</span></div><div class="lvk"><b>${new Set(V.map(v=>v.user_id+'|'+(v.detalhe||{}).cid)).size}</b><span>alunos avisados</span></div></div>
      ${C.length?`<div class="tw"><table><thead><tr><th>Aluno</th><th>Empresa</th><th>Concluiu em</th><th>Aviso recebido por</th></tr></thead><tbody>${C.map(c=>{const r=rec(c.id);return `<tr><td><b>${esc((c.detalhe||{}).quem||'—')}</b></td><td>${esc(emp(c.user_id))}</td><td>${esc(dh(c.criado_em))}</td><td title="${esc(r.map(v=>((v.detalhe||{}).quem||'?')+' · '+emp(v.user_id)).join('\n'))}">${r.length} aluno${r.length===1?'':'s'}</td></tr>`;}).join('')}</tbody></table></div>`:'<p class="note" style="padding:0 16px 14px">Ninguém concluiu o orientativo completo ainda.</p>'}`;}
  const tab=document.querySelector('#ptabs [data-tab=emp]');if(tab)tab.addEventListener('click',()=>setTimeout(carregar,200));
  setTimeout(carregar,4000);
  window.CONC_INFO=()=>ok&&C.length?'🎓 '+C.length+' concluí'+(C.length>1?'ram':'u')+' o orientativo':'';
})();
