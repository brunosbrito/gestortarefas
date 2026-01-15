// Componente de formulário para criar/editar fornecedores de serviços
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceProviderSchema, ServiceProviderFormData, masks } from '@/lib/suprimentos/logistica/validations';
import { ServiceProvider } from '@/interfaces/suprimentos/logistica/ServiceProviderInterface';
import { useCreateServiceProvider, useUpdateServiceProvider } from '@/hooks/suprimentos/logistica/useServiceProviders';
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
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, X, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ServiceProviderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceProvider?: ServiceProvider | null;
  mode: 'create' | 'edit';
}

export default function ServiceProviderFormDialog({
  open,
  onOpenChange,
  serviceProvider,
  mode,
}: ServiceProviderFormDialogProps) {
  const createMutation = useCreateServiceProvider();
  const updateMutation = useUpdateServiceProvider();
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<ServiceProviderFormData>({
    resolver: zodResolver(serviceProviderSchema),
    defaultValues: {
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      cpf: '',
      tipo: 'oficina',
      telefone: '',
      email: '',
      contato_nome: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      rating: undefined,
      ativo: true,
      credenciado: false,
      especialidades: [],
      prazo_pagamento: undefined,
      desconto_padrao: undefined,
      observacoes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'especialidades',
  });

  // Preencher formulário quando editando
  useEffect(() => {
    if (mode === 'edit' && serviceProvider) {
      form.reset({
        razao_social: serviceProvider.razao_social,
        nome_fantasia: serviceProvider.nome_fantasia || '',
        cnpj: serviceProvider.cnpj || '',
        cpf: serviceProvider.cpf || '',
        tipo: serviceProvider.tipo,
        telefone: serviceProvider.telefone,
        email: serviceProvider.email || '',
        contato_nome: serviceProvider.contato_nome || '',
        endereco: serviceProvider.endereco || '',
        cidade: serviceProvider.cidade || '',
        estado: serviceProvider.estado || '',
        cep: serviceProvider.cep || '',
        rating: serviceProvider.rating,
        ativo: serviceProvider.ativo,
        credenciado: serviceProvider.credenciado,
        especialidades: serviceProvider.especialidades || [],
        prazo_pagamento: serviceProvider.prazo_pagamento,
        desconto_padrao: serviceProvider.desconto_padrao,
        observacoes: serviceProvider.observacoes || '',
      });
    } else if (mode === 'create') {
      form.reset();
    }
  }, [serviceProvider, mode, form, open]);

  const onSubmit = (data: ServiceProviderFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    } else if (mode === 'edit' && serviceProvider) {
      updateMutation.mutate(
        { id: serviceProvider.id, data },
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Fornecedor de Serviços' : 'Editar Fornecedor de Serviços'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados do novo fornecedor'
              : 'Atualize os dados do fornecedor'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Razão Social e Nome Fantasia */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="razao_social"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Oficina do João Ltda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nome_fantasia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Oficina do João" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* CNPJ e CPF */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0000-00"
                        {...field}
                        onChange={(e) => field.onChange(masks.cnpj(e.target.value))}
                        maxLength={18}
                      />
                    </FormControl>
                    <FormDescription>Preencha CNPJ ou CPF</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(e) => field.onChange(masks.cpf(e.target.value))}
                        maxLength={14}
                      />
                    </FormControl>
                    <FormDescription>Para pessoa física</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tipo */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Serviço *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="oficina">Oficina Mecânica</SelectItem>
                      <SelectItem value="borracharia">Borracharia</SelectItem>
                      <SelectItem value="funilaria">Funilaria e Pintura</SelectItem>
                      <SelectItem value="eletrica">Elétrica Automotiva</SelectItem>
                      <SelectItem value="mecanica">Mecânica Geral</SelectItem>
                      <SelectItem value="seguradora">Seguradora</SelectItem>
                      <SelectItem value="despachante">Despachante</SelectItem>
                      <SelectItem value="outros">Outros Serviços</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone, Email e Contato */}
            <div className="grid grid-cols-3 gap-4">
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
                        placeholder="contato@fornecedor.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contato_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Endereço */}
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número, bairro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cidade, Estado e CEP */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="UF"
                        {...field}
                        maxLength={2}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000-000"
                        {...field}
                        onChange={(e) => field.onChange(masks.cep(e.target.value))}
                        maxLength={9}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avaliação</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= (hoveredRating || field.value || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => field.onChange(undefined)}
                          className="ml-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Clique nas estrelas para avaliar</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Especialidades */}
            <div className="space-y-2">
              <FormLabel>Especialidades</FormLabel>
              <FormDescription>
                Adicione as especialidades do fornecedor
              </FormDescription>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Especialidade"
                      {...form.register(`especialidades.${index}` as const)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append('')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Especialidade
              </Button>
            </div>

            {/* Prazo Pagamento e Desconto */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prazo_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo de Pagamento (dias)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 30"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desconto_padrao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto Padrão (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 10"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
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
                      placeholder="Observações sobre o fornecedor..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Ativo e Credenciado */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Fornecedor Ativo</FormLabel>
                      <FormDescription>
                        Fornecedores inativos não aparecem para seleção
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credenciado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Fornecedor Credenciado</FormLabel>
                      <FormDescription>
                        Fornecedores credenciados/homologados pela empresa
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
                {mode === 'create' ? 'Criar Fornecedor' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
