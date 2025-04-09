
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
    period: 'todos'
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
          filters.period as PeriodFilterType
        );

        setFilteredActivities(activities);
      } catch (error) {
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

  const handlePeriodChange = (period: PeriodFilterType, obraId?: string | null, serviceOrderId?: string | null) => {
    // Convertendo IDs de string para number, se existirem
    const numericObraId = obraId && obraId !== "null" ? Number(obraId) : null;
    const numericServiceOrderId = serviceOrderId && serviceOrderId !== "null" ? Number(serviceOrderId) : null;
    
    setFilters(prev => ({
      ...prev,
      period,
      obraId: numericObraId,
      serviceOrderId: numericServiceOrderId
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
