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
  Scissors,
  Package,
  Calculator,
  FileText,
  Warehouse,
  TrendingUp,
  BarChart3,
  DollarSign,
  Target,
} from 'lucide-react';
import { Module } from '@/contexts/ModuleContext';
import { MenuItem } from './sidebar/types';

export const getMenuItemsByModule = (module: Module): MenuItem[] => {
  switch (module) {
    case 'task-manager':
      return [
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
          icon: Clock,
          label: 'Registro de Ponto',
          path: '/ponto',
        },
        {
          icon: Users,
          label: 'Usuários',
          path: '/users',
          adminOnly: true,
        },
        {
          icon: Settings,
          label: 'Gerenciamento',
          adminOnly: true,
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
      ];

    case 'cutting-optimizer':
      return [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          path: '/cutting/dashboard',
        },
        {
          icon: Scissors,
          label: 'Projetos de Corte',
          path: '/cutting/projects',
        },
        {
          icon: Package,
          label: 'Biblioteca de Materiais',
          path: '/cutting/materials',
        },
        {
          icon: Target,
          label: 'Otimizações',
          path: '/cutting/optimizations',
        },
        {
          icon: BarChart3,
          label: 'Relatórios',
          path: '/cutting/reports',
        },
        {
          icon: Settings,
          label: 'Configurações',
          path: '/cutting/settings',
          adminOnly: true,
        },
      ];

    case 'stock':
      return [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          path: '/stock/dashboard',
        },
        {
          icon: Package,
          label: 'Produtos',
          path: '/stock/products',
        },
        {
          icon: Warehouse,
          label: 'Movimentações',
          path: '/stock/movements',
        },
        {
          icon: ClipboardList,
          label: 'Inventário',
          path: '/stock/inventory',
        },
        {
          icon: Users,
          label: 'Fornecedores',
          path: '/stock/suppliers',
        },
        {
          icon: BarChart3,
          label: 'Relatórios',
          path: '/stock/reports',
        },
        {
          icon: Settings,
          label: 'Configurações',
          path: '/stock/settings',
          adminOnly: true,
        },
      ];

    case 'cost-manager':
      return [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          path: '/costs/dashboard',
        },
        {
          icon: DollarSign,
          label: 'Centros de Custo',
          path: '/costs/centers',
        },
        {
          icon: Calculator,
          label: 'Orçamentos',
          path: '/costs/budgets',
        },
        {
          icon: TrendingUp,
          label: 'Análises',
          path: '/costs/analysis',
        },
        {
          icon: FileText,
          label: 'Relatórios',
          path: '/costs/reports',
        },
        {
          icon: Settings,
          label: 'Configurações',
          path: '/costs/settings',
          adminOnly: true,
        },
      ];

    default:
      return [];
  }
};

export const getModuleConfig = (module: Module) => {
  const configs = {
    'task-manager': {
      name: 'Gestor de Tarefas',
      description: 'Gestão completa de projetos e atividades',
      color: 'hsl(var(--modules-task-primary))',
      icon: ClipboardList,
    },
    'cutting-optimizer': {
      name: 'Otimizador de Corte',
      description: 'Otimização de planos de corte',
      color: 'hsl(var(--modules-cutting-primary))',
      icon: Scissors,
    },
    'stock': {
      name: 'Estoque',
      description: 'Controle de estoque e inventário',
      color: 'hsl(var(--modules-stock-primary))',
      icon: Package,
    },
    'cost-manager': {
      name: 'Gestor de Custos',
      description: 'Gestão financeira e controle de custos',
      color: 'hsl(var(--modules-cost-primary))',
      icon: DollarSign,
    },
  };

  return configs[module];
};