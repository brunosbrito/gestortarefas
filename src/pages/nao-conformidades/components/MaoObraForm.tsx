import { useState } from 'react';
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
import { Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        {/* Colaborador */}
        <FormField
          control={form.control}
          name="colaboradorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Colaborador <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={cn(
                    form.formState.errors.colaboradorId && "border-destructive bg-destructive/5"
                  )}>
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
              {form.formState.errors.colaboradorId && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.colaboradorId.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        {/* Horas */}
        <FormField
          control={form.control}
          name="hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Horas trabalhadas <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  {...field}
                  className={cn(
                    form.formState.errors.hours && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.hours && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.hours.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        {/* Valor por hora */}
        <FormField
          control={form.control}
          name="valueHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Valor por hora (R$) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  className={cn(
                    form.formState.errors.valueHour && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.valueHour && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.valueHour.message}
                </FormMessage>
              )}
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
        <div className="space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11"
          >
            Voltar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "h-11 font-semibold shadow-lg transition-all bg-primary hover:bg-primary/90",
              isSubmitting && "opacity-70"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adicionando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Adicionar</span>
              </div>
            )}
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
