// Hook para gerenciar Inventários do Almoxarifado
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Inventario,
  InventarioCreate,
  InventarioUpdate,
} from '@/interfaces/suprimentos/almoxarifado/InventarioInterface';
import { useToast } from '@/hooks/use-toast';

// Mock data para desenvolvimento
const mockInventarios: Inventario[] = [
  {
    id: 1,
    codigo: 'INV-2024-001',
    descricao: 'Inventário Geral - Janeiro 2024',
    status: 'ajustado',
    data_inicio: '2024-01-05T08:00:00Z',
    data_conclusao: '2024-01-07T18:00:00Z',
    responsavel_id: 1,
    responsavel_nome: 'João Silva',
    total_items: 50,
    items_contados: 50,
    total_divergencias: 5,
    observacoes: 'Inventário mensal completo. Divergências ajustadas no estoque.',
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-08T10:00:00Z',
  },
  {
    id: 2,
    codigo: 'INV-2024-002',
    descricao: 'Inventário Ferramentas e EPIs',
    status: 'concluido',
    data_inicio: '2024-01-15T09:00:00Z',
    data_conclusao: '2024-01-15T17:30:00Z',
    responsavel_id: 2,
    responsavel_nome: 'Maria Santos',
    total_items: 25,
    items_contados: 25,
    total_divergencias: 2,
    observacoes: 'Contagem rápida de ferramentas e EPIs. Aguardando ajuste.',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T17:30:00Z',
  },
  {
    id: 3,
    codigo: 'INV-2024-003',
    descricao: 'Inventário Matéria-Prima',
    status: 'em_andamento',
    data_inicio: '2024-01-20T08:00:00Z',
    responsavel_id: 1,
    responsavel_nome: 'João Silva',
    total_items: 15,
    items_contados: 8,
    total_divergencias: 0,
    observacoes: 'Em andamento. Previsão de conclusão: 22/01/2024.',
    created_at: '2024-01-20T08:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
  },
];

// Query key
const INVENTARIOS_QUERY_KEY = ['suprimentos', 'almoxarifado', 'inventarios'];

// Hook para buscar todos os inventários
export const useInventarios = () => {
  return useQuery({
    queryKey: INVENTARIOS_QUERY_KEY,
    queryFn: async (): Promise<Inventario[]> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Retornar ordenado por data mais recente primeiro
      return [...mockInventarios].sort(
        (a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()
      );
    },
  });
};

// Hook para buscar um inventário por ID
export const useInventario = (id: number) => {
  return useQuery({
    queryKey: [...INVENTARIOS_QUERY_KEY, id],
    queryFn: async (): Promise<Inventario | null> => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockInventarios.find((inv) => inv.id === id) || null;
    },
    enabled: !!id,
  });
};

// Hook para criar inventário
export const useCreateInventario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InventarioCreate): Promise<Inventario> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newInventario: Inventario = {
        ...data,
        id: Math.max(...mockInventarios.map((i) => i.id), 0) + 1,
        total_items: 0,
        items_contados: 0,
        total_divergencias: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockInventarios.push(newInventario);
      return newInventario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTARIOS_QUERY_KEY });
      toast({
        title: 'Inventário criado',
        description: 'O inventário foi criado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao criar inventário',
        description: 'Não foi possível criar o inventário. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar inventário
export const useUpdateInventario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: InventarioUpdate;
    }): Promise<Inventario> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 800));

      const index = mockInventarios.findIndex((inv) => inv.id === id);
      if (index === -1) throw new Error('Inventário não encontrado');

      const updatedInventario = {
        ...mockInventarios[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      mockInventarios[index] = updatedInventario;
      return updatedInventario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTARIOS_QUERY_KEY });
      toast({
        title: 'Inventário atualizado',
        description: 'O inventário foi atualizado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar inventário',
        description: 'Não foi possível atualizar o inventário. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Hook para deletar inventário
export const useDeleteInventario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = mockInventarios.findIndex((inv) => inv.id === id);
      if (index === -1) throw new Error('Inventário não encontrado');

      mockInventarios.splice(index, 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTARIOS_QUERY_KEY });
      toast({
        title: 'Inventário deletado',
        description: 'O inventário foi deletado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao deletar inventário',
        description: 'Não foi possível deletar o inventário. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Hook para concluir inventário (mudar status para concluído)
export const useConcluirInventario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<Inventario> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 800));

      const index = mockInventarios.findIndex((inv) => inv.id === id);
      if (index === -1) throw new Error('Inventário não encontrado');

      const updatedInventario = {
        ...mockInventarios[index],
        status: 'concluido' as const,
        data_conclusao: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockInventarios[index] = updatedInventario;
      return updatedInventario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTARIOS_QUERY_KEY });
      toast({
        title: 'Inventário concluído',
        description: 'O inventário foi marcado como concluído.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao concluir inventário',
        description: 'Não foi possível concluir o inventário. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Hook para ajustar estoque com base no inventário
export const useAjustarEstoque = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<Inventario> => {
      // TODO: Substituir por chamada real à API que ajusta o estoque dos items
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const index = mockInventarios.findIndex((inv) => inv.id === id);
      if (index === -1) throw new Error('Inventário não encontrado');

      const updatedInventario = {
        ...mockInventarios[index],
        status: 'ajustado' as const,
        updated_at: new Date().toISOString(),
      };

      mockInventarios[index] = updatedInventario;
      return updatedInventario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTARIOS_QUERY_KEY });
      // Invalidar também o estoque dos items
      queryClient.invalidateQueries({ queryKey: ['suprimentos', 'almoxarifado', 'items'] });
      toast({
        title: 'Estoque ajustado',
        description: 'O estoque foi ajustado com base nas contagens do inventário.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao ajustar estoque',
        description: 'Não foi possível ajustar o estoque. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};
