import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight, Save, FileText, Wrench, Package } from 'lucide-react';
import OrcamentoService from '@/services/OrcamentoService';
import { CreateOrcamento } from '@/interfaces/OrcamentoInterface';
import { useToast } from '@/hooks/use-toast';

const NovoOrcamento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'servico' as 'servico' | 'produto', // Padrão: serviço
    clienteNome: '',
    codigoProjeto: '',
    areaTotalM2: '',
    metrosLineares: '',
    pesoTotalProjeto: '',
    temISS: false,
    aliquotaISS: '3',
    aliquotaSimples: '11.8',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do orçamento é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const data: CreateOrcamento = {
        nome: formData.nome,
        tipo: formData.tipo,
        clienteNome: formData.clienteNome || undefined,
        codigoProjeto: formData.codigoProjeto || undefined,
        areaTotalM2: formData.areaTotalM2 ? parseFloat(formData.areaTotalM2) : undefined,
        metrosLineares: formData.metrosLineares ? parseFloat(formData.metrosLineares) : undefined,
        pesoTotalProjeto: formData.pesoTotalProjeto ? parseFloat(formData.pesoTotalProjeto) : undefined,
        tributos: {
          temISS: formData.temISS,
          aliquotaISS: parseFloat(formData.aliquotaISS),
          aliquotaSimples: parseFloat(formData.aliquotaSimples),
        },
      };

      const orcamento = await OrcamentoService.create(data);

      toast({
        title: 'Sucesso',
        description: 'Orçamento criado com sucesso',
      });

      // Redirecionar para a página de edição do orçamento
      navigate(`/comercial/orcamentos/${orcamento.id}`);
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o orçamento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/comercial/orcamentos')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Novo Orçamento</h1>
              <p className="text-muted-foreground mt-1">
                Crie um novo orçamento com composição de custos
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Informações Básicas */}
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent">
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Dados principais do orçamento
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Nome do Orçamento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Estrutura Metálica Galpão Industrial"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Tipo de Orçamento <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.tipo}
                    onValueChange={(value) => handleChange('tipo', value as 'servico' | 'produto')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <RadioGroupItem value="servico" id="servico" />
                      <Label
                        htmlFor="servico"
                        className="flex items-center gap-2 cursor-pointer font-normal"
                      >
                        <Wrench className="h-4 w-4 text-blue-600" />
                        <span>Serviço</span>
                        <span className="text-xs text-muted-foreground">(S-001|2026)</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 flex-1">
                      <RadioGroupItem value="produto" id="produto" />
                      <Label
                        htmlFor="produto"
                        className="flex items-center gap-2 cursor-pointer font-normal"
                      >
                        <Package className="h-4 w-4 text-green-600" />
                        <span>Produto</span>
                        <span className="text-xs text-muted-foreground">(P-001|2026)</span>
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    O tipo define a numeração sequencial do orçamento
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clienteNome">Cliente</Label>
                    <Input
                      id="clienteNome"
                      placeholder="Ex: Mineração Esperança Ltda"
                      value={formData.clienteNome}
                      onChange={(e) => handleChange('clienteNome', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigoProjeto">Código do Projeto</Label>
                    <Input
                      id="codigoProjeto"
                      placeholder="Ex: M-15706"
                      value={formData.codigoProjeto}
                      onChange={(e) => handleChange('codigoProjeto', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pesoTotalProjeto">Peso Total (KG)</Label>
                    <Input
                      id="pesoTotalProjeto"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.pesoTotalProjeto}
                      onChange={(e) => handleChange('pesoTotalProjeto', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Para cálculo por KG
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="areaTotalM2">Área Total (m²)</Label>
                    <Input
                      id="areaTotalM2"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.areaTotalM2}
                      onChange={(e) => handleChange('areaTotalM2', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metrosLineares">Metros Lineares</Label>
                    <Input
                      id="metrosLineares"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.metrosLineares}
                      onChange={(e) => handleChange('metrosLineares', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tributos */}
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent">
                <CardTitle>Configuração de Tributos</CardTitle>
                <CardDescription>
                  Configure as alíquotas de tributos aplicáveis
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="temISS"
                    checked={formData.temISS}
                    onCheckedChange={(checked) => handleChange('temISS', checked)}
                  />
                  <Label
                    htmlFor="temISS"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Incluir ISS no orçamento
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aliquotaISS">
                      Alíquota ISS (%)
                    </Label>
                    <Input
                      id="aliquotaISS"
                      type="number"
                      step="0.01"
                      placeholder="3.00"
                      value={formData.aliquotaISS}
                      onChange={(e) => handleChange('aliquotaISS', e.target.value)}
                      disabled={!formData.temISS}
                    />
                    <p className="text-xs text-muted-foreground">
                      Padrão: 3%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aliquotaSimples">
                      Alíquota Simples Nacional (%)
                    </Label>
                    <Input
                      id="aliquotaSimples"
                      type="number"
                      step="0.01"
                      placeholder="11.80"
                      value={formData.aliquotaSimples}
                      onChange={(e) => handleChange('aliquotaSimples', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Padrão: 11.8%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Próximos passos</p>
                    <p className="text-xs text-muted-foreground">
                      Após criar o orçamento, você poderá adicionar composições de custos,
                      itens detalhados, calcular BDI, visualizar DRE e exportar relatórios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/comercial/orcamentos')}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Orçamento
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoOrcamento;
