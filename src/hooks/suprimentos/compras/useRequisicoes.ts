// Hooks TanStack Query para Requisições de Compra
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import requisicoesService from '@/services/suprimentos/compras/requisicoesService';
import { Requisicao, RequisicaoCreate, RequisicaoUpdate } from '@/interfaces/suprimentos/compras/RequisicaoInterface';
import { useToast } from '@/hooks/use-toast';

const REQUISICOES_QUERY_KEY = ['suprimentos', 'compras', 'requisicoes'];

// ============================================================================
// GET ALL - Lista todas as requisições
// ============================================================================
export const useRequisicoes = () => {
  return useQuery({
    queryKey: REQUISICOES_QUERY_KEY,
    queryFn: async () => {
      const response = await requisicoesService.getAll();
      if (response.success) {
        return response.data.requisicoes;
      }
      throw new Error(response.message || 'Erro ao carregar requisições');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ============================================================================
// GET BY ID - Busca uma requisição específica por ID
// ============================================================================
export const useRequisicao = (id: number) => {
  return useQuery({
    queryKey: [...REQUISICOES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await requisicoesService.getById(id);
      if (response.success && response.data) {
        return response.data.requisicao;
      }
      throw new Error(response.message || 'Erro ao carregar requisição');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY STATUS - Busca requisições por status
// ============================================================================
export const useRequisicoesByStatus = (status: string) => {
  return useQuery({
    queryKey: [...REQUISICOES_QUERY_KEY, 'status', status],
    queryFn: async () => {
      const response = await requisicoesService.getByStatus(status);
      if (response.success) {
        return response.data.requisicoes;
      }
      throw new Error(response.message || 'Erro ao carregar requisições');
    },
    enabled: !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// CREATE - Cria uma nova requisição
// ============================================================================
export const useCreateRequisicao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: RequisicaoCreate) => {
      const response = await requisicoesService.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao criar requisição');
      }
      return response.data.requisicao;
    },
    onSuccess: (requisicao: Requisicao) => {
      queryClient.invalidateQueries({ queryKey: REQUISICOES_QUERY_KEY });

      toast({
        title: 'Requisição criada',
        description: `Requisição ${requisicao.numero} foi criada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar requisição',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// UPDATE - Atualiza uma requisição existente
// ============================================================================
export const useUpdateRequisicao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RequisicaoUpdate }) => {
      const response = await requisicoesService.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao atualizar requisição');
      }
      return response.data.requisicao;
    },
    onSuccess: (requisicao: Requisicao) => {
      queryClient.invalidateQueries({ queryKey: REQUISICOES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...REQUISICOES_QUERY_KEY, requisicao.id] });

      toast({
        title: 'Requisição atualizada',
        description: `Requisição ${requisicao.numero} foi atualizada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar requisição',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// DELETE - Deleta uma requisição
// ============================================================================
export const useDeleteRequisicao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await requisicoesService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar requisição');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUISICOES_QUERY_KEY });

      toast({
        title: 'Requisição deletada',
        description: 'A requisição foi deletada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar requisição',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// APROVAR - Aprova uma requisição
// ============================================================================
export const useAprovarRequisicao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, aprovadorId }: { id: number; aprovadorId: number }) => {
      const response = await requisicoesService.aprovar(id, aprovadorId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao aprovar requisição');
      }
      return response.data.requisicao;
    },
    onSuccess: (requisicao: Requisicao) => {
      queryClient.invalidateQueries({ queryKey: REQUISICOES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...REQUISICOES_QUERY_KEY, requisicao.id] });

      toast({
        title: 'Requisição aprovada',
        description: `Requisição ${requisicao.numero} foi aprovada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao aprovar requisição',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// REPROVAR - Reprova uma requisição
// ============================================================================
export const useReprovarRequisicao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, aprovadorId, motivo }: { id: number; aprovadorId: number; motivo: string }) => {
      const response = await requisicoesService.reprovar(id, aprovadorId, motivo);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao reprovar requisição');
      }
      return response.data.requisicao;
    },
    onSuccess: (requisicao: Requisicao) => {
      queryClient.invalidateQueries({ queryKey: REQUISICOES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...REQUISICOES_QUERY_KEY, requisicao.id] });

      toast({
        title: 'Requisição reprovada',
        description: `Requisição ${requisicao.numero} foi reprovada.`,
        variant: 'destructive',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao reprovar requisição',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
