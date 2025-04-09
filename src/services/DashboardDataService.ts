
import { getAllActivities } from '@/services/ActivityService';
import { getAllServiceOrders } from '@/services/ServiceOrderService';
import ObrasService from '@/services/ObrasService';
import { dataMacroTask, dataProcess, dataCollaborators } from '@/services/StatisticsService';
import { MacroTaskStatistic, ProcessStatistic, CollaboratorStatistic } from '@/interfaces/ActivityStatistics';
import { ActivityStatusCounts } from '@/interfaces/DashboardDataTypes';
import { countActivitiesByStatus } from '@/utils/dashboardUtils';

/**
 * Carrega todos os dados necessários para o dashboard
 */
export const loadDashboardData = async () => {
  try {
    console.log("Carregando dados do dashboard...");
    
    // Carregar atividades
    const activities = await getAllActivities();
    console.log("Atividades carregadas:", activities.length);
    
    // Calcular status das atividades
    const statusCounts = countActivitiesByStatus(activities);
    
    // Carregar projetos/obras
    const projects = await ObrasService.getAllObras();
    console.log("Projetos carregados:", projects.length);
    
    // Carregar ordens de serviço
    const serviceOrders = await getAllServiceOrders();
    console.log("Ordens de serviço carregadas:", serviceOrders.length);
    
    // Carregar estatísticas para os gráficos
    const dadosMacroTask = await dataMacroTask();
    console.log("Estatísticas de tarefas macro carregadas:", dadosMacroTask.length);
    
    const dadosProcesso = await dataProcess();
    console.log("Estatísticas de processos carregadas:", dadosProcesso.length);
    
    // Carregar dados dos colaboradores
    const dadosColaboradores = await dataCollaborators();
    console.log("Estatísticas de colaboradores carregadas:", dadosColaboradores.length);

    return {
      activities,
      statusCounts,
      projects,
      serviceOrders,
      dadosMacroTask,
      dadosProcesso,
      dadosColaboradores
    };
  } catch (error) {
    console.error("Erro ao carregar dados", error);
    throw error;
  }
};
