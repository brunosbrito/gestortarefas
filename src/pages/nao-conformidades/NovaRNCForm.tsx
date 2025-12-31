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
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onNext(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="project"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Projeto <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleProjectChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={cn(
                      form.formState.errors.project && "border-destructive bg-destructive/5"
                    )}>
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
                {form.formState.errors.project && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.project.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Ordem de Serviço <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={cn(
                      form.formState.errors.serviceOrder && "border-destructive bg-destructive/5"
                    )}>
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
                {form.formState.errors.serviceOrder && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.serviceOrder.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="responsibleRnc"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Responsável pela RNC <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={cn(
                      form.formState.errors.responsibleRnc && "border-destructive bg-destructive/5"
                    )}>
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
                {form.formState.errors.responsibleRnc && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.responsibleRnc.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsibleIdentification"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Identificado por <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={cn(
                      form.formState.errors.responsibleIdentification && "border-destructive bg-destructive/5"
                    )}>
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
                {form.formState.errors.responsibleIdentification && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.responsibleIdentification.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dateOccurrence"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Data da Ocorrência <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className={cn(
                    form.formState.errors.dateOccurrence && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.dateOccurrence && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.dateOccurrence.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Descrição <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a não conformidade"
                  className={cn(
                    "min-h-[100px]",
                    form.formState.errors.description && "border-destructive bg-destructive/5"
                  )}
                  {...field}
                />
              </FormControl>
              {form.formState.errors.description && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.description.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

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
                <span>{initialData ? 'Salvando...' : 'Criando...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{initialData ? 'Salvar Alterações' : 'Criar RNC'}</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
