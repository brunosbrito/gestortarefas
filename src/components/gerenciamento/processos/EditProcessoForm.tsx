import { useState } from 'react';
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
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProcesso>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: processo.name,
    },
  });

  async function onSubmit(values: CreateProcesso) {
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Nome <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome do processo"
                  {...field}
                  className={cn(
                    form.formState.errors.name && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.name && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.name.message}
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
                <span>Salvando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Salvar Alterações</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
