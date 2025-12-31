
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import valuePerPositionService, { ValuePerPosition } from "@/services/valuePerPositionService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Briefcase, Building, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const colaboradorFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Cargo é obrigatório"),
  sector: z.string().min(1, "Setor é obrigatório"),
});

export type ColaboradorFormValues = z.infer<typeof colaboradorFormSchema>;

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

interface ColaboradorFormFieldsProps {
  form: UseFormReturn<ColaboradorFormValues>;
}

export const ColaboradorFormFields = ({ form }: ColaboradorFormFieldsProps) => {
  const [positions, setPositions] = useState<ValuePerPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPositions = async () => {
      setIsLoading(true);
      try {
        const data = await valuePerPositionService.getAll();
        setPositions(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar cargos',
          description: 'Não foi possível carregar a lista de cargos disponíveis.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, [toast]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Seção: Informações Pessoais */}
      <FormSection icon={User} title="Informações Pessoais">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Nome <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome completo"
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
      </FormSection>

      <Separator className="my-8" />

      {/* Seção: Cargo */}
      <FormSection icon={Briefcase} title="Cargo">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Cargo <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                {isLoading ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/20">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Carregando cargos...</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger className={cn(
                      form.formState.errors.role && "border-destructive bg-destructive/5"
                    )}>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.length === 0 ? (
                        <SelectItem value="sem-cargos" disabled>
                          Nenhum cargo cadastrado
                        </SelectItem>
                      ) : (
                        positions.map((position) => (
                          <SelectItem key={position.id} value={position.position}>
                            {position.position}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </FormControl>
              {form.formState.errors.role && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.role.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />
      </FormSection>

      <Separator className="my-8" />

      {/* Seção: Setor */}
      <FormSection icon={Building} title="Setor">
        <FormField
          control={form.control}
          name="sector"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Setor <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger className={cn(
                    form.formState.errors.sector && "border-destructive bg-destructive/5"
                  )}>
                    <SelectValue placeholder="Selecione um setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCAO">Produção</SelectItem>
                    <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                    <SelectItem value="ENGENHARIA">Engenharia</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              {form.formState.errors.sector && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.sector.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />
      </FormSection>
    </div>
  );
};
