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
import { Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  horasColaboradores: z.array(z.object({
    colaborador: z.string(),
    horas: z.number(),
  })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

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

export function NovaAtividadeForm({ editMode = false, atividadeInicial = null }) {
  const { toast } = useToast();
  const [tempoPrevisto, setTempoPrevisto] = useState<string>("");
  const [showHorasColaboradores, setShowHorasColaboradores] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editMode && atividadeInicial ? {
      ...atividadeInicial,
      horasColaboradores: atividadeInicial.equipe.map(col => ({
        colaborador: col,
        horas: 0
      }))
    } : {
      unidadeTempo: "horas",
      equipe: [],
      horasColaboradores: []
    },
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

        {showHorasColaboradores && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium">Horas trabalhadas por colaborador</h4>
            {form.watch("equipe")?.map((colaborador, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`horasColaboradores.${index}.horas`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{colaborador}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Horas trabalhadas"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        )}

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

        <FormField
          control={form.control}
          name="equipe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipe</FormLabel>
              <Select
                onValueChange={(value) => {
                  const currentValues = field.value || [];
                  if (!currentValues.includes(value)) {
                    field.onChange([...currentValues, value]);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione os colaboradores" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colaboradoresMock.map((colaborador) => (
                    <SelectItem key={colaborador.id} value={colaborador.nome}>
                      {colaborador.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("equipe")?.map((membro, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => {
                      const newEquipe = form.watch("equipe").filter((_, i) => i !== index);
                      form.setValue("equipe", newEquipe);
                    }}
                  >
                    {membro} ×
                  </Badge>
                ))}
              </div>
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
          <div>
            <FormLabel>Upload de Imagem (opcional)</FormLabel>
            <div className="mt-2 space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => form.setValue("imagem", e.target.files?.[0])}
                className="hidden"
                id="imagem"
              />
              <label
                htmlFor="imagem"
                className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
              >
                <span className="flex items-center space-x-2">
                  <Upload className="w-6 h-6 text-gray-600" />
                  <span className="text-sm text-gray-600">Clique para fazer upload de imagem</span>
                </span>
              </label>
              <FormField
                control={form.control}
                name="imagemDescricao"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Descrição da imagem (opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <FormLabel>Upload de Arquivo (opcional)</FormLabel>
            <div className="mt-2 space-y-2">
              <Input
                type="file"
                onChange={(e) => form.setValue("arquivo", e.target.files?.[0])}
                className="hidden"
                id="arquivo"
              />
              <label
                htmlFor="arquivo"
                className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
              >
                <span className="flex items-center space-x-2">
                  <Upload className="w-6 h-6 text-gray-600" />
                  <span className="text-sm text-gray-600">Clique para fazer upload de arquivo</span>
                </span>
              </label>
              <FormField
                control={form.control}
                name="arquivoDescricao"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Descrição do arquivo (opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
          {editMode ? "Salvar Alterações" : "Criar Atividade"}
        </Button>
      </form>
    </Form>
  );
}
