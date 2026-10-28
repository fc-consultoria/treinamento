/* Relatório de vendas · itens (aba "rvi" do link do cliente).
   Itens orçados e itens em pedidos do Painel de Vendas, somados por código + cor.
   Só leitura: sem cliente, sem valores, sem desconto. Dados: sb.rpc('emp_rel_itens'). */
(function(){
const h=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=(v,d)=>Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:d||0,maximumFractionDigits:d||0});
const LINHAS={SU:'Suprema',LG:'Gold',CX:'Suprema'};
const linhaDe=r=>{const p=(r.cref||'').split('-')[0].toUpperCase();return LINHAS[p]||(r.cref?p:'Componentes e outros');};
const hoje=()=>new Date().toISOString().slice(0,10);
const ini30=()=>{const d=new Date();d.setDate(d.getDate()-30);return d.toISOString().slice(0,10);};
let Demp=null,S={tipo:'ped',de:ini30(),ate:hoje(),linha:'',cor:'',q:''},D=null,carregando=false,erro='';

async function carregar(){carregando=true;erro='';pinta();
  try{const tok=(typeof PESSOA!=='undefined'&&PESSOA)?PESSOA.token:null;
    const r=await sb.rpc('emp_rel_itens',{p_token:tok,p_emp:tok?null:at,p_de:S.de||null,p_ate:S.ate||null});
    if(r.error)throw r.error;Demp=at;D=(r.data||[]).map(x=>Object.assign(x,{linha:linhaDe(x)}));}
  catch(e){erro='Não foi possível carregar o relatório agora. Tente de novo.';D=null;}
  carregando=false;pinta();}

const filtrados=()=>(D||[]).filter(r=>r.tipo===S.tipo&&(!S.linha||r.linha===S.linha)&&(!S.cor||r.cor===S.cor)&&
  (!S.q||(r.cod+' '+r.cref+' '+r.descr).toLowerCase().includes(S.q.toLowerCase())));

function corpo(){
  if(carregando&&!D)return '<p class="nota">Carregando…</p>';
  if(erro)return `<p class="nota" style="color:var(--bad)">${h(erro)}</p>`;
  if(!D)return '';
  const L=filtrados(),base=(D||[]).filter(r=>r.tipo===S.tipo);
  const linhas=[...new Set(base.map(r=>r.linha))].sort(),cores=[...new Set(base.map(r=>r.cor).filter(Boolean))].sort();
  const tq=L.reduce((s,r)=>s+(+r.qtd||0),0),tk=L.reduce((s,r)=>s+(+r.kg||0),0),docs=new Set();
  const sel=(id,v,ops,tudo)=>`<select class="inpx" id="${id}" style="min-width:140px"><option value="">${tudo}</option>${ops.map(o=>`<option ${o===v?'selected':''}>${h(o)}</option>`).join('')}</select>`;
  return `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
     ${sel('riL',S.linha,linhas,'Todas as linhas')}${sel('riC',S.cor,cores,'Todas as cores')}
     <input class="inpx" id="riQ" type="search" placeholder="Código ou descrição" value="${h(S.q)}" style="flex:1;min-width:160px">
     <button class="btn" type="button" id="riX" ${L.length?'':'disabled'}>⬇ Baixar Excel</button></div>
   <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:12px">
     <div class="box" style="margin:0"><div class="nota">Itens diferentes</div><b style="font-size:20px">${n(L.length)}</b></div>
     <div class="box" style="margin:0"><div class="nota">Quantidade total</div><b style="font-size:20px">${n(tq,tq%1?1:0)}</b></div>
     <div class="box" style="margin:0"><div class="nota">Peso estimado</div><b style="font-size:20px">${n(tk,1)} kg</b></div></div>
   ${L.length?`<div style="overflow-x:auto"><table class="it" style="width:100%;border-collapse:collapse;font-size:13.5px">
     <thead><tr style="text-align:left"><th>Código</th><th>Ref.</th><th>Descrição</th><th>Cor</th><th>Linha</th><th style="text-align:right">Qtd</th><th>Un</th><th style="text-align:right">Kg</th><th style="text-align:right" title="Em quantos ${S.tipo==='ped'?'pedidos':'orçamentos'} o item aparece">${S.tipo==='ped'?'Pedidos':'Orçam.'}</th></tr></thead>
     <tbody>${L.map(r=>`<tr style="border-top:1px solid var(--line)"><td class="mono">${h(r.cod)}</td><td class="mono">${h(r.cref)}</td><td>${h(r.descr)}</td><td>${h(r.cor)}</td><td>${h(r.linha)}</td><td style="text-align:right"><b>${n(r.qtd,r.qtd%1?2:0)}</b></td><td>${h(r.un)}</td><td style="text-align:right">${+r.kg?n(r.kg,1):''}</td><td style="text-align:right">${n(r.docs)}</td></tr>`).join('')}</tbody></table></div>`
   :`<p class="nota">${S.tipo==='ped'?'Nenhum pedido fechado':'Nenhum orçamento em andamento'} nesse período${S.linha||S.cor||S.q?' com esses filtros':''}.</p>`}
   <p class="nota" style="margin-top:10px">${S.tipo==='ped'?'Pedidos = fechados aguardando o financeiro e pedidos aprovados (data do fechamento).':'Orçados = orçamentos em aberto, enviados ao cliente e em negociação (data de criação).'} Inativados, perdidos e cancelados não entram. O peso é estimado pelo cadastro do Painel de Vendas — confirme com o fornecedor.</p>`;}

