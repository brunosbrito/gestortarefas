/**
 * Formulário para Criar/Editar Tarefa
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 */

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { TarefaCronograma, Dependencia } from '@/interfaces/CronogramaInterfaces';
import ColaboradorService from '@/services/ColaboradorService';
import TarefaCronogramaService from '@/services/TarefaCronogramaService';
import { cn } from '@/lib/utils';
import { Calendar, Loader2, AlertCircle, X, Plus as PlusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  tipo: z.enum(['manual', 'atividade', 'inspecao', 'certificado', 'marco']),
  dataInicioPlanejada: z.string().min(1, 'Data de início é obrigatória'),
  dataFimPlanejada: z.string().min(1, 'Data de fim é obrigatória'),
  duracao: z.coerce.number().min(0, 'Duração deve ser maior ou igual a 0'),
  unidadeTempo: z.enum(['horas', 'dias', 'semanas']),
  isMilestone: z.boolean(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica']),
  responsavelId: z.string().optional(),
  ordem: z.coerce.number().min(0),
  nivel: z.coerce.number().min(0).max(10),
  eap: z.string().optional(),
  tarefaPaiId: z.string().optional(),
}).refine(
  (data) => {
    if (data.dataInicioPlanejada && data.dataFimPlanejada && !data.isMilestone) {
      return new Date(data.dataInicioPlanejada) <= new Date(data.dataFimPlanejada);
    }
    return true;
  },
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['dataFimPlanejada'],
  }
);

interface NovaTarefaFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  initialData?: TarefaCronograma | null;
  cronogramaId: string;
  onCancel: () => void;
}

