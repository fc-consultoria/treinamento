/* ===== Barra do usuário mais prática =====
   Ficam à vista só: nome / trocar, Monte sua Casa, Dúvidas e o botão "☰ Mais".
   Todos os outros botões (guia, material, catálogos, dicas, avisos, indique, site, Instagram, painel, sair)
   vão para o menu "Mais", com os mesmos cliques de antes. */
(function(){
  const FICA=new Set(['uname','quemTag','upainel','mcBtn','sugBtn','umMais','ctaBtn','igBtn','siteBtn']);
  const st=document.createElement('style');st.textContent=`
  #umMais{position:relative}
  #umMenu{position:absolute;right:12px;top:calc(100% + 6px);z-index:9300;background:#fff;color:#14231f;border-radius:14px;box-shadow:0 18px 44px rgba(0,0,0,.28);padding:8px;min-width:240px;display:flex;flex-direction:column;gap:2px}
  #umMenu[hidden]{display:none}
  #umMenu>a,#umMenu>button{all:unset;cursor:pointer;display:flex!important;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;font:600 15px Barlow,system-ui,sans-serif;color:#14231f!important;background:transparent!important;border:0!important}
  #umMenu>a:hover,#umMenu>button:hover,#umMenu>a:focus-visible,#umMenu>button:focus-visible{background:#eef3f2!important}
  #umMenu>[hidden]{display:none!important}
  .ubar{position:relative}
  @media(max-width:700px){#umMenu{left:8px;right:8px;min-width:0}}`;document.head.appendChild(st);
  function arruma(){const ub=document.getElementById('ubar');if(!ub)return;
    let bt=document.getElementById('umMais'),mn=document.getElementById('umMenu');
    if(!bt){bt=document.createElement('button');bt.type='button';bt.id='umMais';bt.textContent='☰ Mais';bt.setAttribute('aria-haspopup','menu');bt.setAttribute('aria-expanded','false');
      mn=document.createElement('div');mn.id='umMenu';mn.hidden=true;mn.setAttribute('role','menu');
      bt.onclick=e=>{e.stopPropagation();mn.hidden=!mn.hidden;bt.setAttribute('aria-expanded',String(!mn.hidden));};
      document.addEventListener('click',e=>{if(!mn.hidden&&!mn.contains(e.target)&&e.target!==bt){mn.hidden=true;bt.setAttribute('aria-expanded','false');}});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mn.hidden){mn.hidden=true;bt.focus();}});
      mn.addEventListener('click',e=>{if(e.target.closest('a,button'))setTimeout(()=>{mn.hidden=true;bt.setAttribute('aria-expanded','false');},0);});
      ub.appendChild(bt);ub.appendChild(mn);}
    // sair sempre por último dentro do menu
    [...ub.children].forEach(el=>{if(el===mn||el===bt)return;if(FICA.has(el.id))return;if(el.tagName==='A'||el.tagName==='BUTTON'){el.setAttribute('role','menuitem');mn.appendChild(el);}});
    const sair=[...mn.children].find(el=>/sair/i.test(el.textContent));if(sair&&mn.lastElementChild!==sair)mn.appendChild(sair);
    const mc=document.getElementById('mcBtn'),sg=document.getElementById('sugBtn');if(mc&&sg&&mc.nextElementSibling!==sg)ub.insertBefore(mc,sg);if(bt.previousElementSibling!==sg&&sg)sg.after(bt);
    bt.hidden=![...mn.children].some(el=>!el.hidden);}
  setInterval(arruma,1200);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arruma);else arruma();
})();
