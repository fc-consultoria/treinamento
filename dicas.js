/* ===== Dicas da FC (site, orientativo e painel) ===== */
(function(){
const SB='https://cpkjphodruyxfouirhpd.supabase.co',KEY='sb_publishable_d0HEeWsaqOeZIQKGftlF-Q_B8BUOWWg';
const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const TIPOS={mont:['🔧','Dica de montagem','#1f7a4d','#e6f6ec'],onde:['📍','Onde encontrar','#1f5f8b','#e5f0f8'],novo:['🆕','Novidade','#9a4b14','#fdeee3']};
const hoje=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const yt=u=>{const m=String(u||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/);return m?m[1]:'';};
const url=u=>{u=String(u||'').trim();if(!u)return '';if(!/^https?:\/\//i.test(u))u='https://'+u;try{const x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:'';}catch(_){return '';}};
const img=s=>/^data:image\/(png|jpe?g|webp);base64,/.test(s||'')?s:'';
function ativa(d,onde){if(!d||d.oc||d.rm||!d.tit)return false;if(d.ate&&d.ate<hoje())return false;if(onde&&d.onde&&d.onde!=='ambos'&&d.onde!==onde)return false;return true;}
async function carregar(){const r=await fetch(SB+'/rest/v1/trein_eventos?select=detalhe&tipo=eq.dicas&order=criado_em.desc&limit=1',{headers:{apikey:KEY}});const j=await r.json();return ((((j||[])[0]||{}).detalhe)||{}).itens||[];}
function hit(ev,ref,pag){try{if(localStorage.getItem('fc_eu')==='1')return;}catch(_){}
  try{let s=sessionStorage.getItem('fc_s');if(!s){s=Math.random().toString(36).slice(2,12)+Date.now().toString(36);sessionStorage.setItem('fc_s',s);}
  fetch(SB+'/rest/v1/rpc/site_hit',{method:'POST',keepalive:true,headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_s:s,p_pag:pag||'site',p_ev:ev,p_o:sessionStorage.getItem('fc_o')||'direto',p_ref:String(ref||'').slice(0,60)})}).catch(()=>{});}catch(_){}}
function capa(d){const i=img(d.img),v=yt(d.vid);return i?`<div class="fdC" style="background-image:url('${i}')"></div>`:v?`<div class="fdC" style="background-image:url('https://i.ytimg.com/vi/${v}/hqdefault.jpg')"><span class="fdPl">▶</span></div>`:'';}
function tag(d){const t=TIPOS[d.tipo]||TIPOS.mont;return `<span class="fdT" style="color:${t[2]};background:${t[3]}">${t[0]} ${t[1]}</span>`;}
function cards(el,L,o){o=o||{};if(!el)return;el.innerHTML=`<div class="fdG">${L.map((d,i)=>`<button type="button" class="fdK" data-fd="${i}">${capa(d)}<div class="fdB">${tag(d)}${o.novo&&o.novo(d)?'<span class="fdN">NOVA</span>':''}<b>${esc(d.tit)}</b><p>${esc(d.txt)}</p><i>Ver dica →</i></div></button>`).join('')}</div>`;
  el.querySelectorAll('[data-fd]').forEach(b=>b.onclick=()=>abrir(L[+b.dataset.fd],o.pag,o.onOpen));}
function abrir(d,pag,onOpen){if(!d)return;let o=document.getElementById('fdOv');if(o)o.remove();o=document.createElement('div');o.id='fdOv';o.setAttribute('role','dialog');o.setAttribute('aria-label',d.tit);
  const i=img(d.img),v=yt(d.vid),l=url(d.link);
  o.innerHTML=`<div class="fdM"><button type="button" class="fdX" aria-label="Fechar">×</button>${tag(d)}<h3>${esc(d.tit)}</h3>${v?`<div class="fdV"><iframe src="https://www.youtube-nocookie.com/embed/${v}" title="Vídeo" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`:''}${i?`<img class="fdI" src="${i}" alt="">`:''}<div class="fdTx">${esc(d.txt).replace(/\n/g,'<br>')}</div>
   <div class="fdA">${l?`<a class="fdL" href="${esc(l)}" target="_blank" rel="noopener" data-fl>${esc(d.linkT||'Saiba mais')} →</a>`:''}<a class="fdW" href="https://wa.me/5566999867984?text=${encodeURIComponent('Olá Fernando, vi a dica "'+d.tit+'" e quero saber mais.')}" target="_blank" rel="noopener" data-fw>💬 Falar com a FC</a></div>
   ${d.ate?`<small class="fdS">Dica válida até ${d.ate.split('-').reverse().join('/')}</small>`:''}</div>`;
  document.body.appendChild(o);const fx=()=>o.remove();o.querySelector('.fdX').onclick=fx;o.addEventListener('click',e=>{if(e.target===o)fx();});
  document.addEventListener('keydown',function k(e){if(e.key==='Escape'){fx();document.removeEventListener('keydown',k);}});
  const fl=o.querySelector('[data-fl]');if(fl)fl.addEventListener('click',()=>hit('dica_link',d.id,pag));o.querySelector('[data-fw]').addEventListener('click',()=>hit('dica_whats',d.id,pag));
  hit('dica_ver',d.id,pag);if(onOpen)onOpen(d);}
if(!document.getElementById('fdCss')){const st=document.createElement('style');st.id='fdCss';st.textContent=`.fdG{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.fdK{all:unset;box-sizing:border-box;cursor:pointer;background:#fff;border:1px solid #dde4e8;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;color:#0f1e27;transition:transform .15s,box-shadow .15s;font-family:inherit}
.fdK:hover,.fdK:focus-visible{transform:translateY(-2px);box-shadow:0 10px 24px rgba(15,30,39,.13)}.fdK:focus-visible{outline:3px solid #1fb3c9}
.fdC{height:150px;background:#e9eef1 center/cover no-repeat;position:relative}.fdPl{position:absolute;inset:0;margin:auto;width:52px;height:52px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px}
.fdB{padding:14px 16px 16px;display:flex;flex-direction:column;gap:7px;flex:1}.fdB b{font-size:16.5px;line-height:1.3}.fdB p{margin:0;font-size:14px;color:#4a5b65;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.fdB i{font-style:normal;font-weight:700;font-size:13.5px;color:#1f6f9a;margin-top:auto}
.fdT{align-self:flex-start;font:700 12px system-ui,sans-serif;border-radius:20px;padding:3px 10px}.fdN{position:absolute;margin:-4px 0 0 0;right:14px;background:#e0372e;color:#fff;font:800 10.5px system-ui;border-radius:10px;padding:2px 8px}.fdK{position:relative}
#fdOv{position:fixed;inset:0;z-index:9600;background:rgba(5,12,17,.72);display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow:auto}
.fdM{background:#fff;color:#0f1e27;border-radius:16px;max-width:680px;width:100%;margin:auto;padding:22px;position:relative;font-family:system-ui,sans-serif}
.fdM h3{margin:10px 0 12px;font-size:22px;line-height:1.25;padding-right:26px}.fdX{position:absolute;top:10px;right:12px;background:none;border:0;font-size:28px;cursor:pointer;color:#41525c;line-height:1}
.fdV{position:relative;padding-top:56.25%;border-radius:12px;overflow:hidden;margin-bottom:12px;background:#000}.fdV iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.fdI{width:100%;max-height:420px;object-fit:contain;border-radius:12px;background:#f2f5f7;margin-bottom:12px}.fdTx{font-size:15.5px;line-height:1.6;color:#2b3b44}
.fdA{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.fdA a{text-decoration:none;font:700 14.5px system-ui;border-radius:10px;padding:11px 16px}.fdL{background:#1f6f9a;color:#fff}.fdW{background:#1f9d55;color:#fff}.fdS{display:block;margin-top:12px;color:#7a8a93;font-size:12.5px}
@media(max-width:560px){.fdG{grid-template-columns:1fr}.fdM{padding:18px}.fdC{height:170px}}`;document.head.appendChild(st);}
window.FCD={TIPOS,ativa,carregar,cards,abrir,hit,hoje,yt,url,img,esc};
})();
