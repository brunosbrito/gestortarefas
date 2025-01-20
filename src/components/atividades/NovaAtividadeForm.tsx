import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useToast } from '@/hooks/use-toast';
import { createActivity } from '@/services/ActivityService';
import { FileUploadField } from './FileUploadField';
import { Badge } from '../ui/badge';
import TarefaMacroService from '@/services/TarefaMacroService';
import ProcessService from '@/services/ProcessService';
import ColaboradorService from '@/services/ColaboradorService';
import { Activity } from '@/interfaces/AtividadeInterface';

const formSchema = z.object({
  macroTask: z.string().min(1, 'Tarefa macro é obrigatória'),
  process: z.string().min(1, 'Processo é obrigatório'),
  description: z.string().min(1, 'Atividade é obrigatória'),
  quantity: z.number().min(1, 'Unidade é obrigatória'),
  timePerUnit: z.number().min(1, 'Tempo por unidade é obrigatório'),
  unidadeTempo: z.enum(['minutos', 'horas']),
  collaborators: z
    .array(z.number())
    .min(1, 'Selecione pelo menos um colaborador'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  observation: z.string().optional(),
  imageUrl: z.any().optional(),
  imageDescription: z.string().optional(),
  fileUrl: z.any().optional(),
  fileDescription: z.string().optional(),
  estimatedTime: z.string().optional(),
  projectId: z.number(),
  orderServiceId: z.number(),
  createdBy: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface NovaAtividadeFormProps {
  editMode?: boolean;
  atividadeInicial?: Activity;
  projectId: number;
  orderServiceId: number;
  onSuccess?: () => void;
}

export function NovaAtividadeForm({
  editMode = false,
  atividadeInicial,
  projectId,
  orderServiceId,
  onSuccess,
}: NovaAtividadeFormProps) {
  const { toast } = useToast();
  const [tempoPrevisto, setTempoPrevisto] = useState<string>('');
  const [showHorasColaboradores, setShowHorasColaboradores] = useState(false);
  const [tarefasMacro, setTarefasMacro] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);

  const defaultValues: FormValues = {
    macroTask: atividadeInicial?.macroTask || '',
    process: atividadeInicial?.process || '',
    description: atividadeInicial?.description || '',
    quantity: atividadeInicial?.quantity || 0,
    timePerUnit: atividadeInicial?.timePerUnit || 0,
    unidadeTempo: 'minutos',
    collaborators: atividadeInicial?.collaborators || [],
    startDate: atividadeInicial?.startDate || '',
    observation: atividadeInicial?.observation || '',
    imageUrl: atividadeInicial?.imageUrl || null,
    imageDescription: atividadeInicial?.imageDescription || '',
    fileUrl: atividadeInicial?.fileUrl || null,
    fileDescription: atividadeInicial?.fileDescription || '',
    estimatedTime: atividadeInicial?.estimatedTime || '',
    projectId: projectId,
    orderServiceId: orderServiceId,
    createdBy: Number(localStorage.getItem('userId')) || 0,
  };

  const getTarefasMacro = async () => {
    try {
      const tarefasMacro = await TarefaMacroService.getAll();
      setTarefasMacro(tarefasMacro.data);
    } catch (error) {
      console.error('Error fetching tarefas macro', error);
    }
  };

  const getProcessos = async () => {
    try {
      const processos = await ProcessService.getAll();
      setProcessos(processos.data);
    } catch (error) {
      console.error('Error fetching processos', error);
    }
  };

  const getColaboradores = async () => {
    try {
      const colaboradores = await ColaboradorService.getAllColaboradores();
      setColaboradores(colaboradores.data);
      console.log(colaboradores.data);
    } catch (error) {
      console.error('Error fetching colaboradores', error);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const calcularTempoPrevisto = (
    unidade: number,
    tempoPorUnidade: number,
    unidadeTempo: 'minutos' | 'horas'
  ) => {
    const tempoTotal = unidade * tempoPorUnidade;
    if (unidadeTempo === 'minutos') {
      const horas = Math.floor(tempoTotal / 60);
      const minutos = tempoTotal % 60;
      return `${horas}h${minutos}min`;
    }
    return `${tempoTotal}h`;
  };

  const handleCalculoTempo = () => {
    const unidade = form.watch('quantity');
    const tempoPorUnidade = form.watch('timePerUnit');
    const unidadeTempo = form.watch('unidadeTempo');

    if (unidade && tempoPorUnidade && unidadeTempo) {
      const tempo = calcularTempoPrevisto(
        unidade,
        tempoPorUnidade,
        unidadeTempo
      );
      setTempoPrevisto(tempo);
    }
  };

  const handleTarefaMacroChange = (value: string) => {
    if (editMode) {
      setShowHorasColaboradores(true);
    }
    form.setValue('macroTask', value);
  };

  const handleProcessoChange = (value: string) => {
    if (editMode) {
      setShowHorasColaboradores(true);
    }
    form.setValue('process', value);
  };

  const onSubmit = async (data: FormValues) => {
    const dataD = {
      ...data,
      estimatedTime: tempoPrevisto,
      projectId: projectId,
      orderServiceId: orderServiceId,
    };

    try {
      await createActivity(dataD);
      toast({
        title: 'Atividade criada',
        description: 'A atividade foi criada com sucesso.',
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar atividade',
        description:
          'Ocorreu um erro ao criar a atividade. Tente novamente mais tarde.',
      });
    }
  };

  useEffect(() => {
    getTarefasMacro();
    getProcessos();
    getColaboradores();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="macroTask"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarefa Macro</FormLabel>
              <Select
                onValueChange={handleTarefaMacroChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a tarefa macro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tarefasMacro.map((tarefa) => (
                    <SelectItem key={tarefa.id} value={tarefa.name}>
                      {tarefa.name}
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
          name="process"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processo</FormLabel>
              <Select
                onValueChange={handleProcessoChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o processo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {processos.map((processo) => (
                    <SelectItem key={processo.id} value={processo.name}>
                      {processo.name}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Atividade</FormLabel>
              <FormControl>
                <Input placeholder="Digite a atividade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade/Peça</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                      handleCalculoTempo();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="timePerUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo por Unidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        handleCalculoTempo();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unidadeTempo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <Select
                    onValueChange={(value: 'minutos' | 'horas') => {
                      field.onChange(value);
                      handleCalculoTempo();
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="minutos">Minutos</SelectItem>
                      <SelectItem value="horas">Horas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-gray-100 p-2 rounded">
          <p className="text-sm font-medium">Tempo Previsto: {tempoPrevisto}</p>
        </div>

        <FormField
          control={form.control}
          name="collaborators"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipe</FormLabel>
              <Select
                onValueChange={(value) => {
                  const numericValue = Number(value); // Converter o valor para número
                  const currentValues = field.value || [];
                  if (!currentValues.includes(numericValue)) {
                    field.onChange([...currentValues, numericValue]);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue>
                      {field.value?.length
                        ? field.value
                            .map((id: number) => {
                              const colaborador = colaboradores.find(
                                (col) => col.id === id
                              );
                              return colaborador?.name || '';
                            })
                            .join(', ')
                        : 'Selecione os colaboradores'}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colaboradores.map((colaborador) => (
                    <SelectItem
                      key={colaborador.id}
                      value={String(colaborador.id)}
                    >
                      {colaborador.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value?.map((colaboradorId: number) => {
                  const colaborador = colaboradores.find(
                    (col) => col.id === colaboradorId
                  );
                  return (
                    <Badge
                      key={colaboradorId}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => {
                        const newEquipe = field.value.filter(
                          (id: number) => id !== colaboradorId
                        );
                        field.onChange(newEquipe);
                      }}
                    >
                      {colaborador?.name}
                    </Badge>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Início</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite uma observação (opcional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FileUploadField 
            form={form} 
            fileType="imagem" 
            accept="image/*" 
            activityId={atividadeInicial?.id}
          />
          <FileUploadField 
            form={form} 
            fileType="arquivo"
            activityId={atividadeInicial?.id}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
        >
          {editMode ? 'Salvar Alterações' : 'Criar Atividade'}
        </Button>
      </form>
    </Form>
  );
}
