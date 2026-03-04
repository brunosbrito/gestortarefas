import { useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Orcamento, ComposicaoCustos } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';
import { useOrcamentoCalculos } from '@/hooks/useOrcamentoCalculos';

interface AbaQQPProps {
  orcamento: Orcamento;
  onUpdate: () => void;
  onNavigateToAba?: (aba: string) => void;
}

const NOME_COMPOSICAO: Record<string, string> = {
  materiais: 'Materiais',
  jato_pintura: 'Jateamento e Pintura',
  tintas: 'Tintas e Solventes',
  ferramentas: 'Ferramentas Manuais',
  ferramentas_eletricas: 'Ferramentas Elétricas / Equipamentos',
  consumiveis: 'Consumíveis',
  mo_fabricacao: 'MO Fabricação',
  mo_montagem: 'MO Montagem',
  mobilizacao: 'Mobilização',
  desmobilizacao: 'Desmobilização',
};

const TIPOS_SUPRIMENTOS = ['materiais', 'jato_pintura', 'tintas', 'ferramentas', 'ferramentas_eletricas', 'consumiveis'];
const TIPOS_MO = ['mo_fabricacao', 'mo_montagem', 'mobilizacao', 'desmobilizacao'];

// Mapeamento tipo de composição → id da aba correspondente
const TIPO_PARA_ABA: Record<string, string> = {
  materiais: 'materiais',
  jato_pintura: 'pintura',
  tintas: 'pintura',
  ferramentas: 'ferramentas',
  ferramentas_eletricas: 'ferramentas',
  consumiveis: 'consumiveis',
  mo_fabricacao: 'mao-obra',
  mo_montagem: 'mao-obra',
  mobilizacao: 'mob-desmob',
  desmobilizacao: 'mob-desmob',
};

