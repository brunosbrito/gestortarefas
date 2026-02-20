import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
  FileText,
  Plus,
  Calculator,
  BarChart3,
  Settings,
  Download,
  Edit,
  Trash2,
  Wrench,
  Package
} from 'lucide-react';
import OrcamentoService from '@/services/OrcamentoService';
import OrcamentoPdfService from '@/services/OrcamentoPdfService';
import ComposicaoService from '@/services/ComposicaoService';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatPercentage } from '@/lib/currency';
import AdicionarComposicaoDialog from './AdicionarComposicaoDialog';
import AdicionarItemDialog from './AdicionarItemDialog';
import ComposicoesGridInline from './ComposicoesGridInline';

const EditarOrcamento = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [activeTab, setActiveTab] = useState('composicoes');

  // Dialog states
  const [dialogComposicao, setDialogComposicao] = useState(false);
  const [dialogItem, setDialogItem] = useState(false);
  const [composicaoSelecionada, setComposicaoSelecionada] = useState<string | null>(null);
  const [composicaoParaEditar, setComposicaoParaEditar] = useState<any>(null);

  useEffect(() => {
    if (id) {
      carregarOrcamento();
    }
  }, [id]);

  const carregarOrcamento = async () => {
    try {
      setLoading(true);
      const data = await OrcamentoService.getById(id!);
      setOrcamento(data);
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o orçamento',
        variant: 'destructive',
      });
      navigate('/comercial/orcamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarItem = (composicaoId: string) => {
    setComposicaoSelecionada(composicaoId);
    setDialogItem(true);
  };

  const handleEditarComposicao = (composicao: any) => {
    setComposicaoParaEditar(composicao);
    setDialogComposicao(true);
  };

  const handleNovaComposicao = () => {
    setComposicaoParaEditar(null);
    setDialogComposicao(true);
  };

  const handleDeletarComposicao = async (composicaoId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta composição?')) return;

    try {
      await ComposicaoService.delete(composicaoId);

      toast({
        title: 'Sucesso',
        description: 'Composição deletada com sucesso',
      });

      // Recarregar orçamento
      carregarOrcamento();
    } catch (error) {
      console.error('Erro ao deletar composição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar a composição',
        variant: 'destructive',
      });
    }
  };

  const handleEditarBDI = async (composicaoId: string, novoBDI: number) => {
    try {
      await ComposicaoService.update({
        id: composicaoId,
        bdiPercentual: novoBDI,
      });

      toast({
        title: 'Sucesso',
        description: 'BDI atualizado com sucesso',
      });

      // Recarregar orçamento
      carregarOrcamento();
    } catch (error) {
      console.error('Erro ao atualizar BDI:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o BDI',
        variant: 'destructive',
      });
    }
  };

  const handleReordenarComposicoes = async (composicoesReordenadas: any[]) => {
    if (!orcamento) return;

    try {
      // Atualizar ordem localmente primeiro para feedback visual rápido
      setOrcamento({
        ...orcamento,
        composicoes: composicoesReordenadas,
      });

      // Salvar no backend
      await OrcamentoService.update(id!, {
        id: id!,
        composicoes: composicoesReordenadas,
      });

      // Recarregar orçamento completo para garantir sincronização
      await carregarOrcamento();

      toast({
        title: 'Sucesso',
        description: 'Ordem das composições atualizada',
      });
    } catch (error) {
      console.error('Erro ao reordenar composições:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível reordenar as composições',
        variant: 'destructive',
      });
      // Recarregar em caso de erro
      carregarOrcamento();
    }
  };

  const handleExportarPDF = async () => {
    if (!orcamento) return;

    try {
      setExportingPdf(true);
      await OrcamentoPdfService.generatePDF(orcamento);
      toast({
        title: 'Sucesso',
        description: 'PDF gerado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF',
        variant: 'destructive',
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const handleSalvar = async () => {
    if (!orcamento || !id) return;

    try {
      setSaving(true);

      // Atualizar orçamento no backend
      const updatedOrcamento = await OrcamentoService.update(id, {
        nome: orcamento.nome,
        tipo: orcamento.tipo,
        clienteNome: orcamento.clienteNome,
        codigoProjeto: orcamento.codigoProjeto,
        areaTotalM2: orcamento.areaTotalM2,
        metrosLineares: orcamento.metrosLineares,
        pesoTotalProjeto: orcamento.pesoTotalProjeto,
        composicoes: orcamento.composicoes,
        tributos: orcamento.tributos,
      });

      // Atualizar estado local
      setOrcamento(updatedOrcamento);

      toast({
        title: 'Sucesso',
        description: 'Orçamento salvo com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o orçamento',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Orçamento não encontrado</p>
          <Button onClick={() => navigate('/comercial/orcamentos')}>
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/comercial/orcamentos')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{orcamento.nome}</h1>
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                    {orcamento.numero}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1.5 ${
                    orcamento.tipo === 'servico'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {orcamento.tipo === 'servico' ? (
                      <Wrench className="h-3.5 w-3.5" />
                    ) : (
                      <Package className="h-3.5 w-3.5" />
                    )}
                    {orcamento.tipo === 'servico' ? 'Serviço' : 'Produto'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {orcamento.clienteNome && (
                    <span>Cliente: {orcamento.clienteNome}</span>
                  )}
                  {orcamento.codigoProjeto && (
                    <span>Código: {orcamento.codigoProjeto}</span>
                  )}
                  {orcamento.pesoTotalProjeto && (
                    <span>Peso: {orcamento.pesoTotalProjeto.toLocaleString('pt-BR')} KG</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportarPDF}
              disabled={exportingPdf}
            >
              {exportingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </>
              )}
            </Button>
            <Button
              disabled={saving}
              onClick={handleSalvar}
              className="bg-gradient-to-r from-blue-600 to-blue-500"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Cards de Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Custo Direto</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(orcamento.custoDirectoTotal)}
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">BDI Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(orcamento.bdiTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(orcamento.bdiMedio)}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(orcamento.subtotal)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-red-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tributos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(orcamento.tributosTotal)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Venda</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(orcamento.totalVenda)}
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Conteúdo */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="composicoes">
              <FileText className="h-4 w-4 mr-2" />
              Composições
            </TabsTrigger>
            <TabsTrigger value="dre">
              <BarChart3 className="h-4 w-4 mr-2" />
              DRE
            </TabsTrigger>
            <TabsTrigger value="configuracoes">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="composicoes" className="space-y-4">
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800 dark:to-transparent dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-slate-100">Composições de Custos</CardTitle>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-500"
                    onClick={handleNovaComposicao}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Composição
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ComposicoesGridInline
                  composicoes={orcamento.composicoes}
                  totalVenda={orcamento.totalVenda}
                  onEditBDI={handleEditarBDI}
                  onEdit={handleEditarComposicao}
                  onDelete={handleDeletarComposicao}
                  onReorder={handleReordenarComposicoes}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dre" className="space-y-4">
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent">
                <CardTitle>DRE - Demonstrativo de Resultado</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Receita Líquida</span>
                    <span className="font-bold">{formatCurrency(orcamento.dre.receitaLiquida)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Lucro Bruto</span>
                    <span className="font-bold text-green-600">{formatCurrency(orcamento.dre.lucroBruto)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Margem Bruta</span>
                    <span className="font-bold">{formatPercentage(orcamento.dre.margemBruta)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Lucro Líquido</span>
                    <span className={`font-bold ${orcamento.dre.lucroLiquido < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(orcamento.dre.lucroLiquido)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Margem Líquida</span>
                    <span className={`font-bold ${orcamento.dre.margemLiquida < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatPercentage(orcamento.dre.margemLiquida)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent">
                <CardTitle>Configurações de Tributos</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">ISS</p>
                      <p className="text-sm text-muted-foreground">
                        {orcamento.tributos.temISS ? 'Incluído' : 'Não incluído'}
                      </p>
                    </div>
                    <span className="font-bold">
                      {formatPercentage(orcamento.tributos.aliquotaISS)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">Simples Nacional</p>
                      <p className="text-sm text-muted-foreground">Alíquota padrão</p>
                    </div>
                    <span className="font-bold">
                      {formatPercentage(orcamento.tributos.aliquotaSimples)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AdicionarComposicaoDialog
          open={dialogComposicao}
          onOpenChange={setDialogComposicao}
          orcamentoId={orcamento.id}
          onSuccess={carregarOrcamento}
          composicaoParaEditar={composicaoParaEditar}
        />

        {composicaoSelecionada && (
          <AdicionarItemDialog
            open={dialogItem}
            onOpenChange={setDialogItem}
            composicaoId={composicaoSelecionada}
            onSuccess={carregarOrcamento}
          />
        )}
      </div>
    </Layout>
  );
};

export default EditarOrcamento;
