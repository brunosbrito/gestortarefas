import * as z from 'zod';
import {
  CreateServiceOrder,
  ServiceOrder,
} from '@/interfaces/ServiceOrderInterface';

export const formSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  projectId: z.number().min(1, 'Obra é obrigatória'),
  createdAt: z.string().min(1, 'Data de início é obrigatória'),
  status: z.enum(['em_andamento', 'concluida', 'pausada']),
  notes: z.string().optional(),
  assignedUser: z.number().optional(),
  quantity: z.number().min(1, 'Quantidade é obrigatória'),
  projectNumber: z.string().min(1, 'Número do projeto é obrigatória'),
  weight: z.string().min(1, 'Peso é obrigatória'),
});

export type FormValues = z.infer<typeof formSchema>;

export interface NovaOSFormProps {
  onSubmit: (data: CreateServiceOrder) => void;
  initialData?: ServiceOrder;
}
