import json, subprocess, os, qrcode
from PIL import Image, ImageDraw, ImageFont
W,H,FPS=1920,1080,30
DUR=json.load(open('audio/dur.json'))
F=lambda w,s: ImageFont.truetype(f'fnt/inter{w}.ttf',s)
def fundo():
    im=Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    for y in range(H):
        t=y/H; d.line([(0,y),(W,y)],fill=(int(27+18*t),int(18+9*t),int(13+4*t)))
    return im
def qr(txt,px):
    q=qrcode.QRCode(border=2,box_size=10); q.add_data(txt); q.make(); return q.make_image(fill_color='black',back_color='white').convert('RGB').resize((px,px),Image.NEAREST)
def capa():
    im=fundo(); d=ImageDraw.Draw(im)
    d.rounded_rectangle([150,150,560,560],28,fill='white'); im.paste(qr('https://fc-consultoria.github.io/treinamento/evento-cde/#simulador',360),(175,175))
    d.text((680,240),'QR para o cliente',font=F(800,104),fill=(255,246,232))
    d.text((684,380),'O cliente leva a obra dele no celular',font=F(500,46),fill=(246,190,140))
    d.text((684,470),'Simulador na obra · Linha Family 32',font=F(600,36),fill=(220,205,185))
    d.line([(150,700),(1770,700)],fill=(90,64,46),width=2)
    d.text((150,760),'CDE',font=F(800,44),fill=(234,88,12)); d.text((270,768),'Linha Family 32 · Arkial',font=F(500,34),fill=(220,205,185))
    d.text((1770,768),'Desenvolvido por FC Consultoria em Esquadria',font=F(500,30),fill=(170,150,130),anchor='ra')
    return im
def fim():
    im=fundo(); d=ImageDraw.Draw(im)
    d.text((W/2,170),'Só gerar o QR precisa de internet',font=F(800,72),fill=(255,246,232),anchor='mm')
    itens=[('Tablet do vendedor','Obras com vários ambientes, salvas no aparelho, sem internet.'),
           ('Celular do cliente','Abre pelo QR, sem aplicativo e sem cadastro.'),
           ('WhatsApp','O mesmo link vai direto para o cliente.')]
    for i,(a,b) in enumerate(itens):
        y=330+i*150; d.rounded_rectangle([300,y,1620,y+118],22,fill=(43,30,22),outline=(90,64,46),width=2)
        d.ellipse([336,y+39,376,y+79],fill=(234,88,12)); d.text((356,y+59),str(i+1),font=F(800,26),fill='white',anchor='mm')
        d.text((410,y+24),a,font=F(700,36),fill=(246,190,140)); d.text((410,y+70),b,font=F(500,30),fill=(235,224,210))
    d.text((W/2,880),'CDE · Linha Family 32',font=F(700,40),fill=(255,246,232),anchor='mm')
    d.text((W/2,935),'Desenvolvido por FC Consultoria em Esquadria',font=F(500,30),fill=(190,170,150),anchor='mm')
    return im
def render(nome,img,dur,fin=0.5,fout=0.0):
    img.save(f'{nome}.png'); tmp=f'cenas/{nome}.tmp.mp4'
    vf=f'format=yuv420p,loop=-1:1,trim=duration={dur:.2f}'
    if fin: vf+=f',fade=t=in:st=0:d={fin}'
    if fout: vf+=f',fade=t=out:st={dur-fout:.2f}:d={fout}'
    subprocess.run(['ffmpeg','-v','error','-y','-framerate','30','-i',f'{nome}.png','-vf',vf,'-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','-r','30',tmp],check=True)
    os.replace(tmp,f'cenas/{nome}.mp4'); return round(round(dur*FPS)/FPS,3)
t={'c1':render('c1',capa(),DUR['n1']+1.4,0.6),'c8':render('c8',fim(),DUR['n8']+1.8,0.4,1.0)}
json.dump(t,open('cenas/tempos_cart.json','w')); print(t)
