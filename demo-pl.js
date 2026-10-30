/* ===== Painel da Matriz · Demonstrativos da Plataforma FC 3D =====
   Lista quem entrou pelo link de 3 dias (fc3d/clientes/demo/) e avisa com som quando entra alguém novo.
   Usa a sessão do Acesso FC da Plataforma (mesmo navegador) ou a senha da FC digitada aqui uma vez. */
(function(){
  const URL0='https://pawwncmfadzxfahfvhry.supabase.co/rest/v1/rpc/',KEY='sb_publishable_b0kGoqo85joo3Vb8Xllxhw_VemwaLMs';
  const LINK='https://fc-consultoria.github.io/fc3d/clientes/demo/',ADM='https://fc-consultoria.github.io/fc3d/clientes/empresas/';
  const KT='pfc-token-painel',KV='fc_demo_pl_vistos';
  const e=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const lg=k=>{try{return localStorage.getItem(k);}catch(_){return null;}},ls=(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}};
  const zap=w=>{let n=String(w||'').replace(/\D/g,'');if(n.length<=11)n='55'+n;return 'https://wa.me/'+n;};
  const quando=d=>{if(!d)return '—';const m=Math.round((Date.now()-new Date(d))/6e4);if(m<2)return 'agora';if(m<60)return 'há '+m+' min';const h=Math.round(m/60);if(h<24)return 'há '+h+' h';return new Date(d).toLocaleDateString('pt-BR');};
  /* ---- Textos prontos por etapa (edite aqui para mudar o padrão) ---- */
  const ETAPAS=[
    ['boas','1 · Boas-vindas',d=>`Olá, ${d.n}! Aqui é o Fernando, da FC Consultoria em Esquadria. 👋

Seu acesso ao demonstrativo da Plataforma FC 3D está liberado até ${d.ate}.

Lá você vê as tipologias das linhas Suprema e Gold em 3D: desmonta peça por peça, vê o código de cada perfil e os cortes das junções.

Link: ${LINK}

Qualquer dúvida, me chama aqui.`],
    ['dica','2 · Acompanhamento',d=>`Oi, ${d.n}! Tudo certo com o demonstrativo da Plataforma FC 3D?

Uma dica: abra uma tipologia e use o "Conhecer a esquadria". Dá para trocar perfis e simular a pressão de vento sem sair da tela.

Seu acesso vai até ${d.ate}. Se quiser, te mostro como a sua equipe pode usar no dia a dia.`],
    ['ultimo','3 · Último dia',d=>`${d.n}, seu demonstrativo da Plataforma FC 3D termina ${d.ate}.

Se a ferramenta fez sentido para você ou para a sua equipe, me responde aqui que te apresento os planos de licença anual.`],
    ['fim','4 · Terminou',d=>`Olá, ${d.n}! Seu período de demonstrativo da Plataforma FC 3D terminou.

Obrigado por conhecer a ferramenta! Se quiser continuar usando com a sua equipe, me responde aqui que te passo os planos e valores.

Fernando · FC Consultoria em Esquadria`],
    ['mais','Mais 3 dias',d=>`${d.n}, liberei mais 3 dias no seu demonstrativo da Plataforma FC 3D. Agora vai até ${d.ate}.

Link: ${LINK}`]];
  const DIAS=['dom','seg','ter','qua','qui','sex','sáb'];
  const fdt=x=>{const t=new Date(x);return DIAS[t.getDay()]+' '+t.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit'})+' às '+t.toLocaleString('pt-BR',{hour:'2-digit',minute:'2-digit'});};
  const etapaAuto=d=>{const ag=Date.now(),fim=new Date(d.expira)-ag,ini=ag-new Date(d.criado);
    if(!d.ativo||fim<=0)return 'fim';if(fim<24*36e5)return 'ultimo';if(ini>=24*36e5)return 'dica';return 'boas';};
  const ESC={},ED={};  /* etapa escolhida à mão e texto editado, por pessoa (sobrevivem à atualização de 1 min) */
  const etapaDe=d=>ESC[d.id]||etapaAuto(d);
  const textoDe=d=>{const k=etapaDe(d),ed=ED[d.id+'|'+k];if(ed!=null)return ed;
    const n=String(d.nome||'').trim().split(/\s+/)[0]||'tudo bem';return ETAPAS.find(x=>x[0]===k)[2]({n,ate:fdt(d.expira)});};
  const KE='fc_demo_msg_env',envs=()=>{try{return JSON.parse(lg(KE))||{};}catch(_){return {};}};
  const marcar=(id,k)=>{const o=envs();o[id+'|'+k]=Date.now();ls(KE,JSON.stringify(o));};
  async function rpc(fn,a){const r=await fetch(URL0+fn,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(a||{})});
    const j=await r.json().catch(()=>null);if(!r.ok)throw new Error((j&&(j.message||j.hint))||'Falha');return j;}
  let TOK=null,D=null,primeira=true;
  async function token(){for(const t of [TOK,lg(KT),lg('pfc-token')]){if(!t)continue;try{await rpc('pfc_adm_demo_lista',{p_token:t});TOK=t;return t;}catch(_){}}TOK=null;return null;}
  async function carregar(){if(!TOK&&!await token()){D=null;ui();return;}
    try{D=await rpc('pfc_adm_demo_lista',{p_token:TOK})||[];}catch(_){TOK=null;D=null;ui();return;}
    let vis=[];try{vis=JSON.parse(lg(KV))||[];}catch(_){}
    const nov=D.filter(d=>!vis.includes(d.id));
    if(nov.length&&!(primeira&&!vis.length))nov.forEach(avisar);
    ls(KV,JSON.stringify(D.map(d=>d.id).slice(0,500)));primeira=false;ui();}
  function avisar(d){const o={k:'demo-'+d.id,titulo:`🧊 ${d.nome} (${d.empresa}) entrou no demonstrativo`,sub:'Plataforma FC 3D · link de 3 dias'+(d.cidade?' · '+d.cidade:''),texto:'WhatsApp: '+d.whats,wa:zap(d.whats),
      fn:()=>{try{ptab('ped');}catch(_){}setTimeout(()=>{const c=document.getElementById('dplCard');if(c)c.scrollIntoView({behavior:'smooth',block:'start'});},300);}};
    if(window.alertaGrande)window.alertaGrande(o);
    try{if(document.hidden&&'Notification' in window&&Notification.permission==='granted'){const n=new Notification(o.titulo,{body:o.sub,tag:o.k,requireInteraction:true});n.onclick=()=>{window.focus();n.close();o.fn();};}}catch(_){}}
  function celMsg(d){const k=etapaDe(d),env=envs()[d.id+'|'+k],auto=!ESC[d.id];
    return `<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;flex-wrap:wrap">
      <select data-dme="${d.id}" style="font-size:12.5px;padding:3px 6px">${ETAPAS.map(x=>`<option value="${x[0]}"${x[0]===k?' selected':''}>${x[1]}${x[0]===etapaAuto(d)?' (agora)':''}</option>`).join('')}</select>
      ${env?`<span style="font-size:12px;color:#1d7a45">✔ enviado ${quando(env)}</span>`:(auto?'<span style="font-size:12px;color:#8a5a00">● a enviar</span>':'')}</div>
     <textarea data-dmt="${d.id}" rows="4" style="width:100%;font-size:12.5px;line-height:1.35;resize:vertical;box-sizing:border-box">${e(textoDe(d))}</textarea>
     <div style="display:flex;gap:6px;margin-top:4px"><button type="button" data-dmc="${d.id}">📋 Copiar</button>
      <a href="#" data-dmw="${d.id}" style="font-size:13px;align-self:center">💬 Abrir no WhatsApp com o texto</a></div>`;}
  function ui(){if(document.activeElement&&document.activeElement.matches&&document.activeElement.matches('[data-dmt]'))return; /* não apaga enquanto edita */const el=document.getElementById('dplBox'),bd=document.getElementById('tbDemo');if(!el)return;
    if(!D){if(bd)bd.textContent='';
      el.innerHTML=`<p class="note" style="margin:0 0 8px">Para ver quem entrou, informe a senha do <b>Acesso FC</b> da Plataforma uma vez (fica guardada neste navegador).</p>
       <form id="dplF" style="display:flex;gap:8px;flex-wrap:wrap"><input type="password" id="dplS" placeholder="Senha do Acesso FC" autocomplete="current-password" style="min-width:220px"><button type="submit" class="pri">Conectar</button><span class="msg" id="dplM"></span></form>`;
      document.getElementById('dplF').onsubmit=async ev=>{ev.preventDefault();const m=document.getElementById('dplM');m.textContent='Conectando…';
        try{const r=await rpc('pfc_login_matriz',{p_senha:document.getElementById('dplS').value});if(!r||r.erro){m.textContent=(r&&r.erro)||'Não conectou.';return;}
          TOK=r.token;ls(KT,r.token);m.textContent='';carregar();}catch(_){m.textContent='Não conectou. Confira a internet.';}};return;}
    const agora=Date.now(),at=D.filter(d=>d.ativo&&new Date(d.expira)>agora),hoje=D.filter(d=>new Date(d.criado).toDateString()===new Date().toDateString()).length;
    if(bd)bd.textContent=at.length?'🧊'+at.length:'';
    const st=d=>!d.ativo?['Pausado','#b3261e']:new Date(d.expira)<agora?['Terminou','#8a5a00']:['Ativo até '+new Date(d.expira).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}),'#1d7a45'];
    el.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px"><span class="note">${D.length} cadastro${D.length===1?'':'s'} · ${at.length} ativo${at.length===1?'':'s'} · ${hoje} hoje</span><span style="flex:1"></span>
      <button type="button" id="dplCp">🔗 Copiar link do demonstrativo</button><a href="${ADM}" target="_blank" rel="noopener" style="font-size:13.5px">Abrir na Plataforma ↗</a></div>
     ${D.length?`<div class="tw"><table><thead><tr><th>Nome</th><th>Empresa · cidade</th><th>Entrou</th><th>Situação</th><th></th><th>Mensagem da etapa · copie e envie</th></tr></thead><tbody>${D.map(d=>{const [t,c]=st(d);return `<tr>
      <td><b>${e(d.nome)}</b><br><a href="${zap(d.whats)}" target="_blank" rel="noopener">💬 ${e(d.whats)}</a></td>
      <td>${e(d.empresa)}${d.cidade?'<br><span class="note">'+e(d.cidade)+'</span>':''}</td>
      <td>${new Date(d.criado).toLocaleDateString('pt-BR')}<br><span class="note">último: ${quando(d.ultimo)} · ${d.entradas||1}x</span></td>
      <td><b style="color:${c}">${t}</b></td>
      <td style="white-space:nowrap"><button type="button" data-dpm="${d.id}">+3 dias</button> <button type="button" class="${d.ativo?'no':'ok'}" data-dpa="${d.id}" data-v="${d.ativo?0:1}">${d.ativo?'Pausar':'Reativar'}</button></td>
      <td style="min-width:300px;vertical-align:top">${celMsg(d)}</td></tr>`;}).join('')}</tbody></table></div>`
      :'<p class="note" style="margin:0">Ninguém entrou pelo demonstrativo ainda. Copie o link e envie no WhatsApp: quando alguém entrar, aparece aqui e o painel avisa com som.</p>'}`;
    document.getElementById('dplCp').onclick=async ev=>{try{await navigator.clipboard.writeText(LINK);ev.target.textContent='✔ Link copiado';}catch(_){prompt('Copie o link:',LINK);}setTimeout(()=>{ev.target.textContent='🔗 Copiar link do demonstrativo';},2500);};
    el.querySelectorAll('[data-dpm]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await rpc('pfc_adm_demo',{p_token:TOK,p_id:b.dataset.dpm,p_ativo:true,p_mais_dias:3});ESC[b.dataset.dpm]='mais';}catch(x){alert(x.message);}carregar();});
    el.querySelectorAll('[data-dpa]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await rpc('pfc_adm_demo',{p_token:TOK,p_id:b.dataset.dpa,p_ativo:b.dataset.v==='1'});}catch(x){alert(x.message);}carregar();});
    ligaMsg(el);}
  function ligaMsg(el){const pega=id=>D.find(x=>String(x.id)===String(id));
    el.querySelectorAll('[data-dme]').forEach(sel=>sel.onchange=()=>{const d=pega(sel.dataset.dme);ESC[d.id]=sel.value===etapaAuto(d)?undefined:sel.value;if(!ESC[d.id])delete ESC[d.id];ui();});
    el.querySelectorAll('[data-dmt]').forEach(t=>t.oninput=()=>{const d=pega(t.dataset.dmt);ED[d.id+'|'+etapaDe(d)]=t.value;});
    el.querySelectorAll('[data-dmc]').forEach(b=>b.onclick=async()=>{const d=pega(b.dataset.dmc),tx=el.querySelector(`[data-dmt="${d.id}"]`).value;
      try{await navigator.clipboard.writeText(tx);}catch(_){prompt('Copie o texto:',tx);}marcar(d.id,etapaDe(d));b.textContent='✔ Copiado';setTimeout(ui,1500);});
    el.querySelectorAll('[data-dmw]').forEach(a=>a.onclick=ev=>{ev.preventDefault();const d=pega(a.dataset.dmw),tx=el.querySelector(`[data-dmt="${d.id}"]`).value;
      window.open(zap(d.whats)+'?text='+encodeURIComponent(tx),'_blank','noopener');marcar(d.id,etapaDe(d));setTimeout(ui,800);});}
  setTimeout(carregar,3500);setInterval(carregar,60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)carregar();});
  window.FCDemoPl={carregar};
})();
