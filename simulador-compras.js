/* Simulador de Compras · Estoque × Vendas (aba "sim" do link do cliente).
   Duas empresas no mesmo grupo: Distribuidora (revenda + abastece a fábrica) e Fábrica (atende obra).
   Fábrica: pedido à distribuidora = consumo mensal × cobertura − estoque da fábrica.
   Distribuidora: compra ao fornecedor = (revenda + consumo da fábrica) × cobertura + pedido da fábrica − estoque.
   Dados: sb.rpc('simc_ler' | 'simc_salvar' | 'simc_excluir'). Mesma lógica da planilha Simulador_Compras_CB. */
(function(){
const h=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=(v,d)=>(v==null||v===''||isNaN(v))?'':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:d||0,maximumFractionDigits:d||0});
const num=v=>{if(v==null||v==='')return null;const x=Number(String(v).replace(/\./g,'').replace(',','.'));return isNaN(x)?null:x;};
const numIn=v=>{if(v==null)return null;const s=String(v).trim();if(!s)return null;const x=Number(s.includes(',')?s.replace(/\./g,'').replace(',','.'):s);return isNaN(x)?null:x;};
const vIn=v=>v==null?'':String(v).replace('.',',');
const tok=()=>{try{return (typeof PESSOA!=='undefined'&&PESSOA)?PESSOA.token:null;}catch(_){return null;}};
const emp=()=>{try{return at;}catch(_){return null;}};
const quem=()=>{try{return (typeof PESSOA!=='undefined'&&PESSOA)?PESSOA.nome:'FC';}catch(_){return 'FC';}};
const reg=a=>{try{if(tok())sb.rpc('emp_registrar',{p_token:tok(),p_area:'simulador',p_acao:a}).then(()=>{},()=>{});}catch(_){}};

let C=null,IT=[],Demp=null,carregando=false,erro='',msg='';
const S={v:'d',q:'',st:'',al:false,guard:false,verOrig:false};
let LS=null,lsErro=false,tLs=null;
const FILA=new Map();let tSalva=null,salvando=false;

/* ---------- cálculo ---------- */
const up=x=>Math.ceil(x-1e-9),dn=x=>Math.floor(x+1e-9);
function calc(i){const c=C||{},mes=(+c.periodo||90)/30,exc=+c.exc||2,barra=+c.barra||6;
  const estF=Math.max(0,+i.est_f||0),consM=(+i.cons_f||0)/mes,cobF=i.cob_f!=null?+i.cob_f:+c.cob_f||2,idF=consM*cobF;
  const ped=Math.max(0,up(idF-estF+(+i.aj_f||0))),cobAF=consM?estF/consM:null;
  const stF=consM===0?(ped>0?'PEDIR':estF>0?'SEM CONSUMO':'—'):ped>0?'PEDIR':cobAF>cobF*exc?'EXCESSO':'OK';
  const rev=Math.max(0,(+i.sai_d||0)-(+i.transf||0)),revM=rev/mes,dem=revM+consM,cobD=i.cob_d!=null?+i.cob_d:+c.cob_d||2,idD=dem*cobD;
  const estD=Math.max(0,+i.est_d||0),comp=Math.max(0,up(idD+ped-estD+(+i.aj_d||0))),cobAD=dem?Math.max(0,estD-ped)/dem:null;
  const stD=dem===0?(comp>0?'COMPRAR':estD>0?'SEM MOVIMENTO':'—'):comp>0?'COMPRAR':cobAD>cobD*exc?'EXCESSO':'OK';
  const estT=estD+estF,cobT=dem?estT/dem:null;
  const stG=comp>0?'COMPRAR':ped>0?'SÓ TRANSFERIR':dem===0?(estT>0?'SEM MOVIMENTO':'—'):cobT>(+c.cob_d||2)*exc?'EXCESSO NO GRUPO':'OK';
  const kgm=i.kgm!=null?+i.kgm:null,al=[];
  if((+i.est_f||0)<0)al.push('Estoque negativo na fábrica ('+n(i.est_f)+')');
  if((+i.est_d||0)<0)al.push('Estoque negativo na distribuidora ('+n(i.est_d)+')');
  if(!kgm)al.push('Sem peso');else if(kgm>(+c.kgm_max||3))al.push('Verificar peso');
  return {consM,cobF,idF,ped,cobAF,stF,excF:Math.max(0,dn(estF-idF)),rev,revM,dem,cobD,idD,comp,cobAD,stD,excD:Math.max(0,dn(estD-idD)),
    estT,cobT,stG,kgPed:ped*(kgm||0)*barra,kgComp:comp*(kgm||0)*barra,al};}

/* ---------- dados ---------- */
async function carregar(){carregando=true;erro='';pinta();
  try{const r=await sb.rpc('simc_ler',{p_token:tok(),p_emp:tok()?null:emp()});if(r.error)throw r.error;
    C=r.data.cfg||{};IT=r.data.itens||[];Demp=emp();reg('abriu o simulador de compras');
    try{const l=await sb.rpc('simc_listas_ler',{p_token:tok(),p_emp:tok()?null:emp()});if(l.error)throw l.error;LS=l.data||[];lsErro=false;}catch(_){LS=[];lsErro=true;}}
  catch(e){erro=/permiss/i.test(e&&e.message||'')?'Seu acesso não inclui o Simulador de Compras. Fale com a FC.':'Não foi possível carregar o simulador agora. Tente de novo.';C=null;IT=[];}
  carregando=false;pinta();}
