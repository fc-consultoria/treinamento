/* 10/11/2026 · Botão "Instalar app" do Simulador na obra (Android/computador: instala direto; iPhone: mostra o passo a passo) */
(function(){
  var standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;if(standalone)return;
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),ev=null;
  var b=document.createElement('button');b.type='button';b.textContent='📲 Instalar app';b.hidden=true;
  b.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:2147482000;background:#e65c00;color:#fff;border:0;border-radius:99px;padding:12px 20px;font:700 15px system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.35);cursor:pointer';
  function mostra(){if(!b.isConnected)document.body.appendChild(b);b.hidden=false;}
  addEventListener('beforeinstallprompt',function(e){e.preventDefault();ev=e;mostra();});
  addEventListener('appinstalled',function(){b.remove();});
  b.onclick=function(){
    if(ev){ev.prompt();ev.userChoice.then(function(){ev=null;b.remove();});return;}
    var m=document.createElement('div');m.style.cssText='position:fixed;inset:0;z-index:2147482500;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center';
    m.innerHTML='<div style="background:#fff;color:#1e293b;border-radius:18px 18px 0 0;padding:20px 20px calc(20px + env(safe-area-inset-bottom,0px));max-width:480px;width:100%;font:15px/1.5 system-ui,sans-serif"><b style="font-size:17px">Instalar no iPhone / iPad</b><ol style="padding-left:22px;margin:10px 0;list-style:decimal"><li>Abra este link no <b>Safari</b></li><li>Toque em <b>Compartilhar</b> (quadrado com a seta para cima)</li><li>Toque em <b>Adicionar à Tela de Início</b></li><li>Toque em <b>Adicionar</b></li></ol><p style="margin:0 0 12px;color:#64748b;font-size:13px">O ícone <b>Simulador CDE</b> aparece na tela e abre sem internet.</p><button type="button" style="width:100%;padding:12px;border:0;border-radius:10px;background:#e65c00;color:#fff;font:700 15px system-ui">Entendi</button></div>';
    m.onclick=function(e){if(e.target===m||e.target.tagName==='BUTTON')m.remove();};document.body.appendChild(m);};
  if(ios)addEventListener('load',mostra);
})();
