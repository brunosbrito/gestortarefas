
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
          filters.period as PeriodFilterType,
          filters.startDate,
          filters.endDate
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

  const handlePeriodChange = (
    period: PeriodFilterType, 
    obraId?: string | null, 
    serviceOrderId?: string | null,
    startDate?: Date | null,
    endDate?: Date | null
  ) => {
    // Convertendo IDs de string para number, se existirem
    const numericObraId = obraId && obraId !== "null" ? Number(obraId) : null;
    const numericServiceOrderId = serviceOrderId && serviceOrderId !== "null" ? Number(serviceOrderId) : null;
    
    setFilters(prev => ({
      ...prev,
      period,
      obraId: numericObraId,
      serviceOrderId: numericServiceOrderId,
      startDate: period === 'personalizado' ? startDate : null,
      endDate: period === 'personalizado' ? endDate : null
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
