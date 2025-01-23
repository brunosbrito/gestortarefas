import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { useToast } from '@/hooks/use-toast';
import { updateActivity } from '@/services/ActivityService';

const emExecucaoSchema = z.object({
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  startTime: z.string().min(1, 'Hora de início é obrigatória'),
});

const concluidaSchema = z.object({
  endDate: z.string().min(1, 'Data de conclusão é obrigatória'),
  endTime: z.string().min(1, 'Hora de conclusão é obrigatória'),
  realizationDescription: z.string().min(1, 'Descrição do que foi realizado é obrigatória'),
  workedHours: z.array(z.object({
    id: z.string(),
    hours: z.number().min(0.1, 'As horas trabalhadas devem ser maiores que 0'),
  })),
});

const paralizadaSchema = z.object({
  pauseDate: z.string().min(1, 'Data de paralização é obrigatória'),
  pauseTime: z.string().min(1, 'Hora de paralização é obrigatória'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  realizationDescription: z.string().min(1, 'Descrição do que foi realizado é obrigatória'),
});

type FormValues = 
  | z.infer<typeof emExecucaoSchema>
  | z.infer<typeof concluidaSchema>
  | z.infer<typeof paralizadaSchema>;

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
  const schema =
    novoStatus === 'Em execução'
      ? emExecucaoSchema
      : novoStatus === 'Concluídas'
      ? concluidaSchema
      : paralizadaSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...(novoStatus === 'Concluídas' ? {
        workedHours: atividade?.collaborators?.map(col => ({
          id: col.id.toString(),
          hours: 0,
        })) || [],
      } : {}),
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const formattedData = { ...data };

      if (novoStatus === 'Em execução') {
        const execData = data as z.infer<typeof emExecucaoSchema>;
        formattedData.startDate = new Date(
          `${execData.startDate}T${execData.startTime}`
        ).toISOString();
        delete formattedData.startTime;
      } else if (novoStatus === 'Concluídas') {
        const concData = data as z.infer<typeof concluidaSchema>;
        formattedData.endDate = new Date(
          `${concData.endDate}T${concData.endTime}`
        ).toISOString();
        delete formattedData.endTime;
      } else if (novoStatus === 'Paralizadas') {
        const paraData = data as z.infer<typeof paralizadaSchema>;
        formattedData.pauseDate = new Date(
          `${paraData.pauseDate}T${paraData.pauseTime}`
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
      <DialogContent className="max-w-[90%] sm:max-w-[600px]">
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
                <FormField
                  control={form.control}
                  name="realizationDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O que foi realizado?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o que foi realizado nesta atividade"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  {atividade?.collaborators?.map((colaborador, index) => (
                    <FormField
                      key={colaborador.id}
                      control={form.control}
                      name={`workedHours.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas trabalhadas - {colaborador.name}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="Digite as horas trabalhadas"
                              onChange={(e) => field.onChange({
                                id: colaborador.id.toString(),
                                hours: parseFloat(e.target.value),
                              })}
                              value={field.value?.hours || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                <FormField
                  control={form.control}
                  name="realizationDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O que foi realizado até o momento?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o que foi realizado até o momento nesta atividade"
                          className="min-h-[100px]"
                          {...field}
                        />
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