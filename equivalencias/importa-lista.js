/* Onde comprar · importar a lista de perfis do cliente (Excel/CSV) para a simulação.
   Lê código (com a cor abreviada no fim: .BCO, -PTO, -NAT…), cor, barras e tamanho da barra; acha o perfil em qualquer linha. */
(function(){
  const XLSX_URL='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  const AB={branco:['BCO','BC','BR','BRA','BRC','BRANCO','WHITE','BRANC'],preto:['PTO','PT','PRT','PRE','PRETO','BLACK','PRET'],natural:['NAT','NT','NATURAL','NATUR','SA','SEM'],
    fosco:['FOS','FOSC','FOSCO','AF','ANO','ANOD','ANODIZADO','FOS.','FSC'],brilhante:['BRI','BRIL','BRILHANTE','CRO','CROM','CROMADO','BC.CROM'],cerejeira:['CER','CERE','CEREJ','CEREJEIRA','CRJ','CRJ.'],bronze:['BRZ','BRO','BRONZE','BZ']};
  const sa=t=>String(t||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
  const corDe=t=>{t=sa(t).replace(/[^A-Z]/g,'');if(!t)return null;for(const [k,L] of Object.entries(AB))if(L.includes(t))return k;
    for(const [k,L] of Object.entries(AB))if(L.some(x=>x.length>=4&&t.startsWith(x)))return k;
    if(/^ANOD/.test(t))return 'fosco';if(/CROM/.test(t))return 'brilhante';return null;};
  const corNoTexto=t=>{const s=sa(t);for(const [k,L] of Object.entries(AB))for(const x of L)if(x.length>=3&&new RegExp('(^|[^A-Z])'+x+'([^A-Z]|$)').test(s))return k;return null;};
  function separa(raw){const s=sa(raw).replace(/\s+/g,'');const m=s.match(/^(.+?)[.\-_\/ ]([A-Z]{2,10})$/);if(m){const c=corDe(m[2]);if(c)return {base:m[1],cor:c};}return {base:s,cor:null};}
  function variantes(c){const n=norm(c),out=[n];const m=n.match(/^([A-Z]+)(\d+)([A-Z]?)$/);if(m){const d=String(+m[2]);[d,d.padStart(3,'0'),d.padStart(4,'0'),d.padStart(5,'0')].forEach(x=>out.push(m[1]+x+m[3]));}
    if(/^T[A-Z]{2}\d/.test(n))out.push(n.slice(1));return [...new Set(out)];}
  function acha(base,desc){for(const v of variantes(base)){const r=buscar(v);if(r.length)return {g:r[0],cod:v,n:r.length};}
    const t=sa(desc).split(/\s+/)[0];if(t&&t!==sa(base)){for(const v of variantes(t)){const r=buscar(v);if(r.length)return {g:r[0],cod:v,n:r.length};}}return null;}
  let carregando=null;const lib=()=>window.XLSX?Promise.resolve():(carregando=carregando||new Promise((ok,no)=>{const s=document.createElement('script');s.src=XLSX_URL;s.onload=ok;s.onerror=()=>{carregando=null;no(new Error('xlsx'));};document.head.appendChild(s);}));
  function cab(rows){for(let i=0;i<Math.min(rows.length,30);i++){const r=rows[i].map(x=>sa(x));const ic=r.findIndex(x=>/COD|REF/.test(x)),iq=r.findIndex(x=>/TOTAL|BARRA|QTD|QUANT/.test(x)&&!/TAMANHO|COMPR|MM/.test(x));
      if(ic>=0&&iq>=0)return {i,cod:ic,qtd:iq,prod:r.findIndex(x=>/PRODUTO|DESCRI|PERFIL|NOME/.test(x)),cor:r.findIndex(x=>/^COR|ACABAMENTO|PINTURA/.test(x)),tam:r.findIndex(x=>/TAMANHO|COMPR|\(MM\)|METRO/.test(x))};}
    return null;}
  function ler(rows){rows=rows.map(r=>(r||[]).map(x=>x==null?'':String(x).trim()));let h=cab(rows),out=[];
    if(!h){/* sem cabeçalho: 1ª coluna com cara de código, depois o 1º número */
      rows.forEach((r,i)=>{const ic=r.findIndex(x=>/^[A-Za-z]{0,5}[-. ]?\d{2,5}/.test(x));if(ic<0)return;const nums=r.map((x,j)=>[j,+String(x).replace(',','.')]).filter(([j,v])=>j!==ic&&v>0&&isFinite(v));if(!nums.length)return;
        const q=nums[0][1],tm=nums.find(([,v])=>v>=1000||(v>=2&&v<=9&&v!==q));out.push({lin:i+1,raw:r[ic],prod:r.filter((x,j)=>j!==ic&&isNaN(+String(x).replace(',','.'))).join(' '),corTxt:'',q,tam:tm?tm[1]:null});});return out;}
    for(let i=h.i+1;i<rows.length;i++){const r=rows[i];const raw=r[h.cod];if(!raw)continue;const q=+String(r[h.qtd]).replace(/\./g,'').replace(',','.');if(!(q>0))continue;
      out.push({lin:i+1,raw,prod:h.prod>=0?r[h.prod]:'',corTxt:h.cor>=0?r[h.cor]:'',q,tam:h.tam>=0?+String(r[h.tam]).replace(',','.'):null});}
    return out;}
  function monta(L){return L.map(x=>{const s=separa(x.raw);const cor=corDe(x.corTxt)||s.cor||corNoTexto(x.prod)||COR;let mt=x.tam>0?(x.tam>=100?x.tam/1000:x.tam):BARRA;mt=Math.round(mt*100)/100;
      const a=acha(s.base,x.prod);return {...x,base:s.base,cor,corAb:s.cor,mt,q:Math.round(x.q),ach:a,ok:!!a,cod:a?a.cod:s.base};});}
  let IT=[],ARQ='';
  function tabela(){const ok=IT.filter(x=>x.ok).length;
    return `<div class="imp-md" role="dialog" aria-label="Importar lista"><div class="imp-h"><b>📎 Lista do cliente · ${esc(ARQ)}</b><button type="button" class="bt" data-impx>✕ Fechar</button></div>
     <p class="sub" style="margin:0">${IT.length} linhas lidas · <b style="color:var(--ok,#16a34a)">${ok} encontradas</b>${IT.length-ok?` · <b style="color:var(--md,#d97706)">${IT.length-ok} para conferir</b> (corrija o código na linha ou deixe desmarcado)`:''}. A cor vem da coluna Cor ou da abreviação no fim do código (.BCO, -PTO, -NAT…).</p>
     <div style="overflow:auto;max-height:58vh;border:1px solid #d6dee4;border-radius:10px"><table class="imp-t"><thead><tr><th></th><th>Código na lista</th><th>Produto</th><th>Achado como</th><th>Cor</th><th class="n">Barras</th><th>Barra</th></tr></thead><tbody>
     ${IT.map((x,i)=>`<tr class="${x.ok?'':'nf'}"><td><input type="checkbox" data-iu="${i}" ${x.ok&&x.use!==false?'checked':''} ${x.ok?'':'disabled'} aria-label="Usar"></td><td><b>${esc(x.raw)}</b>${x.corAb?`<br><small>cor no código: ${esc(CORN[x.corAb])}</small>`:''}</td><td><small>${esc(x.prod)}</small></td>
      <td>${x.ok?`<b>${esc(x.ach.g.k)}</b><br><small>${esc(IDX.linhas[x.ach.g.l].n)}${x.ach.g.n?' · '+esc(x.ach.g.n):''}${x.ach.n>1?' · aparece em '+x.ach.n+' linhas':''}</small>`:`<input data-ic="${i}" value="${esc(x.base)}" style="width:120px" aria-label="Corrigir código"> <small style="color:var(--md,#d97706)">não achei</small>`}</td>
      <td><select data-icor="${i}" aria-label="Cor">${CORES.map(([k,t])=>`<option value="${k}" ${x.cor===k?'selected':''}>${esc(t)}</option>`).join('')}</select></td>
      <td class="n"><input data-iq="${i}" value="${x.q}" inputmode="numeric" style="width:70px;text-align:right" aria-label="Barras"></td>
      <td><select data-im="${i}" aria-label="Tamanho">${[...new Set(MTS.concat([x.mt]))].sort((a,b)=>a-b).map(m=>`<option value="${m}" ${x.mt===m?'selected':''}>${String(m).replace('.',',')} m</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>
     <div class="acoes" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="bt p" data-impok="novo">✅ Simular com esta lista (${IT.filter(x=>x.ok&&x.use!==false).length} itens)</button><button type="button" class="bt" data-impok="soma">＋ Somar à simulação atual</button></div></div>`;}
  function abre(){let o=document.getElementById('impOv');if(!o){o=document.createElement('div');o.id='impOv';document.body.appendChild(o);}o.innerHTML=tabela();}
  const css=`#impOv{position:fixed;inset:0;z-index:80;background:rgba(10,20,28,.55);display:flex;align-items:center;justify-content:center;padding:14px}
  .imp-md{background:#fff;color:#13232e;border-radius:16px;width:min(1180px,100%);max-height:100%;overflow:auto;padding:16px 18px;display:flex;flex-direction:column;gap:10px}
  .imp-h{display:flex;align-items:center;gap:10px}.imp-h b{flex:1;font:800 22px var(--f-d,system-ui)}
  .imp-t{width:100%;border-collapse:collapse;font-size:14px}.imp-t th{position:sticky;top:0;background:#f3f6f7;text-align:left;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:7px 8px;color:#5d6b76}
  .imp-t td{padding:7px 8px;border-top:1px solid #eef1f3;vertical-align:top}.imp-t tr.nf td{background:#fff7ec}.imp-t select,.imp-t input{border:1px solid #c4ccd2;border-radius:7px;padding:4px 6px;font:600 14px var(--f-b,system-ui)}
  .imp-t small{color:#5d6b76}`;
  let stOk=false;
  async function arquivo(f){if(!stOk){const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);stOk=true;}
    ARQ=f.name;toast('Lendo a lista…');let rows=[];
    try{if(/\.(csv|txt)$/i.test(f.name)){const t=await f.text();rows=t.split(/\r?\n/).map(l=>l.split(/[;\t]/));}
      else{await lib();const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:false,defval:''});}}
    catch(_){toast('Não consegui ler este arquivo. Mande em Excel (.xlsx) ou CSV.');return;}
    IT=monta(ler(rows));if(!IT.length){toast('Não achei código e quantidade nesta planilha.');return;}abre();
    typeof registrar==='function'&&registrar('lista_importada',{linhas:IT.length,achadas:IT.filter(x=>x.ok).length});}
  document.addEventListener('click',e=>{const t=e.target;
    if(t.closest('[data-implista]')){let i=document.getElementById('impFile');if(!i){i=document.createElement('input');i.type='file';i.id='impFile';i.hidden=true;i.accept='.xlsx,.xls,.csv,.txt';document.body.appendChild(i);i.onchange=()=>{if(i.files[0])arquivo(i.files[0]);i.value='';};}i.click();return;}
    if(!document.getElementById('impOv'))return;
    if(t.closest('[data-impx]')||t.id==='impOv'){document.getElementById('impOv').remove();return;}
    const ok=t.closest('[data-impok]');if(ok){const U=IT.filter(x=>x.ok&&x.use!==false);if(!U.length){toast('Nenhum item encontrado para simular.');return;}
      if(ok.dataset.impok==='novo')SIM.length=0;U.forEach(x=>{simAdd(x.ach.g.k,x.q,x.ach.g.l+'|'+x.ach.g.k,x.cor,x.mt);const it=SIM.find(y=>norm(y.q)===norm(x.ach.g.k)&&y.cor===x.cor&&+y.m===x.mt);if(it&&!it.orig){it.orig=x.raw;ls.set(SKEY(),SIM);}});
      document.getElementById('impOv').remove();ABA='sim';tela();scrollTo(0,0);toast(U.length+' itens na simulação.'+(IT.length-U.length?' Ficaram de fora: '+(IT.length-U.length)+'.':''));}});
  document.addEventListener('change',e=>{const t=e.target;if(!t.closest||!t.closest('#impOv'))return;const d=t.dataset;
    if(d.iu!=null)IT[+d.iu].use=t.checked;
    else if(d.icor!=null)IT[+d.icor].cor=t.value;
    else if(d.iq!=null)IT[+d.iq].q=Math.max(1,parseInt(t.value)||1);
    else if(d.im!=null)IT[+d.im].mt=+t.value;
    else if(d.ic!=null){const x=IT[+d.ic];const a=acha(t.value,'');if(a){x.ach=a;x.ok=true;x.base=t.value;}else toast('Ainda não achei '+t.value.toUpperCase()+'.');abre();return;}
    abre();});
})();
