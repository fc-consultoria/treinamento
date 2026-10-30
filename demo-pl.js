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
  function ui(){const el=document.getElementById('dplBox'),bd=document.getElementById('tbDemo');if(!el)return;
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
     ${D.length?`<div class="tw"><table><thead><tr><th>Nome</th><th>Empresa · cidade</th><th>Entrou</th><th>Situação</th><th></th></tr></thead><tbody>${D.map(d=>{const [t,c]=st(d);return `<tr>
      <td><b>${e(d.nome)}</b><br><a href="${zap(d.whats)}" target="_blank" rel="noopener">💬 ${e(d.whats)}</a></td>
      <td>${e(d.empresa)}${d.cidade?'<br><span class="note">'+e(d.cidade)+'</span>':''}</td>
      <td>${new Date(d.criado).toLocaleDateString('pt-BR')}<br><span class="note">último: ${quando(d.ultimo)} · ${d.entradas||1}x</span></td>
      <td><b style="color:${c}">${t}</b></td>
      <td style="white-space:nowrap"><button type="button" data-dpm="${d.id}">+3 dias</button> <button type="button" class="${d.ativo?'no':'ok'}" data-dpa="${d.id}" data-v="${d.ativo?0:1}">${d.ativo?'Pausar':'Reativar'}</button></td></tr>`;}).join('')}</tbody></table></div>`
      :'<p class="note" style="margin:0">Ninguém entrou pelo demonstrativo ainda. Copie o link e envie no WhatsApp: quando alguém entrar, aparece aqui e o painel avisa com som.</p>'}`;
    document.getElementById('dplCp').onclick=async ev=>{try{await navigator.clipboard.writeText(LINK);ev.target.textContent='✔ Link copiado';}catch(_){prompt('Copie o link:',LINK);}setTimeout(()=>{ev.target.textContent='🔗 Copiar link do demonstrativo';},2500);};
    el.querySelectorAll('[data-dpm]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await rpc('pfc_adm_demo',{p_token:TOK,p_id:b.dataset.dpm,p_ativo:true,p_mais_dias:3});}catch(x){alert(x.message);}carregar();});
    el.querySelectorAll('[data-dpa]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await rpc('pfc_adm_demo',{p_token:TOK,p_id:b.dataset.dpa,p_ativo:b.dataset.v==='1'});}catch(x){alert(x.message);}carregar();});}
  setTimeout(carregar,3500);setInterval(carregar,60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)carregar();});
  window.FCDemoPl={carregar};
})();
