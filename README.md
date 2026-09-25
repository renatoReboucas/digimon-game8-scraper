# Digimon Game8 Scraper e Atlas Next

## Estrutura atual

- `scrape/`: captura, CLI, cache, testes, `digimon.json` e imagens baixadas.
- `next-app/`: aplicacao Next.js em TypeScript, UI, API, JSON de runtime e imagens publicas.
- `PLAN.md`: plano da migracao.

## Executar o Next

```bash
cd next-app
npm install
npm run dev
```

Em producao, use `npm run build` e `npm run start`. A API esta em `GET /api/digimons`.

Para atualizar o catalogo, execute o scraper na raiz com `npm run scrape`, copie `scrape/digimon-enriched.json` para `next-app/data/digimon-enriched.json` e as imagens para `next-app/public/images/`. O pacote pronto fica em `next-app/digimon-assets.zip`.

## Scraper

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

`Recomecar scraping do zero` exige a confirmacao `s` ou `sim`, sem diferenciar maiusculas e minusculas. Com a confirmacao correta, a CLI remove `scrape/digimon-enriched.json`, `scrape/.cache/scrape-cache.json` e as imagens baixadas em `scrape/src/images/`, preservando `.gitkeep` e `scrape/digimon.json`. Em seguida, inicia automaticamente uma nova captura. Confirmacoes diferentes cancelam a operacao sem remover arquivos.

Durante a captura, a CLI informa a criação das pastas `scrape/.cache` e `scrape/src/images`, as páginas processadas, as imagens baixadas ou reutilizadas e o cache salvo. A captura não inicia o servidor web automaticamente.

Depois de capturar os dados, escolha `Abrir servidor web` e acesse `http://127.0.0.1:3000`. A interface oferece busca reativa por nome, cards expansíveis com evolutions e de-evolutions, imagens locais e botões para abrir cada página do Game8 em uma nova aba. Cada Digimon pode ser favoritado ou desfavoritado; os favoritos ficam salvos no `localStorage` do navegador e podem ser filtrados pelo toggle `Apenas favoritos`. O botão de filtro em uma relação busca o Digimon pai pelo nome. Encerre o servidor com `Ctrl+C`.

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

O scraper reutiliza o cache de páginas em `scrape/.cache/scrape-cache.json`, deduplica URLs e limita a concorrência com espaçamento entre requisições. Ele respeita `Retry-After` e backoff para reduzir o risco de bloqueio. As imagens são salvas em `scrape/src/images/`; antes de baixar, o scraper verifica se o arquivo local já existe.

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

O código de produção fica em `scrape/src/`, os testes ficam em `scrape/test/`, os dados ficam em `scrape/` e as imagens baixadas ficam em `scrape/src/images/`. A pasta de imagens não é ignorada pelo Git.

## Mapa funcional

| Área | Funcionalidades mapeadas | Suítes/cenários |
|---|---|---|
| Scraper | Leitura do JSON, extração/deduplicação de evolutions e de-evolutions, cache incremental, concorrência, retentativas, `Retry-After`, download/reuso de imagens e fallback remoto | `scrape/test/scrape-digimon.test.js`, `scrape/test/argument-parsing.test.js` |
| CLI | Capturar, validar sobrescrita, excluir output com confirmação, reiniciar preservando entrada e `.gitkeep`, abrir servidor, cancelar e tratar falhas | `scrape/test/cli-interactions.test.js`, cenários existentes em `scrape/test/scrape-digimon.test.js` |
| Web legada | Carga da API, busca reativa, favoritos/localStorage, filtro de favoritos, filtro pelo nome do pai, expansão por clique/teclado, links, imagens, vazios e erros | `scrape/test/web-app.test.js`, `scrape/test/favorites.test.js` |
| Servidor legado | `/`, `/api/digimons`, assets estáticos e imagens, MIME types, 404/405, validação dos dados e falha ao ocupar a porta | `scrape/test/web-server.test.js` |
| Catálogo Next | Carga server-side, validação de schema, busca sincronizada com `q` na URL, favoritos, filtro, expansão de relações, metadados, imagens e links externos | `next-app/src/app/*test*`, `next-app/src/components/*test*`, `next-app/src/lib/*test*` |
| API Next | `GET /api/digimons`, resposta JSON válida e respostas de erro | `next-app/src/app/api/digimons/route.test.ts` |

## Componentes Next

Todos os componentes `.tsx` fora de `next-app/src/components/ui/` têm cenários com React Testing Library. A lista encontrada e a cobertura de comportamento são:

| Componente | Comportamentos exercitados |
|---|---|
| `DigimonAtlas` | Render inicial, busca/URL, limpeza, favoritos persistidos, filtro, empty states, erro e axe |
| `DigimonCard` | Expansão/recolhimento, clique no card, favorito, filtro pelo nome e relações |
| `DigimonProvider` / `useDigimonLookup` | Busca por nome, URL e ID, dados esparsos e catálogo vazio |
| `DigimonImage` | Imagem local/remota, fallback após erro e ausência de `src` vazio |
| `DigimonMetadataGrid` | Campos opcionais, nível/geração e aliases de data |
| `EvolutionSection` | Lista de referências e estado sem registros |
| `RelatedItem` | Expansão, metadata, fields, skills, relações e filtro por pai |
| `Link` | URL codificada, destino seguro e nome acessível |
| `Game8Link` | URL fornecida/fallback, nova aba e nome acessível |
| `ScrollToTop` | Estado antes/depois do limite de rolagem e ação de retornar ao topo |

Os Server Components elegíveis também são renderizados/verificados com React Testing Library:

| Server Component | Cenários |
|---|---|
| `HomePage` | Catálogo válido, vazio e falha real de leitura do arquivo |
| `RootLayout` | Idioma `pt-BR`, metadata, providers e composição dos filhos |
| `Loading` | Mensagem `role="status"` e `aria-busy` durante carregamento |

`components/ui/` é a única pasta de componentes ignorada, conforme o escopo. Seus controles são usados como dependências nas renderizações e auditorias dos componentes consumidores, mas não têm suites unitárias próprias.

## Acessibilidade

As consultas RTL priorizam roles, labels e nomes acessíveis. Os testes verificam headings, labels, links, estados `aria-expanded`/`aria-pressed`, switch, status de carregamento e interações por teclado. O axe-core encontrou zero violações nas regras habilitadas para a renderização inicial do catálogo.

O teste axe desabilita somente `color-contrast`: jsdom não implementa canvas, necessário para essa regra. Contraste visual permanece sem verificação automatizada neste ambiente. Os links de ícone receberam `aria-label`; imagens sem URL deixaram de emitir `src=""`. Essas são as alterações de produção feitas para acessibilidade/testabilidade. A confirmação de exclusão da CLI também foi alinhada ao nome do arquivo documentado.

## Executar testes e cobertura

```bash
npm run test:all
npm run test:coverage
```

`npm test` é um alias de `npm run test:all`. O comando do pacote Next (`npm --prefix next-app test`) também executa a suíte conjunta. Todos os testes usam Vitest; não há Jest.

`npm run test:coverage` gera o relatório HTML em `coverage/monorepo/index.html` e o resumo JSON em `coverage/monorepo/coverage-summary.json`. A configuração falha se Statements, Branches, Functions ou Lines ficar abaixo de 80%. O denominador cobre `scrape/src` e `next-app/src`, excluindo arquivos de teste, `next-app/src/test/`, tipos sem runtime e componentes `next-app/src/components/ui/`.