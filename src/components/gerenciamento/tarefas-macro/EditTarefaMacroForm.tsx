"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { TarefaMacro } from "@/interfaces/TarefaMacroInterface"
import TarefaMacroService from "@/services/TarefaMacroService"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
})

interface EditTarefaMacroFormProps {
  tarefa: TarefaMacro;
  onSuccess: () => void;
}

export function EditTarefaMacroForm({ tarefa, onSuccess }: EditTarefaMacroFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tarefa.name,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await TarefaMacroService.update(String(tarefa.id), values);
      toast({
        title: "Tarefa Macro atualizada",
        description: "Tarefa Macro atualizada com sucesso.",
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar Tarefa Macro",
        description: "Não foi possível atualizar a tarefa macro. Por favor, tente novamente.",
      });
      console.error('Erro ao atualizar a tarefa macro:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Tarefa</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da tarefa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Salvar Alterações</Button>
      </form>
    </Form>
  )
}