import { useQuery } from '@tanstack/react-query';
import accountsService from '@/services/suprimentos/accountsService';

export const useAccounts = () => {
  return useQuery({
    queryKey: ['suprimentos-accounts'],
    queryFn: () => accountsService.getAll(),
  });
};
