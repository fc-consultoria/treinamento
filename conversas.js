/* ===== Central de Conversas (emp_conversas / emp_msgs) =====
   Equipe:  FCConversas.equipe(token)  → botão 💬 com conversas individuais entre colegas e com a FC.
            O gestor também vê a aba "Histórico" com todas as conversas da empresa (só leitura).
   Matriz:  FCConversas.matriz()       → botão 💬 no topo do Painel da Matriz com o número de mensagens novas,
            caixa única com as conversas de todas as empresas (responde as conversas com a FC, lê o histórico). */
(function(){
  if(typeof sb==='undefined')return;
  const h=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lk=t=>h(t).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\n/g,'<br>');
  const PAPEL={gestor:'Gestor geral',compras:'Compras',vendas:'Vendas',gerente:'Gerente comercial',marketing:'Marketing',fabrica:'Fábrica',estoque:'Estoque'};
  const hr=d=>{const x=new Date(d),n=new Date();return (x.toDateString()===n.toDateString()?'':x.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' ')+x.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});};
  /* atendimento da FC: seg–sex 08–11h e 13–17h (horário de Sinop/MT) */
  function fcAberta(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Cuiaba',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());
    const g=t=>(p.find(x=>x.type===t)||{}).value,wd=g('weekday'),m=(+g('hour')%24)*60+(+g('minute'));
    return !['Sat','Sun'].includes(wd)&&((m>=480&&m<660)||(m>=780&&m<1020));}
  const ini=n=>String(n||'?').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();

  const CSS=`
.fcv-btn{position:fixed;left:16px;bottom:16px;z-index:9990;display:flex;align-items:center;gap:10px;border:0;border-radius:99px;padding:15px 24px;background:#0d5c8f;color:#fff;font:800 17px system-ui,-apple-system,"Segoe UI",sans-serif;cursor:pointer;box-shadow:0 10px 26px -10px rgba(13,92,143,.8);border:2px solid #fff}
.fcv-btn:hover{background:#0a4a74}.fcv-btn .fcv-n{min-width:24px;height:24px;font-size:13.5px}.fcv-btn:has(.fcv-n:not(:empty)){animation:fcvChama 1.6s ease-in-out infinite}@keyframes fcvChama{50%{box-shadow:0 0 0 7px rgba(225,29,72,.25)}}
.fcv-btn:focus-visible,.fcv button:focus-visible{outline:3px solid #f2a51e;outline-offset:2px}
.fcv-n{min-width:20px;height:20px;border-radius:99px;background:#e11d48;color:#fff;font-size:12px;display:inline-grid;place-items:center;padding:0 6px}
.fcv-n:empty{display:none}
.fcv{position:fixed;left:16px;bottom:84px;z-index:9991;width:min(760px,calc(100vw - 32px));height:min(600px,calc(100vh - 100px));background:var(--surface,#fff);color:var(--fg,#15232b);border:1px solid var(--line,#d9e1e6);border-radius:16px;box-shadow:0 24px 60px -20px rgba(15,23,42,.45);display:none;grid-template-columns:260px 1fr;overflow:hidden;font:14.5px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
.fcv.on{display:grid}
.fcv-mat.fcv{left:50%;top:50%;bottom:auto;transform:translate(-50%,-50%);width:min(980px,calc(100vw - 32px));height:min(680px,calc(100vh - 60px));grid-template-columns:320px 1fr}
.fcv-side{border-right:1px solid var(--line,#d9e1e6);display:flex;flex-direction:column;min-height:0;background:var(--surface-2,#f6f8f9)}
.fcv-hd{display:flex;align-items:center;gap:8px;padding:12px 12px 8px}.fcv-hd b{flex:1;font-size:16px}
.fcv-x{border:0;background:none;color:inherit;font-size:20px;cursor:pointer;padding:2px 6px;border-radius:8px}
.fcv-tabs{display:flex;gap:4px;padding:0 10px 8px;flex-wrap:wrap}.fcv-tabs button{border:1px solid var(--line,#d9e1e6);background:var(--surface,#fff);color:inherit;border-radius:99px;padding:4px 11px;font:600 13px inherit;cursor:pointer}
.fcv-tabs button[aria-pressed="true"]{background:#0d5c8f;border-color:#0d5c8f;color:#fff}
.fcv-list{flex:1;overflow:auto;padding:0 6px 10px;display:flex;flex-direction:column;gap:2px}
.fcv-sec{font:700 11.5px inherit;letter-spacing:.07em;text-transform:uppercase;color:var(--muted,#5d6f7a);padding:10px 8px 4px}
.fcv-it{all:unset;box-sizing:border-box;display:flex;gap:10px;align-items:center;padding:8px;border-radius:10px;cursor:pointer;width:100%}
.fcv-it:hover,.fcv-it[aria-current="true"]{background:var(--accent-soft,#e3eef6)}
.fcv-av{width:34px;height:34px;border-radius:50%;flex:none;display:grid;place-items:center;font:700 13px inherit;color:#fff;background:#5d6f7a;position:relative}
.fcv-av.fc{background:#0d5c8f}.fcv-av i{position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border-radius:50%;border:2px solid var(--surface-2,#f6f8f9);background:#9aa8b1}.fcv-av i.on{background:#1f9d55}
.fcv-tx{min-width:0;flex:1;display:flex;flex-direction:column}.fcv-tx b{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fcv-tx small{color:var(--muted,#5d6f7a);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fcv-main{display:flex;flex-direction:column;min-height:0;min-width:0}
.fcv-top{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line,#d9e1e6)}.fcv-top b{display:block}.fcv-top small{color:var(--muted,#5d6f7a)}
.fcv-back{display:none;border:0;background:none;color:inherit;font-size:20px;cursor:pointer}
.fcv-msgs{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:var(--bg,#eef2f4)}
.fcv-m{max-width:78%;align-self:flex-start;background:var(--surface,#fff);border:1px solid var(--line,#d9e1e6);border-radius:12px 12px 12px 4px;padding:7px 10px;overflow-wrap:anywhere}
.fcv-m.eu{align-self:flex-end;background:#0d5c8f;border-color:#0d5c8f;color:#fff;border-radius:12px 12px 4px 12px}.fcv-m.eu a{color:#fff}
.fcv-m small{display:block;font-size:11.5px;opacity:.75;margin-top:2px}.fcv-m .q{font-size:12px;font-weight:700;opacity:.85;display:block}
.fcv-dia{align-self:center;font-size:12px;color:var(--muted,#5d6f7a);background:var(--surface,#fff);border-radius:99px;padding:2px 10px}
.fcv-vazio{margin:auto;text-align:center;color:var(--muted,#5d6f7a);max-width:340px;padding:20px}
.fcv-aviso{font-size:12.5px;padding:6px 14px;background:var(--warn-soft,#fdf0dc);color:var(--warn,#a85d00)}
.fcv-form{display:flex;gap:8px;padding:10px;border-top:1px solid var(--line,#d9e1e6)}
.fcv-form textarea{flex:1;resize:none;min-height:42px;max-height:120px;border:1px solid var(--line,#d9e1e6);border-radius:10px;padding:9px 10px;font:inherit;background:var(--surface,#fff);color:inherit}
.fcv-form button{border:0;border-radius:10px;background:#0d5c8f;color:#fff;font:700 14px inherit;padding:0 16px;cursor:pointer}.fcv-form button:disabled{opacity:.5}
.fcv-ro{padding:10px 14px;border-top:1px solid var(--line,#d9e1e6);font-size:13px;color:var(--muted,#5d6f7a)}
.fcv-lgpd{font-size:11.5px;color:var(--muted,#5d6f7a);padding:6px 12px 10px}
.fcv-sup{margin:8px;padding:9px 10px;border-radius:10px;background:#fff8e8;border:1px solid #f2a51e;font-size:13px;color:#7a4a00;cursor:pointer;text-align:left}
.fcv-tb{display:inline-flex;align-items:center;gap:6px}
@media(max-width:700px){.fcv,.fcv-mat.fcv{left:0;top:0;bottom:0;transform:none;width:100vw;height:100dvh;border-radius:0;grid-template-columns:1fr}
 .fcv.chat .fcv-side{display:none}.fcv:not(.chat) .fcv-main{display:none}.fcv-back{display:block}.fcv-btn{bottom:12px;left:12px}}
@media (prefers-color-scheme:dark){.fcv-sup{background:#3a2a12;color:#f0c27a}}`;
  function css(){if(document.getElementById('fcvCss'))return;const s=document.createElement('style');s.id='fcvCss';s.textContent=CSS;document.head.appendChild(s);}
  function bip(){try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.frequency.value=880;g.gain.value=.06;o.connect(g);g.connect(a.destination);o.start();setTimeout(()=>{o.frequency.value=1175},120);setTimeout(()=>{o.stop();a.close()},260);}catch(_){}}

  /* desenha a conversa aberta (comum aos dois modos) */
  function msgsHtml(L,euId,euFc,lidoOutro){if(!L.length)return '<div class="fcv-vazio">Nenhuma mensagem ainda. Escreva a primeira abaixo.</div>';let dia='',o='';
    const ult=[...L].reverse().find(m=>euFc?m.fc:m.de===euId);
    L.forEach(m=>{const d=new Date(m.em).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'});if(d!==dia){dia=d;o+=`<div class="fcv-dia">${h(d)}</div>`;}
      const eu=euFc?m.fc:m.de===euId;o+=`<div class="fcv-m ${eu?'eu':''}">${eu?'':`<span class="q">${h(m.nome)}</span>`}${lk(m.texto)}<small>${new Date(m.em).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}${eu&&ult&&m.id===ult.id&&lidoOutro>=m.id?' · ✓✓ lida':''}</small></div>`;});return o;}

  /* ================= EQUIPE ================= */
  async function equipe(token){if(!token||document.getElementById('fcvBtn'))return;
    const ok=await sb.rpc('emp_chat_lista',{p_token:token});if(ok.error||!ok.data||document.getElementById('fcvBtn'))return;css();
    const S={tok:token,d:null,aba:'conv',conv:null,cv:null,ultMax:0,lastBadge:-1};
    const btn=document.createElement('button');btn.id='fcvBtn';btn.className='fcv-btn';btn.type='button';btn.innerHTML='💬 Conversas <span class="fcv-n" id="fcvN"></span>';
    const box=document.createElement('div');box.className='fcv';box.setAttribute('role','dialog');box.setAttribute('aria-label','Conversas');
    document.body.append(btn,box);
    btn.onclick=()=>{box.classList.toggle('on');if(box.classList.contains('on'))lista();};
    async function badge(){const r=await sb.rpc('emp_chat_nao_lidas',{p_token:S.tok});const n=r.data||0;document.getElementById('fcvN').textContent=n?n:'';
      if(S.lastBadge>=0&&n>S.lastBadge)bip();S.lastBadge=n;}
    async function lista(){const r=await sb.rpc('emp_chat_lista',{p_token:S.tok});if(r.error||!r.data){box.innerHTML='<div class="fcv-vazio">Não consegui abrir as conversas. Entre de novo no painel.</div>';return;}S.d=r.data;pinta();}
    function nomeConv(c){const eu=S.d.eu.id;if(c.tipo==='fc')return c.a.id===eu?'FC Consultoria':c.a.nome+' ↔ FC';const o=c.a.id===eu?c.b:c.b&&c.b.id===eu?c.a:null;return o?o.nome:(c.a.nome+' ↔ '+(c.b&&c.b.nome));}
    function item(id,nome,sub,{fc,on,n,cur}){return `<button type="button" class="fcv-it" data-k="${h(id)}" aria-current="${cur}"><span class="fcv-av ${fc?'fc':''}">${fc?'FC':h(ini(nome))}${on!=null?`<i class="${on?'on':''}"></i>`:''}</span><span class="fcv-tx"><b>${h(nome)}</b><small>${h(sub)}</small></span>${n?`<span class="fcv-n">${n}</span>`:''}</button>`;}
    function pinta(){const D=S.d,eu=D.eu,gest=Array.isArray(D.historico);
      const meu=k=>D.minhas.find(c=>k==='fc'?c.tipo==='fc':c.tipo==='dm'&&(c.a.id===k||(c.b&&c.b.id===k)));
      const fc=meu('fc'),aberta=fcAberta();
      let L='';
      if(S.aba==='conv'){L+=`<div class="fcv-sec">FC Consultoria</div>`+item('fc','FC Consultoria',fc&&fc.ultima?(fc.ultima.fc?'':'Você: ')+fc.ultima.texto:(aberta?'Online · atendimento agora':'Offline · deixe sua mensagem'),{fc:1,on:aberta,n:fc&&fc.nao_lidas,cur:S.conv==='fc'});
        L+=`<div class="fcv-sec">Equipe</div>`+(D.contatos.length?D.contatos.map(p=>{const c=meu(p.id);return item(p.id,p.nome,c&&c.ultima?(c.ultima.nome===eu.nome?'Você: ':'')+c.ultima.texto:PAPEL[p.papel]||p.papel,{on:p.online,n:c&&c.nao_lidas,cur:S.conv===p.id});}).join(''):'<div class="fcv-lgpd">Ninguém mais da equipe cadastrado ainda.</div>');}
      else{L+=D.historico.length?D.historico.map(c=>item('h:'+c.id,nomeConv(c),c.ultima?c.ultima.nome+': '+c.ultima.texto:'',{fc:c.tipo==='fc',cur:S.conv==='h:'+c.id})).join(''):'<div class="fcv-lgpd" style="padding:12px">Nenhuma conversa da equipe ainda.</div>';}
      box.innerHTML=`<aside class="fcv-side"><div class="fcv-hd"><b>💬 Conversas</b><button type="button" class="fcv-x" data-x aria-label="Fechar">✕</button></div>
        ${gest?`<div class="fcv-tabs"><button type="button" data-ab="conv" aria-pressed="${S.aba==='conv'}">Minhas conversas</button><button type="button" data-ab="hist" aria-pressed="${S.aba==='hist'}">🗂 Histórico da equipe</button></div>`:''}
        <div class="fcv-list">${L}</div><div class="fcv-lgpd">🔒 As conversas são individuais. Ficam registradas e podem ser consultadas pela gestão da empresa e pela FC Consultoria.</div></aside>
        <section class="fcv-main" id="fcvMain">${S.cv?'':'<div class="fcv-vazio">Escolha a FC ou uma pessoa da equipe para conversar.</div>'}</section>`;
      box.querySelector('[data-x]').onclick=()=>box.classList.remove('on');
      box.querySelectorAll('[data-ab]').forEach(b=>b.onclick=()=>{S.aba=b.dataset.ab;S.conv=null;S.cv=null;box.classList.remove('chat');pinta();});
      box.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>abrir(b.dataset.k));
      if(S.cv)chat();}
    async function abrir(k){S.conv=k;let id;if(k.startsWith('h:'))id=k.slice(2);else{const r=await sb.rpc('emp_chat_abrir',{p_token:S.tok,p_com:k});id=r.data;}
      if(!id)return;const r=await sb.rpc('emp_chat_msgs',{p_token:S.tok,p_conversa:id});if(!r.data)return;S.cv=r.data;S.cvId=id;box.classList.add('chat');pinta();badge();}
    function chat(){const C=S.cv,c=C.conversa,eu=S.d.eu,m=document.getElementById('fcvMain');const fcC=c.tipo==='fc'&&c.a.id===eu.id,aberta=fcAberta();
      const tit=S.conv.startsWith('h:')?nomeConv(c):fcC?'FC Consultoria':nomeConv(c);
      const sub=S.conv.startsWith('h:')?'Histórico · somente leitura':fcC?(aberta?'🟢 Online · seg a sex, 08–11h e 13–17h':'⚪ Offline agora · sua mensagem fica guardada e a FC responde no próximo horário'):(()=>{const p=S.d.contatos.find(x=>x.id===S.conv);return p?(PAPEL[p.papel]||p.papel)+(p.online?' · online agora':''):'';})();
      m.innerHTML=`<div class="fcv-top"><button type="button" class="fcv-back" aria-label="Voltar">←</button><span class="fcv-av ${fcC?'fc':''}">${fcC?'FC':h(ini(tit))}</span><div style="min-width:0"><b>${h(tit)}</b><small>${h(sub)}</small></div></div>
        <div class="fcv-msgs" id="fcvMs">${msgsHtml(C.msgs,eu.id,false,C.lido_outro||0)}</div>
        ${C.pode_escrever?`<form class="fcv-form" id="fcvF"><textarea id="fcvT" rows="1" placeholder="Escreva uma mensagem…" aria-label="Mensagem"></textarea><button type="submit">Enviar</button></form>`:'<div class="fcv-ro">👁 Você está vendo o histórico desta conversa. Para falar com a pessoa, use "Minhas conversas".</div>'}`;
      const ms=document.getElementById('fcvMs');ms.scrollTop=ms.scrollHeight;
      m.querySelector('.fcv-back').onclick=()=>{box.classList.remove('chat');S.cv=null;S.conv=null;lista();};
      const f=document.getElementById('fcvF');if(f){const t=document.getElementById('fcvT');t.focus();
        t.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();f.requestSubmit();}};
        f.onsubmit=async e=>{e.preventDefault();const tx=t.value.trim();if(!tx)return;const b=f.querySelector('button');b.disabled=true;
          const r=await sb.rpc('emp_chat_enviar',{p_token:S.tok,p_conversa:S.cvId,p_texto:tx});b.disabled=false;if(r.error||!r.data){alert('Não foi possível enviar. Tente de novo.');return;}
          t.value='';await recarregar();t.focus();};}}
    async function recarregar(){if(!S.cvId||!box.classList.contains('on'))return;const r=await sb.rpc('emp_chat_msgs',{p_token:S.tok,p_conversa:S.cvId});if(!r.data)return;
      const mud=r.data.msgs.length!==S.cv.msgs.length||r.data.lido_outro!==S.cv.lido_outro;S.cv=r.data;if(mud){const t=document.getElementById('fcvT'),v=t?t.value:'';chat();const t2=document.getElementById('fcvT');if(t2){t2.value=v;}}}
    badge();setInterval(()=>{if(document.hidden)return;badge();if(box.classList.contains('on')){if(S.cvId)recarregar();}},15000);}

  /* ================= MATRIZ (FC) ================= */
  async function matriz(op){op=op||{};if(document.getElementById('fcvMat'))return;
    const ok=await sb.rpc('emp_chat_fc_nao_lidas');if(ok.error||!ok.data){setTimeout(()=>matriz(op),15000);return;}if(document.getElementById('fcvMat'))return;css();
    const S={d:null,emp:'',conv:null,cv:null,ult:null,primeira:true};
    const acts=document.querySelector('header .acts');
    const tb=document.createElement('button');tb.type='button';tb.id='fcvMat';tb.className='fcv-tb';tb.title='Conversas das equipes dos clientes com a FC';
    tb.innerHTML='💬 Conversas das equipes <span class="fcv-n" id="fcvMN"></span>';
    if(op.semBotao){tb.hidden=true;document.body.appendChild(tb);}else if(acts)acts.prepend(tb);else{tb.className='fcv-btn';document.body.appendChild(tb);}
    const box=document.createElement('div');box.className='fcv fcv-mat';box.setAttribute('role','dialog');box.setAttribute('aria-label','Conversas das equipes');document.body.appendChild(box);
    tb.onclick=()=>{box.classList.toggle('on');if(box.classList.contains('on'))lista();};
    const tit0=document.title;
    async function badge(){if(op.semBotao)return;const r=await sb.rpc('emp_chat_fc_nao_lidas');if(r.error||!r.data)return;const d=r.data,n=(d.conversas||0)+(d.sup||0);
      document.getElementById('fcvMN').textContent=n?n:'';document.title=(n?'('+n+') ':'')+tit0;
      if(!S.primeira&&d.ultima&&d.ultima!==S.ult){bip();if(box.classList.contains('on'))lista();}S.ult=d.ultima;S.primeira=false;}
    async function lista(){const r=await sb.rpc('emp_chat_fc_lista');if(r.error||!r.data){box.innerHTML='<div class="fcv-vazio">Não consegui abrir. Entre como Matriz.</div>';return;}S.d=r.data;pinta();}
    const nomeEmp=k=>((S.d.empresas||{})[k]||k).split(' · ')[0];
    function nomeConv(c){return c.tipo==='fc'?c.a.nome+' ('+(PAPEL[c.a.papel]||c.a.papel)+')':c.a.nome+' ↔ '+(c.b&&c.b.nome);}
    function pinta(){const D=S.d,emps=[...new Set(D.conversas.map(c=>c.emp))];
      const L=D.conversas.filter(c=>!S.emp||c.emp===S.emp),F=L.filter(c=>c.tipo==='fc').sort((a,b)=>(b.nao_lidas>0)-(a.nao_lidas>0)),H=L.filter(c=>c.tipo==='dm');
      const it=c=>`<button type="button" class="fcv-it" data-c="${c.id}" aria-current="${S.conv===c.id}"><span class="fcv-av ${c.tipo==='fc'?'':'fc'}" style="${c.tipo==='dm'?'background:#7a4bc4':''}">${h(ini(c.a.nome))}</span><span class="fcv-tx"><b>${h(nomeConv(c))}</b><small>${h(nomeEmp(c.emp))} · ${c.ultima?h((c.ultima.fc?'Você: ':'')+c.ultima.texto):''}</small></span>${c.nao_lidas?`<span class="fcv-n">${c.nao_lidas}</span>`:''}</button>`;
      box.innerHTML=`<aside class="fcv-side"><div class="fcv-hd"><b>💬 Conversas das equipes</b><button type="button" class="fcv-x" data-x aria-label="Fechar">✕</button></div>
        <div class="fcv-tabs"><button type="button" data-e="" aria-pressed="${!S.emp}">Todas</button>${emps.map(k=>`<button type="button" data-e="${h(k)}" aria-pressed="${S.emp===k}">${h(nomeEmp(k))}</button>`).join('')}</div>
        ${D.sup_novas?`<button type="button" class="fcv-sup" id="fcvSup">🛟 ${D.sup_novas} mensagem${D.sup_novas===1?'':'s'} nova${D.sup_novas===1?'':'s'} no Suporte do Painel de Vendas → abrir</button>`:''}
        <div class="fcv-list"><div class="fcv-sec">Com a FC · responder</div>${F.length?F.map(it).join(''):'<div class="fcv-lgpd">Nenhuma conversa com a FC ainda.</div>'}
        <div class="fcv-sec">Entre colaboradores · histórico</div>${H.length?H.map(it).join(''):'<div class="fcv-lgpd">Nenhuma conversa entre colaboradores ainda.</div>'}</div></aside>
        <section class="fcv-main" id="fcvMain">${S.cv?'':'<div class="fcv-vazio">Escolha uma conversa. As da FC você responde; as entre colaboradores ficam só para leitura.</div>'}</section>`;
      box.querySelector('[data-x]').onclick=()=>box.classList.remove('on');
      box.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{S.emp=b.dataset.e;pinta();});
      box.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>abrir(b.dataset.c));
      const sp=document.getElementById('fcvSup');if(sp)sp.onclick=()=>{box.classList.remove('on');try{ptab('sim');}catch(_){}const c=document.getElementById('osupCard');if(c)c.scrollIntoView({behavior:'smooth'});};
      if(S.cv)chat();}
    window.FCConversas=window.FCConversas||{};window.FCConversas.abrirMatriz=async id=>{box.classList.add('on');await lista();if(id)await abrir(id);};
    async function abrir(id){S.conv=id;const r=await sb.rpc('emp_chat_fc_msgs',{p_conversa:id});if(!r.data)return;S.cv=r.data;box.classList.add('chat');
      const c=S.d.conversas.find(x=>x.id===id);if(c)c.nao_lidas=0;pinta();badge();}
    function chat(){const C=S.cv,c=C.conversa,m=document.getElementById('fcvMain');
      m.innerHTML=`<div class="fcv-top"><button type="button" class="fcv-back" aria-label="Voltar">←</button><span class="fcv-av" style="${c.tipo==='dm'?'background:#7a4bc4':''}">${h(ini(c.a.nome))}</span><div style="min-width:0"><b>${h(nomeConv(c))}</b><small>${h(nomeEmp(c.emp))}${c.tipo==='dm'?' · conversa entre colaboradores · só leitura':''}</small></div></div>
        ${c.tipo==='fc'&&!fcAberta()?'<div class="fcv-aviso">Fora do horário de atendimento: a equipe vê a FC como offline.</div>':''}
        <div class="fcv-msgs" id="fcvMs">${msgsHtml(C.msgs,null,c.tipo==='fc',C.lido_outro||0)}</div>
        ${C.pode_escrever?`<form class="fcv-form" id="fcvF"><textarea id="fcvT" rows="1" placeholder="Responder ${h(c.a.nome)}…" aria-label="Resposta"></textarea><button type="submit">Enviar</button></form>`:'<div class="fcv-ro">👁 Histórico entre colaboradores. A FC só acompanha.</div>'}`;
      const ms=document.getElementById('fcvMs');ms.scrollTop=ms.scrollHeight;
      m.querySelector('.fcv-back').onclick=()=>{box.classList.remove('chat');S.cv=null;S.conv=null;pinta();};
      const f=document.getElementById('fcvF');if(f){const t=document.getElementById('fcvT');t.focus();
        t.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();f.requestSubmit();}};
        f.onsubmit=async e=>{e.preventDefault();const tx=t.value.trim();if(!tx)return;const b=f.querySelector('button');b.disabled=true;
          const r=await sb.rpc('emp_chat_fc_enviar',{p_conversa:S.conv,p_texto:tx});b.disabled=false;if(r.error||!r.data){alert('Não foi possível enviar.');return;}
          t.value='';const r2=await sb.rpc('emp_chat_fc_msgs',{p_conversa:S.conv});if(r2.data){S.cv=r2.data;chat();}lista();};}}
    badge();setInterval(()=>{badge();if(box.classList.contains('on')&&S.conv&&!document.hidden)sb.rpc('emp_chat_fc_msgs',{p_conversa:S.conv}).then(r=>{if(r.data&&(r.data.msgs.length!==S.cv.msgs.length||r.data.lido_outro!==S.cv.lido_outro)){const t=document.getElementById('fcvT'),v=t?t.value:'';S.cv=r.data;chat();const t2=document.getElementById('fcvT');if(t2)t2.value=v;}});},20000);}

  window.FCConversas=Object.assign(window.FCConversas||{},{equipe,matriz});
})();
