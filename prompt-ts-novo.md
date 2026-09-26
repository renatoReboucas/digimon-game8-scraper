Plano: switch de favoritos e animações
O plano foi registrado em /memories/session/plan.md. O switch já atualiza seu estado diretamente, mas a filtragem percorre o catálogo e pode atrasar a atualização visível; a busca diferida não controla esse filtro. A proposta separa o estado visual urgente do switch da atualização da lista.

Etapas

Responder imediatamente ao switch — Em DigimonAtlas, atualizar o estado visual do controle no clique e aplicar o filtro em uma transição separada. Exibir os Skeletons existentes enquanto a lista atualiza, mantendo aria-busy, os estados vazios, a busca e a persistência dos favoritos.
Adicionar Anime.js — Incluir a dependência em package.json e atualizar o lockfile.
Animar expansões — Animar abertura e recolhimento dos cards principais e dos detalhes relacionados. Manter o conteúdo montado durante a animação de saída e sincronizar atributos ARIA; cancelar animações quando houver alternância rápida ou desmontagem.
Animar rolagem e entrada dos cards — Usar Anime.js para voltar ao topo, pular até a busca e revelar cards quando entrarem na viewport. Preservar foco, evitar repetir animações a cada passagem e respeitar prefers-reduced-motion.
Validar — Atualizar testes do switch e das expansões; testar as animações de rolagem com Anime.js mockado para não depender de temporizadores reais.
Arquivos relevantes

digimon-atlas.tsx — Estado do switch, filtro, Skeleton e salto até a busca.
digimon-card.tsx e related-item.tsx — Painéis expansíveis.
scroll-to-top.tsx — Animação de retorno ao topo.
globals.css — Estilos das expansões e suporte atual a movimento reduzido.
digimon-atlas.test.tsx, digimon-card-and-context.test.tsx e digimon-component-behavior.test.tsx — Testes existentes a ampliar.
package.json e package-lock.json — Dependência e lockfile.
Verificação

Executar os testes Vitest dos três arquivos indicados; confirmar que o switch responde de imediato, que a lista termina no filtro correto e que Skeletons e estados vazios continuam funcionando.
Rodar npm --prefix next-app run typecheck e npm --prefix next-app run build.
Verificar manualmente expansões, alternâncias rápidas, rolagem, foco por teclado, viewport móvel e movimento reduzido.
Decisões

“Animação do scroll” inclui rolagem suave acionada por controles e entrada animada dos cards na viewport.
O switch deve mostrar a mudança imediatamente; o Skeleton pode aparecer enquanto a lista é atualizada.
Manter acessibilidade, busca, favoritos e contrato de dados atuais; não redesenhar a interface.