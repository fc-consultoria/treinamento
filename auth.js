/* Acesso ao Orientativo: login Supabase (mesmo projeto da Central FC) */
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
    if(r.perfil&&!r.perfil.ativo&&r.perfil.papel!=='admin'){await sb.auth.signOut();gate.hidden=false;msg.textContent='Este acesso ao Orientativo FC 3D foi encerrado. Abrindo o site da FC Consultoria…';setTimeout(()=>{location.href='https://fc-consultoria.github.io/?o=encerrado';},3500);return;}
    if(!r.perfil||!r.perfil.ativo){await sb.auth.signOut();gate.hidden=false;msg.textContent='Este acesso não está liberado. Fale com a FC Consultoria.';return;}
    if(soMatriz&&r.perfil.papel!=='admin'){gate.hidden=false;msg.textContent='Esta área é só da matriz.';await sb.auth.signOut();return;}
    gate.hidden=true;onOk(r);
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault();msg.textContent='';btn.disabled=true;btn.textContent='Entrando…';
    const {error}=await sb.auth.signInWithPassword({email:loginToEmail(form.login.value),password:form.senha.value});
    btn.disabled=false;btn.textContent='Entrar';
    if(error){let enc=false;try{const r=await sb.rpc('trein_login_encerrado',{p_login:form.login.value});enc=!r.error&&r.data===true;}catch(_){}
      if(enc){msg.textContent='Este acesso ao Orientativo FC 3D foi encerrado. Abrindo o site da FC Consultoria…';setTimeout(()=>{location.href='https://fc-consultoria.github.io/?o=encerrado';},3500);return;}
      msg.textContent='Login ou senha não conferem.';return;}
    check();
  });
  check();
}
async function sair(){await sb.auth.signOut();location.reload();}

/* Suporte online/offline */
const FC_HOR='seg a sex, 8h às 11h e 13h às 17h';
async function fcOnline(){try{const {data,error}=await sb.rpc('fc_online');return !error&&!!data;}catch(e){return false;}}
function fcStatusUI(){const upd=async()=>{const on=await fcOnline();document.querySelectorAll('.fcst').forEach(el=>{el.classList.toggle('on',on);el.classList.toggle('off',!on);
  el.innerHTML=on?'🟢 <b>Suporte FC online agora</b> · pode mandar a sua dúvida':'⚪ <b>Suporte offline</b> · atendimento '+FC_HOR+'. Deixe a sua mensagem: respondemos no próximo horário.';});
  const b=document.getElementById('sugBtn');if(b)b.classList.toggle('fcon',on);};
  upd();setInterval(()=>{if(document.visibilityState==='visible')upd();},60000);}
function fcPing(){const p=()=>{if(document.visibilityState==='visible')sb.from('fc_status').update({visto:new Date().toISOString()}).eq('id',1).then(()=>{});};p();setInterval(p,60000);document.addEventListener('visibilitychange',p);}
