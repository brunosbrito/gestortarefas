// Componente de formulário para criar/editar check-lists de retorno
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checklistRetornoSchema, ChecklistRetornoFormData } from '@/lib/suprimentos/logistica/checklistRetornoValidations';
import { ChecklistRetorno, combustivelNivelLabels } from '@/interfaces/suprimentos/logistica/ChecklistRetornoInterface';
import { useCreateChecklistRetorno, useUpdateChecklistRetorno } from '@/hooks/suprimentos/logistica/useChecklistsRetorno';
import { useViagensAbertas } from '@/hooks/suprimentos/logistica/useChecklistsSaida';
import { useFinalizarViagem } from '@/hooks/suprimentos/logistica/useChecklistsSaida';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChecklistRetornoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist?: ChecklistRetorno | null;
  mode: 'create' | 'edit';
}

export default function ChecklistRetornoFormDialog({
  open,
  onOpenChange,
  checklist,
  mode,
}: ChecklistRetornoFormDialogProps) {
  const createMutation = useCreateChecklistRetorno();
  const updateMutation = useUpdateChecklistRetorno();
  const finalizarViagemMutation = useFinalizarViagem();

  const { data: viagensAbertas = [] } = useViagensAbertas();

  const [selectedChecklistSaida, setSelectedChecklistSaida] = useState<any>(null);

  const form = useForm<ChecklistRetornoFormData>({
    resolver: zodResolver(checklistRetornoSchema),
    defaultValues: {
      checklist_saida_id: 0,
      viagem_id: undefined,
      km_final: 0,
      combustivel_nivel: 'cheio',
      items: [],
      novos_danos: false,
      fotos_danos: [],
      limpeza_ok: true,
      observacoes: '',
      data_hora_retorno: new Date().toISOString(),
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchNovosDanos = form.watch('novos_danos');

  // Atualizar items do check-list quando viagem é selecionada
  const handleViagemChange = (checklistSaidaId: string) => {
    const numericId = Number(checklistSaidaId);
    form.setValue('checklist_saida_id', numericId);

    const viagemSelecionada = viagensAbertas.find((v) => v.id === numericId);
    if (viagemSelecionada) {
      setSelectedChecklistSaida(viagemSelecionada);

      // Carregar items do check-list de saída
      if (viagemSelecionada.items) {
        replace(viagemSelecionada.items.map((item: any) => ({ ...item, checked: false })));
      }

      // Se estiver em modo criação, sugerir KM final = KM inicial + 50 (placeholder)
      if (mode === 'create') {
        form.setValue('km_final', viagemSelecionada.km_inicial + 50);
      }
    }
  };

  // Preencher formulário quando editando
  useEffect(() => {
    if (mode === 'edit' && checklist) {
      form.reset({
        checklist_saida_id: checklist.checklist_saida_id,
        viagem_id: checklist.viagem_id,
        km_final: checklist.km_final,
        combustivel_nivel: checklist.combustivel_nivel,
        items: checklist.items.map((item) => ({ ...item })),
        novos_danos: checklist.novos_danos,
        fotos_danos: checklist.fotos_danos || [],
        limpeza_ok: checklist.limpeza_ok,
        observacoes: checklist.observacoes || '',
        data_hora_retorno: checklist.data_hora_retorno,
      });
    } else if (mode === 'create') {
      form.reset({
        checklist_saida_id: 0,
        viagem_id: undefined,
        km_final: 0,
        combustivel_nivel: 'cheio',
        items: [],
        novos_danos: false,
        fotos_danos: [],
        limpeza_ok: true,
        observacoes: '',
        data_hora_retorno: new Date().toISOString(),
      });
      setSelectedChecklistSaida(null);
    }
  }, [checklist, mode, form, open]);

  const onSubmit = (data: ChecklistRetornoFormData) => {
    if (mode === 'create' && selectedChecklistSaida) {
      // Preparar dados do check-list de saída
      const checklistSaidaData = {
        km_inicial: selectedChecklistSaida.km_inicial,
        veiculo_id: selectedChecklistSaida.veiculo_id,
        veiculo_placa: selectedChecklistSaida.veiculo_placa,
        veiculo_modelo: selectedChecklistSaida.veiculo_modelo,
        motorista_id: selectedChecklistSaida.motorista_id,
        motorista_nome: selectedChecklistSaida.motorista_nome,
      };

      createMutation.mutate(
        { data, checklistSaidaData },
        {
          onSuccess: (newChecklistRetorno) => {
            // Após criar o check-list de retorno, finalizar a viagem
            finalizarViagemMutation.mutate(
              {
                id: selectedChecklistSaida.id,
                checklistRetornoId: newChecklistRetorno.id,
              },
              {
                onSuccess: () => {
                  onOpenChange(false);
                  form.reset();
                },
              }
            );
          },
        }
      );
    } else if (mode === 'edit' && checklist) {
      updateMutation.mutate(
        { id: checklist.id, data },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || finalizarViagemMutation.isPending;

  // Calcular KM rodado em tempo real
  const kmFinal = form.watch('km_final');
  const kmRodado = selectedChecklistSaida ? kmFinal - selectedChecklistSaida.km_inicial : 0;

  // Contar items não marcados de segurança/documentos
  const itemsObrigatoriosNaoMarcados = fields.filter(
    (item, index) =>
      (item.categoria === 'seguranca' || item.categoria === 'documentos') &&
      !form.watch(`items.${index}.checked`)
  ).length;

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Check-list de Retorno' : 'Editar Check-list de Retorno'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados do check-list após o retorno do veículo'
              : 'Atualize os dados do check-list'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Selecionar Viagem Aberta */}
            {mode === 'create' && (
              <FormField
                control={form.control}
                name="checklist_saida_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Viagem Aberta *</FormLabel>
                    <Select
                      onValueChange={handleViagemChange}
                      value={field.value ? String(field.value) : ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a viagem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {viagensAbertas.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Nenhuma viagem aberta
                          </div>
                        ) : (
                          viagensAbertas.map((viagem) => (
                            <SelectItem key={viagem.id} value={String(viagem.id)}>
                              {viagem.veiculo_placa} - {viagem.motorista_nome} (Saída:{' '}
                              {formatDateTime(viagem.data_hora_saida)})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione uma viagem em andamento para registrar o retorno
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Info da viagem selecionada */}
            {selectedChecklistSaida && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Informações da Viagem</AlertTitle>
                <AlertDescription className="space-y-1">
                  <p>
                    <strong>Veículo:</strong> {selectedChecklistSaida.veiculo_placa} -{' '}
                    {selectedChecklistSaida.veiculo_modelo}
                  </p>
                  <p>
                    <strong>Motorista:</strong> {selectedChecklistSaida.motorista_nome}
                  </p>
                  <p>
                    <strong>KM Inicial:</strong>{' '}
                    {selectedChecklistSaida.km_inicial.toLocaleString('pt-BR')} km
                  </p>
                  <p>
                    <strong>Data/Hora Saída:</strong>{' '}
                    {formatDateTime(selectedChecklistSaida.data_hora_saida)}
                  </p>
                  {selectedChecklistSaida.destino_nome && (
                    <p>
                      <strong>Destino:</strong> {selectedChecklistSaida.destino_nome}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* KM Final e Combustível */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="km_final"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KM Final *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 45280"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      KM atual no hodômetro do veículo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>KM Rodado</FormLabel>
                <Input
                  type="text"
                  value={`${kmRodado} km`}
                  disabled
                  className="bg-muted"
                />
                <FormDescription>Calculado automaticamente</FormDescription>
              </FormItem>

              <FormField
                control={form.control}
                name="combustivel_nivel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Combustível *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(combustivelNivelLabels).map(([value, label]) => (
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
            </div>

            {/* Data/Hora Retorno */}
            <FormField
              control={form.control}
              name="data_hora_retorno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data e Hora de Retorno *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={(e) => {
                        const localDate = new Date(e.target.value);
                        field.onChange(localDate.toISOString());
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Check-list Items */}
            {fields.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Check-list de Inspeção</FormLabel>
                  {itemsObrigatoriosNaoMarcados > 0 && (
                    <Alert variant="destructive" className="py-2 px-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {itemsObrigatoriosNaoMarcados} item(ns) de segurança/documentos não marcados
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-start space-x-3 p-3 rounded-md hover:bg-accent/50"
                    >
                      <FormField
                        control={form.control}
                        name={`items.${index}.checked`}
                        render={({ field: checkField }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={checkField.value}
                                onCheckedChange={checkField.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{field.descricao}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {field.categoria}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Novos Danos e Limpeza */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="novos_danos"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Novos Danos?</FormLabel>
                      <FormDescription>
                        O veículo apresenta novos danos?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="limpeza_ok"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Limpeza OK?</FormLabel>
                      <FormDescription>
                        O veículo está limpo e organizado?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
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
                  <FormLabel>
                    Observações {(watchNovosDanos || !form.watch('limpeza_ok')) && '*'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva danos, problemas ou observações importantes..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  {(watchNovosDanos || !form.watch('limpeza_ok')) && (
                    <FormDescription className="text-orange-600">
                      Observações são obrigatórias quando há danos ou limpeza pendente
                    </FormDescription>
                  )}
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
              <Button type="submit" disabled={isLoading || (mode === 'create' && !selectedChecklistSaida)}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Registrar Retorno e Finalizar Viagem' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