export default function AbaQQP({ orcamento, onNavigateToAba }: AbaQQPProps) {
  const { valores, dre, alertas, statusViabilidade } = useOrcamentoCalculos(orcamento);

  const composicoesSuprimentos = useMemo(() => {
    const temTintasSeparadas = orcamento.composicoes.some((c) => c.tipo === 'tintas');
    const jatoPintura = orcamento.composicoes.find((c) => c.tipo === 'jato_pintura');

    // Base: todas as composições de suprimento, exceto jato_pintura (tratado separadamente)
    const base: ComposicaoCustos[] = orcamento.composicoes.filter(
      (c) => TIPOS_SUPRIMENTOS.includes(c.tipo) && c.tipo !== 'jato_pintura'
    );

    if (jatoPintura) {
      if (!temTintasSeparadas) {
        // Retrocompat: tintas ainda estão dentro de jato_pintura como tipoItem='material'
        // Separa visualmente serviços de tintas para exibição no QQP
        const servicoItens = jatoPintura.itens.filter((i) => i.tipoItem !== 'material');
        const tintaItens   = jatoPintura.itens.filter((i) => i.tipoItem === 'material');
        const bdiPct = jatoPintura.bdi?.percentual ?? 12;

        // Entrada de jateamento (só serviços)
        if (servicoItens.length > 0) {
          const cd = servicoItens.reduce((s, i) => s + i.subtotal, 0);
          const bdiValor = Math.round(cd * bdiPct / 100 * 100) / 100;
          base.push({ ...jatoPintura, itens: servicoItens, custoDirecto: cd,
            bdi: { percentual: bdiPct, valor: bdiValor },
            subtotal: Math.round(cd * (1 + bdiPct / 100) * 100) / 100 });
        } else {
          base.push(jatoPintura);
        }

        // Entrada virtual de Tintas e Solventes (materiais dentro de jato_pintura)
        if (tintaItens.length > 0) {
          const cd = tintaItens.reduce((s, i) => s + i.subtotal, 0);
          const bdiT = 12;
          const bdiValor = Math.round(cd * bdiT / 100 * 100) / 100;
          base.push({
            id: `virtual-tintas-${orcamento.id}`,
            orcamentoId: orcamento.id,
            nome: 'Tintas e Solventes',
            tipo: 'tintas' as ComposicaoCustos['tipo'],
            itens: tintaItens,
            bdi: { percentual: bdiT, valor: bdiValor },
            custoDirecto: cd,
            subtotal: Math.round(cd * (1 + bdiT / 100) * 100) / 100,
            percentualDoTotal: 0,
            ordem: 99,
          });
        }
      } else {
        // Caso normal (tintas já migradas para composição própria)
        base.push(jatoPintura);
      }
    }

    return base.sort((a, b) =>
      (NOME_COMPOSICAO[a.tipo] || a.nome).localeCompare(
        NOME_COMPOSICAO[b.tipo] || b.nome,
        'pt-BR'
      )
    );
  }, [orcamento.composicoes, orcamento.id]);

  const composicoesMO = useMemo(
    () =>
      orcamento.composicoes
        .filter((c) => TIPOS_MO.includes(c.tipo))
        .sort((a, b) =>
          (NOME_COMPOSICAO[a.tipo] || a.nome).localeCompare(
            NOME_COMPOSICAO[b.tipo] || b.nome,
            'pt-BR'
          )
        ),
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
            <p className="text-xs text-muted-foreground">Médio: {Number(valores.bdiMedio || 0).toFixed(1)}%</p>
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
              {Number(dre.margemLiquida || 0).toFixed(1)}%
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
              {composicoesSuprimentos.map((comp) => {
                const abaDestino = TIPO_PARA_ABA[comp.tipo];
                const clicavel = !!onNavigateToAba && !!abaDestino;
                return (
                  <div
                    key={comp.id}
                    onClick={clicavel ? () => onNavigateToAba!(abaDestino) : undefined}
                    className={`flex justify-between items-center py-2 border-b last:border-0 rounded-md px-2 -mx-2 transition-colors ${clicavel ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 group' : ''}`}
                    title={clicavel ? `Ir para aba ${abaDestino}` : undefined}
                  >
                    <div>
                      <p className="font-medium text-sm flex items-center gap-1.5">
                        {NOME_COMPOSICAO[comp.tipo] || comp.nome}
                        {clicavel && <ArrowRight className="h-3.5 w-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Custo: {formatCurrency(comp.custoDirecto)} · BDI (
                        {comp.bdi?.percentual ?? 0}%): {formatCurrency(comp.bdi?.valor ?? 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(comp.subtotal)}</p>
                      {Number(valores.subtotal || 0) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {((Number(comp.subtotal || 0) / Number(valores.subtotal)) * 100).toFixed(1)}% do total
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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
              {composicoesMO.map((comp) => {
                const abaDestino = TIPO_PARA_ABA[comp.tipo];
                const clicavel = !!onNavigateToAba && !!abaDestino;
                return (
                  <div
                    key={comp.id}
                    onClick={clicavel ? () => onNavigateToAba!(abaDestino) : undefined}
                    className={`flex justify-between items-center py-2 border-b last:border-0 rounded-md px-2 -mx-2 transition-colors ${clicavel ? 'cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/30 group' : ''}`}
                    title={clicavel ? `Ir para aba ${abaDestino}` : undefined}
                  >
                    <div>
                      <p className="font-medium text-sm flex items-center gap-1.5">
                        {NOME_COMPOSICAO[comp.tipo] || comp.nome}
                        {clicavel && <ArrowRight className="h-3.5 w-3.5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Custo: {formatCurrency(comp.custoDirecto)} · BDI (
                        {comp.bdi?.percentual ?? 0}%): {formatCurrency(comp.bdi?.valor ?? 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(comp.subtotal)}</p>
                      {Number(valores.subtotal || 0) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {((Number(comp.subtotal || 0) / Number(valores.subtotal)) * 100).toFixed(1)}% do total
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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
                Tributos ({Number(orcamento.tributos?.aliquotaSimples || 0).toFixed(1)}%
                {orcamento.tributos?.temISS
                  ? ` + ISS ${Number(orcamento.tributos?.aliquotaISS || 0).toFixed(1)}%`
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
                Margem: {Number(dre.margemBruta || 0).toFixed(1)}%
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Lucro Líquido</Label>
              <p
                className={`text-2xl font-bold mt-1 ${
                  Number(dre.lucroLiquido || 0) < 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {formatCurrency(dre.lucroLiquido)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Margem: {Number(dre.margemLiquida || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Barras de Margem */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Margem Bruta</span>
                <span className="font-bold">{Number(dre.margemBruta || 0).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.max(0, Math.min(Number(dre.margemBruta || 0), 100))}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Margem Líquida</span>
                <span className="font-bold">{Number(dre.margemLiquida || 0).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    Number(dre.margemLiquida || 0) < 0
                      ? 'bg-red-500'
                      : Number(dre.margemLiquida || 0) < 5
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(Number(dre.margemLiquida || 0), 100))}%` }}
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
                  Margem líquida de {Number(dre.margemLiquida || 0).toFixed(1)}% dentro dos parâmetros ideais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
