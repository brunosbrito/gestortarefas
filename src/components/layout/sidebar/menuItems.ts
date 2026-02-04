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
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  DollarSign,
  MessageSquare,
  ClipboardPen,
  Tags,
  ShoppingBag,
  Truck,
  UserCircle,
  Warehouse,
  Building,
  Wrench,
  Store,
  MapPin,
  FileSignature,
  CheckSquare,
  Cog,
  Cloud,
  Wallet,
  ArrowRightLeft,
  PackageSearch,
  GanttChartSquare,
  CheckCircle,
  GitBranch,
  RotateCw,
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
        icon: TrendingUp,
        label: 'Pipeline de Projetos',
        path: '/pcp/pipeline',
      },
      {
        icon: Package,
        label: 'MRP',
        path: '/pcp/mrp',
      },
      {
        icon: Users,
        label: 'Capacidade Produtiva',
        path: '/pcp/capacidade',
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

  // MÓDULO SUPRIMENTOS
  {
    icon: Package,
    label: 'Suprimentos',
    subItems: [
      {
        icon: BarChart3,
        label: 'Dashboard',
        path: '/suprimentos',
      },
      {
        icon: Bot,
        label: 'AI Assistant',
        path: '/suprimentos/ai-chat',
      },
      {
        icon: DollarSign,
        label: 'Custos',
        subItems: [
          {
            icon: FileText,
            label: 'Contratos',
            path: '/suprimentos/contratos',
          },
          {
            icon: TrendingUp,
            label: 'Orçado vs Realizado',
            path: '/suprimentos/orcado-realizado',
          },
          {
            icon: DollarSign,
            label: 'Centros de Custo',
            path: '/suprimentos/centros-custo',
          },
          {
            icon: Wallet,
            label: 'Contas',
            path: '/suprimentos/contas',
          },
          {
            icon: Target,
            label: 'Metas',
            path: '/suprimentos/metas',
          },
          {
            icon: FileText,
            label: 'Relatórios',
            path: '/suprimentos/relatorios',
          },
          {
            icon: Cloud,
            label: 'OneDrive',
            path: '/suprimentos/onedrive',
          },
          {
            icon: BarChart3,
            label: 'Analytics',
            path: '/suprimentos/analytics',
          },
        ],
      },
      {
        icon: ShoppingCart,
        label: 'Compras',
        subItems: [
          {
            icon: Building,
            label: 'Fornecedores',
            path: '/suprimentos/compras/fornecedores',
          },
          {
            icon: ClipboardPen,
            label: 'Requisições',
            path: '/suprimentos/compras/requisicoes',
          },
          {
            icon: Tags,
            label: 'Cotações',
            path: '/suprimentos/compras/cotacoes',
          },
          {
            icon: ShoppingBag,
            label: 'Ordens de Compra',
            path: '/suprimentos/compras/ordens-compra',
          },
          {
            icon: FileText,
            label: 'Notas Fiscais',
            path: '/suprimentos/notas-fiscais',
          },
        ],
      },
      {
        icon: Warehouse,
        label: 'Almoxarifado',
        subItems: [
          {
            icon: Package,
            label: 'Items',
            path: '/suprimentos/almoxarifado/items',
          },
          {
            icon: ArrowRightLeft,
            label: 'Movimentações',
            path: '/suprimentos/almoxarifado/movimentacoes',
          },
          {
            icon: PackageSearch,
            label: 'Inventários',
            path: '/suprimentos/almoxarifado/inventarios',
          },
        ],
      },
      {
        icon: Truck,
        label: 'Logística',
        subItems: [
          {
            icon: LayoutDashboard,
            label: 'Dashboard',
            path: '/suprimentos/logistica',
          },
          {
            icon: Truck,
            label: 'Veículos',
            path: '/suprimentos/logistica/veiculos',
          },
          {
            icon: UserCircle,
            label: 'Motoristas',
            path: '/suprimentos/logistica/motoristas',
          },
          {
            icon: Warehouse,
            label: 'Transportadoras',
            path: '/suprimentos/logistica/transportadoras',
          },
          {
            icon: Wrench,
            label: 'Tipos de Manutenção',
            path: '/suprimentos/logistica/tipos-manutencao',
          },
          {
            icon: Store,
            label: 'Fornecedores de Serviços',
            path: '/suprimentos/logistica/fornecedores-servicos',
          },
          {
            icon: MapPin,
            label: 'Rotas',
            path: '/suprimentos/logistica/rotas',
          },
          {
            icon: FileSignature,
            label: 'Checklists Saída',
            path: '/suprimentos/logistica/checklists-saida',
          },
          {
            icon: CheckSquare,
            label: 'Checklists Retorno',
            path: '/suprimentos/logistica/checklists-retorno',
          },
          {
            icon: Cog,
            label: 'Manutenções',
            path: '/suprimentos/logistica/manutencoes',
          },
        ],
      },
    ],
  },

  // MÓDULO CRONOGRAMAS
  {
    icon: GanttChartSquare,
    label: 'Cronogramas',
    path: '/cronograma',
  },

  // MÓDULO COMERCIAL
  {
    icon: FileText,
    label: 'Comercial',
    subItems: [
      {
        icon: BarChart3,
        label: 'Dashboard',
        path: '/comercial',
      },
      {
        icon: Bot,
        label: 'AI Assistant',
        path: '/comercial/ai-chat',
      },
      {
        icon: FileText,
        label: 'Orçamentos (QQP)',
        path: '/comercial/orcamentos',
      },
      {
        icon: MessageSquare,
        label: 'Propostas Comerciais',
        path: '/comercial/propostas',
      },
      {
        icon: UserCircle,
        label: 'Clientes',
        path: '/comercial/clientes',
      },
    ],
  },

  // MÓDULO GESTÃO DE PROCESSOS
  {
    icon: ClipboardList,
    label: 'Gestão de Processos',
    subItems: [
      {
        icon: BarChart3,
        label: 'Dashboard',
        path: '/gestao-processos',
      },
      {
        icon: CheckCircle,
        label: 'Fila de Aprovação',
        path: '/gestao-processos/aprovacao',
        badge: 'count',
      },
      {
        icon: Target,
        label: 'Priorização (GUT)',
        path: '/gestao-processos/priorizacao',
      },
      {
        icon: GitBranch,
        label: 'Desdobramento',
        path: '/gestao-processos/desdobramento',
      },
      {
        icon: RotateCw,
        label: 'PDCA',
        path: '/gestao-processos/pdca',
      },
      {
        icon: Target,
        label: 'Metas SMART',
        path: '/gestao-processos/metas',
      },
      {
        icon: ClipboardList,
        label: 'Planos 5W2H',
        path: '/gestao-processos/planos-acao',
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
