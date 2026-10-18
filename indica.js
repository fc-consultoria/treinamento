/* ===== Indique e ganhe · FC Mostruário 3D =====
   O colaborador que está estudando gera o seu link de indicação. Quem recebe se cadastra na página /indicacao/.
   Quando a FC aprova a indicação no painel, só o colaborador que indicou ganha +72 h. */
(function(){
  const URLI='https://fc-consultoria.github.io/treinamento/indicacao/?c=';
  const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const css=`#indBtn{background:#1f9d55!important;border-color:#1f9d55!important;color:#fff!important}
  #indMd{position:fixed;inset:0;z-index:9500;background:rgba(6,20,26,.72);display:grid;place-items:center;padding:14px}
  #indMd[hidden]{display:none}
  #indMd .c{background:#fff;color:#14231f;border-radius:16px;max-width:460px;width:100%;padding:20px;display:flex;flex-direction:column;gap:12px;font:400 15px/1.5 Barlow,system-ui,sans-serif;max-height:92vh;overflow:auto}
  #indMd h3{margin:0;font:700 21px Barlow,system-ui,sans-serif}
  #indMd ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px}
  #indMd .lk{display:flex;gap:6px}#indMd .lk input{flex:1;min-width:0;font:500 13px ui-monospace,Menlo,monospace;padding:9px;border:1px solid #c9d3da;border-radius:8px}
  #indMd button,#indMd a.b{all:unset;cursor:pointer;text-align:center;font:700 15px Barlow,system-ui,sans-serif;padding:10px 14px;border-radius:9px;background:#1d3f57;color:#fff}
  #indMd a.b.wa{background:#1f9d55}#indMd button.alt{background:#fff;color:#1d3f57;border:1px solid #c9d3da}
  #indMd .st{border-top:1px solid #e3e8eb;padding-top:10px;font-size:14px}#indMd .st li{list-style:none}#indMd .st ul{margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:4px}
  #indMd .nt{font-size:13px;color:#5b6b74}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  async function meuCodigo(uid,cid,quem){
    const r=await sb.from('trein_eventos').select('detalhe').eq('user_id',uid).eq('tipo','indica_cod').order('criado_em',{ascending:false}).limit(50);
    const ach=(r.data||[]).find(x=>(x.detalhe||{}).cid===cid);if(ach)return ach.detalhe.cod;
    const cod=Array.from(crypto.getRandomValues(new Uint8Array(6)),b=>'abcdefghjkmnpqrstuvwxyz23456789'[b%31]).join('');
    const ins=await sb.from('trein_eventos').insert({user_id:uid,tipo:'indica_cod',tipologia:null,detalhe:{cid,quem,cod}});
    if(ins.error)throw ins.error;return cod;}
  async function abrir(){
    const {data:{session}}=await sb.auth.getSession();const uid=session&&session.user.id,cid=window.ALUNO_CID,quem=window.ALUNO_NOME;
    let md=document.getElementById('indMd');if(!md){md=document.createElement('div');md.id='indMd';md.setAttribute('role','dialog');md.setAttribute('aria-modal','true');document.body.appendChild(md);
      md.addEventListener('click',e=>{if(e.target===md)md.hidden=true;});}
    if(!uid||!cid){md.innerHTML='<div class="c"><h3>Indique e ganhe</h3><p>Escolha primeiro quem está estudando (o seu nome) para gerar o seu link.</p><button type="button" class="alt" data-x>Fechar</button></div>';md.hidden=false;md.querySelector('[data-x]').onclick=()=>md.hidden=true;return;}
    md.innerHTML='<div class="c"><p>Gerando o seu link…</p></div>';md.hidden=false;
    let cod;try{cod=await meuCodigo(uid,cid,quem);}catch(e){md.innerHTML='<div class="c"><h3>Indique e ganhe</h3><p>Não foi possível gerar o link agora. Tente de novo em instantes.</p><button type="button" class="alt" data-x>Fechar</button></div>';md.querySelector('[data-x]').onclick=()=>md.hidden=true;return;}
    const link=URLI+cod,msg='Estou estudando esquadrias de alumínio no FC Mostruário 3D, com as tipologias em 3D. Vale a pena conhecer: '+link;
    md.innerHTML=`<div class="c"><h3>🎁 Gostou? Indique e ganhe +72 horas</h3>
      <ol><li>Envie o seu link para um colega de outra empresa, vidraçaria ou serralheria.</li><li>Ele preenche o nome e o WhatsApp.</li><li>Quando a FC confirmar que ele entrou de verdade, <b>você ganha +72 horas</b> de estudo.</li></ol>
      <div class="lk"><input readonly value="${esc(link)}" aria-label="Seu link de indicação"><button type="button" data-cp>Copiar</button></div>
      <a class="b wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg)}">Enviar pelo WhatsApp</a>
      <p class="nt">O bônus é só para você, que indicou (${esc(quem||'')}). Até 3 bônus por mês. Não vale indicar a si mesmo nem repetir o mesmo WhatsApp.</p>
      <div class="st"><b>Suas indicações</b><div data-ls><span class="nt">Carregando…</span></div></div>
      <button type="button" class="alt" data-x>Fechar</button></div>`;
    md.querySelector('[data-x]').onclick=()=>md.hidden=true;
    md.querySelector('[data-cp]').onclick=e=>{const i=md.querySelector('input');i.select();(navigator.clipboard?navigator.clipboard.writeText(link):Promise.reject()).then(()=>{e.target.textContent='Copiado';}).catch(()=>{try{document.execCommand('copy');e.target.textContent='Copiado';}catch(_){}});};
    try{const {data}=await sb.rpc('trein_minhas_indicacoes',{p_cid:cid});const L=data||[];const T={novo:'aguardando a FC',aprovada:'✅ aprovada · +72 h',recusada:'não aprovada'};
      md.querySelector('[data-ls]').innerHTML=L.length?'<ul>'+L.map(x=>`<li>${esc(x.nome)} · <span class="nt">${new Date(x.em).toLocaleDateString('pt-BR')} · ${T[x.status]||x.status}</span></li>`).join('')+'</ul>':'<span class="nt">Nenhuma indicação ainda.</span>';}
    catch(_){md.querySelector('[data-ls]').innerHTML='<span class="nt">Não foi possível carregar agora.</span>';}}
  function poe(){const ub=document.getElementById('ubar'),sug=document.getElementById('sugBtn');if(!ub||!sug||document.getElementById('indBtn'))return !!document.getElementById('indBtn');
    const b=document.createElement('button');b.type='button';b.id='indBtn';b.textContent='🎁 Indique e ganhe';b.title='Indique o Mostruário e ganhe +72 horas';b.hidden=true;b.onclick=abrir;ub.insertBefore(b,sug);return true;}
  // aparece só para colaborador (não para a matriz) depois de escolher o nome
  setInterval(()=>{if(!poe())return;const b=document.getElementById('indBtn');b.hidden=!window.ALUNO_CID;},1500);
})();
