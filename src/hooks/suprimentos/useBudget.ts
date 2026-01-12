import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import budgetService from '@/services/suprimentos/budgetService';
import { useToast } from '@/hooks/use-toast';

export const useBudgetByContract = (contractId: number) => {
  return useQuery({
    queryKey: ['suprimentos-budget', contractId],
    queryFn: () => budgetService.getByContract(contractId),
    enabled: !!contractId,
  });
};

export const useImportBudget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ contractId, file }: { contractId: number; file: File }) =>
      budgetService.importBudget(contractId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-budget'] });
      queryClient.invalidateQueries({ queryKey: ['suprimentos-contracts'] });
      toast({
        title: 'Sucesso',
        description: 'Orçamento importado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao importar orçamento',
        variant: 'destructive',
      });
    },
  });
};
