// Validações Zod para o módulo de Logística
import { z } from 'zod';

// ===== VALIDAÇÕES DE VEÍCULOS =====

export const vehicleSchema = z.object({
  tipo: z.enum(['carro', 'empilhadeira', 'caminhao'], {
    errorMap: () => ({ message: 'Selecione um tipo válido' }),
  }),
  placa: z
    .string()
    .min(7, 'Placa deve ter 7 caracteres')
    .max(8, 'Placa deve ter no máximo 8 caracteres')
    .regex(/^[A-Z]{3}-?\d{4}$/, 'Formato inválido (ex: ABC-1234 ou ABC1234)')
    .transform((val) => val.toUpperCase().replace('-', '')),
  modelo: z
    .string()
    .min(2, 'Modelo é obrigatório')
    .max(100, 'Modelo deve ter no máximo 100 caracteres'),
  marca: z
    .string()
    .min(2, 'Marca é obrigatória')
    .max(50, 'Marca deve ter no máximo 50 caracteres'),
  ano: z
    .number()
    .int('Ano deve ser um número inteiro')
    .min(1900, 'Ano inválido')
    .max(new Date().getFullYear() + 1, 'Ano não pode ser futuro'),
  cor: z.string().max(30, 'Cor deve ter no máximo 30 caracteres').optional(),
  km_atual: z
    .number()
    .int('KM deve ser um número inteiro')
    .min(0, 'KM não pode ser negativo')
    .max(9999999, 'KM muito alto'),
  km_proxima_manutencao: z
    .number()
    .int('KM deve ser um número inteiro')
    .min(0, 'KM não pode ser negativo')
    .max(9999999, 'KM muito alto'),
  renavam: z.string().max(20, 'RENAVAM deve ter no máximo 20 caracteres').optional(),
  chassi: z.string().max(30, 'Chassi deve ter no máximo 30 caracteres').optional(),
  crlv_validade: z.string().refine(
    (date) => {
      const d = new Date(date);
      return d > new Date();
    },
    { message: 'CRLV está vencido' }
  ),
  seguro_validade: z.string().refine(
    (date) => {
      const d = new Date(date);
      return d > new Date();
    },
    { message: 'Seguro está vencido' }
  ),
  seguro_numero: z.string().max(50, 'Número do seguro deve ter no máximo 50 caracteres').optional(),
  status: z.enum(['disponivel', 'em_uso', 'em_manutencao', 'inativo'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
}).refine(
  (data) => data.km_proxima_manutencao > data.km_atual,
  {
    message: 'KM da próxima manutenção deve ser maior que o KM atual',
    path: ['km_proxima_manutencao'],
  }
);

export type VehicleFormData = z.infer<typeof vehicleSchema>;

// ===== VALIDAÇÕES DE MOTORISTAS =====

// Função auxiliar para validar CPF
const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;

  return true;
};

export const driverSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cpf: z
    .string()
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'Formato de CPF inválido (xxx.xxx.xxx-xx)')
    .refine(validateCPF, { message: 'CPF inválido' })
    .transform((val) => val.replace(/\D/g, '')),
  cnh_numero: z
    .string()
    .min(11, 'CNH deve ter 11 dígitos')
    .max(11, 'CNH deve ter 11 dígitos')
    .regex(/^\d+$/, 'CNH deve conter apenas números'),
  cnh_categoria: z.enum(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'], {
    errorMap: () => ({ message: 'Categoria de CNH inválida' }),
  }),
  cnh_validade: z.string().refine(
    (date) => {
      const d = new Date(date);
      return d > new Date();
    },
    { message: 'CNH está vencida' }
  ),
  telefone: z
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Formato de telefone inválido (ex: (11) 98765-4321)'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(100, 'E-mail deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  status: z.enum(['ativo', 'inativo', 'ferias', 'afastado'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
});

export type DriverFormData = z.infer<typeof driverSchema>;

// ===== VALIDAÇÕES DE TRANSPORTADORAS =====

// Função auxiliar para validar CNPJ
const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Valida primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleaned.charAt(12))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleaned.charAt(13))) return false;

  return true;
};

export const transportadoraSchema = z.object({
  razao_social: z
    .string()
    .min(3, 'Razão Social deve ter pelo menos 3 caracteres')
    .max(200, 'Razão Social deve ter no máximo 200 caracteres'),
  cnpj: z
    .string()
    .regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, 'Formato de CNPJ inválido (xx.xxx.xxx/xxxx-xx)')
    .refine(validateCNPJ, { message: 'CNPJ inválido' })
    .transform((val) => val.replace(/\D/g, '')),
  telefone: z
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Formato de telefone inválido (ex: (11) 98765-4321)'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(100, 'E-mail deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  endereco: z.string().max(200, 'Endereço deve ter no máximo 200 caracteres').optional(),
  cidade: z.string().max(100, 'Cidade deve ter no máximo 100 caracteres').optional(),
  estado: z.string().max(2, 'Estado deve ter 2 caracteres (ex: SP)').optional(),
  rating: z
    .number()
    .min(1, 'Avaliação mínima é 1')
    .max(5, 'Avaliação máxima é 5')
    .optional(),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
});

