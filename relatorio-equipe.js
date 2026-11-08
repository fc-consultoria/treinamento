/* ===== Painel da Matriz · 📋 Alterações da equipe =====
   Tudo o que outra pessoa com acesso de admin (ex.: Regina) cria, altera ou exclui fica registrado
   no banco (fc_auditoria, gravado por gatilho em cada tabela). Só o Fernando vê:
   a cada hora completa o painel fecha um relatório daquela hora (fc_aud_relatorios, RPC fc_aud_fechar),
   que fica salvo para conferir: abrir, copiar (WhatsApp), imprimir/salvar em PDF e marcar como conferido.
   Aviso com som só quando sai um relatório novo (no máximo 1 por hora). */
(function(){
  if(typeof sb==='undefined'||typeof MATRIZ_UID==='undefined')return;
  const h=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const TELA={trein_eventos:'Painel da Matriz',trein_alunos:'Logins dos clientes',trein_demo:'Links de demonstração',trein_demo_ev:'Demonstrativos',
    impl_clientes:'Implantação · clientes',impl_itens:'Implantação · itens',impl_checklist:'Implantação · checklist',impl_etapas:'Implantação · etapas',impl_tarefas:'Implantação · tarefas',
    impl_precos:'Implantação · preços',impl_perfis_metro:'Implantação · perfis (kg/m)',impl_fornecedores:'Implantação · fornecedores',impl_cliente_fornecedores:'Implantação · fornecedores do cliente',
    impl_anotacoes:'Implantação · anotações',impl_chat:'Implantação · conversa',impl_parcelas:'Implantação · parcelas',impl_acesso:'Implantação · acessos',impl_portal:'Acompanhamento do cliente',
    impl_portal_fotos:'Galeria da implantação',impl_orcamentos_aluminio:'Orçamentos de alumínio',impl_orcamento_aluminio_itens:'Orçamentos de alumínio · itens',
    rotina_docs:'Rotina FC',emp_pessoas:'Central do Cliente · pessoas',emp_msgs:'Conversas das equipes',emp_conversas:'Conversas das equipes',emp_eventos:'Central do Cliente',
    cat_itens:'Catálogo virtual',cat_clientes:'Catálogo virtual · clientes',orc_vend:'Orçamento · vendedores',orc_orcamentos:'Orçamentos dos vendedores',orc_cfg:'Orçamento · ajustes',
    orcobra_obras:'Orçamentos de obra',orcobra_banco:'Orçamentos de obra · banco',orcobra_links:'Orçamentos de obra · links',obra3d_projetos:'Obra em 3D',obra3d_envio_links:'Obra em 3D · links',
    cons_portal:'Consultorias',cons_planilhas:'Consultorias · planilhas',estoque:'Estoque',compra_abc:'Compras ABC',compra_forn:'Compras · fornecedores',compra_sim:'Compras · simulação',
    fc_lancamentos_pf:'Finanças PF',fc_lancamentos_pj:'Finanças PJ',fc_contatos:'Contatos',vit_convite:'Vitrine',precif_modelos:'Precificação de kits'};
  const ACAO={insert:'Criou',update:'Alterou',delete:'Excluiu'};
  const OCULTA=new Set(['id','user_id','criado_em','created_at','atualizado','updated_at']);
  const S={rels:[],itens:{},novos:0,aberto:false,dias:30,prim:true,vistos:new Set()};
  const val=v=>{if(v==null||v==='')return '—';if(typeof v==='object'){const t=JSON.stringify(v);return t.length>90?t.slice(0,90)+'…':t;}const t=String(v);return t.length>90?t.slice(0,90)+'…':t;};
  const TIPO={par_dis:'Conversão de códigos · marcou "nenhum é igual"',equiv_edit:'Conversão de códigos · editou equivalência',equiv_ok:'Conversão de códigos · conferiu equivalência',
    dicas:'Dicas de montagem',divulga:'Divulgação',div_art:'Divulgação · arte',novidade:'Novidades',parceiros:'Parceiros',site_vitrine:'Vitrine do site',site_festa:'Site · festa',pl_divulga:'Plataforma · divulgação',promo:'Promoção',
    colab:'Colaboradores do cliente',liberacao:'Liberação de acesso',sistema:'Sistemas liberados',gestor:'Gestor do cliente',pausa:'Pausa de acesso',zerar:'Zerar tempo',cat3d:'Catálogo 3D',contrato:'Contrato',implantacao:'Implantação',linha_em_breve:'Linha em breve',interesse_ok:'Interessado atendido',empresa_local:'Empresa · cidade',senha_forte:'Senha nova'};
  const tela=e=>{if(e.tabela==='trein_eventos'){const t=(e.mudou&&(e.mudou.tipo&&e.mudou.tipo.para||e.mudou.tipo))||e.rotulo;return TIPO[t]||('Painel da Matriz'+(t?' · '+t:''));}return TELA[e.tabela]||e.tabela;};
  const OCULTA_EV=new Set(['tipo','tipologia']);
  function detalhes(e){const m=e.mudou||{};if(m.resumo)return [m.resumo.slice(0,200)];
    if(e.acao==='update')return Object.keys(m).filter(k=>!OCULTA.has(k)).slice(0,8).map(k=>k+': '+val(m[k]&&m[k].de)+' → '+val(m[k]&&m[k].para));
    return Object.keys(m).filter(k=>!OCULTA.has(k)&&!(e.tabela==='trein_eventos'&&OCULTA_EV.has(k))&&m[k]!=null&&m[k]!=='').slice(0,6).map(k=>k+': '+val(m[k]));}
  const hora=t=>new Date(t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const dia=t=>new Date(t).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'});

  const per=r=>{const a=new Date(r.periodo_ini),b=new Date(r.periodo_fim);return a.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'})+' · '+hora(a)+' às '+hora(b);};
  const pl=(n,s,p)=>n+' '+(n===1?s:p);

  async function carregar(){
    try{await sb.rpc('fc_aud_fechar');}catch(_){}
    const desde=new Date(Date.now()-S.dias*864e5).toISOString();
    const r=await sb.from('fc_aud_relatorios').select('*').gte('periodo_ini',desde).order('periodo_ini',{ascending:false}).limit(1000);
    if(r.error)return;S.rels=r.data||[];
    const pend=S.rels.filter(x=>!x.conferido);
    if(!S.prim){const novos=pend.filter(x=>!S.vistos.has(x.id));if(novos.length)avisar(novos);}
    pend.forEach(x=>S.vistos.add(x.id));S.prim=false;S.novos=pend.length;badge();if(S.aberto&&!S.abertoRel)lista();}

  function avisar(novos){const t=novos.reduce((a,x)=>a+x.total,0),quem=[...new Set(novos.map(x=>x.quem))].join(', ');
    const txt='📋 Relatório da hora: '+quem+' fez '+pl(t,'alteração','alterações');
    if(typeof alertaGrande==='function'){try{alertaGrande({k:'audr-'+novos[0].id,titulo:txt,sub:per(novos[0])+' · toque em "Responder agora" para conferir.',fn:()=>{abrir();abrirRel(novos[0]);}});}catch(_){}}
    else{try{if('Notification' in window&&Notification.permission==='granted')new Notification('📋 Alterações da equipe',{body:txt,tag:'fc-aud'});}catch(_){}}}

  function badge(){const b=document.getElementById('audBtn');if(!b)return;const c=b.querySelector('.cx-n');c.textContent=S.novos||'✓';c.classList.toggle('zero',!S.novos);}

  async function itensDe(r){if(S.itens[r.id])return S.itens[r.id];
    const q=await sb.from('fc_auditoria').select('*').eq('relatorio_id',r.id).order('criado_em').limit(2000);S.itens[r.id]=q.data||[];return S.itens[r.id];}

  function texto(r,L){const T=['📋 *Relatório de alterações da equipe*','🕐 '+per(r),'👤 '+r.quem,'Total: '+pl(r.total,'alteração','alterações')+' (criou '+r.criou+' · alterou '+r.alterou+' · excluiu '+r.excluiu+')',''];
    L.forEach(e=>{T.push(hora(e.criado_em)+' · '+ACAO[e.acao]+' em '+tela(e)+(e.rotulo&&e.tabela!=='trein_eventos'?' ('+e.rotulo+')':''));detalhes(e).forEach(x=>T.push('   – '+x));});
    T.push('',r.conferido?'✅ Conferido':'⏳ Ainda não conferido');return T.join('\n');}

  function lista(){S.abertoRel=null;const c=document.getElementById('audCorpo');if(!c)return;
    document.getElementById('audAc').innerHTML='';
    if(!S.rels.length){c.innerHTML='<p class="aud-v">Nenhum relatório no período. Os relatórios são fechados a cada hora completa em que a Regina fez alguma alteração.</p>';return;}
    let d0='',html='<div class="aud-res"><span><b>'+pl(S.rels.length,'relatório','relatórios')+'</b> no período</span>'+(S.novos?'<span class="aud-nv">'+S.novos+' para conferir</span>':'<span>✅ tudo conferido</span>')+'</div>';
    S.rels.forEach(r=>{const d=dia(r.periodo_ini);if(d!==d0){html+='<h4>'+h(d)+'</h4>';d0=d;}
      html+='<button type="button" class="aud-i aud-rl'+(r.conferido?'':' nv')+'" data-r="'+r.id+'"><span class="aud-h">'+hora(r.periodo_ini)+'–'+hora(r.periodo_fim)+'</span> <b>'+h(r.quem)+'</b> · '+pl(r.total,'alteração','alterações')
        +' <span class="aud-a aud-insert">+'+r.criou+'</span> <span class="aud-a aud-update">✎'+r.alterou+'</span> <span class="aud-a aud-delete">✕'+r.excluiu+'</span>'
        +'<span class="aud-st">'+(r.conferido?'✅ Conferido':'⏳ Conferir')+'</span></button>';});
    c.innerHTML=html;}

  async function abrirRel(r){S.abertoRel=r;const c=document.getElementById('audCorpo');if(!c)return;c.innerHTML='<p class="aud-v">Carregando…</p>';
    const L=await itensDe(r);
    document.getElementById('audAc').innerHTML='<button type="button" data-volta>← Relatórios</button>'+(r.conferido?'':'<button type="button" data-conf class="aud-ok">✅ Marcar como conferido</button>')+'<button type="button" data-c>📋 Copiar para WhatsApp</button><button type="button" data-p>🖨 Imprimir / salvar PDF</button>';
    c.innerHTML='<div class="aud-cab"><b>🕐 '+h(per(r))+'</b><span>👤 '+h(r.quem)+'</span><span>'+pl(r.total,'alteração','alterações')+' · criou '+r.criou+' · alterou '+r.alterou+' · excluiu '+r.excluiu+'</span><span>'+(r.conferido?'✅ Conferido em '+new Date(r.conferido_em).toLocaleString('pt-BR'):'⏳ Ainda não conferido')+'</span></div>'
      +L.map(e=>'<div class="aud-i"><div class="aud-l"><span class="aud-h">'+hora(e.criado_em)+'</span><span class="aud-a aud-'+e.acao+'">'+ACAO[e.acao]+'</span> '+h(tela(e))+(e.rotulo&&e.tabela!=='trein_eventos'?' · <i>'+h(e.rotulo)+'</i>':'')+'</div>'+detalhes(e).map(x=>'<div class="aud-d">'+h(x)+'</div>').join('')+'</div>').join('');}

  function imprimir(r,L){const w=window.open('','_blank');if(!w)return;
    w.document.write('<!doctype html><meta charset="utf-8"><title>Relatório de alterações · '+h(per(r))+'</title><style>body{font:14px system-ui;color:#13232e;margin:28px}h1{font-size:20px;margin:0 0 4px}.m{color:#4a5b66;margin:0 0 16px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #dde4e9;padding:7px 6px;text-align:left;vertical-align:top}th{background:#f1f6f9}small{color:#4a5b66;display:block}footer{margin-top:22px;color:#4a5b66;font-size:12px}</style>'
      +'<h1>📋 Relatório de alterações da equipe</h1><p class="m">FC Consultoria e Representação · '+h(per(r))+' · '+h(r.quem)+' · '+pl(r.total,'alteração','alterações')+' (criou '+r.criou+', alterou '+r.alterou+', excluiu '+r.excluiu+')</p>'
      +'<table><tr><th>Hora</th><th>Ação</th><th>Onde</th><th>O que mudou</th></tr>'+L.map(e=>'<tr><td>'+hora(e.criado_em)+'</td><td>'+ACAO[e.acao]+'</td><td>'+h(tela(e))+(e.rotulo&&e.tabela!=='trein_eventos'?'<small>'+h(e.rotulo)+'</small>':'')+'</td><td>'+detalhes(e).map(x=>h(x)).join('<br>')+'</td></tr>').join('')+'</table>'
      +'<footer>'+(r.conferido?'Conferido em '+new Date(r.conferido_em).toLocaleString('pt-BR'):'Ainda não conferido')+' · gerado em '+new Date().toLocaleString('pt-BR')+'</footer>');
    w.document.close();setTimeout(()=>w.print(),300);}

  function abrir(){S.aberto=true;let o=document.getElementById('audOv');if(o)o.remove();o=document.createElement('div');o.id='audOv';o.setAttribute('role','dialog');o.setAttribute('aria-label','Alterações da equipe');
    o.innerHTML='<div class="aud-box"><div class="aud-hd"><h3>📋 Relatórios de alterações da equipe</h3><button type="button" data-x aria-label="Fechar">✕</button></div>'
      +'<div class="aud-bar"><select id="audDias" aria-label="Período"><option value="1">Hoje</option><option value="7">7 dias</option><option value="30">30 dias</option><option value="90">90 dias</option><option value="365">1 ano</option></select><span id="audAc"></span></div>'
      +'<div id="audCorpo" class="aud-c"><p class="aud-v">Carregando…</p></div></div>';
    document.body.appendChild(o);o.querySelector('#audDias').value=String(S.dias);
    o.addEventListener('click',async ev=>{const t=ev.target;
      if(t===o||t.closest('[data-x]')){S.aberto=false;o.remove();return;}
      const rb=t.closest('[data-r]');if(rb){const r=S.rels.find(x=>x.id==rb.dataset.r);if(r)abrirRel(r);return;}
      if(t.closest('[data-volta]')){lista();return;}
      const r=S.abertoRel;if(!r)return;
      if(t.closest('[data-conf]')){const q=await sb.from('fc_aud_relatorios').update({conferido:true,conferido_em:new Date().toISOString()}).eq('id',r.id).select().maybeSingle();
        if(!q.error&&q.data){Object.assign(r,q.data);S.novos=S.rels.filter(x=>!x.conferido).length;badge();abrirRel(r);}return;}
      if(t.closest('[data-c]')){const L=await itensDe(r);try{await navigator.clipboard.writeText(texto(r,L));t.textContent='✔ Copiado';setTimeout(()=>t.textContent='📋 Copiar para WhatsApp',2000);}catch(_){alert(texto(r,L));}return;}
      if(t.closest('[data-p]')){imprimir(r,await itensDe(r));}});
    o.querySelector('#audDias').onchange=e=>{S.dias=+e.target.value;S.abertoRel=null;carregar().then(lista);};
    lista();carregar();}

  function css(){const s=document.createElement('style');s.textContent=`
#audBtn{display:inline-flex;align-items:center;gap:7px;font-weight:800}
#audBtn .cx-n{min-width:22px;height:22px;border-radius:99px;background:#e11d48;color:#fff;font-size:12.5px;display:inline-grid;place-items:center;padding:0 7px}
#audBtn .cx-n.zero{background:#1f9d55}
#audOv{position:fixed;inset:0;z-index:9990;background:rgba(8,20,30,.6);display:grid;place-items:center;padding:16px}
#audOv .aud-box{background:#fff;color:#13232e;border-radius:16px;width:min(860px,100%);max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.4)}
#audOv .aud-hd{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #e3e9ee}
#audOv .aud-hd h3{margin:0;font-size:18px}#audOv .aud-hd button{border:0;background:none;font-size:18px;cursor:pointer;color:#13232e}
#audOv .aud-bar{display:flex;gap:8px;flex-wrap:wrap;padding:10px 18px;border-bottom:1px solid #e3e9ee}#audOv #audAc{display:contents}
#audOv .aud-bar button,#audOv .aud-bar select{font:600 13.5px system-ui;padding:8px 12px;border-radius:9px;border:1px solid #c9d3da;background:#fff;color:#13232e;cursor:pointer}
#audOv .aud-bar .aud-ok{background:#1f9d55;border-color:#1f9d55;color:#fff}
#audOv .aud-c{overflow:auto;padding:6px 18px 18px}
#audOv h4{margin:16px 0 6px;font-size:13px;text-transform:capitalize;color:#4a5b66}
#audOv .aud-res{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#audOv .aud-res span{background:#f1f6f9;border-radius:99px;padding:5px 11px;font-size:13px}
#audOv .aud-res .aud-nv{background:#ffe4e9;color:#9f1239;font-weight:700}
#audOv .aud-cab{display:flex;flex-direction:column;gap:3px;background:#f1f6f9;border-radius:10px;padding:10px 12px;margin:10px 0;font-size:14px}
#audOv .aud-i{display:block;width:100%;text-align:left;font:inherit;color:inherit;border:1px solid #e3e9ee;border-radius:10px;padding:8px 11px;margin:6px 0;font-size:14px;background:#fff}
#audOv .aud-rl{cursor:pointer;display:flex;align-items:center;gap:6px;flex-wrap:wrap}#audOv .aud-rl:hover{border-color:#0e5a86}
#audOv .aud-i.nv{border-color:#f59eb0;background:#fff7f9}
#audOv .aud-st{margin-left:auto;font-weight:700;font-size:13px}
#audOv .aud-h{display:inline-block;min-width:46px;color:#4a5b66;font-variant-numeric:tabular-nums}
#audOv .aud-a{font-weight:700;padding:1px 7px;border-radius:6px;font-size:12.5px}
#audOv .aud-insert{background:#dcfce7;color:#166534}#audOv .aud-update{background:#e0f2fe;color:#075985}#audOv .aud-delete{background:#fee2e2;color:#991b1b}
#audOv .aud-d{color:#4a5b66;font-size:12.5px;margin:3px 0 0 46px;word-break:break-word}
#audOv .aud-v{color:#4a5b66;padding:14px 0}`;document.head.appendChild(s);}

  function botao(){if(document.getElementById('audBtn'))return;const ref=document.getElementById('bAtu');const b=document.createElement('button');b.type='button';b.id='audBtn';
    b.title='Relatórios por hora do que a equipe (Regina) alterou no painel';b.innerHTML='📋 Alterações da equipe <span class="cx-n"></span>';
    if(ref){b.className=ref.className;b.setAttribute('style',ref.getAttribute('style')||'');ref.parentElement.insertBefore(b,ref);}else{const a=document.querySelector('header .acts');if(a)a.prepend(b);else return;}
    b.onclick=abrir;badge();}

  async function iniciar(){const {data:{session}}=await sb.auth.getSession();if(!session||session.user.id!==MATRIZ_UID)return;
    css();botao();await carregar();setInterval(()=>{carregar();},5*60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')carregar();});}
  window.FCRelEquipe={iniciar};
})();
