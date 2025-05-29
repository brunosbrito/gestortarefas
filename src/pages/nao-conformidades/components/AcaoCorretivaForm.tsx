
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import ColaboradorService from "@/services/ColaboradorService";
import NonConformityService from "@/services/NonConformityService";
import { NonConformity } from "@/interfaces/RncInterface";
import { useToast } from "@/hooks/use-toast";
import { Colaborador } from "@/interfaces/ColaboradorInterface";

const formSchema = z.object({
  correctiveAction: z.string().min(1, "Ação corretiva é obrigatória"),
  responsibleAction: z.string().min(1, "Responsável é obrigatório"),
  dateConclusion: z.string().min(1, "Data de conclusão é obrigatória"),
});

interface AcaoCorretivaFormProps {
  rnc: NonConformity;
  onClose: () => void;
  onUpdate?: () => void;
}

export function AcaoCorretivaForm({ rnc, onClose, onUpdate }: AcaoCorretivaFormProps) {
  const { toast } = useToast();

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: async () => {
      const response = await ColaboradorService.getAllColaboradores();
      return response.data as Colaborador[];
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      correctiveAction: rnc.correctiveAction || "",
      responsibleAction: rnc.responsibleAction?.id?.toString() || "",
      dateConclusion: rnc.dateConclusion ? new Date(rnc.dateConclusion).toISOString().split('T')[0] : "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await NonConformityService.update(rnc.id, {
        correctiveAction: values.correctiveAction,
        responsibleAction: values.responsibleAction,
        dateConclusion: values.dateConclusion,
      });

      toast({
        title: "Ação corretiva atualizada",
        description: "A ação corretiva foi salva com sucesso.",
      });

      onUpdate?.();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar ação corretiva.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="correctiveAction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ação Corretiva</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a ação corretiva..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsibleAction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável pela Ação</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colaboradores.map((colaborador) => (
                    <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                      {colaborador.name}
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
          name="dateConclusion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Conclusão</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