export function NovaTarefaForm({
  onSubmit,
  initialData,
  cronogramaId,
  onCancel,
}: NovaTarefaFormProps) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [tarefas, setTarefas] = useState<TarefaCronograma[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Gerenciamento de dependências
  const [dependencias, setDependencias] = useState<string[]>(
    initialData?.dependencias?.map(d => d.tarefaAnteriorId) || []
  );
  const [novaDependencia, setNovaDependencia] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          nome: initialData.nome || '',
          descricao: initialData.descricao || '',
          tipo: initialData.tipo || 'manual',
          dataInicioPlanejada: initialData.dataInicioPlanejada?.split('T')[0] || '',
          dataFimPlanejada: initialData.dataFimPlanejada?.split('T')[0] || '',
          duracao: initialData.duracao || 1,
          unidadeTempo: initialData.unidadeTempo || 'dias',
          isMilestone: initialData.isMilestone || false,
          prioridade: initialData.prioridade || 'media',
          responsavelId: initialData.responsavelId || '',
          ordem: initialData.ordem || 0,
          nivel: initialData.nivel || 0,
          eap: initialData.eap || '',
          tarefaPaiId: initialData.tarefaPaiId || '',
        }
      : {
          nome: '',
          descricao: '',
          tipo: 'manual',
          dataInicioPlanejada: '',
          dataFimPlanejada: '',
          duracao: 1,
          unidadeTempo: 'dias',
          isMilestone: false,
          prioridade: 'media',
          responsavelId: '',
          ordem: 0,
          nivel: 0,
          eap: '',
          tarefaPaiId: '',
        },
  });

  const isMilestone = form.watch('isMilestone');
  const nivel = form.watch('nivel');
  const ordem = form.watch('ordem');
  const tarefaPaiId = form.watch('tarefaPaiId');

  // Helper para gerar EAP automático
  const gerarEAP = (
    nivel: number,
    ordem: number,
    tarefaPaiId: string | undefined,
    todasTarefas: TarefaCronograma[]
  ): string => {
    if (nivel === 0) {
      // Nível raiz: contador sequencial (1, 2, 3...)
      const tarefasNivel0 = todasTarefas.filter(t => t.nivel === 0).length;
      return `${tarefasNivel0 + 1}`;
    } else if (tarefaPaiId) {
      // Tem pai: buscar EAP do pai e adicionar contador
      const pai = todasTarefas.find(t => t.id === tarefaPaiId);
      if (pai && pai.eap) {
        const irmaos = todasTarefas.filter(
          t => t.tarefaPaiId === tarefaPaiId && t.nivel === nivel
        );
        return `${pai.eap}.${irmaos.length + 1}`;
      }
    }

    // Fallback: usar ordem como base
    return `${ordem + 1}`;
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [colaboradoresRes, tarefasRes] = await Promise.all([
          ColaboradorService.getAllColaboradores(),
          TarefaCronogramaService.getAll(cronogramaId),
        ]);

        setColaboradores(colaboradoresRes.filter((colab) => colab.status === 'Ativo'));
        setTarefas(tarefasRes);

        // Auto-calcular ordem baseado em tarefas do mesmo nível/pai
        if (!initialData) {
          const nivel = form.getValues('nivel') || 0;
          const tarefaPaiId = form.getValues('tarefaPaiId');

          // Filtrar tarefas do mesmo nível/pai (irmãs)
          const tarefasIrmas = tarefasRes.filter(t =>
            t.nivel === nivel && t.tarefaPaiId === tarefaPaiId
          );

          if (tarefasIrmas.length > 0) {
            const maxOrdem = Math.max(...tarefasIrmas.map(t => t.ordem));
            form.setValue('ordem', maxOrdem + 1);
          } else {
            // Primeira tarefa neste nível/pai
            form.setValue('ordem', 0);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [cronogramaId, initialData]);

  // Auto-gerar EAP quando nivel, ordem, pai ou tarefas mudarem
  useEffect(() => {
    if (!initialData) {
      if (import.meta.env.DEV) {
        console.log('🔄 Gerando EAP automático:', { nivel, ordem, tarefaPaiId, totalTarefas: tarefas.length });
      }
      const eapSugerido = gerarEAP(nivel, ordem, tarefaPaiId, tarefas);
      if (import.meta.env.DEV) {
        console.log('✅ EAP gerado:', eapSugerido);
      }
      form.setValue('eap', eapSugerido);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivel, ordem, tarefaPaiId, tarefas.length, initialData]);

  // Quando marcar como milestone, ajustar datas
  useEffect(() => {
    if (isMilestone) {
      const dataInicio = form.getValues('dataInicioPlanejada');
      if (dataInicio) {
        form.setValue('dataFimPlanejada', dataInicio);
        form.setValue('duracao', 0);
      }
    }
  }, [isMilestone]);

  // Handlers para dependências
  const handleAdicionarDependencia = () => {
    if (novaDependencia && !dependencias.includes(novaDependencia)) {
      setDependencias([...dependencias, novaDependencia]);
      setNovaDependencia('');
    }
  };

  const handleRemoverDependencia = (tarefaId: string) => {
    setDependencias(dependencias.filter(id => id !== tarefaId));
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Incluir dependências no payload
      const payload = {
        ...data,
        dependenciasIds: dependencias, // IDs das tarefas anteriores
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Nome da Tarefa */}
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Nome da Tarefa <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Corte de Chapas"
                  {...field}
                  className={cn(
                    form.formState.errors.nome && 'border-destructive bg-destructive/5'
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grid: Tipo e Prioridade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Tipo <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="atividade">Atividade (OS)</SelectItem>
                    <SelectItem value="inspecao">Inspeção</SelectItem>
                    <SelectItem value="certificado">Certificado</SelectItem>
                    <SelectItem value="marco">Marco</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Tipo da tarefa no cronograma</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prioridade"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Prioridade <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descrição */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a tarefa..."
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Milestone Checkbox */}
        <FormField
          control={form.control}
          name="isMilestone"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Marco (Milestone)
                </FormLabel>
                <FormDescription>
                  Marcos representam eventos importantes e têm duração zero
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataInicioPlanejada"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Data de Início <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="date"
                      {...field}
                      className={cn(
                        'pr-10',
                        form.formState.errors.dataInicioPlanejada &&
                          'border-destructive bg-destructive/5'
                      )}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataFimPlanejada"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Data de Fim <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="date"
                      {...field}
                      disabled={isMilestone}
                      className={cn(
                        'pr-10',
                        form.formState.errors.dataFimPlanejada &&
                          'border-destructive bg-destructive/5'
                      )}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </FormControl>
                {isMilestone && (
                  <FormDescription>
                    Igual à data de início (marco)
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Duração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duracao"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Duração <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    disabled={isMilestone}
                    {...field}
                    className={cn(
                      form.formState.errors.duracao && 'border-destructive bg-destructive/5'
                    )}
                  />
                </FormControl>
                {isMilestone && <FormDescription>0 (marco)</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unidadeTempo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Unidade <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isMilestone}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="horas">Horas</SelectItem>
                    <SelectItem value="dias">Dias</SelectItem>
                    <SelectItem value="semanas">Semanas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Responsável */}
        <FormField
          control={form.control}
          name="responsavelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Responsável (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colaboradores.length === 0 ? (
                    <SelectItem value="0" disabled>
                      Nenhum colaborador ativo disponível
                    </SelectItem>
                  ) : (
                    colaboradores.map((colaborador) => (
                      <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                        {colaborador.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tarefa Pai (Hierarquia) */}
        <FormField
          control={form.control}
          name="tarefaPaiId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Tarefa Pai (Opcional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === '__root__' ? undefined : value)}
                defaultValue={field.value || '__root__'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma (tarefa raiz)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__root__">Nenhuma (tarefa raiz)</SelectItem>
                  {tarefas
                    .filter(t => !initialData || t.id !== initialData.id)
                    .map((tarefa) => (
                      <SelectItem key={tarefa.id} value={tarefa.id}>
                        {tarefa.eap ? `${tarefa.eap} - ` : ''}{tarefa.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Selecione a tarefa pai para criar uma subtarefa
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ordem, Nível e EAP (campos técnicos) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="ordem"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Ordem</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Ordem de exibição
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nivel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Nível</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="10" {...field} />
                </FormControl>
                <FormDescription>
                  Hierarquia (0-10)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eap"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">EAP/WBS</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 1.2.3"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Gerado automaticamente
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Gerenciamento de Dependências */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <FormLabel className="font-medium text-base">Dependências</FormLabel>
              <FormDescription className="text-sm mt-1">
                Tarefas que devem ser concluídas antes desta
              </FormDescription>
            </div>
          </div>

          {/* Lista de Dependências */}
          {dependencias.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dependencias.map((tarefaId) => {
                const tarefa = tarefas.find(t => t.id === tarefaId);
                return (
                  <Badge key={tarefaId} variant="secondary" className="gap-1">
                    {tarefa?.eap ? `${tarefa.eap} - ` : ''}{tarefa?.nome || tarefaId}
                    <button
                      type="button"
                      onClick={() => handleRemoverDependencia(tarefaId)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Adicionar Nova Dependência */}
          <div className="flex gap-2">
            <Select value={novaDependencia} onValueChange={setNovaDependencia}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione uma tarefa predecessora" />
              </SelectTrigger>
              <SelectContent>
                {tarefas
                  .filter(t => !dependencias.includes(t.id) && (!initialData || t.id !== initialData.id))
                  .map((tarefa) => (
                    <SelectItem key={tarefa.id} value={tarefa.id}>
                      {tarefa.eap ? `${tarefa.eap} - ` : ''}{tarefa.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAdicionarDependencia}
              disabled={!novaDependencia}
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData ? 'Atualizar Tarefa' : 'Criar Tarefa'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
