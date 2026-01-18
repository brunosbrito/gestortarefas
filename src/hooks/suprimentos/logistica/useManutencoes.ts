// Hooks TanStack Query para Manutenções
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import manutencoesService from '@/services/suprimentos/logistica/manutencoesService';
import { Manutencao, ManutencaoCreate, ManutencaoUpdate } from '@/interfaces/suprimentos/logistica/ManutencaoInterface';
import { useToast } from '@/hooks/use-toast';

const MANUTENCOES_QUERY_KEY = ['suprimentos', 'logistica', 'manutencoes'];

// ============================================================================
// GET ALL - Lista todas as manutenções
// ============================================================================
export const useManutencoes = () => {
  return useQuery({
    queryKey: MANUTENCOES_QUERY_KEY,
    queryFn: async () => {
      const response = await manutencoesService.getAll();
      if (response.success) {
        return response.data.manutencoes;
      }
      throw new Error(response.message || 'Erro ao carregar manutenções');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ============================================================================
// GET BY ID - Busca uma manutenção específica por ID
// ============================================================================
export const useManutencao = (id: number) => {
  return useQuery({
    queryKey: [...MANUTENCOES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await manutencoesService.getById(id);
      if (response.success && response.data) {
        return response.data.manutencao;
      }
      throw new Error(response.message || 'Erro ao carregar manutenção');
    },
    enabled: !!id, // Só executa se id existir
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY VEICULO - Busca manutenções por veículo
// ============================================================================
export const useManutencoesByVeiculo = (veiculoId: number) => {
  return useQuery({
    queryKey: [...MANUTENCOES_QUERY_KEY, 'veiculo', veiculoId],
    queryFn: async () => {
      const response = await manutencoesService.getByVeiculo(veiculoId);
      if (response.success) {
        return response.data.manutencoes;
      }
      throw new Error(response.message || 'Erro ao carregar manutenções do veículo');
    },
    enabled: !!veiculoId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY STATUS - Busca manutenções por status
// ============================================================================
export const useManutencoesByStatus = (status: string) => {
  return useQuery({
    queryKey: [...MANUTENCOES_QUERY_KEY, 'status', status],
    queryFn: async () => {
      const response = await manutencoesService.getByStatus(status);
      if (response.success) {
        return response.data.manutencoes;
      }
      throw new Error(response.message || 'Erro ao carregar manutenções');
    },
    enabled: !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY TIPO - Busca manutenções por tipo
// ============================================================================
export const useManutencoesByTipo = (tipoId: number) => {
  return useQuery({
    queryKey: [...MANUTENCOES_QUERY_KEY, 'tipo', tipoId],
    queryFn: async () => {
      const response = await manutencoesService.getByTipo(tipoId);
      if (response.success) {
        return response.data.manutencoes;
      }
      throw new Error(response.message || 'Erro ao carregar manutenções');
    },
    enabled: !!tipoId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// CREATE - Cria uma nova manutenção
// ============================================================================
export const useCreateManutencao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ManutencaoCreate) => {
      const response = await manutencoesService.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao criar manutenção');
      }
      return response.data.manutencao;
    },
    onSuccess: (manutencao: Manutencao) => {
      // Invalida queries para forçar refetch
      queryClient.invalidateQueries({ queryKey: MANUTENCOES_QUERY_KEY });

      toast({
        title: 'Manutenção criada',
        description: `Manutenção do veículo ${manutencao.veiculo_placa} foi criada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar manutenção',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// UPDATE - Atualiza uma manutenção existente
// ============================================================================
export const useUpdateManutencao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ManutencaoUpdate }) => {
      const response = await manutencoesService.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao atualizar manutenção');
      }
      return response.data.manutencao;
    },
    onSuccess: (manutencao: Manutencao) => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: MANUTENCOES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...MANUTENCOES_QUERY_KEY, manutencao.id] });

      toast({
        title: 'Manutenção atualizada',
        description: `Manutenção foi atualizada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar manutenção',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// DELETE - Deleta uma manutenção
// ============================================================================
export const useDeleteManutencao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await manutencoesService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar manutenção');
      }
      return id;
    },
    onSuccess: () => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: MANUTENCOES_QUERY_KEY });

      toast({
        title: 'Manutenção deletada',
        description: 'A manutenção foi deletada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar manutenção',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// INICIAR MANUTENÇÃO - Muda status de agendada para em_andamento
// ============================================================================
export const useIniciarManutencao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await manutencoesService.iniciarManutencao(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao iniciar manutenção');
      }
      return response.data.manutencao;
    },
    onSuccess: (manutencao: Manutencao) => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: MANUTENCOES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...MANUTENCOES_QUERY_KEY, manutencao.id] });

      toast({
        title: 'Manutenção iniciada',
        description: `Manutenção do veículo ${manutencao.veiculo_placa} foi iniciada.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao iniciar manutenção',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// CONCLUIR MANUTENÇÃO - Muda status para concluida
// ============================================================================
export const useConcluirManutencao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await manutencoesService.concluirManutencao(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao concluir manutenção');
      }
      return response.data.manutencao;
    },
    onSuccess: (manutencao: Manutencao) => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: MANUTENCOES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...MANUTENCOES_QUERY_KEY, manutencao.id] });
      // Invalida também veículos (para atualizar KM e status de manutenção)
      queryClient.invalidateQueries({ queryKey: ['suprimentos', 'logistica', 'vehicles'] });

      toast({
        title: 'Manutenção concluída',
        description: `Manutenção do veículo ${manutencao.veiculo_placa} foi concluída com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao concluir manutenção',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
