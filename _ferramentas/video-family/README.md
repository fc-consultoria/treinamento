# Ferramentas de vídeo · Linha Family (FC Consultoria em Esquadria)

Usadas em 10/11/2026 para os vídeos da CDE. Servem de base para as versões Guaporé Vidros e Arkial.

## Voz (pt-BR "Faber")
- Modelo: `curl -L -o faber.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-pt_BR-faber-medium.tar.bz2` e `tar xjf`.
- Motor: `pip install --break-system-packages piper-tts` e depois `python3 -m piper -m pt_BR-faber-medium.onnx -f saida.wav --length-scale 1.03 --sentence-silence 0.25` (texto pela entrada padrão). O sherpa-onnx novo não fala português; use o piper.
- Siglas escritas como se fala: "quê erre" (QR), "cê dê é" (CDE), "IPT".
- Fontes Inter: converter `evento-cde/fonts/*.woff2` para .ttf com fontTools (`pip install fonttools brotli`).

## qr/ · vídeo "QR para o cliente" (simulador.html)
- `foto_obra.js`: gera foto de obra em 3D com o vão vazio e devolve os 4 cantos. `shot_fotos.py` grava foto_sala.jpg, foto_quarto.jpg e cantos.json.
- `gravar.py`: grava tablet (1280x800) e celular (390x844) com relógio controlado (`context.clock`), servidor Supabase simulado (`page.route`) e o site servido dos arquivos locais. Toques desenhados, legendas, moldura. Uma cena = um arquivo mp4.
- `cartoes.py`: capa e encerramento. `narra.py`: textos da narração.
- `montar.js` + `teste_local.py`: monta a obra e gera o QR pela interface. O mesmo script roda no navegador real para o teste de ponta a ponta.
- Lições: a rolagem é do documento (não do `main`); limpar o campo do ambiente antes de digitar; fechar a janela no tablet antes de gerar o QR.

## acustica/ · vídeo "porta aberta × fechada" (index.html, sala)
- `tempo.js`: relógio manual (1 quadro de animação por quadro de vídeo). Uma tela 3D leva ~1,5 s; só renderiza quando algo se mexe.
- `passo1.py`: grava a cena e registra a abertura da porta quadro a quadro (registro.json).
- `som.py`: som de avenida sintético (trânsito, ônibus, freio a ar, buzina, moto). Atenuação igual à do app: att = 3 + 27·(1−abertura)^8, com agudos abafados ao fechar. Confere: janela aberta −19 dBFS, fechada −48,6 dBFS.
- `passo2.py`: cartão de estado (aberta/fechada, dB), medidor de som, "Escute…", legendas, capa, encerramento e trilha final.
