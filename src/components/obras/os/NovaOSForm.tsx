import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Obra } from '@/interfaces/ObrasInterface';
import ObrasService from '@/services/ObrasService';
import { useToast } from '@/hooks/use-toast';
import { createServiceOrder } from '@/services/ServiceOrderService';
import { CreateServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { formSchema, FormValues, NovaOSFormProps } from './osFormSchema';
import { OSFormFields } from './OSFormFields';

function getUserIdFromLocalStorage(): number | null {
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId) : null;
}

export const NovaOSForm = ({ onSubmit, initialData }: NovaOSFormProps) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: initialData?.status || 'em_andamento',
      description: initialData?.description || '',
      projectId: initialData?.projectId?.id || undefined,
      createdAt: initialData?.createdAt || '',
      notes: initialData?.notes || '',
      assignedUser: initialData?.assignedUser?.id || undefined,
      projectNumber: initialData?.projectNumber || undefined,
      quantity: initialData?.quantity || 0,
      weight: initialData?.weight || undefined,
    },
  });

  useEffect(() => {
    const fetchObras = async () => {
      try {
        const obrasData = await ObrasService.getAllObras();
        setObras(obrasData || []);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar obras',
          description: 'Não foi possível carregar a lista de obras.',
        });
      }
    };

    fetchObras();
  }, [toast]);

  const handleSubmit = async (data: FormValues) => {
    const userId = getUserIdFromLocalStorage();

    const serviceOrderData: CreateServiceOrder = {
      description: data.description,
      projectId: data.projectId,
      createdAt: data.createdAt,
      status: data.status,
      notes: data.notes,
      assignedUser: userId || undefined,
      projectNumber: data.projectNumber,
      quantity: data.quantity,
      weight: data.weight,
    };

    try {
      await createServiceOrder(serviceOrderData);

      toast({
        variant: 'default',
        title: 'Ordem de Serviço criada',
        description: 'A nova ordem de serviço foi criada com sucesso.',
      });

      onSubmit(serviceOrderData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar Ordem de Serviço',
        description: 'Não foi possível criar a ordem de serviço.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <OSFormFields form={form} obras={obras} />
        <Button type="submit" className="w-full">
          {initialData ? 'Atualizar OS' : 'Criar OS'}
        </Button>
      </form>
    </Form>
  );
};
