import { z } from 'zod';

export const formSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  projectId: z.number(),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  status: z.enum(['em_andamento', 'concluida', 'pausada']),
  notes: z.string().optional(),
  assignedUser: z.number().optional(),
  projectNumber: z.string().min(1, 'Número do projeto é obrigatório'),
  quantity: z.number().min(0, 'Quantidade deve ser maior ou igual a 0'),
  weight: z.string(),
  progress: z.number(),
  arquivo: z.any().optional(),
  arquivoDescricao: z.string().optional(),
  imagem: z.any().optional(),
  imagemDescricao: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;