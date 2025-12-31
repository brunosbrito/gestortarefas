
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import ColaboradorService from '@/services/ColaboradorService';
import {
  ColaboradorFormFields,
  colaboradorFormSchema,
  ColaboradorFormValues,
} from './ColaboradorFormFields';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NovoColaboradorFormProps {
  onSuccess?: () => void;
}

export const NovoColaboradorForm = ({
  onSuccess,
}: NovoColaboradorFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ColaboradorFormValues>({
    resolver: zodResolver(colaboradorFormSchema),
    defaultValues: {
      name: "",
      role: "",
      sector: undefined
    }
  });

  const onSubmit = async (data: ColaboradorFormValues) => {
    setIsSubmitting(true);
    try {
      await ColaboradorService.createColaborador({
        name: data.name,
        role: data.role,
        sector: data.sector
      });

      toast({
        title: 'Colaborador adicionado',
        description: 'O colaborador foi adicionado com sucesso.',
      });
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar colaborador',
        description: 'Ocorreu um erro ao adicionar o colaborador.',
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
                <span>Adicionando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Adicionar Colaborador</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
