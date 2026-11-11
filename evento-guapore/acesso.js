/* 10/11/2026 · Simulador na obra (Family Guaporé): só abre em aparelho liberado pela FC.
   1º acesso: nome + telefone -> pedido chega à FC -> FC libera. Depois abre sem internet (confere de novo quando houver sinal).
   O link do cliente final (?ver=) continua aberto. FC Consultoria em Esquadria. */
(function(){
  if(new URLSearchParams(location.search).get('ver'))return;
  var SB='https://pawwncmfadzxfahfvhry.supabase.co/rest/v1/rpc/',KEY='sb_publishable_b0kGoqo85joo3Vb8Xllxhw_VemwaLMs',K='gua_fam_ap',DIAS=30;
  var st;try{st=JSON.parse(localStorage.getItem(K))||{};}catch(_){st={};}
  if(!st.disp){st.disp=(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2));}
  function salva(){try{localStorage.setItem(K,JSON.stringify(st));}catch(_){}}salva();
  function rpc(n,b){return fetch(SB+n,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){if(!r.ok)throw 0;return r.json();});}
  var ov=document.createElement('div');ov.id='famAcesso';
  ov.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#0f2c55;color:#fff;display:flex;align-items:center;justify-content:center;padding:20px;font:15px system-ui,sans-serif';
  function tela(h){ov.innerHTML='<div style="max-width:360px;width:100%;background:#fff;color:#0f2c55;border-radius:18px;padding:22px;box-shadow:0 10px 40px rgba(0,0,0,.35)"><div style="font-weight:700;font-size:18px;margin-bottom:4px">Simulador na obra · Family</div><div style="font-size:12px;color:#1d5fa8;margin-bottom:14px">Guaporé Vidros · desenvolvido por FC Consultoria em Esquadria</div>'+h+'</div>';if(!ov.isConnected)document.documentElement.appendChild(ov);}
  function libera(){st.status='liberado';st.ok=Date.now();salva();ov.remove();}
  function trava(msg){tela('<p style="margin:0">'+msg+'</p>');}
  var poll;
  function aguardando(){tela('<p style="margin:0 0 8px">⏳ <b>Aguardando liberação da FC</b></p><p style="margin:0;font-size:13px;color:#555">Seu pedido foi enviado. Assim que a FC liberar, o simulador abre sozinho neste aparelho.</p>');
    clearInterval(poll);poll=setInterval(function(){rpc('fam_ap_status',{p_disp:st.disp}).then(function(s){if(s==='liberado'){clearInterval(poll);libera();}else if(s==='bloqueado'){clearInterval(poll);st.status='bloqueado';salva();trava('🔒 Este aparelho não tem acesso ao simulador. Fale com a FC.');}}).catch(function(){});},10000);}
  function form(erro){var i='width:100%;box-sizing:border-box;padding:11px;border:1px solid #bcd0ea;border-radius:10px;font:16px system-ui,sans-serif;margin:4px 0 10px';
    tela('<p style="margin:0 0 12px;font-size:14px">Ferramenta exclusiva da equipe da Guaporé Vidros. No primeiro acesso, informe seus dados para a FC liberar este aparelho.</p>'+(erro?'<p style="color:#b42318;font-size:13px;margin:0 0 8px">'+erro+'</p>':'')+
    '<label style="font-size:13px">Seu nome<input id="famN" style="'+i+'" value="'+(st.nome||'').replace(/"/g,'')+'"></label><label style="font-size:13px">Telefone (WhatsApp)<input id="famT" inputmode="tel" style="'+i+'" value="'+(st.tel||'').replace(/"/g,'')+'"></label><button id="famB" style="width:100%;padding:12px;border:0;border-radius:10px;background:#1d5fa8;color:#fff;font:600 15px system-ui;cursor:pointer">Pedir acesso</button>');
    document.getElementById('famB').onclick=function(){var n=document.getElementById('famN').value.trim(),t=document.getElementById('famT').value.trim();
      if(n.length<2||t.replace(/\D/g,'').length<10){form('Preencha nome e telefone com DDD.');return;}
      st.nome=n;st.tel=t;salva();this.disabled=true;this.textContent='Enviando…';
      rpc('fam_ap_pedir',{p_disp:st.disp,p_nome:n,p_tel:t}).then(function(s){if(s==='liberado')libera();else if(s==='bloqueado'){st.status='bloqueado';salva();trava('🔒 Este aparelho não tem acesso ao simulador. Fale com a FC.');}else if(s==='erro')form('Confira os dados e tente de novo.');else{st.status='pendente';salva();aguardando();}})
      .catch(function(){form('Sem internet. O primeiro acesso precisa de conexão.');});};}
  /* link mestre da FC (?fc=chave): libera este aparelho na hora, sem cadastro; a chave sai da barra de endereço */
  var ch=new URLSearchParams(location.search).get('fc');
  if(ch){
    /* iPhone: o app da Tela de Início guarda dados separados do Safari. Mantém a chave no endereço e tira o manifesto,
       assim o ícone adicionado já abre como mestre, sem cadastro */
    var ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    if(ios){document.querySelectorAll('link[rel="manifest"]').forEach(function(l){l.remove();});}
    else{try{var u=new URL(location.href);u.searchParams.delete('fc');history.replaceState(null,'',u.pathname+u.search+u.hash);}catch(_){}}
    /* chave mestre conferida no próprio aparelho: abre na hora, sem internet e sem depender do que ficou guardado */
    try{crypto.subtle.digest('SHA-256',new TextEncoder().encode(ch)).then(function(d){var x=Array.from(new Uint8Array(d)).map(function(v){return v.toString(16).padStart(2,'0');}).join('');
      if(x==='f0a060684e0bf816f70666058e16270d4659fd0ed8806749d4013b518f9edd46'){st.mestre=1;libera();rpc('fam_ap_mestre_link',{p_chave:ch,p_disp:st.disp}).catch(function(){});}
      else form('Link mestre inválido.');}).catch(function(){form('Link mestre inválido.');});
      tela('<p style="margin:0">Abrindo…</p>');return;}catch(_){}
    if(st.mestre&&st.status==='liberado'){libera();rpc('fam_ap_mestre_link',{p_chave:ch,p_disp:st.disp}).catch(function(){});return;}
    tela('<p style="margin:0">Liberando o acesso FC…</p>');
    rpc('fam_ap_mestre_link',{p_chave:ch,p_disp:st.disp}).then(function(s){if(s==='liberado'){st.mestre=1;libera();}else form('Link mestre inválido.');}).catch(function(){form('Sem internet. Abra o link mestre com conexão.');});
    return;}
  var valido=st.status==='liberado'&&st.ok&&(st.mestre||(Date.now()-st.ok)<DIAS*864e5);
  if(!valido){tela('<p style="margin:0">Conferindo o acesso…</p>');}
  rpc('fam_ap_status',{p_disp:st.disp}).then(function(s){
    if(s==='liberado'){if(!valido)libera();else{st.ok=Date.now();salva();}}
    else if(s==='pendente'){st.status='pendente';salva();aguardando();}
    else if(s==='bloqueado'){st.status='bloqueado';salva();trava('🔒 Este aparelho não tem acesso ao simulador. Fale com a FC.');}
    else{st.status='';salva();form();}
  }).catch(function(){if(!valido){if(st.status==='liberado')trava('Faz mais de '+DIAS+' dias sem conferir o acesso. Abra uma vez com internet.');else if(st.status==='pendente')aguardando();else form();}});
})();
