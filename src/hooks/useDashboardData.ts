
import { useState, useEffect } from 'react';
import { getAllActivities } from '@/services/ActivityService';
import { getAllServiceOrders } from '@/services/ServiceOrderService';
import ObrasService from '@/services/ObrasService';
import { dataMacroTask, dataProcess, dataCollaborators } from '@/services/StatisticsService';
import { MacroTaskStatistic, ProcessStatistic, CollaboratorStatistic } from '@/interfaces/ActivityStatistics';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';
import { filterDataByPeriod } from '@/utils/dateFilter';

// Tipo para status de atividades
export interface ActivityStatusCounts {
  planejadas: number;
  emExecucao: number;
  concluidas: number;
  paralizadas: number;
}

export const useDashboardData = () => {
  const [macroTaskStatistic, setMacroTaskStatistic] = useState<MacroTaskStatistic[]>([]);
  const [processStatistic, setProcessStatistic] = useState<ProcessStatistic[]>([]);
  const [collaboratorStatistic, setCollaboratorStatistic] = useState<CollaboratorStatistic[]>([]);
  const [totalActivities, setTotalActivities] = useState<number>(0);
  const [totalProjetos, setTotalProjetos] = useState<number>(0);
  const [totalServiceOrder, setTotalServiceOrder] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allServiceOrders, setAllServiceOrders] = useState<any[]>([]);
  const [activitiesByStatus, setActivitiesByStatus] = useState<ActivityStatusCounts>({
    planejadas: 0,
    emExecucao: 0,
    concluidas: 0,
    paralizadas: 0
  });

  // Função para carregar todas as atividades e calcular estatísticas
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [activities, projects, serviceOrders] = await Promise.all([
        getAllActivities(),
        ObrasService.getAllObras(),
        getAllServiceOrders()
      ]);
      
      setAllActivities(activities);
      setAllProjects(projects);
      setAllServiceOrders(serviceOrders);
      
      // Contar totais iniciais
      setTotalActivities(activities.length);
      setTotalProjetos(projects.length);
      setTotalServiceOrder(serviceOrders.length);
      
      // Contar atividades por status
      countActivitiesByStatus(activities);
      
      // Carregar estatísticas para os gráficos sem filtros inicialmente
      await loadStatistics();
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Resetar os dados em caso de erro
      resetDashboardData();
    } finally {
      setIsLoading(false);
    }
  };

  // Função para carregar estatísticas com filtros
  const loadStatistics = async (obraId?: number | null, serviceOrderId?: number | null) => {
    try {
      const [dadosMacroTask, dadosProcesso, dadosColaboradores] = await Promise.all([
        dataMacroTask(obraId, serviceOrderId),
        dataProcess(obraId, serviceOrderId),
        dataCollaborators(obraId, serviceOrderId)
      ]);
      
      setMacroTaskStatistic(dadosMacroTask as MacroTaskStatistic[]);
      setProcessStatistic(dadosProcesso as ProcessStatistic[]);
      setCollaboratorStatistic(dadosColaboradores as CollaboratorStatistic[]);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setMacroTaskStatistic([]);
      setProcessStatistic([]);
      setCollaboratorStatistic([]);
    }
  };

  // Função para contar atividades por status
  const countActivitiesByStatus = (activities: any[]) => {
    if (!activities || activities.length === 0) {
      setActivitiesByStatus({ planejadas: 0, emExecucao: 0, concluidas: 0, paralizadas: 0 });
      return;
    }
    
    const statusCounts = activities.reduce((counts: ActivityStatusCounts, activity) => {
      const status = activity.status || 'Não especificado';
      
      // Conta baseada nos status da atividade
      if (status.toLowerCase().includes('planejada')) counts.planejadas++;
      else if (status.toLowerCase().includes('execução')) counts.emExecucao++;
      else if (status.toLowerCase().includes('concluída')) counts.concluidas++;
      else if (status.toLowerCase().includes('paralizada')) counts.paralizadas++;
      
      return counts;
    }, { planejadas: 0, emExecucao: 0, concluidas: 0, paralizadas: 0 });
    
    setActivitiesByStatus(statusCounts);
  };

  // Função para resetar dados do dashboard quando não há dados
  const resetDashboardData = () => {
    setTotalActivities(0);
    setTotalProjetos(0);
    setTotalServiceOrder(0);
    setActivitiesByStatus({ planejadas: 0, emExecucao: 0, concluidas: 0, paralizadas: 0 });
    setMacroTaskStatistic([]);
    setProcessStatistic([]);
    setCollaboratorStatistic([]);
  };

  // Aplicar filtro de período aos dados
  const applyPeriodFilter = (
    period: PeriodFilterType, 
    obraId?: number | null, 
    serviceOrderId?: number | null,
    startDate?: Date | null,
    endDate?: Date | null
  ) => {
    if (allActivities.length === 0) {
      resetDashboardData();
      return;
    }

    // Filtrar atividades por período e outros filtros
    let filteredActivities = [...allActivities];
    let filteredProjects = [...allProjects];
    let filteredServiceOrders = [...allServiceOrders];
    
    // Aplicar filtro por obra se necessário
    if (obraId !== null && obraId !== undefined) {
      filteredActivities = filteredActivities.filter(activity => {
        if (!activity.project) return false;
        
        const activityProjectId = typeof activity.project.id === 'string' 
          ? Number(activity.project.id) 
          : activity.project.id;
          
        return activityProjectId === obraId;
      });

      // Filtrar projetos também
      filteredProjects = filteredProjects.filter(project => {
        const projectId = typeof project.id === 'string' ? Number(project.id) : project.id;
        return projectId === obraId;
      });
    }
    
    // Aplicar filtro por ordem de serviço se necessário
    if (serviceOrderId !== null && serviceOrderId !== undefined) {
      filteredActivities = filteredActivities.filter(activity => {
        if (!activity.serviceOrder) return false;
        
        const activityServiceOrderId = typeof activity.serviceOrder.id === 'string' 
          ? Number(activity.serviceOrder.id) 
          : activity.serviceOrder.id;
          
        return activityServiceOrderId === serviceOrderId;
      });

      // Filtrar ordens de serviço também
      filteredServiceOrders = filteredServiceOrders.filter(so => {
        const soId = typeof so.id === 'string' ? Number(so.id) : so.id;
        return soId === serviceOrderId;
      });
    }

    // Aplicar filtro de período se necessário
    if (period && period !== 'todos') {
      if (period === 'personalizado' && (startDate || endDate)) {
        filteredActivities = filterDataByPeriod(filteredActivities, period, startDate, endDate);
        filteredProjects = filterDataByPeriod(filteredProjects, period, startDate, endDate);
        filteredServiceOrders = filterDataByPeriod(filteredServiceOrders, period, startDate, endDate);
      } else {
        filteredActivities = filterDataByPeriod(filteredActivities, period);
        filteredProjects = filterDataByPeriod(filteredProjects, period);
        filteredServiceOrders = filterDataByPeriod(filteredServiceOrders, period);
      }
    }
    
    // Se não encontrou atividades após aplicar os filtros, zera tudo
    if (filteredActivities.length === 0) {
      resetDashboardData();
      return;
    }
    
    // Atualizar contagem de atividades por status
    countActivitiesByStatus(filteredActivities);
    
    // Atualizar totais baseados nos dados filtrados
    setTotalActivities(filteredActivities.length);
    setTotalProjetos(filteredProjects.length);
    setTotalServiceOrder(filteredServiceOrders.length);
    
    // Recarregar estatísticas com os filtros aplicados
    loadStatistics(obraId, serviceOrderId);
  };

  return {
    macroTaskStatistic,
    processStatistic,
    collaboratorStatistic,
    totalActivities,
    totalProjetos,
    totalServiceOrder,
    activitiesByStatus,
    isLoading,
    loadAllData,
    applyPeriodFilter,
    countActivitiesByStatus
  };
};
