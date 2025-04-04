
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
      
      const dadosProcesso = await dataProcess();
      setProcessStatistic(dadosProcesso as ProcessStatistic[]);
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
  const applyPeriodFilter = (period: PeriodFilterType) => {
    if (allActivities.length === 0) return;

    // Filtrar atividades por período
    const filteredByPeriod = filterDataByPeriod(allActivities, period);
    
    // Atualizar contagem de atividades por status com base no período
    countActivitiesByStatus(filteredByPeriod);
    
    // Atualizar total de atividades com base no período
    setTotalActivities(filteredByPeriod.length);
    
    // Filtrar estatísticas por período
    if (macroTaskStatistic.length > 0) {
      const filteredMacroTask = filterDataByPeriod(macroTaskStatistic, period);
      setMacroTaskStatistic(filteredMacroTask);
    }
    
    if (processStatistic.length > 0) {
      const filteredProcess = filterDataByPeriod(processStatistic, period);
      setProcessStatistic(filteredProcess);
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
