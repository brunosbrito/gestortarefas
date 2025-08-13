import { create } from 'zustand';
import { DashboardState, NormalizedActivity, ActivityStatistics, DashboardFilters } from '@/types/dashboard';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';
import { normalizeActivity, countActivitiesByStatus, filterActivities } from '@/utils/activityHelpers';
import { filterDataByPeriod } from '@/utils/dateFilter';
import { getAllActivities } from '@/services/ActivityService';
import ObrasService from '@/services/ObrasService';
import { getAllServiceOrders } from '@/services/ServiceOrderService';
import { dataMacroTask, dataProcess, dataCollaborators } from '@/services/StatisticsService';

interface DashboardStore extends DashboardState {
  // Actions
  loadInitialData: () => Promise<void>;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  applyFilters: () => void;
  loadStatistics: (obraId?: number | null, serviceOrderId?: number | null) => Promise<void>;
  reset: () => void;
}

const initialState: DashboardState = {
  activities: [],
  projects: [],
  serviceOrders: [],
  statistics: {
    macroTasks: [],
    processes: [],
    collaborators: [],
  },
  totals: {
    activities: 0,
    projects: 0,
    serviceOrders: 0,
  },
  activityStatus: {
    total: 0,
    planejadas: 0,
    emExecucao: 0,
    concluidas: 0,
    paralizadas: 0,
  },
  loading: {
    data: false,
    statistics: false,
    filtered: false,
  },
  filters: {
    period: 'todos' as PeriodFilterType,
  },
  filteredData: {
    activities: [],
    projects: [],
    serviceOrders: [],
  },
  lastUpdated: new Date(),
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  ...initialState,

  loadInitialData: async () => {
    set(state => ({
      ...state,
      loading: { ...state.loading, data: true }
    }));

    try {
      console.log('🔄 Carregando dados iniciais do dashboard...');
      
      const [activitiesData, projectsData, serviceOrdersData] = await Promise.all([
        getAllActivities(),
        ObrasService.getAllObras(),
        getAllServiceOrders(),
      ]);

      console.log('📊 Dados carregados:', {
        activities: activitiesData?.length || 0,
        projects: projectsData?.length || 0,
        serviceOrders: serviceOrdersData?.length || 0,
      });

      // Normalizar atividades
      const normalizedActivities = (activitiesData || []).map(normalizeActivity);
      
      // Contar atividades por status
      const activityStatus = countActivitiesByStatus(normalizedActivities);

      set(state => ({
        ...state,
        activities: normalizedActivities,
        projects: projectsData || [],
        serviceOrders: serviceOrdersData || [],
        totals: {
          activities: normalizedActivities.length,
          projects: (projectsData || []).length,
          serviceOrders: (serviceOrdersData || []).length,
        },
        activityStatus,
        filteredData: {
          activities: normalizedActivities,
          projects: projectsData || [],
          serviceOrders: serviceOrdersData || [],
        },
        loading: { ...state.loading, data: false },
        lastUpdated: new Date(),
      }));

      // Carregar estatísticas
      await get().loadStatistics();
      
      console.log('✅ Dados iniciais carregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
      set(state => ({
        ...state,
        loading: { ...state.loading, data: false }
      }));
    }
  },

  loadStatistics: async (obraId?: number | null, serviceOrderId?: number | null) => {
    set(state => ({
      ...state,
      loading: { ...state.loading, statistics: true }
    }));

    try {
      console.log('📈 Carregando estatísticas...', { obraId, serviceOrderId });
      
      const [macroTaskStats, processStats, collaboratorStats] = await Promise.all([
        dataMacroTask(obraId, serviceOrderId),
        dataProcess(obraId, serviceOrderId),
        dataCollaborators(obraId, serviceOrderId),
      ]);

      set(state => ({
        ...state,
        statistics: {
          macroTasks: macroTaskStats || [],
          processes: processStats || [],
          collaborators: collaboratorStats || [],
        },
        loading: { ...state.loading, statistics: false }
      }));
      
      console.log('✅ Estatísticas carregadas');
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      set(state => ({
        ...state,
        loading: { ...state.loading, statistics: false }
      }));
    }
  },

  updateFilters: (newFilters: Partial<DashboardFilters>) => {
    console.log('🔍 Atualizando filtros:', newFilters);
    
    set(state => ({
      ...state,
      filters: { ...state.filters, ...newFilters } as DashboardFilters
    }));

    // Aplicar filtros automaticamente
    get().applyFilters();
  },

  applyFilters: () => {
    const state = get();
    
    set(prevState => ({
      ...prevState,
      loading: { ...prevState.loading, filtered: true }
    }));

    try {
      console.log('🎯 Aplicando filtros:', state.filters);

      let filteredActivities = [...state.activities];
      let filteredProjects = [...state.projects];
      let filteredServiceOrders = [...state.serviceOrders];

      // Aplicar filtros específicos às atividades
      if (state.filters.macroTaskId || 
          state.filters.processId || 
          state.filters.obraId || 
          state.filters.serviceOrderId || 
          state.filters.collaboratorId) {
        
        filteredActivities = filterActivities(filteredActivities, {
          macroTaskId: state.filters.macroTaskId,
          processId: state.filters.processId,
          projectId: state.filters.obraId,
          serviceOrderId: state.filters.serviceOrderId,
          collaboratorId: state.filters.collaboratorId,
        });
      }

      // Aplicar filtro de período (sempre aplicar se há período ou datas definidas)
      if ((state.filters.period && state.filters.period !== 'todos') || 
          state.filters.startDate || 
          state.filters.endDate) {
        
        const periodToUse = state.filters.period || 'todos';
        
        filteredActivities = filterDataByPeriod(
          filteredActivities,
          periodToUse as PeriodFilterType,
          state.filters.startDate,
          state.filters.endDate
        );

        filteredProjects = filterDataByPeriod(
          filteredProjects,
          periodToUse as PeriodFilterType,
          state.filters.startDate,
          state.filters.endDate
        );

        filteredServiceOrders = filterDataByPeriod(
          filteredServiceOrders,
          periodToUse as PeriodFilterType,
          state.filters.startDate,
          state.filters.endDate
        );
      }

      // NOTA: Não filtramos projetos e ordens de serviço por ID específico
      // Os cards devem mostrar totais do período, não apenas o item selecionado
      // A seleção específica afeta apenas atividades e estatísticas

      // Recalcular estatísticas baseadas nos dados filtrados
      const activityStatus = countActivitiesByStatus(filteredActivities);

      set(prevState => ({
        ...prevState,
        filteredData: {
          activities: filteredActivities,
          projects: filteredProjects,
          serviceOrders: filteredServiceOrders,
        },
        activityStatus,
        totals: {
          activities: filteredActivities.length,
          projects: filteredProjects.length,
          serviceOrders: filteredServiceOrders.length,
        },
        loading: { ...prevState.loading, filtered: false }
      }));

      console.log('✅ Filtros aplicados:', {
        activities: filteredActivities.length,
        projects: filteredProjects.length,
        serviceOrders: filteredServiceOrders.length,
      });

      // Recarregar estatísticas se necessário
      if (state.filters.obraId !== undefined || state.filters.serviceOrderId !== undefined) {
        get().loadStatistics(state.filters.obraId, state.filters.serviceOrderId);
      }

    } catch (error) {
      console.error('❌ Erro ao aplicar filtros:', error);
      set(prevState => ({
        ...prevState,
        loading: { ...prevState.loading, filtered: false }
      }));
    }
  },

  reset: () => {
    console.log('🔄 Resetando dashboard store');
    set({ ...initialState });
  },
}));