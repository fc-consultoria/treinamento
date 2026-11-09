# Cofre de dados — Estudo de Mercado e Equivalências (09/11/2026)

Todos os `.json` de `equivalencias/` e `estudo-mercado/` ficam **cifrados** neste repositório público (`.json.enc`, AES-GCM).
A chave fica só no banco (Supabase `cpkjphodruyxfouirhpd`, tabela `fc_cofre`, `k = 'dados'`, sem acesso pelo site)
e é entregue pela função `fc_dados_chave(p_ext, p_dev, p_chaves, p_toks)` somente para:

- login ativo do Painel da Matriz / Central (trein_alunos ativo);
- chave do cliente na Central (cons_portal ativo);
- sessão de pessoa da empresa (emp_sessoes ativa — vendedores dos portais);
- aparelho do Estudo de Mercado **liberado pela FC** (em_decisao = liberado).

No navegador, o `cofre-dados.js` (carregado primeiro em cada tela) abre os arquivos sozinho. As telas continuam
pedindo `indice.json`, `dados.json` etc. normalmente.

## Para editar ou gerar uma base

1. Pegar a chave no banco: `select v from fc_cofre where k='dados';`
2. `export FC_DADOS_CHAVE='<chave>'`
3. `node ferramentas/cofre-dados.mjs abrir` → recria `_dados/` com os .json de verdade.
4. Editar **dentro de `_dados/`** (ou gerar o .json novo lá, no mesmo caminho).
5. `node ferramentas/cofre-dados.mjs fechar` → cifra e apaga qualquer .json aberto que tenha ficado nas pastas.
6. Commit. A pasta `_dados/` é ignorada pelo git e **nunca** vai para o repositório.

Os desenhos (.webp) continuam abertos: são desenhos de catálogo; a ligação entre códigos é que fica protegida.
