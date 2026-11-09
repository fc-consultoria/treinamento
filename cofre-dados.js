/* FC · Cofre de dados (09/11/2026) — © FC Consultoria em Esquadria
   Os .json de equivalencias/ e estudo-mercado/ ficam cifrados (.json.enc). Este script intercepta o fetch desses
   arquivos, pede a chave ao banco (fc_dados_chave) com o acesso que o navegador já tem e entrega o JSON aberto.
   Sem acesso: responde 403 {sem_chave:true}. Carregar ANTES de qualquer outro script da página. */
(()=>{if(window.FCDados)return;
const SB='https://cpkjphodruyxfouirhpd.supabase.co',SBK='sb_publishable_d0HEeWsaqOeZIQKGftlF-Q_B8BUOWWg';
const RX=/\/treinamento\/(equivalencias|estudo-mercado)\/.+\.json$/;const WA='5566999867984';
const of=window.fetch.bind(window);
const lg=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
function creds(){const q=new URLSearchParams(location.search),ch=[],tk=[],add=(a,v)=>{if(v&&!a.includes(v))a.push(v)};
  add(ch,q.get('k'));try{const u=lg('fc_painel_cli');if(u)add(ch,new URL(u).searchParams.get('k'))}catch(_){}
  add(tk,q.get('et'));try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('emp-tok-'))add(tk,localStorage.getItem(k))}}catch(_){}
  let em={};try{em=(window.FCDadosEm&&window.FCDadosEm())||{}}catch(_){}
  let jwt=null;try{const r=lg('trein-fc-auth');jwt=r&&JSON.parse(r).access_token}catch(_){}
  return {jwt,body:{p_ext:em.ext||null,p_dev:em.dev||null,p_chaves:ch.slice(0,10),p_toks:tk.slice(0,10)}}}
async function pedir(){const c=creds();
  const call=async j=>{const h={apikey:SBK,'Content-Type':'application/json'};if(j)h.Authorization='Bearer '+j;
    const r=await of(SB+'/rest/v1/rpc/fc_dados_chave',{method:'POST',headers:h,body:JSON.stringify(c.body),cache:'no-store'});if(!r.ok)throw new Error(r.status);return r.json()};
  let k=null,ok=false;if(c.jwt){try{k=await call(c.jwt);ok=true}catch(_){}}
  if(!ok)k=await call(null).catch(()=>null);
  if(!k)throw new Error('sem_chave');
  return crypto.subtle.importKey('raw',Uint8Array.from(atob(k),x=>x.charCodeAt(0)),'AES-GCM',false,['decrypt'])}
let kp=null;function chave(){if(!kp){kp=pedir();kp.catch(()=>{kp=null})}return kp}
let avisou=false;
function aviso(){if(avisou||window.FCDadosSemAviso)return;avisou=true;const mostra=()=>{const d=document.createElement('div');
  d.setAttribute('role','alert');d.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;background:#13232e;color:#fff;padding:14px 16px;border-radius:12px;font:15px/1.4 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3);display:flex;gap:12px;align-items:center;flex-wrap:wrap';
  d.innerHTML='<span style="flex:1;min-width:220px">Esta base é exclusiva para clientes da FC Consultoria em Esquadria. Entre com o seu acesso ou fale com a FC.</span><a href="https://wa.me/'+WA+'" target="_blank" rel="noopener" style="background:#1f9d55;color:#fff;text-decoration:none;font-weight:700;padding:10px 14px;border-radius:9px">Falar com a FC</a>';
  document.body.appendChild(d)};document.body?mostra():addEventListener('DOMContentLoaded',mostra)}
const semChave=()=>{aviso();return new Response('{"sem_chave":true}',{status:403,headers:{'Content-Type':'application/json'}})};
async function abre(u,init){let key;try{key=await chave()}catch(_){return semChave()}
  const r=await of(u.origin+u.pathname+'.enc'+u.search,init);if(!r.ok)return r;
  const b=new Uint8Array(await r.arrayBuffer());
  const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12)},key,b.slice(12));
  const t=await new Response(new Blob([p]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  return new Response(t,{status:200,headers:{'Content-Type':'application/json'}})}
window.fetch=function(input,init){try{const s=typeof input==='string'?input:(input instanceof URL?input.href:input&&input.url);
  const u=new URL(s,location.href);if(u.origin===location.origin&&RX.test(u.pathname))return abre(u,init)}catch(_){}
  return of(input,init)};
window.FCDados={chave,zera:()=>{kp=null}};
})();
