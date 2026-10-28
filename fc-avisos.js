/* ===== Painel da Matriz · avisos de tudo o que chega para a FC =====
   Vigia (também com o painel em segundo plano ou minimizado) e mostra o alerta grande com som,
   título piscando e notificação do computador:
   cadastros novos da equipe, mensagens das equipes, suporte dos vendedores e solicitações dos clientes.
   RPC fc_avisos_novos(p_desde). Precisa do painel aberto em alguma aba do navegador. */
(function(){
  if(typeof sb==='undefined')return;
  let desde=null,rodando=false;
  const NP=()=>('Notification' in window)?Notification.permission:'denied';
  const TIPO={
    cadastro:i=>({titulo:`🆕 ${i.nome} pediu acesso · ${i.emp_nome||i.emp}`,sub:'Cadastro da equipe aguardando sua liberação',texto:i.texto?'Telefone: '+i.texto:'',
      fn:()=>window.open('consultorias.html?ver='+encodeURIComponent(i.emp)+'&abrir=acessos','_blank','noopener')}),
    conversa:i=>({titulo:`💬 ${i.nome||'Equipe'} (${i.emp_nome||i.emp}) mandou mensagem`,sub:'Conversa da equipe com a FC',texto:i.texto,
      fn:()=>{if(window.FCConversas&&FCConversas.abrirMatriz)FCConversas.abrirMatriz();}}),
    suporte:i=>({titulo:`🛟 ${i.nome||'Vendedor'} (${i.emp_nome||i.emp}) pediu suporte`,sub:'Suporte do Painel de Vendas',texto:i.texto,
      fn:()=>{try{ptab('sim');}catch(_){}setTimeout(()=>{const c=document.getElementById('osupCard');if(c)c.scrollIntoView({behavior:'smooth',block:'start'});window.osupAbrir&&osupAbrir(i.id);},300);}}),
    solicitacao:i=>({titulo:`📨 ${i.nome||'Cliente'} (${i.emp_nome||i.emp}) mandou uma solicitação`,sub:'Solicitações com a FC',texto:i.texto,
      fn:()=>window.open('consultorias.html#'+encodeURIComponent(i.emp)+'/t=sol','_blank','noopener')})
  };
  function avisar(i){const f=TIPO[i.tipo];if(!f)return;const o=Object.assign({k:i.tipo+'-'+i.id},f(i));
    if(window.alertaGrande){window.alertaGrande(o);return;}
    try{if(NP()==='granted'){const n=new Notification(o.titulo,{body:String(o.texto||o.sub||'').slice(0,160),tag:o.k,requireInteraction:true});n.onclick=()=>{window.focus();n.close();o.fn();};}}catch(_){}}
  async function vigiar(){if(rodando)return;rodando=true;
    try{const r=await sb.rpc('fc_avisos_novos',{p_desde:desde});
      if(!r.error&&r.data){const d=r.data;if(desde)(d.itens||[]).forEach(avisar);desde=d.agora;
        if((d.itens||[]).length){try{window.FCCaixa&&FCCaixa.carregar();}catch(_){}try{window.FCAutocadAviso&&FCAutocadAviso.atualizar&&FCAutocadAviso.atualizar();}catch(_){}}}}
    catch(_){}rodando=false;}
  /* faixa para ligar as notificações do computador (só some quando estiverem permitidas) */
  function faixa(){const id='fcAvPerm';let b=document.getElementById(id);const p=NP();
    if(p==='granted'||!('Notification' in window)){if(b)b.remove();return;}
    let fech=false;try{fech=sessionStorage.getItem(id)==='1';}catch(_){}if(fech){if(b)b.remove();return;}
    if(!b){b=document.createElement('div');b.id=id;b.style.cssText='position:fixed;left:16px;bottom:16px;z-index:250;max-width:380px;background:#fff;color:#14222e;border:2px solid #1d5fa8;border-radius:14px;padding:12px 14px;box-shadow:0 10px 30px rgba(0,0,0,.25);font:400 14px/1.45 system-ui,sans-serif';document.body.appendChild(b);}
    b.innerHTML=p==='denied'
      ?`<b>🔔 Notificações bloqueadas</b><p style="margin:4px 0 8px">Para receber os avisos com o painel em segundo plano: clique no <b>cadeado</b> ao lado do endereço, em <b>Notificações</b> escolha <b>Permitir</b> e aperte <b>F5</b>.</p><div style="text-align:right"><button type="button" data-x style="padding:6px 12px">Fechar</button></div>`
      :`<b>🔔 Receber avisos mesmo com o painel minimizado</b><p style="margin:4px 0 8px">Cadastros, mensagens das equipes, suporte e solicitações aparecem como notificação no computador.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" data-x style="padding:6px 12px">Agora não</button><button type="button" data-ok style="padding:6px 12px;background:#1d5fa8;color:#fff;border:0;border-radius:8px;font-weight:700">Ativar notificações</button></div>`;
    b.querySelector('[data-x]').onclick=()=>{try{sessionStorage.setItem(id,'1');}catch(_){}b.remove();};
    const ok=b.querySelector('[data-ok]');if(ok)ok.onclick=()=>{try{const r=Notification.requestPermission(faixa);if(r&&r.then)r.then(()=>{faixa();if(NP()==='granted')try{new Notification('Avisos ligados ✓',{body:'Você vai receber os avisos da FC aqui, mesmo com o painel minimizado.'});}catch(_){}});}catch(_){}};}
  async function iniciar(){const t=await sb.rpc('fc_avisos_novos',{p_desde:new Date().toISOString()});
    if(t.error||!t.data){setTimeout(iniciar,15000);return;}desde=t.data.agora;faixa();
    setInterval(vigiar,20000);   /* em segundo plano o navegador roda no máximo 1 vez por minuto */
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)vigiar();});}
  setTimeout(iniciar,4000);
  window.FCAvisos={vigiar};
})();
