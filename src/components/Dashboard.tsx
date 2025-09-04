import React, { useEffect } from 'react';
import { Building2, ClipboardList, Activity } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useUnifiedFilters } from '@/hooks/useUnifiedFilters';
import { StatsSummary } from './dashboard/StatsSummary';
import { MacroTasksChart } from './dashboard/charts/MacroTasksChart';
import { ProcessHoursChart } from './dashboard/charts/ProcessHoursChart';
import { LoadingSpinner } from './dashboard/LoadingSpinner';
import { FilteredActivitiesTable } from './dashboard/FilteredActivitiesTable';
import { Separator } from './ui/separator';
import { PeriodFilter } from './dashboard/PeriodFilter';
import { ActivityStatusCards } from './dashboard/ActivityStatusCards';
import { SwotAnalysis } from './dashboard/SwotAnalysis';
import { TaskProcessFilter } from './dashboard/TaskProcessFilter';

/**
 * Dashboard refatorado - integrado com store centralizado e sistema de filtros unificado
 * 
 * Principais melhorias:
 * - Estado centralizado com Zustand
 * - Sistema de filtros unificado 
 * - Performance otimizada
 * - Melhor organização do código
 * - Responsividade aprimorada
 */
const Dashboard = () => {
  const { 
    statistics, 
    totals, 
    activityStatus, 
    filteredData,
    loading,
    loadInitialData 
  } = useDashboardStore();
  
  const { 
    filters, 
    updatePeriodFilter, 
    updateFilters,
    hasActiveFilters,
    activeFiltersCount 
  } = useUnifiedFilters();

  // Carregar dados iniciais ao montar o componente
  useEffect(() => {
    console.log('🚀 Inicializando Dashboard...');
    loadInitialData();
  }, []);

  // Configuração dos cards de estatísticas principais
  const stats = [
    {
      title: 'Fabrica/Obra',
      value: totals.projects.toString(),
      icon: Building2,
      color: 'bg-emerald-600',
    },
    {
      title: 'Ordens de Serviço',
      value: totals.serviceOrders.toString(),
      icon: ClipboardList,
      color: 'bg-blue-600',
    },
    {
      title: 'Atividades',
      value: totals.activities.toString(),
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  // Loading inicial
  if (loading.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com informações sobre filtros ativos */}
      {hasActiveFilters && (
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-300">
              Exibindo {filteredData.activities.length} de {totals.activities} atividades
            </span>
          </div>
        </div>
      )}

      {/* Filtro de Período */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <PeriodFilter
          onFilterChange={(filterData) => {
            // Atualizar filtros de período
            if (filterData.period || filterData.startDate || filterData.endDate) {
              updatePeriodFilter(
                filterData.period || 'todos',
                filterData.startDate,
                filterData.endDate
              );
            }
            
            // Atualizar filtro de obra
            if (filterData.obraId !== undefined) {
              updateFilters({ obraId: filterData.obraId });
            }
          }}
          currentFilters={{
            period: filters.period,
            startDate: filters.startDate,
            endDate: filters.endDate,
            obraId: filters.obraId,
          }}
        />
      </div>

      {/* Cards de Estatísticas Principais */}
      <StatsSummary stats={stats} />

      {/* Cards de Status das Atividades */}
      <ActivityStatusCards activitiesByStatus={activityStatus} />

      {/* Gráficos de Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Tarefas Macro */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          {statistics.macroTasks && statistics.macroTasks.length > 0 ? (
            <MacroTasksChart macroTasks={statistics.macroTasks} />
          ) : (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Atividades por Tarefa Macro
              </h3>
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum dado disponível</p>
                  {hasActiveFilters && (
                    <p className="text-xs mt-1">Tente ajustar os filtros</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gráfico de Processos */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          {statistics.processes && statistics.processes.length > 0 ? (
            <ProcessHoursChart processes={statistics.processes} />
          ) : (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Atividades por Processo
              </h3>
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum dado disponível</p>
                  {hasActiveFilters && (
                    <p className="text-xs mt-1">Tente ajustar os filtros</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Análise SWOT */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <SwotAnalysis />
      </div>

      <Separator className="my-8" />

      {/* Filtros de Tarefa/Processo */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <TaskProcessFilter
          onFilterChange={(newFilters) => {
            updateFilters(newFilters);
          }}
          currentFilters={filters}
        />
      </div>

      {/* Tabela de Atividades Filtradas */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Atividades Filtradas
            </h3>
            <div className="text-sm text-gray-500">
              {loading.filtered ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Aplicando filtros...
                </div>
              ) : (
                `${filteredData.activities.length} atividade${filteredData.activities.length !== 1 ? 's' : ''}`
              )}
            </div>
          </div>
        </div>
        <FilteredActivitiesTable
          activities={filteredData.activities as any}
          loading={loading.filtered}
        />
      </div>
    </div>
  );
};

export default Dashboard;