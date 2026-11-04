/* FC Consultoria em Esquadria · Obra em 3D · leitor do PDF de orçamento
   Recebe o texto do PDF (itens do pdf.js: {x,y,s} por página) e devolve a obra:
   {empresa, numero, emissao, vendedor, cliente, cor, itens:[{n,item,loc,tipo,linha,corPerfil,corAcess,q,m2,L,H,vidro,obs,kind,f,enc,avisos}], avisos}
   Não altera nenhum texto do original: o que vem do PDF fica guardado como veio (campo "orig").
   O desenho 3D (kind/f/enc) é só uma sugestão, que a conferência pode ajustar.
   © FC Consultoria em Esquadria · uso exclusivo */
(function(root){
"use strict";
const LIMPA=s=>String(s==null?"":s).replace(/\s+/g," ").trim();
const DIN=/^\d{1,3}(\.\d{3})*,\d{2}$/;                 /* 2.673,86 */
const num=s=>{s=String(s||"").trim();if(!s)return 0;return +s.replace(/\./g,"").replace(",",".")||0};

/* linhas da página: agrupa por altura (tolerância 3 pt) e ordena por x; espaço grande vira tabulação */
function linhas(pag){
 const its=pag.filter(i=>i.s&&i.s.trim()).map(i=>({x:+i.x,y:+i.y,w:+(i.w||0),s:i.s.trim()})).sort((a,b)=>b.y-a.y||a.x-b.x);
 const rows=[];its.forEach(it=>{const r=rows.find(r=>Math.abs(r.y-it.y)<=3);if(r){r.it.push(it);r.y=(r.y*(r.it.length-1)+it.y)/r.it.length}else rows.push({y:it.y,it:[it]})});
 rows.forEach(r=>r.it.sort((a,b)=>a.x-b.x));rows.sort((a,b)=>b.y-a.y);
 return rows.map(r=>({y:r.y,it:r.it,t:r.it.map((i,k)=>{if(!k)return i.s;const p=r.it[k-1];const gap=i.x-(p.x+(p.w||p.s.length*4.5));return (gap>9?"\t":" ")+i.s}).join("")}));
}
/* texto entre um rótulo e o próximo rótulo da mesma linha */
function entre(t,de,ate){const i=t.search(de);if(i<0)return null;let r=t.slice(i).replace(de,"").replace(/^[\s\t]+/,"");if(ate){const j=r.search(ate);if(j>=0)r=r.slice(0,j)}return LIMPA(r.replace(/\t/g," "))}

/* desenho 3D sugerido a partir do nome da tipologia */
function desenho(tipo,linha){
 const d=String(tipo||"").toUpperCase()+" "+String(linha||"").toUpperCase();
 const n=re=>{const m=d.match(re);return m?parseInt(m[1],10):0};
 const folhas=n(/(\d+)\s*FOLHAS?/),mod=n(/(\d+)\s*M[ÓO]DULOS?/),fixas=n(/(\d+)\s*FIXAS?/);
 let kind="gen",f=folhas||mod||1,enc="vidro";
 if(/PIVOTANTE/.test(d))kind="piv";
 else if(/CORRER/.test(d)){kind=(folhas===4&&fixas===2)?"correr4":"correr";f=Math.max(folhas||2,2)}
 else if(/GIRO|ABRIR/.test(d)){kind="giro";f=folhas>=2?2:1}
 else if(/MAXIM-?AR|BASCULANTE/.test(d)){kind=/PEITORIL/.test(d)?"maxp":"max";f=mod||folhas||1}
 else if(/PAINEL\s+FIXO|VIDRO\s+TEMPERADO|PERFIL DE ALUM/.test(d)&&/FIXO/.test(d)){kind="painel";f=mod||1}
 else if(/FIXO/.test(d)){kind="fixo";f=mod||folhas||1}
 if(/VENEZIANA/.test(d))enc="veneziana";
 else if(/VIDRO\s+SUPERIOR/.test(d)&&/LAMBRI/.test(d))enc="vidlam";
 else if(/LAMBRI/.test(d))enc="lambri";
 return {kind,f:Math.max(1,Math.min(f,12)),enc,reconhecido:kind!=="gen"};
}

function ler(P){
 const L=[];P.forEach((pag,pi)=>linhas(pag).forEach(r=>L.push(Object.assign(r,{pg:pi+1}))));
 const O={empresa:"",numero:"",emissao:"",vendedor:"",cliente:"",cor:"",itens:[],avisos:[]};
 /* cabeçalho: primeira linha da primeira página é o nome da empresa que fez o orçamento */
 const p1=L.filter(r=>r.pg===1);
 if(p1.length){const t0=p1[0].t.split("\t")[0];O.empresa=LIMPA(t0)}
 L.forEach(r=>{const t=r.t;
  if(!O.numero&&/Numero:/i.test(t))O.numero=entre(t,/N[uú]mero:/i,/\t|$/)||"";
  if(!O.emissao&&/Emiss[ãa]o:/i.test(t))O.emissao=entre(t,/Emiss[ãa]o:/i,/\t|$/)||"";
  if(!O.vendedor&&/Vendedor:/i.test(t))O.vendedor=entre(t,/Vendedor:/i,/\t|$/)||"";
  if(!O.cliente&&/^CLIENTE:/i.test(t))O.cliente=entre(t,/CLIENTE:/i,/TEL\.|CELULAR|\t\s*\t/i)||"";
 });
 /* blocos de item */
 let cur=null,esperaTipo=false,obs=false;
 const fecha=()=>{if(cur&&cur.q){O.itens.push(cur)}else if(cur){O.avisos.push(`Um bloco (${cur.loc||"sem local"}) não teve a linha de medidas lida.`)}cur=null};
 for(let k=0;k<L.length;k++){const r=L[k],t=r.t,tl=LIMPA(t.replace(/\t/g," "));
  if(/OBSERVA[ÇC][ÕO]ES DESTE ITEM/i.test(tl)){fecha();obs=true;continue}
  if(/LOCAL\/AMBIENTE:/i.test(t)){fecha();obs=false;
   cur={loc:entre(t,/\*?LOCAL\/AMBIENTE:/i,/\bTIPO:/i)||"",tipo:"",linha:"",corPerfil:"",corAcess:"",q:0,avisos:[]};esperaTipo=true;continue}
  if(!cur){ if(obs&&tl&&!/^TOTAL/i.test(tl)&&O.itens.length){const it=O.itens[O.itens.length-1];it.obs=LIMPA((it.obs?it.obs+" ":"")+tl)} if(/^TOTAL/i.test(tl))obs=false; continue}
  if(/COR PERFIL:/i.test(t)){esperaTipo=false;cur.corPerfil=entre(t,/\*?COR PERFIL:/i,/\*?COR ACESS/i)||"";cur.corAcess=entre(t,/\*?COR ACESS[ÓO]RIO:/i,/\t|$/)||"";continue}
  if(/^LINHA:/i.test(tl)){cur.linha=entre(t,/LINHA:/i,/DATA ENTREGA/i)||"";continue}
  if(/^ITEM\s+QTDE/i.test(tl))continue;
  if(esperaTipo&&tl){cur.tipo=cur.tipo?cur.tipo+" "+tl:tl;continue}
  const tk=tl.split(" ");
  if(/^\d+$/.test(tk[0])&&/^\d+$/.test(tk[1]||"")&&!cur.q){
   /* ITEM QTDE M2 LARGURA ALTURA <vidro…> VLR.UNIT VLR.TOTAL */
   const din=tk.map((s,i)=>DIN.test(s)?i:-1).filter(i=>i>=0);
   const iu=din.length>=2?din[din.length-2]:tk.length;
   cur.item=tk[0];cur.q=+tk[1];cur.m2=num(tk[2]);cur.L=+tk[3]||0;cur.H=+tk[4]||0;
   cur.vidro=LIMPA(tk.slice(5,iu).join(" "));
   cur.vu=din.length>=2?num(tk[iu]):0;cur.vt=din.length>=2?num(tk[din[din.length-1]]):0;
   fecha();continue}
  if(/OBSERVA[ÇC][ÕO]ES DESTE ITEM/i.test(tl)){obs=true;continue}
 }
 fecha();

 /* sugestão do desenho e conferências automáticas (nunca alteram o texto original) */
 const vistos={};
 O.itens.forEach((it,i)=>{it.n=i+1;
  const d=desenho(it.tipo,it.linha);it.kind=d.kind;it.f=d.f;it.enc=d.enc;
  if(!d.reconhecido)it.avisos.push("Tipologia não reconhecida: escolha o desenho 3D.");
  if(vistos[it.item])it.avisos.push(`Número de item ${it.item} repetido no original (também no ${vistos[it.item]}º bloco).`);else vistos[it.item]=i+1;
  const ult=String(it.loc||"").split(",").pop().trim();
  if(/,\s*$/.test(it.loc||"")||(String(it.loc).includes(",")&&ult.length<=2))it.avisos.push("Local/ambiente parece cortado no próprio PDF.");
  if(!it.L||!it.H)it.avisos.push("Largura ou altura não lida.");
  if(it.m2&&it.L&&it.H&&it.q&&Math.abs(it.L*it.H*it.q/1e6-it.m2)>.02)it.avisos.push(`M² do original (${it.m2}) não bate com L × A × qtde.`);
  /* o texto exatamente como veio do PDF fica travado */
  it.orig={loc:it.loc,tipo:it.tipo,linha:it.linha,corPerfil:it.corPerfil,q:it.q,L:it.L,H:it.H,vidro:it.vidro,item:it.item,obs:it.obs||""};
  /* valor do item no PDF: fica só no painel da Matriz (base da margem no PDF impresso); o link nunca leva preço */
  it.pv=it.vt||0;it.orig.pv=it.pv;delete it.vu;delete it.vt;
 });
 const cores=[...new Set(O.itens.map(t=>t.corPerfil).filter(Boolean))];O.cor=cores[0]||"";
 if(!O.itens.length)O.avisos.push("Nenhum item encontrado. Confira se o PDF é o orçamento com Local/Ambiente, Tipo e medidas.");
 return O;
}

const API={ler,desenho,linhas};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.O3DLER=API;
})(typeof window!=="undefined"?window:globalThis);
