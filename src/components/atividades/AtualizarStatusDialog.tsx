import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { updateActivity } from '@/services/ActivityService';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Colaborador } from '@/interfaces/ColaboradorInterface';

const emExecucaoSchema = z.object({
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  startTime: z.string().min(1, 'Hora de início é obrigatória'),
});

const concluidaSchema = z.object({
  endDate: z.string().min(1, 'Data de conclusão é obrigatória'),
  endTime: z.string().min(1, 'Hora de conclusão é obrigatória'),
});

const paralizadaSchema = z.object({
  pauseDate: z.string().min(1, 'Data de paralização é obrigatória'),
  pauseTime: z.string().min(1, 'Hora de paralização é obrigatória'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
});

const motivosParalizacao = [
  'Falta de material',
  'Falta de mão de obra',
  'Mudança turno',
  'Quebra/Manutenção',
  'Falha Projeto',
  'Erro Operador',
  'Falta de ferramenta',
  'Falta itens',
  'Outros',
];

interface AtualizarStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atividade: { id: string; collaborators?: Colaborador[] };
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
  const [isFormValid, setIsFormValid] = useState(false);
  const schema =
    novoStatus === 'Em execução'
      ? emExecucaoSchema
      : novoStatus === 'Concluídas'
      ? concluidaSchema
      : paralizadaSchema;

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const validateWorkedHours = () => {
    const inputs = document.querySelectorAll('input[name="workedHours"]');
    let isValid = true;

    inputs.forEach((input) => {
      const value = (input as HTMLInputElement).value;
      if (!value || isNaN(Number(value)) || Number(value) <= 0) {
        isValid = false;
      }
    });

    setIsFormValid(isValid);
  };

  useEffect(() => {
    validateWorkedHours();
  }, [atividade]);

  const onSubmit = async (data: any, event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    let allHoursFilled = true;
    const workedHours: { id: string; hours: number }[] = [];
    const inputs = document.querySelectorAll('input[name="workedHours"]');

    inputs.forEach((input) => {
      const id = (input as HTMLInputElement).dataset.id;
      const hours = Number((input as HTMLInputElement).value);

      if (id && !isNaN(hours)) {
        workedHours.push({ id, hours });
      } else {
        allHoursFilled = false;
      }
    });

    if (!allHoursFilled) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description:
          'Por favor, preencha as horas de trabalho para todos os colaboradores.',
      });
      return;
    }
    try {
      const formattedData = { ...data };

      if (novoStatus === 'Em execução') {
        formattedData.startDate = new Date(
          `${data.startDate}T${data.startTime}`
        ).toISOString();
        delete formattedData.startTime;
      } else if (novoStatus === 'Concluídas') {
        formattedData.endDate = new Date(
          `${data.endDate}T${data.endTime}`
        ).toISOString();
        delete formattedData.endTime;
        formattedData.users = workedHours;
      } else if (novoStatus === 'Paralizadas') {
        formattedData.pauseDate = new Date(
          `${data.pauseDate}T${data.pauseTime}`
        ).toISOString();
        delete formattedData.pauseTime;
      }

      await updateActivity(atividade.id, {
        ...formattedData,
        status: novoStatus,
        changedBy: Number(localStorage.getItem('userId')),
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
              <div className="grid grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Início</FormLabel>
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
            )}

            {novoStatus === 'Concluídas' && (
              <>
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
                <div className="space-y-4">
                  {atividade?.collaborators?.map((colaborador: Colaborador) => (
                    <div
                      key={colaborador.id}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <User />
                        <FormLabel>{colaborador.name}</FormLabel>
                      </div>
                      <div>
                        <Input
                          type="number"
                          name="workedHours"
                          placeholder="Horas"
                          min="0"
                          data-id={colaborador.id}
                          onChange={validateWorkedHours}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {novoStatus === 'Paralizadas' && (
              <>
                <div className="grid grid-cols-2 gap-4">
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
                    name="pauseTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de Paralização</FormLabel>
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
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o motivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {motivosParalizacao.map((motivo) => (
                            <SelectItem key={motivo} value={motivo}>
                              {motivo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
