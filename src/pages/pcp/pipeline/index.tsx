/**
 * FASE 4 PCP: Pipeline de Projetos
 * MPS adaptado para ETO (Engineer To Order) - Projetos Únicos
 * Sistema: Gestor Master - GMX Soluções Industriais
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  BarChart3,
  Calendar,
  Users,
  Zap,
  Filter,
  Plus,
  ArrowRight,
  ArrowLeft,
  Info,
  Maximize2,
} from 'lucide-react';
import PipelineProjetosService from '@/services/PipelineProjetosService';
import {
  DashboardPipeline,
  ProjetoPipeline,
  StatusPipeline,
  PrioridadeProjeto,
  SimulacaoNovoProjeto,
  ResultadoSimulacao,
} from '@/interfaces/PipelineInterface';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// ============================================
// MAPEAMENTO DE STATUS E CORES
// ============================================

const statusColors: Record<StatusPipeline, string> = {
  lead: 'bg-gray-500',
  proposta: 'bg-blue-500',
  negociacao: 'bg-yellow-500',
  vendido: 'bg-green-500',
  em_execucao: 'bg-orange-500',
  concluido: 'bg-emerald-500',
  cancelado: 'bg-red-500',
  perdido: 'bg-slate-500',
};

const statusLabels: Record<StatusPipeline, string> = {
  lead: 'Lead',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  vendido: 'Vendido',
  em_execucao: 'Em Execução',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  perdido: 'Perdido',
};

const prioridadeColors: Record<PrioridadeProjeto, string> = {
  baixa: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  alta: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critica: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

// ============================================
// UTILITÁRIOS
// ============================================

// Formatar data de yyyy-mm para mm/yyyy
const formatarMes = (mes: string): string => {
  const [ano, mesNum] = mes.split('-');
  return `${mesNum}/${ano}`;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function PipelineProjetos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardPipeline | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<StatusPipeline | 'todos'>('todos');
  const [showSimulacao, setShowSimulacao] = useState(false);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // Filtros avançados
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtroPeriodoInicio, setFiltroPeriodoInicio] = useState<Date | undefined>();
  const [filtroPeriodoFim, setFiltroPeriodoFim] = useState<Date | undefined>();
  const [filtroClientes, setFiltroClientes] = useState<string[]>([]);
  const [filtroNomesProjetos, setFiltroNomesProjetos] = useState<string[]>([]);

  // Carregar dashboard
  useEffect(() => {
    carregarDashboard();
  }, [filtroStatus]);

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const filtro = filtroStatus !== 'todos' ? { status: [filtroStatus] } : undefined;
      let data = await PipelineProjetosService.gerarDashboard({ filtro });

      // Aplicar filtros client-side
      data = aplicarFiltrosClientSide(data);

      setDashboard(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard do pipeline',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para aplicar filtros client-side
  const aplicarFiltrosClientSide = (data: DashboardPipeline): DashboardPipeline => {
    let projetosFiltrados = [...data.projetos];

    // Filtro por data (período)
    if (filtroPeriodoInicio || filtroPeriodoFim) {
      projetosFiltrados = projetosFiltrados.filter((projeto) => {
        const dataProjeto = new Date(projeto.createdAt || projeto.dataIdentificacao || '2026-01-01');

        if (filtroPeriodoInicio && dataProjeto < filtroPeriodoInicio) return false;
        if (filtroPeriodoFim && dataProjeto > filtroPeriodoFim) return false;

        return true;
      });
    }

    // Filtro por clientes
    if (filtroClientes.length > 0) {
      projetosFiltrados = projetosFiltrados.filter((projeto) =>
        filtroClientes.includes(projeto.clienteNome)
      );
    }

    // Filtro por nomes de projetos
    if (filtroNomesProjetos.length > 0) {
      projetosFiltrados = projetosFiltrados.filter((projeto) =>
        filtroNomesProjetos.includes(projeto.nome)
      );
    }

    // Recalcular KPIs e funil baseado nos projetos filtrados
    const leads = projetosFiltrados.filter((p) => p.status === 'lead').length;
    const propostas = projetosFiltrados.filter((p) => p.status === 'proposta' || p.status === 'negociacao').length;
    const vendidos = projetosFiltrados.filter((p) => p.status === 'vendido').length;
    const emExecucao = projetosFiltrados.filter((p) => p.status === 'em_execucao').length;
    const concluidos = projetosFiltrados.filter((p) => p.status === 'concluido').length;

    // Calcular taxas de conversão
    const conversaoLeadProposta = leads > 0 ? (propostas / leads) * 100 : 0;
    const conversaoPropostaVenda = propostas > 0 ? (vendidos / propostas) * 100 : 0;
    const conversaoVendaExecucao = vendidos > 0 ? (emExecucao / vendidos) * 100 : 0;
    const conversaoExecucaoConclusao = emExecucao > 0 ? (concluidos / emExecucao) * 100 : 0;

    const funil = {
      leads,
      propostas,
      vendidos,
      emExecucao,
      concluidos,
      conversaoLeadProposta,
      conversaoPropostaVenda,
      conversaoVendaExecucao,
      conversaoExecucaoConclusao,
    };

    const valorTotal = projetosFiltrados.reduce((sum, p) => sum + (p.valorEstimado || 0), 0);
    const horasTotal = projetosFiltrados.reduce((sum, p) => sum + (p.horasEstimadas || 0), 0);

    return {
      ...data,
      projetos: projetosFiltrados,
      funil,
      kpis: {
        ...data.kpis,
        totalProjetos: projetosFiltrados.length,
        valorTotal,
      },
      // Timeline e análise de capacidade permanecem inalteradas
      // pois dependem de cálculos mais complexos
    };
  };

  if (loading || !dashboard) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando pipeline...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Preparar dados do timeline com formato correto
  const timelineData = dashboard.timelineFutura.map(item => ({
    ...item,
    mesFormatado: formatarMes(item.mes),
  }));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pipeline de Projetos</h1>
            <p className="text-muted-foreground">
              Visão estratégica de oportunidades e capacidade produtiva
            </p>
          </div>
        <div className="flex gap-2">
          <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as any)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="lead">Leads</SelectItem>
              <SelectItem value="proposta">Propostas</SelectItem>
              <SelectItem value="negociacao">Em Negociação</SelectItem>
              <SelectItem value="vendido">Vendidos</SelectItem>
              <SelectItem value="em_execucao">Em Execução</SelectItem>
              <SelectItem value="concluido">Concluídos</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowSimulacao(true)}>
            <Zap className="w-4 h-4 mr-2" />
            Simular Projeto
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Leads
            </CardDescription>
            <CardTitle className="text-3xl">{dashboard.kpis.totalLeads}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Taxa conversão: {dashboard.kpis.taxaConversaoLeadProposta.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Propostas
            </CardDescription>
            <CardTitle className="text-3xl">{dashboard.kpis.totalPropostas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Taxa conversão: {dashboard.kpis.taxaConversaoPropostaVenda.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Vendidos
            </CardDescription>
            <CardTitle className="text-3xl">{dashboard.kpis.totalVendidos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(dashboard.kpis.valorVendidoAguardando)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Em Execução
            </CardDescription>
            <CardTitle className="text-3xl">{dashboard.kpis.totalEmExecucao}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(dashboard.kpis.valorEmExecucao)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Financeiro e Capacidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Valor Total do Pipeline
            </CardTitle>
            <CardDescription>Ponderado por probabilidade de fechamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(dashboard.kpis.valorTotalPipeline)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Capacidade Produtiva
            </CardTitle>
            <CardDescription>Utilização prevista nos próximos 3 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                {dashboard.kpis.taxaOcupacaoFutura.toFixed(1)}%
              </div>
              {dashboard.kpis.taxaOcupacaoFutura > 90 ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Gargalo
                </Badge>
              ) : dashboard.kpis.taxaOcupacaoFutura > 70 ? (
                <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                  <Info className="w-3 h-3" />
                  Atenção
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CheckCircle className="w-3 h-3" />
                  Saudável
                </Badge>
              )}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {dashboard.kpis.capacidadeUtilizada.toLocaleString('pt-BR')}h utilizadas de{' '}
              {dashboard.kpis.capacidadeDisponivel.toLocaleString('pt-BR')}h disponíveis
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Avançados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowFiltros(!showFiltros)}>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <CardTitle className="text-lg">Filtros Avançados</CardTitle>
              <Badge variant="outline" className="ml-2">
                {showFiltros ? 'Ocultar' : 'Expandir'}
              </Badge>
            </div>
            <Button variant="ghost" size="sm">
              {showFiltros ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </CardHeader>
        {showFiltros && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Data Início */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data Início
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {filtroPeriodoInicio ? format(filtroPeriodoInicio, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filtroPeriodoInicio}
                      onSelect={setFiltroPeriodoInicio}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data Fim */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data Fim
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {filtroPeriodoFim ? format(filtroPeriodoFim, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filtroPeriodoFim}
                      onSelect={setFiltroPeriodoFim}
                      locale={ptBR}
                      disabled={(date) => filtroPeriodoInicio ? date < filtroPeriodoInicio : false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Clientes (Múltipla Seleção) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Cliente{filtroClientes.length !== 1 ? 's' : ''}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Users className="mr-2 h-4 w-4" />
                      {filtroClientes.length === 0 ? 'Todos' : `${filtroClientes.length} selecionado(s)`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b">
                      <span className="text-sm font-semibold">Selecionar Clientes</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            const todosClientes = [
                              'Logística Express Ltda',
                              'Mineração Norte S.A.',
                              'Indústria Química XYZ',
                              'Indústria Moderna Ltda',
                              'Indústria Tech Solutions',
                              'Metalúrgica do Vale',
                              'Energia Sustentável S.A.',
                            ];
                            setFiltroClientes(todosClientes);
                          }}
                        >
                          Todos
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setFiltroClientes([])}
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {[
                        'Logística Express Ltda',
                        'Mineração Norte S.A.',
                        'Indústria Química XYZ',
                        'Indústria Moderna Ltda',
                        'Indústria Tech Solutions',
                        'Metalúrgica do Vale',
                        'Energia Sustentável S.A.',
                      ].map((cliente) => (
                        <div key={cliente} className="flex items-center space-x-2">
                          <Checkbox
                            id={cliente}
                            checked={filtroClientes.includes(cliente)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFiltroClientes([...filtroClientes, cliente]);
                              } else {
                                setFiltroClientes(filtroClientes.filter((c) => c !== cliente));
                              }
                            }}
                          />
                          <label
                            htmlFor={cliente}
                            className="text-sm font-normal leading-none cursor-pointer flex-1"
                          >
                            {cliente}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Projetos (Múltipla Seleção) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Projeto{filtroNomesProjetos.length !== 1 ? 's' : ''}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {filtroNomesProjetos.length === 0 ? 'Todos' : `${filtroNomesProjetos.length} selecionado(s)`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96" align="start">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b">
                      <span className="text-sm font-semibold">Selecionar Projetos</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            const todosProjetos = dashboard?.projetos.map(p => p.nome) || [];
                            setFiltroNomesProjetos(todosProjetos);
                          }}
                        >
                          Todos
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setFiltroNomesProjetos([])}
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {dashboard?.projetos.map((projeto) => (
                        <div key={projeto.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={projeto.id}
                            checked={filtroNomesProjetos.includes(projeto.nome)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFiltroNomesProjetos([...filtroNomesProjetos, projeto.nome]);
                              } else {
                                setFiltroNomesProjetos(filtroNomesProjetos.filter((p) => p !== projeto.nome));
                              }
                            }}
                          />
                          <label
                            htmlFor={projeto.id}
                            className="text-sm font-normal leading-none cursor-pointer flex-1"
                          >
                            {projeto.nome}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                {filtroClientes.length > 0 || filtroNomesProjetos.length > 0 || filtroPeriodoInicio || filtroPeriodoFim ? (
                  <span className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {filtroClientes.length + filtroNomesProjetos.length + (filtroPeriodoInicio ? 1 : 0) + (filtroPeriodoFim ? 1 : 0)} filtro(s) ativo(s)
                  </span>
                ) : (
                  'Nenhum filtro ativo'
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFiltroPeriodoInicio(undefined);
                    setFiltroPeriodoFim(undefined);
                    setFiltroClientes([]);
                    setFiltroNomesProjetos([]);
                    carregarDashboard();
                  }}
                >
                  Limpar Filtros
                </Button>
                <Button
                  size="sm"
                  onClick={carregarDashboard}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Funil de Conversão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Funil de Conversão
              </CardTitle>
              <CardDescription>Pipeline de vendas e execução</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpandedChart('funil')}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Gráfico Customizado de Barras Horizontais */}
          <div className="space-y-4 py-4">
            {[
              { name: 'Leads', quantidade: dashboard.funil.leads, color: 'bg-gray-300' },
              { name: 'Propostas', quantidade: dashboard.funil.propostas, color: 'bg-blue-300' },
              { name: 'Vendidos', quantidade: dashboard.funil.vendidos, color: 'bg-green-300' },
              { name: 'Em Execução', quantidade: dashboard.funil.emExecucao, color: 'bg-yellow-300' },
              { name: 'Concluídos', quantidade: dashboard.funil.concluidos, color: 'bg-emerald-300' },
            ].map((item) => {
              const maxValue = Math.max(
                dashboard.funil.leads,
                dashboard.funil.propostas,
                dashboard.funil.vendidos,
                dashboard.funil.emExecucao,
                dashboard.funil.concluidos
              );
              const percentage = (item.quantidade / maxValue) * 100;

              return (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-muted-foreground text-right">
                    {item.name}
                  </div>
                  <div className="flex-1 relative group">
                    <div className="h-10 bg-muted/20 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-r-lg transition-all duration-500 ease-out flex items-center justify-end px-3`}
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-sm font-semibold text-gray-900">
                          {item.quantidade}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Taxas de Conversão com Tooltip Explicativo */}
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Taxas de Conversão
              </h4>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      <strong>Taxas de Conversão:</strong> Percentual de projetos que avançaram
                      de um estágio para o próximo no pipeline.
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Exemplo: 80% de Lead → Proposta significa que 8 em cada 10 leads viraram propostas.
                    </p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Lead → Proposta</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {dashboard.funil.propostas} de {dashboard.funil.leads} projetos
                </p>
                <p className="text-xl font-bold">{dashboard.funil.conversaoLeadProposta.toFixed(1)}%</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Proposta → Venda</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {dashboard.funil.vendidos} de {dashboard.funil.propostas} propostas
                </p>
                <p className="text-xl font-bold">{dashboard.funil.conversaoPropostaVenda.toFixed(1)}%</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Venda → Execução</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {dashboard.funil.emExecucao} de {dashboard.funil.vendidos} vendidos
                </p>
                <p className="text-xl font-bold">{dashboard.funil.conversaoVendaExecucao.toFixed(1)}%</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Execução → Conclusão</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {dashboard.funil.concluidos} de {dashboard.funil.emExecucao} em execução
                </p>
                <p className="text-xl font-bold">{dashboard.funil.conversaoExecucaoConclusao.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de Capacidade Futura - GRÁFICO MELHORADO */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline de Capacidade
              </CardTitle>
              <CardDescription>Projeção de utilização por período</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpandedChart('timeline')}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDisponivel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A7F3D0" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#A7F3D0" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorNecessaria" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FED7AA" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#FED7AA" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="mesFormatado"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => `Período: ${value}`}
                formatter={(value: number) => [`${value.toLocaleString('pt-BR')}h`, '']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))',
                  padding: '8px 12px',
                }}
                labelStyle={{
                  color: 'hsl(var(--popover-foreground))',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
                itemStyle={{
                  color: 'hsl(var(--popover-foreground))',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="capacidadeDisponivel"
                name="Capacidade Disponível"
                stroke="#6EE7B7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDisponivel)"
                dot={{ fill: '#6EE7B7', stroke: '#fff', strokeWidth: 2, r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="capacidadeNecessaria"
                name="Capacidade Necessária"
                stroke="#FDBA74"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorNecessaria)"
                dot={{ fill: '#FDBA74', stroke: '#fff', strokeWidth: 2, r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Tabela de Análise de Capacidade */}
          <div className="mt-8 overflow-x-auto rounded-lg border-2 border-border shadow-sm bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-muted/30">
                  <th className="text-left py-4 px-6 text-sm font-bold tracking-wide border-r border-border/40">Período</th>
                  <th className="text-right py-4 px-6 text-sm font-bold tracking-wide border-r border-border/40">Disponível</th>
                  <th className="text-right py-4 px-6 text-sm font-bold tracking-wide border-r border-border/40">Necessária</th>
                  <th className="text-right py-4 px-6 text-sm font-bold tracking-wide border-r border-border/40">Diferença</th>
                  <th className="text-center py-4 px-6 text-sm font-bold tracking-wide border-r border-border/40">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-bold tracking-wide">Recomendação</th>
                </tr>
              </thead>
              <tbody>
                {timelineData.map((item, index) => {
                  const diferenca = item.capacidadeDisponivel - item.capacidadeNecessaria;
                  const utiliz = (item.capacidadeNecessaria / item.capacidadeDisponivel) * 100;
                  // Thresholds ajustados: Sobrecarga >100%, Gargalo >95%, Atenção >85%, OK <=85%
                  const status = utiliz > 100 ? 'Sobrecarga' : utiliz > 95 ? 'Gargalo' : utiliz > 85 ? 'Atenção' : 'OK';

                  // Badges com fundo colorido
                  const statusBadge = utiliz > 100
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-700'
                    : utiliz > 95
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-700'
                    : utiliz > 85
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700';

                  // CONFIGURAÇÃO CCT (Convenção Coletiva de Trabalho - Metalúrgicos)
                  const HORAS_MES_POR_PESSOA = 186; // 44h/semana × ~4.23 semanas (média anual considerando dias úteis)

                  let recomendacao = '';
                  if (utiliz > 100) {
                    // SOBRECARGA: Ação urgente necessária
                    const horasExtras = item.capacidadeNecessaria - item.capacidadeDisponivel;
                    const pessoasAdicionais = Math.ceil(horasExtras / HORAS_MES_POR_PESSOA);
                    recomendacao = `AÇÃO URGENTE: Planejar ${Math.round(horasExtras)}h extras, contratar +${pessoasAdicionais} pessoa(s) (própria ou terceirizada) ou reduzir escopo`;
                  } else if (utiliz > 95) {
                    // GARGALO: Próximo do limite
                    const horasExtras = Math.round(item.capacidadeNecessaria - item.capacidadeDisponivel);
                    recomendacao = `Planejar horas extras (aprox. ${Math.abs(horasExtras)}h), contratar mão de obra adicional ou reduzir escopo`;
                  } else if (utiliz > 85) {
                    // ATENÇÃO: Utilização alta mas controlável
                    recomendacao = 'Monitorar de perto. Preparar plano de contingência (horas extras ou recursos adicionais)';
                  } else {
                    // OK: Capacidade adequada
                    recomendacao = 'Capacidade adequada. Manter monitoramento';
                  }

                  return (
                    <tr
                      key={item.mes}
                      className={`
                        border-b border-border/30
                        transition-colors duration-150
                        hover:bg-muted/40
                        ${index % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'}
                      `}
                    >
                      <td className="py-4 px-6 font-semibold text-base border-r border-border/30">
                        {item.mesFormatado}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-base tabular-nums border-r border-border/30">
                        {item.capacidadeDisponivel.toLocaleString('pt-BR')}h
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-base tabular-nums border-r border-border/30">
                        {Math.round(item.capacidadeNecessaria).toLocaleString('pt-BR')}h
                      </td>
                      <td className={`
                        py-4 px-6 text-right font-bold text-base tabular-nums border-r border-border/30
                        ${diferenca < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                        }
                      `}>
                        {diferenca > 0 ? '+' : ''}{Math.round(diferenca).toLocaleString('pt-BR')}h
                      </td>
                      <td className="py-4 px-6 text-center border-r border-border/30">
                        <span className={`
                          inline-flex items-center justify-center
                          px-3 py-1.5 rounded-full text-xs font-bold tracking-wide
                          ${statusBadge}
                        `}>
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm leading-relaxed text-muted-foreground">
                        {recomendacao}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {dashboard.analiseCapacidadeFutura.mesesComGargalo.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    Gargalos Identificados
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                    Meses críticos (>90% utilização):{' '}
                    {dashboard.analiseCapacidadeFutura.mesesComGargalo.map(formatarMes).join(', ')}
                  </p>
                  {dashboard.analiseCapacidadeFutura.projetosEmRisco.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                        Projetos em risco:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 list-disc list-inside">
                        {dashboard.analiseCapacidadeFutura.projetosEmRisco.map((p) => (
                          <li key={p.projetoId}>
                            {p.nome} - {p.motivo}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Projetos */}
      <Card>
        <CardHeader>
          <CardTitle>Projetos no Pipeline</CardTitle>
          <CardDescription>
            {dashboard.projetos.length} projeto(s) no filtro atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboard.projetos.map((projeto) => (
              <ProjetoCard key={projeto.id} projeto={projeto} onUpdate={carregarDashboard} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Simulação */}
      <SimulacaoDialog
        open={showSimulacao}
        onOpenChange={setShowSimulacao}
        onSuccess={carregarDashboard}
      />

      {/* Dialog de Gráfico Expandido */}
      <ChartExpandDialog
        open={expandedChart !== null}
        onOpenChange={(open) => !open && setExpandedChart(null)}
        chartType={expandedChart}
        dashboard={dashboard}
      />
      </div>
    </Layout>
  );
}

// ============================================
// COMPONENTE: CARD DE PROJETO
// ============================================

interface ProjetoCardProps {
  projeto: ProjetoPipeline;
  onUpdate: () => void;
}

function ProjetoCard({ projeto, onUpdate }: ProjetoCardProps) {
  const { toast } = useToast();

  const handleMoverStatus = async (novoStatus: StatusPipeline) => {
    try {
      await PipelineProjetosService.moverProjeto(projeto.id, novoStatus);
      toast({
        title: 'Sucesso',
        description: `Projeto movido para ${statusLabels[novoStatus]}`,
      });
      onUpdate();
    } catch (error) {
      console.error('Erro ao mover projeto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível mover o projeto',
        variant: 'destructive',
      });
    }
  };

  const getProximoStatus = (): StatusPipeline | null => {
    const fluxo: StatusPipeline[] = [
      'lead',
      'proposta',
      'negociacao',
      'vendido',
      'em_execucao',
      'concluido',
    ];
    const indiceAtual = fluxo.indexOf(projeto.status);
    return indiceAtual >= 0 && indiceAtual < fluxo.length - 1 ? fluxo[indiceAtual + 1] : null;
  };

  const proximoStatus = getProximoStatus();

  return (
    <div className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">{projeto.nome}</h4>
            <Badge className={statusColors[projeto.status]}>
              {statusLabels[projeto.status]}
            </Badge>
            <Badge variant="outline" className={prioridadeColors[projeto.prioridade]}>
              {projeto.prioridade}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Cliente</p>
              <p className="font-medium">{projeto.clienteNome}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Valor</p>
              <p className="font-medium">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(projeto.valorEstimado)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Horas Estimadas</p>
              <p className="font-medium">{projeto.horasEstimadas}h</p>
            </div>
            {projeto.probabilidadeFechamento !== undefined && (
              <div>
                <p className="text-muted-foreground">Probabilidade</p>
                <p className="font-medium">{projeto.probabilidadeFechamento}%</p>
              </div>
            )}
          </div>

          {projeto.analiseCapacidade && (
            <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm">
              <div className="flex items-center gap-2 mb-1">
                {projeto.analiseCapacidade.viavel ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium">
                  {projeto.analiseCapacidade.viavel ? 'Viável' : 'Não Viável'}
                </span>
                <span className="text-muted-foreground">
                  (Taxa: {projeto.analiseCapacidade.taxaUtilizacaoResultante.toFixed(1)}%)
                </span>
              </div>
              <p className="text-muted-foreground">{projeto.analiseCapacidade.mensagem}</p>
            </div>
          )}
        </div>

        {proximoStatus && (
          <Button
            size="sm"
            onClick={() => handleMoverStatus(proximoStatus)}
            className="ml-4"
          >
            <ArrowRight className="w-4 h-4 mr-1" />
            {statusLabels[proximoStatus]}
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: DIALOG DE SIMULAÇÃO
// ============================================

interface SimulacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function SimulacaoDialog({ open, onOpenChange, onSuccess }: SimulacaoDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);

  const [form, setForm] = useState<SimulacaoNovoProjeto>({
    projetoNome: '',
    horasEstimadas: 0,
    dataInicioDesejada: '',
    dataFimDesejada: '',
    valorEstimado: 0,
    resultado: {} as ResultadoSimulacao,
  });

  const handleSimular = async () => {
    if (!form.projetoNome || !form.horasEstimadas || !form.dataInicioDesejada) {
      toast({
        title: 'Atenção',
        description: 'Preencha os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const res = await PipelineProjetosService.simularNovoProjeto(form);
      setResultado(res);
    } catch (error) {
      console.error('Erro ao simular projeto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível simular o projeto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarAoPipeline = async () => {
    if (!resultado?.viavel) {
      toast({
        title: 'Atenção',
        description: 'Apenas projetos viáveis podem ser adicionados ao pipeline',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Funcionalidade em Desenvolvimento',
      description: 'Em breve você poderá adicionar projetos simulados ao pipeline',
    });

    // TODO: Implementar criação de projeto no pipeline
    // await PipelineProjetosService.criarProjeto({ ... });
  };

  const handleFechar = () => {
    setForm({
      projetoNome: '',
      horasEstimadas: 0,
      dataInicioDesejada: '',
      dataFimDesejada: '',
      valorEstimado: 0,
      resultado: {} as ResultadoSimulacao,
    });
    setResultado(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Simular Novo Projeto
          </DialogTitle>
          <DialogDescription>
            Verificar se há capacidade produtiva para aceitar este projeto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="projetoNome">Nome do Projeto *</Label>
              <Input
                id="projetoNome"
                value={form.projetoNome}
                onChange={(e) => setForm({ ...form, projetoNome: e.target.value })}
                placeholder="Ex: Estrutura Metálica - Cliente XYZ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horasEstimadas">Horas Estimadas *</Label>
              <Input
                id="horasEstimadas"
                type="number"
                value={form.horasEstimadas || ''}
                onChange={(e) =>
                  setForm({ ...form, horasEstimadas: parseFloat(e.target.value) || 0 })
                }
                placeholder="Ex: 500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorEstimado">Valor Estimado (R$)</Label>
              <Input
                id="valorEstimado"
                type="number"
                value={form.valorEstimado || ''}
                onChange={(e) =>
                  setForm({ ...form, valorEstimado: parseFloat(e.target.value) || 0 })
                }
                placeholder="Ex: 150000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataInicioDesejada">Data de Início Desejada *</Label>
              <Input
                id="dataInicioDesejada"
                type="date"
                value={form.dataInicioDesejada}
                onChange={(e) => setForm({ ...form, dataInicioDesejada: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFimDesejada">Data de Fim Desejada</Label>
              <Input
                id="dataFimDesejada"
                type="date"
                value={form.dataFimDesejada}
                onChange={(e) => setForm({ ...form, dataFimDesejada: e.target.value })}
              />
            </div>
          </div>

          {resultado && (
            <>
              <Separator />
              <div
                className={`p-4 rounded-lg border ${
                  resultado.viavel
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {resultado.viavel ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                  <h4 className="font-semibold text-lg">
                    {resultado.viavel ? 'Projeto Viável!' : 'Projeto Inviável'}
                  </h4>
                </div>

                <p className="text-sm mb-4">{resultado.mensagem}</p>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Utilização Atual</p>
                    <p className="font-semibold">{resultado.taxaUtilizacaoAtual.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Com Novo Projeto</p>
                    <p className="font-semibold">{resultado.taxaUtilizacaoComNovo.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Impacto</p>
                    <p className="font-semibold flex items-center gap-1">
                      {resultado.impacto > 0 && '+'}
                      {resultado.impacto.toFixed(1)}%
                      {resultado.impacto > 0 ? (
                        <TrendingUp className="w-4 h-4 text-red-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      )}
                    </p>
                  </div>
                </div>

                {resultado.dataIdealInicio && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                    <p className="text-sm">
                      <strong>Data ideal para início:</strong>{' '}
                      {new Date(resultado.dataIdealInicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                {resultado.alternativas.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-semibold text-sm mb-2">Alternativas:</h5>
                    <div className="space-y-2">
                      {resultado.alternativas.map((alt, idx) => (
                        <div key={idx} className="text-sm p-2 bg-white dark:bg-slate-900 rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{alt.tipo}</span>
                            <Badge variant={alt.viavel ? 'outline' : 'destructive'}>
                              {alt.viavel ? 'Viável' : 'Inviável'}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{alt.descricao}</p>
                          {alt.custoEstimado && (
                            <p className="text-xs mt-1">
                              Custo estimado:{' '}
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(alt.custoEstimado)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleFechar}>
            Fechar
          </Button>
          {resultado?.viavel && (
            <Button onClick={handleAdicionarAoPipeline} variant="secondary">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar ao Pipeline
            </Button>
          )}
          <Button onClick={handleSimular} disabled={loading}>
            {loading ? 'Simulando...' : 'Simular'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// COMPONENTE: DIALOG DE GRÁFICO EXPANDIDO
// ============================================

interface ChartExpandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chartType: string | null;
  dashboard: DashboardPipeline | null;
}

function ChartExpandDialog({ open, onOpenChange, chartType, dashboard }: ChartExpandDialogProps) {
  if (!dashboard) return null;

  const timelineData = dashboard.timelineFutura.map(item => ({
    ...item,
    mesFormatado: formatarMes(item.mes),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {chartType === 'funil' ? 'Funil de Conversão' : 'Timeline de Capacidade'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {chartType === 'funil' ? (
            <div className="space-y-6 p-6">
              {[
                { name: 'Leads', quantidade: dashboard.funil.leads, color: 'bg-gray-300' },
                { name: 'Propostas', quantidade: dashboard.funil.propostas, color: 'bg-blue-300' },
                { name: 'Vendidos', quantidade: dashboard.funil.vendidos, color: 'bg-green-300' },
                { name: 'Em Execução', quantidade: dashboard.funil.emExecucao, color: 'bg-yellow-300' },
                { name: 'Concluídos', quantidade: dashboard.funil.concluidos, color: 'bg-emerald-300' },
              ].map((item) => {
                const maxValue = Math.max(
                  dashboard.funil.leads,
                  dashboard.funil.propostas,
                  dashboard.funil.vendidos,
                  dashboard.funil.emExecucao,
                  dashboard.funil.concluidos
                );
                const percentage = (item.quantidade / maxValue) * 100;

                return (
                  <div key={item.name} className="flex items-center gap-6">
                    <div className="w-40 text-base font-medium text-muted-foreground text-right">
                      {item.name}
                    </div>
                    <div className="flex-1 relative group">
                      <div className="h-14 bg-muted/20 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-r-lg transition-all duration-500 ease-out flex items-center justify-end px-4`}
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-base font-semibold text-gray-900">
                            {item.quantidade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDisponivelExpanded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="colorNecessariaExpanded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FDBA74" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#FDBA74" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="mesFormatado"
                  tick={{ fontSize: 14 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => `Período: ${value}`}
                  formatter={(value: number) => [`${value.toLocaleString('pt-BR')}h`, '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                    padding: '8px 12px',
                  }}
                  labelStyle={{
                    color: 'hsl(var(--popover-foreground))',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                  itemStyle={{
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="capacidadeDisponivel"
                  name="Capacidade Disponível"
                  stroke="#34D399"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorDisponivelExpanded)"
                  dot={{ fill: '#34D399', stroke: '#fff', strokeWidth: 2, r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="capacidadeNecessaria"
                  name="Capacidade Necessária"
                  stroke="#FB923C"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  fillOpacity={1}
                  fill="url(#colorNecessariaExpanded)"
                  dot={{ fill: '#FB923C', stroke: '#fff', strokeWidth: 2, r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
