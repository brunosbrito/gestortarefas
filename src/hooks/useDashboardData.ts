
import { useState } from 'react';
import { MacroTaskStatistic, ProcessStatistic, CollaboratorStatistic } from '@/interfaces/ActivityStatistics';
import { ActivityStatusCounts, DashboardData } from '@/interfaces/DashboardDataTypes';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';
import { filterDataByPeriod } from '@/utils/dateFilter';
import { loadDashboardData } from '@/services/DashboardDataService';
import { countActivitiesByStatus, filterActivitiesByObra, filterActivitiesByServiceOrder } from '@/utils/dashboardUtils';

export const useDashboardData = (): DashboardData => {
  const [macroTaskStatistic, setMacroTaskStatistic] = useState<MacroTaskStatistic[]>([]);
  const [processStatistic, setProcessStatistic] = useState<ProcessStatistic[]>([]);
  const [collaboratorStatistic, setCollaboratorStatistic] = useState<CollaboratorStatistic[]>([]);
  const [originalMacroTaskStatistic, setOriginalMacroTaskStatistic] = useState<MacroTaskStatistic[]>([]);
  const [originalProcessStatistic, setOriginalProcessStatistic] = useState<ProcessStatistic[]>([]);
  const [originalCollaboratorStatistic, setOriginalCollaboratorStatistic] = useState<CollaboratorStatistic[]>([]);
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
      const dashboardData = await loadDashboardData();
      
      // Atualizar estados com os dados carregados
      setAllActivities(dashboardData.activities);
      setTotalActivities(dashboardData.activities.length);
      setActivitiesByStatus(dashboardData.statusCounts);
      setTotalProjetos(dashboardData.projects.length);
      setTotalServiceOrder(dashboardData.serviceOrders.length);
      
      // Atualizar estatísticas dos gráficos
      setMacroTaskStatistic(dashboardData.dadosMacroTask as MacroTaskStatistic[]);
      setOriginalMacroTaskStatistic(dashboardData.dadosMacroTask as MacroTaskStatistic[]);
      
      setProcessStatistic(dashboardData.dadosProcesso as ProcessStatistic[]);
      setOriginalProcessStatistic(dashboardData.dadosProcesso as ProcessStatistic[]);
      
      setCollaboratorStatistic(dashboardData.dadosColaboradores as CollaboratorStatistic[]);
      setOriginalCollaboratorStatistic(dashboardData.dadosColaboradores as CollaboratorStatistic[]);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setIsLoading(false);
    }
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
      filteredActivities = filterActivitiesByObra(filteredActivities, obraId);
      console.log("Atividades após filtro de obra:", filteredActivities.length);
    }
    
    // Aplicar filtro por ordem de serviço se necessário
    if (serviceOrderId !== null && serviceOrderId !== undefined) {
      console.log("Filtrando por ordem de serviço ID:", serviceOrderId);
      filteredActivities = filterActivitiesByServiceOrder(filteredActivities, serviceOrderId);
      console.log("Atividades após filtro de ordem de serviço:", filteredActivities.length);
    }
    
    // Atualizar contagem de atividades por status
    const newStatusCounts = countActivitiesByStatus(filteredActivities);
    setActivitiesByStatus(newStatusCounts);
    
    // Atualizar total de atividades
    setTotalActivities(filteredActivities.length);
    
    // Filtrar estatísticas de tarefas macro
    if (originalMacroTaskStatistic.length > 0) {
      console.log("Aplicando filtros às estatísticas de tarefas macro");
      
      // Se for "todos" e não houver outros filtros, restaurar os dados originais
      if (period === 'todos' && !obraId && !serviceOrderId) {
        setMacroTaskStatistic([...originalMacroTaskStatistic]);
      } else {
        // Caso contrário, aplicar filtro de período
        let filteredMacroTask = [...originalMacroTaskStatistic];
        
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
      
      // Se for "todos" e não houver outros filtros, restaurar os dados originais
      if (period === 'todos' && !obraId && !serviceOrderId) {
        setProcessStatistic([...originalProcessStatistic]);
      } else {
        // Caso contrário, aplicar filtro de período
        let filteredProcess = [...originalProcessStatistic];
        
        if (period && period !== 'todos') {
          filteredProcess = filterDataByPeriod(filteredProcess, period);
        }
        
        setProcessStatistic(filteredProcess);
      }
      
      console.log("Estatísticas de processos após filtros:", processStatistic.length);
    }
    
    // Filtrar estatísticas de colaboradores
    if (originalCollaboratorStatistic.length > 0) {
      console.log("Aplicando filtros às estatísticas de colaboradores");
      
      // Se for "todos" e não houver outros filtros, restaurar os dados originais
      if (period === 'todos' && !obraId && !serviceOrderId) {
        setCollaboratorStatistic([...originalCollaboratorStatistic]);
      } else {
        // Caso contrário, aplicar filtro de período
        let filteredCollaborators = [...originalCollaboratorStatistic];
        
        if (period && period !== 'todos') {
          filteredCollaborators = filterDataByPeriod(filteredCollaborators, period);
        }
        
        setCollaboratorStatistic(filteredCollaborators);
      }
      
      console.log("Estatísticas de colaboradores após filtros:", collaboratorStatistic.length);
    }
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
    countActivitiesByStatus,
    originalMacroTaskStatistic,
    originalProcessStatistic,
    originalCollaboratorStatistic,
    allActivities
  };
};
