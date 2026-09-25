Implemente as funcionalidades abaixo neste projeto Node.js, preservando as alterações existentes e mantendo o código organizado em src/.

## Organização

- Código de produção em src/.
- Frontend em src/web/:
  - index.html
  - app.js
  - styles.css
- Imagens locais em src/images/.
- Testes em test/.
- Dados na raiz:
  - digimon.json
  - digimon-enriched.json
- Não adicionar src/images/ ao .gitignore.

## CLI

Atualize src/cli.js com estas opções:

1. Capturar dados
   - Executar o scraping.
   - Baixar também as imagens principais, imagens das evolutions, de-evolutions e ícones de atributos.
   - Usar cache para evitar downloads repetidos.
   - Salvar as imagens em src/images/.
   - Adicionar localImageUrl aos registros.
   - Usar a URL remota como fallback quando o download falhar.

2. Apagar output

3. Recomeçar scraping do zero
   - Exigir confirmação digitando RECOMEÇAR.
   - Preservar digimon.json.
   - Apagar:
     - digimon-enriched.json
     - .cache/scrape-cache.json
     - imagens baixadas em src/images/, preservando apenas .gitkeep.
   - Iniciar automaticamente uma nova captura.
   - Exibir mensagens claras sobre cada etapa.

4. Abrir servidor web
   - Ler digimon-enriched.json.
   - Iniciar servidor em http://127.0.0.1:3000.
   - Exibir erro orientando executar a captura se o arquivo não existir.
   - Encerrar com Ctrl+C.

5. Sair

## Scraping

Otimize o scraper sem aumentar o risco de bloqueio:

- Reutilizar cache antes de fazer requisições.
- Deduplicar URLs.
- Usar concorrência limitada e configurável.
- Manter atraso/jitter entre requisições.
- Respeitar Retry-After.
- Usar retry com backoff exponencial.
- Não tentar contornar CAPTCHA, autenticação ou rate limits.
- Verificar se cada imagem local já existe antes de baixar novamente.
- Baixar os ícones definidos em digimon.json.iconMapping.
- O atributo vem do campo item.attribute.
- Para um atributo, usar a chave:
  attr${item.attribute}
- Exemplos:
  - Vaccine -> attrVaccine
  - Data -> attrData
  - Virus -> attrVirus
- Persistir o caminho local de cada ícone.
- Usar o arquivo local como principal e a URL original como fallback.
- Não implementar o campo Type.

## Card principal

Cada card deve exibir:

- Imagem principal do Digimon.
- Nome.
- Botão para abrir a página do Game8 em nova aba.
- Attribute:
  - Valor de item.attribute.
  - Ícone local correspondente.
  - URL remota como fallback.
- Generation:
  - Valor de item.generation.
- Base Personality:
  - Valor de item.basePersonality.

Não exibir Type.

## Interação dos cards

- O card inteiro deve ser clicável para expandir ou recolher.
- Clicar na imagem, nome ou área vazia do card deve alternar a expansão.
- O botão de expansão também deve funcionar.
- Clicar em links ou botões internos não deve disparar a expansão do card.
- O botão “Ver no Game8” deve abrir a URL correta em nova aba usando:
  - target="_blank"
  - rel="noreferrer"

Ao expandir, mostrar simultaneamente:

- Evolutions.
- De-evolutions.

Separar as duas seções com um divider.

Cada Digimon relacionado deve exibir:

- Nome.
- Imagem local com fallback remoto.
- Botão para abrir sua URL do Game8 em nova aba.

## Frontend

Manter os arquivos separados:

- src/web/index.html: somente estrutura HTML.
- src/web/app.js: somente lógica e interação.
- src/web/styles.css: somente estilos.

A interface deve ser responsiva:

- Funcionar em desktop e mobile.
- Reorganizar os cards em telas pequenas.
- Empilhar as seções de evolutions e de-evolutions no mobile.
- Transformar o divider vertical em horizontal no mobile.
- Evitar overflow horizontal.
- Usar dark mode.
- Exibir estados para:
  - Nenhum dado.
  - Nenhum resultado.
  - Erro ao carregar dados.
  - Evolutions vazias.
  - De-evolutions vazias.

A pesquisa deve:

- Filtrar por nome.
- Ser reativa enquanto o usuário digita.
- Não fazer nova requisição para cada tecla.
- Ser case-insensitive.

## Servidor

Use o servidor HTTP nativo do Node.js.

Endpoints:

- GET / -> index.html
- GET /app.js -> JavaScript da interface
- GET /styles.css -> CSS da interface
- GET /api/digimons -> dados enriquecidos
- GET /images/<arquivo> -> imagens locais

Implemente proteção contra path traversal e respostas HTTP apropriadas para arquivos inexistentes.

## Testes

Migrar e manter todos os testes usando Vitest.

Adicionar cobertura para:

- Carregamento de digimon-enriched.json.
- Arquivo inexistente ou JSON inválido.
- Endpoint /.
- Endpoint /api/digimons.
- Assets estáticos.
- Busca e estrutura principal da interface.
- Ícones de atributos.
- Download de imagem.
- Reutilização de imagem local sem novo download.
- Reinício completo do scraping.
- Preservação de digimon.json.
- CLI e validação da confirmação RECOMEÇAR.
- Expansão do card ao clicar em qualquer área.
- Links internos não disparando expansão.

Execute ao final:

npm test

Não faça commit. Preserve mudanças existentes e não altere arquivos sem necessidade.