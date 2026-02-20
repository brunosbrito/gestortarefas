import { useEffect, useState, useRef } from 'react';
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
import { Separator } from '@/components/ui/separator';
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
import { TarefaMacro } from '@/interfaces/TarefaMacroInterface';
import { Processo } from '@/interfaces/ProcessoInterface';
import {
  FileText,
  Clock,
  Users,
  Paperclip,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HelpTooltip } from '@/components/tooltips/HelpTooltip';
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent';
import { FormProgressIndicator, FormStep, useFormProgress } from '@/components/forms/FormProgressIndicator';

type UnidadeTempo = 'minutos' | 'horas';

const formSchema = z.object({
  macroTask: z.string().min(1, 'Tarefa macro é obrigatória'),
  process: z.string().min(1, 'Processo é obrigatório'),
  description: z.string().min(1, 'Atividade é obrigatória'),
  quantity: z.number().min(1, 'Unidade é obrigatória'),
  timePerUnit: z.number().min(1, 'Tempo por unidade é obrigatório'),
  unidadeTempo: z.enum(['minutos', 'horas'] as const),
  plannedStartDate: z.string().optional(),
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

interface FormSectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

const FormSection = ({ icon: Icon, title, children }: FormSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
    </div>
    <div className="space-y-4 pl-6 border-l-2 border-border/30">
      {children}
    </div>
  </div>
);

const FORM_STEPS: FormStep[] = [
  {
    id: 'basicas',
    label: 'Básico',
    icon: FileText,
    description: 'Tarefa macro, processo e descrição'
  },
  {
    id: 'tempo',
    label: 'Tempo',
    icon: Clock,
    description: 'Tempo e quantidade'
  },
  {
    id: 'equipe',
    label: 'Equipe',
    icon: Users,
    description: 'Seleção de colaboradores'
  },
  {
    id: 'observacoes',
    label: 'Obs.',
    icon: MessageSquare,
    description: 'Observações adicionais'
  },
  {
    id: 'anexos',
    label: 'Anexos',
    icon: Paperclip,
    description: 'Imagens e documentos'
  }
];

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
  const [totalTimeOverride, setTotalTimeOverride] = useState<string>(
    atividadeInicial?.totalTime ? String(atividadeInicial.totalTime) : ''
  );
  const [tarefasMacro, setTarefasMacro] = useState<TarefaMacro[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [macroTaskSelectedValue, setMacroTaskSelectedValue] = useState<string>('');
  const [processSelectedValue, setProcessSelectedValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form progress tracking
  const formProgress = useFormProgress(FORM_STEPS.length);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Set ref for a section
  const setSectionRef = (index: number) => (el: HTMLDivElement | null) => {
    sectionRefs.current[index] = el;
  };

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      macroTask: determinarValorInicialTarefaMacro(),
      process: determinarValorInicialProcesso(),
      description: atividadeInicial?.description || '',
      quantity: atividadeInicial?.quantity || 1,
      timePerUnit: 1,
      unidadeTempo: 'horas',
      plannedStartDate: atividadeInicial?.plannedStartDate
        ? atividadeInicial.plannedStartDate.substring(0, 10)
        : '',
      collaborators: determinarColaboradoresIniciais(),
      observation: atividadeInicial?.observation || '',
      projectId,
      orderServiceId,
      createdBy: 1,
    },
  });

  useEffect(() => {
    const loadTarefasMacro = async () => {
      try {
        const response = await TarefaMacroService.getAll();
        setTarefasMacro(Array.isArray(response.data) ? response.data : []);
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
        setProcessos(Array.isArray(response.data) ? response.data : []);
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
        setColaboradores(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
      }
    };

    loadColaboradores();
  }, []);

  useEffect(() => {
    const valorInicialTarefaMacro = determinarValorInicialTarefaMacro();
    const valorInicialProcesso = determinarValorInicialProcesso();

    if (valorInicialTarefaMacro) {
      setMacroTaskSelectedValue(valorInicialTarefaMacro);
    }

    if (valorInicialProcesso) {
      setProcessSelectedValue(valorInicialProcesso);
    }
  }, [atividadeInicial]);

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
  }, [form.watch]);

  // Track form progress based on field completion
  useEffect(() => {
    const subscription = form.watch((values) => {
      // Section 0: Básico - macroTask, process, description
      if (values.macroTask && values.process && values.description) {
        formProgress.markStepCompleted(0);
      } else {
        formProgress.markStepIncomplete(0);
      }

      // Section 1: Tempo - quantity, timePerUnit
      if (values.quantity && values.timePerUnit) {
        formProgress.markStepCompleted(1);
      } else {
        formProgress.markStepIncomplete(1);
      }

      // Section 2: Equipe - collaborators (at least 1)
      if (values.collaborators && values.collaborators.length > 0) {
        formProgress.markStepCompleted(2);
      } else {
        formProgress.markStepIncomplete(2);
      }

      // Sections 3 & 4 (Observações, Anexos) are optional - mark as complete
      formProgress.markStepCompleted(3);
      formProgress.markStepCompleted(4);
    });

    return () => subscription.unsubscribe();
  }, [form.watch, formProgress]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const collaboratorIds = values.collaborators.map((id) => Number(id));

      const formData = new FormData();
      formData.append('macroTaskId', values.macroTask);
      formData.append('processId', values.process);
      formData.append('description', values.description);
      formData.append('quantity', values.quantity.toString());
      formData.append('estimatedTime', values.estimatedTime || tempoPrevisto);
      formData.append('projectId', values.projectId.toString());
      formData.append('orderServiceId', values.orderServiceId.toString());
      formData.append('createdBy', values.createdBy.toString());
      formData.append('collaboratorIds', JSON.stringify(collaboratorIds));
      if (values.plannedStartDate) {
        formData.append('plannedStartDate', values.plannedStartDate);
      }

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
        if (totalTimeOverride !== '') {
          const parsed = parseFloat(totalTimeOverride);
          if (!isNaN(parsed) && parsed >= 0) {
            formData.append('totalTime', parsed.toString());
          }
        }
        await updateActivity(atividadeInicial.id, formData);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
        {/* Progress Indicator */}
        <FormProgressIndicator
          steps={FORM_STEPS}
          currentStep={formProgress.currentStep}
          completedSteps={formProgress.completedSteps}
          onStepClick={(stepIndex) => {
            const sectionElement = sectionRefs.current[stepIndex];
            if (sectionElement) {
              sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              formProgress.goToStep(stepIndex);
            }
          }}
        />

        {/* Conteúdo */}
        <div className="space-y-6 md:space-y-8 pb-4 mt-4">
          {/* Seção: Informações Básicas */}
          <div ref={setSectionRef(0)}>
            <FormSection icon={FileText} title="Informações Básicas">
            <FormField
              control={form.control}
              name="macroTask"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 font-medium">
                    Tarefa Macro <span className="text-destructive">*</span>
                    <HelpTooltip content={TOOLTIP_CONTENT.FORM_MACRO_TASK} />
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
                        form.formState.errors.macroTask && "border-destructive bg-destructive/5"
                      )}>
                        <SelectValue placeholder="Selecione a tarefa macro" />
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
                  {form.formState.errors.macroTask && (
                    <FormMessage className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {form.formState.errors.macroTask.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="process"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 font-medium">
                    Processo <span className="text-destructive">*</span>
                    <HelpTooltip content={TOOLTIP_CONTENT.FORM_PROCESS} />
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
                        form.formState.errors.process && "border-destructive bg-destructive/5"
                      )}>
                        <SelectValue placeholder="Selecione o processo" />
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
                  {form.formState.errors.process && (
                    <FormMessage className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {form.formState.errors.process.message}
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
                  <FormLabel className="flex items-center gap-1.5 font-medium">
                    Atividade <span className="text-destructive">*</span>
                    <HelpTooltip content={TOOLTIP_CONTENT.FORM_DESCRIPTION} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite a atividade"
                      {...field}
                      className={cn(
                        form.formState.errors.description && "border-destructive bg-destructive/5"
                      )}
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
          </FormSection>
          </div>

          <Separator className="my-8" />

          {/* Seção: Tempo e Quantidade */}
          <div ref={setSectionRef(1)}>
            <FormSection icon={Clock} title="Tempo e Quantidade">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 font-medium">
                      Unidade/Peça <span className="text-destructive">*</span>
                      <HelpTooltip content={TOOLTIP_CONTENT.FORM_QUANTITY} />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className={cn(
                          form.formState.errors.quantity && "border-destructive bg-destructive/5"
                        )}
                      />
                    </FormControl>
                    {form.formState.errors.quantity && (
                      <FormMessage className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {form.formState.errors.quantity.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="timePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 font-medium">
                        Tempo/Un <span className="text-destructive">*</span>
                        <HelpTooltip content={TOOLTIP_CONTENT.FORM_TIME_PER_UNIT} />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className={cn(
                            form.formState.errors.timePerUnit && "border-destructive bg-destructive/5"
                          )}
                        />
                      </FormControl>
                      {form.formState.errors.timePerUnit && (
                        <FormMessage className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {form.formState.errors.timePerUnit.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unidadeTempo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Unidade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minutos">Min</SelectItem>
                          <SelectItem value="horas">Hrs</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tempo Previsto Display */}
            {tempoPrevisto && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tempo Previsto</p>
                    <p className="text-2xl font-bold text-primary tabular-nums">{tempoPrevisto}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Data Início Prevista */}
            <FormField
              control={form.control}
              name="plannedStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 font-medium">
                    Data Início Prevista
                    <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Data em que esta atividade deveria começar. Será sinalizada como "Em Atraso" se não iniciada até esta data.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Alterar Horas Trabalhadas — somente em edição */}
            {editMode && (
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <label htmlFor="totalTimeOverride" className="text-sm font-medium">
                    Alterar Horas
                    <span className="ml-1 text-xs text-muted-foreground font-normal">(Opcional — sobrescreve o total atual)</span>
                  </label>
                </div>
                <Input
                  id="totalTimeOverride"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder={`Atual: ${atividadeInicial?.totalTime ?? 0}h`}
                  value={totalTimeOverride}
                  onChange={e => setTotalTimeOverride(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Informe o total de horas trabalhadas correto. Deixe em branco para manter o valor atual.
                </p>
              </div>
            )}
          </FormSection>
          </div>

          <Separator className="my-8" />

          {/* Seção: Equipe */}
          <div ref={setSectionRef(2)}>
            <FormSection icon={Users} title="Equipe">
            <FormField
              control={form.control}
              name="collaborators"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 font-medium">
                    Colaboradores <span className="text-destructive">*</span>
                    <HelpTooltip content={TOOLTIP_CONTENT.FORM_COLLABORATORS} />
                  </FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg border border-border/50 bg-muted/20 max-h-60 overflow-y-auto">
                    {colaboradores.map((colaborador) => (
                      <FormField
                        key={colaborador.id}
                        control={form.control}
                        name="collaborators"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={colaborador.id}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                                  checked={field.value?.includes(colaborador.id)}
                                  onChange={(e) => {
                                    return e.target.checked
                                      ? field.onChange([...field.value, colaborador.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== colaborador.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {colaborador.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  {form.formState.errors.collaborators && (
                    <FormMessage className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {form.formState.errors.collaborators.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
          </FormSection>
          </div>

          <Separator className="my-8" />

          {/* Seção: Observações */}
          <div ref={setSectionRef(3)}>
            <FormSection icon={MessageSquare} title="Observações">
            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 font-medium">
                    Observação (Opcional)
                    <HelpTooltip content={TOOLTIP_CONTENT.FORM_OBSERVATION} />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite uma observação (opcional)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
          </div>

          <Separator className="my-8" />

          {/* Seção: Anexos */}
          <div ref={setSectionRef(4)}>
            <FormSection icon={Paperclip} title="Anexos">
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
          </FormSection>
          </div>
        </div>

        {/* Footer Sticky */}
        <div className="sticky bottom-0 p-4 md:p-6 bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-lg z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "min-w-[200px] h-11 font-semibold shadow-lg transition-all",
                "bg-primary hover:bg-primary/90",
                isSubmitting && "opacity-70"
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{editMode ? 'Salvar Alterações' : 'Criar Atividade'}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
