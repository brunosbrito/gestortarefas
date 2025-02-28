
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateWorkforce } from "@/interfaces/RncInterface";
import { Dispatch, SetStateAction } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Função é obrigatória"),
  entryExit: z.string().min(1, "Horário entrada/saída é obrigatório"),
  interval: z.string().min(1, "Intervalo é obrigatório"),
  hours: z.string().min(1, "Horas trabalhadas é obrigatório"),
});

interface MaoObraFormProps {
  workforce: CreateWorkforce[];
  onWorkforceChange: Dispatch<SetStateAction<CreateWorkforce[]>>;
  onNext: () => void;
  onBack: () => void;
}

export function MaoObraForm({ workforce, onWorkforceChange, onNext, onBack }: MaoObraFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      entryExit: "",
      interval: "",
      hours: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onWorkforceChange([...workforce, values]);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Funcionário</FormLabel>
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
              <FormLabel>Função</FormLabel>
              <FormControl>
                <Input placeholder="Digite a função" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entryExit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário Entrada/Saída</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 07:30 - 17:30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intervalo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 01:00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horas Trabalhadas</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 09:00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button type="submit" className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
            Adicionar
          </Button>
          <Button type="button" onClick={onNext} className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
            Próximo
          </Button>
        </div>

        {workforce.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Mão de obra adicionada:</h3>
            <ul className="space-y-2">
              {workforce.map((worker, index) => (
                <li key={index} className="p-2 bg-gray-100 rounded">
                  {worker.name} - {worker.role}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </Form>
  );
}
