// Validações Zod para Manutenções
import { z } from 'zod';

// Schema para item de peça trocada
export const manutencaoPecaSchema = z.object({
  id: z.string().optional(),
  descricao: z.string().min(1, 'Descrição da peça é obrigatória'),
  quantidade: z.number({
    required_error: 'Quantidade é obrigatória',
    invalid_type_error: 'Quantidade deve ser um número',
  }).min(1, 'Quantidade deve ser maior que 0'),
  valor_unitario: z.number({
    required_error: 'Valor unitário é obrigatório',
    invalid_type_error: 'Valor unitário deve ser um número',
  }).min(0, 'Valor unitário não pode ser negativo'),
  valor_total: z.number({
    required_error: 'Valor total é obrigatório',
    invalid_type_error: 'Valor total deve ser um número',
  }).min(0, 'Valor total não pode ser negativo'),
});

// Schema para formulário de manutenção
export const manutencaoSchema = z.object({
  veiculo_id: z.number({
    required_error: 'Veículo é obrigatório',
    invalid_type_error: 'Veículo inválido',
  }).min(1, 'Selecione um veículo'),

  tipo_manutencao_id: z.number({
    required_error: 'Tipo de manutenção é obrigatório',
    invalid_type_error: 'Tipo de manutenção inválido',
  }).min(1, 'Selecione o tipo de manutenção'),

  fornecedor_servico_id: z.number().optional(),

  km_atual: z.number({
    required_error: 'KM atual é obrigatório',
    invalid_type_error: 'KM atual deve ser um número',
  }).min(0, 'KM atual não pode ser negativo'),

  proxima_manutencao_km: z.number().optional(),

  status: z.enum(['agendada', 'em_andamento', 'concluida', 'cancelada'], {
    required_error: 'Status é obrigatório',
    invalid_type_error: 'Status inválido',
  }),

  data_agendada: z.string().optional(),
  data_inicio: z.string().optional(),
  data_conclusao: z.string().optional(),

  pecas_trocadas: z.array(manutencaoPecaSchema).default([]),

  custo_pecas: z.number({
    required_error: 'Custo de peças é obrigatório',
    invalid_type_error: 'Custo de peças deve ser um número',
  }).min(0, 'Custo de peças não pode ser negativo'),

  custo_mao_obra: z.number({
    required_error: 'Custo de mão de obra é obrigatório',
    invalid_type_error: 'Custo de mão de obra deve ser um número',
  }).min(0, 'Custo de mão de obra não pode ser negativo'),

  custo_total: z.number({
    required_error: 'Custo total é obrigatório',
    invalid_type_error: 'Custo total deve ser um número',
  }).min(0, 'Custo total não pode ser negativo'),

  fotos_documentos: z.array(z.string()).default([]),
  numero_nf: z.string().optional(),

  descricao: z.string({
    required_error: 'Descrição é obrigatória',
    invalid_type_error: 'Descrição inválida',
  }).min(10, 'Descrição deve ter pelo menos 10 caracteres'),

  observacoes: z.string().optional(),

  responsavel_id: z.number().optional(),
});

// Tipo TypeScript inferido do schema
export type ManutencaoFormData = z.infer<typeof manutencaoSchema>;

// Schema para validação adicional (personalizado)
export const validateManutencaoForm = (data: ManutencaoFormData) => {
  const errors: string[] = [];

  // Validar custo total = custo peças + custo mão de obra
  const custoEsperado = data.custo_pecas + data.custo_mao_obra;
  const diferenca = Math.abs(data.custo_total - custoEsperado);

  if (diferenca > 0.01) {
    errors.push(
      `Custo total (R$ ${data.custo_total.toFixed(2)}) deve ser igual à soma de peças (R$ ${data.custo_pecas.toFixed(2)}) + mão de obra (R$ ${data.custo_mao_obra.toFixed(2)}) = R$ ${custoEsperado.toFixed(2)}`
    );
  }

  // Validar soma das peças = custo_pecas
  const somaPecas = data.pecas_trocadas.reduce((sum, peca) => sum + peca.valor_total, 0);
  const diferencaPecas = Math.abs(somaPecas - data.custo_pecas);

  if (diferencaPecas > 0.01 && data.pecas_trocadas.length > 0) {
    errors.push(
      `Soma das peças (R$ ${somaPecas.toFixed(2)}) deve ser igual ao custo de peças (R$ ${data.custo_pecas.toFixed(2)})`
    );
  }

  // Validar cada peça: valor_total = quantidade * valor_unitario
  data.pecas_trocadas.forEach((peca, index) => {
    const valorEsperado = peca.quantidade * peca.valor_unitario;
    const diferencaPeca = Math.abs(peca.valor_total - valorEsperado);

    if (diferencaPeca > 0.01) {
      errors.push(
        `Peça ${index + 1} (${peca.descricao}): Valor total deve ser quantidade × valor unitário = R$ ${valorEsperado.toFixed(2)}`
      );
    }
  });

  // Validar datas baseado no status
  if (data.status === 'agendada' && !data.data_agendada) {
    errors.push('Manutenção agendada deve ter data de agendamento');
  }

  if (data.status === 'em_andamento' && !data.data_inicio) {
    errors.push('Manutenção em andamento deve ter data de início');
  }

  if (data.status === 'concluida') {
    if (!data.data_inicio) {
      errors.push('Manutenção concluída deve ter data de início');
    }
    if (!data.data_conclusao) {
      errors.push('Manutenção concluída deve ter data de conclusão');
    }
  }

  // Validar ordem cronológica das datas
  if (data.data_agendada && data.data_inicio) {
    const agendada = new Date(data.data_agendada);
    const inicio = new Date(data.data_inicio);

    if (inicio < agendada) {
      errors.push('Data de início não pode ser anterior à data agendada');
    }
  }

  if (data.data_inicio && data.data_conclusao) {
    const inicio = new Date(data.data_inicio);
    const conclusao = new Date(data.data_conclusao);

    if (conclusao < inicio) {
      errors.push('Data de conclusão não pode ser anterior à data de início');
    }
  }

  // Validar próxima manutenção
  if (data.proxima_manutencao_km !== undefined && data.proxima_manutencao_km <= data.km_atual) {
    errors.push('Próxima manutenção deve ser em KM maior que o KM atual');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
