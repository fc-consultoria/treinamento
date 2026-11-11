# Linha Family 32 · Arkial — modelo de licença

App da Linha Family 32 para a revenda licenciada: **Ambientes 3D**, **Modo evento** com QR e **Simulador na obra** (obra com vários ambientes e QR para o cliente). Funciona sem internet depois da primeira abertura.

Desenvolvido por FC Consultoria em Esquadria.

## Como trocar a marca para um novo licenciado

1. **Copie a pasta** `family-arkial` inteira e dê um nome novo, só com letras minúsculas e hífen.
   Exemplo: `family-revenda-exemplo`.
   O nome da pasta já separa os arquivos guardados no aparelho, então cada licenciado tem os seus.

2. Na pasta nova, abra **`index.html`**. Logo no começo está o bloco **MARCA DO LICENCIADO**:

   ```js
   window.MARCA = {
     nome:    'Arkial',
     revenda: 'Arkial',
     cor:     '#3f5566',
     logo:    'ARKIAL · Linha Family 32',
     rodape:  'Linha Family 32 · Arkial · Desenvolvido por FC Consultoria em Esquadria',
     site:    'https://fc-consultoria.github.io/treinamento/family-arkial/',
     prefixo: 'ark_',
     banco:   'family-arkial-obras'
   };
   ```

   Troque só o que está entre aspas simples:

   | Campo | O que é | Exemplo |
   |---|---|---|
   | `nome` | Nome do licenciado nas telas | `'Revenda Exemplo'` |
   | `revenda` | Nome gravado em cada QR do cliente | `'Revenda Exemplo'` |
   | `cor` | Cor principal (código de 6 dígitos com #) | `'#2e7d32'` |
   | `logo` | Logo em texto, no topo das telas | `'REVENDA EXEMPLO · Linha Family 32'` |
   | `rodape` | Texto do rodapé e das imagens/vídeos | `'Linha Family 32 · Revenda Exemplo · Desenvolvido por FC Consultoria em Esquadria'` |
   | `site` | Endereço da pasta nova (termina com `/`) | `'https://fc-consultoria.github.io/treinamento/family-revenda-exemplo/'` |
   | `prefixo` | 3 letras e `_`, diferente para cada licenciado | `'rex_'` |
   | `banco` | Nome da pasta + `-obras` | `'family-revenda-exemplo-obras'` |

3. Abra **`simulador.html`**. O mesmo bloco está no começo. **Deixe igual ao do `index.html`** (copie e cole).

4. Publique a pasta e abra o endereço. O topo, as cores, o rodapé, o modo evento, o simulador e o QR já aparecem com a marca nova.

Pronto. Não precisa mexer em mais nada.

## Opcional

- **Ícone do app:** os ícones da pasta `icons` são neutros (“F32 FAMILY”). Para pôr o logo do licenciado, troque os 4 arquivos PNG mantendo os mesmos nomes e tamanhos (180, 192 e 512 pixels).
- **Nome do ícone no Android:** fica “Family 32” e “Simulador Family”. Para mudar, edite `name` e `short_name` nos arquivos `manifest.webmanifest` e `manifest-simulador.webmanifest`. No iPhone, o nome já sai do bloco MARCA.

## Cuidados

- Use aspas simples e mantenha a vírgula no fim de cada linha.
- A cor precisa ter `#` e 6 dígitos (ex.: `#2e7d32`).
- Se a cor ficar parecida com a de outro licenciado, tudo bem: o que separa os dados é a pasta, o `prefixo` e o `banco`.
- O acesso ao Simulador na obra continua liberado pela FC, aparelho por aparelho.
