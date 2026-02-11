import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Paintbrush, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import TintaService from '@/services/TintaService';
import FornecedorServicoService from '@/services/FornecedorServicoService';
import ComposicaoPinturaService from '@/services/ComposicaoPinturaService';
import { TintaInterface, TipoTinta } from '@/interfaces/TintaInterface';
import { FornecedorServicoInterface } from '@/interfaces/FornecedorServicoInterface';
import {
  ComposicaoPinturaInterface,
  TipoGeometria,
  TipoGeometriaLabels,
} from '@/interfaces/ComposicaoPinturaInterface';
import { formatCurrency } from '@/lib/currency';
import { mockTintas, mockFornecedores } from '@/data/mockTintas';

const CalculadoraPintura = () => {
  const { toast } = useToast();

  // Listas
  const [tintas, setTintas] = useState<TintaInterface[]>([]);
  const [fornecedores, setFornecedores] = useState<FornecedorServicoInterface[]>([]);

  // Inputs
  const [pesoKg, setPesoKg] = useState('');
  const [espessuraMm, setEspessuraMm] = useState('');
  const [tipoGeometria, setTipoGeometria] = useState<TipoGeometria>(TipoGeometria.CHAPA_PLANA);

  // Primer
  const [usarPrimer, setUsarPrimer] = useState(true);
  const [primerId, setPrimerId] = useState('');
  const [primerEspessura, setPrimerEspessura] = useState('50');
  const [primerDemaos, setPrimerDemaos] = useState('1');
  const [primerPerda, setPrimerPerda] = useState('30');

  // Acabamento
  const [usarAcabamento, setUsarAcabamento] = useState(true);
  const [acabamentoId, setAcabamentoId] = useState('');
  const [acabamentoEspessura, setAcabamentoEspessura] = useState('50');
  const [acabamentoDemaos, setAcabamentoDemaos] = useState('2');
  const [acabamentoPerda, setAcabamentoPerda] = useState('30');

  // Thinner e Fornecedor
  const [thinnerPreco, setThinnerPreco] = useState('15.00');
  const [fornecedorId, setFornecedorId] = useState('');

  // Resultado
  const [resultado, setResultado] = useState<ComposicaoPinturaInterface | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // USANDO DADOS MOCKADOS (remover quando backend estiver pronto)
      // Carregar tintas mockadas + tintas cadastradas localmente
      const tintasLocais = JSON.parse(localStorage.getItem('tintas_locais') || '[]');
      const fornecedoresLocais = JSON.parse(localStorage.getItem('fornecedores_locais') || '[]');

      setTintas([...mockTintas, ...tintasLocais]);
      setFornecedores([...mockFornecedores, ...fornecedoresLocais]);

      // VERSÃO COM API (descomentar quando backend estiver pronto)
      // const [tintasData, fornecedoresData] = await Promise.all([
      //   TintaService.listar({ ativo: true }),
      //   FornecedorServicoService.listar({ ativo: true }),
      // ]);
      // setTintas(tintasData);
      // setFornecedores(fornecedoresData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    }
  };

  const handleCalcular = async () => {
    try {
      // Validações
      if (!pesoKg || !espessuraMm) {
        toast({
          title: 'Erro',
          description: 'Preencha peso e espessura',
          variant: 'destructive',
        });
        return;
      }

      if (!usarPrimer && !usarAcabamento) {
        toast({
          title: 'Erro',
          description: 'Selecione ao menos uma camada (Primer ou Acabamento)',
          variant: 'destructive',
        });
        return;
      }

      // USANDO DADOS MOCKADOS (remover quando backend estiver pronto)
      const primerTinta = usarPrimer && primerId
        ? tintas.find(t => t.id === Number(primerId))
        : undefined;

      const acabamentoTinta = usarAcabamento && acabamentoId
        ? tintas.find(t => t.id === Number(acabamentoId))
        : undefined;

      const fornecedor = fornecedorId && fornecedorId !== ''
        ? fornecedores.find(f => f.id === Number(fornecedorId))
        : undefined;

      // VERSÃO COM API (descomentar quando backend estiver pronto)
      // const primerTinta = usarPrimer && primerId
      //   ? await TintaService.buscarPorId(Number(primerId))
      //   : undefined;
      // const acabamentoTinta = usarAcabamento && acabamentoId
      //   ? await TintaService.buscarPorId(Number(acabamentoId))
      //   : undefined;
      // const fornecedor = fornecedorId && fornecedorId !== ''
      //   ? await FornecedorServicoService.buscarPorId(Number(fornecedorId))
      //   : undefined;

      // Montar input
      const input = {
        pesoTotalKg: parseFloat(pesoKg),
        espessuraChapaMm: parseFloat(espessuraMm),
        tipoGeometria,
        primerId: usarPrimer && primerId ? Number(primerId) : undefined,
        primerEspessuraMicrons: usarPrimer ? parseFloat(primerEspessura) : undefined,
        primerDemaos: usarPrimer ? parseFloat(primerDemaos) : undefined,
        primerFatorPerda: usarPrimer ? parseFloat(primerPerda) : undefined,
        acabamentoId: usarAcabamento && acabamentoId ? Number(acabamentoId) : undefined,
        acabamentoEspessuraMicrons: usarAcabamento ? parseFloat(acabamentoEspessura) : undefined,
        acabamentoDemaos: usarAcabamento ? parseFloat(acabamentoDemaos) : undefined,
        acabamentoFatorPerda: usarAcabamento ? parseFloat(acabamentoPerda) : undefined,
        thinnerPrecoLitro: parseFloat(thinnerPreco),
        fornecedorServicoId: fornecedorId ? Number(fornecedorId) : undefined,
      };

      // Calcular
      const resultadoCalculo = ComposicaoPinturaService.calcularComposicao(
        input,
        primerTinta,
        acabamentoTinta,
        fornecedor
      );

      setResultado(resultadoCalculo);

      toast({
        title: 'Sucesso',
        description: 'Cálculo realizado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao calcular:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao calcular composição',
        variant: 'destructive',
      });
    }
  };

  const tintasPrimer = tintas.filter((t) => t.tipo === TipoTinta.PRIMER);
  const tintasAcabamento = tintas.filter((t) => t.tipo === TipoTinta.ACABAMENTO);

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Paintbrush className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Calculadora de Jateamento e Pintura</h1>
        </div>

        {/* Alert Informativo */}
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Como funciona o cálculo de área:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Catálogo de Materiais:</strong> Ao cadastrar materiais na página{' '}
                  <Link
                    to="/comercial/cadastros/materiais"
                    className="font-bold underline hover:text-blue-700"
                  >
                    Materiais
                  </Link>
                  , a área (m²/m) é calculada e armazenada automaticamente
                </li>
                <li>
                  <strong>Dentro do Orçamento:</strong> A área total de pintura é calculada
                  automaticamente somando (área × quantidade) de cada material do orçamento
                </li>
                <li>
                  <strong>Esta Calculadora:</strong> Ferramenta standalone para cálculos rápidos e
                  consultas avulsas (não vinculada a orçamentos)
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Dados de Entrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dados da Peça */}
              <div className="space-y-3 p-4 border rounded-lg bg-blue-50/30">
                <h3 className="font-semibold">Dados da Peça/Conjunto</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Peso Total (kg) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pesoKg}
                      onChange={(e) => setPesoKg(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Espessura (mm) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={espessuraMm}
                      onChange={(e) => setEspessuraMm(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Tipo de Geometria</Label>
                  <Select value={tipoGeometria} onValueChange={(v) => setTipoGeometria(v as TipoGeometria)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TipoGeometriaLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {tipoGeometria !== 'chapa_plana' && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      ⚠️ Para perfis/estruturas, o cálculo de área é aproximado
                    </p>
                  )}
                </div>
              </div>

              {/* Primer */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={usarPrimer}
                    onChange={(e) => setUsarPrimer(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <h3 className="font-semibold">Primer (Fundo)</h3>
                </div>
                {usarPrimer && (
                  <>
                    <div>
                      <Label>Selecionar Tinta</Label>
                      <Select value={primerId} onValueChange={setPrimerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma tinta..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tintasPrimer.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.codigo} - {t.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">EFS (μm)</Label>
                        <Input
                          type="number"
                          value={primerEspessura}
                          onChange={(e) => setPrimerEspessura(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Demãos</Label>
                        <Input
                          type="number"
                          value={primerDemaos}
                          onChange={(e) => setPrimerDemaos(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Perda (%)</Label>
                        <Input
                          type="number"
                          value={primerPerda}
                          onChange={(e) => setPrimerPerda(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Acabamento */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={usarAcabamento}
                    onChange={(e) => setUsarAcabamento(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <h3 className="font-semibold">Acabamento</h3>
                </div>
                {usarAcabamento && (
                  <>
                    <div>
                      <Label>Selecionar Tinta</Label>
                      <Select value={acabamentoId} onValueChange={setAcabamentoId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma tinta..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tintasAcabamento.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.codigo} - {t.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">EFS (μm)</Label>
                        <Input
                          type="number"
                          value={acabamentoEspessura}
                          onChange={(e) => setAcabamentoEspessura(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Demãos</Label>
                        <Input
                          type="number"
                          value={acabamentoDemaos}
                          onChange={(e) => setAcabamentoDemaos(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Perda (%)</Label>
                        <Input
                          type="number"
                          value={acabamentoPerda}
                          onChange={(e) => setAcabamentoPerda(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Thinner e Fornecedor */}
              <div className="space-y-3 p-4 border rounded-lg bg-orange-50/30">
                <h3 className="font-semibold">Thinner e Serviços</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Preço Thinner (R$/lt)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={thinnerPreco}
                      onChange={(e) => setThinnerPreco(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Fornecedor de Serviço</Label>
                    <Select value={fornecedorId} onValueChange={setFornecedorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nenhum (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {fornecedores.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button onClick={handleCalcular} className="w-full" size="lg">
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Composição
              </Button>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card>
            <CardHeader>
              <CardTitle>Resultado do Cálculo</CardTitle>
            </CardHeader>
            <CardContent>
              {!resultado ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Preencha os dados e clique em Calcular</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Área Calculada */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Área Calculada</p>
                    <p className="text-2xl font-bold text-blue-600">{resultado.areaM2.toFixed(2)} m²</p>
                  </div>

                  {/* Materiais */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">MATERIAIS</h3>
                    {resultado.primer && (
                      <div className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span>• Primer: {resultado.primer.litrosNecessarios.toFixed(1)} lt</span>
                        <span className="font-medium">{formatCurrency(resultado.primer.custoTotal)}</span>
                      </div>
                    )}
                    {resultado.acabamento && (
                      <div className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span>• Acabamento: {resultado.acabamento.litrosNecessarios.toFixed(1)} lt</span>
                        <span className="font-medium">{formatCurrency(resultado.acabamento.custoTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <span>• Thinner: {resultado.thinner.litros.toFixed(1)} lt (80%)</span>
                      <span className="font-medium">{formatCurrency(resultado.thinner.custoTotal)}</span>
                    </div>
                  </div>

                  {/* Mão de Obra */}
                  {resultado.fornecedorServico && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">MÃO DE OBRA</h3>
                      <div className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span>• Jateamento: {resultado.areaM2.toFixed(2)} m²</span>
                        <span className="font-medium">{formatCurrency(resultado.custoJateamento)}</span>
                      </div>
                      <div className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span>• Pintura: {resultado.areaM2.toFixed(2)} m²</span>
                        <span className="font-medium">{formatCurrency(resultado.custoPintura)}</span>
                      </div>
                    </div>
                  )}

                  {/* Totais */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Subtotal Materiais:</span>
                      <span className="font-semibold">{formatCurrency(resultado.custoTotalMateriais)}</span>
                    </div>
                    {resultado.custoTotalMO > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Subtotal MO:</span>
                        <span className="font-semibold">{formatCurrency(resultado.custoTotalMO)}</span>
                      </div>
                    )}
                    <div className="flex justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                      <span className="font-bold">CUSTO TOTAL:</span>
                      <span className="font-bold text-green-600 text-lg">{formatCurrency(resultado.custoTotal)}</span>
                    </div>
                  </div>

                  {/* Indicadores */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border">
                      <p className="text-xs text-muted-foreground">VALOR/m²</p>
                      <p className="text-xl font-bold text-purple-600">{formatCurrency(resultado.valorPorM2)}</p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border">
                      <p className="text-xs text-muted-foreground">VALOR/kg</p>
                      <p className="text-xl font-bold text-orange-600">{formatCurrency(resultado.valorPorKg)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CalculadoraPintura;
