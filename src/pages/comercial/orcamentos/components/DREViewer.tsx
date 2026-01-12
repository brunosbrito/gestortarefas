import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { formatCurrency, formatPercentage } from '@/lib/currency';
import { useOrcamentoCalculos } from '@/hooks/useOrcamentoCalculos';

interface DREViewerProps {
  orcamento: Orcamento;
}

const DREViewer = ({ orcamento }: DREViewerProps) => {
  const { valores, dre, breakdownComposicoes } = useOrcamentoCalculos(orcamento);

  const isNegativo = dre.lucroLiquido < 0;
  const margemBaixa = dre.margemLiquida < 5 && dre.margemLiquida > 0;

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            DRE - Demonstrativo de Resultado
          </CardTitle>
          {isNegativo && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Prejuízo
            </Badge>
          )}
          {margemBaixa && !isNegativo && (
            <Badge className="bg-yellow-100 text-yellow-700 gap-1">
              <AlertTriangle className="h-3 w-3" />
              Margem Baixa
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4 font-mono text-sm">
          {/* Valor Total dos Produtos */}
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Valor total dos produtos/serviços</span>
            <span className="font-bold text-blue-600">
              {formatCurrency(valores.subtotal)}
            </span>
          </div>

          {/* Tributos */}
          <div className="flex justify-between items-center py-2 text-muted-foreground">
            <span>(-) Tributos a recolher</span>
            <span className="text-red-600">
              {formatCurrency(valores.tributosTotal)}
            </span>
          </div>

          {/* Receita Líquida */}
          <div className="flex justify-between items-center py-3 bg-blue-50 px-3 rounded-lg">
            <span className="font-semibold">(=) Receita líquida</span>
            <span className="font-bold text-blue-700">
              {formatCurrency(dre.receitaLiquida)}
            </span>
          </div>

          {/* Custos Diretos - Com Breakdown */}
          <div className="space-y-2 py-2">
            <div className="flex justify-between items-center">
              <span>(-) Custos diretos de produção</span>
              <span className="text-red-600">
                {formatCurrency(valores.custoDirectoTotal)}
              </span>
            </div>

            {/* Breakdown por Composição */}
            {breakdownComposicoes.length > 0 && (
              <div className="ml-8 space-y-1 text-xs text-muted-foreground">
                {breakdownComposicoes.map(comp => (
                  <div key={comp.id} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                      {comp.nome}
                    </span>
                    <span>
                      {formatCurrency(comp.custoDirecto)} ({formatPercentage(comp.percentualCusto)})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lucro Bruto */}
          <div className="flex justify-between items-center py-3 bg-green-50 px-3 rounded-lg">
            <div>
              <div className="font-semibold">(=) Lucro bruto</div>
              <div className="text-xs text-muted-foreground">
                Margem: {formatPercentage(dre.margemBruta)}
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${dre.lucroBruto < 0 ? 'text-red-600' : 'text-green-700'}`}>
                {formatCurrency(dre.lucroBruto)}
              </div>
              <div className="text-xs flex items-center gap-1">
                {dre.margemBruta > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span>{formatPercentage(dre.margemBruta)}</span>
              </div>
            </div>
          </div>

          {/* BDI - Com Breakdown */}
          <div className="space-y-2 py-2">
            <div className="flex justify-between items-center">
              <span>(-) Despesas administrativas (BDI)</span>
              <span className="text-red-600">
                {formatCurrency(valores.bdiTotal)}
              </span>
            </div>

            {/* Breakdown por Composição */}
            {breakdownComposicoes.length > 0 && (
              <div className="ml-8 space-y-1 text-xs text-muted-foreground">
                {breakdownComposicoes.map(comp => (
                  <div key={comp.id} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                      BDI {comp.nome} ({formatPercentage(comp.bdiPercentual)})
                    </span>
                    <span>
                      {formatCurrency(comp.bdi)} ({formatPercentage(comp.percentualBDI)})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lucro Líquido */}
          <div className={`flex justify-between items-center py-4 px-3 rounded-lg border-2 ${
            isNegativo
              ? 'bg-red-50 border-red-200'
              : margemBaixa
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div>
              <div className="font-bold text-lg">(=) Lucro líquido</div>
              <div className="text-xs text-muted-foreground mt-1">
                Margem sobre o total: {formatPercentage(dre.margemLiquida)}
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold text-2xl ${
                isNegativo ? 'text-red-600' : margemBaixa ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {formatCurrency(dre.lucroLiquido)}
              </div>
              <div className="text-sm flex items-center gap-1 justify-end mt-1">
                {dre.margemLiquida > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className="font-semibold">{formatPercentage(dre.margemLiquida)}</span>
              </div>
            </div>
          </div>

          {/* Indicadores */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Margem Bruta</div>
              <div className={`text-lg font-bold ${dre.margemBruta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(dre.margemBruta)}
              </div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Margem Líquida</div>
              <div className={`text-lg font-bold ${dre.margemLiquida > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(dre.margemLiquida)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DREViewer;
