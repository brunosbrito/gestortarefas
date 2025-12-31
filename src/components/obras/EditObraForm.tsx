import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Obra } from "@/interfaces/ObrasInterface";
import { useToast } from "@/hooks/use-toast";
import ObrasService from "@/services/ObrasService";
import { Building2, Users, MapPin, Calendar, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Nome da obra é obrigatório"),
  groupNumber: z.string().min(1, "Número do grupo é obrigatório"),
  client: z.string().min(1, "Cliente é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  observation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FormSectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

const FormSection = ({ icon: Icon, title, children }: FormSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
    </div>
    <div className="space-y-4 pl-6 border-l-2 border-border/30">
      {children}
    </div>
  </div>
);

interface EditObraFormProps {
  obra: Obra;
  onSuccess: () => void;
}

export const EditObraForm = ({ obra, onSuccess }: EditObraFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: obra.name,
      groupNumber: obra.groupNumber,
      client: obra.client,
      address: obra.address,
      startDate: obra.startDate,
      observation: obra.observation || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (obra.id) {
        await ObrasService.updateObra(obra.id, {
          ...obra,
          ...data,
        });
        toast({
          title: "Obra atualizada",
          description: "As informações da obra foram atualizadas com sucesso.",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar obra",
        description: "Não foi possível atualizar as informações da obra.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        {/* Seção: Informações Básicas */}
        <FormSection icon={Building2} title="Informações Básicas">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Nome da Obra <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o nome da obra"
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

          <FormField
            control={form.control}
            name="groupNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Número do Grupo <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o número do grupo"
                    {...field}
                    className={cn(
                      form.formState.errors.groupNumber && "border-destructive bg-destructive/5"
                    )}
                  />
                </FormControl>
                {form.formState.errors.groupNumber && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.groupNumber.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
        </FormSection>

        <Separator className="my-8" />

        {/* Seção: Cliente */}
        <FormSection icon={Users} title="Cliente">
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Cliente <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o nome do cliente"
                    {...field}
                    className={cn(
                      form.formState.errors.client && "border-destructive bg-destructive/5"
                    )}
                  />
                </FormControl>
                {form.formState.errors.client && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.client.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
        </FormSection>

        <Separator className="my-8" />

        {/* Seção: Localização */}
        <FormSection icon={MapPin} title="Localização">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Endereço <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o endereço completo"
                    {...field}
                    className={cn(
                      form.formState.errors.address && "border-destructive bg-destructive/5"
                    )}
                  />
                </FormControl>
                {form.formState.errors.address && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.address.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
        </FormSection>

        <Separator className="my-8" />

        {/* Seção: Cronograma */}
        <FormSection icon={Calendar} title="Cronograma">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Data de Início <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className={cn(
                      form.formState.errors.startDate && "border-destructive bg-destructive/5"
                    )}
                  />
                </FormControl>
                {form.formState.errors.startDate && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.startDate.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
        </FormSection>

        <Separator className="my-8" />

        {/* Seção: Observações */}
        <FormSection icon={FileText} title="Observações">
          <FormField
            control={form.control}
            name="observation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Observações (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Digite observações adicionais sobre a obra"
                    className="resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

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
                <span>Atualizando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Atualizar Obra</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};