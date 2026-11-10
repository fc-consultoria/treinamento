"""Grava o vídeo 'QR para o cliente' (simulador na obra) com relógio controlado: 30 quadros/s exatos."""
import asyncio, json, uuid, subprocess, os, io, sys, mimetypes
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from playwright.async_api import async_playwright

SITE = Path('/home/claude/repo/treinamento/evento-cde')
BASE = 'https://fc-consultoria.github.io/treinamento/evento-cde/'
OUT = Path('/home/claude/demo/cenas'); OUT.mkdir(exist_ok=True)
W, H, FPS = 1920, 1080, 30
DUR = json.load(open('/home/claude/demo/audio/dur.json'))
CANTOS = json.load(open('/home/claude/demo/cantos.json'))
F = lambda w, s: ImageFont.truetype(f'/home/claude/demo/fnt/inter{w}.ttf', s)
SO_CENA = sys.argv[1:]  # opcional: gravar só algumas cenas

LEG = {
 'n2': 'O vendedor dá nome à obra e ao cliente, fotografa o ambiente e marca os 4 cantos do vão.',
 'n3': 'Escolhe a tipologia da Linha Family, que já aparece na foto, abrindo e fechando.',
 'n4': 'Dá para adicionar quantos ambientes quiser. Aqui, o quarto, com uma janela de correr.',
 'n5': 'O vendedor toca em “QR para o cliente”, coloca o nome dele e gera o QR. As fotos sobem em poucos segundos.',
 'n6': 'O cliente lê o QR com a câmera do celular. Sem aplicativo e sem cadastro, a obra abre na hora.',
 'n7': 'Ele toca em “Abrir as esquadrias”, passa pelos ambientes e mostra para a família. O mesmo link também vai pelo WhatsApp.',
}

# ---------------- fundo e moldura ----------------
def fundo():
    im = Image.new('RGB', (W, H), '#1b120d'); d = ImageDraw.Draw(im)
    for y in range(H):
        t = y / H; c = (int(27 + 18 * t), int(18 + 9 * t), int(13 + 4 * t)); d.line([(0, y), (W, y)], fill=c)
    return im
FUNDO = fundo()

def moldura(scr, raio, bez):
    w, h = scr.size; m = Image.new('RGBA', (w + 2 * bez, h + 2 * bez), (0, 0, 0, 0)); d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, w + 2 * bez - 1, h + 2 * bez - 1], raio + bez, fill=(14, 14, 16, 255), outline=(70, 66, 62, 255), width=2)
    mask = Image.new('L', (w, h), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], raio, fill=255)
    m.paste(scr, (bez, bez), mask); return m

_SOMB = {}
def sombra(im, pos, sz, raio):
    k = (pos, sz, raio)
    if k in _SOMB: im.alpha_composite(_SOMB[k]); return
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(s).rounded_rectangle([pos[0] + 10, pos[1] + 24, pos[0] + sz[0] + 10, pos[1] + sz[1] + 24], raio, fill=(0, 0, 0, 150))
    _SOMB[k] = s.filter(ImageFilter.GaussianBlur(26)); im.alpha_composite(_SOMB[k])

def legenda(im, txt):
    if not txt: return
    d = ImageDraw.Draw(im); f = F(600, 34); pal = txt.split(); linhas, cur = [], ''
    for p in pal:
        t = (cur + ' ' + p).strip()
        if d.textlength(t, font=f) > 1500 and cur: linhas.append(cur); cur = p
        else: cur = t
    linhas.append(cur)
    lh = 46; tot = lh * len(linhas) + 26; y0 = H - 22 - tot
    larg = max(d.textlength(l, font=f) for l in linhas) + 60
    d.rounded_rectangle([(W - larg) / 2, y0, (W + larg) / 2, y0 + tot], 18, fill=(10, 7, 5, 215))
    for i, l in enumerate(linhas):
        d.text((W / 2, y0 + 13 + i * lh + lh / 2), l, font=f, fill=(255, 246, 232), anchor='mm')

def toques(im, lista, q, transf):
    o = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(o)
    for (dev, x, y, q0) in lista:
        t = q - q0
        if t < 0 or t > 16 or dev not in transf: continue
        X, Y = transf[dev](x, y)
        r = 16 + t * 2.6; a = int(230 * (1 - t / 16))
        d.ellipse([X - r, Y - r, X + r, Y + r], outline=(255, 140, 50, a), width=5)
        if t < 7: d.ellipse([X - 15, Y - 15, X + 15, Y + 15], fill=(255, 255, 255, 170), outline=(234, 88, 12, 230), width=4)
    im.alpha_composite(o)

