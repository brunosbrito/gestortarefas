
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Obra } from '@/interfaces/ObrasInterface';
import ObrasService from '@/services/ObrasService';
import { useToast } from '@/hooks/use-toast';
import { updateServiceOrder } from '@/services/ServiceOrderService';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { formSchema, FormValues } from './osFormSchema';
import { OSFormFields } from './OSFormFields';

interface EditarOSFormProps {
  os: ServiceOrder;
  onSuccess: () => void;
}

export const EditarOSForm = ({ os, onSuccess }: EditarOSFormProps) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('OS recebida:', os);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: os.status,
      description: os.description,
      projectId: os.projectId.id,
      startDate: os.startDate,
      notes: os.notes || '',
      assignedUser: os.assignedUser?.id,
      projectNumber: os.projectNumber,
      quantity: os.quantity,
      weight: os.weight,
      progress: os.progress,
    },
  });

  useEffect(() => {
    const fetchObras = async () => {
      try {
        const obrasData = await ObrasService.getAllObras();
        setObras(obrasData || []);
      } catch (error) {
        console.error('Erro ao carregar obras:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar obras',
          description: 'Não foi possível carregar a lista de obras.',
        });
      }
    };

    fetchObras();
  }, [toast]);

  const onSubmit = async (data: FormValues) => {
    console.log('Iniciando submit com dados:', data);
    setIsSubmitting(true);

    try {
      console.log('Tentando atualizar OS com ID:', os.id);
      
      const updatedData = {
        description: data.description,
        projectId: data.projectId,
        startDate: data.startDate,
        status: data.status,
        notes: data.notes,
        assignedUser: data.assignedUser,
        projectNumber: data.projectNumber,
        quantity: data.quantity,
        weight: data.weight,
        progress: data.progress,
      };

      console.log('Dados formatados para envio:', updatedData);

      await updateServiceOrder(os.id, updatedData);

      toast({
        variant: 'default',
        title: 'Ordem de Serviço atualizada',
        description: 'A OS foi atualizada com sucesso.',
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar OS:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar Ordem de Serviço',
        description: 'Não foi possível atualizar a ordem de serviço.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <OSFormFields form={form} obras={obras} />
        <Button
          type="submit"
          className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Atualizando...' : 'Atualizar OS'}
        </Button>
      </form>
    </Form>
  );
};
