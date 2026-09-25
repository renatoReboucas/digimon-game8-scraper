# Refatoração Completa da Aplicação (UI + TypeScript)

Analise todo o projeto **Next.js com TypeScript** e execute uma refatoração completa focada em dois pilares: **modernização da interface utilizando shadcn/ui** e **implementação de tipagem forte em toda a aplicação**.

O objetivo é elevar a qualidade visual e técnica do projeto sem alterar seu comportamento atual.

Preserve **100% das funcionalidades existentes**, regras de negócio, integrações, fluxos e comportamentos.

---

# 1. Refatoração Completa da Interface com shadcn/ui

Instale e configure completamente o **shadcn/ui**:

https://ui.shadcn.com/

Refatore toda a camada visual para utilizar seus componentes, padrões de design e boas práticas.

Substitua componentes visuais atuais pelos equivalentes do ecossistema shadcn/ui, incluindo:

- Button
- Card
- Table
- Dialog
- Sheet
- Input
- Select
- Form
- Dropdown Menu
- Popover
- Tooltip
- Tabs
- Badge
- Accordion
- Toast
- Data Table
- Command
- Navigation Menu
- Skeleton
- Alert Dialog
- Demais componentes aplicáveis

## Melhorias obrigatórias

- Hierarquia visual
- Consistência de design
- Espaçamentos
- Tipografia
- Responsividade
- Acessibilidade
- UX geral
- Estados de loading
- Estados vazios
- Feedback visual de ações
- Navegação visual
- Dark Mode (quando aplicável)
- Consistência entre páginas
- Design System unificado

## Diretrizes visuais

Aplique um design:

- Moderno
- Premium
- Profissional
- Escalável
- Limpo
- Responsivo
- Performático

Seguindo as melhores práticas de:

- Shadcn/UI
- Tailwind CSS
- Radix UI
- Next.js
- UX/UI moderna

Remova:

- Estilos redundantes
- Componentes legados
- CSS duplicado
- Inconsistências visuais
- Componentes que não seguem o Design System

---

# 2. Tipagem Forte e Completa com TypeScript

Analise todo o código e implemente tipagem rigorosa em toda a aplicação.

## Aplicar tipagem em:

### React

- Componentes
- Props
- Children
- Eventos
- Hooks
- Context Providers
- Context Consumers

### Estado

- useState
- useReducer
- Redux
- Zustand
- Context API
- Qualquer outro gerenciamento de estado

### Backend e comunicação

- API Clients
- Requests
- Responses
- DTOs
- Services
- Server Actions
- Route Handlers
- Middlewares

### Dados

- Models
- Entities
- Schemas
- Configurações
- Objetos compartilhados
- Utilitários
- Helpers

### Data Fetching

- React Query
- TanStack Query
- SWR
- Fetch nativo
- Mutations
- Queries

### Forms

- React Hook Form
- Zod
- Validações
- Schemas

---

# 3. Eliminação de Tipagem Fraca

Substitua completamente:

- `any`
- `@ts-ignore`
- `@ts-nocheck`
- Type assertions desnecessárias (`as`)
- Casts inseguros
- Tipagens genéricas incorretas

Utilize:

- Interfaces
- Types
- Enums
- Union Types
- Discriminated Unions
- Utility Types
- Mapped Types
- Generics
- Inferência correta do TypeScript

---

# 4. Arquitetura de Tipos

Organize a tipagem de forma profissional.

Criar estrutura semelhante a:

```txt
src/
├── types/
│   ├── api/
│   ├── dto/
│   ├── models/
│   ├── shared/
│   ├── enums/
│   ├── hooks/
│   └── index.ts
```

## Regras

- Centralizar tipos reutilizáveis
- Eliminar duplicações
- Utilizar composição de tipos
- Criar contratos reutilizáveis
- Melhorar legibilidade
- Facilitar manutenção futura

---

# 5. TypeScript Strict Mode

Garantir compatibilidade total com:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

Corrigir todos os erros e avisos de compilação relacionados ao TypeScript.

---

# 6. Qualidade de Código

Melhorar:

- Organização de arquivos
- Legibilidade
- Reutilização
- Escalabilidade
- Consistência arquitetural
- Padronização dos componentes
- Separação de responsabilidades

Seguir boas práticas modernas de:

- Next.js
- React
- TypeScript
- Clean Code
- SOLID
- Component Composition

---

# Restrições Obrigatórias

## NÃO FAZER

- Alterar regras de negócio
- Alterar funcionalidades existentes
- Alterar comportamento da aplicação
- Alterar integrações
- Alterar APIs
- Alterar endpoints
- Alterar contratos externos
- Alterar fluxo dos usuários
- Remover funcionalidades
- Criar soluções paliativas para esconder erros
- Utilizar `any` como atalho
- Quebrar compatibilidade existente

## PODE FAZER

- Refatorar componentes visuais
- Melhorar UX/UI
- Organizar a arquitetura
- Criar tipos reutilizáveis
- Melhorar estrutura do projeto
- Padronizar componentes
- Modernizar o Design System
- Aplicar boas práticas de TypeScript

---

# Resultado Esperado

A aplicação deve:

- Possuir interface moderna construída sobre **shadcn/ui**.
- Manter exatamente os mesmos comportamentos atuais.
- Possuir tipagem forte de ponta a ponta.
- Não utilizar `any` indevidamente.
- Não possuir erros de TypeScript.
- Compilar sem warnings.
- Estar preparada para crescimento em larga escala.
- Seguir as melhores práticas modernas de **Next.js**, **React**, **TypeScript**, **Tailwind CSS** e **Shadcn/UI**.
- Ter código limpo, consistente, reutilizável e de fácil manutenção.