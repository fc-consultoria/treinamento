/* Orçamentos de obra: dados compartilhados no Supabase (matriz + orçamentistas da FC).
   Cada obra e cada componente do banco é uma linha; o resto (biblioteca de preços e margens) fica em orcobra_kv.
   O navegador continua com uma cópia local, mas a fonte é o banco. */
(function(){
const ORC=window.ORC={ativo:false,DB:null,papel:'',uid:'',nome:''};
const LOCAL_KEY='fc-orcamentos-v2';
let snap={obras:{},banco:{},resto:null},pend=null,rodando=false,ultimoLoad=null,initOk=false,timer=null;

function badge(txt,cor){let b=document.getElementById('orc-sync');
  if(!b){b=document.createElement('div');b.id='orc-sync';b.style.cssText='position:fixed;right:12px;bottom:12px;z-index:9000;font:600 12.5px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:6px 11px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.18);background:#fff;border:1px solid #d6dde2;color:#13232e';document.body.appendChild(b);}
  b.textContent=txt;b.style.color=cor||'#13232e';}
function aviso(html){let a=document.getElementById('orc-aviso');
  if(!a){a=document.createElement('div');a.id='orc-aviso';a.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:12px;z-index:9001;max-width:min(560px,calc(100% - 32px));font:500 14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:10px 14px;border-radius:12px;background:#fff7e8;border:1px solid #e9c27a;color:#5a3b00;box-shadow:0 8px 24px rgba(0,0,0,.18);display:flex;gap:10px;align-items:center;flex-wrap:wrap';document.body.appendChild(a);}
  a.innerHTML=html;}
function tela(msg){document.body.insertAdjacentHTML('beforeend','<div style="max-width:520px;margin:12vh auto;padding:24px;border-radius:16px;background:#fff;color:#13232e;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.15);text-align:center">'+msg+'</div>');}

function partes(DB){const resto={};Object.keys(DB).forEach(k=>{if(k!=='obras'&&k!=='banco')resto[k]=DB[k]});
  const obras={};(DB.obras||[]).forEach(o=>{obras[o.id]=JSON.stringify(o)});
  const banco={};Object.keys(DB.banco||{}).forEach(c=>{banco[c]=JSON.stringify(DB.banco[c])});
  return {obras,banco,resto:JSON.stringify(resto)};}

window.orcCarregar=async function(r){
  ORC.papel=r.perfil.papel;ORC.uid=r.session.user.id;ORC.nome=r.perfil.nome||r.perfil.login;
  badge('Carregando orçamentos…');
  const [o,b,k]=await Promise.all([sb.from('orcobra_obras').select('id,dados'),sb.from('orcobra_banco').select('code,dados'),sb.from('orcobra_kv').select('k,dados')]);
  if(o.error||b.error||k.error){badge('Sem conexão','#a3200b');tela('<b>Não foi possível carregar os orçamentos.</b><br>Confira a internet e atualize a página (F5).');return false;}
  ultimoLoad=new Date().toISOString();
  const kv={};(k.data||[]).forEach(x=>kv[x.k]=x.dados);
  ORC.ativo=true;
  if(!kv.init){
    if(ORC.papel!=='admin'){badge('Aguardando a FC','#a3620b');tela('<b>Os orçamentos ainda não foram liberados.</b><br>A FC Consultoria precisa abrir esta página uma vez para enviar as obras. Tente de novo mais tarde.');return false;}
    let local=null;try{local=JSON.parse(localStorage.getItem(LOCAL_KEY)||'null')}catch(_){}
    if(!(local&&Array.isArray(local.obras)&&local.obras.length)&&!confirm('Não encontrei orçamentos salvos neste navegador.\n\nSe você lançou obras em outro computador, abra esta página primeiro nele, para que elas sejam enviadas.\n\nComeçar do zero aqui?'))
      {tela('Abra esta página no computador onde estão os seus orçamentos.');return false;}
    ORC.DB=local&&Array.isArray(local.obras)?local:null; // vazio: a página cria a obra inicial e o 1º save sobe tudo
    badge('Enviando orçamentos…');return true;}
  initOk=true;
  const DB=Object.assign({v:2,lib:{comp:{},vid:{},aluKg:'',aluAdd:'',mg:{}}},kv.resto||{});
  DB.obras=(o.data||[]).map(x=>x.dados).sort((a,b)=>String(a.criado||'').localeCompare(String(b.criado||'')));
  DB.banco={};(b.data||[]).forEach(x=>DB.banco[x.code]=x.dados);
  ORC.DB=DB;snap=partes(DB);
  try{localStorage.setItem(LOCAL_KEY,JSON.stringify(DB))}catch(_){}
  badge('✓ Salvo','#0d6b68');
  setInterval(checarOutros,25000);addEventListener('focus',checarOutros);
  return true;
};

window.orcSync=function(DB){if(!ORC.ativo)return;pend=DB;clearTimeout(timer);badge('Salvando…','#a3620b');timer=setTimeout(enviar,900);};
addEventListener('beforeunload',e=>{if(pend||rodando){e.preventDefault();e.returnValue='';}});

async function enviar(){if(rodando||!pend)return;rodando=true;const DB=pend;pend=null;
  const p=partes(DB),agora=new Date().toISOString(),ops=[];
  const upO=Object.keys(p.obras).filter(id=>p.obras[id]!==snap.obras[id]).map(id=>({id,dados:JSON.parse(p.obras[id]),atualizado:agora,por:ORC.uid}));
  const delO=Object.keys(snap.obras).filter(id=>!(id in p.obras));
  const upB=Object.keys(p.banco).filter(c=>p.banco[c]!==snap.banco[c]).map(code=>({code,dados:JSON.parse(p.banco[code]),atualizado:agora,por:ORC.uid}));
  const delB=Object.keys(snap.banco).filter(c=>!(c in p.banco));
  for(let i=0;i<upO.length;i+=20)ops.push(sb.from('orcobra_obras').upsert(upO.slice(i,i+20)));
  for(let i=0;i<upB.length;i+=300)ops.push(sb.from('orcobra_banco').upsert(upB.slice(i,i+300)));
  if(delO.length)ops.push(sb.from('orcobra_obras').delete().in('id',delO));
  if(delB.length)ops.push(sb.from('orcobra_banco').delete().in('code',delB));
  if(p.resto!==snap.resto)ops.push(sb.from('orcobra_kv').upsert({k:'resto',dados:JSON.parse(p.resto),atualizado:agora,por:ORC.uid}));
  let ok=true;try{const rs=await Promise.all(ops);rs.forEach(x=>{if(x.error){ok=false;console.warn(x.error)}});}catch(e){ok=false;console.warn(e)}
  if(ok&&!initOk&&ORC.papel==='admin'){const r=await sb.from('orcobra_kv').upsert({k:'init',dados:{em:agora,por:ORC.nome},atualizado:agora,por:ORC.uid});if(r.error)ok=false;else initOk=true;}
  rodando=false;
  if(ok){snap=p;if(!pend)badge('✓ Salvo','#0d6b68');}
  else{if(!pend)pend=DB;badge('Não salvou · tentando de novo','#a3200b');clearTimeout(timer);timer=setTimeout(enviar,8000);return;}
  if(pend)enviar();
}

async function checarOutros(){if(!initOk||!ultimoLoad||document.getElementById('orc-aviso'))return;
  const f=t=>sb.from(t).select('atualizado').gt('atualizado',ultimoLoad).neq('por',ORC.uid).limit(1);
  try{const rs=await Promise.all([f('orcobra_obras'),f('orcobra_banco'),f('orcobra_kv')]);
    if(rs.some(x=>!x.error&&x.data&&x.data.length))aviso('<span>Outra pessoa da FC alterou orçamentos. Atualize para ver as mudanças.</span><button type="button" id="orc-at" style="font:700 14px system-ui;padding:7px 12px;border-radius:8px;border:0;background:#a3620b;color:#fff;cursor:pointer">Atualizar</button>');
    const bt=document.getElementById('orc-at');if(bt)bt.onclick=async()=>{bt.disabled=true;bt.textContent='Salvando…';clearTimeout(timer);while(pend||rodando){if(!rodando)await enviar();await new Promise(r=>setTimeout(r,300));}location.reload();};
  }catch(_){}
}
})();
