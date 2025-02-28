
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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import RncService from "@/services/NonConformityService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Colaborador } from "@/interfaces/ColaboradorInterface";
import ColaboradorService from "@/services/ColaboradorService";

const acaoCorretivaSchema = z.object({
  correctiveAction: z.string().min(1, "Ação corretiva é obrigatória"),
  responsibleAction: z.string().min(1, "Responsável é obrigatório"),
  dateConclusion: z.string().optional(),
});

interface AcaoCorretivaFormProps {
  rncId: string;
  onClose: () => void;
}

export function AcaoCorretivaForm({ rncId, onClose }: AcaoCorretivaFormProps) {
  const { toast } = useToast();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  const form = useForm<z.infer<typeof acaoCorretivaSchema>>({
    resolver: zodResolver(acaoCorretivaSchema),
    defaultValues: {
      correctiveAction: "",
      responsibleAction: "",
      dateConclusion: "",
    },
  });

  useEffect(() => {
    const loadColaboradores = async () => {
      try {
        const response = await ColaboradorService.getAllColaboradores();
        setColaboradores(response.data);
      } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
      }
    };

    loadColaboradores();
  }, []);

  const onSubmit = async (data: z.infer<typeof acaoCorretivaSchema>) => {
    try {
      await RncService.updateRnc(rncId, data);
      toast({
        title: "Ação corretiva registrada",
        description: "A ação corretiva foi registrada com sucesso.",
      });
      onClose();
    } catch (error) {
      console.error("Erro ao registrar ação corretiva:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao registrar a ação corretiva.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="correctiveAction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ação Corretiva</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a ação corretiva..."
                  className="min-h-[100px]"
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

        <Button type="submit" className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
          Registrar Ação Corretiva
        </Button>
      </form>
    </Form>
  );
}
