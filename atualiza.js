/* ===== Atualização automática =====
   Ao abrir a página, confere a versão publicada (versao.json, sem cache).
   Se mudou desde a última visita, baixa de novo as páginas principais e recarrega uma vez. */
(function(){
  const base=(document.currentScript&&document.currentScript.src||'').replace(/atualiza\.js.*$/,'');
  const PAGS=['index.html','painel.html','consultorias.html','empresa.html','orcamento/','orcamento/index.html','estoque-aviso.js','auth.js','sessao.js','implantacao/','esquadrias/musica.js','equivalencias/distribuidoras.html','equivalencias/pesquisa/','equivalencias/comprar.html','equivalencias/','equivalencias/index.html','equivalencias/importa-lista.js','equivalencias/foto-busca.js','orcamento/atendimentos.js','orcamento/vend-extra.js'];
  const lg=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(_){return null;}};
  fetch(base+'versao.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(async j=>{
    const v=String(j.v||'');if(!v)return;const ant=lg('fc_versao');
    if(ant===v)return;lg('fc_versao',v);if(!ant)return; // primeira visita: já está com a versão nova
    try{await Promise.all(PAGS.concat([location.pathname+location.search]).map(u=>fetch(u.startsWith('/')?u:base+u,{cache:'reload'}).catch(()=>{})));}catch(_){}
    if(!sessionStorage.getItem('fc_rec_'+v)){sessionStorage.setItem('fc_rec_'+v,'1');location.reload();}
  }).catch(()=>{});
})();
