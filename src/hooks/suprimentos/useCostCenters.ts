import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import classificationService from '@/services/suprimentos/classificationService';
import { CostCenter, ClassificationRule } from '@/interfaces/suprimentos/CostCenterInterface';
import { useToast } from '@/hooks/use-toast';

// ==================== Centros de Custo ====================

export const useCostCenters = () => {
  return useQuery({
    queryKey: ['cost-centers'],
    queryFn: async () => {
      const response = await classificationService.getCostCenters();
      return response.data;
    },
  });
};

export const useCostCenterById = (id: number) => {
  return useQuery({
    queryKey: ['cost-centers', id],
    queryFn: async () => {
      const response = await classificationService.getCostCenterById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

export const useCostCenterChildren = (parentId: number) => {
  return useQuery({
    queryKey: ['cost-centers', 'children', parentId],
    queryFn: async () => {
      const response = await classificationService.getCostCenterChildren(parentId);
      return response.data;
    },
    enabled: !!parentId && parentId > 0,
  });
};

export const useCostCenterTree = () => {
  return useQuery({
    queryKey: ['cost-centers', 'tree'],
    queryFn: async () => {
      const response = await classificationService.getCostCenterTree();
      return response.data;
    },
  });
};

// ==================== Mutations ====================

export const useCreateCostCenter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<CostCenter>) => classificationService.createCostCenter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast({
        title: 'Sucesso',
        description: 'Centro de custo criado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar centro de custo',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCostCenter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CostCenter> }) =>
      classificationService.updateCostCenter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast({
        title: 'Sucesso',
        description: 'Centro de custo atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar centro de custo',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCostCenter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => classificationService.deleteCostCenter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast({
        title: 'Sucesso',
        description: 'Centro de custo excluído com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir centro de custo',
        variant: 'destructive',
      });
    },
  });
};

// ==================== Regras de Classificação ====================

export const useClassificationRules = () => {
  return useQuery({
    queryKey: ['classification-rules'],
    queryFn: async () => {
      const response = await classificationService.getClassificationRules();
      return response.data;
    },
  });
};

export const useClassificationRuleById = (id: number) => {
  return useQuery({
    queryKey: ['classification-rules', id],
    queryFn: async () => {
      const response = await classificationService.getClassificationRuleById(id);
      return response.data;
    },
    enabled: !!id && id > 0,
  });
};

export const useCreateClassificationRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<ClassificationRule>) =>
      classificationService.createClassificationRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-rules'] });
      toast({
        title: 'Sucesso',
        description: 'Regra de classificação criada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar regra',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateClassificationRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClassificationRule> }) =>
      classificationService.updateClassificationRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-rules'] });
      toast({
        title: 'Sucesso',
        description: 'Regra atualizada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar regra',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteClassificationRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => classificationService.deleteClassificationRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-rules'] });
      toast({
        title: 'Sucesso',
        description: 'Regra excluída com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir regra',
        variant: 'destructive',
      });
    },
  });
};

// ==================== Classificação Automática ====================

export const useClassifyItem = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemDescription: string) => classificationService.classifyItem(itemDescription),
    onSuccess: (response) => {
      toast({
        title: 'Classificação realizada',
        description: `Item classificado como: ${response.data.costCenter.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao classificar item',
        variant: 'destructive',
      });
    },
  });
};

export const useBatchClassify = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (items: { id: number; description: string }[]) =>
      classificationService.batchClassify(items),
    onSuccess: (response) => {
      toast({
        title: 'Classificação em lote realizada',
        description: `${response.data.length} itens classificados com sucesso`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao classificar itens em lote',
        variant: 'destructive',
      });
    },
  });
};
