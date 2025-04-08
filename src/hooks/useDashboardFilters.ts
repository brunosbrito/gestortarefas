
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
    obraId: null,
    period: 'todos'
  });
  const [filteredActivities, setFilteredActivities] = useState<FilteredActivity[]>([]);
  const [isFilteredDataLoading, setIsFilteredDataLoading] = useState(false);

  useEffect(() => {
    const loadFilteredData = async () => {
      setIsFilteredDataLoading(true);
      try {
        console.log("Aplicando filtros:", filters);
        
        // Busca atividades considerando todos os filtros
        const activities = await getFilteredActivities(
          filters.macroTaskId, 
          filters.processId,
          filters.obraId,
          filters.serviceOrderId,
          filters.period as PeriodFilterType
        );

        console.log("Atividades filtradas:", activities.length);
        setFilteredActivities(activities);
      } catch (error) {
        console.error("Erro ao carregar dados filtrados:", error);
        setFilteredActivities([]);
      } finally {
        setIsFilteredDataLoading(false);
      }
    };

    loadFilteredData();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    console.log("Atualizando filtros:", newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePeriodChange = (period: PeriodFilterType, obraId?: string | null, serviceOrderId?: string | null) => {
    console.log("Filtro de período alterado:", { period, obraId, serviceOrderId });
    
    // Convertendo IDs de string para number, se existirem
    const numericObraId = obraId ? Number(obraId) : null;
    const numericServiceOrderId = serviceOrderId ? Number(serviceOrderId) : null;
    
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
