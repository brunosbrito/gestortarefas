
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
  imagem: z.string().min(1, "Imagem é obrigatória"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
});

interface ImagensFormProps {
  rncId: string;
  onClose: () => void;
}

export function ImagensForm({ rncId, onClose }: ImagensFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imagem: "",
      descricao: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // TODO: Implementar a lógica de salvamento
      console.log("Dados da imagem:", values);
      
      toast({
        title: "Imagem adicionada",
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
          name="imagem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Digite uma descrição para a imagem" {...field} />
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
