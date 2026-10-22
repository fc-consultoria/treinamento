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
    if(x.acao==='estoque_importado')return `atualizou o estoque (${d.itens} itens)`;
    return x.acao||'';}
  const linhaEv=x=>`<li><span class="cg-t">${quando(x.em)}</span> <b>${h(x.nome||'?')}</b> ${h(frase(x))}</li>`;

  async function carregar(){if(carregando||!PESSOA)return;carregando=true;erro='';
    const r=await sb.rpc('emp_central',{p_token:PESSOA.token});carregando=false;
    if(r.error||!r.data){erro='Não consegui carregar o resumo agora. Toque em Atualizar.';}else D=r.data;
    if(tab==='cen')ficha();}

  /* cada card: [id, ícone, título, papéis da equipe, abas de origem, filtro de eventos, função que monta o resumo] */
  const CARDS=[
    ['tre','🎓','Acompanhamento Treinamento',['fabrica'],['esq','ori','dia'],x=>x.area==='aba'&&['esq','ori','dia'].includes(x.acao),e=>{
      const F=e.treinFunc||[],hoje=new Date().toISOString().slice(0,10);
      const nx=(e.agenda||[]).filter(a=>a.cli!==false&&a.data>=hoje&&!a.feito&&/trein/i.test((a.tipo||'')+' '+(a.titulo||''))).sort((a,b)=>(a.data+(a.hora||'')).localeCompare(b.data+(b.hora||'')))[0];
      return [[e.treinSala?'Liberado':'Não liberado','Treinamento 3D ao vivo',e.treinSala?'ok':'mut'],[F.length,'funcionário'+(F.length===1?'':'s')+' inscrito'+(F.length===1?'':'s')],
        [nx?dBR(nx.data)+(nx.hora?' '+nx.hora:''):'—','próximo treinamento']];}],
    ['orc','🏪','Orçamento e Pedidos',['vendas'],['orc'],x=>x.area==='vendas'||x.papel==='vendas',e=>{const o=(D&&D.orc)||{};
      return [[o.mes_n||0,'orçamentos no mês'],[brl(o.mes_total),'valor no mês'],[o.abertos||0,'em aberto'],
        [o.desc_pend||0,'desconto'+(o.desc_pend===1?'':'s')+' para aprovar',o.desc_pend?'warn':'ok'],[(D&&D.vend_ativos)||0,'vendedores ativos']];}],
    ['cmp','🛒','Setor de Compras',['compras'],['est','comp','dist','conv','pla'],x=>x.papel==='compras'||x.area==='compras',e=>{const s=(D&&D.estoque)||{};
      const dias=s.em?Math.floor((Date.now()-new Date(s.em))/864e5):null;
      return [[s.em?dBR(s.em):'—','estoque atualizado',dias==null?'mut':dias>7?'warn':'ok'],[s.itens||0,'itens no estoque'],[(e.abasLib||[]).filter(k=>['est','comp','dist','conv','pla'].includes(k)).length,'ferramentas liberadas']];}],
    ['sit','🌐','Site',[],['cat'],x=>x.area==='aba'&&x.acao==='cat',e=>{const c=e.cat||{};
      return [[c.ativo===false?'Pausado':(c.slug||c.dominio)?'No ar':'Em montagem','catálogo virtual',c.ativo===false?'warn':(c.slug||c.dominio)?'ok':'mut'],[(c.linhas||[]).length||'—','linhas no catálogo']];}],
    ['fab','🏭','Setor Fábrica',['fabrica'],['esq'],x=>x.papel==='fabrica',e=>[]],
    ['fc','🤝','FC',[],['proc','acao','dem','sol','age'],x=>x.area==='aba'&&['proc','acao','dem','sol','age'].includes(x.acao),e=>{
      const fl=(e.frentes||[]).flatMap(f=>f.p),ok=fl.filter(p=>p[0]==='ok').length,A=e.acao,aT=A?A.temas.length*A.cols.length:0,aOk=A?Object.values(A.st||{}).filter(x=>x.s==='ok').length:0;
      const S=PUBSOL||[],ab=S.filter(x=>x.status==='nova'||x.status==='aceita').length,dem=(e.dem||[]).filter(d=>d[3]!=='p-ok').length;
      const hoje=new Date().toISOString().slice(0,10),nx=(e.agenda||[]).filter(a=>a.cli&&a.data>=hoje&&!a.feito).sort((a,b)=>(a.data+(a.hora||'')).localeCompare(b.data+(b.hora||'')))[0];
      return [[fl.length?Math.round(ok/fl.length*100)+'%':'—','andamento da consultoria'],...(aT?[[aOk+' de '+aT,'pontos do plano resolvidos']]:[]),
        [ab,'solicitaç'+(ab===1?'ão':'ões')+' em aberto',ab?'warn':'ok'],[dem,'entrega'+(dem===1?'':'s')+' pendente'+(dem===1?'':'s')],[nx?dBR(nx.data)+(nx.hora?' '+nx.hora:''):'—','próximo compromisso']];}],
    ['ger','📈','Gerente Comercial',['gerente'],['orc'],x=>x.papel==='gerente',e=>{const m=new Date().toISOString().slice(0,7),L=((D&&D.eventos)||[]).filter(x=>x.papel==='gerente'&&String(x.em).slice(0,7)===m);
      const ap=L.filter(x=>x.acao==='desconto_aprovado').length,re=L.filter(x=>x.acao==='desconto_recusado').length;
      return [[ap,'descontos aprovados no mês'],[re,'descontos recusados no mês'],[((D&&D.orc)||{}).desc_pend||0,'aguardando decisão',((D&&D.orc)||{}).desc_pend?'warn':'ok']];}],
    ['mkt','📣','Marketing',['marketing'],['mkt','div','cat'],x=>x.papel==='marketing',e=>{const mk=(e.mkt||[]).filter(x=>x.cli).length,dv=(e.divs||[]).filter(x=>x.ativo!==false).length;
      return [[mk,'dicas de marketing'],[dv,'artes de divulgação'],['Em breve','editor do catálogo','mut']];}]
  ];

  function card([id,ic,tit,papeis,abas,filtro,kpis],e){
    const P=((D&&D.pessoas)||[]).filter(p=>papeis.includes(p.papel)),EV=((D&&D.eventos)||[]).filter(filtro).slice(0,4);
    const lib=abas.filter(k=>abasLib(e).includes(k)),K=kpis(e);
    return `<section class="cg-card" aria-labelledby="cg-${id}"><header><span class="cg-ic" aria-hidden="true">${ic}</span><h3 id="cg-${id}">${h(tit)}</h3></header>
      ${K.length?`<div class="cg-kp">${K.map(([v,l,t])=>`<div class="${t?'cg-'+t:''}"><b>${h(v)}</b><small>${h(l)}</small></div>`).join('')}</div>`:''}
      ${papeis.length?`<div class="cg-pe">${P.length?P.map(p=>`<span class="cg-p"><i class="${p.online?'on':''}" aria-hidden="true"></i>${h(p.nome)} <small>· ${p.online?'online agora':quando(p.ultimo)}</small></span>`).join(''):`<span class="nota">Ninguém de ${h(papeis.map(x=>PAPEL[x]).join(' / '))} cadastrado ainda. Peça o acesso à FC.</span>`}</div>`:''}
      <ul class="cg-ev">${EV.length?EV.map(linhaEv).join(''):'<li class="nota">Nenhuma movimentação registrada ainda.</li>'}</ul>
      <footer>${lib.map(k=>`<button class="btn" type="button" data-cgab="${k}">${h(nomeAba(k))} →</button>`).join('')||'<span class="nota">Sem aba liberada para este setor.</span>'}</footer></section>`;}

  function html(e){if(!D&&!erro)carregar();
    const P=(D&&D.pessoas)||[],on=P.filter(p=>p.online).length,EV=(D&&D.eventos)||[];
    return `<style>
.cg-top{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.cg-top h2{flex:1;min-width:200px}
.cg-eq{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.cg-p{display:inline-flex;align-items:center;gap:6px;background:var(--surface-2);border:1px solid var(--line);border-radius:99px;padding:4px 11px;font-size:13.5px;font-weight:600}
.cg-p small{font-weight:500;color:var(--muted)}.cg-p i{width:8px;height:8px;border-radius:50%;background:var(--line);flex:none}.cg-p i.on{background:var(--ok);box-shadow:0 0 0 3px var(--ok-soft)}
.cg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.cg-card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px}
.cg-card header{display:flex;align-items:center;gap:8px}.cg-ic{font-size:20px}
.cg-kp{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px}
.cg-kp div{background:var(--surface-2);border-radius:10px;padding:7px 9px;display:flex;flex-direction:column}
.cg-kp b{font:600 17px var(--f-m);font-variant-numeric:tabular-nums}.cg-kp small{font-size:12px;color:var(--muted);line-height:1.25}
.cg-kp .cg-ok b{color:var(--ok)}.cg-kp .cg-warn{background:var(--warn-soft)}.cg-kp .cg-warn b{color:var(--warn)}.cg-kp .cg-mut b{color:var(--muted)}
.cg-pe{display:flex;gap:6px;flex-wrap:wrap}
.cg-ev{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px;font-size:13.5px;flex:1}
.cg-t{color:var(--muted);font-size:12px;white-space:nowrap}
.cg-card footer{display:flex;gap:6px;flex-wrap:wrap;border-top:1px dashed var(--line);padding-top:10px}
.cg-card footer .btn{font-size:13px;padding:6px 10px}
.cg-feed{margin-top:14px}.cg-feed ul{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:4px;max-height:320px;overflow:auto;font-size:14px}
</style>
<div class="cg-top"><div><div class="eyebrow">Central do Gestor</div><h2>Tudo o que a equipe está fazendo</h2></div>
  <span class="nota">${D?(on?`🟢 ${on} online agora · `:'')+`atualizado ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`:carregando?'Carregando…':''}</span>
  <button class="btn" type="button" id="cgAt">↻ Atualizar</button></div>
${erro?`<div class="box" style="background:var(--warn-soft)">${h(erro)}</div>`:''}
<div class="cg-eq">${P.map(p=>`<span class="cg-p"><i class="${p.online?'on':''}" aria-hidden="true"></i>${h(p.nome)} <small>· ${h(PAPEL[p.papel]||p.papel)} · ${p.online?'online agora':quando(p.ultimo)}</small></span>`).join('')}</div>
<div class="cg-grid">${CARDS.map(c=>card(c,e)).join('')}</div>
<details class="box cg-feed"><summary><b>🕘 Atividade recente da equipe</b> <span class="muted" style="font-size:13px">· ${EV.length} registro${EV.length===1?'':'s'}</span></summary>
  <ul>${EV.length?EV.slice(0,60).map(linhaEv).join(''):'<li class="nota">Nada registrado ainda.</li>'}</ul></details>`;}

  function wire(){const b=document.getElementById('cgAt');if(b)b.onclick=()=>{D=null;carregar();ficha();};
    document.querySelectorAll('[data-cgab]').forEach(x=>x.onclick=()=>{tab=x.dataset.cgab;ficha();window.scrollTo({top:0,behavior:'smooth'});});}

  /* liga a aba "🏠 Central do Gestor" quando quem entrou é o gestor */
  function ativar(data){if(!PESSOA||PESSOA.papel!=='gestor')return;
    if(!ABAS.some(a=>a[0]==='cen'))ABAS.unshift(['cen','🏠 Central do Gestor']);
    if(!GRUPOS_ABA.some(g=>g[1].includes('cen')))GRUPOS_ABA.unshift(['Central',['cen']]);
    DESC_ABA.cen='Resumo de cada setor da empresa: quem entrou, o que fez e o que está pendente. Toque no botão do card para ir à aba.';
    const L=Array.isArray(data.abasLib)?data.abasLib:abasLib(data);data.abasLib=['cen'].concat(L.filter(k=>k!=='cen'));tab='cen';
    setInterval(()=>{if(tab==='cen'&&!document.hidden)carregar();},120000);}
  window.FCCentral={html,wire,ativar};
})();
