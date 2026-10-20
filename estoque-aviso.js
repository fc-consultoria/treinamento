/* ===== Aviso do estoque semanal =====
   Todo dia, a partir das 10:00, enquanto a planilha de estoque da semana não for importada,
   aparece o aviso para importar até a próxima segunda-feira.
   Vale a importação feita de terça a segunda (ciclo de 7 dias que fecha na segunda).
   Uso: FCEstAviso.cliente(chave) no link do cliente · FCEstAviso.matriz() no painel da matriz. */
(function(){
  const HORA=10;
  const dia0=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x;};
  /* ciclo: a cada N dias (7, 15 ou 30) a partir da data de início; sem data definida = toda segunda-feira */
  const ciclo=fx=>{fx=fx||{};const N=[7,15,30].includes(+fx.dias)?+fx.dias:7;let S=fx.ini?new Date(fx.ini+'T00:00:00'):new Date('2026-10-19T00:00:00');if(isNaN(S))S=new Date('2026-10-19T00:00:00');
    const h=dia0(Date.now()),k=Math.max(0,Math.ceil((h-S)/(N*864e5)));const p=new Date(S);p.setDate(p.getDate()+k*N);const a=new Date(p);a.setDate(a.getDate()-N+1);return {prazo:p,ini:a,N,antes:h<S};};
  const prazo=fx=>ciclo(fx).prazo,ini=fx=>ciclo(fx).ini;
  const feito=(em,fx)=>!!em&&new Date(em)>=ini(fx);
  const br=d=>d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'});
  const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const kOk=id=>'fc_est_ok_'+id+'_'+dia0(Date.now()).toISOString().slice(0,10);
  const lg=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(_){return null;}};
  const leg='<span style="display:inline-flex;gap:10px;flex-wrap:wrap;font-size:13px">'+[['#c62828','sem estoque'],['#ef7d00','baixo'],['#f2c200','no limite'],['#1f8a4c','bom']].map(([c,t])=>`<span style="display:inline-flex;align-items:center;gap:5px"><span style="width:11px;height:11px;border-radius:50%;background:${c};display:inline-block"></span>${t}</span>`).join('')+'</span>';
  function caixa(id,html){let b=document.getElementById(id);if(!b){b=document.createElement('div');b.id=id;b.style.cssText='position:relative;z-index:60;margin:12px auto;max-width:1180px;width:calc(100% - 24px);background:#fff8ec;color:#3b2a10;border:2px solid #ef7d00;border-radius:14px;padding:14px 16px;font:400 15px/1.5 system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.12)';document.body.insertBefore(b,document.body.firstChild);}b.innerHTML=html;return b;}
  function texto(nome,em,fx){const p=prazo(fx),f=Math.round((p-dia0(Date.now()))/864e5);
    return `<b style="font-size:17px">📦 Atualizar o estoque${nome?' · '+esc(nome):''}</b>
     <p style="margin:4px 0">Importe a planilha de estoque do sistema até <b>${br(p)}</b>${f===0?' (<b style="color:#c62828">é hoje</b>)':f===1?' (amanhã)':' (faltam '+f+' dias)'} para o estoque ficar atualizado (rotina: a cada ${ciclo(fx).N} dias).
     A planilha precisa ter as colunas de <b>código</b> e <b>quantidade/saldo</b>. Cada item ganha a bolinha de situação: ${leg}</p>
     <p style="margin:0;font-size:13px;color:#6b5530">${em?'Última importação: '+new Date(em).toLocaleDateString('pt-BR'):'O estoque ainda não foi importado.'}</p>`;}
  function mostrar(id,nome,em,link,fx){
    const agora=new Date();if(agora.getHours()<HORA||feito(em,fx)||lg(kOk(id)))return false;
    const b=caixa('estAv_'+id,texto(nome,em,fx)+`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
      <a href="${esc(link)}" target="_blank" rel="noopener" style="background:#ef7d00;color:#fff;font-weight:700;padding:9px 14px;border-radius:9px;text-decoration:none">📥 Importar estoque agora</a>
      <button type="button" data-ok style="border:1px solid #c9a46a;background:#fff;color:#3b2a10;font-weight:600;padding:8px 13px;border-radius:9px;cursor:pointer">Lembrar amanhã às 10:00</button></div>`);
    b.querySelector('[data-ok]').onclick=()=>{lg(kOk(id),'1');b.remove();};return true;}
  // reavalia na virada das 10:00 se a página ficar aberta
  function agenda(fn){let ult=new Date().getHours();setInterval(()=>{const h=new Date().getHours();if(h!==ult){ult=h;fn();}},60e3);}
  window.FCEstAviso={
    ciclo,prazo,feito,
    async cliente(chave){if(!chave||typeof sb==='undefined')return;const run=async()=>{try{const r=await sb.rpc('orc_dados',{p_chave:chave});const d=r.data;if(!d||!d.emp)return;
        mostrar(d.emp,'',(d.cab||{}).estEm,'orcamento/?k='+encodeURIComponent(chave)+'&aba=est',(d.cab||{}).estFx);}catch(_){}};
      await run();agenda(run);},
    async matriz(){const s=(typeof sb!=='undefined'&&sb)||window.sb;if(!s)return;const run=async()=>{try{const [c,n]=await Promise.all([s.from('orc_cfg').select('empresa_id,cab'),s.from('rotina_docs').select('id,data').eq('col','consultoria')]);
        const NM={};(n.data||[]).forEach(x=>NM[x.id]=(x.data||{}).nome||x.id);
        (c.data||[]).forEach(x=>mostrar(x.empresa_id,NM[x.empresa_id]||x.empresa_id,(x.cab||{}).estEm,'orcamento/?e='+encodeURIComponent(x.empresa_id)+'&aba=est',(x.cab||{}).estFx));}catch(_){}};
      await run();agenda(run);}
  };
})();