def barra_url(w):
    b = Image.new('RGB', (w, 56), (246, 244, 241)); d = ImageDraw.Draw(b)
    d.rounded_rectangle([12, 10, w - 12, 46], 18, fill=(229, 226, 222))
    d.text((w / 2, 28), 'fc-consultoria.github.io', font=F(500, 17), fill=(60, 60, 60), anchor='mm')
    return b

# ---------------- encoder por cena ----------------
class Cena:
    def __init__(self, nome):
        self.nome, self.tmp = nome, OUT / f'{nome}.tmp.mp4'; self.n = 0
        self.p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                   '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', str(FPS), str(self.tmp)], stdin=subprocess.PIPE)
    def put(self, im): self.p.stdin.write(im.convert('RGB').tobytes()); self.n += 1
    def fim(self):
        self.p.stdin.close(); assert self.p.wait() == 0; os.replace(self.tmp, OUT / f'{self.nome}.mp4'); return self.n / FPS

# ---------------- servidor simulado (mesmas funções do Supabase) ----------------
DB = {}
async def rpc(route):
    req = route.request; nome = req.url.rsplit('/', 1)[1]; b = json.loads(req.post_data or '{}')
    if nome == 'fam_sim_salvar': i = uuid.uuid4().hex[:12]; DB[i] = {'dados': b['p_dados'], 'fotos': [b['p_foto']], 'cliente': b['p_cliente']}; body = json.dumps(i)
    elif nome == 'fam_sim_foto': DB[b['p_id']]['fotos'].append(b['p_foto']); body = 'null'
    else: body = json.dumps(DB.get(b['p_id']))
    await route.fulfill(status=200, content_type='application/json', body=body)
