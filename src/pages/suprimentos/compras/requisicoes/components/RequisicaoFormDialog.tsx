// Componente de Formulário para Criar/Editar Requisição de Compra
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import {
  requisicaoSchema,
  validateRequisicaoForm,
  type RequisicaoFormData,
} from '@/lib/suprimentos/compras/requisicaoValidations';
import { Requisicao } from '@/interfaces/suprimentos/compras/RequisicaoInterface';
import { useCreateRequisicao, useUpdateRequisicao } from '@/hooks/suprimentos/compras/useRequisicoes';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RequisicaoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisicao?: Requisicao | null;
  mode: 'create' | 'edit';
}

export default function RequisicaoFormDialog({
  open,
  onOpenChange,
  requisicao,
  mode,
}: RequisicaoFormDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateRequisicao();
  const updateMutation = useUpdateRequisicao();
  const [customErrors, setCustomErrors] = useState<string[]>([]);

  const form = useForm<RequisicaoFormData>({
    resolver: zodResolver(requisicaoSchema),
    defaultValues: {
      status: 'rascunho',
      solicitante_id: 1, // Mock: usuário logado
      solicitante_nome: 'Usuário Mock',
      prioridade: 'media',
      data_requisicao: new Date().toISOString().split('T')[0],
      data_necessidade: '',
      items: [
        {
          descricao: '',
          especificacao: '',
          quantidade: 1,
          unidade: 'UN',
          data_necessidade: '',
          observacoes: '',
        },
      ],
      justificativa: '',
      observacoes: '',
      created_by: 1, // Mock: usuário logado
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Popular formulário em modo edição
  useEffect(() => {
    if (mode === 'edit' && requisicao) {
      form.reset({
        status: requisicao.status,
        solicitante_id: requisicao.solicitante_id,
        solicitante_nome: requisicao.solicitante_nome,
        centro_custo_id: requisicao.centro_custo_id,
        centro_custo_nome: requisicao.centro_custo_nome,
        obra_id: requisicao.obra_id,
        obra_nome: requisicao.obra_nome,
        data_requisicao: requisicao.data_requisicao.split('T')[0],
        data_necessidade: requisicao.data_necessidade.split('T')[0],
        prioridade: requisicao.prioridade,
        items: requisicao.items.map((item) => ({
          id: item.id,
          descricao: item.descricao,
          especificacao: item.especificacao || '',
          quantidade: item.quantidade,
          unidade: item.unidade,
          data_necessidade: item.data_necessidade.split('T')[0],
          centro_custo_id: item.centro_custo_id,
          observacoes: item.observacoes || '',
        })),
        justificativa: requisicao.justificativa,
        observacoes: requisicao.observacoes || '',
        aprovador_id: requisicao.aprovador_id,
        aprovador_nome: requisicao.aprovador_nome,
        data_aprovacao: requisicao.data_aprovacao,
        motivo_reprovacao: requisicao.motivo_reprovacao,
        created_by: requisicao.created_by,
      });
    } else if (mode === 'create') {
      form.reset({
        status: 'rascunho',
        solicitante_id: 1,
        solicitante_nome: 'Usuário Mock',
        prioridade: 'media',
        data_requisicao: new Date().toISOString().split('T')[0],
        data_necessidade: '',
        items: [
          {
            descricao: '',
            especificacao: '',
            quantidade: 1,
            unidade: 'UN',
            data_necessidade: '',
            observacoes: '',
          },
        ],
        justificativa: '',
        observacoes: '',
        created_by: 1,
      });
    }
  }, [mode, requisicao, form]);

  const handleAddItem = () => {
    append({
      descricao: '',
      especificacao: '',
      quantidade: 1,
      unidade: 'UN',
      data_necessidade: form.getValues('data_necessidade') || '',
      observacoes: '',
    });
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast({
        title: 'Atenção',
        description: 'É necessário ter pelo menos um item na requisição',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: RequisicaoFormData) => {
    // Validação customizada
    const validation = validateRequisicaoForm(data);
    if (!validation.isValid) {
      setCustomErrors(validation.errors);
      return;
    }

    setCustomErrors([]);

    // Converter datas para ISO com timezone
    const formattedData = {
      ...data,
      data_requisicao: new Date(data.data_requisicao).toISOString(),
      data_necessidade: new Date(data.data_necessidade).toISOString(),
      items: data.items.map((item) => ({
        ...item,
        data_necessidade: new Date(item.data_necessidade).toISOString(),
      })),
    };

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(formattedData);
      } else if (requisicao) {
        await updateMutation.mutateAsync({
          id: requisicao.id,
          data: formattedData,
        });
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar requisição:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Requisição de Compra' : 'Editar Requisição'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados da requisição e adicione os items necessários'
              : 'Atualize os dados da requisição'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Erros customizados */}
          {customErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
              <p className="font-semibold mb-2">Erros de validação:</p>
              <ul className="list-disc list-inside space-y-1">
                {customErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dados Gerais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Gerais</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Solicitante - Readonly em mock */}
              <div className="space-y-2">
                <Label>Solicitante</Label>
                <Input
                  value={form.watch('solicitante_nome')}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value) => form.setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="pendente">Pendente Aprovação</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridade */}
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade *</Label>
                <Select
                  value={form.watch('prioridade')}
                  onValueChange={(value) => form.setValue('prioridade', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.prioridade && (
                  <p className="text-sm text-destructive">{form.formState.errors.prioridade.message}</p>
                )}
              </div>

              {/* Data Requisição */}
              <div className="space-y-2">
                <Label htmlFor="data_requisicao">Data da Requisição *</Label>
                <Input
                  id="data_requisicao"
                  type="date"
                  {...form.register('data_requisicao')}
                />
                {form.formState.errors.data_requisicao && (
                  <p className="text-sm text-destructive">{form.formState.errors.data_requisicao.message}</p>
                )}
              </div>

              {/* Data Necessidade */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="data_necessidade">Data de Necessidade *</Label>
                <Input
                  id="data_necessidade"
                  type="date"
                  {...form.register('data_necessidade')}
                />
                <p className="text-xs text-muted-foreground">
                  Esta data será usada como padrão para os items
                </p>
                {form.formState.errors.data_necessidade && (
                  <p className="text-sm text-destructive">{form.formState.errors.data_necessidade.message}</p>
                )}
              </div>

              {/* Obra (Mock Select) */}
              <div className="space-y-2">
                <Label>Obra</Label>
                <Select
                  value={form.watch('obra_id')?.toString() || ''}
                  onValueChange={(value) => {
                    const obraId = value ? parseInt(value) : undefined;
                    form.setValue('obra_id', obraId);
                    // Mock: definir nome da obra
                    const obras = {
                      1: 'Galpão Industrial - Cliente XYZ',
                      2: 'Edifício Comercial - Shopping Center',
                    };
                    form.setValue('obra_nome', obraId ? obras[obraId as keyof typeof obras] : undefined);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma obra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Galpão Industrial - Cliente XYZ</SelectItem>
                    <SelectItem value="2">Edifício Comercial - Shopping Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Centro de Custo (Mock Select) */}
              <div className="space-y-2">
                <Label>Centro de Custo</Label>
                <Select
                  value={form.watch('centro_custo_id')?.toString() || ''}
                  onValueChange={(value) => {
                    const ccId = value ? parseInt(value) : undefined;
                    form.setValue('centro_custo_id', ccId);
                    // Mock: definir nome do CC
                    const centros = {
                      1: 'Obra Galpão Industrial',
                      2: 'Obra Edifício Comercial',
                      3: 'Manutenção Geral',
                      4: 'Administrativo',
                    };
                    form.setValue('centro_custo_nome', ccId ? centros[ccId as keyof typeof centros] : undefined);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um centro de custo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Obra Galpão Industrial</SelectItem>
                    <SelectItem value="2">Obra Edifício Comercial</SelectItem>
                    <SelectItem value="3">Manutenção Geral</SelectItem>
                    <SelectItem value="4">Administrativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Justificativa */}
            <div className="space-y-2">
              <Label htmlFor="justificativa">Justificativa *</Label>
              <Textarea
                id="justificativa"
                placeholder="Descreva a necessidade e justificativa da requisição..."
                {...form.register('justificativa')}
                rows={3}
              />
              {form.formState.errors.justificativa && (
                <p className="text-sm text-destructive">{form.formState.errors.justificativa.message}</p>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações adicionais (opcional)"
                {...form.register('observacoes')}
                rows={2}
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items da Requisição</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {form.formState.errors.items?.root && (
              <p className="text-sm text-destructive">{form.formState.errors.items.root.message}</p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Descrição */}
                    <div className="space-y-2 col-span-2">
                      <Label>Descrição *</Label>
                      <Input
                        placeholder="Ex: Parafusos Sextavados M12x50"
                        {...form.register(`items.${index}.descricao`)}
                      />
                      {form.formState.errors.items?.[index]?.descricao && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.items[index]?.descricao?.message}
                        </p>
                      )}
                    </div>

                    {/* Especificação */}
                    <div className="space-y-2 col-span-2">
                      <Label>Especificação</Label>
                      <Input
                        placeholder="Ex: Aço galvanizado, classe 8.8"
                        {...form.register(`items.${index}.especificacao`)}
                      />
                    </div>

                    {/* Quantidade */}
                    <div className="space-y-2">
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.quantidade`, { valueAsNumber: true })}
                      />
                      {form.formState.errors.items?.[index]?.quantidade && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.items[index]?.quantidade?.message}
                        </p>
                      )}
                    </div>

                    {/* Unidade */}
                    <div className="space-y-2">
                      <Label>Unidade *</Label>
                      <Select
                        value={form.watch(`items.${index}.unidade`)}
                        onValueChange={(value) => form.setValue(`items.${index}.unidade`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UN">Unidade (UN)</SelectItem>
                          <SelectItem value="M">Metro (M)</SelectItem>
                          <SelectItem value="M2">Metro Quadrado (M²)</SelectItem>
                          <SelectItem value="M3">Metro Cúbico (M³)</SelectItem>
                          <SelectItem value="KG">Quilograma (KG)</SelectItem>
                          <SelectItem value="L">Litro (L)</SelectItem>
                          <SelectItem value="CX">Caixa (CX)</SelectItem>
                          <SelectItem value="PC">Peça (PC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Data Necessidade do Item */}
                    <div className="space-y-2 col-span-2">
                      <Label>Data de Necessidade do Item *</Label>
                      <Input
                        type="date"
                        {...form.register(`items.${index}.data_necessidade`)}
                      />
                      {form.formState.errors.items?.[index]?.data_necessidade && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.items[index]?.data_necessidade?.message}
                        </p>
                      )}
                    </div>

                    {/* Observações do Item */}
                    <div className="space-y-2 col-span-2">
                      <Label>Observações do Item</Label>
                      <Textarea
                        placeholder="Observações específicas deste item..."
                        {...form.register(`items.${index}.observacoes`)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Criar Requisição' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
