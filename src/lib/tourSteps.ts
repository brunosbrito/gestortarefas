import { DriveStep } from 'driver.js';

/**
 * Configuração dos steps do tour guiado do Dashboard
 */
export const dashboardTourSteps: DriveStep[] = [
  {
    element: '[data-tour="stats-summary"]',
    popover: {
      title: 'Estatísticas Principais',
      description: 'Aqui você encontra um resumo rápido de Obras, Ordens de Serviço e Atividades do sistema.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="activity-status"]',
    popover: {
      title: 'Status das Atividades',
      description: 'Veja quantas atividades estão Planejadas, Em Execução, Concluídas ou Paralizadas. Clique em um card para filtrar.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="macro-tasks-chart"]',
    popover: {
      title: 'Gráfico de Tarefas Macro',
      description: 'Compara horas previstas vs trabalhadas por tarefa macro. Identifique áreas com maior desvio.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '[data-tour="process-chart"]',
    popover: {
      title: 'Gráfico de Processos',
      description: 'Análise detalhada de horas trabalhadas por processo. Clique no botão expandir para ver em tela cheia.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '[data-tour="filters"]',
    popover: {
      title: 'Filtros Avançados',
      description: 'Use os filtros para visualizar apenas os dados que você precisa. Filtre por período, obra, tarefa macro, processo e colaborador.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="activities-table"]',
    popover: {
      title: 'Tabela de Atividades',
      description: 'Lista detalhada de todas as atividades filtradas. Use a paginação para navegar e clique em uma linha para ver mais detalhes.',
      side: 'top',
      align: 'start'
    }
  }
];

/**
 * Configuração dos steps do tour guiado da página de Atividades
 */
export const atividadesTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Bem-vindo à Gestão de Atividades! 🎯',
      description: 'Aqui você cria, edita e acompanha todas as atividades do sistema. Vamos fazer um tour rápido?'
    }
  },
  {
    element: '[data-tour="new-activity-button"]',
    popover: {
      title: 'Criar Nova Atividade',
      description: 'Clique aqui para criar uma nova atividade. Você precisará preencher informações como tarefa macro, processo, equipe e tempo estimado.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="activity-filters"]',
    popover: {
      title: 'Filtrar Atividades',
      description: 'Use os filtros para encontrar rapidamente o que você precisa. Filtre por status, obra, OS, tarefa macro e mais.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="view-toggle"]',
    popover: {
      title: 'Alternar Visualização',
      description: 'Escolha entre visualização em tabela (detalhada) ou cards (visual). No modo cards, você pode arrastar atividades entre status!',
      side: 'left',
      align: 'start'
    }
  }
];

/**
 * Configuração dos steps do tour guiado de Obras
 */
export const obrasTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Gestão de Obras e Projetos 🏗️',
      description: 'Gerencie todos os seus projetos de construção, fábrica e mineração em um só lugar.'
    }
  },
  {
    element: '[data-tour="new-obra-button"]',
    popover: {
      title: 'Criar Nova Obra',
      description: 'Clique aqui para cadastrar uma nova obra, fábrica ou mineradora. Defina cliente, endereço, datas e mais.',
      side: 'bottom'
    }
  },
  {
    element: '[data-tour="obra-card"]',
    popover: {
      title: 'Card da Obra',
      description: 'Veja informações rápidas de cada obra: progresso, número de OS, datas. Clique para ver os detalhes completos.',
      side: 'top'
    }
  }
];

/**
 * Configuração inicial do tour (primeira vez que usuário acessa)
 */
export const welcomeTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Bem-vindo ao Gestor Master! 👋',
      description: 'Este é um sistema completo para gerenciar suas obras, atividades e equipes. Vamos conhecer as principais funcionalidades?',
    }
  },
  {
    element: '[data-tour="sidebar-dashboard"]',
    popover: {
      title: 'Dashboard',
      description: 'Visão geral com estatísticas, gráficos e análises. Comece sempre por aqui!',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '[data-tour="sidebar-atividades"]',
    popover: {
      title: 'Atividades',
      description: 'Gerencie todas as atividades das suas obras. Crie, edite e acompanhe o progresso.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '[data-tour="sidebar-obras"]',
    popover: {
      title: 'Obras',
      description: 'Cadastre e gerencie obras, fábricas e mineradoras. Cada obra pode ter várias ordens de serviço.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '[data-tour="keyboard-shortcuts"]',
    popover: {
      title: 'Atalhos de Teclado ⌨️',
      description: 'Pressione Ctrl+/ (ou Cmd+/) a qualquer momento para ver todos os atalhos disponíveis!',
      side: 'left',
      align: 'start'
    }
  },
  {
    popover: {
      title: 'Pronto para começar! 🚀',
      description: 'Você pode iniciar este tour novamente a qualquer momento clicando no botão "Ajuda" no menu.',
    }
  }
];
