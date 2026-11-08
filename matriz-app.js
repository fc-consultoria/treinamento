/* ===== Painel da Matriz · app no notebook e uso sem internet (08/11/2026) =====
   - Botão "📥 Sem internet" no topo: instala o Painel como app e guarda todas as telas no aparelho.
   - Com internet, renova a cópia guardada sozinho uma vez por dia (em segundo plano).
   - Os dados de cada card ficam guardados quando o card é aberto com internet (valem 7 dias).
   - O que for gravado sem internet sobe sozinho quando a internet voltar.
   © FC Consultoria em Esquadria · uso exclusivo */
(function(){
  if(!('serviceWorker' in navigator))return;
  const LS={g:k=>{try{return localStorage.getItem(k)}catch(_){return null}},s:(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}}};
  const K='fc-matriz-off-em';
  const app=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  let pedido=null,btn=null,cx=null,rodando=false;

  const css=document.createElement('style');
  css.textContent=`#mxOffCx{position:fixed;top:70px;right:16px;z-index:9700;width:min(380px,calc(100% - 32px));background:#1b232a;color:#e9eef1;border:1px solid #33424d;border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.4);padding:16px;font:500 14px/1.45 Barlow,system-ui,sans-serif}
#mxOffCx h4{margin:0 0 6px;font-size:17px}#mxOffCx p{margin:6px 0;color:#b8c6cf}#mxOffCx .st{background:#0f1418;border-radius:10px;padding:9px 11px;margin:10px 0}
#mxOffCx .st b{color:#7fe3a4}#mxOffCx .st b.nao{color:#f2a024}#mxOffCx .bt{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
#mxOffCx .bt button{flex:1 1 auto;border:0;border-radius:9px;padding:10px 12px;font:700 14px Barlow,system-ui,sans-serif;cursor:pointer;background:#1f8a96;color:#fff}
#mxOffCx .bt button.or{background:#f2a024;color:#1d1400}#mxOffCx .bt button:disabled{opacity:.6;cursor:default}
#mxOffCx .x{position:absolute;top:8px;right:10px;background:none;border:0;color:#8aa0ad;font-size:20px;cursor:pointer}
#mxOffCx .bar{height:6px;border-radius:9px;background:#0f1418;overflow:hidden;margin-top:8px}#mxOffCx .bar i{display:block;height:100%;width:0;background:#f2a024;transition:width .2s}`;
  document.head.appendChild(css);

  const quando=t=>{const d=new Date(+t);return d.toLocaleDateString('pt-BR')+' às '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});};
  async function temCopia(){try{return !!(await caches.match('painel.html',{ignoreSearch:true}));}catch(_){return false;}}

  async function status(){
    if(!cx)return;const em=LS.g(K),ok=em&&await temCopia();
    cx.querySelector('.st').innerHTML=(ok?'✓ <b>Guardado neste aparelho</b><br><small>Última cópia: '+quando(em)+'</small>':'<b class="nao">Ainda não guardado neste aparelho</b>')
      +'<br><small>'+(navigator.onLine?'🟢 Com internet':'📴 Sem internet: usando a cópia guardada')+'</small>';
    const bi=cx.querySelector('[data-i]');
    if(app){bi.textContent='✓ Já está instalado';bi.disabled=true;}
    else{bi.disabled=false;bi.textContent='💻 Instalar no notebook';}
  }

  function abrir(){
    if(cx){cx.remove();cx=null;return;}
    cx=document.createElement('div');cx.id='mxOffCx';cx.setAttribute('role','dialog');
    cx.innerHTML='<button class="x" aria-label="Fechar">×</button><h4>📥 Usar sem internet</h4>'
      +'<p>Instale o Painel da Matriz como app e guarde as telas neste notebook. Assim ele abre no avião, no carro ou sem sinal.</p>'
      +'<div class="st"></div><div class="bar" hidden><i></i></div>'
      +'<div class="bt"><button type="button" data-i>💻 Instalar no notebook</button><button type="button" class="or" data-g>📥 Guardar agora</button></div>'
      +'<p><small>Os dados de cada card ficam guardados quando você abre o card com internet e valem por 7 dias. O que você gravar sem internet sobe sozinho quando a internet voltar. Com internet, a cópia é renovada sozinha uma vez por dia.</small></p>';
    document.body.appendChild(cx);
    cx.querySelector('.x').onclick=()=>{cx.remove();cx=null;};
    cx.querySelector('[data-g]').onclick=()=>baixar(true);
    cx.querySelector('[data-i]').onclick=()=>{
      if(pedido){pedido.prompt();pedido.userChoice.then(()=>{pedido=null;status();});return;}
      alert('Na barra de endereço do Chrome ou do Edge, clique no ícone de instalar (computador com seta, no canto direito) ou abra o menu ⋮ e escolha "Instalar Painel da Matriz" / "Aplicativos → Instalar esta página como app".');
    };
    status();
  }

  function baixar(manual){
    if(rodando)return;if(!navigator.onLine){if(manual)alert('Sem internet agora. Conecte para guardar a cópia.');return;}
    rodando=true;
    if(cx){const b=cx.querySelector('[data-g]');b.disabled=true;b.textContent='Guardando…';cx.querySelector('.bar').hidden=false;}
    navigator.serviceWorker.ready.then(r=>{(r.active||navigator.serviceWorker.controller).postMessage({tipo:'fc-baixar-matriz'});}).catch(()=>{rodando=false;});
  }

  navigator.serviceWorker.addEventListener('message',e=>{const d=e.data||{};
    if(d.tipo==='fc-baixa-prog'&&cx){cx.querySelector('.bar').hidden=false;cx.querySelector('.bar i').style.width=Math.round(d.feitos*100/d.total)+'%';cx.querySelector('[data-g]').textContent='Guardando… '+Math.round(d.feitos*100/d.total)+'%';}
    if(d.tipo==='fc-baixa-ok'||d.tipo==='fc-baixa-erro'){rodando=false;if(d.tipo==='fc-baixa-ok')LS.s(K,String(d.em||Date.now()));
      if(cx){const b=cx.querySelector('[data-g]');b.disabled=false;b.textContent='📥 Guardar agora';cx.querySelector('.bar').hidden=true;status();}
      if(btn)btn.textContent=d.tipo==='fc-baixa-ok'?'💻 App sem internet ✓':'💻 App sem internet';}
  });

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();pedido=e;if(cx)status();});
  window.addEventListener('appinstalled',()=>{pedido=null;baixar(false);});

  /* envia o login atual ao guardião offline (para reenviar o que ficou guardado com o login renovado) */
  async function token(){try{if(typeof sb==='undefined')return;const {data:{session}}=await sb.auth.getSession();const c=navigator.serviceWorker.controller;
    if(session&&c&&navigator.onLine)c.postMessage({tipo:'fc-enviar',token:session.access_token});}catch(_){}}
  window.addEventListener('online',()=>{setTimeout(token,2500);if(cx)status();});
  window.addEventListener('offline',()=>{if(cx)status();});

  function poeBotao(){
    const acts=document.querySelector('header .acts');if(!acts){setTimeout(poeBotao,800);return;}
    btn=document.createElement('button');btn.type='button';btn.id='bOff';btn.title='Instalar o Painel no notebook e usar sem internet';
    btn.textContent=LS.g(K)?'💻 App sem internet ✓':'💻 App sem internet';btn.onclick=abrir;
    acts.insertBefore(btn,acts.firstChild);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',poeBotao);else poeBotao();

  /* renovação automática: com internet, se nunca guardou, se a cópia sumiu ou se passou de 1 dia */
  navigator.serviceWorker.ready.then(async()=>{
    setTimeout(token,4000);
    const em=+LS.g(K)||0,existe=await temCopia();
    if(navigator.onLine&&(em||app)&&(!existe||!em||Date.now()-em>864e5))setTimeout(()=>baixar(false),8000);
  });
})();
