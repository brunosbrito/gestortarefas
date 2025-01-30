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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import RNCService from '@/services/RNCService';
import { Textarea } from '../ui/textarea';
import { useQuery } from '@tanstack/react-query';
import ProjectService from '@/services/ObrasService';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { getAllServiceOrders } from '@/services/ServiceOrderService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const rncFormSchema = z.object({
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  responsibleIdentification: z.string().min(2, 'Identificação deve ter pelo menos 2 caracteres'),
  dateOccurrence: z.string(),
  projectId: z.string(),
  serviceOrderId: z.string(),
});

type RNCFormValues = z.infer<typeof rncFormSchema>;

export const RNCForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { toast } = useToast();
  const form = useForm<RNCFormValues>({
    resolver: zodResolver(rncFormSchema),
    defaultValues: {
      description: '',
      responsibleIdentification: '',
      dateOccurrence: new Date().toISOString().split('T')[0],
      projectId: '',
      serviceOrderId: '',
    },
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: ProjectService.getAllObras,
  });

  const { data: serviceOrders, isLoading: isLoadingServiceOrders } = useQuery({
    queryKey: ['serviceOrders', form.watch('projectId')],
    queryFn: () => getAllServiceOrders(Number(form.watch('projectId'))),
    enabled: !!form.watch('projectId'),
  });

  const onSubmit = async (data: RNCFormValues) => {
    try {
      await RNCService.createRNC({
        description: data.description,
        responsibleIdentification: data.responsibleIdentification,
        dateOccurrence: data.dateOccurrence,
        projectId: Number(data.projectId),
        serviceOrderId: data.serviceOrderId,
        responsibleRNCId: 1, // Temporário, deve vir do usuário logado
      });

      toast({
        title: 'RNC criado com sucesso!',
        description: 'O registro de não conformidade foi criado.',
      });

      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar RNC',
        description: 'Ocorreu um erro ao criar o registro. Tente novamente.',
      });
    }
  };

  if (isLoadingProjects) {
    return <div>Carregando...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da Não Conformidade</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva detalhadamente a não conformidade identificada"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsibleIdentification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável pela Identificação</FormLabel>
              <FormControl>
                <Input placeholder="Nome do responsável" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOccurrence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data da Ocorrência</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projeto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o projeto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name} ({project.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceOrderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem de Serviço</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a OS" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {serviceOrders?.map((so: ServiceOrder) => (
                    <SelectItem key={so.id} value={so.id}>
                      {so.serviceOrderNumber} - {so.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Registrar RNC
        </Button>
      </form>
    </Form>
  );
};