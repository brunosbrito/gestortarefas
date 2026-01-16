// Hooks TanStack Query para Cotações
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cotacoesService from '@/services/suprimentos/compras/cotacoesService';
import { Cotacao, CotacaoCreate, CotacaoUpdate } from '@/interfaces/suprimentos/compras/CotacaoInterface';
import { useToast } from '@/hooks/use-toast';

const COTACOES_QUERY_KEY = ['suprimentos', 'compras', 'cotacoes'];

// ============================================================================
// GET ALL - Lista todas as cotações
// ============================================================================
export const useCotacoes = () => {
  return useQuery({
    queryKey: COTACOES_QUERY_KEY,
    queryFn: async () => {
      const response = await cotacoesService.getAll();
      if (response.success) {
        return response.data.cotacoes;
      }
      throw new Error(response.message || 'Erro ao carregar cotações');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ============================================================================
// GET BY ID - Busca uma cotação específica por ID
// ============================================================================
export const useCotacao = (id: number) => {
  return useQuery({
    queryKey: [...COTACOES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await cotacoesService.getById(id);
      if (response.success && response.data) {
        return response.data.cotacao;
      }
      throw new Error(response.message || 'Erro ao carregar cotação');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY STATUS - Busca cotações por status
// ============================================================================
export const useCotacoesByStatus = (status: string) => {
  return useQuery({
    queryKey: [...COTACOES_QUERY_KEY, 'status', status],
    queryFn: async () => {
      const response = await cotacoesService.getByStatus(status);
      if (response.success) {
        return response.data.cotacoes;
      }
      throw new Error(response.message || 'Erro ao carregar cotações');
    },
    enabled: !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY REQUISICAO - Busca cotações de uma requisição
// ============================================================================
export const useCotacoesByRequisicao = (requisicaoId: number) => {
  return useQuery({
    queryKey: [...COTACOES_QUERY_KEY, 'requisicao', requisicaoId],
    queryFn: async () => {
      const response = await cotacoesService.getByRequisicao(requisicaoId);
      if (response.success) {
        return response.data.cotacoes;
      }
      throw new Error(response.message || 'Erro ao carregar cotações');
    },
    enabled: !!requisicaoId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// CREATE - Cria uma nova cotação
// ============================================================================
export const useCreateCotacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CotacaoCreate) => {
      const response = await cotacoesService.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao criar cotação');
      }
      return response.data.cotacao;
    },
    onSuccess: (cotacao: Cotacao) => {
      queryClient.invalidateQueries({ queryKey: COTACOES_QUERY_KEY });

      toast({
        title: 'Cotação criada',
        description: `Cotação ${cotacao.numero} foi criada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar cotação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// UPDATE - Atualiza uma cotação existente
// ============================================================================
export const useUpdateCotacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CotacaoUpdate }) => {
      const response = await cotacoesService.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao atualizar cotação');
      }
      return response.data.cotacao;
    },
    onSuccess: (cotacao: Cotacao) => {
      queryClient.invalidateQueries({ queryKey: COTACOES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...COTACOES_QUERY_KEY, cotacao.id] });

      toast({
        title: 'Cotação atualizada',
        description: `Cotação ${cotacao.numero} foi atualizada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar cotação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// DELETE - Deleta uma cotação
// ============================================================================
export const useDeleteCotacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await cotacoesService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar cotação');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COTACOES_QUERY_KEY });

      toast({
        title: 'Cotação deletada',
        description: 'A cotação foi deletada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar cotação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// FINALIZAR - Finaliza uma cotação
// ============================================================================
export const useFinalizarCotacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await cotacoesService.finalizar(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao finalizar cotação');
      }
      return response.data.cotacao;
    },
    onSuccess: (cotacao: Cotacao) => {
      queryClient.invalidateQueries({ queryKey: COTACOES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...COTACOES_QUERY_KEY, cotacao.id] });

      toast({
        title: 'Cotação finalizada',
        description: `Cotação ${cotacao.numero} foi finalizada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao finalizar cotação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
