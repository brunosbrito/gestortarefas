import { DriveStep } from 'driver.js';

/**
 * Configuração dos steps do tour guiado do Dashboard PCP
 */
export const dashboardTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Bem-vindo ao Dashboard PCP! 📊',
      description: 'Vamos fazer um tour rápido pelas principais funcionalidades do dashboard de controle de produção.',
    }
  },
  {
    element: '[data-tour="filters"]',
    popover: {
      title: 'Filtros Avançados',
      description: 'Comece filtrando os dados por período, obra, tarefa macro, processo e colaborador. Os gráficos abaixo se atualizam automaticamente.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="stats-summary"]',
    popover: {
      title: 'Estatísticas Principais',
      description: 'Visão rápida do total de Obras, Ordens de Serviço e Atividades no sistema.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="activity-status"]',
    popover: {
      title: 'Status das Atividades',
      description: 'Distribuição das atividades por status: Planejadas, Em Execução, Concluídas ou Paralisadas. Clique em um card para filtrar.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="dashboard-kpis"]',
    popover: {
      title: 'Indicadores-Chave (KPIs)',
      description: 'Métricas importantes como taxa de conclusão, horas trabalhadas, produtividade e desvio de prazo.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="macro-tasks-chart"]',
    popover: {
      title: 'Gráfico de Tarefas Macro',
      description: 'Compara horas previstas vs trabalhadas por tarefa macro. Identifique áreas com maior desvio de planejamento.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '[data-tour="process-chart"]',
    popover: {
      title: 'Gráfico de Processos',
      description: 'Análise detalhada de horas trabalhadas por processo. Clique no botão expandir para visualizar em tela cheia.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '[data-tour="productivity-trends"]',
    popover: {
      title: 'Tendências de Produtividade',
      description: 'Acompanhe a evolução da produtividade ao longo do tempo com métricas de desempenho e tendências.',
      side: 'top',
      align: 'start'
    }
  },
  {
    popover: {
      title: 'Pronto! 🎉',
      description: 'Você pode iniciar este tour novamente a qualquer momento clicando no botão "Iniciar Tour".',
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

/**
 * Configuração dos steps do tour guiado de RNC (Não Conformidades)
 */
export const rncTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Gestão de Não Conformidades (RNC) 🔍',
      description: 'Registre, analise e resolva não conformidades encontradas nas obras usando a metodologia dos 5 Porquês.',
    }
  },
  {
    element: '[data-tour="nova-rnc-button"]',
    popover: {
      title: 'Criar Nova RNC',
      description: 'Clique aqui para registrar uma nova não conformidade. Preencha a descrição, causa raiz e ações corretivas.',
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '[data-tour="rnc-filters"]',
    popover: {
      title: 'Filtros de RNC',
      description: 'Filtre RNCs por status (todas ou em andamento) e por projeto específico.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="rnc-card"]',
    popover: {
      title: 'Card de RNC',
      description: 'Cada card exibe informações resumidas da não conformidade: código, data, responsável e descrição.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '[data-tour="rnc-actions"]',
    popover: {
      title: 'Ações da RNC',
      description: 'Visualize detalhes, registre mão de obra e materiais gastos, anexe imagens e aplique a metodologia dos 5 Porquês.',
      side: 'top',
      align: 'start'
    }
  },
  {
    popover: {
      title: 'Metodologia dos 5 Porquês 💡',
      description: 'A ação corretiva usa os 5 Porquês para identificar a causa raiz. Pergunte "Por quê?" cinco vezes até encontrar a origem do problema!',
    }
  }
];
