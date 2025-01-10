import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn } from "react-hook-form";

interface EquipeFieldProps {
  form: UseFormReturn<any>;
  colaboradoresMock: Array<{ id: number; nome: string }>;
}

export function EquipeField({ form, colaboradoresMock }: EquipeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="equipe"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Equipe</FormLabel>
          <Select
            onValueChange={(value) => {
              const currentValues = field.value || [];
              if (!currentValues.includes(value)) {
                field.onChange([...currentValues, value]);
              }
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione os colaboradores" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {colaboradoresMock.map((colaborador) => (
                <SelectItem key={colaborador.id} value={colaborador.nome}>
                  {colaborador.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.watch("equipe")?.map((membro: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => {
                  const newEquipe = form.watch("equipe").filter((_: string, i: number) => i !== index);
                  form.setValue("equipe", newEquipe);
                }}
              >
                {membro} ×
              </Badge>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}