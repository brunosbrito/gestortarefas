
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

  console.log('Form values:', form.getValues());

  useEffect(() => {
    const fetchObras = async () => {
      try {
        const obrasData = await ObrasService.getAllObras();
        setObras(obrasData || []);
        console.log('Obras carregadas:', obrasData);
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

  const onSubmit = async (values: FormValues) => {
    console.log('Form handleSubmit chamado com valores:', values);
    setIsSubmitting(true);

    try {
      console.log('Tentando atualizar OS com ID:', os.id);
      
      const updatedData = {
        description: values.description,
        projectId: values.projectId,
        startDate: values.startDate,
        status: values.status,
        notes: values.notes,
        assignedUser: values.assignedUser,
        projectNumber: values.projectNumber,
        quantity: values.quantity,
        weight: values.weight,
        progress: values.progress,
      };

      console.log('Dados formatados para envio:', updatedData);

      const response = await updateServiceOrder(os.id, updatedData);
      console.log('Resposta da atualização:', response);

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

  console.log('Form está sendo renderizado');
  
  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log('Form submit iniciado');
          form.handleSubmit(onSubmit)(e);
        }} 
        className="space-y-6"
      >
        <OSFormFields form={form} obras={obras} />
        <Button
          type="submit"
          className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
          disabled={isSubmitting}
          onClick={() => console.log('Botão submit clicado')}
        >
          {isSubmitting ? 'Atualizando...' : 'Atualizar OS'}
        </Button>
      </form>
    </Form>
  );
};
