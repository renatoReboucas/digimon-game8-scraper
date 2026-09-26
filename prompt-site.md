# Prompt de Referência: Digimon Atlas

## Objetivo

Use este prompt para reconstruir, aprimorar ou descrever a interface principal do **Digimon Atlas**, um catálogo interativo de Digimon e suas relações evolutivas. Preserve a estrutura e os comportamentos abaixo. Não invente páginas ou funcionalidades que não estejam especificadas.

## Identidade Visual

- Crie uma interface de catálogo, não uma landing page de marketing.
- Use tema escuro: fundo azul-marinho quase preto com um brilho radial discreto no alto à direita, superfícies de cards ligeiramente mais claras e bordas suaves.
- Use verde/teal como cor primária e de foco; reserve dourado para estados de favorito e use coral para ações destrutivas.
- O texto principal é claro e o texto secundário tem contraste mais suave.
- Use tipografia sem serifa para a interface e uma serifada editorial nos títulos principais e títulos de seção, como na identidade atual.
- Mantenha espaçamento compacto, hierarquia clara e cards com cantos discretamente arredondados. A página é centralizada, tem largura máxima aproximada de 78rem e rolagem vertical.
- Evite decoração que concorra com o catálogo. O conteúdo dos Digimon deve ser o foco.

## Estrutura da Página

1. **Cabeçalho do catálogo**
   - Uma pequena identificação acima do título: “Digimon Story Time Stranger”.
   - Título principal “Digimon Atlas” e subtítulo curto que explique a busca pela linha evolutiva.
   - Campo de pesquisa com ícone de lupa, placeholder “Pesquisar por nome...” e botão para limpar quando houver texto.
   - Controle switch “Apenas favoritos”.
   - Área de consentimento de favoritos ou status da autorização, posicionada junto aos controles.
   - Contagem de Digimon encontrados e total de favoritos.

2. **Lista do catálogo**
   - Apresente os resultados como uma lista vertical de cards, em uma única coluna.
   - Cada card começa com imagem do Digimon, número quando disponível, nome, indicador para expandir, tags de atributo/geração e ações de contexto.
   - Inclua uma grade de metadados apenas para os campos disponíveis e um link para a página correspondente no Game8.
   - As imagens devem priorizar o arquivo local, recorrer à URL remota se a imagem local falhar e manter texto alternativo com o nome do Digimon.

3. **Conteúdo expandido do card**
   - Ao expandir um card, revele as seções “Evolutions” e “De-evolutions”, separadas visualmente.
   - Em telas largas, disponha as seções lado a lado com divisor vertical. Em telas estreitas, empilhe-as e use divisor horizontal.
   - Cada relação é um item expansível com imagem, nome, número, nível/geração e atributo quando disponíveis.
   - Ao expandir um item relacionado, mostre descrição, metadados e quaisquer campos adicionais disponíveis, como Fields, Skills e relações anteriores ou seguintes.
   - Ofereça ações para abrir o Game8 e filtrar o catálogo pelo Digimon relacionado.

4. **Navegação auxiliar**
   - Mostre um botão discreto para voltar ao topo depois que a pessoa rolar a página.
   - Use tooltips para esclarecer ícones e ações compactas.

## Funcionalidades e Interações

- Pesquise por nome enquanto a pessoa digita, sem solicitar novamente o catálogo a cada tecla. A busca ignora diferenças entre maiúsculas/minúsculas e espaços nas extremidades.
- Sincronize o termo de busca com o parâmetro `q` da URL, substituindo o histórico em vez de criar uma entrada a cada tecla. Ofereça ação clara para limpar a busca.
- Combine a busca por nome com o switch de favoritos.
- Ao usar a ação de filtro de um card ou relação, pesquise pelo nome desse Digimon, desative o filtro de favoritos e mova o foco para o campo de busca.
- Permita expandir e recolher cards e itens relacionados por controles nomeados. Não deixe ações de botão ou links dispararem a expansão do card pai.
- Abra links do Game8 em nova aba e com atributos de segurança apropriados.
- Salve favoritos no armazenamento local somente após autorização. Antes da escolha, permita aceitar ou recusar; não grave favoritos sem autorização.
- Persista a escolha de consentimento entre visitas. Com autorização concedida, apresente o estado de favoritos salvos e permita revogar, confirmando antes de apagar os favoritos locais. Com autorização recusada, apresente o estado desativado e permita rever a escolha.
- Não mostre o pedido de consentimento durante a leitura inicial do armazenamento. Depois da inicialização, mostre o estado correspondente à escolha persistida.
- Se a pessoa tentar favoritar sem autorização, solicite autorização e só grave o favorito depois que ela aceitar.
- Mantenha disponível a medição de navegação do Vercel Analytics; ela é informada separadamente do armazenamento local de favoritos.

## Estados da Interface

- **Carregamento inicial:** preserve a estrutura geral e use skeletons para cabeçalho, pesquisa e cards. Anuncie o carregamento a tecnologias assistivas e marque a região principal como ocupada.
- **Busca ou filtro em atualização:** mostre placeholders de cards enquanto os resultados adiados são atualizados.
- **Catálogo vazio:** informe que não há Digimon disponíveis.
- **Busca sem resultados:** informe que nenhum Digimon corresponde à pesquisa.
- **Filtro sem favoritos correspondentes:** apresente uma mensagem específica para esse estado.
- **Filtro por card pai sem correspondência:** explique que o card não atende aos filtros atuais.
- **Evolução sem registros:** mostre um estado vazio na seção correspondente, sem remover a seção.
- **Falha ao carregar dados:** apresente a mensagem de erro no lugar da contagem e não mostre cards ou estados vazios enganosos.
- **Armazenamento indisponível:** mantenha a interface utilizável durante a sessão, sem afirmar que os dados foram persistidos quando o navegador bloqueia o armazenamento.

## Responsividade, Acessibilidade e Movimento

- Faça o layout funcionar em desktop e mobile sem overflow horizontal.
- Em telas pequenas, reduza espaçamentos e imagens dos cards, empilhe as seções evolutivas e mantenha ações essenciais acessíveis. Use ícones compactos para favoritos, mas preserve nomes acessíveis para leitores de tela.
- Use elementos semânticos, títulos em ordem lógica, labels para campos, nomes acessíveis para botões e estados como `aria-expanded`, `aria-pressed` e `aria-busy` quando forem pertinentes.
- Garanta que os controles funcionem por teclado, mantenham foco visível e que links externos sejam seguros.
- Carregue imagens de forma preguiçosa e trate falhas com fallback apropriado.
- Use animações sutis para expansão, entrada dos cards e rolagem. Respeite `prefers-reduced-motion` reduzindo ou removendo movimento.

## Dados e Limites do Escopo

- O catálogo é carregado no servidor a partir dos dados enriquecidos e também é disponibilizado pela rota `GET /api/digimons`.
- Os dados podem ser esparsos: número, imagem, nível, atributo, descrição, personalidade, classificação, data de lançamento, Fields, Skills e relações podem faltar. Renderize apenas valores presentes e aceite aliases conhecidos, sem exibir campos vazios ou inventar informações.
- O escopo é a experiência principal em Next.js do Digimon Atlas. Não inclua a CLI, o processo de scraping nem a interface web legada do diretório `scrape/` como partes desta página.
- Não adicione autenticação, contas, sincronização de favoritos entre dispositivos, páginas de detalhe independentes ou outras funções não descritas.
