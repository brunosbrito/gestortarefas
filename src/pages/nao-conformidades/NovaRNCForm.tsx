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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { NonConformity } from '@/interfaces/RncInterface';

const formSchema = z.object({
  project: z.string().min(1, 'Projeto é obrigatório'),
  responsibleRnc: z.string().min(1, 'Responsável pela RNC é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  serviceOrder: z.string().min(1, 'Ordem de serviço é obrigatória'),
  responsibleIdentification: z
    .string()
    .min(1, 'Responsável pela identificação é obrigatório'),
  dateOccurrence: z.string().min(1, 'Data da ocorrência é obrigatória'),
});

interface NovaRNCFormProps {
  onNext: (data: z.infer<typeof formSchema>) => void;
  initialData?: NonConformity | null;
}

export function NovaRNCForm({ onNext, initialData }: NovaRNCFormProps) {
  const [projetos, setProjetos] = useState<Obra[]>([]);
  const [os, setOs] = useState<ServiceOrder[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          project: initialData.project?.id.toString() || '',
          responsibleRnc: initialData.responsibleRNC?.id.toString() || '',
          description: initialData.description || '',
          serviceOrder: initialData.serviceOrder?.id.toString() || '',
          responsibleIdentification:
            typeof initialData.responsibleIdentification === 'object'
              ? initialData.responsibleIdentification.id.toString()
              : initialData.responsibleIdentification || '',
          dateOccurrence:
            initialData.dateOccurrence?.split('T')[0] ||
            new Date().toISOString().split('T')[0],
        }
      : {
          project: '',
          responsibleRnc: '',
          description: '',
          serviceOrder: '',
          responsibleIdentification: '',
          dateOccurrence: new Date().toISOString().split('T')[0],
        },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projetosRes, colaboradoresRes] = await Promise.all([
          ObrasService.getAllObras(),
          ColaboradorService.getAllColaboradores(),
        ]);
        setProjetos(projetosRes);
        setColaboradores(colaboradoresRes);

        if (initialData?.project?.id) {
          const ordemServico = await getServiceOrderByProjectId(
            initialData.project.id.toString()
          );
          setOs(ordemServico);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    loadData();
  }, [initialData]);

  const handleProjectChange = async (projectId: string) => {
    try {
      const ordemServico = await getServiceOrderByProjectId(projectId);
      setOs(ordemServico);
    } catch (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="project"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projeto</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleProjectChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o projeto" />
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
            name="serviceOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordem de Serviço</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a OS" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {os.length > 0 ? (
                      os.map((o) => (
                        <SelectItem key={o.id} value={o.id.toString()}>
                          {o.serviceOrderNumber} - {o.description}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="sem_os">
                        Sem ordens de serviço disponíveis
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="responsibleRnc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável pela RNC</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colaboradores.length > 0 ? (
                      colaboradores.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="sem_colaborador">
                        Sem colaboradores disponíveis
                      </SelectItem>
                    )}
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
                <FormLabel>Identificado por</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione quem identificou" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colaboradores.length > 0 ? (
                      colaboradores.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="sem_identificador">
                        Sem colaboradores disponíveis
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          {initialData ? 'Salvar Alterações' : 'Criar RNC'}
        </Button>
      </form>
    </Form>
  );
}
