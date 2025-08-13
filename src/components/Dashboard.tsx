import React, { useEffect } from 'react';
import { Building2, ClipboardList, Activity, TrendingUp } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useUnifiedFilters } from '@/hooks/useUnifiedFilters';
import { StatsSummary } from './dashboard/StatsSummary';
import { MacroTasksChart } from './dashboard/charts/MacroTasksChart';
import { ProcessHoursChart } from './dashboard/charts/ProcessHoursChart';
import { LoadingSpinner } from './dashboard/LoadingSpinner';
import { FilteredActivitiesTable } from './dashboard/FilteredActivitiesTable';
import { PeriodFilter } from './dashboard/PeriodFilter';
import { ActivityStatusCards } from './dashboard/ActivityStatusCards';
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
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Visão geral das operações e estatísticas</p>
        </div>
        {hasActiveFilters && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">
                {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-xs text-primary/80 block mt-1">
              Exibindo {filteredData.activities.length} de {totals.activities} atividades
            </span>
          </div>
        )}
      </div>

      {/* Seção de Filtros e Controles */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Filtros e Controles
          </h2>
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
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <TaskProcessFilter
              onFilterChange={(newFilters) => {
                updateFilters(newFilters);
              }}
              currentFilters={filters}
            />
          </div>
        </div>
      </div>

      {/* Seção de Estatísticas Principais */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Estatísticas Principais
        </h2>
        <StatsSummary stats={stats} />
      </div>

      {/* Cards de Status das Atividades */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          Status das Atividades
        </h2>
        <ActivityStatusCards activitiesByStatus={activityStatus} />
      </div>

      {/* Seção de Gráficos e Análises */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Análises e Gráficos
          </h2>
          <a 
            href="/analise-swot" 
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Ver Análise SWOT Completa →
          </a>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Tarefas Macro */}
          <div className="bg-white rounded-lg shadow-sm border">
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
          <div className="bg-white rounded-lg shadow-sm border">
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
      </div>

      {/* Tabela de Atividades Filtradas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Atividades Recentes
          </h2>
          <div className="text-sm text-gray-500">
            {loading.filtered ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                Aplicando filtros...
              </div>
            ) : (
              `${filteredData.activities.length} atividade${filteredData.activities.length !== 1 ? 's' : ''}`
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border">
          <FilteredActivitiesTable
            activities={filteredData.activities as any}
            loading={loading.filtered}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;