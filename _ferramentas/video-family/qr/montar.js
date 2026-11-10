// Monta uma obra de 2 ambientes no simulador usando a própria interface (sem atalhos internos)
window.fcMontar = async function (cfg) {
  const $ = id => document.getElementById(id);
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const digita = (id, v) => { const e = $(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
  if (cfg.nova) { $('obraNova').click(); await espera(600); }
  digita('obraNome', cfg.obra); digita('obraCliente', cfg.cliente);
  for (let i = 0; i < cfg.amb.length; i++) {
    const a = cfg.amb[i];
    if (i > 0) { $('ambNovo').click(); await espera(500); }
    digita('ambNome', a.nome);
    const f = fcFotoObra(a.foto);
    const blob = await (await fetch(f.url)).blob();
    const dt = new DataTransfer(); dt.items.add(new File([blob], a.foto + '.jpg', { type: 'image/jpeg' }));
    $('inputGaleria').files = dt.files; $('inputGaleria').dispatchEvent(new Event('change', { bubbles: true }));
    await espera(1200);
    $('btnNovoVaoToolbar').click(); await espera(200);
    const view = $('view'), wrap = $('canvasWrap');
    for (const c of f.cantos) {
      const r = view.getBoundingClientRect(); const k = view.width / f.W;
      const x = r.left + c.x * k * r.width / view.width, y = r.top + c.y * k * r.height / view.height;
      wrap.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, pointerId: 1, bubbles: true, isPrimary: true }));
      wrap.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, pointerId: 1, bubbles: true, isPrimary: true }));
      await espera(150);
    }
    const s = $('selProduto'); s.value = a.produto; s.dispatchEvent(new Event('change', { bubbles: true }));
    await espera(800);
  }
  await espera(2600); // salvamento automático no aparelho
  return { ambientes: document.querySelectorAll('#ambTabs .obra-tab').length, vaos: $('selVao').options.length };
};
window.fcGerarQR = async function (vendedor) {
  const $ = id => document.getElementById(id); const espera = ms => new Promise(r => setTimeout(r, ms));
  $('btnQrCliente').click(); await espera(400);
  $('qrVend').value = vendedor; $('qrGerar').click();
  for (let i = 0; i < 120; i++) { await espera(500); const l = document.querySelector('.qr-link'); if (l) return { ok: true, link: l.textContent }; const m = $('qrMsg'); if (m && m.textContent) return { ok: false, msg: m.textContent }; }
  return { ok: false, msg: 'tempo esgotado' };
};
