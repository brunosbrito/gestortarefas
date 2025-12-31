import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  horasColaboradores: z.array(
    z.object({
      colaborador: z.string(),
      horas: z.number().min(0, 'Horas não podem ser negativas'),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface AtualizarHorasFormProps {
  atividade: {
    equipe?: string[]; // Lista de colaboradores
  };
}

export function AtualizarHorasForm({ atividade }: AtualizarHorasFormProps) {
  console.log(atividade);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = {
    horasColaboradores:
      atividade.equipe?.map((colaborador) => ({
        colaborador,
        horas: 0,
      })) || [],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const validateForm = (values: FormValues) => {
    const allHorasPreenchidas = values.horasColaboradores.every(
      (item) => item.horas > 0
    );
    setIsValid(allHorasPreenchidas);
    return allHorasPreenchidas;
  };

  const onSubmit = async (data: FormValues) => {
    if (!validateForm(data)) {
      toast({
        title: 'Atenção',
        description:
          'Preencha as horas de todos os colaboradores antes de confirmar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(data);
      toast({
        title: 'Horas atualizadas com sucesso!',
        description: 'As horas trabalhadas foram registradas.',
      });
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        <div className="space-y-4">
          {form.watch('horasColaboradores').map((campo, index) => (
            <div
              key={index}
              className="flex gap-4 items-center bg-muted/30 p-4 rounded-lg"
            >
              <FormField
                control={form.control}
                name={`horasColaboradores.${index}.colaborador`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="font-medium">Colaborador</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`horasColaboradores.${index}.horas`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="font-medium">
                      Horas Trabalhadas <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                          validateForm(form.getValues());
                        }}
                        className={cn(
                          "bg-background",
                          form.formState.errors.horasColaboradores?.[index]?.horas &&
                          "border-destructive bg-destructive/5"
                        )}
                      />
                    </FormControl>
                    {form.formState.errors.horasColaboradores?.[index]?.horas && (
                      <FormMessage className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {form.formState.errors.horasColaboradores[index].horas.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        {showForm && (
          <div className="pt-4">
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={cn(
                "w-full h-11 font-semibold shadow-lg transition-all bg-primary hover:bg-primary/90",
                (isSubmitting || !isValid) && "opacity-70"
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Atualizando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Atualizar Horas</span>
                </div>
              )}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
