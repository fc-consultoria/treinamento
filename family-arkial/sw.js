/* Linha Family 32 · modelo de licença — app sem internet (Desenvolvido por FC Consultoria em Esquadria)
   Guarda tudo no aparelho na primeira abertura. Sem internet ou com dados móveis fracos,
   abre direto do aparelho. Com internet, atualiza em segundo plano para a próxima abertura.
   O nome do cache sai do nome da pasta (family-arkial -> "family-arkial-v1"): cada licenciado,
   na sua pasta, tem o próprio cache e não apaga o dos outros. */
const PASTA=(new URL(self.registration.scope).pathname.split('/').filter(Boolean).pop()||'family-app');
const V=PASTA+'-v1';
const ARQ=['./','index.html','simulador.html','marca.js','acesso.js','instalar.js','manifest-simulador.webmanifest','manifest.webmanifest','fonts.css','tw.css','lib/three.min.js','lib/OrbitControls.js','lib/qrcode.js',
 'icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-180.png',
 'fonts/inter-latin-400-normal.woff2','fonts/inter-latin-500-normal.woff2','fonts/inter-latin-600-normal.woff2','fonts/inter-latin-700-normal.woff2','fonts/inter-latin-800-normal.woff2',
 'fonts/outfit-latin-300-normal.woff2','fonts/outfit-latin-500-normal.woff2','fonts/outfit-latin-700-normal.woff2'];
const MEU=new RegExp('^'+PASTA.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'-v\\d+$');
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(ARQ.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>MEU.test(k)&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
/* páginas e scripts vêm primeiro da internet (sempre a versão nova); sem sinal, abre o que está guardado no aparelho */
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(!u.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  const chave=new Request(u.origin+u.pathname);
  const codigo=r.mode==='navigate'||/\.(html|js|webmanifest)$/.test(u.pathname)||u.pathname.endsWith('/');
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(chave,{ignoreSearch:true});
    const rede=fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.ok)c.put(chave,res.clone());return res;}).catch(()=>null);
    if(codigo){const res=await Promise.race([rede,new Promise(ok=>setTimeout(()=>ok(null),hit?4000:15000))]);if(res)return res;if(hit)return hit;
      if(r.mode==='navigate')return (await c.match('index.html'))||Response.error();return Response.error();}
    if(hit){e.waitUntil(rede);return hit;}
    const res=await rede;if(res)return res;return Response.error();}));});
self.addEventListener('message',e=>{if(e.data==='pular')self.skipWaiting();});
