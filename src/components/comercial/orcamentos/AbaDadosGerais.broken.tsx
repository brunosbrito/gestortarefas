import { Settings, FileText, ChevronDown, AlertTriangle, Info } from 'lucide-react';
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
import { useState } from 'react';

interface AbaDadosGeraisProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaDadosGerais({ orcamento, onUpdate }: AbaDadosGeraisProps) {
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

  // Determinar faixa atual baseada na alíquota do orçamento
  const aliquotaAtual = ((orcamento.configuracoes?.tributos.simples || 0.118) * 100);
  const faixaAtual = faixasSimples.find(f => Math.abs(f.aliquota - aliquotaAtual) < 0.5) || faixasSimples[3]; // Default: Faixa 4
  const [faixaSelecionada, setFaixaSelecionada] = useState(faixaAtual.faixa);

  const faixaInfo = faixasSimples.find(f => f.faixa === faixaSelecionada) || faixaAtual;
  const proximaFaixa = faixasSimples.find(f => f.faixa === faixaSelecionada + 1);

  // Estados mutáveis para BDI (agora com useState)
  const [bdiComponentes, setBdiComponentes] = useState({
    lucro: { nome: 'Lucro', percentual: 23, habilitado: true },
    despesas: { nome: 'Despesas Administrativas', percentual: 2, habilitado: true },
  });

  const calcularTotalBDI = () => {
    let total = 0;
    Object.values(bdiComponentes).forEach((item) => {
      if (item.habilitado) total += item.percentual;
    });
    return total;
  };

  // Handler para toggle de BDI
  const handleToggleBDI = (key: string) => {
    setBdiComponentes(prev => ({
      ...prev,
      [key]: { ...prev[key], habilitado: !prev[key].habilitado }
    }));
  };

  // Estados mutáveis para Encargos (agora com useState)
  const [encargosGrupoA, setEncargosGrupoA] = useState({
    inss: { nome: 'INSS Patronal', percentual: 0, habilitado: false }, // 0% para Simples Nacional
  });

  const [encargosGrupoB, setEncargosGrupoB] = useState({
    fgts: { nome: 'FGTS', percentual: 8.5, habilitado: true },
  });

  const [encargosGrupoC, setEncargosGrupoC] = useState({
    ferias: { nome: 'Férias', percentual: 11.11, habilitado: true },
    umTercoFerias: { nome: '1/3 de Férias', percentual: 3.70, habilitado: true },
    decimoTerceiro: { nome: '13º Salário', percentual: 8.33, habilitado: true },
    fgtsFerias: { nome: 'FGTS s/ Férias', percentual: 0.94, habilitado: true },
    fgts13: { nome: 'FGTS s/ 13º', percentual: 0.71, habilitado: true },
  });

  const [encargosGrupoD, setEncargosGrupoD] = useState({
    ausencias: { nome: 'Ausências Remuneradas', percentual: 3.32, habilitado: true },
    acidenteTrabalho: { nome: 'Acidente de Trabalho', percentual: 3.0, habilitado: true },
    // Sistema S removido para Simples Nacional (incluído na alíquota do Simples)
    // salarioEducacao: { nome: 'Salário Educação', percentual: 2.5, habilitado: false },
    // sesiSenat: { nome: 'SESI/SENAT', percentual: 1.5, habilitado: false },
    // senaiSesc: { nome: 'SENAI/SESC', percentual: 1.0, habilitado: false },
    // sebrae: { nome: 'SEBRAE', percentual: 0.6, habilitado: false },
    // incra: { nome: 'INCRA', percentual: 0.2, habilitado: false },
  });

  // Handlers para toggle de Encargos
  const handleToggleEncargoA = (key: string) => {
    setEncargosGrupoA(prev => ({
      ...prev,
      [key]: { ...prev[key], habilitado: !prev[key].habilitado }
    }));
  };

  const handleToggleEncargoB = (key: string) => {
    setEncargosGrupoB(prev => ({
      ...prev,
      [key]: { ...prev[key], habilitado: !prev[key].habilitado }
    }));
  };

  const handleToggleEncargoC = (key: string) => {
    setEncargosGrupoC(prev => ({
      ...prev,
      [key]: { ...prev[key], habilitado: !prev[key].habilitado }
    }));
  };

  const handleToggleEncargoD = (key: string) => {
    setEncargosGrupoD(prev => ({
      ...prev,
      [key]: { ...prev[key], habilitado: !prev[key].habilitado }
    }));
  };

  const calcularEncargosDiretos = () => {
    let total = 0;

    // Grupo B (FGTS) - Direto
    if (encargosGrupoB.fgts.habilitado) total += encargosGrupoB.fgts.percentual;

    // Grupo C (todos são diretos)
    Object.values(encargosGrupoC).forEach((item) => {
      if (item.habilitado) total += item.percentual;
    });

    return total;
  };

