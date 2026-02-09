import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { usePropostas } from '@/hooks/usePropostas';
import { formatCurrency } from '@/lib/currency';

const Dashboard = () => {
  const navigate = useNavigate();

  // React Query hooks - cache automático, refetch, retry
  const {
    data: orcamentos = [],
    isLoading: orcamentosLoading,
    error: orcamentosError,
    refetch: refetchOrcamentos,
  } = useOrcamentos();

  const {
    data: propostas = [],
    isLoading: propostasLoading,
    error: propostasError,
    refetch: refetchPropostas,
  } = usePropostas();

  // Loading se qualquer um estiver carregando
  const loading = orcamentosLoading || propostasLoading;

  // Erro apenas se AMBOS falharam
  const error = orcamentosError && propostasError
    ? new Error('Não foi possível carregar os dados do módulo comercial')
    : null;

  // Retry function para PageContainer
  const handleRetry = () => {
    refetchOrcamentos();
    refetchPropostas();
  };

  // Estatísticas memoizadas para melhor performance
  const stats = useMemo(() => ({
    totalOrcamentos: orcamentos.length,
    totalPropostas: propostas.length,
    propostasEmAnalise: propostas.filter(p => p.status === 'em_analise').length,
    propostasAprovadas: propostas.filter(p => p.status === 'aprovada').length,
    valorTotalPropostas: propostas.reduce((sum, p) => sum + p.valorTotal, 0),
    valorPropostasAprovadas: propostas
      .filter(p => p.status === 'aprovada')
      .reduce((sum, p) => sum + p.valorTotal, 0),
  }), [orcamentos, propostas]);

  return (
    <Layout>
      <PageContainer
        loading={loading}
        error={error}
        onRetry={handleRetry}
      >
        <div className="space-y-8 pb-24 min-h-[150vh]">
        {/* Header Moderno */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl opacity-10 dark:opacity-20"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-2">
                  Módulo Comercial
                </h1>
                <p className="text-lg text-muted-foreground">
                  Gestão completa de orçamentos e propostas comerciais
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Última atualização</div>
                  <div className="font-semibold">{new Date().toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Métricas - Design Moderno */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 - Total Orçamentos */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-500 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Orçamentos Criados</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalOrcamentos}</p>
                  <Badge variant="outline" className="text-xs">Total</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 - Propostas Aprovadas */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-500 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Propostas Aprovadas</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.propostasAprovadas}</p>
                  <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">Sucesso</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.valorPropostasAprovadas)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 - Em Análise */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-yellow-500 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Em Análise</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.propostasEmAnalise}</p>
                  <Badge variant="outline" className="text-xs text-yellow-600 dark:text-yellow-400">Aguardando</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4 - Valor Total */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-500 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <BarChart3 className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <div className="flex flex-col gap-1">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(stats.valorTotalPropostas)}
                  </p>
                  <p className="text-xs text-muted-foreground">Todas as propostas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Módulos - Cards Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Orçamentos */}
          <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-blue-400/5 pointer-events-none"></div>
            <CardHeader className="relative border-b bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/40 dark:to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Orçamentos (QQP)</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sistema completo de composição de custos
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-6 space-y-4">
              <div className="space-y-3">
                {[
                  { icon: BarChart3, text: 'Composições detalhadas de custos' },
                  { icon: TrendingUp, text: 'Cálculos automáticos (BDI + Tributos)' },
                  { icon: CheckCircle2, text: 'Análise ABC e DRE completo' },
                  { icon: Calendar, text: 'Templates e importação CSV' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 group/item">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-950/60 transition-colors">
                      <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 relative z-10">
                <Button
                  onClick={() => navigate('/comercial/orcamentos')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all"
                >
                  Acessar Orçamentos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => navigate('/comercial/orcamentos/novo')}
                  variant="outline"
                  className="border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Propostas */}
          <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-green-400/5"></div>
            <CardHeader className="relative border-b bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/40 dark:to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center shadow-lg">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Propostas Comerciais</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gestão e exportação de propostas profissionais
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-6 space-y-4">
              <div className="space-y-3">
                {[
                  { icon: FileText, text: 'Propostas profissionais formato GMX' },
                  { icon: CheckCircle2, text: 'Workflow de aprovação completo' },
                  { icon: TrendingUp, text: 'Vinculação com orçamentos e obras' },
                  { icon: Users, text: 'Gestão de clientes integrada' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 group/item">
                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center group-hover/item:bg-green-100 dark:group-hover/item:bg-green-950/60 transition-colors">
                      <item.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => navigate('/comercial/propostas')}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl transition-all"
                >
                  Acessar Propostas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="border-green-200 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Últimas Atividades - Design Moderno */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Últimos Orçamentos */}
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/40 dark:to-transparent">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Últimos Orçamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {orcamentos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-blue-300 dark:text-blue-600" />
                  </div>
                  <p className="text-muted-foreground">Nenhum orçamento criado ainda</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/comercial/orcamentos/novo')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeiro orçamento
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orcamentos.slice(0, 5).map(orc => (
                    <Link
                      key={orc.id}
                      to={`/comercial/orcamentos/${orc.id}`}
                      className="block p-4 rounded-xl border hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{orc.nome}</p>
                          <p className="text-sm text-muted-foreground">Nº {orc.numero}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(orc.totalVenda)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Margem: {orc.dre.margemLiquida.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Últimas Propostas */}
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/40 dark:to-transparent">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                Últimas Propostas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {propostas.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-green-300 dark:text-green-600" />
                  </div>
                  <p className="text-muted-foreground">Nenhuma proposta criada ainda</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira proposta
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {propostas.slice(0, 5).map(prop => {
                    const statusColors = {
                      aprovada: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
                      em_analise: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300',
                      rejeitada: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
                      rascunho: 'bg-gray-100 text-gray-700 dark:bg-gray-950/40 dark:text-gray-300',
                      cancelada: 'bg-gray-200 text-gray-800 dark:bg-gray-900/40 dark:text-gray-400',
                    };

                    return (
                      <div
                        key={prop.id}
                        className="p-4 rounded-xl border hover:border-green-200 dark:hover:border-green-800 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{prop.titulo}</p>
                            <p className="text-sm text-muted-foreground">{prop.cliente.razaoSocial}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(prop.valorTotal)}
                            </p>
                            <Badge className={statusColors[prop.status]}>
                              {prop.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </PageContainer>
    </Layout>
  );
};

export default Dashboard;
