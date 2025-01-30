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
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import ObrasService from "@/services/ObrasService";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  projectType: z.enum(["fabrica", "obra"], {
    required_error: "Tipo de projeto é obrigatório",
  }),
  projectId: z.string().min(1, "Projeto é obrigatório"),
  responsibleRNCId: z.string().min(1, "Responsável é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  serviceOrderId: z.string().min(1, "Ordem de serviço é obrigatória"),
  responsibleIdentification: z.string().optional(),
  dateOccurrence: z.string().min(1, "Data da ocorrência é obrigatória"),
});

interface NovaRNCFormProps {
  onSuccess?: () => void;
}

export function NovaRNCForm({ onSuccess }: NovaRNCFormProps) {
  const { toast } = useToast();

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: ObrasService.getAllObras,
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erro ao carregar projetos",
          description: "Não foi possível carregar a lista de projetos.",
        });
      },
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectType: "obra",
      projectId: "",
      responsibleRNCId: "",
      description: "",
      serviceOrderId: "",
      responsibleIdentification: "",
      dateOccurrence: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Valores do formulário:", values);
      
      toast({
        title: "RNC criada com sucesso",
        description: "O registro de não conformidade foi criado.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar RNC",
        description: "Ocorreu um erro ao criar o registro. Tente novamente.",
      });
    }
  };

  const filteredProjects = projects.filter(project => 
    form.watch("projectType") === "fabrica" 
      ? project.type === "factory" 
      : project.type === "construction"
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Projeto</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fabrica" id="fabrica" />
                    <label htmlFor="fabrica">Fábrica</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="obra" id="obra" />
                    <label htmlFor="obra">Obra</label>
                  </div>
                </RadioGroup>
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
              <FormLabel>Projeto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o projeto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredProjects.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
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
          name="serviceOrderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem de Serviço</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a OS" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">OS 001</SelectItem>
                  <SelectItem value="2">OS 002</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsibleRNCId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">João Silva</SelectItem>
                  <SelectItem value="2">Maria Santos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsibleIdentification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identificação do Responsável (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Digite a identificação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOccurrence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data da Ocorrência</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a não conformidade"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
        >
          Criar RNC
        </Button>
      </form>
    </Form>
  );
}