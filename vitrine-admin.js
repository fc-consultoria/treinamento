/* ===== Painel da Matriz · Marketing · Vitrine de folders no site =====
   Escolhe os folders das representadas que giram no canto do site da FC, o tempo de troca e publica.
   O site lê o último registro "site_vitrine". Clique no folder abre "Pedir orçamento". */
(function(){
  const SITE='https://fc-consultoria.github.io/';
  const V={cat:null,cfg:null,sel:null,t:{},seg:6,on:false,mist:true,carregado:false,marca:'',aberto:false};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function aviso(t,ruim){const e=document.createElement('div');e.textContent=t;e.style.cssText=`position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:${ruim?'#b42318':'#1b232a'};color:#fff;padding:9px 16px;border-radius:99px;font:600 14px var(--f-body);z-index:9999`;document.body.appendChild(e);setTimeout(()=>e.remove(),3200);}
  async function carregar(){
    try{const [c,r]=await Promise.all([fetch(SITE+'vitrine.json',{cache:'no-cache'}).then(x=>x.json()),sb.from('trein_eventos').select('detalhe,criado_em').eq('tipo','site_vitrine').order('criado_em',{ascending:false}).limit(1)]);
      V.cat=c.itens||[];V.cfg=(r.data&&r.data[0])?Object.assign({em:r.data[0].criado_em},r.data[0].detalhe):null;
      const g=V.cfg||{};V.on=!!g.on;V.seg=+g.seg||6;V.mist=g.mist!==false;V.t=Object.assign({},g.t||{});V.sel=new Set(Array.isArray(g.ids)&&g.ids.length?g.ids:V.cat.map(x=>x.id));V.cat.filter(x=>x.acao&&!(g.off||[]).includes(x.id)).forEach(x=>V.sel.add(x.id));
    }catch(e){console.error('vitrine',e);V.cat=V.cat||[];V.sel=V.sel||new Set();}
    V.carregado=true;desenhar();}
  const bt=(ac,t,pri,extra)=>`<button type="button" data-vt="${ac}" ${extra||''} style="font:600 13.5px var(--f-body);padding:8px 13px;border-radius:8px;cursor:pointer;border:1px solid ${pri==='bad'?'#b42318':pri?'#15803d':'var(--line)'};background:${pri&&pri!=='bad'?'#16a34a':'#fff'};color:${pri==='bad'?'#b42318':pri?'#fff':'var(--fg)'}">${t}</button>`;
  function desenhar(){const B=$('vtBox');if(!B)return;
    if(!V.carregado){B.innerHTML='<p class="note">Carregando a vitrine…</p>';return;}
    const no=V.cfg&&V.cfg.on,n=V.sel.size,marcas=[...new Set(V.cat.map(x=>x.marca))];
    const lista=V.cat.filter(x=>!V.marca||x.marca===V.marca);
    let h=`<div style="border:1px solid ${no?'#86efac':'var(--line)'};background:${no?'linear-gradient(90deg,#ecfdf3,#fff)':'#fff'};border-radius:14px;padding:12px 14px;margin:0 0 14px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:22px">📣</span><div style="flex:1;min-width:220px"><b style="font:700 15.5px var(--f-display)">Vitrine de folders no site</b>
      <div class="note">Os folders das representadas giram no canto esquerdo do site da FC. Clicou, abre o folder com <b>Pedir orçamento</b>.</div></div>
      <span class="note" style="font-weight:700;color:${no?'#15803d':'var(--muted)'}">${no?`🟢 No ar · ${(V.cfg.ids||[]).length||V.cat.length} folders · troca a cada ${V.cfg.seg||6} s`:'Fora do ar'}</span>
      ${bt('abrir',V.aberto?'Fechar':(no?'✏️ Ajustar':'＋ Montar a vitrine'),!V.aberto&&!no)}</div>`;
    if(V.aberto){
      h+=`<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin:12px 0 8px">
        <label style="display:flex;gap:6px;align-items:center;font-weight:600">⏱ Trocar a cada <select id="vtSeg" style="font:600 14px var(--f-body);padding:6px 8px;border-radius:8px;border:1px solid var(--line)">${[4,5,6,8,10].map(s=>`<option value="${s}" ${V.seg===s?'selected':''}>${s} segundos${s===6?' (sugerido)':''}</option>`).join('')}</select></label>
        <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="vtMist" ${V.mist?'checked':''}> Ordem aleatória para cada visitante</label>
        <span class="note">Dica: 6 s dá tempo de ler o nome do produto sem cansar. Com o mouse em cima, a vitrine para.</span></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${['',...marcas].map(m=>`<button type="button" data-vt="marca" data-m="${esc(m)}" style="font:600 12.5px var(--f-body);padding:5px 11px;border-radius:99px;cursor:pointer;border:1px solid ${V.marca===m?'#1f5f8b':'var(--line)'};background:${V.marca===m?'#1f5f8b':'#fff'};color:${V.marca===m?'#fff':'var(--fg)'}">${m?esc(m)+' · '+V.cat.filter(x=>x.marca===m&&V.sel.has(x.id)).length+'/'+V.cat.filter(x=>x.marca===m).length:'Todas · '+n+'/'+V.cat.length}</button>`).join('')}
          ${bt('todos','✓ Marcar '+(V.marca?'desta marca':'todos'))}${bt('nenhum','Desmarcar '+(V.marca?'desta marca':'todos'))}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:10px;max-height:520px;overflow:auto;padding:2px">
        ${lista.map(x=>{const on=V.sel.has(x.id);return `<div style="border:2px solid ${on?'#16a34a':'var(--line)'};border-radius:12px;overflow:hidden;background:#fff;opacity:${on?1:.55}">
          <button type="button" data-vt="tg" data-id="${esc(x.id)}" title="${on?'Tirar da vitrine':'Colocar na vitrine'}" style="all:unset;cursor:pointer;display:block;position:relative;width:100%;aspect-ratio:600/849;background:#eef2f4"><img loading="lazy" src="${esc(SITE+x.img)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><span style="position:absolute;top:6px;left:6px;background:${on?'#16a34a':'rgba(0,0,0,.55)'};color:#fff;border-radius:99px;padding:2px 8px;font:700 11.5px var(--f-body)">${on?'✓ na vitrine':'fora'}</span></button>
          <div style="padding:6px 7px"><input data-vtt="${esc(x.id)}" value="${esc(V.t[x.id]||x.t)}" title="Nome que aparece no site" style="width:100%;box-sizing:border-box;font:600 12.5px var(--f-body);border:1px solid var(--line);border-radius:6px;padding:4px 6px"><div class="note" style="font-size:11px;margin-top:2px">${esc(x.marca)}</div></div></div>`}).join('')}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin-top:12px">${no?bt('tirar','Tirar do ar','bad'):''}<a href="${SITE}" target="_blank" rel="noopener" style="font:600 13.5px var(--f-body);padding:8px 13px;border-radius:8px;border:1px solid var(--line);color:var(--fg);text-decoration:none">↗ Abrir o site</a>${bt('publicar','🚀 Publicar no site ('+n+' folders)',true)}</div>`;}
    h+='</div>';B.innerHTML=h;
    B.querySelectorAll('[data-vtt]').forEach(i=>i.addEventListener('input',()=>{const x=V.cat.find(c=>c.id===i.dataset.vtt);const v=i.value.trim();if(!v||v===x.t)delete V.t[x.id];else V.t[x.id]=v;}));
    const s=$('vtSeg');if(s)s.onchange=()=>{V.seg=+s.value;};const m=$('vtMist');if(m)m.onchange=()=>{V.mist=m.checked;};}
  document.addEventListener('click',async ev=>{const el=ev.target.closest('#vtBox [data-vt]');if(!el)return;const a=el.dataset.vt;
    if(a==='abrir'){V.aberto=!V.aberto;desenhar();return;}
    if(a==='marca'){V.marca=el.dataset.m;desenhar();return;}
    if(a==='tg'){const id=el.dataset.id;V.sel.has(id)?V.sel.delete(id):V.sel.add(id);desenhar();return;}
    if(a==='todos'||a==='nenhum'){V.cat.filter(x=>!V.marca||x.marca===V.marca).forEach(x=>a==='todos'?V.sel.add(x.id):V.sel.delete(x.id));desenhar();return;}
    if(a==='publicar'){if(!V.sel.size){aviso('Marque pelo menos um folder',true);return;}
      const ids=V.cat.map(x=>x.id).filter(id=>V.sel.has(id));el.disabled=true;
      const off=V.cat.filter(x=>x.acao&&!V.sel.has(x.id)).map(x=>x.id);const r=await ins('site_vitrine',{on:true,seg:V.seg,mist:V.mist,ids,t:V.t,off});el.disabled=false;if(r&&r.error)return;
      V.aberto=false;aviso('🚀 Vitrine no ar com '+ids.length+' folders. Abra o site para ver.');return carregar();}
    if(a==='tirar'){if(!confirm('Tirar a vitrine de folders do site?'))return;const r=await ins('site_vitrine',{on:false,seg:V.seg,mist:V.mist,ids:[...V.sel],t:V.t});if(r&&r.error)return;aviso('Vitrine tirada do ar');return carregar();}
  });
  const tab=document.querySelector('#ptabs [data-tab=mkt]');if(tab)tab.addEventListener('click',()=>{if(!V.carregado)carregar();});
  setTimeout(()=>{if(!V.carregado)carregar();},3800);
})();
