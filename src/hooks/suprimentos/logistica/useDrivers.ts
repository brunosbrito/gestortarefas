// Hook customizado para gerenciar motoristas com TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import driversService from '@/services/suprimentos/logistica/driversService';
import { Driver, DriverCreate, DriverUpdate } from '@/interfaces/suprimentos/logistica/DriverInterface';
import { useToast } from '@/hooks/use-toast';

// Query Keys
export const DRIVERS_QUERY_KEY = ['suprimentos', 'logistica', 'drivers'];

// Hook para listar todos os motoristas
export const useDrivers = () => {
  return useQuery({
    queryKey: DRIVERS_QUERY_KEY,
    queryFn: async () => {
      const response = await driversService.getAll();
      if (response.success) {
        return response.data.drivers;
      }
      throw new Error(response.message || 'Erro ao carregar motoristas');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar motorista por ID
export const useDriver = (id: number) => {
  return useQuery({
    queryKey: [...DRIVERS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await driversService.getById(id);
      if (response.success) {
        return response.data.driver;
      }
      throw new Error(response.message || 'Erro ao carregar motorista');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para criar motorista
export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: DriverCreate) => {
      const response = await driversService.create(data);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao criar motorista');
      }
      return response.data.driver;
    },
    onSuccess: (driver) => {
      queryClient.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY });
      toast({
        title: 'Motorista criado',
        description: `Motorista ${driver.nome} foi criado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar motorista',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar motorista
export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DriverUpdate }) => {
      const response = await driversService.update(id, data);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao atualizar motorista');
      }
      return response.data.driver;
    },
    onSuccess: (driver) => {
      queryClient.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...DRIVERS_QUERY_KEY, driver.id] });
      toast({
        title: 'Motorista atualizado',
        description: `Motorista ${driver.nome} foi atualizado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar motorista',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para deletar motorista
export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await driversService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar motorista');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY });
      toast({
        title: 'Motorista deletado',
        description: 'Motorista foi removido com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar motorista',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar status do motorista
export const useUpdateDriverStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Driver['status'] }) => {
      const response = await driversService.updateStatus(id, status);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao atualizar status');
      }
      return response.data.driver;
    },
    onSuccess: (driver) => {
      queryClient.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...DRIVERS_QUERY_KEY, driver.id] });
      toast({
        title: 'Status atualizado',
        description: `Status do motorista ${driver.nome} foi atualizado.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
