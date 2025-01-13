import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Obra } from "@/interfaces/ObrasInterface";
import { useToast } from "@/hooks/use-toast";
import ObrasService from "@/services/ObrasService";

const formSchema = z.object({
  name: z.string().min(1, "Nome da obra é obrigatório"),
  groupNumber: z.string().min(1, "Número do grupo é obrigatório"),
  client: z.string().min(1, "Cliente é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  observation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditObraFormProps {
  obra: Obra;
  onSuccess: () => void;
}

export const EditObraForm = ({ obra, onSuccess }: EditObraFormProps) => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: obra.name,
      groupNumber: obra.groupNumber,
      client: obra.client,
      address: obra.address,
      startDate: obra.startDate,
      observation: obra.observation || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (obra.id) {
        await ObrasService.updateObra(obra.id, {
          ...obra,
          ...data,
        });
        toast({
          title: "Obra atualizada",
          description: "As informações da obra foram atualizadas com sucesso.",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar obra",
        description: "Não foi possível atualizar as informações da obra.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Obra</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da obra" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="groupNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do Grupo</FormLabel>
              <FormControl>
                <Input placeholder="Digite o número do grupo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Digite o endereço completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Início</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Digite observações adicionais sobre a obra"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
          Atualizar Obra
        </Button>
      </form>
    </Form>
  );
};