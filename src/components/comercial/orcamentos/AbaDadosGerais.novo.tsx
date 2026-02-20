import { useState } from 'react';
import { Settings, FileText, ChevronDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';

interface AbaDadosGeraisProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaDadosGerais({ orcamento, onUpdate }: AbaDadosGeraisProps) {
  // Estados para acordeões
  const [encargosAberto, setEncargosAberto] = useState(false);
  const [bdiAberto, setBdiAberto] = useState(false);

  // Faixas do Simples Nacional - Anexo II (Indústria)
  const faixasSimples = [
    { faixa: 1, faturamentoAte: 180000, aliquota: 4.5, descricao: 'Até R$ 180.000,00' },
    { faixa: 2, faturamentoAte: 360000, aliquota: 7.8, descricao: 'R$ 180.000,01 a R$ 360.000,00' },
    { faixa: 3, faturamentoAte: 720000, aliquota: 10.0, descricao: 'R$ 360.000,01 a R$ 720.000,00' },
    { faixa: 4, faturamentoAte: 1800000, aliquota: 11.2, descricao: 'R$ 720.000,01 a R$ 1.800.000,00' },
    { faixa: 5, faturamentoAte: 3600000, aliquota: 14.7, descricao: 'R$ 1.800.000,01 a R$ 3.600.000,00' },
    { faixa: 6, faturamentoAte: 4800000, aliquota: 30.0, descricao: 'R$ 3.600.000,01 a R$ 4.800.000,00' },
  ];

  // Determinar faixa atual
  const aliquotaAtual = ((orcamento.configuracoes?.tributos.simples || 0.118) * 100);
  const faixaAtual = faixasSimples.find(f => Math.abs(f.aliquota - aliquotaAtual) < 0.5) || faixasSimples[3];
  const [faixaSelecionada, setFaixaSelecionada] = useState(faixaAtual.faixa);

  const faixaInfo = faixasSimples.find(f => f.faixa === faixaSelecionada) || faixaAtual;
  const proximaFaixa = faixasSimples.find(f => f.faixa === faixaSelecionada + 1);

  // BDI (valores fixos por enquanto, depois tornaremos mutáveis)
  const bdiLucro = 23;
  const bdiDespesas = 2;
  const totalBDI = bdiLucro + bdiDespesas;

  // Encargos (valores fixos por enquanto)
  const encargosFGTS = 8.5;
  const encargosFerias = 11.11;
  const encargos1_3Ferias = 3.70;
  const encargos13 = 8.33;
  const encargosFGTSFerias = 0.94;
  const encargosFGTS13 = 0.71;
  const encargosAusencias = 3.32;
  const encargosAcidentes = 3.0;

  const totalEncargosDiretos = encargosFGTS + encargosFerias + encargos1_3Ferias + encargos13 + encargosFGTSFerias + encargosFGTS13;
  const totalEncargosIndiretos = encargosAusencias + encargosAcidentes;
  const totalEncargos = totalEncargosDiretos + totalEncargosIndiretos;

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Número do Orçamento</Label>
            <Input value={orcamento.numero} disabled className="font-mono" />
          </div>
          <div>
            <Label>Tipo</Label>
            <div className="mt-2">
              <Badge variant={orcamento.tipo === 'produto' ? 'default' : 'secondary'}>
                {orcamento.tipo === 'produto' ? 'Produto' : 'Serviço'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Fiscais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Fiscais e Trabalhistas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* BDI */}
          <div>
            <Label className="text-base font-semibold mb-3 block">BDI (Benefícios e Despesas Indiretas)</Label>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{totalBDI.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Total calculado</p>
            </div>
          </div>

          {/* Tributos */}
          <div className="pt-4 border-t">
            <Label className="text-base font-semibold mb-3 block">Tributos</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm">ISS</Label>
                <p className="text-2xl font-bold text-blue-600 font-mono mt-1">
                  {((orcamento.configuracoes?.tributos.iss || 0.03) * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <Label className="text-sm">Faixa Simples Nacional</Label>
                <Select value={faixaSelecionada.toString()} onValueChange={(v) => setFaixaSelecionada(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {faixasSimples.map((faixa) => (
                      <SelectItem key={faixa.faixa} value={faixa.faixa.toString()}>
                        Faixa {faixa.faixa}: {faixa.aliquota}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Alíquota Simples Nacional</Label>
                <p className="text-2xl font-bold text-blue-600 font-mono mt-1">
                  {faixaInfo.aliquota.toFixed(2)}%
                </p>
              </div>
              <div>
                <Label className="text-sm">Total de Tributos</Label>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {(((orcamento.configuracoes?.tributos.iss || 0.03) + (faixaInfo.aliquota / 100)) * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Alerta próxima faixa */}
            {proximaFaixa && (
              <Alert className="mt-4 border-orange-500 bg-orange-50 dark:bg-orange-950/30">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm">
                  <strong>⚠️ Atenção Orçamentista:</strong> Se este orçamento for convertido em venda,
                  considere usar a alíquota da próxima faixa ({proximaFaixa.aliquota}%) para evitar surpresas fiscais!
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Encargos Sociais */}
          <div className="pt-4 border-t">
            <Label className="text-base font-semibold mb-3 block">Encargos Sociais</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200">
                <Label className="text-xs text-muted-foreground">Encargos Diretos</Label>
                <p className="text-2xl font-bold text-purple-600 mt-1">{totalEncargosDiretos.toFixed(2)}%</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200">
                <Label className="text-xs text-muted-foreground">Encargos Indiretos</Label>
                <p className="text-2xl font-bold text-purple-600 mt-1">{totalEncargosIndiretos.toFixed(2)}%</p>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-950/30 rounded-lg border-2 border-purple-400">
                <Label className="text-xs text-muted-foreground">Total</Label>
                <p className="text-3xl font-bold text-purple-600 mt-1">{totalEncargos.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <Card className="border-blue-500">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
          <CardTitle>Resumo Geral</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <Label className="text-muted-foreground">Custo Direto Total</Label>
              <p className="text-2xl font-bold">{formatCurrency(orcamento.custoDirectoTotal)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">BDI Total</Label>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(orcamento.bdiTotal)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Tributos</Label>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(orcamento.tributosTotal)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total de Venda</Label>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(orcamento.totalVenda)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
