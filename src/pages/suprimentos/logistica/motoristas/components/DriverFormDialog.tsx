// Componente de formulário para criar/editar motoristas
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { driverSchema, DriverFormData, masks } from '@/lib/suprimentos/logistica/validations';
import { Driver } from '@/interfaces/suprimentos/logistica/DriverInterface';
import { useCreateDriver, useUpdateDriver } from '@/hooks/suprimentos/logistica/useDrivers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: Driver | null;
  mode: 'create' | 'edit';
}

export default function DriverFormDialog({
  open,
  onOpenChange,
  driver,
  mode,
}: DriverFormDialogProps) {
  const createMutation = useCreateDriver();
  const updateMutation = useUpdateDriver();

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      cnh_numero: '',
      cnh_categoria: 'B',
      cnh_validade: '',
      telefone: '',
      email: '',
      status: 'ativo',
      observacoes: '',
    },
  });

  // Preencher formulário quando editando
  useEffect(() => {
    if (mode === 'edit' && driver) {
      form.reset({
        nome: driver.nome,
        cpf: driver.cpf,
        cnh_numero: driver.cnh_numero,
        cnh_categoria: driver.cnh_categoria,
        cnh_validade: driver.cnh_validade,
        telefone: driver.telefone,
        email: driver.email || '',
        status: driver.status,
        observacoes: driver.observacoes || '',
      });
    } else if (mode === 'create') {
      form.reset();
    }
  }, [driver, mode, form, open]);

  const onSubmit = (data: DriverFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    } else if (mode === 'edit' && driver) {
      updateMutation.mutate(
        { id: driver.id, data },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Motorista' : 'Editar Motorista'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados do novo motorista'
              : 'Atualize os dados do motorista'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva Santos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CPF e Status */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(e) => field.onChange(masks.cpf(e.target.value))}
                        maxLength={14}
                      />
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
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="ferias">Férias</SelectItem>
                        <SelectItem value="afastado">Afastado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* CNH Número e Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnh_numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da CNH *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000000000"
                        {...field}
                        maxLength={11}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>11 dígitos</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnh_categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria da CNH *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">A - Motos</SelectItem>
                        <SelectItem value="B">B - Carros</SelectItem>
                        <SelectItem value="C">C - Caminhões pequenos</SelectItem>
                        <SelectItem value="D">D - Ônibus</SelectItem>
                        <SelectItem value="E">E - Caminhões grandes</SelectItem>
                        <SelectItem value="AB">AB - A + B</SelectItem>
                        <SelectItem value="AC">AC - A + C</SelectItem>
                        <SelectItem value="AD">AD - A + D</SelectItem>
                        <SelectItem value="AE">AE - A + E</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* CNH Validade */}
            <FormField
              control={form.control}
              name="cnh_validade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validade da CNH *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone e Email */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={(e) => field.onChange(masks.phone(e.target.value))}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="motorista@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais sobre o motorista..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Criar Motorista' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
