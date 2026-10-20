/* ===== 🎧 Som para estudar · Esquadrias 3D · Passo a passo =====
   Sons de foco gerados no próprio navegador (sem anúncio, sem internet extra) e playlists escolhidas pela FC
   (Spotify, YouTube ou Deezer), tocando dentro do link do treinamento. As playlists ficam em musica.json. */
(function(){
  const BASE=(document.currentScript&&document.currentScript.src)?new URL('.',document.currentScript.src).href:'';
  const $=s=>document.querySelector(s);
  const ler=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(_){return d;}};
  const grava=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(_){}};
  const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const css=`
  .fcm-btn{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:9990;height:46px;border-radius:23px;padding:0 16px 0 12px;display:flex;align-items:center;gap:8px;border:0;cursor:pointer;background:#13232e;color:#fff;font:700 14px system-ui;box-shadow:0 8px 22px rgba(0,0,0,.25)}
  .fcm-btn .eq{display:inline-flex;gap:2px;align-items:flex-end;height:16px}.fcm-btn .eq i{width:3px;background:#f2a51e;border-radius:2px;height:5px}
  .fcm-btn.on .eq i{animation:fcmEq .9s ease-in-out infinite}.fcm-btn.on .eq i:nth-child(2){animation-delay:.2s}.fcm-btn.on .eq i:nth-child(3){animation-delay:.4s}
  @keyframes fcmEq{0%,100%{height:4px}50%{height:16px}}
  @media(prefers-reduced-motion:reduce){.fcm-btn.on .eq i{animation:none;height:12px}}
  .fcm-box{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:calc(70px + env(safe-area-inset-bottom,0px));z-index:9991;width:min(360px,calc(100vw - 28px));max-height:min(72vh,620px);overflow:auto;background:#fff;color:#13232e;border-radius:18px;box-shadow:0 20px 50px rgba(0,0,0,.3);padding:14px;font:400 14px/1.4 system-ui;display:flex;flex-direction:column;gap:12px}
  .fcm-box[hidden]{display:none}
  .fcm-box h3{margin:0;font:800 18px system-ui}.fcm-box h4{margin:0 0 6px;font:700 11.5px ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#5a6b75}
  .fcm-sons{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  .fcm-sons button{border:1px solid #d8e2e6;background:#f6f9fa;border-radius:12px;padding:9px 10px;text-align:left;cursor:pointer;font:600 13.5px system-ui;color:#13232e}
  .fcm-sons button small{display:block;font-weight:400;color:#5a6b75;font-size:12px}
  .fcm-sons button.on{background:#0f6b70;border-color:#0f6b70;color:#fff}.fcm-sons button.on small{color:#d6f0ef}
  .fcm-vol{display:flex;align-items:center;gap:8px}.fcm-vol input{flex:1}
  .fcm-pl{display:flex;flex-direction:column;gap:6px}
  .fcm-pl .it{display:flex;gap:6px;align-items:center}.fcm-pl .it button.p{flex:1;text-align:left;border:1px solid #d8e2e6;background:#fff;border-radius:10px;padding:8px 10px;cursor:pointer;font:600 13.5px system-ui;color:#13232e}
  .fcm-pl .it button.p.on{border-color:#f2a51e;background:#fff3dc}.fcm-pl .it button.x{border:0;background:none;cursor:pointer;color:#b42318;font-size:16px}
  .fcm-emb iframe{width:100%;border:0;border-radius:12px;display:block}
  .fcm-add{display:flex;gap:6px}.fcm-add input{flex:1;min-width:0;padding:8px 10px;border:1px solid #d8e2e6;border-radius:10px;font:inherit}.fcm-add button{border:0;background:#0f6b70;color:#fff;border-radius:10px;padding:8px 12px;font:700 13px system-ui;cursor:pointer}
  .fcm-nt{font-size:12px;color:#5a6b75;margin:0}
  .fcm-x{position:absolute;right:12px;top:10px;border:0;background:none;font-size:20px;cursor:pointer;color:#5a6b75}
  .fcm-box button:focus-visible,.fcm-btn:focus-visible{outline:3px solid #f2a51e;outline-offset:2px}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  /* ---------- sons de foco gerados no navegador ---------- */
  let AC=null,MS=null,atual=null,nodes=[],timers=[];
  const SONS={
    chuva:{n:'Chuva leve',d:'chuva no telhado'},
    marrom:{n:'Ruído suave',d:'ruído marrom, abafa a conversa'},
    lofi:{n:'Lo-fi FC',d:'acordes calmos com batida leve'},
    obra:{n:'Café da obra',d:'ambiente calmo de fundo'}
  };
  function ctx(){if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();MS=AC.createGain();MS.gain.value=ler('fcm_vol',.5);MS.connect(AC.destination);}if(AC.state==='suspended')AC.resume();return AC;}
  function ruido(tipo){const a=ctx(),n=a.sampleRate*4,b=a.createBuffer(2,n,a.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);let l=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;if(tipo==='marrom'){l=(l+.02*w)/1.02;d[i]=l*3.2;}else d[i]=w;}}const s=a.createBufferSource();s.buffer=b;s.loop=true;return s;}
  function parar(){timers.forEach(t=>clearInterval(t));timers=[];nodes.forEach(n=>{try{n.stop&&n.stop();}catch(_){}try{n.disconnect();}catch(_){}});nodes=[];atual=null;}
  function tocar(k){parar();const a=ctx();atual=k;const out=a.createGain();out.gain.value=0;out.connect(MS);out.gain.linearRampToValueAtTime(1,a.currentTime+1.5);nodes.push(out);
    if(k==='marrom'){const s=ruido('marrom');const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=700;s.connect(f).connect(out);s.start();nodes.push(s,f);}
    if(k==='chuva'||k==='obra'){const s=ruido('branco');const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=k==='chuva'?2400:900;f.Q.value=.6;const g=a.createGain();g.gain.value=k==='chuva'?.35:.12;s.connect(f).connect(g).connect(out);s.start();nodes.push(s,f,g);
      const s2=ruido('marrom'),f2=a.createBiquadFilter();f2.type='lowpass';f2.frequency.value=380;const g2=a.createGain();g2.gain.value=k==='chuva'?.5:.7;s2.connect(f2).connect(g2).connect(out);s2.start();nodes.push(s2,f2,g2);
      if(k==='chuva')timers.push(setInterval(()=>{if(Math.random()<.6){const o=a.createOscillator(),gg=a.createGain();o.frequency.value=1800+Math.random()*2400;gg.gain.setValueAtTime(.04,a.currentTime);gg.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.05);o.connect(gg).connect(out);o.start();o.stop(a.currentTime+.06);}},90));
      if(k==='obra')lofi(out,.45);}
    if(k==='lofi')lofi(out,1);}
  function lofi(out,vol){const a=ctx();const ac=[[57,60,64,67],[53,57,60,64],[55,59,62,65],[52,55,59,62]];let i=0;const hz=m=>440*Math.pow(2,(m-69)/12);
    const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1500;const g=a.createGain();g.gain.value=.16*vol;lp.connect(g).connect(out);nodes.push(lp,g);
    const crk=ruido('branco'),cf=a.createBiquadFilter();cf.type='highpass';cf.frequency.value=3000;const cg=a.createGain();cg.gain.value=.012*vol;crk.connect(cf).connect(cg).connect(out);crk.start();nodes.push(crk,cf,cg);
    const acorde=()=>{const t=a.currentTime;ac[i%4].forEach((m,j)=>{const o=a.createOscillator(),e=a.createGain();o.type=j===0?'sine':'triangle';o.frequency.value=hz(m-(j===0?12:0));o.detune.value=(Math.random()-.5)*8;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.25,t+.4);e.gain.linearRampToValueAtTime(.18,t+2.5);e.gain.linearRampToValueAtTime(0,t+3.9);o.connect(e).connect(lp);o.start(t);o.stop(t+4);});i++;};
    const bat=()=>{const t=a.currentTime;[0,1,2,3].forEach(q=>{const tt=t+q*1;const o=a.createOscillator(),e=a.createGain();o.frequency.setValueAtTime(q%2?180:90,tt);o.frequency.exponentialRampToValueAtTime(40,tt+.12);e.gain.setValueAtTime(q%2?.05:.12*vol,tt);e.gain.exponentialRampToValueAtTime(.0001,tt+.18);o.connect(e).connect(out);o.start(tt);o.stop(tt+.2);});};
    acorde();bat();timers.push(setInterval(()=>{acorde();bat();},4000));}

  /* ---------- playlists (Spotify, YouTube, Deezer) ---------- */
  function embed(u){u=String(u||'').trim();let m;
    if((m=u.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|show|artist)\/([A-Za-z0-9]+)/)))return {src:`https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`,h:352,f:'Spotify'};
    if((m=u.match(/[?&]list=([A-Za-z0-9_-]+)/)))return {src:`https://www.youtube-nocookie.com/embed/videoseries?list=${m[1]}`,h:203,f:'YouTube'};
    if((m=u.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/)))return {src:`https://www.youtube-nocookie.com/embed/${m[1]}`,h:203,f:'YouTube'};
    if((m=u.match(/deezer\.com\/(?:[a-z]{2}\/)?(playlist|album)\/(\d+)/)))return {src:`https://widget.deezer.com/widget/auto/${m[1]}/${m[2]}`,h:300,f:'Deezer'};
    return null;}
  let PLS=[],tocando=null,MODO='estudo';
  const ALUNO=()=>/[?&]sala=/.test(location.search);
  function minhas(){return ler('fcm_pl',[]);}
  async function carregar(){if(window.FCM_SO_SONS){PLS=[];return;}try{const r=await fetch(BASE+'musica.json?v='+Date.now());const j=await r.json();PLS=(j.playlists||[]).filter(p=>embed(p.url));}catch(_){PLS=[];}}

  /* ---------- tela ---------- */
  const btn=document.createElement('button');btn.type='button';btn.className='fcm-btn';btn.setAttribute('aria-label','Som para estudar');btn.innerHTML='<span class="eq"><i></i><i></i><i></i></span>🎧 Música';
  const box=document.createElement('div');box.className='fcm-box';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-label','Som para estudar');
  document.body.append(btn,box);
  function lista(){const loc=ALUNO()?[]:minhas().map(p=>({...p,loc:1}));return [...PLS,...loc];}
  function desenhar(){const L=lista();
    box.innerHTML=`<button type="button" class="fcm-x" aria-label="Fechar">×</button><h3>🎧 Som para estudar</h3>
     <div><h4>Sons de foco</h4><div class="fcm-sons">${Object.entries(SONS).map(([k,s])=>`<button type="button" data-som="${k}" class="${atual===k?'on':''}">${atual===k?'⏸ ':'▶ '}${s.n}<small>${s.d}</small></button>`).join('')}</div></div>
     <div class="fcm-vol"><span>🔈</span><input type="range" min="0" max="1" step=".05" value="${ler('fcm_vol',.5)}" aria-label="Volume dos sons de foco"><span>🔊</span></div>
     ${(()=>{const it=(p,i)=>`<div class="it"><button type="button" class="p${tocando===i?' on':''}" data-pl="${i}">${tocando===i?'⏸':'▶'} ${esc(p.nome||embed(p.url).f)}<small style="display:block;font-weight:400;color:#5a6b75">${esc(embed(p.url).f)}${p.loc?' · só neste aparelho':''}</small></button>${p.loc?`<button type="button" class="x" data-del="${i-PLS.length}" aria-label="Tirar playlist">✕</button>`:''}</div>`;
       if(!L.length)return `<div><h4>Playlists da FC</h4><div class="fcm-pl">${window.FCM_SO_SONS?'<p class="fcm-nt">Nesta prévia só os sons de foco tocam. As playlists aparecem dentro do link.</p>':'<p class="fcm-nt">A FC ainda vai escolher as playlists. Enquanto isso, use os sons de foco acima.</p>'}</div></div>`;
       const grp=[['abertura','🎉 Abertura do treinamento','Para tocar enquanto o pessoal vai entrando.'],['estudo','📚 Para estudar','Sem pressa, volume baixo, só de fundo.']];const ord=MODO==='abertura'?grp:[grp[1],grp[0]];
       return `<div>${ord.map(([g,t,dd])=>{const xs=L.map((p,i)=>[p,i]).filter(([p])=>(p.g||'estudo')===g);return xs.length?`<h4>${t}</h4><p class="fcm-nt" style="margin:-4px 0 6px">${dd}</p><div class="fcm-pl" style="margin-bottom:10px">${xs.map(([p,i])=>it(p,i)).join('')}</div>`:'';}).join('')}
      <div class="fcm-emb" id="fcmEmb">${tocando!=null&&L[tocando]?(()=>{const e=embed(L[tocando].url);return `<iframe src="${esc(e.src)}" height="${e.h}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="Playlist"></iframe>`;})():''}</div></div>`;})()}
     ${ALUNO()||window.FCM_SO_SONS||!window.FCM_ADMIN?'':`<div><h4>Adicionar playlist</h4><form class="fcm-add"><input id="fcmUrl" placeholder="Cole o link do Spotify, YouTube ou Deezer" autocomplete="off" aria-label="Link da playlist"><button>＋</button></form><p class="fcm-nt" id="fcmMsg">Fica salva neste aparelho. Para aparecer para todos os alunos, mande o link para incluir na lista oficial.</p></div>`}
     <p class="fcm-nt">Dica: volume baixo, só de fundo. Os sons de foco funcionam até sem internet.</p>`;}
  box.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
    if(t.classList.contains('fcm-x')){box.hidden=true;return;}
    if(t.dataset.som){const k=t.dataset.som;if(atual===k)parar();else{tocando=null;tocar(k);}btn.classList.toggle('on',!!atual||tocando!=null);desenhar();return;}
    if(t.dataset.pl!=null){const i=+t.dataset.pl;parar();tocando=tocando===i?null:i;btn.classList.toggle('on',tocando!=null);desenhar();return;}
    if(t.dataset.del!=null){const L=minhas();L.splice(+t.dataset.del,1);grava('fcm_pl',L);tocando=null;desenhar();}});
  box.addEventListener('input',e=>{if(e.target.type==='range'){const v=+e.target.value;grava('fcm_vol',v);if(MS)MS.gain.value=v;}});
  box.addEventListener('submit',e=>{e.preventDefault();const u=$('#fcmUrl').value,em=embed(u);if(!em){$('#fcmMsg').textContent='Esse link não é de playlist do Spotify, YouTube ou Deezer. Copie o link pelo botão Compartilhar da playlist.';return;}
    const L=minhas();L.push({nome:em.f+' '+(L.length+1),url:u.trim()});grava('fcm_pl',L);tocando=PLS.length+L.length-1;parar();btn.classList.add('on');desenhar();});
  window.FCM={async abertura(){MODO='abertura';await carregar();desenhar();box.hidden=false;},parar(){parar();tocando=null;btn.classList.remove('on');MODO='estudo';if(!box.hidden){desenhar();box.hidden=true;}}};
  btn.onclick=async()=>{if(box.hidden){await carregar();desenhar();}box.hidden=!box.hidden;};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')box.hidden=true;});
})();
