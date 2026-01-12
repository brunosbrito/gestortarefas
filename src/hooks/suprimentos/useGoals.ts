import { useQuery } from '@tanstack/react-query';
import goalsService from '@/services/suprimentos/goalsService';

export const useGoals = () => {
  return useQuery({
    queryKey: ['suprimentos-goals'],
    queryFn: () => goalsService.getAll(),
  });
};
