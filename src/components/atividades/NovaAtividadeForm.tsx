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
import { createActivity, updateActivity } from '@/services/ActivityService';
import { FileUploadField } from './FileUploadField';
import { Badge } from '../ui/badge';
import TarefaMacroService from '@/services/TarefaMacroService';
import ProcessService from '@/services/ProcessService';
import ColaboradorService from '@/services/ColaboradorService';
import { Activity } from '@/interfaces/AtividadeInterface';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { Colaborador } from '@/interfaces/ColaboradorInterface';

type UnidadeTempo = 'minutos' | 'horas';

const formSchema = z.object({
  macroTask: z.string().min(1, 'Tarefa macro é obrigatória'),
  process: z.string().min(1, 'Processo é obrigatório'),
  description: z.string().min(1, 'Atividade é obrigatória'),
  quantity: z.number().min(1, 'Unidade é obrigatória'),
  timePerUnit: z.number().min(1, 'Tempo por unidade é obrigatório'),
  unidadeTempo: z.enum(['minutos', 'horas'] as const),
  collaborators: z
    .array(z.number())
    .min(1, 'Selecione pelo menos um colaborador'),
  observation: z.string().optional(),
  imagem: z.any().optional(),
  imagemDescricao: z.string().optional(),
  arquivo: z.any().optional(),
  arquivoDescricao: z.string().optional(),
  estimatedTime: z.string().optional(),
  projectId: z.number(),
  orderServiceId: z.number(),
  createdBy: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface NovaAtividadeFormProps {
  editMode?: boolean;
  atividadeInicial?: AtividadeStatus;
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

  const defaultValues: Partial<z.infer<typeof formSchema>> = {
    macroTask: atividadeInicial?.macroTask || '',
    process: atividadeInicial?.process || '',
    description: atividadeInicial?.description || '',
    quantity: atividadeInicial?.quantity || 0,
    timePerUnit: atividadeInicial?.timePerUnit || 0,
    unidadeTempo: 'minutos',
    collaborators: atividadeInicial?.collaborators?.map((c) => c.id) || [],
    observation: atividadeInicial?.observation || '',
    imagem: undefined,
    imagemDescricao: atividadeInicial?.imageDescription || '',
    arquivo: undefined,
    arquivoDescricao: atividadeInicial?.fileDescription || '',
    estimatedTime: atividadeInicial?.estimatedTime || '',
    projectId: projectId,
    orderServiceId: orderServiceId,
    createdBy: Number(localStorage.getItem('userId')) || 0,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

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

      if (editMode && atividadeInicial?.collaborators) {
        const colaboradoresIds = atividadeInicial.collaborators.map(
          (c) => c.id
        );
        form.setValue('collaborators', colaboradoresIds);
      }
    } catch (error) {
      console.error('Error fetching colaboradores', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar colaboradores',
        description: 'Ocorreu um erro ao carregar a lista de colaboradores.',
      });
    }
  };

  useEffect(() => {
    getTarefasMacro();
    getProcessos();
    getColaboradores();

    if (atividadeInicial?.estimatedTime) {
      setTempoPrevisto(atividadeInicial.estimatedTime);
    }

    if (editMode && atividadeInicial) {
      if (atividadeInicial.imageUrl) {
        form.setValue(
          'imagemDescricao',
          atividadeInicial.imageDescription || ''
        );
      }
      if (atividadeInicial.fileUrl) {
        form.setValue(
          'arquivoDescricao',
          atividadeInicial.fileDescription || ''
        );
      }
    }
  }, [atividadeInicial, editMode]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (editMode && atividadeInicial) {
        const activityData: any = {
          macroTask: data.macroTask,
          process: data.process,
          description: data.description,
          quantity: data.quantity,
          timePerUnit: data.timePerUnit,
          unidadeTempo: data.unidadeTempo,
          collaborators: data.collaborators,
          observation: data.observation,
          imagemDescricao: data.imagemDescricao,
          arquivoDescricao: data.arquivoDescricao,
          estimatedTime: data.estimatedTime,
          projectId,
          orderServiceId,
          createdBy: Number(localStorage.getItem('userId')) || 0,
        };

        if (data.imagem instanceof File) {
          activityData.imagem = data.imagem;
        }
        if (data.arquivo instanceof File) {
          activityData.arquivo = data.arquivo;
        }

        await updateActivity(atividadeInicial.id, activityData);
        toast({
          title: 'Atividade atualizada',
          description: 'A atividade foi atualizada com sucesso.',
        });

        // Chama o callback onSuccess após atualizar
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const formData = new FormData();

        // Adicionar dados básicos
        formData.append('macroTask', data.macroTask);
        formData.append('process', data.process);
        formData.append('description', data.description);
        formData.append('quantity', data.quantity.toString());
        formData.append('timePerUnit', data.timePerUnit.toString());
        formData.append('unidadeTempo', data.unidadeTempo);
        formData.append('observation', data.observation || '');
        formData.append('imagemDescricao', data.imagemDescricao || '');
        formData.append('arquivoDescricao', data.arquivoDescricao || '');
        formData.append('estimatedTime', data.estimatedTime || '');
        formData.append('projectId', projectId.toString());
        formData.append('orderServiceId', orderServiceId.toString());
        formData.append(
          'createdBy',
          (Number(localStorage.getItem('userId')) || 0).toString()
        );

        // Adicionar array de colaboradores
        data.collaborators.forEach((collaboratorId, index) => {
          formData.append(`collaborators[${index}]`, collaboratorId.toString());
        });

        // Adicionar arquivos se existirem
        if (data.imagem instanceof File) {
          formData.append('imagem', data.imagem);
        }
        if (data.arquivo instanceof File) {
          formData.append('arquivo', data.arquivo);
        }

        await createActivity(formData);
        toast({
          title: 'Atividade criada',
          description: 'A atividade foi criada com sucesso.',
        });

        // Chama o callback onSuccess após criar
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editMode
          ? 'Erro ao atualizar atividade'
          : 'Erro ao criar atividade',
        description: 'Ocorreu um erro. Tente novamente mais tarde.',
      });
    }
  };

  const calculateEstimatedTime = () => {
    const quantity = form.getValues('quantity');
    const timePerUnit = form.getValues('timePerUnit');
    const unidadeTempo = form.getValues('unidadeTempo');

    if (!quantity || !timePerUnit) return;

    const totalMinutes =
      unidadeTempo === 'minutos'
        ? quantity * timePerUnit
        : quantity * timePerUnit * 60;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const estimatedTime = `${hours}h${minutes}min`;
    form.setValue('estimatedTime', estimatedTime);
    setTempoPrevisto(estimatedTime);
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name === 'quantity' ||
        name === 'timePerUnit' ||
        name === 'unidadeTempo'
      ) {
        calculateEstimatedTime();
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="macroTask"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarefa Macro</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    onValueChange={field.onChange}
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

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="estimatedTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempo Previsto</FormLabel>
                <FormControl>
                  <Input
                    value={tempoPrevisto}
                    readOnly
                    className="bg-gray-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="collaborators"
          render={({ field }) => {
            // Caso esteja no modo de edição, preenche `field.value` com os colaboradores selecionados anteriormente
            const selectedCollaborators = field.value || []; // Aqui você assume que o valor vem previamente carregado

            return (
              <FormItem>
                <FormLabel>Equipe</FormLabel>
                <Select
                  value={
                    selectedCollaborators?.length
                      ? selectedCollaborators[0].toString()
                      : ''
                  } // Mostra o primeiro colaborador como selecionado
                  onValueChange={(value) => {
                    const numericValue = Number(value);
                    const currentValues = selectedCollaborators;
                    if (!currentValues.includes(numericValue)) {
                      field.onChange([...currentValues, numericValue]);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue>
                        {selectedCollaborators?.length
                          ? selectedCollaborators
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
                  {selectedCollaborators?.map((colaboradorId: number) => {
                    const colaborador = colaboradores.find(
                      (col) => col.id === colaboradorId
                    );
                    return (
                      <Badge
                        key={colaboradorId}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          const newEquipe = selectedCollaborators.filter(
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
            );
          }}
        />

        {/* 
        {editMode && (
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )} */}

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
            initialPreview={
              atividadeInicial?.imageUrl
                ? `https://api.gmxindustrial.com.br${atividadeInicial.imageUrl}`
                : undefined
            }
            initialDescription={atividadeInicial?.imageDescription}
          />
          <FileUploadField
            form={form}
            fileType="arquivo"
            activityId={atividadeInicial?.id}
            initialPreview={
              atividadeInicial?.fileUrl
                ? `https://api.gmxindustrial.com.br${atividadeInicial.fileUrl}`
                : undefined
            }
            initialDescription={atividadeInicial?.fileDescription}
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
