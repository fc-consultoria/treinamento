/* FC Consultoria em Esquadria · Obra em 3D · leitor do PDF "Orientativo de Montagem"
   Recebe o texto do PDF (itens do pdf.js: {x,y,w,s} por página) e devolve a lista de corte por tipologia:
   {numero, itens:[{item, projeto, nome, q, L, H, perfis:[{nome,desc,q,tam,corte,pos}], vidros:[{q,larg,alt}]}], avisos}
   Quantidades já por esquadria (o PDF traz o total do item). Sem códigos de perfil, peso ou preço:
   o que vai para o 3D é só o nome da peça, a medida de corte, o corte e a quantidade.
   © FC Consultoria em Esquadria (FC Desenvolvimento de Projetos de Compra e Venda LTDA · CNPJ 52.985.682/0001-32)
   Criação e desenvolvimento: FC Consultoria em Esquadria · uso exclusivo · proibida a cópia ou reprodução */
(function(root){
"use strict";
const LIMPA=s=>String(s==null?"":s).replace(/\s+/g," ").trim();
/* mesmo agrupamento de linhas do leitor do orçamento */
function linhas(pag){
 if(root.O3DLER&&root.O3DLER.linhas)return root.O3DLER.linhas(pag);
 if(typeof require==="function"){try{return require("./obra3d-ler.js").linhas(pag)}catch(e){}}
 throw new Error("obra3d-ler.js não carregado");
}
const NUM=/^\d+$/,DEC=/^[\d.]+,\d+$/,CORTE=/^\d{2}\/\d{2}$/;

function ler(P){
 const O={numero:"",itens:[],avisos:[],secoes:{},_fig:[]};let cur=null,sec="",nomeAberto=false;const FIG=new Map();
 P.forEach((pag,pi)=>linhas(pag).forEach(r=>{
  const c=r.t.split("\t").map(LIMPA).filter(Boolean),tl=c.join(" ");
  if(!O.numero&&/OR[ÇC]AMENTO Nro:/i.test(tl))O.numero=(tl.match(/Nro:\s*(\d+)/i)||[])[1]||"";
  const pj=tl.match(/Projeto:\s*(\S+)\s+Item:\s*(\d+)/i);
  if(pj){cur={item:pj[2],projeto:pj[1],nome:"",q:1,L:0,H:0,perfis:[],vidros:[]};O.itens.push(cur);sec="";nomeAberto=false;return}
  if(!cur)return;
  if(/^Nome:/i.test(tl)){cur.nome=LIMPA(tl.replace(/^Nome:/i,""));nomeAberto=true;return}
  const qm=tl.match(/^Qtde:\s*(\d+)\s+Largura\s+(\d+)\s+Altura\s+(\d+)/i);
  if(qm){cur.q=+qm[1];cur.L=+qm[2];cur.H=+qm[3];nomeAberto=false;return}
  if(nomeAberto){cur.nome=LIMPA(cur.nome+" "+tl);return}
  if(c.length===1&&/^(Perfil|Acess[óo]rios|Vidro|Servi[çc]os|Vari[áa]veis)$/i.test(tl)){sec=tl.toLowerCase().slice(0,4);return}
  if(sec==="perf"){
   if(/^Observa[çc][ãa]o:/i.test(tl)){const p=cur.perfis[cur.perfis.length-1];if(p)p.obs=LIMPA(tl.replace(/^Observa[çc][ãa]o:/i,""));return}
   /* código · descrição · qtde · tamanho · corte · [pos] · peso */
   const ic=c.findIndex(CORTE.test.bind(CORTE));
   if(ic>=3&&NUM.test(c[ic-1])&&NUM.test(c[ic-2])&&DEC.test(c[c.length-1])){
    const pos=/^[LH]$/.test(c[ic+1]||"")?c[ic+1]:"";
    const peso=+c[c.length-1].replace(/\./g,"").replace(",","."),qt=+c[ic-2],tam=+c[ic-1];
    /* o código só serve para achar o desenho da seção; não vai para o 3D nem para o link */
    let sid=FIG.get(c[0]);if(!sid){sid="s"+(FIG.size+1);FIG.set(c[0],sid);O._fig.push({sid,pg:pi,y:r.y,kgm:qt&&tam?peso/(qt*tam/1000):0})}
    cur.perfis.push({desc:c.slice(1,ic-2).join(" "),qt,tam,corte:c[ic],pos,obs:"",s:sid})}
   return}
  if(sec==="vidr"&&/^VIDRO\b/i.test(c[0])&&c.length>=6){
   /* VIDRO · cor · [posição] · fixação · qtde · largura · altura · m² */
   const n=c.length;if(NUM.test(c[n-4])&&NUM.test(c[n-3])&&NUM.test(c[n-2]))cur.vidros.push({cor:c[1],qt:+c[n-4],larg:+c[n-3],alt:+c[n-2]});return}
 }));
 O.itens.forEach(it=>{const n=Math.max(it.q,1);
  it.perfis=it.perfis.map(p=>({nome:p.obs||p.desc,desc:p.desc,q:Math.round(p.qt/n*100)/100,tam:p.tam,corte:p.corte,pos:p.pos,s:p.s}));
  it.vidros=it.vidros.map(v=>({q:Math.round(v.qt/n*100)/100,larg:v.larg,alt:v.alt}));
  if(!it.perfis.length)O.avisos.push(`Item ${it.item}: lista de perfis não lida.`)});
 if(!O.itens.length)O.avisos.push("Nenhuma tipologia encontrada. Confira se o PDF é o Orientativo de Montagem.");
 return O;
}
/* liga cada item do orçamento ao item do Orientativo: mesmo número de item e mesma L × A
   (o número pode se repetir no original; a medida desempata) */
function ligar(itensObra,ori){
 const usados=new Set();let ok=0;
 itensObra.forEach(t=>{const o=t.orig||t;
  const k=ori.itens.findIndex((x,i)=>!usados.has(i)&&String(x.item)===String(o.item)&&+x.L===+o.L&&+x.H===+o.H);
  const k2=k>=0?k:ori.itens.findIndex((x,i)=>!usados.has(i)&&+x.L===+o.L&&+x.H===+o.H&&LIMPA(x.nome).slice(0,20)===LIMPA(o.tipo).slice(0,20));
  if(k2>=0){usados.add(k2);const x=ori.itens[k2];const sec={};x.perfis.forEach(p=>{if(p.s&&ori.secoes&&ori.secoes[p.s])sec[p.s]=ori.secoes[p.s]});
   t.cortes={perfis:x.perfis,vidros:x.vidros,secoes:sec};ok++}else delete t.cortes});
 return {ligados:ok,total:itensObra.length};
}
/* desenho de cada perfil: recorta a figura ao lado da linha (coluna "Figura") e tira a seção real.
   doc = documento do pdf.js já aberto; precisa de secao-ler.js (SECAO). Só a 1ª ocorrência de cada perfil. */
async function secoes(doc,O,opt){opt=opt||{};const S=opt.escala||18,SEC=root.SECAO||(typeof require==="function"?require("./secao-ler.js"):null);
 if(!SEC||!O._fig)return O;const cache={};
 for(const f of O._fig){try{
  const pg=cache[f.pg]||(cache[f.pg]=await doc.getPage(f.pg+1));const vp0=pg.getViewport({scale:1});
  /* figura: x 21–58 pt; topo ≈ 9 pt acima da linha de base do código; altura ≈ 22 pt */
  const x0=21,top=f.y+9.4,w=37,h=22.4;
  const cv=(opt.canvas||(()=>document.createElement("canvas")))();cv.width=Math.round(w*S);cv.height=Math.round(h*S);
  const cx=cv.getContext("2d");cx.fillStyle="#fff";cx.fillRect(0,0,cv.width,cv.height);
  const vp=pg.getViewport({scale:S,offsetX:-x0*S,offsetY:-(vp0.height-top)*S});
  await pg.render({canvasContext:cx,viewport:vp}).promise;
  const sec=SEC.extrair(cx.getImageData(0,0,cv.width,cv.height),f.kgm);
  if(sec&&sec.f.length)O.secoes[f.sid]=sec}catch(e){}}
 return O}
function limpar(O){delete O._fig;return O}
const API={ler,ligar,secoes,limpar};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.O3DORI=API;
})(typeof window!=="undefined"?window:globalThis);
