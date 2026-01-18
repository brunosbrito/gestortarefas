// Hooks TanStack Query para Ordens de Compra
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ordensCompraService from '@/services/suprimentos/compras/ordensCompraService';
import { OrdemCompra, OrdemCompraCreate, OrdemCompraUpdate } from '@/interfaces/suprimentos/compras/OrdemCompraInterface';
import { useToast } from '@/hooks/use-toast';

const ORDENS_COMPRA_QUERY_KEY = ['suprimentos', 'compras', 'ordens-compra'];

// ============================================================================
// GET ALL - Lista todas as ordens de compra
// ============================================================================
export const useOrdensCompra = () => {
  return useQuery({
    queryKey: ORDENS_COMPRA_QUERY_KEY,
    queryFn: async () => {
      const response = await ordensCompraService.getAll();
      if (response.success) {
        return response.data.ordens;
      }
      throw new Error(response.message || 'Erro ao carregar ordens de compra');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ============================================================================
// GET BY ID - Busca uma ordem específica por ID
// ============================================================================
export const useOrdemCompra = (id: number) => {
  return useQuery({
    queryKey: [...ORDENS_COMPRA_QUERY_KEY, id],
    queryFn: async () => {
      const response = await ordensCompraService.getById(id);
      if (response.success && response.data) {
        return response.data.ordem;
      }
      throw new Error(response.message || 'Erro ao carregar ordem de compra');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// GET BY STATUS - Busca ordens por status
// ============================================================================
export const useOrdensByStatus = (status: string) => {
  return useQuery({
    queryKey: [...ORDENS_COMPRA_QUERY_KEY, 'status', status],
    queryFn: async () => {
      const response = await ordensCompraService.getByStatus(status);
      if (response.success) {
        return response.data.ordens;
      }
      throw new Error(response.message || 'Erro ao carregar ordens');
    },
    enabled: !!status,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// CREATE - Cria uma nova ordem de compra
// ============================================================================
export const useCreateOrdemCompra = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: OrdemCompraCreate) => {
      const response = await ordensCompraService.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao criar ordem de compra');
      }
      return response.data.ordem;
    },
    onSuccess: (ordem: OrdemCompra) => {
      queryClient.invalidateQueries({ queryKey: ORDENS_COMPRA_QUERY_KEY });

      toast({
        title: 'Ordem de compra criada',
        description: `OC ${ordem.numero} foi criada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar ordem de compra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// UPDATE - Atualiza uma ordem existente
// ============================================================================
export const useUpdateOrdemCompra = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: OrdemCompraUpdate }) => {
      const response = await ordensCompraService.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao atualizar ordem de compra');
      }
      return response.data.ordem;
    },
    onSuccess: (ordem: OrdemCompra) => {
      queryClient.invalidateQueries({ queryKey: ORDENS_COMPRA_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ORDENS_COMPRA_QUERY_KEY, ordem.id] });

      toast({
        title: 'Ordem de compra atualizada',
        description: `OC ${ordem.numero} foi atualizada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar ordem de compra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// DELETE - Deleta uma ordem
// ============================================================================
export const useDeleteOrdemCompra = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await ordensCompraService.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar ordem de compra');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDENS_COMPRA_QUERY_KEY });

      toast({
        title: 'Ordem de compra deletada',
        description: 'A ordem foi deletada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar ordem de compra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// CONFIRMAR - Confirma ordem de compra
// ============================================================================
export const useConfirmarOrdemCompra = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await ordensCompraService.confirmar(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao confirmar ordem de compra');
      }
      return response.data.ordem;
    },
    onSuccess: (ordem: OrdemCompra) => {
      queryClient.invalidateQueries({ queryKey: ORDENS_COMPRA_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ORDENS_COMPRA_QUERY_KEY, ordem.id] });

      toast({
        title: 'Ordem confirmada',
        description: `OC ${ordem.numero} foi confirmada pelo fornecedor.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao confirmar ordem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// ============================================================================
// REGISTRAR RECEBIMENTO - Registra recebimento de items
// ============================================================================
export const useRegistrarRecebimento = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      items,
    }: {
      id: number;
      items: { item_id: number; quantidade: number }[];
    }) => {
      const response = await ordensCompraService.registrarRecebimento(id, items);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao registrar recebimento');
      }
      return response.data.ordem;
    },
    onSuccess: (ordem: OrdemCompra) => {
      queryClient.invalidateQueries({ queryKey: ORDENS_COMPRA_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ORDENS_COMPRA_QUERY_KEY, ordem.id] });

      toast({
        title: 'Recebimento registrado',
        description: `Recebimento da OC ${ordem.numero} foi registrado com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao registrar recebimento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
