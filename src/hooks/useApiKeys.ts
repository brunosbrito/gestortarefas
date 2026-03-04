import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiKeyService, { CreateApiKeyDto, UpdateApiKeyDto } from '@/services/ApiKeyService';
import { useToast } from '@/hooks/use-toast';

export const apiKeyKeys = {
  all: ['apiKeys'] as const,
  detail: (id: string) => [...apiKeyKeys.all, id] as const,
};

export const useApiKeys = () => {
  return useQuery({
    queryKey: apiKeyKeys.all,
    queryFn: () => ApiKeyService.getAll(),
    staleTime: 30 * 1000, // 30 segundos
  });
};

export const useApiKey = (id: string) => {
  return useQuery({
    queryKey: apiKeyKeys.detail(id),
    queryFn: () => ApiKeyService.getById(id),
    enabled: !!id,
  });
};

export const useCreateApiKey = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateApiKeyDto) => ApiKeyService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
      toast({
        title: 'API Key criada',
        description: 'Copie a chave agora, ela não será exibida novamente!',
      });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar API Key',
        description: error.message,
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
  });
};

export const useUpdateApiKey = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApiKeyDto }) =>
      ApiKeyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
      toast({
        title: 'API Key atualizada',
        description: 'As configurações foram salvas.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
  });
};

export const useRevokeApiKey = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ApiKeyService.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
      toast({
        title: 'API Key revogada',
        description: 'A chave foi desativada e não pode mais ser usada.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao revogar',
        description: error.message,
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
  });
};

export const useRegenerateApiKey = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ApiKeyService.regenerate(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
      toast({
        title: 'Chave regenerada',
        description: 'Copie a nova chave agora, ela não será exibida novamente!',
      });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao regenerar',
        description: error.message,
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
  });
};

export const useDeleteApiKey = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ApiKeyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
      toast({
        title: 'API Key excluída',
        description: 'A chave foi removida permanentemente.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
  });
};
