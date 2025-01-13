import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertDialogCancel, AlertDialogAction, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  endDate: z.string().min(1, "Data de finalização é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

interface FinalizarObraFormProps {
  onSubmit: (data: FormValues) => void;
}

export const FinalizarObraForm = ({ onSubmit }: FinalizarObraFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Finalização</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction type="submit" className="bg-green-600 hover:bg-green-700">
            Confirmar Finalização
          </AlertDialogAction>
        </AlertDialogFooter>
      </form>
    </Form>
  );
};