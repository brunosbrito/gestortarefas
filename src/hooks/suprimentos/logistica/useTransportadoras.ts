// Hook customizado para gerenciar transportadoras com TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transportadorasService from '@/services/suprimentos/logistica/transportadorasService';
import { Transportadora, TransportadoraCreate, TransportadoraUpdate } from '@/interfaces/suprimentos/logistica/TransportInterface';
import { useToast } from '@/hooks/use-toast';

// Query Keys
export const TRANSPORTADORAS_QUERY_KEY = ['suprimentos', 'logistica', 'transportadoras'];

// Hook para listar todas as transportadoras
export const useTransportadoras = () => {
  return useQuery({
    queryKey: TRANSPORTADORAS_QUERY_KEY,
    queryFn: async () => {
      const response = await transportadorasService.getAll();
      if (response.success) {
        return response.data.transportadoras;
      }
      throw new Error(response.message || 'Erro ao carregar transportadoras');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar transportadora por ID
export const useTransportadora = (id: number) => {
  return useQuery({
    queryKey: [...TRANSPORTADORAS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await transportadorasService.getById(id);
      if (response.success) {
        return response.data.transportadora;
      }
      throw new Error(response.message || 'Erro ao carregar transportadora');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para criar transportadora
export const useCreateTransportadora = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TransportadoraCreate) => {
      const response = await transportadorasService.create(data);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao criar transportadora');
      }
      return response.data.transportadora;
    },
    onSuccess: (transportadora) => {
      queryClient.invalidateQueries({ queryKey: TRANSPORTADORAS_QUERY_KEY });
      toast({
        title: 'Transportadora criada',
        description: `Transportadora ${transportadora.razao_social} foi criada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar transportadora',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar transportadora
export const useUpdateTransportadora = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TransportadoraUpdate }) => {
      const response = await transportadorasService.update(id, data);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao atualizar transportadora');
      }
      return response.data.transportadora;
    },
    onSuccess: (transportadora) => {
      queryClient.invalidateQueries({ queryKey: TRANSPORTADORAS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TRANSPORTADORAS_QUERY_KEY, transportadora.id] });
      toast({
        title: 'Transportadora atualizada',
        description: `Transportadora ${transportadora.razao_social} foi atualizada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar transportadora',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para deletar transportadora
export const useDeleteTransportadora = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await transportadorasService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar transportadora');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORTADORAS_QUERY_KEY });
      toast({
        title: 'Transportadora deletada',
        description: 'Transportadora foi removida com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar transportadora',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar rating da transportadora
export const useUpdateTransportadoraRating = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, rating }: { id: number; rating: number }) => {
      const response = await transportadorasService.updateRating(id, rating);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao atualizar avaliação');
      }
      return response.data.transportadora;
    },
    onSuccess: (transportadora) => {
      queryClient.invalidateQueries({ queryKey: TRANSPORTADORAS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TRANSPORTADORAS_QUERY_KEY, transportadora.id] });
      toast({
        title: 'Avaliação atualizada',
        description: `Avaliação da transportadora ${transportadora.razao_social} foi atualizada.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar avaliação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