function html(){return `<div id="riBox">${topo()}<div id="riCorpo">${corpo()}</div></div>`;}
function topo(){const b=(t,l)=>`<button class="btn${S.tipo===t?' pri':''}" type="button" data-rit="${t}" ${S.tipo===t?'style="background:var(--accent);color:#fff;border-color:var(--accent)"':''}>${l}</button>`;
  return `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">${b('ped','📦 Itens em pedidos')}${b('orc','📝 Itens orçados')}
   <span style="margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap"><label class="nota">De <input class="inpx" type="date" id="riDe" value="${S.de}"></label><label class="nota">até <input class="inpx" type="date" id="riAte" value="${S.ate}"></label></span></div>`;}

function pinta(){const b=document.getElementById('riBox');if(!b)return;b.innerHTML=topo()+`<div id="riCorpo">${corpo()}</div>`;wire(true);}
function wire(interno){const b=document.getElementById('riBox');if(!b)return;
  if(!interno&&Demp!==null&&Demp!==at){D=null;}
  if(!interno&&!D&&!carregando){carregar();return;}
  b.querySelectorAll('[data-rit]').forEach(x=>x.onclick=()=>{S.tipo=x.dataset.rit;S.linha='';S.cor='';pinta();});
  const de=b.querySelector('#riDe'),ate=b.querySelector('#riAte');
  if(de)de.onchange=()=>{S.de=de.value;carregar();};if(ate)ate.onchange=()=>{S.ate=ate.value;carregar();};
  const l=b.querySelector('#riL'),c=b.querySelector('#riC'),q=b.querySelector('#riQ'),x=b.querySelector('#riX');
  if(l)l.onchange=()=>{S.linha=l.value;pinta();};if(c)c.onchange=()=>{S.cor=c.value;pinta();};
  if(q)q.oninput=()=>{S.q=q.value;const p=q.selectionStart;pinta();const q2=document.getElementById('riQ');if(q2){q2.focus();q2.setSelectionRange(p,p);}};
  if(x)x.onclick=exportar;}

function lib(){return window.XLSX?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
async function exportar(){const L=filtrados();if(!L.length)return;
  try{await lib();}catch(_){alert('Não foi possível gerar o Excel agora. Tente de novo.');return;}
  const tit=S.tipo==='ped'?'Itens em pedidos':'Itens orçados',per=`${S.de.split('-').reverse().join('/')} a ${S.ate.split('-').reverse().join('/')}`;
  const nomeEmp=(typeof E!=='undefined'&&E[at]&&E[at].nome)||'';
  const rows=[[tit+' · '+nomeEmp],['Período: '+per+(S.linha?' · Linha: '+S.linha:'')+(S.cor?' · Cor: '+S.cor:'')+(S.q?' · Busca: '+S.q:'')],[],
    ['Código','Ref.','Descrição','Cor','Linha','Quantidade','Un','Kg (estimado)',S.tipo==='ped'?'Nº de pedidos':'Nº de orçamentos'],
    ...L.map(r=>[r.cod,r.cref,r.descr,r.cor,r.linha,+r.qtd,r.un,+r.kg||null,+r.docs]),[],['© FC Consultoria em Esquadria']];
  const ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=[{wch:12},{wch:9},{wch:46},{wch:12},{wch:14},{wch:11},{wch:5},{wch:13},{wch:15}];
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,S.tipo==='ped'?'Pedidos':'Orçados');
  XLSX.writeFile(wb,`${tit.replace(/ /g,'_')}_${S.de}_a_${S.ate}.xlsx`);
  try{if(typeof PESSOA!=='undefined'&&PESSOA)sb.rpc('emp_registrar',{p_token:PESSOA.token,p_area:'relatorio',p_acao:'baixou '+tit.toLowerCase()}).then(()=>{},()=>{});}catch(_){}}

window.FCRelItens={html,wire:()=>wire(false),recarregar:carregar};
})();
