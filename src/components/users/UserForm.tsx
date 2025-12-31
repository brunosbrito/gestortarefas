import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { createUser } from '@/services/AuthService';
import { User, Shield, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const userFormSchema = z
  .object({
    username: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    role: z.enum(['admin', 'basic'], {
      required_error: 'Selecione uma função',
    }),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não correspondem',
    path: ['confirmPassword'],
  });

type UserFormValues = z.infer<typeof userFormSchema>;

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

export const UserForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      role: 'basic',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      createUser(data);

      toast({
        title: 'Usuário criado com sucesso!',
        description: `${data.username} foi adicionado como ${
          data.role === 'admin' ? 'administrador' : 'usuário básico'
        }.`,
      });

      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar usuário',
        description: 'Ocorreu um erro ao criar o usuário. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        {/* Seção: Informações do Usuário */}
        <FormSection icon={User} title="Informações do Usuário">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Nome <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o nome"
                    {...field}
                    className={cn(
                      form.formState.errors.username && "border-destructive bg-destructive/5"
                    )}
                  />
                </FormControl>
                {form.formState.errors.username && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.username.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Digite o email"
                    {...field}
                    className={cn(
                      form.formState.errors.email && "border-destructive bg-destructive/5"
                    )}
                  />
                </FormControl>
                {form.formState.errors.email && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.email.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
        </FormSection>

        <Separator className="my-8" />

        {/* Seção: Permissões */}
        <FormSection icon={Shield} title="Permissões">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Função <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-2 p-4 rounded-lg border border-border/50 bg-muted/20"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="admin" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Administrador</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="basic" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Básico</FormLabel>
                    </FormItem>
                  </RadioGroup>
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

        {/* Seção: Segurança */}
        <FormSection icon={Lock} title="Segurança">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Senha <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Digite a senha (mín. 6 caracteres)"
                    {...field}
                    className={cn(
                      form.formState.errors.password && "border-destructive bg-destructive/5"
                    )}
                  />
                </FormControl>
                {form.formState.errors.password && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.password.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Confirmar Senha <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirme a senha"
                    {...field}
                    className={cn(
                      form.formState.errors.confirmPassword && "border-destructive bg-destructive/5"
                    )}
                  />
                </FormControl>
                {form.formState.errors.confirmPassword && (
                  <FormMessage className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {form.formState.errors.confirmPassword.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
        </FormSection>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full h-11 font-semibold shadow-lg transition-all",
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
                <span>Criar Usuário</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
