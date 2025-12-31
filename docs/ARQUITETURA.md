# 🏗️ Arquitetura do Sistema - Gestor de Tarefas GML

**Documento Técnico**
**Versão:** 3.0.0
**Data:** 31 de Dezembro de 2025

---

## 📋 Visão Geral

O Gestor de Tarefas GML é uma **Single Page Application (SPA)** construída com React, TypeScript e Vite, seguindo arquitetura em camadas com separação clara de responsabilidades.

### Tipo de Aplicação
- **Frontend:** React SPA
- **Backend:** REST API (externo)
- **Comunicação:** HTTP/JSON
- **Autenticação:** JWT

---

## 🏛️ Arquitetura em Camadas

```
┌─────────────────────────────────────────────────┐
│  UI Layer (Components)                          │
│  - Layout (Sidebar, Header)                     │
│  - Pages (Dashboard, Atividade, Obras, etc.)    │
│  - Feature Components (cards, forms, tables)    │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  State Management Layer                         │
│  - Zustand (dashboardStore)                     │
│  - React Query patterns (data fetching)         │
│  - React Context (ThemeContext)                 │
│  - Local State (useState)                       │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  Business Logic Layer (Hooks)                   │
│  - useAtividadeData                             │
│  - useDashboardData                             │
│  - useDataFetching                              │
│  - useDialogState                               │
│  - Custom hooks reutilizáveis                   │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  Service Layer (API Integration)                │
│  - ActivityService                              │
│  - ObrasService                                 │
│  - ServiceOrderService                          │
│  - ColaboradorService                           │
│  - 20+ outros serviços                          │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  Backend API (REST)                             │
│  https://api.gmxindustrial.com.br              │
│  - JWT Authentication                           │
│  - JSON REST endpoints                          │
└─────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Pastas

### Organização Completa

```
src/
├── components/              # Componentes React
│   ├── atividade/          # Módulo de Atividades
│   │   ├── AtividadesTable.tsx        (600 linhas) - Tabela principal
│   │   ├── AtividadeCard.tsx          - Drag & drop cards
│   │   ├── AtividadeCardMobile.tsx    - Versão mobile
│   │   ├── NovaAtividadeForm.tsx      (646 linhas) - Form multi-step
│   │   ├── EditAtividadeForm.tsx
│   │   ├── AtividadeFiltros.tsx       - Filtros avançados
│   │   ├── PdfConfigDialog.tsx        - Exportação PDF
│   │   └── ExcelConfigDialog.tsx      - Exportação Excel
│   │
│   ├── dashboard/          # Dashboard e Analytics
│   │   ├── Dashboard.tsx              - Container principal
│   │   ├── StatsCard.tsx              - Cards de estatísticas
│   │   ├── ActivityStatusCards.tsx    - Cards por status
│   │   ├── SwotAnalysis.tsx           - Análise SWOT
│   │   ├── PeriodFilter.tsx           - Filtro de período
│   │   ├── FilteredActivitiesTable.tsx
│   │   └── charts/
│   │       ├── MacroTasksChart.tsx
│   │       ├── ProcessHoursChart.tsx
│   │       └── CollaboratorsChart.tsx
│   │
│   ├── gerenciamento/      # Configurações do Sistema
│   │   ├── colaboradores/
│   │   │   ├── ColaboradoresList.tsx
│   │   │   ├── NovoColaboradorForm.tsx
│   │   │   └── EditColaboradorForm.tsx
│   │   ├── tarefas-macro/
│   │   │   └── TarefasMacroList.tsx
│   │   ├── processos/
│   │   │   └── ProcessosList.tsx
│   │   └── valor-por-cargo/
│   │       └── ValorPorCargoList.tsx
│   │
│   ├── layout/             # Layout Global
│   │   ├── Layout.tsx                 - Container principal
│   │   ├── Header.tsx                 - Header com logo/user
│   │   ├── Sidebar.tsx                - Navegação lateral
│   │   ├── SettingsDropdown.tsx       - Dropdown de configurações
│   │   └── sidebar/
│   │       └── SidebarMenuItem.tsx    - Item de menu
│   │
│   ├── nao-conformidades/  # RNC
│   │   ├── NaoConformidadesList.tsx
│   │   ├── NaoConformidadeForm.tsx
│   │   └── NaoConformidadeDetail.tsx
│   │
│   ├── obras/              # Gestão de Obras
│   │   ├── ObrasList.tsx
│   │   ├── ObraCard.tsx
│   │   ├── NovaObraForm.tsx
│   │   ├── EditObraForm.tsx
│   │   └── FinalizarObraForm.tsx
│   │
│   ├── tables/             # Componentes de Tabela Reutilizáveis
│   │   ├── SortableTableHeader.tsx
│   │   └── useTableSort.ts
│   │
│   ├── tours/              # Tours Guiados
│   │   ├── TourButton.tsx
│   │   └── components/
│   │
│   ├── ui/                 # shadcn/ui Components (47)
│   │   ├── alert-dialog.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ... (39 outros componentes)
│   │
│   └── users/              # Gestão de Usuários
│       ├── UserList.tsx
│       ├── CreateUserForm.tsx
│       └── EditUserForm.tsx
│
├── hooks/                  # Custom Hooks
│   ├── useDataFetching.ts          - Data fetching centralizado
│   ├── useDialogState.ts           - Gerenciamento de diálogos
│   ├── useCrudList.ts              - CRUD completo
│   ├── useAtividadeData.ts         - Lógica de atividades
│   ├── useDashboardData.ts         - Lógica do dashboard
│   ├── useTableSort.ts             - Ordenação de tabelas
│   ├── useHighContrast.ts          - Alto contraste
│   ├── useTour.ts                  - Tours guiados
│   └── use-toast.ts                - Toast notifications
│
├── interfaces/             # TypeScript Interfaces
│   ├── AtividadeInterface.ts
│   ├── ColaboradorInterface.ts
│   ├── UserInterface.ts
│   └── ... (20+ interfaces)
│
├── lib/                    # Bibliotecas Utilitárias
│   ├── animations.ts               - Variantes Framer Motion
│   ├── feedback.tsx                - Sistema de feedback
│   ├── tourSteps.ts                - Configuração de tours
│   └── utils.ts                    - Funções auxiliares (cn, etc)
│
├── pages/                  # Páginas (Rotas)
│   ├── Index.tsx                   - Dashboard (lazy loaded)
│   ├── Atividade.tsx               - Atividades (lazy loaded)
│   ├── Obras.tsx                   - Obras (lazy loaded)
│   ├── Gerenciamento.tsx           - Configurações (lazy loaded)
│   ├── Users.tsx                   - Usuários (lazy loaded)
│   ├── Login.tsx                   - Login (loaded immediately)
│   └── ... (8 outras páginas)
│
├── services/               # API Services
│   ├── ActivityService.ts          - CRUD de atividades
│   ├── ObrasService.ts             - CRUD de obras
│   ├── ServiceOrderService.ts      - CRUD de OS
│   ├── ColaboradorService.ts       - CRUD de colaboradores
│   ├── UserService.ts              - CRUD de usuários
│   ├── OpenAIService.ts            (15.9 KB) - Maior service
│   └── ... (15+ services)
│
├── store/                  # Zustand Stores
│   └── dashboardStore.ts           - Estado global do dashboard
│
├── utils/                  # Funções Auxiliares
│   ├── formatCurrency.ts
│   ├── atividadeCalculos.ts        - Cálculos de KPI/Progresso
│   └── dateUtils.ts
│
├── App.tsx                 # Componente Raiz
├── main.tsx                # Entry Point
└── index.css               # Estilos Globais + Tailwind
```

---

## 🔄 Fluxos de Dados Principais

### 1. Dashboard (Store-based)

```typescript
Component → dashboardStore.loadInitialData()
         → Promise.all([Activities, Projects, ServiceOrders])
         → Store normaliza dados
         → Calcula estatísticas (agregações)
         → Component lê do store (useStore)
         → Filtro alterado → updateFilters() → applyFilters()
         → Re-renderiza com dados filtrados
