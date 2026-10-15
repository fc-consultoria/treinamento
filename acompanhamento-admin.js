/* ===== Painel da Matriz · Acompanhamento online dos clientes de implantação =====
   Liga/desliga o portal de cada cliente (link com chave), escolhe a publicação (07:00 seg–sex ou manual),
   a "situação do dia" e o cronograma de etapas. O cliente vê só quantidades, códigos, situação e etapas. */
(function(){
  const URL_PORTAL='https://fc-consultoria.github.io/treinamento/acompanhamento/?k=';
  const SITS=[['','Nenhuma (não mostrar)'],['fornecedor','📦 Aguardando retorno do fornecedor'],['cliente','🤝 Aguardando retorno da equipe do cliente'],['sistema','🖥️ Aguardando o suporte do sistema'],['externo','🚗 Equipe em atendimento externo (sem alimentação hoje)'],['conferencia','🔎 Conferência dos itens alimentados'],['livre','ℹ️ Recado livre (só o texto abaixo)']];
  const MODELO=[['Acesso ao sistema e 5 linhas iniciais','fc'],['Cores e envio das planilhas de levantamento','fc'],['Acompanhamento do preenchimento com a sua equipe','fc'],['Retorno das planilhas preenchidas','cliente'],['Lançamento dos custos recebidos','fc'],['Cadastro de componentes','fc'],['Liberação das tipologias','fc'],['Simulação de orçamento','fc'],['Margem de venda','fc'],['Finalização e feedback','fc']];
  const S={cli:[],por:{},fotos:{},crono:{},aberto:null,pend:null,carregado:false,erro:''};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const quando=iso=>{if(!iso)return '';const d=new Date(iso);return d.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'}).replace('.','')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});};
  const novaChave=()=>(crypto.randomUUID?crypto.randomUUID()+crypto.randomUUID():String(Math.random())+Date.now()).replace(/[^a-f0-9]/gi,'').slice(0,32);
  function toast(t,ruim){const e=document.createElement('div');e.textContent=t;e.style.cssText=`position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:${ruim?'var(--bad)':'#1b232a'};color:#fff;padding:9px 16px;border-radius:99px;font:600 14px var(--f-body);z-index:9999`;document.body.appendChild(e);setTimeout(()=>e.remove(),2600);}
  function erro(e){console.error(e);toast('Não salvou: '+((e&&e.message)||e),true);}
  function diasUteis(inicio,n){const out=[];const d=new Date(inicio+'T12:00:00');while(out.length<n){const w=d.getDay();if(w!==0&&w!==6)out.push(d.toISOString().slice(0,10));d.setDate(d.getDate()+1);}return out;}

  async function carregar(){
    try{
      const [c,p,f,k]=await Promise.all([
        sb.from('impl_clientes').select('id,nome,status').order('nome'),
        sb.from('impl_portal').select('*'),
        sb.from('impl_portal_fotos').select('cliente_id,publicado_em,origem').order('publicado_em',{ascending:false}).limit(500),
        sb.from('impl_cronograma').select('*').order('ordem')]);
      for(const r of [c,p,f,k]) if(r.error) throw r.error;
      S.cli=c.data||[];S.por={};(p.data||[]).forEach(x=>S.por[x.cliente_id]=x);
      S.fotos={};(f.data||[]).forEach(x=>{if(!S.fotos[x.cliente_id])S.fotos[x.cliente_id]=x;});
      S.crono={};(k.data||[]).forEach(x=>(S.crono[x.cliente_id]=S.crono[x.cliente_id]||[]).push(x));
      S.erro='';S.carregado=true;
    }catch(e){console.error(e);S.erro=(e&&e.message)||String(e);S.carregado=true;}
    render();
  }
  window.acompLoad=carregar;
  window.ACOMP_INFO=()=>{const n=Object.values(S.por).filter(x=>x.ativo).length;return S.carregado?(n+' cliente'+(n===1?'':'s')+' online'):'';};

  const btn=(acao,txt,extra,estilo)=>`<button type="button" data-ac="${acao}" ${extra||''} style="font:600 13.5px var(--f-body);padding:7px 12px;border-radius:8px;cursor:pointer;border:1px solid ${estilo==='pri'?'var(--accent)':estilo==='bad'?'var(--bad)':'var(--line)'};background:${estilo==='pri'?'var(--accent)':'#fff'};color:${estilo==='pri'?'#fff':estilo==='bad'?'var(--bad)':'var(--fg)'}">${txt}</button>`;
  const rot=t=>`<div style="font:600 12px var(--f-body);text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:14px 0 6px">${t}</div>`;
  const inp='font:500 14px var(--f-body);padding:7px 9px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--fg)';

  function corpo(c){
    const p=S.por[c.id];
    if(!p) return `<p class="note" style="margin:6px 0 10px">Sem acompanhamento online. O cliente continua como hoje, recebendo o andamento só pelo WhatsApp.</p>${btn('ativar','📡 Ativar acompanhamento online','data-id="'+c.id+'"','pri')}`;
    const url=URL_PORTAL+p.chave, cr=S.crono[c.id]||[];
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
    ${rot('Cronograma de etapas')}
    ${cr.length?`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font:500 14px var(--f-body)"><thead><tr style="color:var(--muted);font-size:12px;text-align:left"><th style="padding:4px">Nº</th><th style="padding:4px">Data</th><th style="padding:4px">Etapa</th><th style="padding:4px">Responsável</th><th style="padding:4px">Feita</th><th></th></tr></thead><tbody>
      ${cr.map((e,i)=>`<tr style="border-top:1px solid var(--line)"><td style="padding:5px 4px;width:34px">${i+1}</td>
        <td style="padding:5px 4px;width:150px"><input type="date" value="${e.data||''}" data-ce="data" data-eid="${e.id}" style="${inp};width:140px"></td>
        <td style="padding:5px 4px"><input value="${esc(e.titulo)}" data-ce="titulo" data-eid="${e.id}" style="${inp};width:100%;min-width:220px"></td>
        <td style="padding:5px 4px;width:130px"><select data-ce="responsavel" data-eid="${e.id}" style="${inp}"><option value="fc" ${e.responsavel==='fc'?'selected':''}>FC</option><option value="cliente" ${e.responsavel==='cliente'?'selected':''}>Cliente</option></select></td>
        <td style="padding:5px 4px;width:50px;text-align:center"><input type="checkbox" data-ce="feita" data-eid="${e.id}" ${e.feita?'checked':''} style="width:18px;height:18px"></td>
        <td style="padding:5px 4px;width:40px">${btn('etDel','×','data-eid="'+e.id+'" title="Remover etapa"',pend('etDel'+e.id)?'bad':'')}</td></tr>`).join('')}
      </tbody></table></div>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center">${btn('etAdd','＋ Adicionar etapa','data-id="'+c.id+'"')}<span class="note">As mudanças aparecem para o cliente na próxima publicação (ou em "Publicar andamento agora").</span></div>`
      :`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><label class="note">Primeiro dia:</label><input type="date" id="acIni-${c.id}" style="${inp}">${btn('crono','Criar cronograma das 10 etapas','data-id="'+c.id+'"','pri')}</div>
       <p class="note" style="margin:6px 0 0">Uma etapa por dia útil (pula sábado e domingo), seguindo o seu modelo. Depois você ajusta datas e nomes à vontade.</p>`}
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
    B.innerHTML=`<p class="note" style="padding:10px 16px 0">Ative o acompanhamento cliente por cliente. Quem não estiver ativado continua como antes, só com o WhatsApp.</p>
    <div style="padding:6px 16px 16px">${ordem.map(c=>{const p=S.por[c.id],f=S.fotos[c.id],ab=S.aberto===c.id;
      const badge=!p?'<span style="color:var(--muted);font-size:13px">Sem portal</span>':p.ativo?'<span style="background:var(--ok-soft);color:var(--ok);font:600 12.5px var(--f-body);padding:2px 9px;border-radius:99px">● Online</span>':'<span style="background:var(--bad-soft);color:var(--bad);font:600 12.5px var(--f-body);padding:2px 9px;border-radius:99px">Desativado</span>';
      return `<div style="border:1px solid ${ab?'var(--accent)':'var(--line)'};border-radius:12px;margin-top:10px;background:#fff">
        <button type="button" data-ac="abrir" data-id="${c.id}" style="all:unset;box-sizing:border-box;width:100%;cursor:pointer;display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:12px 14px">
          <b style="font:600 16px var(--f-display)">${esc(c.nome)}</b>${badge}
          ${p&&p.situacao?'<span style="background:#fdf0d9;color:#8a5a12;font:600 12px var(--f-body);padding:2px 8px;border-radius:99px">situação informada</span>':''}
          <span style="margin-left:auto;color:var(--muted);font-size:13px">${f?'Última publicação: '+esc(quando(f.publicado_em))+(f.origem==='auto'?' (automática)':' (manual)'):(p?'Ainda sem publicação':'')}</span><span style="color:var(--muted)">${ab?'▲':'▼'}</span></button>
        ${ab?`<div style="padding:0 14px 14px;border-top:1px solid var(--line)">${corpo(c)}</div>`:''}</div>`;}).join('')}</div>`;
  }

  async function publicar(id){const {error}=await sb.rpc('impl_portal_publicar',{p_cliente:id});if(error)throw error;}

  document.addEventListener('click',async ev=>{
    const el=ev.target.closest('#acompBody [data-ac]');if(!el)return;
    const a=el.dataset.ac,id=el.dataset.id;
    try{
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
      if(a==='crono'){const ini=$('acIni-'+id).value;if(!ini){toast('Escolha o primeiro dia',true);return;}
        const datas=diasUteis(ini,MODELO.length);
        const {error}=await sb.from('impl_cronograma').insert(MODELO.map(([t,r],i)=>({cliente_id:id,ordem:i+1,titulo:t,data:datas[i],responsavel:r})));if(error)throw error;
        toast('Cronograma criado');return carregar();}
      if(a==='etAdd'){const cr=S.crono[id]||[];const ult=cr[cr.length-1];const prox=ult&&ult.data?diasUteis(new Date(new Date(ult.data+'T12:00:00').getTime()+864e5).toISOString().slice(0,10),1)[0]:null;
        const {error}=await sb.from('impl_cronograma').insert({cliente_id:id,ordem:(ult?ult.ordem:0)+1,titulo:'Nova etapa',data:prox,responsavel:'fc'});if(error)throw error;return carregar();}
      if(a==='etDel'){const k='etDel'+el.dataset.eid+'|'+S.aberto;if(S.pend!==k){S.pend=k;render();toast('Clique no × de novo para remover');return;}
        const {error}=await sb.from('impl_cronograma').delete().eq('id',el.dataset.eid);if(error)throw error;S.pend=null;return carregar();}
      if(a==='chave'){if(S.pend!=='chave|'+id){S.pend='chave|'+id;render();return;}
        const {error}=await sb.from('impl_portal').update({chave:novaChave()}).eq('cliente_id',id);if(error)throw error;S.pend=null;toast('Nova chave gerada · envie o link novo ao cliente');return carregar();}
      if(a==='ativo'){const v=el.dataset.v==='1';if(!v&&S.pend!=='ativo|'+id){S.pend='ativo|'+id;render();return;}
        const {error}=await sb.from('impl_portal').update({ativo:v}).eq('cliente_id',id);if(error)throw error;S.pend=null;toast(v?'Link reativado':'Link desativado');return carregar();}
    }catch(e){erro(e);el.disabled=false;}
  });
  document.addEventListener('change',async ev=>{
    const el=ev.target.closest('#acompBody [data-ce]');if(!el)return;
    const campo=el.dataset.ce,eid=el.dataset.eid;
    let v=campo==='feita'?el.checked:el.value;
    if(campo==='titulo'&&!String(v).trim()){toast('A etapa precisa de um nome',true);return carregar();}
    const upd={[campo]:campo==='data'?(v||null):v};if(campo==='feita')upd.feita_em=v?new Date().toISOString():null;
    const {error}=await sb.from('impl_cronograma').update(upd).eq('id',eid);
    if(error)return erro(error);
    Object.values(S.crono).forEach(l=>l.forEach(e=>{if(String(e.id)===String(eid))Object.assign(e,upd);}));
    toast('Salvo');
  });
})();
