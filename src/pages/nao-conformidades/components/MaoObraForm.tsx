import { Button } from '@/components/ui/button';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateWorkforce } from '@/interfaces/RncInterface';
import RncService from '@/services/NonConformityService';
import { toast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ColaboradorService from '@/services/ColaboradorService';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { Trash2 } from 'lucide-react';

const formSchema = z.object({
  colaboradorId: z.string().min(1, 'Selecione um colaborador'),
  hours: z.coerce.number().min(0.5, 'Informe pelo menos 0.5h'),
  valueHour: z.coerce.number().positive('Valor/hora deve ser > 0'),
});

interface MaoObraFormProps {
  rnc: string; // ID da RNC
  onClose: () => void;
}

export function MaoObraForm({ rnc, onClose }: MaoObraFormProps) {
  const queryClient = useQueryClient();

  // Buscar colaboradores
  const { data: colaboradores = [] } = useQuery<Colaborador[]>({
    queryKey: ['colaboradores'],
    queryFn: ColaboradorService.getAllColaboradores,
  });

  // Buscar workforce já cadastrada na RNC
  const { data: rncComWorkforce } = useQuery({
    queryKey: ['rnc-com-workforce', rnc],
    queryFn: () => RncService.getRncWithWorkforce(rnc),
  });

  // Formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      colaboradorId: '',
      hours: 1,
      valueHour: 0,
    },
  });

  // Cálculo total em tempo real
  const watch = form.watch();
  const colaboradorSelecionado = colaboradores.find(
    (c) => c.id.toString() === watch.colaboradorId
  );
  const total = watch.hours * watch.valueHour;

  // Submit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const colab = colaboradores.find(
      (c) => c.id.toString() === values.colaboradorId
    );
    if (!colab) return;

    const newWorker: CreateWorkforce = {
      colaboradorId: colab.id,
      name: colab.name,
      hours: values.hours,
      valueHour: values.valueHour,
      total,
      rnc,
    };

    try {
      await RncService.workforce(newWorker);
      await queryClient.invalidateQueries({
        queryKey: ['rnc-com-workforce', rnc],
      });
      form.reset();
      toast({
        title: 'Mão de obra adicionada',
        description: 'Registro salvo com sucesso.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Verifique a conexão e tente novamente.',
      });
      console.error(err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Colaborador */}
        <FormField
          control={form.control}
          name="colaboradorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colaborador</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o colaborador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colaboradores.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Horas */}
        <FormField
          control={form.control}
          name="hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horas trabalhadas</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Valor por hora */}
        <FormField
          control={form.control}
          name="valueHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor por hora (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total dinâmico */}
        {(watch.valueHour > 0 || watch.hours > 0) && (
          <div className="text-sm text-gray-600">
            Total calculado:&nbsp;
            <strong>R$ {total.toFixed(2)}</strong>
          </div>
        )}

        {/* Botões */}
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button type="submit" className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
            Adicionar
          </Button>
        </div>

        {/* Lista de registros já salvos */}
        {rncComWorkforce?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Mãos de obra já cadastradas:</h3>
            <ul className="space-y-2">
              {rncComWorkforce.map((w: any) => (
                <li
                  key={w.id}
                  className="p-2 bg-gray-100 rounded flex items-center justify-between"
                >
                  <span>
                    {w.name} – {Number(w.hours).toFixed(2)}h × R${' '}
                    {Number(w.valueHour).toFixed(2)} ={' '}
                    <strong>R$ {Number(w.total).toFixed(2)}</strong>
                  </span>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await RncService.deleteWorkforce(w.id);
                        await queryClient.invalidateQueries({
                          queryKey: ['rnc-com-workforce', rnc],
                        });
                        toast({
                          title: 'Excluído com sucesso',
                          description: `${w.name} foi removido da RNC.`,
                        });
                      } catch (error) {
                        toast({
                          variant: 'destructive',
                          title: 'Erro ao excluir',
                          description:
                            'Tente novamente ou verifique sua conexão.',
                        });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </Form>
  );
}
