// Formulário de Criação/Edição de Ordem de Compra
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreateOrdemCompra,
  useUpdateOrdemCompra,
} from '@/hooks/suprimentos/compras/useOrdensCompra';
import { useCotacoes } from '@/hooks/suprimentos/compras/useCotacoes';
import { OrdemCompra } from '@/interfaces/suprimentos/compras/OrdemCompraInterface';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package } from 'lucide-react';

// Schema simplificado para o formulário
const ordemCompraFormSchema = z.object({
  status: z.enum(['rascunho', 'aguardando_envio', 'enviada', 'confirmada', 'parcialmente_recebida', 'recebida', 'cancelada']),
  cotacao_id: z.number().optional(),
  requisicao_id: z.number().optional(),
  fornecedor_id: z.number().min(1, 'Fornecedor é obrigatório'),
  fornecedor_nome: z.string().min(1, 'Nome do fornecedor é obrigatório'),
  fornecedor_cnpj: z.string().optional(),
  data_emissao: z.string().min(1, 'Data de emissão é obrigatória'),
  data_previsao_entrega: z.string().min(1, 'Data de previsão de entrega é obrigatória'),
  items: z.array(z.object({
    id: z.number().optional(),
    descricao: z.string().min(1, 'Descrição é obrigatória'),
    quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
    unidade: z.string().min(1, 'Unidade é obrigatória'),
    valor_unitario: z.number().min(0, 'Valor unitário não pode ser negativo'),
    valor_total: z.number().min(0, 'Valor total não pode ser negativo'),
  })).min(1, 'Adicione pelo menos um item'),
  forma_pagamento: z.string().optional(),
  condicoes_pagamento: z.string().optional(),
  observacoes: z.string().optional(),
});

type OrdemCompraFormData = z.infer<typeof ordemCompraFormSchema>;

interface OrdemCompraFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordem?: OrdemCompra | null;
  userId: number;
}

