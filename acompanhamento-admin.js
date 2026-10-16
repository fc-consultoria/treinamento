/* ===== Painel da Matriz · Acompanhamento online dos clientes de implantação =====
   Liga/desliga o portal de cada cliente (link com chave), escolhe a publicação (07:00 seg–sex ou manual),
   a "situação do dia" e o cronograma de etapas. O cliente vê só quantidades, códigos, situação e etapas. */
(function(){
  const URL_PORTAL='https://fc-consultoria.github.io/treinamento/acompanhamento/?k=';
  const SITS=[['','Nenhuma (não mostrar)'],['fornecedor','📦 Aguardando retorno do fornecedor'],['cliente','🤝 Aguardando retorno da equipe do cliente'],['sistema','🖥️ Aguardando o suporte do sistema'],['externo','🚗 Equipe em atendimento externo (sem alimentação hoje)'],['conferencia','🔎 Conferência dos itens alimentados'],['livre','ℹ️ Recado livre (só o texto abaixo)']];
  const S={cli:[],por:{},fotos:{},aberto:null,pend:null,carregado:false,erro:''};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const quando=iso=>{if(!iso)return '';const d=new Date(iso);return d.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'}).replace('.','')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});};
  const novaChave=()=>(crypto.randomUUID?crypto.randomUUID()+crypto.randomUUID():String(Math.random())+Date.now()).replace(/[^a-f0-9]/gi,'').slice(0,32);
  function toast(t,ruim){const e=document.createElement('div');e.textContent=t;e.style.cssText=`position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:${ruim?'var(--bad)':'#1b232a'};color:#fff;padding:9px 16px;border-radius:99px;font:600 14px var(--f-body);z-index:9999`;document.body.appendChild(e);setTimeout(()=>e.remove(),2600);}
  function erro(e){console.error(e);toast('Não salvou: '+((e&&e.message)||e),true);}

  async function carregar(){
    try{
      const [c,p,f]=await Promise.all([
        sb.from('impl_clientes').select('id,nome,status').order('nome'),
        sb.from('impl_portal').select('*'),
        sb.from('impl_portal_fotos').select('cliente_id,publicado_em,origem').order('publicado_em',{ascending:false}).limit(500)]);
      for(const r of [c,p,f]) if(r.error) throw r.error;
      S.cli=c.data||[];S.por={};(p.data||[]).forEach(x=>S.por[x.cliente_id]=x);
      S.fotos={};(f.data||[]).forEach(x=>{if(!S.fotos[x.cliente_id])S.fotos[x.cliente_id]=x;});
      S.novos={};try{const rr=await sb.from('impl_portal_recebidos').select('cliente_id').eq('visto',false);if(!rr.error)(rr.data||[]).forEach(x=>S.novos[x.cliente_id]=(S.novos[x.cliente_id]||0)+1);}catch(_){}
      S.anuncios=[];S.vistos=[];S.artes=S.artes||null;
      try{const [an,vi]=await Promise.all([sb.from('impl_portal_anuncios').select('id,cliente_id,titulo,ativo,criado_em').order('criado_em',{ascending:false}).limit(20),sb.from('impl_portal_anuncio_vistos').select('anuncio_id,cliente_id,visto_em')]);
        if(!an.error)S.anuncios=an.data||[];if(!vi.error)S.vistos=vi.data||[];S.semFolder=!!an.error;}catch(_){S.semFolder=true;}
      if(!S.artes){try{const ar=await sb.from('trein_eventos').select('detalhe').eq('tipo','div_art');S.artes=(ar.data||[]).map(x=>x.detalhe).filter(d=>d&&d.img);}catch(_){S.artes=[];}}
      S.erro='';S.carregado=true;
    }catch(e){console.error(e);S.erro=(e&&e.message)||String(e);S.carregado=true;}
    render();
  }
  window.acompLoad=carregar;
  window.ACOMP_INFO=()=>{const n=Object.values(S.por).filter(x=>x.ativo).length,r=Object.values(S.novos||{}).reduce((a,b)=>a+b,0);return S.carregado?(r?`📥 ${r} arquivo${r>1?'s':''} recebido${r>1?'s':''} de cliente`:(n+' cliente'+(n===1?'':'s')+' online')):'';};

  const btn=(acao,txt,extra,estilo)=>`<button type="button" data-ac="${acao}" ${extra||''} style="font:600 13.5px var(--f-body);padding:7px 12px;border-radius:8px;cursor:pointer;border:1px solid ${estilo==='pri'?'var(--accent)':estilo==='bad'?'var(--bad)':'var(--line)'};background:${estilo==='pri'?'var(--accent)':'#fff'};color:${estilo==='pri'?'#fff':estilo==='bad'?'var(--bad)':'var(--fg)'}">${txt}</button>`;
  const rot=t=>`<div style="font:600 12px var(--f-body);text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:14px 0 6px">${t}</div>`;
  const inp='font:500 14px var(--f-body);padding:7px 9px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--fg)';

  function corpo(c){
    const p=S.por[c.id];
    if(!p) return `<p class="note" style="margin:6px 0 10px">Sem acompanhamento online. O cliente continua como hoje, recebendo o andamento só pelo WhatsApp.</p>${btn('ativar','📡 Ativar acompanhamento online','data-id="'+c.id+'"','pri')}`;
    const url=URL_PORTAL+p.chave;
    const pend=(k)=>S.pend===k+'|'+c.id;
    return `
    ${p.ativo?'':`<div style="background:var(--bad-soft);color:var(--bad);padding:8px 12px;border-radius:8px;margin:6px 0">Link desativado: o cliente não consegue abrir. Os dados continuam guardados.</div>`}
    ${rot('Link do cliente')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><input readonly value="${esc(url)}" style="${inp};flex:1;min-width:260px;font-family:var(--f-mono);font-size:12.5px" onclick="this.select()">
      ${btn('copiar','Copiar link','data-url="'+esc(url)+'"')}<a href="${esc(url)}" target="_blank" rel="noopener" style="font:600 13.5px var(--f-body);color:var(--accent)">Ver como o cliente vê ↗</a><a href="${esc(url)}&previa=1" target="_blank" rel="noopener" style="font:600 13.5px var(--f-body);color:#b86e00">Prévia da próxima publicação ↗</a></div>
    ${rot('Publicação do andamento')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      ${btn('modo','Automático · 07:00 seg a sex','data-id="'+c.id+'" data-v="auto"',p.modo==='auto'?'pri':'')}
      ${btn('modo','Manual','data-id="'+c.id+'" data-v="manual"',p.modo==='manual'?'pri':'')}
      <span style="flex:1"></span>${btn('publicar','📤 Publicar andamento agora','data-id="'+c.id+'"')}</div>
    <p class="note" style="margin:6px 0 0">${p.modo==='auto'?'A foto do andamento é publicada às 07:00 (Brasília), de segunda a sexta, com tudo o que foi feito até ali.':'Só publica quando você clicar em "Publicar andamento agora".'} O cliente não vê o andamento em tempo real.</p>
    ${rot('Situação do dia (aparece em destaque para o cliente)')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <select id="acSit-${c.id}" style="${inp}">${SITS.map(([v,t])=>`<option value="${v}" ${(p.situacao||'')===v?'selected':''}>${esc(t)}</option>`).join('')}</select>
      <input id="acDet-${c.id}" value="${esc(p.situacao_detalhe||'')}" placeholder="Complemento (opcional). Ex.: tabela da Udinesse solicitada em 14/10" style="${inp};flex:1;min-width:240px">
      ${btn('sit','Salvar','data-id="'+c.id+'"')}${btn('sit','Salvar e publicar','data-id="'+c.id+'" data-pub="1"','pri')}</div>
    ${p.situacao_em?`<p class="note" style="margin:6px 0 0">Informada em ${esc(quando(p.situacao_em))}. Fica até você trocar ou escolher "Nenhuma".</p>`:''}
    ${rot('Etapas da implantação')}
    <p class="note" style="margin:0">As etapas que o cliente vê vêm da aba <b>Etapas</b> do Painel de Implantação (datas a partir da data de início, status, aviso e cobrança no WhatsApp). <a href="implantacao/" target="_blank" rel="noopener" style="color:var(--accent);font-weight:600">Abrir o Painel de Implantação ↗</a></p>
    ${rot('Segurança do link')}
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${btn('chave',pend('chave')?'Confirmar: o link antigo para de funcionar':'🔑 Gerar nova chave','data-id="'+c.id+'"',pend('chave')?'bad':'')}
      ${p.ativo?btn('ativo',pend('ativo')?'Confirmar desativação':'Desativar link','data-id="'+c.id+'" data-v="0"','bad'):btn('ativo','Reativar link','data-id="'+c.id+'" data-v="1"','pri')}</div>`;
  }

  function render(){
    const B=$('acompBody');if(!B)return;
    if(!S.carregado){B.innerHTML='<p class="note" style="padding:14px 16px">Carregando…</p>';return;}
    if(S.erro){const falta=/impl_portal|impl_cronograma|does not exist|schema cache/i.test(S.erro);B.innerHTML=falta?`<p class="note" style="padding:14px 16px;color:var(--bad)">O acompanhamento online ainda não foi ligado no banco de dados. Rode o arquivo portal_etapa1.sql no Supabase e clique em Atualizar.</p>`:`<p class="note" style="padding:14px 16px;color:var(--bad)">Não consegui carregar o acompanhamento: ${esc(S.erro)}. Confira se você entrou com o login da matriz.</p>`;return;}
    const ordem=[...S.cli].sort((a,b)=>(S.por[b.id]?1:0)-(S.por[a.id]?1:0)||(a.status==='em_andamento'?0:1)-(b.status==='em_andamento'?0:1)||a.nome.localeCompare(b.nome,'pt-BR'));
    B.innerHTML=folderHtml()+`<p class="note" style="padding:10px 16px 0">Ative o acompanhamento cliente por cliente. Quem não estiver ativado continua como antes, só com o WhatsApp.</p>
    <div style="padding:6px 16px 16px">${ordem.map(c=>{const p=S.por[c.id],f=S.fotos[c.id],ab=S.aberto===c.id;
      const badge=!p?'<span style="color:var(--muted);font-size:13px">Sem portal</span>':p.ativo?'<span style="background:var(--ok-soft);color:var(--ok);font:600 12.5px var(--f-body);padding:2px 9px;border-radius:99px">● Online</span>':'<span style="background:var(--bad-soft);color:var(--bad);font:600 12.5px var(--f-body);padding:2px 9px;border-radius:99px">Desativado</span>';
      return `<div style="border:1px solid ${ab?'var(--accent)':'var(--line)'};border-radius:12px;margin-top:10px;background:#fff">
        <button type="button" data-ac="abrir" data-id="${c.id}" style="all:unset;box-sizing:border-box;width:100%;cursor:pointer;display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:12px 14px">
          <b style="font:600 16px var(--f-display)">${esc(c.nome)}</b>${badge}
          ${p&&p.situacao?'<span style="background:#fdf0d9;color:#8a5a12;font:600 12px var(--f-body);padding:2px 8px;border-radius:99px">situação informada</span>':''}
          ${(S.novos||{})[c.id]?`<span style="background:#fdf0d9;color:#8a5a12;font:600 12px var(--f-body);padding:2px 8px;border-radius:99px" title="Abra o cliente no Painel de Implantação → Visão geral → Recebido do cliente">📥 ${S.novos[c.id]} arquivo(s) recebido(s)</span>`:''}
          <span style="margin-left:auto;color:var(--muted);font-size:13px">${f?'Última publicação: '+esc(quando(f.publicado_em))+(f.origem==='auto'?' (automática)':' (manual)'):(p?'Ainda sem publicação':'')}</span><span style="color:var(--muted)">${ab?'▲':'▼'}</span></button>
        ${ab?`<div style="padding:0 14px 14px;border-top:1px solid var(--line)">${corpo(c)}</div>`:''}</div>`;}).join('')}</div>`;
  }

  // ===== Folders e dicas que abrem na tela do cliente =====
  const F={arte:null,img:null,aberto:false};
  function folderHtml(){
    if(S.semFolder) return `<div style="padding:12px 16px"><p class="note" style="color:var(--bad)">Envio de folders ainda não ligado no banco de dados: rode o arquivo portal_anuncios.sql no Supabase.</p></div>`;
    const comPortal=S.cli.filter(c=>S.por[c.id]&&S.por[c.id].ativo);
    const nomeCli=id=>(S.cli.find(c=>c.id===id)||{}).nome||'—';
    const lista=S.anuncios.map(a=>{const alvo=a.cliente_id?[a.cliente_id]:comPortal.map(c=>c.id);const vs=S.vistos.filter(v=>v.anuncio_id===a.id);
      return `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:8px 0;border-top:1px solid var(--line)">
        <b style="font:600 14px var(--f-body)">${esc(a.titulo||'(sem título)')}</b><span class="note">${a.cliente_id?esc(nomeCli(a.cliente_id)):'Todos os clientes com link'} · ${esc(quando(a.criado_em))}</span>
        <span style="font:600 12.5px var(--f-body);color:${vs.length?'var(--ok)':'var(--muted)'}" title="${esc(vs.map(v=>nomeCli(v.cliente_id)+' — '+quando(v.visto_em)).join('\n'))}">👁 visto por ${vs.length} de ${alvo.length}</span>
        ${vs.length?`<span class="note">${esc(vs.slice(0,3).map(v=>nomeCli(v.cliente_id)+' ('+quando(v.visto_em)+')').join(', '))}${vs.length>3?'…':''}</span>`:''}
        <span style="margin-left:auto">${a.ativo?btn('fDesativar','Tirar do ar','data-aid="'+a.id+'"','bad'):'<span class="note">fora do ar</span>'}</span></div>`;}).join('');
    return `<div style="margin:12px 16px 0;border:1px solid var(--line);border-radius:12px;background:#fff">
      <button type="button" data-ac="fAbrir" style="all:unset;box-sizing:border-box;width:100%;cursor:pointer;display:flex;gap:10px;align-items:center;padding:12px 14px">
        <b style="font:600 16px var(--f-display)">📣 Enviar folder ou dica para a tela do cliente</b><span class="note">Cliente online vê em até 1 minuto; off-line vê ao abrir o link.</span><span style="margin-left:auto;color:var(--muted)">${F.aberto?'▲':'▼'}</span></button>
      ${F.aberto?`<div style="padding:0 14px 14px;border-top:1px solid var(--line)">
        ${rot('Arte (da sua aba Divulgação) ou outra imagem')}
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          ${(S.artes||[]).map(a=>`<button type="button" data-ac="fArte" data-id="${esc(a.id)}" style="all:unset;cursor:pointer;border:3px solid ${F.arte===a.id?'var(--accent)':'transparent'};border-radius:10px;line-height:0"><img src="${a.img}" alt="" style="width:92px;height:92px;object-fit:cover;border-radius:7px"></button>`).join('')}
          <label style="font:600 13.5px var(--f-body);padding:7px 12px;border:1px solid var(--line);border-radius:8px;cursor:pointer">${F.img?'✓ Imagem escolhida':'＋ Outra imagem'}<input type="file" accept="image/png,image/jpeg,image/webp" id="fImg" hidden></label>
          ${F.arte||F.img?btn('fSemImg','Sem imagem',''):''}
        </div>
        ${rot('Para quem')}
        <select id="fPara" style="${inp}"><option value="">Todos os clientes com link (${comPortal.length})</option>${comPortal.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join('')}</select>
        ${rot('Título e texto')}
        <div style="display:grid;gap:8px"><input id="fTit" placeholder="Ex.: FC agora é representante direta da Engefitas" style="${inp}"><textarea id="fTxt" rows="3" placeholder="Texto curto (opcional)" style="${inp};resize:vertical"></textarea><input id="fLink" placeholder="Link do botão Saiba mais (opcional) — https://..." style="${inp}"></div>
        <div style="display:flex;gap:8px;margin-top:10px">${btn('fEnviar','📣 Enviar para a tela do cliente','','pri')}</div>
      </div>`:''}
      ${S.anuncios.length?`<div style="padding:4px 14px 10px">${rot('Últimos enviados')}${lista}</div>`:''}
    </div>`;
  }
  document.addEventListener('change',ev=>{
    if(ev.target.id!=='fImg')return;const f=ev.target.files&&ev.target.files[0];if(!f)return;
    if(f.size>1.5*1024*1024){toast('Imagem acima de 1,5 MB. Use uma menor.',true);ev.target.value='';return;}
    const r=new FileReader();r.onload=()=>{F.img=String(r.result);F.arte=null;render();};r.readAsDataURL(f);
  });
  async function publicar(id){const {error}=await sb.rpc('impl_portal_publicar',{p_cliente:id});if(error)throw error;}

  document.addEventListener('click',async ev=>{
    const el=ev.target.closest('#acompBody [data-ac]');if(!el)return;
    const a=el.dataset.ac,id=el.dataset.id;
    try{
      if(a==='fAbrir'){F.aberto=!F.aberto;render();return;}
      if(a==='fArte'){F.arte=F.arte===el.dataset.id?null:el.dataset.id;F.img=null;render();return;}
      if(a==='fSemImg'){F.arte=null;F.img=null;render();return;}
      if(a==='fEnviar'){
        const tit=$('fTit').value.trim(),txt=$('fTxt').value.trim(),lk=$('fLink').value.trim(),para=$('fPara').value||null;
        const img=F.img||((S.artes||[]).find(x=>x.id===F.arte)||{}).img||null;
        if(!tit&&!img){toast('Escolha uma arte ou escreva um título',true);return;}
        if(lk&&!/^https?:\/\//i.test(lk)){toast('O link precisa começar com https://',true);return;}
        el.disabled=true;const {error}=await sb.from('impl_portal_anuncios').insert({cliente_id:para,titulo:tit||null,texto:txt||null,link:lk||null,imagem:img});if(error)throw error;
        F.arte=null;F.img=null;toast('Enviado! Abre na tela do cliente em até 1 minuto (ou quando ele abrir o link).');return carregar();}
      if(a==='fDesativar'){const {error}=await sb.from('impl_portal_anuncios').update({ativo:false}).eq('id',el.dataset.aid);if(error)throw error;toast('Tirado do ar');return carregar();}
      if(a==='abrir'){S.aberto=S.aberto===id?null:id;S.pend=null;render();return;}
      if(a==='copiar'){await navigator.clipboard.writeText(el.dataset.url).then(()=>toast('Link copiado'),()=>toast('Selecione o link e copie',true));return;}
      if(a==='ativar'){el.disabled=true;const {error}=await sb.from('impl_portal').insert({cliente_id:id});if(error)throw error;await publicar(id);toast('Acompanhamento ativado e primeira foto publicada');S.aberto=id;return carregar();}
      if(a==='modo'){const {error}=await sb.from('impl_portal').update({modo:el.dataset.v}).eq('cliente_id',id);if(error)throw error;S.por[id].modo=el.dataset.v;render();toast('Salvo');return;}
      if(a==='publicar'){el.disabled=true;el.textContent='Publicando…';await publicar(id);toast('Andamento publicado');return carregar();}
      if(a==='sit'){const tipo=$('acSit-'+id).value,det=$('acDet-'+id).value.trim();
        if(tipo==='livre'&&!det){toast('Escreva o recado no campo ao lado',true);return;}
        const campos={situacao:tipo||null,situacao_detalhe:tipo?(det||null):null,situacao_em:tipo?new Date().toISOString():null};
        const {error}=await sb.from('impl_portal').update(campos).eq('cliente_id',id);if(error)throw error;
        if(el.dataset.pub){await publicar(id);toast('Situação salva e publicada');}else toast('Situação salva · entra na próxima publicação');
        return carregar();}
      if(a==='chave'){if(S.pend!=='chave|'+id){S.pend='chave|'+id;render();return;}
        const {error}=await sb.from('impl_portal').update({chave:novaChave()}).eq('cliente_id',id);if(error)throw error;S.pend=null;toast('Nova chave gerada · envie o link novo ao cliente');return carregar();}
      if(a==='ativo'){const v=el.dataset.v==='1';if(!v&&S.pend!=='ativo|'+id){S.pend='ativo|'+id;render();return;}
        const {error}=await sb.from('impl_portal').update({ativo:v}).eq('cliente_id',id);if(error)throw error;S.pend=null;toast(v?'Link reativado':'Link desativado');return carregar();}
    }catch(e){erro(e);el.disabled=false;}
  });
})();
