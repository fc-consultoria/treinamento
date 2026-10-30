/* Plataforma <Cliente> & FC 3D (Casa Bandeirante e Guaporé Vidros) — visual em cards sobre o link real do cliente.
   Usa o login por pessoa e as abas liberadas de cada papel (consultorias.html?e=cb).
   Também aparece em "Como o cliente vê" na Matriz, para conferir. */
(function(){
/* 28/10/2026 · mesma plataforma para mais empresas: cada uma com nome, sigla e cores próprias (CB roxo, Guaporé azul). */
const PLATS={cb:{nome:'Casa Bandeirante',sig:'CB',cor:'#5b3fc4',cor2:'#3c2a8a',claro:'#efeafd',sub:'#d8cff7'},
 gb:{nome:'Guaporé Vidros',sig:'GV',cor:'#1d5fa8',cor2:'#123f7a',claro:'#e3eefa',sub:'#cfe0f5'}};
let EMP='cb';const CFG=()=>PLATS[EMP]||PLATS.cb;
const cores=()=>{const c=CFG(),r=document.documentElement.style;r.setProperty('--plat',c.cor);r.setProperty('--plat2',c.cor2);r.setProperty('--platc',c.claro);r.setProperty('--plats',c.sub);};
const ehCB=()=>{try{if(typeof E==='undefined'||!E[at]||!cli||!PLATS[at])return false;if(EMP!==at){EMP=at;LISTA=null;cores();}return true;}catch(_){return false;}};
let modo='home',homeTab;
/* 29/10/2026 · link vindo do Portal Comercial (?t=<card>&como=<setor>&nome=&abas=): abre direto o card, na visão daquela pessoa */
const QV=new URLSearchParams(location.search),T_URL=QV.get('t');let EXTRA=null;
if(T_URL&&T_URL!=='cen'&&QV.get('como'))modo='aba';
/* 29/10/2026 · nomes dos cards de treinamento na plataforma (a Matriz mantém os nomes antigos das abas) */
const ORI_URL='/fc3d/clientes/orientativo/?foco=1';
const NOMES={ori:['🎓','Treinamento · Orientativo','Guia de esquadrias da Plataforma FC 3D, com catálogo e prova final.'],
 esq:['🗓','Treinamento · Agenda on-line','Próximos treinamentos ao vivo com a FC: inscrição e entrada.']};
const h=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const css=`
#platCapa{position:fixed;inset:0;z-index:9998;background:var(--plat);display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:24px;color:#fff;cursor:pointer}
#platCapa .lg{width:92px;height:92px;border-radius:22px;background:#fff;color:var(--plat2);display:flex;align-items:center;justify-content:center;font:800 34px var(--f-h,inherit);margin-bottom:18px}
#platCapa h1{color:#fff;margin:0;font-size:30px}#platCapa p{color:var(--plats);margin:6px 0 0}
#platCapa .bt{margin-top:28px;background:#fff;color:var(--plat2);border-radius:12px;padding:12px 28px;font-weight:700;font-size:15px}
#platCapa .wm{position:absolute;bottom:18px;font-size:11px;letter-spacing:.06em;color:#b9acef}
.platHero{background:var(--plat);color:#fff;border-radius:16px;padding:18px 20px;margin:14px 18px 0;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.platHero .lg{width:46px;height:46px;border-radius:12px;background:#fff;color:var(--plat2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px}
.platHero h2{color:#fff;margin:0;font-size:19px}.platHero .s{color:var(--plats);font-size:13px}
.platHero .bts{margin-left:auto;display:flex;gap:6px}.platHero button{all:unset;cursor:pointer;border:1px solid #8f7ae0;color:#fff;border-radius:999px;padding:6px 13px;font-size:13px;font-weight:600}
.platHero button:hover{background:var(--plat2)}
.platGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;padding:16px 18px 20px}
.platK{all:unset;box-sizing:border-box;cursor:pointer;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:7px;min-height:118px}
.platK:hover{border-color:var(--plat);transform:translateY(-1px)}
.platK .ic{width:40px;height:40px;border-radius:10px;background:var(--platc);display:flex;align-items:center;justify-content:center;font-size:20px}
:root[data-theme="dark"] .platK .ic{background:#2b2160}
.platK b{font-size:14.5px;color:var(--fg);line-height:1.25}.platK span.d{font-size:12.5px;color:var(--muted);line-height:1.35}
.platK.dest{border:2px solid var(--plat)}
.platVolta{display:flex;align-items:center;gap:10px;padding:12px 18px 0;flex-wrap:wrap}
.platVolta button{all:unset;cursor:pointer;border:1px solid var(--plat);color:var(--plat);border-radius:10px;padding:7px 13px;font-weight:700;font-size:13.5px}
:root[data-theme="dark"] .platVolta button{color:#c9bdf6;border-color:#8f7ae0}
.platVolta b{font-size:15px;color:var(--fg)}
.platOn #cgTools{display:none!important}
.platWm{font-size:11px;color:var(--muted);text-align:center;padding:0 0 14px}
.platVer{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:14px 18px 0;padding:10px 12px;border:1px dashed var(--plat);border-radius:12px;background:var(--platc)}
:root[data-theme="dark"] .platVer{background:#221a4d}
.platVer>b{font-size:13px;color:var(--plat2);margin-right:4px}:root[data-theme="dark"] .platVer>b{color:#c9bdf6}
.platVer button{all:unset;cursor:pointer;border:1px solid #c9bdf6;background:var(--surface);color:var(--fg);border-radius:999px;padding:5px 12px;font-size:13px;font-weight:600}
.platVer button.on{background:var(--plat);border-color:var(--plat);color:#fff}
.platVer .n{font-size:12px;color:var(--muted);flex-basis:100%}
.platG{display:block}
.platTop{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:16px}
.platB{all:unset;box-sizing:border-box;cursor:pointer;background:var(--surface);border:2px solid var(--plat);border-radius:16px;padding:16px 18px;display:flex;flex-direction:column;gap:8px}
.platB:hover{border-color:var(--plat2)}
.platB .tt{display:flex;align-items:center;gap:10px}.platB .tt b{font-size:17px;color:var(--fg)}
.platB .ic{width:42px;height:42px;border-radius:11px;background:var(--platc);display:flex;align-items:center;justify-content:center;font-size:21px}
:root[data-theme="dark"] .platB .ic{background:#2b2160}
.platB .d{font-size:13px;color:var(--muted)}.platB .lk{font-size:13.5px;font-weight:700;color:var(--plat)}
:root[data-theme="dark"] .platB .lk{color:#c9bdf6}
.platB.eq{border-color:#0f6e56}.platB.eq .lk{color:#0f6e56}:root[data-theme="dark"] .platB.eq .lk{color:#7fd8b9}
.platKp{display:flex;gap:8px}.platKp div{flex:1;border-radius:10px;padding:7px 10px;background:var(--platc)}
:root[data-theme="dark"] .platKp div{background:#221a4d}
.platKp b{display:block;font-size:20px;color:var(--fg)}.platKp span{font-size:11.5px;color:var(--muted)}
.platKp .al{background:#fff4dc}.platKp .al b{color:#8a5a00}:root[data-theme="dark"] .platKp .al{background:#3a2c0c}:root[data-theme="dark"] .platKp .al b{color:#f5c76b}
.platP{display:flex;justify-content:space-between;gap:8px;font-size:13px;padding:6px 0;border-top:1px solid var(--line);color:var(--fg)}
.platP small{color:var(--muted)}.platP .on{color:#0f8a5f;font-weight:700}.platP .nu{color:#c0392b}
.platP i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#c4c4c4;margin-right:6px}.platP i.o{background:#1d9e75}
.platEq{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px 16px;margin-bottom:16px}
.platEq .fl{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}
.platEq .fl button{all:unset;cursor:pointer;border:1px solid var(--line);border-radius:999px;padding:4px 11px;font-size:12.5px;color:var(--fg)}
.platEq .fl button.on{background:#0f6e56;border-color:#0f6e56;color:#fff}
.platLb{font-size:13px;color:var(--muted);margin:2px 2px 8px;font-weight:600}
.platGr{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.platGp{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.platGp>b{display:block;font-size:14px;color:var(--fg);margin-bottom:6px}
.platC{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-size:12.5px;padding:6px 10px;border:1px solid var(--line);border-radius:9px;margin:4px 4px 0 0;color:var(--fg)}
.platC:hover{border-color:var(--plat);color:var(--plat)}
@media (max-width:560px){.platGrid{grid-template-columns:1fr 1fr;gap:9px;padding:12px}.platK{min-height:104px;padding:12px}.platHero{margin:10px 10px 0}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);cores();

/* capa fixa: sempre aparece ao abrir o link da CB */
try{const q=new URLSearchParams(location.search),qe=(q.get('e')||'').toLowerCase();if(PLATS[qe]){EMP=qe;cores();
  const c=document.createElement('div');c.id='platCapa';c.setAttribute('role','button');c.tabIndex=0;
  c.innerHTML=`<div class="lg">${CFG().sig}</div><h1>${CFG().nome}</h1><p>Plataforma ${CFG().nome} &amp; FC 3D</p><div class="bt">Entrar</div><div class="wm">FC CONSULTORIA EM ESQUADRIA · uso exclusivo</div>`;
  const fecha=()=>{c.remove();const u=document.getElementById('lgU');if(u)u.focus();};
  c.onclick=fecha;c.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' ')fecha();};
  (document.body?document.body.appendChild(c):document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(c)));}}catch(_){}

const tema=()=>{const r=document.documentElement,esc=r.getAttribute('data-theme')!=='dark';r.setAttribute('data-theme',esc?'dark':'light');try{localStorage.setItem('plat-'+EMP+'-tema',esc?'dark':'light');}catch(_){}pinta(true);};
try{const t=localStorage.getItem('plat-'+EMP+'-tema');if(t&&PLATS[(new URLSearchParams(location.search).get('e')||'').toLowerCase()])document.documentElement.setAttribute('data-theme',t);}catch(_){}


/* ---------- tutorial guiado por setor (mesmo formato da Guaporé) ---------- */
const CARD={
 cen:'A Central do Gestor é o resumo da semana: quem da equipe entrou, o que fez e o que está pendente em cada setor. Comece o dia por aqui.',
 eq:'No Painel da Equipe você vê quem está online agora e o último acesso de cada pessoa. Toque para abrir a lista completa e filtrar por setor ou por quem nunca entrou.',
 proc:'No Fluxo do processo você acompanha as etapas da consultoria da FC e o que já foi concluído em cada frente.',
 acao:'O Plano de ação traz os pontos levantados na visita, com responsável e prazo para resolver.',
 gal:'Na Galeria ficam as fotos do antes e depois do processo de mudança da empresa.',
 dem:'Em Demandas e entregas você vê o que foi pedido à FC e o que já foi entregue.',
 pla:'Nas Planilhas de precificação ficam os custos e as tabelas de preço. As fórmulas ficam travadas; você só preenche o que estiver liberado.',
 est:'Em Estoque e importação você atualiza o estoque da plataforma com a planilha do sistema da empresa.',
 rvi:'O Relatório de vendas mostra os itens orçados e os itens em pedidos, somados por código e cor. Escolha o período, a linha e a cor, e baixe em Excel para planejar as compras.',
 comp:'Onde comprar mostra em quais extrusoras cada perfil é fabricado.',
 conv:'O Conversor de códigos traduz o código de um fornecedor para o código padrão, com o desenho para conferir antes de comprar.',
 dist:'Em Compras com distribuidoras ficam as cotações e comparações de preço com as distribuidoras.',
 cat:'O Catálogo mostra os perfis da {cli} com foto, medidas e peso. As medidas e pesos são de referência: confirme sempre com o fornecedor.',
 orc:{gestor:'No Painel de Vendas Atacado você acompanha os resultados, aprova pedidos e descontos e vê o desempenho de cada vendedor.',
      gerente:'O Painel de Vendas Atacado é a principal ferramenta da coordenação. Aqui você acompanha os orçamentos da equipe e aprova os descontos acima do limite autorizado.',
      '':'No Painel de Vendas Atacado ficam os orçamentos e pedidos da empresa.'},
 pcod:'Na Pesquisa de código você encontra um perfil pelo código de qualquer fornecedor.',
 ori:'Treinamento · Orientativo abre o guia de esquadrias da Plataforma FC 3D, em outra aba: tipologias, componentes, catálogo de perfis e prova final. Entre com o seu login da plataforma.',
 esq:'Em Treinamento · Agenda on-line você vê os próximos treinamentos ao vivo com a FC, faz a inscrição e entra na hora marcada.',
 casa:'No Monte sua Casa 3D você coloca as esquadrias na planta e apresenta o projeto ao cliente.',
 dia:'Os Diagramas de pressão de vento ajudam a escolher o perfil adequado conforme a altura e a região da obra.',
 sol:'Em Solicitações com a FC você envia pedidos e dúvidas ao suporte e acompanha a resposta.',
 age:'Na Agenda da FC aparecem as visitas, os treinamentos e os compromissos da FC com a {cli}.',
 mkt:'Nas Dicas de marketing a FC envia ideias para divulgar a empresa.',
 div:'Em Divulgação ficam os materiais prontos para divulgar a empresa.'};
const INTRO={
 gestor:['Gestor','Bem-vindo à Plataforma {cli} e FC 3D. Como gestor, você vê todos os setores da empresa. Cada cartão abre uma ferramenta; vou mostrar uma por uma.'],
 compras:['Compras','Este é o painel do Compras. Aqui estão as ferramentas para planejar e fazer as compras: relatório de vendas, estoque, onde comprar, cotações e o catálogo.'],
 gerente:['Coordenação','Este é o painel da coordenação comercial. Aqui você acompanha a equipe de vendas, aprova descontos e consulta o catálogo e os treinamentos.'],
 marketing:['Marketing','Este é o painel do Marketing. Aqui você acompanha o catálogo da empresa, a galeria do processo de mudança e fala com a FC.'],
 estoque:['Estoque','Este é o painel do Estoque. Aqui você atualiza o estoque com a planilha do sistema, pesquisa e converte códigos, consulta o catálogo e estuda as esquadrias no treinamento.'],
 fabrica:['Fábrica','Este é o painel da Fábrica. Aqui você estuda as esquadrias no Treinamento · Orientativo, acompanha a Agenda on-line e consulta o catálogo de perfis.'],
 '':['Visão do cliente','Esta é a Plataforma {cli} e FC 3D. Cada cartão abre uma ferramenta; vou mostrar uma por uma.']};
const temP=()=>{try{return typeof PESSOA!=='undefined'&&!!PESSOA;}catch(_){return false;}};
const vc=()=>(!temP()&&window.VCOMO)?window.VCOMO:null;
const papel=()=>{try{return (temP()&&PESSOA.papel)||(vc()&&vc().papel)||'';}catch(_){return '';}};
const chaveTut=()=>{try{return 'plat-'+EMP+'-tour-v1-'+((PESSOA&&(PESSOA.login||PESSOA.id))||'fc');}catch(_){return 'plat-'+EMP+'-tour-v1-fc';}};
function tutorial(){if(!window.FCTour)return;
  if(modo!=='home'){modo='home';homeTab=(typeof tab!=='undefined')?tab:null;pinta(true);}
  const pp=papel(),cl=t=>String(t).split('{cli}').join(CFG().nome),[nome,intro0]=INTRO[pp]||INTRO[''],intro=cl(intro0);
  const passos=[['.platHero .lg',intro]];
  const semTx=[];{const eq=document.querySelector('.platGrid [data-eq]');if(eq)passos.push(['.platGrid [data-eq]',cl(CARD.eq)]);}document.querySelectorAll('.platGrid .platK').forEach(k=>{let t=CARD[k.dataset.t];if(t&&typeof t==='object')t=t[pp]||t[''];
    if(!t){const nm=(k.querySelector('b')||{}).textContent||'';t='Em '+nm+' você encontra mais uma ferramenta da FC. Toque no cartão para abrir.';semTx.push(k.dataset.t);}
    passos.push(['.platK[data-t="'+k.dataset.t+'"]',cl(t)]);});
  /* revisão do tutorial: cartão novo sem explicação fica registrado para a FC atualizar o texto */
  if(semTx.length){try{console.warn('Tutorial da plataforma sem texto para:',semTx.join(', '));if(temP())sb.rpc('emp_registrar',{p_token:PESSOA.token,p_area:'tutorial',p_acao:'revisar texto do tutorial: '+semTx.join(', ')}).then(()=>{},()=>{});}catch(_){}}
  passos.push(['.platHero [data-a="tema"]','Aqui você troca o fundo para claro ou escuro. A escolha fica salva neste aparelho.']);
  passos.push([null,'Dentro de qualquer ferramenta, toque em Todos os cards para voltar a esta tela.']);
  passos.push(['.platHero [data-a="tut"]','Para rever este tutorial, toque em Tutorial quando quiser. Ficou com dúvida? Abra Solicitações com a FC ou chame no WhatsApp, de segunda a sexta.']);
  FCTour.iniciar({titulo:'Tutorial · '+nome,passos,cor:CFG().cor,aoFim:()=>{try{localStorage.setItem(chaveTut(),'1');}catch(_){}
    try{if(typeof PESSOA!=='undefined'&&PESSOA)sb.rpc('emp_registrar',{p_token:PESSOA.token,p_area:'tutorial',p_acao:'viu o tutorial da plataforma'}).then(()=>{},()=>{});}catch(_){}}});}
let tutAuto=false;
const nomePapel=()=>{try{if(temP())return PAPEL_NOME[PESSOA.papel]||PESSOA.papel;const v=vc();return v?(PAPEL_NOME[v.papel]||v.papel)+' · prévia da FC':'Visão do cliente';}catch(_){return '';}};
const sair=()=>{const b=document.getElementById('pesSair');if(b)b.click();else location.reload();};

/* ---------- Matriz: "Ver como" cada perfil da CB (prévia, não grava nada) ---------- */
const ORD=['gestor','compras','estoque','gerente','marketing','fabrica'],PAD={compras:['comp','dist','est','pla','conv','age','sol'],estoque:['est','pcod','conv','cat','esq','ori','sol','age'],gerente:['orc','cat','pcod'],marketing:['cat'],fabrica:['esq','cat']};
let LISTA=null,carregando=false;
function perfis(){const r=[];ORD.forEach(pp=>{const ps=(LISTA||[]).filter(p=>p.papel===pp&&p.ativo!==false);
  if(!ps.length&&pp!=='fabrica')return;const p=ps[0]||{nome:'Fábrica',papel:'fabrica'};
  const lb=pp==='gestor'?p.nome.split(' ')[0]+' · Gestor':pp==='gerente'?'Coordenação':pp==='fabrica'?'Fábrica':p.nome.split(' ')[0]+' · '+(PAPEL_NOME[pp]||pp);
  r.push({papel:pp,nome:pp==='gerente'?'Coordenação':p.nome,lb,abas:pp==='gestor'?null:(p.abas||PAD[pp]||[]),sem:!ps.length});});if(EXTRA&&!r.some(x=>x.papel===EXTRA.papel))r.push(EXTRA);return r;}
function escolhe(v){window.VCOMO=v;modo='home';homeTab=undefined;try{render();}catch(_){pinta(true);}setTimeout(()=>{pinta(true);window.scrollTo({top:0,behavior:'smooth'});},60);}
function barraVer(hero){
  if(!LISTA){if(!carregando&&typeof sb!=='undefined'){carregando=true;sb.rpc('emp_pessoas_lista',{p_emp:EMP}).then(r=>{LISTA=r.data||[];carregando=false;
      const pend=window.VCOMO_PEND;if(pend){window.VCOMO_PEND=null;if(!perfis().some(x=>x.papel===pend)&&QV.get('abas')!=null){const nm=QV.get('nome')||(PAPEL_NOME[pend]||pend);EXTRA={papel:pend,nome:nm,lb:nm.split(' ')[0]+' · '+(PAPEL_NOME[pend]||pend),abas:QV.get('abas').split(',').filter(Boolean)};}
      const v=perfis().find(x=>x.papel===pend);if(v){if(modo==='aba'){window.VCOMO=v;try{if(T_URL&&typeof tab!=='undefined'&&v.abas&&v.abas.includes(T_URL))tab=T_URL;render();}catch(_){}setTimeout(()=>pinta(true),60);return;}escolhe(v);return;}}pinta(true);},()=>{carregando=false;});}return;}
  const P=perfis(),at=(window.VCOMO&&window.VCOMO.papel)||'gestor';
  const b=document.createElement('div');b.className='platVer';
  b.innerHTML='<b>👁 Ver como:</b>'+P.map(x=>`<button type="button" data-vc="${x.papel}" class="${x.papel===at?'on':''}">${h(x.lb)}</button>`).join('')+
    (EMP==='gb'?`<button type="button" data-pcom="vendedor" title="Abre o Portal Comercial como o vendedor vê">Comercial · Vendedor ↗</button>`:'')+`<span class="n">Prévia da FC: mostra exatamente os cards que cada login vê. Nada é gravado e não conta como acesso da pessoa.${P.some(x=>x.sem)?' Fábrica: ninguém cadastrado ainda (cards padrão do papel).':''}</span>`;
  b.querySelectorAll('[data-vc]').forEach(k=>k.onclick=()=>{const v=P.find(x=>x.papel===k.dataset.vc);escolhe(v&&v.papel!=='gestor'?v:(v?{papel:'gestor',nome:v.nome,abas:null}:null));});
  {const pc=b.querySelector('[data-pcom]');if(pc)pc.onclick=()=>window.open('/treinamento/guapore/portal-comercial.html?papel='+pc.dataset.pcom,'_blank','noopener');}
  hero.before(b);}

/* 30/10/2026 · gestor: Central do Gestor e Painel da Equipe em destaque; demais ferramentas agrupadas em chips */
const GRUPOS=[['🛒','Vendas',['orc','pcom','cat','rvi','pcod']],['📦','Compras e estoque',['pla','est','conv','comp','dist']],
 ['🎓','Treinamento',['ori','esq','mos','casa','dia','e3d']],['🤝','Consultoria FC',['proc','acao','gal','dem','sol','age','mkt','div']]];
const PAP={gestor:'Gestor',compras:'Compras',vendas:'Vendas',gerente:'Coordenação',marketing:'Marketing',fabrica:'Fábrica',estoque:'Estoque'};
let EQ=null,EQc=false,EQab=false,EQf='';
const quandoP=t=>{if(!t)return 'nunca entrou';const m=Math.round((Date.now()-new Date(t))/60000);if(m<60)return 'há '+Math.max(1,m)+' min';
  const d=new Date(t),hj=new Date(),hh=d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  if(d.toDateString()===hj.toDateString())return 'hoje '+hh;const on=new Date(hj-864e5);if(d.toDateString()===on.toDateString())return 'ontem '+hh;
  const dias=Math.floor((hj-d)/864e5);return dias<30?'há '+dias+' dias':d.toLocaleDateString('pt-BR');};
function eqCarrega(){if(EQc||typeof sb==='undefined')return;EQc=true;
  sb.rpc('emp_central',temP()?{p_token:PESSOA.token}:{p_token:'',p_emp:EMP}).then(r=>{EQc=false;if(r&&r.data){EQ=r.data;if(modo==='home')pinta(true);}},()=>{EQc=false;});}
setInterval(()=>{if(!document.hidden&&modo==='home'&&document.querySelector('.platTop')){EQc=false;eqCarrega();}},60000);
const eqPessoas=()=>((EQ&&EQ.pessoas)||[]).slice().sort((a,b)=>(b.online?1:0)-(a.online?1:0)||new Date(b.ultimo||0)-new Date(a.ultimo||0));
const linhaP=p=>`<div class="platP"><span><i class="${p.online?'o':''}"></i>${h(p.nome)} <small>· ${h(PAP[p.papel]||p.papel)}</small></span>${p.online?'<span class="on">online</span>':p.ultimo?`<small>${h(quandoP(p.ultimo))}</small>`:'<span class="nu">nunca entrou</span>'}</div>`;
function topoGestor(btns,abre){
  const P=eqPessoas(),S=(EQ&&EQ.sem)||{},est=(EQ&&EQ.estoque)||{},ed=est.em?Math.floor((Date.now()-new Date(est.em))/864e5):null;
  const pend=(S.desc24?1:0)+(S.fin48?1:0)+(ed!=null&&ed>7?1:0),onl=P.filter(p=>p.online).length;
  const t=document.createElement('div');t.className='platTop';
  t.innerHTML=`<button type="button" class="platB platK" data-t="cen"><span class="tt"><span class="ic" aria-hidden="true">🏠</span><b>Central do Gestor</b></span>
    <span class="d">Resumo da empresa e o que depende de você.</span>
    <span class="platKp"><div class="${pend?'al':''}"><b>${EQ?pend:'–'}</b><span>precisa de você</span></div><div><b>${EQ?(S.n1||0):'–'}</b><span>orçamentos na semana</span></div></span>
    <span class="lk">Abrir a central →</span></button>
   <button type="button" class="platB eq" data-eq="1"><span class="tt"><span class="ic" aria-hidden="true">👥</span><b>Painel da Equipe</b></span>
    <span class="d">${EQ?onl+' online agora · '+P.length+' na equipe':'Carregando a equipe…'}</span>
    <span style="display:block">${P.slice(0,4).map(linhaP).join('')}</span>
    <span class="lk">${EQab?'Fechar lista ↑':'Ver toda a equipe ('+P.length+') →'}</span></button>`;
  t.querySelector('[data-t="cen"]').onclick=()=>abre('cen');
  t.querySelector('[data-eq]').onclick=()=>{EQab=!EQab;pinta(true);};
  if(!EQ)eqCarrega();
  const frag=[t];
  if(EQab){const set=[...new Set(P.map(p=>p.papel))],nunca=P.filter(p=>!p.ultimo&&!p.online).length;
    const L=P.filter(p=>!EQf?true:EQf==='_on'?p.online:EQf==='_nu'?(!p.ultimo&&!p.online):p.papel===EQf);
    const e=document.createElement('div');e.className='platEq';
    e.innerHTML=`<div class="fl"><button type="button" data-f="" class="${!EQf?'on':''}">Todos (${P.length})</button><button type="button" data-f="_on" class="${EQf==='_on'?'on':''}">Online (${onl})</button>${set.map(x=>`<button type="button" data-f="${h(x)}" class="${EQf===x?'on':''}">${h(PAP[x]||x)}</button>`).join('')}<button type="button" data-f="_nu" class="${EQf==='_nu'?'on':''}">Nunca entrou (${nunca})</button></div>${L.map(linhaP).join('')||'<div class="platP"><small>Ninguém neste filtro.</small></div>'}`;
    e.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{EQf=b.dataset.f;pinta(true);});frag.push(e);}
  return frag;}
function gruposGestor(btns,abre){const ks=btns.map(b=>b.dataset.t).filter(k=>k!=='cen'),usados=new Set(),info=k=>{const b=btns.find(x=>x.dataset.t===k),tx=b.textContent.trim(),m=tx.match(/^(\S+)\s+(.*)$/),N=NOMES[k];return [N?N[0]:m?m[1]:'▪',N?N[1]:m?m[2]:tx];};
  const G=GRUPOS.map(([ic,nm,lst])=>{const it=lst.filter(k=>ks.includes(k));it.forEach(k=>usados.add(k));return [ic,nm,it];});
  const resto=ks.filter(k=>!usados.has(k));if(resto.length)G.push(['▪','Outras ferramentas',resto]);
  const w=document.createElement('div');
  w.innerHTML='<div class="platLb">Outras ferramentas</div><div class="platGr">'+G.filter(g=>g[2].length).map(([ic,nm,it])=>`<div class="platGp"><b>${ic} ${h(nm)}</b>${it.map(k=>{const [i,l]=info(k);return `<button type="button" class="platC platK" data-t="${h(k)}"><span aria-hidden="true">${h(i)}</span>${h(l)}</button>`;}).join('')}</div>`).join('')+'</div>';
  w.querySelectorAll('.platC').forEach(c=>c.onclick=()=>abre(c.dataset.t));return w;}
function pinta(forca){
  const f=document.getElementById('ficha');if(!f||!ehCB())return;
  const tg=f.querySelector('.tabg');if(!tg)return;
  if(f.querySelector('.platHero')&&!forca)return;
  f.classList.add('platOn');
  const tAtual=(typeof tab!=='undefined')?tab:null;
  if(homeTab===undefined)homeTab=tAtual;
  if(modo==='home'&&tAtual!==homeTab)modo='aba';
  f.querySelectorAll('.platVer,.platHero,.platGrid,.platVolta,.platWm').forEach(x=>x.remove());
  const fh=f.querySelector('.fh'),bar=f.querySelector('.cliente-bar'),body=f.querySelector(':scope > .body');
  if(fh)fh.style.display='none';if(bar&&bar.parentElement)bar.parentElement.style.display='none';
  tg.style.display='none';
  const escuro=document.documentElement.getAttribute('data-theme')==='dark';
  const nome=temP()?PESSOA.nome.split(' ')[0]:(vc()?vc().nome.split(' ')[0]:'equipe');
  const hero=document.createElement('div');hero.className='platHero';
  hero.innerHTML=`<div class="lg">${CFG().sig}</div><div><h2>Olá, ${h(nome)}</h2><div class="s">Plataforma ${h(CFG().nome)} &amp; FC 3D · ${h(nomePapel())}</div></div>
   <div class="bts"><button type="button" data-a="tut">▶ Tutorial</button><button type="button" data-a="tema">${escuro?'☀ Fundo claro':'🌙 Fundo escuro'}</button>${(typeof PESSOA!=='undefined'&&PESSOA)?'<button type="button" data-a="sair">Sair</button>':''}</div>`;
  hero.querySelector('[data-a="tema"]').onclick=tema;hero.querySelector('[data-a="tut"]').onclick=tutorial;const bs=hero.querySelector('[data-a="sair"]');if(bs)bs.onclick=sair;
  tg.before(hero);
  if(!temP())barraVer(hero);
  const btns=[...tg.querySelectorAll('button.tab[data-t]')];
  if(modo==='home'){
    if(body)body.style.display='none';
    const ord=k=>k==='cen'?-1:btns.findIndex(b=>b.dataset.t===k);
    const g=document.createElement('div');g.className='platGrid';
    const abre=t=>{if(t==='ori'){window.open(ORI_URL,'_blank','noopener');return;}modo='aba';const o=btns.find(b=>b.dataset.t===t);if(o)o.click();else pinta(true);window.scrollTo({top:0,behavior:'smooth'});};
    if(btns.some(b=>b.dataset.t==='cen')){g.classList.add('platG');topoGestor(btns,abre).forEach(x=>g.appendChild(x));g.appendChild(gruposGestor(btns,abre));}else{
    g.innerHTML=btns.slice().sort((a,b)=>ord(a.dataset.t)-ord(b.dataset.t)).map(b=>{const k=b.dataset.t,tx=b.textContent.trim(),m=tx.match(/^(\S+)\s+(.*)$/),N=NOMES[k],ic=N?N[0]:m?m[1]:'▪',lb=N?N[1]:m?m[2]:tx;
      let d=N?N[2]:(b.getAttribute('title')||'').trim();if(d.length>70)d=d.slice(0,68).replace(/\s\S*$/,'')+'…';
      return `<button type="button" class="platK${k==='cen'?' dest':''}" data-t="${h(k)}"><span class="ic" aria-hidden="true">${h(ic)}</span><b>${h(lb)}</b>${d?`<span class="d">${h(d)}</span>`:''}</button>`;}).join('');
    g.querySelectorAll('.platK').forEach(k=>k.onclick=()=>abre(k.dataset.t));}
    hero.after(g);
    if(!tutAuto&&typeof PESSOA!=='undefined'&&PESSOA){tutAuto=true;let visto='1';try{visto=localStorage.getItem(chaveTut());}catch(_){}if(!visto)setTimeout(()=>{if(!window.FCTour||!FCTour.ativo())tutorial();},900);}
    const wm=document.createElement('div');wm.className='platWm';wm.textContent='© FC Consultoria em Esquadria';g.after(wm);
  }else{
    if(body)body.style.display='';
    const atual=btns.find(b=>b.getAttribute('aria-selected')==='true');
    const v=document.createElement('div');v.className='platVolta';
    v.innerHTML=`<button type="button">← Todos os cards</button><b>${h(atual?(NOMES[atual.dataset.t]?NOMES[atual.dataset.t][0]+' '+NOMES[atual.dataset.t][1]:atual.textContent.trim()):'')}</b>`;
    v.querySelector('button').onclick=()=>{modo='home';homeTab=(typeof tab!=='undefined')?tab:null;pinta(true);window.scrollTo({top:0,behavior:'smooth'});};
    hero.after(v);
  }
}
const ob=new MutationObserver(()=>pinta(false));
const liga=()=>{const f=document.getElementById('ficha');if(f)ob.observe(f,{childList:true});else setTimeout(liga,200);};liga();
window.FCPlataformaCB={tutorial:()=>tutorial(),home:()=>{modo='home';homeTab=(typeof tab!=='undefined')?tab:null;pinta(true);}};
})();
