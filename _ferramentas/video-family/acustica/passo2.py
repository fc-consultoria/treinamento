import json, subprocess, os, numpy as np, wave, qrcode
from PIL import Image, ImageDraw, ImageFont
W, H, FPS = 1920, 1080, 30
F = lambda w, s: ImageFont.truetype(f'/home/claude/demo/fnt/inter{w}.ttf', s)
R = json.load(open('registro.json')); LOG = R['log']; FALAS = R['falas']
NIV = json.load(open('nivel.json')); DUR = json.load(open('dur.json'))
LEG = {'n2': 'Sala com porta de correr 2 folhas, a configuração ensaiada no IPT. Lá fora: avenida com ônibus, 80 dB.',
       'n3': 'Agora, a porta fecha.',
       'n4': 'Fechada, ela corta 30 dB. A avenida chega como um escritório silencioso.',
       'n5a': 'Mais uma vez: aberta…', 'n5b': '…e fechada.',
       'n6': 'Numa rua movimentada, de 70 dB, dentro fica em 40 dB: como uma biblioteca.',
       'n7': 'Ensaio IPT: folhas de 32 mm, vidro laminado 10 mm e cremona multiponto.'}
q_marca = {s['marca']: i for i, s in enumerate(LOG) if s.get('marca')}
JAN = [(q_marca['ouvir_aberta'], q_marca['ouvir_aberta'] + int(5.5 * FPS), 'Escute: porta aberta'),
       (q_marca['ouvir_fechada'], q_marca['ouvir_fechada'] + int(5.5 * FPS), 'Escute: porta fechada')]
leg_q = []
for i, (n, q) in enumerate(FALAS):
    leg_q.append((q, q + int((DUR[n] + 0.35) * FPS), LEG.get(n, '')))

def legenda(d, txt, cx=720, maxw=1240, base=H - 30):
    f = F(600, 32); pal = txt.split(); ls, cur = [], ''
    for p in pal:
        t = (cur + ' ' + p).strip()
        if d.textlength(t, font=f) > maxw and cur: ls.append(cur); cur = p
        else: cur = t
    ls.append(cur); lh = 44; tot = lh * len(ls) + 24; y0 = base - tot; lw = max(d.textlength(l, font=f) for l in ls) + 56
    d.rounded_rectangle([cx - lw / 2, y0, cx + lw / 2, y0 + tot], 16, fill=(12, 8, 5, 220))
    for i, l in enumerate(ls): d.text((cx, y0 + 12 + i * lh + lh / 2), l, font=f, fill=(255, 246, 232), anchor='mm')

def overlay(i):
    o = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(o); s = LOG[i]
    aberta = s['open'] > 0.5; att = NIV['att'][i]
    # cartão de estado
    x, y = 28, 168; d.rounded_rectangle([x, y, x + 470, y + 214], 22, fill=(24, 16, 11, 225))
    cor = (234, 88, 12) if aberta else (34, 160, 96)
    d.rounded_rectangle([x + 20, y + 20, x + 230, y + 62], 21, fill=cor)
    d.text((x + 125, y + 41), 'PORTA ABERTA' if aberta else 'PORTA FECHADA', font=F(800, 22), fill='white', anchor='mm')
    inn = round(s['out'] - att)
    d.text((x + 22, y + 80), f"Lá fora {s['out']} dB", font=F(600, 26), fill=(230, 214, 194))
    d.text((x + 260, y + 80), f"Dentro {inn} dB", font=F(800, 26), fill=(255, 255, 255))
    # medidor do som que entra
    d.text((x + 22, y + 128), 'Som que entra na sala', font=F(500, 19), fill=(200, 180, 160))
    nv = np.clip((NIV['rms_db'][i] + 62) / 50, 0, 1); segs = 22
    for k in range(segs):
        on = k < nv * segs; c = (60, 200, 110) if k < 12 else (240, 190, 40) if k < 18 else (235, 70, 40)
        d.rounded_rectangle([x + 22 + k * 19.5, y + 156, x + 22 + k * 19.5 + 15, y + 192], 4, fill=c if on else (60, 48, 40))
    # janelas de escuta
    for a, b, txt in JAN:
        if a <= i < b:
            al = min(1, (i - a) / 8, (b - i) / 8); f = F(800, 40); lw = d.textlength(txt, font=f) + 70
            d.rounded_rectangle([720 - lw / 2, 520 - 38, 720 + lw / 2, 520 + 38], 38, fill=(12, 8, 5, int(210 * al)))
            d.text((720, 520), txt, font=f, fill=(255, 246, 232, int(255 * al)), anchor='mm')
    for a, b, txt in leg_q:
        if a <= i < b and txt: legenda(d, txt)
    d.text((1428, 1050), '', font=F(500, 10))
    return o

def render_cena():
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', 'bruto.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    enc = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', 'cena.tmp.mp4'], stdin=subprocess.PIPE)
    i = 0
    while True:
        b = dec.stdout.read(W * H * 3)
        if len(b) < W * H * 3: break
        im = Image.frombytes('RGB', (W, H), b).convert('RGBA'); im.alpha_composite(overlay(min(i, len(LOG) - 1)))
        enc.stdin.write(im.convert('RGB').tobytes()); i += 1
    enc.stdin.close(); assert enc.wait() == 0; os.replace('cena.tmp.mp4', 'cena.mp4'); return i

def fundo():
    im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    for y in range(H):
        t = y / H; d.line([(0, y), (W, y)], fill=(int(27 + 18 * t), int(18 + 9 * t), int(13 + 4 * t)))
    return im
