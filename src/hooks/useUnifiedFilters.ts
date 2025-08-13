import { useMemo, useState, useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { DashboardFilters } from '@/types/dashboard';
import TarefaMacroService from '@/services/TarefaMacroService';
import ProcessService from '@/services/ProcessService';
import ColaboradorService from '@/services/ColaboradorService';
import ObrasService from '@/services/ObrasService';
import { getAllServiceOrders } from '@/services/ServiceOrderService';

export interface FilterOptions {
  macroTasks: Array<{ id: number; name: string }>;
  processes: Array<{ id: number; name: string }>;
  collaborators: Array<{ id: number; name: string }>;
  projects: Array<{ id: number; name: string }>;
  serviceOrders: Array<{ id: number; number: string; description: string }>;
}

/**
 * Hook unificado para gerenciar todos os filtros do dashboard
 * Centraliza a lógica de filtros e opções disponíveis
 */
export const useUnifiedFilters = () => {
  const { filters, updateFilters, loading } = useDashboardStore();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    macroTasks: [],
    processes: [],
    collaborators: [],
    projects: [],
    serviceOrders: [],
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Carregar opções de filtro
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoadingOptions(true);
      try {
        console.log('🔍 Carregando opções de filtro...');
        
        const [macroTasksRes, processesRes, collaboratorsRes, projectsRes, serviceOrdersRes] = await Promise.all([
          TarefaMacroService.getAll(),
          ProcessService.getAll(),
          ColaboradorService.getAllColaboradores(),
          ObrasService.getAllObras(),
          getAllServiceOrders(),
        ]);

        const macroTasks = macroTasksRes.data || [];
        const processes = processesRes.data || [];
        const collaborators = collaboratorsRes || [];
        const projects = projectsRes || [];
        const serviceOrders = serviceOrdersRes || [];

        setFilterOptions({
          macroTasks: macroTasks.map(mt => ({ id: mt.id, name: mt.name })),
          processes: processes.map(p => ({ id: p.id, name: p.name })),
          collaborators: collaborators.map(c => ({ id: c.id, name: c.name })),
          projects: projects.map(p => ({ id: p.id, name: p.name })),
          serviceOrders: serviceOrders.map(os => ({
            id: os.id,
            number: os.serviceOrderNumber || os.number || '',
            description: os.description || ''
          })),
        });
        
        console.log('✅ Opções de filtro carregadas');
      } catch (error) {
        console.error('❌ Erro ao carregar opções de filtro:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Funções para atualizar filtros específicos
  const updateMacroTaskFilter = (macroTaskId: number | null) => {
    updateFilters({ macroTaskId });
  };

  const updateProcessFilter = (processId: number | null) => {
    updateFilters({ processId });
  };

  const updateCollaboratorFilter = (collaboratorId: number | null) => {
    updateFilters({ collaboratorId });
  };

  const updateProjectFilter = (obraId: number | null) => {
    updateFilters({ obraId });
  };

  const updateServiceOrderFilter = (serviceOrderId: number | null) => {
    updateFilters({ serviceOrderId });
  };

  const updatePeriodFilter = (period: string, startDate?: Date | null, endDate?: Date | null) => {
    updateFilters({
      period: period as any,
      startDate,
      endDate,
    });
  };

  // Limpar filtros específicos
  const clearMacroTaskFilter = () => updateMacroTaskFilter(null);
  const clearProcessFilter = () => updateProcessFilter(null);
  const clearCollaboratorFilter = () => updateCollaboratorFilter(null);
  const clearProjectFilter = () => updateProjectFilter(null);
  const clearServiceOrderFilter = () => updateServiceOrderFilter(null);

  // Limpar todos os filtros
  const clearAllFilters = () => {
    updateFilters({
      macroTaskId: null,
      processId: null,
      serviceOrderId: null,
      obraId: null,
      collaboratorId: null,
      period: 'todos',
      startDate: null,
      endDate: null,
    });
  };

  // Verificar se existem filtros ativos
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.macroTaskId ||
      filters.processId ||
      filters.serviceOrderId ||
      filters.obraId ||
      filters.collaboratorId ||
      (filters.period && filters.period !== 'todos') ||
      filters.startDate ||
      filters.endDate
    );
  }, [filters]);

  // Contadores de filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.macroTaskId) count++;
    if (filters.processId) count++;
    if (filters.serviceOrderId) count++;
    if (filters.obraId) count++;
    if (filters.collaboratorId) count++;
    if (filters.period && filters.period !== 'todos') count++;
    return count;
  }, [filters]);

  // Obter nome do filtro ativo
  const getFilterName = (type: keyof FilterOptions, id: number): string => {
    const option = filterOptions[type].find(opt => opt.id === id);
    if (type === 'serviceOrders') {
      const serviceOrderOption = option as { id: number; number: string; description: string };
      return serviceOrderOption?.number || 'Desconhecido';
    }
    const nameOption = option as { id: number; name: string };
    return nameOption?.name || 'Desconhecido';
  };

  return {
    // Estado dos filtros
    filters,
    filterOptions,
    hasActiveFilters,
    activeFiltersCount,
    loading: loading.filtered || loadingOptions,

    // Funções para atualizar filtros
    updateMacroTaskFilter,
    updateProcessFilter,
    updateCollaboratorFilter,
    updateProjectFilter,
    updateServiceOrderFilter,
    updatePeriodFilter,

    // Funções para limpar filtros
    clearMacroTaskFilter,
    clearProcessFilter,
    clearCollaboratorFilter,
    clearProjectFilter,
    clearServiceOrderFilter,
    clearAllFilters,

    // Utilitários
    getFilterName,
    
    // Atualização geral
    updateFilters,
  };
};