
import { useState, useEffect } from 'react';
import { getAllActivities } from '@/services/ActivityService';
import { getAllServiceOrders } from '@/services/ServiceOrderService';
import ObrasService from '@/services/ObrasService';
import { dataMacroTask, dataProcess } from '@/services/StatisticsService';
import { MacroTaskStatistic, ProcessStatistic } from '@/interfaces/ActivityStatistics';
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
  const [originalMacroTaskStatistic, setOriginalMacroTaskStatistic] = useState<MacroTaskStatistic[]>([]);
  const [originalProcessStatistic, setOriginalProcessStatistic] = useState<ProcessStatistic[]>([]);
  const [totalActivities, setTotalActivities] = useState<number>(0);
  const [totalProjetos, setTotalProjetos] = useState<number>(0);
  const [totalServiceOrder, setTotalServiceOrder] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allActivities, setAllActivities] = useState<any[]>([]);
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
      const activities = await getAllActivities();
      setAllActivities(activities);
      
      // Contar total de atividades
      setTotalActivities(activities.length);
      
      // Contar atividades por status
      countActivitiesByStatus(activities);
      
      // Carregar outros dados
      const projects = await ObrasService.getAllObras();
      setTotalProjetos(projects.length);
      
      const serviceOrders = await getAllServiceOrders();
      setTotalServiceOrder(serviceOrders.length);
      
      // Carregar estatísticas para os gráficos
      const dadosMacroTask = await dataMacroTask();
      setMacroTaskStatistic(dadosMacroTask as MacroTaskStatistic[]);
      setOriginalMacroTaskStatistic(dadosMacroTask as MacroTaskStatistic[]);
      
      const dadosProcesso = await dataProcess();
      setProcessStatistic(dadosProcesso as ProcessStatistic[]);
      setOriginalProcessStatistic(dadosProcesso as ProcessStatistic[]);
    } catch (error) {
      // Resetar os dados em caso de erro
      resetDashboardData();
    } finally {
      setIsLoading(false);
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
    setActivitiesByStatus({ planejadas: 0, emExecucao: 0, concluidas: 0, paralizadas: 0 });
    setMacroTaskStatistic([]);
    setProcessStatistic([]);
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
    
    // Aplicar filtro por obra se necessário
    if (obraId !== null && obraId !== undefined) {
      filteredActivities = filteredActivities.filter(activity => {
        if (!activity.project) return false;
        
        const activityProjectId = typeof activity.project.id === 'string' 
          ? Number(activity.project.id) 
          : activity.project.id;
          
        return activityProjectId === obraId;
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
    }
    
    // Aplicar filtro de data se tiver data de início ou fim
    if (startDate || endDate) {
      filteredActivities = filterDataByPeriod(filteredActivities, 'personalizado', startDate, endDate);
    }
    
    // Se não encontrou atividades após aplicar os filtros, zera tudo
    if (filteredActivities.length === 0) {
      resetDashboardData();
      return;
    }
    
    // Atualizar contagem de atividades por status
    countActivitiesByStatus(filteredActivities);
    
    // Atualizar total de atividades
    setTotalActivities(filteredActivities.length);
    
    // Filtrar estatísticas de tarefas macro
    if (originalMacroTaskStatistic.length > 0) {
      // Aplicar filtro de data às estatísticas de tarefas macro
      let filteredMacroTask = [...originalMacroTaskStatistic];
      
      if (startDate || endDate) {
        filteredMacroTask = filterDataByPeriod(filteredMacroTask, 'personalizado', startDate, endDate);
      }
      
      // Se não há dados após filtragem, define como array vazio
      setMacroTaskStatistic(filteredMacroTask.length > 0 ? filteredMacroTask : []);
    }
    
    // Filtrar estatísticas de processos
    if (originalProcessStatistic.length > 0) {
      // Aplicar filtro de data às estatísticas de processos
      let filteredProcess = [...originalProcessStatistic];
      
      if (startDate || endDate) {
        filteredProcess = filterDataByPeriod(filteredProcess, 'personalizado', startDate, endDate);
      }
      
      // Se não há dados após filtragem, define como array vazio
      setProcessStatistic(filteredProcess.length > 0 ? filteredProcess : []);
    }
  };

  return {
    macroTaskStatistic,
    processStatistic,
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
