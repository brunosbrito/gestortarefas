// Hook para gerenciar Movimentações do Almoxarifado
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Movimentacao,
  MovimentacaoCreate,
  MovimentacaoUpdate,
} from '@/interfaces/suprimentos/almoxarifado/MovimentacaoInterface';
import { useToast } from '@/hooks/use-toast';

// Mock data para desenvolvimento
const mockMovimentacoes: Movimentacao[] = [
  {
    id: 1,
    tipo: 'entrada',
    item_id: 1,
    item_codigo: 'MP-001',
    item_nome: 'Aço 1020 Chato 1/4"',
    item_unidade: 'KG',
    quantidade: 500,
    localizacao_destino: 'Galpão 1 - Setor A',
    responsavel_id: 1,
    responsavel_nome: 'João Silva',
    motivo: 'Compra de estoque',
    documento_tipo: 'nota_fiscal',
    documento_numero: 'NF-12345',
    data_movimentacao: '2024-01-15T10:30:00Z',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    tipo: 'saida',
    item_id: 2,
    item_codigo: 'COMP-045',
    item_nome: 'Parafuso M8 x 50mm',
    item_unidade: 'UN',
    quantidade: 1000,
    localizacao_origem: 'Prateleira B3',
    responsavel_id: 2,
    responsavel_nome: 'Maria Santos',
    motivo: 'Requisição de produção',
    documento_tipo: 'requisicao',
    documento_numero: 'REQ-2024-089',
    data_movimentacao: '2024-01-16T14:20:00Z',
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:20:00Z',
  },
  {
    id: 3,
    tipo: 'transferencia',
    item_id: 3,
    item_codigo: 'EPI-010',
    item_nome: 'Luva de Segurança Tamanho 9',
    item_unidade: 'PAR',
    quantidade: 50,
    localizacao_origem: 'Almoxarifado EPI - Prateleira C1',
    localizacao_destino: 'Almoxarifado Central - Estante D2',
    responsavel_id: 1,
    responsavel_nome: 'João Silva',
    motivo: 'Reorganização de estoque',
    observacoes: 'Transferência para centralizar EPIs',
    data_movimentacao: '2024-01-17T09:15:00Z',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z',
  },
  {
    id: 4,
    tipo: 'entrada',
    item_id: 5,
    item_codigo: 'CONS-099',
    item_nome: 'Graxa Automotiva 500g',
    item_unidade: 'UN',
    quantidade: 100,
    localizacao_destino: 'Depósito - Estante E',
    responsavel_id: 2,
    responsavel_nome: 'Maria Santos',
    motivo: 'Reposição de estoque',
    documento_tipo: 'nota_fiscal',
    documento_numero: 'NF-12389',
    data_movimentacao: '2024-01-18T11:45:00Z',
    created_at: '2024-01-18T11:45:00Z',
    updated_at: '2024-01-18T11:45:00Z',
  },
  {
    id: 5,
    tipo: 'saida',
    item_id: 4,
    item_codigo: 'FERR-025',
    item_nome: 'Chave de Fenda 1/4"',
    item_unidade: 'UN',
    quantidade: 5,
    localizacao_origem: 'Ferramentaria - Gaveta 12',
    responsavel_id: 3,
    responsavel_nome: 'Carlos Oliveira',
    motivo: 'Empréstimo para manutenção',
    documento_tipo: 'ordem_servico',
    documento_numero: 'OS-2024-045',
    observacoes: 'Ferramentas para equipe de campo',
    data_movimentacao: '2024-01-19T08:00:00Z',
    created_at: '2024-01-19T08:00:00Z',
    updated_at: '2024-01-19T08:00:00Z',
  },
  {
    id: 6,
    tipo: 'entrada',
    item_id: 1,
    item_codigo: 'MP-001',
    item_nome: 'Aço 1020 Chato 1/4"',
    item_unidade: 'KG',
    quantidade: 750,
    localizacao_destino: 'Galpão 1 - Setor A',
    responsavel_id: 1,
    responsavel_nome: 'João Silva',
    motivo: 'Compra adicional',
    documento_tipo: 'nota_fiscal',
    documento_numero: 'NF-12456',
    data_movimentacao: '2024-01-20T13:30:00Z',
    created_at: '2024-01-20T13:30:00Z',
    updated_at: '2024-01-20T13:30:00Z',
  },
];

// Query key
const MOVIMENTACOES_QUERY_KEY = ['suprimentos', 'almoxarifado', 'movimentacoes'];

// Hook para buscar todas as movimentações
export const useMovimentacoes = () => {
  return useQuery({
    queryKey: MOVIMENTACOES_QUERY_KEY,
    queryFn: async (): Promise<Movimentacao[]> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Retornar ordenado por data mais recente primeiro
      return [...mockMovimentacoes].sort(
        (a, b) => new Date(b.data_movimentacao).getTime() - new Date(a.data_movimentacao).getTime()
      );
    },
  });
};

// Hook para buscar uma movimentação por ID
export const useMovimentacao = (id: number) => {
  return useQuery({
    queryKey: [...MOVIMENTACOES_QUERY_KEY, id],
    queryFn: async (): Promise<Movimentacao | null> => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockMovimentacoes.find((mov) => mov.id === id) || null;
    },
    enabled: !!id,
  });
};

// Hook para criar movimentação
export const useCreateMovimentacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: MovimentacaoCreate): Promise<Movimentacao> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newMovimentacao: Movimentacao = {
        ...data,
        id: Math.max(...mockMovimentacoes.map((m) => m.id), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockMovimentacoes.push(newMovimentacao);
      return newMovimentacao;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MOVIMENTACOES_QUERY_KEY });
      // Invalidar também o estoque do item afetado
      queryClient.invalidateQueries({ queryKey: ['suprimentos', 'almoxarifado', 'items'] });

      toast({
        title: 'Movimentação criada',
        description: `${
          data.tipo === 'entrada'
            ? 'Entrada'
            : data.tipo === 'saida'
            ? 'Saída'
            : 'Transferência'
        } de ${data.quantidade} ${data.item_unidade || ''} registrada com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao criar movimentação',
        description: 'Não foi possível registrar a movimentação. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar movimentação
export const useUpdateMovimentacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: MovimentacaoUpdate;
    }): Promise<Movimentacao> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 800));

      const index = mockMovimentacoes.findIndex((mov) => mov.id === id);
      if (index === -1) throw new Error('Movimentação não encontrada');

      const updatedMovimentacao = {
        ...mockMovimentacoes[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      mockMovimentacoes[index] = updatedMovimentacao;
      return updatedMovimentacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOVIMENTACOES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['suprimentos', 'almoxarifado', 'items'] });

      toast({
        title: 'Movimentação atualizada',
        description: 'A movimentação foi atualizada com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar movimentação',
        description: 'Não foi possível atualizar a movimentação. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Hook para deletar movimentação
export const useDeleteMovimentacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      // TODO: Substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = mockMovimentacoes.findIndex((mov) => mov.id === id);
      if (index === -1) throw new Error('Movimentação não encontrada');

      mockMovimentacoes.splice(index, 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOVIMENTACOES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['suprimentos', 'almoxarifado', 'items'] });

      toast({
        title: 'Movimentação deletada',
        description: 'A movimentação foi deletada com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao deletar movimentação',
        description: 'Não foi possível deletar a movimentação. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};
