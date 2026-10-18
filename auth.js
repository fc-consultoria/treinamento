/* Acesso ao Mostruário: login Supabase (mesmo projeto da Central FC) */
const SB_URL='https://cpkjphodruyxfouirhpd.supabase.co';
const SB_KEY='sb_publishable_d0HEeWsaqOeZIQKGftlF-Q_B8BUOWWg';
const sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,storageKey:'trein-fc-auth'}});
const MATRIZ_EMAIL='painel.fc@fcconsultoria.com';
/* "aluno01" vira aluno01@treinamento.fc; "matriz" vira o e-mail da Central FC */
function loginToEmail(v){v=(v||'').trim().toLowerCase();if(v==='matriz')return MATRIZ_EMAIL;return v.includes('@')?v:v+'@treinamento.fc';}
async function perfilAtual(){
  const {data:{session}}=await sb.auth.getSession();if(!session)return null;
  const {data,error}=await sb.from('trein_alunos').select('user_id,login,nome,papel,ativo').eq('user_id',session.user.id).maybeSingle();
  if(error||!data)return {session,perfil:null};return {session,perfil:data};
}
function gateUI(onOk,{soMatriz=false}={}){
  const gate=document.getElementById('gate'),form=document.getElementById('gateForm'),msg=document.getElementById('gateMsg'),btn=form.querySelector('button');
  async function check(){
    const r=await perfilAtual();
    if(!r){gate.hidden=false;return;}
    if(r.perfil&&!r.perfil.ativo&&r.perfil.papel!=='admin'){await sb.auth.signOut();gate.hidden=false;msg.textContent='Este acesso ao FC Mostruário 3D foi encerrado. Abrindo o site da FC Consultoria…';setTimeout(()=>{location.href='https://fc-consultoria.github.io/?o=encerrado';},3500);return;}
    if(!r.perfil||!r.perfil.ativo){await sb.auth.signOut();gate.hidden=false;msg.textContent='Este acesso não está liberado. Fale com a FC Consultoria.';return;}
    if(soMatriz&&r.perfil.papel!=='admin'){gate.hidden=false;msg.textContent='Esta área é só da matriz.';await sb.auth.signOut();return;}
    if(r.perfil.papel!=='admin'){try{await senhaNovaPasso(r.perfil);}catch(_){}}
    gate.hidden=true;onOk(r);
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault();msg.textContent='';btn.disabled=true;btn.textContent='Entrando…';
    const {error}=await sb.auth.signInWithPassword({email:loginToEmail(form.login.value),password:form.senha.value});
    btn.disabled=false;btn.textContent='Entrar';
    if(error){let enc=false;try{const r=await sb.rpc('trein_login_encerrado',{p_login:form.login.value});enc=!r.error&&r.data===true;}catch(_){}
      if(enc){msg.textContent='Este acesso ao FC Mostruário 3D foi encerrado. Abrindo o site da FC Consultoria…';setTimeout(()=>{location.href='https://fc-consultoria.github.io/?o=encerrado';},3500);return;}
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
function fcPing(){const p=()=>{if(document.visibilityState==='visible')sb.from('fc_status').update({visto:new Date().toISOString()}).eq('id',1).then(()=>{});};p();setInterval(p,60000);document.addEventListener('visibilitychange',p);}
