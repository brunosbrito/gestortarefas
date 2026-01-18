import { z } from 'zod';

// ==================== Purchase Request Validations ====================

export const purchaseRequestItemSchema = z.object({
  description: z
    .string()
    .min(3, 'Descrição deve ter no mínimo 3 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  quantity: z
    .number()
    .min(0.01, 'Quantidade deve ser maior que zero')
    .max(999999, 'Quantidade inválida'),
  unit: z
    .string()
    .min(1, 'Unidade é obrigatória')
    .max(50, 'Unidade deve ter no máximo 50 caracteres'),
  estimatedUnitPrice: z
    .number()
    .min(0, 'Preço unitário deve ser maior ou igual a zero')
    .max(99999999, 'Preço unitário inválido'),
  specifications: z
    .string()
    .min(10, 'Especificações devem ter no mínimo 10 caracteres')
    .max(1000, 'Especificações devem ter no máximo 1000 caracteres'),
  budgetItemId: z.string().optional(),
  costCenterId: z.string().optional(),
});

export const purchaseRequestSchema = z.object({
  contractId: z.number().min(1, 'Contrato é obrigatório'),
  requestedBy: z
    .string()
    .min(3, 'Nome do solicitante deve ter no mínimo 3 caracteres')
    .max(200, 'Nome do solicitante deve ter no máximo 200 caracteres'),
  department: z
    .string()
    .min(2, 'Departamento deve ter no mínimo 2 caracteres')
    .max(100, 'Departamento deve ter no máximo 100 caracteres'),
  items: z
    .array(purchaseRequestItemSchema)
    .min(1, 'Adicione pelo menos um item')
    .max(100, 'Máximo de 100 itens por requisição'),
  justification: z
    .string()
    .min(20, 'Justificativa deve ter no mínimo 20 caracteres')
    .max(2000, 'Justificativa deve ter no máximo 2000 caracteres'),
  urgency: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Selecione um nível de urgência válido' }),
  }),
  requiredDeliveryDate: z
    .string()
    .min(1, 'Data de entrega é obrigatória')
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: 'Data de entrega não pode ser no passado' }
    ),
});

export type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>;

// ==================== Quotation Validations ====================

export const quotationItemSchema = z.object({
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  unitPrice: z.number().min(0, 'Preço unitário deve ser maior ou igual a zero'),
  brand: z.string().optional(),
  model: z.string().optional(),
  deliveryTime: z
    .number()
    .min(0, 'Prazo de entrega deve ser maior ou igual a zero')
    .max(365, 'Prazo de entrega máximo é 365 dias')
    .optional(),
  specifications: z.string().max(1000).optional(),
});

export const quotationSchema = z.object({
  purchaseRequestId: z.number().min(1, 'Requisição de compra é obrigatória'),
  supplierId: z.number().min(1, 'Fornecedor é obrigatório'),
  supplierName: z
    .string()
    .min(3, 'Nome do fornecedor deve ter no mínimo 3 caracteres')
    .max(200, 'Nome do fornecedor deve ter no máximo 200 caracteres'),
  items: z
    .array(quotationItemSchema)
    .min(1, 'Adicione pelo menos um item')
    .max(100, 'Máximo de 100 itens por cotação'),
  validUntil: z
    .string()
    .min(1, 'Data de validade é obrigatória')
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: 'Data de validade não pode ser no passado' }
    ),
  notes: z.string().max(2000, 'Observações devem ter no máximo 2000 caracteres').optional(),
});

export type QuotationFormData = z.infer<typeof quotationSchema>;

// ==================== Report Filters Validations ====================

export const reportDateRangeSchema = z
  .object({
    start: z.string().min(1, 'Data inicial é obrigatória'),
    end: z.string().min(1, 'Data final é obrigatória'),
  })
  .refine(
    (data) => {
      const start = new Date(data.start);
      const end = new Date(data.end);
      return start <= end;
    },
    { message: 'Data inicial deve ser anterior à data final', path: ['end'] }
  );

export const reportNumberRangeSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.min !== undefined && data.max !== undefined) {
        return data.min <= data.max;
      }
      return true;
    },
    { message: 'Valor mínimo deve ser menor que o máximo', path: ['max'] }
  );

// ==================== General Validations ====================

export const currencySchema = z
  .number()
  .min(0, 'Valor deve ser maior ou igual a zero')
  .max(999999999.99, 'Valor máximo excedido')
  .refine((value) => {
    // Check if has at most 2 decimal places
    const decimalPlaces = value.toString().split('.')[1]?.length || 0;
    return decimalPlaces <= 2;
  }, 'Valor monetário deve ter no máximo 2 casas decimais');

export const percentageSchema = z
  .number()
  .min(0, 'Percentual deve ser maior ou igual a 0')
  .max(100, 'Percentual deve ser menor ou igual a 100');

export const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato de telefone inválido: (99) 99999-9999')
  .optional()
  .or(z.literal(''));

export const emailSchema = z
  .string()
  .email('Email inválido')
  .max(255, 'Email deve ter no máximo 255 caracteres')
  .optional()
  .or(z.literal(''));

export const cnpjSchema = z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Formato de CNPJ inválido: 99.999.999/9999-99')
  .optional()
  .or(z.literal(''));

// ==================== Helper Functions ====================

export const formatZodErrors = (error: z.ZodError) => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const validateFutureDate = (date: string): boolean => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

export const validateCurrency = (value: number): boolean => {
  if (value < 0 || value > 999999999.99) return false;
  const decimalPlaces = value.toString().split('.')[1]?.length || 0;
  return decimalPlaces <= 2;
};

export const validatePercentage = (value: number): boolean => {
  return value >= 0 && value <= 100;
};
