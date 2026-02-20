import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DraggableDialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateActivity } from '@/services/ActivityService';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { useEffect } from 'react';
import { Clock } from 'lucide-react';

const editarConcluidaSchema = z.object({
  endDate: z.string().min(1, 'Data de conclusão é obrigatória'),
  endTime: z.string().min(1, 'Hora de conclusão é obrigatória'),
  totalTime: z.number().min(0, 'Tempo trabalhado deve ser maior ou igual a 0'),
  completedQuantity: z.number().min(0, 'Quantidade concluída deve ser maior ou igual a 0'),
  realizationDescription: z.string().optional(),
  observation: z.string().optional(),
});

type EditarConcluidaForm = z.infer<typeof editarConcluidaSchema>;

interface EditarAtividadeConcluidaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atividade: AtividadeStatus | null;
  onSuccess: () => void;
}

export function EditarAtividadeConcluidaDialog({
  open,
  onOpenChange,
  atividade,
  onSuccess,
}: EditarAtividadeConcluidaDialogProps) {
  const { toast } = useToast();

  const formatDateForInput = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const formatTimeForInput = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toTimeString().slice(0, 5);
    } catch {
      return '';
    }
  };

  const form = useForm<EditarConcluidaForm>({
    resolver: zodResolver(editarConcluidaSchema),
    defaultValues: {
      endDate: '',
      endTime: '',
      totalTime: 0,
      completedQuantity: 0,
      realizationDescription: '',
      observation: '',
    },
  });

  // Calcular tempo trabalhado baseado na data de início e conclusão
  const calculateTotalTime = (endDateStr: string, endTimeStr: string): number => {
    if (!atividade?.startDate || !endDateStr || !endTimeStr) return 0;

    try {
      const startDate = new Date(atividade.startDate);
      const endDate = new Date(`${endDateStr}T${endTimeStr}`);

      // Calcular diferença em horas
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Retornar apenas se for positivo
      return diffHours > 0 ? Math.round(diffHours * 100) / 100 : 0;
    } catch {
      return 0;
    }
  };

  // Atualizar form quando a atividade mudar
  useEffect(() => {
    if (atividade && open) {
      const endDateValue = formatDateForInput(atividade.endDate);
      const endTimeValue = formatTimeForInput(atividade.endDate);
      const calculatedTime = calculateTotalTime(endDateValue, endTimeValue);

      form.reset({
        endDate: endDateValue,
        endTime: endTimeValue,
        totalTime: atividade.totalTime || calculatedTime || 0,
        completedQuantity: atividade.completedQuantity || atividade.quantity || 0,
        realizationDescription: '',
        observation: atividade.observation || '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atividade?.id, open]);

  // Recalcular tempo quando data/hora de conclusão mudar
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'endDate' || name === 'endTime') {
        const endDate = value.endDate || '';
        const endTime = value.endTime || '';
        if (endDate && endTime) {
          const calculatedTime = calculateTotalTime(endDate, endTime);
          form.setValue('totalTime', calculatedTime);
        }
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, atividade?.startDate]);

  const onSubmit = async (data: EditarConcluidaForm) => {
    if (!atividade) return;

    try {
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`).toISOString();

      const updateData = {
        endDate: endDateTime,
        totalTime: data.totalTime,
        completedQuantity: data.completedQuantity,
        observation: data.observation,
        realizationDescription: data.realizationDescription || `Edição de atividade concluída`,
        changedBy: localStorage.getItem('userId') || '0',
      };

      await updateActivity(atividade.id, updateData);

      toast({
        title: 'Atividade atualizada',
        description: 'Os dados da atividade foram atualizados com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Ocorreu um erro ao atualizar a atividade.',
      });
    }
  };

  const formatTotalTimeDisplay = (totalTime: number) => {
    if (!totalTime || totalTime <= 0) return '00:00';
    const hours = Math.floor(totalTime);
    const minutes = Math.round((totalTime - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const formatDateDisplay = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DraggableDialogContent className="max-w-[90%] sm:max-w-[500px] pt-10">
        <DialogHeader>
          <DialogTitle>Editar Atividade Concluída</DialogTitle>
        </DialogHeader>

        {/* Informação da data de início */}
        {atividade?.startDate && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Data de início:</span>
            <span className="font-medium">{formatDateDisplay(atividade.startDate)}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Data e Hora de Conclusão */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Conclusão</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Conclusão</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        step="1"
                        min="00:00"
                        max="23:59"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tempo Trabalhado (calculado automaticamente) e Quantidade Concluída */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Trabalhado</FormLabel>
                    <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-primary/10 border border-primary/20">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        {formatTotalTimeDisplay(field.value)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Calculado automaticamente
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="completedQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Concluída</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Quantidade"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    {atividade?.quantity && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Total previsto: {atividade.quantity}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição da Alteração */}
            <FormField
              control={form.control}
              name="realizationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da Alteração</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o motivo da alteração (será salvo no histórico)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observação */}
            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais"
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
            >
              Salvar Alterações
            </Button>
          </form>
        </Form>
      </DraggableDialogContent>
    </Dialog>
  );
}
