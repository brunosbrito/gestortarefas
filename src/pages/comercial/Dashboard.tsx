import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import OrcamentoService from '@/services/OrcamentoService';
import PropostaService from '@/services/PropostaService';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { Proposta } from '@/interfaces/PropostaInterface';
import { formatCurrency } from '@/lib/currency';

const Dashboard = () => {
  const navigate = useNavigate();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [orcamentosData, propostasData] = await Promise.all([
        OrcamentoService.getAll(),
        PropostaService.getAll(),
      ]);
      setOrcamentos(orcamentosData);
      setPropostas(propostasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas
  const stats = {
    totalOrcamentos: orcamentos.length,
    totalPropostas: propostas.length,
    propostasEmAnalise: propostas.filter(p => p.status === 'em_analise').length,
    propostasAprovadas: propostas.filter(p => p.status === 'aprovada').length,
    valorTotalPropostas: propostas.reduce((sum, p) => sum + p.valorTotal, 0),
    valorPropostasAprovadas: propostas
      .filter(p => p.status === 'aprovada')
      .reduce((sum, p) => sum + p.valorTotal, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando módulo comercial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 space-y-8">
        {/* Header Moderno */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/5 rounded-3xl"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Módulo Comercial
                </h1>
                <p className="text-lg text-muted-foreground">
                  Gestão completa de orçamentos e propostas comerciais
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Última atualização</div>
                  <div className="font-semibold text-foreground">{new Date().toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Métricas - Padrão PCP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 - Total Orçamentos */}
          <Card className="border-l-4 border-l-blue-500 border-y border-r bg-blue-50/50 dark:bg-blue-950/20 shadow-elevation-2 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                {/* Icon + Title */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-sm text-blue-700 dark:text-blue-300">
                    Orçamentos
                  </h3>
                </div>

                {/* Value */}
                <span className="text-2xl font-bold tabular-nums text-blue-700 dark:text-blue-300">
                  {stats.totalOrcamentos}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 - Propostas Aprovadas */}
          <Card className="border-l-4 border-l-green-500 border-y border-r bg-green-50/50 dark:bg-green-950/20 shadow-elevation-2 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                {/* Icon + Title */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-sm text-green-700 dark:text-green-300">
                    Aprovadas
                  </h3>
                </div>

                {/* Value */}
                <span className="text-2xl font-bold tabular-nums text-green-700 dark:text-green-300">
                  {stats.propostasAprovadas}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 - Em Análise */}
          <Card className="border-l-4 border-l-yellow-500 border-y border-r bg-yellow-50/50 dark:bg-yellow-950/20 shadow-elevation-2 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                {/* Icon + Title */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-sm text-yellow-700 dark:text-yellow-300">
                    Em Análise
                  </h3>
                </div>

                {/* Value */}
                <span className="text-2xl font-bold tabular-nums text-yellow-700 dark:text-yellow-300">
                  {stats.propostasEmAnalise}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4 - Valor Total */}
          <Card className="border-l-4 border-l-purple-500 border-y border-r bg-purple-50/50 dark:bg-purple-950/20 shadow-elevation-2 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                {/* Icon + Title */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-sm text-purple-700 dark:text-purple-300">
                    Valor Total
                  </h3>
                </div>

                {/* Value */}
                <div className="text-right">
                  <span className="text-xl font-bold tabular-nums text-purple-700 dark:text-purple-300 block">
                    {formatCurrency(stats.valorTotalPropostas)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Módulos - Cards Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Orçamentos */}
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5"></div>
            <CardHeader className="relative border-b bg-muted/30">
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
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors">
                      <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
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
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Propostas */}
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5"></div>
            <CardHeader className="relative border-b bg-muted/30">
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
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors">
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
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Últimos Orçamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {orcamentos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
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
                      className="block p-4 rounded-xl border hover:border-primary hover:bg-muted/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{orc.nome}</p>
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
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                Últimas Propostas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {propostas.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
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
                      aprovada: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      em_analise: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                      rejeitada: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                      rascunho: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                      cancelada: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
                    };

                    return (
                      <div
                        key={prop.id}
                        className="p-4 rounded-xl border hover:border-primary hover:bg-muted/50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{prop.titulo}</p>
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
    </div>
  );
};

export default Dashboard;
