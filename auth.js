/* Acesso ao Mostruário: login Supabase (mesmo projeto da Central FC) */
const SB_URL='https://cpkjphodruyxfouirhpd.supabase.co';
const SB_KEY='sb_publishable_d0HEeWsaqOeZIQKGftlF-Q_B8BUOWWg';
const sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,storageKey:'trein-fc-auth'}});
/* Sem internet (08/11/2026): o login guardado neste aparelho continua valendo, mesmo que tenha vencido,
   para o Painel abrir com a última versão guardada. Com internet tudo segue igual. */
function fcSemRede(err){return !navigator.onLine||!!(err&&/fetch|network|Failed|Load failed/i.test(String(err.message||err)));}
function fcSessaoGuardada(){try{const s=JSON.parse(localStorage.getItem('trein-fc-auth')||'null');return s&&s.user&&s.user.id?s:null;}catch(_){return null;}}
(function(){const gs=sb.auth.getSession.bind(sb.auth);
  sb.auth.getSession=async function(){const r=await gs();if(r&&r.data&&r.data.session)return r;
    if(fcSemRede(r&&r.error)){const s=fcSessaoGuardada();if(s)return {data:{session:s},error:null};}return r;};})();
const MATRIZ_EMAIL='painel.fc@fcconsultoria.com';
const MATRIZ_UID='0cf32a33-c9dd-4249-acbd-7f448562ba94';
/* Modo silencioso: outra pessoa da equipe com acesso de admin (ex.: Regina) não recebe avisos,
   sons, notificações do computador nem título piscando; tudo isso continua só para o Fernando.
   Decidido antes dos outros scripts carregarem, pela sessão salva neste navegador. */
