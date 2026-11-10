/* 10/11/2026 · Painel da Matriz: avisa quando alguém pede acesso ao Simulador na obra (Family CDE) */
(function(){
  var U='https://pawwncmfadzxfahfvhry.supabase.co/rest/v1/rpc/fam_ap_pendentes',K='sb_publishable_b0kGoqo85joo3Vb8Xllxhw_VemwaLMs',ult=0;
  function bip(){try{var c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.value=.08;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.25);}catch(_){}}
  function aviso(n){var a=document.getElementById('famAviso');
    if(!n){if(a)a.remove();return;}
    if(!a){a=document.createElement('a');a.id='famAviso';a.href='aparelhos-family.html';
      a.style.cssText='position:fixed;right:16px;bottom:16px;z-index:99999;background:#8a4f2f;color:#fff;padding:12px 16px;border-radius:14px;font:600 14px system-ui;text-decoration:none;box-shadow:0 6px 24px rgba(0,0,0,.25)';document.body.appendChild(a);}
    a.textContent='📱 '+n+' pedido'+(n>1?'s':'')+' de acesso ao Simulador Family · Liberar →';
    document.querySelectorAll('[data-pv="famap"] b').forEach(function(b){b.textContent='Aparelhos · Simulador Family ('+n+' aguardando)';});}
  function ver(){fetch(U,{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:'{}'}).then(function(r){return r.json();}).then(function(n){n=+n||0;if(n>ult)bip();ult=n;aviso(n);}).catch(function(){});}
  ver();setInterval(ver,30000);
})();
