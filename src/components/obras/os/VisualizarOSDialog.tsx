import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  User,
  Building2,
  ClipboardList,
  Hash,
  Weight,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Link2,
  Package,
  AlertCircle,
} from 'lucide-react';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateServiceOrderProgress, getVariance } from '@/services/ServiceOrderService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { VincularOrcamentoDialog } from '@/pages/obras/os/components/VincularOrcamentoDialog';
import OrcamentoExecucaoService from '@/services/OrcamentoExecucaoService';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface VisualizarOSDialogProps {
  os: ServiceOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProgress?: () => void;
}

export const VisualizarOSDialog = ({
  os,
  open,
  onOpenChange,
  onUpdateProgress,
}: VisualizarOSDialogProps) => {
  const [progress, setProgress] = useState<number>();
  const { toast } = useToast();

  // FASE 1 PCP: Estado para aba Orçamento vs Real
  const [vincularDialogOpen, setVincularDialogOpen] = useState(false);
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [variance, setVariance] = useState<{
    planejado: number;
    real: number;
    variance: number;
    variancePercentual: number;
  } | null>(null);
  const [loadingOrcamento, setLoadingOrcamento] = useState(false);

  useEffect(() => {
    setProgress(os?.progress);
  }, [os]);

  // FASE 1 PCP: Carrega orçamento vinculado
  useEffect(() => {
    const loadOrcamentoData = async () => {
      if (!os || !os.orcamentoId) return;

      try {
        setLoadingOrcamento(true);
        const orcData = await OrcamentoExecucaoService.getOrcamentoById(os.orcamentoId);
        setOrcamento(orcData);

        const varianceData = await getVariance(os.id);
        setVariance(varianceData);
      } catch (error) {
        console.error('Erro ao carregar dados de orçamento:', error);
      } finally {
        setLoadingOrcamento(false);
      }
    };

    if (open) {
      loadOrcamentoData();
    }
  }, [os, open]);

  if (!os) return null;

  const handleUpdateProgress = async () => {
    if (progress < 0) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar progresso',
        description: 'O progresso deve ser entre 0 e 100.',
      });
      return;
    }

    try {
      const response = await updateServiceOrderProgress(
        Number(os.id),
        progress
      );

      if (response?.data?.progress) {
        setProgress(response.data.progress);
      }

      toast({
        title: 'Progresso atualizado',
        description: 'O progresso da OS foi atualizado com sucesso!',
      });

      if (onUpdateProgress) {
        onUpdateProgress();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar progresso',
        description: 'Não foi possível atualizar o progresso da OS.',
      });
    }
  };

  // FASE 1 PCP: Preparar dados para gráfico de variance
  const getVarianceChartData = () => {
    if (!variance) return [];

    return [
      {
        name: 'Custo',
        Planejado: variance.planejado,
        Real: variance.real,
      }
    ];
  };

  // FASE 1 PCP: Obter composições vinculadas
  const composicoesVinculadas = orcamento?.composicoes.filter(c =>
    os.composicaoIds?.includes(c.id)
  ) || [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes da Ordem de Serviço</span>
              <Badge
                variant={
                  os.status === 'em_andamento'
                    ? 'default'
                    : os.status === 'concluida'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {os.status === 'em_andamento'
                  ? 'Em Andamento'
                  : os.status === 'concluida'
                  ? 'Concluída'
                  : 'Pausada'}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="detalhes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="orcamento">
                Orçamento vs Real
                {os.orcamentoId && (
                  <Badge variant="outline" className="ml-2">
                    Vinculado
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ABA DETALHES (conteúdo original) */}
            <TabsContent value="detalhes" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  OS-{os.serviceOrderNumber.toString().padStart(3, '0')}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Obra
                  </h3>
                  <p>{os.projectId.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Data de Início
                  </h3>
                  <p>{new Date(os.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Descrição
                </h3>
                <p>{os.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Número do Projeto
                </h3>
                <p>{os.projectNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Hash className="w-4 h-4 mr-2" />
                    Quantidade
                  </h3>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      placeholder="Progresso"
                      className="w-24"
                    />
                    <span>/</span>
                    <p>{os.quantity || 0}</p>
                    <Button
                      onClick={handleUpdateProgress}
                      className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
                    >
                      Atualizar
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Weight className="w-4 h-4 mr-2" />
                    Peso (t)
                  </h3>
                  <p>{os.weight}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Criado por
                </h3>
                <p>{os.assignedUser?.username || 'Não atribuído'}</p>
              </div>

              {os.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Observações</h3>
                  <p>{os.notes}</p>
                </div>
              )}
            </TabsContent>

            {/* ABA ORÇAMENTO VS REAL (NOVO - FASE 1 PCP) */}
            <TabsContent value="orcamento" className="space-y-4 mt-4">
              {!os.orcamentoId ? (
                // Orçamento não vinculado
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <AlertCircle className="w-16 h-16 text-muted-foreground" />
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Nenhum orçamento vinculado</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Vincule um orçamento a esta OS para acompanhar o custo planejado vs real
                      e rastrear a variance do projeto.
                    </p>
                  </div>
                  <Button
                    onClick={() => setVincularDialogOpen(true)}
                    className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Vincular Orçamento
                  </Button>
                </div>
              ) : loadingOrcamento ? (
                // Loading state
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Carregando dados do orçamento...</p>
                </div>
              ) : (
                // Orçamento vinculado - mostrar variance
                <>
                  {/* Informações do Orçamento */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5" />
                        Orçamento Vinculado
                      </CardTitle>
                      <CardDescription>
                        {orcamento?.numero} - {orcamento?.nome}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="font-medium">{orcamento?.clienteNome || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Código Projeto</p>
                        <p className="font-medium">{orcamento?.codigoProjeto || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Composições Vinculadas</p>
                        <p className="font-medium">{composicoesVinculadas.length}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* KPIs de Custo */}
                  {variance && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Custo Planejado</CardDescription>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(variance.planejado)}
                          </CardTitle>
                        </CardHeader>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription>Custo Real</CardDescription>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(variance.real)}
                          </CardTitle>
                        </CardHeader>
                      </Card>

                      <Card className={variance.variance > 0 ? 'border-red-200 dark:border-red-900' : 'border-green-200 dark:border-green-900'}>
                        <CardHeader className="pb-3">
                          <CardDescription>Variance</CardDescription>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            {variance.variance > 0 ? (
                              <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )}
                            <span className={variance.variance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                              {variance.variance > 0 ? '+' : ''}
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(variance.variance)}
                            </span>
                          </CardTitle>
                          <p className={`text-sm ${variance.variance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {variance.variancePercentual > 0 ? '+' : ''}
                            {variance.variancePercentual.toFixed(1)}% do planejado
                          </p>
                        </CardHeader>
                      </Card>
                    </div>
                  )}

                  {/* Gráfico de Variance - Recharts BarChart */}
                  {variance && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Comparativo de Custos</CardTitle>
                        <CardDescription>
                          Visualização do custo planejado vs custo real
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={getVarianceChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis
                              tickFormatter={(value) =>
                                new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                  notation: 'compact'
                                }).format(value)
                              }
                            />
                            <Tooltip
                              formatter={(value: number) =>
                                new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(value)
                              }
                            />
                            <Legend />
                            <Bar dataKey="Planejado" fill="#3b82f6" />
                            <Bar dataKey="Real" fill="#f97316" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  <Separator />

                  {/* Lista de Composições Vinculadas */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Composições de Custo Vinculadas</h3>
                    <div className="space-y-2">
                      {composicoesVinculadas.map((comp) => (
                        <Card key={comp.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{comp.nome}</h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Package className="w-3 h-3" />
                                    {comp.itens.length} itens
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL'
                                    }).format(comp.subtotal)}
                                  </span>
                                </div>
                              </div>
                              <Badge variant="outline">{comp.tipo}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Botão para Desvincular/Revincular */}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setVincularDialogOpen(true)}
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Alterar Vínculo
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Dialog para Vincular Orçamento */}
      <VincularOrcamentoDialog
        open={vincularDialogOpen}
        onOpenChange={setVincularDialogOpen}
        serviceOrderId={os.id}
        onSuccess={() => {
          setVincularDialogOpen(false);
          // Recarregar dados
          toast({
            title: 'Sucesso!',
            description: 'Orçamento vinculado com sucesso',
          });
          // Fechar e reabrir dialog para recarregar dados
          onOpenChange(false);
          setTimeout(() => onOpenChange(true), 100);
        }}
      />
    </>
  );
};
