/* Códigos da CDA ao lado dos códigos de mercado (só para clientes que usam CDA, ex.: Casa Bandeirante).
   Liga com ?cda=1 na URL (fica ligado na sessão). Fonte: planilha do cliente (Cod. Sistema CEM) + equivalências FC. */
(function(){
  let on=false;try{const q=new URLSearchParams(location.search);if(q.get('cda')==='1')sessionStorage.setItem('fc_cda','1');if(q.get('cda')==='0')sessionStorage.removeItem('fc_cda');on=sessionStorage.getItem('fc_cda')==='1';}catch(_){}
  window.FC_CDA=on;
  if(!on){let fc=false;try{fc=localStorage.getItem('fc_eu')==='1';}catch(_){}
    if(fc&&window.top===window.self&&/\/esquadrias\//.test(location.pathname)){const pb=()=>{const b=document.createElement('button');b.type='button';b.textContent='Ligar códigos CDA';b.title='Mostrar os códigos da CDA ao lado dos códigos de mercado (Casa Bandeirante)';b.style.cssText='position:fixed;right:10px;bottom:10px;z-index:99999;background:#fff;color:#b45309;border:1.5px solid #f5c48a;border-radius:99px;padding:6px 12px;font:700 12px system-ui;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,.15)';b.onclick=()=>{const u=new URL(location.href);u.searchParams.set('cda','1');location.href=u.toString();};document.body.appendChild(b);};if(document.body)pb();else document.addEventListener('DOMContentLoaded',pb);}
    return;}
  const M={"SU-001":["E-566"],"SU-002":["E-565"],"SU-003":["E-567"],"SU-010":["E-571"],"SU-011":["E-572"],"SU-013":["E-573"],"SU-053":["Y-829"],"SU-079":["Y-779"],"SU-102":["U-1230"],"SU-103":["U-1231"],"SU-121":["E-645"],"SU-122":["E-646"],"SU-123":["E-647"],"SU-186":["CX-308"],"SU-228":["CX-320"],"SU-230":["ALG-23026"],"SU-279":["CX-318"],"SU-291":["ALG-29126"],"SU-039":["A-282"],"SU-040":["P-630"],"SU-041":["P-629"],"SU-044":["B-077"],"SU-049":["B-052"],"SU-055":["A-285"],"SU-056":["A-273"],"SU-060":["B-078"],"SU-061":["ALG-06126"],"SU-080":["P-639"],"SU-081":["P-637"],"SU-086":["P-640"],"SU-090":["ALG-09026"],"SU-091":["ALG-09126"],"SU-225":["A-283"],"SU-226":["ALG-22626"],"SU-004":["Y-777"],"SU-007":["Y-776"],"SU-188":["ALG-18826"],"SU-227":["P-633"],"SU-005":["P-634"],"SU-271":["ALG-27126"],"SU-200":["ALG-20026"],"SU-241":["CX-3090"],"SU-292":["ALG-29226"],"SU-082":["P-638"],"SU-006":["CX-3036"],"SU-107":["U-1264"],"SU-009":["P-636"],"SU-276":["L-794"]};
  const RX=/\b(SU)-?(\d{3})\b/g,SKIP=/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|SELECT|CANVAS|SVG|TITLE)$/;
  const st=document.createElement('style');st.textContent='.cdaX{display:inline-block;margin-left:5px;padding:0 6px;border-radius:6px;background:#fff1e0;color:#b45309;border:1px solid #f5c48a;font-weight:800;font-size:.86em;line-height:1.35;white-space:nowrap;vertical-align:baseline}.cdaX::before{content:"CDA ";font-weight:600;opacity:.75}#cdaChip{position:fixed;right:10px;bottom:10px;z-index:99999;background:#b45309;color:#fff;border:0;border-radius:99px;padding:6px 12px;font:700 12px system-ui;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,.25)}';
  (document.head||document.documentElement).appendChild(st);
  function deco(n){const t=n.nodeValue;if(!t||t.length>400)return;RX.lastIndex=0;if(!RX.test(t))return;RX.lastIndex=0;
    const p=n.parentNode;if(!p||p.closest&&p.closest('.cdaW,.cdaX,[contenteditable],#cdaChip'))return;if(SKIP.test(p.nodeName.toUpperCase()))return;
    const f=document.createDocumentFragment();let i=0,m,hit=false;
    while((m=RX.exec(t))){const k=m[1]+'-'+m[2],v=M[k];if(!v)continue;hit=true;f.appendChild(document.createTextNode(t.slice(i,m.index)));
      const w=document.createElement('span');w.className='cdaW';w.textContent=m[0];const x=document.createElement('span');x.className='cdaX';x.textContent=v.join(' / ');w.appendChild(x);f.appendChild(w);i=m.index+m[0].length;}
    if(!hit)return;f.appendChild(document.createTextNode(t.slice(i)));p.replaceChild(f,n);}
  function varre(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);const L=[];let n;while((n=w.nextNode()))L.push(n);L.forEach(deco);}
  let fila=new Set(),ag=false;
  function agenda(r){fila.add(r);if(ag)return;ag=true;requestAnimationFrame(()=>{ag=false;const F=[...fila];fila.clear();F.forEach(x=>{if(x.nodeType===3)deco(x);else if(x.isConnected)varre(x);});});}
  function inicia(){varre(document.body);new MutationObserver(ms=>ms.forEach(m=>{if(m.type==='characterData')agenda(m.target);else m.addedNodes.forEach(n=>{if(n.nodeType===1&&n.classList&&(n.classList.contains('cdaW')||n.classList.contains('cdaX')))return;agenda(n);});})).observe(document.body,{childList:true,subtree:true,characterData:true});
    if(window.top===window.self){const b=document.createElement('button');b.id='cdaChip';b.type='button';b.textContent='Códigos CDA: ligado ✕';b.title='Desligar os códigos da CDA';b.onclick=()=>{try{sessionStorage.removeItem('fc_cda');}catch(_){}const u=new URL(location.href);u.searchParams.set('cda','0');location.href=u.toString();};document.body.appendChild(b);}}
  if(document.body)inicia();else document.addEventListener('DOMContentLoaded',inicia);
})();
