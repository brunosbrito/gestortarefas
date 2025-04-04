
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

export const colaboradorFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Cargo é obrigatório"),
  pricePerHour: z.string().refine(
    (value) => {
      const numValue = Number(value.replace(/[^\d,]/g, '').replace(',', '.'));
      return !isNaN(numValue) && numValue >= 0;
    },
    {
      message: "Valor por hora deve ser um número válido",
    }
  ),
});

export type ColaboradorFormValues = z.infer<typeof colaboradorFormSchema>;

interface ColaboradorFormFieldsProps {
  form: UseFormReturn<ColaboradorFormValues>;
}

export const ColaboradorFormFields = ({ form }: ColaboradorFormFieldsProps) => {
  const [formattedValue, setFormattedValue] = useState(() => {
    const value = form.getValues("pricePerHour");
    if (value) {
      const numValue = parseFloat(value);
      return !isNaN(numValue) 
        ? numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : "";
    }
    return "";
  });

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Permitir dígitos e vírgula
    if (!/^[\d,]*$/.test(value)) {
      return;
    }
    
    // Remove formatação anterior
    value = value.replace(/\./g, '');
    
    // Garante apenas uma vírgula
    const commaCount = (value.match(/,/g) || []).length;
    if (commaCount > 1) {
      const parts = value.split(',');
      value = parts[0] + ',' + parts.slice(1).join('');
    }

    setFormattedValue(value);
    
    // Salva o valor sem formatação no formulário
    const cleanValue = value.replace(',', '.');
    form.setValue("pricePerHour", cleanValue, { shouldValidate: true });
  };

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
              <Input placeholder="Digite o cargo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pricePerHour"
        render={() => (
          <FormItem>
            <FormLabel>Valor por Hora</FormLabel>
            <FormControl>
              <Input 
                placeholder="0,00"
                value={formattedValue}
                onChange={handleValueChange}
                type="text"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
