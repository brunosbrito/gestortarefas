import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CargoService } from '@/services/CargoService';
import { ConfiguracaoSalarial as ConfiguracaoSalarialInterface } from '@/interfaces/CargoInterface';
import { formatCurrency } from '@/lib/currency';

const ConfiguracaoSalarial = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ConfiguracaoSalarialInterface | null>(null);
  const [salarioMinimo, setSalarioMinimo] = useState('');
  const [percentualEncargos, setPercentualEncargos] = useState('');

  useEffect(() => {
    carregarConfiguracao();
  }, []);

  const carregarConfiguracao = async () => {
    try {
      setLoading(true);
      const data = await CargoService.getConfiguracao();
      setConfig(data);
      setSalarioMinimo(data.salarioMinimoReferencia.toFixed(2));
      setPercentualEncargos((data.percentualEncargos * 100).toFixed(1));
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    try {
      setSaving(true);

      const salarioMinimoNum = parseFloat(salarioMinimo);
      const percentualEncargosNum = parseFloat(percentualEncargos) / 100;

      if (isNaN(salarioMinimoNum) || salarioMinimoNum <= 0) {
        toast({
          title: 'Erro de validação',
          description: 'Salário mínimo deve ser um valor positivo',
          variant: 'destructive',
        });
        return;
      }

      if (isNaN(percentualEncargosNum) || percentualEncargosNum <= 0) {
        toast({
          title: 'Erro de validação',
          description: 'Percentual de encargos deve ser um valor positivo',
          variant: 'destructive',
        });
        return;
      }

      await CargoService.updateConfiguracao({
        salarioMinimoReferencia: salarioMinimoNum,
        percentualEncargos: percentualEncargosNum,
      });

      toast({
        title: 'Sucesso',
        description: 'Configuração atualizada com sucesso. Todos os cargos foram recalculados.',
        duration: 5000,
      });

      carregarConfiguracao();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const salarioMinimoNum = parseFloat(salarioMinimo) || 0;
  const insalubrideMinimo = salarioMinimoNum * 0.1;
  const insalubrideMedia = salarioMinimoNum * 0.2;
  const insalubrideMaxima = salarioMinimoNum * 0.4;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuração Salarial</h1>
          <p className="text-muted-foreground">
            Configurações globais para cálculos de mão de obra
          </p>
        </div>
      </div>

      {/* Alert de Atenção */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Atenção:</strong> Alterações nestas configurações irão recalcular automaticamente
          todos os cargos cadastrados. Orçamentos já criados não serão afetados.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card de Configuração */}
        <Card>
          <CardHeader>
            <CardTitle>Valores Base</CardTitle>
            <CardDescription>
              Valores de referência para cálculos salariais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Salário Mínimo */}
            <div className="space-y-2">
              <Label htmlFor="salarioMinimo">
                Salário Mínimo de Referência *
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="salarioMinimo"
                    type="number"
                    step="0.01"
                    value={salarioMinimo}
                    onChange={(e) => setSalarioMinimo(e.target.value)}
                    placeholder="1612.00"
                    className="font-mono"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Base para cálculo de insalubridade (atualizar conforme legislação)
              </p>
            </div>

            {/* Percentual de Encargos */}
            <div className="space-y-2">
              <Label htmlFor="percentualEncargos">
                Percentual de Encargos Sociais *
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="percentualEncargos"
                    type="number"
                    step="0.1"
                    value={percentualEncargos}
                    onChange={(e) => setPercentualEncargos(e.target.value)}
                    placeholder="58.7"
                    className="font-mono"
                  />
                </div>
                <div className="flex items-center px-3 border rounded-md bg-muted">
                  <span className="text-sm font-medium">%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Percentual padrão de encargos sobre o salário total (INSS, FGTS, férias, etc.)
              </p>
            </div>

            {/* Última Atualização */}
            {config && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Última atualização:{' '}
                    {new Date(config.ultimaAtualizacao).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            )}

            {/* Botão Salvar */}
            <Button
              onClick={handleSalvar}
              disabled={saving}
              className="w-full"
              size="lg"
            >
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Salvando e recalculando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configuração
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Card de Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Cálculos de Insalubridade</CardTitle>
            <CardDescription>
              Valores calculados automaticamente baseados no salário mínimo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Insalubridade Mínima
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">10% do salário mínimo</p>
                </div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(insalubrideMinimo)}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Insalubridade Média
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">20% do salário mínimo</p>
                </div>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {formatCurrency(insalubrideMedia)}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Insalubridade Máxima
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">40% do salário mínimo</p>
                </div>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(insalubrideMaxima)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Outras informações:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Periculosidade: 30% do salário base</li>
                <li>• Encargos: {percentualEncargos || '58.7'}% do salário total</li>
                <li>• Horas mensalista: 184h/mês</li>
                <li>• Horas horista: 220h/mês</li>
                <li>• Horas por dia: 8,8h (8h48min)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfiguracaoSalarial;
