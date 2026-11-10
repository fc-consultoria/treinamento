"""Som da avenida (sintético) + atenuação igual à do app: att = 3 + 27*(1-abertura)^8, e abafa os agudos quando fecha."""
import json, wave, numpy as np
from scipy.signal import butter, sosfilt, sosfilt_zi
SR = 48000; FPS = 30
R = json.load(open('registro.json')); LOG = R['log']; FALAS = R['falas']; DUR = json.load(open('dur.json'))
N = int(len(LOG) / FPS * SR); t = np.arange(N) / SR
rng = np.random.default_rng(42)

def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output='sos'), x)
def ruido(n): return rng.standard_normal(n)

L = np.zeros(N); Rr = np.zeros(N)
def soma(sig, ini, pan_ini=0.0, pan_fim=0.0):
    s = int(ini * SR); e = min(N, s + len(sig)); sig = sig[:e - s]
    pan = np.linspace(pan_ini, pan_fim, len(sig)); gl = np.sqrt((1 - pan) / 2); gr = np.sqrt((1 + pan) / 2)
    L[s:e] += sig * gl; Rr[s:e] += sig * gr

# 1) fundo de trânsito: ronco grave + chiado distante, oscilando devagar
fundo = filt(np.cumsum(ruido(N)) * 0.002, 'lowpass', 260) * 1.0 + filt(ruido(N), 'bandpass', [250, 1800]) * 0.05
mod = 0.8 + 0.2 * np.sin(2 * np.pi * t / 7.3) + 0.1 * np.sin(2 * np.pi * t / 2.9)
fundo = fundo / np.std(fundo) * 0.06 * mod
L += fundo; Rr += filt(np.cumsum(ruido(N)) * 0.002, 'lowpass', 260) / 1 * 0 + fundo * 0.95

def carro(dur=3.2, f0=95, forte=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR - dur / 2
    env = np.exp(-(tt / (dur / 4.2)) ** 2)
    pneu = filt(ruido(n), 'bandpass', [400, 4500]) * 0.9
    f = f0 * (1 + 0.05 * np.tanh(-tt / 0.35))           # efeito Doppler
    fase = 2 * np.pi * np.cumsum(f) / SR
    motor = sum(np.sin(k * fase) / k for k in range(1, 7)) * 0.25
    return (pneu + motor) * env * 0.16 * forte
def onibus(dur=6.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 1.2) * np.minimum(1, (dur - tt) / 1.8)
    f = 48 + 6 * np.sin(2 * np.pi * tt / 2.5); fase = 2 * np.pi * np.cumsum(f) / SR
    motor = sum(np.sin(k * fase) / k ** 0.7 for k in range(1, 12)) * 0.22
    rumor = filt(ruido(n), 'lowpass', 500) * 0.25
    return (motor + rumor) * env * 0.22
def freio_ar(dur=0.9):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filt(ruido(n), 'highpass', 2500) * np.exp(-tt / 0.3) * np.minimum(1, tt / 0.02) * 0.32
def buzina(dur=0.55):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * 415 * tt)) + np.sign(np.sin(2 * np.pi * 520 * tt))
    return filt(s, 'bandpass', [300, 3000]) * np.minimum(1, tt / 0.01) * np.minimum(1, (dur - tt) / 0.03) * 0.11
def moto(dur=2.8):
    n = int(dur * SR); tt = np.arange(n) / SR - dur / 2
    env = np.exp(-(tt / (dur / 4)) ** 2); f = 165 * (1 + 0.06 * np.tanh(-tt / 0.3)); fase = 2 * np.pi * np.cumsum(f) / SR
    return filt(np.sign(np.sin(fase)) * 0.5 + np.sin(2 * fase) * 0.3, 'lowpass', 2500) * env * 0.13

# carros passando o tempo todo
x = 0.3
while x < len(LOG) / FPS:
    d = rng.uniform(2.6, 4.0); pi = rng.choice([-0.9, 0.9])
    soma(carro(d, rng.uniform(80, 130), rng.uniform(0.6, 1.1)), x, pi, -pi); x += rng.uniform(1.4, 3.2)
# eventos fortes nas janelas de escuta (aberta e fechada) e no "mais uma vez"
quadro_marca = {m: i for i, s in enumerate(LOG) for m in [s.get('marca')] if m}
ta = quadro_marca['ouvir_aberta'] / FPS; tf = quadro_marca['ouvir_fechada'] / FPS
for base in (ta, tf):
    soma(onibus(), base + 0.2, -0.6, 0.5); soma(freio_ar(), base + 2.6, 0.2, 0.3); soma(buzina(), base + 3.8, 0.5, 0.5); soma(moto(), base + 4.0, 0.9, -0.9)
