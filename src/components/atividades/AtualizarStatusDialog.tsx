import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AtualizarHorasForm } from './AtualizarHorasForm';
import { useToast } from '@/hooks/use-toast';
import { updateActivity } from '@/services/ActivityService';

const emExecucaoSchema = z.object({
  startDate: z.string().min(1, 'Data de início é obrigatória'),
});

const concluidaSchema = z.object({
  endDate: z.string().min(1, 'Data de conclusão é obrigatória'),
});

const paralizadaSchema = z.object({
  pauseDate: z.string().min(1, 'Data de paralização é obrigatória'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
});

interface AtualizarStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atividade: any;
  novoStatus: string;
  onSuccess: () => void;
}

export function AtualizarStatusDialog({
  open,
  onOpenChange,
  atividade,
  novoStatus,
  onSuccess,
}: AtualizarStatusDialogProps) {
  const { toast } = useToast();
  const schema =
    novoStatus === 'Em execução'
      ? emExecucaoSchema
      : novoStatus === 'Concluídas'
      ? concluidaSchema
      : paralizadaSchema;

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      await updateActivity(atividade.id, {
        ...data,
        status: novoStatus,
      });

      toast({
        title: 'Status atualizado',
        description: 'O status da atividade foi atualizado com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar status',
        description: 'Ocorreu um erro ao atualizar o status da atividade.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {novoStatus === 'Em execução' && 'Iniciar Atividade'}
            {novoStatus === 'Concluídas' && 'Concluir Atividade'}
            {novoStatus === 'Paralizadas' && 'Paralizar Atividade'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {novoStatus === 'Em execução' && (
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {novoStatus === 'Concluídas' && (
              <>
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
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Horas Trabalhadas</h4>
                  <AtualizarHorasForm atividade={atividade} />
                </div>
              </>
            )}

            {novoStatus === 'Paralizadas' && (
              <>
                <FormField
                  control={form.control}
                  name="pauseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Paralização</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
            >
              Confirmar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
