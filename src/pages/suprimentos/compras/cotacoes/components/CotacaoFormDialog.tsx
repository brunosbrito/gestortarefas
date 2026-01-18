// Formulário de Criação/Edição de Cotação
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cotacaoSchema, CotacaoFormData } from '@/lib/suprimentos/compras/cotacaoValidations';
import {
  useCreateCotacao,
  useUpdateCotacao,
} from '@/hooks/suprimentos/compras/useCotacoes';
import { useRequisicoes } from '@/hooks/suprimentos/compras/useRequisicoes';
import { Cotacao } from '@/interfaces/suprimentos/compras/CotacaoInterface';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  Package,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CotacaoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cotacao?: Cotacao | null;
  userId: number;
}

export function CotacaoFormDialog({
  open,
  onOpenChange,
  cotacao,
  userId,
}: CotacaoFormDialogProps) {
  const isEditing = !!cotacao;
  const createMutation = useCreateCotacao();
  const updateMutation = useUpdateCotacao();
  const { data: requisicoes = [], isLoading: loadingRequisicoes } = useRequisicoes();

  const [customErrors, setCustomErrors] = useState<string[]>([]);

  // Filtrar apenas requisições aprovadas que ainda não têm cotação
  const requisicoesDisponiveis = requisicoes.filter(
    (r) => r.status === 'aprovada' || r.status === 'em_cotacao'
  );

  const form = useForm<CotacaoFormData>({
    resolver: zodResolver(cotacaoSchema),
    defaultValues: {
      status: 'aguardando',
      requisicao_id: 0,
      requisicao_numero: '',
      requisicao_items: [],
      data_abertura: new Date().toISOString().split('T')[0],
      data_limite_resposta: '',
      data_finalizacao: undefined,
      fornecedores: [],
      observacoes: '',
      created_by: userId,
    },
  });

  const {
    fields: fornecedoresFields,
    append: appendFornecedor,
    remove: removeFornecedor,
  } = useFieldArray({
    control: form.control,
    name: 'fornecedores',
  });

  // Preencher form quando editando
  useEffect(() => {
    if (cotacao && open) {
      form.reset({
        status: cotacao.status,
        requisicao_id: cotacao.requisicao_id,
        requisicao_numero: cotacao.requisicao_numero,
        requisicao_items: cotacao.requisicao_items,
        data_abertura: cotacao.data_abertura,
        data_limite_resposta: cotacao.data_limite_resposta,
        data_finalizacao: cotacao.data_finalizacao,
        fornecedores: cotacao.fornecedores.map((f) => ({
          id: f.id,
          cotacao_id: f.cotacao_id,
          fornecedor_id: f.fornecedor_id,
          fornecedor_nome: f.fornecedor_nome,
          fornecedor_cnpj: f.fornecedor_cnpj,
          fornecedor_contato: f.fornecedor_contato,
          fornecedor_email: f.fornecedor_email,
          fornecedor_telefone: f.fornecedor_telefone,
          data_envio: f.data_envio,
          data_resposta: f.data_resposta,
          respondeu: f.respondeu,
          items: f.items,
          prazo_entrega: f.prazo_entrega,
          forma_pagamento: f.forma_pagamento,
          condicoes_pagamento: f.condicoes_pagamento,
          validade_proposta: f.validade_proposta,
          observacoes: f.observacoes,
          arquivo_proposta: f.arquivo_proposta,
        })),
        observacoes: cotacao.observacoes,
        created_by: userId,
      });
    } else if (!cotacao && open) {
      form.reset({
        status: 'aguardando',
        requisicao_id: 0,
        requisicao_numero: '',
        requisicao_items: [],
        data_abertura: new Date().toISOString().split('T')[0],
        data_limite_resposta: '',
        data_finalizacao: undefined,
        fornecedores: [],
        observacoes: '',
        created_by: userId,
      });
    }
  }, [cotacao, open, userId, form]);

  // Quando selecionar requisição, popular items
  const handleRequisicaoChange = (requisicaoId: string) => {
    const req = requisicoes.find((r) => r.id === parseInt(requisicaoId));
    if (req) {
      form.setValue('requisicao_id', req.id);
      form.setValue('requisicao_numero', req.numero);
      form.setValue('requisicao_items', req.items);

      // Para cada fornecedor já adicionado, popular items base
      const currentFornecedores = form.getValues('fornecedores');
      currentFornecedores.forEach((_, index) => {
        const itemsBase = req.items.map((item) => ({
          id: undefined,
          cotacao_fornecedor_id: undefined,
          requisicao_item_id: item.id!,
          requisicao_item_descricao: item.descricao,
          valor_unitario: undefined,
          valor_total: undefined,
          marca: '',
          observacoes: '',
        }));
        form.setValue(`fornecedores.${index}.items`, itemsBase);
      });
    }
  };

  const handleAddFornecedor = () => {
    const requisicaoItems = form.getValues('requisicao_items');

    // Items base para o fornecedor (sem preços preenchidos)
    const itemsBase = requisicaoItems.map((item) => ({
      id: undefined,
      cotacao_fornecedor_id: undefined,
      requisicao_item_id: item.id!,
      requisicao_item_descricao: item.descricao,
      valor_unitario: undefined,
      valor_total: undefined,
      marca: '',
      observacoes: '',
    }));

    appendFornecedor({
      id: undefined,
      cotacao_id: undefined,
      fornecedor_id: 0,
      fornecedor_nome: '',
      fornecedor_cnpj: '',
      fornecedor_contato: '',
      fornecedor_email: '',
      fornecedor_telefone: '',
      data_envio: undefined,
      data_resposta: undefined,
      respondeu: false,
      items: itemsBase,
      prazo_entrega: undefined,
      forma_pagamento: '',
      condicoes_pagamento: '',
      validade_proposta: undefined,
      observacoes: '',
      arquivo_proposta: '',
    });
  };

  const onSubmit = async (data: CotacaoFormData) => {
    setCustomErrors([]);

    // Validação customizada
    const { validateCotacaoForm } = await import(
      '@/lib/suprimentos/compras/cotacaoValidations'
    );
    const { isValid, errors } = validateCotacaoForm(data);

    if (!isValid) {
      setCustomErrors(errors);
      return;
    }

    try {
      if (isEditing && cotacao) {
        await updateMutation.mutateAsync({
          id: cotacao.id,
          data: {
            status: data.status,
            requisicao_id: data.requisicao_id,
            data_abertura: data.data_abertura,
            data_limite_resposta: data.data_limite_resposta,
            data_finalizacao: data.data_finalizacao,
            fornecedores: data.fornecedores,
            observacoes: data.observacoes,
          },
        });
      } else {
        await createMutation.mutateAsync({
          status: data.status,
          requisicao_id: data.requisicao_id,
          data_abertura: data.data_abertura,
          data_limite_resposta: data.data_limite_resposta,
          data_finalizacao: data.data_finalizacao,
          fornecedores: data.fornecedores,
          observacoes: data.observacoes,
          created_by: data.created_by,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar cotação:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cotação' : 'Nova Cotação'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados da cotação e fornecedores.'
              : 'Selecione uma requisição aprovada e adicione fornecedores para cotar.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Erros customizados */}
          {customErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {customErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

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
                      <SelectItem value="aguardando">Aguardando</SelectItem>
                      <SelectItem value="em_analise">Em Análise</SelectItem>
                      <SelectItem value="finalizada">Finalizada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.status.message}
                    </p>
                  )}
                </div>

                {/* Requisição */}
                <div>
                  <Label htmlFor="requisicao">Requisição *</Label>
                  <Select
                    value={form.watch('requisicao_id')?.toString()}
                    onValueChange={handleRequisicaoChange}
                    disabled={isEditing || loadingRequisicoes}
                  >
                    <SelectTrigger id="requisicao">
                      <SelectValue placeholder="Selecione a requisição" />
                    </SelectTrigger>
                    <SelectContent>
                      {requisicoesDisponiveis.map((req) => (
                        <SelectItem key={req.id} value={req.id.toString()}>
                          {req.numero} - {req.solicitante_nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.requisicao_id && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.requisicao_id.message}
                    </p>
                  )}
                </div>

                {/* Data Abertura */}
                <div>
                  <Label htmlFor="data_abertura">Data de Abertura *</Label>
                  <Input
                    id="data_abertura"
                    type="date"
                    {...form.register('data_abertura')}
                  />
                  {form.formState.errors.data_abertura && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.data_abertura.message}
                    </p>
                  )}
                </div>

                {/* Data Limite Resposta */}
                <div>
                  <Label htmlFor="data_limite_resposta">Data Limite de Resposta *</Label>
                  <Input
                    id="data_limite_resposta"
                    type="date"
                    {...form.register('data_limite_resposta')}
                  />
                  {form.formState.errors.data_limite_resposta && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.data_limite_resposta.message}
                    </p>
                  )}
                </div>

                {/* Data Finalização */}
                {(form.watch('status') === 'finalizada' ||
                  form.watch('status') === 'cancelada') && (
                  <div className="col-span-2">
                    <Label htmlFor="data_finalizacao">Data de Finalização</Label>
                    <Input
                      id="data_finalizacao"
                      type="date"
                      {...form.register('data_finalizacao')}
                    />
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  rows={3}
                  placeholder="Observações gerais sobre a cotação..."
                  {...form.register('observacoes')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items da Requisição (Readonly) */}
          {form.watch('requisicao_items').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items da Requisição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {form.watch('requisicao_items').map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border rounded-lg p-3 bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.descricao}</p>
                        <p className="text-sm text-muted-foreground">
                          Qtd: {item.quantidade} {item.unidade}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fornecedores */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Fornecedores</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFornecedor}
                  disabled={form.watch('requisicao_id') === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Fornecedor
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fornecedoresFields.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Nenhum fornecedor adicionado.</p>
                  <p className="text-sm">
                    Selecione uma requisição e clique em "Adicionar Fornecedor".
                  </p>
                </div>
              ) : (
                fornecedoresFields.map((fornecedor, fornecedorIndex) => (
                  <FornecedorCard
                    key={fornecedor.id}
                    fornecedorIndex={fornecedorIndex}
                    form={form}
                    onRemove={() => removeFornecedor(fornecedorIndex)}
                  />
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
              {isEditing ? 'Salvar Alterações' : 'Criar Cotação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Componente auxiliar para card de fornecedor
function FornecedorCard({
  fornecedorIndex,
  form,
  onRemove,
}: {
  fornecedorIndex: number;
  form: any;
  onRemove: () => void;
}) {
  const respondeu = form.watch(`fornecedores.${fornecedorIndex}.respondeu`);

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Fornecedor #{fornecedorIndex + 1}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dados do Fornecedor */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Nome do Fornecedor *</Label>
            <Input
              placeholder="Ex: Parafusos Ltda"
              {...form.register(`fornecedores.${fornecedorIndex}.fornecedor_nome`)}
            />
          </div>

          <div>
            <Label>CNPJ</Label>
            <Input
              placeholder="00.000.000/0000-00"
              {...form.register(`fornecedores.${fornecedorIndex}.fornecedor_cnpj`)}
            />
          </div>

          <div>
            <Label>Contato</Label>
            <Input
              placeholder="Nome do contato"
              {...form.register(`fornecedores.${fornecedorIndex}.fornecedor_contato`)}
            />
          </div>

          <div>
            <Label>E-mail</Label>
            <Input
              type="email"
              placeholder="contato@fornecedor.com"
              {...form.register(`fornecedores.${fornecedorIndex}.fornecedor_email`)}
            />
          </div>

          <div>
            <Label>Telefone</Label>
            <Input
              placeholder="(00) 0000-0000"
              {...form.register(`fornecedores.${fornecedorIndex}.fornecedor_telefone`)}
            />
          </div>
        </div>

        <Separator />

        {/* Checkbox Respondeu */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`respondeu-${fornecedorIndex}`}
            checked={respondeu}
            onCheckedChange={(checked) =>
              form.setValue(
                `fornecedores.${fornecedorIndex}.respondeu`,
                checked === true
              )
            }
          />
          <Label
            htmlFor={`respondeu-${fornecedorIndex}`}
            className="cursor-pointer"
          >
            Fornecedor respondeu à cotação
          </Label>
        </div>

        {/* Se respondeu, mostrar campos de cotação */}
        {respondeu && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Prazo de Entrega (dias) *</Label>
                <Input
                  type="number"
                  min="0"
                  {...form.register(`fornecedores.${fornecedorIndex}.prazo_entrega`, {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div>
                <Label>Forma de Pagamento *</Label>
                <Input
                  placeholder="Ex: À vista, 30/60 dias"
                  {...form.register(`fornecedores.${fornecedorIndex}.forma_pagamento`)}
                />
              </div>

              <div>
                <Label>Validade Proposta (dias)</Label>
                <Input
                  type="number"
                  min="0"
                  {...form.register(
                    `fornecedores.${fornecedorIndex}.validade_proposta`,
                    {
                      valueAsNumber: true,
                    }
                  )}
                />
              </div>
            </div>

            <div>
              <Label>Condições de Pagamento</Label>
              <Textarea
                rows={2}
                placeholder="Detalhe as condições..."
                {...form.register(
                  `fornecedores.${fornecedorIndex}.condicoes_pagamento`
                )}
              />
            </div>

            {/* Items Cotados */}
            <div>
              <Label className="text-base font-semibold">Items Cotados</Label>
              <div className="mt-2 space-y-2">
                {form
                  .watch(`fornecedores.${fornecedorIndex}.items`)
                  ?.map((item: any, itemIndex: number) => (
                    <div
                      key={itemIndex}
                      className="border rounded-lg p-3 space-y-2 bg-muted/30"
                    >
                      <p className="font-medium text-sm">
                        {item.requisicao_item_descricao}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Valor Unitário *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...form.register(
                              `fornecedores.${fornecedorIndex}.items.${itemIndex}.valor_unitario`,
                              {
                                valueAsNumber: true,
                              }
                            )}
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Valor Total *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...form.register(
                              `fornecedores.${fornecedorIndex}.items.${itemIndex}.valor_total`,
                              {
                                valueAsNumber: true,
                              }
                            )}
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Marca</Label>
                          <Input
                            placeholder="Marca"
                            {...form.register(
                              `fornecedores.${fornecedorIndex}.items.${itemIndex}.marca`
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                rows={2}
                placeholder="Observações sobre a proposta..."
                {...form.register(`fornecedores.${fornecedorIndex}.observacoes`)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
