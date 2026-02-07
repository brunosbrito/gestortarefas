import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OrcamentoService from '@/services/OrcamentoService';
import { Orcamento, CreateOrcamento, UpdateOrcamento } from '@/interfaces/OrcamentoInterface';
import { useToast } from '@/hooks/use-toast';

/**
 * Query Keys para React Query
 * Centralizados para evitar erros de digitação
 */
export const orcamentoKeys = {
  all: ['orcamentos'] as const,
  lists: () => [...orcamentoKeys.all, 'list'] as const,
  list: (filters?: any) => [...orcamentoKeys.lists(), filters] as const,
  details: () => [...orcamentoKeys.all, 'detail'] as const,
  detail: (id: string) => [...orcamentoKeys.details(), id] as const,
};

/**
 * Hook para buscar lista de orçamentos
 *
 * Features:
 * - Cache automático (5 minutos)
 * - Refetch em background
 * - Retry automático em caso de erro
 *
 * @example
 * ```tsx
 * const { data: orcamentos, isLoading, error } = useOrcamentos();
 * ```
 */
export const useOrcamentos = () => {
  return useQuery({
    queryKey: orcamentoKeys.lists(),
    queryFn: () => OrcamentoService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
    retry: 2,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook para buscar orçamento individual por ID
 *
 * @param id - ID do orçamento
 * @param enabled - Se a query deve ser executada (default: true quando id existe)
 *
 * @example
 * ```tsx
 * const { data: orcamento, isLoading } = useOrcamento(id);
 * ```
 */
export const useOrcamento = (id: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: orcamentoKeys.detail(id!),
    queryFn: () => OrcamentoService.getById(id!),
    enabled: !!id && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutos
    retry: 2,
  });
};

/**
 * Hook para criar novo orçamento
 *
 * Features:
 * - Invalidação automática da lista
 * - Toast de sucesso/erro
 * - Callback onSuccess opcional
 *
 * @example
 * ```tsx
 * const { mutate: criar, isPending } = useCreateOrcamento({
 *   onSuccess: (orcamento) => navigate(`/comercial/orcamentos/${orcamento.id}`)
 * });
 *
 * criar(novoOrcamento);
 * ```
 */
export const useCreateOrcamento = (options?: {
  onSuccess?: (orcamento: Orcamento) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateOrcamento) => OrcamentoService.create(data),
    onSuccess: (orcamento) => {
      // Invalidar lista para refetch
      queryClient.invalidateQueries({ queryKey: orcamentoKeys.lists() });

      toast({
        title: 'Sucesso',
        description: `Orçamento ${orcamento.numero} criado com sucesso!`,
      });

      options?.onSuccess?.(orcamento);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar orçamento',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });

      options?.onError?.(error);
    },
  });
};

/**
 * Hook para atualizar orçamento existente
 *
 * Features:
 * - Invalidação automática da lista e detail
 * - Toast de sucesso/erro
 * - Optimistic updates opcional
 *
 * @example
 * ```tsx
 * const { mutate: atualizar, isPending } = useUpdateOrcamento();
 * atualizar({ id: '123', data: { nome: 'Novo Nome' } });
 * ```
 */
export const useUpdateOrcamento = (options?: {
  onSuccess?: (orcamento: Orcamento) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateOrcamento> }) =>
      OrcamentoService.update(id, data),
    onSuccess: (orcamento, variables) => {
      // Invalidar lista e detail específico
      queryClient.invalidateQueries({ queryKey: orcamentoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orcamentoKeys.detail(variables.id) });

      toast({
        title: 'Sucesso',
        description: 'Orçamento atualizado com sucesso!',
      });

      options?.onSuccess?.(orcamento);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar orçamento',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });

      options?.onError?.(error);
    },
  });
};

/**
 * Hook para deletar orçamento
 *
 * Features:
 * - Invalidação automática da lista
 * - Toast de sucesso/erro
 * - Callback onSuccess opcional
 *
 * @example
 * ```tsx
 * const { mutate: deletar, isPending } = useDeleteOrcamento({
 *   onSuccess: () => navigate('/comercial/orcamentos')
 * });
 * deletar(id);
 * ```
 */
export const useDeleteOrcamento = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => OrcamentoService.delete(id),
    onSuccess: (_, id) => {
      // Invalidar lista e remover detail do cache
      queryClient.invalidateQueries({ queryKey: orcamentoKeys.lists() });
      queryClient.removeQueries({ queryKey: orcamentoKeys.detail(id) });

      toast({
        title: 'Sucesso',
        description: 'Orçamento deletado com sucesso!',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar orçamento',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });

      options?.onError?.(error);
    },
  });
};

/**
 * Hook para clonar orçamento
 *
 * Features:
 * - Invalidação automática da lista
 * - Toast de sucesso/erro
 * - Retorna orçamento clonado
 *
 * @example
 * ```tsx
 * const { mutate: clonar, isPending } = useClonarOrcamento({
 *   onSuccess: (clonado) => navigate(`/comercial/orcamentos/${clonado.id}`)
 * });
 * clonar(id);
 * ```
 */
export const useClonarOrcamento = (options?: {
  onSuccess?: (orcamento: Orcamento) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => OrcamentoService.clonar(id),
    onSuccess: (orcamento) => {
      // Invalidar lista para mostrar novo orçamento
      queryClient.invalidateQueries({ queryKey: orcamentoKeys.lists() });

      toast({
        title: 'Sucesso',
        description: `Orçamento ${orcamento.numero} clonado com sucesso!`,
      });

      options?.onSuccess?.(orcamento);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao clonar orçamento',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });

      options?.onError?.(error);
    },
  });
};
