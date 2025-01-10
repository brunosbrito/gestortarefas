import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileUploadField } from "./FileUploadField";
import { ColaboradorHorasField } from "./ColaboradorHorasField";
import { EquipeField } from "./EquipeField";

const formSchema = z.object({
  tarefaMacro: z.string().min(1, "Tarefa macro é obrigatória"),
  processo: z.string().min(1, "Processo é obrigatório"),
  atividade: z.string().min(1, "Atividade é obrigatória"),
  unidade: z.number().min(1, "Unidade é obrigatória"),
  tempoPorUnidade: z.number().min(1, "Tempo por unidade é obrigatório"),
  unidadeTempo: z.enum(["minutos", "horas"]),
  equipe: z.array(z.string()).min(1, "Selecione pelo menos um colaborador"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  observacao: z.string().optional(),
  imagem: z.any().optional(),
  imagemDescricao: z.string().optional(),
  arquivo: z.any().optional(),
  arquivoDescricao: z.string().optional(),
});

const tarefasMacroMock = [
  { id: 1, nome: "Fundação" },
  { id: 2, nome: "Estrutura" },
  { id: 3, nome: "Acabamento" },
];

const processosMock = [
  { id: 1, nome: "Escavação" },
  { id: 2, nome: "Concretagem" },
  { id: 3, nome: "Alvenaria" },
];

const colaboradoresMock = [
  { id: 1, nome: "João Silva" },
  { id: 2, nome: "Maria Santos" },
  { id: 3, nome: "Pedro Oliveira" },
];

type FormValues = z.infer<typeof formSchema>;

interface NovaAtividadeFormProps {
  editMode?: boolean;
  atividadeInicial?: any;
}

export function NovaAtividadeForm({ editMode = false, atividadeInicial }: NovaAtividadeFormProps) {
  const { toast } = useToast();
  const [tempoPrevisto, setTempoPrevisto] = useState<string>("");
  const [showHorasColaboradores, setShowHorasColaboradores] = useState(false);

  const defaultValues = editMode && atividadeInicial ? {
    ...atividadeInicial,
    equipe: atividadeInicial.equipe || []
  } : {
    unidadeTempo: "horas",
    equipe: [],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const calcularTempoPrevisto = (unidade: number, tempoPorUnidade: number, unidadeTempo: "minutos" | "horas") => {
    const tempoTotal = unidade * tempoPorUnidade;
    if (unidadeTempo === "minutos") {
      const horas = Math.floor(tempoTotal / 60);
      const minutos = tempoTotal % 60;
      return `${horas}h${minutos}min`;
    }
    return `${tempoTotal}h`;
  };

  const handleCalculoTempo = () => {
    const unidade = form.watch("unidade");
    const tempoPorUnidade = form.watch("tempoPorUnidade");
    const unidadeTempo = form.watch("unidadeTempo");

    if (unidade && tempoPorUnidade && unidadeTempo) {
      const tempo = calcularTempoPrevisto(unidade, tempoPorUnidade, unidadeTempo);
      setTempoPrevisto(tempo);
    }
  };

  const handleTarefaMacroChange = (value: string) => {
    if (editMode) {
      setShowHorasColaboradores(true);
    }
    form.setValue("tarefaMacro", value);
  };

  const handleProcessoChange = (value: string) => {
    if (editMode) {
      setShowHorasColaboradores(true);
    }
    form.setValue("processo", value);
  };

  const onSubmit = (data: FormValues) => {
    console.log(data);
    toast({
      title: editMode ? "Atividade atualizada com sucesso!" : "Atividade criada com sucesso!",
      description: editMode ? "As alterações foram salvas." : "A atividade foi adicionada ao quadro.",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tarefaMacro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarefa Macro</FormLabel>
              <Select onValueChange={handleTarefaMacroChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a tarefa macro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tarefasMacroMock.map((tarefa) => (
                    <SelectItem key={tarefa.id} value={tarefa.nome}>
                      {tarefa.nome}
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
          name="processo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processo</FormLabel>
              <Select onValueChange={handleProcessoChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o processo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {processosMock.map((processo) => (
                    <SelectItem key={processo.id} value={processo.nome}>
                      {processo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <ColaboradorHorasField 
          form={form} 
          colaboradores={form.watch("equipe") || []} 
          showHorasColaboradores={showHorasColaboradores}
        />

        <FormField
          control={form.control}
          name="atividade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Atividade</FormLabel>
              <FormControl>
                <Input placeholder="Digite a atividade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade/Peça</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                      handleCalculoTempo();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="tempoPorUnidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo por Unidade</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        handleCalculoTempo();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unidadeTempo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <Select onValueChange={(value: "minutos" | "horas") => {
                    field.onChange(value);
                    handleCalculoTempo();
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="minutos">Minutos</SelectItem>
                      <SelectItem value="horas">Horas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-gray-100 p-2 rounded">
          <p className="text-sm font-medium">Tempo Previsto: {tempoPrevisto}</p>
        </div>

        <EquipeField form={form} colaboradoresMock={colaboradoresMock} />

        <FormField
          control={form.control}
          name="dataInicio"
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
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite uma observação (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FileUploadField form={form} fileType="imagem" accept="image/*" />
          <FileUploadField form={form} fileType="arquivo" />
        </div>

        <Button type="submit" className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
          {editMode ? "Salvar Alterações" : "Criar Atividade"}
        </Button>
      </form>
    </Form>
  );
}