# Migração: Meu Novo Lar vira blog puro

Base: `Affiliate-Hub-Requisitos.md` v1.2 (§1, §10, critérios 17–20). Este documento é o inventário (§10.1) e o plano de corte do lado do blog. Nada aqui foi executado.

**Regras que valem durante todo o projeto**

- O blog não tem catálogo, ofertas, vitrine, fichas nem cards de produto.
- Qualquer referência a produto num artigo vem por API do Affiliate Hub. O blog não lê `Produto` do banco.
- Nenhuma migração remove tabela ou dado enquanto a separação física dos bancos não for decidida (§1). Parar de usar não é o mesmo que apagar.
- Nenhum import entre repositórios. Contrato entre os dois é HTTP.
- Artigos JORNADA e URLs `/blog/[slug]` permanecem.
- `CLAUDE.md` e `AGENTS.md` deste repo descrevem o projeto AdSense/catálogo. Ficam obsoletos no corte e precisam ser reescritos (ver etapa 5).

## 1. Inventário: o que é produto hoje

### Rotas públicas (`app/`)

| Rota | Destino no blog |
|---|---|
| `(site)/produtos`, `(site)/produtos/[slug]` | Sai. Mapear cada URL útil para o Hub. |
| `(site)/ofertas` | Sai. |
| `(site)/vitrine`, `(site)/vitrine/[slug]` | Sai. |
| `go/[code]` | Sai do blog, mas **links `/go/...` já publicados** (posts, Facebook, WhatsApp) continuam vivos até o Hub assumir o mesmo código. Decidir antes de remover. |
| `(landing-grupo)/grupo` | A verificar: é landing de grupo WhatsApp, não catálogo. |
| `(site)/buscar` | Fica, mas só artigos (hoje busca `prisma.produto` também). |
| `(site)/blog` | Fica, sem as abas "Listas" e "Produtos individuais". |
| `(site)/page.tsx` (home) | Fica, sem o bloco de ofertas/deals, sem `vitrineHoje` e sem o texto sobre produtos selecionados. |
| `sitemap.ts` | Remove `/produtos`, `/ofertas`, `/vitrine` e as landings. Já lista só JORNADA. |
| `robots.ts` | Remove os disallow de `/produtos/mercado_livre-`, `/vitrine/...`. |

### Componentes e libs ligados a produto

- `components/corpo-do-post.tsx`: consulta `prisma.produto` e renderiza `[produto:slug]`. É o ponto de acoplamento mais importante entre post e produto.
- `components/site/card-produto.tsx`, `landing-vitrine.tsx`, `posts-relacionados.tsx`, `header.tsx`, `footer.tsx` (links Produtos/Ofertas/Ofertas do dia).
- `lib/conteudo/corpo.ts` (shortcodes `[produto:]` e `[cta:]`), `lib/produtos.ts`, `lib/catalogo.ts`, `lib/nicho.ts`, `lib/conteudo/post-do-produto.ts`, `gerar-ficha-produto.ts`, `gerar-lista-casa.ts`, `escolher-produtos-lista.ts`, `larsmart-*`.
- `lib/shopee/*`, `lib/mercado-livre/*`, `lib/vitrine/*`, `lib/tracking/*`, `lib/listas-oferta/*`.
- `app/blog/[slug]`: `include: produtos` e `resolverCapa(..., produto)` usam o produto do post para a capa.

### Schema (`prisma/schema.prisma`)

Pertence ao Hub: `Produto`, `LinkAfiliadoEtiquetado`, `HistoricoPreco`, `ProdutoVendaSnapshot`, `ListaOferta`, `Clique`, `ConfiguracaoVitrine`, `LandingDiaria`, `LandingProduto`, enums `Plataforma`, `Categoria`, `SegmentoProduto`, `TipoOfertaShopee`, `FaixaPreco`, `SeloLanding`, `StatusLanding`.

Pontes entre blog e produto que precisam de decisão:

- `ItemDePost` (post → produto), `ImagemLarSmart.produtoId`, `Guia`/`GuiaProduto`/`Faq`.
- `Post.tipo` = `PRODUTO` e `LISTA`. Pelo §1, o tipo sozinho não decide: LISTA precisa de revisão por conteúdo.
- `Post.destino` e `CategoriaEditorial` incluem `JORNADA_ESPIRITUAL`, `REFLEXAO_ESPIRITUAL`, `GUIA_ESPIRITUALIDADE` (Mago da Meia Noite). Estão no mesmo banco. Fora do tema casa, mas o §1 manda preservar e não excluir automaticamente.