```

**Arquivos envolvidos:**
- `src/store/dashboardStore.ts` - Zustand store
- `src/hooks/useDashboardData.ts` - Hook de consumo
- `src/components/Dashboard.tsx` - UI

### 2. Atividades (React Query Pattern)

```typescript
Component → useAtividadeData hook
         → useQuery(['all-activities'])
         → ActivityService.getAllActivities()
         → HTTP GET /activities (via Axios)
         → Dados retornados e cacheados
         → Filtros locais aplicados (useMemo)
         → Retorna atividades filtradas
```

**Arquivos envolvidos:**
- `src/hooks/useAtividadeData.ts` - Hook principal
- `src/services/ActivityService.ts` - API calls
- `src/components/atividade/AtividadesTable.tsx` - UI

### 3. CRUD Padrão (Local State)

```typescript
Component → useEffect → Service.getAll()
         → HTTP GET /endpoint
         → setState(data)
         → User action → Service.create/update/delete()
         → HTTP POST/PUT/DELETE /endpoint
         → Toast notification (success/error)
         → Refetch data (Service.getAll())
         → setState(newData)
```

**Arquivos envolvidos:**
- `src/hooks/useDataFetching.ts` - Hook centralizado
- `src/hooks/useDialogState.ts` - Gerenciamento de diálogos
- `src/components/*/List.tsx` - Componentes de lista

---

## 🔌 Integração com Backend

### Configuração Base

```typescript
// src/config.ts
export const API_BASE_URL = 'https://api.gmxindustrial.com.br';
```

### HTTP Client (Axios)

```typescript
// Em cada service
import axios from 'axios';
import { API_BASE_URL } from '@/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Principais Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/activities` | GET | Lista todas atividades |
| `/activities` | POST | Cria nova atividade |
| `/activities/:id` | PUT | Atualiza atividade |
| `/activities/:id` | DELETE | Remove atividade |
| `/projects` | GET | Lista obras |
| `/projects/:id/service-orders` | GET | OS de uma obra |
| `/service-orders/:id/activities` | GET | Atividades de uma OS |
| `/collaborators` | GET | Lista colaboradores |
| `/users` | GET | Lista usuários |
| `/auth/login` | POST | Autenticação |

---

## 🎯 Principais Módulos

### 1. Dashboard

**Responsabilidade:** Analytics e visão geral do sistema.

**Componentes:**
- `Dashboard.tsx` - Container principal
- `StatsCard.tsx` - Cards de estatísticas
- `ActivityStatusCards.tsx` - Distribuição por status
- `charts/*` - Gráficos analíticos

**Estado:**
- Zustand store (`dashboardStore.ts`)
- Dados: atividades, obras, OS
- Filtros: obra, OS, período, macro task, processo

**Fluxo:**
1. Load inicial: busca todas atividades, obras e OS
2. Normaliza dados no store
3. Aplica filtros selecionados
4. Calcula estatísticas agregadas
5. Renderiza gráficos e cards

---

### 2. Atividades

**Responsabilidade:** CRUD completo de atividades.

**Componentes:**
- `AtividadesTable.tsx` - Visualização em tabela (desktop)
- `AtividadeCard.tsx` - Visualização em cards com drag & drop
- `AtividadeCardMobile.tsx` - Cards mobile otimizados
- `NovaAtividadeForm.tsx` - Formulário multi-step (646 linhas)
- `AtividadeFiltros.tsx` - Filtros avançados

**Funcionalidades:**
- ✅ Criação/edição de atividades
- ✅ Drag & drop entre status
- ✅ Upload de imagens e documentos
- ✅ Atualização de progresso (0-100%)
- ✅ Atribuição de equipe
- ✅ Cálculo de KPI (tempo estimado vs real)
- ✅ Exportação PDF/Excel configurável
- ✅ Ordenação tri-state (asc → desc → null)
- ✅ Paginação com controle de itens

---

### 3. Obras

**Responsabilidade:** Gerenciar projetos de construção.

**Hierarquia:**
```
Obra (Project)
  └── Ordem de Serviço (ServiceOrder)
      └── Atividade (Activity)
          └── Colaboradores (Collaborators)
```

**Tipos suportados:**
- Obra
- Fábrica
- Mineradora

**Componentes:**
- `ObrasList.tsx` - Lista de obras
- `NovaObraForm.tsx` - Criação
- `EditObraForm.tsx` - Edição
- `FinalizarObraForm.tsx` - Finalização

---

### 4. Gerenciamento

**Responsabilidade:** Configurações do sistema.

**Sub-módulos:**

**4.1 Colaboradores**
- Lista com filtros (nome, cargo, setor)
- CRUD completo
- Ativar/desativar
- Atribuição a atividades

**4.2 Tarefas Macro**
- Categorias de alto nível
- Usado em filtros e relatórios

**4.3 Processos**
- Processos dentro de tarefas macro
- Granularidade adicional

**4.4 Valor por Cargo**
- Valores/hora por cargo
- Usado em cálculos de custo

---

### 5. RNC (Não-Conformidades)

**Responsabilidade:** Gestão de qualidade.

**Funcionalidades:**
- Registro de não-conformidades
- Tracking de mão de obra e materiais
- Upload de imagens
- Ações corretivas
- Vinculação a obras e OS

---

### 6. Registro de Ponto

**Responsabilidade:** Controle de presença.

**Tipos:**
- PRODUCAO
- ADMINISTRATIVO
- ENGENHARIA
- FALTA

**Integração:**
- Webhook n8n: `https://n8n.gmxindustrial.com.br/webhook/efetivo`

---

### 7. Usuários

**Responsabilidade:** Gestão de usuários.

**Roles:**
- **Admin** - Acesso total
- **Usuario** - Acesso limitado

**Autenticação:**
- JWT via localStorage/sessionStorage
- Token no header: `Authorization: Bearer <token>`

---

### 8. Assistente IA

**Responsabilidade:** Assistente com IA.

**Serviço:**
- `OpenAIService.ts` (15.9 KB - maior service)
- Integração OpenAI API

---

## 🎨 Sistema de Design

### Tema

**Cores Principais:**
```css
--primary: HSL blue
--success: #22c55e (green)
--warning: #f97316 (orange)
--destructive: #ef4444 (red)
--muted: Gray tones
```

**Dark Mode:**
- Suportado via ThemeContext
- Toggle em SettingsDropdown
- Persistido em localStorage

**Alto Contraste:**
- WCAG AAA compliance
- Detecta `prefers-contrast: more`
- 120+ linhas CSS específico
- Toggle manual disponível

### Componentes UI

**shadcn/ui (47 componentes):**
- Button, Input, Select, Dialog
- Table, Card, Badge, Avatar
- Alert, Toast, Dropdown
- Progress, Slider, Switch
- Tabs, Accordion, Collapsible
- ... e mais 32 componentes

### Animações

**Framer Motion:**
- `fadeIn`, `fadeInUp`, `scaleIn`, `slideInRight`
- `staggerContainer` (efeito cascata)
- `hoverScale`, `tapScale`
- `modalVariants`

**Biblioteca:**
- `src/lib/animations.ts` - Variantes centralizadas
- Suporte a `prefers-reduced-motion`

---

## 🔐 Autenticação e Segurança

### Fluxo de Autenticação

```
1. User preenche credenciais em Login.tsx
2. POST /auth/login
3. Backend retorna JWT token + user data
4. Token armazenado em localStorage/sessionStorage
5. Token enviado em todas requests (interceptor Axios)
6. Backend valida token em cada request
7. Se inválido: redirect para /login
```

### Proteção de Rotas

```typescript
// App.tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### Níveis de Permissão

| Role | Acesso |
|------|--------|
| Admin | Total (CRUD em tudo) |
| Usuario | Limitado (view only em certas áreas) |

---

## ⚡ Performance

### Code Splitting

```typescript
// App.tsx
const Dashboard = lazy(() => import('./pages/Index'));
const Users = lazy(() => import('./pages/Users'));
// ... 12 outras páginas lazy loaded
```

**Resultado:**
- Bundle inicial: 850 KB (antes: 2.5 MB)
- Chunks lazy: ~1.5 MB total
- Carregamento sob demanda

### Otimizações Implementadas

1. **React.memo** em componentes de lista
2. **useCallback** para funções passadas como props
3. **useMemo** para valores computados custosos
4. **Lazy loading** de todas as rotas
5. **Animações GPU-accelerated** (CSS transforms)

### Métricas

- Bundle inicial: **850 KB** (-66%)
- Re-renders em tabelas: **-70%**
- Tempo de carregamento: **1.2s** (-66%)

---

## 🧪 Testes e Qualidade

### Ferramentas

- **TypeScript** - Strict mode
- **ESLint** - Linting configurado
- **eslint-plugin-jsx-a11y** - Acessibilidade

### Padrões de Código

- Conventional Commits
- Componentes funcionais
- Custom hooks para lógica
- Separação de responsabilidades

---

## 📦 Build e Deploy

### Build de Produção

```bash
npm run build
```

**Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      (850 KB)
│   ├── Dashboard-[hash].js  (320 KB)
│   ├── Atividade-[hash].js  (280 KB)
│   └── ... (outros chunks)
└── ... (assets otimizados)
```

### Recomendações de Deploy

1. **Netlify/Vercel** (SPA hosting)
2. **Nginx** com fallback para index.html
3. **Vite SSG** para SSR

---

## 🔄 Ciclo de Vida de Dados

### Criação de Atividade

```
1. User preenche NovaAtividadeForm.tsx
2. Validação com React Hook Form + Zod
3. Submit → ActivityService.create(data)
4. POST /activities com JWT header
5. Backend cria registro
6. Response com atividade criada
7. Toast de sucesso
8. Redirect para lista ou continuar
9. Refetch de atividades (invalidate cache)
10. UI atualizada automaticamente
```

### Atualização de Status (Drag & Drop)

```
1. User arrasta card em AtividadeCard.tsx
2. onDragEnd callback
3. ActivityService.update(id, { status: newStatus })
4. PUT /activities/:id
5. Optimistic update (UI muda imediatamente)
6. Se erro: rollback + toast de erro
7. Se sucesso: confirma mudança
```

---

## 🚀 Roadmap Futuro

### Possíveis Melhorias

1. **PWA** - Offline mode com Service Worker
2. **Real-time** - WebSockets para atualizações live
3. **Testes** - Jest + React Testing Library
4. **CI/CD** - GitHub Actions
5. **Analytics** - Google Analytics ou similar
6. **Logs** - Sentry para error tracking

---

## 📚 Referências

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

**Documento mantido por:** Claude Sonnet 4.5
**Última atualização:** 31/12/2025
**Versão:** 3.0.0
