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
  Bot,
  Boxes,
  ShieldCheck,
  GanttChartSquare,
} from 'lucide-react';
import { MenuItem } from './types';

export const navItems: MenuItem[] = [
  // MÓDULO PCP (Planejamento e Controle da Produção)
  {
    icon: Boxes,
    label: 'PCP',
    subItems: [
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
        icon: Bot,
        label: 'Assistente IA',
        path: '/assistente-ia',
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
    ],
  },

  // MÓDULO QUALIDADE
  {
    icon: ShieldCheck,
    label: 'Qualidade',
    subItems: [
      {
        icon: Bot,
        label: 'Assistente IA',
        path: '/qualidade/assistente-ia',
      },
      {
        icon: AlertOctagon,
        label: 'RNC',
        path: '/nao-conformidades',
      },
      // FUTURO: Análise e Ações Corretivas
      // FUTURO: Inspeções
      // FUTURO: Planos de Inspeção
      // FUTURO: Certificados de Qualidade
      // FUTURO: Envio de Certificados
      // FUTURO: Indicadores/Dashboard
      // FUTURO: Databook
    ],
  },

  // MÓDULO CRONOGRAMAS
  {
    icon: GanttChartSquare,
    label: 'Cronogramas',
    path: '/cronograma',
  },

  // CONFIGURAÇÕES (renomeado de "Gerenciamento")
  {
    icon: Settings,
    label: 'Configurações',
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

  // STANDALONE - Registro de Ponto
  {
    icon: Clock,
    label: 'Registro de Ponto',
    path: '/ponto',
  },
];
