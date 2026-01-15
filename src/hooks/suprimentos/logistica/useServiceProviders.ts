// Hooks TanStack Query para Fornecedores de Serviços
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import serviceProvidersService from '@/services/suprimentos/logistica/serviceProvidersService';
import { ServiceProvider, ServiceProviderCreate, ServiceProviderUpdate } from '@/interfaces/suprimentos/logistica/ServiceProviderInterface';
import { useToast } from '@/hooks/use-toast';

const SERVICE_PROVIDERS_QUERY_KEY = ['suprimentos', 'logistica', 'serviceProviders'];

// ============================================================================
// GET ALL - Lista todos os fornecedores de serviços
// ============================================================================
export const useServiceProviders = () => {
  return useQuery({
    queryKey: SERVICE_PROVIDERS_QUERY_KEY,
    queryFn: async () => {
      const response = await serviceProvidersService.getAll();
      if (response.success) {
        return response.data.serviceProviders;
      }
      throw new Error(response.message || 'Erro ao carregar fornecedores de serviços');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ============================================================================
// GET BY ID - Busca um fornecedor de serviços específico por ID
// ============================================================================
export const useServiceProvider = (id: number) => {
  return useQuery({
    queryKey: [...SERVICE_PROVIDERS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await serviceProvidersService.getById(id);
      if (response.success && response.data) {
        return response.data.serviceProvider;
      }
      throw new Error(response.message || 'Erro ao carregar fornecedor de serviços');
    },
    enabled: !!id, // Só executa se id existir
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY TIPO - Busca fornecedores de serviços por tipo
// ============================================================================
export const useServiceProvidersByTipo = (tipo: string) => {
  return useQuery({
    queryKey: [...SERVICE_PROVIDERS_QUERY_KEY, 'tipo', tipo],
    queryFn: async () => {
      const response = await serviceProvidersService.getByTipo(tipo);
      if (response.success) {
        return response.data.serviceProviders;
      }
      throw new Error(response.message || 'Erro ao carregar fornecedores de serviços');
    },
    enabled: !!tipo,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET CREDENCIADOS - Busca apenas fornecedores credenciados e ativos
// ============================================================================
export const useCredenciadosServiceProviders = () => {
  return useQuery({
    queryKey: [...SERVICE_PROVIDERS_QUERY_KEY, 'credenciados'],
    queryFn: async () => {
      const response = await serviceProvidersService.getCredenciados();
      if (response.success) {
        return response.data.serviceProviders;
      }
      throw new Error(response.message || 'Erro ao carregar fornecedores credenciados');
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET ACTIVE - Busca apenas fornecedores ativos
// ============================================================================
export const useActiveServiceProviders = () => {
  return useQuery({
    queryKey: [...SERVICE_PROVIDERS_QUERY_KEY, 'active'],
    queryFn: async () => {
      const response = await serviceProvidersService.getActive();
      if (response.success) {
        return response.data.serviceProviders;
      }
      throw new Error(response.message || 'Erro ao carregar fornecedores ativos');
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// CREATE - Cria um novo fornecedor de serviços
// ============================================================================
export const useCreateServiceProvider = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ServiceProviderCreate) => {
      const response = await serviceProvidersService.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao criar fornecedor de serviços');
      }
      return response.data.serviceProvider;
    },
    onSuccess: (serviceProvider: ServiceProvider) => {
      // Invalida queries para forçar refetch
      queryClient.invalidateQueries({ queryKey: SERVICE_PROVIDERS_QUERY_KEY });

      toast({
        title: 'Fornecedor criado',
        description: `${serviceProvider.razao_social} foi criado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar fornecedor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// UPDATE - Atualiza um fornecedor de serviços existente
// ============================================================================
export const useUpdateServiceProvider = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ServiceProviderUpdate }) => {
      const response = await serviceProvidersService.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao atualizar fornecedor de serviços');
      }
      return response.data.serviceProvider;
    },
    onSuccess: (serviceProvider: ServiceProvider) => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: SERVICE_PROVIDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...SERVICE_PROVIDERS_QUERY_KEY, serviceProvider.id] });

      toast({
        title: 'Fornecedor atualizado',
        description: `${serviceProvider.razao_social} foi atualizado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar fornecedor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// DELETE - Deleta um fornecedor de serviços
// ============================================================================
export const useDeleteServiceProvider = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await serviceProvidersService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar fornecedor de serviços');
      }
      return id;
    },
    onSuccess: () => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: SERVICE_PROVIDERS_QUERY_KEY });

      toast({
        title: 'Fornecedor deletado',
        description: 'O fornecedor de serviços foi deletado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar fornecedor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
