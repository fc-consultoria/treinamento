import asyncio, base64, json
from playwright.async_api import async_playwright
SITE='/home/claude/repo/treinamento/evento-cde'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page()
        await pg.goto(f'file://{SITE}/simulador.html')
        await pg.wait_for_timeout(1500)
        await pg.add_script_tag(path='foto_obra.js')
        out={}
        for t in ['sala','quarto']:
            r=await pg.evaluate(f"fcFotoObra('{t}')")
            open(f'foto_{t}.jpg','wb').write(base64.b64decode(r['url'].split(',')[1]))
            out[t]=r['cantos']
        print(json.dumps(out))
        await b.close()
asyncio.run(main())
