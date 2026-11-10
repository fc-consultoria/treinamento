import asyncio, json, uuid
from playwright.async_api import async_playwright
SITE='/home/claude/repo/treinamento/evento-cde'
DB={}
async def rpc(route):
    req=route.request; nome=req.url.rsplit('/',1)[1]; b=json.loads(req.post_data or '{}')
    if nome=='fam_sim_salvar':
        i=str(uuid.uuid4()); DB[i]={'dados':b['p_dados'],'fotos':[b['p_foto']],'cliente':b['p_cliente']}; body=json.dumps(i)
    elif nome=='fam_sim_foto':
        DB[b['p_id']]['fotos'].append(b['p_foto']); body='null'
    else:
        d=DB.get(b['p_id']); body=json.dumps(d)
    await route.fulfill(status=200, content_type='application/json', body=body)
async def main():
    async with async_playwright() as p:
        br=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        ctx=await br.new_context(viewport={'width':1280,'height':800})
        await ctx.route('**/rest/v1/rpc/*', rpc)
        pg=await ctx.new_page(); pg.on('console', lambda m: print('CONSOLE', m.text) if m.type=='error' else None)
        await pg.goto(f'file://{SITE}/simulador.html'); await pg.wait_for_timeout(1500)
        await pg.add_script_tag(path='foto_obra.js'); await pg.add_script_tag(path='montar.js')
        r=await pg.evaluate("fcMontar({nova:true,obra:'Residência Silva',cliente:'Sr. João',amb:[{nome:'Sala',foto:'sala',produto:'f-pcr2'},{nome:'Quarto',foto:'quarto',produto:'f-jcr2'}]})")
        print(r)
        await pg.screenshot(path='t_vendedor.jpg', quality=80)
        q=await pg.evaluate("fcGerarQR('Carlos')"); print(q)
        await pg.screenshot(path='t_qr.jpg', quality=80)
        i=q['link'].split('ver=')[1]
        ph=await ctx.new_page(); await ph.set_viewport_size({'width':390,'height':844})
        await ph.goto(f'file://{SITE}/simulador.html?ver={i}'); await ph.wait_for_timeout(2500)
        await ph.click('#cliAbrir'); await ph.wait_for_timeout(2500)
        await ph.screenshot(path='t_cliente.jpg', quality=80)
        await br.close()
asyncio.run(main())
