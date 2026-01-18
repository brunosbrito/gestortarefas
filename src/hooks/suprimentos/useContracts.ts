import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import contractsService from '@/services/suprimentos/contractsService';
import { useToast } from '@/hooks/use-toast';
import { ContractSuprimentos, ContractCreate } from '@/interfaces/suprimentos/ContractInterface';

export const useContracts = () => {
  return useQuery({
    queryKey: ['suprimentos-contracts'],
    queryFn: () => contractsService.getAll(),
  });
};

export const useContract = (id: number) => {
  return useQuery({
    queryKey: ['suprimentos-contracts', id],
    queryFn: () => contractsService.getById(id),
    enabled: !!id,
  });
};

export const useContractKPIs = () => {
  return useQuery({
    queryKey: ['suprimentos-contracts', 'kpis'],
    queryFn: () => contractsService.getKPIs(),
  });
};

export const useContractRealizedValue = (id: number) => {
  return useQuery({
    queryKey: ['suprimentos-contracts', id, 'realized-value'],
    queryFn: () => contractsService.getRealizedValue(id),
    enabled: !!id,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ contractData, qqpFile }: { contractData: ContractCreate; qqpFile: File }) =>
      contractsService.create(contractData, qqpFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-contracts'] });
      toast({
        title: 'Sucesso',
        description: 'Contrato criado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar contrato',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, contract }: { id: number; contract: Partial<ContractSuprimentos> }) =>
      contractsService.update(id, contract),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['suprimentos-contracts', variables.id] });
      toast({
        title: 'Sucesso',
        description: 'Contrato atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar contrato',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => contractsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-contracts'] });
      toast({
        title: 'Sucesso',
        description: 'Contrato removido com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover contrato',
        variant: 'destructive',
      });
    },
  });
};
