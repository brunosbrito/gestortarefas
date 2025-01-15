import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Settings,
  ListTodo,
  GitFork,
} from 'lucide-react';
import { MenuItem } from './types';

export const navItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    icon: Users,
    label: 'Usuários',
    path: '/users',
  },
  {
    icon: Building2,
    label: 'Obras',
    path: '/obras/:obraId', // Atualizado para passar obraId
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
    ],
  },
  {
    icon: Clock,
    label: 'Registro de Ponto',
    path: '/ponto',
  },
  {
    icon: Building2,
    label: 'Ordens de Serviço',
    path: '/obras/:obraId/os/:osId', // Atualizado para passar obraId e osId
  },
  {
    icon: Clock,
    label: 'Atividades',
    path: '/obras/:obraId/os/:osId/atividades/:atividadeId', // Atualizado para passar obraId, osId e atividadeId
  },
];
