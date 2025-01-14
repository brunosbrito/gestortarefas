import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ColaboradorFormFields, colaboradorFormSchema, ColaboradorFormValues } from "./ColaboradorFormFields";

interface NovoColaboradorFormProps {
  onSuccess?: () => void;
}

export const NovoColaboradorForm = ({ onSuccess }: NovoColaboradorFormProps) => {
  const { toast } = useToast();
  const form = useForm<ColaboradorFormValues>({
    resolver: zodResolver(colaboradorFormSchema),
    defaultValues: {
      status: "ativo",
    },
  });

  const onSubmit = async (data: ColaboradorFormValues) => {
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
        <ColaboradorFormFields form={form} />
        <Button type="submit" className="w-full">Adicionar Colaborador</Button>
      </form>
    </Form>
  );
};
