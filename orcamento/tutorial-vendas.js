/* Tutorial guiado do Painel de Vendas (vendedor e gestor/coordenação), com FCTour (../tour-fc.js).
   Botão "▶ Tutorial" na barra de abas; abre sozinho na primeira entrada de cada vendedor. */
(function(){
const T={
 novo:'Em Novo orçamento você escolhe os itens, a quantidade e a cor, preenche os dados do cliente e a forma de pagamento. O desconto tem um limite: acima dele, o pedido vai para a coordenação aprovar.',
 lista:'Aqui ficam os orçamentos e pedidos. Abra um para editar, enviar ao cliente, marcar a negociação ou fechar o pedido.',
 atd:'Em Atendimentos do site chegam os clientes que montaram a cotação no catálogo. É uma fila geral: o primeiro vendedor que assumir atende o cliente.',
 cli:'Em Clientes do site ficam os cadastros feitos pelo catálogo.',
 cest:'Na Consulta de estoque você confere se o item tem estoque antes de combinar prazo com o cliente.',
 cat:'O Catálogo mostra os perfis com foto, medidas e peso para apresentar ao cliente. As medidas são de referência: confirme com o fornecedor.',
 t3d:'Na Esquadria 3D você estuda e mostra as esquadrias em 3D, peça por peça.',
 mos:'O Mostruário 3D é o guia de consulta de esquadrias, para tirar dúvidas durante o atendimento.',
 msc:'No Monte sua casa você coloca as esquadrias na planta e apresenta o projeto ao cliente.',
 com:'Em Resultados você vê o desempenho da equipe no período: orçamentos, pedidos fechados, conversão e ranking dos vendedores.',
 apr:'Em Aprovar pedidos ficam os pedidos fechados que aguardam a aprovação do financeiro.',
 dsc:'Em Descontos para aprovar chegam os pedidos de desconto acima do limite. Ao aprovar, o desconto entra no orçamento na hora.',
 vend:'Em Vendedores você vê a equipe e o que cada um está fazendo.'};
const gestor=()=>!new URLSearchParams(location.search).get('v');
const chave=()=>'orc-tut-v1-'+(new URLSearchParams(location.search).get('v')||new URLSearchParams(location.search).get('k')||'x').slice(0,12);
function iniciar(){if(!window.FCTour)return;
  const g=gestor(),passos=[[null,g?'Este é o Painel de Vendas Atacado na visão de gestão. Vou mostrar cada aba.':'Este é o seu Painel de Vendas. Aqui você monta os orçamentos, acompanha os pedidos e atende os clientes do catálogo. Vou mostrar cada aba.']];
  document.querySelectorAll('.abas [data-ab]').forEach(b=>{const t=T[b.dataset.ab];if(t)passos.push(['.abas [data-ab="'+b.dataset.ab+'"]',t]);});
  if(document.getElementById('supTab'))passos.push(['#supTab','Ficou com dúvida? Toque aqui para falar com o suporte da FC.']);
  else if(document.getElementById('gFC'))passos.push(['#gFC','Ficou com dúvida? Toque em Falar com a FC: o pedido fica registrado em Solicitações.']);
  passos.push(['#tutVend','Para rever este tutorial, toque em Tutorial quando quiser.']);
  FCTour.iniciar({titulo:'Tutorial · '+(g?'Gestão de vendas':'Vendedor'),passos,cor:'#5b3fc4',aoFim:()=>{try{localStorage.setItem(chave(),'1');}catch(_){}}});}
let auto=false;
window.VTUT=function(){const a=document.querySelector('.abas');if(!a||document.getElementById('tutVend'))return;
  const b=document.createElement('button');b.type='button';b.id='tutVend';b.textContent='▶ Tutorial';b.title='Passo a passo desta tela, com legenda e voz';b.onclick=iniciar;a.appendChild(b);
  if(!auto&&!gestor()){auto=true;let v='1';try{v=localStorage.getItem(chave());}catch(_){}if(!v)setTimeout(()=>{if(!FCTour.ativo())iniciar();},1200);}};
})();
