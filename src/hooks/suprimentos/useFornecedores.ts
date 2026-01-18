import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import fornecedoresService from '@/services/suprimentos/fornecedoresService';
import {
  Fornecedor,
  FornecedorCreate,
  FornecedorUpdate,
  FornecedorFilters
} from '@/interfaces/suprimentos/FornecedorInterface';

const QUERY_KEY = 'fornecedores';

export const useFornecedores = (filters?: FornecedorFilters) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => fornecedoresService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useFornecedor = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fornecedoresService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFornecedor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FornecedorCreate) => fornecedoresService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdateFornecedor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FornecedorUpdate }) =>
      fornecedoresService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useDeleteFornecedor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => fornecedoresService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
