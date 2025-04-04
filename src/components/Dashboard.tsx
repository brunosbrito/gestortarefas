
import { useState, useEffect } from 'react';
import { Building2, ClipboardList, Activity } from 'lucide-react';
import { StatsSummary } from './dashboard/StatsSummary';
import { MacroTasksChart } from './dashboard/charts/MacroTasksChart';
import { ProcessHoursChart } from './dashboard/charts/ProcessHoursChart';
import { LoadingSpinner } from './dashboard/LoadingSpinner';
import { CollaboratorsChart } from './dashboard/charts/CollaboratorsChart';
import { MacroTaskStatistic, ProcessStatistic, CollaboratorStatistic } from '@/interfaces/ActivityStatistics';
import { dataMacroTask, dataProcess } from '@/services/StatisticsService';
import { getAllActivities } from '@/services/ActivityService';
import { getAllServiceOrders } from '@/services/ServiceOrderService';
import ObrasService from '@/services/ObrasService';
import { TaskProcessFilter } from './dashboard/TaskProcessFilter';
import { FilteredActivitiesTable } from './dashboard/FilteredActivitiesTable';
import { DashboardFilters, FilteredActivity } from '@/interfaces/DashboardFilters';
import { getFilteredActivities } from '@/services/DashboardService';
import { Separator } from './ui/separator';
import { PeriodFilter, PeriodFilterType } from './dashboard/PeriodFilter';
import { ActivityStatusCards } from './dashboard/ActivityStatusCards';
import { filterDataByPeriod } from '@/utils/dateFilter';

// Cores para os gráficos
const CORES = [
  '#FF7F0E', // Laranja principal
  '#003366', // Azul Escuro
  '#F7C948', // Amarelo
  '#B0B0B0', // Cinza Concreto
  '#E0E0E0', // Cinza Claro
  '#FFA500', // Laranja Secundário
  '#1E90FF', // Azul Claro
];

const Dashboard = () => {
  const [macroTaskStatistic, setMacroTaskStatistic] = useState<MacroTaskStatistic[]>([]);
  const [processStatistic, setProcessStatistic] = useState<ProcessStatistic[]>([]);
  const [collaboratorStatistic, setCollaboratorStatistic] = useState<CollaboratorStatistic[]>([]);
  const [totalActivities, setTotalActivities] = useState<number>(0);
  const [totalProjetos, setTotalProjetos] = useState<number>(0);
  const [totalServiceOrder, setTotalServiceOrder] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    macroTaskId: null,
    processId: null,
    serviceOrderId: null,
    period: 'todos'
  });
  const [filteredActivities, setFilteredActivities] = useState<FilteredActivity[]>([]);
  const [isFilteredDataLoading, setIsFilteredDataLoading] = useState(false);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [activitiesByStatus, setActivitiesByStatus] = useState<{
    planejadas: number;
    emExecucao: number;
    concluidas: number;
    paralizadas: number;
  }>({
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
    const statusCounts = activities.reduce((counts: any, activity) => {
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

  // Carregar todos os dados ao montar o componente
  useEffect(() => {
    loadAllData();
  }, []);

  // Aplicar filtro de período a todos os dados
  useEffect(() => {
    if (allActivities.length === 0) return;

    // Filtrar atividades por período
    const filteredByPeriod = filterDataByPeriod(allActivities, filters.period as PeriodFilterType);
    
    // Atualizar contagem de atividades por status com base no período
    countActivitiesByStatus(filteredByPeriod);
    
    // Atualizar total de atividades com base no período
    setTotalActivities(filteredByPeriod.length);
    
    // Filtrar estatísticas por período
    if (macroTaskStatistic.length > 0) {
      const filteredMacroTask = filterDataByPeriod(macroTaskStatistic, filters.period as PeriodFilterType);
      setMacroTaskStatistic(filteredMacroTask);
    }
    
    if (processStatistic.length > 0) {
      const filteredProcess = filterDataByPeriod(processStatistic, filters.period as PeriodFilterType);
      setProcessStatistic(filteredProcess);
    }
    
  }, [filters.period, allActivities]);

  // Carregar dados filtrados quando os filtros mudam
  useEffect(() => {
    const loadFilteredData = async () => {
      setIsFilteredDataLoading(true);
      try {
        // Busca as atividades filtradas com todos os filtros aplicados
        const activities = await getFilteredActivities(
          filters.macroTaskId, 
          filters.processId,
          filters.serviceOrderId
        );
        
        // Aplicar filtro de período às atividades já filtradas
        const periodFilteredActivities = filterDataByPeriod(
          activities, 
          filters.period as PeriodFilterType
        );
        
        setFilteredActivities(periodFilteredActivities);
      } catch (error) {
        console.error("Erro ao carregar dados filtrados:", error);
      } finally {
        setIsFilteredDataLoading(false);
      }
    };

    loadFilteredData();
  }, [filters]);

  const handleFilterChange = (newFilters: DashboardFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePeriodChange = (period: PeriodFilterType) => {
    setFilters(prev => ({ ...prev, period }));
  };

  const stats = [
    {
      title: 'Fabrica/Obra',
      value: totalProjetos.toString(),
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      title: 'Ordens de Serviço',
      value: totalServiceOrder.toString(),
      icon: ClipboardList,
      color: 'bg-[#003366]',
    },
    {
      title: 'Atividades',
      value: totalActivities.toString(),
      icon: Activity,
      color: 'bg-[#F7C948]',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F0E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PeriodFilter onFilterChange={handlePeriodChange} defaultValue={filters.period as PeriodFilterType} />
      
      <StatsSummary stats={stats} />
      
      <ActivityStatusCards activitiesByStatus={activitiesByStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {macroTaskStatistic && (
          <MacroTasksChart
            macroTasks={macroTaskStatistic}
          />
        )}

        {processStatistic && (
          <ProcessHoursChart processes={processStatistic} />
        )}
      </div>

      <Separator className="my-8" />

      <TaskProcessFilter onFilterChange={handleFilterChange} currentFilters={filters} />
      
      <div className="grid grid-cols-1 gap-6">
        <FilteredActivitiesTable 
          activities={filteredActivities} 
          loading={isFilteredDataLoading} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
