/* ===== FC Mostruário 3D · funcionamento sem internet =====
   Regra de ouro: COM internet tudo funciona igual a antes (sempre busca na rede primeiro).
   SEM internet: mostra a última versão guardada das telas e dos dados, e guarda os registros
   (tempo de estudo, opiniões, desafios) para enviar sozinho quando a internet voltar. */
const V='fc-orient-v10';
const CORE=['./','index.html','auth.js','indica.js?v=1','monte-casa-entrada.js?v=4','conversa-equipe.js?v=10','esquadrias/musica.json','offline.js?v=1','ubar-menu.js?v=2','manifest.webmanifest',
  'esquadrias/monte-casa.html?v=6','catalogo3d.html','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'];
const SB='cpkjphodruyxfouirhpd.supabase.co';
const CDN=/^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
const MAXDADOS=7*864e5; // dados guardados valem até 7 dias sem internet

self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('fc-orient-')&&k!==V&&!k.endsWith('-dados')&&k!=='fc-orient-meta').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});

function usuario(req){try{const a=req.headers.get('authorization')||'';const p=a.split(' ')[1].split('.')[1];return JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/'))).sub||'anon';}catch(_){return 'anon';}}
async function guarda(cache,key,res){try{const h=new Headers(res.headers);h.set('x-fc-em',String(Date.now()));const b=await res.clone().blob();await cache.put(key,new Response(b,{status:res.status,statusText:res.statusText,headers:h}));}catch(_){}}

/* ---- fila de registros feitos sem internet (IndexedDB) ---- */
const idb=()=>new Promise((ok,er)=>{const r=indexedDB.open('fc-fila',1);r.onupgradeneeded=()=>r.result.createObjectStore('q',{autoIncrement:true});r.onsuccess=()=>ok(r.result);r.onerror=()=>er(r.error);});
async function enfileira(req){const db=await idb();const body=await req.clone().text();const hs={};req.headers.forEach((v,k)=>{hs[k]=v;});
  await new Promise(ok=>{const t=db.transaction('q','readwrite');t.objectStore('q').add({url:req.url,metodo:req.method,body,hs,em:Date.now()});t.oncomplete=ok;t.onerror=ok;});}
let enviando=false;
let TOKEN=null;
async function esvazia(){if(enviando)return;enviando=true;try{const db=await idb();
  const itens=await new Promise(ok=>{const out=[];const t=db.transaction('q','readonly');t.objectStore('q').openCursor().onsuccess=e=>{const c=e.target.result;if(c){out.push([c.key,c.value]);c.continue();}else ok(out);};});
  for(const [k,it] of itens){let ok=false;try{const hs=Object.assign({},it.hs);if(TOKEN)hs.authorization='Bearer '+TOKEN;
    const r=await fetch(it.url,{method:it.metodo||'POST',headers:hs,body:(it.metodo==='DELETE'?undefined:it.body)});
    if(r.status===401||r.status===403)break; /* login vencido: guarda e tenta de novo quando o login renovar */
    ok=r.ok||(r.status>=400&&r.status<500);}catch(_){break;}
    if(ok)await new Promise(res=>{const t=db.transaction('q','readwrite');t.objectStore('q').delete(k);t.oncomplete=res;t.onerror=res;});}}
  catch(_){}enviando=false;}
/* último usuário logado neste aparelho: usado só sem internet, quando o login venceu e a chamada sai sem usuário */
async function ultimoUsuario(){try{const c=await caches.open('fc-orient-meta');const r=await c.match('/__fc_usuario');return r?await r.text():null;}catch(_){return null;}}
self.addEventListener('message',e=>{const d=e.data;
  if(d==='fc-enviar'){esvazia();return;}
  if(!d||typeof d!=='object')return;
  if(d.tipo==='fc-enviar'){if(d.token)TOKEN=d.token;esvazia();return;}
  if(d.tipo==='fc-usuario'&&d.id){if(d.token)TOKEN=d.token;e.waitUntil(caches.open('fc-orient-meta').then(c=>c.put('/__fc_usuario',new Response(String(d.id)))));return;}
  if(d.tipo==='fc-baixar-matriz')e.waitUntil(baixarMatriz());
});
/* Painel da Matriz: guardar todas as telas e arquivos para usar sem internet */
async function baixarMatriz(){
  const avisa=m=>self.clients.matchAll({includeUncontrolled:true}).then(cs=>cs.forEach(c=>c.postMessage(m)));
  try{const c=await caches.open(V);
    const l=await fetch('offline-matriz.json',{cache:'reload'}).then(r=>r.json());
    const todos=l.arquivos.concat(l.cdn||[]);let i=0,feitos=0,falhas=0;
    const trab=async()=>{while(i<todos.length){const u=todos[i++];
      try{const r=await fetch(new Request(u,{cache:'reload'}));if(r.ok||r.type==='opaque')await c.put(u,r);else falhas++;}catch(_){falhas++;}
      feitos++;if(feitos%10===0||feitos===todos.length)avisa({tipo:'fc-baixa-prog',feitos,total:todos.length});}};
    await Promise.all([trab(),trab(),trab(),trab(),trab(),trab()]);
    avisa({tipo:'fc-baixa-ok',total:todos.length,falhas,em:Date.now()});
  }catch(err){avisa({tipo:'fc-baixa-erro'});}
}

self.addEventListener('fetch',e=>{const req=e.request,url=new URL(req.url);
  // Supabase: registros (POST em trein_eventos) — sem internet, entram na fila
  if(url.host===SB){
    if(req.method==='POST'&&url.pathname==='/rest/v1/trein_eventos'){e.respondWith(fetch(req.clone()).then(r=>{esvazia();return r;}).catch(async()=>{await enfileira(req);return new Response('',{status:201});}));return;}
    if(['POST','PATCH','DELETE'].includes(req.method)&&url.pathname.startsWith('/rest/v1/')&&!url.pathname.startsWith('/rest/v1/rpc/')){
      const copia=req.clone();
      e.respondWith(fetch(req).then(r=>{esvazia();return r;}).catch(async()=>{await enfileira(copia);
        return new Response(req.method==='POST'?'[]':'',{status:req.method==='POST'?201:204,headers:{'Content-Type':'application/json','x-fc-fila':'1'}});}));return;}
    if(req.method==='GET'&&url.pathname.startsWith('/rest/v1/')){const key=req.url+(req.url.includes('?')?'&':'?')+'__u='+usuario(req);
      e.respondWith(caches.open(V+'-dados').then(async c=>{try{const r=await fetch(req);if(r.ok)guarda(c,key,r);esvazia();return r;}
        catch(err){let m=await c.match(key);
          if(!m&&usuario(req)==='anon'){const u=await ultimoUsuario();if(u)m=await c.match(req.url+(req.url.includes('?')?'&':'?')+'__u='+u);}
          if(m&&Date.now()-(+m.headers.get('x-fc-em')||0)<MAXDADOS)return m;throw err;}}));return;}
    return; // login e demais chamadas: sempre pela rede
  }
  if(req.method!=='GET')return;
  // bibliotecas e fontes (versões fixas): usa a guardada primeiro
  if(CDN.test(req.url)){e.respondWith(caches.open(V).then(async c=>{const m=await c.match(req);if(m)return m;const r=await fetch(req);if(r.ok||r.type==='opaque')c.put(req,r.clone());return r;}));return;}
  // páginas e arquivos do Mostruário: rede primeiro; sem internet, a última versão guardada
  if(url.origin===self.location.origin&&url.pathname.startsWith('/treinamento/')){
    e.respondWith(caches.open(V).then(async c=>{try{const r=await fetch(req);if(r.ok)c.put(req,r.clone());return r;}
      catch(err){const m=await c.match(req)||await c.match(req,{ignoreSearch:true})||(req.mode==='navigate'&&/\/treinamento\/(index\.html)?$/.test(url.pathname)?await c.match('index.html'):null);if(m)return m;throw err;}}));}
});
