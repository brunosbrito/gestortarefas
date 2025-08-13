import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Settings,
  ListTodo,
  GitFork,
  Factory,
  Mountain,
  AlertOctagon,
  Briefcase,
  Calendar,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';
import { MenuItem } from './types';

export const navItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    icon: ClipboardList,
    label: 'Atividades',
    path: '/atividade',
  },
  {
    icon: TrendingUp,
    label: 'Análise SWOT',
    path: '/analise-swot',
  },
  {
    icon: Users,
    label: 'Usuários',
    path: '/users',
  },
  {
    icon: Building2,
    label: 'Obras',
    path: '/obras',
  },
  {
    icon: Factory,
    label: 'Fábrica',
    path: '/fabricas',
  },
  {
    icon: Mountain,
    label: 'Mineradoras',
    path: '/mineradoras',
  },
  {
    icon: AlertOctagon,
    label: 'RNC',
    path: '/nao-conformidades',
  },
  {
    icon: Settings,
    label: 'Gerenciamento',
    subItems: [
      {
        icon: Users,
        label: 'Colaboradores',
        path: '/gerenciamento/colaboradores',
      },
      {
        icon: ListTodo,
        label: 'Tarefas Macro',
        path: '/gerenciamento/tarefas-macro',
      },
      {
        icon: GitFork,
        label: 'Processos',
        path: '/gerenciamento/processos',
      },
      {
        icon: Briefcase,
        label: 'Valor por Cargo',
        path: '/gerenciamento/valor-por-cargo',
      }
      
    ],
  },
  {
    icon: Clock,
    label: 'Registro de Ponto',
    path: '/ponto',
  },
];