Ficam no blog: `Post`, `NotaJornada`, `Midia`, `MidiaEmPost`, `User`/`Account`/`Session`, `Assinante`, `Configuracao`, `Log`.

Ambíguos (distribuição em redes): `Canal`, `Publicacao`, `Credencial`. Servem tanto à divulgação de produtos quanto à de artigos.

### Workers (`workers/index.ts`)

Param no blog: `sincronizarPrecosMercadoLivre`, `sincronizarPrecosShopee`, `descobrirOfertasShopee`, `classificarProdutosShopee`, `gerarLandingsDoDia`, `enfileirarListasOfertaDoDia`.

Ficam ou precisam de revisão: `executarPublicacao`, `sincronizarInsightsFacebook`, `executarRelatorioSemanalFacebook`, `enfileirarHorariosVaziosGrupos`, janelas de agenda. Dependem de qual dos dois projetos passa a dono das redes sociais.

### Admin (`app/admin/(dashboard)`)

Sai: `produtos/*`, `vitrine`, `listas-oferta`, `posts/gerar-lista`, `posts/larsmart`, e os botões de purga AdSense/ficha/landing.
Fica: `posts` (JORNADA), `jornada`, `assinantes`, mídia, `logs`, `login`.

### Scripts

Revisar antes de qualquer execução (§10.9): `purgar-fora-do-nicho.ts`, `apagar-todos-produtos.ts`, `adsense-aplicar-prod.ts`. **Nenhum deve ser rodado durante a migração.**

## 2. Não verificado

- Quantidade de posts por `tipo`/`categoriaEditorial` e quantos usam `[produto:slug]` ou `[cta:/go/...]` (exige acesso ao banco).
- Quem consome `/go/*` hoje (Facebook, WhatsApp, Telegram, Pinterest, Mago da Meia Noite).
- Se o repositório `affiliate-hub` já tem API. O que existe lá hoje é protótipo de interface com dados de exemplo (`lib/data.ts`); não há rota de API nem Prisma.
- Como o Mago da Meia Noite consome este backend.

## 3. Contrato de produto por API (proposta, a validar)

O blog só precisa de leitura pública, cacheada e tolerante a falha:

- `GET /api/v1/produtos?slugs=a,b,c` → nome, imagem, menor preço elegível, atualizado em, URL de destino (`/go/...` do Hub).
- Resposta com `ETag` e `stale-while-revalidate`; o blog cacheia por tag e nunca chama o Hub por visita sem cache.
- Falha, produto despublicado ou 404: o post renderiza sem o card, sem erro visível (mesmo comportamento atual de produto removido).
- Chave de serviço só no servidor do blog.

Pendência de produto: o requisito diz que o blog não exibe cards de produto (§1, critério 17) e ao mesmo tempo que referências vêm da API. Preciso saber se "referência" é link/menção textual ou se ainda há card renderizado a partir da API.

## 4. Ordem de execução no blog

1. **Decisões** (seção 5).
2. **Contrato + cliente**: módulo `lib/hub/` com o cliente da API, sem tocar nas telas. Pode ser testado contra mock.
3. **Corte do público**: `corpo-do-post` passa a usar o cliente (ou remove cards, conforme a decisão); tirar produtos da home, busca, blog, header, footer, sitemap, robots. Rotas removidas respondem 404/410 ou redirecionam **individualmente** para equivalente publicado no Hub, nunca para a home (§1).
4. **Corte do admin e workers**: remover telas e loops de produto. Não apagar tabelas.
5. **Documentação**: reescrever `CLAUDE.md`/`AGENTS.md` do blog (remover regras de catálogo, AdSense de nicho e Facebook de ofertas), e ajustar `package.json` (nome ainda `affiliate-hub`, scripts de catálogo).
6. **Exportação para o Hub**: script de leitura (somente leitura) que gera o pacote de produtos, links `/go`, histórico e cliques com contagens reconciliadas (§10.4–10.6, 10.12). Executado pelo Hub, não pelo blog.
7. **Só depois da validação e da decisão sobre os bancos**: migrações de remoção.

## 5. Decisões pendentes

1. O que "referência de produto via API" significa no artigo (card, link ou menção).
2. `/go/*`: o Hub assume os mesmos códigos e o blog mantém um redirect temporário para o domínio do Hub, ou os links antigos morrem?
3. Posts `LISTA` e `PRODUTO`: migram para o Hub, viram artigos editoriais depois de revisão, ou ficam despublicados?
4. Conteúdo do Mago da Meia Noite neste banco: onde vive depois do corte.
5. Facebook/WhatsApp/Telegram: quem publica artigos do blog e quem publica ofertas.
6. Domínio do Hub (necessário para qualquer redirect ou URL de API).
