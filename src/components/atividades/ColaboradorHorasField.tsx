import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface ColaboradorHorasFieldProps {
  form: UseFormReturn<any>;
  colaboradores: string[];
  showHorasColaboradores: boolean;
}

export function ColaboradorHorasField({ form, colaboradores, showHorasColaboradores }: ColaboradorHorasFieldProps) {
  if (!showHorasColaboradores) return null;

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium">Horas trabalhadas por colaborador</h4>
      {colaboradores?.map((colaborador, index) => (
        <FormField
          key={index}
          control={form.control}
          name={`horasColaboradores.${index}.horas`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{colaborador}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Horas trabalhadas"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}