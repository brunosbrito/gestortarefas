# 🏗️ Gestor de Tarefas GML

Sistema completo de gestão de projetos de construção e industrial desenvolvido para GML Estruturas.

![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.3.1-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8?logo=tailwindcss)

---

## 📋 Sobre o Projeto

O **Gestor de Tarefas GML** é uma aplicação web moderna para gerenciamento completo de projetos de construção, fábricas e mineradoras. O sistema permite controle detalhado de obras, ordens de serviço, atividades, colaboradores, registro de ponto e não-conformidades (RNC).

### Principais Funcionalidades

- 📊 **Dashboard Analítico** - Visão geral com estatísticas, gráficos e análise SWOT
- 🏗️ **Gestão de Obras** - Controle completo de projetos (Obra, Fábrica, Mineradora)
- 📋 **Ordens de Serviço** - Gerenciamento de OS com progresso e status
- ✅ **Atividades** - CRUD completo, drag & drop, tracking de tempo e progresso
- 👥 **Colaboradores** - Gestão de equipe com setores e cargos
- 🕒 **Registro de Ponto** - Controle de presença e efetivo
- ⚠️ **Não-Conformidades (RNC)** - Gestão de qualidade com tracking de custos
- 🎯 **Módulo Qualidade** - Sistema completo ISO 9001 (9 funcionalidades integradas)
  - 🤖 Assistente IA Qualidade - Análises e insights com IA
  - 📋 Análise e Ações Corretivas - 5 Porquês, Ishikawa, Plano de Ação 5W2H
  - 🔍 Inspeções - Formulários customizáveis e rastreamento
  - 📜 Certificados - Upload, validação e envio automatizado
  - ⚙️ Calibração - Controle de equipamentos e alertas de vencimento
  - 📊 Dashboard Qualidade - KPIs e métricas em tempo real
  - 📚 Databook - Geração automática de dossiê técnico por obra
  - 🔔 Notificações - Alertas proativos de calibração, certificados e ações
  - ✉️ Email Avançado - Templates e histórico de envios
- 👤 **Usuários** - Autenticação JWT com roles (Admin/Usuário)
- 🤖 **Assistente IA** - Integração com OpenAI

---

## 🚀 Tecnologias Principais

### Core
- **React 18.3.1** - Biblioteca UI
- **TypeScript 5.5.3** - Tipagem estática
- **Vite 5.3.1** - Build tool e dev server
- **React Router 6.26.0** - Roteamento SPA

### UI/UX
- **Tailwind CSS 3.4.1** - Utility-first CSS
- **shadcn/ui** - Componentes acessíveis (47 componentes)
- **Framer Motion 11.0.0** - Animações
- **Lucide React** - Ícones
- **Driver.js 1.3.1** - Tours guiados

### Estado e Dados
- **Zustand 4.5.2** - State management
- **Axios 1.7.7** - HTTP client
- **React Query patterns** - Data fetching

### Formulários e Validação
- **React Hook Form 7.52.1** - Gerenciamento de forms
- **Zod** - Validação de schemas

### Gráficos e Visualização
- **Recharts 2.12.7** - Gráficos responsivos
- **jsPDF / jspdf-autotable** - Exportação PDF
- **ExcelJS** - Exportação Excel

### Outras
- **date-fns** - Manipulação de datas
- **react-beautiful-dnd** - Drag & drop
- **OpenAI API** - Assistente inteligente
- **Sonner** - Toast notifications

---

## 📁 Estrutura do Projeto

```
gestortarefas/
├── src/
│   ├── components/          # Componentes React
│   │   ├── atividade/      # Gestão de atividades
│   │   ├── dashboard/      # Dashboard e analytics
│   │   ├── gerenciamento/  # Configurações (colaboradores, etc)
│   │   ├── layout/         # Layout (Header, Sidebar)
│   │   ├── nao-conformidades/ # RNC
│   │   ├── obras/          # Gestão de obras
│   │   ├── qualidade/      # Componentes do Módulo Qualidade
│   │   ├── tables/         # Tabelas reutilizáveis
│   │   ├── tours/          # Tours guiados
│   │   ├── ui/             # shadcn/ui components (47)
│   │   └── users/          # Gestão de usuários
│   ├── hooks/              # Custom hooks
│   ├── interfaces/         # TypeScript interfaces
│   ├── lib/                # Bibliotecas utilitárias
│   ├── pages/              # Páginas (rotas)
│   │   ├── qualidade/      # Módulo Qualidade (9 funcionalidades)
│   │   │   ├── assistente-ia/
│   │   │   ├── acoes-corretivas/
│   │   │   ├── inspecoes/
│   │   │   ├── planos-inspecao/
│   │   │   ├── certificados/
│   │   │   ├── calibracao/
│   │   │   ├── databook/
│   │   │   └── index.tsx   # Dashboard Qualidade
│   │   └── ...
│   ├── services/           # API services
│   ├── store/              # Zustand stores
│   ├── utils/              # Funções auxiliares
│   ├── App.tsx             # Componente raiz
│   └── main.tsx            # Entry point
├── docs/                   # Documentação
│   ├── ARQUITETURA.md      # Arquitetura do sistema
│   ├── GUIA_DESENVOLVEDOR.md # Guia do desenvolvedor
│   ├── ESTRUTURA_DADOS.md  # Estrutura de dados
│   ├── ATUALIZACAO_VISUAL.md # Refatoração recente
│   └── MODERNIZACAO_COMPLETA.md # Histórico de mudanças
├── public/                 # Assets estáticos
└── package.json            # Dependências
```

