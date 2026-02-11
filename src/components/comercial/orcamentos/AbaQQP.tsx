import { Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';

interface AbaQQPProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaQQP({ orcamento, onUpdate }: AbaQQPProps) {
  const qqpSuprimentos = orcamento.qqpSuprimentos || {
    materiais: 0,
    pintura: 0,
    ferramentas: 0,
    consumiveis: 0,
    total: 0,
  };

  const qqpCliente = orcamento.qqpCliente || {
    suprimentos: 0,
    maoObra: 0,
    bdi: 0,
    subtotal: 0,
    tributos: 0,
    total: 0,
  };

  const dre = orcamento.dre || {
    receitaLiquida: 0,
    lucroBruto: 0,
    margemBruta: 0,
    lucroLiquido: 0,
    margemLiquida: 0,
  };

  return (
    <div className="space-y-6">
      {/* QQP Suprimentos (Orçamento Previsto) */}
      <Card className="border-blue-500">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            QQP Suprimentos - Orçamento Previsto
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-muted-foreground">Materiais</Label>
                <p className="text-2xl font-bold">{formatCurrency(qqpSuprimentos.materiais)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Pintura</Label>
                <p className="text-2xl font-bold">{formatCurrency(qqpSuprimentos.pintura)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ferramentas</Label>
                <p className="text-2xl font-bold">{formatCurrency(qqpSuprimentos.ferramentas)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Consumíveis</Label>
                <p className="text-2xl font-bold">{formatCurrency(qqpSuprimentos.consumiveis)}</p>
              </div>
            </div>

            <Separator />

            <div className="bg-blue-100 dark:bg-blue-950/50 p-4 rounded-lg">
              <Label className="text-muted-foreground">Total Suprimentos</Label>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(qqpSuprimentos.total)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QQP Cliente (Precificação Final) */}
      <Card className="border-green-500">
        <CardHeader className="bg-green-50 dark:bg-green-950/20">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            QQP Cliente - Precificação Final
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Composição do Preço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">Suprimentos</Label>
                <p className="text-2xl font-bold">{formatCurrency(qqpCliente.suprimentos)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Mão de Obra</Label>
                <p className="text-2xl font-bold">{formatCurrency(qqpCliente.maoObra)}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground">Subtotal (Suprimentos + MO)</Label>
                <p className="text-xl font-semibold">{formatCurrency(qqpCliente.subtotal)}</p>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground">
                  BDI ({((orcamento.configuracoes?.bdi || 0.25) * 100).toFixed(0)}%)
                </Label>
                <p className="text-xl font-semibold text-blue-600">
                  + {formatCurrency(qqpCliente.bdi)}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground">
                  Tributos ({((orcamento.configuracoes?.tributos.total || 0.148) * 100).toFixed(1)}%)
                </Label>
                <p className="text-xl font-semibold text-orange-600">
                  + {formatCurrency(qqpCliente.tributos)}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Total de Venda */}
            <div className="bg-green-100 dark:bg-green-950/50 p-6 rounded-lg">
              <Label className="text-muted-foreground text-lg">TOTAL DE VENDA</Label>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {formatCurrency(qqpCliente.total)}
              </p>
              {qqpCliente.area && qqpCliente.precoM2 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Área Total</p>
                    <p className="text-lg font-semibold">{qqpCliente.area.toFixed(2)} m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preço por m²</p>
                    <p className="text-lg font-semibold">{formatCurrency(qqpCliente.precoM2)}/m²</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DRE (Demonstrativo de Resultado) */}
      <Card className="border-purple-500">
        <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            DRE - Demonstrativo de Resultado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-muted-foreground">Receita Líquida</Label>
                <p className="text-2xl font-bold">{formatCurrency(dre.receitaLiquida)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Lucro Bruto</Label>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(dre.lucroBruto)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Margem: {dre.margemBruta.toFixed(2)}%
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Lucro Líquido</Label>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dre.lucroLiquido)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Margem: {dre.margemLiquida.toFixed(2)}%
                </p>
              </div>
            </div>

            <Separator />

            {/* Análise de Margens */}
            <div className="bg-purple-100 dark:bg-purple-950/50 p-4 rounded-lg">
              <Label className="font-semibold mb-3 block">Análise de Margens</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Margem Bruta</span>
                    <span className="font-bold">{dre.margemBruta.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(dre.margemBruta, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Margem Líquida</span>
                    <span className="font-bold">{dre.margemLiquida.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(dre.margemLiquida, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
