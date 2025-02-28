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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { Obra } from '@/interfaces/ObrasInterface';
import ObrasService from '@/services/ObrasService';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { getServiceOrderByProjectId } from '@/services/ServiceOrderService';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import ColaboradorService from '@/services/ColaboradorService';
import RncService from '@/services/NonConformityService';

const formSchema = z.object({
  projectId: z.string().min(1, 'Projeto é obrigatório'),
  responsibleRncId: z.string().min(1, 'Responsável pela rnc é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  serviceOrderId: z.string().min(1, 'Obra/Fabrica é obrigatória'),
  responsibleIdentification: z.string().min(1, 'Responsável pela identificacao é obrigatório'),
  dateOccurrence: z.string().min(1, 'Data da ocorrência é obrigatória'),
});

interface NovaRNCFormProps {
  onSuccess?: () => void;
}

export function NovaRNCForm({ onSuccess }: NovaRNCFormProps) {
  const { toast } = useToast();
  const [projetos, setProjetos] = useState<Obra[]>([]);
  const [os, setOs] = useState<ServiceOrder[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: '',
      responsibleRncId: '',
      description: '',
      serviceOrderId: '',
      responsibleIdentification: '',
      dateOccurrence: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await RncService.createRnc(values);

      toast({
        title: 'RNC criada com sucesso',
        description: 'O registro de não conformidade foi criado.',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar RNC',
        description: 'Ocorreu um erro ao criar o registro. Tente novamente.',
      });
    }
  };

  const getProjetos = async () => {
    try {
      const projetos = await ObrasService.getAllObras();
      setProjetos(projetos);
    } catch (error) {
      console.log(error);
    }
  };

  const getOsByProject = async (projectId: string) => {
    try {
      const ordemServico = await getServiceOrderByProjectId(projectId);
      setOs(ordemServico);
    } catch (error) {
      console.log(error);
    }
  };

  const getColaboradores = async () => {
    try {
      const response = await ColaboradorService.getAllColaboradores();
      setColaboradores(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProjetos();
    getColaboradores();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  getOsByProject(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projetos.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
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
              <FormLabel>Ordem de Serviço (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a OS" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {os.map((x) => (
                    <SelectItem key={x.id} value={x.id.toString()}>
                      {x.serviceOrderNumber} - {x.description}
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
          name="responsibleRncId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável pela RNC</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colaboradores.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
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
          name="responsibleIdentification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável Identificação RNC</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colaboradores.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a não conformidade"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
        >
          Criar RNC
        </Button>
      </form>
    </Form>
  );
}
