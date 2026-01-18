// Hooks TanStack Query para Check-lists de Retorno
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import checklistsRetornoService from '@/services/suprimentos/logistica/checklistsRetornoService';
import { ChecklistRetorno, ChecklistRetornoCreate, ChecklistRetornoUpdate } from '@/interfaces/suprimentos/logistica/ChecklistRetornoInterface';
import { useToast } from '@/hooks/use-toast';

const CHECKLISTS_RETORNO_QUERY_KEY = ['suprimentos', 'logistica', 'checklistsRetorno'];

// ============================================================================
// GET ALL - Lista todos os check-lists de retorno
// ============================================================================
export const useChecklistsRetorno = () => {
  return useQuery({
    queryKey: CHECKLISTS_RETORNO_QUERY_KEY,
    queryFn: async () => {
      const response = await checklistsRetornoService.getAll();
      if (response.success) {
        return response.data.checklistsRetorno;
      }
      throw new Error(response.message || 'Erro ao carregar check-lists de retorno');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ============================================================================
// GET BY ID - Busca um check-list de retorno específico por ID
// ============================================================================
export const useChecklistRetorno = (id: number) => {
  return useQuery({
    queryKey: [...CHECKLISTS_RETORNO_QUERY_KEY, id],
    queryFn: async () => {
      const response = await checklistsRetornoService.getById(id);
      if (response.success && response.data) {
        return response.data.checklistRetorno;
      }
      throw new Error(response.message || 'Erro ao carregar check-list de retorno');
    },
    enabled: !!id, // Só executa se id existir
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY CHECKLIST SAIDA ID - Busca check-list de retorno por ID do check-list de saída
// ============================================================================
export const useChecklistRetornoByChecklistSaidaId = (checklistSaidaId: number) => {
  return useQuery({
    queryKey: [...CHECKLISTS_RETORNO_QUERY_KEY, 'checklistSaida', checklistSaidaId],
    queryFn: async () => {
      const response = await checklistsRetornoService.getByChecklistSaidaId(checklistSaidaId);
      if (response.success && response.data) {
        return response.data.checklistRetorno;
      }
      // Retorna null se não encontrar (viagem ainda não finalizada)
      return null;
    },
    enabled: !!checklistSaidaId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY VEICULO - Busca check-lists de retorno por veículo
// ============================================================================
export const useChecklistsRetornoByVeiculo = (veiculoId: number) => {
  return useQuery({
    queryKey: [...CHECKLISTS_RETORNO_QUERY_KEY, 'veiculo', veiculoId],
    queryFn: async () => {
      const response = await checklistsRetornoService.getByVeiculo(veiculoId);
      if (response.success) {
        return response.data.checklistsRetorno;
      }
      throw new Error(response.message || 'Erro ao carregar check-lists do veículo');
    },
    enabled: !!veiculoId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY MOTORISTA - Busca check-lists de retorno por motorista
// ============================================================================
export const useChecklistsRetornoByMotorista = (motoristaId: number) => {
  return useQuery({
    queryKey: [...CHECKLISTS_RETORNO_QUERY_KEY, 'motorista', motoristaId],
    queryFn: async () => {
      const response = await checklistsRetornoService.getByMotorista(motoristaId);
      if (response.success) {
        return response.data.checklistsRetorno;
      }
      throw new Error(response.message || 'Erro ao carregar check-lists do motorista');
    },
    enabled: !!motoristaId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// CREATE - Cria um novo check-list de retorno e finaliza a viagem
// ============================================================================
export const useCreateChecklistRetorno = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      data,
      checklistSaidaData,
    }: {
      data: ChecklistRetornoCreate;
      checklistSaidaData: {
        km_inicial: number;
        veiculo_id: number;
        veiculo_placa: string;
        veiculo_modelo: string;
        motorista_id: number;
        motorista_nome: string;
      };
    }) => {
      const response = await checklistsRetornoService.create(data, checklistSaidaData);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao criar check-list de retorno');
      }
      return response.data.checklistRetorno;
    },
    onSuccess: (checklistRetorno: ChecklistRetorno) => {
      // Invalida queries para forçar refetch
      queryClient.invalidateQueries({ queryKey: CHECKLISTS_RETORNO_QUERY_KEY });
      // Invalida também check-lists de saída (para atualizar status de viagem finalizada)
      queryClient.invalidateQueries({ queryKey: ['suprimentos', 'logistica', 'checklistsSaida'] });

      toast({
        title: 'Check-list de retorno criado',
        description: `Viagem do veículo ${checklistRetorno.veiculo_placa} foi finalizada. KM rodado: ${checklistRetorno.km_rodado} km.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar check-list de retorno',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// UPDATE - Atualiza um check-list de retorno existente
// ============================================================================
export const useUpdateChecklistRetorno = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ChecklistRetornoUpdate }) => {
      const response = await checklistsRetornoService.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao atualizar check-list de retorno');
      }
      return response.data.checklistRetorno;
    },
    onSuccess: (checklistRetorno: ChecklistRetorno) => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: CHECKLISTS_RETORNO_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...CHECKLISTS_RETORNO_QUERY_KEY, checklistRetorno.id] });

      toast({
        title: 'Check-list de retorno atualizado',
        description: `Check-list foi atualizado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar check-list de retorno',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// DELETE - Deleta um check-list de retorno
// ============================================================================
export const useDeleteChecklistRetorno = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await checklistsRetornoService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar check-list de retorno');
      }
      return id;
    },
    onSuccess: () => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: CHECKLISTS_RETORNO_QUERY_KEY });
      // Invalida também check-lists de saída (para atualizar status)
      queryClient.invalidateQueries({ queryKey: ['suprimentos', 'logistica', 'checklistsSaida'] });

      toast({
        title: 'Check-list de retorno deletado',
        description: 'O check-list foi deletado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar check-list de retorno',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
