import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import purchasesService from '@/services/suprimentos/purchasesService';
import { useToast } from '@/hooks/use-toast';

export const usePurchases = () => {
  return useQuery({
    queryKey: ['suprimentos-purchases'],
    queryFn: () => purchasesService.getAll(),
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: any) => purchasesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-purchases'] });
      toast({
        title: 'Sucesso',
        description: 'Compra criada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar compra',
        variant: 'destructive',
      });
    },
  });
};
