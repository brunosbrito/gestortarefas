// Dialog para criação/edição de Inventário
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useCreateInventario,
  useUpdateInventario,
} from '@/hooks/suprimentos/almoxarifado/useInventarios';
import {
  Inventario,
  InventarioCreate,
  inventarioStatusLabels,
} from '@/interfaces/suprimentos/almoxarifado/InventarioInterface';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Schema de validação
const inventarioSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório').max(50, 'Código muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
  status: z.enum(['em_andamento', 'concluido', 'ajustado']),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_conclusao: z.string().optional(),
  responsavel_id: z.coerce.number().min(1, 'Selecione um responsável'),
  observacoes: z.string().max(1000, 'Observações muito longas').optional(),
});

type InventarioFormValues = z.infer<typeof inventarioSchema>;

interface InventarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventario: Inventario | null;
  mode: 'create' | 'edit';
}

export default function InventarioFormDialog({
  open,
  onOpenChange,
  inventario,
  mode,
}: InventarioFormDialogProps) {
  const createMutation = useCreateInventario();
  const updateMutation = useUpdateInventario();

  const form = useForm<InventarioFormValues>({
    resolver: zodResolver(inventarioSchema),
    defaultValues: {
      codigo: '',
      descricao: '',
      status: 'em_andamento',
      data_inicio: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
      data_conclusao: '',
      responsavel_id: 1, // Mock: default to first user
      observacoes: '',
    },
  });

  // Reset form quando abrir dialog ou mudar inventario
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && inventario) {
        form.reset({
          codigo: inventario.codigo,
          descricao: inventario.descricao || '',
          status: inventario.status,
          data_inicio: inventario.data_inicio.slice(0, 16),
          data_conclusao: inventario.data_conclusao?.slice(0, 16) || '',
          responsavel_id: inventario.responsavel_id,
          observacoes: inventario.observacoes || '',
        });
      } else {
        // Gerar código automático para novo inventário
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const codigo = `INV-${year}-${month}-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`;

        form.reset({
          codigo,
          descricao: '',
          status: 'em_andamento',
          data_inicio: new Date().toISOString().slice(0, 16),
          data_conclusao: '',
          responsavel_id: 1,
          observacoes: '',
        });
      }
    }
  }, [open, mode, inventario, form]);

  const onSubmit = (data: InventarioFormValues) => {
    const processedData: InventarioCreate = {
      ...data,
      responsavel_id: Number(data.responsavel_id),
      responsavel_nome: 'Usuário Mock', // TODO: pegar do contexto de autenticação
      descricao: data.descricao || undefined,
      data_inicio: new Date(data.data_inicio).toISOString(),
      data_conclusao: data.data_conclusao ? new Date(data.data_conclusao).toISOString() : undefined,
      observacoes: data.observacoes || undefined,
    };

    if (mode === 'create') {
      createMutation.mutate(processedData, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    } else if (inventario) {
      updateMutation.mutate(
        { id: inventario.id, data: processedData },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Novo Inventário' : 'Editar Inventário'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados para criar um novo inventário de estoque.'
              : 'Atualize os dados do inventário.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Código e Status */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-2024-001" {...field} />
                    </FormControl>
                    <FormDescription>Código único do inventário</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(inventarioStatusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Inventário Geral - Janeiro 2024"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data Início e Conclusão */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Hora de Início *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_conclusao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Hora de Conclusão</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Deixe em branco se ainda em andamento</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o inventário..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Criar Inventário' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
