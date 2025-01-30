import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import RNCService from '@/services/RNCService';
import ObrasService from '@/services/ObrasService';
import { ServiceOrderService } from '@/services/ServiceOrderService';
import { Obra } from '@/interfaces/ObrasInterface';

const rncFormSchema = z.object({
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  responsibleIdentification: z.string().min(2, 'Identificação deve ter pelo menos 2 caracteres'),
  dateOccurrence: z.string().min(1, 'Data é obrigatória'),
  projectId: z.string().min(1, 'Projeto é obrigatório'),
  serviceOrderId: z.string().min(1, 'Ordem de Serviço é obrigatória'),
});

type RNCFormValues = z.infer<typeof rncFormSchema>;

export function RNCForm() {
  const { toast } = useToast();

  const form = useForm<RNCFormValues>({
    resolver: zodResolver(rncFormSchema),
    defaultValues: {
      description: '',
      responsibleIdentification: '',
      dateOccurrence: format(new Date(), 'yyyy-MM-dd'),
      projectId: '',
      serviceOrderId: '',
    },
  });

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Obra[]>({
    queryKey: ['projects'],
    queryFn: ObrasService.getAllObras,
  });

  const { data: serviceOrders = [], isLoading: isLoadingServiceOrders } = useQuery({
    queryKey: ['serviceOrders', form.watch('projectId')],
    queryFn: () => ServiceOrderService.getAllServiceOrders(form.watch('projectId')),
    enabled: !!form.watch('projectId'),
  });

  const onSubmit = async (data: RNCFormValues) => {
    try {
      const rncData = {
        description: data.description,
        responsibleIdentification: data.responsibleIdentification,
        dateOccurrence: data.dateOccurrence,
        projectId: Number(data.projectId),
        serviceOrderId: data.serviceOrderId,
        responsibleRNCId: 1, // Temporário, deve vir do usuário logado
      };

      await RNCService.createRNC(rncData);

      toast({
        title: 'RNC criado com sucesso!',
        variant: 'default',
      });

      form.reset();
    } catch (error) {
      toast({
        title: 'Erro ao criar RNC',
        description: 'Ocorreu um erro ao tentar criar o RNC. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da Não Conformidade</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a não conformidade identificada"
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
              <FormLabel>Projeto (Obra/Fábrica)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o projeto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingProjects ? (
                    <SelectItem value="">Carregando...</SelectItem>
                  ) : (
                    projects?.map((project) => (
                      <SelectItem key={project.id} value={String(project.id)}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a OS" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingServiceOrders ? (
                    <SelectItem value="">Carregando...</SelectItem>
                  ) : (
                    serviceOrders?.map((os) => (
                      <SelectItem key={os.id} value={os.id}>
                        {os.description}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-[#FFA500] hover:bg-[#FF7F0E]">
          Registrar RNC
        </Button>
      </form>
    </Form>
  );
}