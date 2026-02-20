import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PropostaService from '@/services/PropostaService';
import { Proposta } from '@/interfaces/PropostaInterface';
import { useToast } from '@/hooks/use-toast';

/**
 * Query Keys para React Query
 */
export const propostaKeys = {
  all: ['propostas'] as const,
  lists: () => [...propostaKeys.all, 'list'] as const,
  list: (filters?: any) => [...propostaKeys.lists(), filters] as const,
  details: () => [...propostaKeys.all, 'detail'] as const,
  detail: (id: string) => [...propostaKeys.details(), id] as const,
};

/**
 * Hook para buscar lista de propostas
 *
 * @example
 * ```tsx
 * const { data: propostas, isLoading, error } = usePropostas();
 * ```
 */
export const usePropostas = () => {
  return useQuery({
    queryKey: propostaKeys.lists(),
    queryFn: () => PropostaService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook para buscar proposta individual por ID
 *
 * @param id - ID da proposta
 * @param enabled - Se a query deve ser executada
 */
export const useProposta = (id: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: propostaKeys.detail(id!),
    queryFn: () => PropostaService.getById(id!),
    enabled: !!id && enabled,
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Hook para deletar proposta
 */
export const useDeleteProposta = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => PropostaService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: propostaKeys.lists() });
      queryClient.removeQueries({ queryKey: propostaKeys.detail(id) });

      toast({
        title: 'Sucesso',
        description: 'Proposta deletada com sucesso!',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar proposta',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });

      options?.onError?.(error);
    },
  });
};
