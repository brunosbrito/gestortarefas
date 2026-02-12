import { useState, useEffect } from 'react';
import { Settings, FileText, ChevronDown, AlertTriangle, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import OrcamentoService from '@/services/OrcamentoService';
import { useToast } from '@/hooks/use-toast';

interface AbaDadosGeraisProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaDadosGerais({ orcamento, onUpdate }: AbaDadosGeraisProps) {
  const { toast } = useToast();
  const [salvando, setSalvando] = useState(false);

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

  // BDI detalhado com checkboxes e inputs editáveis
  const [bdiDetalhado, setBdiDetalhado] = useState({
    lucro: { nome: 'Lucro', percentual: 20, habilitado: true },
    admCentral: { nome: 'Administração Central', percentual: 3, habilitado: true },
    admLocal: { nome: 'Administração Local', percentual: 0, habilitado: false },
    seguro: { nome: 'Seguro', percentual: 0, habilitado: false },
    despesasGerais: { nome: 'Despesas Gerais', percentual: 2, habilitado: true },
  });

  const handleToggleBDI = (key: keyof typeof bdiDetalhado) => {
    setBdiDetalhado(prev => ({
      ...prev,
      [key]: { ...prev[key], habilitado: !prev[key].habilitado }
    }));
  };

  const handleChangeBDIPercentual = (key: keyof typeof bdiDetalhado, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBdiDetalhado(prev => ({
      ...prev,
      [key]: { ...prev[key], percentual: numValue }
    }));
  };

  const totalBDI = Object.values(bdiDetalhado).reduce(
    (sum, item) => sum + (item.habilitado ? item.percentual : 0),
    0
  );

  // Inicializar estados com dados salvos (se existirem)
  useEffect(() => {
    if (orcamento.configuracoesDetalhadas?.bdi) {
      setBdiDetalhado(orcamento.configuracoesDetalhadas.bdi);
    }
    if (orcamento.configuracoesDetalhadas?.faixaSimples) {
      setFaixaSelecionada(orcamento.configuracoesDetalhadas.faixaSimples);
    }
    if (orcamento.configuracoesDetalhadas?.encargos) {
      setEncargosComponentes(orcamento.configuracoesDetalhadas.encargos);
    }
  }, [orcamento.id]);

  // Encargos Sociais - Estrutura completa conforme planilha
  const [encargosComponentes, setEncargosComponentes] = useState({
    grupoA: {
      fgts: { nome: 'FGTS', percentual: 8.0, habilitado: true },
    },
    grupoB: {
      ferias: { nome: 'Férias + 1/3 Férias', percentual: 11.11, habilitado: true },
      decimoTerceiro: { nome: '13º Salário', percentual: 8.33, habilitado: true },
      auxilioEnfermidades: { nome: 'Auxílio Enfermidades', percentual: 0.0, habilitado: false },
      licencaPaternidade: { nome: 'Licença Paternidade', percentual: 0.0, habilitado: false },
      avisoTrabalhado: { nome: 'Aviso Prévio Trabalhado', percentual: 11.11, habilitado: false },
      acidentes: { nome: 'Acidente de Trabalho', percentual: 2.0, habilitado: true },
      faltasJustificadas: { nome: 'Faltas Justificadas', percentual: 3.0, habilitado: true },
    },
    grupoC: {
      rescisao: { nome: 'Provisão Rescisão sem Justa Causa', percentual: 4.0, habilitado: true },
      avisoIndenizado: { nome: 'Aviso Prévio Indenizado', percentual: 8.33, habilitado: true },
      indenizacao: { nome: 'Indenização Adicional', percentual: 0.0, habilitado: false },
    },
    grupoD: {
      reincidencia: { nome: 'Taxa de Reincidência', percentual: 2.84, habilitado: true },
    },
  });

  const handleToggleEncargo = (grupo: keyof typeof encargosComponentes, key: string) => {
    setEncargosComponentes(prev => ({
      ...prev,
      [grupo]: {
        ...prev[grupo],
        [key]: { ...prev[grupo][key], habilitado: !prev[grupo][key].habilitado }
      }
    }));
  };

  // Calcular totais
  const totalGrupoA = Object.values(encargosComponentes.grupoA).reduce(
    (sum, item) => sum + (item.habilitado ? item.percentual : 0), 0
  );
  const totalGrupoB = Object.values(encargosComponentes.grupoB).reduce(
    (sum, item) => sum + (item.habilitado ? item.percentual : 0), 0
  );
  const totalGrupoC = Object.values(encargosComponentes.grupoC).reduce(
    (sum, item) => sum + (item.habilitado ? item.percentual : 0), 0
  );
  const totalGrupoD = Object.values(encargosComponentes.grupoD).reduce(
    (sum, item) => sum + (item.habilitado ? item.percentual : 0), 0
  );

  const totalEncargosDiretos = totalGrupoA + totalGrupoB + totalGrupoC;
  const totalEncargosIndiretos = totalGrupoD;
  const totalEncargos = totalEncargosDiretos + totalEncargosIndiretos;

  // Função para salvar configurações
  const handleSalvar = async () => {
    try {
      setSalvando(true);

      // Montar dados para salvar
      const configuracoesAtualizadas = {
        ...orcamento,
        configuracoes: {
          bdi: totalBDI / 100,  // Converter para decimal
          tributos: {
            iss: (orcamento.configuracoes?.tributos.iss || 0.03),
            simples: faixaInfo.aliquota / 100,  // Converter para decimal
            total: ((orcamento.configuracoes?.tributos.iss || 0.03) + (faixaInfo.aliquota / 100)),
          },
          encargos: totalEncargos / 100,  // Converter para decimal
        },
        configuracoesDetalhadas: {
          bdi: bdiDetalhado,
          faixaSimples: faixaSelecionada,
          encargos: encargosComponentes,
        },
      };

      await OrcamentoService.update(orcamento.id, configuracoesAtualizadas);

      toast({
        title: '✅ Configurações salvas!',
        description: 'BDI, Tributos e Encargos foram atualizados com sucesso.',
        variant: 'default',
      });

      // Chamar callback para atualizar dados
      onUpdate();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Não foi possível salvar as configurações. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSalvando(false);
    }
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
        </CardContent>
      </Card>

      {/* Configurações Fiscais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Fiscais e Trabalhistas
            </CardTitle>
            <Button
              onClick={handleSalvar}
              disabled={salvando}
              size="sm"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {salvando ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* BDI */}
          <Collapsible open={bdiAberto} onOpenChange={setBdiAberto}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">BDI (Benefícios e Despesas Indiretas)</Label>
                <CollapsibleTrigger asChild>
                  <button
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label={bdiAberto ? "Recolher detalhes do BDI" : "Expandir detalhes do BDI"}
                  >
                    <ChevronDown className={`h-5 w-5 transition-transform ${bdiAberto ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{totalBDI.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Total calculado</p>
              </div>

              <CollapsibleContent className="mt-4 space-y-2">
                {/* Lucro */}
                <div className={`p-3 bg-muted/50 rounded-lg transition-opacity ${!bdiDetalhado.lucro.habilitado ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="bdi-lucro"
                      checked={bdiDetalhado.lucro.habilitado}
                      onCheckedChange={() => handleToggleBDI('lucro')}
                    />
                    <label
                      htmlFor="bdi-lucro"
                      className={`text-sm font-medium cursor-pointer flex-1 ${!bdiDetalhado.lucro.habilitado ? 'line-through' : ''}`}
                    >
                      💰 {bdiDetalhado.lucro.nome}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={bdiDetalhado.lucro.percentual}
                        onChange={(e) => handleChangeBDIPercentual('lucro', e.target.value)}
                        disabled={!bdiDetalhado.lucro.habilitado}
                        className={`w-20 h-8 text-right font-mono font-bold ${!bdiDetalhado.lucro.habilitado ? 'line-through' : ''}`}
                      />
                      <span className="text-sm font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Administração Central */}
                <div className={`p-3 bg-muted/50 rounded-lg transition-opacity ${!bdiDetalhado.admCentral.habilitado ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="bdi-admCentral"
                      checked={bdiDetalhado.admCentral.habilitado}
                      onCheckedChange={() => handleToggleBDI('admCentral')}
                    />
                    <label
                      htmlFor="bdi-admCentral"
                      className={`text-sm font-medium cursor-pointer flex-1 ${!bdiDetalhado.admCentral.habilitado ? 'line-through' : ''}`}
                    >
                      🏢 {bdiDetalhado.admCentral.nome}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={bdiDetalhado.admCentral.percentual}
                        onChange={(e) => handleChangeBDIPercentual('admCentral', e.target.value)}
                        disabled={!bdiDetalhado.admCentral.habilitado}
                        className={`w-20 h-8 text-right font-mono font-bold ${!bdiDetalhado.admCentral.habilitado ? 'line-through' : ''}`}
                      />
                      <span className="text-sm font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Administração Local */}
                <div className={`p-3 bg-muted/50 rounded-lg transition-opacity ${!bdiDetalhado.admLocal.habilitado ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="bdi-admLocal"
                      checked={bdiDetalhado.admLocal.habilitado}
                      onCheckedChange={() => handleToggleBDI('admLocal')}
                    />
                    <label
                      htmlFor="bdi-admLocal"
                      className={`text-sm font-medium cursor-pointer flex-1 ${!bdiDetalhado.admLocal.habilitado ? 'line-through' : ''}`}
                    >
                      🏗️ {bdiDetalhado.admLocal.nome}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={bdiDetalhado.admLocal.percentual}
                        onChange={(e) => handleChangeBDIPercentual('admLocal', e.target.value)}
                        disabled={!bdiDetalhado.admLocal.habilitado}
                        className={`w-20 h-8 text-right font-mono font-bold ${!bdiDetalhado.admLocal.habilitado ? 'line-through' : ''}`}
                      />
                      <span className="text-sm font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Seguro */}
                <div className={`p-3 bg-muted/50 rounded-lg transition-opacity ${!bdiDetalhado.seguro.habilitado ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="bdi-seguro"
                      checked={bdiDetalhado.seguro.habilitado}
                      onCheckedChange={() => handleToggleBDI('seguro')}
                    />
                    <label
                      htmlFor="bdi-seguro"
                      className={`text-sm font-medium cursor-pointer flex-1 ${!bdiDetalhado.seguro.habilitado ? 'line-through' : ''}`}
                    >
                      🛡️ {bdiDetalhado.seguro.nome}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={bdiDetalhado.seguro.percentual}
                        onChange={(e) => handleChangeBDIPercentual('seguro', e.target.value)}
                        disabled={!bdiDetalhado.seguro.habilitado}
                        className={`w-20 h-8 text-right font-mono font-bold ${!bdiDetalhado.seguro.habilitado ? 'line-through' : ''}`}
                      />
                      <span className="text-sm font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Despesas Gerais */}
                <div className={`p-3 bg-muted/50 rounded-lg transition-opacity ${!bdiDetalhado.despesasGerais.habilitado ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="bdi-despesasGerais"
                      checked={bdiDetalhado.despesasGerais.habilitado}
                      onCheckedChange={() => handleToggleBDI('despesasGerais')}
                    />
                    <label
                      htmlFor="bdi-despesasGerais"
                      className={`text-sm font-medium cursor-pointer flex-1 ${!bdiDetalhado.despesasGerais.habilitado ? 'line-through' : ''}`}
                    >
                      📋 {bdiDetalhado.despesasGerais.nome}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={bdiDetalhado.despesasGerais.percentual}
                        onChange={(e) => handleChangeBDIPercentual('despesasGerais', e.target.value)}
                        disabled={!bdiDetalhado.despesasGerais.habilitado}
                        className={`w-20 h-8 text-right font-mono font-bold ${!bdiDetalhado.despesasGerais.habilitado ? 'line-through' : ''}`}
                      />
                      <span className="text-sm font-bold">%</span>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

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
          <Collapsible open={encargosAberto} onOpenChange={setEncargosAberto} className="pt-4 border-t">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Encargos Sociais</Label>
                <CollapsibleTrigger asChild>
                  <button
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label={encargosAberto ? "Recolher detalhes dos Encargos" : "Expandir detalhes dos Encargos"}
                  >
                    <ChevronDown className={`h-5 w-5 transition-transform ${encargosAberto ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
              </div>

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

              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* COLUNA ESQUERDA: GRUPO A + GRUPO B */}
                  <div className="space-y-6">
                    {/* GRUPO A - Encargos Sociais Básicos */}
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        <span className="text-sm font-semibold text-blue-600">GRUPO A - Encargos Sociais Básicos</span>
                        <span className="ml-auto text-sm font-bold text-blue-600">{totalGrupoA.toFixed(2)}%</span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(encargosComponentes.grupoA).map(([key, item]) => (
                          <div key={key} className={`p-2 bg-white dark:bg-slate-900 rounded flex items-center justify-between transition-opacity ${!item.habilitado ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`encargo-a-${key}`}
                                checked={item.habilitado}
                                onCheckedChange={() => handleToggleEncargo('grupoA', key)}
                              />
                              <label htmlFor={`encargo-a-${key}`} className={`text-xs cursor-pointer ${!item.habilitado ? 'line-through' : ''}`}>
                                {item.nome}
                              </label>
                            </div>
                            <span className={`font-mono text-xs font-bold ${!item.habilitado ? 'line-through' : ''}`}>
                              {item.percentual.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GRUPO B - Encargos que refletem incidência de "A" */}
                    <div className="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-green-600"></div>
                        <span className="text-sm font-semibold text-green-600">GRUPO B - Refletem incidência de "A"</span>
                        <span className="ml-auto text-sm font-bold text-green-600">{totalGrupoB.toFixed(2)}%</span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(encargosComponentes.grupoB).map(([key, item]) => (
                          <div key={key} className={`p-2 bg-white dark:bg-slate-900 rounded flex items-center justify-between transition-opacity ${!item.habilitado ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`encargo-b-${key}`}
                                checked={item.habilitado}
                                onCheckedChange={() => handleToggleEncargo('grupoB', key)}
                              />
                              <label htmlFor={`encargo-b-${key}`} className={`text-xs cursor-pointer ${!item.habilitado ? 'line-through' : ''}`}>
                                {item.nome}
                              </label>
                            </div>
                            <span className={`font-mono text-xs font-bold ${!item.habilitado ? 'line-through' : ''}`}>
                              {item.percentual.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* COLUNA DIREITA: GRUPO C + GRUPO D */}
                  <div className="space-y-6">
                    {/* GRUPO C - Encargos que NÃO refletem incidência de "A" */}
                    <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-orange-600"></div>
                        <span className="text-sm font-semibold text-orange-600">GRUPO C - NÃO refletem incidência de "A"</span>
                        <span className="ml-auto text-sm font-bold text-orange-600">{totalGrupoC.toFixed(2)}%</span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(encargosComponentes.grupoC).map(([key, item]) => (
                          <div key={key} className={`p-2 bg-white dark:bg-slate-900 rounded flex items-center justify-between transition-opacity ${!item.habilitado ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`encargo-c-${key}`}
                                checked={item.habilitado}
                                onCheckedChange={() => handleToggleEncargo('grupoC', key)}
                              />
                              <label htmlFor={`encargo-c-${key}`} className={`text-xs cursor-pointer ${!item.habilitado ? 'line-through' : ''}`}>
                                {item.nome}
                              </label>
                            </div>
                            <span className={`font-mono text-xs font-bold ${!item.habilitado ? 'line-through' : ''}`}>
                              {item.percentual.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GRUPO D - Taxa de Reincidência */}
                    <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-red-600"></div>
                        <span className="text-sm font-semibold text-red-600">GRUPO D - Taxa de Reincidência</span>
                        <span className="ml-auto text-sm font-bold text-red-600">{totalGrupoD.toFixed(2)}%</span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(encargosComponentes.grupoD).map(([key, item]) => (
                          <div key={key} className={`p-2 bg-white dark:bg-slate-900 rounded flex items-center justify-between transition-opacity ${!item.habilitado ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`encargo-d-${key}`}
                                checked={item.habilitado}
                                onCheckedChange={() => handleToggleEncargo('grupoD', key)}
                              />
                              <label htmlFor={`encargo-d-${key}`} className={`text-xs cursor-pointer ${!item.habilitado ? 'line-through' : ''}`}>
                                {item.nome}
                              </label>
                            </div>
                            <span className={`font-mono text-xs font-bold ${!item.habilitado ? 'line-through' : ''}`}>
                              {item.percentual.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RESUMO FINAL - Largura total abaixo das colunas */}
                <div className="pt-6 mt-6 border-t">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-950/30 rounded border border-purple-300">
                      <div className="text-xs text-muted-foreground">Diretos (A+B+C)</div>
                      <div className="text-xl font-bold text-purple-600">{totalEncargosDiretos.toFixed(2)}%</div>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-950/30 rounded border border-purple-300">
                      <div className="text-xs text-muted-foreground">Indiretos (D)</div>
                      <div className="text-xl font-bold text-purple-600">{totalEncargosIndiretos.toFixed(2)}%</div>
                    </div>
                    <div className="p-3 bg-purple-600 text-white rounded">
                      <div className="text-xs">TOTAL GERAL</div>
                      <div className="text-2xl font-bold">{totalEncargos.toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
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
