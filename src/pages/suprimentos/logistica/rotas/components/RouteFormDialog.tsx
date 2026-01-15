// Componente de formulário para criar/editar rotas/destinos
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { routeSchema, RouteFormData } from '@/lib/suprimentos/logistica/validations';
import { Route } from '@/interfaces/suprimentos/logistica/RouteInterface';
import { useCreateRoute, useUpdateRoute } from '@/hooks/suprimentos/logistica/useRoutes';
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
import { Loader2, Plus, X } from 'lucide-react';
import { useEffect } from 'react';

interface RouteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: Route | null;
  mode: 'create' | 'edit';
}

export default function RouteFormDialog({
  open,
  onOpenChange,
  route,
  mode,
}: RouteFormDialogProps) {
  const createMutation = useCreateRoute();
  const updateMutation = useUpdateRoute();

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      origem: '',
      destino: '',
      km_previsto: 0,
      tempo_medio: 0,
      custo_estimado: undefined,
      pedagios_quantidade: undefined,
      pedagios_valor: undefined,
      tipo_via: undefined,
      observacoes: '',
      pontos_referencia: [],
      ativo: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'pontos_referencia',
  });

  // Preencher formulário quando editando
  useEffect(() => {
    if (mode === 'edit' && route) {
      form.reset({
        nome: route.nome,
        descricao: route.descricao || '',
        origem: route.origem,
        destino: route.destino,
        km_previsto: route.km_previsto,
        tempo_medio: route.tempo_medio,
        custo_estimado: route.custo_estimado,
        pedagios_quantidade: route.pedagios_quantidade,
        pedagios_valor: route.pedagios_valor,
        tipo_via: route.tipo_via,
        observacoes: route.observacoes || '',
        pontos_referencia: route.pontos_referencia || [],
        ativo: route.ativo,
      });
    } else if (mode === 'create') {
      form.reset();
    }
  }, [route, mode, form, open]);

  const onSubmit = (data: RouteFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    } else if (mode === 'edit' && route) {
      updateMutation.mutate(
        { id: route.id, data },
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Rota' : 'Editar Rota'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados da nova rota'
              : 'Atualize os dados da rota'}
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
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: São Paulo - Campinas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição da rota..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Origem e Destino */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: São Paulo, SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Campinas, SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* KM Previsto e Tempo Médio */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="km_previsto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distância (KM) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 95"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tempo_medio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Médio (min) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 70"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tipo de Via */}
            <FormField
              control={form.control}
              name="tipo_via"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Via</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de via" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="urbana">Urbana</SelectItem>
                      <SelectItem value="rodovia">Rodovia</SelectItem>
                      <SelectItem value="mista">Mista</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custo Estimado */}
            <FormField
              control={form.control}
              name="custo_estimado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custo Estimado (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 150.00"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>Inclui combustível, pedágios, etc.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pedágios */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pedagios_quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade de Pedágios</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 3"
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
                name="pedagios_valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total Pedágios (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 45.80"
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

            {/* Pontos de Referência */}
            <div className="space-y-2">
              <FormLabel>Pontos de Referência</FormLabel>
              <FormDescription>
                Adicione pontos de referência ou passagem da rota
              </FormDescription>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Ponto de referência"
                      {...form.register(`pontos_referencia.${index}` as const)}
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
                Adicionar Ponto
              </Button>
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
                      placeholder="Observações sobre a rota..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Ativo */}
            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Rota Ativa</FormLabel>
                    <FormDescription>
                      Rotas inativas não aparecem para seleção
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
                {mode === 'create' ? 'Criar Rota' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
