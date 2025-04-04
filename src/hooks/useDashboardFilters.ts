
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
    period: 'todos'
  });
  const [filteredActivities, setFilteredActivities] = useState<FilteredActivity[]>([]);
  const [isFilteredDataLoading, setIsFilteredDataLoading] = useState(false);

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

  return {
    filters,
    filteredActivities,
    isFilteredDataLoading,
    handleFilterChange,
    handlePeriodChange
  };
};
