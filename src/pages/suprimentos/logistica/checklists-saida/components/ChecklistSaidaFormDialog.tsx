// Componente de formulário para criar/editar check-lists de saída
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checklistSaidaSchema, ChecklistSaidaFormData } from '@/lib/suprimentos/logistica/checklistSaidaValidations';
import { ChecklistSaida, checklistTemplates, combustivelNivelLabels } from '@/interfaces/suprimentos/logistica/ChecklistSaidaInterface';
import { useCreateChecklistSaida, useUpdateChecklistSaida } from '@/hooks/suprimentos/logistica/useChecklistsSaida';
import { useVehicles } from '@/hooks/suprimentos/logistica/useVehicles';
import { useDrivers } from '@/hooks/suprimentos/logistica/useDrivers';
import { useActiveRoutes } from '@/hooks/suprimentos/logistica/useRoutes';
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
import { Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChecklistSaidaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist?: ChecklistSaida | null;
  mode: 'create' | 'edit';
}

export default function ChecklistSaidaFormDialog({
  open,
  onOpenChange,
  checklist,
  mode,
}: ChecklistSaidaFormDialogProps) {
  const createMutation = useCreateChecklistSaida();
  const updateMutation = useUpdateChecklistSaida();

  const { data: vehicles = [] } = useVehicles();
  const { data: motoristas = [] } = useDrivers();
  const { data: routes = [] } = useActiveRoutes();

  const [selectedVehicleType, setSelectedVehicleType] = useState<'carro' | 'empilhadeira' | 'caminhao' | null>(null);

  const form = useForm<ChecklistSaidaFormData>({
    resolver: zodResolver(checklistSaidaSchema),
    defaultValues: {
      veiculo_id: 0,
      motorista_id: 0,
      km_inicial: 0,
      combustivel_nivel: 'cheio',
      destino_id: undefined,
      items: [],
      fotos_danos: [],
      observacoes: '',
      data_hora_saida: new Date().toISOString(),
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Atualizar items do check-list quando veículo é selecionado
  const handleVehicleChange = (vehicleId: string) => {
    const numericId = Number(vehicleId);
    form.setValue('veiculo_id', numericId);

    const vehicle = vehicles.find((v) => v.id === numericId);
    if (vehicle) {
      setSelectedVehicleType(vehicle.tipo);

      // Carregar template de check-list baseado no tipo de veículo
      const template = checklistTemplates[vehicle.tipo];
      if (template) {
        replace(template.map(item => ({ ...item })));
      }

      // Se estiver em modo criação, atualizar KM inicial com KM atual do veículo
      if (mode === 'create') {
        form.setValue('km_inicial', vehicle.km_atual);
      }
    }
  };

  // Preencher formulário quando editando
  useEffect(() => {
    if (mode === 'edit' && checklist) {
      form.reset({
        veiculo_id: checklist.veiculo_id,
        motorista_id: checklist.motorista_id,
        km_inicial: checklist.km_inicial,
        combustivel_nivel: checklist.combustivel_nivel,
        destino_id: checklist.destino_id,
        items: checklist.items.map(item => ({ ...item })),
        fotos_danos: checklist.fotos_danos || [],
        observacoes: checklist.observacoes || '',
        data_hora_saida: checklist.data_hora_saida,
      });

      // Determinar tipo de veículo
      const vehicle = vehicles.find((v) => v.id === checklist.veiculo_id);
      if (vehicle) {
        setSelectedVehicleType(vehicle.tipo);
      }
    } else if (mode === 'create') {
      form.reset({
        veiculo_id: 0,
        motorista_id: 0,
        km_inicial: 0,
        combustivel_nivel: 'cheio',
        destino_id: undefined,
        items: [],
        fotos_danos: [],
        observacoes: '',
        data_hora_saida: new Date().toISOString(),
      });
      setSelectedVehicleType(null);
    }
  }, [checklist, mode, form, open, vehicles]);

  const onSubmit = (data: ChecklistSaidaFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
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

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Contar items não marcados de segurança/documentos
  const itemsObrigatoriosNaoMarcados = fields.filter(
    (item, index) =>
      (item.categoria === 'seguranca' || item.categoria === 'documentos') &&
      !form.watch(`items.${index}.checked`)
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Check-list de Saída' : 'Editar Check-list de Saída'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados do check-list antes da saída do veículo'
              : 'Atualize os dados do check-list'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Veículo e Motorista */}
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
                      disabled={mode === 'edit'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o veículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                            {vehicle.placa} - {vehicle.modelo} ({vehicle.tipo})
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
                name="motorista_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motorista *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o motorista" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {motoristas
                          .filter((m) => m.status === 'ativo')
                          .map((motorista) => (
                            <SelectItem key={motorista.id} value={String(motorista.id)}>
                              {motorista.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* KM Inicial e Combustível */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="km_inicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KM Inicial *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 45230"
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

              <FormField
                control={form.control}
                name="combustivel_nivel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Combustível *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
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

            {/* Destino e Data/Hora */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="destino_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino/Rota (Opcional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      value={field.value ? String(field.value) : ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o destino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route.id} value={String(route.id)}>
                            {route.nome}
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
                name="data_hora_saida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Hora de Saída *</FormLabel>
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
            </div>

            {/* Check-list Items */}
            {fields.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>
                    Check-list de Inspeção ({selectedVehicleType})
                  </FormLabel>
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
                        <p className="text-sm font-medium leading-none">
                          {field.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {field.categoria}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações gerais sobre o veículo ou a viagem..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descreva qualquer problema, dano ou observação importante
                  </FormDescription>
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
                {mode === 'create' ? 'Criar Check-list' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
