# Plano de migracao para Next.js

## Objetivo

Separar o projeto em duas areas: `scrape/` para captura e enriquecimento dos dados, e `next-app/` para a aplicacao Next.js com renderizacao server-side, API e assets locais.

## Etapas

1. Mover o codigo de scraping, CLI, cache e testes para `scrape/`, preservando `digimon.json` e as protecoes de limpeza.
2. Configurar o App Router do Next em `next-app/`.
3. Carregar `digimon-enriched.json` no servidor, validar `collectionArraySchema.collectionItems` e renderizar os dados iniciais sem fetch do cliente.
4. Expor `GET /api/digimons` com a lista de Digimons.
5. Disponibilizar imagens locais em `next-app/public/images/` e manter fallback para `imageUrl`.
6. Reproduzir a UI atual: busca reativa, favoritos no `localStorage`, filtro de favoritos, expansao de evolucoes/de-evolucoes, filtro de card pai, links Game8, estados vazios/erro e responsividade.
7. Adaptar os testes existentes, documentacao e comandos de execucao.
8. Gerar `next-app/digimon-assets.zip` com `digimon-enriched.json` e `images/`, sem `node_modules`, `.next`, `.cache` ou temporarios.

## Decisoes

- O Next sera o servidor principal da UI e da API.
- Favoritos continuam locais no navegador.
- Os filtros `attribute` e `generation` nao entram nesta etapa, pois o escopo e reproduzir a UI atual.
- A API retorna a lista de itens, mantendo o contrato de `/api/digimons`.
- Nao criar commit.

## Validacao

- Rodar os testes do scraper e dos favoritos.
- Rodar `npm run build` e `npm run start` em `next-app`.
- Validar a rota `/api/digimons` e o carregamento server-side.
- Testar busca, favoritos, expansao, filtro de pais, links, imagens locais e mobile/desktop.
- Inspecionar o conteudo final do ZIP.
