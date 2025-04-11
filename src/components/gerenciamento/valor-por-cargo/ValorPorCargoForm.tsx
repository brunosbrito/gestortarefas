
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import valuePerPositionService, { ValuePerPosition } from "@/services/valuePerPositionService";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
        // Para atualização, garantimos que os campos obrigatórios estejam presentes
        await valuePerPositionService.update(valorParaEditar.id, {
          position: data.position,
          value: data.value
        });
        toast({
          title: "Valor atualizado",
          description: "O valor por cargo foi atualizado com sucesso.",
        });
      } else {
        // Para criação, passamos todos os campos obrigatórios
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do cargo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  step="0.01" 
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/80 text-white">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {valorParaEditar ? "Atualizar" : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
