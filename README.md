# Digimon Game8 Scraper

Scraper em Node.js para ler os registros de `digimon.json`, acessar as páginas do Game8 e acrescentar as listas de Digivolutions e De-Digivolutions.

## Requisitos

- Node.js 18.17 ou superior
- npm

## Instalação

```bash
npm install
```

## Uso

Para abrir a CLI interativa:

```bash
npm run cli
```

O menu usa esta ordem:

1. Capturar dados
2. Apagar output
3. Recomecar scraping do zero
4. Abrir servidor web
5. Sair

A exclusão exige a digitação exata de `digimon-enriched.json`. O arquivo de entrada nunca é apagado.

`Recomecar scraping do zero` exige a digitação exata de `RECOMECAR`, sem diferenciar maiusculas e minusculas. Com a confirmacao correta, a CLI remove `digimon-enriched.json`, `.cache/scrape-cache.json` e as imagens baixadas em `src/images/`, preservando `.gitkeep` e `digimon.json`. Em seguida, inicia automaticamente uma nova captura. Confirmacoes diferentes cancelam a operacao sem remover arquivos.

Durante a captura, a CLI informa a criação das pastas `.cache` e `src/images`, as páginas processadas, as imagens baixadas ou reutilizadas e o cache salvo. A interface web é aberta depois da captura concluída e exibe os dados gerados.

Depois de capturar os dados, escolha `Abrir servidor web` e acesse `http://127.0.0.1:3000`. A interface oferece busca reativa por nome, cards expansíveis com evolutions e de-evolutions, imagens locais e botões para abrir cada página do Game8 em uma nova aba. Cada Digimon pode ser favoritado ou desfavoritado; os favoritos ficam salvos no `localStorage` do navegador e podem ser filtrados pelo toggle `Apenas favoritos`. Encerre o servidor com `Ctrl+C`.

Para executar diretamente:

```bash
npm run scrape -- --input digimon.json --output digimon-enriched.json
```

Opções disponíveis:

```text
--input caminho       Arquivo JSON de entrada
--output caminho      Arquivo JSON de saída
--delay-min ms        Atraso mínimo entre páginas (padrão: 2500)
--delay-max ms        Atraso máximo entre páginas (padrão: 5000)
--concurrency n       Número máximo de páginas em paralelo (padrão: 3)
--force               Permite sobrescrever o arquivo de saída
```

O scraper reutiliza o cache de páginas em `.cache/scrape-cache.json`, deduplica URLs e limita a concorrência com espaçamento entre requisições. Ele respeita `Retry-After` e backoff para reduzir o risco de bloqueio. As imagens são salvas em `src/images/`; antes de baixar, o scraper verifica se o arquivo local já existe.

## Formato gerado

Cada item original recebe um campo `Digivolutions`:

```json
{
  "Digivolutions": {
    "evolutions": [
      {
        "name": "Agumon",
        "url": "https://game8.co/...",
        "imageUrl": "https://img.game8.co/...",
        "localImageUrl": "/images/arquivo-local.png"
      }
    ],
    "deEvolutions": []
  }
}
```

## Boas práticas de scraping

O scraper usa cache-first, concorrência limitada, atraso aleatório por host, timeout, retentativas com backoff e `Retry-After`. Falhas individuais são registradas e não interrompem toda a execução. O parâmetro `--concurrency` pode ser reduzido para uma captura ainda mais conservadora.

O programa não tenta contornar CAPTCHA, autenticação, rate limits ou controles de acesso. Quando um download de imagem falha, a URL externa permanece disponível como fallback.

O código de produção fica em `src/`, os testes ficam em `test/`, os dados JSON ficam na raiz e as imagens baixadas ficam em `src/images/`. A pasta de imagens não é ignorada pelo Git.

## Testes

```bash
npm test
```

Os testes usam Vitest.