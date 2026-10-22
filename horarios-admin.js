/* ===== Painel da Matriz · Ao vivo: 📊 Horários mais acessados =====
   Entradas em todos os links da FC (Mostruário, links de teste, link da consultoria e acompanhamento),
   agrupadas por hora do dia no horário de Sinop/MT. Dados: RPC fc_horarios(p_dias). Acessos da Matriz não contam. */
(function(){
  if(typeof sb==='undefined')return;
  const $=id=>document.getElementById(id);
  const SER=[['mostr','Mostruário','#1f6f9a'],['teste','Links de teste','#e8912d'],['cons','Link da consultoria','#6d4bd8'],['acomp','Acompanhamento','#1f8a4c'],['fc','Acessos da FC (testes)','#9aa5ad']];
  const DIA=['','seg','ter','qua','qui','sex','sáb','dom'];
  const S={dias:30,d:null,erro:'',t:0,carregando:false,off:{fc:true}};
  try{S.dias=+localStorage.getItem('fc_hr_dias')||30;}catch(_){}

  function pinta(){const el=$('lvHr');if(!el)return;
    if(S.erro){el.innerHTML=`<p class="note" style="color:var(--bad)">Não carregou o gráfico: ${S.erro}</p>`;return;}
    if(!S.d){el.innerHTML='<p class="note">Carregando…</p>';return;}
    const H=S.d.horas||[],vis=SER.filter(x=>!S.off[x[0]]);
    const tot=h=>vis.reduce((a,x)=>a+(+h[x[0]]||0),0),mx=Math.max(1,...H.map(tot)),soma=H.reduce((a,h)=>a+tot(h),0);
    const top=H.map(h=>({h:h.h,n:tot(h)})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,3);
    const faixa=(a,b)=>H.filter(h=>h.h>=a&&h.h<b).reduce((s,h)=>s+tot(h),0),pc=n=>soma?Math.round(n/soma*100):0;
    const F=[['🌅 Manhã','06–12h',faixa(6,12)],['☀️ Tarde','12–18h',faixa(12,18)],['🌙 Noite','18–24h',faixa(18,24)],['🌃 Madrugada','00–06h',faixa(0,6)]];
    const W=(S.d.semana||[]).map(x=>({d:x.d,n:(+x.n||0)+(S.off.fc?0:(+x.fc||0))})),mw=Math.max(1,...W.map(x=>x.n));
    const bars=H.map(h=>{const t=tot(h),alto=top.length&&t===top[0].n&&t>0;
      return `<div class="hrc" title="${String(h.h).padStart(2,'0')}h · ${t} entrada${t===1?'':'s'}${vis.map(x=>(+h[x[0]]?'\n'+x[1]+': '+h[x[0]]:'')).join('')}">
        <span class="hrn">${t||''}</span><div class="hrb" style="height:${Math.round(t/mx*100)}%">${vis.map(x=>+h[x[0]]?`<i style="background:${x[2]};flex:${h[x[0]]}"></i>`:'').join('')}</div>
        <span class="hrl${alto?' on':''}">${h.h%3===0?String(h.h).padStart(2,'0'):''}</span></div>`;}).join('');
    el.innerHTML=`<div class="hrbar"><div class="seg">${[7,30,90].map(d=>`<button type="button" data-hrd="${d}" class="${S.dias===d?'on':''}">${d} dias</button>`).join('')}</div>
        <div class="hrlg">${SER.map(x=>`<label><input type="checkbox" data-hrs="${x[0]}" ${S.off[x[0]]?'':'checked'}><i style="background:${x[2]}"></i>${x[1]}</label>`).join('')}</div></div>
      <div class="hrk"><div><b>${soma}</b><span>entradas em ${S.dias} dias</span></div><div><b>${(soma/S.dias).toFixed(1).replace('.',',')}</b><span>por dia, em média</span></div>
        <div><b>${top.length?top.map(x=>String(x.h).padStart(2,'0')+'h').join(' · '):'—'}</b><span>horários de pico</span></div><div style="background:#eef0f2"><b style="color:#5b6870">${+S.d.fc||0}</b><span>acessos da FC ${S.off.fc?'(fora da conta)':'(somados)'}</span></div></div>
      ${soma?`<div class="hrg" role="img" aria-label="Entradas por hora do dia">${bars}</div>
      <div class="hrf">${F.map(f=>`<div><span>${f[0]} <small>${f[1]}</small></span><div class="hrfb"><i style="width:${pc(f[2])}%"></i></div><b>${pc(f[2])}%</b></div>`).join('')}</div>
      <div class="hrw">${W.map(x=>`<div title="${x.n} entradas"><div class="hrwb"><i style="height:${Math.round(x.n/mw*100)}%"></i></div><span>${DIA[x.d]}</span></div>`).join('')}<p class="note" style="margin:0;align-self:center">Por dia da semana (todos os links)</p></div>`
      :'<p class="note">Nenhuma entrada neste período.</p>'}
      <p class="note" style="margin:8px 0 0">Conta cada entrada (login ou abertura do link) dos clientes. Os acessos da FC (Matriz, login fcconsultoria e links de teste internos) ficam separados: marque “Acessos da FC” para somar.</p>`;
    el.querySelectorAll('[data-hrd]').forEach(b=>b.onclick=()=>{S.dias=+b.dataset.hrd;try{localStorage.setItem('fc_hr_dias',S.dias)}catch(_){}carregar(true);});
    el.querySelectorAll('[data-hrs]').forEach(c=>c.onchange=()=>{S.off[c.dataset.hrs]=!c.checked;pinta();});}

  async function carregar(forca){if(S.carregando||!$('lvHr'))return;if(!forca&&S.d&&Date.now()-S.t<300000)return;S.carregando=true;
    try{const r=await sb.rpc('fc_horarios',{p_dias:S.dias});if(r.error)throw r.error;S.d=r.data;S.erro='';S.t=Date.now();}catch(e){S.erro=e.message||String(e);}
    S.carregando=false;pinta();}

  const css=document.createElement('style');css.textContent=`.hrbar{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
.hrbar .seg{display:flex;gap:4px}.hrbar .seg button{font:600 12.5px system-ui;padding:5px 11px;border-radius:99px;border:1px solid #c9d6dd;background:#fff;cursor:pointer}.hrbar .seg button.on{background:#1f5f8b;color:#fff;border-color:#1f5f8b}
.hrlg{display:flex;gap:12px;flex-wrap:wrap;font-size:12.5px}.hrlg label{display:flex;align-items:center;gap:5px;cursor:pointer}.hrlg i{width:10px;height:10px;border-radius:3px;display:inline-block}
.hrk{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}.hrk>div{background:#f2f6f8;border-radius:10px;padding:8px 14px;display:flex;flex-direction:column}.hrk b{font:700 20px var(--f-display,system-ui)}.hrk span{font-size:12px;color:var(--muted)}
.hrg{display:grid;grid-template-columns:repeat(24,1fr);gap:3px;height:190px;align-items:end;padding:4px 0;border-bottom:1px solid var(--line)}
.hrc{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;min-width:0}.hrn{font:600 10.5px system-ui;color:var(--muted);min-height:14px}
.hrb{width:100%;max-width:26px;display:flex;flex-direction:column-reverse;border-radius:4px 4px 0 0;overflow:hidden;min-height:0}.hrb i{display:block;min-height:2px}
.hrl{font:600 11px system-ui;color:var(--muted);height:14px;margin-top:3px}.hrl.on{color:#c47d12}
.hrf{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:6px 18px;margin-top:12px}.hrf>div{display:grid;grid-template-columns:120px 1fr 40px;gap:8px;align-items:center;font-size:13px}.hrf small{color:var(--muted)}
.hrfb{height:8px;background:#e7edf0;border-radius:4px;overflow:hidden}.hrfb i{display:block;height:100%;background:#1f5f8b}.hrf b{text-align:right}
.hrw{display:flex;gap:8px;align-items:flex-end;margin-top:14px;flex-wrap:wrap}.hrw>div{display:flex;flex-direction:column;align-items:center;gap:3px}.hrwb{width:22px;height:50px;background:#e7edf0;border-radius:4px;display:flex;align-items:flex-end;overflow:hidden}.hrwb i{display:block;width:100%;background:#6d4bd8}.hrw span{font-size:11.5px;color:var(--muted)}`;
  document.head.appendChild(css);
  setInterval(()=>{const el=$('lvHr');if(el&&el.offsetParent!==null&&!document.hidden)carregar();},3000);
  document.addEventListener('click',e=>{if(e.target&&e.target.id==='lvRe')carregar(true);});
})();
