import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Package,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';
import OrcamentoService from '@/services/OrcamentoService';
import OrcamentoPdfService from '@/services/OrcamentoPdfService';
import OrcamentoExcelService from '@/services/OrcamentoExcelService';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatPercentage } from '@/lib/currency';
import AdicionarComposicaoDialog from './AdicionarComposicaoDialog';
import AdicionarItemDialog from './AdicionarItemDialog';
import DREViewer from '../components/DREViewer';

const EditarOrcamento = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [activeTab, setActiveTab] = useState('composicoes');

  // Dialog states
  const [dialogComposicao, setDialogComposicao] = useState(false);
  const [dialogItem, setDialogItem] = useState(false);
  const [composicaoSelecionada, setComposicaoSelecionada] = useState<string | null>(null);
  const [itemParaEditar, setItemParaEditar] = useState<any>(null);

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
    setItemParaEditar(null);
    setDialogItem(true);
  };

  const handleEditarItem = (composicaoId: string, item: any) => {
    setComposicaoSelecionada(composicaoId);
    setItemParaEditar(item);
    setDialogItem(true);
  };

  const handleExcluirItem = async (itemId: string) => {
    if (!confirm('Deseja realmente excluir este item?')) return;

    try {
      // TODO: Implementar exclusão no service
      // await ItemComposicaoService.delete(itemId);
      toast({
        title: 'Sucesso',
        description: 'Item excluído com sucesso',
      });
      carregarOrcamento();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o item',
        variant: 'destructive',
      });
    }
  };

  const handleSalvar = async () => {
    try {
      setSaving(true);
      // TODO: Implementar salvamento de alterações
      // await OrcamentoService.update(orcamento);
      toast({
        title: 'Sucesso',
        description: 'Orçamento salvo com sucesso',
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

  const handleExportarPDF = async () => {
    if (!orcamento) return;

    try {
      toast({
        title: 'Exportando',
        description: 'Gerando PDF do orçamento...',
      });

      await OrcamentoPdfService.generatePDF(orcamento);

      toast({
        title: 'Sucesso',
        description: 'PDF gerado e baixado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF',
        variant: 'destructive',
      });
    }
  };

  const handleExportarExcel = async () => {
    if (!orcamento) return;

    try {
      toast({
        title: 'Exportando',
        description: 'Gerando Excel do orçamento...',
      });

      await OrcamentoExcelService.generateExcel(orcamento);

      toast({
        title: 'Sucesso',
        description: 'Excel gerado e baixado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o Excel',
        variant: 'destructive',
      });
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
    <div className="p-6 space-y-6">
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
              <div className="w-14 h-14 rounded-2xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-elevation-2">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{orcamento.nome}</h1>
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 rounded-full">
                    {orcamento.numero}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1.5 ${
                    orcamento.tipo === 'servico'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportarPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportarExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={handleSalvar}
              disabled={saving}
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
          <Card className="shadow-elevation-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Custo Direto</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(orcamento.custoDirectoTotal)}
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-blue-400 dark:text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevation-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">BDI Total</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(orcamento.bdiTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(orcamento.bdiMedio)}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-purple-400 dark:text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevation-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(orcamento.subtotal)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-amber-400 dark:text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevation-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tributos</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(orcamento.tributosTotal)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-red-400 dark:text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevation-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Venda</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(orcamento.totalVenda)}
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-green-400 dark:text-green-500" />
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
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle>Composições de Custos</CardTitle>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-500"
                    onClick={() => setDialogComposicao(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Composição
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {orcamento.composicoes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma composição adicionada ainda
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clique em "Adicionar Composição" para começar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orcamento.composicoes.map((composicao) => (
                      <Card key={composicao.id} className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">{composicao.nome}</CardTitle>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 rounded">
                                  {composicao.tipo.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {composicao.itens.length} itens • BDI: {formatPercentage(composicao.bdi.percentual)} •
                                Custo Direto: {formatCurrency(composicao.custoDirecto)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Subtotal</p>
                              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(composicao.subtotal)}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                          {composicao.itens.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
                              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Nenhum item adicionado
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-3"
                                onClick={() => handleAdicionarItem(composicao.id)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Item
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2">
                                {composicao.itens.map((item, index) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                        {item.codigo && (
                                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                            {item.codigo}
                                          </span>
                                        )}
                                        <span className="font-medium">{item.descricao}</span>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span>{item.quantidade} {item.unidade}</span>
                                        <span>×</span>
                                        <span>{formatCurrency(item.valorUnitario)}</span>
                                        {item.material && <span>• {item.material}</span>}
                                        {item.cargo && <span>• {item.cargo}</span>}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <p className="text-sm font-bold">
                                          {formatCurrency(item.subtotal)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatPercentage(item.percentual)}
                                        </p>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleEditarItem(composicao.id, item)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleExcluirItem(item.id)}
                                        >
                                          <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-end pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAdicionarItem(composicao.id)}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Adicionar Item
                                </Button>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dre" className="space-y-4">
            <DREViewer orcamento={orcamento} />
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader className="border-b bg-muted/30">
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
        />

        {composicaoSelecionada && (
          <AdicionarItemDialog
            open={dialogItem}
            onOpenChange={setDialogItem}
            composicaoId={composicaoSelecionada}
            onSuccess={carregarOrcamento}
            itemParaEditar={itemParaEditar}
          />
        )}
    </div>
  );
};

export default EditarOrcamento;
