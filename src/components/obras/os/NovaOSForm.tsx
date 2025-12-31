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
import { formSchema, FormValues } from './osFormSchema';
import { OSFormFields } from './OSFormFields';
import { useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function getUserIdFromLocalStorage(): number | null {
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId) : null;
}

export const NovaOSForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const { projectId } = useParams();
  const [obras, setObras] = useState<Obra[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'em_andamento',
      description: '',
      projectId: Number(projectId),
      startDate: '',
      notes: '',
      assignedUser: 0,
      projectNumber: '',
      quantity: 0,
      weight: '',
      progress: 0,
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
    setIsSubmitting(true);
    const userId = getUserIdFromLocalStorage();

    const serviceOrderData: CreateServiceOrder = {
      description: data.description,
      projectId: data.projectId,
      startDate: data.startDate,
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

      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar Ordem de Serviço',
        description: 'Não foi possível criar a ordem de serviço.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 md:space-y-8">
        <OSFormFields form={form} obras={obras} />

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
                <span>Criando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Criar Ordem de Serviço</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};