import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  FileCheck,
  Gauge,
  ClipboardCheck,
  TrendingUp,
  Building2,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Obra } from '@/interfaces/ObrasInterface';
import ObrasService from '@/services/ObrasService';
import DashboardQualidadeService from '@/services/DashboardQualidadeService';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardQualidade = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState<Obra[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [filtros, setFiltros] = useState({
    obraId: 'todas',
    periodo: 'mes_atual',
    inicio: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    fim: format(new Date(), 'yyyy-MM-dd'),
  });

  const [metrics, setMetrics] = useState({
    rncs: {
      total: 0,
      abertas: 0,
      resolvidas: 0,
      taxaResolucao: 0,
      tempoMedioResolucao: 0,
    },
    inspecoes: {
      total: 0,
      aprovadas: 0,
      aprovadasComRessalvas: 0,
      reprovadas: 0,
      taxaConformidade: 0,
    },
    certificados: {
      total: 0,
      pendentes: 0,
      recebidos: 0,
      enviados: 0,
      proximosPrazo: 0,
    },
    calibracao: {
      equipamentosTotal: 0,
      emDia: 0,
      proximoVencimento: 0,
      vencidos: 0,
    },
    acoesCorretivas: {
      total: 0,
      abertas: 0,
      concluidas: 0,
      atrasadas: 0,
      taxaEficacia: 0,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [filtros]);

  const loadData = async () => {
    try {
      const projetosData = await ObrasService.getAllObras();
      setProjetos(projetosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      setLoading(true);

      const periodo = {
        inicio: filtros.inicio,
        fim: filtros.fim,
      };

      const obraId = filtros.obraId !== 'todas' ? filtros.obraId : undefined;

      const data = await DashboardQualidadeService.getMetrics(periodo, obraId);
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as métricas do dashboard.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodoChange = (periodo: string) => {
    const hoje = new Date();
    let inicio: Date;
    let fim = hoje;

    switch (periodo) {
      case 'semana_atual':
        inicio = subMonths(hoje, 0);
        inicio.setDate(hoje.getDate() - 7);
        break;
      case 'mes_atual':
        inicio = subMonths(hoje, 1);
        break;
      case 'trimestre':
        inicio = subMonths(hoje, 3);
        break;
      case 'semestre':
        inicio = subMonths(hoje, 6);
        break;
      case 'ano':
        inicio = subMonths(hoje, 12);
        break;
      default:
        inicio = subMonths(hoje, 1);
    }

    setFiltros({
      ...filtros,
      periodo,
      inicio: format(inicio, 'yyyy-MM-dd'),
      fim: format(fim, 'yyyy-MM-dd'),
    });
  };

  // KPI Cards Stats
  const stats = [
    {
      title: 'RNCs',
      value: metrics.rncs.total.toString(),
      subtitle: `${metrics.rncs.abertas} abertas`,
      icon: AlertCircle,
      color: 'bg-red-600',
      trend: metrics.rncs.taxaResolucao > 0 ? `${metrics.rncs.taxaResolucao.toFixed(0)}% resolvidas` : null,
    },
    {
      title: 'Inspeções',
      value: metrics.inspecoes.total.toString(),
      subtitle: `${metrics.inspecoes.taxaConformidade.toFixed(0)}% conformidade`,
      icon: ClipboardCheck,
      color: 'bg-blue-600',
      trend: metrics.inspecoes.aprovadas > 0 ? `${metrics.inspecoes.aprovadas} aprovadas` : null,
    },
    {
      title: 'Certificados',
      value: metrics.certificados.total.toString(),
      subtitle: `${metrics.certificados.pendentes} pendentes`,
      icon: FileCheck,
      color: 'bg-green-600',
      trend: metrics.certificados.enviados > 0 ? `${metrics.certificados.enviados} enviados` : null,
    },
    {
      title: 'Calibração',
      value: metrics.calibracao.equipamentosTotal.toString(),
      subtitle: `${metrics.calibracao.vencidos} vencidos`,
      icon: Gauge,
      color: 'bg-purple-600',
      trend: metrics.calibracao.emDia > 0 ? `${metrics.calibracao.emDia} em dia` : null,
    },
  ];

  if (loading && metrics.rncs.total === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              Dashboard Qualidade
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão geral de indicadores e métricas de qualidade
            </p>
          </div>

          {/* Filtros - Collapsible */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <div className="bg-card rounded-xl shadow-elevation-2 border border-border/50 overflow-hidden">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-accent/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold">Filtros</h3>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      filtersOpen && 'rotate-180'
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 md:p-6 pt-0 border-t border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Obra</label>
                      <Select
                        value={filtros.obraId}
                        onValueChange={(value) => setFiltros({ ...filtros, obraId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas as obras" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas as obras</SelectItem>
                          {projetos.map((projeto) => (
                            <SelectItem key={projeto.id} value={projeto.id}>
                              {projeto.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Período</label>
                      <Select value={filtros.periodo} onValueChange={handlePeriodoChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semana_atual">Última Semana</SelectItem>
                          <SelectItem value="mes_atual">Último Mês</SelectItem>
                          <SelectItem value="trimestre">Último Trimestre</SelectItem>
                          <SelectItem value="semestre">Último Semestre</SelectItem>
                          <SelectItem value="ano">Último Ano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Período Customizado</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(filtros.inicio), 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                          {format(new Date(filtros.fim), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* KPIs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">
                      {stat.title}
                    </CardDescription>
                    <div className={`${stat.color} p-2 rounded-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.subtitle}</div>
                    {stat.trend && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.trend}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Grid de Métricas Detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RNCs */}
            <Card className="shadow-elevation-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Não Conformidades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{metrics.rncs.total}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Abertas</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.rncs.abertas}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Resolvidas</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.rncs.resolvidas}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Taxa Resolução</p>
                    <p className="text-2xl font-bold">{metrics.rncs.taxaResolucao.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tempo Médio de Resolução</span>
                    <span className="font-semibold">{metrics.rncs.tempoMedioResolucao} dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspeções */}
            <Card className="shadow-elevation-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  Inspeções
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{metrics.inspecoes.total}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Aprovadas</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.inspecoes.aprovadas}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Com Ressalvas</p>
                    <p className="text-2xl font-bold text-yellow-600">{metrics.inspecoes.aprovadasComRessalvas}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Reprovadas</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.inspecoes.reprovadas}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de Conformidade</span>
                    <span className="font-semibold text-green-600">{metrics.inspecoes.taxaConformidade.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificados */}
            <Card className="shadow-elevation-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-green-600" />
                  Certificados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{metrics.certificados.total}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">{metrics.certificados.pendentes}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Recebidos</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.certificados.recebidos}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Enviados</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.certificados.enviados}</p>
                  </div>
                </div>
                {metrics.certificados.proximosPrazo > 0 && (
                  <div className="pt-4 border-t">
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>{metrics.certificados.proximosPrazo}</strong> certificado{metrics.certificados.proximosPrazo > 1 ? 's' : ''} próximo{metrics.certificados.proximosPrazo > 1 ? 's' : ''} do prazo
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calibração */}
            <Card className="shadow-elevation-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-purple-600" />
                  Calibração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Equipamentos</p>
                    <p className="text-2xl font-bold">{metrics.calibracao.equipamentosTotal}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Em Dia</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.calibracao.emDia}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Próximo Venc.</p>
                    <p className="text-2xl font-bold text-yellow-600">{metrics.calibracao.proximoVencimento}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Vencidos</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.calibracao.vencidos}</p>
                  </div>
                </div>
                {metrics.calibracao.vencidos > 0 && (
                  <div className="pt-4 border-t">
                    <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded">
                      <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <strong>Urgente:</strong> {metrics.calibracao.vencidos} equipamento{metrics.calibracao.vencidos > 1 ? 's' : ''} vencido{metrics.calibracao.vencidos > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ações Corretivas - Card Full Width */}
          {metrics.acoesCorretivas.total > 0 && (
            <Card className="shadow-elevation-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  Ações Corretivas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{metrics.acoesCorretivas.total}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Abertas</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.acoesCorretivas.abertas}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Concluídas</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.acoesCorretivas.concluidas}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Atrasadas</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.acoesCorretivas.atrasadas}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Taxa Eficácia</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.acoesCorretivas.taxaEficacia.toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardQualidade;
