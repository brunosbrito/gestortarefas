import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import valuePerPositionService, { ValuePerPosition } from "@/services/valuePerPositionService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export const colaboradorFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Cargo é obrigatório"),
  sector: z.string().optional(),
});

export type ColaboradorFormValues = z.infer<typeof colaboradorFormSchema>;

interface ColaboradorFormFieldsProps {
  form: UseFormReturn<ColaboradorFormValues>;
}

export const ColaboradorFormFields = ({ form }: ColaboradorFormFieldsProps) => {
  const [positions, setPositions] = useState<ValuePerPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPositions = async () => {
      setIsLoading(true);
      try {
        const data = await valuePerPositionService.getAll();
        setPositions(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar cargos',
          description: 'Não foi possível carregar a lista de cargos disponíveis.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, [toast]);

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input placeholder="Digite o nome" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cargo</FormLabel>
            <FormControl>
              {isLoading ? (
                <Input placeholder="Carregando cargos..." disabled />
              ) : (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.length === 0 ? (
                      <SelectItem value="sem-cargos" disabled>
                        Nenhum cargo cadastrado
                      </SelectItem>
                    ) : (
                      positions.map((position) => (
                        <SelectItem key={position.id} value={position.position}>
                          {position.position}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sector"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Setor</FormLabel>
            <FormControl>
              <Input placeholder="Digite o setor" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};