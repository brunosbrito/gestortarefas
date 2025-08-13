import { useEffect } from 'react';
import { Building2, ClipboardList, Activity } from 'lucide-react';
import { StatsSummary } from './dashboard/StatsSummary';
import { MacroTasksChart } from './dashboard/charts/MacroTasksChart';
import { ProcessHoursChart } from './dashboard/charts/ProcessHoursChart';
import { CollaboratorsChart } from './dashboard/charts/CollaboratorsChart';
import { LoadingSpinner } from './dashboard/LoadingSpinner';
import { TaskProcessFilter } from './dashboard/TaskProcessFilter';
import { FilteredActivitiesTable } from './dashboard/FilteredActivitiesTable';
import { Separator } from './ui/separator';
import { PeriodFilter } from './dashboard/PeriodFilter';
import { ActivityStatusCards } from './dashboard/ActivityStatusCards';
import { SwotAnalysis } from './dashboard/SwotAnalysis';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';

const Dashboard = () => {
  const {
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
  } = useDashboardData();

  const {
    filters,
    filteredActivities,
    isFilteredDataLoading,
    handleFilterChange,
    handlePeriodChange,
  } = useDashboardFilters();

  // Carregar todos os dados ao montar o componente
  useEffect(() => {
    loadAllData();
  }, []);

  // Aplicar filtro de período a todos os dados
  useEffect(() => {
    if (filters.period) {
      // Aplicamos o filtro de período aos dados estatísticos
      applyPeriodFilter(
        filters.period as any,
        filters.obraId,
        filters.serviceOrderId,
        filters.startDate,
        filters.endDate
      );
    }
  }, [
    filters.period,
    filters.obraId,
    filters.serviceOrderId,
    filters.startDate,
    filters.endDate,
  ]);

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
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PeriodFilter
        onFilterChange={handlePeriodChange}
        currentFilters={filters}
      />

      <StatsSummary stats={stats} />

      <ActivityStatusCards activitiesByStatus={activitiesByStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {macroTaskStatistic && macroTaskStatistic.length > 0 ? (
          <MacroTasksChart macroTasks={macroTaskStatistic} />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              Atividades por Tarefa Macro
            </h3>
            <div className="flex items-center justify-center h-60 text-gray-400">
              Nenhum dado disponível para os filtros selecionados
            </div>
          </div>
        )}

        {processStatistic && processStatistic.length > 0 ? (
          <ProcessHoursChart processes={processStatistic} />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              Atividades por Processo
            </h3>
            <div className="flex items-center justify-center h-60 text-gray-400">
              Nenhum dado disponível para os filtros selecionados
            </div>
          </div>
        )}
      </div>

      {/* <div className="grid grid-cols-1 gap-6">
        {collaboratorStatistic && collaboratorStatistic.length > 0 ? (
          <CollaboratorsChart collaborators={collaboratorStatistic} />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Contribuição por Colaborador</h3>
            <div className="flex items-center justify-center h-60 text-gray-400">
              Nenhum dado disponível para os filtros selecionados
            </div>
          </div>
        )}
      </div> */}

      <Separator className="my-8" />

      <SwotAnalysis filters={filters} />

      <Separator className="my-8" />

      <TaskProcessFilter
        onFilterChange={handleFilterChange}
        currentFilters={filters}
      />

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
