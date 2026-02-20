import React, { useEffect, useState } from 'react';
import { Building2, ClipboardList, Activity, ChevronDown, Filter, X } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useUnifiedFilters } from '@/hooks/useUnifiedFilters';
import { StatsSummary } from './dashboard/StatsSummary';
import { PerformanceChart } from './dashboard/charts/PerformanceChart';
import { LoadingSpinner } from './dashboard/LoadingSpinner';
import { DashboardKPIsNew } from './dashboard/DashboardKPIsNew';
import { ProductivityTrendsChart } from './dashboard/charts/ProductivityTrendsChart';
import { TeamCapacityChart } from './dashboard/charts/TeamCapacityChart';
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
import { useTour } from '@/hooks/useTour';
import { dashboardTourSteps } from '@/lib/tourSteps';
import { TourButton } from './tour/TourButton';

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
    activeFiltersCount,
    clearAllFilters
  } = useUnifiedFilters();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [visaoGeralOpen, setVisaoGeralOpen] = useState(true);
  const [statusOpen, setStatusOpen] = useState(true);
  const [graficosOpen, setGraficosOpen] = useState(true);
  const [swotOpen, setSwotOpen] = useState(false);

  // Hook do tour (deve ser chamado ANTES de qualquer return)
  const { startTour } = useTour({
    steps: dashboardTourSteps,
    onComplete: () => {
      console.log('✅ Tour do Dashboard concluído!');
    }
  });

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
        {/* Header com informações sobre filtros ativos e Tour */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
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
          </div>
          <TourButton onClick={startTour} variant="outline" size="default" />
        </div>

        {/* Filtros - Collapsible no mobile */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <div className="bg-card rounded-xl shadow-elevation-2 border border-border/50 overflow-hidden" data-tour="filters">
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
              <div className="p-4 md:p-6 pt-0 border-t border-border/50 space-y-6">
                {/* Título e botão limpar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-[#FF7F0E]" />
                    <h3 className="font-medium">Filtrar por:</h3>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpar Filtros
                    </Button>
                  )}
                </div>

                {/* Filtros de Obra e Período */}
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

                {/* Filtros de Tarefa Macro, Processo e Colaborador */}
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

        {/* 1. Visão Geral */}
        <Collapsible open={visaoGeralOpen} onOpenChange={setVisaoGeralOpen}>
          <div className="bg-card rounded-xl shadow-elevation-2 border border-border/50 overflow-hidden" data-tour="stats-summary">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-accent/50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Visão Geral</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Totais e indicadores de performance PCP</p>
                </div>
                <ChevronDown className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  visaoGeralOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 md:p-6 pt-0 border-t border-border/50 space-y-6">
                <StatsSummary stats={stats} />
                <div data-tour="dashboard-kpis">
                  <DashboardKPIsNew />
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* 2. Status das Atividades */}
        <Collapsible open={statusOpen} onOpenChange={setStatusOpen}>
          <div className="bg-card rounded-xl shadow-elevation-2 border border-border/50 overflow-hidden" data-tour="activity-status">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-accent/50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Status das Atividades</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Distribuição por estado atual no período selecionado</p>
                </div>
                <ChevronDown className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  statusOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 md:p-6 pt-0 border-t border-border/50">
                <ActivityStatusCards activitiesByStatus={activityStatus} compact />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* 3. Análise de Performance - Gráficos */}
        <Collapsible open={graficosOpen} onOpenChange={setGraficosOpen}>
          <div className="bg-card rounded-xl shadow-elevation-2 border border-border/50 overflow-hidden">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-accent/50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Análise de Performance</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Gráficos detalhados por macro, processo, tendências e carga da equipe</p>
                </div>
                <ChevronDown className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  graficosOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 md:p-6 pt-0 border-t border-border/50 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: '520px' }}>
                  <div data-tour="performance-chart" className="h-[520px]">
                    <PerformanceChart />
                  </div>
                  <div data-tour="productivity-trends" className="h-[520px]">
                    <ProductivityTrendsChart />
                  </div>
                </div>
                <div data-tour="team-capacity">
                  <TeamCapacityChart />
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

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
      </div>
    </div>
  );
};

export default Dashboard;
