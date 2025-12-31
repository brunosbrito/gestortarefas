# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a construction/industrial project management system (Gestor de Tarefas) for GML Estruturas. The application manages construction projects (obras), service orders (OS), activities, employees, time tracking, and non-conformities (RNC).

**Tech Stack:**
- React 18 + TypeScript
- Vite (build tool, SWC compiler)
- React Router v6 for routing
- TanStack Query (React Query) for server state
- Zustand for client state management
- shadcn/ui components (Radix UI + Tailwind CSS)
- Axios for HTTP requests

## Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on http://localhost:8080)
npm run dev

# Lint code
npm run lint

# Production build
npm run build

# Development build (with dev mode)
npm run build:dev

# Preview production build
npm run preview
```

## Architecture Overview

### API Integration
- Backend API URL configured in [src/config.ts](src/config.ts)
- All API calls go through service classes in [src/services/](src/services/)
- Services use Axios for HTTP requests
- API base URL: `https://api.gmxindustrial.com.br` (production) or `http://localhost:3000` (local)

### State Management Pattern
1. **Server State**: TanStack Query (`@tanstack/react-query`) - configured in [src/main.tsx](src/main.tsx)
2. **Client State**: Zustand stores in [src/stores/](src/stores/) (e.g., `dashboardStore.ts`)
3. **Theme State**: React Context in [src/contexts/ThemeContext.tsx](src/contexts/ThemeContext.tsx)

### Service Layer
All API interactions are abstracted in service classes located in [src/services/](src/services/):
- Each service is a class with methods for CRUD operations
- Services import `API_URL` from [src/config.ts](src/config.ts)
- Common pattern: `ObrasService`, `ActivityService`, `ColaboradorService`, etc.
- Specialized services: `PdfService`, `ExcelService`, `OpenAIService`

### Data Flow
1. Components call custom hooks (e.g., `useDashboardData`, `useAtividadeData`)
2. Hooks either:
   - Use TanStack Query for server data fetching
   - Access Zustand stores for client state
   - Call service methods directly
3. Services make API calls using Axios
4. Response data is typed using interfaces from [src/interfaces/](src/interfaces/)

### Routing Structure
Routes defined in [src/App.tsx](src/App.tsx):
- `/` - Login page
- `/dashboard` - Main dashboard
- `/atividade` - Activities view
- `/obras` - Projects (obras) list
- `/obras/:projectId/os` - Service orders for a project
- `/obras/:projectId/os/:serviceOrderId/atividades` - Activities for a service order
- `/gerenciamento/*` - Management pages (employees, tasks, processes)
- `/ponto` - Time tracking

### Component Organization
```
src/components/
├── ui/              # shadcn/ui base components (Button, Dialog, etc.)
├── layout/          # Layout components (Sidebar, Header, ThemeToggle)
├── dashboard/       # Dashboard-specific components
├── atividade(s)/    # Activity-related components
├── obras/           # Project-related components
├── gerenciamento/   # Management section components
└── [feature]/       # Feature-specific component folders
```

### Custom Hooks Pattern
Located in [src/hooks/](src/hooks/):
- `useDashboardData.ts` - Dashboard data fetching and filtering
- `useAtividadeData.ts` - Activity data management
- `useSwotAnalysis.ts` - SWOT analysis logic
- `use-toast.ts` - Toast notifications (shadcn/ui)

## Key Conventions

### Import Aliases
- `@/` maps to `src/` directory (configured in [vite.config.ts](vite.config.ts))
- Example: `import API_URL from '@/config'`

### TypeScript Interfaces
- Located in [src/interfaces/](src/interfaces/)
- Named with `Interface` suffix (e.g., `ColaboradorInterface`, `ObrasInterface`)
- Exception: Some use simple names (e.g., `Obra`, `ServiceOrder`)

### Styling
- Tailwind CSS utility classes
- Dark mode support via `next-themes`
- Component variants managed with `class-variance-authority`
- Custom theme colors defined in [tailwind.config.ts](tailwind.config.ts)

### Status Constants
- Activity statuses defined in [src/constants/activityStatus.ts](src/constants/activityStatus.ts)
- Status interface in [src/interfaces/AtividadeStatus.ts](src/interfaces/AtividadeStatus.ts)

## Important Files

- [src/config.ts](src/config.ts) - API URL configuration
- [src/main.tsx](src/main.tsx) - App entry point, providers setup
- [src/App.tsx](src/App.tsx) - Route definitions
- [src/stores/dashboardStore.ts](src/stores/dashboardStore.ts) - Main dashboard state
- [vite.config.ts](vite.config.ts) - Vite configuration (port 8080, path aliases)

## Feature-Specific Notes

### PDF Generation
- Multiple services: `PdfService`, `AtividadePdfService`, `AtividadePdfAdvancedService`
- Uses jsPDF and jspdf-autotable libraries
- Configured dialogs: `PdfConfigDialog`

### Excel Export
- `AtividadeExcelService` handles activity exports
- Uses xlsx library
- Configured via `ExcelConfigDialog`

### Image Handling
- Activity images stored via `ActivityImageService`
- RNC images via `rncImageService`
- Image carousel: `AtividadeImageCarousel`

### Authentication
- JWT-based (jwt-decode library)
- Handled by `AuthService`
- Login page at [src/pages/Login.tsx](src/pages/Login.tsx)

### AI Features
- OpenAI integration in `OpenAIService`
- AI assistant page: [src/pages/AssistenteIA.tsx](src/pages/AssistenteIA.tsx)

## Development Tips

### Adding New Features
1. Create interface in [src/interfaces/](src/interfaces/)
2. Create service in [src/services/](src/services/)
3. Create components in appropriate [src/components/](src/components/) subfolder
4. Add route in [src/App.tsx](src/App.tsx) if needed
5. Consider creating custom hook if complex state logic is involved

### Working with Forms
- Use `react-hook-form` with `@hookform/resolvers`
- Zod for validation schemas
- shadcn/ui form components from [src/components/ui/](src/components/ui/)

### API Changes
1. Update service method in appropriate service file
2. Update TypeScript interface if response structure changed
3. Update components consuming the data

### Testing API Locally
- Change API_URL in [src/config.ts](src/config.ts) to `http://localhost:3000`
- Ensure backend is running on port 3000
