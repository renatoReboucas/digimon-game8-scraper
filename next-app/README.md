# Digimon Atlas Next

Aplicacao Next.js com App Router e TypeScript. O catalogo inicial e carregado no servidor a partir de `data/digimon-enriched.json`. As imagens locais ficam em `public/images/`.

```bash
npm install
npm run dev
```

Para producao:

```bash
npm run build
npm run start
```

A API publica os mesmos itens usados pela tela em `GET /api/digimons`. O caminho do JSON pode ser substituido com `DIGIMON_DATA_FILE`.

A interface mantem busca reativa, favoritos em `localStorage`, filtro de favoritos, expansao de evolucoes e de-evolucoes, filtro de card pai e links para o Game8.

O arquivo `digimon-assets.zip` contem o JSON e as imagens locais para distribuicao do runtime.
