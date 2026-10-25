/* Central do Gestor — consultorias.html?e=<empresa>, só para a pessoa com papel "gestor".
   Junta num só lugar o que cada setor da empresa está fazendo, com botão para a aba de origem.
   Dados: E[at] (acompanhamento da consultoria), PUBSOL (solicitações) e a RPC emp_central (pessoas, eventos, vendas, estoque). */
(function(){
  let D=null,carregando=false,erro='';
  const h=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const brl=v=>(+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const dBR=s=>{if(!s)return '';const t=String(s).slice(0,10).split('-');return t.length===3?t[2]+'/'+t[1]:String(s);};
  const quando=t=>{if(!t)return 'nunca entrou';const m=Math.round((Date.now()-new Date(t))/60000);
    if(m<2)return 'agora';if(m<60)return 'há '+m+' min';const hr=Math.round(m/60);if(hr<24)return 'há '+hr+' h';const d=Math.round(hr/24);return d===1?'ontem':'há '+d+' dias';};
  const PAPEL={gestor:'Gestor geral',compras:'Compras',vendas:'Vendas',gerente:'Gerente comercial',marketing:'Marketing',fabrica:'Fábrica'};
  const nomeAba=k=>{const a=ABAS.find(x=>x[0]===k);return a?lblAba(a[1],E[at]):k;};
  function frase(x){const d=x.detalhe||{};
    if(x.area==='entrada')return 'entrou no painel';
    if(x.area==='aba')return 'abriu '+nomeAba(x.acao);
    if(x.acao==='desconto_pedido')return `pediu ${d.pct}% de desconto no orçamento nº ${d.numero}${d.cliente?' ('+d.cliente+')':''}`;
    if(x.acao==='desconto_aprovado')return `aprovou ${d.pct}% de desconto no orçamento nº ${d.numero}${d.vendedor?' de '+d.vendedor:''}`;
    if(x.acao==='desconto_recusado')return `recusou o desconto do orçamento nº ${d.numero}${d.vendedor?' de '+d.vendedor:''}`;
    if(x.acao==='site_assumido')return `assumiu o pedido do site nº ${d.numero}${d.cliente?' ('+d.cliente+')':''} em ${d.minutos} min`;
    if(x.acao==='estoque_importado')return `atualizou o estoque (${d.itens} itens)`;
    return x.acao||'';}
  const linhaEv=x=>`<li><span class="cg-t">${quando(x.em)}</span> <b>${h(x.nome||'?')}</b> ${h(frase(x))}</li>`;

  const ADM=()=>!PESSOA&&typeof PUB!=='undefined'&&!PUB&&!!at;
  async function carregar(){if(carregando||(!PESSOA&&!ADM()))return;carregando=true;erro='';
    const r=await sb.rpc('emp_central',PESSOA?{p_token:PESSOA.token}:{p_token:'',p_emp:at});carregando=false;
    if(r.error||!r.data){erro='Não consegui carregar o resumo agora. Toque em Atualizar.';}else D=r.data;
    if(tab==='cen')ficha();}

  /* 25/10/2026 · tela simplificada: "Precisa de você", números da semana (7 dias x 7 anteriores), 4 setores. */
  const hojeISO=()=>new Date().toISOString().slice(0,10);
  const kmil=v=>{v=+v||0;return v>=1000?'R$ '+(v/1000).toLocaleString('pt-BR',{maximumFractionDigits:v>=1e5?0:1})+' mil':brl(v);};
  function delta(a,b,pp){a=+a||0;b=+b||0;if(pp){const d=Math.round(a-b);return d?`<span class="${d>0?'cg-up':'cg-dn'}">${d>0?'▲':'▼'} ${Math.abs(d)} p.p.</span>`:'<span class="cg-eq0">= igual</span>';}
    if(!b)return a?'<span class="cg-up">▲ novo</span>':'<span class="cg-eq0">= igual</span>';const p=Math.round((a-b)/b*100);
    return p?`<span class="${p>0?'cg-up':'cg-dn'}">${p>0?'▲':'▼'} ${Math.abs(p)}%</span>`:'<span class="cg-eq0">= igual</span>';}
  function estDias(){const s=(D&&D.estoque)||{};return s.em?Math.floor((Date.now()-new Date(s.em))/864e5):null;}
  function pend(){const S=(D&&D.sem)||{},o=[],d=estDias();
    if(S.desc24)o.push(['🏷',S.desc24+(S.desc24===1?' desconto acima do limite parado':' descontos acima do limite parados')+' há mais de 24h','orc']);
    if(S.fin48)o.push(['💳',S.fin48+(S.fin48===1?' pedido aguardando':' pedidos aguardando')+' o financeiro há mais de 2 dias','orc']);
    if(d!=null&&d>7)o.push(['📦','Estoque sem atualizar há '+d+' dias','est']);
    return o;}
  function nums(){const S=(D&&D.sem)||{},c1=S.n1?Math.round(S.f1/S.n1*100):null,c0=S.n0?Math.round(S.f0/S.n0*100):null;
    return [['Orçamentos',S.n1||0,delta(S.n1,S.n0)],['Valor orçado',kmil(S.v1),delta(S.v1,S.v0)],['Pedidos fechados',S.f1||0,delta(S.f1,S.f0)],
      ['Valor fechado',kmil(S.fv1),delta(S.fv1,S.fv0)],['Conversão',c1==null?'—':c1+'%',c1==null||c0==null?'':delta(c1,c0,1)]];}
  /* setores: [id, ícone, título, abas de origem, linhas(e) -> [[valor, rótulo, alerta?]]] */
  const SET=[
    ['ven','🏪','Vendas',['orc'],e=>{const o=(D&&D.orc)||{},S=(D&&D.sem)||{};
      return [[o.mes_n||0,'orçamentos no mês'],[kmil(o.mes_total),'valor no mês'],[S.abertos7||0,'abertos há +7 dias',S.abertos7>0],[o.desc_pend||0,'descontos para aprovar',o.desc_pend>0],[(D&&D.vend_ativos)||0,'vendedores ativos']];}],
    ['cmp','🛒','Compras e estoque',['est','comp','dist','conv','pla'],e=>{const s=(D&&D.estoque)||{},d=estDias();
      return [[s.em?dBR(s.em):'—','estoque atualizado',d!=null&&d>7],[s.itens||0,'itens no estoque']];}],
    ['tre','🎓','Equipe e treinamento',['esq','ori','dia'],e=>{const F=e.treinFunc||[],S=(D&&D.sem)||{},P=((D&&D.pessoas)||[]).length;
      const nx=(e.agenda||[]).filter(a=>a.cli!==false&&a.data>=hojeISO()&&!a.feito&&/trein/i.test((a.tipo||'')+' '+(a.titulo||''))).sort((a,b)=>(a.data+(a.hora||'')).localeCompare(b.data+(b.hora||'')))[0];
      return [[(S.usaram7||0)+' de '+P,'usaram na semana'],[F.length,'inscritos no treinamento'],[nx?dBR(nx.data)+(nx.hora?' '+nx.hora:''):'—','próximo treinamento']];}],
    ['fc','🤝','FC e catálogo',['proc','dem','sol','age','cat','div','mkt'],e=>{
      const fl=(e.frentes||[]).flatMap(f=>f.p),ok=fl.filter(p=>p[0]==='ok').length,c=e.cat||{};
      const S=ADM()?(SOL||[]).filter(x=>x.empresa_id===at):(PUBSOL||[]),ab=S.filter(x=>x.status==='nova'||x.status==='aceita').length;
      const nx=(e.agenda||[]).filter(a=>a.cli&&a.data>=hojeISO()&&!a.feito).sort((a,b)=>(a.data+(a.hora||'')).localeCompare(b.data+(b.hora||'')))[0];
      return [[fl.length?Math.round(ok/fl.length*100)+'%':'—','andamento da consultoria'],[ab,'pedidos à FC em aberto'],[nx?dBR(nx.data)+(nx.hora?' '+nx.hora:''):'—','próximo compromisso'],
        [c.ativo===false?'Pausado':(c.slug||c.dominio)?'No ar':'Em montagem','catálogo virtual',c.ativo===false]];}]
  ];
  function setor([id,ic,tit,abas,fn],e){const L=fn(e),al=L.some(x=>x[2]),lib=abas.filter(k=>abasLib(e).includes(k));
    return `<section class="cg-card" aria-labelledby="cg-${id}"><header><span class="cg-ic" aria-hidden="true">${ic}</span><h3 id="cg-${id}">${h(tit)}</h3>
      <span class="cg-tag ${al?'cg-tw':'cg-tok'}">${al?'Atenção':'Em dia'}</span></header>
      <div class="cg-kp">${L.map(([v,l,a])=>`<div class="${a?'cg-warn':''}"><b>${h(v)}</b><small>${h(l)}</small></div>`).join('')}</div>
      ${lib.length?`<footer>${lib.map(k=>`<button class="btn" type="button" data-cgab="${k}">${h(nomeAba(k))} →</button>`).join('')}</footer>`:''}</section>`;}
  function resumoTxt(e){const S=(D&&D.sem)||{},P=pend(),f=new Date(),i=new Date(Date.now()-6*864e5),d=x=>x.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
    const ar=(a,b)=>{a=+a||0;b=+b||0;if(!b)return a?' (novo)':'';const p=Math.round((a-b)/b*100);return p?` (${p>0?'▲':'▼'} ${Math.abs(p)}%)`:' (igual)';};
    const c1=S.n1?Math.round(S.f1/S.n1*100):null;
    return `*${e.nome} · resumo da semana ${d(i)} a ${d(f)}*\n\n`+
      (P.length?`*Precisa da sua atenção*\n${P.map(p=>'• '+p[1]).join('\n')}\n\n`:`✅ Nenhuma pendência de decisão.\n\n`)+
      `*Números (comparado à semana anterior)*\n• Orçamentos: ${S.n1||0}${ar(S.n1,S.n0)}\n• Valor orçado: ${kmil(S.v1)}${ar(S.v1,S.v0)}\n• Pedidos fechados: ${S.f1||0}${ar(S.f1,S.f0)}\n• Valor fechado: ${kmil(S.fv1)}${ar(S.fv1,S.fv0)}\n`+
      (c1!=null?`• Conversão: ${c1}%\n`:'')+`• Equipe que usou o painel: ${S.usaram7||0} de ${((D&&D.pessoas)||[]).length}\n`+
      (S.abertos7?`\nObs.: ${S.abertos7} orçamento${S.abertos7===1?'':'s'} em aberto há mais de 7 dias, vale cobrar retorno dos clientes.\n`:'')+
      `\nDetalhes no painel: ${location.origin}${location.pathname}?e=${at}\n\n_FC Consultoria_`;}

  function html(e){if(D&&ADM()&&D.emp!==at){D=null;erro='';}if(!D&&!erro)carregar();
    const P=((D&&D.pessoas)||[]).slice().sort((a,b)=>(b.online?1:0)-(a.online?1:0)),EV=(D&&D.eventos)||[],S=(D&&D.sem)||{},PD=D?pend():[];
    const nome=PESSOA&&PESSOA.nome?String(PESSOA.nome).split(' ')[0]:'',hr=new Date().getHours(),sd=hr<12?'Bom dia':hr<18?'Boa tarde':'Boa noite';
    return `<style>
.cg-top{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:6px}.cg-top h2{flex:1;min-width:200px}
.cg-lbl{font:600 13px var(--f-b);color:var(--muted);margin:16px 0 8px;text-transform:none}
.cg-pd{border:1px solid #e0b100;background:var(--warn-soft);border-radius:12px;padding:4px 14px}
.cg-pd div{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px dashed #e0b10088;font-size:14.5px}.cg-pd div:first-child{border-top:0}
.cg-pd span+span{flex:1}.cg-ok0{border:1px solid var(--ok);background:var(--ok-soft);border-radius:12px;padding:12px 14px;font-weight:600;color:var(--ok)}
.cg-nm{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
.cg-nm div{background:var(--surface-2);border-radius:10px;padding:10px 12px}.cg-nm small{display:block;font-size:12.5px;color:var(--muted)}
.cg-nm b{font:600 20px var(--f-m);font-variant-numeric:tabular-nums}.cg-up{color:var(--ok);font-size:12.5px;font-weight:600}.cg-dn{color:var(--bad);font-size:12.5px;font-weight:600}.cg-eq0{color:var(--muted);font-size:12.5px}
.cg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}
.cg-card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px}
.cg-card header{display:flex;align-items:center;gap:8px}.cg-card h3{flex:1}.cg-ic{font-size:20px}
.cg-tag{font-size:12px;font-weight:600;padding:2px 9px;border-radius:99px}.cg-tok{background:var(--ok-soft);color:var(--ok)}.cg-tw{background:var(--warn-soft);color:var(--warn)}
.cg-kp{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px}
.cg-kp div{background:var(--surface-2);border-radius:10px;padding:7px 9px;display:flex;flex-direction:column}
.cg-kp b{font:600 16px var(--f-m);font-variant-numeric:tabular-nums}.cg-kp small{font-size:12px;color:var(--muted);line-height:1.25}
.cg-kp .cg-warn{background:var(--warn-soft)}.cg-kp .cg-warn b{color:var(--warn)}
.cg-card footer{display:flex;gap:6px;flex-wrap:wrap;border-top:1px dashed var(--line);padding-top:10px}.cg-card footer .btn{font-size:13px;padding:6px 10px}
.cg-p{display:inline-flex;align-items:center;gap:6px;background:var(--surface-2);border:1px solid var(--line);border-radius:99px;padding:3px 10px;font-size:13px;font-weight:600}
.cg-p small{font-weight:500;color:var(--muted)}.cg-p i{width:8px;height:8px;border-radius:50%;background:var(--line)}.cg-p i.on{background:var(--ok)}
.cg-mais{margin-top:14px}.cg-mais summary{cursor:pointer}.cg-mais ul{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:4px;max-height:320px;overflow:auto;font-size:14px}
.cg-t{color:var(--muted);font-size:12px;white-space:nowrap}.cg-wa{background:#e8f8ee;border:1px solid #22b36b;border-radius:12px;padding:12px 14px;margin-top:14px}
</style>
<div class="cg-top"><div><div class="eyebrow">Central do Gestor · ${h(e.nome)}</div><h2>${nome?sd+', '+h(nome):'Visão geral da empresa'}</h2></div>
  <span class="nota">${D?`👥 ${S.usaram_hoje||0} de ${P.length} da equipe usaram hoje · atualizado ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`:carregando?'Carregando…':''}</span>
  <button class="btn" type="button" id="cgAt">↻ Atualizar</button></div>
${erro?`<div class="box" style="background:var(--warn-soft)">${h(erro)}</div>`:''}
<div class="cg-lbl">Precisa de você${PD.length?' · '+PD.length:''}</div>
${!D?'<div class="nota">Carregando…</div>':PD.length?`<div class="cg-pd">${PD.map(p=>`<div><span aria-hidden="true">${p[0]}</span><span>${h(p[1])}</span><button class="btn" type="button" data-cgab="${p[2]}">Ver →</button></div>`).join('')}</div>`:'<div class="cg-ok0">✓ Tudo em dia. Nenhuma decisão esperando por você.</div>'}
<div class="cg-lbl">Números da semana · últimos 7 dias comparados aos 7 anteriores</div>
<div class="cg-nm">${nums().map(([l,v,d])=>`<div><small>${h(l)}</small><b>${h(v)}</b> ${d}</div>`).join('')}</div>
<div class="cg-lbl">Setores</div>
<div class="cg-grid">${SET.map(c=>setor(c,e)).join('')}</div>
<div style="text-align:center;margin-top:14px"><button class="btn" type="button" id="cgTools">🧰 Ver todas as ferramentas</button></div>
${ADM()&&D?`<div class="cg-wa"><b>📲 Resumo semanal para o gestor</b> <span class="nota">· só a FC vê este quadro. Envie na segunda pelo WhatsApp.</span>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button class="btn pri" type="button" id="cgWaCop">Copiar resumo</button><a class="btn" style="text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(resumoTxt(e))}">Abrir no WhatsApp</a></div></div>`:''}
<details class="box cg-mais"><summary><b>👥 Equipe</b> <span class="muted" style="font-size:13px">· ${P.filter(p=>p.online).length} online agora</span></summary>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${P.map(p=>`<span class="cg-p"><i class="${p.online?'on':''}" aria-hidden="true"></i>${h(p.nome)} <small>· ${h(PAPEL[p.papel]||p.papel)} · ${p.online?'online':quando(p.ultimo)}</small></span>`).join('')}</div></details>
<details class="box cg-mais"><summary><b>🕘 Atividade recente</b> <span class="muted" style="font-size:13px">· ${EV.length} registro${EV.length===1?'':'s'}</span></summary>
  <ul>${EV.length?EV.slice(0,60).map(linhaEv).join(''):'<li class="nota">Nada registrado ainda.</li>'}</ul></details>`;}

  function wire(){const b=document.getElementById('cgAt');if(b)b.onclick=()=>{D=null;carregar();ficha();};
    document.querySelectorAll('[data-cgab]').forEach(x=>x.onclick=()=>{tab=x.dataset.cgab;ficha();window.scrollTo({top:0,behavior:'smooth'});});
    /* gestor: na Central, a barra de abas fica recolhida até tocar em "Ver todas as ferramentas" */
    const tg=document.querySelector('.tabg'),tb=document.getElementById('cgTools');
    if(tg&&tb){const esc=!ADM()&&tab==='cen';tg.style.display=esc?'none':'';tb.style.display=esc?'':'none';
      tb.onclick=()=>{tg.style.display='';tb.style.display='none';tg.scrollIntoView({behavior:'smooth',block:'start'});};}
    const wc=document.getElementById('cgWaCop');if(wc)wc.onclick=async()=>{try{await navigator.clipboard.writeText(resumoTxt(E[at]));wc.textContent='✓ Copiado';setTimeout(()=>wc.textContent='Copiar resumo',2000);}catch(_){prompt('Copie o resumo:',resumoTxt(E[at]));}};}

  /* liga a aba "🏠 Central do Gestor" quando quem entrou é o gestor */
  function ativar(data){if(!PESSOA||PESSOA.papel!=='gestor')return;
    if(!ABAS.some(a=>a[0]==='cen'))ABAS.unshift(['cen','🏠 Central do Gestor']);
    if(!GRUPOS_ABA.some(g=>g[1].includes('cen')))GRUPOS_ABA.unshift(['Central',['cen']]);
    DESC_ABA.cen='Resumo de cada setor da empresa: quem entrou, o que fez e o que está pendente. Toque no botão do card para ir à aba.';
    const L=Array.isArray(data.abasLib)?data.abasLib:abasLib(data);data.abasLib=['cen'].concat(L.filter(k=>k!=='cen'));tab='cen';
    setInterval(()=>{if(tab==='cen'&&!document.hidden)carregar();},30000);}
  /* Matriz (FC logada): a aba aparece na visão FC e em "Como o cliente vê", com os dados da empresa aberta */
  function admin(){if(!ABAS.some(a=>a[0]==='cen'))ABAS.unshift(['cen','🏠 Central do Gestor']);
    if(!GRUPOS_ABA.some(g=>g[1].includes('cen')))GRUPOS_ABA.unshift(['Central',['cen']]);
    DESC_ABA.cen='Resumo de cada setor da empresa, como o gestor vê: quem entrou, o que fez e o que está pendente.';
    setInterval(()=>{if(tab==='cen'&&at&&!document.hidden)carregar();},30000);}
  window.FCCentral={html,wire,ativar,admin};
  if(typeof PUB!=='undefined'&&!PUB)admin();
})();
