/* Planilha online FC: importa .xlsx (ExcelJS), calcula fórmulas, mostra no formato original e exporta .xlsx.
   Modelo: {v:1, sheets:[{n, c:{A1:{v,f,s}}, w:{A:larg}, h:{1:alt}, m:["A1:C1"], fr:{r,c}, cf:[{ref,rules:[{op,f:[..],bg,fc}]}], hc:{K:true}}], st:[{b,i,sz,fc,bg,ha,va,wr,nf,bd}]} */
(function(){
const EXCELJS='https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
let exLoad=null;
function loadExcel(){if(window.ExcelJS)return Promise.resolve();if(exLoad)return exLoad;exLoad=new Promise((ok,no)=>{const s=document.createElement('script');s.src=EXCELJS;s.onload=ok;s.onerror=()=>no(new Error('Não carregou o leitor de Excel'));document.head.appendChild(s);});return exLoad;}
const THEME=['#FFFFFF','#000000','#E7E6E6','#44546A','#4472C4','#ED7D31','#A5A5A5','#FFC000','#5B9BD5','#70AD47'];
const cor=c=>{if(!c)return null;if(c.argb){const a=c.argb.length===8?c.argb.slice(2):c.argb;return '#'+a.toUpperCase();}if(c.theme!=null)return THEME[c.theme]||null;return null;};
const colNum=s=>{let n=0;for(const ch of s)n=n*26+ch.charCodeAt(0)-64;return n;};
const colStr=n=>{let s='';while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=(n-m-1)/26;}return s;};
const splitA=a=>{const m=/^([A-Z]+)(\d+)$/.exec(a);return m?[colNum(m[1]),+m[2]]:[0,0];};

/* ---------- importar ---------- */
async function importar(buf){await loadExcel();const wb=new ExcelJS.Workbook();await wb.xlsx.load(buf);
  const st=[],stKey=new Map();
  const sid=cell=>{const f=cell.font||{},fl=cell.fill||{},al=cell.alignment||{},b=cell.border||{};
    const o={};if(f.bold)o.b=1;if(f.italic)o.i=1;if(f.size&&f.size!==11)o.sz=f.size;const fc=cor(f.color);if(fc&&fc!=='#000000')o.fc=fc;
    if(fl.type==='pattern'&&fl.pattern==='solid'){const bg=cor(fl.fgColor);if(bg&&bg!=='#FFFFFF')o.bg=bg;}
    if(al.horizontal)o.ha=al.horizontal;if(al.vertical&&al.vertical!=='bottom')o.va=al.vertical;if(al.wrapText)o.wr=1;
    const sd=['left','right','top','bottom'].find(k=>b[k]&&b[k].style);if(sd){o.bd=cor(b[sd].color)||'#BDBDBD';}
    if(cell.numFmt&&cell.numFmt!=='General')o.nf=cell.numFmt;
    const k=JSON.stringify(o);if(k==='{}')return undefined;if(!stKey.has(k)){stKey.set(k,st.length);st.push(o);}return stKey.get(k);};
  const sheets=[];
  wb.eachSheet(ws=>{const sh={n:ws.name,c:{},w:{},h:{},m:[],cf:[],hc:{}};
    (ws.columns||[]).forEach((col,i)=>{const L=colStr(i+1);if(col&&col.width)sh.w[L]=Math.round(col.width*10)/10;if(col&&col.hidden)sh.hc[L]=1;});
    ws.eachRow({includeEmpty:false},(row,r)=>{if(row.height)sh.h[r]=Math.round(row.height);
      row.eachCell({includeEmpty:true},(cell,ci)=>{const a=colStr(ci)+r;let v=cell.value,f=null;const s=sid(cell);
        if(v&&typeof v==='object'){if(cell.formula){f=cell.formula;v=v.result;}else if(v.richText){v=v.richText.map(t=>t.text).join('');}else if(v.text!=null){v=v.text;}else if(v instanceof Date){v=v.toISOString().slice(0,10);}else if(v.error){v={e:v.error};}else v=null;}
        if(v&&typeof v==='object'&&v.error)v={e:v.error};
        if(v==null&&f==null&&s==null)return;const o={};if(v!=null&&v!=='')o.v=v;if(f)o.f=f;if(s!=null)o.s=s;sh.c[a]=o;});});
    try{Object.keys(ws._merges||{}).forEach(k=>{const m=ws._merges[k];if(m&&m.range)sh.m.push(m.range);else if(m&&m.model)sh.m.push(colStr(m.model.left)+m.model.top+':'+colStr(m.model.right)+m.model.bottom);});}catch(_){}
    const vw=(ws.views||[])[0];if(vw&&vw.state==='frozen')sh.fr={r:vw.ySplit||0,c:vw.xSplit||0};
    (ws.conditionalFormattings||[]).forEach(cf=>{const rules=(cf.rules||[]).filter(r=>r.type==='cellIs').map(r=>({op:r.operator,f:(r.formulae||[]).map(String),bg:r.style&&r.style.fill?cor(r.style.fill.bgColor||r.style.fill.fgColor):null,fc:r.style&&r.style.font?cor(r.style.font.color):null}));if(rules.length)sh.cf.push({ref:cf.ref,rules});});
    sheets.push(sh);});
  return {v:1,sheets,st};}

/* ---------- motor de fórmulas ---------- */
const ERR=e=>({e});const isErr=x=>x&&typeof x==='object'&&x.e;
function tokenize(s){const t=[];let i=0;
  while(i<s.length){const c=s[i];
    if(c===' '){i++;continue;}
    if(c==='"'){let j=i+1,v='';while(j<s.length){if(s[j]==='"'){if(s[j+1]==='"'){v+='"';j+=2;continue;}break;}v+=s[j++];}t.push({t:'str',v});i=j+1;continue;}
    if(c==="'"){const j=s.indexOf("'!",i+1);if(j>0){t.push({t:'sheet',v:s.slice(i+1,j)});i=j+2;continue;}}
    let m;
    if((m=/^[A-Za-z_][A-Za-z0-9_\.]*!/.exec(s.slice(i)))){t.push({t:'sheet',v:m[0].slice(0,-1)});i+=m[0].length;continue;}
    if((m=/^\$?[A-Z]{1,3}\$?\d+(:\$?[A-Z]{1,3}\$?\d+)?/.exec(s.slice(i)))&&!/^[A-Za-z0-9_\(]/.test(s.slice(i+m[0].length))){t.push({t:'ref',v:m[0].replace(/\$/g,'')});i+=m[0].length;continue;}
    if((m=/^\$?[A-Z]{1,3}:\$?[A-Z]{1,3}/.exec(s.slice(i)))){t.push({t:'colrange',v:m[0].replace(/\$/g,'')});i+=m[0].length;continue;}
    if((m=/^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/i.exec(s.slice(i)))){t.push({t:'num',v:parseFloat(m[0])});i+=m[0].length;continue;}
    if((m=/^(TRUE|FALSE)(?![A-Za-z0-9_(])/i.exec(s.slice(i)))){t.push({t:'bool',v:m[0].toUpperCase()==='TRUE'});i+=m[0].length;continue;}
    if((m=/^[A-Za-z_][A-Za-z0-9_\.]*(?=\()/.exec(s.slice(i)))){t.push({t:'fn',v:m[0].toUpperCase().replace(/^_XLFN\./,'')});i+=m[0].length;continue;}
    if((m=/^(<>|<=|>=|[-+*/^&=<>%(),;])/.exec(s.slice(i)))){t.push({t:'op',v:m[0]===';'?',':m[0]});i+=m[0].length;continue;}
    throw new Error('Fórmula não reconhecida perto de: '+s.slice(i,i+12));}
  return t;}
function parse(s){const T=tokenize(s);let p=0;const pk=()=>T[p],nx=()=>T[p++],isOp=v=>T[p]&&T[p].t==='op'&&T[p].v===v;
  const bin=(next,ops)=>()=>{let l=next();while(T[p]&&T[p].t==='op'&&ops.includes(T[p].v)){const o=nx().v;l={k:'bin',o,l,r:next()};}return l;};
  const primary=()=>{const t=nx();if(!t)throw new Error('Fórmula incompleta');
    if(t.t==='num')return {k:'n',v:t.v};if(t.t==='str')return {k:'s',v:t.v};if(t.t==='bool')return {k:'b',v:t.v};
    if(t.t==='sheet'){const r=nx();if(!r||(r.t!=='ref'&&r.t!=='colrange'))throw new Error('Referência inválida');return {k:'ref',sh:t.v,v:r.v};}
    if(t.t==='ref'||t.t==='colrange')return {k:'ref',v:t.v};
    if(t.t==='fn'){nx();const args=[];if(!isOp(')')){do{args.push(isOp(',')||isOp(')')?{k:'empty'}:expr());}while(isOp(',')&&nx());}if(!isOp(')'))throw new Error('Falta fechar parênteses');nx();return {k:'fn',n:t.v,a:args};}
    if(t.t==='op'&&t.v==='('){const e=expr();if(!isOp(')'))throw new Error('Falta fechar parênteses');nx();return e;}
    throw new Error('Fórmula inválida');};
  const postfix=()=>{let e=primary();while(isOp('%')){nx();e={k:'pct',e};}return e;};
  const unary=()=>{if(isOp('-')){nx();return {k:'neg',e:unary()};}if(isOp('+')){nx();return unary();}return postfix();};
  const power=bin(unary,['^']),term=bin(power,['*','/']),add=bin(term,['+','-']),cat=bin(add,['&']),cmp=bin(cat,['=','<>','<','>','<=','>=']);
  function expr(){return cmp();}
  const e=expr();if(p<T.length)throw new Error('Sobrou texto na fórmula');return e;}

function Motor(model){this.m=model;this.cache=new Map();this.ast=new Map();this.busy=new Set();}
Motor.prototype.sheet=function(n){return n==null?null:this.m.sheets.find(s=>s.n.toLowerCase()===String(n).toLowerCase());};
Motor.prototype.reset=function(){this.cache.clear();};
Motor.prototype.val=function(sh,a){const k=sh.n+'!'+a;if(this.cache.has(k))return this.cache.get(k);const c=sh.c[a];let v;
  if(!c)v=null;else if(c.f){if(this.busy.has(k))return ERR('#CIRC!');this.busy.add(k);try{let A=this.ast.get(c.f);if(!A){A=parse(c.f);this.ast.set(c.f,A);}v=this.ev(A,sh);if(v&&v.rng)v=this.first(v);}catch(err){v=ERR('#ERRO');}this.busy.delete(k);}
  else v=c.v==null?null:c.v;this.cache.set(k,v);return v;};
Motor.prototype.first=function(r){return this.val(r.sh,colStr(r.c1)+r.r1);};
Motor.prototype.range=function(n,sh){const s=n.sh?this.sheet(n.sh):sh;if(!s)return ERR('#REF!');let a,b;
  if(n.v.includes(':')){[a,b]=n.v.split(':');}else{a=b=n.v;}
  if(/^[A-Z]+$/.test(a)){const maxR=Math.max(1,...Object.keys(s.c).map(k=>splitA(k)[1]));a=a+'1';b=b+maxR;}
  const [c1,r1]=splitA(a),[c2,r2]=splitA(b);return {rng:1,sh:s,c1:Math.min(c1,c2),c2:Math.max(c1,c2),r1:Math.min(r1,r2),r2:Math.max(r1,r2)};};
Motor.prototype.vals=function(r){const o=[];for(let rr=r.r1;rr<=r.r2;rr++)for(let cc=r.c1;cc<=r.c2;cc++)o.push(this.val(r.sh,colStr(cc)+rr));return o;};
const num=v=>{if(isErr(v))throw v;if(v==null||v==='')return 0;if(typeof v==='boolean')return v?1:0;if(typeof v==='number')return v;const n=Number(String(v).replace(',','.'));if(isNaN(n))throw ERR('#VALOR!');return n;};
const txt=v=>{if(isErr(v))throw v;if(v==null)return '';if(typeof v==='boolean')return v?'VERDADEIRO':'FALSO';return String(v);};
const flat=(m,args)=>{const o=[];args.forEach(a=>{if(a&&a.rng)m.vals(a).forEach(x=>o.push({x,r:1}));else o.push({x:a,r:0});});return o;};
const nums=(m,args)=>{const o=[];flat(m,args).forEach(({x,r})=>{if(isErr(x))throw x;if(r){if(typeof x==='number')o.push(x);}else o.push(num(x));});return o;};
const FN={
  SUM:(m,a)=>nums(m,a).reduce((s,x)=>s+x,0),
  AVERAGE:(m,a)=>{const n=nums(m,a);if(!n.length)throw ERR('#DIV/0!');return n.reduce((s,x)=>s+x,0)/n.length;},
  MIN:(m,a)=>{const n=nums(m,a);return n.length?Math.min(...n):0;},MAX:(m,a)=>{const n=nums(m,a);return n.length?Math.max(...n):0;},
  COUNT:(m,a)=>flat(m,a).filter(o=>typeof o.x==='number').length,COUNTA:(m,a)=>flat(m,a).filter(o=>o.x!=null&&o.x!=='').length,
  ROUND:(m,a)=>{const d=num(a[1]||0),f=Math.pow(10,d);return Math.round(num(a[0])*f+1e-9*Math.sign(num(a[0])))/f;},
  ROUNDUP:(m,a)=>{const d=num(a[1]||0),f=Math.pow(10,d),x=num(a[0]);return Math.sign(x)*Math.ceil(Math.abs(x)*f-1e-9)/f;},
  ROUNDDOWN:(m,a)=>{const d=num(a[1]||0),f=Math.pow(10,d),x=num(a[0]);return Math.sign(x)*Math.floor(Math.abs(x)*f+1e-9)/f;},
  INT:(m,a)=>Math.floor(num(a[0])),TRUNC:(m,a)=>Math.trunc(num(a[0])),ABS:(m,a)=>Math.abs(num(a[0])),
  AND:(m,a)=>nums(m,a).every(x=>x),OR:(m,a)=>nums(m,a).some(x=>x),NOT:(m,a)=>!num(a[0]),
  CONCATENATE:(m,a)=>a.map(txt).join(''),CONCAT:(m,a)=>flat(m,a).map(o=>txt(o.x)).join(''),
  SUMPRODUCT:(m,a)=>{const L=a.map(r=>r&&r.rng?m.vals(r).map(x=>typeof x==='number'?x:0):[num(r)]);let s=0;for(let i=0;i<L[0].length;i++)s+=L.reduce((p,l)=>p*(l[i]||0),1);return s;},
  SUMIF:(m,a)=>{const r=m.vals(a[0]),sr=a[2]?m.vals(a[2]):r,t=crit(a[1]);let s=0;r.forEach((x,i)=>{if(t(x)&&typeof sr[i]==='number')s+=sr[i];});return s;},
  COUNTIF:(m,a)=>{const t=crit(a[1]);return m.vals(a[0]).filter(t).length;},
  VLOOKUP:(m,a)=>{const r=a[1],k=a[0],col=num(a[2]),ex=a.length>3?!num(a[3]):false;for(let rr=r.r1;rr<=r.r2;rr++){const v=m.val(r.sh,colStr(r.c1)+rr);if(ex?String(v).toLowerCase()===String(k).toLowerCase():v==k)return m.val(r.sh,colStr(r.c1+col-1)+rr);}throw ERR('#N/D');},
  LEFT:(m,a)=>txt(a[0]).slice(0,a[1]==null?1:num(a[1])),RIGHT:(m,a)=>{const s=txt(a[0]),n=a[1]==null?1:num(a[1]);return n?s.slice(-n):'';},LEN:(m,a)=>txt(a[0]).length,UPPER:(m,a)=>txt(a[0]).toUpperCase(),TRIM:(m,a)=>txt(a[0]).trim().replace(/\s+/g,' '),
  VALUE:(m,a)=>num(a[0]),TEXT:(m,a)=>fmt(num(a[0]),txt(a[1])),
};
function crit(c){const s=String(c);const m=/^(<=|>=|<>|<|>|=)?(.*)$/.exec(s);const op=m[1]||'=',v=m[2],n=Number(v.replace(',','.'));const isN=v!==''&&!isNaN(n);
  return x=>{const a=isN?(typeof x==='number'?x:Number(x)):String(x==null?'':x).toLowerCase(),b=isN?n:v.toLowerCase();switch(op){case '<':return a<b;case '>':return a>b;case '<=':return a<=b;case '>=':return a>=b;case '<>':return a!=b;default:return a==b;}};}
Motor.prototype.ev=function(n,sh){const m=this;
  switch(n.k){case 'n':case 's':case 'b':return n.v;case 'empty':return null;
    case 'ref':{const r=m.range(n,sh);if(isErr(r))return r;if(r.c1===r.c2&&r.r1===r.r2&&!n.v.includes(':'))return m.val(r.sh,colStr(r.c1)+r.r1);return r;}
    case 'neg':try{return -num(m.ev(n.e,sh));}catch(e){return e;}
    case 'pct':try{return num(m.ev(n.e,sh))/100;}catch(e){return e;}
    case 'fn':{
      if(n.n==='IF'){const c=m.ev(n.a[0],sh);if(isErr(c))return c;let t;try{t=!!num(c&&c.rng?m.first(c):c);}catch(e){t=c!=null&&c!=='';}return n.a[t?1:2]?m.ev(n.a[t?1:2],sh):(t?true:false);}
      if(n.n==='IFERROR'){const v=m.ev(n.a[0],sh);return isErr(v)?m.ev(n.a[1],sh):v;}
      const f=FN[n.n];if(!f)return ERR('#NOME?');try{const a=n.a.map(x=>m.ev(x,sh));return f(m,a);}catch(e){return isErr(e)?e:ERR('#VALOR!');}}
    case 'bin':{let l=m.ev(n.l,sh),r=m.ev(n.r,sh);if(l&&l.rng)l=m.first(l);if(r&&r.rng)r=m.first(r);if(isErr(l))return l;if(isErr(r))return r;
      try{switch(n.o){case '+':return num(l)+num(r);case '-':return num(l)-num(r);case '*':return num(l)*num(r);case '/':{const d=num(r);if(d===0)return ERR('#DIV/0!');return num(l)/d;}case '^':return Math.pow(num(l),num(r));case '&':return txt(l)+txt(r);
        default:{const a=typeof l==='string'||typeof r==='string'?txt(l).toLowerCase():num(l),b=typeof l==='string'||typeof r==='string'?txt(r).toLowerCase():num(r);
          return n.o==='='?a===b:n.o==='<>'?a!==b:n.o==='<'?a<b:n.o==='>'?a>b:n.o==='<='?a<=b:a>=b;}}}catch(e){return isErr(e)?e:ERR('#VALOR!');}}}
  return ERR('#ERRO');};

/* ---------- formato de número ---------- */
function fmt(v,nf){if(isErr(v))return v.e;if(v==null)return '';if(typeof v==='boolean')return v?'VERDADEIRO':'FALSO';if(typeof v!=='number')return String(v);
  if(!nf||nf==='General'||nf==='@'){if(Number.isInteger(v))return v.toLocaleString('pt-BR',{useGrouping:false});return v.toLocaleString('pt-BR',{maximumFractionDigits:10,useGrouping:false}).replace(/(,\d{6})\d+$/,'$1');}
  const sec=nf.split(';');let f=sec[0];if(v<0&&sec[1]){f=sec[1];v=Math.abs(v);}
  const pct=/%/.test(f),cur=/R\$/.test(f),dm=/0\.(0+)/.exec(f),dec=dm?dm[1].length:0,grp=/#,##/.test(f);
  let x=pct?v*100:v;let s=x.toLocaleString('pt-BR',{minimumFractionDigits:dec,maximumFractionDigits:dec,useGrouping:grp||cur});
  if(pct)s+='%';if(cur)s='R$ '+s;return s;}

/* ---------- copiar fórmula para outra linha ---------- */
function moverFormula(f,dr){let out='',i=0;const re=/(\$?)([A-Z]{1,3})(\$?)(\d+)/y;
  while(i<f.length){const c=f[i];if(c==='"'){const j=f.indexOf('"',i+1);out+=f.slice(i,j<0?f.length:j+1);i=j<0?f.length:j+1;continue;}
    re.lastIndex=i;const m=re.exec(f);const prev=i?f[i-1]:'';
    if(m&&!/[A-Za-z0-9_]/.test(prev)&&!/[A-Za-z0-9_(]/.test(f[i+m[0].length]||'')){out+=m[1]+m[2]+m[3]+(m[3]?m[4]:Math.max(1,+m[4]+dr));i+=m[0].length;continue;}
    out+=c;i++;}
  return out;}

/* ---------- exportar ---------- */
async function exportar(model,nome){await loadExcel();const wb=new ExcelJS.Workbook();const M=new Motor(model);
  const argb=h=>h?'FF'+h.replace('#',''):undefined;
  model.sheets.forEach(sh=>{const ws=wb.addWorksheet(sh.n.slice(0,31),sh.fr?{views:[{state:'frozen',xSplit:sh.fr.c,ySplit:sh.fr.r}]}:{});
    Object.entries(sh.w).forEach(([L,w])=>{ws.getColumn(L).width=w;});Object.keys(sh.hc||{}).forEach(L=>{ws.getColumn(L).hidden=true;});
    Object.entries(sh.h).forEach(([r,h])=>{ws.getRow(+r).height=h;});
    Object.entries(sh.c).forEach(([a,c])=>{const cell=ws.getCell(a);const v=M.val(sh,a);
      if(c.f)cell.value={formula:c.f,result:isErr(v)?undefined:v};else if(c.v!=null&&!isErr(c.v))cell.value=c.v;
      const s=c.s!=null?model.st[c.s]:null;if(s){cell.font={bold:!!s.b,italic:!!s.i,size:s.sz||11,color:s.fc?{argb:argb(s.fc)}:undefined,name:'Calibri'};
        if(s.bg)cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:argb(s.bg)}};
        if(s.ha||s.va||s.wr)cell.alignment={horizontal:s.ha,vertical:s.va,wrapText:!!s.wr};
        if(s.bd){const b={style:'thin',color:{argb:argb(s.bd)}};cell.border={left:b,right:b,top:b,bottom:b};}
        if(s.nf)cell.numFmt=s.nf;}});
    (sh.m||[]).forEach(r=>{try{ws.mergeCells(r);}catch(_){}});
    (sh.cf||[]).forEach(cf=>ws.addConditionalFormatting({ref:cf.ref,rules:cf.rules.map((r,i)=>({type:'cellIs',operator:r.op,formulae:r.f,priority:i+1,style:{fill:r.bg?{type:'pattern',pattern:'solid',bgColor:{argb:argb(r.bg)}}:undefined,font:r.fc?{color:{argb:argb(r.fc)}}:undefined}}))}));});
  const buf=await wb.xlsx.writeBuffer();const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(nome||'planilha').replace(/[^\w\- .À-ú]+/g,'_')+'.xlsx';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);}

/* ---------- visualizador / editor ---------- */
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function abrir(opts){/* opts: {model,nome,podeEditar(addr,cell)->bool, podeFormula:bool, onSave(model)->Promise, onClose(), info} */
  const model=opts.model;let si=0,sel=null;const M=new Motor(model);let dirty=false,timer=null;
  const ov=document.createElement('div');ov.className='pl-ov';ov.innerHTML=`<style>
  .pl-ov{position:fixed;inset:0;z-index:9000;background:var(--bg,#eef2f4);display:flex;flex-direction:column;font:14px var(--f-b,system-ui)}
  .pl-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px max(12px,env(safe-area-inset-left,0px));background:var(--surface,#fff);border-bottom:1px solid var(--line,#d9e1e6)}
  .pl-top b{font:700 17px var(--f-d,system-ui)}.pl-top .sp{flex:1}.pl-st{font-size:13px;color:var(--muted,#5d6f7a)}
  .pl-btn{font:600 13.5px var(--f-b,system-ui);border:1px solid var(--line,#d9e1e6);background:var(--surface,#fff);color:var(--fg,#15232b);border-radius:8px;padding:7px 11px;cursor:pointer}.pl-btn.pri{background:var(--accent,#0d5c8f);color:#fff;border-color:var(--accent,#0d5c8f)}
  .pl-fx{display:flex;gap:6px;align-items:center;padding:6px 12px;background:var(--surface,#fff);border-bottom:1px solid var(--line,#d9e1e6)}
  .pl-fx .ad{font:600 12.5px var(--f-m,monospace);min-width:62px;text-align:center;border:1px solid var(--line,#d9e1e6);border-radius:6px;padding:5px 6px;background:var(--surface-2,#f6f8f9)}
  .pl-fx input{flex:1;min-width:0;font:13.5px var(--f-m,monospace);padding:6px 8px;border:1px solid var(--line,#d9e1e6);border-radius:6px;background:#fff;color:#15232b}
  .pl-fx .fxl{font:italic 600 14px Georgia,serif;color:var(--muted,#5d6f7a)}
  .pl-wrap{flex:1;overflow:auto;background:#fff;position:relative}
  .pl-t{border-collapse:separate;border-spacing:0;font:12.5px Calibri,"Segoe UI",Arial,sans-serif;color:#000;table-layout:fixed}
  .pl-t td{border-right:1px solid #e3e3e3;border-bottom:1px solid #e3e3e3;padding:2px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;height:21px;background:#fff;cursor:cell}
  .pl-t th{position:sticky;top:0;z-index:3;background:#f1f3f4;border-right:1px solid #d0d4d8;border-bottom:1px solid #c6cbd0;font:600 11.5px system-ui;color:#5f6368;height:20px}
  .pl-t .rn{position:sticky;left:0;z-index:2;background:#f1f3f4;color:#5f6368;font:600 11px system-ui;text-align:center;border-right:1px solid #c6cbd0;cursor:default}
  .pl-t th.rn{z-index:4}
  .pl-t td.sel{outline:2px solid #1a73e8;outline-offset:-2px;position:relative;z-index:1}
  .pl-t td.lk{cursor:default}
  .pl-tabs{display:flex;gap:2px;padding:6px 10px;background:var(--surface,#fff);border-top:1px solid var(--line,#d9e1e6);overflow-x:auto}
  .pl-tabs button{all:unset;cursor:pointer;padding:6px 12px;border-radius:7px;font:600 13px var(--f-b,system-ui);color:var(--muted,#5d6f7a);white-space:nowrap}.pl-tabs button[aria-pressed="true"]{background:var(--accent-soft,#e3eef6);color:var(--accent,#0d5c8f)}
  .pl-msg{font-size:12.5px;color:#a85d00;padding:0 12px 6px;background:var(--surface,#fff)}
  </style>
  <div class="pl-top"><b>📊 ${esc(opts.nome)}</b><span class="pl-st" id="plSt">${esc(opts.info||'')}</span><span class="sp"></span>
   ${opts.podeLinha?'<button class="pl-btn" type="button" id="plLinha" title="Copia a linha selecionada, com as fórmulas, para o fim da tabela">+ Linha</button>':''}
   <button class="pl-btn" type="button" id="plBaixar">⬇ Baixar .xlsx</button>${opts.onSave?'<button class="pl-btn pri" type="button" id="plSalvar">💾 Salvar</button>':''}${(opts.botoes||[]).map((b,i)=>b.href?`<a class="pl-btn" href="${esc(b.href)}" ${b.nova?'target="_blank" rel="noopener"':''} title="${esc(b.title||'')}" style="text-decoration:none">${esc(b.txt)}</a>`:`<button class="pl-btn" type="button" data-plx="${i}" title="${esc(b.title||'')}">${esc(b.txt)}</button>`).join('')}<button class="pl-btn" type="button" id="plFechar">✕ Fechar</button></div>
  <div class="pl-fx"><span class="ad" id="plAd">—</span><span class="fxl">fx</span><input id="plIn" autocomplete="off" spellcheck="false" placeholder="Selecione uma célula"></div>
  <div class="pl-msg" id="plMsg" hidden></div>
  <div class="pl-wrap" id="plWrap"></div><div class="pl-tabs" id="plTabs"></div>`;
  document.body.appendChild(ov);document.body.style.overflow='hidden';
  const $=id=>ov.querySelector('#'+id),wrap=$('plWrap'),inp=$('plIn');let TD=new Map(),merged=new Map();
  const styleCss=new Map();const css=sId=>{if(sId==null)return '';if(styleCss.has(sId))return styleCss.get(sId);const s=model.st[sId]||{};let c='';
    if(s.b)c+='font-weight:700;';if(s.i)c+='font-style:italic;';if(s.sz)c+=`font-size:${Math.round(s.sz*1.15)}px;`;if(s.fc)c+=`color:${s.fc};`;if(s.bg)c+=`background:${s.bg};`;
    if(s.ha)c+=`text-align:${s.ha==='centerContinuous'?'center':s.ha};`;if(s.wr)c+='white-space:normal;';if(s.va)c+=`vertical-align:${s.va==='center'?'middle':s.va};`;if(s.bd)c+=`border-right:1px solid ${s.bd};border-bottom:1px solid ${s.bd};`;
    styleCss.set(sId,c);return c;};
  const sh=()=>model.sheets[si];
  function cfBg(s,a,v){for(const cf of (s.cf||[])){for(const ref of cf.ref.split(' ')){const [p,q]=ref.split(':');const [c1,r1]=splitA(p),[c2,r2]=splitA(q||p),[c,r]=splitA(a);
      if(c>=c1&&c<=c2&&r>=r1&&r<=r2&&typeof v==='number'){for(const ru of cf.rules){const f=ru.f.map(Number);const ok=ru.op==='lessThan'?v<f[0]:ru.op==='greaterThan'?v>f[0]:ru.op==='between'?v>=Math.min(f[0],f[1])&&v<=Math.max(f[0],f[1]):ru.op==='notBetween'?!(v>=f[0]&&v<=f[1]):ru.op==='equal'?v===f[0]:ru.op==='greaterThanOrEqual'?v>=f[0]:ru.op==='lessThanOrEqual'?v<=f[0]:false;
          if(ok)return (ru.bg?`background:${ru.bg};`:'')+(ru.fc?`color:${ru.fc};`:'');}}}}return '';}
  function dims(s){let mr=1,mc=1;Object.keys(s.c).forEach(a=>{const [c,r]=splitA(a);if(r>mr)mr=r;if(c>mc)mc=c;});(s.m||[]).forEach(m=>{const [c,r]=splitA(m.split(':')[1]);mr=Math.max(mr,r);mc=Math.max(mc,c);});return [mr,mc];}
  function draw(){const s=sh();M.reset();const [mr,mc]=dims(s);TD=new Map();merged=new Map();const cover=new Set();
    (s.m||[]).forEach(m=>{const [a,b]=m.split(':');const [c1,r1]=splitA(a),[c2,r2]=splitA(b);merged.set(a,[c2-c1+1,r2-r1+1]);for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)if(r!==r1||c!==c1)cover.add(colStr(c)+r);});
    const fr=s.fr||{r:0,c:0};const frc=Math.min(fr.c,innerWidth<700?1:3);
    let left=46;const lefts={};for(let c=1;c<=frc;c++){lefts[c]=left;left+=(s.hc&&s.hc[colStr(c)])?0:Math.round((s.w[colStr(c)]||9)*7.2+6);}
    const cw=c=>{const L=colStr(c);return s.hc&&s.hc[L]?0:Math.round((s.w[L]||9)*7.2+6);};let tw=46;for(let c=1;c<=mc;c++)tw+=cw(c);
    let h=`<table class="pl-t" style="width:${tw}px"><colgroup><col style="width:46px">`;for(let c=1;c<=mc;c++){h+=`<col style="width:${cw(c)}px">`;}h+='</colgroup><tr><th class="rn"></th>';
    for(let c=1;c<=mc;c++)h+=`<th style="${lefts[c]!=null?`left:${lefts[c]}px;z-index:4;`:''}">${colStr(c)}</th>`;h+='</tr>';
    for(let r=1;r<=mr;r++){const hh=s.h[r]?Math.round(s.h[r]*1.33):null;const top=r<=fr.r?`position:sticky;top:${21+(r-1)*23}px;z-index:2;`:'';
      h+=`<tr${hh?` style="height:${hh}px"`:''}><td class="rn" style="${r<=fr.r?`top:${21+(r-1)*23}px;z-index:3;`:''}">${r}</td>`;
      for(let c=1;c<=mc;c++){const a=colStr(c)+r;if(cover.has(a))continue;const cl=s.c[a];const v=cl?M.val(s,a):null;const mg=merged.get(a);
        const stk=(lefts[c]!=null&&(!mg||c+mg[0]-1<=frc)?`position:sticky;left:${lefts[c]}px;z-index:${r<=fr.r?3:1};`:top);
        h+=`<td data-a="${a}"${mg?` colspan="${mg[0]}" rowspan="${mg[1]}"`:''} style="${stk}${css(cl&&cl.s)}${cfBg(s,a,v)}${typeof v==='number'&&!(cl&&cl.s!=null&&model.st[cl.s].ha)?'text-align:right;':''}">${esc(fmt(v,cl&&cl.s!=null?model.st[cl.s].nf:null))}</td>`;}
      h+='</tr>';}
    wrap.innerHTML=h+'</table>';wrap.querySelectorAll('td[data-a]').forEach(td=>TD.set(td.dataset.a,td));
    $('plTabs').innerHTML=model.sheets.map((x,i)=>`<button type="button" data-si="${i}" aria-pressed="${i===si}">${esc(x.n)}</button>`).join('');
    $('plTabs').querySelectorAll('[data-si]').forEach(b=>b.onclick=()=>{si=+b.dataset.si;sel=null;draw();mostrar();});
    if(sel&&TD.get(sel))TD.get(sel).classList.add('sel');}
  function refresh(){const s=sh();M.reset();TD.forEach((td,a)=>{const cl=s.c[a];if(!cl)return;const v=M.val(s,a);const t=fmt(v,cl.s!=null?model.st[cl.s].nf:null);if(td.textContent!==t)td.textContent=t;
      if(s.cf&&s.cf.length){const base=td.getAttribute('style').replace(/background:[^;]+;|color:[^;]+;/g,'');td.setAttribute('style',base+css(cl.s)+cfBg(s,a,v));}});}
  function mostrar(){const s=sh();$('plAd').textContent=sel||'—';if(!sel){inp.value='';inp.disabled=true;return;}const cl=s.c[sel]||{};
    inp.value=cl.f?'='+cl.f:(cl.v==null?'':(typeof cl.v==='number'?String(cl.v).replace('.',','):String(cl.v)));
    const ok=opts.podeEditar(sel,cl,s);inp.disabled=!ok;inp.title=ok?'Digite e aperte Enter':'Esta célula é calculada e não pode ser alterada aqui';
    const msg=$('plMsg');if(!ok&&cl.f){msg.hidden=false;msg.textContent='Célula com fórmula: só a FC altera fórmulas. Os valores se atualizam sozinhos.';}else msg.hidden=true;}
  function selecionar(a){if(sel&&TD.get(sel))TD.get(sel).classList.remove('sel');sel=a;const td=TD.get(a);if(td){td.classList.add('sel');td.scrollIntoView({block:'nearest',inline:'nearest'});}mostrar();}
  function gravar(){const s=sh();if(!sel||inp.disabled)return;const raw=inp.value;const cl=s.c[sel]=s.c[sel]||{};const old=JSON.stringify(cl);
    if(raw.startsWith('=')){if(!opts.podeFormula){alert('Só a FC pode escrever fórmulas.');mostrar();return;}try{parse(raw.slice(1));}catch(err){alert('Fórmula com erro: '+err.message);return;}cl.f=raw.slice(1);delete cl.v;}
    else{delete cl.f;const nf=cl.s!=null?model.st[cl.s].nf:'';let t=raw.trim();
      if(t===''){delete cl.v;}else{const pct=/%$/.test(t)||/%/.test(nf||'');let x=t.replace(/^R\$\s*/,'').replace(/%$/,'');if(/,\d+$/.test(x)||/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(x))x=x.replace(/\./g,'').replace(',','.');
        const n=Number(x);if(x!==''&&!isNaN(n)){cl.v=pct&&(/%$/.test(t)||n>1)?n/100:n;}else cl.v=t;}}
    if(JSON.stringify(cl)!==old){dirty=true;refresh();agendar();}mostrar();}
  function agendar(){if(!opts.onSave)return;$('plSt').textContent='Alterações não salvas…';clearTimeout(timer);timer=setTimeout(salvar,1500);}
  async function salvar(){if(!opts.onSave||!dirty)return;clearTimeout(timer);$('plSt').textContent='Salvando…';try{await opts.onSave(model);dirty=false;$('plSt').textContent='✓ Salvo às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}catch(err){$('plSt').textContent='⚠ '+err.message;}}
  wrap.addEventListener('click',ev=>{const td=ev.target.closest('td[data-a]');if(td)selecionar(td.dataset.a);});
  wrap.addEventListener('dblclick',ev=>{const td=ev.target.closest('td[data-a]');if(td&&!inp.disabled){inp.focus();inp.select();}});
  inp.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();gravar();mover(0,1);wrap.focus();}else if(ev.key==='Escape'){mostrar();wrap.focus();}else if(ev.key==='Tab'){ev.preventDefault();gravar();mover(1,0);}});
  inp.addEventListener('blur',()=>{if(sel){const cl=sh().c[sel]||{};const cur=cl.f?'='+cl.f:(cl.v==null?'':(typeof cl.v==='number'?String(cl.v).replace('.',','):String(cl.v)));if(inp.value!==cur)gravar();}});
  wrap.tabIndex=0;
  function mover(dc,dr){if(!sel)return;let [c,r]=splitA(sel);c=Math.max(1,c+dc);r=Math.max(1,r+dr);const a=colStr(c)+r;if(TD.get(a))selecionar(a);}
  wrap.addEventListener('keydown',ev=>{if(document.activeElement===inp)return;const k=ev.key;
    if(k==='ArrowDown'){ev.preventDefault();mover(0,1);}else if(k==='ArrowUp'){ev.preventDefault();mover(0,-1);}else if(k==='ArrowLeft'){ev.preventDefault();mover(-1,0);}else if(k==='ArrowRight'||k==='Tab'){ev.preventDefault();mover(1,0);}
    else if(k==='Enter'||k==='F2'){if(!inp.disabled){ev.preventDefault();inp.focus();}}
    else if((k==='Delete'||k==='Backspace')&&sel&&!inp.disabled){ev.preventDefault();inp.value='';gravar();}
    else if(k.length===1&&!ev.ctrlKey&&!ev.metaKey&&sel&&!inp.disabled){inp.value='';inp.focus();}});
  $('plFechar').onclick=async()=>{if(dirty)await salvar();ov.remove();document.body.style.overflow='';opts.onClose&&opts.onClose();};
  ov.querySelectorAll('[data-plx]').forEach(b=>b.onclick=()=>{const x=(opts.botoes||[])[+b.dataset.plx];if(x&&x.fechar)$('plFechar').click();});
  ov.querySelectorAll('a.pl-btn').forEach(a=>a.addEventListener('click',async e=>{if(dirty&&!a.target){e.preventDefault();await salvar();location.href=a.href;}}));
  $('plBaixar').onclick=()=>exportar(model,opts.nome).catch(err=>alert(err.message));
  if($('plSalvar'))$('plSalvar').onclick=()=>{dirty=true;salvar();};
  if($('plLinha'))$('plLinha').onclick=()=>{const s=sh();if(!sel){alert('Clique numa linha de produto para copiar.');return;}const r0=splitA(sel)[1];const [mr]=dims(s);let last=mr;
    while(last>r0&&!Object.keys(s.c).some(a=>splitA(a)[1]===last&&(s.c[a].v!=null||s.c[a].f)))last--;const nr=last+1,dr=nr-r0;
    Object.keys(s.c).filter(a=>splitA(a)[1]===r0).forEach(a=>{const [c]=splitA(a),src=s.c[a],o={};if(src.s!=null)o.s=src.s;if(src.f)o.f=moverFormula(src.f,dr);s.c[colStr(c)+nr]=o;});
    if(s.h[r0])s.h[nr]=s.h[r0];dirty=true;draw();selecionar('A'+nr);agendar();};
  draw();mostrar();
  return {fechar:()=>$('plFechar').click()};}

window.Planilha={importar,exportar,abrir,Motor,fmt,parse,moverFormula,loadExcel};
})();
