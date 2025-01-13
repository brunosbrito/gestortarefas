import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  endDate: z.string().min(1, "Data de finalização é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

interface FinalizarObraFormProps {
  onSubmit: (data: { endDate: string }) => void;
}

export const FinalizarObraForm = ({ onSubmit }: FinalizarObraFormProps) => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = (data: FormValues) => {
    if (!data.endDate) {
      toast({
        variant: "destructive",
        title: "Data obrigatória",
        description: "Por favor, selecione a data de finalização.",
      });
      return;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
        <Button type="submit" className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
          Finalizar Obra
        </Button>
      </form>
    </Form>
  );
};