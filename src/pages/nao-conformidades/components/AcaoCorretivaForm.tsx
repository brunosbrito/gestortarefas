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
import { Textarea } from '@/components/ui/textarea';
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
import { useQuery } from '@tanstack/react-query';
import ColaboradorService from '@/services/ColaboradorService';
import NonConformityService from '@/services/NonConformityService';
import { NonConformity } from '@/interfaces/RncInterface';
import { useToast } from '@/hooks/use-toast';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  correctiveAction: z.string().min(1, 'Ação corretiva é obrigatória'),
  responsibleAction: z.string().min(1, 'Responsável é obrigatório'),
  dateConclusion: z.string().min(1, 'Data de conclusão é obrigatória'),
});

interface AcaoCorretivaFormProps {
  rnc: NonConformity;
  onClose: () => void;
  onUpdate?: () => void;
}

export function AcaoCorretivaForm({
  rnc,
  onClose,
  onUpdate,
}: AcaoCorretivaFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: async () => {
      const response = await ColaboradorService.getAllColaboradores();
      return response as Colaborador[];
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      correctiveAction: rnc.correctiveAction || '',
      responsibleAction: rnc.responsibleAction?.id?.toString() || '',
      dateConclusion: rnc.dateConclusion
        ? new Date(rnc.dateConclusion).toISOString().split('T')[0]
        : '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Encontrar o colaborador selecionado
      const selectedColaborador = colaboradores.find(
        (col) => col.id.toString() === values.responsibleAction
      );

      await NonConformityService.update(rnc.id, {
        correctiveAction: values.correctiveAction,
        responsibleAction: selectedColaborador,
        dateConclusion: values.dateConclusion,
      });

      toast({
        title: 'Ação corretiva atualizada',
        description: 'A ação corretiva foi salva com sucesso.',
      });

      onUpdate?.();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao salvar ação corretiva.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 md:space-y-8">
        <FormField
          control={form.control}
          name="correctiveAction"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Ação Corretiva <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a ação corretiva..."
                  {...field}
                  className={cn(
                    form.formState.errors.correctiveAction && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.correctiveAction && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.correctiveAction.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsibleAction"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Responsável pela Ação <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={cn(
                    form.formState.errors.responsibleAction && "border-destructive bg-destructive/5"
                  )}>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colaboradores.map((colaborador) => (
                    <SelectItem
                      key={colaborador.id}
                      value={colaborador.id.toString()}
                    >
                      {colaborador.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.responsibleAction && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.responsibleAction.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateConclusion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Data de Conclusão <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className={cn(
                    form.formState.errors.dateConclusion && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.dateConclusion && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.dateConclusion.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11"
          >
            Cancelar
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
                <span>Salvando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Salvar</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
