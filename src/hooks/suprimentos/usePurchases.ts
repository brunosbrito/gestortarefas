import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import purchasesService from '@/services/suprimentos/purchasesService';
import {
  Purchase,
  PurchaseRequest,
  Quotation,
} from '@/interfaces/suprimentos/PurchaseInterface';
import { useToast } from '@/hooks/use-toast';

// ==================== Purchase Requests ====================

export const usePurchaseRequests = () => {
  return useQuery({
    queryKey: ['purchase-requests'],
    queryFn: async () => {
      const response = await purchasesService.getPurchaseRequests();
      return response.data;
    },
  });
};

export const usePurchaseRequestById = (id: number) => {
  return useQuery({
    queryKey: ['purchase-requests', id],
    queryFn: async () => {
      const response = await purchasesService.getPurchaseRequestById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

export const useCreatePurchaseRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<PurchaseRequest>) => purchasesService.createPurchaseRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Requisição de compra criada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar requisição',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePurchaseRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PurchaseRequest> }) =>
      purchasesService.updatePurchaseRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requests', variables.id] });
      toast({
        title: 'Sucesso',
        description: 'Requisição atualizada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar requisição',
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePurchaseRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchasesService.deletePurchaseRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Requisição excluída com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir requisição',
        variant: 'destructive',
      });
    },
  });
};

export const useSubmitPurchaseRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchasesService.submitPurchaseRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requests', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Requisição enviada para aprovação',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar requisição',
        variant: 'destructive',
      });
    },
  });
};

export const useApprovePurchaseRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, approvedBy }: { id: number; approvedBy: string }) =>
      purchasesService.approvePurchaseRequest(id, approvedBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requests', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Requisição aprovada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao aprovar requisição',
        variant: 'destructive',
      });
    },
  });
};

// ==================== Quotations ====================

export const useAddQuotation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      purchaseRequestId,
      quotationData,
    }: {
      purchaseRequestId: number;
      quotationData: Partial<Quotation>;
    }) => purchasesService.addQuotation(purchaseRequestId, quotationData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requests', variables.purchaseRequestId] });
      toast({
        title: 'Sucesso',
        description: 'Cotação adicionada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar cotação',
        variant: 'destructive',
      });
    },
  });
};

export const useSelectQuotation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      purchaseRequestId,
      quotationId,
      reviewedBy,
    }: {
      purchaseRequestId: number;
      quotationId: number;
      reviewedBy: string;
    }) => purchasesService.selectQuotation(purchaseRequestId, quotationId, reviewedBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requests', variables.purchaseRequestId] });
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Cotação selecionada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao selecionar cotação',
        variant: 'destructive',
      });
    },
  });
};

// ==================== Purchase Orders ====================

export const usePurchases = () => {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const response = await purchasesService.getAll();
      return response.data;
    },
  });
};

export const usePurchaseById = (id: number) => {
  return useQuery({
    queryKey: ['purchases', id],
    queryFn: async () => {
      const response = await purchasesService.getById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Purchase>) => purchasesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Pedido de compra criado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar pedido',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Purchase> }) =>
      purchasesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchases', variables.id] });
      toast({
        title: 'Sucesso',
        description: 'Pedido atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar pedido',
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchasesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Pedido excluído com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir pedido',
        variant: 'destructive',
      });
    },
  });
};

// ==================== Statistics ====================

export const usePurchaseStats = () => {
  return useQuery({
    queryKey: ['purchase-stats'],
    queryFn: async () => {
      const response = await purchasesService.getStats();
      return response.data;
    },
  });
};
