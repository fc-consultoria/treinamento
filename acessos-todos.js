/* ===== Painel da Matriz · 🏢 Empresas e logins · Todos os acessos =====
   Um quadro por cliente principal (CB, CDE, Guaporé Vidros, Guaporé Sinop, Genesis) com todos os logins
   de todas as ferramentas; os demais acessos em lista, agrupados por tipo.
   Fontes: RPC fc_acessos_todos (Supabase) + Mostruário (ALUNOS/EV/colabs do painel). */
(function(){
  if(typeof sb==='undefined')return;
  const $=id=>document.getElementById(id);
  const h=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
  const ON=3*60e3;
  const online=t=>!!t&&(Date.now()-Date.parse(t))<ON;
  const quando=t=>{if(!t)return 'nunca entrou';const m=Math.round((Date.now()-Date.parse(t))/60000);
    if(m<2)return 'agora';if(m<60)return 'há '+m+' min';const hr=Math.round(m/60);if(hr<24)return 'há '+hr+' h';const d=Math.round(hr/24);return d===1?'ontem':'há '+d+' dias';};
  const PAPEL={gestor:'Gestor geral',compras:'Compras',vendas:'Vendas',gerente:'Gerente comercial',marketing:'Marketing',fabrica:'Fábrica'};
  const CLI=[
    {k:'cb',n:'Casa Bandeirante',cor:'#0f6b70',m:s=>s==='cb'||/bandeirant/.test(s),emp:'cb'},
    {k:'cde',n:'CDE Vidros & Esquadrias',cor:'#0d5c8f',m:s=>/cde/.test(s),emp:'cde'},
    {k:'gv',n:'Guaporé Vidros',cor:'#6d4bd8',m:s=>/guapore/.test(s)&&!/sinop/.test(s),emp:'guapore'},
    {k:'gs',n:'Guaporé Sinop',cor:'#b45309',m:s=>/guapore/.test(s)&&/sinop/.test(s),emp:'guaporesinop'},
    {k:'gen',n:'Genesis',cor:'#1f8a4c',m:s=>/genesis/.test(s),emp:'genesis'}];
  const quem=s=>{const n=norm(s);return CLI.find(c=>c.m(n))||null;};
  const S={d:null,erro:'',busca:'',em:null,carregando:false,ab:new Set()};
  try{(JSON.parse(localStorage.getItem('fc_ax_ab')||'[]')||[]).forEach(k=>S.ab.add(k));}catch(_){}
  const guardaAb=()=>{try{localStorage.setItem('fc_ax_ab',JSON.stringify([...S.ab]));}catch(_){}};

  const css=document.createElement('style');
  css.textContent=`.axg{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px;padding:12px 16px 4px}
.axc{border:1px solid var(--line,#d7e0e5);border-radius:14px;background:#fff;overflow:hidden;display:flex;flex-direction:column}
.axh{display:flex;align-items:center;gap:8px;padding:11px 14px;color:#fff;font:700 16px var(--f-display,system-ui)}
.axh small{margin-left:auto;font:600 12px system-ui;opacity:.92}.axh{cursor:pointer;user-select:none}.axh .sv{font-size:13px;margin-left:4px;transition:transform .15s}.axc.fech .axh .sv{transform:rotate(-90deg)}
.axres{display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px}.axres span{font:600 12px system-ui;background:#f2f6f8;border-radius:99px;padding:3px 10px;color:#35505e}.axres span b{color:#13232e}
.axg{align-items:start}
.axs{padding:8px 14px 2px;font:700 12px system-ui;letter-spacing:.04em;text-transform:uppercase;color:#5b6d78;display:flex;align-items:center;gap:6px}
.axs button{margin-left:auto;font:600 12px system-ui;text-transform:none;letter-spacing:0;padding:3px 9px;border-radius:7px;border:1px solid #c9d6dd;background:#fff;cursor:pointer}
.axr{display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:9px;align-items:center;padding:7px 14px;border-top:1px solid #eef2f4}
.axr:first-of-type{border-top:0}.axr b{font-size:14px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.axr span.s{font-size:12px;color:#5b6d78;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.axd{width:10px;height:10px;border-radius:50%;background:#c7d0d5}.axd.on{background:#22b36b;box-shadow:0 0 0 3px #22b36b33}
.axt{font:700 11px system-ui;padding:2px 8px;border-radius:999px;background:#e8f5ee;color:#16683f;white-space:nowrap}
.axt.off{background:#f6e7e6;color:#9b2c24}.axt.pz{background:#fdf1dc;color:#8a5208}.axt.nv{background:#edf1f4;color:#4d5f6a}
.axr .ab{font:600 12px system-ui;padding:3px 8px;border-radius:7px;border:1px solid #c9d6dd;background:#fff;cursor:pointer;margin-left:6px}
.axv{padding:12px 14px;font-size:13px;color:#6b7d88}
.axbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:10px 16px 0}
.axbar input{flex:1;min-width:220px;font-size:15px;padding:9px 12px;border:1px solid #c9d6dd;border-radius:10px}
.axk{background:#f2f6f8;border-radius:10px;padding:6px 12px;font:600 13px system-ui;color:#35505e}.axk b{font-size:16px;color:#13232e;margin-right:4px}
.axl{padding:4px 16px 14px}.axl h3{margin:16px 0 6px;font:700 15px var(--f-display,system-ui)}
.axl .axc{border-radius:12px}`;
  document.head.appendChild(css);

  function card(){let c=$('axCard');if(c)return c;
    const ref=document.querySelector('section.kpis[data-tab="emp"]');if(!ref)return null;
    c=document.createElement('section');c.className='card';c.id='axCard';c.dataset.tab='emp';
    c.innerHTML=`<h2 style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">🔑 Todos os acessos <span class="note" style="font-weight:500;text-transform:none;letter-spacing:0">todas as pessoas com login, em qualquer ferramenta</span><button type="button" id="axRe" style="margin-left:auto;font:600 13px var(--f-display);text-transform:none;letter-spacing:0;padding:7px 12px;border-radius:9px;cursor:pointer">🔄 Atualizar</button></h2>
      <div class="axbar"><input id="axBusca" type="search" placeholder="Buscar pessoa, login ou empresa" autocomplete="off"><span id="axTot"></span></div>
      <div id="axBody"><p class="note" style="padding:12px 16px">Carregando…</p></div>`;
    ref.parentNode.insertBefore(c,ref);
    $('axRe').onclick=()=>carregar(true);
    $('axBusca').oninput=e=>{S.busca=norm(e.target.value);pinta();};
    return c;}

  /* ---- Mostruário (dados que o painel já carregou) ---- */
  function mostr(){
    let AL=[],ev=[];try{AL=ALUNOS||[];ev=EV||[];}catch(_){return [];}
    const ult={};for(const e of ev){if(!e.user_id)continue;const d=e.detalhe||{};const k=e.user_id+'|'+(d.cid||(d.quem?'q:'+d.quem:''));if(!ult[k])ult[k]=e.criado_em;if(!ult[e.user_id])ult[e.user_id]=e.criado_em;}
    return AL.filter(a=>a.nome&&a.nome.trim()).map(a=>{let C=[];try{C=colabs(a.user_id)||[];}catch(_){}
      return {uid:a.user_id,login:a.login,nome:a.nome,ativo:a.ativo,ult:ult[a.user_id]||null,
        col:C.map(x=>({nome:x.nome||'Colaborador',ini:x.ini,resta:x.resta,pz:x.pz,ult:ult[a.user_id+'|'+x.id]||null}))};});}

  const linha=(nome,sub,tag,ult,acao,busca)=>({nome,sub,tag,ult,acao,b:norm([nome,sub,busca].join(' '))});
  function tagCol(x){if(x.pz)return ['pausado','pz'];if(!x.ini)return ['ainda não entrou','nv'];if(x.resta!=null&&x.resta<=0)return ['72 h encerradas','off'];
    return ['restam '+Math.max(1,Math.round(x.resta/3600e3))+' h',''];}

  function montar(){
    const d=S.d||{},G={};CLI.forEach(c=>G[c.k]={c,sec:{}});
    const OUT={mostr:[],portal:{},demo:[],equipe:[],cat:[],precif:[],pessoas:[],cons:[]};
    const add=(c,sec,l)=>{(G[c.k].sec[sec]=G[c.k].sec[sec]||[]).push(l);};
    (d.pessoas||[]).forEach(p=>{const c=quem(p.emp);const l=linha(p.nome,'login '+p.login+' · '+(PAPEL[p.papel]||p.papel),p.ativo?['ativo','']:['inativo','off'],p.ult,null,p.emp);
      c?add(c,'Central do Gestor',l):OUT.pessoas.push(Object.assign(l,{grp:p.emp}));});
    (d.cons||[]).forEach(p=>{const c=quem(p.emp);const v=p.ate&&Date.parse(p.ate)>Date.now();const l=linha(p.nome,'acesso à página da consultoria',v?['liberado','']:['encerrado','nv'],p.em,null,p.emp);
      c?add(c,'Página da consultoria',l):OUT.cons.push(Object.assign(l,{grp:p.emp}));});
    (d.precif||[]).forEach(p=>{if(norm(p.login)==='fc'){OUT.equipe.push(linha('FC Consultoria','Precificação de Kits · login '+p.login,p.ativo?['ativo','']:['inativo','off'],p.ult,null,''));return;}
      const us=(p.usuarios||[]).filter(Boolean);const c=quem(p.emp+' '+p.nome);
      const l=linha(p.nome,'login '+p.login+(us.length?' · usuários: '+us.join(', '):''),p.ativo?['ativo','']:['inativo','off'],p.ult,null,p.emp);
      c?add(c,'Precificação de Kits',l):OUT.precif.push(Object.assign(l,{grp:p.emp}));});
    const catN={};(d.catcli||[]).forEach(x=>catN[x.id]=x.nome);
    (d.cat||[]).forEach(p=>{const c=quem(p.emp+' '+(catN[p.emp]||''));const st=p.status||'';
      const l=linha(p.nome+(p.empresa?' · '+p.empresa:''),'Catálogo virtual · '+(p.login||''),st==='ativo'?['ativo','']:[st||'—','nv'],p.ult,null,p.emp);
      c?add(c,'Catálogo virtual',l):OUT.cat.push(Object.assign(l,{grp:catN[p.emp]||p.emp}));});
    (d.portal||[]).forEach(p=>{const c=quem(p.cli);const t=p.visto&&(!p.ult||p.visto>p.ult)?p.visto:p.ult;
      const l=linha(p.nome,'link de acompanhamento da implantação',p.ativo?['link ativo','']:['link desligado','nv'],t,null,p.cli);
      c?add(c,'Acompanhamento da implantação',l):(OUT.portal[p.cli]=OUT.portal[p.cli]||[]).push(l);});
    mostr().forEach(a=>{const c=quem(a.login+' '+a.nome);
      const ab={t:'Abrir',f:()=>abrirMostr(a.uid)};
      const L=[linha(a.nome,'Mostruário · login '+a.login,a.ativo?['empresa ativa','']:['bloqueada','off'],a.ult,ab,a.login)];
      a.col.forEach(x=>L.push(linha(x.nome,'colaborador · '+(x.ini?'1º acesso '+new Date(x.ini).toLocaleDateString('pt-BR'):'sem acesso ainda'),tagCol(x),x.ult,null,a.nome+' '+a.login)));
      if(c)L.forEach(l=>add(c,'Mostruário 3D',l));else OUT.mostr.push({emp:a.nome,L});});
    (d.demo||[]).forEach(x=>{let t;if(x.encerrado)t=['encerrado','nv'];else if(!x.inicio)t=['aguardando abrir','pz'];else{const r=Date.parse(x.inicio)+(x.horas||72)*3600e3-Date.now();t=r>0?['restam '+Math.max(1,Math.round(r/3600e3))+' h','']:['prazo acabou','off'];}
      OUT.demo.push(linha(x.nome,'link de teste '+x.code+(x.cidade?' · '+x.cidade:'')+' · '+(x.horas||72)+' h',t,x.ult||x.inicio,null,x.cidade));});
    (d.equipe||[]).forEach(x=>OUT.equipe.unshift(linha(x.nome,(x.admin?'Matriz':'Equipe')+' · '+x.email,['ativo',''],x.ult,null,'')));
    return {G,OUT};}

  function abrirMostr(uid){try{sel=uid;render();detalhe();const c=$('detCard');if(c)c.scrollIntoView({behavior:'smooth'});}catch(e){console.warn(e);}}

  const ORDEM=['Central do Gestor','Mostruário 3D','Acompanhamento da implantação','Catálogo virtual','Precificação de Kits','Página da consultoria'];
  let ACOES=[];
  function rows(L){return L.filter(l=>!S.busca||l.b.includes(S.busca)).sort((a,b)=>(online(b.ult)-online(a.ult))).map(l=>{let bt='';
    if(l.acao){ACOES.push(l.acao.f);bt=`<button type="button" class="ab" data-ax="${ACOES.length-1}">${h(l.acao.t)}</button>`;}
    const [tt,tc]=l.tag||['',''];
    return `<div class="axr"><span class="axd ${online(l.ult)?'on':''}" title="${online(l.ult)?'online agora':''}"></span><div><b>${h(l.nome)}</b><span class="s">${h(l.sub)} · ${online(l.ult)?'<b style="display:inline;color:#16683f">online agora</b>':h(quando(l.ult))}</span></div><div style="white-space:nowrap">${tt?`<span class="axt ${tc}">${h(tt)}</span>`:''}${bt}</div></div>`;}).join('');}

  function pinta(){const body=$('axBody');if(!body)return;
    if(S.erro){body.innerHTML=`<p class="msg bad" style="margin:12px 16px">Não carregou os acessos: ${h(S.erro)}</p>`;return;}
    if(!S.d){body.innerHTML='<p class="note" style="padding:12px 16px">Carregando…</p>';return;}
    ACOES=[];const {G,OUT}=montar();let tot=0,on=0;const conta=L=>L.forEach(l=>{tot++;if(online(l.ult))on++;});
    const quadros=CLI.map(c=>{const g=G[c.k];let n=0,o=0;const secs=ORDEM.filter(s=>g.sec[s]).map(s=>{const L=g.sec[s];conta(L);n+=L.length;o+=L.filter(l=>online(l.ult)).length;
        const r=rows(L);if(!r)return '';
        const ger=s==='Central do Gestor'&&typeof abrirAcessos==='function'?`<button type="button" data-axg="${c.emp}|${h(c.n)}">Gerenciar</button>`:'';
        return `<div class="axs">${h(s)} · ${L.length}${ger}</div>${r}`;}).join('');
      if(S.busca&&!secs)return '';
      const aberto=S.busca?true:S.ab.has(c.k);
      const res=ORDEM.filter(x=>g.sec[x]).map(x=>{const L=g.sec[x],oo=L.filter(l=>online(l.ult)).length;return `<span>${h(x)} · <b>${L.length}</b>${oo?' · 🟢 '+oo:''}</span>`;}).join('');
      return `<div class="axc ${aberto?'':'fech'}"><div class="axh" style="background:${c.cor}" data-axab="${c.k}" role="button" tabindex="0" aria-expanded="${aberto}" title="${aberto?'Toque para ocultar':'Toque para abrir'}"><span class="sv">▾</span>${h(c.n)}<small>${n} acesso${n===1?'':'s'}${o?' · 🟢 '+o+' online':''}</small></div>${aberto?(secs||'<p class="axv">Nenhum acesso cadastrado ainda.</p>'):(res?`<div class="axres">${res}</div>`:'<p class="axv">Nenhum acesso cadastrado ainda.</p>')}</div>`;}).join('');
    const grupo=(tit,L,vazio)=>{conta(L);const r=rows(L);if(!r&&(S.busca||!vazio))return '';return `<h3>${tit} <span class="note" style="font-weight:500">· ${L.length}</span></h3><div class="axc">${r||`<p class="axv">${vazio}</p>`}</div>`;};
    let outros='';
    OUT.mostr.forEach(m=>{conta(m.L);const r=rows(m.L);if(r)outros+=`<div class="axc" style="margin-bottom:8px"><div class="axs">${h(m.emp)} · ${m.L.length-1} colaborador${m.L.length===2?'':'es'}</div>${r}</div>`;});
    if(outros)outros=`<h3>🎓 Mostruário · outras empresas <span class="note" style="font-weight:500">· ${OUT.mostr.length}</span></h3>`+outros;
    let port='';Object.keys(OUT.portal).sort().forEach(k=>{const L=OUT.portal[k];conta(L);const r=rows(L);if(r)port+=`<div class="axc" style="margin-bottom:8px"><div class="axs">${h(k)} · ${L.length}</div>${r}</div>`;});
    if(port)outros+=`<h3>📡 Acompanhamento da implantação</h3>`+port;
    outros+=grupo('🏢 Central do Gestor · outras empresas',OUT.pessoas,'');
    outros+=grupo('📚 Catálogo virtual · outras contas',OUT.cat,'');
    outros+=grupo('🧮 Precificação de Kits · outros logins',OUT.precif,'');
    outros+=grupo('🧭 Página da consultoria · outros',OUT.cons,'');
    outros+=grupo('🧪 Links de teste',OUT.demo,'Nenhum link de teste.');
    outros+=grupo('🛠 Equipe FC',OUT.equipe,'');
    body.innerHTML=`<div style="display:flex;gap:8px;padding:10px 16px 0"><button type="button" data-axall="1" style="font-size:12.5px">▾ Abrir todas</button><button type="button" data-axall="0" style="font-size:12.5px">▸ Ocultar todas</button></div><div class="axg">${quadros||'<p class="note">Nenhum cliente principal com esse nome.</p>'}</div><div class="axl"><h3 style="margin-top:8px;font-size:17px">Demais acessos</h3>${outros||'<p class="note">Nada encontrado.</p>'}</div>`;
    $('axTot').innerHTML=`<span class="axk"><b>${tot}</b>acessos</span><span class="axk"><b style="color:#16683f">${on}</b>online agora</span>`+(S.em?`<span class="note">atualizado às ${S.em.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>`:'');
    body.querySelectorAll('[data-ax]').forEach(b=>b.onclick=()=>{const f=ACOES[+b.dataset.ax];f&&f();});
    body.querySelectorAll('[data-axab]').forEach(el=>{const t=()=>{const k=el.dataset.axab;S.ab.has(k)?S.ab.delete(k):S.ab.add(k);guardaAb();pinta();};el.onclick=ev=>{if(ev.target.closest('button'))return;t();};el.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();t();}};});
    body.querySelectorAll('[data-axall]').forEach(b=>b.onclick=()=>{if(b.dataset.axall==='1')CLI.forEach(c=>S.ab.add(c.k));else S.ab.clear();guardaAb();pinta();});
    body.querySelectorAll('[data-axg]').forEach(b=>b.onclick=()=>{const [e,n]=b.dataset.axg.split('|');abrirAcessos(e,n);});}

  async function carregar(forca){if(S.carregando)return;if(!card())return;S.carregando=true;
    try{const r=await sb.rpc('fc_acessos_todos');if(r.error)throw r.error;S.d=r.data||{};S.erro='';S.em=new Date();}
    catch(e){S.erro=e.message||String(e);}
    S.carregando=false;pinta();}

  /* carrega quando a aba aparece e renova a cada 60 s enquanto estiver aberta */
  let ult=0;
  setInterval(()=>{const c=card();if(!c)return;const vis=c.offsetParent!==null;
    if(vis&&(!S.d||Date.now()-ult>60e3)){ult=Date.now();carregar();}
    else if(vis&&S.d&&!S.carregando&&!document.activeElement?.closest?.('#axCard'))pintaLeve();},2000);
  let pl=0;function pintaLeve(){if(Date.now()-pl<15e3)return;pl=Date.now();pinta();}
  window.acessosTodosLoad=()=>carregar(true);
})();
