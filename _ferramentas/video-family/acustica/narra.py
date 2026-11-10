import subprocess, json, wave
M='/home/claude/tts/vits-piper-pt_BR-faber-medium/pt_BR-faber-medium.onnx'
T={
'n1':'Acústica da Linha Family. Coloque o fone de ouvido, e escute a diferença.',
'n2':'Esta é a sala, com a porta de correr de duas folhas, a mesma configuração ensaiada no IPT. Lá fora, uma avenida com ônibus: oitenta decibéis. Escute com a porta aberta.',
'n3':'Agora, a porta fecha.',
'n4':'Fechada, ela corta trinta decibéis. O barulho da avenida chega como um escritório silencioso.',
'n5a':'Mais uma vez. Aberta.',
'n5b':'Fechada.',
'n6':'Numa rua movimentada, de setenta decibéis, dentro fica em quarenta: como uma biblioteca.',
'n7':'O resultado vem do ensaio do IPT: folhas de trinta e dois milímetros, vidro laminado de dez milímetros, e cremona multiponto.',
'n8':'Linha Family, cê dê é. Desenvolvido por FC Consultoria em Esquadria.',
}
dur={}
for k,t in T.items():
    subprocess.run(['python3','-m','piper','-m',M,'-f',f'{k}.wav','--length-scale','1.03','--sentence-silence','0.25'],input=t.encode(),check=True,capture_output=True)
    w=wave.open(f'{k}.wav'); dur[k]=round(w.getnframes()/w.getframerate(),2)
json.dump(dur,open('dur.json','w')); print(dur, round(sum(dur.values()),1))
