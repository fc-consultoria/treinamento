/* ===== FC Mostruário 3D · aviso de sem internet e registro do modo offline ===== */
(function(){
  if('serviceWorker' in navigator){addEventListener('load',()=>{navigator.serviceWorker.register('sw.js',{scope:'./'}).catch(()=>{});});}
  const bar=document.createElement('div');bar.id='offBar';bar.setAttribute('role','status');
  bar.style.cssText='position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:9800;background:#1b232a;color:#fff;font:600 14px Barlow,system-ui,sans-serif;padding:10px 16px;border-radius:12px;box-shadow:0 10px 28px rgba(0,0,0,.3);max-width:calc(100% - 24px);text-align:center;display:none';
  bar.textContent='📴 Sem internet: você está usando a última versão guardada. O que fizer agora será enviado quando a internet voltar.';
  const mostra=()=>{if(!document.body)return;if(!bar.parentNode)document.body.appendChild(bar);bar.style.display=navigator.onLine?'none':'block';};
  addEventListener('offline',mostra);addEventListener('online',()=>{mostra();try{navigator.serviceWorker&&navigator.serviceWorker.controller&&navigator.serviceWorker.controller.postMessage('fc-enviar');}catch(_){}
    bar.textContent='✅ Internet de volta: enviando o que ficou guardado.';bar.style.display='block';setTimeout(()=>{bar.style.display='none';bar.textContent='📴 Sem internet: você está usando a última versão guardada. O que fizer agora será enviado quando a internet voltar.';},4000);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mostra);else mostra();
})();
