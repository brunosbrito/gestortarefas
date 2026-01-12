import { useQuery } from '@tanstack/react-query';
import dashboardService from '@/services/suprimentos/dashboardService';

export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: ['suprimentos-dashboard', 'kpis'],
    queryFn: () => dashboardService.getKPIs(),
  });
};

export const useDashboardActivity = () => {
  return useQuery({
    queryKey: ['suprimentos-dashboard', 'activity'],
    queryFn: () => dashboardService.getRecentActivity(),
  });
};
