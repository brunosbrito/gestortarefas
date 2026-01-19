import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { formatCurrency, formatPercentage } from '@/lib/currency';
import { useOrcamentoCalculos } from '@/hooks/useOrcamentoCalculos';

interface QQPDashboardProps {
  orcamento: Orcamento;
}

const QQPDashboard = ({ orcamento }: QQPDashboardProps) => {
  const { valores, dre, alertas, statusViabilidade, breakdownComposicoes } = useOrcamentoCalculos(orcamento);

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card className="border-none shadow-lg bg-muted/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Resumo Financeiro (QQP)
            </CardTitle>
            <Badge
              className={
                statusViabilidade.status === 'prejuizo'
                  ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                  : statusViabilidade.status === 'margem_baixa'
                  ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                  : statusViabilidade.status === 'aceitavel'
                  ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800'
                  : 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
              }
            >
              {statusViabilidade.label}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Grid de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Venda */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total de Venda</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(valores.totalVenda)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Margem Líquida */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Margem Líquida</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${dre.margemLiquida < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatPercentage(dre.margemLiquida)}
                </p>
                {dre.margemLiquida > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BDI Médio */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">BDI Médio</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatPercentage(orcamento.bdiMedio)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Custo por m² */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Custo por m²</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {orcamento.custoPorM2 ? formatCurrency(orcamento.custoPorM2) : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Visual - Árvore de Composição */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Composição Detalhada</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4 font-mono text-sm">
            {/* Composições - Custo Direto */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold text-blue-600 dark:text-blue-400">
                <span>├─ Custos Diretos de Produção</span>
                <span>{formatCurrency(valores.custoDirectoTotal)}</span>
              </div>
              {breakdownComposicoes.map((comp, index) => (
                <div
                  key={comp.id}
                  className="flex justify-between items-center ml-6 text-muted-foreground"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-400 dark:bg-blue-500"></span>
                    {comp.nome}
                  </span>
                  <span>
                    {formatCurrency(comp.custoDirecto)}{' '}
                    <span className="text-xs">({formatPercentage(comp.percentualCusto)})</span>
                  </span>
                </div>
              ))}
            </div>

            {/* BDI */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between items-center font-semibold text-purple-600 dark:text-purple-400">
                <span>├─ BDI (Despesas Administrativas)</span>
                <span>{formatCurrency(valores.bdiTotal)}</span>
              </div>
              {breakdownComposicoes.map((comp) => (
                <div
                  key={comp.id}
                  className="flex justify-between items-center ml-6 text-muted-foreground"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-purple-400 dark:bg-purple-500"></span>
                    BDI {comp.nome} ({formatPercentage(comp.bdiPercentual)})
                  </span>
                  <span>
                    {formatCurrency(comp.bdi)}{' '}
                    <span className="text-xs">({formatPercentage(comp.percentualBDI)})</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotal */}
            <div className="flex justify-between items-center pt-2 border-t font-semibold text-lg">
              <span>├─ Subtotal (Custo + BDI)</span>
              <span className="text-blue-600 dark:text-blue-400">{formatCurrency(valores.subtotal)}</span>
            </div>

            {/* Tributos */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between items-center font-semibold text-orange-600 dark:text-orange-400">
                <span>├─ Tributos a Recolher</span>
                <span>{formatCurrency(valores.tributosTotal)}</span>
              </div>
              {orcamento.tributos.temISS && (
                <div className="flex justify-between items-center ml-6 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-400 dark:bg-orange-500"></span>
                    ISS ({formatPercentage(orcamento.tributos.aliquotaISS)})
                  </span>
                  <span>{formatCurrency(valores.subtotal * (orcamento.tributos.aliquotaISS / 100))}</span>
                </div>
              )}
              <div className="flex justify-between items-center ml-6 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                  Simples Nacional ({formatPercentage(orcamento.tributos.aliquotaSimples)})
                </span>
                <span>
                  {formatCurrency(valores.subtotal * (orcamento.tributos.aliquotaSimples / 100))}
                </span>
              </div>
            </div>

            {/* Total Venda */}
            <div className="flex justify-between items-center pt-4 border-t-2 border-blue-200 dark:border-blue-800 font-bold text-xl">
              <span>└─ TOTAL DE VENDA</span>
              <span className="text-blue-600 dark:text-blue-400">{formatCurrency(valores.totalVenda)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Viabilidade */}
      {alertas.length > 0 && (
        <Card className="border-none shadow-lg bg-yellow-50 dark:bg-yellow-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Viabilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertas.map((alerta, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    alerta.tipo === 'erro'
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                      : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
                  }`}
                >
                  <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{alerta.mensagem}</p>
                    {alerta.detalhes && (
                      <p className="text-sm mt-1 opacity-80">{alerta.detalhes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Positivo */}
      {alertas.length === 0 && statusViabilidade.status === 'bom' && (
        <Card className="border-none shadow-lg bg-green-50 dark:bg-green-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-6 w-6" />
              <div>
                <p className="font-semibold text-lg">Orçamento Viável</p>
                <p className="text-sm text-muted-foreground">
                  Margem líquida de {formatPercentage(dre.margemLiquida)} está dentro dos
                  parâmetros ideais. Todos os indicadores estão saudáveis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QQPDashboard;
