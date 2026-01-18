// Validações Zod para Check-list de Retorno
import { z } from 'zod';
import { checklistSaidaItemSchema } from './checklistSaidaValidations';

// Schema para formulário de check-list de retorno
export const checklistRetornoSchema = z.object({
  checklist_saida_id: z.number({
    required_error: 'Check-list de saída é obrigatório',
    invalid_type_error: 'Check-list de saída inválido',
  }).min(1, 'Check-list de saída é obrigatório'),

  viagem_id: z.number().optional(),

  km_final: z.number({
    required_error: 'KM final é obrigatório',
    invalid_type_error: 'KM final deve ser um número',
  }).min(0, 'KM final não pode ser negativo'),

  combustivel_nivel: z.enum(['cheio', '3/4', '1/2', '1/4', 'reserva'], {
    required_error: 'Nível de combustível é obrigatório',
    invalid_type_error: 'Nível de combustível inválido',
  }),

  items: z.array(checklistSaidaItemSchema).min(1, 'Check-list deve ter pelo menos 1 item'),

  novos_danos: z.boolean({
    required_error: 'Informe se há novos danos',
  }),

  fotos_danos: z.array(z.string()).default([]),

  limpeza_ok: z.boolean({
    required_error: 'Informe se a limpeza está OK',
  }),

  observacoes: z.string().optional(),

  data_hora_retorno: z.string({
    required_error: 'Data e hora de retorno é obrigatória',
  }),

  localizacao: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

// Tipo TypeScript inferido do schema
export type ChecklistRetornoFormData = z.infer<typeof checklistRetornoSchema>;

// Schema para validação adicional (personalizado)
export const validateChecklistRetornoForm = (
  data: ChecklistRetornoFormData,
  kmInicial: number,
  dataHoraSaida: string
) => {
  const errors: string[] = [];

  // Validar se KM final é maior que KM inicial
  if (data.km_final <= kmInicial) {
    errors.push(
      `KM final (${data.km_final}) deve ser maior que KM inicial (${kmInicial})`
    );
  }

  // Validar se KM rodado é razoável (não mais que 1000 km em uma viagem)
  const kmRodado = data.km_final - kmInicial;
  if (kmRodado > 1000) {
    errors.push(
      `KM rodado muito alto (${kmRodado} km). Verifique se o KM final está correto.`
    );
  }

  // Validar se todos os items obrigatórios estão marcados
  const itemsObrigatorios = data.items.filter(
    (item) => item.categoria === 'seguranca' || item.categoria === 'documentos'
  );

  const itemsNaoMarcados = itemsObrigatorios.filter((item) => !item.checked);

  if (itemsNaoMarcados.length > 0) {
    errors.push(
      `Existem ${itemsNaoMarcados.length} item(ns) de segurança/documentos não marcados. Marque todos ou adicione observação.`
    );
  }

  // Validar data/hora (retorno deve ser depois da saída)
  const dataRetorno = new Date(data.data_hora_retorno);
  const dataSaida = new Date(dataHoraSaida);

  if (dataRetorno <= dataSaida) {
    errors.push('Data e hora de retorno deve ser posterior à saída');
  }

  // Validar data/hora (não pode ser futura)
  const agora = new Date();
  if (dataRetorno > agora) {
    errors.push('Data e hora de retorno não pode ser futura');
  }

  // Se marcou novos danos, deve ter foto ou observação
  if (data.novos_danos && data.fotos_danos.length === 0 && !data.observacoes) {
    errors.push(
      'Se há novos danos, adicione fotos ou descreva nas observações'
    );
  }

  // Se limpeza não OK, deve ter observação
  if (!data.limpeza_ok && !data.observacoes) {
    errors.push(
      'Se a limpeza não está OK, descreva o problema nas observações'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
