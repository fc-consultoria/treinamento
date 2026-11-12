/* Simulador de Obra · Banco de Tipologias FC (125 aprovadas em 11/11/2026)
   Desenho paramétrico gerado pela FC a partir da descrição, com cor do perfil e do vidro.
   Sem nome de linha: a linha é escolhida no escritório.
   © FC Consultoria em Esquadria · uso exclusivo */
(function(){
const COR={
 branco:{n:'Branco',b:'#ecece8',l:'#ffffff',d:'#bdbdb7',s:'#8e8e88'},
 preto:{n:'Preto',b:'#2c2d30',l:'#5a5d62',d:'#121315',s:'#000000'},
 fosco:{n:'Fosco',b:'#b4b8bb',l:'#e3e6e8',d:'#82878b',s:'#5b6064'},
 bronze:{n:'Bronze',b:'#5b4535',l:'#836650',d:'#3a2b20',s:'#22180f'},
 grafite:{n:'Grafite',b:'#474b50',l:'#6a6f75',d:'#2a2d31',s:'#1a1c1f'},
 natural:{n:'Natural',b:'#c3c6c9',l:'#e6e8ea',d:'#8d9196',s:'#62666a'},
 madeira:{n:'Madeira',b:'#8a4a2a',l:'#b36d43',d:'#5b2d18',s:'#3a1b0d'}
};
const VID={
 incolor:{n:'Incolor',a:'#dcecf1',b:'#93b7c5'},
 verde:{n:'Verde',a:'#d3eadc',b:'#6e9d84'},
 fume:{n:'Fumê',a:'#9aa5a9',b:'#3d474c'},
 champanhe:{n:'Champanhe',a:'#efe1c8',b:'#b39770'},
 cinza:{n:'Cinza',a:'#b8bcbe',b:'#6c7174'},
 cinza_claro:{n:'Cinza Claro',a:'#dadcdd',b:'#a3a7a9'},
 refl_cinza:{n:'Refl. Cinza',a:'#e0e5ed',b:'#70757d'},
 refl_champ:{n:'Refl. Champanhe',a:'#f0e6d6',b:'#a0907a'}
};
let SEQ=0;
const N=s=>{const m=String(s||'').match(/\d+/);return m?parseInt(m[0],10):null};

/* ---------------- leitura da descrição ---------------- */
function parse(desc){
 const d=(' '+desc+' ').toUpperCase().replace(/["“”]/g,'').replace(/\s+/g,' ');
 const s={raw:desc,d};
 const has=re=>re.test(d);
 s.porta=has(/\bPORTA\b|PORTÃO|PORTINHOLA/)&&!has(/^ ?JANELA/);
 // tipo principal
 if(has(/FACHADA/)) s.kind='fachada';
 else if(has(/GUARDA|ENVIDRA|ESCADA|GRADIL|SACADA/)) s.kind='guarda';
 else if(has(/PORTÃO/)) s.kind='portao';
 else if(has(/BRISE/)) s.kind='brise';
 else if(has(/REVESTIMENTO/)) s.kind='revest';
 else if(has(/CAMARÃO/)) s.kind='camarao';
 else if(has(/GUILHOTINA/)) s.kind='guilhotina';
 else if(has(/JANELA PIVOTANTE/)) s.kind='pivjan';
 else if(has(/^ ?MAXIM/)) s.kind='maxim';
 else if(has(/BASCULANTE/)) s.kind='basc';
 else if(has(/CORRER/)) s.kind='correr';
 else if(has(/VAI E VEM/)) s.kind='vaivem';
 else if(has(/PORTINHOLA/)) s.kind='portinhola';
 else if(has(/PIVOTANTE/)) s.kind='pivo';
 else if(has(/GIRO/)) s.kind='giro';
 else s.kind='fixo';
 if(s.kind==='portinhola') s.porta=false;
 const mf=d.match(/(\d+)\s*(FOLHAS?|FLS)/); s.n=mf?parseInt(mf[1],10):1;
 if(s.kind==='camarao'&&!mf){s.n=2}
 s.integrada=has(/INTEGRADA/); s.canto=has(/CANTO|MARCO 90/); s.atras=has(/TRÁS DA PAREDE|ATRÁS PAREDE/);
 s.seq=has(/SEQU|PLANOS/); s.fcentral=has(/FECH(AMENTO|\.)? ?CENTRAL/);
 // retira trechos de bandeira/peitoril/lateral antes de ler o preenchimento das folhas
 let core=d.replace(/BANDEIRA[^|]*/g,' ').replace(/PEITORI[^|]*/g,' ').replace(/FIXOS? (VIDRO |VENEZIANA |LAMBRI )?(NAS )?LATERA[^|]*/g,' ').replace(/LATERAIS FIXAS/g,' ').replace(/VITRÔ LATERAL/g,' ');
 // preenchimento das folhas
 s.fills=null;
 const cnt=(re)=>{const m=core.match(re);return m?parseInt(m[1],10):0};
 const vzv=cnt(/(\d+) ?-? ?VENEZ(IANA|\.)? ?VENT/), vzc=cnt(/(\d+) ?-? ?(VENEZ(IANA|\.)? ?)?CEGA/), vd=cnt(/(\d+) ?VIDROS?\b/), tl=cnt(/(\d+) ?TELAS?\b/);
 let lbq=cnt(/(\d+) ?LAMBRI/), vzq=(vzv||vzc)?0:cnt(/(\d+) ?VENEZIANAS?\b/);
 if(vzv||vzc||tl||lbq||vzq||(vd&&vd<s.n)){
  const arr=[];for(let i=0;i<vzv;i++)arr.push('vz');for(let i=0;i<vzc;i++)arr.push('vzc');for(let i=0;i<vzq;i++)arr.push('vz');for(let i=0;i<lbq;i++)arr.push('lb');for(let i=0;i<vd;i++)arr.push('vd');for(let i=0;i<tl;i++)arr.push('tl');
  if(/4 VENEZ/.test(core)&&s.n===6) {arr.length=0;arr.push('vz','vzc','vd','vd','vzc','vz');}
  if(tl&&arr.length===s.n){ const t=arr.filter(x=>x==='tl'), o=arr.filter(x=>x!=='tl'); const res=new Array(s.n); let a=0,b=s.n-1,k=0; t.forEach(()=>{ if(k++%2===0) res[b--]='tl'; else res[a++]='tl'; }); for(let i=0;i<s.n;i++) if(!res[i]) res[i]=o.shift(); arr.splice(0,arr.length,...res); }
  if(arr.length) s.fills=arr;
 }
 let base='vd';
 if(/VIDRO SUPERIOR E VENEZIANA INFERIOR|VIDRO SUPERIOR - VENEZIANA INFERIOR|VENEZIANA INFERIOR - VIDRO SUPERIOR/.test(core)) base='vd/vz';
 else if(/VIDRO SUPERIOR E LAMBRI INFERIOR|VIDRO E LAMBRI/.test(core)) base='vd/lb';
 else if(/VIDRO INFERIOR E VENEZIANA SUPERIOR/.test(core)) base='vz/vd';
 else if(/RIPADO|RÍPADO/.test(d)) base='rip';
 else if(/LAMBRI/.test(core)) base='lb';
 else if(/VENEZIANA/.test(core)) base='vz';
 else if(/TELA MOSQUITEIR/.test(core)) base='tl';
 s.base=base;
 if(!s.fills){s.fills=[];for(let i=0;i<s.n;i++)s.fills.push(base)}
 // bandeira / peitoril
 s.top=[];s.bot=[];
 const band=(d.match(/BANDEIRA[^|]*/)||[''])[0]+((/02 BANDEIRAS/.test(d))?' X2':'');
 if(/BANDEIRA|BANDEIRAS/.test(d)){
  let t='fixa';
  if(/VENEZIANA|VENTILA/.test(band)) t='vz';
  if(/MAXIM/.test(band)) t='max';
  if(/MÓVEL/.test(band)) t='fixa';
  let mods=N((band.match(/(\d+) (MÓDULOS? )?MAXIM/)||[])[1])||null;
  const mixed=/FIXAS? E \d+ MAXIM|FIXOS E \d+ MÓDULOS MAXIM|FIXO CENTRAL/.test(band);
  s.top.push({t,mods,mixed});
  if(/2 ALTURAS|DUPLA|X2/.test(band)) s.top.push({t:'fixa'});
 }
 if(/PEITORI/.test(d)){
  const p=(d.match(/PEITORI[^|]*/)||[''])[0]+(/PEIT\. C\/ VENEZIANA/.test(d)?' VENEZIANA':'');
  s.bot.push({t:/VENEZIANA/.test(p)?'vz':'fixa'});
  if(/02 PEITORIS/.test(d)) s.bot.push({t:'fixa'});
 }
 if(/PEIT\. C\/ VENEZIANA/.test(d)&&!s.bot.length) s.bot.push({t:'vz'});
 if(/BAND\. FIXA/.test(d)&&!s.top.length) s.top.push({t:'fixa'});
 if(/FIXO SUPERIOR E INFERIOR/.test(d)){s.top.push({t:'fixa'});s.bot.push({t:'fixa'})}
 // laterais
 s.lat={l:false,r:false,f:'vd'};
 if(/FIXOS? (NAS )?LATERAIS|LATERAIS FIXAS|FIXO ESQUERDO E FIXO DIREITO|FIXOS LATERAIS/.test(d)){s.lat.l=s.lat.r=true}
 else if(/FIXO (VIDRO |VENEZIANA |LAMBRI )?LATERAL|VITRÔ LATERAL|COM FIXO LATERAL/.test(d)){s.lat.r=true}
 if(/FIXO VENEZIANA LATERAL/.test(d)) s.lat.f='vz';
 if(/FIXO LATERAL \| LAMBRI|LAMBRI \| FIXO LAMBRI|FIXO LAMBRI/.test(d)) s.lat.f='lb';
 if(/COM FIXO LATERAL \| VENEZIANA/.test(d)) s.lat.f='vz';
 // grades (maxim, basc, fixo, pivjan)
 const mh=d.match(/(\d+) MÓDULOS VERTICAIS/); s.rows=mh?parseInt(mh[1],10):(/N MÓDULOS VERTICAIS/.test(d)?3:1); if(s.kind==='basc'&&!mh) s.rows=1;
 s.cols=/N MÓDULOS|N NÚMERO|MÓDULOS HORIZONTAIS/.test(d)?3:1;
 if(s.kind==='fixo'&&/MÓDULOS HORIZONTAIS/.test(d)) s.cols=3;
 s.efixo=/E FIXO/.test(d);
 s.quadros=[];
 const q=d.match(/MAXIM-AR (\d)º( E (\d)º)? QUADRO/); if(q){s.quadros.push(+q[1]); if(q[3]) s.quadros.push(+q[3]);}
 const qm=d.match(/\| (\d) MAXIM-AR/); if(qm) s.qmax=+qm[1];
 s.intercalado=/INTERCALADOS/.test(d)?(/ÍMPARES/.test(d)?'imp':'par'):null;
 if(s.kind==='maxim'&&s.efixo&&s.rows===1&&!s.intercalado) s.rows=2;
 return s;
}

/* ---------------- dimensões padrão (mm) ---------------- */
function dims(s){
 let W,H,core;
 const k=s.kind;
 if(k==='fachada') return {W:3600,H:3000};
 if(k==='guarda') return /ENVIDRA/.test(s.d)?{W:3200,H:2500}:(/ESCADA/.test(s.d)?{W:3200,H:2000}:{W:3200,H:1100});
 if(k==='portao') return {W:1100,H:2100};
 if(k==='brise') return {W:3200,H:2400};
 if(k==='revest') return {W:2600,H:2600};
 if(k==='correr'){
  if(s.porta){W=Math.max(900,(s.n<=1?1000:780*s.n)); H=2150}
  else {W=Math.max(1200,560*s.n); H=s.n>=6?1100:1200}
 } else if(k==='camarao'){ W=(s.porta?700:450)*s.n; H=s.porta?2150:1100 }
 else if(k==='giro'||k==='vaivem'){ W=s.n===1?850:(s.n===2?1500:2700); H=2150 }
 else if(k==='pivo'){ W=s.n===1?1150:2000; H=2400 }
 else if(k==='portinhola'){ W=s.n===1?550:950; H=600 }
 else if(k==='guilhotina'){ W=1000; H=1400 }
 else if(k==='maxim'||k==='basc'||k==='pivjan'){ W=s.cols>1?1800:800; H=Math.max(k==='basc'?900:(k==='pivjan'?1000:600),s.rows*520) }
 else { W=s.cols>1?1800:900; H=s.porta?2100:Math.max(900,s.rows*500) }
 const tb=s.top.length*(s.porta?420:380)+s.bot.length*(s.porta?420:420);
 H+=tb;
 if(s.lat.l) W+=450; if(s.lat.r) W+=450;
 if(s.integrada) H+=170;
 return {W,H};
}

/* ---------------- desenho ---------------- */
function make(desc,opt){
 opt=Object.assign({cor:'branco',vidro:'incolor',sentido:true,contexto:true},opt||{});
 const s=parse(desc), c=COR[opt.cor]||COR.branco, g=VID[opt.vidro]||VID.incolor, p='fc'+(++SEQ);
 const D0=dims(s), W=Math.round(+opt.W||D0.W), H=Math.round(+opt.H||D0.H);
 const A=Math.max(0,Math.min(1,+opt.abre||0)); // abertura 0 (fechada) a 1 (aberta)
 const pad=Math.max(W,H)*0.16+200;
 const VBW=W+pad*2, VBH=H+pad*2;
 const X0=pad,Y0=pad;
 const out=[];const push=x=>out.push(x);
 const isDoor=s.porta||['fachada','guarda','portao','revest','brise'].includes(s.kind);
 // defs
 const defs=`<defs>
 <linearGradient id="${p}fv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.d}"/><stop offset=".35" stop-color="${c.l}"/><stop offset=".7" stop-color="${c.b}"/><stop offset="1" stop-color="${c.d}"/></linearGradient>
 <linearGradient id="${p}fh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.d}"/><stop offset=".35" stop-color="${c.l}"/><stop offset=".7" stop-color="${c.b}"/><stop offset="1" stop-color="${c.d}"/></linearGradient>
 <linearGradient id="${p}gl" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="${g.a}" stop-opacity="${opt.foto?.5:1}"/><stop offset=".55" stop-color="${g.b}" stop-opacity="${opt.foto?.6:.92}"/><stop offset="1" stop-color="${g.b}" stop-opacity="${opt.foto?.7:1}"/></linearGradient>
 <linearGradient id="${p}rf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="${p}wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efebe5"/><stop offset="1" stop-color="#d9d2c8"/></linearGradient>
 <linearGradient id="${p}floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9b2a7"/><stop offset="1" stop-color="#8f877c"/></linearGradient>
 <linearGradient id="${p}sill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f2ef"/><stop offset="1" stop-color="#a9a49c"/></linearGradient>
 <linearGradient id="${p}int" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4246"/><stop offset="1" stop-color="#1f2427"/></linearGradient>
 <linearGradient id="${p}met" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6d7277"/><stop offset=".45" stop-color="#e9ecee"/><stop offset="1" stop-color="#5d6267"/></linearGradient>
 <pattern id="${p}vz" width="40" height="38" patternUnits="userSpaceOnUse"><rect width="40" height="38" fill="${c.s}"/><rect y="3" width="40" height="30" fill="url(#${p}fh)"/></pattern>
 <pattern id="${p}vzc" width="40" height="34" patternUnits="userSpaceOnUse"><rect width="40" height="34" fill="url(#${p}fh)"/><rect y="32" width="40" height="2" fill="${c.s}" opacity=".7"/></pattern>
 <pattern id="${p}lb" width="60" height="120" patternUnits="userSpaceOnUse"><rect width="60" height="120" fill="${c.b}"/><rect width="60" height="3" fill="${c.l}" opacity=".9"/><rect y="116" width="60" height="4" fill="${c.s}" opacity=".45"/></pattern>
 <pattern id="${p}rip" width="70" height="60" patternUnits="userSpaceOnUse"><rect width="70" height="60" fill="${c.s}"/><rect x="4" width="46" height="60" fill="url(#${p}fv)"/></pattern>
 <pattern id="${p}tl" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#26302f" opacity=".28"/><path d="M0 0H9M0 0V9" stroke="#111" stroke-width="1.5" opacity=".6"/></pattern>
 <pattern id="${p}ps" width="40" height="34" patternUnits="userSpaceOnUse"><rect width="40" height="34" fill="${c.d}"/><rect y="2" width="40" height="29" fill="url(#${p}fh)"/></pattern>
 <filter id="${p}sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="10" dy="16" stdDeviation="16" flood-color="#000" flood-opacity=".28"/></filter>
 <filter id="${p}soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
 </defs>`;
 // ---------- helpers ----------
 const R=(x,y,w,h,f,extra='')=>push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${f}" ${extra}/>`);
 function frame(x,y,w,h,t){ // moldura com cantos em 45°
  const P=(pts,f)=>push(`<polygon points="${pts.map(v=>v.toFixed(1)).join(' ')}" fill="${f}" stroke="${c.s}" stroke-opacity=".35" stroke-width="1.5"/>`);
  P([x,y,x+w,y,x+w-t,y+t,x+t,y+t],`url(#${p}fh)`);
  P([x,y+h,x+w,y+h,x+w-t,y+h-t,x+t,y+h-t],`url(#${p}fh)`);
  P([x,y,x+t,y+t,x+t,y+h-t,x,y+h],`url(#${p}fv)`);
  P([x+w,y,x+w-t,y+t,x+w-t,y+h-t,x+w,y+h],`url(#${p}fv)`);
 }
 function barH(x,y,w,t){R(x,y,w,t,`url(#${p}fh)`,`stroke="${c.s}" stroke-opacity=".3" stroke-width="1.5"`)}
 function barV(x,y,h,t){R(x,y,t,h,`url(#${p}fv)`,`stroke="${c.s}" stroke-opacity=".3" stroke-width="1.5"`)}
 function glass(x,y,w,h){
  R(x,y,w,h,`url(#${p}gl)`);
  push(`<svg x="${x}" y="${y}" width="${w}" height="${h}" overflow="hidden"><polygon points="${w*0.18},0 ${w*0.42},0 ${w*0.12},${h} ${-w*0.12},${h}" fill="url(#${p}rf)" opacity=".55"/><polygon points="${w*0.55},0 ${w*0.62},0 ${w*0.4},${h} ${w*0.33},${h}" fill="#fff" opacity=".18"/></svg>`);
  R(x,y,w,h,'none',`stroke="#000" stroke-opacity=".25" stroke-width="3"`);
 }
 function fill(x,y,w,h,f,persiana){
  if(f&&f.includes('/')){const [a,b]=f.split('/');const hb=Math.min(h*0.48,s.porta?950:h*0.5);fill(x,y,w,h-hb-20,a,persiana);barH(x,y+h-hb-20,w,40);fill(x,y+h-hb+20,w,hb-20,b);return}
  if(f==='vd'||!f){glass(x,y,w,h);if(persiana){R(x,y,w,h*0.38,`url(#${p}ps)`);R(x,y+h*0.38-6,w,10,`url(#${p}fh)`)}}
  else if(f==='tl'){glass(x,y,w,h);R(x,y,w,h,`url(#${p}tl)`)}
  else R(x,y,w,h,`url(#${p}${f})`,`stroke="#000" stroke-opacity=".2" stroke-width="2"`);
 }
 const sym=(pts,closed)=>{if(!opt.sentido)return;push(`<polyline points="${pts.map(v=>v.toFixed(1)).join(' ')}" fill="none" stroke="#0f4c5c" stroke-opacity=".55" stroke-width="7" stroke-dasharray="34 22" stroke-linecap="round"/>`)};
 const arrow=(x,y,dir,len=180)=>{if(!opt.sentido)return;const a=dir*len;push(`<g stroke="#0f4c5c" stroke-opacity=".6" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M${x-a/2} ${y}H${x+a/2}"/><path d="M${x+a/2-dir*45} ${y-35}L${x+a/2} ${y}L${x+a/2-dir*45} ${y+35}"/></g>`)};
 const arrowV=(x,y,dir,len=160)=>{if(!opt.sentido)return;const a=dir*len;push(`<g stroke="#0f4c5c" stroke-opacity=".6" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M${x} ${y-a/2}V${y+a/2}"/><path d="M${x-35} ${y+a/2-dir*45}L${x} ${y+a/2}L${x+35} ${y+a/2-dir*45}"/></g>`)};
 const concha=(x,y)=>R(x-9,y-70,18,140,c.s,'rx="8" opacity=".85"');
 const lever=(x,y,dir)=>{R(x-14,y-60,28,120,c.s,'rx="10" opacity=".9"');R(dir>0?x:x-150,y-12,150,24,`url(#${p}met)`,'rx="12"')};
 const tubo=(x,y,h)=>R(x-18,y,36,h,`url(#${p}met)`,'rx="18"');
 const hinge=(x,y)=>R(x-8,y,16,90,c.s,'rx="5"');
 const leafT=s.porta?58:46, M=/MARCO LARGO/.test(s.d)?95:(/SEM MARCO/.test(s.d)?22:50), T=42;

 // abrir/fechar: o que a folha deixa de cobrir mostra o interior; a folha gira/corre por cima
 const gap=(x,y,w,h)=>{ if(w>1&&h>1) R(x,y,w,h,`url(#${p}int)`); };
 const gIn=(ax,ay,kx,ky)=>push(`<g transform="translate(${ax.toFixed(1)} ${ay.toFixed(1)}) scale(${kx.toFixed(4)} ${ky.toFixed(4)}) translate(${(-ax).toFixed(1)} ${(-ay).toFixed(1)})">`);
 const gOut=(x,y,w,h,o)=>{ R(x,y,w,h,'#000',`opacity="${(o*A).toFixed(3)}"`); push('</g>'); };
 // ---------- módulos ----------
 function leafBox(x,y,w,h,f,persiana){frame(x,y,w,h,leafT);fill(x+leafT,y+leafT,w-2*leafT,h-2*leafT,f,persiana)}
 // fechaduras / fechos
 function fechLateral(x,y,h,side){ // side: 'r' fechadura no montante junto ao marco direito, 'l' esquerdo
  const hy=y+h*(s.porta?0.5:0.5);
  R(x-13,hy-(s.porta?130:90),26,s.porta?260:180,c.s,'rx="6"');
  if(s.porta) R(x+(side==='r'?-70:44),hy-230,26,460,`url(#${p}met)`,'rx="13"');
  else R(x+(side==='r'?-52:26),hy-60,26,120,`url(#${p}met)`,'rx="10"');
 }
 function fechCentral(x,y,h){ const hy=y+h*0.5; R(x-12,hy-80,24,160,c.s,'rx="8"'); R(x-5,hy-50,10,100,`url(#${p}met)`,'rx="5"'); if(s.porta) R(x-48,hy-210,22,420,`url(#${p}met)`,'rx="11"'); }
 function correrLayout(n){
  const d=s.d;
  if(/01 FIXA CENTRAL|FIXO CENTRAL E 04/.test(d)){
   const m=Math.floor(n/2); const plane=[],mov=[],dir=[];
   for(let i=0;i<n;i++){plane.push(i===m?0:1);mov.push(i!==m);dir.push(i<m?1:-1)}
   return {plane,mov,dir,lock:'duplo'};
  }
  const central = n>=2 && n%2===0 && !s.seq && !(s.canto);
  if(n===2&&!s.seq){return {plane:[0,1],mov:[true,true],dir:[1,-1],lock:'central2'}}
  if(central){ const h=n/2, plane=[],mov=[],dir=[];
   for(let i=0;i<n;i++){ if(i<h){plane.push(i);dir.push(-1)} else {plane.push(n-1-i);dir.push(1)} mov.push(i===h-1||i===h) }
   return {plane,mov,dir,lock:'central'}; }
  // sequencial: empilha à esquerda, fechadura só na lateral direita
  const plane=[],mov=[],dir=[];
  for(let i=0;i<n;i++){plane.push(i);mov.push(n===1||i>0);dir.push(-1)}
  return {plane,mov,dir,lock:'lateral'};
 }
 function correr(x,y,w,h,nOverride){
  const n=nOverride||s.n, ov=45, lw=(w+ov*(n-1))/n, L=correrLayout(n), st=lw-ov, sh=new Array(n).fill(0);
  if(A>0&&n>1){ if(L.lock==='central2') sh[1]=-st*A*0.94;
   else if(L.lock==='lateral'){ for(let i=1;i<n;i++) if(L.mov[i]) sh[i]=-i*st*A*0.97; }
   else for(let i=0;i<n;i++) if(L.mov[i]) sh[i]=L.dir[i]*st*A*0.94; }
  const lxOf=i=>x+i*st+sh[i];
  if(s.atras){R(x,y,w*0.5,h,`url(#${p}wall)`);}
  if(A>0){ const iv=[...Array(n).keys()].map(i=>[lxOf(i),lxOf(i)+lw]).sort((u,v)=>u[0]-v[0]); let cur=x;
   iv.forEach(([u,v])=>{ if(u>cur) gap(cur,y,u-cur,h); cur=Math.max(cur,v); }); if(cur<x+w) gap(cur,y,x+w-cur,h); }
  const order=[...Array(n).keys()].sort((a,b)=>L.plane[a]-L.plane[b]);
  order.forEach(i=>{
   const lx=lxOf(i);
   if(L.plane[i]>0) R(lx+14,y+10,lw,h-10,'#000','opacity=".14"');
   leafBox(lx,y,lw,h,s.fills[i%s.fills.length],s.integrada);
  });
  for(let i=0;i<n;i++){ if(!L.mov[i]) continue; const lx=lxOf(i); arrow(lx+lw/2, y+h*0.64, L.dir[i], Math.min(220,lw*0.35)); }
  if(L.lock==='lateral'){ fechLateral(lxOf(n-1)+lw-leafT/2,y,h,'r'); }
  else if(L.lock==='duplo'){ fechLateral(lxOf(0)+leafT/2,y,h,'l'); fechLateral(lxOf(n-1)+lw-leafT/2,y,h,'r'); }
  else if(L.lock==='central2'){ fechCentral(lxOf(1)+leafT/2,y,h); }
  else if(L.lock==='central'){ const hcen=n/2; fechCentral(lxOf(hcen-1)+lw-leafT/2,y,h); }
 }
 function canto(x,y,w,h){ // janela/porta de canto: duas faces, sem coluna no encontro
  const n=s.n, a=/02 FOLHAS - 03 FOLHAS/.test(s.d)?2:Math.floor(n/2), b=n-a;
  const saveSeq=s.seq; s.seq=true; correr(x,y,w,h,a); s.seq=saveSeq;
  // segunda face em perspectiva
  const fw=w*0.42, sk=h*0.07, X=x+w+M;
  push(`<polygon points="${X-M},${y-M} ${X+fw},${y-M+sk} ${X+fw},${y+h+M-sk} ${X-M},${y+h+M}" fill="url(#${p}fh)" stroke="${c.s}" stroke-opacity=".4"/>`);
  push(`<polygon points="${X},${y} ${X+fw-M},${y+sk} ${X+fw-M},${y+h-sk} ${X},${y+h}" fill="url(#${p}gl)"/>`);
  for(let i=1;i<b;i++){const t=i/b, px=X+(fw-M)*t; push(`<line x1="${px}" y1="${y+sk*t}" x2="${px}" y2="${y+h-sk*t}" stroke="${c.b}" stroke-width="${leafT*1.4*(1-t*0.4)}"/>`)}
  if(opt.sentido) push(`<text x="${x+w}" y="${y-M-40}" font-size="90" text-anchor="middle" fill="#0f4c5c" opacity=".7" font-family="system-ui">encontro sem coluna · fecho no canto</text>`);
 }
 function giro(x,y,w,h,kind){
  const n=s.n, lw=w/n;
  for(let i=0;i<n;i++){
   const lx=x+i*lw;
   const left = n===1? true : (n===4? i<2 : i<n/2); // dobradiça do lado de fora
   const hx= left? lx : lx+lw, ox= left? lx+lw : lx;
   const ax= kind==='pivo'? (left? lx+lw*0.13: lx+lw*0.87) : hx;
   if(A>0){ gap(lx,y,lw,h); gIn(ax,y,Math.cos(A*1.3),1); }
   leafBox(lx,y,lw,h,s.fills[i%s.fills.length]);
   if(kind==='pivo'){ const px= left? lx+lw*0.13: lx+lw*0.87; push(`<circle cx="${px}" cy="${y+leafT/2}" r="12" fill="${c.s}"/><circle cx="${px}" cy="${y+h-leafT/2}" r="12" fill="${c.s}"/>`); tubo(left? lx+lw-leafT-60: lx+leafT+60, y+h*0.25, h*0.5); sym([left?lx+lw:lx,y+leafT, px,y+h/2, left?lx+lw:lx,y+h-leafT]); }
   else if(kind==='vaivem'){ hinge(left?lx+8:lx+lw-8,y+h*0.12); hinge(left?lx+8:lx+lw-8,y+h*0.8); sym([hx,y+leafT,ox,y+h/2,hx,y+h-leafT]); R((left?lx+lw-leafT-180:lx+leafT+30),y+h*0.45,150,260,`url(#${p}met)`,'rx="8" opacity=".85"'); }
   else { hinge(left?lx+8:lx+lw-8,y+h*0.12); hinge(left?lx+8:lx+lw-8,y+h*0.78);
    const ativa = n===1 || i===Math.floor(n/2);
    if(ativa){ if(s.kind==='portinhola'){R((left?lx+lw-leafT/2:lx+leafT/2)-10,y+h/2-40,20,80,c.s,'rx="8"')} else lever(left? lx+lw-leafT/2 : lx+leafT/2, y+h-1050*(h/2150), left?-1:1); }
    else if(n>1 && i===Math.floor(n/2)-1){ R(lx+lw-leafT/2-8,y+leafT+40,16,160,c.s,'rx="6"'); R(lx+lw-leafT/2-8,y+h-leafT-200,16,160,c.s,'rx="6"'); }
    sym([hx,y+leafT,ox-(left?leafT:-leafT),y+h/2,hx,y+h-leafT]); }
   if(A>0) gOut(lx,y,lw,h,0.3);
  }
 }
 function camarao(x,y,w,h){
  const n=s.n, lw=w/n, central=/CENTRAL/.test(s.d), kc=1-0.8*A;
  if(A>0) gap(x,y,w,h);
  for(let i=0;i<n;i++){const lx=x+i*lw;
   if(A>0) gIn(central&&i>=n/2? x+w : x, y, kc, 1);
   leafBox(lx,y,lw,h,s.fills[i%s.fills.length]); if(/TRAVESSA/.test(s.d)) R(lx+leafT,y+h*0.5,lw-2*leafT,leafT*1.3,`url(#${p}fh)`,`stroke="${c.s}" stroke-opacity=".7" stroke-width="3"`); R(lx,y,lw,h,i%2?'#000':'#fff',`opacity="${i%2?.07:.08}"`);
   const joint = central ? (i>0 && i!==n/2) : i>0; if(joint){hinge(lx,y+h*0.15);hinge(lx,y+h*0.75)}
   if(A>0) gOut(lx,y,lw,h,i%2?0.32:0.06); }
  hinge(x+8,y+h*0.15);hinge(x+8,y+h*0.75); if(central){hinge(x+w-8,y+h*0.15);hinge(x+w-8,y+h*0.75)}
  if(A<0.02){ if(central){ fechCentral(x+w/2,y,h); } else { fechLateral(x+w-leafT/2,y,h,'r'); } }
  if(opt.sentido){ if(central){ const a=[],b=[]; for(let i=0;i<=n/2;i++){a.push(x+i*lw, i%2? y+h*0.18 : y+h*0.08); b.push(x+w-i*lw, i%2? y+h*0.18 : y+h*0.08)} sym(a); sym(b); arrow(x+w*0.3,y+h*0.64,-1); arrow(x+w*0.7,y+h*0.64,1); }
   else { const pts=[];for(let i=0;i<=n;i++)pts.push(x+i*lw, i%2? y+h*0.18 : y+h*0.08);sym(pts); arrow(x+w/2,y+h*0.64,-1,260); } }
 }
 function guilhotina(x,y,w,h){
  const hh=(h+45)/2, up=A*(hh-45)*0.92;
  leafBox(x,y,w,hh,'vd'); if(A>0) gap(x,y+h-up,w,up);
  R(x+10,y+hh-45+10-up,w,hh,'#000','opacity=".14"'); leafBox(x,y+hh-45-up,w,hh,'vd');
  R(x+w/2-70,y+hh-45-up+leafT/2-9,140,18,c.s,'rx="8"'); arrowV(x+w/2,y+hh+hh/2,-1,160);
 }
 function grid(x,y,w,h,kind,rowsSpec){
  // rowsSpec: array of row types; cols from s
  const rows=rowsSpec.length, cols=kind==='pivjan'||kind==='maxim'||kind==='basc'||kind==='fixo'? s.cols:1;
  const rh=(h-T*(rows-1))/rows, cw=(w-T*(cols-1))/cols;
  for(let r=0;r<rows;r++){
   for(let ci=0;ci<cols;ci++){
    const mx=x+ci*(cw+T), my=y+r*(rh+T); let t=rowsSpec[r];
    if(s.intercalado){ t=((ci%2===0)===(s.intercalado==='par'))?'max':'fixa' }
    cell(mx,my,cw,rh,t);
   }
   if(r<rows-1) barH(x,y+r*(rh+T)+rh,w,T);
  }
  for(let ci=1;ci<cols;ci++) barV(x+ci*(cw+T)-T,y,h,T);
 }
 function cell(x,y,w,h,t){
  if(t==='basc'){ // módulo basculante: 3 básculas no eixo horizontal + alavanca
   frame(x,y,w,h,leafT*0.8); const ix=x+leafT*0.8, iy=y+leafT*0.8, iw=w-leafT*1.6-46, ih=h-leafT*1.6, nb=3, bh=ih/nb;
   for(let i=0;i<nb;i++){ const by=iy+i*bh; if(A>0){ gap(ix,by,iw,bh); gIn(ix,by+bh/2,1,1-0.82*A); } R(ix,by,iw,bh,`url(#${p}fh)`,'opacity=".9"'); glass(ix+12,by+12,iw-24,bh-24);
    push(`<line x1="${ix}" y1="${by+bh/2}" x2="${ix+iw}" y2="${by+bh/2}" stroke="${c.s}" stroke-width="5" stroke-dasharray="14 10" opacity=".55"/><circle cx="${ix+8}" cy="${by+bh/2}" r="9" fill="${c.s}"/><circle cx="${ix+iw-8}" cy="${by+bh/2}" r="9" fill="${c.s}"/>`);
    if(A>0) gOut(ix,by,iw,bh,0.25);
    if(opt.sentido) sym([ix+iw*0.15,by+bh*0.18, ix+iw*0.5,by+bh/2, ix+iw*0.15,by+bh*0.82]); }
   R(ix+iw+6,iy,40,ih,`url(#${p}fv)`,`stroke="${c.s}" stroke-opacity=".4"`); R(ix+iw+12,iy+ih*0.55,28,ih*0.3,`url(#${p}met)`,'rx="12"'); R(ix+iw-4,iy+ih*0.83,60,24,c.s,'rx="10"');
   return;
  }
  if(t==='max'||t==='piv'){
   if(A>0){ gap(x,y,w,h); gIn(x+w/2,y,t==='piv'?Math.cos(A*1.35):1,t==='max'?1-0.5*A:1); }
   leafBox(x,y,w,h,s.base==='vz'?'vz':'vd');
   if(t==='max'){ sym([x+leafT,y+leafT, x+w/2,y+h-leafT, x+w-leafT,y+leafT]); R(x+w/2-50,y+h-leafT/2-9,100,18,c.s,'rx="8"') }
   else if(t==='basc'){ }
   else { push(`<line x1="${x+w/2}" y1="${y+leafT}" x2="${x+w/2}" y2="${y+h-leafT}" stroke="${c.s}" stroke-width="5" stroke-dasharray="18 12" opacity=".5"/><circle cx="${x+w/2}" cy="${y+leafT/2}" r="11" fill="${c.s}"/><circle cx="${x+w/2}" cy="${y+h-leafT/2}" r="11" fill="${c.s}"/>`); R(x+w-leafT/2-10,y+h/2-50,20,100,c.s,'rx="8"'); sym([x+leafT,y+leafT, x+w/2,y+h/2, x+leafT,y+h-leafT]); sym([x+w-leafT,y+leafT, x+w/2,y+h/2, x+w-leafT,y+h-leafT]); }
   if(A>0) gOut(x,y,w,h,0.25);
  } else if(t==='vz') fill(x,y,w,h,'vz');
  else if(t==='lb') fill(x,y,w,h,'lb');
  else if(t==='rip') fill(x,y,w,h,'rip');
  else { fill(x,y,w,h,s.kind==='fixo'?(s.base.includes('/')?s.base:s.base):'vd'); }
 }
 function bandRow(x,y,w,h,spec){
  if(spec.t==='max'){
   const k=spec.mods||(s.kind==='correr'?Math.min(s.n,4):1);
   const cw=(w-T*(k-1))/k;
   for(let i=0;i<k;i++){ let t='max'; if(spec.mixed){ t=(k>=3 && (i===0||i===k-1))?'max':'fixa'; if(/02 FIXAS E 02 MAXIM-AR LATERAIS/.test(s.d)) t=(i===0||i===k-1)?'max':'fixa'; if(/FIXO CENTRAL/.test(s.d)) t=(i===1)?'fixa':'max'; }
    cell(x+i*(cw+T),y,cw,h,t); if(i) barV(x+i*(cw+T)-T,y,h,T);}
  } else if(spec.t==='vz') fill(x,y,w,h,'vz');
  else glass(x,y,w,h);
 }

 // ---------- especiais ----------
 function fachada(x,y,w,h){
  const sg=/STRUCTURAL/.test(s.d), pele=/PELE/.test(s.d), cols=4;
  const rows=[]; s.top.forEach(()=>rows.push('fixa')); if(/MAXIM/.test(s.d)) rows.push('max'); else rows.push('fixa'); rows.push('fixa'); s.bot.forEach(()=>rows.push('fixa'));
  if(sg||pele){ rows.length=0; rows.push('fixa','fixa','fixa'); }
  const j=sg?18:(pele?40:56), rh=(h-j*(rows.length+1))/rows.length, cw=(w-j*(cols+1))/cols;
  R(x,y,w,h,sg?'#14181a':`url(#${p}fh)`);
  for(let r=0;r<rows.length;r++)for(let ci=0;ci<cols;ci++){const mx=x+j+ci*(cw+j),my=y+j+r*(rh+j); if(rows[r]==='max'){ if(A>0){ gap(mx,my,cw,rh); gIn(mx+cw/2,my,1,1-0.5*A); } leafBox(mx,my,cw,rh,'vd'); if(A>0) gOut(mx,my,cw,rh,0.25); sym([mx+leafT,my+leafT,mx+cw/2,my+rh-leafT,mx+cw-leafT,my+leafT])} else R(mx,my,cw,rh,`url(#${p}gl)`)}
  push(`<svg x="${x}" y="${y}" width="${w}" height="${h}" overflow="hidden"><polygon points="${w*0.1},0 ${w*0.32},0 ${w*0.02},${h} ${-w*0.2},${h}" fill="url(#${p}rf)" opacity=".5"/><polygon points="${w*0.55},0 ${w*0.6},0 ${w*0.38},${h} ${w*0.33},${h}" fill="#fff" opacity=".16"/></svg>`);
  if(!sg) for(let ci=0;ci<=cols;ci++) R(x+ci*(cw+j),y,j,h,`url(#${p}fv)`,'opacity=".9"');
  if(s.canto){ R(x+w-8,y,16,h,c.s) }
 }
 function guarda(x,y,w,h){
  const d=s.d;
  if(/ENVIDRA/.test(d)){ // sacada envidraçada
   R(x-60,y+h,w+120,140,`url(#${p}floor)`); const n=6, lw=w/n; barH(x,y,w,50); barH(x,y+h-60,w,60);
   for(let i=0;i<n;i++){glass(x+i*lw+6,y+50,lw-12,h-110); }
   R(x,y+h*0.62,w,60,`url(#${p}met)`,'rx="28" opacity=".9"');
   return;
  }
  // laje
  R(x-120,y+h,w+240,220,`url(#${p}floor)`);
  if(/ESCADA/.test(d)){ y=y+900; h=h-900; const st=7; for(let i=0;i<st;i++){R(x+i*w/st,y+h-i*120,w/st+2,220+i*120,`url(#${p}floor)`)}
   push(`<svg x="0" y="0" width="${VBW}" height="${VBH}"><polygon points="${x},${y+h} ${x+w},${y+h-840} ${x+w},${y-840} ${x},${y}" fill="url(#${p}gl)" opacity=".9"/></svg>`); for(let i=1;i<4;i++){const t=i/4, px=x+i*w/4; R(px-20,y-60-840*t,40,h+60,`url(#${p}met)`,'rx="10"'); const py=y+h-840*t; push(`<line x1="${px}" y1="${py-800}" x2="${px}" y2="${py+40}" stroke="#000" stroke-opacity=".08" stroke-width="30"/>`)} tubo2(x,y-60,x+w,y-900); return;}
  if(/GRADIL/.test(d)){ barH(x,y,w,50); barH(x,y+h-120,w,50); for(let i=0;i<=w;i+=110) R(x+i,y,26,h-70,`url(#${p}fv)`); return; }
  const n=4, gap=24, pw=(w-gap*(n-1))/n;
  for(let i=0;i<n;i++){ const px=x+i*(pw+gap); glass(px,y+60,pw,h-60); if(/TORRE|PINÇA/.test(d)) {R(px+pw+gap/2-22,y+120,44,h-60,`url(#${p}met)`,'rx="8"')} else if(/BÓTTON|BOTON/.test(d)) {push(`<circle cx="${px+pw*0.2}" cy="${y+h-140}" r="26" fill="url(#${p}met)"/><circle cx="${px+pw*0.8}" cy="${y+h-140}" r="26" fill="url(#${p}met)"/>`)} }
  if(!/TORRE|BÓTTON|BOTON|FORTCORP/.test(d)) R(x,y+h-90,w,90,`url(#${p}fh)`);
  R(x-40,y,w+80,60,`url(#${p}met)`,'rx="28"');
  if(/ EM L| EM U/.test(d)){ push(`<polygon points="${x},${y} ${x-380},${y+220} ${x-380},${y+h+180} ${x},${y+h}" fill="url(#${p}gl)" opacity=".8"/>`); if(/ EM U/.test(d)) push(`<polygon points="${x+w},${y} ${x+w+380},${y+220} ${x+w+380},${y+h+180} ${x+w},${y+h}" fill="url(#${p}gl)" opacity=".8"/>`) }
 }
 function tubo2(x1,y1,x2,y2){push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#${p}met)" stroke-width="60" stroke-linecap="round"/>`)}
 function portao(x,y,w,h){
  if(A>0){ gap(x,y,w,h); gIn(x,y,Math.cos(A*1.3),1); }
  frame(x,y,w,h,70); const ix=x+70,iy=y+70,iw=w-140,ih=h-140, d=s.d;
  const tubes=(yy,hh)=>{for(let k=yy;k<yy+hh-40;k+=130) R(ix,k,iw,100,`url(#${p}fh)`,`stroke="${c.s}" stroke-opacity=".4"`)};
  const round=(yy,hh)=>{for(let k=ix+20;k<ix+iw-30;k+=95) R(k,yy,50,hh,`url(#${p}fv)`,'rx="25"')};
  const lam=(yy,hh)=>fill(ix,yy,iw,hh,/BÚZIOS/.test(d)?'vzc':'lb');
  if(/CENTRAL E TUBO/.test(d)){ const t3=ih*0.22; (/REDONDO/.test(d)?round:tubes)(iy,t3); barH(ix,iy+t3,iw,40); lam(iy+t3+40,ih-2*t3-80); barH(ix,iy+ih-t3-40,iw,40); (/REDONDO/.test(d)?round:tubes)(iy+ih-t3,t3); }
  else if(/E TUBO SUPERIOR|E TUBO REDONDO SUPERIOR/.test(d)){ const t3=ih*0.3; (/REDONDO/.test(d)?round:tubes)(iy,t3); barH(ix,iy+t3,iw,40); lam(iy+t3+40,ih-t3-40); }
  else if(/E TUBO INFERIOR|E TUBO REDONDO INFERIOR/.test(d)){ const t3=ih*0.3; lam(iy,ih-t3-40); barH(ix,iy+ih-t3-40,iw,40); (/REDONDO/.test(d)?round:tubes)(iy+ih-t3,t3); }
  else if(/TUBO RETANGULAR/.test(d)) tubes(iy,ih);
  else if(/TUBO REDONDO/.test(d)) round(iy,ih);
  else if(/VIDRO/.test(d)) glass(ix,iy,iw,ih);
  else if(/VENEZIANA/.test(d)) fill(ix,iy,iw,ih,'vz');
  else lam(iy,ih);
  lever(x+w-35,y+h*0.52,-1); hinge(x+8,y+h*0.12); hinge(x+8,y+h*0.8);
  if(A>0) gOut(x,y,w,h,0.3);
 }
 function brise(x,y,w,h){
  glass(x,y,w,h); for(let k=1;k<4;k++) barH(x,y+k*h/4-20,w,40);
  R(x-80,y-160,w+160,70,`url(#${p}fh)`,`stroke="${c.s}" stroke-opacity=".4"`); R(x-80,y+h+30,w+160,70,`url(#${p}fh)`,`stroke="${c.s}" stroke-opacity=".4"`);
  const n=8, sp=w/n;
  for(let i=0;i<n;i++){ const bx=x+i*sp+sp*0.18, fw=sp*0.42, dw=sp*0.16;
   push(`<rect x="${bx+fw}" y="${y-60}" width="${dw*2.2}" height="${h+60}" fill="#000" opacity=".16" filter="url(#${p}soft)"/>`);
   push(`<polygon points="${bx+fw},${y-90} ${bx+fw+dw},${y-110} ${bx+fw+dw},${y+h+50} ${bx+fw},${y+h+30}" fill="${c.d}"/>`);
   R(bx,y-90,fw,h+120,`url(#${p}fv)`,`stroke="${c.s}" stroke-opacity=".35"`); }
 }
 function revest(x,y,w,h){ R(x,y,w,h,`url(#${p}rip)`); R(x,y,w,h,'url(#'+p+'rf)','opacity=".15"') }

 // ---------- cena ----------
 if(!opt.foto) push(`<rect width="${VBW*1.8}" height="${VBH}" fill="${opt.contexto?`url(#${p}wall)`:'#eef1f3'}"/>`);
 if(opt.contexto&&!opt.foto){
  if(isDoor) R(0,Y0+H,VBW*1.8,VBH-Y0-H,`url(#${p}floor)`);
  if(!['guarda','brise','revest'].includes(s.kind)) R(X0-6,Y0-6,W+12,H+12,'#000','opacity=".22" filter="url(#'+p+'soft)"');
  if(!['guarda','brise','revest','fachada'].includes(s.kind)) R(X0,Y0,W,H,`url(#${p}int)`);
 }
 push(opt.foto?'<g>':`<g filter="url(#${p}sh)">`);
 const k=s.kind;
 if(k==='fachada') fachada(X0,Y0,W,H);
 else if(k==='guarda') guarda(X0,Y0,W,H);
 else if(k==='portao') portao(X0,Y0,W,H);
 else if(k==='brise') brise(X0,Y0,W,H);
 else if(k==='revest') revest(X0,Y0,W,H);
 else {
  // marco externo
  frame(X0,Y0,W,H,M);
  let ix=X0+M, iy=Y0+M, iw=W-2*M, ih=H-2*M;
  if(s.integrada){ R(ix,iy,iw,150,`url(#${p}fh)`,`stroke="${c.s}" stroke-opacity=".4"`); R(ix,iy+150,iw,12,c.s,'opacity=".5"'); iy+=170; ih-=170; }
  // bandeiras
  const bh=s.porta?380:340;
  s.top.forEach(sp=>{ bandRow(ix,iy,iw,bh,sp); barH(ix,iy+bh,iw,T); iy+=bh+T; ih-=bh+T; });
  s.bot.slice().reverse().forEach(sp=>{ bandRow(ix,iy+ih-bh,iw,bh,sp); barH(ix,iy+ih-bh-T,iw,T); ih-=bh+T; });
  // laterais
  const latW=450-T;
  if(s.lat.l){ fill(ix,iy,latW-M,ih,s.lat.f); barV(ix+latW-M,iy,ih,T); ix+=latW-M+T; iw-=latW-M+T; }
  if(s.lat.r){ fill(ix+iw-(latW-M),iy,latW-M,ih,s.lat.f); barV(ix+iw-(latW-M)-T,iy,ih,T); iw-=latW-M+T; }
  // corpo
  if(k==='correr') (s.canto?canto(ix,iy,iw,ih):correr(ix,iy,iw,ih));
  else if(k==='giro'||k==='portinhola') giro(ix,iy,iw,ih,'giro');
  else if(k==='pivo') giro(ix,iy,iw,ih,'pivo');
  else if(k==='vaivem') giro(ix,iy,iw,ih,'vaivem');
  else if(k==='camarao') camarao(ix,iy,iw,ih);
  else if(k==='guilhotina') guilhotina(ix,iy,iw,ih);
  else {
   const rows=[];const R0=s.rows;
   for(let r=0;r<R0;r++){
    let t= k==='maxim'?'max':(k==='basc'?'basc':(k==='pivjan'?'piv':(s.base==='rip'?'rip':(s.base==='lb'?'lb':(s.base==='vz'?'vz':'fixa')))));
    if(k==='maxim'&&s.efixo){ t=(s.quadros.length? s.quadros.includes(r+1) : r===R0-1)?'max':'fixa'; }
    if(k==='maxim'&&s.qmax){ t=(r%2===0)?'max':'fixa'; }
    if(k==='basc'&&R0===1) t='basc';
    rows.push(t);
   }
   if(/PEITORIL FIXO DE VENEZIANA/.test(s.d)) rows[rows.length-1]='vz';
   grid(ix,iy,iw,ih,k,rows);
  }
 }
 push('</g>');
 if(opt.contexto&&!opt.foto&&!isDoor&&!['fachada','brise','revest','guarda'].includes(k)) R(X0-90,Y0+H,W+180,46,`url(#${p}sill)`,'rx="6"');
 // canto: segunda face em perspectiva (indicação)
 let body=out.join('');
 const extraW=s.canto&&k==='correr'?W*0.5:0;
 if(opt.foto){ // recorte exato do vão, fundo transparente, para aplicar sobre a foto da obra
  const pw=opt.px||1024, ph=Math.max(64,Math.round(pw*H/(W+extraW)));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}" viewBox="${X0} ${Y0} ${W+extraW} ${H}" preserveAspectRatio="none">${defs}${body}</svg>`; }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW+extraW} ${VBH}" preserveAspectRatio="xMidYMid meet">${defs}${body}</svg>`;
}

function titulo(desc){
 let t=desc.replace(/["“”]/g,'').replace(/\s+\|\s+/g,' · ').replace(/\b0(\d)\b/g,'$1').toLowerCase();
 t=t.replace(/\bn\b/g,'N').replace(/maxim-ar|maxim ar/g,'maxim-ar');
 return t.charAt(0).toUpperCase()+t.slice(1);
}
function categoria(desc){
 const s=parse(desc);
 const m={fachada:'Fachadas',guarda:'Guarda-corpo e sacadas',portao:'Portões',brise:'Brises',revest:'Ripados',camarao:s.porta?'Portas camarão':'Janelas camarão',guilhotina:'Janelas especiais',pivjan:'Janelas especiais',maxim:'Maxim-ar e basculantes',basc:'Maxim-ar e basculantes',correr:s.porta?'Portas de correr':'Janelas de correr',vaivem:'Portas de giro e pivotantes',portinhola:'Janelas especiais',pivo:'Portas de giro e pivotantes',giro:'Portas de giro e pivotantes',fixo:'Painéis fixos'};
 let cat=m[s.kind]||'Outros';
 if(s.base==='rip') cat='Ripados';
 return cat;
}
globalThis.FCTipo={svg:make,parse,titulo,categoria,COR,VID,dims:d=>dims(parse(d)),
 move:d=>{const k=parse(d).kind; return !['fixo','guarda','brise','revest'].includes(k) && (k!=='fachada'||/MAXIM/.test(d)); }};
})();

FCTipo.CATS=["Janelas de correr","Maxim-ar e basculantes","Janelas camarão","Janelas especiais","Portas de correr","Portas camarão","Portas de giro e pivotantes","Painéis fixos","Ripados","Fachadas","Guarda-corpo e sacadas","Portões","Brises"];
FCTipo.LISTA=[{"id":"FC-015","cat":"Janelas de correr","nome":"Janela de correr 2 folhas","desc":"JANELA DE CORRER 02 FOLHAS"},{"id":"FC-016","cat":"Janelas de correr","nome":"Janela de correr 2 folhas com veneziana","desc":"JANELA DE CORRER 02 FOLHAS COM VENEZIANA"},{"id":"FC-017","cat":"Janelas de correr","nome":"Janela de correr 2 folhas · peitoril fixo","desc":"JANELA DE CORRER 02 FOLHAS | PEITORIL FIXO"},{"id":"FC-018","cat":"Janelas de correr","nome":"Janela de correr 2 folhas · bandeira fixa","desc":"JANELA DE CORRER 02 FOLHAS | BANDEIRA FIXA"},{"id":"FC-019","cat":"Janelas de correr","nome":"Janela de correr 2 folhas · bandeira 2 módulos maxim-ar","desc":"JANELA DE CORRER 02 FOLHAS | BANDEIRA 02 MÓDULOS MAXIM-AR"},{"id":"FC-020","cat":"Janelas de correr","nome":"Janela de correr 2 folhas · peitoril e bandeira fixos","desc":"JANELA DE CORRER 02 FOLHAS | PEITORIL E BANDEIRA FIXOS"},{"id":"FC-021","cat":"Janelas de correr","nome":"Janela de correr 2 folhas · peitoril fixo e bandeira maxim-ar","desc":"JANELA DE CORRER 02 FOLHAS | PEITORIL FIXO E BANDEIRA MAXIM-AR"},{"id":"FC-022","cat":"Janelas de correr","nome":"Janela de correr 2 folhas · vidro inferior e veneziana superior","desc":"JANELA DE CORRER 02 FOLHAS | VIDRO INFERIOR E VENEZIANA SUPERIOR"},{"id":"FC-024","cat":"Janelas de correr","nome":"Janela de correr integrada 2 folhas","desc":"JANELA DE CORRER INTEGRADA 02 FOLHAS"},{"id":"FC-027","cat":"Janelas de correr","nome":"Janela de correr integrada 2 folhas móveis · projetante","desc":"JANELA DE CORRER INTEGRADA 02 FOLHAS MÓVEIS | PROJETANTE"},{"id":"FC-028","cat":"Janelas de correr","nome":"Janela de correr 3 folhas","desc":"JANELA DE CORRER 03 FOLHAS"},{"id":"FC-029","cat":"Janelas de correr","nome":"Janela de correr 3 folhas com veneziana","desc":"JANELA DE CORRER 03 FOLHAS COM VENEZIANA"},{"id":"FC-030","cat":"Janelas de correr","nome":"Janela de correr 3 folhas móveis · 1 veneziana ventilada - 1 veneziana cega - 1 vidro","desc":"JANELA DE CORRER 03 FOLHAS MÓVEIS | 01 VENEZIANA VENTILADA - 01 VENEZIANA CEGA - 01 VIDRO"},{"id":"FC-032","cat":"Janelas de correr","nome":"Janela de correr 3 folhas · bandeira fixa","desc":"JANELA DE CORRER 03 FOLHAS | BANDEIRA FIXA"},{"id":"FC-033","cat":"Janelas de correr","nome":"Janela de correr 3 folhas · peitoril fixo","desc":"JANELA DE CORRER 03 FOLHAS | PEITORIL FIXO"},{"id":"FC-034","cat":"Janelas de correr","nome":"Janela de correr 3 folhas móveis · 2 vidro - 1 tela · peitoril fixo","desc":"JANELA DE CORRER 03 FOLHAS MÓVEIS | 02 VIDRO - 01 TELA | PEITORIL FIXO"},{"id":"FC-036","cat":"Janelas de correr","nome":"Janela de correr integrada 3 folhas","desc":"JANELA DE CORRER INTEGRADA 03 FOLHAS"},{"id":"FC-038","cat":"Janelas de correr","nome":"Janela de correr 3 folhas · bandeira e peitoril fixos","desc":"JANELA DE CORRER 03 FOLHAS | BANDEIRA E PEITORIL FIXOS"},{"id":"FC-041","cat":"Janelas de correr","nome":"Janela de correr 4 folhas sequênciais","desc":"JANELA DE CORRER 04 FOLHAS SEQUÊNCIAIS"},{"id":"FC-042","cat":"Janelas de correr","nome":"Janela de correr 4 folhas com veneziana","desc":"JANELA DE CORRER 04 FOLHAS COM VENEZIANA"},{"id":"FC-046","cat":"Janelas de correr","nome":"Janela de correr 4 folhas · peitoril fixo","desc":"JANELA DE CORRER 04 FOLHAS | PEITORIL FIXO"},{"id":"FC-047","cat":"Janelas de correr","nome":"Janela de correr 4 folhas · bandeira fixa","desc":"JANELA DE CORRER 04 FOLHAS | BANDEIRA FIXA"},{"id":"FC-050","cat":"Janelas de correr","nome":"Janela de correr 4 folhas · bandeira maxim-ar","desc":"JANELA DE CORRER 04 FOLHAS | BANDEIRA MAXIM-AR"},{"id":"FC-051","cat":"Janelas de correr","nome":"Janela de correr integrada 4 folhas","desc":"JANELA DE CORRER INTEGRADA 04 FOLHAS"},{"id":"FC-052","cat":"Janelas de correr","nome":"Janela de correr de canto 4 folhas","desc":"JANELA DE CORRER DE CANTO 04 FOLHAS"},{"id":"FC-057","cat":"Janelas de correr","nome":"Janela de correr 6 folhas","desc":"JANELA DE CORRER 06 FOLHAS"},{"id":"FC-058","cat":"Janelas de correr","nome":"Janela de correr 6 folhas com veneziana","desc":"JANELA DE CORRER 06 FOLHAS COM VENEZIANA"},{"id":"FC-060","cat":"Janelas de correr","nome":"Janela de correr 6 folhas · 4 vidro - 2 tela","desc":"JANELA DE CORRER 06 FOLHAS | 04 VIDRO - 02 TELA"},{"id":"FC-061","cat":"Janelas de correr","nome":"Janela de correr 6 folhas · bandeira fixa","desc":"JANELA DE CORRER 06 FOLHAS | BANDEIRA FIXA"},{"id":"FC-062","cat":"Janelas de correr","nome":"Janela de correr 6 folhas · peitoril fixo","desc":"JANELA DE CORRER 06 FOLHAS | PEITORIL FIXO"},{"id":"FC-065","cat":"Janelas de correr","nome":"Janela de correr 8 folhas","desc":"JANELA DE CORRER 08 FOLHAS"},{"id":"FC-008","cat":"Maxim-ar e basculantes","nome":"Basculante com módulos horizontais e módulos verticais · peitoril fixo","desc":"BASCULANTE COM MÓDULOS HORIZONTAIS E MÓDULOS VERTICAIS | PEITORIL FIXO"},{"id":"FC-010","cat":"Maxim-ar e basculantes","nome":"Basculante com módulos horizontais e módulos verticais","desc":"BASCULANTE COM MÓDULOS HORIZONTAIS E MÓDULOS VERTICAIS"},{"id":"FC-076","cat":"Maxim-ar e basculantes","nome":"Maxim-ar com N módulos horizontais","desc":"MAXIM-AR COM \"N\" MÓDULOS HORIZONTAIS"},{"id":"FC-078","cat":"Maxim-ar e basculantes","nome":"Maxim-ar com N módulos horizontais e 2 módulos verticais","desc":"MAXIM-AR COM \"N\" MÓDULOS HORIZONTAIS E 02 MÓDULOS VERTICAIS"},{"id":"FC-082","cat":"Maxim-ar e basculantes","nome":"Maxim-ar com N módulos horizontais e 3 módulos verticais","desc":"MAXIM-AR COM \"N\" MÓDULOS HORIZONTAIS E 03 MÓDULOS VERTICAIS"},{"id":"FC-087","cat":"Maxim-ar e basculantes","nome":"Maxim-ar com N módulos horizontais e 4 módulos verticais","desc":"MAXIM-AR COM \"N\" MÓDULOS HORIZONTAIS E 04 MÓDULOS VERTICAIS"},{"id":"FC-094","cat":"Maxim-ar e basculantes","nome":"Maxim-ar com N módulos horizontais e 5 módulos verticais","desc":"MAXIM-AR COM \"N\" MÓDULOS HORIZONTAIS E 05 MÓDULOS VERTICAIS"},{"id":"FC-068","cat":"Janelas camarão","nome":"Janela camarão 2 folhas · fechamento lateral","desc":"JANELA CAMARÃO 02 FOLHAS | FECHAMENTO LATERAL"},{"id":"FC-069","cat":"Janelas camarão","nome":"Janela camarão 2 folhas · veneziana · fechamento lateral","desc":"JANELA CAMARÃO 02 FOLHAS | VENEZIANA | FECHAMENTO LATERAL"},{"id":"FC-070","cat":"Janelas camarão","nome":"Janela camarão 4 folhas · fechamento central","desc":"JANELA CAMARÃO 04 FOLHAS | FECHAMENTO CENTRAL"},{"id":"FC-071","cat":"Janelas camarão","nome":"Janela camarão 4 folhas · veneziana · fechamento central","desc":"JANELA CAMARÃO 04 FOLHAS | VENEZIANA | FECHAMENTO CENTRAL"},{"id":"FC-072","cat":"Janelas camarão","nome":"Janela camarão 6 folhas · fechamento lateral","desc":"JANELA CAMARÃO 06 FOLHAS | FECHAMENTO LATERAL"},{"id":"FC-073","cat":"Janelas camarão","nome":"Janela camarão 6 folhas · veneziana · fechamento lateral","desc":"JANELA CAMARÃO 06 FOLHAS | VENEZIANA | FECHAMENTO LATERAL"},{"id":"FC-074","cat":"Janelas especiais","nome":"Janela guilhotina 2 folhas","desc":"JANELA GUILHOTINA 02 FOLHAS"},{"id":"FC-075","cat":"Janelas especiais","nome":"Janela pivotante com N módulos horizontais","desc":"JANELA PIVOTANTE COM \"N\" MÓDULOS HORIZONTAIS"},{"id":"FC-197","cat":"Janelas especiais","nome":"Portinhola de giro 1 folha","desc":"PORTINHOLA DE GIRO 01 FOLHA"},{"id":"FC-198","cat":"Janelas especiais","nome":"Portinhola de giro 2 folhas","desc":"PORTINHOLA DE GIRO 02 FOLHAS"},{"id":"FC-199","cat":"Janelas especiais","nome":"Portinhola de giro 1 folha com veneziana","desc":"PORTINHOLA DE GIRO 01 FOLHA COM VENEZIANA"},{"id":"FC-200","cat":"Janelas especiais","nome":"Portinhola de giro 2 folhas com veneziana","desc":"PORTINHOLA DE GIRO 02 FOLHAS COM VENEZIANA"},{"id":"FC-100","cat":"Portas de correr","nome":"Porta de correr 2 folhas","desc":"PORTA DE CORRER 02 FOLHAS"},{"id":"FC-101","cat":"Portas de correr","nome":"Porta de correr 2 folhas · vidro superior e veneziana inferior","desc":"PORTA DE CORRER 02 FOLHAS | VIDRO SUPERIOR E VENEZIANA INFERIOR"},{"id":"FC-102","cat":"Portas de correr","nome":"Porta de correr 2 folhas · veneziana","desc":"PORTA DE CORRER 02 FOLHAS | VENEZIANA"},{"id":"FC-112","cat":"Portas de correr","nome":"Porta de correr 3 folhas","desc":"PORTA DE CORRER 03 FOLHAS"},{"id":"FC-113","cat":"Portas de correr","nome":"Porta de correr 3 folhas · vidro superior e veneziana inferior","desc":"PORTA DE CORRER 03 FOLHAS | VIDRO SUPERIOR E VENEZIANA INFERIOR"},{"id":"FC-114","cat":"Portas de correr","nome":"Porta de correr 3 folhas · veneziana","desc":"PORTA DE CORRER 03 FOLHAS | VENEZIANA"},{"id":"FC-120","cat":"Portas de correr","nome":"Porta de correr 3 folhas · bandeira maxim-ar","desc":"PORTA DE CORRER 03 FOLHAS | BANDEIRA MAXIM-AR"},{"id":"FC-122","cat":"Portas de correr","nome":"Porta de correr 3 folhas · lambri duplo","desc":"PORTA DE CORRER 03 FOLHAS | LAMBRI DUPLO"},{"id":"FC-123","cat":"Portas de correr","nome":"Porta de correr 3 folhas · 1 fixa central - 2 laterais móveis","desc":"PORTA DE CORRER 03 FOLHAS | 01 FIXA CENTRAL - 02 LATERAIS MÓVEIS"},{"id":"FC-124","cat":"Portas de correr","nome":"Porta de correr 4 folhas","desc":"PORTA DE CORRER 04 FOLHAS"},{"id":"FC-125","cat":"Portas de correr","nome":"Porta de correr 4 folhas em 4 planos","desc":"PORTA DE CORRER 04 FOLHAS EM 04 PLANOS"},{"id":"FC-126","cat":"Portas de correr","nome":"Porta de correr 4 folhas · veneziana","desc":"PORTA DE CORRER 04 FOLHAS | VENEZIANA"},{"id":"FC-133","cat":"Portas de correr","nome":"Porta de correr 4 folhas · vidro superior e veneziana inferior","desc":"PORTA DE CORRER 04 FOLHAS | VIDRO SUPERIOR E VENEZIANA INFERIOR"},{"id":"FC-135","cat":"Portas de correr","nome":"Porta de correr de canto 4 folhas","desc":"PORTA DE CORRER DE CANTO 04 FOLHAS"},{"id":"FC-005","cat":"Portas camarão","nome":"Porta camarão 2 folhas com travessa · veneziana","desc":"PORTA CAMARÃO 2 FOLHAS COM TRAVESSA | VENEZIANA"},{"id":"FC-153","cat":"Portas camarão","nome":"Porta camarão 2 folhas","desc":"PORTA CAMARÃO 02 FOLHAS"},{"id":"FC-155","cat":"Portas camarão","nome":"Porta camarão 4 folhas · fech lateral","desc":"PORTA CAMARÃO 04 FOLHAS | FECH LATERAL"},{"id":"FC-156","cat":"Portas camarão","nome":"Porta camarão 4 folhas · fechamento central","desc":"PORTA CAMARÃO 04 FOLHAS | FECHAMENTO CENTRAL"},{"id":"FC-225","cat":"Portas camarão","nome":"Porta camarão 8 folhas · fechamento lateral","desc":"PORTA CAMARÃO 08 FOLHAS | FECHAMENTO LATERAL"},{"id":"FC-160","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha","desc":"PORTA DE GIRO 01 FOLHA"},{"id":"FC-161","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha com vidro superior e veneziana inferior","desc":"PORTA DE GIRO 01 FOLHA COM VIDRO SUPERIOR E VENEZIANA INFERIOR"},{"id":"FC-162","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha com veneziana","desc":"PORTA DE GIRO 01 FOLHA COM VENEZIANA"},{"id":"FC-163","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha com vidro superior e lambri inferior","desc":"PORTA DE GIRO 01 FOLHA COM VIDRO SUPERIOR E LAMBRI INFERIOR"},{"id":"FC-164","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha com lambri","desc":"PORTA DE GIRO 01 FOLHA COM LAMBRI"},{"id":"FC-165","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha · fechamento com tela mosquiteiro","desc":"PORTA DE GIRO 1 FOLHA | FECHAMENTO COM TELA MOSQUITEIRO"},{"id":"FC-166","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha · bandeira fixa","desc":"PORTA DE GIRO 01 FOLHA | BANDEIRA FIXA"},{"id":"FC-167","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha · bandeira veneziana","desc":"PORTA DE GIRO 01 FOLHA | BANDEIRA VENEZIANA"},{"id":"FC-168","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha com veneziana · bandeira fixa","desc":"PORTA DE GIRO 01 FOLHA COM VENEZIANA | BANDEIRA FIXA"},{"id":"FC-170","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha com veneziana · bandeira maxim-ar","desc":"PORTA DE GIRO 01 FOLHA COM VENEZIANA | BANDEIRA MAXIM-AR"},{"id":"FC-171","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha · fixo lateral","desc":"PORTA DE GIRO 01 FOLHA | FIXO LATERAL"},{"id":"FC-172","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha com fixo lateral · veneziana","desc":"PORTA DE GIRO 1 FOLHA COM FIXO LATERAL | VENEZIANA"},{"id":"FC-173","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha com fixo lateral · lambri horizontal","desc":"PORTA DE GIRO 1 FOLHA COM FIXO LATERAL | LAMBRI HORIZONTAL"},{"id":"FC-174","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha · fixos laterais","desc":"PORTA DE GIRO 01 FOLHA | FIXOS LATERAIS"},{"id":"FC-175","cat":"Portas de giro e pivotantes","nome":"Porta de giro 2 folhas","desc":"PORTA DE GIRO 02 FOLHAS"},{"id":"FC-176","cat":"Portas de giro e pivotantes","nome":"Porta de giro 2 folhas com vidro superior e veneziana inferior","desc":"PORTA DE GIRO 02 FOLHAS COM VIDRO SUPERIOR E VENEZIANA INFERIOR"},{"id":"FC-177","cat":"Portas de giro e pivotantes","nome":"Porta de giro 2 folhas com veneziana","desc":"PORTA DE GIRO 02 FOLHAS COM VENEZIANA"},{"id":"FC-178","cat":"Portas de giro e pivotantes","nome":"Porta de giro 2 folhas com vidro superior e lambri inferior","desc":"PORTA DE GIRO 02 FOLHAS COM VIDRO SUPERIOR E LAMBRI INFERIOR"},{"id":"FC-179","cat":"Portas de giro e pivotantes","nome":"Porta de giro 2 folhas com lambri","desc":"PORTA DE GIRO 02 FOLHAS COM LAMBRI"},{"id":"FC-180","cat":"Portas de giro e pivotantes","nome":"Porta de giro 2 folhas · bandeira fixa","desc":"PORTA DE GIRO 02 FOLHAS | BANDEIRA FIXA"},{"id":"FC-181","cat":"Portas de giro e pivotantes","nome":"Porta de giro 2 folhas · veneziana · bandeira fixa","desc":"PORTA DE GIRO 02 FOLHAS | VENEZIANA | BANDEIRA FIXA"},{"id":"FC-182","cat":"Portas de giro e pivotantes","nome":"Porta pivotante 1 folha","desc":"PORTA PIVOTANTE 01 FOLHA"},{"id":"FC-184","cat":"Portas de giro e pivotantes","nome":"Porta pivotante 1 folha com veneziana","desc":"PORTA PIVOTANTE 01 FOLHA COM VENEZIANA"},{"id":"FC-185","cat":"Portas de giro e pivotantes","nome":"Porta pivotante 1 folha com vidro superior e lambri inferior","desc":"PORTA PIVOTANTE 01 FOLHA COM VIDRO SUPERIOR E LAMBRI INFERIOR"},{"id":"FC-186","cat":"Portas de giro e pivotantes","nome":"Porta pivotante 1 folha com lambri","desc":"PORTA PIVOTANTE 01 FOLHA COM LAMBRI"},{"id":"FC-188","cat":"Portas de giro e pivotantes","nome":"Porta pivotante 1 folha · bandeira fixa","desc":"PORTA PIVOTANTE 01 FOLHA | BANDEIRA FIXA"},{"id":"FC-190","cat":"Portas de giro e pivotantes","nome":"Porta pivotante 1 folha · bandeira maxim-ar","desc":"PORTA PIVOTANTE 01 FOLHA | BANDEIRA MAXIM-AR"},{"id":"FC-191","cat":"Portas de giro e pivotantes","nome":"Porta pivotante 1 folha com lambri · vitrô lateral","desc":"PORTA PIVOTANTE 01 FOLHA COM LAMBRI | VITRÔ LATERAL"},{"id":"FC-192","cat":"Portas de giro e pivotantes","nome":"Porta pivotante 2 folhas","desc":"PORTA PIVOTANTE 02 FOLHAS"},{"id":"FC-193","cat":"Portas de giro e pivotantes","nome":"Porta pivotante 2 folhas com vidro superior e veneziana inferior","desc":"PORTA PIVOTANTE 02 FOLHAS COM VIDRO SUPERIOR E VENEZIANA INFERIOR"},{"id":"FC-204","cat":"Portas de giro e pivotantes","nome":"Porta vai e vem 2 folhas · veneziana inferior - vidro superior","desc":"PORTA VAI E VEM 02 FOLHAS | VENEZIANA INFERIOR - VIDRO SUPERIOR"},{"id":"FC-228","cat":"Portas de giro e pivotantes","nome":"Porta de giro 1 folha · fixo lateral com bandeira 2 maxim-ar","desc":"PORTA DE GIRO 01 FOLHA | FIXO LATERAL COM BANDEIRA 02 MAXIM-AR"},{"id":"FC-229","cat":"Portas de giro e pivotantes","nome":"Porta de giro 2 folhas · fixos nas laterais","desc":"PORTA DE GIRO 02 FOLHAS | FIXOS NAS LATERAIS"},{"id":"FC-230","cat":"Portas de giro e pivotantes","nome":"Porta de giro 2 folhas · fixos nas laterais com bandeira fixa","desc":"PORTA DE GIRO 02 FOLHAS | FIXOS NAS LATERAIS COM BANDEIRA FIXA"},{"id":"FC-233","cat":"Portas de giro e pivotantes","nome":"Porta pivotante 1 folha · fixo esquerdo e fixo direito","desc":"PORTA PIVOTANTE 01 FOLHA | FIXO ESQUERDO E FIXO DIREITO"},{"id":"FC-002","cat":"Painéis fixos","nome":"Painel fixo com N Número de módulos · veneziana · marco largo","desc":"PAINEL FIXO COM \"N\" NÚMERO DE MÓDULOS | VENEZIANA | MARCO LARGO"},{"id":"FC-003","cat":"Painéis fixos","nome":"Painel fixo modelo veneziana · sem marco","desc":"PAINEL FIXO MODELO VENEZIANA | SEM MARCO"},{"id":"FC-007","cat":"Painéis fixos","nome":"Painel fixo em lambri · marco simples","desc":"PAINEL FIXO EM LAMBRI | MARCO SIMPLES"},{"id":"FC-011","cat":"Painéis fixos","nome":"Painel fixo com módulos horizontais","desc":"PAINEL FIXO COM MÓDULOS HORIZONTAIS"},{"id":"FC-012","cat":"Painéis fixos","nome":"Painel fixo com módulos horizontais e 2 módulos verticais","desc":"PAINEL FIXO COM MÓDULOS HORIZONTAIS E 02 MÓDULOS VERTICAIS"},{"id":"FC-187","cat":"Ripados","nome":"Porta pivotante 1 folha · lambri rípado","desc":"PORTA PIVOTANTE 01 FOLHA | LAMBRI RÍPADO"},{"id":"FC-242","cat":"Ripados","nome":"Módulo fixo ripado","desc":"MÓDULO FIXO RIPADO"},{"id":"FC-243","cat":"Ripados","nome":"Porta pivotante com lambri ripado","desc":"PORTA PIVOTANTE COM LAMBRI RIPADO"},{"id":"FC-245","cat":"Ripados","nome":"Revestimento de parede com lambri ripado","desc":"REVESTIMENTO DE PAREDE COM LAMBRI RIPADO"},{"id":"FC-235","cat":"Fachadas","nome":"Fachada pele de vidro modelo frontal","desc":"FACHADA PELE DE VIDRO MODELO FRONTAL"},{"id":"FC-239","cat":"Fachadas","nome":"Fachada N módulos - com maxim-ar e bandeira fixa","desc":"FACHADA \"N\" MÓDULOS - COM MAXIM AR E BANDEIRA FIXA"},{"id":"FC-241","cat":"Fachadas","nome":"Fachada N módulos - com maxim-ar e peitoril e bandeira dupla fixa","desc":"FACHADA \"N\" MÓDULOS - COM MAXIM AR E PEITORIL E BANDEIRA DUPLA FIXA"},{"id":"FC-248","cat":"Guarda-corpo e sacadas","nome":"Guarda-corpo frontal · fechamento em vidro · corrimão","desc":"GUARDA-CORPO FRONTAL | FECHAMENTO EM VIDRO | CORRIMÃO"},{"id":"FC-251","cat":"Guarda-corpo e sacadas","nome":"Escada · guarda-corpo de vidro com torre","desc":"ESCADA | GUARDA-CORPO DE VIDRO COM TORRE"},{"id":"FC-252","cat":"Guarda-corpo e sacadas","nome":"Gradil piscina","desc":"GRADIL PISCINA"},{"id":"FC-253","cat":"Portões","nome":"Portão social com lambri","desc":"PORTÃO SOCIAL COM LAMBRI"},{"id":"FC-254","cat":"Portões","nome":"Portão social com veneziana","desc":"PORTÃO SOCIAL COM VENEZIANA"},{"id":"FC-255","cat":"Portões","nome":"Portão social com tubo retangular","desc":"PORTÃO SOCIAL COM TUBO RETANGULAR"},{"id":"FC-256","cat":"Portões","nome":"Portão social com vidro","desc":"PORTÃO SOCIAL COM VIDRO"},{"id":"FC-257","cat":"Portões","nome":"Portão social com lambri central e tubo superior e inferior","desc":"PORTÃO SOCIAL COM LAMBRI CENTRAL E TUBO SUPERIOR E INFERIOR"},{"id":"FC-258","cat":"Brises","nome":"Brise vertical","desc":"BRISE VERTICAL"}];
