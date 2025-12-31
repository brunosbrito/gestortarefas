
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import valuePerPositionService, { ValuePerPosition } from "@/services/valuePerPositionService";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Esquema de validação
const formSchema = z.object({
  position: z.string().min(1, "O cargo é obrigatório"),
  value: z.coerce.number().min(0, "O valor deve ser maior ou igual a zero"),
});

type FormValues = z.infer<typeof formSchema>;

interface ValorPorCargoFormProps {
  valorParaEditar: ValuePerPosition | null;
  onSuccess: () => void;
}

export function ValorPorCargoForm({ valorParaEditar, onSuccess }: ValorPorCargoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues = valorParaEditar
    ? {
        position: valorParaEditar.position,
        value: valorParaEditar.value,
      }
    : {
        position: "",
        value: 0,
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (valorParaEditar) {
        await valuePerPositionService.update(valorParaEditar.id, {
          position: data.position,
          value: data.value
        });
        toast({
          title: "Valor atualizado",
          description: "O valor por cargo foi atualizado com sucesso.",
        });
      } else {
        await valuePerPositionService.create({
          position: data.position,
          value: data.value
        });
        toast({
          title: "Valor criado",
          description: "O valor por cargo foi criado com sucesso.",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Cargo <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome do cargo"
                  {...field}
                  className={cn(
                    form.formState.errors.position && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.position && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.position.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Valor (R$) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  className={cn(
                    form.formState.errors.value && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.value && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.value.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isSubmitting}
            className="h-11"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "h-11 font-semibold shadow-lg transition-all bg-primary hover:bg-primary/90",
              isSubmitting && "opacity-70"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{valorParaEditar ? "Atualizando..." : "Salvando..."}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{valorParaEditar ? "Atualizar" : "Salvar"}</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
