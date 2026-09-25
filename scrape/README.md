# Scraper

O scraper le `scrape/digimon.json`, consulta as paginas do Game8 e grava `scrape/digimon-enriched.json` com as evolucoes. As imagens baixadas ficam em `scrape/src/images/`.

A partir da raiz:

```bash
npm run scrape
npm run cli
npm test
```

A CLI preserva `digimon.json` durante exclusoes e reinicios. O cache fica em `scrape/.cache/`.

Depois de atualizar os dados, copie `scrape/digimon-enriched.json` e `scrape/src/images/` para `next-app/data/` e `next-app/public/images/` antes de gerar um novo pacote de assets.
