import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Processo, CreateProcesso } from "@/interfaces/ProcessoInterface"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  descricao: z.string().min(1, "A descrição é obrigatória"),
  status: z.enum(["ativo", "inativo"]),
})

interface EditProcessoFormProps {
  processo: Processo
  onSuccess: () => void
}

export function EditProcessoForm({ processo, onSuccess }: EditProcessoFormProps) {
  const { toast } = useToast()

  const form = useForm<CreateProcesso>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: processo.nome,
      descricao: processo.descricao,
      status: processo.status,
      etapas: processo.etapas,
    },
  })

  async function onSubmit(values: CreateProcesso) {
    try {
      // Aqui você implementará a chamada para atualizar o processo
      // await ProcessoService.update(String(processo.id), values)
      toast({
        title: "Processo atualizado",
        description: "O processo foi atualizado com sucesso.",
      })
      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar processo",
        description: "Não foi possível atualizar o processo. Tente novamente.",
      })
      console.error("Erro ao atualizar o processo:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
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
              <FormControl>
                <select
                  {...field}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Salvar alterações</Button>
      </form>
    </Form>
  )
}