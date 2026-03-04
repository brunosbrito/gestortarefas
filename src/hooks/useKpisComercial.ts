import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OrcamentoService, { KpisResponse, Acao5S, CreateAcao5SDto } from '@/services/OrcamentoService';
import { useToast } from '@/hooks/use-toast';

/**
 * Query Keys para React Query
 */
export const kpisKeys = {
  all: ['kpis'] as const,
  detail: (mesAno: string) => [...kpisKeys.all, mesAno] as const,
};

export const acoes5sKeys = {
  all: ['acoes5s'] as const,
  list: (mesAno?: string) => [...acoes5sKeys.all, 'list', mesAno] as const,
};

/**
 * Hook para buscar KPIs comerciais
 *
 * @param mesAno - Formato "YYYY-MM" (opcional, default: mês atual)
 *
 * @example
 * ```tsx
 * const { data: kpis, isLoading } = useKpis('2026-03');
 * ```
 */
export const useKpis = (mesAno?: string) => {
  return useQuery({
    queryKey: kpisKeys.detail(mesAno || 'current'),
    queryFn: () => OrcamentoService.getKpis(mesAno),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook para buscar ações 5S
 *
 * @param mesAno - Formato "YYYY-MM" (opcional)
 *
 * @example
 * ```tsx
 * const { data: acoes, isLoading } = useAcoes5S('2026-03');
 * ```
 */
export const useAcoes5S = (mesAno?: string) => {
  return useQuery({
    queryKey: acoes5sKeys.list(mesAno),
    queryFn: () => OrcamentoService.getAcoes5S(mesAno),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook para criar ação 5S
 *
 * @example
 * ```tsx
 * const { mutate: criar, isPending } = useCreateAcao5S();
 * criar({ data: '2026-03-04', descricao: 'Organização do almoxarifado' });
 * ```
 */
export const useCreateAcao5S = (options?: {
  onSuccess?: (acao: Acao5S) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateAcao5SDto) => OrcamentoService.createAcao5S(data),
    onSuccess: (acao) => {
      // Invalidar listas de ações 5S e KPIs
      queryClient.invalidateQueries({ queryKey: acoes5sKeys.all });
      queryClient.invalidateQueries({ queryKey: kpisKeys.all });

      toast({
        title: 'Sucesso',
        description: 'Ação 5S registrada com sucesso!',
      });

      options?.onSuccess?.(acao);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao registrar ação',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });

      options?.onError?.(error);
    },
  });
};

/**
 * Hook para deletar ação 5S
 *
 * @example
 * ```tsx
 * const { mutate: deletar, isPending } = useDeleteAcao5S();
 * deletar(id);
 * ```
 */
export const useDeleteAcao5S = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => OrcamentoService.deleteAcao5S(id),
    onSuccess: () => {
      // Invalidar listas de ações 5S e KPIs
      queryClient.invalidateQueries({ queryKey: acoes5sKeys.all });
      queryClient.invalidateQueries({ queryKey: kpisKeys.all });

      toast({
        title: 'Sucesso',
        description: 'Ação 5S removida com sucesso!',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover ação',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });

      options?.onError?.(error);
    },
  });
};
