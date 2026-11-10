"""Passo 1: grava a tela Ambientes 3D (sala) e registra, quadro a quadro, o estado da porta e os dB do painel."""
import asyncio, json, subprocess, os, io
from PIL import Image
from playwright.async_api import async_playwright
SITE = '/home/claude/repo/treinamento/evento-cde'
FPS = 30; DUR = json.load(open('dur.json'))
LOG = []      # um registro por quadro
FALAS = []    # (nome, quadro inicial)

async def main():
    enc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', 'bruto.tmp.mp4'], stdin=subprocess.PIPE)
    async with async_playwright() as p:
        br = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        ctx = await br.new_context(viewport={'width': 1600, 'height': 900}, device_scale_factor=1.2, service_workers='block')
        await ctx.add_init_script(path='tempo.js'); pg = await ctx.new_page()
        await pg.goto(f'file://{SITE}/index.html#ambientes'); await pg.wait_for_timeout(600)
        await pg.evaluate("setAmb('sala')"); await pg.evaluate("__tick(3000)")
        await pg.evaluate("document.getElementById('qrX') && document.getElementById('qrX').click()")
        await pg.evaluate("target.open=1; state.open=1; renderDock && renderDock()")
        for _ in range(4): await pg.evaluate("__tick(50)")
        await pg.evaluate("document.querySelector('.presets button[data-db=\"80\"]').click()")
        await pg.evaluate("document.getElementById('acu').scrollIntoView({block:'center'})")
        await pg.evaluate("__tick(33.3)")
        ult = {'img': None}
        async def estado():
            return await pg.evaluate("({open: state.open, out: +document.getElementById('ruaDb').value, inn: document.getElementById('vIn').textContent, ocupado: Math.abs(state.open-target.open)>0.002 || !!tw})")
        async def quadro(anima):
            if anima: await pg.evaluate("__tick(33.333)")
            if anima or ult['img'] is None:
                ult['img'] = await pg.screenshot(type='jpeg', quality=92)
            enc.stdin.write(ult['img']); s = await estado(); LOG.append(s); return s
        async def segura(seg):
            for _ in range(round(seg * FPS)): await quadro(False)
        async def ate_parar(minimo=0.0):
            n = 0
            while True:
                s = await quadro(True); n += 1
                if n >= minimo * FPS and not s['ocupado']: break
                if n > 300: break
        def fala(nome): FALAS.append((nome, len(LOG)))
        async def clica(sel):
            await pg.evaluate(f"document.querySelector({json.dumps(sel)}).click()"); ult['img'] = None

        # ---- roteiro ----
        await segura(0.4); fala('n2'); await segura(DUR['n2'] + 0.3)
        LOG[-1]['marca'] = 'ouvir_aberta'; await segura(5.5)
        fala('n3'); await segura(DUR['n3'] + 0.2)
        await clica('#bOpen'); await ate_parar(0.8)
        LOG[-1]['marca'] = 'ouvir_fechada'; await segura(5.5)
        fala('n4'); await segura(DUR['n4'] + 0.8)
        fala('n5a'); await segura(DUR['n5a'])
        await clica('#bOpen'); await ate_parar(0.8); await segura(2.6)
        fala('n5b'); await segura(DUR['n5b'])
        await clica('#bOpen'); await ate_parar(0.8); await segura(3.2)
        fala('n6'); await segura(0.4); await clica('.presets button[data-db="70"]'); await segura(DUR['n6'] + 0.4)
        fala('n7'); await segura(0.3)
        await clica('#pDifs .dif button'); await ate_parar(0.6)
        await segura(max(0.5, DUR['n7'] + 1.0 - (len(LOG) - FALAS[-1][1]) / FPS))
        await br.close()
    enc.stdin.close(); assert enc.wait() == 0; os.replace('bruto.tmp.mp4', 'bruto.mp4')
    json.dump({'log': LOG, 'falas': FALAS}, open('registro.json', 'w')); print(len(LOG) / FPS, 's', FALAS)

asyncio.run(main())
