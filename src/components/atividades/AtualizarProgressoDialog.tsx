import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { updateCompletedQuantity } from '@/services/ActivityService';

const formSchema = z.object({
  completedQuantity: z
    .number()
    .min(0, 'A quantidade deve ser maior ou igual a 0'),
});

type FormValues = z.infer<typeof formSchema>;

interface AtualizarProgressoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atividade: {
    id: number;
    quantity: number;
    completedQuantity?: number;
  };
  onSuccess: () => void;
}

export function AtualizarProgressoDialog({
  open,
  onOpenChange,
  atividade,
  onSuccess,
}: AtualizarProgressoDialogProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      completedQuantity: atividade.completedQuantity || 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (data.completedQuantity > atividade.quantity) {
        toast({
          variant: 'destructive',
          title: 'Erro ao atualizar progresso',
          description:
            'A quantidade concluída não pode ser maior que a quantidade total.',
        });
        return;
      }
      const userId = Number(localStorage.getItem('userId'));
      await updateCompletedQuantity(
        atividade.id,
        data.completedQuantity,
        userId
      );

      toast({
        title: 'Progresso atualizado',
        description: 'O progresso da atividade foi atualizado com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar progresso',
        description: 'Ocorreu um erro ao atualizar o progresso da atividade.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atualizar Progresso</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="completedQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade Concluída</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={atividade.quantity}
                      placeholder="Digite a quantidade concluída"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
            >
              Confirmar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
