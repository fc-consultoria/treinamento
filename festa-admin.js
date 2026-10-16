/* ===== Painel da Matriz · Marketing · Comemoração no site =====
   Fernando escreve o motivo (aniversário de cliente, da cidade, feriado, férias coletivas...), escolhe uma arte e ativa.
   O site mostra a faixa no topo, abre a arte uma vez por visitante e solta confete. Fica no ar até a data escolhida. */
(function(){
  const SITE='https://fc-consultoria.github.io/';
  const MODELOS=[
    ['🎂','Aniversário de cliente','🎂 Parabéns, [nome do cliente]!','Hoje é aniversário da [empresa]. A FC deseja muito sucesso e boas obras!'],
    ['🏙','Aniversário da cidade','🏙 Parabéns, [cidade]!','[X] anos de história. A FC Consultoria tem orgulho de fazer parte.'],
    ['🇧🇷','Feriado','🇧🇷 Feliz [feriado]!','No feriado não há expediente. Retornamos no próximo dia útil. Pode deixar sua mensagem pelo site.'],
    ['🏖','Férias coletivas','🏖 Férias coletivas da FC','De [data] a [data] estamos em férias coletivas. Mensagens deixadas pelo site serão respondidas no retorno.'],
    ['🎉','Livre','🎉 ','']];
  const F={atual:null,img:null,arte:null,artes:null,aberto:false,carregado:false};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const hojeYmd=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const maisDias=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const br=s=>s?s.split('-').reverse().join('/'):'';
  const noAr=f=>f&&f.ativo&&f.ate>=hojeYmd()&&(!f.de||f.de<=hojeYmd());
  function aviso(t,ruim){const e=document.createElement('div');e.textContent=t;e.style.cssText=`position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:${ruim?'#b42318':'#1b232a'};color:#fff;padding:9px 16px;border-radius:99px;font:600 14px var(--f-body);z-index:9999`;document.body.appendChild(e);setTimeout(()=>e.remove(),2800);}

  async function carregar(){
    try{
      const r=await sb.from('trein_eventos').select('detalhe,criado_em').eq('tipo','site_festa').order('criado_em',{ascending:false}).limit(1);
      F.atual=(r.data&&r.data[0])?r.data[0].detalhe:null;
      if(!F.artes){const a=await sb.from('trein_eventos').select('detalhe').eq('tipo','div_art');F.artes=(a.data||[]).map(x=>x.detalhe).filter(d=>d&&d.img);}
    }catch(e){console.error('festa',e);}
    F.carregado=true;desenhar();
  }
  const inp='font:500 14px var(--f-body);padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--fg);width:100%;box-sizing:border-box';
  const bt=(ac,t,pri,extra)=>`<button type="button" data-fs="${ac}" ${extra||''} style="font:600 13.5px var(--f-body);padding:8px 13px;border-radius:8px;cursor:pointer;border:1px solid ${pri==='bad'?'#b42318':pri?'#d97706':'var(--line)'};background:${pri&&pri!=='bad'?'#f59e0b':'#fff'};color:${pri==='bad'?'#b42318':pri?'#2b1700':'var(--fg)'}">${t}</button>`;
  function desenhar(){
    const B=$('fsBox');if(!B)return;
    const f=F.atual,ar=noAr(f);
    B.innerHTML=`<div style="border:1px solid #f6c983;background:linear-gradient(180deg,#fff7e6,#fff 70%);border-radius:12px;padding:12px 14px;margin-bottom:16px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <b style="font:600 16px var(--f-display)">🎉 Comemoração no site</b>
        <span class="note">Faixa no topo do site, arte que abre na tela e confete. Aniversário de cliente, da cidade, feriado, férias coletivas…</span>
        <span style="margin-left:auto;display:flex;gap:8px;align-items:center">${ar?`<span style="background:#e2f4ea;color:#1f8a4c;font:600 12.5px var(--f-body);padding:3px 10px;border-radius:99px">● No ar até ${esc(br(f.ate))}</span>`:'<span class="note">Nada no ar agora</span>'}
          ${bt('abrir',F.aberto?'Fechar ▲':(ar?'Trocar ▼':'＋ Nova comemoração'),!F.aberto&&!ar)}</span></div>
      ${ar?`<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:10px;padding:10px;border-radius:10px;background:linear-gradient(90deg,#f59e0b,#f97316);color:#2b1700">
        ${f.img?`<img src="${f.img}" alt="" style="width:54px;height:54px;object-fit:cover;border-radius:8px">`:''}<div style="flex:1;min-width:200px"><b>${esc(f.titulo)}</b> <span>${esc(f.texto||'')}</span></div>
        <a href="${SITE}?v=${Date.now()}" target="_blank" rel="noopener" style="font:600 13.5px var(--f-body);color:#2b1700">Ver no site ↗</a>${bt('tirar','Tirar do ar','bad')}</div>`:''}
      ${F.aberto?formHtml():''}</div>`;
  }
  function formHtml(){
    const rot=t=>`<div style="font:600 12px var(--f-body);text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:12px 0 6px">${t}</div>`;
    return `${rot('Escolha um modelo (você ajusta o texto)')}
      <div style="display:flex;gap:6px;flex-wrap:wrap">${MODELOS.map((m,i)=>bt('modelo',m[0]+' '+m[1],false,'data-i="'+i+'"')).join('')}</div>
      ${rot('Motivo da comemoração')}
      <div style="display:grid;gap:8px"><input id="fsTit" maxlength="90" placeholder="Ex.: 🎂 Parabéns, Vidraçaria Exemplo!" style="${inp}">
      <input id="fsTxt" maxlength="220" placeholder="Texto curto (opcional)" style="${inp}"></div>
      ${rot('Arte (opcional) · abre na tela do visitante uma vez')}
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        ${(F.artes||[]).map(a=>`<button type="button" data-fs="arte" data-id="${esc(a.id)}" style="all:unset;cursor:pointer;border:3px solid ${F.arte===a.id?'#f59e0b':'transparent'};border-radius:10px;line-height:0"><img src="${a.img}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:7px"></button>`).join('')}
        <label style="font:600 13.5px var(--f-body);padding:8px 12px;border:1px solid var(--line);border-radius:8px;cursor:pointer;background:#fff">${F.img?'✓ Imagem escolhida':'＋ Outra imagem'}<input type="file" accept="image/png,image/jpeg,image/webp" id="fsImg" hidden></label>
        ${F.img||F.arte?bt('semArte','Sem arte'):''}</div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:end;margin-top:12px">
        <label style="font:600 13px var(--f-body)">Começa em<br><input type="date" id="fsDe" value="${hojeYmd()}" style="${inp};width:auto"></label>
        <label style="font:600 13px var(--f-body)">Fica no ar até<br><input type="date" id="fsAte" value="${maisDias(1)}" style="${inp};width:auto"></label>
        <label style="font:600 13.5px var(--f-body);display:flex;gap:6px;align-items:center;padding-bottom:9px"><input type="checkbox" id="fsConf" checked> Soltar confete</label>
        <span style="margin-left:auto">${bt('ativar','🎉 Ativar no site',true)}</span></div>
      <p class="note" style="margin:8px 0 0">Ativar substitui a comemoração que estiver no ar. A faixa some sozinha depois da data final. A comemoração automática de implantação concluída continua funcionando quando não houver uma sua no ar.</p>`;
  }
  document.addEventListener('change',ev=>{
    if(ev.target.id!=='fsImg')return;const f=ev.target.files&&ev.target.files[0];if(!f)return;
    if(f.size>1.5*1024*1024){aviso('Imagem acima de 1,5 MB. Use uma menor.',true);ev.target.value='';return;}
    const r=new FileReader();r.onload=()=>{const t=$('fsTit').value,x=$('fsTxt').value;F.img=String(r.result);F.arte=null;desenhar();$('fsTit').value=t;$('fsTxt').value=x;};r.readAsDataURL(f);
  });
  document.addEventListener('click',async ev=>{
    const el=ev.target.closest('#fsBox [data-fs]');if(!el)return;const a=el.dataset.fs;
    const guardar=()=>({t:$('fsTit')?$('fsTit').value:'',x:$('fsTxt')?$('fsTxt').value:''}),voltar=v=>{if($('fsTit')){$('fsTit').value=v.t;$('fsTxt').value=v.x;}};
    if(a==='abrir'){F.aberto=!F.aberto;desenhar();return;}
    if(a==='modelo'){const m=MODELOS[+el.dataset.i];$('fsTit').value=m[2];$('fsTxt').value=m[3];$('fsTit').focus();return;}
    if(a==='arte'){const v=guardar();F.arte=F.arte===el.dataset.id?null:el.dataset.id;F.img=null;desenhar();voltar(v);return;}
    if(a==='semArte'){const v=guardar();F.arte=null;F.img=null;desenhar();voltar(v);return;}
    if(a==='ativar'){
      const titulo=$('fsTit').value.trim(),texto=$('fsTxt').value.trim(),de=$('fsDe').value||hojeYmd(),ate=$('fsAte').value;
      if(titulo.length<3){aviso('Escreva o motivo da comemoração',true);$('fsTit').focus();return;}
      if(/\[[^\]]+\]/.test(titulo+' '+texto)){aviso('Troque os campos entre colchetes [ ] pelo texto certo',true);return;}
      if(!ate||ate<de){aviso('Confira a data final',true);return;}
      const img=F.img||((F.artes||[]).find(x=>x.id===F.arte)||{}).img||null;
      el.disabled=true;
      const r=await ins('site_festa',{id:'f'+Date.now(),ativo:true,titulo,texto,img,de,ate,confete:$('fsConf').checked});
      el.disabled=false;if(r&&r.error)return;
      F.aberto=false;F.img=null;F.arte=null;aviso(de>hojeYmd()?'Agendada! Entra no site em '+br(de):'No ar! Abra o site para ver');return carregar();}
    if(a==='tirar'){const r=await ins('site_festa',{id:'f'+Date.now(),ativo:false});if(r&&r.error)return;aviso('Comemoração tirada do ar');return carregar();}
  });
  document.addEventListener('DOMContentLoaded',()=>{});
  const tab=document.querySelector('#ptabs [data-tab=mkt]');if(tab)tab.addEventListener('click',()=>{if(!F.carregado)carregar();});
  setTimeout(()=>{if(!F.carregado)carregar();},3500);
  window.FESTA_INFO=()=>noAr(F.atual)?'🎉 Comemoração no ar':'';
})();
