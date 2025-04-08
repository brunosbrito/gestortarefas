
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
      console.log("Carregando dados do dashboard...");
      
      const activities = await getAllActivities();
      setAllActivities(activities);
      console.log("Atividades carregadas:", activities.length);
      
      // Contar total de atividades
      setTotalActivities(activities.length);
      
      // Contar atividades por status
      countActivitiesByStatus(activities);
      
      // Carregar outros dados
      const projects = await ObrasService.getAllObras();
      setTotalProjetos(projects.length);
      console.log("Projetos carregados:", projects.length);
      
      const serviceOrders = await getAllServiceOrders();
      setTotalServiceOrder(serviceOrders.length);
      console.log("Ordens de serviço carregadas:", serviceOrders.length);
      
      // Carregar estatísticas para os gráficos
      const dadosMacroTask = await dataMacroTask();
      setMacroTaskStatistic(dadosMacroTask as MacroTaskStatistic[]);
      setOriginalMacroTaskStatistic(dadosMacroTask as MacroTaskStatistic[]);
      console.log("Estatísticas de tarefas macro carregadas:", dadosMacroTask.length);
      
      const dadosProcesso = await dataProcess();
      setProcessStatistic(dadosProcesso as ProcessStatistic[]);
      setOriginalProcessStatistic(dadosProcesso as ProcessStatistic[]);
      console.log("Estatísticas de processos carregadas:", dadosProcesso.length);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para contar atividades por status
  const countActivitiesByStatus = (activities: any[]) => {
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

  // Aplicar filtro de período aos dados
  const applyPeriodFilter = (period: PeriodFilterType, obraId?: number | null, serviceOrderId?: number | null) => {
    console.log("applyPeriodFilter chamado com:", { period, obraId, serviceOrderId });
    
    if (allActivities.length === 0) {
      console.log("Sem atividades para filtrar");
      return;
    }

    // Filtrar atividades por período e outros filtros
    let filteredActivities = [...allActivities];
    
    // Aplicar filtro por obra se necessário
    if (obraId !== null && obraId !== undefined) {
      console.log("Filtrando por obra ID:", obraId);
      filteredActivities = filteredActivities.filter(activity => {
        if (!activity.project) return false;
        
        const activityProjectId = Number(activity.project.id);
        const match = activityProjectId === obraId;
        return match;
      });
      console.log("Atividades após filtro de obra:", filteredActivities.length);
    }
    
    // Aplicar filtro por ordem de serviço se necessário
    if (serviceOrderId !== null && serviceOrderId !== undefined) {
      console.log("Filtrando por ordem de serviço ID:", serviceOrderId);
      filteredActivities = filteredActivities.filter(activity => {
        if (!activity.serviceOrder) return false;
        
        const activityServiceOrderId = Number(activity.serviceOrder.id);
        const match = activityServiceOrderId === serviceOrderId;
        return match;
      });
      console.log("Atividades após filtro de ordem de serviço:", filteredActivities.length);
    }
    
    // Aplicar filtro de período por último
    if (period && period !== 'todos') {
      console.log("Aplicando filtro de período:", period);
      filteredActivities = filterDataByPeriod(filteredActivities, period);
      console.log("Atividades após filtro de período:", filteredActivities.length);
    }
    
    // Atualizar contagem de atividades por status
    countActivitiesByStatus(filteredActivities);
    
    // Atualizar total de atividades
    setTotalActivities(filteredActivities.length);
    
    // Filtrar estatísticas de tarefas macro
    if (originalMacroTaskStatistic.length > 0) {
      console.log("Aplicando filtros às estatísticas de tarefas macro");
      
      // Se for "todos", restaurar os dados originais
      if (period === 'todos' && !obraId && !serviceOrderId) {
        setMacroTaskStatistic([...originalMacroTaskStatistic]);
      } else {
        // Caso contrário, aplicar filtros
        let filteredMacroTask = [...originalMacroTaskStatistic];
        
        // Aplicar filtro de período apenas se necessário
        if (period && period !== 'todos') {
          filteredMacroTask = filterDataByPeriod(filteredMacroTask, period);
        }
        
        setMacroTaskStatistic(filteredMacroTask);
      }
      
      console.log("Estatísticas de tarefas macro após filtros:", macroTaskStatistic.length);
    }
    
    // Filtrar estatísticas de processos
    if (originalProcessStatistic.length > 0) {
      console.log("Aplicando filtros às estatísticas de processos");
      
      // Se for "todos", restaurar os dados originais
      if (period === 'todos' && !obraId && !serviceOrderId) {
        setProcessStatistic([...originalProcessStatistic]);
      } else {
        // Caso contrário, aplicar filtros
        let filteredProcess = [...originalProcessStatistic];
        
        // Aplicar filtro de período apenas se necessário
        if (period && period !== 'todos') {
          filteredProcess = filterDataByPeriod(filteredProcess, period);
        }
        
        setProcessStatistic(filteredProcess);
      }
      
      console.log("Estatísticas de processos após filtros:", processStatistic.length);
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
