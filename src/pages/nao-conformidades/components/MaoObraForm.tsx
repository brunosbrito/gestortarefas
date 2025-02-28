
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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  funcao: z.string().min(1, "Função é obrigatória"),
  horas: z.string().min(1, "Horas trabalhadas é obrigatório"),
});

interface MaoObraFormProps {
  rncId: string;
  onClose: () => void;
}

export function MaoObraForm({ rncId, onClose }: MaoObraFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      funcao: "",
      horas: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // TODO: Implementar a lógica de salvamento
      console.log("Dados da mão de obra:", values);
      
      toast({
        title: "Mão de obra adicionada",
        description: "Os dados foram salvos com sucesso.",
      });
      
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
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
          name="funcao"
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
          name="horas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horas Trabalhadas</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Digite as horas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
