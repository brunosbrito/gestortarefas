import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Obra } from "@/interfaces/ObrasInterface";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./osFormSchema";

interface OSFormFieldsProps {
  form: UseFormReturn<FormValues>;
  obras: Obra[];
}

export const OSFormFields = ({ form, obras }: OSFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Input placeholder="Descrição da OS" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="projectId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Obra</FormLabel>
            <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {obras.map((obra) => (
                  <SelectItem key={obra.id} value={String(obra.id)}>
                    {obra.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="createdAt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Início</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  field.onChange(format(date, "yyyy-MM-dd"));
                }}
                value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="pausada">Pausada</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Observações adicionais"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};