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
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditarOSFormProps {
  os: ServiceOrder;
  onSuccess: () => void;
}

export const EditarOSForm = ({ os, onSuccess }: EditarOSFormProps) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: os.status,
      description: os.description,
      projectId: os.projectId.id,
      startDate: os.startDate,
      notes: os.notes,
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
    try {
      await updateServiceOrder(os.id.toString(), {
        description: data.description,
        projectId: data.projectId,
        startDate: data.startDate,
        status: data.status,
        notes: data.notes,
        assignedUser: data.assignedUser,
        projectNumber: data.projectNumber,
        quantity: data.quantity,
        weight: data.weight,
      });

      toast({
        variant: 'default',
        title: 'Ordem de Serviço atualizada',
        description: 'A OS foi atualizada com sucesso.',
      });

      onSuccess();
    } catch (error) {
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
                <span>Atualizando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Atualizar Ordem de Serviço</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};