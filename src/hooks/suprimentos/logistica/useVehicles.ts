// Hook customizado para gerenciar veículos com TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vehiclesService from '@/services/suprimentos/logistica/vehiclesService';
import { Vehicle, VehicleCreate, VehicleUpdate } from '@/interfaces/suprimentos/logistica/VehicleInterface';
import { useToast } from '@/hooks/use-toast';

// Query Keys
export const VEHICLES_QUERY_KEY = ['suprimentos', 'logistica', 'vehicles'];

// Hook para listar todos os veículos
export const useVehicles = () => {
  return useQuery({
    queryKey: VEHICLES_QUERY_KEY,
    queryFn: async () => {
      const response = await vehiclesService.getAll();
      if (response.success) {
        return response.data.vehicles;
      }
      throw new Error(response.message || 'Erro ao carregar veículos');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar veículo por ID
export const useVehicle = (id: number) => {
  return useQuery({
    queryKey: [...VEHICLES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await vehiclesService.getById(id);
      if (response.success) {
        return response.data.vehicle;
      }
      throw new Error(response.message || 'Erro ao carregar veículo');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para criar veículo
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: VehicleCreate) => {
      const response = await vehiclesService.create(data);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao criar veículo');
      }
      return response.data.vehicle;
    },
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      toast({
        title: 'Veículo criado',
        description: `Veículo ${vehicle.placa} foi criado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar veículo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar veículo
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VehicleUpdate }) => {
      const response = await vehiclesService.update(id, data);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao atualizar veículo');
      }
      return response.data.vehicle;
    },
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...VEHICLES_QUERY_KEY, vehicle.id] });
      toast({
        title: 'Veículo atualizado',
        description: `Veículo ${vehicle.placa} foi atualizado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar veículo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para deletar veículo
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await vehiclesService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar veículo');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      toast({
        title: 'Veículo deletado',
        description: 'Veículo foi removido com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar veículo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar status do veículo
export const useUpdateVehicleStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Vehicle['status'] }) => {
      const response = await vehiclesService.updateStatus(id, status);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao atualizar status');
      }
      return response.data.vehicle;
    },
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...VEHICLES_QUERY_KEY, vehicle.id] });
      toast({
        title: 'Status atualizado',
        description: `Status do veículo ${vehicle.placa} foi atualizado.`,
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

// Hook para atualizar KM do veículo
export const useUpdateVehicleKM = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, km }: { id: number; km: number }) => {
      const response = await vehiclesService.updateKM(id, km);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao atualizar KM');
      }
      return response.data.vehicle;
    },
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...VEHICLES_QUERY_KEY, vehicle.id] });
      toast({
        title: 'KM atualizado',
        description: `KM do veículo ${vehicle.placa} foi atualizado.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar KM',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
