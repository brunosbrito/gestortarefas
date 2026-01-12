import { useQuery } from '@tanstack/react-query';
import analyticsService from '@/services/suprimentos/analyticsService';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['suprimentos-analytics'],
    queryFn: () => analyticsService.get(),
  });
};
