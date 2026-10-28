/* Sincronização automática: Tabela de precificação (cons_planilhas) → itens do Painel de Vendas (orc_cfg.itens).
   Usado pelo Painel de Vendas (orcamento/) e pelo painel da consultoria (consultorias.html).
   - FCOrcSync.sincronizar({emp|chave, ids?})  lê as planilhas marcadas e grava os itens
   - FCOrcSync.seVelho({emp|chave})            sincroniza se alguma planilha marcada mudou depois da última atualização
   - FCOrcSync.aposSalvar({emp|chave, planilhaId}) chamado depois de salvar/trocar uma planilha
   emp = visão FC (logado na Matriz) · chave = link da empresa (k=). Depende de sb (auth.js) e Planilha (planilha.js). */
(function(){
const BASE=(()=>{try{return new URL('.',document.currentScript.src).href;}catch(_){return '/treinamento/';}})();
const nk=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const sem=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const COR_RX=[['BRANCO','Branco'],['PRETO','Preto'],['NATURAL','Natural'],['FOSCO','Fosco'],['BRONZE','Bronze'],['CHAMPANHE','Champanhe'],['AMADEIRADO','Amadeirado'],['CEREJEIRA','Cerejeira'],['ANODIZADO','Anodizado'],['BRILHANTE','Brilhante']];
const corDe=t=>{const u=sem(t).toUpperCase();const k=COR_RX.find(x=>u.includes(x[0]));if(k)return k[1];if(/\bBCO\b/.test(u))return 'Branco';if(/\b(PRT|PTO|PTF)\b/.test(u))return 'Preto';if(/\bNAT\b/.test(u))return 'Natural';return '';};
let FAUTO=null;
async function fotos(){if(FAUTO)return FAUTO;FAUTO=await fetch(BASE+'orcamento/fotos-auto.json?v=3').then(r=>r.json()).catch(()=>({}));return FAUTO;}
function fotoAutoDe(i,F){const toks=[...String(i.ref||'').split(/[|\/,;]+/),...String(i.cod||'').split(/[|\/,;]+/),...(/^acess/i.test(String(i.linha||''))?[]:(String(i.desc).toUpperCase().match(/\b[A-Z]{1,5}-?\d{2,6}[A-Z]?\b/g)||[]).filter(t=>!/^L-?\d{2}$/.test(t)))];for(const t of toks){const k=nk(t);if(k.length>=3&&F[k])return F[k];}return '';}

/* Lê uma aba da tabela de precificação: acha os cabeçalhos (Código, Descrição, Valor da vara…) e devolve os itens com preço */
function lerAba(sh,mt){const keys=Object.keys(sh.c),rows={};keys.forEach(a=>{const mm=a.match(/^([A-Z]+)(\d+)$/);if(mm)(rows[+mm[2]]=rows[+mm[2]]||[]).push(mm[1]);});
  const R=Object.keys(rows).map(Number).sort((a,b)=>a-b);
  const PRC=h=>h==='preco de venda barra'||h.startsWith('valor da vara')||h==='preco de venda'||h.startsWith('valores unitario')||h.startsWith('valor unitario')||h.startsWith('valores do pacote');
  let col=null,linha='',cor='',forn='',lastH=-9;const out=[];
  for(const r of R){const cs=rows[r];const H={};cs.forEach(c=>{const v=mt.val(sh,c+r);if(typeof v==='string')H[c]=sem(v).replace(/\s+/g,' ').trim();});
    const fm=Object.values(H).map(h=>h.match(/(?:fornecedor|provedor)\s*:\s*([a-z0-9-]+)/)).find(Boolean);if(fm)forn=fm[1].toUpperCase();
    const pcs=Object.keys(H).filter(c=>PRC(H[c])).sort((a,b)=>(H[b]==='preco de venda barra')-(H[a]==='preco de venda barra')||a.length-b.length||a.localeCompare(b)),pc=pcs[0];
    if(pc&&lastH===r-1&&col){const t=col.d?String(mt.val(sh,col.d+r)??'').trim():'';if(t&&!PRC(sem(t))&&!/^descri/.test(sem(t))){cor=corDe(t)||t;}lastH=r;continue;}
    if(pc){lastH=r;const f=(t)=>Object.keys(H).filter(c=>t(H[c])).sort((a,b)=>a.length-b.length||a.localeCompare(b))[0];
      const cod=f(h=>h==='codigo revenda'||h==='codigo'),des=f(h=>h==='codigo fornecedor'||h.startsWith('descricao'));
      let dc=des;if(!dc&&cod){const nx=String.fromCharCode(cod.charCodeAt(cod.length-1)+1);dc=cod.slice(0,-1)+nx;}
      col={p:pc,ac:/unitari|pacote/.test(H[pc]),pp:Object.keys(H).find(c=>H[c].startsWith('valores do pacote')&&c!==pc),cod,d:dc,cor:f(h=>h==='cor'),forn:f(h=>h==='nome fornecedor'),peso:f(h=>h==='peso barra'||h.startsWith('peso (p')),ref:f(h=>h.includes('sistema')||h==='cod. cem'||h==='cem')};
      linha=(!des&&dc&&mt.val(sh,dc+r))?String(mt.val(sh,dc+r)).replace(/\s{2,}.*$/,'').replace(/^COMPONENTES P\/ ALUM[IÍ]NIO\s*-\s*/i,'Acessórios · ').trim():'';cor='';continue;}
    if(!col)continue;const g=c=>c?mt.val(sh,c+r):null;const desc=String(g(col.d)??'').replace(/\s+/g,' ').trim(),codv=String(g(col.cod)??'').trim();let pr=g(col.p),un='BR';
    if(/^descri/i.test(sem(desc))&&!codv)continue;
    if(col.ac){un='UN';if(!(typeof pr==='number'&&pr>0)&&col.pp){const q=g(col.pp);if(typeof q==='number'&&q>0){pr=q;un=/rolo/i.test(desc)?'RL':'PCT';}}}
    if(!(typeof pr==='number'&&pr>0&&isFinite(pr))){if(desc&&!codv&&desc.length<40){const c2=corDe(desc);cor=c2||desc;continue;}if(!(codv&&desc&&/[a-z]{3}/i.test(desc)))continue;pr=0;}
    if(!desc)continue;let cod=codv;if(!cod||cod==='*'){const t=desc.toUpperCase().match(/\b[A-Z]{1,5}[- ]?\d{2,6}[A-Z]?\b/);cod=t?t[0]:'—';}
    let cr=String(g(col.cor)??'').trim();cr=cr?cr.charAt(0).toUpperCase()+cr.slice(1).toLowerCase():(cor||corDe(desc));
    const ref=String(g(col.ref)??'').trim();const pe=g(col.peso);
    out.push({cod,desc,cor:cr,linha,forn:String(g(col.forn)??'').trim()||forn,ref:ref&&ref!=='-'?ref:'',un,peso:typeof pe==='number'?Math.round(pe*1000)/1000:null,preco:Math.round(pr*100)/100,sc:!(pr>0)});}
  return out;}

async function lerCfg({emp,chave}){
  if(emp){const r=await sb.from('orc_cfg').select('itens,cab,planilha_id,itens_em').eq('empresa_id',emp).maybeSingle();return r.data||null;}
  const r=await sb.rpc('orc_g_cfg',{p_chave:chave});return (r.data&&r.data.cfg)||null;}
async function lerPlanilhas({emp,chave}){
  if(emp){const r=await sb.from('cons_planilhas').select('id,atualizado').eq('empresa_id',emp);return r.data||[];}
  const r=await sb.rpc('cons_portal_planilhas',{p_chave:chave});return r.data||[];}
const idsDe=c=>((c&&c.cab&&c.cab.plIds)||[c&&c.planilha_id]).filter(Boolean);

let rodando=null;
async function sincronizar(o){if(rodando)return rodando;rodando=(async()=>{try{
  const {emp,chave}=o;const cfg=o.cfg||await lerCfg(o);if(!cfg)return {ok:false,msg:'Painel de Vendas ainda não configurado.'};
  const ids=(o.ids&&o.ids.length)?o.ids:idsDe(cfg);if(!ids.length)return {ok:false,msg:'Nenhuma planilha marcada.'};
  const F=await fotos(),antes=Object.fromEntries((cfg.itens||[]).map(i=>[i.id,i]));
  const out=[],vistos=new Set();let dup=0;const abas=[];
  for(const pid of ids){
    const r=emp?await sb.from('cons_planilhas').select('dados').eq('id',pid).maybeSingle():await sb.rpc('cons_portal_planilha',{p_chave:chave,p_id:pid});
    if(r.error||!r.data||!r.data.dados)return {ok:false,msg:'Não consegui abrir uma das planilhas.'};
    const model=r.data.dados,mt=new Planilha.Motor(model);
    for(const sh of model.sheets){const L=lerAba(sh,mt);if(!L.length)continue;abas.push(sh.n);
      for(const it of L){const id=(nk(it.cod)+'_'+nk(it.desc).slice(0,48)+'_'+nk(it.cor)).slice(0,90);if(vistos.has(id)){dup++;continue;}vistos.add(id);it.id=id;
        const a=antes[id];it.foto=a&&a.foto?a.foto:fotoAutoDe(it,F);if(a&&a.fotoManual)it.fotoManual=1;if(a&&a.est!=null)it.est=a.est;if(a&&a.estCor)it.estCor=a.estCor;if(a&&a.estConf)it.estConf=a.estConf;out.push(it);}}}
  if(!out.length)return {ok:false,msg:'Nenhum item com preço de venda encontrado nas planilhas.'};
  let ok;
  if(emp){const r=await sb.from('orc_cfg').update({itens:out,planilha_id:ids[0],cab:Object.assign({},cfg.cab||{},{plIds:ids}),itens_em:new Date().toISOString(),atualizado_em:new Date().toISOString()}).eq('empresa_id',emp).select('empresa_id');ok=!r.error&&r.data&&r.data.length>0;}
  else{const r=await sb.rpc('orc_itens_sync',{p_chave:chave,p_itens:out,p_plids:ids});ok=!r.error&&r.data===true;}
  if(!ok)return {ok:false,msg:'Não foi possível gravar os itens.'};
  const mud=out.filter(i=>antes[i.id]&&antes[i.id].preco!==i.preco).length;
  return {ok:true,n:out.length,abas,dup,mud,comFoto:out.filter(i=>i.foto).length,itens:out,ids};
}catch(err){return {ok:false,msg:String(err&&err.message||err)};}finally{setTimeout(()=>{rodando=null;},0);}})();return rodando;}

async function seVelho(o){try{const cfg=await lerCfg(o);if(!cfg)return null;const ids=idsDe(cfg);if(!ids.length)return null;
  const P=await lerPlanilhas(o),em=cfg.itens_em?new Date(cfg.itens_em).getTime():0;
  const sel=P.filter(p=>ids.includes(p.id));if(sel.length<ids.length)return null;
  if(!sel.some(p=>p.atualizado&&new Date(p.atualizado).getTime()>em+1000))return null;
  return await sincronizar(Object.assign({},o,{cfg,ids}));}catch(_){return null;}}

async function aposSalvar(o){try{const cfg=await lerCfg(o);if(!cfg||!idsDe(cfg).includes(o.planilhaId))return null;return await sincronizar(Object.assign({},o,{cfg}));}catch(_){return null;}}

window.FCOrcSync={lerAba,sincronizar,seVelho,aposSalvar,corDe};
})();
