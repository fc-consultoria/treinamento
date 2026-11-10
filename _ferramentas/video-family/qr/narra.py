import sherpa_onnx, soundfile as sf, json
M='/home/claude/tts/vits-piper-pt_BR-faber-medium/'
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=M+'pt_BR-faber-medium.onnx',tokens=M+'tokens.txt',data_dir=M+'espeak-ng-data',length_scale=1.02),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg)
T={
'n1':'Quê erre para o cliente. Agora, o cliente leva a obra dele no celular.',
'n2':'No tablet, o vendedor dá nome à obra e ao cliente, fotografa o ambiente, e marca os quatro cantos do vão.',
'n3':'Escolhe a tipologia da Linha Family, e ela já aparece na foto, abrindo e fechando.',
'n4':'Dá para adicionar quantos ambientes quiser. Aqui, o quarto, com uma janela de correr.',
'n5':'Pronto. O vendedor toca em quê erre para o cliente, coloca o nome dele, e gera o quê erre. As fotos sobem em poucos segundos.',
'n6':'O cliente lê o quê erre com a câmera do celular. Sem aplicativo e sem cadastro, a obra dele abre na hora.',
'n7':'Ele toca em abrir as esquadrias, passa pelos ambientes, e mostra para a família. Se preferir, o vendedor manda o mesmo link pelo WhatsApp.',
'n8':'No tablet, tudo funciona sem internet. Só gerar o quê erre precisa de sinal. Linha Family, cê dê é. Desenvolvido por FC Consultoria em Esquadria.',
}
dur={}
for k,t in T.items():
    a=tts.generate(t,sid=0,speed=1.0); sf.write(f'audio/{k}.wav',a.samples,a.sample_rate); dur[k]=round(len(a.samples)/a.sample_rate,2)
json.dump(dur,open('audio/dur.json','w')); print(dur)
