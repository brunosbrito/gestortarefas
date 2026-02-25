import { useState } from 'react';
import {
  FileText,
  TrendingUp,
  DollarSign,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { formatCurrency, formatPercentage } from '@/lib/currency';
import { useOrcamentoCalculos } from '@/hooks/useOrcamentoCalculos';
import { useToast } from '@/hooks/use-toast';
import OrcamentoService from '@/services/OrcamentoService';

interface AbaResumoProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  rascunho: {
    label: 'Rascunho',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: <FileText className="h-3 w-3" />,
  },
  em_analise: {
    label: 'Em Análise',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: <Clock className="h-3 w-3" />,
  },
  aprovado: {
    label: 'Aprovado',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  rejeitado: {
    label: 'Rejeitado',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: <XCircle className="h-3 w-3" />,
  },
};

// Fluxo de status: rascunho → em_analise → aprovado (ou rejeitado)
const PROXIMOS_STATUS: Record<string, string[]> = {
  rascunho: ['em_analise'],
  em_analise: ['aprovado', 'rejeitado'],
  aprovado: ['em_analise'],
  rejeitado: ['em_analise'],
};

export default function AbaResumo({ orcamento, onUpdate }: AbaResumoProps) {
  const { toast } = useToast();
  const { valores, dre, statusViabilidade, breakdownComposicoes } = useOrcamentoCalculos(orcamento);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
  const [salvandoStatus, setSalvandoStatus] = useState(false);

  const statusAtual = orcamento.status || 'rascunho';
  const statusInfo = STATUS_CONFIG[statusAtual] ?? STATUS_CONFIG.rascunho;
  const proximosStatus = PROXIMOS_STATUS[statusAtual] ?? [];

  const handleMudarStatus = async (novoStatus: string) => {
    try {
      setSalvandoStatus(true);
      await OrcamentoService.update(orcamento.id, { ...orcamento, status: novoStatus as Orcamento['status'] });
      toast({ title: 'Sucesso', description: `Status atualizado para "${STATUS_CONFIG[novoStatus]?.label}"` });
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao atualizar status', variant: 'destructive' });
    } finally {
      setSalvandoStatus(false);
      setConfirmStatus(null);
    }
  };

  // Composições com custoDirecto > 0 para a tabela
  const composicoesAtivas = (orcamento.composicoes || []).filter((c) => c.custoDirecto > 0);

  return (
    <div className="space-y-6">
      {/* --- Cabeçalho do Projeto --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {orcamento.nome}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                {statusInfo.icon}
                {statusInfo.label}
              </Badge>
              <Badge variant="outline">{orcamento.numero}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Cliente</Label>
              <p className="font-medium mt-0.5">{orcamento.clienteNome || '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Tipo</Label>
              <p className="font-medium mt-0.5">
                {orcamento.tipo === 'servico' ? 'Serviço' : 'Produto'}
              </p>
            </div>
            {orcamento.codigoProjeto && (
              <div>
                <Label className="text-muted-foreground">Código do Projeto</Label>
                <p className="font-medium mt-0.5">{orcamento.codigoProjeto}</p>
              </div>
            )}
            {orcamento.pesoTotalProjeto ? (
              <div>
                <Label className="text-muted-foreground">Peso Total</Label>
                <p className="font-medium mt-0.5">{orcamento.pesoTotalProjeto.toFixed(2)} kg</p>
              </div>
            ) : orcamento.areaTotalM2 ? (
              <div>
                <Label className="text-muted-foreground">Área Total</Label>
                <p className="font-medium mt-0.5">{orcamento.areaTotalM2.toFixed(2)} m²</p>
              </div>
            ) : null}
          </div>

          {/* Workflow de status */}
          {proximosStatus.length > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center gap-3 flex-wrap">
              <span className="text-sm text-muted-foreground">Avançar para:</span>
              {proximosStatus.map((prox) => {
                const cfg = STATUS_CONFIG[prox];
                return (
                  <Button
                    key={prox}
                    size="sm"
                    variant="outline"
                    className={`${cfg.color} border`}
                    onClick={() => setConfirmStatus(prox)}
                    disabled={salvandoStatus}
                  >
                    {cfg.icon}
                    <span className="ml-1.5">{cfg.label}</span>
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- KPIs --- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <Label className="text-muted-foreground text-xs">Total de Venda</Label>
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(valores.totalVenda)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-muted-foreground text-xs">Custo Direto</Label>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(valores.custoDirectoTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <Label className="text-muted-foreground text-xs">BDI Total</Label>
            </div>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(valores.bdiTotal)}</p>
            <p className="text-xs text-muted-foreground">Médio: {formatPercentage(valores.bdiMedio)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-orange-500" />
              <Label className="text-muted-foreground text-xs">Tributos</Label>
            </div>
            <p className="text-2xl font-bold text-orange-500">{formatCurrency(valores.tributosTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className={`h-4 w-4 ${dre.margemLiquida >= 15 ? 'text-green-600' : dre.margemLiquida >= 5 ? 'text-yellow-600' : 'text-red-600'}`} />
              <Label className="text-muted-foreground text-xs">Margem Líquida</Label>
            </div>
            <p className={`text-2xl font-bold ${dre.margemLiquida >= 15 ? 'text-green-600' : dre.margemLiquida >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
              {formatPercentage(dre.margemLiquida)}
            </p>
            <Badge className={`text-xs mt-1 ${statusViabilidade.class}`}>{statusViabilidade.label}</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Composições --- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Composição de Custos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {composicoesAtivas.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma composição com valores</p>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Composição</TableHead>
                    <TableHead className="text-right">Custo Direto</TableHead>
                    <TableHead className="text-right">BDI</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {composicoesAtivas.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell className="font-medium text-sm">{comp.nome}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(comp.custoDirecto)}</TableCell>
                      <TableCell className="text-right text-sm text-blue-600">
                        {formatCurrency(comp.bdi?.valor ?? 0)}
                        <span className="text-muted-foreground ml-1 text-xs">({comp.bdi?.percentual ?? 0}%)</span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">{formatCurrency(comp.subtotal)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {comp.percentualDoTotal.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* --- DRE + Precificação --- */}
        <div className="space-y-4">
          {/* Waterfall de Preços */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Formação de Preço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <WaterfallRow label="Custo Direto Total" value={valores.custoDirectoTotal} />
                <WaterfallRow label={`+ BDI Médio (${formatPercentage(valores.bdiMedio)})`} value={valores.bdiTotal} accent="blue" />
                <WaterfallRow label="= Subtotal" value={valores.subtotal} bold />
                <WaterfallRow
                  label={`+ Tributos (${formatPercentage(
                    orcamento.tributos
                      ? (orcamento.tributos.temISS ? orcamento.tributos.aliquotaISS : 0) + orcamento.tributos.aliquotaSimples
                      : 0
                  )})`}
                  value={valores.tributosTotal}
                  accent="orange"
                />
                <div className="border-t-2 pt-2">
                  <WaterfallRow label="= Total de Venda" value={valores.totalVenda} bold highlight />
                </div>
                {valores.custoPorM2 && (
                  <p className="text-xs text-muted-foreground pt-1">
                    Custo/m²: {formatCurrency(valores.custoPorM2)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* DRE Resumido */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                DRE Resumido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <DRERow label="Receita Bruta" value={valores.totalVenda} />
                <DRERow label="(−) Tributos" value={-valores.tributosTotal} negative />
                <DRERow label="= Receita Líquida" value={dre.receitaLiquida} bold />
                <DRERow label="(−) Custo Direto" value={-valores.custoDirectoTotal} negative />
                <DRERow label="= Lucro Bruto" value={dre.lucroBruto} bold
                  extra={`${formatPercentage(dre.margemBruta)} s/ rec. líq.`} />
                <DRERow label="(−) BDI" value={-valores.bdiTotal} negative />
                <div className="border-t-2 pt-2">
                  <DRERow
                    label="= Lucro Líquido"
                    value={dre.lucroLiquido}
                    bold
                    highlight={dre.lucroLiquido >= 0}
                    negative={dre.lucroLiquido < 0}
                    extra={`${formatPercentage(dre.margemLiquida)} s/ total`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmação de mudança de status */}
      <AlertDialog open={!!confirmStatus} onOpenChange={(open) => { if (!open) setConfirmStatus(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar mudança de status</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja alterar o status do orçamento para{' '}
              <strong>"{confirmStatus ? STATUS_CONFIG[confirmStatus]?.label : ''}"</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={salvandoStatus}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmStatus && handleMudarStatus(confirmStatus)} disabled={salvandoStatus}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Sub-componentes auxiliares
function WaterfallRow({
  label,
  value,
  bold,
  highlight,
  accent,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
  accent?: 'blue' | 'orange';
}) {
  const valueClass = highlight
    ? 'text-blue-600'
    : accent === 'blue'
    ? 'text-blue-600'
    : accent === 'orange'
    ? 'text-orange-500'
    : '';

  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
      <span className={`font-mono ${bold ? 'font-bold text-base' : ''} ${valueClass}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function DRERow({
  label,
  value,
  bold,
  highlight,
  negative,
  extra,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
  negative?: boolean;
  extra?: string;
}) {
  const valueClass = highlight
    ? 'text-green-600'
    : negative
    ? 'text-red-600'
    : '';

  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        <span className={bold ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
        {extra && <span className="text-xs text-muted-foreground ml-2">({extra})</span>}
      </div>
      <span className={`font-mono ${bold ? 'font-bold text-base' : ''} ${valueClass}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}
