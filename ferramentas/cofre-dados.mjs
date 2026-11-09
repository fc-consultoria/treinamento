#!/usr/bin/env node
/* FC · Cofre de dados do Estudo de Mercado e das Equivalências (09/11/2026)
   © FC Consultoria em Esquadria

   Os arquivos .json de equivalencias/ e estudo-mercado/ ficam CIFRADOS no repositório público (arquivo .json.enc ao lado).
   A chave fica só no banco (Supabase cpkjphodruyxfouirhpd, tabela fc_cofre, k = 'dados') e é entregue pela função
   fc_dados_chave() só para quem tem acesso (login do Painel/Central, chave do cliente, sessão de pessoa da empresa
   ou aparelho liberado pela FC no Estudo de Mercado). No navegador, o cofre-dados.js abre os arquivos sozinho.

   Uso (chave na variável FC_DADOS_CHAVE, em base64):
     node ferramentas/cofre-dados.mjs abrir    → recria _dados/ com os .json de verdade (para editar)
     node ferramentas/cofre-dados.mjs fechar   → cifra tudo de _dados/ para os .json.enc e apaga qualquer .json aberto

   Editar sempre dentro de _dados/ (pasta ignorada pelo git). Depois "fechar" e commit. */
import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import crypto from 'node:crypto';
const RAIZ=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const PASTAS=['equivalencias','estudo-mercado'];const DADOS=path.join(RAIZ,'_dados');
const k=process.env.FC_DADOS_CHAVE;if(!k){console.error('Defina FC_DADOS_CHAVE (base64, 32 bytes).');process.exit(1);}
const KEY=Buffer.from(k,'base64');if(KEY.length!==32){console.error('Chave inválida.');process.exit(1);}
const cifra=b=>{const iv=crypto.randomBytes(12),c=crypto.createCipheriv('aes-256-gcm',KEY,iv);return Buffer.concat([iv,c.update(zlib.gzipSync(b,{level:9})),c.final(),c.getAuthTag()]);};
const decifra=b=>{const iv=b.subarray(0,12),tag=b.subarray(b.length-16),d=crypto.createDecipheriv('aes-256-gcm',KEY,iv);d.setAuthTag(tag);return zlib.gunzipSync(Buffer.concat([d.update(b.subarray(12,b.length-16)),d.final()]));};
const lista=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?lista(path.join(d,e.name)):[path.join(d,e.name)]):[];
const doRepo=ext=>PASTAS.flatMap(p=>lista(path.join(RAIZ,p))).filter(f=>f.endsWith(ext));

function abrir(){let n=0;
  for(const f of doRepo('.json.enc')){const r=path.relative(RAIZ,f).slice(0,-4),dst=path.join(DADOS,r);
    fs.mkdirSync(path.dirname(dst),{recursive:true});fs.writeFileSync(dst,decifra(fs.readFileSync(f)));n++;}
  /* .json ainda abertos no repositório (primeira vez) também vão para _dados/ */
  for(const f of doRepo('.json')){const dst=path.join(DADOS,path.relative(RAIZ,f));fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(f,dst);n++;}
  console.log(n+' arquivos em '+DADOS+'. Edite e depois rode "fechar".');}

function fechar(){if(!fs.existsSync(DADOS)){console.error('Não achei '+DADOS+'. Rode "abrir" primeiro.');process.exit(1);}
  let n=0;for(const f of lista(DADOS).filter(f=>f.endsWith('.json'))){const r=path.relative(DADOS,f),dst=path.join(RAIZ,r)+'.enc';
    const b=fs.readFileSync(f);JSON.parse(b.toString('utf8'));/* confere que é JSON válido */
    if(fs.existsSync(dst)){try{if(decifra(fs.readFileSync(dst)).equals(b))continue;}catch(_){}}
    fs.mkdirSync(path.dirname(dst),{recursive:true});fs.writeFileSync(dst,cifra(b));n++;}
  let x=0;for(const f of doRepo('.json')){fs.rmSync(f);x++;}
  console.log(n+' arquivos cifrados'+(x?', '+x+' .json abertos removidos do repositório':'')+'. Pode fazer o commit.');}

({abrir,fechar}[process.argv[2]]||(()=>{console.error('Use: abrir | fechar');process.exit(1);}))();
