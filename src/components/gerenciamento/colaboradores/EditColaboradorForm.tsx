
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import ColaboradorService from '@/services/ColaboradorService';
import {
  ColaboradorFormFields,
  colaboradorFormSchema,
  ColaboradorFormValues,
} from './ColaboradorFormFields';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditColaboradorFormProps {
  colaborador: Colaborador;
  onSuccess: () => void;
}

export const EditColaboradorForm = ({
  colaborador,
  onSuccess,
}: EditColaboradorFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ColaboradorFormValues>({
    resolver: zodResolver(colaboradorFormSchema),
    defaultValues: {
      name: colaborador.name,
      role: colaborador.role,
      sector: colaborador.sector,
    },
  });

  useEffect(() => {
    form.reset({
      name: colaborador.name,
      role: colaborador.role,
      sector: colaborador.sector
    });
  }, [colaborador, form]);

  const onSubmit = async (data: ColaboradorFormValues) => {
    setIsSubmitting(true);
    try {
      await ColaboradorService.updateColaborador(
        colaborador.id,
        {
          name: data.name,
          role: data.role,
          sector: data.sector,
        }
      );
      toast({
        title: 'Colaborador atualizado',
        description:
          'As informações do colaborador foram atualizadas com sucesso.',
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar colaborador',
        description:
          'Ocorreu um erro ao atualizar as informações do colaborador.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        <ColaboradorFormFields form={form} />

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full h-11 font-semibold shadow-lg transition-all bg-primary hover:bg-primary/90",
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
                <span>Atualizar Colaborador</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
