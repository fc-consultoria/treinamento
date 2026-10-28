/* ===== Aviso de cadastros da equipe aguardando liberação (Painel da Matriz) =====
   Quem se cadastra pelo link de primeiro acesso (cadastro.html?e=<empresa>) fica pendente até a FC liberar.
   Uso: FCAutocadAviso.matriz() no painel da matriz. */
(function(){
  const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const dt=t=>new Date(t).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  function caixa(html){let b=document.getElementById('autocadAv');if(!html){if(b)b.remove();return;}
    if(!b){b=document.createElement('div');b.id='autocadAv';b.style.cssText='position:relative;z-index:60;margin:12px auto;max-width:1180px;width:calc(100% - 24px);background:#eef5ff;color:#0f2c4f;border:2px solid #1d5fa8;border-radius:14px;padding:14px 16px;font:400 15px/1.5 system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.12)';document.body.insertBefore(b,document.body.firstChild);}
    b.innerHTML=html;}
  window.FCAutocadAviso={
    async matriz(){const s=(typeof sb!=='undefined'&&sb)||window.sb;if(!s)return;
      const run=async()=>{try{const r=await s.rpc('emp_pendentes_todos');if(r.error)return;const L=r.data||[];
        if(!L.length){caixa('');return;}
        const G={};L.forEach(x=>{(G[x.emp]=G[x.emp]||{nome:x.emp_nome||x.emp,l:[]}).l.push(x);});
        caixa(`<b style="font-size:17px">🕓 Cadastro${L.length>1?'s':''} da equipe aguardando sua liberação · ${L.length}</b>
          ${Object.entries(G).map(([e,g])=>`<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px;padding-top:8px;border-top:1px dashed #9cbbe0">
            <div style="flex:1;min-width:220px"><b>${esc(g.nome)}</b><div style="font-size:13.5px">${g.l.map(x=>`${esc(x.nome)} · ${esc(x.telefone||'')} · ${dt(x.em)}`).join('<br>')}</div></div>
            <a href="consultorias.html?ver=${encodeURIComponent(e)}&abrir=acessos" style="background:#1d5fa8;color:#fff;font-weight:700;padding:9px 14px;border-radius:9px;text-decoration:none">Liberar →</a></div>`).join('')}`);
      }catch(_){}};
      await run();setInterval(run,60e3);}
  };
})();
