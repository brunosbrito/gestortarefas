"use client"

import { useState } from "react"
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
import { TarefaMacro, CreateTarefaMacro } from "@/interfaces/TarefaMacroInterface"
import TarefaMacroService from "@/services/TarefaMacroService"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
})

interface EditTarefaMacroFormProps {
  tarefa: TarefaMacro;
  onSuccess: () => void;
}

export function EditTarefaMacroForm({ tarefa, onSuccess }: EditTarefaMacroFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTarefaMacro>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tarefa.name,
    },
  })

  async function onSubmit(values: CreateTarefaMacro) {
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Nome da Tarefa <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome da tarefa"
                  {...field}
                  className={cn(
                    form.formState.errors.name && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.name && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.name.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full h-11 font-semibold shadow-lg transition-all bg-primary hover:bg-primary/90",
              isSubmitting && "opacity-70"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Salvando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Salvar Alterações</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}