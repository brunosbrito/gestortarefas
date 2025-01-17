import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  turno: z.string({ required_error: "Selecione o turno" }),
  tipo: z.string({ required_error: "Selecione o tipo de registro" }),
  colaborador: z.string({ required_error: "Selecione o colaborador" }),
  obra: z.string().optional(),
  setor: z.string().optional(),
  motivoFalta: z.string().optional(),
}).refine((data) => {
  if (data.tipo === "PRODUCAO" && !data.obra) {
    return false;
  }
  if (data.tipo === "ADMINISTRATIVO" && !data.setor) {
    return false;
  }
  if (data.tipo === "FALTA" && !data.motivoFalta) {
    return false;
  }
  return true;
}, {
  message: "Preencha todos os campos obrigatórios",
  path: ["tipo"]
});

interface PontoFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  obras: string[];
  colaboradores: string[];
  onClose: () => void;
  defaultValues?: z.infer<typeof formSchema>;
  isEdit?: boolean;
}

export const PontoForm = ({ onSubmit, obras, colaboradores, onClose, defaultValues, isEdit = false }: PontoFormProps) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      turno: "",
      tipo: "",
      colaborador: "",
      obra: "",
      setor: "",
      motivoFalta: "",
    }
  });

  const tipoRegistro = form.watch("tipo") as "PRODUCAO" | "ADMINISTRATIVO" | "FALTA";

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
    form.reset();
    onClose();
    toast.success(isEdit ? "Registro atualizado com sucesso" : "Registro adicionado com sucesso");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="turno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turno</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1º Turno (06:00 - 14:00)</SelectItem>
                  <SelectItem value="2">2º Turno (14:00 - 22:00)</SelectItem>
                  <SelectItem value="3">Turno Central (08:00 - 17:00)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Registro</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PRODUCAO">Produção</SelectItem>
                  <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                  <SelectItem value="FALTA">Falta</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="colaborador"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colaborador</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o colaborador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colaboradores.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {tipoRegistro === "PRODUCAO" && (
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
                    {obras.map(obra => (
                      <SelectItem key={obra} value={obra}>{obra}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {tipoRegistro === "ADMINISTRATIVO" && (
          <FormField
            control={form.control}
            name="setor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Setor</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o setor" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {tipoRegistro === "FALTA" && (
          <FormField
            control={form.control}
            name="motivoFalta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo da Falta</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o motivo da falta" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full">
          {isEdit ? "Salvar Alterações" : "Salvar Registro"}
        </Button>
      </form>
    </Form>
  );
};
