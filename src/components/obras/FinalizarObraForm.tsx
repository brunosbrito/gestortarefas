import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  endDate: z.string().min(1, "Data de finalização é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

interface FinalizarObraFormProps {
  onSubmit: (data: FormValues) => void;
}

export const FinalizarObraForm = ({ onSubmit }: FinalizarObraFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = async (data: FormValues) => {
    if (!data.endDate) {
      toast({
        variant: "destructive",
        title: "Data obrigatória",
        description: "Por favor, selecione a data de finalização.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 md:space-y-8">
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Data de Finalização <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className={cn(
                    form.formState.errors.endDate && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.endDate && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.endDate.message}
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
                <span>Finalizando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Finalizar Obra</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};