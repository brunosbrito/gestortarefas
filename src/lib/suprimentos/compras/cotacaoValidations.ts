// Validações Zod para Cotações
import { z } from 'zod';

// Schema para item cotado por fornecedor
export const cotacaoFornecedorItemSchema = z.object({
  id: z.string().optional(),
  cotacao_fornecedor_id: z.number().optional(),
  requisicao_item_id: z.number({
    required_error: 'Item da requisição é obrigatório',
  }),
  requisicao_item_descricao: z.string().optional(),

  valor_unitario: z.number({
    required_error: 'Valor unitário é obrigatório',
    invalid_type_error: 'Valor unitário deve ser um número',
  }).min(0, 'Valor unitário não pode ser negativo').optional(),

  valor_total: z.number({
    required_error: 'Valor total é obrigatório',
    invalid_type_error: 'Valor total deve ser um número',
  }).min(0, 'Valor total não pode ser negativo').optional(),

  marca: z.string().optional(),
  observacoes: z.string().optional(),
});

// Schema para fornecedor na cotação
export const cotacaoFornecedorSchema = z.object({
  id: z.number().optional(),
  cotacao_id: z.number().optional(),

  fornecedor_id: z.number({
    required_error: 'Fornecedor é obrigatório',
    invalid_type_error: 'Fornecedor inválido',
  }).min(1, 'Selecione um fornecedor'),

  fornecedor_nome: z.string().min(1, 'Nome do fornecedor é obrigatório'),
  fornecedor_cnpj: z.string().optional(),
  fornecedor_contato: z.string().optional(),
  fornecedor_email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  fornecedor_telefone: z.string().optional(),

  data_envio: z.string().optional(),
  data_resposta: z.string().optional(),
  respondeu: z.boolean().default(false),

  items: z.array(cotacaoFornecedorItemSchema).default([]),

  prazo_entrega: z.number({
    invalid_type_error: 'Prazo deve ser um número',
  }).min(0, 'Prazo não pode ser negativo').optional(),

  forma_pagamento: z.string().optional(),
  condicoes_pagamento: z.string().optional(),
  validade_proposta: z.number().min(0, 'Validade não pode ser negativa').optional(),
  observacoes: z.string().optional(),

  arquivo_proposta: z.string().optional(),
});

// Schema para formulário de cotação
export const cotacaoSchema = z.object({
  status: z.enum(['aguardando', 'em_analise', 'finalizada', 'cancelada'], {
    required_error: 'Status é obrigatório',
  }),

  requisicao_id: z.number({
    required_error: 'Requisição é obrigatória',
    invalid_type_error: 'Requisição inválida',
  }).min(1, 'Selecione uma requisição'),

  requisicao_numero: z.string().min(1, 'Número da requisição é obrigatório'),
  requisicao_items: z.array(z.any()).default([]), // Items da requisição (readonly)

  data_abertura: z.string().min(1, 'Data de abertura é obrigatória'),
  data_limite_resposta: z.string().min(1, 'Data limite de resposta é obrigatória'),
  data_finalizacao: z.string().optional(),

  fornecedores: z.array(cotacaoFornecedorSchema).min(1, 'Adicione pelo menos um fornecedor'),

  observacoes: z.string().optional(),

  created_by: z.number(),
});

// Tipo TypeScript inferido do schema
export type CotacaoFormData = z.infer<typeof cotacaoSchema>;

// Schema para validação adicional (personalizado)
export const validateCotacaoForm = (data: CotacaoFormData) => {
  const errors: string[] = [];

  // Validar que data limite é posterior à data de abertura
  if (data.data_abertura && data.data_limite_resposta) {
    const dataAbertura = new Date(data.data_abertura);
    const dataLimite = new Date(data.data_limite_resposta);

    if (dataLimite <= dataAbertura) {
      errors.push('Data limite de resposta deve ser posterior à data de abertura');
    }
  }

  // Validar data de finalização (se houver)
  if (data.data_finalizacao && data.data_abertura) {
    const dataAbertura = new Date(data.data_abertura);
    const dataFinalizacao = new Date(data.data_finalizacao);

    if (dataFinalizacao < dataAbertura) {
      errors.push('Data de finalização não pode ser anterior à data de abertura');
    }
  }

  // Validar fornecedores
  if (data.fornecedores.length === 0) {
    errors.push('É necessário adicionar pelo menos um fornecedor');
  }

  // Validar items cotados para fornecedores que responderam
  data.fornecedores.forEach((fornecedor, index) => {
    if (fornecedor.respondeu) {
      if (fornecedor.items.length === 0) {
        errors.push(
          `Fornecedor ${index + 1} (${fornecedor.fornecedor_nome}): Fornecedor que respondeu deve ter items cotados`
        );
      }

      // Validar que items cotados têm preços
      fornecedor.items.forEach((item, itemIndex) => {
        if (item.valor_unitario === undefined || item.valor_unitario === null) {
          errors.push(
            `Fornecedor ${index + 1}, Item ${itemIndex + 1}: Valor unitário é obrigatório`
          );
        }
        if (item.valor_total === undefined || item.valor_total === null) {
          errors.push(
            `Fornecedor ${index + 1}, Item ${itemIndex + 1}: Valor total é obrigatório`
          );
        }
      });

      // Validar condições comerciais
      if (!fornecedor.prazo_entrega || fornecedor.prazo_entrega <= 0) {
        errors.push(
          `Fornecedor ${index + 1} (${fornecedor.fornecedor_nome}): Prazo de entrega é obrigatório`
        );
      }
      if (!fornecedor.forma_pagamento || fornecedor.forma_pagamento.trim() === '') {
        errors.push(
          `Fornecedor ${index + 1} (${fornecedor.fornecedor_nome}): Forma de pagamento é obrigatória`
        );
      }
    }
  });

  // Validar duplicação de fornecedores
  const fornecedorIds = data.fornecedores.map((f) => f.fornecedor_id);
  const fornecedoresDuplicados = fornecedorIds.filter(
    (id, index) => fornecedorIds.indexOf(id) !== index
  );
  if (fornecedoresDuplicados.length > 0) {
    errors.push('Não é permitido adicionar o mesmo fornecedor mais de uma vez');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
