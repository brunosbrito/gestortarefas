/**
 * Conteúdo centralizado de tooltips
 * Facilita manutenção e tradução
 */

export const TOOLTIP_CONTENT = {
  // Filtros do Dashboard
  FILTER_PERIOD: 'Selecione o período para visualizar as atividades. Use períodos personalizados para análises específicas.',
  FILTER_MACRO_TASK: 'Filtre por categoria principal de trabalho. Tarefas macro agrupam processos relacionados.',
  FILTER_PROCESS: 'Filtre por processo específico dentro de uma tarefa macro. Processos são etapas detalhadas do trabalho.',
  FILTER_PROJECT: 'Selecione uma obra específica. Obras contêm ordens de serviço e atividades relacionadas.',
  FILTER_SERVICE_ORDER: 'Filtre por ordem de serviço (OS). Cada OS agrupa múltiplas atividades de um projeto.',
  FILTER_COLLABORATOR: 'Filtre atividades por colaborador atribuído. Útil para análise de produtividade individual.',
  FILTER_STATUS: 'Filtre pelo status da atividade: Planejadas, Em Execução, Concluídas ou Paralizadas.',

  // Atividades
  ACTIVITY_ESTIMATED_TIME: 'Tempo estimado para conclusão da atividade em horas. Usado para calcular KPI de eficiência.',
  ACTIVITY_ACTUAL_TIME: 'Tempo real trabalhado na atividade. Registrado pelos colaboradores ao finalizar.',
  ACTIVITY_QUANTITY: 'Quantidade total planejada de itens/trabalho a ser executado.',
  ACTIVITY_COMPLETED_QUANTITY: 'Quantidade já executada. Usado para calcular o percentual de progresso.',
  ACTIVITY_PROGRESS: 'Percentual de conclusão calculado automaticamente: (Qtd. Concluída / Qtd. Total) × 100.',
  ACTIVITY_KPI: 'Indicador de Performance: compara tempo estimado vs tempo real. Valores positivos indicam atraso.',
  ACTIVITY_TEAM: 'Colaboradores atribuídos a esta atividade. Múltiplos colaboradores podem trabalhar na mesma atividade.',
  ACTIVITY_PAUSE_DATE: 'Data em que a atividade foi paralisada. Requer justificativa para retomada.',

  // Obras
  PROJECT_GROUP_NUMBER: 'Número identificador do grupo de obras. Útil para agrupar projetos relacionados.',
  PROJECT_TYPE: 'Tipo de empreendimento: Obra (construção civil), Fábrica (industrial) ou Mineradora.',
  PROJECT_STATUS: 'Estado atual do projeto. Projetos finalizados não podem receber novas atividades.',

  // Ordens de Serviço
  SERVICE_ORDER_NUMBER: 'Número sequencial da OS dentro do projeto. Gerado automaticamente.',
  SERVICE_ORDER_PROGRESS: 'Progresso médio de todas as atividades vinculadas a esta OS.',

  // Exportação
  EXPORT_PDF_COLUMNS: 'Selecione quais colunas incluir no relatório PDF. Menos colunas = melhor legibilidade.',
  EXPORT_EXCEL_ALL_DATA: 'Exportar todos os dados ou apenas os visíveis na tela atual. Use "Todos" para análises completas.',
  EXPORT_GROUP_BY: 'Agrupar dados por categoria para facilitar análise. Útil para relatórios gerenciais.',

  // KPIs e Estatísticas
  CHART_MACRO_TASK: 'Compara horas previstas vs trabalhadas por tarefa macro. Identifica áreas com maior desvio.',
  CHART_PROCESS: 'Análise detalhada de processos. Usa escala logarítmica para melhor visualização de valores díspares.',
  CHART_COLLABORATOR: 'Produtividade individual: horas trabalhadas e número de atividades por colaborador.',
  SWOT_ANALYSIS: 'Análise SWOT gerada automaticamente baseada nos KPIs das atividades do período selecionado.',

  // Formulários
  FORM_REQUIRED_FIELD: 'Campo obrigatório. Deve ser preenchido para salvar o registro.',
  FORM_AUTO_CALCULATED: 'Campo calculado automaticamente. Não é editável diretamente.',
  FORM_DATE_FORMAT: 'Use o formato DD/MM/AAAA ou selecione no calendário.',
  FORM_MACRO_TASK: 'Categoria principal que agrupa processos relacionados. Define o tipo de trabalho a ser executado.',
  FORM_PROCESS: 'Processo específico dentro da tarefa macro. Representa etapas detalhadas do trabalho.',
  FORM_DESCRIPTION: 'Descrição clara e objetiva da atividade a ser executada. Seja específico para facilitar o entendimento.',
  FORM_QUANTITY: 'Quantidade total de itens/unidades a serem produzidos ou executados nesta atividade.',
  FORM_TIME_PER_UNIT: 'Tempo estimado necessário para completar uma unidade. Usado para calcular o tempo total previsto.',
  FORM_COLLABORATORS: 'Selecione um ou mais colaboradores responsáveis pela execução desta atividade.',
  FORM_OBSERVATION: 'Informações adicionais, instruções especiais ou observações relevantes para a atividade.',
  FORM_IMAGE: 'Anexe imagens de referência, projetos ou registros fotográficos relacionados à atividade.',
  FORM_FILE: 'Anexe documentos, planilhas, projetos técnicos ou outros arquivos relevantes.',
  FORM_PROJECT_NAME: 'Nome identificador do projeto. Use nomes claros que facilitem a localização.',
  FORM_PROJECT_GROUP: 'Número do grupo para agrupar projetos relacionados. Útil para organização de empreendimentos.',
  FORM_PROJECT_CLIENT: 'Nome do cliente/contratante responsável pelo projeto.',
  FORM_PROJECT_ADDRESS: 'Endereço completo onde o projeto está sendo executado.',
  FORM_PROJECT_DATES: 'Datas de início e previsão de término do projeto. A data de término pode ser alterada posteriormente.',
  FORM_PROJECT_STATUS: 'Status atual do projeto. Projetos finalizados não podem receber novas atividades.',
} as const;

/**
 * Helper para acessar conteúdo de tooltip com type safety
 */
export const getTooltipContent = (key: keyof typeof TOOLTIP_CONTENT): string => {
  return TOOLTIP_CONTENT[key];
};
