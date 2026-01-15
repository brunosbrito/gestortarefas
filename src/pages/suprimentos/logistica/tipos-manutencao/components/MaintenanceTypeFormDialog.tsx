// Componente de formulário para criar/editar tipos de manutenção
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { maintenanceTypeSchema, MaintenanceTypeFormData } from '@/lib/suprimentos/logistica/validations';
import { MaintenanceType } from '@/interfaces/suprimentos/logistica/MaintenanceTypeInterface';
import { useCreateMaintenanceType, useUpdateMaintenanceType } from '@/hooks/suprimentos/logistica/useMaintenanceTypes';
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

interface MaintenanceTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceType?: MaintenanceType | null;
  mode: 'create' | 'edit';
}

export default function MaintenanceTypeFormDialog({
  open,
  onOpenChange,
  maintenanceType,
  mode,
}: MaintenanceTypeFormDialogProps) {
  const createMutation = useCreateMaintenanceType();
  const updateMutation = useUpdateMaintenanceType();

  const form = useForm<MaintenanceTypeFormData>({
    resolver: zodResolver(maintenanceTypeSchema),
    defaultValues: {
      nome: '',
      categoria: 'preventiva',
      descricao: '',
      frequencia: 'mensal',
      periodicidade_km: undefined,
      periodicidade_dias: undefined,
      checklist_items: [],
      custo_estimado: undefined,
      tempo_estimado: undefined,
      ativo: true,
      observacoes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'checklist_items',
  });

  // Preencher formulário quando editando
  useEffect(() => {
    if (mode === 'edit' && maintenanceType) {
      form.reset({
        nome: maintenanceType.nome,
        categoria: maintenanceType.categoria,
        descricao: maintenanceType.descricao || '',
        frequencia: maintenanceType.frequencia,
        periodicidade_km: maintenanceType.periodicidade_km,
        periodicidade_dias: maintenanceType.periodicidade_dias,
        checklist_items: maintenanceType.checklist_items || [],
        custo_estimado: maintenanceType.custo_estimado,
        tempo_estimado: maintenanceType.tempo_estimado,
        ativo: maintenanceType.ativo,
        observacoes: maintenanceType.observacoes || '',
      });
    } else if (mode === 'create') {
      form.reset();
    }
  }, [maintenanceType, mode, form, open]);

  const onSubmit = (data: MaintenanceTypeFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    } else if (mode === 'edit' && maintenanceType) {
      updateMutation.mutate(
        { id: maintenanceType.id, data },
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
            {mode === 'create' ? 'Novo Tipo de Manutenção' : 'Editar Tipo de Manutenção'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados do novo tipo de manutenção'
              : 'Atualize os dados do tipo de manutenção'}
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
                    <Input placeholder="Ex: Revisão Geral" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria e Frequência */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="preventiva">Preventiva</SelectItem>
                        <SelectItem value="corretiva">Corretiva</SelectItem>
                        <SelectItem value="preditiva">Preditiva</SelectItem>
                        <SelectItem value="emergencial">Emergencial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="diaria">Diária</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="bimestral">Bimestral</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                        <SelectItem value="sob_demanda">Sob Demanda</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição detalhada do tipo de manutenção..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Periodicidade KM e Dias */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="periodicidade_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodicidade (KM)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 5000"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>A cada quantos KM realizar</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodicidade_dias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodicidade (Dias)</FormLabel>
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
                    <FormDescription>A cada quantos dias realizar</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Custo e Tempo Estimado */}
            <div className="grid grid-cols-2 gap-4">
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
                        placeholder="Ex: 500.00"
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
                name="tempo_estimado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Estimado (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 120"
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

            {/* Checklist Items */}
            <div className="space-y-2">
              <FormLabel>Checklist Padrão</FormLabel>
              <FormDescription>
                Adicione os items do checklist que devem ser verificados nesta manutenção
              </FormDescription>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Item do checklist"
                      {...form.register(`checklist_items.${index}` as const)}
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
                Adicionar Item
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
                      placeholder="Observações adicionais sobre o tipo de manutenção..."
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
                    <FormLabel>Tipo Ativo</FormLabel>
                    <FormDescription>
                      Tipos inativos não aparecem para seleção em novas manutenções
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
                {mode === 'create' ? 'Criar Tipo' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
