import { useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';
import { useOrcamentoCalculos } from '@/hooks/useOrcamentoCalculos';

interface AbaQQPProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

const NOME_COMPOSICAO: Record<string, string> = {
  materiais: 'Materiais',
  jato_pintura: 'Jateamento e Pintura',
  ferramentas: 'Ferramentas',
  consumiveis: 'Consumíveis',
  mo_fabricacao: 'MO Fabricação',
  mo_montagem: 'MO Montagem',
  mobilizacao: 'Mobilização',
  desmobilizacao: 'Desmobilização',
};

const TIPOS_SUPRIMENTOS = ['materiais', 'jato_pintura', 'ferramentas', 'consumiveis'];
const TIPOS_MO = ['mo_fabricacao', 'mo_montagem', 'mobilizacao', 'desmobilizacao'];

export default function AbaQQP({ orcamento }: AbaQQPProps) {
  const { valores, dre, alertas, statusViabilidade } = useOrcamentoCalculos(orcamento);

  const composicoesSuprimentos = useMemo(
    () => orcamento.composicoes.filter((c) => TIPOS_SUPRIMENTOS.includes(c.tipo)),
    [orcamento.composicoes]
  );

  const composicoesMO = useMemo(
    () => orcamento.composicoes.filter((c) => TIPOS_MO.includes(c.tipo)),
    [orcamento.composicoes]
  );

  const totalSuprimentos = useMemo(
    () => composicoesSuprimentos.reduce((sum, c) => sum + c.subtotal, 0),
    [composicoesSuprimentos]
  );

  const totalMO = useMemo(
    () => composicoesMO.reduce((sum, c) => sum + c.subtotal, 0),
    [composicoesMO]
  );

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card className="border-none shadow bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-semibold text-lg">Quadro de Quantitativos e Preços (QQP)</p>
                <p className="text-sm text-muted-foreground">
                  Recalculado automaticamente a partir das composições do orçamento
                </p>
              </div>
            </div>
            <Badge className={statusViabilidade.class}>{statusViabilidade.label}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <Label className="text-muted-foreground text-xs">Custo Direto Total</Label>
            <p className="text-xl font-bold mt-1">{formatCurrency(valores.custoDirectoTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Label className="text-muted-foreground text-xs">BDI Total</Label>
            <p className="text-xl font-bold text-purple-600 mt-1">{formatCurrency(valores.bdiTotal)}</p>
            <p className="text-xs text-muted-foreground">Médio: {valores.bdiMedio.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Label className="text-muted-foreground text-xs">Total de Venda</Label>
            <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(valores.totalVenda)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Label className="text-muted-foreground text-xs">Margem Líquida</Label>
            <p
              className={`text-xl font-bold mt-1 ${
                dre.margemLiquida < 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {dre.margemLiquida.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* QQP Suprimentos */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5 text-blue-600" />
            QQP Suprimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {composicoesSuprimentos.length > 0 ? (
            <div className="space-y-1">
              {composicoesSuprimentos.map((comp) => (
                <div
                  key={comp.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {NOME_COMPOSICAO[comp.tipo] || comp.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Custo: {formatCurrency(comp.custoDirecto)} · BDI (
                      {comp.bdi?.percentual ?? 0}%): {formatCurrency(comp.bdi?.valor ?? 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(comp.subtotal)}</p>
                    {valores.subtotal > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {((comp.subtotal / valores.subtotal) * 100).toFixed(1)}% do total
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 font-bold text-blue-600">
                <span>Total Suprimentos</span>
                <span>{formatCurrency(totalSuprimentos)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item de suprimentos cadastrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* QQP Mão de Obra */}
      <Card className="border-orange-200">
        <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-orange-600" />
            QQP Mão de Obra
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {composicoesMO.length > 0 ? (
            <div className="space-y-1">
              {composicoesMO.map((comp) => (
                <div
                  key={comp.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {NOME_COMPOSICAO[comp.tipo] || comp.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Custo: {formatCurrency(comp.custoDirecto)} · BDI (
                      {comp.bdi?.percentual ?? 0}%): {formatCurrency(comp.bdi?.valor ?? 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(comp.subtotal)}</p>
                    {valores.subtotal > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {((comp.subtotal / valores.subtotal) * 100).toFixed(1)}% do total
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 font-bold text-orange-600">
                <span>Total Mão de Obra</span>
                <span>{formatCurrency(totalMO)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item de mão de obra cadastrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* QQP Cliente — Precificação Final */}
      <Card className="border-green-200">
        <CardHeader className="bg-green-50/50 dark:bg-green-950/20 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-green-600" />
            QQP Cliente — Precificação Final
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-muted-foreground">Suprimentos (c/ BDI)</Label>
              <span className="font-semibold">{formatCurrency(totalSuprimentos)}</span>
            </div>
            <div className="flex justify-between items-center">
              <Label className="text-muted-foreground">Mão de Obra (c/ BDI)</Label>
              <span className="font-semibold">{formatCurrency(totalMO)}</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <Label className="text-muted-foreground">Subtotal (Custo + BDI)</Label>
              <span className="font-semibold">{formatCurrency(valores.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <Label className="text-muted-foreground">
                Tributos ({orcamento.tributos?.aliquotaSimples?.toFixed(1) ?? 0}%
                {orcamento.tributos?.temISS
                  ? ` + ISS ${orcamento.tributos.aliquotaISS?.toFixed(1)}%`
                  : ''}
                )
              </Label>
              <span className="font-semibold text-orange-600">
                + {formatCurrency(valores.tributosTotal)}
              </span>
            </div>

            <Separator className="my-1" />

            <div className="bg-green-100 dark:bg-green-950/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-bold">TOTAL DE VENDA</Label>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(valores.totalVenda)}
                </span>
              </div>
              {valores.custoPorM2 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Preço por m²: {formatCurrency(valores.custoPorM2)}/m²
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DRE — Demonstrativo de Resultado */}
      <Card className="border-purple-200">
        <CardHeader className="bg-purple-50/50 dark:bg-purple-950/20 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            DRE — Demonstrativo de Resultado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <Label className="text-muted-foreground">Receita Líquida</Label>
              <p className="text-2xl font-bold mt-1">{formatCurrency(dre.receitaLiquida)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Venda − Tributos</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Lucro Bruto</Label>
              <p
                className={`text-2xl font-bold mt-1 ${
                  dre.lucroBruto < 0 ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                {formatCurrency(dre.lucroBruto)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Margem: {dre.margemBruta.toFixed(1)}%
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Lucro Líquido</Label>
              <p
                className={`text-2xl font-bold mt-1 ${
                  dre.lucroLiquido < 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {formatCurrency(dre.lucroLiquido)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Margem: {dre.margemLiquida.toFixed(1)}%
              </p>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Barras de Margem */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Margem Bruta</span>
                <span className="font-bold">{dre.margemBruta.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.max(0, Math.min(dre.margemBruta, 100))}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Margem Líquida</span>
                <span className="font-bold">{dre.margemLiquida.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    dre.margemLiquida < 0
                      ? 'bg-red-500'
                      : dre.margemLiquida < 5
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(dre.margemLiquida, 100))}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Viabilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertas.map((alerta, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                    alerta.tipo === 'erro'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{alerta.mensagem}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Positivo */}
      {alertas.length === 0 && statusViabilidade.status === 'bom' && (
        <Card className="border-green-200 bg-green-50/30 dark:bg-green-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
              <div>
                <p className="font-semibold">Orçamento Viável</p>
                <p className="text-sm text-muted-foreground">
                  Margem líquida de {dre.margemLiquida.toFixed(1)}% dentro dos parâmetros ideais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