  const calcularEncargosIndiretos = () => {
    let total = 0;

    // Grupo A (INSS) - seria indireto, mas é 0% no Simples
    if (encargosGrupoA.inss.habilitado) total += encargosGrupoA.inss.percentual;

    // Grupo D (todos são indiretos)
    Object.values(encargosGrupoD).forEach((item) => {
      if (item.habilitado) total += item.percentual;
    });

    return total;
  };

  const calcularTotalEncargos = () => {
    return calcularEncargosDiretos() + calcularEncargosIndiretos();
  };

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
          <div>
            <Label>Nome do Orçamento</Label>
            <Input value={orcamento.nome} />
          </div>
          <div>
            <Label>Cliente</Label>
            <Input value={orcamento.clienteNome || ''} placeholder="Nome do cliente" />
          </div>
          <div>
            <Label>Código do Projeto</Label>
            <Input value={orcamento.codigoProjeto || ''} placeholder="Ex: M-15706" />
          </div>
          <div>
            <Label>Área Total (m²)</Label>
            <Input
              type="number"
              value={orcamento.areaTotalM2 || ''}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <Label>Metros Lineares (m)</Label>
            <Input
              type="number"
              value={orcamento.metrosLineares || ''}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <Label>Peso Total do Projeto (kg)</Label>
            <Input
              type="number"
              value={orcamento.pesoTotalProjeto || ''}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de BDI, Tributos e Encargos */}
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base font-semibold">BDI (Benefícios e Despesas Indiretas)</Label>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {calcularTotalBDI().toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total calculado conforme itens habilitados
                </p>
              </div>
              <Collapsible open={bdiAberto} onOpenChange={setBdiAberto}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-950 dark:hover:bg-green-900 transition-colors">
                    <span className="text-sm font-medium">
                      {bdiAberto ? 'Ocultar' : 'Ver'} Memória de Cálculo
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${bdiAberto ? 'rotate-180' : ''}`}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-lg">
                    {/* Lucro */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-green-600 uppercase tracking-wide">
                        Lucro
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="lucro"
                              checked={bdiComponentes.lucro.habilitado}
                              onCheckedChange={() => handleToggleBDI('lucro')}
                            />
                            <Label htmlFor="lucro" className="text-sm cursor-pointer">
                              {bdiComponentes.lucro.nome}
                            </Label>
                          </div>
                          <span className="text-sm font-mono">
                            {bdiComponentes.lucro.percentual.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">
                          Margem de lucro sobre o custo direto
                        </p>
                      </div>
                    </div>

                    {/* Despesas Administrativas */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-green-600 uppercase tracking-wide">
                        Despesas Administrativas
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="despesas"
                              checked={bdiComponentes.despesas.habilitado}
                              onCheckedChange={() => handleToggleBDI('despesas')}
                            />
                            <Label htmlFor="despesas" className="text-sm cursor-pointer">
                              {bdiComponentes.despesas.nome}
                            </Label>
                          </div>
                          <span className="text-sm font-mono">
                            {bdiComponentes.despesas.percentual.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">
                          Custos administrativos e operacionais indiretos
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total Geral */}
                  <div className="mt-4 p-4 bg-green-100 dark:bg-green-950/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">TOTAL BDI:</span>
                      <span className="text-2xl font-bold text-green-600 font-mono">
                        {calcularTotalBDI().toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Tributos */}
          <div className="pt-4 border-t">
            <Label className="text-base font-semibold mb-3 block">Tributos</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label className="text-sm">ISS</Label>
                <Input
                  type="number"
                  value={(orcamento.configuracoes?.tributos.iss || 0.03) * 100}
                  step="0.1"
                  suffix="%"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">Padrão: 3%</p>
              </div>
              <div>
                <Label className="text-sm">Faixa Simples Nacional</Label>
                <Select
                  value={faixaSelecionada.toString()}
                  onValueChange={(value) => setFaixaSelecionada(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a faixa" />
                  </SelectTrigger>
                  <SelectContent>
                    {faixasSimples.map((faixa) => (
                      <SelectItem key={faixa.faixa} value={faixa.faixa.toString()}>
                        Faixa {faixa.faixa}: {faixa.aliquota}% - {faixa.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Anexo II - Indústria
                </p>
              </div>
              <div>
                <Label className="text-sm">Alíquota Simples Nacional</Label>
                <p className="text-2xl font-bold text-blue-600 font-mono">
                  {faixaInfo.aliquota.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Conforme faixa selecionada
                </p>
              </div>
              <div>
                <Label className="text-sm">Total de Tributos</Label>
                <p className="text-2xl font-bold text-orange-600">
                  {(((orcamento.configuracoes?.tributos.iss || 0.03) + (faixaInfo.aliquota / 100)) * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ISS + Simples Nacional
                </p>
              </div>
            </div>

            {/* Alerta de Atenção - Próxima Faixa */}
            {proximaFaixa && (
              <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/30">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm">
                  <strong>⚠️ Atenção Orçamentista:</strong> Se este orçamento for convertido em venda,
                  o faturamento pode mudar automaticamente para a <strong>próxima faixa</strong>.
                  <br />
                  <strong>Próxima Faixa:</strong> Faixa {proximaFaixa.faixa} ({proximaFaixa.descricao}) - <strong className="text-orange-600">{proximaFaixa.aliquota}%</strong>
                  <br />
                  <span className="text-orange-700 dark:text-orange-400 font-medium">
                    Considere usar a alíquota da próxima faixa ({proximaFaixa.aliquota}%) para evitar surpresas fiscais!
                  </span>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Encargos Sociais */}
          <div className="pt-4 border-t">
            <Collapsible open={encargosAberto} onOpenChange={setEncargosAberto}>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">Encargos Sociais</Label>
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 transition-colors">
                      <span className="text-sm font-medium">
                        {encargosAberto ? 'Ocultar' : 'Ver'} Memória de Cálculo
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${encargosAberto ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </CollapsibleTrigger>
                </div>

                {/* Grid com valores separados */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Label className="text-xs text-muted-foreground">Encargos Diretos</Label>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {calcularEncargosDiretos().toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      FGTS, Férias, 13º e reflexos
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Label className="text-xs text-muted-foreground">Encargos Indiretos</Label>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {calcularEncargosIndiretos().toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ausências e Acidentes
                    </p>
                  </div>
                  <div className="p-4 bg-purple-100 dark:bg-purple-950/30 rounded-lg border-2 border-purple-400 dark:border-purple-600">
                    <Label className="text-xs text-muted-foreground">Total</Label>
                    <p className="text-3xl font-bold text-purple-600 mt-1">
                      {calcularTotalEncargos().toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Diretos + Indiretos
                    </p>
                  </div>
                </div>
              </div>

              <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-lg">
                    {/* Grupo A - INSS */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-purple-600 uppercase tracking-wide">
                        Grupo A - INSS Patronal
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="inss"
                              checked={encargosGrupoA.inss.habilitado}
                              onCheckedChange={() => handleToggleEncargoA('inss')}
                              disabled
                            />
                            <Label htmlFor="inss" className="text-sm cursor-not-allowed opacity-60">
                              {encargosGrupoA.inss.nome}
                            </Label>
                          </div>
                          <span className="text-sm font-mono text-muted-foreground">
                            {encargosGrupoA.inss.percentual.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">
                          0% para empresas optantes do Simples Nacional
                        </p>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Subtotal Grupo A:</span>
                          <span className="font-mono">{encargosGrupoA.inss.percentual.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Grupo B - FGTS */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-purple-600 uppercase tracking-wide">
                        Grupo B - FGTS
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="fgts"
                              checked={encargosGrupoB.fgts.habilitado}
                              onCheckedChange={() => handleToggleEncargoB('fgts')}
                            />
                            <Label htmlFor="fgts" className="text-sm cursor-pointer">
                              {encargosGrupoB.fgts.nome}
                            </Label>
                          </div>
                          <span className="text-sm font-mono">
                            {encargosGrupoB.fgts.percentual.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Subtotal Grupo B:</span>
                          <span className="font-mono">{encargosGrupoB.fgts.percentual.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Grupo C */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-purple-600 uppercase tracking-wide">
                        Grupo C - Férias e 13º
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(encargosGrupoC).map(([key, item]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={key}
                                checked={item.habilitado}
                                onCheckedChange={() => handleToggleEncargoC(key)}
                              />
                              <Label htmlFor={key} className="text-sm cursor-pointer">
                                {item.nome}
                              </Label>
                            </div>
                            <span className="text-sm font-mono">
                              {item.percentual.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Subtotal Grupo C:</span>
                          <span className="font-mono">
                            {Object.values(encargosGrupoC)
                              .reduce((sum, item) => (item.habilitado ? sum + item.percentual : sum), 0)
                              .toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Grupo D */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-purple-600 uppercase tracking-wide">
                        Grupo D - Outros
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(encargosGrupoD).map(([key, item]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={key}
                                checked={item.habilitado}
                                onCheckedChange={() => handleToggleEncargoD(key)}
                              />
                              <Label htmlFor={key} className="text-sm cursor-pointer">
                                {item.nome}
                              </Label>
                            </div>
                            <span className="text-sm font-mono">
                              {item.percentual.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Subtotal Grupo D:</span>
                          <span className="font-mono">
                            {Object.values(encargosGrupoD)
                              .reduce((sum, item) => (item.habilitado ? sum + item.percentual : sum), 0)
                              .toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          ℹ️ Sistema S (SESI, SENAI, SEBRAE, SESC, SENAT, Salário Educação, INCRA) não incluído - já está contemplado na alíquota do Simples Nacional
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total Geral */}
                  <div className="mt-4 p-4 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">TOTAL DE ENCARGOS SOCIAIS:</span>
                      <span className="text-2xl font-bold text-purple-600 font-mono">
                        {calcularTotalEncargos().toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
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
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(orcamento.bdiTotal)}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Tributos</Label>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(orcamento.tributosTotal)}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total de Venda</Label>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(orcamento.totalVenda)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
