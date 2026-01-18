/**
 * Formulário para Criar/Editar Cronograma
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Obra } from '@/interfaces/ObrasInterface';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { Cronograma } from '@/interfaces/CronogramaInterfaces';
import ObrasService from '@/services/ObrasService';
import ColaboradorService from '@/services/ColaboradorService';
import { cn } from '@/lib/utils';
import { Calendar, Loader2 } from 'lucide-react';

const formSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  projectId: z.string().min(1, 'Obra é obrigatória'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  responsavelId: z.string().optional(),
}).refine(
  (data) => {
    if (data.dataInicio && data.dataFim) {
      return new Date(data.dataInicio) <= new Date(data.dataFim);
    }
    return true;
  },
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['dataFim'],
  }
);

interface NovoCronogramaFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  initialData?: Cronograma | null;
  onCancel: () => void;
}

export function NovoCronogramaForm({
  onSubmit,
  initialData,
  onCancel,
}: NovoCronogramaFormProps) {
  const [obras, setObras] = useState<Obra[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          nome: initialData.nome || '',
          descricao: initialData.descricao || '',
          projectId: initialData.projectId || '',
          dataInicio: initialData.dataInicio?.split('T')[0] || '',
          dataFim: initialData.dataFim?.split('T')[0] || '',
          responsavelId: initialData.responsavelId || '',
        }
      : {
          nome: '',
          descricao: '',
          projectId: '',
          dataInicio: '',
          dataFim: '',
          responsavelId: '',
        },
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [obrasRes, colaboradoresRes] = await Promise.all([
          ObrasService.getAllObras(),
          ColaboradorService.getAllColaboradores(),
        ]);

        setObras(obrasRes.filter((obra) => obra.status === 'Ativa'));
        setColaboradores(
          colaboradoresRes.filter((colab) => colab.status === 'Ativo')
        );
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
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
        {/* Nome do Cronograma */}
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Nome do Cronograma <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Cronograma Galpão ABC - 100 Peças"
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

        {/* Descrição */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o escopo deste cronograma..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Informações sobre o objetivo e escopo do cronograma
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Obra */}
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Obra <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      form.formState.errors.projectId &&
                        'border-destructive bg-destructive/5'
                    )}
                  >
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {obras.length === 0 ? (
                    <SelectItem value="0" disabled>
                      Nenhuma obra ativa disponível
                    </SelectItem>
                  ) : (
                    obras.map((obra) => (
                      <SelectItem key={obra.id} value={obra.id.toString()}>
                        {obra.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Obra relacionada a este cronograma
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataInicio"
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
                        form.formState.errors.dataInicio &&
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
            name="dataFim"
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
                      className={cn(
                        'pr-10',
                        form.formState.errors.dataFim &&
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
                      <SelectItem
                        key={colaborador.id}
                        value={colaborador.id.toString()}
                      >
                        {colaborador.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Coordenador ou gerente responsável pelo cronograma
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {initialData ? 'Atualizar' : 'Criar Cronograma'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
