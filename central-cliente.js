/* ===== Painel da Matriz · 🧭 Central do Cliente =====
   Uma visão por cliente da consultoria (CB, Guaporé, CDE…): a mesma Central do Gestor (RPC emp_central com p_emp),
   alertas (estoque parado, pedido do site na fila, desconto pendente, ninguém entrando), equipe, atividade e atalhos
   (ver como o gestor vê, consultoria, acessos, catálogo, Painel de Vendas). */
(function(){
  if(typeof sb==='undefined')return;
  const $=id=>document.getElementById(id);
  const h=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const brl=v=>(+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const ler=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v;}catch(_){return d;}};
  const grava=(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}};
  const dias=t=>t?Math.floor((Date.now()-new Date(t))/864e5):null;
  const quando=t=>{if(!t)return 'nunca entrou';const m=Math.round((Date.now()-new Date(t))/60000);
    if(m<2)return 'agora';if(m<60)return 'há '+m+' min';const hr=Math.round(m/60);if(hr<24)return 'há '+hr+' h';const d=Math.round(hr/24);return d===1?'ontem':'há '+d+' dias';};
  const dBR=t=>t?new Date(t).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):'—';
  const PAPEL={gestor:'Gestor',compras:'Compras',vendas:'Vendas',gerente:'Gerente comercial',marketing:'Marketing',fabrica:'Fábrica'};
  const ABA={orc:'Orçamento e Pedidos',est:'o Estoque',cat:'o Catálogo',esq:'o Treinamento 3D',comp:'Onde comprar',dist:'Distribuidoras',conv:'a Conversão de códigos',pla:'as Planilhas',sol:'as Solicitações',age:'a Agenda',proc:'o Fluxo do processo',acao:'o Plano de ação',cen:'a Central do Gestor',dia:'o Diário',ori:'a Orientação',dem:'as Entregas',gal:'a Galeria',mkt:'o Marketing',div:'a Divulgação'};
  const S={emps:[],docs:{},D:{},fila:[],sel:ler('fc_ccli_sel',''),xd:+ler('fc_ccli_dias','3')||3,carregando:false,em:null,erro:''};

  function frase(x){const d=x.detalhe||{};
    if(x.area==='entrada'||x.acao==='login')return 'entrou no painel';
    if(x.area==='aba')return 'abriu '+(ABA[x.acao]||'a aba '+x.acao);
    if(x.acao==='desconto_pedido')return `pediu ${d.pct}% de desconto no orçamento nº ${d.numero}${d.cliente?' ('+d.cliente+')':''}`;
    if(x.acao==='desconto_aprovado')return `aprovou ${d.pct}% de desconto no orçamento nº ${d.numero}`;
    if(x.acao==='desconto_recusado')return `recusou o desconto do orçamento nº ${d.numero}`;
    if(x.acao==='site_assumido')return `assumiu o pedido do site nº ${d.numero} em ${d.minutos} min`;
    if(x.acao==='estoque_importado')return `atualizou o estoque (${d.itens} itens)`;
    return [x.area,x.acao].filter(Boolean).join(' · ');}

  /* alertas de um cliente: [nível 'bad'|'warn', texto, atalho] */
  function alertas(id){const D=S.D[id];if(!D)return [];const A=[];
    const fila=S.fila.filter(i=>i.emp===id);
    if(fila.length)A.push(['bad',`${fila.length} pedido${fila.length>1?'s':''} do site na fila há mais de 30 min, sem vendedor`,'vendas']);
    const dp=(D.orc||{}).desc_pend||0;
    if(dp)A.push(['warn',`${dp} desconto${dp>1?'s':''} aguardando decisão do gestor ou gerente`,'vendas']);
    const es=D.estoque;if(es&&es.em){const n=dias(es.em);if(n>7)A.push(['warn',`Estoque sem atualizar há ${n} dias (último em ${dBR(es.em)})`,'vendas']);}
    const P=D.pessoas||[],ult=[...P.map(p=>p.ultimo),(D.portal||{}).ultimo].filter(Boolean).sort().pop();
    const n=dias(ult);
    if(P.length||(D.portal||{}).ultimo){if(n==null)A.push(['warn','Ninguém da equipe entrou ainda','gestor']);else if(n>=S.xd)A.push(['warn',`Ninguém da equipe entra há ${n} dias (último acesso ${dBR(ult)})`,'gestor']);}
    return A;}

  async function carregar(){if(S.carregando)return;S.carregando=true;S.erro='';pinta();
    try{
      if(!S.emps.length){const r=await sb.from('rotina_docs').select('id,data').eq('col','consultoria');if(r.error)throw r.error;
        S.emps=(r.data||[]).map(x=>({id:x.id,nome:(x.data&&x.data.nome)||x.id})).sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
        (r.data||[]).forEach(x=>S.docs[x.id]=x.data||{});
        if(!S.emps.some(e=>e.id===S.sel))S.sel=(S.emps.find(e=>e.id==='cb')||S.emps[0]||{}).id||'';}
      const [cx,...cs]=await Promise.all([sb.rpc('fc_caixa'),...S.emps.map(e=>sb.rpc('emp_central',{p_token:'',p_emp:e.id}))]);
      S.fila=((cx.data&&cx.data.itens)||[]).filter(i=>i.tipo==='fila');
      cs.forEach((r,i)=>{if(r.data)S.D[S.emps[i].id]=r.data;else if(r.error)S.erro='Parte dos dados não carregou: '+r.error.message;});
      S.em=new Date();
    }catch(e){S.erro='Não consegui carregar agora: '+(e.message||e);}
    S.carregando=false;pinta();}

  function css(){if($('ccliCss'))return;const st=document.createElement('style');st.id='ccliCss';st.textContent=`
#ccliCard .cc-body{padding:14px 16px;display:flex;flex-direction:column;gap:14px}
#ccliCard .cc-sel{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#ccliCard .cc-sel button{font:600 14px var(--f-display,system-ui);padding:8px 14px;border:1px solid var(--line);border-radius:999px;background:var(--panel);color:var(--fg);cursor:pointer;display:inline-flex;gap:6px;align-items:center}
#ccliCard .cc-sel button[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:#fff}
#ccliCard .cc-sel .bd{min-width:20px;padding:0 6px;border-radius:10px;background:#e11d48;color:#fff;font-size:12px}
#ccliCard .cc-al{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
#ccliCard .cc-al li{display:flex;gap:10px;align-items:center;padding:9px 12px;border-radius:10px;font-size:14.5px;font-weight:600}
#ccliCard .cc-al li.bad{background:var(--bad-soft);color:var(--bad)}#ccliCard .cc-al li.warn{background:#fdf3e2;color:#8a5a00}#ccliCard .cc-al li.ok{background:var(--ok-soft);color:var(--ok)}
#ccliCard .cc-al a{margin-left:auto;font-size:13px;white-space:nowrap}
#ccliCard .cc-kp{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
#ccliCard .cc-kp div{background:var(--bg);border-radius:10px;padding:9px 11px;display:flex;flex-direction:column}
#ccliCard .cc-kp b{font:700 19px var(--f-display,system-ui);font-variant-numeric:tabular-nums}#ccliCard .cc-kp small{font-size:12.5px;color:var(--muted)}
#ccliCard .cc-kp .warn b{color:#b26b00}#ccliCard .cc-kp .ok b{color:var(--ok)}
#ccliCard .cc-at{display:flex;gap:8px;flex-wrap:wrap}
#ccliCard .cc-at a{display:inline-flex;gap:6px;align-items:center;padding:8px 12px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--fg);text-decoration:none;font:600 13.5px var(--f-display,system-ui)}
#ccliCard .cc-at a.pri{background:var(--accent);border-color:var(--accent);color:#fff}
#ccliCard .cc-pe{display:flex;gap:6px;flex-wrap:wrap}
#ccliCard .cc-p{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:99px;padding:4px 11px;font-size:13.5px;font-weight:600}
#ccliCard .cc-p small{font-weight:500;color:var(--muted)}#ccliCard .cc-p i{width:8px;height:8px;border-radius:50%;background:var(--line)}#ccliCard .cc-p i.on{background:var(--ok)}
#ccliCard .cc-p.parado{border-color:#e8b45a;background:#fdf6ea}
#ccliCard h3{margin:0 0 6px;font:700 12px var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
#ccliCard .cc-ev{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px;font-size:14px}
#ccliCard .cc-ev .t{color:var(--muted);font-size:12px;display:inline-block;min-width:72px}
#ccliCard .cc-top{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:space-between}
#ccliCard .cc-top select{font:inherit;font-size:13px;padding:4px 6px;border:1px solid var(--line);border-radius:6px}`;document.head.appendChild(st);}

  function pinta(){const B=$('ccliBody');if(!B)return;css();
    const tot=S.emps.reduce((n,e)=>n+alertas(e.id).length,0),tb=$('tbCcli');if(tb)tb.textContent=tot||'';
    if(!S.emps.length){B.innerHTML=`<p class="note" style="padding:12px 16px">${S.erro?h(S.erro):'Carregando…'}</p>`;return;}
    const id=S.sel,D=S.D[id],e=S.emps.find(x=>x.id===id)||{},doc=S.docs[id]||{},A=alertas(id);
    const P=(D&&D.pessoas)||[],on=P.filter(p=>p.online).length,ges=P.find(p=>p.papel==='gestor'),o=(D&&D.orc)||{},es=D&&D.estoque,po=(D&&D.portal)||{};
    const esD=es&&es.em?dias(es.em):null;
    const at=(lbl,href,pri)=>`<a ${pri?'class="pri" ':''}href="${h(href)}" target="_blank" rel="noopener">${lbl}</a>`;
    B.innerHTML=`<div class="cc-body">
     <div class="cc-top"><div class="cc-sel" role="group" aria-label="Cliente">${S.emps.map(x=>{const n=alertas(x.id).length;return `<button type="button" data-cc="${h(x.id)}" aria-pressed="${x.id===id}">${h(x.nome)}${n?`<span class="bd">${n}</span>`:''}</button>`;}).join('')}</div>
      <span class="note">${S.carregando?'Atualizando…':S.em?'atualizado às '+S.em.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):''} <button type="button" id="ccliRe" style="margin-left:6px;font-size:13px">🔄 Atualizar</button></span></div>
     ${S.erro?`<p class="msg bad" style="margin:0">${h(S.erro)}</p>`:''}
     <div><h3>⚠️ Alertas · ${h(e.nome||'')}</h3><ul class="cc-al">${A.length?A.map(([n,t,k])=>`<li class="${n}"><span>${n==='bad'?'🔴':'🟠'}</span><span>${h(t)}</span>${k==='vendas'?`<a href="orcamento/?e=${encodeURIComponent(id)}" target="_blank" rel="noopener">Abrir o Painel de Vendas ↗</a>`:`<a href="consultorias.html?ver=${encodeURIComponent(id)}&abrir=acessos" target="_blank" rel="noopener">Ver acessos ↗</a>`}</li>`).join(''):(D?'<li class="ok"><span>✅</span><span>Nada pendente neste cliente.</span></li>':'<li class="warn"><span>…</span><span>Sem dados deste cliente ainda.</span></li>')}</ul>
      <p class="note" style="margin:6px 0 0">Avisar quando ninguém entrar há <select id="ccliX" aria-label="Dias sem acesso">${[2,3,5,7,15].map(n=>`<option value="${n}"${n===S.xd?' selected':''}>${n} dias</option>`).join('')}</select> · estoque parado: mais de 7 dias · fila do site: mais de 30 min.</p></div>
     <div class="cc-at">${at('👁 Ver como '+(ges?h(ges.nome.split(' ')[0]):'o gestor')+' vê','consultorias.html?ver='+encodeURIComponent(id)+'&como=gestor',true)}${at('🧭 Consultoria (visão FC)','consultorias.html?ver='+encodeURIComponent(id))}${at('🔐 Acessos e senhas','consultorias.html?ver='+encodeURIComponent(id)+'&abrir=acessos')}${at('📚 '+(doc.catalogo?'Editar o catálogo':'Catálogos'),doc.catalogo?'catalogos.html?editar='+encodeURIComponent(doc.catalogo):'catalogos.html')}${at('🛒 Painel de Vendas','orcamento/?e='+encodeURIComponent(id))}</div>
     ${D?`<div class="cc-kp">
       <div class="${on?'ok':''}"><b>${on}</b><small>online agora</small></div>
       <div><b>${P.length}</b><small>pessoa${P.length===1?'':'s'} com acesso</small></div>
       <div><b>${o.mes_n||0}</b><small>orçamentos no mês</small></div>
       <div><b>${brl(o.mes_total)}</b><small>valor no mês</small></div>
       <div><b>${o.abertos||0}</b><small>orçamentos em aberto</small></div>
       <div class="${o.desc_pend?'warn':''}"><b>${o.desc_pend||0}</b><small>desconto aguardando</small></div>
       <div><b>${D.vend_ativos||0}</b><small>vendedores ativos</small></div>
       <div class="${esD==null?'':esD>7?'warn':'ok'}"><b>${es&&es.em?dBR(es.em):'—'}</b><small>estoque atualizado${es?' · '+(es.itens||0)+' itens':''}</small></div>
       <div><b>${po.ultimo?quando(po.ultimo):'—'}</b><small>último acesso ao link${po.acessos?' · '+po.acessos+' no total':''}</small></div></div>
     <div><h3>👥 Equipe</h3><div class="cc-pe">${P.length?P.map(p=>{const n=dias(p.ultimo),par=!p.online&&(n==null||n>=S.xd);return `<span class="cc-p${par?' parado':''}"><i class="${p.online?'on':''}" aria-hidden="true"></i>${h(p.nome)} <small>· ${h(PAPEL[p.papel]||p.papel)} · ${p.online?'online agora':quando(p.ultimo)}</small></span>`;}).join(''):'<span class="note">Nenhuma pessoa cadastrada. Use 🔐 Acessos e senhas.</span>'}</div></div>
     <div><h3>🕘 Atividade recente</h3><ul class="cc-ev">${(D.eventos||[]).slice(0,12).map(x=>`<li><span class="t">${quando(x.em)}</span> <b>${h(x.nome||'?')}</b> ${h(frase(x))}</li>`).join('')||'<li class="note">Nada registrado ainda.</li>'}</ul></div>`:''}
    </div>`;
    B.querySelectorAll('[data-cc]').forEach(b=>b.onclick=()=>{S.sel=b.dataset.cc;grava('fc_ccli_sel',S.sel);pinta();});
    const re=$('ccliRe');if(re)re.onclick=carregar;
    const x=$('ccliX');if(x)x.onchange=()=>{S.xd=+x.value;grava('fc_ccli_dias',String(S.xd));pinta();};}

  const ativo=()=>{const c=$('ccliCard');return c&&!c.classList.contains('tabOff');};
  const tab=document.querySelector('#ptabs [data-tab=ccli]');if(tab)tab.addEventListener('click',()=>{if(!S.em||Date.now()-S.em>60000)carregar();else pinta();});
  setTimeout(carregar,3000);
  setInterval(()=>{if(document.hidden)return;if(ativo()||!S.em||Date.now()-S.em>600000)carregar();},120000);
  window.FCCentralCliente={carregar,alertas:()=>S.emps.map(e=>({id:e.id,nome:e.nome,alertas:alertas(e.id)}))};
})();
