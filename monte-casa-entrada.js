/* ===== Monte sua Casa 3D dentro do Mostruário =====
   Botão na barra do aluno abre o jogo em tela cheia; a opinião enviada lá dentro é gravada com o nome do aluno. */
(function(){
  const st=document.createElement('style');st.textContent=`#mcBtn{background:#e3a33b!important;border-color:#e3a33b!important;color:#1b1205!important}
  #mcMd{position:fixed;inset:0;z-index:9400;background:#0f1418;display:flex;flex-direction:column}#mcMd[hidden]{display:none}
  #mcMd .h{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#0f1418;color:#fff;font:700 15px Barlow,system-ui,sans-serif}
  #mcMd .h span{flex:1}#mcMd .h button{all:unset;cursor:pointer;padding:7px 13px;border-radius:9px;border:1px solid rgba(255,255,255,.35);font:600 14px Barlow,system-ui,sans-serif}
  #mcMd iframe{flex:1;border:0;width:100%;background:#cfdbe6}`;document.head.appendChild(st);
  function abrir(){let m=document.getElementById('mcMd');if(!m){m=document.createElement('div');m.id='mcMd';m.setAttribute('role','dialog');m.setAttribute('aria-label','Monte sua Casa 3D');
      m.innerHTML='<div class="h"><span>🏙 Monte sua Casa 3D</span><button type="button" id="mcFs">⤢ Tela cheia</button><button type="button" id="mcX">✕ Voltar ao Mostruário</button></div><iframe title="Monte sua Casa 3D" allow="fullscreen"></iframe>';document.body.appendChild(m);
      m.querySelector('#mcX').onclick=()=>{m.hidden=true;};m.querySelector('#mcFs').onclick=()=>{const f=m.querySelector('iframe');(m.requestFullscreen?m:f).requestFullscreen&&(m.requestFullscreen?m:f).requestFullscreen().catch(()=>{});};}
    const f=m.querySelector('iframe');if(!f.src)f.src='esquadrias/monte-casa.html?v=5';m.hidden=false;
    try{if(typeof sb!=='undefined')sb.auth.getSession().then(({data:{session}})=>{if(session)sb.from('trein_eventos').insert({user_id:session.user.id,tipo:'monte_casa',tipologia:null,detalhe:{quem:window.ALUNO_NOME||null,cid:window.ALUNO_CID||null}}).then(()=>{});});}catch(_){}}
  addEventListener('message',async e=>{const d=e.data;if(!d||d.fc!=='opiniao'||!d.op)return;const f=document.querySelector('#mcMd iframe');if(!f||e.source!==f.contentWindow)return;
    try{if(typeof sb==='undefined')return;const {data:{session}}=await sb.auth.getSession();if(!session)return;const o=d.op,det={nota:Math.max(1,Math.min(5,+o.nota||0)),gostou:(o.gostou||[]).slice(0,8).map(x=>String(x).slice(0,40)),texto:String(o.texto||'').slice(0,1000),planta:String(o.planta||'').slice(0,20),linha:String(o.linha||'').slice(0,8),quem:window.ALUNO_NOME||null,cid:window.ALUNO_CID||null};
      await sb.from('trein_eventos').insert({user_id:session.user.id,tipo:'opiniao_casa3d',tipologia:null,detalhe:det});}catch(_){}});
  function poe(){const ub=document.getElementById('ubar'),sug=document.getElementById('sugBtn');if(!ub||!sug)return;if(document.getElementById('mcBtn'))return;
    const b=document.createElement('button');b.type='button';b.id='mcBtn';b.textContent='🏙 Monte sua Casa';b.title='Monte a sua casa e o seu prédio com esquadrias Suprema e Gold em 3D';b.onclick=abrir;ub.insertBefore(b,sug);}
  setInterval(poe,1500);poe();
})();
