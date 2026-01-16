// Validações Zod para Requisições de Compra
import { z } from 'zod';

// Schema para item de requisição
export const requisicaoItemSchema = z.object({
  id: z.number().optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  especificacao: z.string().optional(),
  quantidade: z.number({
    required_error: 'Quantidade é obrigatória',
    invalid_type_error: 'Quantidade deve ser um número',
  }).min(1, 'Quantidade deve ser maior que 0'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  data_necessidade: z.string().min(1, 'Data de necessidade é obrigatória'),
  centro_custo_id: z.number().optional(),
  observacoes: z.string().optional(),
});

// Schema para formulário de requisição
export const requisicaoSchema = z.object({
  status: z.enum(['rascunho', 'pendente', 'aprovada', 'reprovada', 'em_cotacao', 'cotada', 'cancelada'], {
    required_error: 'Status é obrigatório',
  }),

  solicitante_id: z.number({
    required_error: 'Solicitante é obrigatório',
    invalid_type_error: 'Solicitante inválido',
  }).min(1, 'Selecione um solicitante'),

  solicitante_nome: z.string().min(1, 'Nome do solicitante é obrigatório'),

  centro_custo_id: z.number().optional(),
  centro_custo_nome: z.string().optional(),
  obra_id: z.number().optional(),
  obra_nome: z.string().optional(),

  data_requisicao: z.string().min(1, 'Data da requisição é obrigatória'),
  data_necessidade: z.string().min(1, 'Data de necessidade é obrigatória'),

  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente'], {
    required_error: 'Prioridade é obrigatória',
  }),

  items: z.array(requisicaoItemSchema).min(1, 'Adicione pelo menos um item'),

  justificativa: z.string().min(10, 'Justificativa deve ter pelo menos 10 caracteres'),
  observacoes: z.string().optional(),

  // Campos de aprovação (opcionais)
  aprovador_id: z.number().optional(),
  aprovador_nome: z.string().optional(),
  data_aprovacao: z.string().optional(),
  motivo_reprovacao: z.string().optional(),

  created_by: z.number(),
});

// Tipo TypeScript inferido do schema
export type RequisicaoFormData = z.infer<typeof requisicaoSchema>;

// Schema para validação adicional (personalizado)
export const validateRequisicaoForm = (data: RequisicaoFormData) => {
  const errors: string[] = [];

  // Validar que data de necessidade não é anterior à data de requisição
  if (data.data_necessidade && data.data_requisicao) {
    const dataNecessidade = new Date(data.data_necessidade);
    const dataRequisicao = new Date(data.data_requisicao);

    if (dataNecessidade < dataRequisicao) {
      errors.push('Data de necessidade não pode ser anterior à data da requisição');
    }
  }

  // Validar que cada item tem data de necessidade válida
  data.items.forEach((item, index) => {
    if (item.data_necessidade && data.data_requisicao) {
      const itemData = new Date(item.data_necessidade);
      const requisicaoData = new Date(data.data_requisicao);

      if (itemData < requisicaoData) {
        errors.push(`Item ${index + 1}: Data de necessidade não pode ser anterior à data da requisição`);
      }
    }

    // Validar quantidade
    if (item.quantidade <= 0) {
      errors.push(`Item ${index + 1}: Quantidade deve ser maior que 0`);
    }
  });

  // Validar que tem obra OU centro de custo (pelo menos um)
  if (!data.obra_id && !data.centro_custo_id) {
    errors.push('Selecione uma Obra ou Centro de Custo');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