---

## 🛠️ Instalação e Setup

### Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** ou **pnpm** ou **bun**
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Entre no diretório
cd gestortarefas

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
# Crie um arquivo .env.local com:
# VITE_API_URL=https://api.gmxindustrial.com.br
# VITE_OPENAI_API_KEY=sua_chave_openai

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento (Vite)
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

---

## 🏗️ Arquitetura

### Hierarquia de Dados

```
Obra (Project)
  └── Ordem de Serviço (ServiceOrder)
      └── Atividade (Activity)
          └── Colaboradores (Collaborators)
```

### Principais Módulos

1. **Dashboard** - Analytics e visão geral
2. **Atividades** - Gestão de tarefas (tabela e cards)
3. **Obras** - Projetos (Obra/Fábrica/Mineradora)
4. **Gerenciamento** - Configurações do sistema
5. **RNC** - Não-conformidades
6. **Qualidade** - Sistema completo ISO 9001
   - Assistente IA Qualidade
   - Análise e Ações Corretivas (5 Porquês, Ishikawa, 5W2H)
   - Inspeções e Planos de Inspeção
   - Gestão de Certificados com envio automatizado
   - Controle de Calibração de equipamentos
   - Dashboard com KPIs em tempo real
   - Geração automática de Databook
   - Sistema de notificações e alertas
   - Templates de email personalizáveis
7. **Registro de Ponto** - Controle de presença
8. **Usuários** - Autenticação e permissões
9. **Assistente IA** - Suporte inteligente

Para mais detalhes, consulte [ARQUITETURA.md](./docs/ARQUITETURA.md).

---

## 🔌 API e Backend

- **Base URL:** `https://api.gmxindustrial.com.br`
- **Autenticação:** JWT (Bearer token)
- **Formato:** JSON REST
- **Cliente HTTP:** Axios

### Principais Endpoints

- `/activities` - Atividades
- `/projects` - Obras
- `/service-orders` - Ordens de serviço
- `/collaborators` - Colaboradores
- `/users` - Usuários
- `/non-conformities` - RNCs
- `/api/qualidade/*` - Módulo Qualidade
  - `/analises-acoes-corretivas` - Análise e Ações Corretivas
  - `/inspecoes` - Inspeções
  - `/planos-inspecao` - Planos de Inspeção
  - `/certificados` - Certificados de Qualidade
  - `/equipamentos` - Equipamentos de Calibração
  - `/databooks` - Databooks
  - `/notificacoes` - Notificações
  - `/email-certificados` - Email de Certificados

---

## 👨‍💻 Guia do Desenvolvedor

### Padrões de Código

**Custom Hooks:**
```typescript
// Data fetching
const { data, isLoading, refetch } = useDataFetching({
  fetchFn: () => Service.getAll(),
  errorMessage: "Erro ao carregar dados",
});

// Dialog management
const editDialog = useDialogState<EntityType>();
editDialog.open(item);
```

**Componentes de Lista:**
- Use `useDataFetching` para fetch
- Use `useDialogState` para diálogos
- Use `useCallback` para handlers
- Use `useMemo` para valores computados

**Tabelas:**
- Use `SortableTableHeader` para ordenação
- Use `useTableSort` hook
- Implemente versão mobile com cards

Para guia completo, consulte [GUIA_DESENVOLVEDOR.md](./docs/GUIA_DESENVOLVEDOR.md).

---

## 📊 Estrutura de Dados

### Principais Entidades

**Obra (Project)**
```typescript
{
  id, name, groupNumber, client, address,
  startDate, endDate, status, type
}
```

**Atividade (Activity)**
```typescript
{
  id, description, status, macroTask, process,
  quantity, completedQuantity, estimatedTime, actualTime,
  startDate, endDate, collaborators[], images[], files[]
}
```

**Colaborador**
```typescript
{
  id, name, role, sector, status
}
```

Para detalhes completos, consulte [ESTRUTURA_DADOS.md](./docs/ESTRUTURA_DADOS.md).

