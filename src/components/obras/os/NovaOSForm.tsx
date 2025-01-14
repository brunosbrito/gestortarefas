import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Obra } from "@/interfaces/ObrasInterface";
import ObrasService from "@/services/ObrasService";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  numero: z.string().min(1, "Número da OS é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  obra: z.string().min(1, "Obra é obrigatória"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  status: z.enum(["EM_ANDAMENTO", "CONCLUIDA", "PAUSADA"]),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NovaOSFormProps {
  onSubmit: (data: FormValues) => void;
}

export const NovaOSForm = ({ onSubmit }: NovaOSFormProps) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "EM_ANDAMENTO",
    },
  });

  useEffect(() => {
    const fetchObras = async () => {
      try {
        const obrasData = await ObrasService.getAllObras();
        setObras(obrasData || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar obras",
          description: "Não foi possível carregar a lista de obras.",
        });
      }
    };

    fetchObras();
  }, [toast]);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número da OS</FormLabel>
              <FormControl>
                <Input placeholder="OS-001" {...field} />
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
                <Input placeholder="Descrição da OS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="obra"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Obra</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {obras.map((obra) => (
                    <SelectItem key={obra.id} value={String(obra.id)}>
                      {obra.name}
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
          name="dataInicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Início</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    field.onChange(format(date, "yyyy-MM-dd"));
                  }}
                  value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                />
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
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                  <SelectItem value="PAUSADA">Pausada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Criar OS</Button>
      </form>
    </Form>
  );
};