// Dialog para criação/edição de Movimentação
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useCreateMovimentacao,
  useUpdateMovimentacao,
} from '@/hooks/suprimentos/almoxarifado/useMovimentacoes';
import { useItems } from '@/hooks/suprimentos/almoxarifado/useItems';
import {
  Movimentacao,
  MovimentacaoCreate,
  movimentacaoTipoLabels,
} from '@/interfaces/suprimentos/almoxarifado/MovimentacaoInterface';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Schema de validação
const movimentacaoSchema = z
  .object({
    tipo: z.enum(['entrada', 'saida', 'transferencia']),
    item_id: z.coerce.number().min(1, 'Selecione um item'),
    quantidade: z.coerce.number().min(0.01, 'Quantidade deve ser maior que zero'),
    localizacao_origem: z.string().max(200, 'Localização muito longa').optional(),
    localizacao_destino: z.string().max(200, 'Localização muito longa').optional(),
    responsavel_id: z.coerce.number().min(1, 'Selecione um responsável'),
    motivo: z.string().max(500, 'Motivo muito longo').optional(),
    observacoes: z.string().max(1000, 'Observações muito longas').optional(),
    documento_tipo: z.string().max(50, 'Tipo de documento muito longo').optional(),
    documento_numero: z.string().max(100, 'Número de documento muito longo').optional(),
    data_movimentacao: z.string().min(1, 'Data é obrigatória'),
  })
  .refine(
    (data) => {
      // Entrada: destino obrigatório
      if (data.tipo === 'entrada' && !data.localizacao_destino) return false;
      // Saída: origem obrigatório
      if (data.tipo === 'saida' && !data.localizacao_origem) return false;
      // Transferência: origem E destino obrigatórios
      if (data.tipo === 'transferencia' && (!data.localizacao_origem || !data.localizacao_destino))
        return false;
      return true;
    },
    {
      message: 'Preencha as localizações conforme o tipo de movimentação',
      path: ['localizacao_origem'],
    }
  );

type MovimentacaoFormValues = z.infer<typeof movimentacaoSchema>;

interface MovimentacaoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimentacao: Movimentacao | null;
  mode: 'create' | 'edit';
}

export default function MovimentacaoFormDialog({
  open,
  onOpenChange,
  movimentacao,
  mode,
}: MovimentacaoFormDialogProps) {
  const createMutation = useCreateMovimentacao();
  const updateMutation = useUpdateMovimentacao();
  const { data: items = [] } = useItems();

  const form = useForm<MovimentacaoFormValues>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: {
      tipo: 'entrada',
      item_id: 0,
      quantidade: 0,
      localizacao_origem: '',
      localizacao_destino: '',
      responsavel_id: 1, // Mock: default to first user
      motivo: '',
      observacoes: '',
      documento_tipo: '',
      documento_numero: '',
      data_movimentacao: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    },
  });

  const watchTipo = form.watch('tipo');
  const watchItemId = form.watch('item_id');

  // Encontrar item selecionado para mostrar unidade
  const selectedItem = items.find((i) => i.id === Number(watchItemId));

  // Reset form quando abrir dialog ou mudar movimentacao
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && movimentacao) {
        form.reset({
          tipo: movimentacao.tipo,
          item_id: movimentacao.item_id,
          quantidade: movimentacao.quantidade,
          localizacao_origem: movimentacao.localizacao_origem || '',
          localizacao_destino: movimentacao.localizacao_destino || '',
          responsavel_id: movimentacao.responsavel_id,
          motivo: movimentacao.motivo || '',
          observacoes: movimentacao.observacoes || '',
          documento_tipo: movimentacao.documento_tipo || '',
          documento_numero: movimentacao.documento_numero || '',
          data_movimentacao: movimentacao.data_movimentacao.slice(0, 16),
        });
      } else {
        form.reset({
          tipo: 'entrada',
          item_id: 0,
          quantidade: 0,
          localizacao_origem: '',
          localizacao_destino: '',
          responsavel_id: 1,
          motivo: '',
          observacoes: '',
          documento_tipo: '',
          documento_numero: '',
          data_movimentacao: new Date().toISOString().slice(0, 16),
        });
      }
    }
  }, [open, mode, movimentacao, form]);

  const onSubmit = (data: MovimentacaoFormValues) => {
    // Encontrar item para pegar código, nome e unidade
    const item = items.find((i) => i.id === Number(data.item_id));

    const processedData: MovimentacaoCreate = {
      ...data,
      item_id: Number(data.item_id),
      responsavel_id: Number(data.responsavel_id),
      item_codigo: item?.codigo,
      item_nome: item?.nome,
      item_unidade: item?.unidade,
      responsavel_nome: 'Usuário Mock', // TODO: pegar do contexto de autenticação
      localizacao_origem: data.localizacao_origem || undefined,
      localizacao_destino: data.localizacao_destino || undefined,
      motivo: data.motivo || undefined,
      observacoes: data.observacoes || undefined,
      documento_tipo: data.documento_tipo || undefined,
      documento_numero: data.documento_numero || undefined,
      data_movimentacao: new Date(data.data_movimentacao).toISOString(),
    };

    if (mode === 'create') {
      createMutation.mutate(processedData, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    } else if (movimentacao) {
      updateMutation.mutate(
        { id: movimentacao.id, data: processedData },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Determinar quais campos de localização mostrar
  const showOrigemField = watchTipo === 'saida' || watchTipo === 'transferencia';
  const showDestinoField = watchTipo === 'entrada' || watchTipo === 'transferencia';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Movimentação' : 'Editar Movimentação'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados para registrar uma movimentação de estoque.'
              : 'Atualize os dados da movimentação.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tipo e Data */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Movimentação *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(movimentacaoTipoLabels).map(([value, label]) => (
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
                name="data_movimentacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Hora *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Item e Quantidade */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="item_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ? String(field.value) : ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o item" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {items
                          .filter((item) => item.ativo)
                          .map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.codigo} - {item.nome}
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
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Quantidade * {selectedItem && `(${selectedItem.unidade})`}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    {selectedItem && (
                      <FormDescription>
                        Estoque atual: {selectedItem.estoque_atual.toLocaleString('pt-BR')}{' '}
                        {selectedItem.unidade}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Localizações (dinâmico por tipo) */}
            <div className="grid grid-cols-2 gap-4">
              {showOrigemField && (
                <FormField
                  control={form.control}
                  name="localizacao_origem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Localização de Origem {watchTipo !== 'entrada' && '*'}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Prateleira A3" {...field} />
                      </FormControl>
                      <FormDescription>De onde o item está saindo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {showDestinoField && (
                <FormField
                  control={form.control}
                  name="localizacao_destino"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Localização de Destino {watchTipo !== 'saida' && '*'}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Galpão 2 - Setor B" {...field} />
                      </FormControl>
                      <FormDescription>Para onde o item está indo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Motivo */}
            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compra de estoque, Requisição de produção..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Documento */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="documento_tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nota_fiscal">Nota Fiscal</SelectItem>
                        <SelectItem value="requisicao">Requisição</SelectItem>
                        <SelectItem value="ordem_servico">Ordem de Serviço</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documento_numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Documento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: NF-12345, REQ-2024-089" {...field} />
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
                      placeholder="Informações adicionais sobre a movimentação..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Criar Movimentação' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
