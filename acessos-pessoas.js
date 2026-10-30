/* Acessos por pessoa: cadastro (Matriz) das pessoas de cada empresa cliente, com login, senha e papel.
   Abre com window.abrirAcessos(empresaId, nomeEmpresa). Usa as funções emp_* do Supabase. */
(function(){
const PAPEIS=[['gestor','Gestor geral','Vê todas as abas liberadas da empresa'],['compras','Compras','Onde comprar, distribuidoras, estoque, planilhas, conversor, agenda, solicitações'],
 ['vendas','Vendas','Entra direto no Painel de Vendas como vendedor'],['gerente','Gerente comercial','Painel de Vendas (visão gestor) e catálogo'],
 ['marketing','Marketing','Catálogo'],['fabrica','Fábrica','Treinamento 3D e catálogo'],['estoque','Estoque','Estoque (importação), pesquisa de código, conversor, catálogo, treinamento, agenda e solicitações']];
const PADRAO={gestor:null,compras:['comp','dist','est','pla','conv','age','sol'],vendas:['orc','pcod'],gerente:['orc','cat','pcod'],marketing:['cat'],fabrica:['esq','cat'],estoque:['est','pcod','conv','cat','esq','ori','sol','age']};
const PN=Object.fromEntries(PAPEIS.map(p=>[p[0],p[1]]));
const PLAT_URL='https://fc-consultoria.github.io/fc3d/clientes/',PLAT_EMP=['gs'];/* empresas cuja equipe usa um link só: a Plataforma FC 3D (entrar e primeiro acesso) */
const LINKCAD=e=>PLAT_EMP.includes(e)?PLAT_URL:'https://fc-consultoria.github.io/treinamento/cadastro.html?e='+encodeURIComponent(e);
const LINK=e=>PLAT_EMP.includes(e)?PLAT_URL:'https://fc-consultoria.github.io/treinamento/consultorias.html?e='+encodeURIComponent(e);
const h=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dt=t=>t?new Date(t).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'nunca';
const abasTodas=()=>{try{return (typeof ABAS!=='undefined'?ABAS:[]).filter(a=>typeof CLI_ABAS==='undefined'||CLI_ABAS.includes(a[0]));}catch(_){return [];}};
const nomeAba=(k,emp)=>{const a=abasTodas().find(x=>x[0]===k);return a?a[1].replace('{cli}',emp):k;};
const senhaNova=()=>{const c='abcdefghjkmnpqrstuvwxyz23456789';const a=new Uint8Array(6);crypto.getRandomValues(a);return Array.from(a,b=>c[b%c.length]).join('');};
const ACAO={login:'entrou',falha:'errou a senha'};

window.abrirAcessos=async function(emp,empNome){
  let L=[],EV=[],ed=null,msg='',msgTel='',msgId='';
  const w=document.createElement('div');
  w.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(10,20,26,.55);display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow:auto';
  document.body.appendChild(w);
  const carregar=async()=>{const [a,b]=await Promise.all([sb.rpc('emp_pessoas_lista',{p_emp:emp}),sb.rpc('emp_eventos_lista',{p_emp:emp,p_lim:40})]);
    if(a.error){alert('Não carregou: '+a.error.message);}L=a.data||[];EV=b.data||[];pinta();};
  const form=p=>{const ab=p.abas||PADRAO[p.papel]||[];const usaPad=!p.abas;
    return `<div class="box" style="margin:0;display:flex;flex-direction:column;gap:10px;border:2px solid var(--accent)">
     <b>${p.pendente?'Liberar acesso · escolha o setor':p.id?'Editar acesso':'Novo acesso'}</b>${p.pendente?`<p class="nota" style="margin:0">Telefone ${h(p.telefone||p.login)} · a pessoa entra com o telefone e a senha que ela criou. Deixe a senha vazia para manter a dela.</p>`:''}
     <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
      <label class="nota" style="color:var(--fg);font-weight:600">Nome<input class="inpx" id="apN" value="${h(p.nome||'')}" style="display:block;width:100%;margin-top:4px"></label>
      <label class="nota" style="color:var(--fg);font-weight:600">Login<input class="inpx" id="apL" value="${h(p.login||'')}" autocapitalize="none" style="display:block;width:100%;margin-top:4px"></label>
      <label class="nota" style="color:var(--fg);font-weight:600">Papel<select class="inpx" id="apP" style="display:block;width:100%;margin-top:4px">${PAPEIS.map(x=>`<option value="${x[0]}" ${x[0]===p.papel?'selected':''}>${x[1]}</option>`).join('')}</select></label>
      <label class="nota" style="color:var(--fg);font-weight:600">${p.id?(p.senha?'Senha (altere para trocar)':'Nova senha (vazio = manter a atual)'):'Senha'}<span style="display:flex;gap:6px;margin-top:4px"><input class="inpx" id="apS" value="${h(p.id?(p.senha||''):senhaNova())}" autocapitalize="none" autocomplete="off" style="flex:1;min-width:0"><button class="mini" type="button" id="apG" title="Gerar outra senha">🎲</button></span></label>
     </div>
     <p class="nota" id="apPD" style="margin:0">${h((PAPEIS.find(x=>x[0]===(p.papel||'compras'))||[])[2]||'')}</p>
     <div><label class="nota" style="display:flex;gap:6px;align-items:center;color:var(--fg);font-weight:600"><input type="checkbox" id="apPad" ${usaPad?'checked':''}> Usar as abas padrão do papel</label>
      <div id="apAbas" style="display:${usaPad?'none':'flex'};gap:6px;flex-wrap:wrap;margin-top:8px">${abasTodas().map(a=>`<label class="mini" style="display:inline-flex;gap:4px;align-items:center"><input type="checkbox" data-ab="${a[0]}" ${ab.includes(a[0])?'checked':''}> ${h(a[1].replace('{cli}',empNome))}</label>`).join('')}</div></div>
     <label class="nota" style="display:flex;gap:6px;align-items:center;color:var(--fg)"><input type="checkbox" id="apA" ${p.ativo!==false?'checked':''}> Acesso ativo</label>
     <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="button" id="apOk" style="background:var(--accent);color:#fff;border-color:var(--accent)">${p.pendente?'Liberar acesso':'Salvar'}</button><button class="btn" type="button" id="apCx">Cancelar</button><span class="nota" id="apSt"></span></div></div>`;};
  const plat=()=>({cb:'Plataforma Casa Bandeirante & FC 3D',gb:'Plataforma Guaporé Vidros & FC 3D',gs:'Plataforma FC 3D'})[emp]||('área da '+empNome+' na FC Consultoria');
  const textoLib=(p,senha)=>{const tel=p.telefone||p.login;return `Olá, ${String(p.nome||'').split(' ')[0]}! Seu acesso à ${plat()} foi liberado ✅\nSetor: ${PN[p.papel]||p.papel}\n\nEntre por aqui: ${LINK(emp)}\nLogin: seu telefone ${tel}\nSenha: ${senha?senha:'a que você criou no cadastro'}\n\nNo primeiro acesso, o tutorial mostra como usar. Dúvidas: (66) 9 9986-7984`;};
  const caixaMsg=()=>`<div class="box" id="apMsgBox" style="margin:6px 0 0;background:var(--ok-soft);border:2px solid var(--ok,#1f8a4c)"><span class="nota" style="color:var(--fg);font-weight:700">✅ Mensagem pronta para mandar${msgTel?' no WhatsApp da pessoa':''}</span><textarea id="apMsg" class="inpx" rows="9" style="display:block;width:100%;margin-top:6px">${h(msg)}</textarea><div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap"><a class="mini" target="_blank" rel="noopener" style="text-decoration:none;background:#1f9d55;color:#fff;border-color:#1f9d55" id="apWa" href="https://wa.me/${msgTel?'55'+msgTel:''}?text=${encodeURIComponent(msg)}">📲 Enviar no WhatsApp</a><button class="mini" type="button" id="apCpM">📋 Copiar</button><button class="mini" type="button" id="apMsgX">Fechar</button></div></div>`;
  const pinta=()=>{
    w.innerHTML=`<div style="background:var(--surface);color:var(--fg);border-radius:16px;max-width:860px;width:100%;padding:18px 20px;display:flex;flex-direction:column;gap:14px">
     <div style="display:flex;align-items:center;gap:10px"><div style="flex:1;min-width:0"><div class="eyebrow">Acessos por pessoa</div><b style="font-size:20px">${h(empNome)}</b></div><button class="btn" type="button" id="apX">Fechar</button></div>
${PLAT_EMP.includes(emp)?`     <div class="box" style="margin:0"><span class="nota">Link único da equipe · Plataforma FC 3D (entrar e primeiro acesso no mesmo link)</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;align-items:center"><code style="flex:1;min-width:0;word-break:break-all">${LINK(emp)}</code><button class="mini" type="button" id="apCpL">Copiar</button><a class="mini" href="${LINK(emp)}" target="_blank" rel="noopener" style="text-decoration:none">Abrir</a></div>
      <p class="nota" style="margin:6px 0 0">Quem ainda não tem acesso toca em “Primeiro acesso da equipe”, escolhe ${h(empNome)} e o pedido aparece aqui para você liberar.</p><button type="button" id="apCpC" hidden></button></div>`:`     <div class="box" style="margin:0"><span class="nota">Link de entrada da equipe (cada pessoa usa o próprio login e senha)</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;align-items:center"><code style="flex:1;min-width:0;word-break:break-all">${LINK(emp)}</code><button class="mini" type="button" id="apCpL">Copiar</button><a class="mini" href="${LINK(emp)}" target="_blank" rel="noopener" style="text-decoration:none">Abrir</a></div></div>
     <div class="box" style="margin:0"><span class="nota">Link de primeiro acesso (a pessoa cadastra nome, telefone e senha; você libera aqui)</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;align-items:center"><code style="flex:1;min-width:0;word-break:break-all">${LINKCAD(emp)}</code><button class="mini" type="button" id="apCpC">Copiar</button><a class="mini" href="${LINKCAD(emp)}" target="_blank" rel="noopener" style="text-decoration:none">Abrir</a></div>
      <p class="nota" style="margin:6px 0 0">Só funciona com o cadastro aberto para a empresa (Central do Cliente).</p></div>`}
     ${L.some(p=>p.pendente)?`<div class="box" style="margin:0;border:2px solid #e0b100;background:var(--warn-soft,#fff7e0)"><b style="font-size:15px">🕓 Aguardando liberação · ${L.filter(p=>p.pendente).length}</b>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">${L.filter(p=>p.pendente).map(p=>`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:180px"><b>${h(p.nome)}</b><div class="nota">${h(p.telefone||p.login)} · pediu em ${dt(p.criado_em)}</div></div>
        <button class="mini" type="button" data-aplib="${p.id}" style="background:var(--accent);color:#fff;border-color:var(--accent)">✓ Liberar</button><button class="mini" type="button" data-aprec="${p.id}">Recusar</button></div>${ed&&ed.id===p.id?form(ed):''}`).join('')}</div></div>`:''}
     ${msg&&!msgId?caixaMsg():''}
     ${ed&&!ed.id?form(ed):(ed?'':`<div><button class="btn" type="button" id="apNovo">＋ Cadastrar pessoa</button></div>`)}
     <div style="display:flex;flex-direction:column;gap:6px">${L.filter(p=>!p.pendente).length?L.filter(p=>!p.pendente).map(p=>`<div class="box" style="margin:0;display:flex;gap:10px;align-items:center;flex-wrap:wrap;${p.ativo?'':'opacity:.55'}">
        <div style="flex:1;min-width:200px"><b>${h(p.nome)}</b> <span class="pill p-mut">${h(PN[p.papel]||p.papel)}</span>${p.ativo?'':' <span class="pill p-mut">desativado</span>'}<div class="nota">login <b>${h(p.login)}</b> · senha ${p.senha?`<b style="font-family:var(--f-mono,monospace);color:var(--fg);background:var(--ok-soft,#e8f5ee);padding:1px 7px;border-radius:6px">${h(p.senha)}</b>`:(p.telefone?'<i>criada pela pessoa no cadastro</i>':'<i title="Senha criada antes desta versão: gere uma nova em Editar para ela ficar visível aqui">não visível · gere nova em Editar</i>')} · último acesso ${dt(p.ultimo_acesso)}${p.abas?' · abas personalizadas':''}</div></div>
        ${p.senha?`<button class="mini" type="button" data-apcs="${p.id}" title="Copia login, senha e link para mandar à pessoa">📋 Copiar acesso</button>`:''}${p.ativo&&(p.telefone||/^\d{10,11}$/.test(p.login||''))?`<button class="mini" type="button" data-apmsg="${p.id}" title="Mensagem curta de liberação para mandar à pessoa">📲 Mensagem</button>`:''}<button class="mini" type="button" data-aped="${p.id}">✏️ Editar</button></div>${msg&&msgId===p.id?caixaMsg():''}${ed&&ed.id===p.id?form(ed):''}`).join(''):'<p class="nota" style="margin:0">Ninguém cadastrado ainda.</p>'}</div>
     <div><b style="font-size:15px">Atividade recente</b><div style="display:flex;flex-direction:column;gap:2px;margin-top:6px;max-height:260px;overflow:auto">${EV.length?EV.map(x=>`<div class="nota" style="color:var(--fg)">${dt(x.em)} · <b>${h(x.nome||(x.detalhe&&x.detalhe.login)||'?')}</b> ${x.area==='aba'?'abriu '+h(nomeAba(x.acao,empNome)):h(ACAO[x.acao]||x.acao)}</div>`).join(''):'<span class="nota">Sem atividade ainda.</span>'}</div></div></div>`;
    liga();};
  const liga=()=>{
    const q=s=>w.querySelector(s);
    q('#apX').onclick=()=>w.remove();
    q('#apCpL').onclick=()=>navigator.clipboard.writeText(LINK(emp));
    q('#apCpC').onclick=()=>navigator.clipboard.writeText(LINKCAD(emp));
    w.querySelectorAll('[data-aplib]').forEach(b=>b.onclick=()=>{const id=b.dataset.aplib;if(ed&&ed.id===id){ed=null;pinta();return;}ed=Object.assign({},L.find(x=>x.id===id),{ativo:true});msg='';pinta();
      const f=q('#apP');if(f){f.closest('.box').scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>f.focus({preventScroll:true}),300);}});
    w.querySelectorAll('[data-aprec]').forEach(b=>b.onclick=async()=>{const p=L.find(x=>x.id===b.dataset.aprec);if(!p||!confirm('Recusar o cadastro de '+p.nome+'? O pedido será apagado.'))return;
      const r=await sb.rpc('emp_pessoa_recusar',{p_id:p.id});if(r.error){alert('Não foi possível recusar: '+r.error.message);return;}ed=null;msg='';await carregar();});
    if(q('#apCpM'))q('#apCpM').onclick=()=>navigator.clipboard.writeText(q('#apMsg').value).then(()=>{q('#apCpM').textContent='✓ Copiado';setTimeout(()=>{const b=q('#apCpM');if(b)b.textContent='📋 Copiar';},1500);});
    if(q('#apMsg'))q('#apMsg').oninput=e=>{msg=e.target.value;const a=q('#apWa');if(a)a.href='https://wa.me/'+(msgTel?'55'+msgTel:'')+'?text='+encodeURIComponent(msg);};
    if(q('#apMsgX'))q('#apMsgX').onclick=()=>{msg='';msgId='';msgTel='';pinta();};
    w.querySelectorAll('[data-apmsg]').forEach(b=>b.onclick=()=>{const p=L.find(x=>x.id===b.dataset.apmsg);if(!p)return;if(msgId===p.id&&msg){msg='';msgId='';pinta();return;}
      msg=textoLib(p,p.senha||'');msgId=p.id;msgTel=String(p.telefone||p.login||'').replace(/\D/g,'');ed=null;pinta();const x=q('#apMsgBox');if(x)x.scrollIntoView({behavior:'smooth',block:'center'});});
    if(q('#apNovo'))q('#apNovo').onclick=()=>{ed={papel:'compras',ativo:true};msg='';pinta();q('#apN').focus();};
    w.querySelectorAll('[data-aped]').forEach(b=>b.onclick=()=>{const id=b.dataset.aped;if(ed&&ed.id===id){ed=null;pinta();return;}ed=Object.assign({},L.find(x=>x.id===id));msg='';pinta();
      const f=q('#apN');if(f){f.closest('.box').scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>f.focus({preventScroll:true}),300);}});
    w.querySelectorAll('[data-apcs]').forEach(b=>b.onclick=()=>{const p=L.find(x=>x.id===b.dataset.apcs);if(!p)return;
      navigator.clipboard.writeText(`Olá, ${p.nome.split(' ')[0]}! Seu acesso à área da ${empNome} na FC Consultoria:\n\nLink: ${LINK(emp)}\nLogin: ${p.login}\nSenha: ${p.senha}\n\nDúvidas: (66) 9 9986-7984.`).then(()=>{b.textContent='✓ Copiado';setTimeout(()=>{b.textContent='📋 Copiar acesso';},1500);});});
    if(!ed)return;
    q('#apCx').onclick=()=>{ed=null;pinta();};
    q('#apG').onclick=()=>{q('#apS').value=senhaNova();};
    q('#apPad').onchange=e=>{q('#apAbas').style.display=e.target.checked?'none':'flex';};
    q('#apP').onchange=e=>{const pp=e.target.value;q('#apPD').textContent=(PAPEIS.find(x=>x[0]===pp)||[])[2]||'';
      const pad=PADRAO[pp];w.querySelectorAll('[data-ab]').forEach(c=>{c.checked=pad?pad.includes(c.dataset.ab):true;});};
    q('#apOk').onclick=async()=>{const st=q('#apSt'),nome=q('#apN').value.trim(),login=q('#apL').value.trim().toLowerCase(),papel=q('#apP').value,senha0=q('#apS').value.trim(),senha=(ed.id&&senha0===(ed.senha||''))?'':senha0;
      const abas=q('#apPad').checked?null:[...w.querySelectorAll('[data-ab]:checked')].map(c=>c.dataset.ab);
      st.textContent='Salvando…';
      const r=await sb.rpc('emp_pessoa_salvar',{p_id:ed.id||null,p_emp:emp,p_nome:nome,p_login:login,p_papel:papel,p_abas:abas,p_ativo:q('#apA').checked,p_senha:senha||null});
      if(r.error){st.textContent='⚠ '+r.error.message;return;}
      const lib=ed.pendente&&q('#apA').checked,tel=ed.telefone||login;msgTel=lib?String(tel).replace(/\D/g,''):'';const eid=ed.id;
      msgId=lib?eid:'';
      msg=lib?textoLib({nome,papel,telefone:tel,login},senha):senha?`Olá, ${nome.split(' ')[0]}! Seu acesso à área da ${empNome} na FC Consultoria está pronto.\n\nLink: ${LINK(emp)}\nLogin: ${login}\nSenha: ${senha}\n\nGuarde esses dados. Dúvidas: (66) 9 9986-7984.`:'';
      ed=null;await carregar();if(msgId){const x=q('#apMsgBox');if(x)x.scrollIntoView({behavior:'smooth',block:'center'});}};
  };
  w.onclick=ev=>{if(ev.target===w)w.remove();};
  pinta();carregar();
};
})();
