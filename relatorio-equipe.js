/* ===== Painel da Matriz · 📋 Alterações da equipe =====
   Tudo o que outra pessoa com acesso de admin (ex.: Regina) cria, altera ou exclui fica registrado
   no banco (fc_auditoria, gravado por gatilho em cada tabela). Só o Fernando vê:
   botão no topo com o número de novidades, aviso com som/notificação e o relatório por dia,
   com copiar (WhatsApp), imprimir e marcar como visto. */
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
  const S={lista:[],novos:0,aberto:false,dias:7,ultimoId:0,prim:true};
  const val=v=>{if(v==null||v==='')return '—';if(typeof v==='object'){const t=JSON.stringify(v);return t.length>90?t.slice(0,90)+'…':t;}const t=String(v);return t.length>90?t.slice(0,90)+'…':t;};
  const tela=e=>{if(e.tabela==='trein_eventos'){const t=(e.mudou&&(e.mudou.tipo&&e.mudou.tipo.para||e.mudou.tipo))||e.rotulo;return 'Painel da Matriz'+(t?' · '+t:'');}return TELA[e.tabela]||e.tabela;};
  function detalhes(e){const m=e.mudou||{};if(m.resumo)return [m.resumo.slice(0,200)];
    if(e.acao==='update')return Object.keys(m).filter(k=>!OCULTA.has(k)).slice(0,8).map(k=>k+': '+val(m[k]&&m[k].de)+' → '+val(m[k]&&m[k].para));
    return Object.keys(m).filter(k=>!OCULTA.has(k)&&m[k]!=null&&m[k]!=='').slice(0,6).map(k=>k+': '+val(m[k]));}
  const hora=t=>new Date(t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const dia=t=>new Date(t).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'});

  async function carregar(){
    const desde=new Date(Date.now()-S.dias*864e5).toISOString();
    const r=await sb.from('fc_auditoria').select('*').gte('criado_em',desde).order('criado_em',{ascending:false}).limit(1500);
    if(r.error)return;S.lista=r.data||[];const nv=S.lista.filter(e=>!e.visto);
    const maior=S.lista.reduce((a,e)=>Math.max(a,e.id),0);
    if(!S.prim&&maior>S.ultimoId){const novas=S.lista.filter(e=>e.id>S.ultimoId&&!e.visto);if(novas.length)avisar(novas);}
    S.prim=false;S.ultimoId=Math.max(S.ultimoId,maior);S.novos=nv.length;badge();if(S.aberto)render();}

  function avisar(novas){const quem=[...new Set(novas.map(e=>e.quem_nome))].join(', ');const txt=quem+' fez '+novas.length+' alteraç'+(novas.length>1?'ões':'ão')+' no painel';
    if(typeof alertaGrande==='function'){try{alertaGrande({k:'aud-'+S.ultimoId,titulo:'📋 '+txt,sub:'Toque em "Responder agora" para abrir o relatório.',fn:abrir});}catch(_){}}
    else{try{if('Notification' in window&&Notification.permission==='granted')new Notification('📋 Alterações da equipe',{body:txt,tag:'fc-aud'});}catch(_){}}}

  function badge(){const b=document.getElementById('audBtn');if(!b)return;const c=b.querySelector('.cx-n');c.textContent=S.novos||'✓';c.classList.toggle('zero',!S.novos);}

  function texto(){const L=['📋 Relatório de alterações da equipe · últimos '+S.dias+' dias',''];let d0='';
    [...S.lista].reverse().forEach(e=>{const d=dia(e.criado_em);if(d!==d0){L.push('','*'+d+'*');d0=d;}
      L.push(hora(e.criado_em)+' · '+e.quem_nome+' · '+ACAO[e.acao]+' em '+tela(e)+(e.rotulo&&e.tabela!=='trein_eventos'?' ('+e.rotulo+')':''));
      detalhes(e).forEach(x=>L.push('   – '+x));});
    if(!S.lista.length)L.push('Nenhuma alteração no período.');return L.join('\n');}

  function render(){const c=document.getElementById('audCorpo');if(!c)return;
    if(!S.lista.length){c.innerHTML='<p class="aud-v">Nenhuma alteração da equipe nos últimos '+S.dias+' dias.</p>';return;}
    let d0='',html='';const pessoas={};S.lista.forEach(e=>pessoas[e.quem_nome]=(pessoas[e.quem_nome]||0)+1);
    html+='<div class="aud-res">'+Object.entries(pessoas).map(([p,n])=>'<span><b>'+h(p)+'</b> · '+n+' alteraç'+(n>1?'ões':'ão')+'</span>').join('')+(S.novos?'<span class="aud-nv">'+S.novos+' novas</span>':'')+'</div>';
    S.lista.forEach(e=>{const d=dia(e.criado_em);if(d!==d0){html+='<h4>'+h(d)+'</h4>';d0=d;}
      html+='<div class="aud-i'+(e.visto?'':' nv')+'"><div class="aud-l"><span class="aud-h">'+hora(e.criado_em)+'</span><b>'+h(e.quem_nome)+'</b> <span class="aud-a aud-'+e.acao+'">'+ACAO[e.acao]+'</span> '+h(tela(e))
        +(e.rotulo&&e.tabela!=='trein_eventos'?' · <i>'+h(e.rotulo)+'</i>':'')+'</div>'
        +detalhes(e).map(x=>'<div class="aud-d">'+h(x)+'</div>').join('')+'</div>';});
    c.innerHTML=html;}

  async function marcarVisto(){const ids=S.lista.filter(e=>!e.visto).map(e=>e.id);if(!ids.length)return;
    const r=await sb.from('fc_auditoria').update({visto:true}).in('id',ids);if(!r.error){S.lista.forEach(e=>e.visto=true);S.novos=0;badge();render();}}

  function abrir(){S.aberto=true;let o=document.getElementById('audOv');if(o)o.remove();o=document.createElement('div');o.id='audOv';o.setAttribute('role','dialog');o.setAttribute('aria-label','Alterações da equipe');
    o.innerHTML='<div class="aud-box"><div class="aud-hd"><h3>📋 Alterações da equipe</h3><button type="button" data-x aria-label="Fechar">✕</button></div>'
      +'<div class="aud-bar"><select id="audDias" aria-label="Período"><option value="1">Hoje</option><option value="7">7 dias</option><option value="30">30 dias</option><option value="90">90 dias</option></select>'
      +'<button type="button" data-v>✅ Marcar como visto</button><button type="button" data-c>📋 Copiar para WhatsApp</button><button type="button" data-p>🖨 Imprimir</button></div>'
      +'<div id="audCorpo" class="aud-c"><p class="aud-v">Carregando…</p></div></div>';
    document.body.appendChild(o);o.querySelector('#audDias').value=String(S.dias);
    o.addEventListener('click',async ev=>{const t=ev.target;
      if(t===o||t.closest('[data-x]')){S.aberto=false;o.remove();return;}
      if(t.closest('[data-v]'))marcarVisto();
      if(t.closest('[data-c]')){try{await navigator.clipboard.writeText(texto());t.textContent='✔ Copiado';setTimeout(()=>t.textContent='📋 Copiar para WhatsApp',2000);}catch(_){alert(texto());}}
      if(t.closest('[data-p]')){const w=window.open('','_blank');if(w){w.document.write('<pre style="font:14px system-ui;white-space:pre-wrap">'+h(texto())+'</pre>');w.document.close();w.print();}}});
    o.querySelector('#audDias').onchange=e=>{S.dias=+e.target.value;carregar();};
    render();carregar();}

  function css(){const s=document.createElement('style');s.textContent=`
#audBtn{display:inline-flex;align-items:center;gap:7px;font-weight:800}
#audBtn .cx-n{min-width:22px;height:22px;border-radius:99px;background:#e11d48;color:#fff;font-size:12.5px;display:inline-grid;place-items:center;padding:0 7px}
#audBtn .cx-n.zero{background:#1f9d55}
#audOv{position:fixed;inset:0;z-index:9990;background:rgba(8,20,30,.6);display:grid;place-items:center;padding:16px}
#audOv .aud-box{background:#fff;color:#13232e;border-radius:16px;width:min(860px,100%);max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.4)}
#audOv .aud-hd{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #e3e9ee}
#audOv .aud-hd h3{margin:0;font-size:18px}#audOv .aud-hd button{border:0;background:none;font-size:18px;cursor:pointer;color:#13232e}
#audOv .aud-bar{display:flex;gap:8px;flex-wrap:wrap;padding:10px 18px;border-bottom:1px solid #e3e9ee}
#audOv .aud-bar button,#audOv .aud-bar select{font:600 13.5px system-ui;padding:8px 12px;border-radius:9px;border:1px solid #c9d3da;background:#fff;color:#13232e;cursor:pointer}
#audOv .aud-c{overflow:auto;padding:6px 18px 18px}
#audOv h4{margin:16px 0 6px;font-size:13px;text-transform:capitalize;color:#4a5b66}
#audOv .aud-res{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#audOv .aud-res span{background:#f1f6f9;border-radius:99px;padding:5px 11px;font-size:13px}
#audOv .aud-res .aud-nv{background:#ffe4e9;color:#9f1239;font-weight:700}
#audOv .aud-i{border:1px solid #e3e9ee;border-radius:10px;padding:8px 11px;margin:6px 0;font-size:14px}
#audOv .aud-i.nv{border-color:#f59eb0;background:#fff7f9}
#audOv .aud-h{display:inline-block;min-width:46px;color:#4a5b66;font-variant-numeric:tabular-nums}
#audOv .aud-a{font-weight:700;padding:1px 7px;border-radius:6px;font-size:12.5px}
#audOv .aud-insert{background:#dcfce7;color:#166534}#audOv .aud-update{background:#e0f2fe;color:#075985}#audOv .aud-delete{background:#fee2e2;color:#991b1b}
#audOv .aud-d{color:#4a5b66;font-size:12.5px;margin:3px 0 0 46px;word-break:break-word}
#audOv .aud-v{color:#4a5b66;padding:14px 0}`;document.head.appendChild(s);}

  function botao(){if(document.getElementById('audBtn'))return;const ref=document.getElementById('bAtu');const b=document.createElement('button');b.type='button';b.id='audBtn';
    b.title='O que a equipe (Regina) alterou no painel';b.innerHTML='📋 Alterações da equipe <span class="cx-n"></span>';
    if(ref){b.className=ref.className;b.setAttribute('style',ref.getAttribute('style')||'');ref.parentElement.insertBefore(b,ref);}else{const a=document.querySelector('header .acts');if(a)a.prepend(b);else return;}
    b.onclick=abrir;badge();}

  async function iniciar(){const {data:{session}}=await sb.auth.getSession();if(!session||session.user.id!==MATRIZ_UID)return;
    css();botao();await carregar();setInterval(()=>{carregar();},60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')carregar();});}
  window.FCRelEquipe={iniciar};
})();
