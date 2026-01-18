// Hook para gerenciar Items do Almoxarifado
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Item, ItemCreate, ItemUpdate } from '@/interfaces/suprimentos/almoxarifado/ItemInterface';
import { useToast } from '@/hooks/use-toast';

// Mock data para desenvolvimento
const mockItems: Item[] = [
  {
    id: 1,
    codigo: 'MP-001',
    nome: 'Aço 1020 Chato 1/4"',
    descricao: 'Aço carbono laminado a quente',
    categoria: 'materia_prima',
    unidade: 'KG',
    estoque_atual: 2500,
    estoque_minimo: 1000,
    estoque_maximo: 5000,
    localizacao: 'Galpão 1 - Setor A',
    valor_unitario: 8.50,
    ativo: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 2,
    codigo: 'COMP-045',
    nome: 'Parafuso M8 x 50mm',
    descricao: 'Parafuso sextavado zincado',
    categoria: 'componente',
    unidade: 'UN',
    estoque_atual: 15000,
    estoque_minimo: 5000,
    estoque_maximo: 20000,
    localizacao: 'Prateleira B3',
    valor_unitario: 0.85,
    ativo: true,
    created_at: '2024-01-12T09:30:00Z',
    updated_at: '2024-01-12T09:30:00Z',
  },
  {
    id: 3,
    codigo: 'EPI-010',
    nome: 'Luva de Segurança Tamanho 9',
    descricao: 'Luva de vaqueta reforçada',
    categoria: 'epi',
    unidade: 'PAR',
    estoque_atual: 200,
    estoque_minimo: 100,
    estoque_maximo: 500,
    localizacao: 'Almoxarifado EPI - Prateleira C1',
    valor_unitario: 12.50,
    ativo: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 4,
    codigo: 'FERR-025',
    nome: 'Chave de Fenda 1/4"',
    descricao: 'Chave de fenda Phillips',
    categoria: 'ferramenta',
    unidade: 'UN',
    estoque_atual: 35,
    estoque_minimo: 20,
    estoque_maximo: 50,
    localizacao: 'Ferramentaria - Gaveta 12',
    valor_unitario: 28.90,
    ativo: true,
    created_at: '2024-01-08T14:20:00Z',
    updated_at: '2024-01-08T14:20:00Z',
  },
  {
    id: 5,
    codigo: 'CONS-099',
    nome: 'Graxa Automotiva 500g',
    descricao: 'Graxa multiuso para rolamentos',
    categoria: 'consumivel',
    unidade: 'UN',
    estoque_atual: 80,
    estoque_minimo: 40,
    estoque_maximo: 150,
    localizacao: 'Depósito - Estante E',
    valor_unitario: 15.80,
    ativo: true,
    created_at: '2024-01-14T11:45:00Z',
    updated_at: '2024-01-14T11:45:00Z',
  },
];

// Query key
const ITEMS_QUERY_KEY = ['suprimentos', 'almoxarifado', 'items'];

// Hook para buscar todos os items
export const useItems = () => {
  return useQuery({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: async (): Promise<Item[]> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockItems;
    },
  });
};

// Hook para buscar um item por ID
export const useItem = (id: number) => {
  return useQuery({
    queryKey: [...ITEMS_QUERY_KEY, id],
    queryFn: async (): Promise<Item | null> => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockItems.find((item) => item.id === id) || null;
    },
    enabled: !!id,
  });
};

// Hook para criar item
export const useCreateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ItemCreate): Promise<Item> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newItem: Item = {
        ...data,
        id: Math.max(...mockItems.map((i) => i.id), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockItems.push(newItem);
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
      toast({
        title: 'Item criado',
        description: 'O item foi criado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao criar item',
        description: 'Não foi possível criar o item. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar item
export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ItemUpdate }): Promise<Item> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 800));

      const index = mockItems.findIndex((item) => item.id === id);
      if (index === -1) throw new Error('Item não encontrado');

      const updatedItem = {
        ...mockItems[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      mockItems[index] = updatedItem;
      return updatedItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
      toast({
        title: 'Item atualizado',
        description: 'O item foi atualizado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar item',
        description: 'Não foi possível atualizar o item. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Hook para deletar item
export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = mockItems.findIndex((item) => item.id === id);
      if (index === -1) throw new Error('Item não encontrado');

      mockItems.splice(index, 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
      toast({
        title: 'Item deletado',
        description: 'O item foi deletado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao deletar item',
        description: 'Não foi possível deletar o item. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};
