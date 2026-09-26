# Briefing de Implementação: Nova UI do Digimon Atlas

## Objetivo

Implemente uma **nova interface completa** para o **Digimon Atlas**, um catálogo interativo de Digimon e suas relações evolutivas. Este documento é um briefing de implementação, não um pedido para documentar, copiar ou apenas polir a interface existente.

Antes de alterar o código, examine a aplicação Next.js existente para entender os dados, componentes, testes e comportamentos já disponíveis. Preserve a identidade do Digimon Atlas e todos os requisitos funcionais descritos abaixo, mas crie uma direção visual e uma composição novas. Não reproduza o layout, a paleta ou a aparência atual pixel por pixel. Não entregue apenas um mockup: implemente a experiência interativa real no app.

## Direção para a Nova UI

- Projete uma linguagem visual original, coerente com um atlas/enciclopédia de Digimon e reconhecível como parte do produto.
- Escolha uma paleta, tipografia, composição, hierarquia, espaçamento, superfícies e estados interativos novos. Defina tokens ou variáveis CSS para manter consistência.
- Faça escolhas visuais intencionais e distintas; não recorra a um dashboard genérico ou a uma landing page promocional. O catálogo utilizável deve ser a experiência principal já na primeira tela.
- Use as imagens reais dos Digimon disponíveis nos dados como conteúdo visual central. Não as substitua por ilustrações decorativas ou placeholders quando houver imagens válidas.
- Mantenha texto legível, contraste adequado e componentes compactos o bastante para facilitar busca, comparação e uso repetido.
- Reorganize livremente os elementos da página e dos cards, desde que todos os conteúdos e controles funcionais especificados continuem claros e acessíveis.

## Conteúdo e Hierarquia Funcional

1. **Cabeçalho do catálogo**
   - Uma pequena identificação acima do título: “Digimon Story Time Stranger”.
   - Título principal “Digimon Atlas” e subtítulo curto que explique a busca pela linha evolutiva.
   - Campo de pesquisa com ícone de lupa, placeholder “Pesquisar por nome...” e botão para limpar quando houver texto.
   - Controle switch “Apenas favoritos”.
   - Área de consentimento de favoritos ou status da autorização, posicionada junto aos controles.
   - Contagem de Digimon encontrados e total de favoritos.

2. **Lista do catálogo**
   - Apresente os resultados em uma composição adequada à nova direção visual, sem obrigação de repetir a lista vertical atual.
   - Cada item deve comunicar imagem, número quando disponível, nome, atributo/geração e ações para expandir, filtrar e favoritar.
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
- Em telas pequenas, adapte navegação, filtros, cards e relações à largura disponível; mantenha ações essenciais visíveis ou facilmente alcançáveis. Use ícones compactos quando apropriado, sempre com nomes acessíveis.
- Use elementos semânticos, títulos em ordem lógica, labels para campos, nomes acessíveis para botões e estados como `aria-expanded`, `aria-pressed` e `aria-busy` quando forem pertinentes.
- Garanta que os controles funcionem por teclado, mantenham foco visível e que links externos sejam seguros.
- Carregue imagens de forma preguiçosa e trate falhas com fallback apropriado.
- Use animações sutis para expansão, entrada dos cards e rolagem. Respeite `prefers-reduced-motion` reduzindo ou removendo movimento.

## Dados e Limites do Escopo

- O catálogo é carregado no servidor a partir dos dados enriquecidos e também é disponibilizado pela rota `GET /api/digimons`.
- Os dados podem ser esparsos: número, imagem, nível, atributo, descrição, personalidade, classificação, data de lançamento, Fields, Skills e relações podem faltar. Renderize apenas valores presentes e aceite aliases conhecidos, sem exibir campos vazios ou inventar informações.
- O escopo é a experiência principal em Next.js do Digimon Atlas. Não inclua a CLI, o processo de scraping nem a interface web legada do diretório `scrape/` como partes desta página.
- Não adicione autenticação, contas, sincronização de favoritos entre dispositivos, páginas de detalhe independentes ou outras funções não descritas.

## Implementação no Projeto Existente

- Implemente a nova UI dentro de `next-app/`, respeitando a arquitetura Next.js, React e TypeScript já configurada.
- Reaproveite os tipos, a API, o carregamento de dados, o store de favoritos, a lógica de busca e os componentes úteis existentes. Atualize ou componha esses componentes quando necessário; não duplique regras de negócio para facilitar o redesenho.
- Mantenha contratos existentes, incluindo `GET /api/digimons`, o parâmetro de busca `q`, a persistência local consentida e os estados de carregamento e erro.
- Use os componentes e bibliotecas de UI já instalados quando forem adequados. Evite adicionar dependências sem necessidade.
- Atualize os testes relevantes para cobrir os fluxos preservados e rode os testes focados e o typecheck do app ao concluir.
