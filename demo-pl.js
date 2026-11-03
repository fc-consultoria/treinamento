/* ===== Painel da Matriz · Demonstrativos da Plataforma FC 3D =====
   Lista quem entrou pelo link de 3 dias (fc3d/clientes/demo/) e avisa com som quando entra alguém novo.
   Usa a sessão do Acesso FC da Plataforma (mesmo navegador) ou a senha da FC digitada aqui uma vez. */
(function(){
  const URL0='https://pawwncmfadzxfahfvhry.supabase.co/rest/v1/rpc/',KEY='sb_publishable_b0kGoqo85joo3Vb8Xllxhw_VemwaLMs';
  const LINK='https://fc-consultoria.github.io/fc3d/clientes/demo/',ADM='https://fc-consultoria.github.io/fc3d/clientes/empresas/';
  const KT='pfc-token-painel',KV='fc_demo_pl_vistos';
  const e=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const lg=k=>{try{return localStorage.getItem(k);}catch(_){return null;}},ls=(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}};
  const zap=w=>{let n=String(w||'').replace(/\D/g,'');if(n.length<=11)n='55'+n;return 'https://wa.me/'+n;};
  const quando=d=>{if(!d)return '—';const m=Math.round((Date.now()-new Date(d))/6e4);if(m<2)return 'agora';if(m<60)return 'há '+m+' min';const h=Math.round(m/60);if(h<24)return 'há '+h+' h';return new Date(d).toLocaleDateString('pt-BR');};
  /* ---- Textos prontos por etapa (edite aqui para mudar o padrão) ---- */
  const ETAPAS=[
    ['boas','1 · Boas-vindas',d=>`Olá, ${d.n}! Aqui é o Fernando, da FC Consultoria em Esquadria. 👋

Seu acesso ao demonstrativo da Plataforma FC 3D está liberado até ${d.ate}.

A Plataforma FC 3D não é um sistema de cálculo nem de orçamento. É uma ferramenta para o comercial conhecer a fundo os perfis e componentes que vende.

Nas linhas Suprema, Gold, Fachada Cortina e Fachada Atlanta você vê onde vai cada perfil e componente, as substituições possíveis e a referência de pressão de vento.

Link: ${LINK}

Qualquer dúvida, me chama aqui.`],
    ['dica','2 · Acompanhamento',d=>`Oi, ${d.n}! Tudo certo com o demonstrativo da Plataforma FC 3D?

Uma dica: abra uma tipologia e use o "Conhecer a esquadria". Lá você vê onde vai cada perfil, as substituições possíveis e a referência de pressão de vento, sem sair da tela.

É esse conhecimento que deixa o vendedor seguro no atendimento ao serralheiro, ao distribuidor ou ao cliente final.

Seu acesso vai até ${d.ate}. Se quiser, te mostro como a sua equipe comercial pode usar no dia a dia.`],
    ['ultimo','3 · Último dia',d=>`${d.n}, seu demonstrativo da Plataforma FC 3D termina ${d.ate}.

Se fez sentido ter a sua equipe comercial conhecendo cada perfil e componente que vende, me responde aqui que te apresento os planos de licença anual.`],
    ['fim','4 · Terminou',d=>`Olá, ${d.n}! Seu período de demonstrativo da Plataforma FC 3D terminou.

Obrigado por conhecer a ferramenta! Se quiser que a sua equipe comercial continue com os perfis e componentes na mão, me responde aqui que te passo os planos e valores.

Fernando · FC Consultoria em Esquadria`],
    ['mais','Mais 3 dias',d=>`${d.n}, liberei mais 3 dias no seu demonstrativo da Plataforma FC 3D. Agora vai até ${d.ate}.

Link: ${LINK}`]];
  const DIAS=['dom','seg','ter','qua','qui','sex','sáb'];
  const fdt=x=>{const t=new Date(x);return DIAS[t.getDay()]+' '+t.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit'})+' às '+t.toLocaleString('pt-BR',{hour:'2-digit',minute:'2-digit'});};
  const etapaAuto=d=>{const ag=Date.now(),fim=new Date(d.expira)-ag,ini=ag-new Date(d.criado);
    if(!d.ativo||fim<=0)return 'fim';if(fim<24*36e5)return 'ultimo';if(ini>=24*36e5)return 'dica';return 'boas';};
  const ESC={},ED={};  /* etapa escolhida à mão e texto editado, por pessoa (sobrevivem à atualização de 1 min) */
  /* 03/11/2026 · sequência 1→4: quais já foram enviadas (verde), qual é a próxima e quando */
  const SEQ=['boas','dica','ultimo','fim'],H24=24*36e5;
  const quandoEtapa=(d,k)=>{const c=+new Date(d.criado),x=+new Date(d.expira);
    return k==='boas'?c:k==='dica'?c+H24:k==='ultimo'?Math.max(c+H24,x-H24):x;};
  const enviou=(d,k)=>{const o=envs(),t=o[d.id+'|'+k];if(!t)return 0;const m=o[d.id+'|mais']||0;
    return (k==='ultimo'||k==='fim')&&m>t?0:t;}; /* depois de "+3 dias" o último dia/terminou contam de novo */
  function proxima(d){if(!d.ativo)return null;const ag=Date.now();
    const venc=SEQ.filter(k=>quandoEtapa(d,k)<=ag),ult=venc[venc.length-1];
    if(ult&&!enviou(d,ult))return {k:ult,agora:true};
    const fut=SEQ.find(k=>quandoEtapa(d,k)>ag&&!enviou(d,k));return fut?{k:fut,agora:false,em:quandoEtapa(d,fut)}:null;}
  const nomeEt=k=>ETAPAS.find(x=>x[0]===k)[1];
  const etapaDe=d=>{if(ESC[d.id])return ESC[d.id];const p=proxima(d);return p&&p.agora?p.k:etapaAuto(d);};
  const textoDe=d=>{const k=etapaDe(d),ed=ED[d.id+'|'+k];if(ed!=null)return ed;
    const n=String(d.nome||'').trim().split(/\s+/)[0]||'tudo bem';return ETAPAS.find(x=>x[0]===k)[2]({n,ate:fdt(d.expira)});};
  /* 03/11/2026 · quadro compartilhado Fernando/Regina: etapa, responsável, anotação e mensagens enviadas ficam no banco (pfc_demo_crm) */
  const KE='fc_demo_msg_env',KEU='fc_demo_eu',KQ='fc_demo_vista',KF='fc_demo_filtro';
  let CRM={},CRMOK=false,VISTA=lg(KQ)||'quadro',FIL=lg(KF)||'todos',BUSCA='',ABERTO=null;
  const EU=()=>lg(KEU)||'';
  const loc=()=>{try{return JSON.parse(lg(KE))||{};}catch(_){return {};}};
  const crm=id=>CRM[id]||(CRM[id]={enviados:{}});
  const envs=()=>{if(!CRMOK)return loc();const o={};for(const id in CRM){const en=(CRM[id]&&CRM[id].enviados)||{};for(const k in en)o[id+'|'+k]=en[k];}return o;};
  async function salvar(id,a){try{await rpc('pfc_adm_demo_crm_salvar',Object.assign({p_token:TOK,p_id:id,p_por:EU()||null},a));}catch(x){console.warn('Quadro FC 3D:',x.message);}}
  const marcar=(id,k)=>{const t=Date.now();if(!CRMOK){const o=loc();o[id+'|'+k]=t;ls(KE,JSON.stringify(o));return;}crm(id).enviados[k]=t;salvar(id,{p_env_k:k,p_env_on:true,p_env_t:t});};
  const desmarcar=(id,k)=>{if(!CRMOK){const o=loc();delete o[id+'|'+k];ls(KE,JSON.stringify(o));return;}delete crm(id).enviados[k];salvar(id,{p_env_k:k,p_env_on:false});};
  function migrar(){const lo=loc(),ks=Object.keys(lo);if(!ks.length)return;
    ks.forEach(key=>{const i=key.lastIndexOf('|'),id=key.slice(0,i),k=key.slice(i+1);if(!D.find(d=>String(d.id)===id))return;
      const c=crm(id);if(c.enviados[k]==null){c.enviados[k]=lo[key];salvar(id,{p_env_k:k,p_env_on:true,p_env_t:lo[key]});}});
    ls(KE+'_antigo',JSON.stringify(lo));ls(KE,'{}');}
  async function rpc(fn,a){const r=await fetch(URL0+fn,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(a||{})});
    const j=await r.json().catch(()=>null);if(!r.ok)throw new Error((j&&(j.message||j.hint))||'Falha');return j;}
  let TOK=null,D=null,primeira=true;
  async function token(){for(const t of [TOK,lg(KT),lg('pfc-token')]){if(!t)continue;try{await rpc('pfc_adm_demo_lista',{p_token:t});TOK=t;return t;}catch(_){}}TOK=null;return null;}
  async function carregar(){if(!TOK&&!await token()){D=null;ui();return;}
    try{D=await rpc('pfc_adm_demo_lista',{p_token:TOK})||[];}catch(_){TOK=null;D=null;ui();return;}
    try{CRM=await rpc('pfc_adm_demo_crm_lista',{p_token:TOK})||{};for(const id in CRM)CRM[id].enviados=CRM[id].enviados||{};CRMOK=true;migrar();}catch(_){CRMOK=false;}
    let vis=[];try{vis=JSON.parse(lg(KV))||[];}catch(_){}
    const nov=D.filter(d=>!vis.includes(d.id));
    if(nov.length&&!(primeira&&!vis.length))nov.forEach(avisar);
    ls(KV,JSON.stringify(D.map(d=>d.id).slice(0,500)));primeira=false;ui();}
  function avisar(d){const o={k:'demo-'+d.id,titulo:`🧊 ${d.nome} (${d.empresa}) entrou no demonstrativo`,sub:'Plataforma FC 3D · link de 3 dias'+(d.cidade?' · '+d.cidade:''),texto:'WhatsApp: '+d.whats,wa:zap(d.whats),
      fn:()=>{try{ptab('ped');}catch(_){}ABERTO=d.id;ui();setTimeout(()=>{const c=document.getElementById('dplCard');if(c)c.scrollIntoView({behavior:'smooth',block:'start'});},300);}};
    if(window.alertaGrande)window.alertaGrande(o);
    try{if(document.hidden&&'Notification' in window&&Notification.permission==='granted'){const n=new Notification(o.titulo,{body:o.sub,tag:o.k,requireInteraction:true});n.onclick=()=>{window.focus();n.close();o.fn();};}}catch(_){}}
  /* 01/11/2026 · on-line agora, tempo de uso e convite automático (convite.js da Plataforma) */
  const hm=x=>new Date(x).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const NCV={dica:'Dica',convite:'Convite',ultimo:'Último dia'};
  function onl(d){const ref=d.agora?new Date(d.agora):new Date(),seg=d.visto_em?(ref-new Date(d.visto_em))/1e3:1e9;
    const on=seg<75,uso=Math.round((d.uso_seg||0)/60);let h='';
    if(on)h+=`<br><span style="display:inline-flex;align-items:center;gap:5px;color:#1d7a45;font-weight:700;font-size:13px"><span style="width:9px;height:9px;border-radius:50%;background:#22a45d;box-shadow:0 0 0 3px #22a45d33"></span>On-line agora</span>${d.tela?'<br><span class="note">vendo: '+e(d.tela)+'</span>':''}`;
    else if(d.visto_em)h+=`<br><span class="note">⚪ visto ${quando(d.visto_em)}${d.tela?' · '+e(d.tela):''}</span>`;
    if(uso)h+=`<br><span class="note">uso: ${uso<60?uso+' min':Math.floor(uso/60)+' h '+(uso%60)+' min'}</span>`;
    const cv=d.convites||{};Object.keys(NCV).forEach(k=>{const x=cv[k];if(!x||!x.visto)return;
      h+=`<br><span style="font-size:12px;color:${x.clicou?'#1d7a45':'#5b6b6d'}">${NCV[k]} exibido ${hm(x.visto)}${x.clicou?' · clicou no WhatsApp ✅':x.fechou?' · fechou':''}</span>`;});
    return h;}
  function celMsg(d){const k=etapaDe(d),env=enviou(d,k)||(k==='mais'&&envs()[d.id+'|mais']),p=proxima(d);
    const chip=x=>{const ok=enviou(d,x),ag=p&&p.k===x&&p.agora,nx=p&&p.k===x&&!p.agora;
      const [bg,cr,bd]=ok?['#e3f4ea','#1d7a45','#22a45d']:ag?['#fff1dc','#8a5a00','#e8912d']:nx?['#eef3ff','#2a4f9a','#7d9ae0']:['#f3f4f5','#8a9496','#d5dadb'];
      return `<button type="button" data-dmk="${d.id}" data-k="${x}" title="${e(nomeEt(x))}${ok?' · enviado '+quando(ok):ag?' · hora de enviar':nx?' · próxima':''} · clique 2x para ${ok?'desmarcar':'marcar como enviado'}" style="padding:1px 8px;cursor:pointer;user-select:none;font-size:12px;border-radius:12px;border:1.5px solid ${bd};background:${bg};color:${cr};font-weight:700;${x===k?'outline:2px solid '+bd+';outline-offset:1px;':''}">${ok?'✔ ':''}${SEQ.indexOf(x)+1}</button>`;};
    const aviso=!d.ativo?'<span style="font-size:12px;color:#8a9496">pausado · sem próxima</span>'
      :!p?'<span style="font-size:12px;color:#1d7a45;font-weight:700">✔ sequência completa</span>'
      :p.agora?`<span style="font-size:12px;color:#8a5a00;font-weight:700">🔔 Enviar agora: ${e(nomeEt(p.k))}</span>`
      :`<span style="font-size:12px;color:#2a4f9a">⏭ Próxima: <b>${e(nomeEt(p.k))}</b> · ${fdt(p.em)}</span>`;
    return `<div data-dmbox>`+`<div style="display:flex;gap:4px;align-items:center;margin-bottom:4px;flex-wrap:wrap">${SEQ.map(chip).join('')}<span style="width:4px"></span>${aviso}</div>
     <div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;flex-wrap:wrap">
      <select data-dme="${d.id}" style="font-size:12.5px;padding:3px 6px;${env?'border-color:#22a45d;color:#1d7a45;':''}">${ETAPAS.map(x=>{const ok=x[0]==='mais'?envs()[d.id+'|mais']:enviou(d,x[0]);
        return `<option value="${x[0]}"${x[0]===k?' selected':''}${ok?' style="color:#1d7a45;background:#e3f4ea"':''}>${ok?'✔ ':''}${x[1]}${p&&p.k===x[0]?(p.agora?' 🔔 enviar':' ⏭ próxima'):''}</option>`;}).join('')}</select>
      ${env?`<span style="font-size:12px;color:#1d7a45">✔ enviado ${quando(env)}</span>`:''}</div>
     <textarea data-dmt="${d.id}" rows="4" style="width:100%;${env?'border:1.5px solid #22a45d;background:#f2faf5;':''}font-size:12.5px;line-height:1.35;resize:vertical;box-sizing:border-box">${e(textoDe(d))}</textarea>
     <div style="display:flex;gap:6px;margin-top:4px"><button type="button" data-dmc="${d.id}">📋 Copiar</button>
      <a href="#" data-dmw="${d.id}" style="font-size:13px;align-self:center">💬 Abrir no WhatsApp com o texto</a></div></div>`;}
  /* ===== 03/11/2026 · Quadro de acompanhamento (funil) · Fernando e Regina ===== */
  const PESSOAS=[['Fernando','#2a4f9a','#eef3ff'],['Regina','#7a3fa8','#f4ecfb']];
  const corP=r=>PESSOAS.find(p=>p[0]===r)||['','#5b6b6d','#f1f3f4'];
  const FASES=[['novo','Novo','#7d9ae0'],['explorando','Explorando','#22a45d'],['ultimo','Último dia','#e8912d'],
    ['negociando','Negociando','#b4372f'],['fechado','Fechado','#1d7a45'],['perdido','Encerrado','#8a9496']];
  const MANUAL=['negociando','fechado','perdido'],nomeF=f=>(FASES.find(x=>x[0]===f)||['',''])[1];
  const online=d=>{const ref=d.agora?new Date(d.agora):new Date();return d.visto_em&&(ref-new Date(d.visto_em))/1e3<75;};
  const faseAuto=d=>{const fim=new Date(d.expira)-Date.now();if(d.status==='pendente')return 'novo';
    if(!d.ativo||fim<=0)return 'perdido';if(fim<H24)return 'ultimo';
    if((d.uso_seg||0)>=60||(d.entradas||1)>1)return 'explorando';return 'novo';};
  const faseDe=d=>(CRM[d.id]&&CRM[d.id].fase)||faseAuto(d);
  const quente=d=>{const cv=d.convites||{};return faseDe(d)==='negociando'||(d.uso_seg||0)>=300||Object.keys(cv).some(k=>cv[k]&&cv[k].clicou);};
  const acao=d=>{const f=faseDe(d);if(f==='fechado'||(CRM[d.id]&&CRM[d.id].fase==='perdido'))return '';
    if(d.status==='pendente')return 'Liberar acesso';const p=proxima(d);return p&&p.agora?'Enviar '+nomeEt(p.k):'';};
  const fUso=s=>{const u=Math.round((s||0)/60);return u<60?u+' min':Math.floor(u/60)+' h '+(u%60)+' min';};
  const passa=d=>{const r=(CRM[d.id]&&CRM[d.id].resp)||'';
    if(FIL==='meus'&&EU()&&r!==EU())return false;if((FIL==='Fernando'||FIL==='Regina')&&r!==FIL)return false;
    if(FIL==='sem'&&r)return false;if(FIL==='quentes'&&!quente(d))return false;
    if(BUSCA&&!(d.nome+' '+(d.empresa||'')+' '+(d.cidade||'')+' '+(d.whats||'')).toLowerCase().includes(BUSCA))return false;return true;};
  let CSS=false;
  function estilo(){if(CSS)return;CSS=true;const s=document.createElement('style');s.textContent=`
.dq-m{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:10px}
.dq-m div{background:#f3f6f8;border-radius:10px;padding:8px 12px}.dq-m small{display:block;font-size:12px;color:var(--muted)}.dq-m b{font-size:22px}
.dq-hoje{border:1px solid #f0c27a;background:#fff8ec;border-radius:12px;padding:8px 12px;margin-bottom:10px}
.dq-ch{display:inline-flex;gap:4px;align-items:center;font-size:12.5px;background:#fff;border:1px solid #f0d9b0;border-radius:8px;padding:3px 9px;margin:4px 4px 0 0;cursor:pointer}
.dq-bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
.dq-f{font-size:12.5px;padding:3px 10px;border-radius:14px}.dq-f.on{background:var(--accent-soft);border-color:var(--accent);color:var(--accent);font-weight:700}
.dq-q{display:grid;grid-template-columns:repeat(6,minmax(180px,1fr));gap:8px;overflow-x:auto;padding-bottom:4px}
.dq-col{background:#f1f4f6;border-radius:12px;padding:8px;min-height:140px;border:2px dashed transparent}.dq-col.dq-sobre{border-color:var(--accent);background:var(--accent-soft)}
.dq-ct{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700;margin:2px 4px 8px}.dq-ct i{width:9px;height:9px;border-radius:50%;display:inline-block}
.dq-c{background:#fff;border:1px solid var(--line);border-radius:9px;padding:8px 10px;margin-bottom:7px;cursor:pointer}.dq-c:hover{border-color:var(--accent)}
.dq-c b{font-size:13.5px}.dq-s{font-size:12px;color:var(--muted);margin-top:2px;line-height:1.35}
.dq-p{display:inline-block;font-size:11px;font-weight:700;padding:1px 7px;border-radius:7px;margin:5px 4px 0 0}
.dq-fundo{position:fixed;inset:0;background:rgba(20,30,40,.35);z-index:9998}
.dq-g{position:fixed;top:0;right:0;height:100vh;width:min(470px,100vw);background:#fff;z-index:9999;overflow:auto;padding:16px 18px;box-shadow:-8px 0 24px rgba(0,0,0,.18);box-sizing:border-box}
.dq-g h3{margin:0;font-size:19px}.dq-g .lb{font-size:12px;font-weight:700;color:var(--muted);margin:14px 0 5px;text-transform:uppercase;letter-spacing:.03em}`;
    document.head.appendChild(s);
    document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&ABERTO){ABERTO=null;ui();}});}
  function cartao(d){const c=CRM[d.id]||{},r=c.resp,[,cr,bg]=corP(r),a=acao(d),ag=Date.now(),fim=new Date(d.expira);
    const l1=online(d)?`<span style="color:#1d7a45;font-weight:700">● On-line</span>${d.tela?' · '+e(d.tela):''}`
      :d.status==='pendente'?'Aguardando liberação':!d.ativo?'Pausado':fim<ag?'Terminou '+quando(d.expira):'Vence '+fdt(d.expira);
    const l2=(d.uso_seg||0)>=60?'uso '+fUso(d.uso_seg)+' · '+(d.entradas||1)+'x':'entrou '+quando(d.criado);
    return `<div class="dq-c" draggable="true" data-dqc="${d.id}"><b>${e(d.nome)}</b>${d.empresa?`<div class="dq-s">${e(d.empresa)}${d.cidade?' · '+e(d.cidade):''}</div>`:''}
      <div class="dq-s">${l1}<br>${l2}</div>
      ${c.nota?`<div class="dq-s" style="color:var(--fg);font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">“${e(c.nota)}”</div>`:''}
      ${quente(d)?'<span class="dq-p" style="background:#f9e5e3;color:#b4372f">Quente</span>':''}${a?`<span class="dq-p" style="background:#fff1dc;color:#8a5a00">🔔 ${e(a)}</span>`:''}${r?`<span class="dq-p" style="background:${bg};color:${cr}">${e(r)}</span>`:''}</div>`;}
  function corpo(){const cx=document.getElementById('dqCorpo');if(!cx)return;const L=D.filter(passa);
    const hj=L.filter(d=>acao(d));
    let h=`<div class="dq-hoje"><b style="font-size:13.5px;color:#8a5a00">🔔 Fazer hoje · ${hj.length} contato${hj.length===1?'':'s'}</b>
      ${hj.length?'<div>'+hj.map(d=>`<span class="dq-ch" data-dqa="${d.id}"><b>${e(String(d.nome).split(' ')[0])}</b> · ${e(acao(d))}</span>`).join('')+'</div>'
        :'<span class="note" style="margin-left:6px">Nada pendente agora.</span>'}</div>`;
    if(VISTA==='lista')h+=lista(L);
    else{const ord=(x,y)=>(!!acao(y)-!!acao(x))||(quente(y)-quente(x))||(new Date(y.criado)-new Date(x.criado));
      h+=`<div class="dq-q">${FASES.map(([f,n,cor])=>{const it=L.filter(d=>faseDe(d)===f).sort(ord);
        return `<div class="dq-col" data-dqcol="${f}"><div class="dq-ct"><i style="background:${cor}"></i>${n}<span style="margin-left:auto;font-weight:400;color:var(--muted)">${it.length}</span></div>${it.map(cartao).join('')}</div>`;}).join('')}</div>
      <p class="note" style="margin:6px 0 0">Novo, Explorando e Último dia andam sozinhos pelo uso e pelo prazo. Arraste para Negociando, Fechado ou Encerrado quando a conversa avançar (no tablet, use a etapa dentro da ficha).</p>`;}
    cx.innerHTML=L.length||!BUSCA?h:'<p class="note">Ninguém encontrado com esse filtro.</p>';liga(cx);}
  function lista(L){const agora=Date.now();
    const st=d=>!d.ativo?['Pausado','#b3261e']:new Date(d.expira)<agora?['Terminou','#8a5a00']:['Ativo até '+new Date(d.expira).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}),'#1d7a45'];
    return `<div class="tw"><table><thead><tr><th>Nome</th><th>Empresa · cidade</th><th>Entrou</th><th>Situação</th><th></th><th>Mensagem da etapa · copie e envie</th></tr></thead><tbody>${L.map(d=>{const [t,c]=st(d),r=(CRM[d.id]||{}).resp,[,cr,bg]=corP(r);return `<tr>
      <td><b>${e(d.nome)}</b><br><a href="${zap(d.whats)}" target="_blank" rel="noopener">💬 ${e(d.whats)}</a><br><span class="dq-p" style="background:#f1f3f4;color:#44515a">${nomeF(faseDe(d))}</span>${r?`<span class="dq-p" style="background:${bg};color:${cr}">${e(r)}</span>`:''}</td>
      <td>${e(d.empresa)}${d.cidade?'<br><span class="note">'+e(d.cidade)+'</span>':''}</td>
      <td>${new Date(d.criado).toLocaleDateString('pt-BR')}<br><span class="note">último: ${quando(d.ultimo)} · ${d.entradas||1}x</span></td>
      <td><b style="color:${c}">${t}</b>${onl(d)}</td>
      <td style="white-space:nowrap"><button type="button" data-dpm="${d.id}">+3 dias</button> <button type="button" class="${d.ativo?'no':'ok'}" data-dpa="${d.id}" data-v="${d.ativo?0:1}">${d.ativo?'Pausar':'Reativar'}</button></td>
      <td style="min-width:300px;vertical-align:top">${celMsg(d)}</td></tr>`;}).join('')}</tbody></table></div>`;}
  function gaveta(){const g=document.getElementById('dqG');if(!g)return;const d=ABERTO&&D.find(x=>String(x.id)===String(ABERTO));
    if(!d){g.innerHTML='';return;}const c=CRM[d.id]||{},fa=faseAuto(d);
    g.innerHTML=`<div class="dq-fundo" data-dqx></div><div class="dq-g" role="dialog" aria-label="Ficha de ${e(d.nome)}">
      <div style="display:flex;align-items:flex-start;gap:8px"><div style="flex:1"><h3>${e(d.nome)}</h3>
        <div class="note">${e(d.empresa||'')}${d.cidade?' · '+e(d.cidade):''}</div>
        <a href="${zap(d.whats)}" target="_blank" rel="noopener" style="font-size:14px">💬 ${e(d.whats)}</a></div>
        <button type="button" data-dqx aria-label="Fechar" style="font-size:16px">✕</button></div>
      <div class="lb">Situação</div><div style="font-size:13.5px">Entrou ${new Date(d.criado).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · ${d.entradas||1}x
        · ${d.status==='pendente'?'<b style="color:#8a5a00">aguardando liberação</b>':!d.ativo?'<b style="color:#b3261e">pausado</b>':'vence '+fdt(d.expira)}${onl(d)}</div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">${d.status==='pendente'?`<button type="button" class="pri" data-dpa="${d.id}" data-v="1">Liberar agora</button>`
        :`<button type="button" data-dpm="${d.id}">+3 dias</button> <button type="button" class="${d.ativo?'no':'ok'}" data-dpa="${d.id}" data-v="${d.ativo?0:1}">${d.ativo?'Pausar':'Reativar'}</button>`}</div>
      <div class="lb">Responsável</div><div style="display:flex;gap:6px">${PESSOAS.map(([p,cr,bg])=>`<button type="button" data-dqr="${p}" style="${c.resp===p?`background:${bg};color:${cr};border-color:${cr};font-weight:700`:''}">${p}</button>`).join('')}
        <button type="button" data-dqr="" style="${!c.resp?'font-weight:700':''}">Ninguém</button></div>
      <div class="lb">Etapa</div><select data-dqf style="font-size:13.5px"><option value=""${!c.fase?' selected':''}>Automática (agora: ${nomeF(fa)})</option>
        ${MANUAL.map(f=>`<option value="${f}"${c.fase===f?' selected':''}>${nomeF(f)}</option>`).join('')}</select>
      <div class="lb">Anotação</div><textarea data-dqn rows="3" placeholder="Ex.: pediu valores do plano Equipe, vai falar com o sócio" style="width:100%;box-sizing:border-box;font-size:13px">${e(c.nota||'')}</textarea>
      <div class="note" id="dqNs">${c.atualizado?'Atualizado '+quando(c.atualizado)+(c.por?' por '+e(c.por):''):''}</div>
      <div class="lb">Mensagem da etapa</div>${celMsg(d)}</div>`;liga(g);}
  function liga(r){
    r.querySelectorAll('[data-dqc]').forEach(c=>{c.ondragstart=ev=>{ev.dataTransfer.setData('text/plain',c.dataset.dqc);c.style.opacity='.5';};c.ondragend=()=>{c.style.opacity='';};
      c.onclick=()=>{ABERTO=c.dataset.dqc;gaveta();};});
    r.querySelectorAll('[data-dqa]').forEach(c=>c.onclick=()=>{ABERTO=c.dataset.dqa;gaveta();});
    r.querySelectorAll('[data-dqcol]').forEach(col=>{col.ondragover=ev=>{ev.preventDefault();col.classList.add('dq-sobre');};col.ondragleave=()=>col.classList.remove('dq-sobre');
      col.ondrop=ev=>{ev.preventDefault();col.classList.remove('dq-sobre');const id=ev.dataTransfer.getData('text/plain'),f=col.dataset.dqcol,v=MANUAL.includes(f)?f:'';
        crm(id).fase=v||null;salvar(id,{p_fase:v});ui();};});
    r.querySelectorAll('[data-dqx]').forEach(b=>b.onclick=()=>{ABERTO=null;gaveta();});
    r.querySelectorAll('[data-dqr]').forEach(b=>b.onclick=()=>{const v=b.dataset.dqr;crm(ABERTO).resp=v||null;salvar(ABERTO,{p_resp:v});ui();});
    r.querySelectorAll('[data-dqf]').forEach(s=>s.onchange=()=>{crm(ABERTO).fase=s.value||null;salvar(ABERTO,{p_fase:s.value});s.blur();ui();});
    r.querySelectorAll('[data-dqn]').forEach(t=>t.onchange=async()=>{const id=ABERTO,c=crm(id);c.nota=t.value;c.atualizado=new Date().toISOString();c.por=EU()||null;
      const n=document.getElementById('dqNs');if(n)n.textContent='Salvando…';await salvar(id,{p_nota:t.value});if(n)n.textContent='✔ Anotação salva';corpo();});
    r.querySelectorAll('[data-dpm]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await rpc('pfc_adm_demo',{p_token:TOK,p_id:b.dataset.dpm,p_ativo:true,p_mais_dias:3});ESC[b.dataset.dpm]='mais';}catch(x){alert(x.message);}carregar();});
    r.querySelectorAll('[data-dpa]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await rpc('pfc_adm_demo',{p_token:TOK,p_id:b.dataset.dpa,p_ativo:b.dataset.v==='1'});}catch(x){alert(x.message);}carregar();});
    ligaMsg(r);}
  function ui(){const ae=document.activeElement;
    if(ae&&ae.matches&&ae.matches('[data-dmt],[data-dqn],[data-dqf]'))return; /* não apaga enquanto edita */
    if(ae&&ae.id==='dqBusca'){corpo();gaveta();return;}
    const el=document.getElementById('dplBox'),bd=document.getElementById('tbDemo');if(!el)return;
    if(!D){if(bd)bd.textContent='';
      el.innerHTML=`<p class="note" style="margin:0 0 8px">Para ver quem entrou, informe a senha do <b>Acesso FC</b> da Plataforma uma vez (fica guardada neste navegador).</p>
       <form id="dplF" style="display:flex;gap:8px;flex-wrap:wrap"><input type="password" id="dplS" placeholder="Senha do Acesso FC" autocomplete="current-password" style="min-width:220px"><button type="submit" class="pri">Conectar</button><span class="msg" id="dplM"></span></form>`;
      document.getElementById('dplF').onsubmit=async ev=>{ev.preventDefault();const m=document.getElementById('dplM');m.textContent='Conectando…';
        try{const r=await rpc('pfc_login_matriz',{p_senha:document.getElementById('dplS').value});if(!r||r.erro){m.textContent=(r&&r.erro)||'Não conectou.';return;}
          TOK=r.token;ls(KT,r.token);m.textContent='';carregar();}catch(_){m.textContent='Não conectou. Confira a internet.';}};return;}
    estilo();
    const agora=Date.now(),at=D.filter(d=>d.ativo&&new Date(d.expira)>agora),hoje=D.filter(d=>new Date(d.criado).toDateString()===new Date().toDateString()).length;
    if(bd)bd.textContent=at.length?'🧊'+at.length:'';
    const nF=f=>D.filter(d=>faseDe(d)===f).length,eu=EU();
    const fb=(v,t)=>`<button type="button" class="dq-f${FIL===v?' on':''}" data-dqfil="${v}">${t}</button>`;
    el.innerHTML=`<div class="dq-m"><div><small>Interessados</small><b>${D.length}</b></div><div><small>Entraram hoje</small><b>${hoje}</b></div>
       <div><small>Ativos</small><b>${at.length}</b></div><div><small>Usando agora</small><b style="color:#1d7a45">${D.filter(online).length}</b></div>
       <div><small>Negociando</small><b style="color:#b4372f">${nF('negociando')}</b></div><div><small>Licenças fechadas</small><b>${nF('fechado')}</b></div></div>
     <div class="dq-bar"><span class="note">Quem está usando este aparelho:</span>${PESSOAS.map(([p,cr,bg])=>`<button type="button" class="dq-f" data-dqeu="${p}" style="${eu===p?`background:${bg};color:${cr};border-color:${cr};font-weight:700`:''}">${p}</button>`).join('')}
       ${eu?'':'<span class="note" style="color:#8a5a00">← escolha uma vez neste aparelho</span>'}<span style="flex:1"></span>
       <button type="button" id="dplCp">🔗 Copiar link do demonstrativo</button><a href="${ADM}" target="_blank" rel="noopener" style="font-size:13.5px">Abrir na Plataforma ↗</a></div>
     ${D.length?`<div class="dq-bar"><span class="note">Mostrar:</span>${fb('todos','Todos')}${eu?fb('meus','Só os meus'):''}${fb('Fernando','Fernando')}${fb('Regina','Regina')}${fb('sem','Sem responsável')}${fb('quentes','Quentes')}
       <input id="dqBusca" type="search" placeholder="Buscar nome, empresa ou telefone" value="${e(BUSCA)}" style="min-width:200px;flex:1;max-width:280px">
       <span style="flex:1"></span><button type="button" class="dq-f${VISTA==='quadro'?' on':''}" data-dqv="quadro">▦ Quadro</button><button type="button" class="dq-f${VISTA==='lista'?' on':''}" data-dqv="lista">☰ Lista</button></div>
       <div id="dqCorpo"></div>`
      :'<p class="note" style="margin:0">Ninguém entrou pelo demonstrativo ainda. Copie o link e envie no WhatsApp: quando alguém entrar, aparece aqui e o painel avisa com som.</p>'}
     ${CRMOK?'':'<p class="note" style="color:#b4372f">Não consegui ler o quadro compartilhado agora; etapa, responsável e anotações aparecem quando a conexão voltar.</p>'}
     <div id="dqG"></div>`;
    document.getElementById('dplCp').onclick=async ev=>{try{await navigator.clipboard.writeText(LINK);ev.target.textContent='✔ Link copiado';}catch(_){prompt('Copie o link:',LINK);}setTimeout(()=>{ev.target.textContent='🔗 Copiar link do demonstrativo';},2500);};
    el.querySelectorAll('[data-dqeu]').forEach(b=>b.onclick=()=>{ls(KEU,b.dataset.dqeu);ui();});
    el.querySelectorAll('[data-dqfil]').forEach(b=>b.onclick=()=>{FIL=b.dataset.dqfil;ls(KF,FIL);ui();});
    el.querySelectorAll('[data-dqv]').forEach(b=>b.onclick=()=>{VISTA=b.dataset.dqv;ls(KQ,VISTA);ui();});
    const bu=document.getElementById('dqBusca');if(bu)bu.oninput=()=>{BUSCA=bu.value.toLowerCase().trim();corpo();};
    if(D.length){corpo();gaveta();}}
  function ligaMsg(el){const pega=id=>D.find(x=>String(x.id)===String(id));
    el.querySelectorAll('[data-dme]').forEach(sel=>sel.onchange=()=>{const d=pega(sel.dataset.dme);ESC[d.id]=sel.value;ui();});
    el.querySelectorAll('[data-dmk]').forEach(b=>{let tm=null;
      b.onclick=()=>{clearTimeout(tm);tm=setTimeout(()=>{const d=pega(b.dataset.dmk);ESC[d.id]=b.dataset.k;ui();},250);};
      b.ondblclick=ev=>{ev.preventDefault();clearTimeout(tm);const d=pega(b.dataset.dmk),k=b.dataset.k; /* 2 cliques: marca/desmarca como enviada */
        if(enviou(d,k))desmarcar(d.id,k);else marcar(d.id,k);delete ESC[d.id];ui();};});
    el.querySelectorAll('[data-dmt]').forEach(t=>t.oninput=()=>{const d=pega(t.dataset.dmt);ED[d.id+'|'+etapaDe(d)]=t.value;});
    el.querySelectorAll('[data-dmc]').forEach(b=>b.onclick=async()=>{const d=pega(b.dataset.dmc),tx=(b.closest('[data-dmbox]')||el).querySelector('[data-dmt]').value;
      try{await navigator.clipboard.writeText(tx);}catch(_){prompt('Copie o texto:',tx);}marcar(d.id,etapaDe(d));delete ESC[d.id];b.textContent='✔ Copiado';setTimeout(ui,1500);});
    el.querySelectorAll('[data-dmw]').forEach(a=>a.onclick=ev=>{ev.preventDefault();const d=pega(a.dataset.dmw),tx=(a.closest('[data-dmbox]')||el).querySelector('[data-dmt]').value;
      window.open(zap(d.whats)+'?text='+encodeURIComponent(tx),'_blank','noopener');marcar(d.id,etapaDe(d));delete ESC[d.id];setTimeout(ui,800);});}
  setTimeout(carregar,3500);setInterval(carregar,30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)carregar();});
  window.FCDemoPl={carregar};
})();