const FC_SILENCIO=(function(){try{const s=JSON.parse(localStorage.getItem('trein-fc-auth')||'null');const id=s&&s.user&&s.user.id;return !!id&&id!==MATRIZ_UID&&localStorage.getItem('fc_silencio')===id;}catch(_){return false;}})();
if(FC_SILENCIO){try{
  const nada=new Proxy(function(){},{get:(t,k)=>k==='then'?undefined:(k===Symbol.toPrimitive?()=>0:nada),apply:()=>nada,construct:()=>nada,set:()=>true});
  function N(){} N.permission='denied'; N.requestPermission=function(cb){try{cb&&cb('denied');}catch(_){}return Promise.resolve('denied');};
  window.Notification=N;window.AudioContext=nada;window.webkitAudioContext=nada;
  try{navigator.vibrate=function(){return false;};}catch(_){}
  const td=Object.getOwnPropertyDescriptor(Document.prototype,'title');let t0=td.get.call(document)||null;
  Object.defineProperty(document,'title',{configurable:true,get(){return td.get.call(this);},set(v){if(t0===null){t0=String(v).replace(/^\(\d+\)\s*/,'');td.set.call(this,t0);}}});
  const st=document.createElement('style');st.textContent='#bigAl,#fcAvPerm,#autocadAv,[id^="estAv_"],#fcAvisoPede,#fcHoje,#bNot,#cxBtn,#fcvBtn,#fcvMat,.pg[data-g="resp"],section[data-tab="ped"],section[data-tab="sug"],section[data-tab="sim"],#cvCard,#sugCard,#osChat{display:none!important}';
  window.__FC_SEM_MSG=true; /* sem acesso às mensagens dos clientes */
  try{if(['ped','sug','sim'].includes(localStorage.getItem('treinFC-ptab')))localStorage.setItem('treinFC-ptab','home');}catch(_){}
  (document.head||document.documentElement).appendChild(st);
}catch(_){}}
/* "aluno01" vira aluno01@treinamento.fc; "matriz" vira o e-mail da Central FC */
function loginToEmail(v){v=(v||'').trim().toLowerCase();if(v==='matriz')return MATRIZ_EMAIL;return v.includes('@')?v:v+'@treinamento.fc';}
async function perfilAtual(){
  const {data:{session}}=await sb.auth.getSession();if(!session)return null;
  const {data,error}=await sb.from('trein_alunos').select('user_id,login,nome,papel,ativo').eq('user_id',session.user.id).maybeSingle();
  const PK='fc-perfil-off-'+session.user.id;
  if(data){try{localStorage.setItem(PK,JSON.stringify(data));}catch(_){}
    try{const c=navigator.serviceWorker&&navigator.serviceWorker.controller;if(c)c.postMessage({tipo:'fc-usuario',id:session.user.id,token:session.access_token});}catch(_){}}
  if((error||!data)&&fcSemRede(error)){try{const g=JSON.parse(localStorage.getItem(PK)||'null');if(g)return {session,perfil:g,offline:true};}catch(_){}}
  if(error||!data)return {session,perfil:null};return {session,perfil:data};
}
/* Acesso desativado: aviso da nova Plataforma FC 3D com botão para o WhatsApp da FC */
function msgEvoluiu(msg){
  const wa='https://wa.me/5566999867984?text='+encodeURIComponent('Olá, FC! Quero conhecer a nova Plataforma FC 3D.');
  msg.innerHTML='<div style="margin-top:10px;padding:14px;border-radius:10px;background:rgba(31,179,201,.12);border:1px solid rgba(31,179,201,.45);line-height:1.45;text-align:center">'
   +'<b>O FC Mostruário 3D evoluiu para a Plataforma FC 3D.</b><br>Para conhecer a nova versão, fale com a FC pelo WhatsApp (66) 9 9986-7984.'
   +'<br><a href="'+wa+'" target="_blank" rel="noopener" style="display:inline-block;margin-top:10px;padding:10px 16px;border-radius:8px;background:#25d366;color:#fff;font-weight:700;text-decoration:none">💬 Falar com a FC no WhatsApp</a></div>';
}
function gateUI(onOk,{soMatriz=false,permitir=[]}={}){
  const gate=document.getElementById('gate'),form=document.getElementById('gateForm'),msg=document.getElementById('gateMsg'),btn=form.querySelector('button');
  async function check(){
    const r=await perfilAtual();
    if(!r){gate.hidden=false;return;}
    if(!r.perfil&&!navigator.onLine){gate.hidden=false;msg.textContent='Sem internet: abra este painel uma vez com internet para ele ficar guardado neste aparelho.';return;}
    if(r.perfil&&!r.perfil.ativo&&r.perfil.papel==='aluno'){await sb.auth.signOut();gate.hidden=false;msgEvoluiu(msg);return;}
    if(!r.perfil||!r.perfil.ativo){await sb.auth.signOut();gate.hidden=false;msg.textContent='Este acesso não está liberado. Fale com a FC Consultoria.';return;}
    const lib=permitir.includes(r.perfil.papel);
    /* orçamentista (equipe FC) só entra nas páginas que o liberam, hoje Orçamentos de obra */
    if(r.perfil.papel==='orcamentista'&&!lib){await sb.auth.signOut();gate.hidden=false;msg.innerHTML='Este login é só para os Orçamentos de obra. <a href="https://fc-consultoria.github.io/treinamento/orcamentos/">Abrir Orçamentos de obra</a>';return;}
    if(soMatriz&&r.perfil.papel!=='admin'&&!lib){gate.hidden=false;msg.textContent='Esta área é só da matriz.';await sb.auth.signOut();return;}
    if(r.perfil.papel!=='admin'){try{await senhaNovaPasso(r.perfil);}catch(_){}}
    const quieto=r.perfil.papel==='admin'&&r.session.user.id!==MATRIZ_UID;
    try{if(quieto)localStorage.setItem('fc_silencio',r.session.user.id);else localStorage.removeItem('fc_silencio');}catch(_){}
    if(quieto&&!FC_SILENCIO){location.reload();return;}
    gate.hidden=true;onOk(r);
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault();msg.textContent='';btn.disabled=true;btn.textContent='Entrando…';
    const {error}=await sb.auth.signInWithPassword({email:loginToEmail(form.login.value),password:form.senha.value});
    btn.disabled=false;btn.textContent='Entrar';
    if(error){let enc=false;try{const r=await sb.rpc('trein_login_encerrado',{p_login:form.login.value});enc=!r.error&&r.data===true;}catch(_){}
      if(enc){msgEvoluiu(msg);return;}
      let tr=null;try{const q=await sb.rpc('trein_login_senha_trocada',{p_login:form.login.value});if(!q.error)tr=q.data;}catch(_){}
      msg.textContent=tr?'A senha desta empresa foi trocada em '+new Date(tr).toLocaleDateString('pt-BR')+' (apareceu na tela de quem entrou primeiro). Peça a senha nova ao gestor ou à FC Consultoria: (66) 9 9986-7984.':'Login ou senha não conferem.';return;}
    check();
  });
  check();
}
/* Senha nova programada pela FC: aparece no 1º login e só passa a valer quando a pessoa confirma que anotou */
async function senhaNovaPasso(p){let s=null;try{const {data,error}=await sb.rpc('trein_senha_minha');if(!error)s=data;}catch(_){}if(!s)return;
  return new Promise(res=>{const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(8,20,30,.78);display:grid;place-items:center;padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
    const e=t=>String(t||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    o.innerHTML=`<div role="dialog" aria-label="Senha nova" style="background:#fff;color:#13232e;border-radius:18px;max-width:440px;width:100%;padding:22px;box-shadow:0 24px 60px rgba(0,0,0,.45)">
      <div style="font-size:34px;line-height:1">🔐</div><h2 style="margin:8px 0 4px;font-size:21px">Senha nova da empresa</h2>
      <p style="margin:0 0 12px;color:#4a5b66;font-size:15px;line-height:1.45">Para mais segurança, a FC Consultoria criou uma senha nova para <b>${e(p.nome||p.login)}</b>. A partir de agora, entre com:</p>
      <div style="background:#f1f6f9;border-radius:12px;padding:12px 14px;font-size:15px"><div>👤 Login: <b>${e(p.login)}</b></div><div style="margin-top:6px">🔑 Senha: <b id="snV" style="font:700 22px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.04em">${e(s)}</b></div></div>
      <p style="margin:12px 0;color:#9a4b00;background:#fff7e8;border-radius:10px;padding:8px 10px;font-size:13.5px">✍️ <b>Anote ou salve esta senha agora</b> e avise quem mais da equipe usa este login. A senha antiga deixa de funcionar quando você confirmar.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button type="button" id="snCp" style="font:600 15px system-ui;padding:11px 14px;border-radius:10px;border:1px solid #c9d3da;background:#fff;color:#13232e;cursor:pointer">📋 Copiar senha</button><button type="button" id="snOk" style="font:700 15px system-ui;padding:11px 16px;border-radius:10px;border:0;background:#0e5a86;color:#fff;cursor:pointer">✅ Anotei, continuar</button></div>
      <p id="snM" style="margin:8px 0 0;font-size:13px;color:#4a5b66"></p></div>`;
    document.body.appendChild(o);const m=o.querySelector('#snM');
    o.querySelector('#snCp').onclick=async ev=>{try{await navigator.clipboard.writeText(s);ev.target.textContent='✔ Copiada';}catch(_){m.textContent='Não deu para copiar: anote a senha mostrada acima.';}};
    o.querySelector('#snOk').onclick=async ev=>{if(!confirm('Confirma que anotou ou salvou a senha nova?\n\n'+s))return;ev.target.disabled=true;ev.target.textContent='Salvando…';
      let ok=false;try{const r=await sb.rpc('trein_senha_aplicar_minha',{p_quem:''});ok=!r.error;}catch(_){}
      if(!ok){ev.target.disabled=false;ev.target.textContent='✅ Anotei, continuar';m.textContent='Não foi possível ativar agora. Continue usando a senha atual e tente de novo mais tarde.';return;}
      try{if(window.PasswordCredential&&navigator.credentials)await navigator.credentials.store(new PasswordCredential({id:p.login,password:s,name:p.nome||p.login}));}catch(_){}
      o.remove();res();};});}
async function sair(){await sb.auth.signOut();location.reload();}

/* Suporte online/offline */
const FC_HOR='seg a sex, 8h às 11h e 13h às 17h';
async function fcOnline(){try{const {data,error}=await sb.rpc('fc_online');return !error&&!!data;}catch(e){return false;}}
function fcStatusUI(){const upd=async()=>{const on=await fcOnline();document.querySelectorAll('.fcst').forEach(el=>{el.classList.toggle('on',on);el.classList.toggle('off',!on);
  el.innerHTML=on?'🟢 <b>Suporte FC online agora</b> · pode mandar a sua dúvida':'⚪ <b>Suporte offline</b> · atendimento '+FC_HOR+'. Deixe a sua mensagem: respondemos no próximo horário.';});
  const b=document.getElementById('sugBtn');if(b)b.classList.toggle('fcon',on);};
  upd();setInterval(()=>{if(document.visibilityState==='visible')upd();},60000);}
function fcPing(){if(FC_SILENCIO)return;const p=()=>{if(document.visibilityState==='visible')sb.from('fc_status').update({visto:new Date().toISOString()}).eq('id',1).then(()=>{});};p();setInterval(p,60000);document.addEventListener('visibilitychange',p);}
