Analise todo o projeto Next.js com TypeScript e realize uma tipagem completa, consistente e rigorosa em toda a aplicação. O objetivo é eliminar o uso de `any`, corrigir inferências incorretas e garantir total segurança de tipos sem alterar o comportamento da aplicação.

Crie e aplique interfaces, types, enums, generics e utility types apropriados para todos os elementos do sistema, incluindo:

- Componentes React
- Props
- Hooks customizados
- Contexts
- Stores
- Estados (useState, reducers, Zustand, Redux, etc.)
- Funções utilitárias
- Services
- API clients
- Responses e requests de APIs
- Formulários
- Eventos do React
- Objetos de configuração
- Helpers
- Tipos compartilhados
- Middlewares
- Server Actions
- Rotas da App Router
- Queries e mutations
- Tabelas e listas de dados

Substitua todos os usos de:
- `any`
- `unknown` utilizados incorretamente
- type assertions desnecessárias (`as`)
- `@ts-ignore`
- `@ts-nocheck`

por tipagens apropriadas e seguras.

Organize os tipos de forma profissional:
- Criar pasta dedicada para tipos globais e compartilhados.
- Evitar duplicação de interfaces.
- Centralizar modelos reutilizáveis.
- Utilizar composição de tipos quando apropriado.
- Aplicar generics para aumentar reutilização e escalabilidade.

Ative e adeque o projeto para funcionar corretamente com configurações rigorosas do TypeScript:
- `"strict": true`
- `"noImplicitAny": true`
- `"strictNullChecks": true`
- `"noUncheckedIndexedAccess": true`
- `"exactOptionalPropertyTypes": true`

Corrija todos os erros e avisos de tipagem encontrados pelo TypeScript sem criar soluções paliativas.

Importante:
- Não alterar regras de negócio.
- Não alterar funcionalidades existentes.
- Não modificar fluxos da aplicação.
- Não alterar design ou interface visual.
- Não remover recursos.
- Não substituir bibliotecas sem necessidade.
- Não criar contornos para esconder erros de tipagem.

Ao final, o projeto deve possuir tipagem forte de ponta a ponta (end-to-end), seguir as melhores práticas modernas de TypeScript, estar preparado para manutenção em larga escala e compilar sem erros ou warnings de TypeScript.