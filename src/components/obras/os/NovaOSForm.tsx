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
import { createServiceOrder } from "@/services/ServiceOrderService";
import { CreateServiceOrder } from "@/interfaces/ServiceOrderInterface";

const formSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  projectId: z.number().min(1, "Obra é obrigatória"),
  createdAt: z.string().min(1, "Data de início é obrigatória"),
  status: z.enum(["em_andamento", "concluida", "pausada"]),
  notes: z.string().optional(),
  assignedUser: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NovaOSFormProps {
  onSubmit: (data: CreateServiceOrder) => void;
}

function getUserIdFromLocalStorage(): number {
  const userId = localStorage.getItem("userId");
  return userId ? parseInt(userId) : null;
}

export const NovaOSForm = ({ onSubmit }: NovaOSFormProps) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "em_andamento",
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

  const handleSubmit = async (data: FormValues) => {
    const userId = getUserIdFromLocalStorage();
    
    const serviceOrderData: CreateServiceOrder = {
      description: data.description,
      projectId: data.projectId,
      status: data.status,
      notes: data.notes,
      assignedUser: userId || undefined
    };

    try {
      await createServiceOrder(serviceOrderData);
      
      toast({
        variant: "default",
        title: "Ordem de Serviço criada",
        description: "A nova ordem de serviço foi criada com sucesso.",
      });

      onSubmit(serviceOrderData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar Ordem de Serviço",
        description: "Não foi possível criar a ordem de serviço.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="description"
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
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Obra</FormLabel>
              <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
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
          name="createdAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Início</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    field.onChange(format(date, "yyyy-MM-dd")); // Mantém o formato YYYY-MM-DD para o input
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
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
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
});
