// Gera uma "foto de obra" em 3D (three.js já está carregado no simulador) e devolve
// { url: dataURL JPEG, cantos: [4 pontos do vão em px da imagem: sup-esq, sup-dir, inf-dir, inf-esq] }
window.fcFotoObra = function (tipo) {
  const W = 1600, H = 1000;
  const T = THREE;
  const r = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setSize(W, H, false); r.setPixelRatio(1);
  if (r.outputEncoding !== undefined && T.sRGBEncoding) r.outputEncoding = T.sRGBEncoding;
  const cena = new T.Scene(); cena.background = new T.Color(0xcfd8de);
  const cam = new T.PerspectiveCamera(52, W / H, 0.05, 200);

  // ---- texturas procedurais ----
  function tex(w, h, pinta, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; pinta(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; t.anisotropy = 8; return t; }
  let seed = tipo === 'sala' ? 7 : 19; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function ruido(g, w, h, base, amp, n) { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { const a = (rnd() - 0.5) * amp; g.fillStyle = a > 0 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${-a})`; const s = 1 + rnd() * 3; g.fillRect(rnd() * w, rnd() * h, s, s); } }
  const reboco = tex(512, 512, (g, w, h) => { ruido(g, w, h, tipo === 'sala' ? '#d6cab6' : '#cdbfa8', 0.10, 26000); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(120,100,80,${0.02 + rnd() * 0.03})`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 20 + rnd() * 60, 10 + rnd() * 40, rnd() * 3, 0, 7); g.fill(); } }, [3, 2]);
  const piso = tex(512, 512, (g, w, h) => { ruido(g, w, h, '#a39a8c', 0.10, 20000); g.strokeStyle = 'rgba(90,80,70,.35)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); } }, [3, 3]);
  const tijolo = tex(512, 512, (g, w, h) => { g.fillStyle = '#8a8178'; g.fillRect(0, 0, w, h); const bh = 32, bw = 96; for (let y = 0, k = 0; y < h; y += bh, k++) for (let x = -(k % 2) * bw / 2; x < w; x += bw) { const c = 150 + rnd() * 40 | 0; g.fillStyle = `rgb(${c},${c * 0.55 | 0},${c * 0.4 | 0})`; g.fillRect(x + 3, y + 3, bw - 6, bh - 6); } }, [1, 1]);
  const ceu = tex(1024, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fb2e0'); gr.addColorStop(0.55, '#cfe3f2'); gr.addColorStop(0.62, '#a9c08f'); gr.addColorStop(1, '#6e8a52'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { const x = rnd() * w, y = h * 0.62 - rnd() * 90, rr = 8 + rnd() * 22; g.fillStyle = `rgb(${50 + rnd() * 40 | 0},${95 + rnd() * 40 | 0},${45 + rnd() * 25 | 0})`; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
    for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(255,255,255,.55)'; const x = rnd() * w, y = 40 + rnd() * 120; g.beginPath(); g.ellipse(x, y, 60 + rnd() * 80, 14 + rnd() * 10, 0, 0, 7); g.fill(); } });

  const mat = (m) => new T.MeshStandardMaterial(Object.assign({ roughness: 0.95, metalness: 0 }, m));
  const mParede = mat({ map: reboco }), mPiso = mat({ map: piso, roughness: 0.8 }), mTijolo = mat({ map: tijolo });

  // ---- geometria: parede do fundo (z=0) com vão retangular ----
  const sala = tipo === 'sala';
  const PW = 5.2, PH = 2.8;                       // parede
  const vw = sala ? 2.0 : 1.5, vh = sala ? 2.2 : 1.2, peit = sala ? 0 : 1.0; // vão
  const vx = sala ? 0.1 : -0.15;                   // centro do vão (x)
  const esp = 0.18;
  const forma = new T.Shape(); forma.moveTo(-PW / 2, 0); forma.lineTo(PW / 2, 0); forma.lineTo(PW / 2, PH); forma.lineTo(-PW / 2, PH); forma.lineTo(-PW / 2, 0);
  const furo = new T.Path(); furo.moveTo(vx - vw / 2, peit); furo.lineTo(vx - vw / 2, peit + vh); furo.lineTo(vx + vw / 2, peit + vh); furo.lineTo(vx + vw / 2, peit); furo.lineTo(vx - vw / 2, peit); forma.holes.push(furo);
  const gParede = new T.ShapeGeometry(forma);
  const uv = gParede.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 1.7, uv.getY(i) / 1.4);
  const parede = new T.Mesh(gParede, mParede); cena.add(parede);
  // fundo da parede (lado de fora) e requadro do vão (tijolo aparente = obra)
  const lados = [[vw, esp, vx, peit, 'h'], [vw, esp, vx, peit + vh, 'h'], [esp, vh, vx - vw / 2, peit + vh / 2, 'v'], [esp, vh, vx + vw / 2, peit + vh / 2, 'v']];
  lados.forEach(([a, b, x, y, o]) => { const g = o === 'h' ? new T.PlaneGeometry(a, b) : new T.PlaneGeometry(esp, vh); const m = new T.Mesh(g, mTijolo);
    if (o === 'h') { m.rotation.x = y === peit ? -Math.PI / 2 : Math.PI / 2; m.position.set(x, y, -esp / 2); } else { m.rotation.y = x < vx ? Math.PI / 2 : -Math.PI / 2; m.position.set(x, y, -esp / 2); } cena.add(m); });
  // paredes laterais, piso e teto
  const lat = (x, ry) => { const m = new T.Mesh(new T.PlaneGeometry(6, PH), mParede); m.rotation.y = ry; m.position.set(x, PH / 2, 3); cena.add(m); };
  lat(-PW / 2, Math.PI / 2); lat(PW / 2, -Math.PI / 2);
  const pi = new T.Mesh(new T.PlaneGeometry(PW, 6), mPiso); pi.rotation.x = -Math.PI / 2; pi.position.set(0, 0, 3); cena.add(pi);
  const te = new T.Mesh(new T.PlaneGeometry(PW, 6), mat({ color: 0xf2efe9 })); te.rotation.x = Math.PI / 2; te.position.set(0, PH, 3); cena.add(te);
  // paisagem do lado de fora
  const fora = new T.Mesh(new T.PlaneGeometry(26, 13), new T.MeshBasicMaterial({ map: ceu })); fora.position.set(0, 3.0, -9); cena.add(fora);
  const chao = new T.Mesh(new T.PlaneGeometry(30, 12), mat({ color: 0x7d8f5c })); chao.rotation.x = -Math.PI / 2; chao.position.set(0, -0.02, -6); cena.add(chao);
  // detalhes de obra: balde, saco de argamassa, ripas
  const balde = new T.Mesh(new T.CylinderGeometry(0.15, 0.12, 0.3, 24), mat({ color: 0x5b6670, roughness: 0.6 })); balde.position.set(sala ? 1.7 : -1.6, 0.15, 1.0); cena.add(balde);
  const saco = new T.Mesh(new T.BoxGeometry(0.62, 0.14, 0.42), mat({ color: 0xc8b48a })); saco.position.set(sala ? -1.7 : 1.5, 0.07, 0.9); saco.rotation.y = 0.3; cena.add(saco);
  const saco2 = saco.clone(); saco2.position.y = 0.21; saco2.rotation.y = 0.1; cena.add(saco2);
  const ripa = new T.Mesh(new T.BoxGeometry(0.05, 2.3, 0.08), mat({ color: 0x9c7a4f })); ripa.position.set(sala ? -2.3 : 2.2, 1.12, 0.3); ripa.rotation.z = sala ? -0.18 : 0.2; cena.add(ripa);

  // ---- luz ----
  cena.add(new T.HemisphereLight(0xffffff, 0x9a8a72, 0.62));
  const sol = new T.DirectionalLight(0xfff1dc, 0.55); sol.position.set(-2, 6, -5); cena.add(sol);
  const int = new T.PointLight(0xfff4e6, 0.35, 12); int.position.set(0, 2.4, 3); cena.add(int);

  cam.position.set(sala ? -0.55 : 0.5, 1.45, 4.6); cam.lookAt(sala ? 0.15 : -0.1, sala ? 1.2 : 1.45, 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  r.render(cena, cam);
  const url = r.domElement.toDataURL('image/jpeg', 0.9);
  const proj = (x, y) => { const v = new T.Vector3(x, y, 0).project(cam); return { x: Math.round((v.x + 1) / 2 * W), y: Math.round((1 - v.y) / 2 * H) }; };
  const cantos = [proj(vx - vw / 2, peit + vh), proj(vx + vw / 2, peit + vh), proj(vx + vw / 2, peit), proj(vx - vw / 2, peit)];
  r.dispose();
  return { url, cantos, W, H };
};
