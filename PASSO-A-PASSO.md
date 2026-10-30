# Site da Decorart no GitHub Pages — passo a passo

## O que tem nesta pasta
- `index.html`: a home (topo com texto digitando, galeria de trabalhos com filtros, Quem Somos, Instalação, Orçamento, contatos).
- `papeldeparede/index.html`: catálogo com os 190 modelos e os filtros por estilo, mais as abas Soluções, Diferenciais, Passos e FAQ. O endereço continua o mesmo: /papeldeparede/.
- `css/style.css`: cores e fontes iguais às do site antigo (verde #2E442D, Montserrat).
- `js/fotos.js`: fotos da galeria da home, com a categoria de cada uma.
- `js/catalogo.js`: modelos de papel de parede, com nome, foto e estilo.
- `img/`: pasta das fotos, organizada por ano e mês, igual ao WordPress (ex.: img/2025/09/D044ASS.avif).
- `imagens.txt` e `.github/workflows/copiar-fotos.yml`: o robô que copia todas as fotos do site antigo para cá.
- `CNAME`: avisa o GitHub que o endereço é decorartpapeisepisos.com.br.

## 1. Criar o repositório
1. Entre em github.com (crie uma conta grátis se ainda não tiver).
2. Clique em **New repository**. Nome: `decorart-site`. Marque **Public**. Clique em **Create repository**.
3. Na página do repositório vazio, clique em **uploading an existing file**.
4. Abra a pasta descompactada `decorart-site` no seu computador, selecione **tudo o que está dentro dela** e arraste para a página do GitHub. Clique em **Commit changes**.

> **Atenção:** a pasta `.github` começa com ponto e às vezes fica escondida, ou o navegador não envia. Confira se ela aparece na lista do repositório. Se não aparecer, clique em **Add file → Create new file**, digite o nome `.github/workflows/copiar-fotos.yml`, cole o conteúdo do arquivo e clique em **Commit changes**.

## 2. Copiar as fotos do site antigo (fazer HOJE, enquanto o site antigo responde)
1. No repositório, abra a aba **Actions**. Se aparecer um aviso, clique em **I understand... enable them**.
2. Clique em **Copiar fotos do site antigo → Run workflow → Run workflow**.
3. Espere ficar verde (1 a 3 minutos). As fotos vão aparecer na pasta `img/`.
4. Se alguma foto não vier, o nome dela fica no arquivo `faltando.txt`. Me mande esse arquivo.

> Mesmo antes desse passo, o site novo mostra as fotos puxando do site antigo. O robô serve para o site não depender mais do WordPress.

## 3. Ligar o site
1. No repositório: **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**. Branch: **main**, pasta **/ (root)**. Clique em **Save**.
3. Em **Custom domain**, confira se aparece `decorartpapeisepisos.com.br` (vem do arquivo CNAME). Se não aparecer, digite e salve.
4. Em 1 ou 2 minutos o site fica no ar em `SEU-USUARIO.github.io/decorart-site`. Confira tudo antes do próximo passo.

## 4. Apontar o domínio (no WordPress.com → Upgrades → Domínios → decorartpapeisepisos.com.br → DNS)
Apague os registros A e AAAA antigos que apontam para o WordPress e crie estes:

| Tipo | Nome | Valor |
|---|---|---|
| A | @ (em branco) | 185.199.108.153 |
| A | @ (em branco) | 185.199.109.153 |
| A | @ (em branco) | 185.199.110.153 |
| A | @ (em branco) | 185.199.111.153 |
| CNAME | www | SEU-USUARIO.github.io |

**Não apague** registros MX ou TXT (são de e-mail e verificações do Google e Facebook).

A mudança pode levar de minutos a algumas horas. Depois que o site abrir pelo domínio, volte em **Settings → Pages** e marque **Enforce HTTPS**. Se a caixa estiver cinza, espere mais um pouco; o GitHub ainda está gerando o certificado.

## O que mudou em relação ao site antigo
- Corrigidos erros de digitação: "Tranforme" → "Transforme", "Econtre" → "Encontre" e "Decorarte" → "Decorart".
- No FAQ, "preencher o formulário" virou "falar com a gente pelo WhatsApp", porque o botão leva para o WhatsApp.
- A foto ampliada agora tem setas para passar para a próxima.
- Fora isso, textos, cores, fontes, filtros e animações seguem o site antigo.