function agenda(cod,campos){const a=FILA.get(cod)||{cod};Object.assign(a,campos);FILA.set(cod,a);clearTimeout(tSalva);tSalva=setTimeout(salvaFila,700);status('Salvando…');}
async function salvaFila(){if(salvando||!FILA.size)return;salvando=true;const L=[...FILA.values()];FILA.clear();
  try{const r=await sb.rpc('simc_salvar',{p_token:tok(),p_emp:tok()?null:emp(),p_cfg:null,p_itens:L});if(r.error)throw r.error;status('✓ Salvo às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}));}
  catch(e){L.forEach(x=>{const a=FILA.get(x.cod)||{};FILA.set(x.cod,Object.assign({},x,a));});status('⚠ Não salvou. Vou tentar de novo.',true);setTimeout(salvaFila,4000);}
  salvando=false;if(FILA.size)salvaFila();}
async function salvaCfg(campos){Object.assign(C,campos);status('Salvando…');
  const r=await sb.rpc('simc_salvar',{p_token:tok(),p_emp:tok()?null:emp(),p_cfg:campos,p_itens:null});status(r.error?'⚠ Não salvou o parâmetro':'✓ Parâmetro salvo',!!r.error);pinta();}
function status(t,ruim){const s=document.getElementById('scSt');if(s){s.textContent=t;s.style.color=ruim?'var(--bad)':'var(--muted)';}}

/* ---------- tela ---------- */
const COR={COMPRAR:'p-bad',PEDIR:'p-bad','SÓ TRANSFERIR':'p-warn',OK:'p-ok',EXCESSO:'p-acc','EXCESSO NO GRUPO':'p-acc','SEM MOVIMENTO':'p-mut','SEM CONSUMO':'p-mut','—':'p-mut'};
const pill=s=>`<span class="pill ${COR[s]||'p-mut'}" style="white-space:nowrap">${h(s)}</span>`;
const VIS=[['d','🏬 Distribuidora'],['f','🏭 Fábrica'],['g','🔗 Grupo'],['lc','🛒 Lista de compra'],['lt','🚚 Lista de transferência']];
function lista(){const q=S.q.trim().toLowerCase();
  return IT.map(i=>({i,r:calc(i)})).filter(({i,r})=>{
    if(q&&!((i.cod||'')+' '+(i.material||'')).toLowerCase().includes(q))return false;
    if(S.al&&!r.al.length)return false;
    if(S.v==='lc')return r.comp>0;if(S.v==='lt')return r.ped>0;
    if(S.st){const st=S.v==='d'?r.stD:S.v==='f'?r.stF:r.stG;if(st!==S.st)return false;}
    return true;});}
function kpis(){const R=IT.map(calc),s=(f)=>R.reduce((a,r)=>a+f(r),0);
  const box=(t,v,sub,cor)=>`<div class="box" style="margin:0"><div class="nota">${t}</div><b style="font-size:20px;${cor?'color:'+cor:''}">${v}</b>${sub?`<div class="nota">${sub}</div>`:''}</div>`;
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px">
   ${box('🏬 Comprar do fornecedor',n(R.filter(r=>r.comp>0).length)+' itens',n(s(r=>r.comp))+' barras · '+n(s(r=>r.kgComp),1)+' kg','var(--bad)')}
   ${box('🚚 Transferir p/ fábrica',n(R.filter(r=>r.ped>0).length)+' itens',n(s(r=>r.ped))+' barras · '+n(s(r=>r.kgPed),1)+' kg','var(--warn)')}
   ${box('🏬 Estoque distribuidora',n(IT.reduce((a,i)=>a+Math.max(0,+i.est_d||0),0))+' br',n(R.filter(r=>r.stD==='EXCESSO').length)+' em excesso')}
   ${box('🏭 Estoque fábrica',n(IT.reduce((a,i)=>a+Math.max(0,+i.est_f||0),0))+' br',n(R.filter(r=>r.stF==='EXCESSO').length)+' em excesso')}
   ${box('⚠ Alertas',n(R.filter(r=>r.al.length).length),n(R.filter(r=>r.al.includes('Sem peso')).length)+' sem peso')}
   ${box('📦 Itens cadastrados',n(IT.length),n(IT.filter(i=>(+i.sai_d||0)+(+i.cons_f||0)>0).length)+' com movimento')}</div>`;}
function params(){const c=C||{},d=k=>Math.round((+c[k]||0)*30);
  const f=(k,l,v,t)=>`<label class="nota" style="color:var(--fg);font-weight:600;min-width:130px;flex:1">${l}<input class="inpx" data-cf="${k}" inputmode="decimal" value="${h(v)}" title="${h(t)}" style="margin-top:4px;padding:7px 9px;font-size:14px"></label>`;
  return `<details class="box" style="margin:0 0 12px" ${IT.length?'':'open'}><summary style="cursor:pointer;font-weight:700">⚙ Parâmetros · período ${h(c.periodo||90)} dias · cobertura ${d('cob_d')} dias (distribuidora) e ${d('cob_f')} dias (fábrica)</summary>
   <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
    ${f('periodo','Período das saídas (dias)',c.periodo||90,'Quantos dias o relatório de saídas/consumo cobre.')}
    ${f('cob_d','Cobertura distribuidora (dias)',d('cob_d'),'Quantos dias de venda o estoque da distribuidora deve cobrir.')}
    ${f('cob_f','Cobertura fábrica (dias)',d('cob_f'),'Quantos dias de consumo o estoque da fábrica deve cobrir.')}
    ${f('exc','Excesso acima de (× cobertura)',vIn(c.exc||2),'Marca EXCESSO quando o estoque cobre mais que esse múltiplo da cobertura.')}
    ${f('kgm_max','Peso máx. esperado (kg/m)',vIn(c.kgm_max||3),'Pesos acima disso recebem o alerta Verificar peso.')}
    ${f('barra','Comprimento da barra (m)',vIn(c.barra||6),'Converte kg/m em kg por barra.')}</div>
   <p class="nota" style="margin:8px 0 0">Base de estoque: ${c.base_em?h(String(c.base_em).split('-').reverse().join('/')):'—'}${c.por?' · última alteração: '+h(c.por):''}. Os pesos são de referência (base FC): confirme com o fornecedor.</p></details>`;}
function barra(){const sts=S.v==='d'?['COMPRAR','OK','EXCESSO','SEM MOVIMENTO']:S.v==='f'?['PEDIR','OK','EXCESSO','SEM CONSUMO']:S.v==='g'?['COMPRAR','SÓ TRANSFERIR','OK','EXCESSO NO GRUPO','SEM MOVIMENTO']:[];
  return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${VIS.map(([k,l])=>`<button class="btn" type="button" data-scv="${k}" ${S.v===k?'style="background:var(--accent);color:#fff;border-color:var(--accent)"':''}>${l}</button>`).join('')}</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
   <input class="inpx" id="scQ" type="search" placeholder="Código ou descrição" value="${h(S.q)}" style="flex:1;min-width:170px;margin:0">
   ${sts.length?`<select class="inpx" id="scS" style="width:auto;margin:0"><option value="">Todos os status</option>${sts.map(s=>`<option ${s===S.st?'selected':''}>${h(s)}</option>`).join('')}</select>`:''}
   <label class="nota" style="display:flex;gap:6px;align-items:center;color:var(--fg)"><input type="checkbox" id="scA" ${S.al?'checked':''}> só com alerta</label>
   <button class="btn" type="button" id="scNovo">＋ Item novo</button>
   <button class="btn" type="button" id="scImp">📥 Importar relatório</button>
   <button class="btn" type="button" id="scX">⬇ Excel</button>
   <span class="nota" id="scSt"></span></div>`;}
const inp=(i,k,w)=>`<input data-ci="${h(i.cod)}" data-k="${k}" inputmode="decimal" value="${h(vIn(i[k]))}" style="width:${w||62}px;padding:4px 6px;border:1px solid var(--line);border-radius:7px;background:#fff8e1;color:#222;font:13px var(--f-m,inherit);text-align:right">`;
const td=(v,b,extra)=>`<td style="text-align:right;${b?'font-weight:800;':''}${extra||''}">${v}</td>`;
function tabela(L){if(S.v==='lc'||S.v==='lt')return listaHtml(L);
  if(!L.length)return `<p class="nota">${S.v==='lc'?'Nada para comprar com os dados atuais.':S.v==='lt'?'Nada para transferir com os dados atuais.':'Nenhum item com esses filtros.'}</p>`;
  const cod=i=>`<td class="mono" style="white-space:nowrap">${h(i.cod)}${i.novo?' <span class="pill p-ok" title="Item incluído na plataforma">novo</span>':''}</td><td style="min-width:220px">${h(i.material)}</td>`;
  const al=r=>`<td>${r.al.map(a=>`<span class="pill ${/negativo|Verificar/.test(a)?'p-bad':'p-warn'}" style="white-space:nowrap;margin:1px">${h(a)}</span>`).join('')}</td>`;
  const kgm=i=>`<td title="${h(i.kgm_fonte||'Sem peso na base FC: preencha')}">${inp(i,'kgm',58)}</td>`;
  const del=i=>i.novo?`<td><button class="mini" type="button" data-scdel="${h(i.cod)}" title="Excluir item novo">🗑</button></td>`:'<td></td>';
  let th,rows;
  if(S.v==='d'){th=['Código','Material','kg/m','Estoque','Saídas período','Transf. p/ fábrica','Revenda/mês','Consumo fáb./mês','Cobertura (dias)','Estoque ideal','Pedido da fábrica','Ajuste','COMPRA (barras)','Compra (kg)','Cobertura atual (meses)','Status','Alerta',''];
    rows=L.map(({i,r})=>`<tr data-row="${h(i.cod)}">${cod(i)}${kgm(i)}<td>${inp(i,'est_d')}</td><td>${inp(i,'sai_d')}</td><td>${inp(i,'transf')}</td>${td(n(r.revM,1))}${td(n(r.consM,1))}<td><input data-ci="${h(i.cod)}" data-k="cob_d" data-dias="1" inputmode="numeric" placeholder="${Math.round(r.cobD*30)}" value="${i.cob_d!=null?Math.round(i.cob_d*30):''}" style="width:52px;padding:4px 6px;border:1px solid var(--line);border-radius:7px;background:#fff8e1;color:#222;text-align:right"></td>${td(n(r.idD,1))}${td(r.ped?n(r.ped):'-')}<td>${inp(i,'aj_d',50)}</td>${td(r.comp?n(r.comp):'-',1,r.comp?'color:var(--bad)':'')}${td(r.kgComp?n(r.kgComp,1):'-')}${td(r.cobAD!=null?n(r.cobAD,1):'')}<td>${pill(r.stD)}</td>${al(r)}${del(i)}</tr>`);}
  else if(S.v==='f'){th=['Código','Material','kg/m','Estoque fábrica','Consumo obra (período)','Consumo/mês','Cobertura (dias)','Estoque ideal','Ajuste','PEDIDO À DISTRIBUIDORA','Pedido (kg)','Excesso (barras)','Cobertura atual (meses)','Status','Alerta',''];
    rows=L.map(({i,r})=>`<tr data-row="${h(i.cod)}">${cod(i)}${kgm(i)}<td>${inp(i,'est_f')}</td><td>${inp(i,'cons_f')}</td>${td(n(r.consM,1))}<td><input data-ci="${h(i.cod)}" data-k="cob_f" data-dias="1" inputmode="numeric" placeholder="${Math.round(r.cobF*30)}" value="${i.cob_f!=null?Math.round(i.cob_f*30):''}" style="width:52px;padding:4px 6px;border:1px solid var(--line);border-radius:7px;background:#fff8e1;color:#222;text-align:right"></td>${td(n(r.idF,1))}<td>${inp(i,'aj_f',50)}</td>${td(r.ped?n(r.ped):'-',1,r.ped?'color:var(--warn)':'')}${td(r.kgPed?n(r.kgPed,1):'-')}${td(r.excF?n(r.excF):'-')}${td(r.cobAF!=null?n(r.cobAF,1):'')}<td>${pill(r.stF)}</td>${al(r)}${del(i)}</tr>`);}
  else if(S.v==='g'){th=['Código','Material','Estoque distrib.','Estoque fábrica','Estoque total','Demanda/mês','Cobertura total (meses)','Pedido fábrica','Compra fornecedor','Situação'];
    rows=L.map(({i,r})=>`<tr>${cod(i)}${td(n(Math.max(0,+i.est_d||0)))}${td(n(Math.max(0,+i.est_f||0)))}${td(n(r.estT))}${td(n(r.dem,1))}${td(r.cobT!=null?n(r.cobT,1):'')}${td(r.ped?n(r.ped):'-')}${td(r.comp?n(r.comp):'-',1)}<td>${pill(r.stG)}</td></tr>`);}
  else if(S.v==='lc'){th=['Código','Material','Barras','kg','Estoque distrib.','Pedido da fábrica','Revenda/mês'];
    rows=L.map(({i,r})=>`<tr>${cod(i)}${td(n(r.comp),1)}${td(r.kgComp?n(r.kgComp,1):'sem peso')}${td(n(i.est_d))}${td(r.ped?n(r.ped):'-')}${td(n(r.revM,1))}</tr>`);}
  else{th=['Código','Material','Barras','kg','Estoque fábrica','Consumo/mês','Estoque distrib.'];
    rows=L.map(({i,r})=>`<tr>${cod(i)}${td(n(r.ped),1)}${td(r.kgPed?n(r.kgPed,1):'sem peso')}${td(n(i.est_f))}${td(n(r.consM,1))}${td(n(i.est_d))}</tr>`);}
  return `<div style="overflow:auto;max-height:70vh;border:1px solid var(--line);border-radius:10px"><table style="width:100%;border-collapse:collapse;font-size:13px">
   <thead><tr>${th.map(t=>`<th style="position:sticky;top:0;background:var(--surface-2);text-align:left;padding:7px 6px;font-size:12px;border-bottom:1px solid var(--line);z-index:1">${h(t)}</th>`).join('')}</tr></thead>
   <tbody>${rows.map(r=>r.replace('<tr','<tr style="border-top:1px solid var(--line)"')).join('')}</tbody></table></div>
   <p class="nota" style="margin-top:6px">${L.length} itens. Amarelo = você preenche (salva sozinho). Cobertura em branco usa o padrão dos parâmetros.</p>`;}
function corpo(){if(carregando&&!C)return '<p class="nota">Carregando o simulador…</p>';
  if(erro)return `<p class="nota" style="color:var(--bad)">${h(erro)}</p>`;if(!C)return '';
  return params()+kpis()+barra()+`<div id="scTab">${tabela(lista())}</div>
   <details class="box" style="margin-top:12px"><summary style="cursor:pointer;font-weight:700">ℹ Como o cálculo funciona</summary><div class="nota" style="line-height:1.6;margin-top:8px">
   <b>Fábrica (atende obra):</b> consumo mensal = consumo do período ÷ (dias ÷ 30). Estoque ideal = consumo mensal × cobertura. <b>Pedido à distribuidora</b> = ideal − estoque da fábrica + ajuste (barra inteira, nunca negativo).<br>
   <b>Distribuidora (revenda + abastece a fábrica):</b> revenda = saídas − transferências para a fábrica. Demanda mensal = revenda mensal + consumo mensal da fábrica. <b>Compra ao fornecedor</b> = demanda × cobertura + pedido da fábrica − estoque + ajuste.<br>
   <b>Grupo:</b> as duas juntas. "Só transferir" = a fábrica precisa, mas a distribuidora tem: não precisa comprar.<br>
   Se as saídas da distribuidora já incluem as transferências para a fábrica, informe-as na coluna Transf. p/ fábrica para não contar o consumo duas vezes.</div></details>`;}
function html(){return `<div id="scBox">${corpo()}</div>`;}
function pinta(){const b=document.getElementById('scBox');if(!b)return;b.innerHTML=corpo();wire(true);}
function pintaTab(){const t=document.getElementById('scTab');if(t){t.innerHTML=tabela(lista());wireTab();}}


/* ---------- Lista de compra / transferência editáveis (08/11/2026) ----------
   "Gerar lista editável" grava a lista do cálculo como ORIGINAL (não muda mais) e cria a cópia de trabalho (atual).
   Tudo na cópia é editável. "Excluir lista em uso" descarta as edições e volta à original. Listas antigas ficam guardadas. */
const COLS={lc:[['cod','Código','t',110],['material','Material','t',300],['barras','Barras','n',70],['kg','kg','n',80],['est','Estoque distrib.','n',80],['ref','Pedido da fábrica','n',80],['obs','Observação','t',180]],
 lt:[['cod','Código','t',110],['material','Material','t',300],['barras','Barras','n',70],['kg','kg','n',80],['est','Estoque fábrica','n',80],['ref','Consumo/mês','n',80],['obs','Observação','t',180]]};
const ativa=()=>(LS||[]).find(l=>l.tipo===S.v&&l.ativa)||null;
const dtl=t=>t?new Date(t).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
const tot=L=>({b:L.reduce((a,x)=>a+(+x.barras||0),0),k:L.reduce((a,x)=>a+(+x.kg||0),0)});
function linhasCalc(){const barra=+(C&&C.barra)||6;return IT.map(i=>({i,r:calc(i)})).filter(({r})=>S.v==='lc'?r.comp>0:r.ped>0).map(({i,r})=>S.v==='lc'
  ?{cod:i.cod,material:i.material,barras:r.comp,kg:Math.round(r.kgComp*100)/100,est:+i.est_d||0,ref:r.ped,obs:'',kgm:i.kgm!=null?+i.kgm:null}
  :{cod:i.cod,material:i.material,barras:r.ped,kg:Math.round(r.kgPed*100)/100,est:+i.est_f||0,ref:Math.round(r.consM*10)/10,obs:'',kgm:i.kgm!=null?+i.kgm:null});}
async function lsAcao(acao,extra){const r=await sb.rpc('simc_lista_acao',Object.assign({p_token:tok(),p_emp:tok()?null:emp(),p_acao:acao,p_id:null,p_tipo:null,p_nome:null,p_linhas:null},extra||{}));
  if(r.error)throw r.error;return r.data;}
async function recarregaLS(){try{const l=await sb.rpc('simc_listas_ler',{p_token:tok(),p_emp:tok()?null:emp()});if(l.error)throw l.error;LS=l.data||[];lsErro=false;}catch(_){lsErro=true;}}
function listaHtml(Lcalc){const tp=S.v,nm=tp==='lc'?'compra':'transferência',a=ativa(),cols=COLS[tp],q=S.q.trim().toLowerCase();
  const guard=(LS||[]).filter(l=>l.tipo===tp);
  const tabRO=(L,cap)=>{const t=tot(L);return `<div style="overflow:auto;max-height:65vh;border:1px solid var(--line);border-radius:10px"><table style="width:100%;border-collapse:collapse;font-size:13px">
     <thead><tr>${cols.map(c=>`<th style="position:sticky;top:0;background:var(--surface-2);text-align:left;padding:7px 6px;font-size:12px">${h(c[1])}</th>`).join('')}</tr></thead>
     <tbody>${L.map(x=>`<tr style="border-top:1px solid var(--line)">${cols.map(c=>`<td style="padding:5px 6px;${c[2]==='n'?'text-align:right':''}">${c[2]==='n'?n(x[c[0]],c[0]==='kg'?1:(x[c[0]]%1?1:0)):h(x[c[0]])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
     <p class="nota" style="margin-top:6px">${cap||''}${L.length} itens · ${n(t.b)} barras · ${n(t.k,1)} kg</p>`;};
  let topo='',corpo='';
  if(lsErro)topo=`<p class="nota" style="color:var(--warn)">⚠ As listas editáveis ainda não estão ativas no servidor. Mostrando a lista calculada (só leitura).</p>`;
  if(!a){const L=linhasCalc().filter(x=>!q||(x.cod+' '+x.material).toLowerCase().includes(q));
    topo+=`<div class="box" style="margin:0 0 10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;border:2px dashed var(--accent)">
      <div style="flex:1;min-width:220px"><b>Lista de ${nm} calculada</b><div class="nota">Toque em <b>Gerar lista editável</b> para poder mudar qualquer coluna. A lista original fica guardada para recuperar quando precisar.</div></div>
      ${lsErro?'':`<button class="btn" type="button" data-ls="nova" style="background:var(--accent);color:#fff;border-color:var(--accent)" ${linhasCalc().length?'':'disabled'}>📝 Gerar lista editável</button>`}</div>`;
    corpo=L.length?tabRO(L,'Prévia do cálculo · '):`<p class="nota">Nada para ${tp==='lc'?'comprar':'transferir'} com os dados atuais.</p>`;}
  else if(S.verOrig){topo=`<div class="box" style="margin:0 0 10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="flex:1">📄 Lista ORIGINAL de ${dtl(a.criado_em)} (só leitura)</b><button class="btn" type="button" data-ls="fecharorig">← Voltar à lista em uso</button></div>`;
    corpo=tabRO((a.original||[]).filter(x=>!q||(x.cod+' '+x.material).toLowerCase().includes(q)),'Original · ');}
  else{const L=a.atual||[],t=tot(L),mud=JSON.stringify(a.atual)!==JSON.stringify(a.original);
    topo=`<div class="box" style="margin:0 0 10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <div style="flex:1;min-width:230px"><b>✏ Lista de ${nm} em uso</b> <span id="scLsPill" class="pill ${mud?'p-warn':'p-ok'}">${mud?'editada':'igual à original'}</span>
       <div class="nota">Gerada em ${dtl(a.criado_em)}${a.criado_por?' por '+h(a.criado_por):''}${a.por&&mud?' · última edição: '+h(a.por)+' '+dtl(a.atualizado):''} · <span id="scLsTot">${L.length} itens · <b>${n(t.b)} barras · ${n(t.k,1)} kg</b></span></div></div>
      <button class="btn" type="button" data-ls="add">＋ Linha</button>
      <button class="btn" type="button" data-ls="verorig">📄 Ver original</button>
      <button class="btn" type="button" data-ls="restaurar" ${mud?'':'disabled'} title="Apaga as edições e volta para a lista original">↩ Excluir lista em uso e voltar à original</button>
      <button class="btn" type="button" data-ls="nova" title="Guarda esta lista e gera outra com o cálculo de agora">🔄 Gerar nova do cálculo</button>
      <span class="nota" id="scLsSt"></span></div>`;
    const ix=L.map((x,k)=>[x,k]).filter(([x])=>!q||((x.cod||'')+' '+(x.material||'')).toLowerCase().includes(q));
    corpo=`<div style="overflow:auto;max-height:65vh;border:1px solid var(--line);border-radius:10px"><table style="width:100%;border-collapse:collapse;font-size:13px">
     <thead><tr>${cols.map(c=>`<th style="position:sticky;top:0;background:var(--surface-2);text-align:left;padding:7px 6px;font-size:12px;z-index:1">${h(c[1])}</th>`).join('')}<th style="position:sticky;top:0;background:var(--surface-2)"></th></tr></thead>
     <tbody>${ix.map(([x,k])=>`<tr style="border-top:1px solid var(--line)">${cols.map(c=>`<td style="padding:3px 4px"><input data-li="${k}" data-lk="${c[0]}" ${c[2]==='n'?'inputmode="decimal"':''} value="${h(c[2]==='n'?vIn(x[c[0]]):x[c[0]]??'')}" style="width:${c[3]}px;box-sizing:border-box;padding:4px 6px;border:1px solid var(--line);border-radius:7px;background:#fff8e1;color:#222;font:13px var(--f-b,inherit);${c[2]==='n'?'text-align:right':''}"></td>`).join('')}
       <td><button class="mini" type="button" data-lsdel="${k}" title="Tirar esta linha da lista">🗑</button></td></tr>`).join('')}</tbody></table></div>
     <p class="nota" style="margin-top:6px">Tudo em amarelo é editável e salva sozinho. Ao mudar as barras, o kg recalcula pelo peso do item (se você digitar o kg, vale o que você digitou). A original não muda.</p>`;}
  const gl=guard.length?`<details class="box" style="margin-top:12px" ${S.guard?'open':''} id="scGuard"><summary style="cursor:pointer;font-weight:700">🗂 Listas de ${nm} guardadas (${guard.length})</summary>
    <div style="overflow:auto;margin-top:8px"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr><th style="text-align:left">Gerada em</th><th style="text-align:left">Por</th><th style="text-align:right">Itens</th><th style="text-align:right">Barras (original)</th><th style="text-align:left">Situação</th><th></th></tr></thead>
    <tbody>${guard.map(l=>{const t=tot(l.original||[]);return `<tr style="border-top:1px solid var(--line)"><td>${dtl(l.criado_em)}</td><td>${h(l.criado_por||'')}</td><td style="text-align:right">${(l.original||[]).length}</td><td style="text-align:right">${n(t.b)}</td><td>${l.ativa?'<span class="pill p-ok">em uso</span>':'<span class="pill p-mut">guardada</span>'}</td>
      <td style="white-space:nowrap">${l.ativa?'':`<button class="mini" type="button" data-lsusar="${l.id}">Usar de novo</button> <button class="mini" type="button" data-lsexc="${l.id}" style="color:var(--bad)">Excluir</button>`}</td></tr>`;}).join('')}</tbody></table></div>
    <p class="nota" style="margin:6px 0 0">"Usar de novo" reabre a lista original daquela data como lista em uso (a atual fica guardada).</p></details>`:'';
  return topo+corpo+gl;}
function salvaLista(a){clearTimeout(tLs);const st=document.getElementById('scLsSt');if(st)st.textContent='Salvando…';
  {const t=tot(a.atual||[]),mud=JSON.stringify(a.atual)!==JSON.stringify(a.original),pl=document.getElementById('scLsPill'),tt=document.getElementById('scLsTot'),rs=document.querySelector('[data-ls="restaurar"]');
   if(pl){pl.className='pill '+(mud?'p-warn':'p-ok');pl.textContent=mud?'editada':'igual à original';}if(tt)tt.innerHTML=`${(a.atual||[]).length} itens · <b>${n(t.b)} barras · ${n(t.k,1)} kg</b>`;if(rs)rs.disabled=!mud;}
  tLs=setTimeout(async()=>{try{await lsAcao('editar',{p_id:a.id,p_linhas:a.atual});a.atualizado=new Date().toISOString();a.por=quem();const s2=document.getElementById('scLsSt');if(s2){s2.textContent='✓ Salvo';s2.style.color='var(--muted)';}}
    catch(e){const s2=document.getElementById('scLsSt');if(s2){s2.textContent='⚠ Não salvou. Tente de novo.';s2.style.color='var(--bad)';}}},700);}
function wireLista(b){const a=ativa();
  b.querySelectorAll('[data-ls]').forEach(x=>x.onclick=async()=>{const k=x.dataset.ls;
    try{if(k==='nova'){const L=linhasCalc();if(!L.length){alert('Nada para '+(S.v==='lc'?'comprar':'transferir')+' com os dados atuais.');return;}
        if(a&&!confirm('Gerar uma lista nova com o cálculo de agora?\n\nA lista em uso fica guardada em "Listas guardadas", com a original dela.'))return;
        x.disabled=true;await lsAcao('nova',{p_tipo:S.v,p_linhas:L});reg('gerou lista de '+(S.v==='lc'?'compra':'transferência'));await recarregaLS();S.verOrig=false;pintaTab();}
      else if(k==='restaurar'){if(!confirm('Excluir a lista em uso (com todas as edições) e voltar para a lista original?'))return;
        const r=await lsAcao('restaurar',{p_id:a.id});Object.assign(a,r);reg('restaurou lista original');pintaTab();}
      else if(k==='verorig'){S.verOrig=true;pintaTab();}else if(k==='fecharorig'){S.verOrig=false;pintaTab();}
      else if(k==='add'){a.atual=(a.atual||[]).concat([{cod:'',material:'',barras:null,kg:null,est:null,ref:null,obs:'',kgm:null}]);salvaLista(a);S.q='';const qq=document.getElementById('scQ');if(qq)qq.value='';pintaTab();
        const ins=document.querySelectorAll('#scTab [data-lk="cod"]');if(ins.length)ins[ins.length-1].focus();}}
    catch(e){alert('Não foi possível agora: '+(e&&e.message||'tente de novo'));pintaTab();}});
  b.querySelectorAll('[data-li]').forEach(x=>{x.onchange=()=>{if(!a)return;const row=a.atual[+x.dataset.li],k=x.dataset.lk;if(!row)return;
      const tipo=(COLS[S.v].find(c=>c[0]===k)||[])[2];let v=x.value;
      if(tipo==='n'){v=numIn(v);if(x.value.trim()&&v==null){x.style.borderColor='var(--bad)';return;}}x.style.borderColor='';
      row[k]=v;if(k==='kg')row.kgMan=v!=null;
      if(k==='barras'&&!row.kgMan&&row.kgm){row.kg=Math.round((+v||0)*row.kgm*(+(C&&C.barra)||6)*100)/100;const kg=x.closest('tr').querySelector('[data-lk="kg"]');if(kg)kg.value=vIn(row.kg);}
      if(k==='cod'&&!row.material){const it=IT.find(i=>i.cod===String(v).trim());if(it){row.material=it.material;row.kgm=it.kgm!=null?+it.kgm:null;const m=x.closest('tr').querySelector('[data-lk="material"]');if(m)m.value=it.material;}}
      salvaLista(a);};
    x.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();x.blur();}};});
  b.querySelectorAll('[data-lsdel]').forEach(x=>x.onclick=()=>{if(!a)return;const row=a.atual[+x.dataset.lsdel];if(!confirm('Tirar '+(row&&row.cod||'esta linha')+' da lista em uso? (a original não muda)'))return;
    a.atual=a.atual.filter((_,k)=>k!==+x.dataset.lsdel);salvaLista(a);pintaTab();});
  const g=b.querySelector('#scGuard');if(g)g.ontoggle=()=>{S.guard=g.open;};
  b.querySelectorAll('[data-lsusar]').forEach(x=>x.onclick=async()=>{if(!confirm('Reabrir a lista original desta data como lista em uso?\n\nA lista em uso agora fica guardada.'))return;
    try{await lsAcao('usar',{p_id:+x.dataset.lsusar});await recarregaLS();reg('reabriu lista guardada');S.verOrig=false;pintaTab();}catch(e){alert('Não foi possível agora.');}});
  b.querySelectorAll('[data-lsexc]').forEach(x=>x.onclick=async()=>{if(!confirm('Excluir de vez esta lista guardada (original e cópia)? Não dá para desfazer.'))return;
    try{await lsAcao('excluir',{p_id:+x.dataset.lsexc});await recarregaLS();reg('excluiu lista guardada');pintaTab();}catch(e){alert(e&&e.message||'Não foi possível agora.');}});}
async function exportarLista(a){try{await lib();}catch(_){alert('Não foi possível gerar o Excel agora.');return;}
  const tp=S.v,cols=COLS[tp],nm=tp==='lc'?'Lista de compra':'Lista de transferência',L=S.verOrig?a.original:a.atual,t=tot(L),nomeEmp=(typeof E!=='undefined'&&E[emp()]&&E[emp()].nome)||'';
  const rows=[[nm+(S.verOrig?' (original)':'')+' · '+nomeEmp],['Gerada em '+dtl(a.criado_em)+(a.criado_por?' por '+a.criado_por:'')+' · baixada em '+new Date().toLocaleString('pt-BR')],[],cols.map(c=>c[1]),
    ...L.map(x=>cols.map(c=>c[2]==='n'?(x[c[0]]==null?null:+x[c[0]]):(x[c[0]]||''))),[],['Total','',t.b,Math.round(t.k*100)/100],[],['Pesos de referência (base FC): confirme com o fornecedor. © FC Consultoria em Esquadria']];
  const ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=cols.map(c=>({wch:c[0]==='material'?46:c[0]==='obs'?30:14}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,nm.slice(0,30));
  XLSX.writeFile(wb,nm.replace(/ /g,'_')+'_'+new Date().toISOString().slice(0,10)+'.xlsx');reg('baixou Excel da '+nm.toLowerCase());}

/* ---------- eventos ---------- */
function wireTab(){const b=document.getElementById('scBox');if(!b)return;wireLista(b);
  b.querySelectorAll('[data-ci]').forEach(x=>{x.onchange=()=>{const i=IT.find(z=>z.cod===x.dataset.ci);if(!i)return;const k=x.dataset.k;
      let v=numIn(x.value);if(x.value.trim()&&v==null){x.style.borderColor='var(--bad)';return;}x.style.borderColor='';
      if(x.dataset.dias&&v!=null)v=Math.round(v/30*1000)/1000;i[k]=v;if(k==='kgm')i.kgm_fonte=v==null?null:'informado por '+quem();
      agenda(i.cod,{[k]:v});const y=window.scrollY;
      setTimeout(()=>{const ae=document.activeElement,foco=ae&&ae.dataset&&ae.dataset.ci?[ae.dataset.ci,ae.dataset.k]:null;repinta(foco);window.scrollTo(0,y);},0);};
    x.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();x.blur();}};});
  b.querySelectorAll('[data-scdel]').forEach(x=>x.onclick=async()=>{const c=x.dataset.scdel;if(!confirm('Excluir o item '+c+' do simulador?'))return;
    const r=await sb.rpc('simc_excluir',{p_token:tok(),p_emp:tok()?null:emp(),p_cods:[c]});if(r.error){alert('Não foi possível excluir agora.');return;}IT=IT.filter(i=>i.cod!==c);reg('excluiu item '+c);pinta();});}
function repinta(foco){/* mantém o foco no próximo campo após salvar */
  const b=document.getElementById('scBox');if(!b)return;const sc=b.querySelector('#scTab>div'),st=sc?sc.scrollTop:0,sl=sc?sc.scrollLeft:0;
  const k=b.querySelector('#scTab');if(k)k.innerHTML=tabela(lista());
  const novo=document.createElement('div');novo.innerHTML=kpis();const velho=b.children[1];if(velho&&velho.matches('div[style*="grid-template-columns"]'))velho.replaceWith(novo.firstElementChild);
  const sc2=b.querySelector('#scTab>div');if(sc2){sc2.scrollTop=st;sc2.scrollLeft=sl;}wireTab();
  if(foco&&foco[0]){const e=b.querySelector(`[data-ci="${CSS.escape(foco[0])}"][data-k="${foco[1]}"]`);if(e)e.focus();}}
function wire(interno){const b=document.getElementById('scBox');if(!b)return;
  if(!interno&&Demp!==null&&Demp!==emp()){C=null;IT=[];}
  if(!interno&&!C&&!carregando){carregar();return;}
  b.querySelectorAll('[data-cf]').forEach(x=>x.onchange=()=>{const k=x.dataset.cf;let v=numIn(x.value);if(v==null||v<=0){x.style.borderColor='var(--bad)';return;}
    if(k==='cob_d'||k==='cob_f')v=Math.round(v/30*1000)/1000;if(k==='periodo')v=Math.round(v);salvaCfg({[k]:v});reg('alterou parâmetro '+k);});
  b.querySelectorAll('[data-scv]').forEach(x=>x.onclick=()=>{S.v=x.dataset.scv;S.st='';pinta();});
  const q=b.querySelector('#scQ');if(q)q.oninput=()=>{S.q=q.value;pintaTab();};
  const s=b.querySelector('#scS');if(s)s.onchange=()=>{S.st=s.value;pintaTab();};
  const a=b.querySelector('#scA');if(a)a.onchange=()=>{S.al=a.checked;pintaTab();};
  const nv=b.querySelector('#scNovo');if(nv)nv.onclick=novoItem;
  const im=b.querySelector('#scImp');if(im)im.onclick=importar;
  const xx=b.querySelector('#scX');if(xx)xx.onclick=exportar;
  wireTab();}

async function novoItem(){const cod=(prompt('Código do item novo (o mesmo código do sistema):')||'').trim();if(!cod)return;
  if(IT.some(i=>i.cod.toLowerCase()===cod.toLowerCase())){alert('Esse código já está no simulador.');return;}
  const mat=(prompt('Descrição do item:')||'').trim();if(!mat)return;
  const it={cod,material:mat,novo:true,ord:(IT.reduce((m,i)=>Math.max(m,+i.ord||0),0)+1)};
  const r=await sb.rpc('simc_salvar',{p_token:tok(),p_emp:tok()?null:emp(),p_cfg:null,p_itens:[{cod,material:mat,novo:true}]});
  if(r.error){alert('Não foi possível incluir agora.');return;}IT.push(it);reg('incluiu item '+cod);S.q=cod;S.st='';S.al=false;if(S.v!=='d'&&S.v!=='f')S.v='d';pinta();
  status('Item incluído na Distribuidora e na Fábrica. Preencha estoque, saídas e consumo.');}

/* ---------- importar relatório do sistema (Excel) ---------- */
function lib(){return window.XLSX?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function importar(){const w=document.createElement('div');w.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(10,20,26,.55);display:flex;align-items:center;justify-content:center;padding:16px';
  w.innerHTML=`<div class="box" style="max-width:520px;width:100%;display:flex;flex-direction:column;gap:10px">
   <b style="font-size:16px">📥 Importar relatório de estoque do sistema</b>
   <p class="nota" style="margin:0">Use o relatório com as colunas <b>Cód. original, Material, Estoque e Saídas período</b> (90 dias). Os outros campos (peso, transferências, ajustes) não mudam.</p>
   <label class="btn" style="text-align:center;cursor:pointer">🏬 Arquivo da Distribuidora (filial 103)<input type="file" hidden accept=".xlsx,.xls" data-imp="d"></label>
   <label class="btn" style="text-align:center;cursor:pointer">🏭 Arquivo da Fábrica (filial 1)<input type="file" hidden accept=".xlsx,.xls" data-imp="f"></label>
   <span class="nota" id="scImpSt"></span><button class="btn" type="button" data-x="1">Fechar</button></div>`;
  document.body.appendChild(w);w.onclick=ev=>{if(ev.target===w||ev.target.dataset.x)w.remove();};
  w.querySelectorAll('[data-imp]').forEach(inp=>inp.onchange=async()=>{const f=inp.files[0];if(!f)return;const st=w.querySelector('#scImpSt'),tipo=inp.dataset.imp;
    st.textContent='Lendo o arquivo…';
    try{await lib();const wb=XLSX.read(await f.arrayBuffer(),{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]],A=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
      const norm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
      const hi=A.findIndex(r=>r.some(c=>norm(c).startsWith('cod'))&&r.some(c=>norm(c)==='estoque'));if(hi<0)throw new Error('Não achei as colunas Cód. original e Estoque.');
      const H=A[hi].map(norm),ci=H.findIndex(c=>c.startsWith('cod')),mi=H.findIndex(c=>c.startsWith('material')||c.startsWith('descri')),ei=H.indexOf('estoque'),si=H.findIndex(c=>c.startsWith('saida'));
      const L=[];for(const r of A.slice(hi+1)){const cod=String(r[ci]??'').trim();if(!cod||!/\d/.test(cod)||(mi>=0&&!String(r[mi]).trim()))continue;
        const est=num(r[ei]),sai=si>=0?num(r[si]):null,x={cod};if(mi>=0)x.material=String(r[mi]).trim();
        if(tipo==='d'){x.est_d=est;if(si>=0)x.sai_d=sai;}else{x.est_f=est;if(si>=0)x.cons_f=sai;}L.push(x);}
      if(!L.length)throw new Error('Nenhum item encontrado no arquivo.');
      const novos=L.filter(x=>!IT.some(i=>i.cod===x.cod)).length,comSai=L.filter(x=>(tipo==='d'?x.sai_d:x.cons_f)>0).length;
      if(!confirm(`${tipo==='d'?'Distribuidora':'Fábrica'}: ${L.length} itens no arquivo (${novos} novos, ${comSai} com ${tipo==='d'?'saídas':'consumo'}).\n\nAtualizar o estoque e ${tipo==='d'?'as saídas':'o consumo'} no simulador?`)){st.textContent='Importação cancelada.';return;}
      st.textContent='Gravando…';for(let k=0;k<L.length;k+=150){const r=await sb.rpc('simc_salvar',{p_token:tok(),p_emp:tok()?null:emp(),p_cfg:k?null:{base_em:new Date().toISOString().slice(0,10)},p_itens:L.slice(k,k+150)});if(r.error)throw r.error;}
      reg('importou relatório da '+(tipo==='d'?'distribuidora':'fábrica'));st.textContent='✓ Importado: '+L.length+' itens.';await carregar();}
    catch(e){st.textContent='⚠ '+(e&&e.message||'Não foi possível importar.');st.style.color='var(--bad)';}
    inp.value='';});}

/* ---------- Excel ---------- */
async function exportar(){const at0=ativa();if((S.v==='lc'||S.v==='lt')&&at0)return exportarLista(at0);const L=lista();if(!L.length)return;try{await lib();}catch(_){alert('Não foi possível gerar o Excel agora.');return;}
  const nomeEmp=(typeof E!=='undefined'&&E[emp()]&&E[emp()].nome)||'',V=VIS.find(v=>v[0]===S.v)[1].replace(/^\S+\s/,'');
  let cab,lin;
  if(S.v==='d'){cab=['Código','Material','kg/m','Estoque','Saídas período','Transf. p/ fábrica','Revenda/mês','Consumo fábrica/mês','Cobertura (meses)','Estoque ideal','Pedido da fábrica','Ajuste','Compra (barras)','Compra (kg)','Cobertura atual (meses)','Status','Alerta'];
    lin=L.map(({i,r})=>[i.cod,i.material,i.kgm,i.est_d,i.sai_d,i.transf,+r.revM.toFixed(2),+r.consM.toFixed(2),r.cobD,+r.idD.toFixed(2),r.ped,i.aj_d,r.comp,+r.kgComp.toFixed(2),r.cobAD!=null?+r.cobAD.toFixed(2):null,r.stD,r.al.join(' · ')]);}
  else if(S.v==='f'){cab=['Código','Material','kg/m','Estoque fábrica','Consumo obra (período)','Consumo/mês','Cobertura (meses)','Estoque ideal','Ajuste','Pedido à distribuidora','Pedido (kg)','Excesso','Cobertura atual (meses)','Status','Alerta'];
    lin=L.map(({i,r})=>[i.cod,i.material,i.kgm,i.est_f,i.cons_f,+r.consM.toFixed(2),r.cobF,+r.idF.toFixed(2),i.aj_f,r.ped,+r.kgPed.toFixed(2),r.excF,r.cobAF!=null?+r.cobAF.toFixed(2):null,r.stF,r.al.join(' · ')]);}
  else if(S.v==='g'){cab=['Código','Material','Estoque distrib.','Estoque fábrica','Estoque total','Demanda/mês','Cobertura total (meses)','Pedido fábrica','Compra fornecedor','Situação'];
    lin=L.map(({i,r})=>[i.cod,i.material,i.est_d,i.est_f,r.estT,+r.dem.toFixed(2),r.cobT!=null?+r.cobT.toFixed(2):null,r.ped,r.comp,r.stG]);}
  else if(S.v==='lc'){cab=['Código','Material','Barras','kg','Estoque distrib.','Pedido da fábrica'];lin=L.map(({i,r})=>[i.cod,i.material,r.comp,+r.kgComp.toFixed(2),i.est_d,r.ped]);}
  else{cab=['Código','Material','Barras','kg','Estoque fábrica','Consumo/mês'];lin=L.map(({i,r})=>[i.cod,i.material,r.ped,+r.kgPed.toFixed(2),i.est_f,+r.consM.toFixed(2)]);}
  const rows=[['Simulador de Compras · '+V+' · '+nomeEmp],['Gerado em '+new Date().toLocaleString('pt-BR')+' · período '+(C.periodo||90)+' dias · cobertura '+Math.round(C.cob_d*30)+'/'+Math.round(C.cob_f*30)+' dias (distrib./fábrica)'],[],cab,...lin,[],['Pesos de referência (base FC): confirme com o fornecedor. © FC Consultoria em Esquadria']];
  const ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=cab.map((c,k)=>({wch:k===1?46:Math.max(10,c.length+2)}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,V.slice(0,30));
  XLSX.writeFile(wb,'Simulador_Compras_'+V.replace(/\s+/g,'_')+'_'+new Date().toISOString().slice(0,10)+'.xlsx');reg('baixou Excel do simulador ('+V+')');}

window.FCSimCompras={html,wire:()=>wire(false),recarregar:carregar};
})();
