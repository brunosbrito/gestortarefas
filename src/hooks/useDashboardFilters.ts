import { useState, useEffect } from 'react';
import { DashboardFilters, FilteredActivity } from '@/interfaces/DashboardFilters';
import { getFilteredActivities } from '@/services/DashboardService';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';
import { filterDataByPeriod } from '@/utils/dateFilter';

export const useDashboardFilters = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    macroTaskId: null,
    processId: null,
    serviceOrderId: null,
    obraId: null, // ✅ Adicionado filtro por obra
    period: 'todos'
  });
  const [filteredActivities, setFilteredActivities] = useState<FilteredActivity[]>([]);
  const [isFilteredDataLoading, setIsFilteredDataLoading] = useState(false);

  useEffect(() => {
    const loadFilteredData = async () => {
      setIsFilteredDataLoading(true);
      try {
        // ✅ Busca atividades considerando macroTaskId, processId, obraId e serviceOrderId
        const activities = await getFilteredActivities(
          filters.macroTaskId, 
          filters.processId,
          filters.obraId, // ✅ Filtro de obra
          filters.serviceOrderId // ✅ Filtro de OS
        );

        // ✅ Aplica o filtro de período às atividades carregadas
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

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePeriodChange = (period: PeriodFilterType, obraId?: string | null, serviceOrderId?: string | null) => {
    setFilters(prev => ({
      ...prev,
      period,
      obraId: obraId ? Number(obraId) : null,
      serviceOrderId: serviceOrderId ? Number(serviceOrderId) : null
    }));
  };

  return {
    filters,
    filteredActivities,
    isFilteredDataLoading,
    handleFilterChange,
    handlePeriodChange
  };
};
