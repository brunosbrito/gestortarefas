import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createActivity, updateActivity } from '@/services/ActivityService';
import { Activity } from '@/interfaces/AtividadeInterface';
import { FileUploadField } from './FileUploadField';
import { ProcessService } from '@/services/ProcessService';
import { TarefaMacroService } from '@/services/TarefaMacroService';
import { ColaboradorService } from '@/services/ColaboradorService';

const formSchema = z.object({
  macroTask: z.string().min(1, 'Tarefa macro é obrigatória'),
  process: z.string().min(1, 'Processo é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  timePerUnit: z.number().min(0, 'Tempo por unidade deve ser maior ou igual a 0'),
  unidadeTempo: z.string().min(1, 'Unidade de tempo é obrigatória'),
  collaborators: z.array(z.number()).min(1, 'Pelo menos um colaborador é obrigatório'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  observation: z.string().optional(),
  imagemDescricao: z.string().optional(),
  arquivoDescricao: z.string().optional(),
  estimatedTime: z.string().optional(),
  imagem: z.instanceof(File).optional(),
  arquivo: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NovaAtividadeFormProps {
  projectId: number;
  orderServiceId: number;
  editMode?: boolean;
  atividadeInicial?: Activity;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NovaAtividadeForm({
  projectId,
  orderServiceId,
  editMode = false,
  atividadeInicial,
  onSuccess,
  onCancel,
}: NovaAtividadeFormProps) {
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<number[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editMode && atividadeInicial ? {
      macroTask: atividadeInicial.macroTask,
      process: atividadeInicial.process,
      description: atividadeInicial.description,
      quantity: atividadeInicial.quantity,
      timePerUnit: atividadeInicial.timePerUnit,
      unidadeTempo: atividadeInicial.unidadeTempo,
      collaborators: atividadeInicial.collaborators,
      startDate: atividadeInicial.startDate,
      observation: atividadeInicial.observation || '',
      imagemDescricao: atividadeInicial.imageDescription || '',
      arquivoDescricao: atividadeInicial.fileDescription || '',
      estimatedTime: atividadeInicial.estimatedTime || '',
    } : {},
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (editMode && atividadeInicial) {
        const activityData = {
          macroTask: data.macroTask,
          process: data.process,
          description: data.description,
          quantity: data.quantity,
          timePerUnit: data.timePerUnit,
          unidadeTempo: data.unidadeTempo,
          collaborators: data.collaborators,
          startDate: data.startDate,
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
        
        // Chama o callback de sucesso para fechar o modal e atualizar a lista
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Usar FormData para nova atividade
        const formData = new FormData();
        
        // Adicionar dados básicos
        formData.append('macroTask', data.macroTask);
        formData.append('process', data.process);
        formData.append('description', data.description);
        formData.append('quantity', data.quantity.toString());
        formData.append('timePerUnit', data.timePerUnit.toString());
        formData.append('unidadeTempo', data.unidadeTempo);
        formData.append('startDate', data.startDate);
        formData.append('observation', data.observation || '');
        formData.append('imagemDescricao', data.imagemDescricao || '');
        formData.append('arquivoDescricao', data.arquivoDescricao || '');
        formData.append('estimatedTime', data.estimatedTime || '');
        formData.append('projectId', projectId.toString());
        formData.append('orderServiceId', orderServiceId.toString());
        formData.append('createdBy', (Number(localStorage.getItem('userId')) || 0).toString());
        
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
        
        // Chama o callback de sucesso para fechar o modal e atualizar a lista
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar a atividade.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="macroTask"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarefa Macro</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
              <FormControl>
                <Input {...field} />
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timePerUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tempo por Unidade</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
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
              <FormLabel>Unidade de Tempo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FileUploadField
          name="imagem"
          label="Imagem"
          control={form.control}
        />
        <FileUploadField
          name="arquivo"
          label="Arquivo"
          control={form.control}
        />
        <Button type="submit" className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
          {editMode ? 'Atualizar Atividade' : 'Criar Atividade'}
        </Button>
      </form>
    </Form>
  );
}
