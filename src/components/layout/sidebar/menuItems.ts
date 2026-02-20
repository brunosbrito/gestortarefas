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
  FileText,
  DollarSign,
  Receipt,
  Package,
  Paintbrush,
  Wrench,
  FolderOpen,
  FilePlus,
  FileStack,
  Scissors,
  FileBarChart,
  Box,
  Truck,
  Palette,
  BarChart3,
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

  // MÓDULO COMERCIAL
  {
    icon: Briefcase,
    label: 'Comercial',
    subItems: [
      {
        icon: BarChart3,
        label: 'Dashboard',
        path: '/comercial/dashboard',
      },
      {
        icon: FolderOpen,
        label: 'CADASTROS',
        subItems: [
          {
            icon: Package,
            label: 'Materiais',
            path: '/comercial/cadastros/materiais',
          },
          {
            icon: Palette,
            label: 'Tintas',
            path: '/comercial/cadastros/tintas',
          },
          {
            icon: Wrench,
            label: 'Fornecedores',
            path: '/comercial/cadastros/fornecedores-servico',
          },
          {
            icon: Users,
            label: 'Cargos',
            path: '/comercial/configuracao/cargos',
          },
          {
            icon: DollarSign,
            label: 'Configuração Salarial',
            path: '/comercial/configuracao/salarial',
          },
          {
            icon: Box,
            label: 'Consumíveis',
            path: '/comercial/cadastros/consumiveis',
          },
          {
            icon: Truck,
            label: 'Mobilização',
            path: '/comercial/cadastros/mobilizacao',
          },
          {
            icon: Truck,
            label: 'Desmobilização',
            path: '/comercial/cadastros/desmobilizacao',
          },
        ],
      },
      {
        icon: FolderOpen,
        label: 'ORÇAMENTOS',
        subItems: [
          {
            icon: FileText,
            label: 'Orçamentos',
            path: '/comercial/orcamentos',
          },
          {
            icon: FilePlus,
            label: 'Propostas',
            path: '/comercial/propostas',
          },
          {
            icon: FileStack,
            label: 'Templates',
            path: '/comercial/orcamentos/templates',
          },
          {
            icon: Scissors,
            label: 'Lista de Corte',
            path: '/comercial/orcamentos/lista-corte',
          },
          {
            icon: Paintbrush,
            label: 'Calculadora de Pintura',
            path: '/comercial/calculadora-pintura',
          },
        ],
      },
      {
        icon: FileBarChart,
        label: 'Relatórios',
        path: '/comercial/relatorios',
      },
    ],
  },

  // MÓDULO CRONOGRAMAS (desabilitado nesta branch - existe apenas na branch Modulo_Cronograma)
  // {
  //   icon: GanttChartSquare,
  //   label: 'Cronogramas',
  //   path: '/cronograma',
  // },

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
