import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  // Helper para calcular AV% (Análise Vertical - percentual sobre Total Venda)
  const calcularAV = (valor: number): string => {
    if (valores.totalVenda === 0) return '0,00%';
    return formatPercentage((valor / valores.totalVenda) * 100);
  };

  // Calcular valores de tributos individuais
  const valorISS = orcamento.tributos.temISS
    ? valores.subtotal * (orcamento.tributos.aliquotaISS / 100)
    : 0;
  const valorSimples = valores.subtotal * (orcamento.tributos.aliquotaSimples / 100);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            DRE - Demonstrativo de Resultado
          </CardTitle>
          {isNegativo && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Prejuízo
            </Badge>
          )}
          {margemBaixa && !isNegativo && (
            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 gap-1">
              <AlertTriangle className="h-3 w-3" />
              Margem Baixa
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Classificação</TableHead>
                <TableHead className="text-right font-bold">Valor (R$)</TableHead>
                <TableHead className="text-right font-bold w-[100px]">AV%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Receita Bruta de Vendas */}
              <TableRow className="bg-blue-50/50 dark:bg-blue-950/20 font-semibold">
                <TableCell>Receita bruta de vendas</TableCell>
                <TableCell className="text-right text-blue-600 dark:text-blue-400 font-bold">
                  {formatCurrency(valores.totalVenda)}
                </TableCell>
                <TableCell className="text-right text-blue-600 dark:text-blue-400">
                  {calcularAV(valores.totalVenda)}
                </TableCell>
              </TableRow>

              {/* Deduções da Receita (Tributos) - Header */}
              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold text-red-700 dark:text-red-400">
                  (-) Deduções da receita (Tributos)
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400 font-bold">
                  {formatCurrency(valores.tributosTotal)}
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  {calcularAV(valores.tributosTotal)}
                </TableCell>
              </TableRow>

              {/* Breakdown de Tributos - ISS */}
              {orcamento.tributos.temISS && (
                <TableRow className="text-sm">
                  <TableCell className="pl-8 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-orange-400 dark:bg-orange-500"></span>
                      ISS ({formatPercentage(orcamento.tributos.aliquotaISS)})
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    {formatCurrency(valorISS)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {calcularAV(valorISS)}
                  </TableCell>
                  </TableRow>
              )}

              {/* Breakdown de Tributos - Simples Nacional */}
              <TableRow className="text-sm">
                <TableCell className="pl-8 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-400 dark:bg-orange-500"></span>
                    Simples Nacional ({formatPercentage(orcamento.tributos.aliquotaSimples)})
                  </span>
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  {formatCurrency(valorSimples)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-xs">
                  {calcularAV(valorSimples)}
                </TableCell>
              </TableRow>

              {/* Receita Líquida */}
              <TableRow className="bg-blue-50 dark:bg-blue-950/20 font-semibold border-t-2">
                <TableCell className="font-bold">(=) Receita líquida</TableCell>
                <TableCell className="text-right text-blue-700 dark:text-blue-300 font-bold">
                  {formatCurrency(dre.receitaLiquida)}
                </TableCell>
                <TableCell className="text-right text-blue-700 dark:text-blue-300">
                  {calcularAV(dre.receitaLiquida)}
                </TableCell>
              </TableRow>

              {/* Custos Diretos de Produção - Header */}
              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold text-red-700 dark:text-red-400">
                  (-) Custos diretos de produção
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400 font-bold">
                  {formatCurrency(valores.custoDirectoTotal)}
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  {calcularAV(valores.custoDirectoTotal)}
                </TableCell>
              </TableRow>

              {/* Breakdown por Composição - Custos Diretos */}
              {breakdownComposicoes.map((comp) => (
                <TableRow key={`custo-${comp.id}`} className="text-sm">
                  <TableCell className="pl-8 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 dark:bg-blue-500"></span>
                      {comp.nome}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    {formatCurrency(comp.custoDirecto)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {formatPercentage(comp.percentualCusto)}
                  </TableCell>
                  </TableRow>
              ))}

              {/* Lucro Bruto */}
              <TableRow className="bg-green-50 dark:bg-green-950/20 font-semibold border-t-2">
                <TableCell>
                  <div>
                    <div className="font-bold">(=) Lucro bruto</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      Margem: {formatPercentage(dre.margemBruta)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className={`font-bold ${dre.lucroBruto < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-300'}`}>
                    {formatCurrency(dre.lucroBruto)}
                  </div>
                  <div className="text-xs flex items-center gap-1 justify-end">
                    {dre.margemBruta > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className="text-muted-foreground">{formatPercentage(dre.margemBruta)}</span>
                  </div>
                </TableCell>
                <TableCell className={`text-right ${dre.lucroBruto < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-300'}`}>
                  {calcularAV(dre.lucroBruto)}
                </TableCell>
              </TableRow>

              {/* Despesas Administrativas (BDI) - Header */}
              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold text-red-700 dark:text-red-400">
                  (-) Despesas administrativas (BDI)
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400 font-bold">
                  {formatCurrency(valores.bdiTotal)}
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  {calcularAV(valores.bdiTotal)}
                </TableCell>
              </TableRow>

              {/* Breakdown por Composição - BDI */}
              {breakdownComposicoes.map((comp) => (
                <TableRow key={`bdi-${comp.id}`} className="text-sm">
                  <TableCell className="pl-8 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-purple-400 dark:bg-purple-500"></span>
                      BDI {comp.nome} ({formatPercentage(comp.bdiPercentual)})
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    {formatCurrency(comp.bdi)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {formatPercentage(comp.percentualBDI)}
                  </TableCell>
                  </TableRow>
              ))}

              {/* Lucro Líquido */}
              <TableRow className={`font-bold border-t-2 ${
                isNegativo
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  : margemBaixa
                  ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              }`}>
                <TableCell>
                  <div>
                    <div className="text-lg">(=) Lucro líquido</div>
                    <div className="text-xs text-muted-foreground font-normal mt-1">
                      Margem sobre o total: {formatPercentage(dre.margemLiquida)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className={`text-2xl ${
                    isNegativo ? 'text-red-600 dark:text-red-400' : margemBaixa ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300'
                  }`}>
                    {formatCurrency(dre.lucroLiquido)}
                  </div>
                  <div className="text-sm flex items-center gap-1 justify-end mt-1">
                    {dre.margemLiquida > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-semibold ${
                      isNegativo ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-300'
                    }`}>
                      {formatPercentage(dre.margemLiquida)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={`text-right text-lg ${
                  isNegativo ? 'text-red-600 dark:text-red-400' : margemBaixa ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300'
                }`}>
                  {calcularAV(dre.lucroLiquido)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Legenda e Observações */}
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Legenda:</p>
            <p className="mb-2">
              <strong>AV%</strong> (Análise Vertical): Percentual de cada item em relação à Receita Bruta de Vendas
            </p>
            <p className="text-xs italic">
              💡 <strong>AH%</strong> (Análise Horizontal) estará disponível quando implementarmos versionamento de orçamentos (Rev.00, Rev.01, etc.) para comparar evolução de custos entre revisões.
            </p>
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs">
            <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">⚠️ Observação Importante:</p>
            <p className="text-yellow-700 dark:text-yellow-400 mb-2">
              O sistema atual utiliza <strong>formação de preço por markup</strong>: Preço = (Custo Direto + BDI) + Tributos.
            </p>
            <p className="text-yellow-700 dark:text-yellow-400">
              Neste modelo, o <strong>Lucro Líquido = 0</strong> porque o BDI já absorve toda a margem planejada. Para ter lucro líquido positivo, seria necessário adicionar uma <strong>margem de lucro</strong> separada do BDI ou ajustar o percentual de BDI para incluir a margem desejada.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DREViewer;