export type TransportadoraFormData = z.infer<typeof transportadoraSchema>;

// ===== MÁSCARAS =====

export const masks = {
  cpf: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },
  cnpj: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },
  phone: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  },
  plate: (value: string) => {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/([A-Z]{3})(\d)/, '$1-$2')
      .slice(0, 8);
  },
  cep: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  },
};

// ===== VALIDAÇÕES DE TIPOS DE MANUTENÇÃO =====

export const maintenanceTypeSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  categoria: z.enum(['preventiva', 'corretiva', 'preditiva', 'emergencial'], {
    errorMap: () => ({ message: 'Selecione uma categoria válida' }),
  }),
  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  frequencia: z.enum(['diaria', 'semanal', 'quinzenal', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual', 'sob_demanda'], {
    errorMap: () => ({ message: 'Selecione uma frequência válida' }),
  }),
  periodicidade_km: z
    .number()
    .int('KM deve ser um número inteiro')
    .min(0, 'KM não pode ser negativo')
    .max(999999, 'KM muito alto')
    .optional(),
  periodicidade_dias: z
    .number()
    .int('Dias deve ser um número inteiro')
    .min(1, 'Deve ter pelo menos 1 dia')
    .max(3650, 'Máximo 10 anos (3650 dias)')
    .optional(),
  checklist_items: z
    .array(z.string())
    .optional()
    .default([]),
  custo_estimado: z
    .number()
    .min(0, 'Custo não pode ser negativo')
    .max(999999.99, 'Custo muito alto')
    .optional(),
  tempo_estimado: z
    .number()
    .int('Tempo deve ser um número inteiro')
    .min(1, 'Tempo deve ser pelo menos 1 minuto')
    .max(1440, 'Tempo não pode exceder 24 horas (1440 minutos)')
    .optional(),
  ativo: z.boolean().default(true),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
});

export type MaintenanceTypeFormData = z.infer<typeof maintenanceTypeSchema>;

// ===== VALIDAÇÕES DE FORNECEDORES DE SERVIÇOS =====

export const serviceProviderSchema = z.object({
  razao_social: z
    .string()
    .min(3, 'Razão Social deve ter pelo menos 3 caracteres')
    .max(200, 'Razão Social deve ter no máximo 200 caracteres'),
  nome_fantasia: z.string().max(100, 'Nome Fantasia deve ter no máximo 100 caracteres').optional(),
  cnpj: z
    .string()
    .regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, 'Formato de CNPJ inválido (xx.xxx.xxx/xxxx-xx)')
    .refine(validateCNPJ, { message: 'CNPJ inválido' })
    .transform((val) => val.replace(/\D/g, ''))
    .optional()
    .or(z.literal('')),
  cpf: z
    .string()
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'Formato de CPF inválido (xxx.xxx.xxx-xx)')
    .refine(validateCPF, { message: 'CPF inválido' })
    .transform((val) => val.replace(/\D/g, ''))
    .optional()
    .or(z.literal('')),
  tipo: z.enum(['oficina', 'borracharia', 'funilaria', 'eletrica', 'mecanica', 'seguradora', 'despachante', 'outros'], {
    errorMap: () => ({ message: 'Selecione um tipo válido' }),
  }),
  telefone: z
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Formato de telefone inválido (ex: (11) 98765-4321)'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(100, 'E-mail deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  contato_nome: z.string().max(100, 'Nome do contato deve ter no máximo 100 caracteres').optional(),
  endereco: z.string().max(200, 'Endereço deve ter no máximo 200 caracteres').optional(),
  cidade: z.string().max(100, 'Cidade deve ter no máximo 100 caracteres').optional(),
  estado: z.string().max(2, 'Estado deve ter 2 caracteres (ex: SP)').optional(),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'Formato de CEP inválido (xxxxx-xxx)').optional().or(z.literal('')),
  rating: z
    .number()
    .min(1, 'Avaliação mínima é 1')
    .max(5, 'Avaliação máxima é 5')
    .optional(),
  ativo: z.boolean().default(true),
  credenciado: z.boolean().default(false),
  especialidades: z
    .array(z.string())
    .optional()
    .default([]),
  prazo_pagamento: z
    .number()
    .int('Prazo deve ser um número inteiro')
    .min(0, 'Prazo não pode ser negativo')
    .max(365, 'Prazo não pode exceder 1 ano')
    .optional(),
  desconto_padrao: z
    .number()
    .min(0, 'Desconto não pode ser negativo')
    .max(100, 'Desconto não pode exceder 100%')
    .optional(),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
});

export type ServiceProviderFormData = z.infer<typeof serviceProviderSchema>;
