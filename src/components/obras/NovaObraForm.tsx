
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import ObrasService from "@/services/ObrasService";
import { Obra } from "@/interfaces/ObrasInterface";
import { Building2, Users, MapPin, Calendar, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { HelpTooltip } from "@/components/tooltips/HelpTooltip";
import { TOOLTIP_CONTENT } from "@/constants/tooltipContent";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  groupNumber: z.string().min(1, "Número do grupo é obrigatório"),
  client: z.string().min(1, "Cliente é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().optional(),
  observation: z.string().optional(),
  status: z.enum(["em_andamento", "finalizado", "interrompido"]),
});

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

interface NovaObraFormProps {
  onSuccess: () => void;
  type: 'Obra' | 'Fabrica' | 'Mineradora';
}

export const NovaObraForm = ({ onSuccess, type }: NovaObraFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "em_andamento",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await ObrasService.createObra({ ...data, type } as Obra);
      toast({
        title: `${type} criada com sucesso!`,
        description: `${data.name} foi adicionada ao sistema.`,
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: `Erro ao criar ${type.toLowerCase()}`,
        description: `Ocorreu um erro ao criar a ${type.toLowerCase()}. Tente novamente.`,
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
                <FormLabel className="flex items-center gap-1.5 font-medium">
                  Nome da {type} <span className="text-destructive">*</span>
                  <HelpTooltip content={TOOLTIP_CONTENT.FORM_PROJECT_NAME} />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={`Digite o nome da ${type}`}
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
                <FormLabel className="flex items-center gap-1.5 font-medium">
                  Número do Grupo <span className="text-destructive">*</span>
                  <HelpTooltip content={TOOLTIP_CONTENT.FORM_PROJECT_GROUP} />
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

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5 font-medium">
                  Status <span className="text-destructive">*</span>
                  <HelpTooltip content={TOOLTIP_CONTENT.FORM_PROJECT_STATUS} />
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(
                      form.formState.errors.status && "border-destructive bg-destructive/5"
                    )}>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                    <SelectItem value="interrompido">Interrompido</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.status.message}
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
                <FormLabel className="flex items-center gap-1.5 font-medium">
                  Cliente <span className="text-destructive">*</span>
                  <HelpTooltip content={TOOLTIP_CONTENT.FORM_PROJECT_CLIENT} />
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
                <FormLabel className="flex items-center gap-1.5 font-medium">
                  Endereço <span className="text-destructive">*</span>
                  <HelpTooltip content={TOOLTIP_CONTENT.FORM_PROJECT_ADDRESS} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Data de Término (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                <span>Criando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Criar {type}</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
