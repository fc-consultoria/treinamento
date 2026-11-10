// relógio manual: 1 quadro de animação por quadro de vídeo
(() => {
  let agora = 1000; const fila = []; const t0 = Date.now();
  window.requestAnimationFrame = cb => { fila.push(cb); return fila.length; };
  window.cancelAnimationFrame = () => {};
  performance.now = () => agora;
  const D = Date; window.Date = class extends D { constructor(...a) { if (a.length) super(...a); else super(t0 + agora); } static now() { return t0 + agora; } };
  const st = window.setTimeout; const timers = [];
  window.setTimeout = (f, ms = 0, ...a) => { const id = Math.random(); timers.push({ id, at: agora + ms, f: () => f(...a) }); return id; };
  window.clearTimeout = id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); };
  window.__tick = (ms) => { agora += ms; timers.sort((a, b) => a.at - b.at);
    while (timers.length && timers[0].at <= agora) { const t = timers.shift(); try { t.f(); } catch (e) { console.error(e); } }
    const cbs = fila.splice(0); cbs.forEach(cb => { try { cb(agora); } catch (e) { console.error(e); } }); return agora; };
})();