async def site(route):
    rel = route.request.url.split('/evento-cde/', 1)[1].split('?')[0].split('#')[0] or 'index.html'
    f = SITE / rel
    if not f.exists(): return await route.fulfill(status=404, body='')
    await route.fulfill(status=200, body=f.read_bytes(), content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream')

# ---------------- gravação ----------------
class Dev:
    def __init__(self, nome, ctx, pg, larg_css): self.nome, self.ctx, self.pg, self.k, self.img = nome, ctx, pg, None, None
    async def shot(self):
        b = await self.pg.screenshot(type='jpeg', quality=92); self.img = Image.open(io.BytesIO(b)).convert('RGB'); return self.img

async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        async def novo(vw, vh, dsf, mobile):
            ctx = await br.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=dsf, is_mobile=mobile, has_touch=mobile, service_workers='block', locale='pt-BR')
            await ctx.route('**/rest/v1/rpc/*', rpc); await ctx.route('https://fc-consultoria.github.io/**', site)
            await ctx.clock.install(); pg = await ctx.new_page(); return ctx, pg
        tctx, tpg = await novo(1280, 800, 1.5, False)
        cctx, cpg = await novo(390, 788, 2, True)
        tab, cel = Dev('tab', tctx, tpg, 1280), Dev('cel', cctx, cpg, 390)
        await tpg.goto(BASE + 'simulador.html'); await tctx.clock.run_for(1500)
        await tpg.evaluate("document.getElementById('obraNova').click()"); await tctx.clock.run_for(800)

        # transformações tela -> vídeo
        A = dict(x=228, y=26, k=1440 / 1280, bez=20)          # tablet sozinho
        B = dict(x=70, y=150, k=1060 / 1280, bez=16)          # tablet ao lado do celular
        C = dict(x=1380, y=22, k=0.98, bez=16, url=56)        # celular
        estado = {'layout': 'A', 'q': 0, 'toques': [], 'leg': '', 'tick': 0, 'scan': None}
        def transf():
            L = A if estado['layout'] == 'A' else B
            t = {'tab': lambda x, y, L=L: (L['x'] + L['bez'] + x * L['k'], L['y'] + L['bez'] + y * L['k'])}
            if estado['layout'] == 'B': t['cel'] = lambda x, y: (C['x'] + C['bez'] + x * C['k'], C['y'] + C['bez'] + (C['url'] + y) * C['k'])
            return t
        def compor():
            im = FUNDO.copy().convert('RGBA'); L = A if estado['layout'] == 'A' else B
            ts = tab.img.resize((round(1280 * L['k']), round(800 * L['k'])), Image.LANCZOS)
            fr = moldura(ts, 14, L['bez']); sombra(im, (L['x'], L['y']), fr.size, 30); im.alpha_composite(fr, (L['x'], L['y']))
            if estado['layout'] == 'B':
                d = ImageDraw.Draw(im); d.text((L['x'] + fr.size[0] / 2, L['y'] - 52), 'Tablet do vendedor', font=F(700, 30), fill=(246, 234, 211), anchor='mm')
                d.text((C['x'] + 225, 1000 - 0), '', font=F(600, 20))
                tela = Image.new('RGB', (390 * 2, (788 + 56) * 2), 'white')
                tela.paste(barra_url(390).resize((780, 112)), (0, 0))
                tela.paste(estado['scan'] if estado['scan'] is not None else cel.img, (0, 112))
                cs = tela.resize((round(390 * C['k']), round(844 * C['k'])), Image.LANCZOS)
                fc = moldura(cs, 34, C['bez']); sombra(im, (C['x'], C['y']), fc.size, 50); im.alpha_composite(fc, (C['x'], C['y']))
            toques(im, estado['toques'], estado['q'], transf()); legenda(im, estado['leg']); return im

        async def quadros(cena, n, devs=('tab',)):
            for _ in range(n):
                ms = 34 if estado['tick'] % 3 == 0 else 33; estado['tick'] += 1
                for d in (tab, cel):
                    await d.ctx.clock.run_for(ms)
                for d in devs: await (tab if d == 'tab' else cel).shot()
                cena.put(compor()); estado['q'] += 1
        async def toque(cena, dev, sel=None, xy=None, n=8):
            d = tab if dev == 'tab' else cel
            if sel:
                bb = await d.pg.locator(sel).first.bounding_box(); xy = (bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2)
            estado['toques'].append((dev, xy[0], xy[1], estado['q']))
            await quadros(cena, 4, (dev,))
            return xy
        async def digitar(cena, sel, txt, dev='tab'):
            d = tab if dev == 'tab' else cel
            await toque(cena, dev, sel)
            await d.pg.focus(sel)
            for ch in txt:
                await d.pg.keyboard.type(ch); await quadros(cena, 2, (dev,))
        async def foto_e_cantos(cena, tipo):
            await toque(cena, 'tab', 'label:has(#inputGaleria)')
            await tpg.set_input_files('#inputGaleria', f'/home/claude/demo/foto_{tipo}.jpg')
            for _ in range(20):
                await quadros(cena, 1)
                if await tpg.evaluate("!document.getElementById('canvasWrap').classList.contains('hidden')"): break
            print('rolagem:', await tpg.evaluate("(()=>{let e=document.getElementById('canvasWrap');while(e=e.parentElement){const c=getComputedStyle(e);if(/(auto|scroll)/.test(c.overflowY)&&e.scrollHeight>e.clientHeight+4){window.__sc=e;return e.tagName}}window.__sc=document.scrollingElement;return 'doc'})()"))
            dy = await tpg.evaluate("document.getElementById('canvasWrap').getBoundingClientRect().top - 92")
            for i in range(12):
                await tpg.evaluate(f"window.__sc.scrollBy(0, {dy/12})"); await quadros(cena, 1)
            await tpg.evaluate("document.getElementById('btnNovoVaoToolbar').click()"); await quadros(cena, 8)
            for c in CANTOS[tipo]:
                bb = await tpg.locator('#view').bounding_box(); vw = await tpg.evaluate("document.getElementById('view').width")
                k = vw / 1600; x = bb['x'] + c['x'] * k * bb['width'] / vw
                y = bb['y'] + c['y'] * k * bb['height'] / (await tpg.evaluate("document.getElementById('view').height"))
                await tpg.mouse.click(x, y); estado['toques'].append(('tab', x, y, estado['q'])); await quadros(cena, 9)
        async def produto(cena, pid):
            await toque(cena, 'tab', '#selProduto'); await tpg.select_option('#selProduto', pid); await quadros(cena, 10)
        async def ate(cena, seg, devs=('tab',)):
            falta = round(seg * FPS) - cena.n
            if falta > 0: await quadros(cena, falta, devs)
        tempos = {}
        quer = lambda c: not SO_CENA or c in SO_CENA

        # ---- cena 2: obra, foto e cantos ----
        c = Cena('c2'); estado['leg'] = LEG['n2']
        await quadros(c, 12)
        await digitar(c, '#obraNome', 'Residência Silva'); await digitar(c, '#obraCliente', 'Sr. João')
        await tpg.fill('#ambNome', ''); await digitar(c, '#ambNome', 'Sala')
        await foto_e_cantos(c, 'sala'); await ate(c, DUR['n2'] + 1.0); tempos['c2'] = c.fim()
        # ---- cena 3: tipologia e movimento ----
        c = Cena('c3'); estado['leg'] = LEG['n3']
        await produto(c, 'f-pcr2'); await quadros(c, 8)
        await toque(c, 'tab', '#famAbrir'); await tpg.click('#famAbrir'); await quadros(c, 50)
        await toque(c, 'tab', '#famAbrir'); await tpg.click('#famAbrir'); await quadros(c, 30)
        await ate(c, DUR['n3'] + 1.0); tempos['c3'] = c.fim()
        # ---- cena 4: segundo ambiente ----
        c = Cena('c4'); estado['leg'] = LEG['n4']
        for i in range(10):
            await tpg.evaluate("window.__sc.scrollBy(0, -80)"); await quadros(c, 1)
        await toque(c, 'tab', '#ambNovo'); await tpg.click('#ambNovo'); await quadros(c, 6)
        await tpg.fill('#ambNome', ''); await digitar(c, '#ambNome', 'Quarto')
        await foto_e_cantos(c, 'quarto'); await produto(c, 'f-jcr2')
        await toque(c, 'tab', '#famAbrir'); await tpg.click('#famAbrir'); await quadros(c, 40)
        await toque(c, 'tab', '#famAbrir'); await tpg.click('#famAbrir'); await quadros(c, 24)
        await ate(c, DUR['n4'] + 1.0); tempos['c4'] = c.fim()
        # ---- cena 5: QR para o cliente ----
        c = Cena('c5'); estado['leg'] = LEG['n5']
        await quadros(c, 40)  # salvamento automático (relógio controlado)
        await tpg.evaluate("document.getElementById('btnQrCliente').scrollIntoView({block:'center'})"); await quadros(c, 6)
        await toque(c, 'tab', '#btnQrCliente'); await tpg.click('#btnQrCliente'); await quadros(c, 14)
        await digitar(c, '#qrVend', 'Carlos'); await quadros(c, 6)
        await toque(c, 'tab', '#qrGerar'); await tpg.click('#qrGerar')
        for _ in range(240):
            await quadros(c, 1)
            if await tpg.locator('.qr-link').count(): break
        await quadros(c, 12); await ate(c, DUR['n5'] + 1.2); tempos['c5'] = c.fim()
        link = await tpg.locator('.qr-link').inner_text(); print('link', link)
        qbb = await tpg.locator('.qr-img').bounding_box()

        # ---- cena 6: celular lê o QR ----
        c = Cena('c6'); estado['leg'] = LEG['n6']; estado['layout'] = 'B'
        await tab.shot()
        qr = tab.img.crop(tuple(round(v * 1.5) for v in (qbb['x'], qbb['y'], qbb['x'] + qbb['width'], qbb['y'] + qbb['height'])))
        def cam(t):
            s = Image.new('RGB', (780, 1576), (32, 30, 28)); d = ImageDraw.Draw(s)
            q = qr.resize((440, 440)); s.paste(q, (170, 420))
            for (x, y, sx, sy) in [(140, 390, 1, 1), (640, 390, -1, 1), (140, 890, 1, -1), (640, 890, -1, -1)]:
                d.line([(x, y), (x + 70 * sx, y)], fill=(255, 140, 50), width=10); d.line([(x, y), (x, y + 70 * sy)], fill=(255, 140, 50), width=10)
            d.text((390, 300), 'Câmera', font=F(600, 40), fill=(240, 240, 240), anchor='mm')
            if t:
                d.rounded_rectangle([110, 1010, 670, 1110], 50, fill=(255, 255, 255)); d.text((390, 1060), 'fc-consultoria.github.io  ›', font=F(600, 34), fill=(30, 30, 30), anchor='mm')
            return s
        await cpg.goto('about:blank'); await cel.shot()
        estado['scan'] = cam(False); await quadros(c, 24, ())
        estado['scan'] = cam(True); await quadros(c, 14, ())
        estado['toques'].append(('cel', 195, 530, estado['q'])); await quadros(c, 6, ())
        estado['scan'] = None
        await cpg.goto(link);
        for _ in range(60):
            await quadros(c, 1, ('cel',))
            if await cpg.evaluate("document.getElementById('cliCarregando').classList.contains('hidden') && document.querySelectorAll('#ambTabs .obra-tab').length>0"): break
        await quadros(c, 20, ('cel',)); await ate(c, DUR['n6'] + 1.0, ('cel',)); tempos['c6'] = c.fim()
        # ---- cena 7: cliente abre as esquadrias ----
        c = Cena('c7'); estado['leg'] = LEG['n7']
        await toque(c, 'cel', '#cliAbrir'); await cpg.click('#cliAbrir'); await quadros(c, 60, ('cel',))
        await toque(c, 'cel', '#ambTabs .obra-tab >> nth=1'); await cpg.click('#ambTabs .obra-tab >> nth=1'); await quadros(c, 24, ('cel',))
        await toque(c, 'cel', '#cliAbrir'); await cpg.click('#cliAbrir'); await quadros(c, 50, ('cel',))
        estado['toques'].append(('tab', *(lambda b: (b['x'] + b['width'] / 2, b['y'] + b['height'] / 2))(await tpg.locator('.qr-acoes a').bounding_box()), estado['q']))
        await quadros(c, 20, ('cel',)); await ate(c, DUR['n7'] + 1.2, ('cel',)); tempos['c7'] = c.fim()
        json.dump(tempos, open(OUT / 'tempos.json', 'w')); print(tempos)
        await br.close()

asyncio.run(main())