---

## 🎨 Design System

### Cores Principais
- **Primary:** Blue (padrão sistema)
- **Success:** Green (#22c55e)
- **Warning:** Orange (#f97316)
- **Destructive:** Red (#ef4444)

### Componentes UI
- 47 componentes shadcn/ui
- Dark mode suportado
- Modo alto contraste (WCAG AAA)
- Animações suaves (Framer Motion)

### Responsividade
- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch targets ≥44px (WCAG AA)

---

## ♿ Acessibilidade

- ✅ **WCAG AAA** em modo alto contraste
- ✅ **WCAG AA** em modo padrão
- ✅ Navegação por teclado completa
- ✅ Screen reader friendly
- ✅ Touch targets adequados (≥44px)
- ✅ Contraste adequado em textos

---

## 📚 Documentação

### Documentação Técnica
- [ARQUITETURA.md](./docs/ARQUITETURA.md) - Arquitetura do sistema
- [GUIA_DESENVOLVEDOR.md](./docs/GUIA_DESENVOLVEDOR.md) - Guia completo
- [ESTRUTURA_DADOS.md](./docs/ESTRUTURA_DADOS.md) - Entidades e relacionamentos

### Histórico de Mudanças
- [ATUALIZACAO_VISUAL.md](./docs/ATUALIZACAO_VISUAL.md) - Refatoração com hooks
- [MODERNIZACAO_COMPLETA.md](./docs/MODERNIZACAO_COMPLETA.md) - Modernização UI/UX
- [PHASE_2_SUMMARY.md](./docs/PHASE_2_SUMMARY.md) - Animações e tours
- [PHASE_4_SUMMARY.md](./docs/PHASE_4_SUMMARY.md) - Tabelas responsivas
- [PHASE_5_SUMMARY.md](./docs/PHASE_5_SUMMARY.md) - Formulários aprimorados
- [FEEDBACK_SYSTEM.md](./docs/FEEDBACK_SYSTEM.md) - Sistema de feedback

---

## 🔐 Autenticação

O sistema utiliza autenticação JWT com dois níveis de permissão:

- **Admin** - Acesso completo ao sistema
- **Usuario** - Acesso limitado

Tokens são armazenados em localStorage/sessionStorage e enviados via header `Authorization: Bearer <token>`.

---

## 🚀 Deploy

### Build de Produção

```bash
# Build otimizado
npm run build

# Preview do build
npm run preview
```

O build gera os arquivos na pasta `dist/`:
- Bundle inicial: ~850 KB (com code splitting)
- Chunks lazy-loaded para cada rota
- Assets otimizados

### Recomendações de Deploy
- **Vite SSG** ou **SPA hosting**
- **Netlify** / **Vercel** (recomendado)
- **Nginx** com fallback para index.html

---

## 🤝 Contribuindo

### Workflow
1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
3. Push para a branch: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request

### Convenções de Commit
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `refactor:` - Refatoração de código
- `docs:` - Documentação
- `style:` - Formatação
- `test:` - Testes
- `chore:` - Manutenção

---

## 📝 Licença

Este projeto é propriedade da **GML Estruturas** e é de uso interno.

---

## 👥 Equipe

**Desenvolvido por:** Claude Sonnet 4.5
**Empresa:** GML Estruturas
**Ano:** 2025

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte a [documentação técnica](./docs/)
- Verifique o [guia do desenvolvedor](./docs/GUIA_DESENVOLVEDOR.md)

---

## ⭐ Status do Projeto

**Versão Atual:** 4.0.0 - Módulo Qualidade Completo
**Status:** ✅ **Produção Ready**
**Última Atualização:** 02 de Janeiro de 2026

### Novidades v4.0.0 (Janeiro 2026)
- ✨ **Módulo Qualidade Completo** - Sistema de gestão de qualidade ISO 9001
  - 9 funcionalidades integradas
  - Análise de causa raiz (5 Porquês + Ishikawa)
  - Gestão de inspeções e certificados
  - Controle de calibração com alertas
  - Geração automática de Databook
  - Sistema de notificações proativas
  - Templates de email personalizáveis
- 🐛 **4 Bugs Críticos Corrigidos** - Upload de arquivos
- ♿ **13 Melhorias de Acessibilidade** - WCAG AA compliance
- 📧 **Sistema de Email Avançado** - Templates e rastreamento
- 🔔 **Sistema de Notificações** - Alertas automáticos

### Métricas de Qualidade
- ✅ TypeScript strict mode
- ✅ ESLint configurado
- ✅ Performance otimizada (-66% bundle size)
- ✅ Acessibilidade WCAG AAA
- ✅ Mobile-first responsive
- ✅ Code splitting implementado
- ✅ Documentação completa

---

**Feito com ❤️ para GML Estruturas**
