# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript task management system (gestortarefas) built with Vite, shadcn/ui components, and Tailwind CSS. The application supports multiple modules including task management, construction projects (obras), service orders, activities, and team collaboration.

## Development Commands

```bash
# Development server (port 8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Lint the codebase
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Core Structure
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme support
- **State Management**: Zustand + React Query for server state
- **Routing**: React Router v6
- **Authentication**: JWT-based auth with role-based access

### Module System
The app uses a modular architecture with a `ModuleContext` that supports:
- `task-manager` - Main task/activity management
- `cutting-optimizer` - Material cutting optimization
- `stock` - Inventory management  
- `cost-manager` - Cost tracking and analysis

### Key Directories

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── atividades/     # Activity-related components
│   ├── dashboard/      # Dashboard and analytics components
│   ├── gerenciamento/  # Management (colaboradores, processos, etc.)
│   ├── layout/         # Layout components (sidebar, etc.)
│   └── obras/          # Construction project components
├── contexts/           # React contexts (Theme, Module)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Route components
├── services/           # API service layer
└── interfaces/         # TypeScript interfaces
```

### Service Layer Architecture
All API communication goes through dedicated service classes in `src/services/`:
- `AuthService.ts` - Authentication and user management
- `ActivityService.ts` - Activity CRUD operations
- `ObrasService.ts` - Construction project management
- `ServiceOrderService.ts` - Service order management
- `DashboardService.ts` - Analytics and reporting
- `ColaboradorService.ts` - Team member management

### Component Patterns

**Form Components**: Use `react-hook-form` with `zod` validation
**Data Fetching**: React Query hooks in custom hooks (e.g., `useAtividadeData.ts`)
**Styling**: Tailwind utility classes with `cn()` helper from `lib/utils.ts`
**Icons**: Lucide React icon library

### File Upload System
The app supports file uploads for activities with image management through:
- `ActivityImageService.ts` - Image CRUD operations
- `FileUploadField.tsx` - Reusable upload component
- Carousel display for multiple images

### Export Capabilities
Built-in PDF and Excel export functionality:
- `AtividadePdfService.ts` / `AtividadePdfAdvancedService.ts` - PDF generation
- `AtividadeExcelService.ts` - Excel export with custom configurations
- Configuration dialogs for export customization

### Authentication & Authorization
- JWT tokens stored in localStorage/sessionStorage
- Role-based access control
- `AuthService.ts` handles login/register/token management

## Important Implementation Notes

- **Path Aliases**: Uses `@/` for `src/` directory (configured in vite.config.ts and components.json)
- **Theme System**: Supports light/dark mode via `ThemeContext` and `next-themes`
- **Responsive Design**: Mobile-first approach with responsive sidebar and components
- **Data Persistence**: LocalStorage for user preferences and module selection
- **API Configuration**: API base URL configured in `src/config`

## Common Development Patterns

When adding new features:
1. Create service layer first (`src/services/`)
2. Build custom hooks for data fetching (`src/hooks/`)
3. Create reusable components (`src/components/`)
4. Add route pages (`src/pages/`)
5. Update routing in `App.tsx`

## UI Component Usage

This project uses shadcn/ui components. Key components include:
- Tables with sorting, filtering, and pagination
- Forms with validation (react-hook-form + zod)
- Dialogs and modals for actions
- Charts and analytics (recharts)
- Drag & drop functionality (react-beautiful-dnd)