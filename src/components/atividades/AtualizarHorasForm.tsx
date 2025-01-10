import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  horasColaboradores: z.array(z.object({
    colaborador: z.string(),
    horas: z.number().min(0, "Horas não podem ser negativas"),
  })),
});

type FormValues = z.infer<typeof formSchema>;

interface AtualizarHorasFormProps {
  atividade: {
    equipe?: string[];
    tarefaMacro: string;
    processo: string;
  };
}

export function AtualizarHorasForm({ atividade }: AtualizarHorasFormProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(true);

  const defaultValues = {
    horasColaboradores: atividade.equipe?.map(colaborador => ({
      colaborador,
      horas: 0
    })) || []
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    toast({
      title: "Horas atualizadas com sucesso!",
      description: "As horas trabalhadas foram registradas.",
    });
    setShowForm(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <p className="text-sm font-medium">Tarefa Macro: {atividade.tarefaMacro}</p>
          <p className="text-sm font-medium">Processo: {atividade.processo}</p>
        </div>
        
        <div className="space-y-4">
          {form.watch("horasColaboradores").map((campo, index) => (
            <div key={index} className="flex gap-4 items-center">
              <FormField
                control={form.control}
                name={`horasColaboradores.${index}.colaborador`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Colaborador</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`horasColaboradores.${index}.horas`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Horas Trabalhadas</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
          Atualizar Horas
        </Button>
      </form>
    </Form>
  );
}