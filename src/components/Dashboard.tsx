
import { useState, useEffect } from 'react';
import { Building2, ClipboardList, Activity, Users } from 'lucide-react';
import { StatsSummary } from './dashboard/StatsSummary';
import { MacroTasksChart } from './dashboard/charts/MacroTasksChart';
import { ProcessHoursChart } from './dashboard/charts/ProcessHoursChart';
import { LoadingSpinner } from './dashboard/LoadingSpinner';
import { MacroTaskStatistic, ProcessStatistic } from '@/interfaces/ActivityStatistics';
import { dataMacroTask, dataProcess } from '@/services/StatisticsService';
import { getAllActivities } from '@/services/ActivityService';
import { getAllServiceOrders } from '@/services/ServiceOrderService';
import ObrasService from '@/services/ObrasService';
import { TaskProcessFilter } from './dashboard/TaskProcessFilter';
import { FilteredServiceOrderTable } from './dashboard/FilteredServiceOrderTable';
import { FilteredActivitiesTable } from './dashboard/FilteredActivitiesTable';
import { DashboardFilters, FilteredActivity, FilteredServiceOrder } from '@/interfaces/DashboardFilters';
import { getFilteredActivities, getFilteredServiceOrders } from '@/services/DashboardService';
import { Separator } from './ui/separator';
import { PeriodFilter, PeriodFilterType } from './dashboard/PeriodFilter';
import { ActivityStatusCards } from './dashboard/ActivityStatusCards';

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
  const [totalActivities, setTotalActivities] = useState<number>(0);
  const [totalProjetos, setTotalProjetos] = useState<number>(0);
  const [totalServiceOrder, setTotalServiceOrder] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    macroTaskId: null,
    processId: null,
    period: null
  });
  const [filteredServiceOrders, setFilteredServiceOrders] = useState<FilteredServiceOrder[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<FilteredActivity[]>([]);
  const [isFilteredDataLoading, setIsFilteredDataLoading] = useState(false);
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

  const TotalActivities = async () => {
    const activities = await getAllActivities();
    setTotalActivities(activities.length);
    
    // Contar atividades por status
    const statusCount = activities.reduce((counts: any, activity) => {
      const status = activity.status || 'Não especificado';
      
      if (status === 'Planejadas') counts.planejadas++;
      else if (status === 'Em execução') counts.emExecucao++;
      else if (status === 'Concluídas') counts.concluidas++;
      else if (status === 'Paralizadas') counts.paralizadas++;
      
      return counts;
    }, { planejadas: 0, emExecucao: 0, concluidas: 0, paralizadas: 0 });
    
    setActivitiesByStatus(statusCount);
  }

  const TotalProjects = async () => {
    const projects = await ObrasService.getAllObras();
    setTotalProjetos(projects.length);
  }

  const TotalServiceOrder = async () => {
    const serviceOrder = await getAllServiceOrders();
    setTotalServiceOrder(serviceOrder.length);
  }
  
  useEffect(() => {
    const getMacroTask = async () => {
      try {
        const dadosMacroTask = await dataMacroTask();
        setMacroTaskStatistic(dadosMacroTask as MacroTaskStatistic[]);
      } catch (error) {
        console.error("Erro ao buscar as atividades", error);
      } finally {
        setIsLoading(false);
      }
    };

    const getProcess = async () => {
      try {
        const dadosProcesso = await dataProcess();
        setProcessStatistic(dadosProcesso as ProcessStatistic[]);
      } catch (error) {
        console.error("Erro ao buscar as atividades", error);
      } finally {
        setIsLoading(false);
      }
    };

    getMacroTask();
    getProcess();
    TotalActivities();
    TotalProjects();
    TotalServiceOrder();
  }, []);

  useEffect(() => {
    const loadFilteredData = async () => {
      setIsFilteredDataLoading(true);
      try {
        const [serviceOrders, activities] = await Promise.all([
          getFilteredServiceOrders(filters.macroTaskId, filters.processId),
          getFilteredActivities(filters.macroTaskId, filters.processId)
        ]);
        
        setFilteredServiceOrders(serviceOrders);
        setFilteredActivities(activities);
      } catch (error) {
        console.error("Erro ao carregar dados filtrados:", error);
      } finally {
        setIsFilteredDataLoading(false);
      }
    };

    loadFilteredData();
  }, [filters]);

  const handleFilterChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
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
      <StatsSummary stats={stats} />
      
      <ActivityStatusCards activitiesByStatus={activitiesByStatus} />

      <PeriodFilter onFilterChange={handlePeriodChange} defaultValue="todos" />

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
        <FilteredServiceOrderTable 
          serviceOrders={filteredServiceOrders} 
          loading={isFilteredDataLoading} 
        />
        
        <FilteredActivitiesTable 
          activities={filteredActivities} 
          loading={isFilteredDataLoading} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
