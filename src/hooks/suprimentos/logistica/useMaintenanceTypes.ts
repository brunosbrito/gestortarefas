// Hooks TanStack Query para Tipos de Manutenção
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import maintenanceTypesService from '@/services/suprimentos/logistica/maintenanceTypesService';
import { MaintenanceType, MaintenanceTypeCreate, MaintenanceTypeUpdate } from '@/interfaces/suprimentos/logistica/MaintenanceTypeInterface';
import { useToast } from '@/hooks/use-toast';

const MAINTENANCE_TYPES_QUERY_KEY = ['suprimentos', 'logistica', 'maintenanceTypes'];

// ============================================================================
// GET ALL - Lista todos os tipos de manutenção
// ============================================================================
export const useMaintenanceTypes = () => {
  return useQuery({
    queryKey: MAINTENANCE_TYPES_QUERY_KEY,
    queryFn: async () => {
      const response = await maintenanceTypesService.getAll();
      if (response.success) {
        return response.data.maintenanceTypes;
      }
      throw new Error(response.message || 'Erro ao carregar tipos de manutenção');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ============================================================================
// GET BY ID - Busca um tipo de manutenção específico por ID
// ============================================================================
export const useMaintenanceType = (id: number) => {
  return useQuery({
    queryKey: [...MAINTENANCE_TYPES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await maintenanceTypesService.getById(id);
      if (response.success && response.data) {
        return response.data.maintenanceType;
      }
      throw new Error(response.message || 'Erro ao carregar tipo de manutenção');
    },
    enabled: !!id, // Só executa se id existir
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY CATEGORIA - Busca tipos de manutenção por categoria
// ============================================================================
export const useMaintenanceTypesByCategoria = (categoria: string) => {
  return useQuery({
    queryKey: [...MAINTENANCE_TYPES_QUERY_KEY, 'categoria', categoria],
    queryFn: async () => {
      const response = await maintenanceTypesService.getByCategoria(categoria);
      if (response.success) {
        return response.data.maintenanceTypes;
      }
      throw new Error(response.message || 'Erro ao carregar tipos de manutenção');
    },
    enabled: !!categoria,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET ACTIVE - Busca apenas tipos de manutenção ativos
// ============================================================================
export const useActiveMaintenanceTypes = () => {
  return useQuery({
    queryKey: [...MAINTENANCE_TYPES_QUERY_KEY, 'active'],
    queryFn: async () => {
      const response = await maintenanceTypesService.getActive();
      if (response.success) {
        return response.data.maintenanceTypes;
      }
      throw new Error(response.message || 'Erro ao carregar tipos de manutenção ativos');
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// CREATE - Cria um novo tipo de manutenção
// ============================================================================
export const useCreateMaintenanceType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: MaintenanceTypeCreate) => {
      const response = await maintenanceTypesService.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao criar tipo de manutenção');
      }
      return response.data.maintenanceType;
    },
    onSuccess: (maintenanceType: MaintenanceType) => {
      // Invalida queries para forçar refetch
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_TYPES_QUERY_KEY });

      toast({
        title: 'Tipo de manutenção criado',
        description: `${maintenanceType.nome} foi criado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar tipo de manutenção',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// UPDATE - Atualiza um tipo de manutenção existente
// ============================================================================
export const useUpdateMaintenanceType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MaintenanceTypeUpdate }) => {
      const response = await maintenanceTypesService.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao atualizar tipo de manutenção');
      }
      return response.data.maintenanceType;
    },
    onSuccess: (maintenanceType: MaintenanceType) => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_TYPES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...MAINTENANCE_TYPES_QUERY_KEY, maintenanceType.id] });

      toast({
        title: 'Tipo de manutenção atualizado',
        description: `${maintenanceType.nome} foi atualizado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar tipo de manutenção',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// DELETE - Deleta um tipo de manutenção
// ============================================================================
export const useDeleteMaintenanceType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await maintenanceTypesService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar tipo de manutenção');
      }
      return id;
    },
    onSuccess: () => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_TYPES_QUERY_KEY });

      toast({
        title: 'Tipo de manutenção deletado',
        description: 'O tipo de manutenção foi deletado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar tipo de manutenção',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
