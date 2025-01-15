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
import { CreateTarefaMacro } from "@/interfaces/TarefaMacroInterface"
import TarefaMacroService from "@/services/TarefaMacroService"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
})

interface NovaTarefaMacroFormProps {
  onTarefaCreated: () => void
}

export function NovaTarefaMacroForm({ onTarefaCreated }: NovaTarefaMacroFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  async function onSubmit(values: CreateTarefaMacro) {
    try {
      const response = await TarefaMacroService.create(values);
      toast({
        title: "Tarefa Macro criada",
        description: "Tarefa Macro criada com sucesso.",
      });

      onTarefaCreated();
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar Tarefa Macro",
        description: "Não foi possível criar a tarefa macro. Por favor, tente novamente.",
      });
  
      console.error('Erro ao criar a tarefa macro:', error);
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

        <Button type="submit" className="w-full">Criar Tarefa Macro</Button>
      </form>
    </Form>
  )
}