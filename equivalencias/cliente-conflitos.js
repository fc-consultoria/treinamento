/* Confere os códigos próprios de um cliente (clientes/<cliente>.json) contra a base de perfis (indice.json).
   Para cada código do cliente compara dois caminhos:
     • pelo código dele (ex.: Guaporé PLK544 → PLK-0544 Perfileve na base)
     • pelo código que ele compra hoje (ex.: Texa TBXL028)
   Situações: ok · conflito (os dois caminhos caem em perfis diferentes) · fora (o código que compra não está na base)
              · solo (achou, mas só 1 fornecedor no grupo, sem comparação) · nao (não achou por nenhum caminho).
   Usado por conferencia-cliente.html. Funciona no navegador (window.FCConflitos) e no node (module.exports). */
(function(raiz){
  const sa=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
  const norm=s=>sa(s).replace(/[^A-Z0-9]/g,'');
  const z=c=>c.replace(/\d+/g,d=>String(+d));
  const REF='alcoa';
  function indexa(IDX,AP){
    const BY={},BYZ={};const add=(c,i)=>{const k=norm(c);if(!k)return;(BY[k]=BY[k]||new Set()).add(i);(BYZ[z(k)]=BYZ[z(k)]||new Set()).add(i);};
    IDX.g.forEach((g,i)=>{g.i=i;const a=AP&&AP[g.l+'|'+g.k];if(Array.isArray(a))g.al=a;
      g.m.forEach(m=>add(m[1],i));if(g.mc)add(g.k,i);(g.al||[]).forEach(c=>add(c,i));});
    return {BY,BYZ};}
  function acha(ix,c){const k=norm(c);if(!k)return [];let s=ix.BY[k];if(!s){/* Texa com T na frente: TVZ051 = VZ-051 */s=ix.BYZ[z(k)];}
    if(!s&&/^T[A-Z]{2}\d/.test(k))s=ix.BY[k.slice(1)]||ix.BYZ[z(k.slice(1))];return s?[...s]:[];}
  const fornecedores=g=>[...new Set(g.m.filter(m=>m[0]!==REF&&m[3]!=='base').map(m=>m[0]))];
  function analisa(IDX,AP,CLI){
    const ix=indexa(IDX,AP);const out=[];
    Object.entries(CLI.itens||{}).forEach(([key,e])=>{if(e.oculto)return;
      const dir=acha(ix,e.c);
      const comp=(e.f||[]).map(f=>({f:f[0],c:f[1],cor:f[2]||'',ids:acha(ix,f[1])}));
      const cid=[...new Set(comp.flatMap(x=>x.ids))];
      let sit;
      if(!dir.length&&!cid.length)sit='nao';
      else if(dir.length&&cid.length&&!dir.some(i=>cid.includes(i)))sit='conflito';
      else if(comp.length&&!cid.length)sit='fora';
      else{const gi=cid.length?cid.filter(i=>!dir.length||dir.includes(i))[0]??cid[0]:dir[0];sit=fornecedores(IDX.g[gi]).length<2?'solo':'ok';}
      out.push({key,c:e.c,p:e.p||null,obs:e.obs||'',cat:!!e.cat,pg:e.pg||'',comp,dir,cid,sit});});
    return out;}
  function imgDe(IDX,g,m){if(m[4])return m[4];if(g.l==='tc')return '';const L=IDX.linhas[g.l];if(!L||!L.img)return '';
    const pasta=(m[3]==='base'&&!g.sp)?'alcoa':m[0];return L.img+pasta+'/'+encodeURIComponent(m[1])+'.webp?v=3';}
  const api={analisa,acha,indexa,imgDe,norm,fornecedores};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else raiz.FCConflitos=api;
})(typeof window!=='undefined'?window:this);
