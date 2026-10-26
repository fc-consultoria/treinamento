/* Botão "← Voltar ao painel do cliente" nas telas abertas em nova aba a partir do painel (parâmetro volta=) */
(function(){
  try{
    var v=new URLSearchParams(location.search).get('volta');
    if(!v||v.indexOf('/treinamento/')!==0||window.self!==window.top) return;
    var a=document.createElement('a'); a.href=v; a.textContent='← Voltar ao painel do cliente';
    a.setAttribute('style','position:fixed;left:14px;bottom:14px;z-index:99999;background:#0d6b68;color:#fff;font:600 14px system-ui,sans-serif;padding:10px 16px;border-radius:999px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.25)');
    var por=function(){ document.body.appendChild(a); };
    document.body?por():document.addEventListener('DOMContentLoaded',por);
  }catch(e){}
})();
