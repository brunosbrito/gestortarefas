// Hooks TanStack Query para Rotas/Destinos
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import routesService from '@/services/suprimentos/logistica/routesService';
import { Route, RouteCreate, RouteUpdate } from '@/interfaces/suprimentos/logistica/RouteInterface';
import { useToast } from '@/hooks/use-toast';

const ROUTES_QUERY_KEY = ['suprimentos', 'logistica', 'routes'];

// ============================================================================
// GET ALL - Lista todas as rotas
// ============================================================================
export const useRoutes = () => {
  return useQuery({
    queryKey: ROUTES_QUERY_KEY,
    queryFn: async () => {
      const response = await routesService.getAll();
      if (response.success) {
        return response.data.routes;
      }
      throw new Error(response.message || 'Erro ao carregar rotas');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ============================================================================
// GET BY ID - Busca uma rota específica por ID
// ============================================================================
export const useRoute = (id: number) => {
  return useQuery({
    queryKey: [...ROUTES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await routesService.getById(id);
      if (response.success && response.data) {
        return response.data.route;
      }
      throw new Error(response.message || 'Erro ao carregar rota');
    },
    enabled: !!id, // Só executa se id existir
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET ACTIVE - Busca apenas rotas ativas
// ============================================================================
export const useActiveRoutes = () => {
  return useQuery({
    queryKey: [...ROUTES_QUERY_KEY, 'active'],
    queryFn: async () => {
      const response = await routesService.getActive();
      if (response.success) {
        return response.data.routes;
      }
      throw new Error(response.message || 'Erro ao carregar rotas ativas');
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY TIPO VIA - Busca rotas por tipo de via
// ============================================================================
export const useRoutesByTipoVia = (tipo: string) => {
  return useQuery({
    queryKey: [...ROUTES_QUERY_KEY, 'tipo', tipo],
    queryFn: async () => {
      const response = await routesService.getByTipoVia(tipo);
      if (response.success) {
        return response.data.routes;
      }
      throw new Error(response.message || 'Erro ao carregar rotas');
    },
    enabled: !!tipo,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// CREATE - Cria uma nova rota
// ============================================================================
export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: RouteCreate) => {
      const response = await routesService.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao criar rota');
      }
      return response.data.route;
    },
    onSuccess: (route: Route) => {
      // Invalida queries para forçar refetch
      queryClient.invalidateQueries({ queryKey: ROUTES_QUERY_KEY });

      toast({
        title: 'Rota criada',
        description: `${route.nome} foi criada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar rota',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// UPDATE - Atualiza uma rota existente
// ============================================================================
export const useUpdateRoute = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RouteUpdate }) => {
      const response = await routesService.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao atualizar rota');
      }
      return response.data.route;
    },
    onSuccess: (route: Route) => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: ROUTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ROUTES_QUERY_KEY, route.id] });

      toast({
        title: 'Rota atualizada',
        description: `${route.nome} foi atualizada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar rota',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// DELETE - Deleta uma rota
// ============================================================================
export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await routesService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar rota');
      }
      return id;
    },
    onSuccess: () => {
      // Invalida queries
      queryClient.invalidateQueries({ queryKey: ROUTES_QUERY_KEY });

      toast({
        title: 'Rota deletada',
        description: 'A rota foi deletada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar rota',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