export function OrdemCompraFormDialog({
  open,
  onOpenChange,
  ordem,
  userId,
}: OrdemCompraFormDialogProps) {
  const isEditing = !!ordem;
  const createMutation = useCreateOrdemCompra();
  const updateMutation = useUpdateOrdemCompra();
  const { data: cotacoes = [], isLoading: loadingCotacoes } = useCotacoes();

  // Filtrar apenas cotações finalizadas
  const cotacoesFinalizadas = cotacoes.filter((c) => c.status === 'finalizada');

  const form = useForm<OrdemCompraFormData>({
    resolver: zodResolver(ordemCompraFormSchema),
    defaultValues: {
      status: 'rascunho',
      cotacao_id: undefined,
      requisicao_id: undefined,
      fornecedor_id: 0,
      fornecedor_nome: '',
      fornecedor_cnpj: '',
      data_emissao: new Date().toISOString().split('T')[0],
      data_previsao_entrega: '',
      items: [],
      forma_pagamento: '',
      condicoes_pagamento: '',
      observacoes: '',
    },
  });

  const {
    fields: itemsFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Preencher form quando editando
  useEffect(() => {
    if (ordem && open) {
      form.reset({
        status: ordem.status,
        cotacao_id: ordem.cotacao_id,
        requisicao_id: ordem.requisicao_id,
        fornecedor_id: ordem.fornecedor_id,
        fornecedor_nome: ordem.fornecedor_nome,
        fornecedor_cnpj: ordem.fornecedor_cnpj,
        data_emissao: ordem.data_emissao,
        data_previsao_entrega: ordem.data_previsao_entrega,
        items: ordem.items.map((item) => ({
          id: item.id,
          descricao: item.descricao,
          quantidade: item.quantidade,
          unidade: item.unidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
        })),
        forma_pagamento: ordem.forma_pagamento,
        condicoes_pagamento: ordem.condicoes_pagamento,
        observacoes: ordem.observacoes,
      });
    } else if (!ordem && open) {
      form.reset({
        status: 'rascunho',
        cotacao_id: undefined,
        requisicao_id: undefined,
        fornecedor_id: 0,
        fornecedor_nome: '',
        fornecedor_cnpj: '',
        data_emissao: new Date().toISOString().split('T')[0],
        data_previsao_entrega: '',
        items: [],
        forma_pagamento: '',
        condicoes_pagamento: '',
        observacoes: '',
      });
    }
  }, [ordem, open, form]);

  // Quando selecionar cotação, popular dados automaticamente
  const handleCotacaoChange = (cotacaoId: string) => {
    const cotacao = cotacoes.find((c) => c.id === parseInt(cotacaoId));
    if (cotacao) {
      form.setValue('cotacao_id', cotacao.id);
      form.setValue('requisicao_id', cotacao.requisicao_id);

      // Pegar o fornecedor que foi selecionado (aqui assume o primeiro que respondeu)
      const fornecedorSelecionado = cotacao.fornecedores.find((f) => f.respondeu);
      if (fornecedorSelecionado) {
        form.setValue('fornecedor_id', fornecedorSelecionado.fornecedor_id);
        form.setValue('fornecedor_nome', fornecedorSelecionado.fornecedor_nome);
        form.setValue('fornecedor_cnpj', fornecedorSelecionado.fornecedor_cnpj || '');
        form.setValue('forma_pagamento', fornecedorSelecionado.forma_pagamento || '');
        form.setValue('condicoes_pagamento', fornecedorSelecionado.condicoes_pagamento || '');

        // Calcular data de entrega baseada no prazo
        if (fornecedorSelecionado.prazo_entrega) {
          const dataEmissao = new Date(form.getValues('data_emissao'));
          const dataEntrega = new Date(dataEmissao);
          dataEntrega.setDate(dataEntrega.getDate() + fornecedorSelecionado.prazo_entrega);
          form.setValue('data_previsao_entrega', dataEntrega.toISOString().split('T')[0]);
        }

        // Popular items com os dados do fornecedor
        const items = fornecedorSelecionado.items.map((item) => {
          const reqItem = cotacao.requisicao_items.find(
            (ri) => ri.id === item.requisicao_item_id
          );
          return {
            id: undefined,
            descricao: item.requisicao_item_descricao || reqItem?.descricao || '',
            quantidade: reqItem?.quantidade || 0,
            unidade: reqItem?.unidade || 'UN',
            valor_unitario: item.valor_unitario || 0,
            valor_total: item.valor_total || 0,
          };
        });
        form.setValue('items', items);
      }
    }
  };

  const handleAddItem = () => {
    appendItem({
      id: undefined,
      descricao: '',
      quantidade: 1,
      unidade: 'UN',
      valor_unitario: 0,
      valor_total: 0,
    });
  };

  const onSubmit = async (data: OrdemCompraFormData) => {
    try {
      if (isEditing && ordem) {
        await updateMutation.mutateAsync({
          id: ordem.id,
          data: {
            status: data.status,
            fornecedor_id: data.fornecedor_id,
            fornecedor_nome: data.fornecedor_nome,
            fornecedor_cnpj: data.fornecedor_cnpj,
            data_emissao: data.data_emissao,
            data_previsao_entrega: data.data_previsao_entrega,
            items: data.items,
            forma_pagamento: data.forma_pagamento,
            condicoes_pagamento: data.condicoes_pagamento,
            observacoes: data.observacoes,
          },
        });
      } else {
        await createMutation.mutateAsync({
          status: data.status,
          cotacao_id: data.cotacao_id,
          requisicao_id: data.requisicao_id,
          fornecedor_id: data.fornecedor_id,
          fornecedor_nome: data.fornecedor_nome,
          fornecedor_cnpj: data.fornecedor_cnpj,
          data_emissao: data.data_emissao,
          data_previsao_entrega: data.data_previsao_entrega,
          items: data.items,
          forma_pagamento: data.forma_pagamento,
          condicoes_pagamento: data.condicoes_pagamento,
          observacoes: data.observacoes,
          created_by: userId,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar ordem de compra:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Ordem de Compra' : 'Nova Ordem de Compra'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados da ordem de compra.'
              : 'Selecione uma cotação finalizada ou preencha os dados manualmente.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(value) => form.setValue('status', value as any)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="aguardando_envio">Aguardando Envio</SelectItem>
                      <SelectItem value="enviada">Enviada</SelectItem>
                      <SelectItem value="confirmada">Confirmada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.status.message}
                    </p>
                  )}
                </div>

                {/* Cotação (opcional) */}
                {!isEditing && (
                  <div>
                    <Label htmlFor="cotacao">Cotação (opcional)</Label>
                    <Select
                      value={form.watch('cotacao_id')?.toString()}
                      onValueChange={handleCotacaoChange}
                      disabled={loadingCotacoes}
                    >
                      <SelectTrigger id="cotacao">
                        <SelectValue placeholder="Selecione uma cotação" />
                      </SelectTrigger>
                      <SelectContent>
                        {cotacoesFinalizadas.map((cot) => (
                          <SelectItem key={cot.id} value={cot.id.toString()}>
                            {cot.numero} - {cot.requisicao_numero}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Fornecedor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="fornecedor_nome">Nome do Fornecedor *</Label>
                  <Input
                    id="fornecedor_nome"
                    placeholder="Nome do fornecedor"
                    {...form.register('fornecedor_nome')}
                  />
                  {form.formState.errors.fornecedor_nome && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.fornecedor_nome.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fornecedor_cnpj">CNPJ</Label>
                  <Input
                    id="fornecedor_cnpj"
                    placeholder="00.000.000/0000-00"
                    {...form.register('fornecedor_cnpj')}
                  />
                </div>

                <div>
                  <Label htmlFor="data_emissao">Data de Emissão *</Label>
                  <Input
                    id="data_emissao"
                    type="date"
                    {...form.register('data_emissao')}
                  />
                  {form.formState.errors.data_emissao && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.data_emissao.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="data_previsao_entrega">Data Previsão Entrega *</Label>
                  <Input
                    id="data_previsao_entrega"
                    type="date"
                    {...form.register('data_previsao_entrega')}
                  />
                  {form.formState.errors.data_previsao_entrega && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.data_previsao_entrega.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                  <Input
                    id="forma_pagamento"
                    placeholder="Ex: À vista, 30/60 dias"
                    {...form.register('forma_pagamento')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="condicoes_pagamento">Condições de Pagamento</Label>
                <Textarea
                  id="condicoes_pagamento"
                  rows={2}
                  placeholder="Detalhe as condições de pagamento..."
                  {...form.register('condicoes_pagamento')}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  rows={3}
                  placeholder="Observações gerais sobre a ordem..."
                  {...form.register('observacoes')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items da Ordem
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {itemsFields.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  <p>Nenhum item adicionado.</p>
                  <p className="text-sm">Clique em "Adicionar Item" para começar.</p>
                </div>
              ) : (
                itemsFields.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Item #{index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-destructive"
                      >
                        Remover
                      </Button>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-2">
                        <Label className="text-xs">Descrição *</Label>
                        <Input
                          placeholder="Descrição do item"
                          {...form.register(`items.${index}.descricao`)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Quantidade *</Label>
                        <Input
                          type="number"
                          min="1"
                          {...form.register(`items.${index}.quantidade`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Unidade *</Label>
                        <Input
                          placeholder="UN"
                          {...form.register(`items.${index}.unidade`)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Valor Unit. *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...form.register(`items.${index}.valor_unitario`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Valor Total *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...form.register(`items.${index}.valor_total`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <DialogFooter>
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
              {isEditing ? 'Salvar Alterações' : 'Criar Ordem de Compra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
