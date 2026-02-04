/**
 * FASE 4 PCP: Pipeline de Projetos
 * MPS adaptado para ETO (Engineer To Order) - Projetos Únicos
 * Sistema: Gestor Master - GMX Soluções Industriais
 */

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardPipeline | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<StatusPipeline | 'todos'>('todos');
  const [showSimulacao, setShowSimulacao] = useState(false);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // Carregar dashboard
  useEffect(() => {
    carregarDashboard();
  }, [filtroStatus]);

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const filtro = filtroStatus !== 'todos' ? { status: [filtroStatus] } : undefined;
      const data = await PipelineProjetosService.gerarDashboard({ filtro });
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

  if (loading || !dashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pipeline...</p>
        </div>
      </div>
    );
  }

  // Preparar dados do timeline com formato correto
  const timelineData = dashboard.timelineFutura.map(item => ({
    ...item,
    mesFormatado: formatarMes(item.mes),
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
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
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
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
        <Card>
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

        <Card>
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Leads', quantidade: dashboard.funil.leads, fill: '#D1D5DB' },
                { name: 'Propostas', quantidade: dashboard.funil.propostas, fill: '#93C5FD' },
                { name: 'Vendidos', quantidade: dashboard.funil.vendidos, fill: '#86EFAC' },
                { name: 'Em Execução', quantidade: dashboard.funil.emExecucao, fill: '#FCD34D' },
                { name: 'Concluídos', quantidade: dashboard.funil.concluidos, fill: '#6EE7B7' },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" radius={[8, 8, 0, 0]}>
                {[
                  { name: 'Leads', fill: '#D1D5DB' },
                  { name: 'Propostas', fill: '#93C5FD' },
                  { name: 'Vendidos', fill: '#86EFAC' },
                  { name: 'Em Execução', fill: '#FCD34D' },
                  { name: 'Concluídos', fill: '#6EE7B7' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

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
                  <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="colorNecessaria" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FDBA74" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#FDBA74" stopOpacity={0.7}/>
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
                stroke="#34D399"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDisponivel)"
                dot={{ fill: '#34D399', stroke: '#fff', strokeWidth: 2, r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="capacidadeNecessaria"
                name="Capacidade Necessária"
                stroke="#FB923C"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorNecessaria)"
                dot={{ fill: '#FB923C', stroke: '#fff', strokeWidth: 2, r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>

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
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={[
                  { name: 'Leads', quantidade: dashboard.funil.leads, fill: '#D1D5DB' },
                  { name: 'Propostas', quantidade: dashboard.funil.propostas, fill: '#93C5FD' },
                  { name: 'Vendidos', quantidade: dashboard.funil.vendidos, fill: '#86EFAC' },
                  { name: 'Em Execução', quantidade: dashboard.funil.emExecucao, fill: '#FCD34D' },
                  { name: 'Concluídos', quantidade: dashboard.funil.concluidos, fill: '#6EE7B7' },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" radius={[8, 8, 0, 0]}>
                  {[
                    { name: 'Leads', fill: '#D1D5DB' },
                    { name: 'Propostas', fill: '#93C5FD' },
                    { name: 'Vendidos', fill: '#86EFAC' },
                    { name: 'Em Execução', fill: '#FCD34D' },
                    { name: 'Concluídos', fill: '#6EE7B7' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
