// Hooks TanStack Query para Check-lists de Saída
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import checklistsSaidaService from '@/services/suprimentos/logistica/checklistsSaidaService';
import { ChecklistSaida, ChecklistSaidaCreate, ChecklistSaidaUpdate } from '@/interfaces/suprimentos/logistica/ChecklistSaidaInterface';
import { useToast } from '@/hooks/use-toast';

const CHECKLISTS_SAIDA_QUERY_KEY = ['suprimentos', 'logistica', 'checklistsSaida'];

// ============================================================================
// GET ALL - Lista todos os check-lists de saída
// ============================================================================
export const useChecklistsSaida = () => {
  return useQuery({
    queryKey: CHECKLISTS_SAIDA_QUERY_KEY,
    queryFn: async () => {
      const response = await checklistsSaidaService.getAll();
      if (response.success) {
        return response.data.checklistsSaida;
      }
      throw new Error(response.message || 'Erro ao carregar check-lists de saída');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ============================================================================
// GET BY ID - Busca um check-list de saída específico por ID
// ============================================================================
export const useChecklistSaida = (id: number) => {
  return useQuery({
    queryKey: [...CHECKLISTS_SAIDA_QUERY_KEY, id],
    queryFn: async () => {
      const response = await checklistsSaidaService.getById(id);
      if (response.success && response.data) {
        return response.data.checklistSaida;
      }
      throw new Error(response.message || 'Erro ao carregar check-list de saída');
    },
    enabled: !!id, // Só executa se id existir
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY VEICULO - Busca check-lists de saída por veículo
// ============================================================================
export const useChecklistsSaidaByVeiculo = (veiculoId: number) => {
  return useQuery({
    queryKey: [...CHECKLISTS_SAIDA_QUERY_KEY, 'veiculo', veiculoId],
    queryFn: async () => {
      const response = await checklistsSaidaService.getByVeiculo(veiculoId);
      if (response.success) {
        return response.data.checklistsSaida;
      }
      throw new Error(response.message || 'Erro ao carregar check-lists do veículo');
    },
    enabled: !!veiculoId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY MOTORISTA - Busca check-lists de saída por motorista
// ============================================================================
export const useChecklistsSaidaByMotorista = (motoristaId: number) => {
  return useQuery({
    queryKey: [...CHECKLISTS_SAIDA_QUERY_KEY, 'motorista', motoristaId],
    queryFn: async () => {
      const response = await checklistsSaidaService.getByMotorista(motoristaId);
      if (response.success) {
        return response.data.checklistsSaida;
      }
      throw new Error(response.message || 'Erro ao carregar check-lists do motorista');
    },
    enabled: !!motoristaId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET VIAGENS ABERTAS - Busca check-lists com viagens não finalizadas
// ============================================================================
export const useViagensAbertas = () => {
  return useQuery({
    queryKey: [...CHECKLISTS_SAIDA_QUERY_KEY, 'abertas'],
    queryFn: async () => {
      const response = await checklistsSaidaService.getViagensAbertas();
      if (response.success) {
        return response.data.checklistsSaida;
      }
      throw new Error(response.message || 'Erro ao carregar viagens abertas');
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// CREATE - Cria um novo check-list de saída
// ============================================================================
export const useCreateChecklistSaida = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ChecklistSaidaCreate) => {
      const response = await checklistsSaidaService.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao criar check-list de saída');
      }
      return response.data.checklistSaida;
    },
    onSuccess: (checklistSaida: ChecklistSaida) => {
      // Invalida queries para forçar refetch
      queryClient.invalidateQueries({ queryKey: CHECKLISTS_SAIDA_QUERY_KEY });

      toast({
        title: 'Check-list de saída criado',
        description: `Check-list para ${checklistSaida.veiculo_placa} foi criado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar check-list de saída',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// UPDATE - Atualiza um check-list de saída existente
// ============================================================================
export const useUpdateChecklistSaida = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ChecklistSaidaUpdate }) => {
      const response = await checklistsSaidaService.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao atualizar check-list de saída');
      }
      return response.data.checklistSaida;
    },
    onSuccess: (checklistSaida: ChecklistSaida) => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: CHECKLISTS_SAIDA_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...CHECKLISTS_SAIDA_QUERY_KEY, checklistSaida.id] });

      toast({
        title: 'Check-list de saída atualizado',
        description: `Check-list foi atualizado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar check-list de saída',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// DELETE - Deleta um check-list de saída
// ============================================================================
export const useDeleteChecklistSaida = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await checklistsSaidaService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar check-list de saída');
      }
      return id;
    },
    onSuccess: () => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: CHECKLISTS_SAIDA_QUERY_KEY });

      toast({
        title: 'Check-list de saída deletado',
        description: 'O check-list foi deletado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar check-list de saída',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// FINALIZAR VIAGEM - Marca viagem como finalizada e vincula check-list de retorno
// ============================================================================
export const useFinalizarViagem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, checklistRetornoId }: { id: number; checklistRetornoId: number }) => {
      const response = await checklistsSaidaService.finalizarViagem(id, checklistRetornoId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao finalizar viagem');
      }
      return response.data.checklistSaida;
    },
    onSuccess: (checklistSaida: ChecklistSaida) => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: CHECKLISTS_SAIDA_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...CHECKLISTS_SAIDA_QUERY_KEY, checklistSaida.id] });

      toast({
        title: 'Viagem finalizada',
        description: `Viagem do veículo ${checklistSaida.veiculo_placa} foi finalizada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao finalizar viagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
