/* Painel de Vendas · 💬 Atendimentos do site e 👤 Clientes do site.
   Usa as variáveis do painel (sb, FC, EMP, VKEY, ADM, D, O, ABA, tela, toast, esc, novoOrc, temPreco, crefDe, num). */
(function(){
  const A={L:null,sel:null,msgs:[],ult:0,filtro:'todos',anexo:null,nl:0,pend:0,fila:0,vends:[],eu:null,contas:null,loja:null,senha:null,t:null};
  const args=x=>Object.assign({p_chave:FC?null:VKEY,p_emp:FC?EMP:null},x||{});
  const nz=s=>String(s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Z0-9]/g,'');
  const hora=d=>{if(!d)return '';const x=new Date(d),h=new Date();return x.toDateString()===h.toDateString()?x.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):x.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+x.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});};
  const ST={'aberto':['Novo','#dc2626'],'em atendimento':['Em atendimento','#d97706'],'orcamento':['Orçamento enviado','#2563eb'],'pedido':['Virou pedido','#16a34a'],'encerrado':['Encerrado','#64748b']};
  const css=`.atd{display:grid;grid-template-columns:330px 1fr;height:min(76vh,760px);min-height:520px;border:1px solid var(--ln,#d6dee4);border-radius:14px;overflow:hidden;background:#fff}
  @media(max-width:900px){.atd{grid-template-columns:1fr;height:auto}}
  .atd-in{border-right:1px solid #e3e9ec;overflow:auto;display:flex;flex-direction:column}
  .atd-f{display:flex;gap:4px;padding:8px;border-bottom:1px solid #e3e9ec;flex-wrap:wrap;position:sticky;top:0;background:#fff;z-index:1}
  .atd-f button{border:1px solid #d6dee4;background:#fff;border-radius:16px;padding:4px 10px;font-weight:600;font-size:13px;cursor:pointer}.atd-f button.on{background:#13232e;color:#fff;border-color:#13232e}
  .atd-i{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid #eef1f3;background:#fff;padding:11px 12px;cursor:pointer;font:inherit}
  .atd-i.on{background:#e7f3f4}.atd-i b{display:flex;justify-content:space-between;gap:8px;font-size:14.5px}.atd-i small{display:block;color:#5d6b76;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .atd-bd{background:#dc2626;color:#fff;border-radius:99px;padding:0 7px;font-size:12px}
  .atd-st{display:inline-block;border-radius:99px;padding:1px 8px;font-size:11.5px;font-weight:700;color:#fff}
  .atd-cv{display:flex;flex-direction:column;min-width:0;min-height:0}
  .atd-h{padding:10px 14px;border-bottom:1px solid #e3e9ec;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .atd-h .nm{font:800 19px var(--f-d,system-ui)}.atd-h .nota{font-size:13px}
  .atd-t{display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px;border-bottom:1px solid #e3e9ec;background:#f6f9fa;align-items:center}
  .atd-t select{border:1px solid #c4ccd2;border-radius:8px;padding:5px 7px;font:inherit;font-size:13.5px}
  .atd-ms{flex:1;overflow:auto;background:#eef3f0;padding:16px;display:flex;flex-direction:column;gap:9px;min-height:280px}
  .atd-m{max-width:74%;border-radius:12px;padding:8px 11px;font-size:15px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word;box-shadow:0 1px 1px rgba(0,0,0,.06)}
  .atd-m small{display:block;font-size:11.5px;color:#6b7b86;margin-top:3px;text-align:right}.atd-m .who{display:block;font-size:12px;font-weight:700;color:#0f6b70}
  .atd-m.vend{align-self:flex-end;background:#dcf3e3}.atd-m.cli{align-self:flex-start;background:#fff}.atd-m.sys{align-self:center;background:#fff4df;color:#7a4a08;font-size:13px}
  .atd-ax{display:flex;gap:9px;align-items:center;background:#fff;border:1px solid #d6dee4;border-radius:9px;padding:6px 8px;margin-top:5px;cursor:pointer;font:inherit;text-align:left;white-space:normal}
  .atd-ax img{width:110px;max-height:110px;object-fit:cover;border-radius:6px}
  .atd-cp{display:flex;gap:8px;align-items:flex-end;padding:10px;border-top:1px solid #e3e9ec;flex-wrap:wrap}
  .atd-cp textarea{flex:1;min-width:180px;resize:none;border:1.5px solid #c4ccd2;border-radius:10px;padding:9px;font:inherit;font-size:15px}
  .atd-lb{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.85);display:grid;place-items:center;padding:16px;cursor:zoom-out}.atd-lb img{max-width:100%;max-height:100%}
  .cli-t{width:100%;border-collapse:collapse;font-size:14px}.cli-t th{text-align:left;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#5d6b76;padding:6px;border-bottom:1px solid #d6dee4}
  .cli-t td{padding:8px 6px;border-bottom:1px solid #eef1f3;vertical-align:top}.cli-t select{border:1px solid #c4ccd2;border-radius:7px;padding:4px;font:inherit;font-size:13px;max-width:170px}
  .rt{display:grid;grid-template-columns:180px 1fr 160px auto;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #eef1f3}@media(max-width:800px){.rt{grid-template-columns:1fr}}
  .rt input{border:1px solid #c4ccd2;border-radius:8px;padding:7px 9px;font:inherit;font-size:14px}`;
  let stOk=false;function st(){if(stOk)return;stOk=true;const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);}
  function bip(){try{const c=new (window.AudioContext||window.webkitAudioContext)(),g=c.createGain(),o=c.createOscillator();o.frequency.value=740;g.gain.value=.07;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.18);}catch(_){}}
  async function lista(){const r=await sb.rpc('atd_lista',args());if(r.error||!r.data)return false;const d=r.data;
    const nl=(d.atends||[]).reduce((s,a)=>s+(+a.nao_lidas||0),0),fi=+d.fila||0;if(A.L&&(nl>A.nl||fi>A.fila))bip();
    A.L=d.atends||[];A.vends=d.vends||[];A.eu=d.eu;A.nl=nl;A.fila=fi;A.pend=+d.pendentes||0;rotulos();return true;}
  function rotulos(){const a=document.querySelector('[data-ab="atd"]');if(a)a.textContent=rotAtd();const c=document.querySelector('[data-ab="cli"]');if(c)c.textContent='👤 Clientes do site'+(A.pend?' ('+A.pend+' novo'+(A.pend>1?'s':'')+')':'');}
  function rotAtd(){return '💬 Atendimentos do site'+(A.fila?' · 🆕 '+A.fila+' na fila':'')+(A.nl?' ('+A.nl+')':'');}
  /* ---------- atendimentos ---------- */
  function vendNome(id){const v=A.vends.find(x=>x.id===id);return v?v.nome:'';}
  function inbox(){const L=(A.L||[]).filter(a=>A.filtro==='todos'||(A.filtro==='nl'&&a.nao_lidas>0)||(A.filtro==='sem'&&!a.vend_id)||(A.filtro==='fila'&&a.fila&&!['encerrado','pedido'].includes(a.status))||(A.filtro==='meus'&&!a.fila&&!a.bloq&&a.vend_id===A.eu));
    return `<div class="atd-in"><div class="atd-f">${[['todos','Todos'],['fila','🆕 Fila'+(A.fila?' ('+A.fila+')':'')]].concat(ADM?[['nl','Não lidas']]:[['meus','Meus'],['nl','Não lidas']]).map(([k,t])=>`<button type="button" data-af="${k}" class="${A.filtro===k?'on':''}">${t}</button>`).join('')}</div>
     ${L.map(a=>{const s=ST[a.status]||ST.aberto;if(a.bloq)return `<button type="button" class="atd-i ${a.id===A.sel?'on':''}" data-as="${a.id}" style="opacity:.7;background:#f6f8f9"><b><span>🔒 ${esc(a.cli.empresa||a.cli.nome)}</span></b><small>${esc(a.cli.cidade||'')} · ${hora(a.atualizado)}</small><small>Em atendimento com <b>${esc(a.vend||'outro vendedor')}</b></small></button>`;
       if(a.fila&&!['encerrado','pedido'].includes(a.status))return `<button type="button" class="atd-i ${a.id===A.sel?'on':''}" data-as="${a.id}" style="border-left:4px solid #dc2626"><b><span>🆕 ${esc(a.cli.empresa||a.cli.nome)}</span></b><small>Cotação nº ${a.numero} · ${esc(a.cli.cidade||'')} · ${hora(a.criado||a.atualizado)}</small><small><span class="atd-st" style="background:#dc2626">Aguardando vendedor</span> · ${(a.itens||[]).length} ite${(a.itens||[]).length===1?'m':'ns'}</small></button>`;
       return `<button type="button" class="atd-i ${a.id===A.sel?'on':''}" data-as="${a.id}"><b><span>${esc(a.cli.empresa||a.cli.nome)}</span>${a.nao_lidas?`<span class="atd-bd">${a.nao_lidas}</span>`:''}</b>
       <small>Cotação nº ${a.numero} · ${esc(a.cli.cidade||'')} · ${hora(a.atualizado)}</small><small>${esc(a.ult||'')}</small><small><span class="atd-st" style="background:${s[1]}">${s[0]}</span>${ADM?' · '+(a.vend?esc(a.vend):'<b style="color:#dc2626">sem vendedor</b>'):''}</small></button>`;}).join('')||'<p class="nota" style="padding:16px">Nenhum atendimento ainda. Quando um cliente pedir orçamento pelo catálogo, ele aparece aqui.</p>'}</div>`;}
  function msgHtml(m){if(m.autor==='sys')return `<div class="atd-m sys">${esc(m.texto)}</div>`;
    const ax=m.anexo&&m.anexo.id?`<button type="button" class="atd-ax" data-ax="${m.anexo.id}">${m.anexo.mini?`<img src="${esc(m.anexo.mini)}" alt="">`:'📄'}<span><b>${esc(m.anexo.nome)}</b><br><span class="nota">${Math.max(1,Math.round((m.anexo.tam||0)/1024))} KB · abrir</span></span></button>`:'';
    return `<div class="atd-m ${m.autor}">${m.nome?`<span class="who">${esc(m.nome)}</span>`:''}${m.texto?esc(m.texto):''}${ax}<small>${hora(m.criado)}${m.autor==='vend'&&A.cur&&A.cur.lido_cli&&new Date(A.cur.lido_cli)>=new Date(m.criado)?' · ✓✓ lida':''}</small></div>`;}
  function conversa(){const a=(A.L||[]).find(x=>x.id===A.sel);A.cur=a;if(!a)return `<div class="atd-cv"><p class="nota" style="margin:auto;padding:30px;text-align:center">Escolha um atendimento ao lado.</p></div>`;
    if(a.bloq)return `<div class="atd-cv"><div style="margin:auto;padding:30px;text-align:center;max-width:420px"><div style="font-size:40px">🔒</div><h3 style="margin:6px 0">${esc(a.cli.empresa||a.cli.nome)}</h3><p class="nota">${esc(a.cli.cidade||'')}</p><p>Este cliente já está sendo atendido por <b>${esc(a.vend||'outro vendedor')}</b>. A conversa e o pedido ficam só com quem assumiu.</p></div></div>`;
    if(a.fila&&!ADM&&!['encerrado','pedido'].includes(a.status))return `<div class="atd-cv"><div class="atd-h"><div><span class="nm">🆕 ${esc(a.cli.nome)}${a.cli.empresa?' · '+esc(a.cli.empresa):''}</span><br><span class="nota">${esc(a.cli.cidade||'')} · cotação nº ${a.numero} · chegou ${hora(a.criado)}</span></div></div>
     <div style="padding:16px;overflow:auto;flex:1"><p style="margin:0 0 8px"><b>O que o cliente pediu</b></p><div class="atd-m cli" style="max-width:100%">${esc(a.pedido||(a.itens||[]).map(i=>i.cd+' · '+(i.corn||'')+' · '+i.q+' barras').join('\n'))}</div>
      <p class="nota" style="margin:14px 0 8px">O primeiro vendedor que assumir fica com o atendimento. Os outros passam a ver só o nome do cliente. O contato e a conversa aparecem depois que você assumir.</p>
      <button type="button" class="btn pri" data-apegar="${a.id}" style="font-size:16px;padding:12px 18px">✋ Atender este cliente</button></div></div>`;
    const c=a.cli,orcs=(D&&D.orcs||[]).slice(0,30);
    return `<div class="atd-cv"><div class="atd-h"><div><span class="nm">${esc(c.nome)}${c.empresa?' · '+esc(c.empresa):''}</span><br><span class="nota">${esc(c.cidade||'')}${c.doc?' · '+esc(c.doc):''}${c.zap?' · WhatsApp '+esc(c.zap):''}${c.email?' · '+esc(c.email):''}</span></div></div>
     <div class="atd-t">${(typeof SEMORC==='function'&&SEMORC())?'':'<button type="button" class="btn" data-aorc>🧾 Transformar em orçamento</button>'}
      ${orcs.length?`<select id="aOrc" aria-label="Enviar orçamento"><option value="">📎 Enviar resumo de um orçamento…</option>${orcs.map(o=>`<option value="${o.id}">nº ${o.numero} · ${esc((o.cliente&&o.cliente.nome)||'')} · R$ ${Number(o.total||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</option>`).join('')}</select>`:''}
      <select id="aSt" aria-label="Situação">${Object.entries(ST).map(([k,v])=>`<option value="${k}" ${a.status===k?'selected':''}>${v[0]}</option>`).join('')}</select>
      ${A.vends.length?`<select id="aVd" aria-label="Vendedor"><option value="">${a.vend_id?'↪ Passar para…':'Escolher vendedor…'}</option>${A.vends.filter(v=>v.id!==a.vend_id).map(v=>`<option value="${v.id}">${esc(v.nome)}</option>`).join('')}</select>`:''}
      ${c.zap?`<a class="btn" style="background:#1f9d55;border-color:#1f9d55;color:#fff" target="_blank" rel="noopener" href="https://wa.me/55${String(c.zap).replace(/\D/g,'').replace(/^55/,'')}">💬 WhatsApp</a>`:''}</div>
     <div class="atd-ms" id="aMs">${A.msgs.map(msgHtml).join('')}</div>
     <form class="atd-cp" id="aCp">${A.anexo?`<div style="width:100%;font-size:13px;background:#f3f6f7;border-radius:8px;padding:5px 8px">📎 <b>${esc(A.anexo.nome)}</b> <button type="button" class="btn" data-asx style="padding:1px 8px">Tirar</button></div>`:''}
      <button type="button" class="btn" data-aclip>📎</button><textarea id="aTx" rows="2" placeholder="Responder ${esc(c.nome.split(' ')[0])}… (Enter envia, Shift+Enter quebra a linha)"></textarea><button class="btn pri">Enviar</button><input type="file" id="aFile" hidden accept="image/*,application/pdf"></form></div>`;}
  function desenhaAtd(){const b=document.getElementById('atdBox');if(!b)return;const tx=b.querySelector('#aTx'),v=tx?tx.value:'';
    b.innerHTML=`<div class="atd">${inbox()}${conversa()}</div><p class="nota" style="margin-top:8px">Os clientes entram pelo catálogo da loja (área do cliente), montam a cotação e conversam aqui. ${ADM?'O gestor vê todos os atendimentos. Pedido novo cai na fila 🆕: o primeiro vendedor que assumir fica com ele e os outros veem só o nome do cliente.':''}</p>`;
    const t2=b.querySelector('#aTx');if(t2){t2.value=v;t2.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();b.querySelector('#aCp').requestSubmit();}});}
    const ms=b.querySelector('#aMs');if(ms)ms.scrollTop=ms.scrollHeight;}
  async function msgs(full){if(!A.sel)return;const r=await sb.rpc('atd_msgs',args({p_atend:A.sel,p_desde:full?0:A.ult}));if(r.error||!r.data)return;
    const n=r.data.msgs||[];A.msgs=full?n:A.msgs.concat(n);if(n.length)A.ult=n[n.length-1].id;const a=(A.L||[]).find(x=>x.id===A.sel);if(a){a.lido_cli=r.data.lido_cli;const lidas=a.nao_lidas;a.nao_lidas=0;A.nl=Math.max(0,A.nl-lidas);rotulos();}
    if(full||n.length)desenhaAtd();}
  async function arquivo(f){const dataUrl=b=>new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result);r.readAsDataURL(b);});
    if(/^image\//.test(f.type)){const im=await new Promise((ok,er)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=er;i.src=URL.createObjectURL(f);});
      const cv=(mx,q)=>{const k=Math.min(1,mx/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q);};
      const d=cv(1800,.82);return {nome:f.name.replace(/\.[^.]+$/,'')+'.jpg',tipo:'image/jpeg',tam:Math.round(d.length*.75),dados:d,mini:cv(240,.7)};}
    if(f.size>3*1024*1024){toast('Arquivo grande demais (máximo 3 MB).');return null;}
    return {nome:f.name,tipo:f.type||'application/octet-stream',tam:f.size,dados:await dataUrl(f)};}
  async function abreAnexo(id){const r=await sb.rpc('atd_anexo',args({p_id:id}));if(r.error||!r.data){toast('Não consegui abrir o anexo.');return;}const x=r.data;
    if(/^image\//.test(x.tipo)){const l=document.createElement('div');l.className='atd-lb';l.innerHTML=`<img src="${x.dados}" alt="">`;l.onclick=()=>l.remove();document.body.appendChild(l);return;}
    const bl=await (await fetch(x.dados)).blob();const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.target='_blank';a.rel='noopener';a.download=x.nome;document.body.appendChild(a);a.click();a.remove();}
  async function enviar(texto,anexo){const r=await sb.rpc('atd_enviar',args({p_atend:A.sel,p_texto:texto,p_anexo:anexo||null}));if(r.error||(r.data&&r.data.erro)){toast((r.data&&r.data.erro)||(/grande/.test(r.error.message)?'Arquivo grande demais (máximo 3 MB).':'Não enviou. Tente de novo.'));return false;}
    const a=(A.L||[]).find(x=>x.id===A.sel);if(a&&a.status==='aberto')a.status='em atendimento';await msgs(false);return true;}
  function transformar(){const a=(A.L||[]).find(x=>x.id===A.sel);if(!a)return;O=novoOrc();
    O.cliente={nome:a.cli.empresa||a.cli.nome,doc:a.cli.doc||'',fone:a.cli.zap||'',email:a.cli.email||'',cidade:a.cli.cidade||''};
    const falta=[];(a.itens||[]).forEach(it=>{const cor=nz(String(it.corn||'').split(' ')[0]);
      const cands=(D.itens||[]).filter(i=>nz(i.cod)===nz(it.cd)||nz(i.cod)===nz(it.c)||nz(crefDe(i))===nz(it.c));
      const i=cands.find(x=>!cor||nz(x.cor).includes(cor)||nz(x.desc).includes(cor))||cands[0];
      if(i&&temPreco(i))O.itens.push({id:i.id,cref:crefDe(i),cod:i.cod,desc:i.desc,cor:i.cor||'',un:i.un||'BR',peso:i.peso,foto:i.foto||'',preco:i.preco,qtd:+it.q||1});
      else falta.push(it.cd+' '+(it.corn||'')+' ('+it.q+' br)');});
    O.obs=('Cotação do site nº '+a.numero+(falta.length?' · Conferir: '+falta.join(', '):'')+'\n'+(D.obs||'')).trim();
    ABA='novo';tela();scrollTo(0,0);toast(falta.length?'Orçamento montado. Confira os itens: '+falta.join(', '):'Orçamento montado com os itens da cotação.');}
  /* ---------- clientes do site ---------- */
  async function carregaCli(){const [c,l]=await Promise.all([sb.rpc('atd_contas',args()),sb.rpc('atd_loja',args())]);A.contas=c.data||[];A.loja=l.data||null;}
  function desenhaCli(){const b=document.getElementById('atdBox');if(!b)return;const C=A.contas||[],V=A.vends;const lj=A.loja||{};
    const ST2={pendente:['⏳ Aguardando liberação','#d97706'],ativo:['✓ Liberado','#16a34a'],bloqueado:['Bloqueado','#64748b']};
    b.innerHTML=`<div class="box"><h2 class="t" style="margin:0 0 4px">👤 Clientes do site</h2><p class="nota" style="margin:0 0 10px">Serralherias e vidraçarias que se cadastraram no catálogo. Ao liberar, o sistema gera a senha e abre o WhatsApp do cliente com a mensagem pronta.</p>
     ${A.loja&&!lj.erro?`<label style="display:flex;gap:8px;align-items:center;font-weight:700;margin-bottom:10px"><input type="checkbox" id="cLoja" ${lj.on?'checked':''}> Área do cliente ligada no catálogo (cadastro, carrinho e conversa)</label>`:''}
     ${A.senha?`<div class="box" style="border-color:#16a34a;background:#ecfdf3"><b>✅ Senha de ${esc(A.senha.nome)}: <span style="font:700 20px ui-monospace,monospace;letter-spacing:.1em">${esc(A.senha.s)}</span></b><p class="nota" style="margin:4px 0 8px">Mande para o cliente. No primeiro acesso ele cria a senha dele.</p>${A.senha.zap?`<a class="btn" style="background:#1f9d55;border-color:#1f9d55;color:#fff" target="_blank" rel="noopener" href="${esc(A.senha.zap)}">💬 Enviar pelo WhatsApp</a>`:''}</div>`:''}
     <div style="overflow-x:auto"><table class="cli-t"><thead><tr><th>Cliente</th><th>Cidade</th><th>Contato</th><th>Vendedor (rota)</th><th>Situação</th><th></th></tr></thead><tbody>
     ${C.map(c=>{const s=ST2[c.status]||ST2.pendente;return `<tr><td><b>${esc(c.nome)}</b><br><span class="nota">${esc(c.empresa||'')}${c.doc?' · '+esc(c.doc):''}</span></td><td>${esc(c.cidade||'')}</td><td>${esc(c.zap||'')}<br><span class="nota">${esc(c.email)}</span></td>
      <td><select data-cv="${c.id}"><option value="">— sem vendedor —</option>${V.map(v=>`<option value="${v.id}" ${c.vend_id===v.id?'selected':''}>${esc(v.nome)}${v.rota?' · '+esc(v.rota):''}</option>`).join('')}</select></td>
      <td><span class="atd-st" style="background:${s[1]}">${s[0]}</span>${c.ult_acesso?`<br><span class="nota">último acesso ${hora(c.ult_acesso)}</span>`:''}</td>
      <td style="white-space:nowrap">${c.status!=='ativo'?`<button type="button" class="btn pri" data-cl="${c.id}" data-ac="liberar">Liberar</button>`:`<button type="button" class="btn" data-cl="${c.id}" data-ac="senha">Nova senha</button> <button type="button" class="btn" data-cl="${c.id}" data-ac="bloquear">Bloquear</button>`}</td></tr>`;}).join('')||'<tr><td colspan="6" class="nota">Nenhum cadastro ainda.</td></tr>'}</tbody></table></div></div>
     <div class="box"><h2 class="t" style="margin:0 0 4px">🗺 Rotas dos vendedores</h2><p class="nota" style="margin:0 0 6px">Escreva as cidades de cada rota, separadas por vírgula. O cliente que se cadastrar numa dessas cidades já cai com o vendedor certo.</p>
     ${V.map(v=>`<div class="rt" data-rt="${v.id}"><b>${esc(v.nome)}</b><input data-rc placeholder="Ex.: Serra Talhada, Arcoverde, Salgueiro" value="${esc((v.cidades||[]).join(', '))}"><input data-rn placeholder="Nome da rota (ex.: Rota 2)" value="${esc(v.rota||'')}">
       <span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><label class="nota" style="display:flex;gap:4px;align-items:center"><input type="checkbox" data-rf ${v.mostra_fone!==false?'checked':''}> mostrar telefone</label><button type="button" class="btn" data-rs>Salvar</button></span></div>`).join('')||'<p class="nota">Cadastre os vendedores na aba 👥 Vendedores.</p>'}</div>`;}
  async function acaoCli(id,ac){const c=(A.contas||[]).find(x=>x.id===id);const sv=document.querySelector(`[data-cv="${id}"]`);const vend=sv&&sv.value||null;
    if(ac==='liberar'&&!vend&&A.vends.length){toast('Escolha o vendedor da rota antes de liberar.');return;}
    const r=await sb.rpc('atd_conta',args({p_id:id,p_acao:ac,p_vend:vend}));if(r.error||!r.data||r.data.erro){toast((r.data&&r.data.erro)||'Não salvou.');return;}
    if(r.data.senha){const link=(D.cat||'')+(D.cat?(D.cat.includes('?')?'&':'?')+'loja=1':'');
      const msg=`Olá, ${c.nome.split(' ')[0]}! Seu acesso à área do cliente da ${D.nome||'loja'} foi liberado.\n\nEntre em: ${link}\nLogin: ${c.zap||c.email||''} (seu WhatsApp)\nSenha: ${r.data.senha}\n\nNo primeiro acesso você cria a sua senha. Qualquer dúvida, é só chamar.`;
      A.senha={nome:c.nome,s:r.data.senha,zap:c.zap?'https://wa.me/55'+String(c.zap).replace(/\D/g,'').replace(/^55/,'')+'?text='+encodeURIComponent(msg):''};}
    else A.senha=null;
    await Promise.all([carregaCli(),lista()]);desenhaCli();toast(ac==='bloquear'?'Acesso bloqueado.':'Salvo.');}
  /* ---------- eventos ---------- */
  document.addEventListener('click',async e=>{const b=document.getElementById('atdBox');if(!b||!b.contains(e.target))return;const t=e.target;
    const f=t.closest('[data-af]');if(f){A.filtro=f.dataset.af;desenhaAtd();return;}
    const s=t.closest('[data-as]');if(s){A.sel=s.dataset.as;A.ult=0;A.msgs=[];A.anexo=null;desenhaAtd();const x=(A.L||[]).find(y=>y.id===A.sel);if(x&&!x.bloq&&!(x.fila&&!ADM))await msgs(true);return;}
    const pg=t.closest('[data-apegar]');if(pg){pg.disabled=true;pg.textContent='Assumindo…';const r=await sb.rpc('atd_pegar',args({p_atend:pg.dataset.apegar}));
      if(r.error||!r.data||r.data.erro){toast((r.data&&r.data.erro)||'Não foi possível assumir. Tente de novo.');await lista();desenhaAtd();return;}
      await lista();A.ult=0;A.msgs=[];await msgs(true);desenhaAtd();toast('Pronto! O cliente foi avisado de que você está atendendo.');return;}
    const ax=t.closest('[data-ax]');if(ax){abreAnexo(ax.dataset.ax);return;}
    if(t.closest('[data-aclip]')){b.querySelector('#aFile').click();return;}
    if(t.closest('[data-asx]')){A.anexo=null;desenhaAtd();return;}
    if(t.closest('[data-aorc]')){transformar();return;}
    const cl=t.closest('[data-cl]');if(cl){cl.disabled=true;await acaoCli(cl.dataset.cl,cl.dataset.ac);return;}
    const rs=t.closest('[data-rs]');if(rs){const row=rs.closest('[data-rt]');const cid=row.querySelector('[data-rc]').value.split(/[,;\n]/).map(x=>x.trim()).filter(Boolean);
      const r=await sb.rpc('atd_rota',args({p_vend:row.dataset.rt,p_rota:row.querySelector('[data-rn]').value,p_cidades:cid,p_fone:row.querySelector('[data-rf]').checked}));
      if(r.error||(r.data&&r.data.erro)){toast('Não salvou.');return;}await Promise.all([lista(),carregaCli()]);desenhaCli();toast('Rota salva.');}});
  document.addEventListener('change',async e=>{const b=document.getElementById('atdBox');if(!b||!b.contains(e.target))return;const t=e.target;
    if(t.id==='aFile'){const f=t.files[0];if(!f)return;const a=await arquivo(f);if(a){A.anexo=a;desenhaAtd();}return;}
    if(t.id==='aSt'){const r=await sb.rpc('atd_set',args({p_atend:A.sel,p_status:t.value}));if(!r.error){const a=A.L.find(x=>x.id===A.sel);a.status=t.value;desenhaAtd();toast('Situação atualizada.');}return;}
    if(t.id==='aVd'&&t.value){const r=await sb.rpc('atd_set',args({p_atend:A.sel,p_vend:t.value}));if(r.error||(r.data&&r.data.erro)){toast('Não passou.');return;}await lista();if(!ADM)A.sel=null;await msgs(true);desenhaAtd();toast('Atendimento passado.');return;}
    if(t.id==='aOrc'&&t.value){const o=(D.orcs||[]).find(x=>x.id===t.value);if(!o)return;
      const tx=`Orçamento nº ${o.numero}\n${(o.itens||[]).map(i=>`${i.cod} ${i.cor||''} · ${i.qtd} ${i.un||''}`).join('\n')}\nTotal: R$ ${Number(o.total||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}${o.validade?'\nValidade: '+new Date(o.validade+'T12:00').toLocaleDateString('pt-BR'):''}`;
      if(await enviar(tx)){t.value='';const a=A.L.find(x=>x.id===A.sel);if(a&&a.status!=='pedido'){await sb.rpc('atd_set',args({p_atend:A.sel,p_status:'orcamento'}));a.status='orcamento';desenhaAtd();}}return;}
    if(t.dataset.cv!==undefined&&t.closest('tr')){const c=A.contas.find(x=>x.id===t.dataset.cv);if(c&&c.status==='ativo'){await sb.rpc('atd_conta',args({p_id:c.id,p_acao:'vend',p_vend:t.value||null}));toast('Vendedor do cliente atualizado.');}return;}
    if(t.id==='cLoja'){const r=await sb.rpc('atd_loja',args({p_on:t.checked}));if(r.error||!r.data){toast('Não salvou.');return;}A.loja=r.data;toast(r.data.on?'Área do cliente ligada no catálogo.':'Área do cliente desligada.');}});
  document.addEventListener('submit',async e=>{if(e.target.id!=='aCp')return;e.preventDefault();const tx=e.target.querySelector('#aTx'),v=tx.value.trim();if(!v&&!A.anexo)return;
    const bt=e.target.querySelector('.pri');bt.disabled=true;tx.value='';const ax=A.anexo;if(await enviar(v,ax)){A.anexo=null;desenhaAtd();}else{tx.value=v;bt.disabled=false;}});
  window.ATD={
    rotulo:k=>k==='atd'?rotAtd():'👤 Clientes do site'+(A.pend?' ('+A.pend+' novo'+(A.pend>1?'s':'')+')':''),
    async abrir(k){st();const b=document.getElementById('atdBox');if(!b)return;b.innerHTML='<p class="nota" style="padding:20px">Carregando…</p>';await lista();
      if(k==='cli'){await carregaCli();desenhaCli();}else{if(!A.sel&&A.L&&A.L.length)A.sel=A.L[0].id;desenhaAtd();const x=(A.L||[]).find(y=>y.id===A.sel);if(A.sel&&x&&!x.bloq&&!(x.fila&&!ADM))await msgs(true);}},
    ligar(){if(A.t)return;lista();A.t=setInterval(async()=>{if(document.hidden)return;await lista();if(document.getElementById('atdBox')&&typeof ABA!=='undefined'&&ABA==='atd'){const x=(A.L||[]).find(y=>y.id===A.sel);if(A.sel&&x&&!x.bloq&&!(x.fila&&!ADM))await msgs(false);const tx=document.getElementById('aTx');if(!tx||!tx.value)desenhaAtd();}},10000);}
  };
})();
