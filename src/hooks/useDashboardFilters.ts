
import { useState, useEffect } from 'react';
import { DashboardFilters, FilteredActivity } from '@/interfaces/DashboardFilters';
import { getFilteredActivities } from '@/services/DashboardService';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';

export const useDashboardFilters = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    macroTaskId: null,
    processId: null,
    serviceOrderId: null,
    obraId: null,
    collaboratorId: null,
    period: 'todos',
    startDate: null,
    endDate: null
  });
  const [filteredActivities, setFilteredActivities] = useState<FilteredActivity[]>([]);
  const [isFilteredDataLoading, setIsFilteredDataLoading] = useState(false);

  useEffect(() => {
    const loadFilteredData = async () => {
      setIsFilteredDataLoading(true);
      try {
        // Busca atividades considerando todos os filtros
        const activities = await getFilteredActivities(
          filters.macroTaskId, 
          filters.processId,
          filters.obraId,
          filters.serviceOrderId,
          filters.collaboratorId,
          filters.period as PeriodFilterType,
          filters.startDate,
          filters.endDate
        );

        setFilteredActivities(activities);
      } catch (error) {
        console.error('Erro ao carregar atividades filtradas:', error);
        setFilteredActivities([]);
      } finally {
        setIsFilteredDataLoading(false);
      }
    };

    loadFilteredData();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePeriodChange = (filters: Partial<DashboardFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...filters
    }));
  };

  console.log(filteredActivities, 'Atividades filtrasasadas');
  return {
    filters,
    filteredActivities,
    isFilteredDataLoading,
    handleFilterChange,
    handlePeriodChange
  };
};
