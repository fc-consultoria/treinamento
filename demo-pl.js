/* ===== Painel da Matriz · Demonstrativos da Plataforma FC 3D (link de 24 horas) =====
   16/11/2026: versão simples. Saíram os textos prontos por etapa e o quadro de abordagem (não deram resultado).
   Lista quem entrou pelo link (fc3d/clientes/demo/), avisa quando entra alguém novo e permite liberar, recusar, +24 h e pausar.
   Usa a sessão do Acesso FC da Plataforma (mesmo navegador) ou a senha da FC digitada aqui uma vez. */
(function(){
  const URL0='https://pawwncmfadzxfahfvhry.supabase.co/rest/v1/rpc/',KEY='sb_publishable_b0kGoqo85joo3Vb8Xllxhw_VemwaLMs';
  const LINK='https://fc-consultoria.github.io/fc3d/clientes/demo/',ADM='https://fc-consultoria.github.io/fc3d/clientes/empresas/';
  const KT='pfc-token-painel',KV='fc_demo_pl_vistos';
  const e=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const lg=k=>{try{return localStorage.getItem(k);}catch(_){return null;}},ls=(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}};
  const zap=w=>{let n=String(w||'').replace(/\D/g,'');if(n.length<=11)n='55'+n;return 'https://wa.me/'+n;};
  const quando=d=>{if(!d)return '—';const m=Math.round((Date.now()-new Date(d))/6e4);if(m<2)return 'agora';if(m<60)return 'há '+m+' min';const h=Math.round(m/60);if(h<24)return 'há '+h+' h';return new Date(d).toLocaleDateString('pt-BR');};
  const resta=d=>{const ms=new Date(d.expira)-Date.now();if(ms<=0)return 'terminou';const h=Math.floor(ms/36e5),mi=Math.floor(ms/6e4)%60;return 'faltam '+(h?h+' h ':'')+mi+' min';};
  const online=d=>d.visto_em&&((d.agora?new Date(d.agora):new Date())-new Date(d.visto_em))/1e3<75;
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
  function avisar(d){const o={k:'demo-'+d.id,titulo:`🧊 ${d.nome} entrou no demonstrativo`,sub:'Plataforma FC 3D · link de 24 horas',texto:'WhatsApp: '+d.whats,wa:zap(d.whats),
      fn:()=>{try{ptab('ped');}catch(_){}setTimeout(()=>{const c=document.getElementById('dplCard');if(c)c.scrollIntoView({behavior:'smooth',block:'start'});},300);}};
    if(window.alertaGrande)window.alertaGrande(o);
    try{if(document.hidden&&'Notification' in window&&Notification.permission==='granted'){const n=new Notification(o.titulo,{body:o.sub,tag:o.k,requireInteraction:true});n.onclick=()=>{window.focus();n.close();o.fn();};}}catch(_){}}
  function situacao(d){if(d.status==='pendente')return ['⏳ aguardando liberação','#8a5a00'];
    if(!d.ativo)return ['⏸ pausado','#b4372f'];if(new Date(d.expira)<=Date.now())return ['⚪ terminou','#5b6b6d'];
    return [(online(d)?'🟢 on-line agora · ':'')+resta(d),'#1d7a45'];}
  function ui(){const el=document.getElementById('dplBox'),bd=document.getElementById('tbDemo');if(!el)return;
    if(!D){if(bd)bd.textContent='';
      el.innerHTML=`<p class="note" style="margin:0 0 8px">Para ver quem entrou, informe a senha do <b>Acesso FC</b> da Plataforma uma vez (fica guardada neste navegador).</p>
       <form id="dplF" style="display:flex;gap:8px;flex-wrap:wrap"><input type="password" id="dplS" placeholder="Senha do Acesso FC" autocomplete="current-password" style="min-width:220px"><button type="submit" class="pri">Conectar</button><span class="msg" id="dplM"></span></form>`;
      document.getElementById('dplF').onsubmit=async ev=>{ev.preventDefault();const m=document.getElementById('dplM');m.textContent='Conectando…';
        try{const r=await rpc('pfc_login_matriz',{p_senha:document.getElementById('dplS').value});if(!r||r.erro){m.textContent=(r&&r.erro)||'Não conectou.';return;}
          TOK=r.token;ls(KT,r.token);m.textContent='';carregar();}catch(_){m.textContent='Não conectou. Confira a internet.';}};return;}
    const agora=Date.now(),at=D.filter(d=>d.status!=='pendente'&&d.ativo&&new Date(d.expira)>agora),pend=D.filter(d=>d.status==='pendente');
    if(bd)bd.textContent=pend.length?'⏳'+pend.length:at.length?'🧊'+at.length:'';
    el.innerHTML=`<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:0 0 10px">
       <span class="note"><b>${D.length}</b> cadastro${D.length===1?'':'s'} · <b>${at.length}</b> com acesso · <b style="color:#1d7a45">${D.filter(online).length}</b> on-line · <b style="color:#8a5a00">${pend.length}</b> aguardando</span>
       <span style="flex:1"></span><button type="button" id="dplCp">🔗 Copiar link do demonstrativo</button><a href="${ADM}" target="_blank" rel="noopener" style="font-size:13.5px">Abrir na Plataforma ↗</a></div>
     ${D.length?`<div class="tw"><table><thead><tr><th>Nome</th><th>WhatsApp</th><th>Cadastro</th><th>Situação</th><th></th></tr></thead><tbody>${D.map(d=>{const [t,c]=situacao(d);
       return `<tr><td><b>${e(d.nome)}</b>${d.tela?'<br><span class="note">vendo: '+e(d.tela)+'</span>':''}</td><td><a href="${zap(d.whats)}" target="_blank" rel="noopener">${e(d.whats)}</a></td>
        <td>${quando(d.criado)}${d.entradas?'<br><span class="note">'+d.entradas+' entrada'+(d.entradas>1?'s':'')+'</span>':''}</td><td style="color:${c};font-weight:600">${t}</td>
        <td style="white-space:nowrap">${d.status==='pendente'?`<button type="button" class="ok" data-dpl="${d.id}" data-v="1">Liberar agora</button> <button type="button" class="no" data-dpl="${d.id}" data-v="0">Recusar</button>`
          :`<button type="button" data-dpm="${d.id}">+24 h</button> <button type="button" class="${d.ativo?'no':'ok'}" data-dpa="${d.id}" data-v="${d.ativo?0:1}">${d.ativo?'Pausar':'Reativar'}</button>`}</td></tr>`;}).join('')}</tbody></table></div>`
      :'<p class="note" style="margin:0">Ninguém entrou pelo demonstrativo ainda. Quando alguém se cadastrar, aparece aqui e o painel avisa.</p>'}`;
    document.getElementById('dplCp').onclick=async ev=>{try{await navigator.clipboard.writeText(LINK);ev.target.textContent='✔ Link copiado';}catch(_){prompt('Copie o link:',LINK);}setTimeout(()=>{ev.target.textContent='🔗 Copiar link do demonstrativo';},2500);};
    el.querySelectorAll('[data-dpl]').forEach(b=>b.onclick=async()=>{if(b.dataset.v==='0'&&!confirm('Recusar este pedido? A pessoa não vai conseguir entrar.'))return;b.disabled=true;
      try{await rpc('pfc_adm_demo_liberar',{p_token:TOK,p_id:b.dataset.dpl,p_liberar:b.dataset.v==='1'});}catch(x){alert(x.message);}carregar();});
    el.querySelectorAll('[data-dpm]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await rpc('pfc_adm_demo',{p_token:TOK,p_id:b.dataset.dpm,p_ativo:true,p_mais_dias:1});}catch(x){alert(x.message);}carregar();});
    el.querySelectorAll('[data-dpa]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await rpc('pfc_adm_demo',{p_token:TOK,p_id:b.dataset.dpa,p_ativo:b.dataset.v==='1'});}catch(x){alert(x.message);}carregar();});}
  setTimeout(carregar,3500);setInterval(carregar,30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)carregar();});
  window.FCDemoPl={carregar};
})();
