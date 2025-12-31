import React, { useEffect, useState } from 'react';
import { Building2, ClipboardList, Activity, ChevronDown } from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

/**
 * Dashboard refatorado - integrado com store centralizado e sistema de filtros unificado
 *
 * Principais melhorias:
 * - Estado centralizado com Zustand
 * - Sistema de filtros unificado
 * - Performance otimizada
 * - Melhor organização do código
 * - Responsividade aprimorada
 * - Layout moderno com collapsibles para mobile
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

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [swotOpen, setSwotOpen] = useState(false);

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
    <div className="p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header com informações sobre filtros ativos */}
        {hasActiveFilters && (
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-300">
                {filteredData.activities.length} de {totals.activities} atividades
              </span>
            </div>
          </div>
        )}

        {/* Filtros - Collapsible no mobile */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <div className="bg-card rounded-xl shadow-elevation-2 border border-border/50 overflow-hidden">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-accent/50 transition-colors"
              >
                <h3 className="text-lg font-semibold">Filtros</h3>
                <ChevronDown className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  filtersOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 md:p-6 pt-0 border-t border-border/50">
                <PeriodFilter
                  onFilterChange={(filterData) => {
                    if (filterData.period || filterData.startDate || filterData.endDate) {
                      updatePeriodFilter(
                        filterData.period || 'todos',
                        filterData.startDate,
                        filterData.endDate
                      );
                    }

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
                <Separator className="my-6" />
                <TaskProcessFilter
                  onFilterChange={(newFilters) => {
                    updateFilters(newFilters);
                  }}
                  currentFilters={filters}
                />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Cards de Estatísticas Principais */}
        <StatsSummary stats={stats} />

        {/* Cards de Status das Atividades */}
        <ActivityStatusCards activitiesByStatus={activityStatus} />

        {/* Gráficos de Estatísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MacroTasksChart macroTasks={statistics.macroTasks || []} />
          <ProcessHoursChart processes={statistics.processes || []} />
        </div>

        {/* Análise SWOT - Collapsible */}
        <Collapsible open={swotOpen} onOpenChange={setSwotOpen}>
          <div className="bg-card rounded-xl shadow-elevation-2 border border-border/50 overflow-hidden">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-accent/50 transition-colors"
              >
                <h3 className="text-lg font-semibold">Análise SWOT</h3>
                <ChevronDown className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  swotOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 md:p-6 pt-0 border-t border-border/50">
                <SwotAnalysis />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Tabela de Atividades Filtradas */}
        <div className="bg-card rounded-xl shadow-elevation-2 border border-border/50 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-border/50 bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Atividades Filtradas
              </h3>
              <div className="text-sm text-muted-foreground">
                {loading.filtered ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Aplicando filtros...
                  </div>
                ) : (
                  <span className="font-medium tabular-nums">
                    {filteredData.activities.length} atividade{filteredData.activities.length !== 1 ? 's' : ''}
                  </span>
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
    </div>
  );
};

export default Dashboard;