def capa():
    im = fundo(); d = ImageDraw.Draw(im)
    # ícone de fone de ouvido desenhado
    cx, cy = 360, 400
    d.arc([cx - 150, cy - 170, cx + 150, cy + 130], 180, 360, fill=(234, 88, 12), width=26)
    for sx in (-1, 1): d.rounded_rectangle([cx + sx * 150 - 45, cy - 30, cx + sx * 150 + 45, cy + 120], 30, fill=(234, 88, 12))
    d.text((640, 300), 'Acústica', font=F(800, 120), fill=(255, 246, 232))
    d.text((646, 450), 'Ouça a diferença: porta aberta × porta fechada', font=F(500, 44), fill=(246, 190, 140))
    d.text((646, 530), 'Use fone de ouvido', font=F(600, 36), fill=(220, 205, 185))
    d.line([(150, 720), (1770, 720)], fill=(90, 64, 46), width=2)
    d.text((150, 780), 'CDE', font=F(800, 44), fill=(234, 88, 12)); d.text((270, 788), 'Linha Family 32 · Arkial', font=F(500, 34), fill=(220, 205, 185))
    d.text((1770, 788), 'Desenvolvido por FC Consultoria em Esquadria', font=F(500, 30), fill=(170, 150, 130), anchor='ra')
    return im
def fim():
    im = fundo(); d = ImageDraw.Draw(im)
    d.text((W / 2, 170), 'Fechada, a porta corta até 30 dB', font=F(800, 72), fill=(255, 246, 232), anchor='mm')
    itens = [('Ensaio no IPT', 'Rw 30 dB na porta de correr 2 folhas da Linha Family 32.'),
             ('Configuração ensaiada', 'Folhas de 32 mm, vidro laminado 10 mm e cremona multiponto.'),
             ('No app', 'Ambientes 3D › Quanto barulho entra › Ouvir a diferença.')]
    for i, (a, b) in enumerate(itens):
        y = 330 + i * 150; d.rounded_rectangle([300, y, 1620, y + 118], 22, fill=(43, 30, 22), outline=(90, 64, 46), width=2)
        d.ellipse([336, y + 39, 376, y + 79], fill=(234, 88, 12)); d.text((356, y + 59), str(i + 1), font=F(800, 26), fill='white', anchor='mm')
        d.text((410, y + 24), a, font=F(700, 36), fill=(246, 190, 140)); d.text((410, y + 70), b, font=F(500, 30), fill=(235, 224, 210))
    d.text((W / 2, 860), 'Simulação ilustrativa. O resultado real depende do vidro, da instalação e da obra.', font=F(500, 24), fill=(170, 150, 130), anchor='mm')
    d.text((W / 2, 925), 'CDE · Linha Family 32', font=F(700, 40), fill=(255, 246, 232), anchor='mm')
    d.text((W / 2, 980), 'Desenvolvido por FC Consultoria em Esquadria', font=F(500, 30), fill=(190, 170, 150), anchor='mm')
    return im
def card(nome, img, dur, fin, fout):
    img.save(f'{nome}.png'); vf = f'format=yuv420p,loop=-1:1,trim=duration={dur:.3f}'
    if fin: vf += f',fade=t=in:st=0:d={fin}'
    if fout: vf += f',fade=t=out:st={dur - fout:.3f}:d={fout}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', f'{nome}.png', '-vf', vf, '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '30', f'{nome}.tmp.mp4'], check=True)
    os.replace(f'{nome}.tmp.mp4', f'{nome}.mp4')

import sys
if 'teste' in sys.argv:
    for i in [q_marca['ouvir_aberta'] + 60, q_marca['ouvir_fechada'] + 60, FALAS[-1][1] + 120]:
        dec = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{i / FPS:.3f}', '-i', 'bruto.mp4', '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
        im = Image.frombytes('RGB', (W, H), dec).convert('RGBA'); im.alpha_composite(overlay(i)); im.convert('RGB').save(f'teste_{i}.jpg', quality=85)
    sys.exit()
n = render_cena()
d1 = round((DUR['n1'] + 1.4) * FPS) / FPS; d8 = round((DUR['n8'] + 3.6) * FPS) / FPS
card('capa', capa(), d1, 0.6, 0); card('fim', fim(), d8, 0.4, 1.0)
open('lista.txt', 'w').write("file 'capa.mp4'\nfile 'cena.mp4'\nfile 'fim.mp4'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'lista.txt', '-c', 'copy', 'mudo.mp4'], check=True)
# trilha completa: capa (n1) + cena + fim (n8)
SR = 48000
def lew(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; c = w.getnchannels(); sr = w.getframerate()
    a = a.reshape(-1, c); a = a if c == 2 else np.repeat(a, 2, 1)
    if sr != SR: idx = np.arange(int(len(a) * SR / sr)) * sr / SR; a = np.stack([np.interp(idx, np.arange(len(a)), a[:, k]) for k in range(2)], 1)
    return a
cena = lew('som_cena.wav'); n1 = lew('n1.wav'); n8 = lew('n8.wav')
nar_pk = 0.55
tot = int((d1 + n / FPS + d8) * SR); buf = np.zeros((tot, 2), np.float32)
def put(a, t, g=1.0): s = int(t * SR); e = min(tot, s + len(a)); buf[s:e] += a[:e - s] * g
put(n1 / np.abs(n1).max() * nar_pk, 0.6); put(cena, d1); put(n8 / np.abs(n8).max() * nar_pk, d1 + n / FPS + 0.5)
# rua entra de leve no fim da capa
with wave.open('trilha.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'mudo.mp4', '-i', 'trilha.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', 'Acustica_Family_porta_aberta_x_fechada.tmp.mp4'], check=True)
os.replace('Acustica_Family_porta_aberta_x_fechada.tmp.mp4', 'Acustica_Family_porta_aberta_x_fechada.mp4'); print('ok', d1 + n / FPS + d8)
