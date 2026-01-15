// Validações Zod para Check-list de Saída
import { z } from 'zod';

// Schema para item individual do check-list
export const checklistSaidaItemSchema = z.object({
  id: z.string(),
  descricao: z.string(),
  categoria: z.enum(['seguranca', 'documentos', 'mecanica', 'limpeza', 'outros']),
  checked: z.boolean(),
  observacao: z.string().optional(),
});

// Schema para formulário de check-list de saída
export const checklistSaidaSchema = z.object({
  veiculo_id: z.number({
    required_error: 'Veículo é obrigatório',
    invalid_type_error: 'Veículo inválido',
  }).min(1, 'Selecione um veículo'),

  motorista_id: z.number({
    required_error: 'Motorista é obrigatório',
    invalid_type_error: 'Motorista inválido',
  }).min(1, 'Selecione um motorista'),

  km_inicial: z.number({
    required_error: 'KM inicial é obrigatório',
    invalid_type_error: 'KM inicial deve ser um número',
  }).min(0, 'KM inicial não pode ser negativo'),

  combustivel_nivel: z.enum(['cheio', '3/4', '1/2', '1/4', 'reserva'], {
    required_error: 'Nível de combustível é obrigatório',
    invalid_type_error: 'Nível de combustível inválido',
  }),

  destino_id: z.number().optional(),

  items: z.array(checklistSaidaItemSchema).min(1, 'Check-list deve ter pelo menos 1 item'),

  fotos_danos: z.array(z.string()).default([]),

  observacoes: z.string().optional(),

  data_hora_saida: z.string({
    required_error: 'Data e hora de saída é obrigatória',
  }),
});

// Tipo TypeScript inferido do schema
export type ChecklistSaidaFormData = z.infer<typeof checklistSaidaSchema>;

// Schema para validação adicional (personalizado)
export const validateChecklistSaidaForm = (data: ChecklistSaidaFormData) => {
  const errors: string[] = [];

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

  // Validar data/hora (não pode ser futura)
  const dataSaida = new Date(data.data_hora_saida);
  const agora = new Date();

  if (dataSaida > agora) {
    errors.push('Data e hora de saída não pode ser futura');
  }

  // Validar se KM inicial é razoável (não pode ser 0 em veículo usado)
  if (data.km_inicial === 0) {
    errors.push('KM inicial suspeito (0 km). Verifique o valor digitado.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
