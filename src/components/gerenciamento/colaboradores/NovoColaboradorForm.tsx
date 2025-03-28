
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

interface NovoColaboradorFormProps {
  onSuccess?: () => void;
}

export const NovoColaboradorForm = ({
  onSuccess,
}: NovoColaboradorFormProps) => {
  const { toast } = useToast();
  const form = useForm<ColaboradorFormValues>({
    resolver: zodResolver(colaboradorFormSchema),
    defaultValues: {
      name: "",
      role: "",
      pricePerHour: ""
    }
  });

  const onSubmit = async (data: ColaboradorFormValues) => {
    try {
      await ColaboradorService.createColaborador({
        name: data.name,
        role: data.role,
        pricePerHour: parseFloat(data.pricePerHour)
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
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ColaboradorFormFields form={form} />
        <Button
          type="submit"
          className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
        >
          Adicionar Colaborador
        </Button>
      </form>
    </Form>
  );
};