t5a = FALAS[[f[0] for f in FALAS].index('n5a')][1] / FPS; t5b = FALAS[[f[0] for f in FALAS].index('n5b')][1] / FPS
soma(onibus(4.0), t5a + 2.4, -0.5, 0.4); soma(buzina(), t5a + 4.2, 0.4, 0.4); soma(buzina(0.4), t5b + 1.6, 0.4, 0.4); soma(moto(), t5b + 1.4, -0.9, 0.9)

# ---------- atenuação conforme a porta (mesma conta do app) ----------
op = np.array([s['open'] for s in LOG]); out = np.array([s['out'] for s in LOG], float)
att_q = 3 + 27 * (1 - np.clip(op, 0, 1)) ** 8
tq = (np.arange(len(LOG)) + 0.5) / FPS
att = np.interp(t, tq, att_q); outdb = np.interp(t, tq, out)
# abafado: mistura entre som cheio e passa-baixa 600 Hz (vidro e vedação cortam mais os agudos)
mix = np.clip((att - 3) / 27, 0, 1)
def abafa(x): return filt(x, 'lowpass', 600, 2)
Lf, Rf = abafa(L), abafa(Rr)
cc = np.sqrt((np.mean(L**2)+np.mean(Rr**2))/(np.mean(Lf**2)+np.mean(Rf**2)))
L2 = L * (1 - mix) + Lf * mix * cc; R2 = Rr * (1 - mix) + Rf * mix * cc   # 1.6 compensa a energia tirada pelo filtro antes de aplicar os dB
ganho = 10 ** ((outdb - 80) / 20) * 10 ** (-(att - 3) / 20)          # 80 dB com a porta aberta = referência
# narração por cima: o som da rua baixa enquanto o narrador fala com a porta aberta
nar = np.zeros(N); fala_mask = np.zeros(N)
def lewav(n):
    w = wave.open(f'{n}.wav'); a = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.0; sr = w.getframerate()
    return np.interp(np.arange(int(len(a) * SR / sr)) / SR, np.arange(len(a)) / sr, a)
for nome, q in FALAS:
    a = lewav(nome); s = int((q / FPS + 0.05) * SR); e = min(N, s + len(a)); nar[s:e] += a[:e - s]; fala_mask[max(0, s - SR // 3):min(N, e + SR // 3)] = 1
k = int(0.25 * SR); fala_mask = np.convolve(fala_mask, np.ones(k) / k, 'same')
duck = 1 - 0.68 * fala_mask * (1 - mix)
L3 = L2 * ganho * duck; R3 = R2 * ganho * duck
qa = quadro_marca['ouvir_aberta']; ja = slice(int((qa/FPS+0.4)*SR), int((qa/FPS+5.0)*SR))
ref = np.sqrt((np.mean(L3[ja]**2)+np.mean(R3[ja]**2))/2); esc = 10**(-19/20)/ref
L3 = np.tanh(L3*esc*1.15)/1.15; R3 = np.tanh(R3*esc*1.15)/1.15   # limitador suave só nos picos (buzina, freio)
nar = nar / np.abs(nar).max() * 0.55
FL, FR = L3 + nar, R3 + nar
st = np.stack([FL, FR], 1); st = np.clip(st, -1, 1)
with wave.open('som_cena.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
# nível da rua dentro da sala (sem narração), por quadro, para o medidor na tela
rua = np.sqrt((L3 ** 2 + R3 ** 2) / 2); spf = SR // FPS
rms = [float(np.sqrt(np.mean(rua[i * spf:(i + 1) * spf] ** 2)) + 1e-9) for i in range(len(LOG))]
json.dump({'rms_db': [20 * np.log10(r) for r in rms], 'att': att_q.tolist()}, open('nivel.json', 'w'))
import statistics as S
qf = quadro_marca['ouvir_fechada']
ab = [20*np.log10(r) for r in rms[qa+12:qa+150]]; fe = [20*np.log10(r) for r in rms[qf+12:qf+150]]
print('janela aberta', round(10*np.log10(np.mean([10**(x/10) for x in ab])),1), 'janela fechada', round(10*np.log10(np.mean([10**(x/10) for x in fe])),1)); print('mediana aberta', round(S.median(ab), 1), 'dBFS | fechada', round(S.median(fe), 1), 'dBFS')
