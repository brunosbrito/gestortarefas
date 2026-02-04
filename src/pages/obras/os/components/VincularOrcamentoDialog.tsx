/**
 * FASE 1 PCP: Dialog para Vincular Orçamento a Service Order
 * Permite selecionar orçamento e escolher composições que a OS executará
 * Sistema: Gestor Master - GMX Soluções Industriais
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Link2, DollarSign, Package, Clock, AlertCircle } from 'lucide-react';
import OrcamentoExecucaoService from '@/services/OrcamentoExecucaoService';
import { vincularOrcamento } from '@/services/ServiceOrderService';
import { Orcamento, ComposicaoCustos } from '@/interfaces/OrcamentoInterface';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface VincularOrcamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceOrderId: number;
  serviceOrder?: ServiceOrder; // Opcional: para verificar vínculo existente
  onSuccess?: () => void;
}

export function VincularOrcamentoDialog({
  open,
  onOpenChange,
  serviceOrderId,
  serviceOrder,
  onSuccess,
}: VincularOrcamentoDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progressoGeracao, setProgressoGeracao] = useState({ atual: 0, total: 0 });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [selectedOrcamentoId, setSelectedOrcamentoId] = useState<string>('');
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [selectedComposicaoIds, setSelectedComposicaoIds] = useState<string[]>([]);

  // Carrega orçamentos disponíveis
  useEffect(() => {
    const loadOrcamentos = async () => {
      try {
        setLoading(true);
        const data = await OrcamentoExecucaoService.getAllOrcamentos();
        setOrcamentos(data);
      } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar orçamentos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadOrcamentos();
    }
  }, [open, toast]);

  // Carrega orçamento selecionado
  useEffect(() => {
    const loadOrcamentoDetalhes = async () => {
      if (!selectedOrcamentoId) {
        setSelectedOrcamento(null);
        setSelectedComposicaoIds([]);
        return;
      }

      try {
        const orc = await OrcamentoExecucaoService.getOrcamentoById(selectedOrcamentoId);
        setSelectedOrcamento(orc);
        // Auto-seleciona todas as composições por padrão
        if (orc) {
          setSelectedComposicaoIds(orc.composicoes.map(c => c.id));
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes do orçamento:', error);
      }
    };

    loadOrcamentoDetalhes();
  }, [selectedOrcamentoId]);

  // Toggle seleção de composição
  const handleToggleComposicao = (composicaoId: string) => {
    setSelectedComposicaoIds(prev =>
      prev.includes(composicaoId)
        ? prev.filter(id => id !== composicaoId)
        : [...prev, composicaoId]
    );
  };

  // Calcula custo planejado total
  const calcularCustoPlanejado = (): number => {
    if (!selectedOrcamento) return 0;

    return selectedOrcamento.composicoes
      .filter(c => selectedComposicaoIds.includes(c.id))
      .reduce((sum, c) => sum + c.subtotal, 0);
  };

  // Valida e inicia vinculação
  const handleVincular = () => {
    if (!selectedOrcamentoId || selectedComposicaoIds.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Selecione um orçamento e pelo menos uma composição',
        variant: 'destructive',
      });
      return;
    }

    // Se já existe orçamento vinculado, pedir confirmação
    if (serviceOrder?.orcamentoId) {
      setShowConfirmDialog(true);
      return;
    }

    // Caso contrário, executa direto
    executarVinculacao();
  };

  // Verifica e executa vinculação
  const executarVinculacao = async () => {
    try {
      setSubmitting(true);
      setProgressoGeracao({ atual: 0, total: selectedComposicaoIds.length });

      // Vincula orçamento à OS
      await vincularOrcamento(
        serviceOrderId,
        selectedOrcamentoId,
        selectedComposicaoIds
      );

      // Gera atividades baseadas nas composições COM FEEDBACK
      for (let i = 0; i < selectedComposicaoIds.length; i++) {
        setProgressoGeracao({ atual: i + 1, total: selectedComposicaoIds.length });
        await OrcamentoExecucaoService.gerarAtividadesDeBOM(
          serviceOrderId,
          selectedComposicaoIds[i]
        );
      }

      toast({
        title: 'Sucesso!',
        description: `Orçamento vinculado e ${selectedComposicaoIds.length} composições importadas`,
      });

      onOpenChange(false);
      setProgressoGeracao({ atual: 0, total: 0 });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao vincular orçamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível vincular orçamento',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const custoPlanejado = calcularCustoPlanejado();

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Vincular Orçamento a Service Order
          </DialogTitle>
          <DialogDescription>
            Selecione o orçamento e escolha quais composições de custo esta OS executará
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seleção de Orçamento */}
          <div className="space-y-2">
            <Label>Orçamento</Label>
            <Select
              value={selectedOrcamentoId}
              onValueChange={setSelectedOrcamentoId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um orçamento..." />
              </SelectTrigger>
              <SelectContent>
                {orcamentos.map(orc => (
                  <SelectItem key={orc.id} value={orc.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{orc.numero}</span>
                      <span className="text-muted-foreground">-</span>
                      <span>{orc.nome}</span>
                      <Badge variant="outline">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(orc.totalVenda)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detalhes do Orçamento */}
          {selectedOrcamento && (
            <>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Cliente</CardDescription>
                    <CardTitle className="text-lg">
                      {selectedOrcamento.clienteNome || 'N/A'}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Código Projeto</CardDescription>
                    <CardTitle className="text-lg">
                      {selectedOrcamento.codigoProjeto || 'N/A'}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Peso Total</CardDescription>
                    <CardTitle className="text-lg">
                      {selectedOrcamento.pesoTotalProjeto
                        ? `${selectedOrcamento.pesoTotalProjeto.toLocaleString('pt-BR')} kg`
                        : 'N/A'}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Separator />

              {/* Seleção de Composições */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Composições de Custo
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {selectedComposicaoIds.length} de {selectedOrcamento.composicoes.length} selecionadas
                  </span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-3 bg-muted/30">
                  {selectedOrcamento.composicoes.map(composicao => {
                    const isSelected = selectedComposicaoIds.includes(composicao.id);

                    return (
                      <Card
                        key={composicao.id}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleToggleComposicao(composicao.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleComposicao(composicao.id)}
                              className="mt-1"
                            />

                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">{composicao.nome}</h4>
                                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Package className="w-3 h-3" />
                                      {composicao.itens.length} itens
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                      }).format(composicao.subtotal)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Preview dos itens */}
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Itens principais:</span>{' '}
                                {composicao.itens
                                  .slice(0, 3)
                                  .map(i => i.descricao)
                                  .join(', ')}
                                {composicao.itens.length > 3 && ` +${composicao.itens.length - 3} mais`}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Resumo de Custos */}
              {selectedComposicaoIds.length > 0 && (
                <Card className="border-primary bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Custo Planejado Total
                    </CardTitle>
                    <CardDescription>
                      Soma das composições selecionadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(custoPlanejado)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Aviso */}
          {selectedComposicaoIds.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-blue-900 dark:text-blue-100">
                <strong>Atividades serão geradas automaticamente:</strong> Para cada item das
                composições selecionadas, uma atividade será criada com quantidade planejada e custo.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleVincular}
            disabled={!selectedOrcamentoId || selectedComposicaoIds.length === 0 || submitting}
          >
            <Link2 className="w-4 h-4 mr-2" />
            {submitting && progressoGeracao.total > 0
              ? `Gerando atividades... (${progressoGeracao.atual}/${progressoGeracao.total})`
              : submitting
              ? 'Vinculando...'
              : 'Vincular e Gerar Atividades'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Alert Dialog de Confirmação - Alteração de Vínculo */}
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alterar Vínculo de Orçamento?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta OS já possui um orçamento vinculado. Ao confirmar, o vínculo anterior será
            substituído e novas atividades serão geradas com base nas composições selecionadas.
            <br /><br />
            <strong>Atenção:</strong> Atividades existentes vinculadas ao orçamento anterior
            não serão afetadas, mas novos vínculos serão criados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setShowConfirmDialog(false);
              executarVinculacao();
            }}
            className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
          >
            Confirmar Alteração
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
