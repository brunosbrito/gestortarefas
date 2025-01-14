import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cargo: z.string().min(1, "Cargo é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  dataAdmissao: z.string().min(1, "Data de admissão é obrigatória"),
  status: z.enum(["ativo", "inativo"]),
});

type FormValues = z.infer<typeof formSchema>;

interface NovoColaboradorFormProps {
  onSuccess?: () => void;
}

export const NovoColaboradorForm = ({ onSuccess }: NovoColaboradorFormProps) => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "ativo",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Implementar a chamada à API aqui
      toast({
        title: "Colaborador adicionado",
        description: "O colaborador foi adicionado com sucesso.",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar colaborador",
        description: "Ocorreu um erro ao adicionar o colaborador.",
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
          name="cargo"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Digite o email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="Digite o telefone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataAdmissao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Admissão</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Adicionar Colaborador</Button>
      </form>
    </Form>
  );
};