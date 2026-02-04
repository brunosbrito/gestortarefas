import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BarChart3,
  Target,
  GitBranch,
  ClipboardList,
  RotateCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  TrendingUp,
  FileText,
  DollarSign,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { LayoutGestaoProcessos } from './LayoutGestaoProcessos';
import DashboardGestaoProcessosService, {
  DashboardStats,
} from '@/services/gestaoProcessos/DashboardGestaoProcessosService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardGestaoProcessos() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [currentChart, setCurrentChart] = useState<'status' | 'ferramenta' | 'progresso' | null>(
    null
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await DashboardGestaoProcessosService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openChartModal = (chart: 'status' | 'ferramenta' | 'progresso') => {
    setCurrentChart(chart);
    setChartModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      rascunho: {
        variant: 'secondary' as const,
        label: 'Rascunho',
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      },
      aguardando_aprovacao: {
        variant: 'default' as const,
        label: 'Aguardando',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
      },
      aprovado: {
        variant: 'default' as const,
        label: 'Aprovado',
        className: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
      },
      rejeitado: {
        variant: 'destructive' as const,
        label: 'Rejeitado',
        className: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
      },
    };

    const cfg = config[status as keyof typeof config] || config.rascunho;

    return (
      <Badge variant={cfg.variant} className={cfg.className}>
        {cfg.label}
      </Badge>
    );
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      priorizacao: Target,
      'plano-acao': ClipboardList,
      desdobramento: GitBranch,
      meta: Target,
    };
    return icons[tipo as keyof typeof icons] || FileText;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground mt-4">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <LayoutGestaoProcessos>
      <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestão de Processos</h1>
              <p className="text-muted-foreground mt-1">
                Dashboard consolidado de todas as ferramentas
              </p>
            </div>
            <Button variant="outline" onClick={loadDashboard}>
              <RotateCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Alertas */}
          {(stats.aguardandoAprovacao > 0 ||
            stats.metasAtrasadas > 0 ||
            stats.planosAtrasados > 0) && (
            <Card className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                      Atenção Necessária
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {stats.aguardandoAprovacao > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {stats.aguardandoAprovacao} documento
                            {stats.aguardandoAprovacao > 1 ? 's' : ''} aguardando aprovação
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0"
                            onClick={() => navigate('/gestao-processos/aprovacao')}
                          >
                            Ver fila
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      )}
                      {stats.metasAtrasadas > 0 && (
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          <span>
                            {stats.metasAtrasadas} meta{stats.metasAtrasadas > 1 ? 's' : ''}{' '}
                            atrasada{stats.metasAtrasadas > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {stats.planosAtrasados > 0 && (
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4" />
                          <span>
                            {stats.planosAtrasados} plano{stats.planosAtrasados > 1 ? 's' : ''}{' '}
                            atrasado{stats.planosAtrasados > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Total Documentos</CardDescription>
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalDocumentos}</div>
                <div className="text-xs text-muted-foreground">Todas as ferramentas</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Em Andamento</CardDescription>
                  <div className="bg-orange-600 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {stats.documentosEmAndamento}
                </div>
                <div className="text-xs text-muted-foreground">Execução em progresso</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Concluídos</CardDescription>
                  <div className="bg-green-600 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.documentosConcluidos}
                </div>
                <div className="text-xs text-muted-foreground">100% completos</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Progresso Médio</CardDescription>
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.progressoMedio}%</div>
                <div className="text-xs text-muted-foreground">Planos e Metas</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>Criar novos documentos nas ferramentas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:border-primary"
                  onClick={() => navigate('/gestao-processos/priorizacao')}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="p-2 bg-blue-100 dark:bg-blue-950/20 rounded-lg">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-semibold">Priorização GUT</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Matriz Gravidade × Urgência × Tendência
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:border-primary"
                  onClick={() => navigate('/gestao-processos/desdobramento')}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="p-2 bg-pink-100 dark:bg-pink-950/20 rounded-lg">
                      <GitBranch className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    <span className="font-semibold">Desdobramento</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Análise de causas e efeitos
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:border-primary"
                  onClick={() => navigate('/gestao-processos/metas')}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="p-2 bg-orange-100 dark:bg-orange-950/20 rounded-lg">
                      <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="font-semibold">Meta SMART</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    Specific, Measurable, Attainable, Relevant, Time-bound
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:border-primary"
                  onClick={() => navigate('/gestao-processos/planos-acao')}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="p-2 bg-purple-100 dark:bg-purple-950/20 rounded-lg">
                      <ClipboardList className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-semibold">Plano 5W2H</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    What, Why, Who, When, Where, How, How Much
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos e Métricas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Distribuição por Status */}
            <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => openChartModal('status')}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Distribuição por Status
                  <Badge variant="outline" className="ml-auto">
                    Click para ampliar
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.distribuicaoStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.distribuicaoStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição por Ferramenta */}
            <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => openChartModal('ferramenta')}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Distribuição por Ferramenta
                  <Badge variant="outline" className="ml-auto">
                    Click para ampliar
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.distribuicaoFerramenta}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Progresso por Ferramenta */}
            <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => openChartModal('progresso')}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Progresso por Ferramenta
                  <Badge variant="outline" className="ml-auto">
                    Click para ampliar
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.progressoPorFerramenta.map((item) => {
                    const percent =
                      item.total > 0 ? Math.round((item.progresso / item.total) * 100) : 0;
                    return (
                      <div key={item.ferramenta}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{item.ferramenta}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.progresso}/{item.total} ({percent}%)
                          </span>
                        </div>
                        <Progress value={percent} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Métricas Específicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Métricas Consolidadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">Problemas Alta Prioridade</span>
                  <Badge variant="destructive">{stats.problemasAltaPrioridade}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">Ações Totais (5W2H)</span>
                  <Badge variant="outline">
                    {stats.acoesCompletadas}/{stats.acoesTotais}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">Causas Raiz Identificadas</span>
                  <Badge variant="default">{stats.causasRaizIdentificadas}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">Milestones Completados</span>
                  <Badge variant="outline">
                    {stats.milestonesCompletados}/{stats.milestonesTotais}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">Custo Total Planos</span>
                  <Badge variant="default" className="bg-purple-600">
                    {stats.custoTotalPlanos.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                    })}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documentos Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos Recentes</CardTitle>
              <CardDescription>Últimas atualizações em todas as ferramentas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.documentosRecentes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum documento criado ainda</p>
                  </div>
                ) : (
                  stats.documentosRecentes.map((doc) => {
                    const TipoIcon = getTipoIcon(doc.tipo);
                    return (
                      <div
                        key={`${doc.tipo}-${doc.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <TipoIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{doc.titulo}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.tipo === 'priorizacao' && 'Priorização GUT'}
                              {doc.tipo === 'plano-acao' && 'Plano 5W2H'}
                              {doc.tipo === 'desdobramento' && 'Desdobramento'}
                              {doc.tipo === 'meta' && 'Meta SMART'} •{' '}
                              {format(new Date(doc.data), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(doc.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const paths = {
                                priorizacao: '/gestao-processos/priorizacao',
                                'plano-acao': `/gestao-processos/planos-acao/${doc.id}`,
                                desdobramento: '/gestao-processos/desdobramento',
                                meta: `/gestao-processos/metas/${doc.id}`,
                              };
                              navigate(paths[doc.tipo]);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Gráfico Ampliado */}
      <Dialog open={chartModalOpen} onOpenChange={setChartModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {currentChart === 'status' && 'Distribuição por Status'}
              {currentChart === 'ferramenta' && 'Distribuição por Ferramenta'}
              {currentChart === 'progresso' && 'Progresso por Ferramenta'}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[500px] w-full">
            {currentChart === 'status' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.distribuicaoStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.distribuicaoStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            {currentChart === 'ferramenta' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.distribuicaoFerramenta}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8b5cf6" name="Documentos" />
                </BarChart>
              </ResponsiveContainer>
            )}
            {currentChart === 'progresso' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.progressoPorFerramenta.map((item) => ({
                    ...item,
                    percentual:
                      item.total > 0 ? Math.round((item.progresso / item.total) * 100) : 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ferramenta" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progresso" fill="#10b981" name="Concluídos" />
                  <Bar dataKey="total" fill="#6b7280" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </LayoutGestaoProcessos>
  );
}
