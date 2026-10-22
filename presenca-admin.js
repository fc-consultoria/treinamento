/* ===== Painel da Matriz · Ao vivo: Equipe FC e links de acompanhamento =====
   Equipe: os painéis chamam fc_presenca_ping a cada 45 s (tabela fc_presenca).
   Clientes: a página do link de acompanhamento chama impl_portal_presenca (tabela impl_portal_presenca).
   Online = sinal nos últimos 2 minutos. A Matriz escolhe quem da equipe aparece online (impl_acesso.aparecer_online). */
(function(){
  const ON_MS=120000, APPS={implantacao:'Painel de Implantação',matriz:'Painel da Matriz'};
  const S={eq:[],acessos:[],cli:{},port:[],ok:false,semTabela:false,t:0};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const hm=t=>new Date(t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const ehHoje=t=>new Date(t).toDateString()===new Date().toDateString();
  const quando=t=>ehHoje(t)?'hoje às '+hm(t):new Date(t).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' às '+hm(t);
  const on=r=>Date.now()-Date.parse(r.visto_em)<ON_MS;

  function caixa(){
    return document.getElementById('lvEqSlot');
  }
  async function carregar(){
    try{
      const {data:{session}}=await sb.auth.getSession();if(!session)return;
      const desde=new Date();desde.setHours(0,0,0,0);
      const [eq,ac,pp,cl]=await Promise.all([
        sb.from('fc_presenca').select('*').order('visto_em',{ascending:false}),
        sb.from('impl_acesso').select('email,nome,admin,aparecer_online').order('nome'),
        sb.from('impl_portal_presenca').select('*').gte('visto_em',desde.toISOString()).order('visto_em',{ascending:false}),
        sb.from('impl_clientes').select('id,nome')]);
      S.semTabela=!!(eq.error&&/fc_presenca|does not exist|schema cache/i.test(eq.error.message||''));
      S.eq=eq.error?[]:(eq.data||[]);S.acessos=ac.error?[]:(ac.data||[]);S.port=pp.error?[]:(pp.data||[]);
      S.cli={};(cl.data||[]).forEach(c=>S.cli[c.id]=c.nome);S.ok=true;S.t=Date.now();
    }catch(e){console.warn('presenca',e);}
    desenhar();
  }
  function desenhar(){
    const el=caixa();if(!el||!S.ok)return;
    // Equipe: uma linha por pessoa cadastrada no acesso, com o último sinal de qualquer painel
    const pessoas=S.acessos.map(a=>{const sinais=S.eq.filter(r=>r.email===a.email.toLowerCase());const ult=sinais[0];return {a,ult,online:ult&&on(ult)&&a.aparecer_online!==false};})
      .sort((x,y)=>(y.online-x.online)||((y.ult?Date.parse(y.ult.visto_em):0)-(x.ult?Date.parse(x.ult.visto_em):0)));
    const linhaEq=({a,ult,online})=>`<div class="lvr"><span class="lvd${online?' on':''}"></span>
      <div class="nm"><b>${esc(a.nome||a.email)}${a.admin?' <span class="lvt">Matriz</span>':''}</b>
      <span>${a.aparecer_online===false?'oculto: não aparece online':online?'🟢 '+esc(APPS[ult.app]||ult.app)+(ult.onde?' · '+esc(ult.onde):'')+' · desde '+hm(ult.entrou_em):ult?'visto por último '+quando(ult.visto_em)+' · '+esc(APPS[ult.app]||ult.app):'sem registro ainda'}</span></div>
      <label style="font-size:12.5px;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap" title="Desmarcando, esta pessoa deixa de aparecer como online"><input type="checkbox" data-eqon="${esc(a.email)}" ${a.aparecer_online!==false?'checked':''}> aparecer online</label></div>`;
    // Clientes nos links de acompanhamento (hoje)
    const cliOn=S.port.filter(on),cliHoje=S.port.filter(r=>!on(r));
    const linhaCli=(r,o)=>`<div class="lvr"><span class="lvd${o?' on':''}"></span><div class="nm"><b>${esc(r.nome||'Sem nome')} <span style="font-weight:500;color:var(--muted)">· ${esc(S.cli[r.cliente_id]||'Cliente')}</span><span class="lvt ct">link</span></b>
      <span>${o?'🟢 com o link aberto · desde '+hm(r.entrou_em):'saiu às '+hm(r.visto_em)}</span></div></div>`;
    el.innerHTML=`<h3 class="dvt" style="margin:4px 0 8px">🛠 Equipe FC <span class="note" style="text-transform:none;letter-spacing:0;font-weight:500">· nos painéis agora</span></h3>
        ${S.semTabela?'<p class="note" style="color:var(--bad)">Falta rodar o arquivo presenca_equipe.sql no Supabase.</p>':pessoas.length?pessoas.map(linhaEq).join(''):'<p class="note">Nenhum login de equipe cadastrado.</p>'}`;
    el.querySelectorAll('[data-eqon]').forEach(ch=>ch.onchange=async()=>{
      const email=ch.dataset.eqon,v=ch.checked;ch.disabled=true;
      const {data,error}=await sb.from('impl_acesso').update({aparecer_online:v}).eq('email',email).select('email');
      ch.disabled=false;
      if(error||!data||!data.length){ch.checked=!v;alert('Não salvou'+(error?': '+error.message:' (só o login da Matriz pode mudar isso).'));return;}
      const a=S.acessos.find(x=>x.email===email);if(a)a.aparecer_online=v;desenhar();
    });
  }
  // O próprio Painel da Matriz também avisa que está aberto
  const ping=()=>{if(document.hidden)return;const aba=(document.querySelector('#ptabs .on, #ptabs [aria-selected=true]')||{}).textContent||'';sb.rpc('fc_presenca_ping',{p_app:'matriz',p_nome:null,p_onde:aba.trim().slice(0,60)||null}).then(()=>{},()=>{});};
  setInterval(ping,45000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)ping();});
  window.presencaLoad=carregar;
  setInterval(()=>{if(!document.hidden)carregar();},30000);
  const t=setInterval(async()=>{try{const {data:{session}}=await sb.auth.getSession();if(session){clearInterval(t);ping();carregar();}}catch(_){}} ,1500);
  document.addEventListener('click',e=>{if(e.target&&e.target.id==='lvRe')setTimeout(carregar,300);});
})();
