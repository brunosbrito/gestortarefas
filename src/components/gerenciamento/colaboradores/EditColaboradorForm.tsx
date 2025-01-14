import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Colaborador } from "@/interfaces/ColaboradorInterface";
import { ColaboradorFormFields, colaboradorFormSchema, ColaboradorFormValues } from "./ColaboradorFormFields";

interface EditColaboradorFormProps {
  colaborador: Colaborador;
  onSuccess: () => void;
}

export const EditColaboradorForm = ({ colaborador, onSuccess }: EditColaboradorFormProps) => {
  const { toast } = useToast();
  const form = useForm<ColaboradorFormValues>({
    resolver: zodResolver(colaboradorFormSchema),
    defaultValues: {
      nome: colaborador.nome,
      cargo: colaborador.cargo,
      email: colaborador.email,
      telefone: colaborador.telefone,
      dataAdmissao: colaborador.dataAdmissao,
      status: colaborador.status,
    },
  });

  const onSubmit = async (data: ColaboradorFormValues) => {
    try {
      // Implementar a chamada à API aqui
      toast({
        title: "Colaborador atualizado",
        description: "As informações do colaborador foram atualizadas com sucesso.",
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar colaborador",
        description: "Ocorreu um erro ao atualizar as informações do colaborador.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ColaboradorFormFields form={form} />
        <Button type="submit" className="w-full">Atualizar Colaborador</Button>
      </form>
    </Form>
  );
};
