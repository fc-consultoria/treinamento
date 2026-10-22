/* ===== Painel da Matriz · 🧭 Central do Cliente (cards por empresa) =====
   Um card por empresa, juntando tudo que antes ficava espalhado:
   - Consultorias presenciais (rotina_docs col=consultoria + RPC emp_central: alertas, equipe, orçamentos)
   - Implantação de preços (impl_clientes + impl_portal + andamento do impl_checklist)
   - Todos os logins de todas as ferramentas (FCAcessos, do acessos-todos.js) e empresas do Mostruário
   Clique no card → página da empresa com abas: Resumo · Logins · Implantação · Consultoria e vendas. */
(function(){
  if(typeof sb==='undefined')return;
  const $=id=>document.getElementById(id);
  const h=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
  const brl=v=>(+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const ler=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v;}catch(_){return d;}};
  const grava=(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}};
  const dias=t=>t?Math.floor((Date.now()-new Date(t))/864e5):null;
  const quando=t=>{if(!t)return 'nunca entrou';const m=Math.round((Date.now()-new Date(t))/60000);
    if(m<2)return 'agora';if(m<60)return 'há '+m+' min';const hr=Math.round(m/60);if(hr<24)return 'há '+hr+' h';const d=Math.round(hr/24);return d===1?'ontem':'há '+d+' dias';};
  const dBR=t=>t?new Date(t).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):'—';
  const ON=3*60e3,online=t=>!!t&&(Date.now()-Date.parse(t))<ON;
  const PAPEL={gestor:'Gestor',compras:'Compras',vendas:'Vendas',gerente:'Gerente comercial',marketing:'Marketing',fabrica:'Fábrica'};
  const ABA={orc:'Orçamento e Pedidos',est:'o Estoque',cat:'o Catálogo',esq:'o Treinamento 3D',comp:'Onde comprar',dist:'Distribuidoras',conv:'a Conversão de códigos',pla:'as Planilhas',sol:'as Solicitações',age:'a Agenda',proc:'o Fluxo do processo',acao:'o Plano de ação',cen:'a Central do Gestor',dia:'o Diário',ori:'a Orientação',dem:'as Entregas',gal:'a Galeria',mkt:'o Marketing',div:'a Divulgação'};
  const STI={em_andamento:'Em implantação',concluido:'Implantação concluída',concluida:'Implantação concluída',pausado:'Implantação pausada',cancelado:'Implantação cancelada'};
  const SIT={fornecedor:'Aguardando fornecedor',cliente:'Aguardando equipe do cliente',suporte:'Aguardando suporte do sistema',externo:'Equipe em atendimento externo'};
  /* chave do quadro do acessos-todos → empresa da consultoria */
  const CLI2CONS={cb:'cb',cde:'cde',gv:'gb'};
  const TAGSEC={'Central do Gestor':'Central do Gestor','Mostruário 3D':'Mostruário 3D','Catálogo virtual':'Catálogo','Precificação de Kits':'Precificação','Acompanhamento da implantação':'Implantação'};
  const ORDEM=['Central do Gestor','Mostruário 3D','Acompanhamento da implantação','Catálogo virtual','Precificação de Kits','Página da consultoria'];
  const FILTROS=[['todas','Todas'],['cons','Consultoria'],['impl','Em implantação'],['mostr','Mostruário 3D'],['alerta','Com alerta'],['online','Online agora']];
  const S={emps:[],docs:{},D:{},fila:[],impl:[],portal:{},prog:{},ax:null,
    sel:ler('fc_ccli_emp',''),aba:'res',filtro:ler('fc_ccli_f','todas'),busca:'',xd:+ler('fc_ccli_dias','3')||3,
    carregando:false,em:null,erro:''};

  function frase(x){const d=x.detalhe||{};
    if(x.area==='entrada'||x.acao==='login')return 'entrou no painel';
    if(x.area==='aba')return 'abriu '+(ABA[x.acao]||'a aba '+x.acao);
    if(x.acao==='desconto_pedido')return `pediu ${d.pct}% de desconto no orçamento nº ${d.numero}${d.cliente?' ('+d.cliente+')':''}`;
    if(x.acao==='desconto_aprovado')return `aprovou ${d.pct}% de desconto no orçamento nº ${d.numero}`;
    if(x.acao==='desconto_recusado')return `recusou o desconto do orçamento nº ${d.numero}`;
    if(x.acao==='site_assumido')return `assumiu o pedido do site nº ${d.numero} em ${d.minutos} min`;
    if(x.acao==='estoque_importado')return `atualizou o estoque (${d.itens} itens)`;
    return [x.area,x.acao].filter(Boolean).join(' · ');}

  /* alertas de uma consultoria: [nível 'bad'|'warn', texto, atalho] */
  function alertasCons(id){const D=S.D[id];if(!D)return [];const A=[];
    const fila=S.fila.filter(i=>i.emp===id);
    if(fila.length)A.push(['bad',`${fila.length} pedido${fila.length>1?'s':''} do site na fila há mais de 30 min, sem vendedor`,'vendas']);
    const dp=(D.orc||{}).desc_pend||0;
    if(dp)A.push(['warn',`${dp} desconto${dp>1?'s':''} aguardando decisão do gestor ou gerente`,'vendas']);
    const es=D.estoque;if(es&&es.em){const n=dias(es.em);if(n>7)A.push(['warn',`Estoque sem atualizar há ${n} dias (último em ${dBR(es.em)})`,'vendas']);}
    const P=D.pessoas||[],ult=[...P.map(p=>p.ultimo),(D.portal||{}).ultimo].filter(Boolean).sort().pop();
    const n=dias(ult);
    if(P.length||(D.portal||{}).ultimo){if(n==null)A.push(['warn','Ninguém da equipe entrou ainda','gestor']);else if(n>=S.xd)A.push(['warn',`Ninguém da equipe entra há ${n} dias (último acesso ${dBR(ult)})`,'gestor']);}
    return A;}

  /* ---------- monta a lista única de empresas ---------- */
  function empresas(){
    const M=new Map(),idx=[];
    const nova=(key,nome)=>{let e=M.get(key);if(!e){e={key,nome,tags:new Set(),cons:null,impl:null,mostr:null,sec:{}};M.set(key,e);idx.push(e);}return e;};
    const achar=nome=>{const n=norm(nome);if(n.length<3)return null;
      return idx.find(e=>{const m=norm(e.nome);return m===n||(n.length>=5&&m.length>=5&&(m.includes(n)||n.includes(m)));})||null;};
    const secAdd=(e,s,L)=>{if(!L||!L.length)return;(e.sec[s]=e.sec[s]||[]).push(...L);if(TAGSEC[s]&&!(s==='Acompanhamento da implantação'&&e.impl))e.tags.add(TAGSEC[s]);};
    S.emps.forEach(c=>{const e=nova('c:'+c.id,c.nome);e.cons=c.id;e.tags.add('Consultoria');});
    S.impl.forEach(c=>{if(/^\s*⚠/.test(c.nome||''))return;
      const e=achar(c.nome)||nova('i:'+c.id,c.nome);e.impl=c;e.tags.add(c.status==='em_andamento'?'Em implantação':'Implantação');});
    const ax=S.ax;
    if(ax){
      (FCAcessos.CLI||[]).forEach(c=>{const g=ax.G[c.k];if(!g||!Object.keys(g.sec).length&&!CLI2CONS[c.k])return;
        const e=CLI2CONS[c.k]?(M.get('c:'+CLI2CONS[c.k])||nova('c:'+CLI2CONS[c.k],c.n)):(achar(c.n)||nova('x:'+c.k,c.n));
        e.cor=c.cor;Object.keys(g.sec).forEach(s=>secAdd(e,s,g.sec[s]));
        const ml=(g.sec['Mostruário 3D']||[]).find(l=>l.uid);if(ml)e.mostr={uid:ml.uid,ativo:!/bloque/.test((ml.tag||[])[0]||'')};});
      Object.keys(ax.OUT.portal||{}).forEach(cli=>{const e=achar(cli)||nova('p:'+norm(cli),cli);secAdd(e,'Acompanhamento da implantação',ax.OUT.portal[cli]);});
      (ax.OUT.mostr||[]).forEach(m=>{const e=achar(m.emp)||nova('m:'+norm(m.emp),m.emp);secAdd(e,'Mostruário 3D',m.L);e.mostr={uid:m.uid,ativo:m.ativo};});
      [['pessoas','Central do Gestor'],['cat','Catálogo virtual'],['precif','Precificação de Kits'],['cons','Página da consultoria']].forEach(([k,s])=>{
        const G={};(ax.OUT[k]||[]).forEach(l=>{(G[l.grp||'']=G[l.grp||'']||[]).push(l);});
        Object.keys(G).forEach(g=>{const e=g&&(M.get('c:'+g)||achar(g));if(e)secAdd(e,s,G[g]);});});
    }
    idx.forEach(e=>{
      const L=[].concat(...Object.values(e.sec));
      e.logins=L.length;e.on=L.filter(l=>online(l.ult)).length;
      const D=e.cons&&S.D[e.cons];if(D&&!L.length){const P=D.pessoas||[];e.logins=P.length;e.on=P.filter(p=>p.online).length;}
      e.ult=L.map(l=>l.ult).filter(Boolean).sort().pop()||null;
      e.al=e.cons?alertasCons(e.cons):[];
      if(e.impl){const p=S.prog[e.impl.id];e.pr=p&&p.tot?Math.round(p.ok/p.tot*100):null;e.pt=S.portal[e.impl.id]||null;}
      e.status=e.impl&&e.impl.status==='em_andamento'?'impl':e.cons?'cons':e.mostr?(e.mostr.ativo?'mostr':'bloq'):'outro';});
    const peso={impl:0,cons:1,mostr:2,outro:3,bloq:4};
    return idx.sort((a,b)=>(b.al.length?1:0)-(a.al.length?1:0)||peso[a.status]-peso[b.status]||a.nome.localeCompare(b.nome,'pt-BR'));}

  const STL={impl:['Em implantação','st-impl'],cons:['Consultoria ativa','st-cons'],mostr:['Mostruário ativo','st-mostr'],bloq:['Mostruário bloqueado','st-off'],outro:['Só logins','st-off']};
  function passa(e){const f=S.filtro;
    if(S.busca&&!norm(e.nome).includes(S.busca))return false;
    if(f==='cons')return !!e.cons;if(f==='impl')return !!(e.impl&&e.impl.status==='em_andamento');
    if(f==='mostr')return e.tags.has('Mostruário 3D');if(f==='alerta')return e.al.length>0;if(f==='online')return e.on>0;return true;}

  /* ---------- carga ---------- */
  async function carregar(){if(S.carregando)return;S.carregando=true;S.erro='';pinta();
    const erros=[];
    try{
      if(!S.emps.length){const r=await sb.from('rotina_docs').select('id,data').eq('col','consultoria');
        if(r.error)erros.push('consultorias: '+r.error.message);
        S.emps=(r.data||[]).map(x=>({id:x.id,nome:(x.data&&x.data.nome)||x.id}));
        (r.data||[]).forEach(x=>S.docs[x.id]=x.data||{});}
      const [cx,ic,ip,ax,...cs]=await Promise.all([
        sb.rpc('fc_caixa'),
        sb.from('impl_clientes').select('id,nome,status,data_inicio,data_fim,status_recebimento,emite_nota_fiscal,telefone').order('nome'),
        sb.from('impl_portal').select('cliente_id,ativo,situacao,situacao_detalhe,situacao_em'),
        window.FCAcessos?FCAcessos.buscar().then(v=>({data:v}),e=>({error:e})):Promise.resolve({data:null}),
        ...S.emps.map(e=>sb.rpc('emp_central',{p_token:'',p_emp:e.id}))]);
      S.fila=((cx.data&&cx.data.itens)||[]).filter(i=>i.tipo==='fila');
      if(ic.error)erros.push('implantação: '+ic.error.message);else S.impl=ic.data||[];
      S.portal={};(ip.data||[]).forEach(p=>S.portal[p.cliente_id]=p);
      if(ax.error)erros.push('logins: '+(ax.error.message||ax.error));else if(ax.data)S.ax=ax.data;
      cs.forEach((r,i)=>{if(r.data)S.D[S.emps[i].id]=r.data;else if(r.error)erros.push(S.emps[i].nome+': '+r.error.message);});
      /* andamento da implantação: itens alimentados / total (só quem está em andamento) */
      const ativos=S.impl.filter(c=>c.status==='em_andamento'&&!/^\s*⚠/.test(c.nome||''));
      const cn=await Promise.all(ativos.map(c=>Promise.all([
        sb.from('impl_checklist').select('id',{count:'exact',head:true}).eq('cliente_id',c.id),
        sb.from('impl_checklist').select('id',{count:'exact',head:true}).eq('cliente_id',c.id).eq('alimentado',true)])));
      ativos.forEach((c,i)=>{const [t,o]=cn[i];if(!t.error)S.prog[c.id]={tot:t.count||0,ok:o.count||0};});
      S.em=new Date();
    }catch(e){erros.push(e.message||String(e));}
    S.erro=erros.length?'Parte dos dados não carregou: '+erros.join(' · '):'';
    S.carregando=false;pinta();}

  /* ---------- estilo ---------- */
  function css(){if($('ccliCss'))return;const st=document.createElement('style');st.id='ccliCss';st.textContent=`
#ccliCard .cc-body{padding:14px 16px;display:flex;flex-direction:column;gap:14px}
#ccliCard .cc-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#ccliCard .cc-bar input{flex:1;min-width:200px;font-size:15px;padding:8px 12px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--fg)}
#ccliCard .cc-f{display:flex;gap:6px;flex-wrap:wrap}
#ccliCard .cc-f button,#ccliCard .cc-tabs button{font:600 13.5px var(--f-display,system-ui);padding:7px 13px;border:1px solid var(--line);border-radius:999px;background:var(--panel);color:var(--fg);cursor:pointer;display:inline-flex;gap:6px;align-items:center}
#ccliCard .cc-f button[aria-pressed=true],#ccliCard .cc-tabs button[aria-selected=true]{background:var(--accent);border-color:var(--accent);color:#fff}
#ccliCard .cc-f .n{font-size:12px;opacity:.8}
#ccliCard .cc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;align-items:stretch}
#ccliCard .cc-card{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:13px 14px;cursor:pointer;display:flex;flex-direction:column;gap:9px;text-align:left;font:inherit;color:var(--fg)}
#ccliCard .cc-card:hover,#ccliCard .cc-card:focus-visible{border-color:var(--accent);outline:none}
#ccliCard .cc-card.al{border-color:#e8b45a}
#ccliCard .cc-hd{display:flex;gap:10px;align-items:flex-start}
#ccliCard .cc-av{width:38px;height:38px;border-radius:50%;flex:0 0 38px;display:flex;align-items:center;justify-content:center;font:700 14px var(--f-display,system-ui);color:#fff}
#ccliCard .cc-nm{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;align-items:flex-start}#ccliCard .cc-nm b{display:block;font:700 15.5px var(--f-display,system-ui);line-height:1.25;overflow-wrap:anywhere}
#ccliCard .cc-nm small{font-size:12.5px;color:var(--muted)}
#ccliCard .cc-st{font:700 11.5px system-ui;padding:3px 9px;border-radius:999px;white-space:nowrap}
#ccliCard .st-impl{background:#fff1de;color:#8a4a06}#ccliCard .st-cons{background:#ece5ff;color:#4b2fa8}#ccliCard .st-mostr{background:#e2f0fa;color:#0d5c8f}#ccliCard .st-off{background:#eef1f3;color:#55656f}
#ccliCard .cc-tg{display:flex;gap:5px;flex-wrap:wrap}#ccliCard .cc-tg span{font:600 11.5px system-ui;background:var(--bg);color:var(--muted);border-radius:7px;padding:2px 8px}
#ccliCard .cc-pb{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:var(--muted)}
#ccliCard .cc-pb i{display:block;height:6px;border-radius:3px;background:var(--bg);overflow:hidden}#ccliCard .cc-pb i b{display:block;height:6px;background:#e0892a;border-radius:3px}
#ccliCard .cc-ft{display:flex;gap:12px;flex-wrap:wrap;font-size:12.5px;color:var(--muted);border-top:1px solid var(--line);padding-top:8px;margin-top:auto}
#ccliCard .cc-ft .on{color:var(--ok);font-weight:700}#ccliCard .cc-ft .al{color:#b26b00;font-weight:700}#ccliCard .cc-ft .bad{color:var(--bad);font-weight:700}
#ccliCard .cc-al{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
#ccliCard .cc-al li{display:flex;gap:10px;align-items:center;padding:9px 12px;border-radius:10px;font-size:14.5px;font-weight:600}
#ccliCard .cc-al li.bad{background:var(--bad-soft);color:var(--bad)}#ccliCard .cc-al li.warn{background:#fdf3e2;color:#8a5a00}#ccliCard .cc-al li.ok{background:var(--ok-soft);color:var(--ok)}
#ccliCard .cc-al a{margin-left:auto;font-size:13px;white-space:nowrap}
#ccliCard .cc-kp{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
#ccliCard .cc-kp div{background:var(--bg);border-radius:10px;padding:9px 11px;display:flex;flex-direction:column}
#ccliCard .cc-kp b{font:700 19px var(--f-display,system-ui);font-variant-numeric:tabular-nums}#ccliCard .cc-kp small{font-size:12.5px;color:var(--muted)}
#ccliCard .cc-kp .warn b{color:#b26b00}#ccliCard .cc-kp .ok b{color:var(--ok)}
#ccliCard .cc-at{display:flex;gap:8px;flex-wrap:wrap}
#ccliCard .cc-at a,#ccliCard .cc-at button{display:inline-flex;gap:6px;align-items:center;padding:8px 12px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--fg);text-decoration:none;font:600 13.5px var(--f-display,system-ui);cursor:pointer}
#ccliCard .cc-at .pri{background:var(--accent);border-color:var(--accent);color:#fff}
#ccliCard .cc-pe{display:flex;gap:6px;flex-wrap:wrap}
#ccliCard .cc-p{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:99px;padding:4px 11px;font-size:13.5px;font-weight:600}
#ccliCard .cc-p small{font-weight:500;color:var(--muted)}#ccliCard .cc-p i{width:8px;height:8px;border-radius:50%;background:var(--line)}#ccliCard .cc-p i.on{background:var(--ok)}
#ccliCard .cc-p.parado{border-color:#e8b45a;background:#fdf6ea}
#ccliCard h3{margin:0 0 6px;font:700 12px var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
#ccliCard .cc-ev{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px;font-size:14px}
#ccliCard .cc-ev .t{color:var(--muted);font-size:12px;display:inline-block;min-width:72px}
#ccliCard .cc-top{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:space-between}
#ccliCard .cc-top select{font:inherit;font-size:13px;padding:4px 6px;border:1px solid var(--line);border-radius:6px}
#ccliCard .cc-emp{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:14px 16px;display:flex;flex-direction:column;gap:14px}
#ccliCard .cc-tabs{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:10px}
#ccliCard .cc-lg{border:1px solid var(--line);border-radius:12px;overflow:hidden}
#ccliCard .cc-lg .axs{padding:8px 14px 2px}
#ccliCard .cc-in{display:flex;flex-direction:column;gap:14px}
#ccliCard .cc-vz{font-size:14px;color:var(--muted);margin:0}
#ccliCard .cc-pg{height:10px;border-radius:5px;background:var(--bg);overflow:hidden}#ccliCard .cc-pg b{display:block;height:10px;background:#e0892a}`;document.head.appendChild(st);}

  const ini=n=>String(n||'?').replace(/[^\p{L}\p{N} ]/gu,'').trim().split(/\s+/).slice(0,2).map(p=>p[0]||'').join('').toUpperCase()||'?';
  const CORST={impl:'#c06a14',cons:'#6d4bd8',mostr:'#0d5c8f',bloq:'#7b8a93',outro:'#7b8a93'};

  /* ---------- grade de cards ---------- */
  function grade(E){
    const cont=k=>E.filter(e=>{const sf=S.filtro;S.filtro=k;const sb2=S.busca;S.busca='';const r=passa(e);S.filtro=sf;S.busca=sb2;return r;}).length;
    const L=E.filter(passa);
    return `<div class="cc-top"><div class="cc-f" role="group" aria-label="Filtro">${FILTROS.map(([k,t])=>`<button type="button" data-ccf="${k}" aria-pressed="${S.filtro===k}">${t} <span class="n">${cont(k)}</span></button>`).join('')}</div>
      <span class="note">${S.carregando?'Atualizando…':S.em?'atualizado às '+S.em.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):''} <button type="button" id="ccliRe" style="margin-left:6px;font-size:13px">🔄 Atualizar</button></span></div>
     <div class="cc-bar"><input id="ccliQ" type="search" placeholder="🔍 Procurar empresa" value="${h(S.buscaTxt||'')}" autocomplete="off"></div>
     ${S.erro?`<p class="msg bad" style="margin:0">${h(S.erro)}</p>`:''}
     <div class="cc-grid">${L.map(e=>{const [st,sc]=STL[e.status];
      const sub=e.impl&&e.impl.data_inicio?'desde '+new Date(e.impl.data_inicio+'T12:00').toLocaleDateString('pt-BR'):e.ult?'último acesso '+quando(e.ult):'sem acesso ainda';
      const pt=e.pt&&e.pt.situacao&&SIT[e.pt.situacao];
      return `<button type="button" class="cc-card${e.al.length?' al':''}" data-cce="${h(e.key)}">
       <div class="cc-hd"><span class="cc-av" style="background:${e.cor||CORST[e.status]}">${h(ini(e.nome))}</span><div class="cc-nm"><b>${h(e.nome)}</b><span class="cc-st ${sc}">${st}</span><small>${h(sub)}</small></div></div>
       ${e.tags.size?`<div class="cc-tg">${[...e.tags].map(t=>`<span>${h(t)}</span>`).join('')}</div>`:''}
       ${e.pr!=null?`<div class="cc-pb"><span>Implantação ${e.pr}% · ${S.prog[e.impl.id].ok} de ${S.prog[e.impl.id].tot} itens${pt?' · '+h(pt):''}</span><i><b style="width:${e.pr}%"></b></i></div>`:pt?`<div class="cc-pb"><span>${h(pt)}</span></div>`:''}
       <div class="cc-ft"><span>👥 ${e.logins} login${e.logins===1?'':'s'}</span><span class="${e.on?'on':''}">● ${e.on} online</span>${e.al.length?`<span class="${e.al.some(a=>a[0]==='bad')?'bad':'al'}">⚠️ ${e.al.length} alerta${e.al.length>1?'s':''}</span>`:''}</div>
      </button>`;}).join('')||'<p class="cc-vz">Nenhuma empresa neste filtro.</p>'}</div>`;}

  /* ---------- página da empresa ---------- */
  function abas(e){const A=[['res','Resumo'],['log','Logins']];if(e.impl||e.sec['Acompanhamento da implantação'])A.push(['impl','Implantação']);if(e.cons)A.push(['cons','Consultoria e vendas']);return A;}
  const at=(lbl,href,pri)=>`<a ${pri?'class="pri" ':''}href="${h(href)}" target="_blank" rel="noopener">${lbl}</a>`;

  function atalhos(e){const o=[];const id=e.cons,doc=id?S.docs[id]||{}:{},D=id&&S.D[id],ges=D&&(D.pessoas||[]).find(p=>p.papel==='gestor');
    if(id){o.push(at('👁 Ver como '+(ges?h(ges.nome.split(' ')[0]):'o gestor')+' vê','consultorias.html?ver='+encodeURIComponent(id)+'&como=gestor',true));
      o.push(at('🧭 Consultoria (fluxo, plano, visitas)','consultorias.html?ver='+encodeURIComponent(id)));
      o.push(at('🔐 Acessos e senhas','consultorias.html?ver='+encodeURIComponent(id)+'&abrir=acessos'));
      o.push(at('📚 '+(doc.catalogo?'Editar o catálogo':'Catálogos'),doc.catalogo?'catalogos.html?editar='+encodeURIComponent(doc.catalogo):'catalogos.html'));
      o.push(at('🛒 Painel de Vendas','orcamento/?e='+encodeURIComponent(id)));}
    if(e.impl)o.push(at('📋 Painel de Implantação','implantacao/'));
    if(e.mostr)o.push(`<button type="button" data-ccm="${h(e.mostr.uid)}">🎓 Abrir no Mostruário</button>`);
    return o.length?`<div class="cc-at">${o.join('')}</div>`:'';}

  function alertasHtml(e){const id=e.cons;
    return `<ul class="cc-al">${e.al.length?e.al.map(([n,t,k])=>`<li class="${n}"><span>${n==='bad'?'🔴':'🟠'}</span><span>${h(t)}</span>${k==='vendas'?`<a href="orcamento/?e=${encodeURIComponent(id)}" target="_blank" rel="noopener">Abrir o Painel de Vendas ↗</a>`:`<a href="consultorias.html?ver=${encodeURIComponent(id)}&abrir=acessos" target="_blank" rel="noopener">Ver acessos ↗</a>`}</li>`).join(''):'<li class="ok"><span>✅</span><span>Nada pendente nesta empresa.</span></li>'}</ul>`;}

  function tabRes(e){const p=e.impl&&S.prog[e.impl.id];
    return `<div class="cc-kp">
      <div><b>${e.logins}</b><small>login${e.logins===1?'':'s'} em todas as ferramentas</small></div>
      <div class="${e.on?'ok':''}"><b>${e.on}</b><small>online agora</small></div>
      <div class="${e.al.length?'warn':''}"><b>${e.al.length}</b><small>alerta${e.al.length===1?'':'s'}</small></div>
      <div><b>${e.ult?quando(e.ult):'—'}</b><small>último acesso de alguém</small></div>
      ${p?`<div><b>${e.pr}%</b><small>implantação · ${p.ok} de ${p.tot} itens</small></div>`:''}
      ${e.impl&&e.impl.status_recebimento?`<div><b style="font-size:15px">${h(e.impl.status_recebimento)}</b><small>recebimento${e.impl.emite_nota_fiscal?' · com NF':''}</small></div>`:''}</div>
     ${e.cons?`<div><h3>⚠️ Alertas</h3>${alertasHtml(e)}<p class="note" style="margin:6px 0 0">Avisar quando ninguém entrar há <select id="ccliX" aria-label="Dias sem acesso">${[2,3,5,7,15].map(n=>`<option value="${n}"${n===S.xd?' selected':''}>${n} dias</option>`).join('')}</select> · estoque parado: mais de 7 dias · fila do site: mais de 30 min.</p></div>`:''}
     <div><h3>🔗 Atalhos</h3>${atalhos(e)||'<p class="cc-vz">Sem atalhos para esta empresa.</p>'}</div>`;}

  function tabLog(e){const secs=ORDEM.filter(s=>e.sec[s]);
    const ger=e.cons&&typeof abrirAcessos==='function'?`<button type="button" data-ccg="1" style="font-size:13px">⚙ Gerenciar logins da Central do Gestor</button>`:'';
    const mo=e.mostr?`<button type="button" data-ccm="${h(e.mostr.uid)}" style="font-size:13px">🎓 Colaboradores no Mostruário</button>`:'';
    const out=secs.map(s=>`<div class="axs">${h(s)} · ${e.sec[s].length}</div>${FCAcessos.linhas(e.sec[s])}`).join('');
    let pe='';if(!out&&e.cons&&S.D[e.cons]){const P=S.D[e.cons].pessoas||[];
      pe=P.map(p=>`<span class="cc-p"><i class="${p.online?'on':''}" aria-hidden="true"></i>${h(p.nome)} <small>· ${h(PAPEL[p.papel]||p.papel)} · ${p.online?'online agora':quando(p.ultimo)}</small></span>`).join('');}
    return `${ger||mo?`<div class="cc-at">${ger}${mo}</div>`:''}
      ${out?`<div class="cc-lg">${out}</div>`:pe?`<div class="cc-pe">${pe}</div>`:'<p class="cc-vz">Nenhum login cadastrado para esta empresa.</p>'}`;}

  function tabImpl(e){const c=e.impl,p=c&&S.prog[c.id],pt=e.pt,L=e.sec['Acompanhamento da implantação']||[];
    return `${c?`<div class="cc-kp">
       <div><b style="font-size:15px">${h(STI[c.status]||c.status||'—')}</b><small>situação</small></div>
       <div><b>${c.data_inicio?new Date(c.data_inicio+'T12:00').toLocaleDateString('pt-BR'):'—'}</b><small>início</small></div>
       ${c.data_fim?`<div><b>${new Date(c.data_fim+'T12:00').toLocaleDateString('pt-BR')}</b><small>prazo final</small></div>`:''}
       <div><b>${pt?(pt.ativo?'Ligado':'Desligado'):'—'}</b><small>link de acompanhamento</small></div></div>
      ${p?`<div><h3>📈 Itens alimentados</h3><div class="cc-pg"><b style="width:${e.pr||0}%"></b></div><p class="note" style="margin:6px 0 0">${p.ok} de ${p.tot} itens (${e.pr||0}%)</p></div>`:'<p class="cc-vz">Ainda sem itens na lista de alimentação.</p>'}
      ${pt&&pt.situacao?`<p class="msg" style="margin:0">📌 ${h(SIT[pt.situacao]||pt.situacao)}${pt.situacao_detalhe?' · '+h(pt.situacao_detalhe):''}${pt.situacao_em?' · desde '+dBR(pt.situacao_em):''}</p>`:''}`:''}
     ${L.length?`<div><h3>📡 Quem acessa o link do cliente</h3><div class="cc-lg">${FCAcessos.linhas(L)}</div></div>`:''}
     <div class="cc-at">${at('📋 Abrir o Painel de Implantação','implantacao/',true)}</div>`;}

  function tabCons(e){const id=e.cons,D=S.D[id];if(!D)return '<p class="cc-vz">Sem dados desta consultoria ainda.</p>';
    const P=D.pessoas||[],o=D.orc||{},es=D.estoque,po=D.portal||{},esD=es&&es.em?dias(es.em):null;
    return `<div class="cc-kp">
       <div><b>${o.mes_n||0}</b><small>orçamentos no mês</small></div>
       <div><b>${brl(o.mes_total)}</b><small>valor no mês</small></div>
       <div><b>${o.abertos||0}</b><small>orçamentos em aberto</small></div>
       <div class="${o.desc_pend?'warn':''}"><b>${o.desc_pend||0}</b><small>desconto aguardando</small></div>
       <div><b>${D.vend_ativos||0}</b><small>vendedores ativos</small></div>
       <div class="${esD==null?'':esD>7?'warn':'ok'}"><b>${es&&es.em?dBR(es.em):'—'}</b><small>estoque atualizado${es?' · '+(es.itens||0)+' itens':''}</small></div>
       <div><b>${po.ultimo?quando(po.ultimo):'—'}</b><small>último acesso ao link${po.acessos?' · '+po.acessos+' no total':''}</small></div></div>
     <div><h3>👥 Equipe</h3><div class="cc-pe">${P.length?P.map(p=>{const n=dias(p.ultimo),par=!p.online&&(n==null||n>=S.xd);return `<span class="cc-p${par?' parado':''}"><i class="${p.online?'on':''}" aria-hidden="true"></i>${h(p.nome)} <small>· ${h(PAPEL[p.papel]||p.papel)} · ${p.online?'online agora':quando(p.ultimo)}</small></span>`;}).join(''):'<span class="note">Nenhuma pessoa cadastrada. Use 🔐 Acessos e senhas.</span>'}</div></div>
     <div><h3>🕘 Atividade recente</h3><ul class="cc-ev">${(D.eventos||[]).slice(0,12).map(x=>`<li><span class="t">${quando(x.em)}</span> <b>${h(x.nome||'?')}</b> ${h(frase(x))}</li>`).join('')||'<li class="note">Nada registrado ainda.</li>'}</ul></div>
     <div class="cc-at">${atalhos(e)}</div>`;}

  function pagina(e){const A=abas(e);if(!A.some(a=>a[0]===S.aba))S.aba='res';const [st,sc]=STL[e.status];
    const corpo={res:tabRes,log:tabLog,impl:tabImpl,cons:tabCons}[S.aba](e);
    return `<div class="cc-top"><button type="button" id="ccliVolta" style="font-size:13.5px">← Todas as empresas</button>
      <span class="note">${S.carregando?'Atualizando…':S.em?'atualizado às '+S.em.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):''} <button type="button" id="ccliRe" style="margin-left:6px;font-size:13px">🔄 Atualizar</button></span></div>
     ${S.erro?`<p class="msg bad" style="margin:0">${h(S.erro)}</p>`:''}
     <div class="cc-emp">
      <div class="cc-hd"><span class="cc-av" style="background:${e.cor||CORST[e.status]};width:46px;height:46px;flex-basis:46px;font-size:16px">${h(ini(e.nome))}</span>
       <div class="cc-nm"><b style="font-size:19px">${h(e.nome)}</b><small>${[...e.tags].join(' · ')||'—'}</small></div><span class="cc-st ${sc}">${st}</span></div>
      <div class="cc-tabs" role="tablist">${A.map(([k,t])=>`<button type="button" role="tab" data-cct="${k}" aria-selected="${S.aba===k}">${t}${k==='res'&&e.al.length?` <span style="background:#e11d48;color:#fff;border-radius:9px;padding:0 6px;font-size:12px">${e.al.length}</span>`:''}${k==='log'&&e.on?` <span style="color:${S.aba==='log'?'#fff':'var(--ok)'}">● ${e.on}</span>`:''}</button>`).join('')}</div>
      <div class="cc-in">${corpo}</div></div>`;}

  /* ---------- pinta ---------- */
  function pinta(){const B=$('ccliBody');if(!B)return;css();
    const E=empresas();
    const tot=E.reduce((n,e)=>n+e.al.length,0),tb=$('tbCcli');if(tb)tb.textContent=tot||'';
    if(!E.length){B.innerHTML=`<p class="note" style="padding:12px 16px">${S.erro?h(S.erro):'Carregando…'}</p>`;return;}
    const foco=document.activeElement&&document.activeElement.id==='ccliQ';
    const e=S.ver&&E.find(x=>x.key===S.sel);
    B.innerHTML=`<div class="cc-body">${e?pagina(e):grade(E)}</div>`;
    B.querySelectorAll('[data-ccf]').forEach(b=>b.onclick=()=>{S.filtro=b.dataset.ccf;grava('fc_ccli_f',S.filtro);pinta();});
    B.querySelectorAll('[data-cce]').forEach(b=>b.onclick=()=>{S.sel=b.dataset.cce;S.ver=true;S.aba='res';grava('fc_ccli_emp',S.sel);pinta();$('ccliCard').scrollIntoView({behavior:'smooth',block:'start'});});
    B.querySelectorAll('[data-cct]').forEach(b=>b.onclick=()=>{S.aba=b.dataset.cct;pinta();});
    B.querySelectorAll('[data-ccm]').forEach(b=>b.onclick=()=>{const t=document.querySelector('#ptabs [data-tab=emp]');if(t)t.click();setTimeout(()=>FCAcessos&&FCAcessos.abrirMostr(b.dataset.ccm),150);});
    B.querySelectorAll('[data-ccg]').forEach(b=>b.onclick=()=>{try{abrirAcessos(e.cons,e.nome);}catch(_){location.href='consultorias.html?ver='+encodeURIComponent(e.cons)+'&abrir=acessos';}});
    const v=$('ccliVolta');if(v)v.onclick=()=>{S.ver=false;pinta();};
    const re=$('ccliRe');if(re)re.onclick=carregar;
    const q=$('ccliQ');if(q){q.oninput=()=>{S.buscaTxt=q.value;S.busca=norm(q.value);pinta();};if(foco){q.focus();q.setSelectionRange(q.value.length,q.value.length);}}
    const x=$('ccliX');if(x)x.onchange=()=>{S.xd=+x.value;grava('fc_ccli_dias',String(S.xd));pinta();};}

  const ativo=()=>{const c=$('ccliCard');return c&&!c.classList.contains('tabOff');};
  const tab=document.querySelector('#ptabs [data-tab=ccli]');if(tab)tab.addEventListener('click',()=>{if(!S.em||Date.now()-S.em>60000)carregar();else pinta();});
  setTimeout(carregar,3000);
  setInterval(()=>{if(document.hidden)return;if(ativo()||!S.em||Date.now()-S.em>600000)carregar();},120000);
  window.FCCentralCliente={carregar,alertas:()=>S.emps.map(e=>({id:e.id,nome:e.nome,alertas:alertasCons(e.id)}))};
})();
