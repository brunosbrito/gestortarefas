import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Processo, CreateProcesso } from '@/interfaces/ProcessoInterface';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import ProcessService from '@/services/ProcessService';

const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
});

interface EditProcessoFormProps {
  processo: Processo;
  onSuccess: () => void;
}

export function EditProcessoForm({
  processo,
  onSuccess,
}: EditProcessoFormProps) {
  const { toast } = useToast();

  const form = useForm<CreateProcesso>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: processo.name,
    },
  });

  async function onSubmit(values: CreateProcesso) {
    try {
      await ProcessService.update(processo.id, values);
      toast({
        title: 'Processo atualizado',
        description: 'O processo foi atualizado com sucesso.',
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar processo',
        description: 'Não foi possível atualizar o processo. Tente novamente.',
      });
      console.error('Erro ao atualizar o processo:', error);
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
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Salvar alterações</Button>
      </form>
    </Form>
  );
}
