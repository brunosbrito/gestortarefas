// Componente de formulário para criar/editar manutenções
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { manutencaoSchema, ManutencaoFormData } from '@/lib/suprimentos/logistica/manutencaoValidations';
import { Manutencao, manutencaoStatusLabels } from '@/interfaces/suprimentos/logistica/ManutencaoInterface';
import { useCreateManutencao, useUpdateManutencao } from '@/hooks/suprimentos/logistica/useManutencoes';
import { useVehicles } from '@/hooks/suprimentos/logistica/useVehicles';
import { useMaintenanceTypes } from '@/hooks/suprimentos/logistica/useMaintenanceTypes';
import { useServiceProviders } from '@/hooks/suprimentos/logistica/useServiceProviders';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, X, Calculator } from 'lucide-react';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ManutencaoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manutencao?: Manutencao | null;
  mode: 'create' | 'edit';
}

export default function ManutencaoFormDialog({
  open,
  onOpenChange,
  manutencao,
  mode,
}: ManutencaoFormDialogProps) {
  const createMutation = useCreateManutencao();
  const updateMutation = useUpdateManutencao();

  const { data: vehicles = [] } = useVehicles();
  const { data: maintenanceTypes = [] } = useMaintenanceTypes();
  const { data: serviceProviders = [] } = useServiceProviders();

  const form = useForm<ManutencaoFormData>({
    resolver: zodResolver(manutencaoSchema),
    defaultValues: {
      veiculo_id: 0,
      tipo_manutencao_id: 0,
      fornecedor_servico_id: undefined,
      km_atual: 0,
      proxima_manutencao_km: undefined,
      status: 'agendada',
      data_agendada: new Date().toISOString(),
      data_inicio: undefined,
      data_conclusao: undefined,
      pecas_trocadas: [],
      custo_pecas: 0,
      custo_mao_obra: 0,
      custo_total: 0,
      fotos_documentos: [],
      numero_nf: '',
      descricao: '',
      observacoes: '',
      responsavel_id: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'pecas_trocadas',
  });

  // Atualizar KM atual quando veículo é selecionado
  const handleVehicleChange = (vehicleId: string) => {
    const numericId = Number(vehicleId);
    form.setValue('veiculo_id', numericId);

    const vehicle = vehicles.find((v) => v.id === numericId);
    if (vehicle && mode === 'create') {
      form.setValue('km_atual', vehicle.km_atual);
    }
  };

  // Recalcular custo total quando peças ou mão de obra mudam
  const recalcularCustos = () => {
    const pecas = form.getValues('pecas_trocadas');
    const custoPecas = pecas.reduce((sum, peca) => sum + (peca.valor_total || 0), 0);
    const custoMaoObra = form.getValues('custo_mao_obra') || 0;

    form.setValue('custo_pecas', custoPecas);
    form.setValue('custo_total', custoPecas + custoMaoObra);
  };

  // Recalcular valor total de uma peça quando quantidade ou valor unitário mudam
  const recalcularValorPeca = (index: number) => {
    const peca = form.getValues(`pecas_trocadas.${index}`);
    const valorTotal = (peca.quantidade || 0) * (peca.valor_unitario || 0);
    form.setValue(`pecas_trocadas.${index}.valor_total`, valorTotal);
    recalcularCustos();
  };

  // Preencher formulário quando editando
  useEffect(() => {
    if (mode === 'edit' && manutencao) {
      form.reset({
        veiculo_id: manutencao.veiculo_id,
        tipo_manutencao_id: manutencao.tipo_manutencao_id,
        fornecedor_servico_id: manutencao.fornecedor_servico_id,
        km_atual: manutencao.km_atual,
        proxima_manutencao_km: manutencao.proxima_manutencao_km,
        status: manutencao.status,
        data_agendada: manutencao.data_agendada,
        data_inicio: manutencao.data_inicio,
        data_conclusao: manutencao.data_conclusao,
        pecas_trocadas: manutencao.pecas_trocadas.map((peca) => ({
          ...peca,
          id: peca.id || uuidv4(),
        })),
        custo_pecas: manutencao.custo_pecas,
        custo_mao_obra: manutencao.custo_mao_obra,
        custo_total: manutencao.custo_total,
        fotos_documentos: manutencao.fotos_documentos || [],
        numero_nf: manutencao.numero_nf || '',
        descricao: manutencao.descricao,
        observacoes: manutencao.observacoes || '',
        responsavel_id: manutencao.responsavel_id,
      });
    } else if (mode === 'create') {
      form.reset();
    }
  }, [manutencao, mode, form, open]);

  const onSubmit = (data: ManutencaoFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    } else if (mode === 'edit' && manutencao) {
      updateMutation.mutate(
        { id: manutencao.id, data },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const addPeca = () => {
    append({
      id: uuidv4(),
      descricao: '',
      quantidade: 1,
      valor_unitario: 0,
      valor_total: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Manutenção' : 'Editar Manutenção'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados da nova manutenção'
              : 'Atualize os dados da manutenção'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Veículo e Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="veiculo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veículo *</FormLabel>
                    <Select
                      onValueChange={handleVehicleChange}
                      value={field.value ? String(field.value) : ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o veículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                            {vehicle.placa} - {vehicle.modelo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_manutencao_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Manutenção *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {maintenanceTypes.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fornecedor e KM */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="fornecedor_servico_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor de Serviço</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      value={field.value ? String(field.value) : ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {serviceProviders.map((provider) => (
                          <SelectItem key={provider.id} value={String(provider.id)}>
                            {provider.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="km_atual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KM Atual *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 45000"
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
                name="proxima_manutencao_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Próxima Manutenção (KM)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 50000"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>Opcional - Para manutenção preventiva</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status e Datas */}
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(manutencaoStatusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_agendada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Agendada</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value ? new Date(field.value).toISOString().slice(0, 10) : ''
                        }
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Início</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value ? new Date(field.value).toISOString().slice(0, 10) : ''
                        }
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_conclusao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Conclusão</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value ? new Date(field.value).toISOString().slice(0, 10) : ''
                        }
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
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
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a manutenção realizada..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Peças Trocadas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Peças Trocadas</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addPeca}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Peça
                </Button>
              </div>

              {fields.length > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-4">
                        <Input
                          placeholder="Descrição da peça"
                          {...form.register(`pecas_trocadas.${index}.descricao`)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qtd"
                          {...form.register(`pecas_trocadas.${index}.quantidade`, {
                            valueAsNumber: true,
                          })}
                          onChange={(e) => {
                            form.setValue(
                              `pecas_trocadas.${index}.quantidade`,
                              Number(e.target.value)
                            );
                            recalcularValorPeca(index);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="R$ Unit."
                          {...form.register(`pecas_trocadas.${index}.valor_unitario`, {
                            valueAsNumber: true,
                          })}
                          onChange={(e) => {
                            form.setValue(
                              `pecas_trocadas.${index}.valor_unitario`,
                              Number(e.target.value)
                            );
                            recalcularValorPeca(index);
                          }}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="R$ Total"
                          {...form.register(`pecas_trocadas.${index}.valor_total`, {
                            valueAsNumber: true,
                          })}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            remove(index);
                            recalcularCustos();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custos */}
            <div className="grid grid-cols-4 gap-4">
              <FormItem>
                <FormLabel>Custo Peças</FormLabel>
                <Input
                  type="text"
                  value={`R$ ${form.watch('custo_pecas').toFixed(2)}`}
                  disabled
                  className="bg-muted"
                />
                <FormDescription>Calculado automaticamente</FormDescription>
              </FormItem>

              <FormField
                control={form.control}
                name="custo_mao_obra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Mão de Obra *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 150.00"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                          recalcularCustos();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Custo Total</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={`R$ ${form.watch('custo_total').toFixed(2)}`}
                    disabled
                    className="bg-muted font-bold"
                  />
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </div>
                <FormDescription>Peças + Mão de Obra</FormDescription>
              </FormItem>

              <FormField
                control={form.control}
                name="numero_nf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número NF</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: NF-2026-001234" {...field} />
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
                      placeholder="Observações adicionais..."
                      className="resize-none"
                      rows={2}
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
                {mode === 'create' ? 'Criar Manutenção' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
