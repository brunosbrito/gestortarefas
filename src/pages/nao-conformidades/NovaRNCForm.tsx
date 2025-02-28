
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
  projectId: z.string().min(1, 'Projeto é obrigatório'),
  responsibleRncId: z.string().min(1, 'Responsável pela RNC é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  serviceOrderId: z.string().min(1, 'Ordem de serviço é obrigatória'),
  responsibleIdentification: z.string().min(1, 'Responsável pela identificação é obrigatório'),
  dateOccurrence: z.string().min(1, 'Data da ocorrência é obrigatória'),
  contractNumber: z.string().min(1, 'Número do contrato é obrigatório'),
  contractDuration: z.number().min(1, 'Duração do contrato é obrigatória'),
  elapsedTime: z.number().min(0, 'Tempo decorrido deve ser maior ou igual a zero'),
  remainingTime: z.number().min(0, 'Tempo restante deve ser maior ou igual a zero'),
  location: z.string().min(1, 'Local é obrigatório'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  workSchedule: z.object({
    entryExit: z.string().min(1, 'Horário de entrada/saída é obrigatório'),
    interval: z.string().min(1, 'Intervalo é obrigatório'),
  }),
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
    defaultValues: initialData ? {
      projectId: initialData.project?.id.toString() || '',
      responsibleRncId: initialData.responsibleRNC?.id.toString() || '',
      description: initialData.description || '',
      serviceOrderId: initialData.serviceOrder?.id.toString() || '',
      responsibleIdentification: initialData.responsibleIdentification || '',
      dateOccurrence: initialData.dateOccurrence?.split('T')[0] || new Date().toISOString().split('T')[0],
      contractNumber: initialData.contractNumber || '',
      contractDuration: initialData.contractDuration || 0,
      elapsedTime: initialData.elapsedTime || 0,
      remainingTime: initialData.remainingTime || 0,
      location: initialData.location || '',
      clientName: initialData.clientName || '',
      workSchedule: {
        entryExit: initialData.workSchedule?.entryExit || '',
        interval: initialData.workSchedule?.interval || '',
      },
    } : {
      projectId: '',
      responsibleRncId: '',
      description: '',
      serviceOrderId: '',
      responsibleIdentification: '',
      dateOccurrence: new Date().toISOString().split('T')[0],
      contractNumber: '',
      contractDuration: 0,
      elapsedTime: 0,
      remainingTime: 0,
      location: '',
      clientName: '',
      workSchedule: {
        entryExit: '',
        interval: '',
      },
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
        setColaboradores(colaboradoresRes.data);

        if (initialData?.project?.id) {
          const ordemServico = await getServiceOrderByProjectId(initialData.project.id.toString());
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
            name="projectId"
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
                    {os.map((o) => (
                      <SelectItem key={o.id} value={o.id.toString()}>
                        {o.serviceOrderNumber} - {o.description}
                      </SelectItem>
                    ))}
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
                <FormLabel>Identificado por</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione quem identificou" />
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            name="contractNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Contrato</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 101-221" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="contractDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo Contratual (dias)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="elapsedTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo Decorrido (dias)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remainingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo a Vencer (dias)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local</FormLabel>
                <FormControl>
                  <Input placeholder="Local da ocorrência" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="workSchedule.entryExit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Entrada/Saída</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 07:30 - 17:30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workSchedule.interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intervalo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 01:00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
