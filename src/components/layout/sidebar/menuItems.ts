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
  Target,
  ClipboardCheck,
  FileCheck,
  Award,
  Gauge,
  BarChart3,
  BookOpen,
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
        icon: BarChart3,
        label: 'Dashboard',
        path: '/qualidade/indicadores',
      },
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
      {
        icon: Target,
        label: 'Análise e Ações Corretivas',
        path: '/qualidade/acoes-corretivas',
      },
      {
        icon: ClipboardCheck,
        label: 'Inspeções',
        path: '/qualidade/inspecoes',
      },
      {
        icon: FileCheck,
        label: 'Planos de Inspeção',
        path: '/qualidade/planos-inspecao',
      },
      {
        icon: Award,
        label: 'Certificados de Qualidade',
        path: '/qualidade/certificados',
      },
      {
        icon: Gauge,
        label: 'Calibração',
        path: '/qualidade/calibracao',
      },
      {
        icon: BookOpen,
        label: 'Databook',
        path: '/qualidade/databook',
      },
    ],
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
