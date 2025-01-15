'use client';

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
import { toast, useToast } from '@/hooks/use-toast';
import { CreateProcesso } from '@/interfaces/ProcessoInterface';
import ProcessService from '@/services/ProcessService';

interface NovoProcessoFormProps {
  onProcessCreated: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
});

export function NovoProcessoForm({ onProcessCreated }: NovoProcessoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: CreateProcesso) {
    try {
      await ProcessService.create(values);
      toast({
        title: 'Processo criada',
        description: 'Processo criada com sucesso.',
      });
      onProcessCreated();
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar Processo',
        description:
          'Não foi possível criar o Processo. Por favor, tente novamente.',
      });
      console.error('Erro ao criar o processo:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Processo</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do processo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Criar Processo
        </Button>
      </form>
    </Form>
  );
}
