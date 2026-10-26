/* Códigos próprios do cliente (cadastro dele) → código que ele compra na extrusora.
   Ex.: Guaporé PLK544 = Texa TBXL028. Busca sempre sem a cor (PLK544-FCO, PLK544.BCO, PLK544 PTO = PLK544).
   Para cadastrar outro cliente: gerar clientes/<cliente>.json e incluir na lista ARQ. */
(function(){
  const ARQ=[{t:/GUAPOR/,a:'clientes/guapore.json'}];
  const sa=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  const norm=s=>sa(s).replace(/[^A-Z0-9]/g,'');
  const z=c=>c.replace(/\d+/g,d=>String(+d));
  const COR=/[.\-\s_]*(BRANCO|PRETO|FOSCO|NATURAL|BRONZE|BRILHANTE|CEREJEIRA|BCO|PTO|PT0|FCO|NAT|CER|CE|BRZ|BRI|BR)$/;
  let M={},NOME='',ON=false;
  async function liga(nome,todos){
    M={};NOME='';ON=false;
    const L=todos?ARQ:ARQ.filter(x=>x.t.test(sa(nome)));
    for(const x of L){try{const j=await fetch(x.a+'?v=1',{cache:'no-cache'}).then(r=>r.json());
      Object.entries(j.itens||{}).forEach(([k,e])=>{e.cli=j.cliente;(M[z(k)]=M[z(k)]||[]).push(e);});NOME=NOME?NOME+', '+j.cliente:j.cliente;ON=true;}catch(_){}}
    return ON;}
  /* tenta o código como veio, sem a cor e sem o tamanho da barra (-3M/-6M) */
  function acha(q){if(!ON)return [];const u=sa(q).trim();if(!u)return [];
    const tent=[u,u.replace(/[.\-\s]*[36]M$/,''),u.replace(COR,''),u.replace(COR,'').replace(/[.\-\s]*[36]M$/,'')];
    for(const t of tent){const r=M[z(norm(t))];if(r)return r;}
    /* cor colada sem separador só vale se o resto existir (PLK544FCO) */
    const n=norm(u),m=n.match(/^(.*\d)(BCO|PTO|FCO|NAT|CER)$/);if(m&&M[z(m[1])])return M[z(m[1])];
    return [];}
  const cods=q=>acha(q).flatMap(e=>e.f.map(f=>norm(f[1])));
  const todos=()=>Object.values(M).flat().flatMap(e=>e.f.map(f=>norm(f[1])));
  window.FCCli={liga,acha,cods,todos,norm,ativo:()=>ON,nome:()=>NOME};
})();
