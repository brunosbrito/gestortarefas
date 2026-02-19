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
import TarefaMacroService from '@/services/TarefaMacroService';
import ProcessService from '@/services/ProcessService';
import ColaboradorService from '@/services/ColaboradorService';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { TarefaMacro } from '@/interfaces/TarefaMacroInterface';
import { Processo } from '@/interfaces/ProcessoInterface';
import {
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  ChevronsUpDown,
  Check,
  CalendarIcon,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

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
  plannedStartDate: z.date().optional(),
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
  const [tarefasMacro, setTarefasMacro] = useState<TarefaMacro[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [macroTaskSelectedValue, setMacroTaskSelectedValue] = useState<string>('');
  const [processSelectedValue, setProcessSelectedValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const determinarValorInicialTarefaMacro = () => {
    if (!atividadeInicial) return '';
    if (
      typeof atividadeInicial.macroTask === 'object' &&
      atividadeInicial.macroTask?.id
    ) {
      return atividadeInicial.macroTask.id.toString();
    }
    return typeof atividadeInicial.macroTask === 'number'
      ? (atividadeInicial.macroTask as string | number).toString()
      : '';
  };

  const determinarValorInicialProcesso = () => {
    if (!atividadeInicial) return '';
    if (
      typeof atividadeInicial.process === 'object' &&
      atividadeInicial.process?.id
    ) {
      return atividadeInicial.process.id.toString();
    }
    return typeof atividadeInicial.process === 'number'
      ? (atividadeInicial.process as string | number).toString()
      : '';
  };

  const determinarColaboradoresIniciais = (): number[] => {
    if (!atividadeInicial || !atividadeInicial.collaborators) return [];
    return atividadeInicial.collaborators.map((collab) => {
      if (typeof collab === 'number') return collab;
      if (typeof collab === 'object' && collab?.id) return collab.id;
      return 0;
    });
  };

  // Função para parsear estimatedTime e calcular timePerUnit
  const parseEstimatedTime = (estimatedTime: string, quantity: number): { timePerUnit: number; unidadeTempo: UnidadeTempo } => {
    if (!estimatedTime || !quantity || quantity === 0) {
      return { timePerUnit: 1, unidadeTempo: 'horas' };
    }

    // Parse do formato "Xh Ymin" ou "Xh" ou "Ymin"
    const hoursMatch = estimatedTime.match(/(\d+)\s*h/);
    const minutesMatch = estimatedTime.match(/(\d+)\s*min/);

    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

    // Converter tudo para horas
    const totalHours = hours + (minutes / 60);

    // Calcular tempo por unidade
    const timePerUnitHours = totalHours / quantity;

    // Se o tempo por unidade for menor que 1 hora, usar minutos
    if (timePerUnitHours < 1) {
      const timePerUnitMinutes = Math.round(timePerUnitHours * 60);
      return { timePerUnit: timePerUnitMinutes || 1, unidadeTempo: 'minutos' };
    }

    return { timePerUnit: Math.round(timePerUnitHours * 10) / 10, unidadeTempo: 'horas' };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      macroTask: determinarValorInicialTarefaMacro(),
      process: determinarValorInicialProcesso(),
      description: atividadeInicial?.description || '',
      quantity: atividadeInicial?.quantity || 1,
      timePerUnit: 1,
      unidadeTempo: 'horas',
      collaborators: determinarColaboradoresIniciais(),
      plannedStartDate: undefined,
      observation: atividadeInicial?.observation || '',
      projectId,
      orderServiceId,
      createdBy: Number(localStorage.getItem('userId')) || 1,
    },
  });

  useEffect(() => {
    const loadTarefasMacro = async () => {
      try {
        const response = await TarefaMacroService.getAll();
        const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
        setTarefasMacro(data);
      } catch (error) {
        console.error('Erro ao carregar tarefas macro:', error);
      }
    };
    loadTarefasMacro();
  }, []);

  useEffect(() => {
    const loadProcessos = async () => {
      try {
        const response = await ProcessService.getAll();
        const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
        setProcessos(data);
      } catch (error) {
        console.error('Erro ao carregar processos:', error);
      }
    };
    loadProcessos();
  }, []);

  useEffect(() => {
    const loadColaboradores = async () => {
      try {
        const response = await ColaboradorService.getAll();
        const data = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
        setColaboradores(data);
      } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
      }
    };
    loadColaboradores();
  }, []);

  // Preencher formulário quando em modo de edição
  useEffect(() => {
    if (editMode && atividadeInicial) {
      // Determinar valores iniciais
      let macroTaskValue = '';
      if (typeof atividadeInicial.macroTask === 'object' && atividadeInicial.macroTask?.id) {
        macroTaskValue = atividadeInicial.macroTask.id.toString();
      } else if (atividadeInicial.macroTask) {
        macroTaskValue = String(atividadeInicial.macroTask);
      }

      let processValue = '';
      if (typeof atividadeInicial.process === 'object' && atividadeInicial.process?.id) {
        processValue = atividadeInicial.process.id.toString();
      } else if (atividadeInicial.process) {
        processValue = String(atividadeInicial.process);
      }

      const colaboradoresIniciais = atividadeInicial.collaborators?.map((collab) => {
        if (typeof collab === 'number') return collab;
        if (typeof collab === 'object' && collab?.id) return collab.id;
        return 0;
      }).filter(id => id > 0) || [];

      // Atualizar estados locais
      setMacroTaskSelectedValue(macroTaskValue);
      setProcessSelectedValue(processValue);

      // Determinar timePerUnit e unidadeTempo
      let timePerUnitValue = atividadeInicial.timePerUnit;
      let unidadeTempoValue = atividadeInicial.unidadeTempo;

      // Se não tiver timePerUnit, calcular a partir do estimatedTime
      if (!timePerUnitValue && atividadeInicial.estimatedTime && atividadeInicial.quantity) {
        const parsed = parseEstimatedTime(atividadeInicial.estimatedTime, atividadeInicial.quantity);
        timePerUnitValue = parsed.timePerUnit;
        unidadeTempoValue = parsed.unidadeTempo;
      }

      // Determinar data prevista para início
      const plannedStartDateValue = atividadeInicial.plannedStartDate
        ? new Date(atividadeInicial.plannedStartDate)
        : undefined;

      // Reset do formulário com os valores da atividade
      form.reset({
        macroTask: macroTaskValue,
        process: processValue,
        description: atividadeInicial.description || '',
        quantity: atividadeInicial.quantity || 1,
        timePerUnit: timePerUnitValue || 1,
        unidadeTempo: unidadeTempoValue || 'horas',
        collaborators: colaboradoresIniciais,
        plannedStartDate: plannedStartDateValue,
        observation: atividadeInicial.observation || '',
        projectId,
        orderServiceId,
        createdBy: Number(localStorage.getItem('userId')) || 1,
      });

      // Se tiver campos opcionais preenchidos, expandir a seção
      if (atividadeInicial.observation || atividadeInicial.imageUrl || atividadeInicial.fileUrl) {
        setShowOptional(true);
      }

      // Calcular e exibir tempo previsto
      if (atividadeInicial.estimatedTime) {
        setTempoPrevisto(atividadeInicial.estimatedTime);
      } else if (atividadeInicial.quantity && timePerUnitValue) {
        const tempo = calcularTempoPrevisto(
          atividadeInicial.quantity,
          timePerUnitValue,
          unidadeTempoValue || 'horas'
        );
        setTempoPrevisto(tempo);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, atividadeInicial?.id]);

  const calcularTempoPrevisto = (
    quantidade: number,
    tempoPorUnidade: number,
    unidadeTempo: UnidadeTempo
  ): string => {
    if (!quantidade || !tempoPorUnidade) return '0h';
    const tempoTotal =
      unidadeTempo === 'minutos'
        ? (quantidade * tempoPorUnidade) / 60
        : quantidade * tempoPorUnidade;
    const horas = Math.floor(tempoTotal);
    const minutos = Math.round((tempoTotal - horas) * 60);
    if (horas === 0 && minutos === 0) return '0h';
    if (horas === 0) return `${minutos}min`;
    if (minutos === 0) return `${horas}h`;
    return `${horas}h ${minutos}min`;
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name === 'quantity' ||
        name === 'timePerUnit' ||
        name === 'unidadeTempo'
      ) {
        const quantidade = value.quantity || 0;
        const tempoPorUnidade = value.timePerUnit || 0;
        const unidadeTempo = (value.unidadeTempo || 'horas') as UnidadeTempo;
        const tempo = calcularTempoPrevisto(
          quantidade,
          tempoPorUnidade,
          unidadeTempo
        );
        setTempoPrevisto(tempo);
        form.setValue('estimatedTime', tempo);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const collaboratorIds = values.collaborators.map((id) => Number(id));
      const estimatedTimeValue = values.estimatedTime || tempoPrevisto || '1h';

      const formData = new FormData();
      formData.append('macroTaskId', values.macroTask);
      formData.append('processId', values.process);
      formData.append('description', values.description);
      formData.append('quantity', values.quantity.toString());
      formData.append('estimatedTime', estimatedTimeValue);
      formData.append('projectId', values.projectId.toString());
      formData.append('orderServiceId', values.orderServiceId.toString());
      formData.append('createdBy', values.createdBy.toString());
      formData.append('collaboratorIds', JSON.stringify(collaboratorIds));

      if (values.plannedStartDate) {
        formData.append('plannedStartDate', values.plannedStartDate.toISOString());
      }

      // Debug: Log dos dados enviados
      console.log('Dados enviados:', {
        macroTaskId: values.macroTask,
        processId: values.process,
        description: values.description,
        quantity: values.quantity,
        estimatedTime: estimatedTimeValue,
        projectId: values.projectId,
        orderServiceId: values.orderServiceId,
        createdBy: values.createdBy,
        collaboratorIds: collaboratorIds,
        plannedStartDate: values.plannedStartDate?.toISOString(),
      });

      if (values.observation) {
        formData.append('observation', values.observation);
      }
      if (values.imagem) {
        formData.append('image', values.imagem);
      }
      if (values.imagemDescricao) {
        formData.append('imageDescription', values.imagemDescricao);
      }
      if (values.arquivo) {
        formData.append('file', values.arquivo);
      }
      if (values.arquivoDescricao) {
        formData.append('fileDescription', values.arquivoDescricao);
      }

      if (editMode && atividadeInicial?.id) {
        // Para edição, enviar JSON em vez de FormData (backend PUT não aceita FormData)
        const userId = localStorage.getItem('userId') || '1';
        const updateData: Record<string, unknown> = {
          macroTask: parseInt(values.macroTask),
          process: parseInt(values.process),
          description: values.description,
          quantity: values.quantity,
          estimatedTime: estimatedTimeValue,
          collaborators: collaboratorIds,
          observation: values.observation || '',
          changedBy: parseInt(userId),
        };

        if (values.plannedStartDate) {
          updateData.plannedStartDate = values.plannedStartDate.toISOString();
        }

        await updateActivity(atividadeInicial.id, updateData);
        toast({
          title: 'Sucesso!',
          description: 'Atividade atualizada com sucesso.',
        });
      } else {
        await createActivity(formData);
        toast({
          title: 'Sucesso!',
          description: 'Atividade criada com sucesso.',
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao processar atividade:', error);
      toast({
        title: 'Erro',
        description: editMode
          ? 'Erro ao atualizar atividade.'
          : 'Erro ao criar atividade.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Linha 1: Tarefa Macro e Processo lado a lado */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="macroTask"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">
                  Tarefa Macro <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setMacroTaskSelectedValue(value);
                  }}
                  value={macroTaskSelectedValue || field.value}
                >
                  <FormControl>
                    <SelectTrigger className={cn(
                      "h-9",
                      form.formState.errors.macroTask && "border-destructive"
                    )}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tarefasMacro.map((tarefa) => (
                      <SelectItem key={tarefa.id} value={tarefa.id.toString()}>
                        {tarefa.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="process"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">
                  Processo <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setProcessSelectedValue(value);
                  }}
                  value={processSelectedValue || field.value}
                >
                  <FormControl>
                    <SelectTrigger className={cn(
                      "h-9",
                      form.formState.errors.process && "border-destructive"
                    )}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {processos.map((processo) => (
                      <SelectItem key={processo.id} value={processo.id.toString()}>
                        {processo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Linha 2: Descrição da Atividade */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">
                Atividade <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite a atividade"
                  {...field}
                  className={cn(
                    "h-9",
                    form.formState.errors.description && "border-destructive"
                  )}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Linha 3: Quantidade, Tempo e Tempo Previsto */}
        <div className="grid grid-cols-4 gap-3 items-end">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">
                  Qtd <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className={cn(
                      "h-9",
                      form.formState.errors.quantity && "border-destructive"
                    )}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timePerUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">
                  Tempo/Un <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className={cn(
                      "h-9",
                      form.formState.errors.timePerUnit && "border-destructive"
                    )}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unidadeTempo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Unidade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="minutos">Min</SelectItem>
                    <SelectItem value="horas">Hrs</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Tempo Previsto */}
          <div className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary/10 border border-primary/20">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-semibold text-primary">{tempoPrevisto || '0h'}</span>
          </div>
        </div>

        {/* Linha 4: Colaboradores */}
        <FormField
          control={form.control}
          name="collaborators"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">
                Colaboradores <span className="text-destructive">*</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between h-9 font-normal",
                        !field.value?.length && "text-muted-foreground",
                        form.formState.errors.collaborators && "border-destructive"
                      )}
                    >
                      {field.value?.length
                        ? `${field.value.length} selecionado(s)`
                        : "Selecione colaboradores"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-48 overflow-y-auto p-1">
                    {colaboradores.map((colaborador) => {
                      const isSelected = field.value?.includes(colaborador.id) ?? false;
                      return (
                        <div
                          key={colaborador.id}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm text-sm",
                            "hover:bg-accent hover:text-accent-foreground",
                            isSelected && "bg-accent/50"
                          )}
                          onClick={() => {
                            const currentValue = field.value || [];
                            if (isSelected) {
                              field.onChange(currentValue.filter((id) => id !== colaborador.id));
                            } else {
                              field.onChange([...currentValue, colaborador.id]);
                            }
                          }}
                        >
                          <div className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border",
                            isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                          )}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span>{colaborador.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Chips dos colaboradores selecionados */}
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {field.value.map((id) => {
                    const colaborador = colaboradores.find((c) => c.id === id);
                    if (!colaborador) return null;
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="text-xs px-2 py-0.5 gap-1"
                      >
                        {colaborador.name}
                        <button
                          type="button"
                          className="ml-1 hover:bg-muted rounded-full"
                          onClick={() => {
                            field.onChange(field.value?.filter((v) => v !== id) || []);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Data Prevista para Início */}
        <FormField
          control={form.control}
          name="plannedStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">
                Data Prevista para Início
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-9",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Seção Opcional Colapsável */}
        <Collapsible open={showOptional} onOpenChange={setShowOptional}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
            >
              <span>Campos opcionais (observação e anexos)</span>
              {showOptional ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            {/* Observação */}
            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Observação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite uma observação (opcional)"
                      className="min-h-[60px] text-sm resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Anexos lado a lado */}
            <div className="grid grid-cols-2 gap-3">
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
          </CollapsibleContent>
        </Collapsible>

        {/* Botão de Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 font-semibold"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Salvando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{editMode ? 'Salvar Alterações' : 'Criar Atividade'}</span>
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}
