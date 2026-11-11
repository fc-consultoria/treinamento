/* Linha Family 32 · modelo de licença Arkial · Desenvolvido por FC Consultoria em Esquadria
   Lê o bloco MARCA do início da página e aplica em tudo: cores, logo, nome, rodapé e chaves dos dados.
   NÃO precisa editar este arquivo para trocar de licenciado: edite só o bloco MARCA da página. */
(function () {
  var M = window.MARCA || {};
  M.nome = M.nome || 'Licenciado';
  M.revenda = M.revenda || M.nome;
  M.cor = M.cor || '#3f5566';
  M.logo = M.logo || (M.nome.toUpperCase() + ' · Linha Family 32');
  M.rodape = M.rodape || ('Linha Family 32 · ' + M.nome + ' · Desenvolvido por FC Consultoria em Esquadria');
  M.prefixo = M.prefixo || 'fam_';
  M.banco = M.banco || 'family-obras';

  function rgb(h) { h = String(h).replace('#', ''); if (h.length === 3) h = h.replace(/./g, function (c) { return c + c; });
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16) || 0; }); }
  function mix(a, b, t) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }); }
  function hex(c) { return '#' + c.map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join(''); }
  var C = rgb(M.cor), B = [255, 255, 255], P = [0, 0, 0];
  /* tons tirados da cor principal (claro = mistura com branco, escuro = mistura com preto) */
  var T = {
    cor: C,
    viva: mix(C, B, .18),        /* botão em destaque (topo do degradê) */
    escura: mix(C, P, .28),      /* degradê, texto forte */
    texto: mix(C, P, .42),       /* títulos coloridos sobre fundo claro */
    funda: mix(C, P, .62),       /* cabeçalho e fundos escuros */
    funda2: mix(C, P, .5),
    palco: mix(C, P, .78),       /* fundo do palco 3D */
    tinta: mix(C, P, .72),       /* texto principal */
    suave: mix(mix(C, [128, 128, 128], .6), P, .15),
    bordaEscura: mix(C, P, .38),
    clara: mix(C, B, .55),       /* detalhes claros sobre fundo escuro */
    creme: mix(C, B, .86),
    linha: mix(C, B, .78),
    borda: mix(C, B, .86),
    borda2: mix(C, B, .72),
    fundo: mix(C, B, .94),
    papel: mix(C, B, .96),
    base: mix(C, B, .975)
  };
  M.tom = {}; var css = '';
  Object.keys(T).forEach(function (k) {
    var nome = '--m-' + k.replace(/[A-Z]/g, function (x) { return '-' + x.toLowerCase(); });
    M.tom[k] = hex(T[k]);
    css += nome + ':' + hex(T[k]) + ';' + nome + '-rgb:' + T[k].join(' ') + ';';
  });
  M.rgba = function (a, k) { return 'rgba(' + T[k || 'cor'].join(',') + ',' + a + ')'; };
  M.sigla = M.sigla || (function () { var p = M.nome.trim().split(/\s+/);
    return (p.length > 1 ? p.slice(0, 3).map(function (w) { return w[0]; }).join('') : p[0].slice(0, 3)).toUpperCase(); })();
  M.arquivo = M.nome.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'Family';
  M.ls = function (k) { return M.prefixo + k; };

  /* modo escuro do simulador: cor muito escura some no fundo escuro, então clareia um pouco */
  function lum(c) { return c.map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); })
    .reduce(function (s, v, i) { return s + v * [.2126, .7152, .0722][i]; }, 0); }
  var esc = '', Cd = C, t = 0; while (lum(Cd) < .2 && t < .6) { t += .05; Cd = mix(C, B, t); }
  if (t) { [['cor', Cd], ['viva', mix(Cd, B, .18)], ['escura', mix(Cd, P, .25)]].forEach(function (p) {
    esc += '--m-' + p[0] + ':' + hex(p[1]) + ';--m-' + p[0] + '-rgb:' + p[1].join(' ') + ';'; }); }
  var st = document.createElement('style'); st.id = 'marcaCores'; st.textContent = ':root{' + css + '}' + (esc ? 'html.dark{' + esc + '}' : '');
  document.head.appendChild(st);
  function meta(n, v, prop) { var m = document.querySelector('meta[' + (prop ? 'property' : 'name') + '="' + n + '"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute(prop ? 'property' : 'name', n); document.head.appendChild(m); } m.setAttribute('content', v); }
  M.meta = meta;
  /* textos marcados com data-marca="nome|logo|rodape|sigla|revenda" */
  M.aplicar = function () {
    document.querySelectorAll('[data-marca]').forEach(function (e) { var v = M[e.getAttribute('data-marca')]; if (v != null) e.textContent = v; });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', M.aplicar); else M.aplicar();
  window.MARCA = M;
})();
