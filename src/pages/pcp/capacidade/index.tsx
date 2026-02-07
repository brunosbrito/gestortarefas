/**
 * FASE 3 PCP: Dashboard de Capacidade Produtiva Multi-Projeto
 * Visualização completa de capacidade de recursos, gargalos e conflitos
 * Sistema: Gestor Master - GMX Soluções Industriais
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  DollarSign,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Factory,
  Target,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Maximize2,
  FileText,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import CapacidadeProdutivaService from '@/services/CapacidadeProdutivaService';
import {
  DashboardCapacidade,
  AnaliseCapacidadeRecurso,
  SimulacaoNovoProjeto,
} from '@/interfaces/CapacidadeInterface';

// ============================================
// HELPERS
// ============================================

/**
 * CORREÇÃO IMPORTANTE #5: Formatação monetária compacta compatível com browsers antigos
 * (Safari < 14.1, Firefox < 77 não suportam notation: 'compact')
 */
const formatarMonetarioCompacto = (valor: number): string => {
  if (valor >= 1000000) {
    return `R$ ${(valor / 1000000).toFixed(1)}M`;
  }
  if (valor >= 1000) {
    return `R$ ${(valor / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function DashboardCapacidadePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardCapacidade | null>(null);
  const [expandedRecursos, setExpandedRecursos] = useState<Set<number>>(new Set());
  const [simuladorOpen, setSimuladorOpen] = useState(false);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // Estados do simulador
  const [simNomeProjeto, setSimNomeProjeto] = useState('');
  const [simHorasEstimadas, setSimHorasEstimadas] = useState<number>(0);
  const [simDataInicio, setSimDataInicio] = useState('');
  const [simDataFim, setSimDataFim] = useState('');
  const [simulacaoResultado, setSimulacaoResultado] = useState<SimulacaoNovoProjeto | null>(null);
  const [simulando, setSimulando] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await CapacidadeProdutivaService.gerarDashboard();
      setDashboard(dashboardData);
    } catch (error) {
      console.error('[Capacidade Dashboard] Erro ao carregar:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      toast({
        title: 'Erro',
        description:
          error instanceof Error
            ? `Não foi possível carregar os dados de capacidade: ${error.message}`
            : 'Não foi possível carregar os dados de capacidade',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRecurso = (recursoId: number) => {
    setExpandedRecursos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recursoId)) {
        newSet.delete(recursoId);
      } else {
        newSet.add(recursoId);
      }
      return newSet;
    });
  };

  const handleSimular = async () => {
    if (!simNomeProjeto || simHorasEstimadas <= 0 || !simDataInicio || !simDataFim) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos para simular',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSimulando(true);
      const resultado = await CapacidadeProdutivaService.simularNovoProjeto(
        simNomeProjeto,
        simHorasEstimadas,
        simDataInicio,
        simDataFim
      );
      setSimulacaoResultado(resultado);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível simular o projeto',
        variant: 'destructive',
      });
    } finally {
      setSimulando(false);
    }
  };

  const handleResetSimulador = () => {
    setSimNomeProjeto('');
    setSimHorasEstimadas(0);
    setSimDataInicio('');
    setSimDataFim('');
    setSimulacaoResultado(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Card>
            <CardContent className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!dashboard) {
    return (
      <Layout>
        <div className="space-y-6">
          <Card>
            <CardContent className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Preparar dados para gráficos
  const dadosRecursosPorTipo = dashboard.analiseConsolidada.recursosPorTipo.map((r) => ({
    name: r.tipo === 'colaborador' ? 'Colaborador' : r.tipo === 'maquina' ? 'Máquina' : r.tipo,
    quantidade: r.quantidade,
    utilizacao: r.taxaUtilizacao,
  }));

  const CORES_TIPOS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6'];

  const dadosTimeline = dashboard.timeline.map((t) => ({
    data: new Date(t.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    Disponível: t.horasDisponiveis,
    Alocado: t.horasAlocadas,
    Utilização: t.taxaUtilizacao,
  }));

  const dadosCentrosTrabalho = dashboard.capacidadePorCentro.map((c) => ({
    name: c.centroTrabalhoNome.replace('Setor de ', '').replace('Setor', ''),
    Capacidade: c.capacidadeTotal,
    Demanda: c.demandaTotal,
    Utilização: c.taxaUtilizacao,
    ehGargalo: c.ehGargalo,
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
            <h1 className="text-3xl font-bold">Capacidade Produtiva</h1>
            <p className="text-muted-foreground mt-1">
              Análise consolidada multi-projeto de recursos e gargalos
            </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setSimuladorOpen(true)}>
            <Target className="w-4 h-4 mr-2" />
            Simular Novo Projeto
          </Button>
          <Button variant="outline" onClick={loadDashboard}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Taxa de Utilização Geral */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Taxa de Utilização Geral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboard.kpis.taxaUtilizacaoGeral.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboard.kpis.taxaUtilizacaoGeral > 90
                  ? '⚠️ Capacidade crítica'
                  : dashboard.kpis.taxaUtilizacaoGeral > 70
                  ? '✅ Utilização ideal'
                  : '🔵 Capacidade disponível'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gargalos Detectados */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`border-l-4 ${dashboard.kpis.quantidadeGargalos > 0 ? 'border-l-red-500 border-red-200 dark:border-red-900' : 'border-l-orange-500'}`}>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Gargalos Detectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboard.kpis.quantidadeGargalos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboard.kpis.percentualSobrecarregados.toFixed(1)}% dos recursos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Horas Extras Necessárias */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horas Extras Necessárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboard.kpis.horasExtrasTotais.toFixed(0)}h</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboard.analiseConsolidada.gargalos.length} recurso(s) sobrecarregado(s)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Custo Estimado Horas Extras */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Custo Horas Extras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatarMonetarioCompacto(dashboard.kpis.custoHorasExtras)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Estimativa com adicional 50%</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* KPIs Secundários - Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recursos Ociosos</p>
                <p className="text-2xl font-bold">{dashboard.kpis.recursosOciosos}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Utilização &lt; 50%</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilização Ideal</p>
                <p className="text-2xl font-bold">{dashboard.kpis.recursosUtilizacaoIdeal}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Entre 50-90%</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sobrecarregados</p>
                <p className="text-2xl font-bold">{dashboard.kpis.recursosSobrecarregados}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Utilização &gt; 90%</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Recursos por Tipo (PieChart) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recursos por Tipo</CardTitle>
                <CardDescription>Distribuição e utilização média por tipo de recurso</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpandedChart('recursos-tipo')}
                title="Expandir gráfico"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosRecursosPorTipo}
                  dataKey="quantidade"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.quantidade}`}
                >
                  {dadosRecursosPorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_TIPOS[index % CORES_TIPOS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 2: Timeline de Capacidade (LineChart) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Timeline de Capacidade</CardTitle>
                <CardDescription>Evolução de horas disponíveis vs alocadas (semanal)</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpandedChart('timeline')}
                title="Expandir gráfico"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Disponível" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Alocado" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico 3: Capacidade por Centro de Trabalho (BarChart) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Capacidade por Centro de Trabalho</CardTitle>
              <CardDescription>Comparativo de capacidade total vs demanda por centro</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpandedChart('centros-trabalho')}
              title="Expandir gráfico"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={dadosCentrosTrabalho}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                style={{ fontSize: '12px' }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Capacidade" fill="#3b82f6" />
              <Bar dataKey="Demanda" fill="#f97316">
                {dadosCentrosTrabalho.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.ehGargalo ? '#ef4444' : '#f97316'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Recursos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recursos Produtivos</CardTitle>
              <CardDescription>
                Detalhamento de capacidade e alocação por recurso individual
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" title="Exportar PDF">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" title="Exportar Excel">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Horas Disponíveis</TableHead>
                <TableHead className="text-center">Horas Alocadas</TableHead>
                <TableHead className="text-center">Utilização</TableHead>
                <TableHead className="text-center">Projetos</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.analiseConsolidada.analisesPorRecurso.map((analise) => (
                <>
                  <TableRow key={analise.recurso.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleRecurso(analise.recurso.id)}
                      >
                        {expandedRecursos.has(analise.recurso.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{analise.recurso.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{analise.recurso.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{analise.horasDisponiveis}h</TableCell>
                    <TableCell className="text-center">{analise.horasAlocadas.toFixed(0)}h</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          analise.taxaUtilizacao > 90
                            ? 'destructive'
                            : analise.taxaUtilizacao > 70
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {analise.taxaUtilizacao.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{analise.quantidadeProjetos}</TableCell>
                    <TableCell className="text-center">
                      {analise.ehGargalo ? (
                        <Badge variant="destructive">Gargalo</Badge>
                      ) : analise.taxaUtilizacao < 50 ? (
                        <Badge variant="secondary">Ocioso</Badge>
                      ) : (
                        <Badge variant="outline">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedRecursos.has(analise.recurso.id) && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/20 p-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Horas Livres</p>
                              <p className="text-lg font-semibold">{analise.horasLivres.toFixed(0)}h</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Centro de Trabalho</p>
                              <p className="text-lg font-semibold">
                                {
                                  dashboard.analiseConsolidada.centrosTrabalho.find(
                                    (ct) => ct.recursosIds.includes(analise.recurso.id)
                                  )?.nome || 'N/A'
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Valor/Hora</p>
                              <p className="text-lg font-semibold">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(analise.recurso.valorHora || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Conflitos</p>
                              <p className="text-lg font-semibold">{analise.conflitos.length}</p>
                            </div>
                          </div>

                          {analise.sugestoes.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-2">Sugestões:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {analise.sugestoes.map((sugestao, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground">
                                    {sugestao}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {analise.demandaPorPeriodo.length > 0 && analise.demandaPorPeriodo[0] && (
                            <div>
                              <p className="text-sm font-semibold mb-2">Projetos Demandantes:</p>
                              <div className="flex flex-wrap gap-2">
                                {/* CORREÇÃO IMPORTANTE #3: Adicionar validação com optional chaining */}
                                {analise.demandaPorPeriodo[0]?.projetosDemandantes?.map((p) => (
                                  <Badge key={p.projetoId} variant="outline">
                                    {p.projetoNome} ({p.horasDemandadas.toFixed(0)}h)
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Recursos (2 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mais Utilizados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top 10 Recursos Mais Utilizados
                </CardTitle>
                <CardDescription>Recursos com maior taxa de alocação</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" title="Exportar PDF">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" title="Exportar Excel">
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.recursosTopUtilizacao.map((recurso, idx) => (
                <div key={recurso.recursoId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-muted-foreground">#{idx + 1}</span>
                    <div>
                      <p className="font-medium">{recurso.recursoNome}</p>
                      <p className="text-xs text-muted-foreground">
                        {recurso.horasAlocadas.toFixed(0)}h • {recurso.quantidadeProjetos} projeto(s)
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      recurso.taxaUtilizacao > 90
                        ? 'destructive'
                        : recurso.taxaUtilizacao > 70
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {recurso.taxaUtilizacao.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ociosos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Recursos Ociosos
                </CardTitle>
                <CardDescription>Recursos com baixa utilização (&lt;50%)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" title="Exportar PDF">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" title="Exportar Excel">
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {dashboard.recursosOciosos.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recursosOciosos.map((recurso, idx) => (
                  <div key={recurso.recursoId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-muted-foreground">#{idx + 1}</span>
                      <div>
                        <p className="font-medium">{recurso.recursoNome}</p>
                        <p className="text-xs text-muted-foreground">
                          {recurso.horasLivres.toFixed(0)}h disponíveis
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{recurso.taxaUtilizacao.toFixed(1)}%</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum recurso ocioso detectado
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Expansão de Gráficos */}
      <Dialog open={expandedChart !== null} onOpenChange={(open) => !open && setExpandedChart(null)}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              {expandedChart === 'recursos-tipo'
                ? 'Recursos por Tipo'
                : expandedChart === 'timeline'
                ? 'Timeline de Capacidade'
                : 'Capacidade por Centro de Trabalho'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {expandedChart === 'recursos-tipo' && (
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={dadosRecursosPorTipo}
                    dataKey="quantidade"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={(entry) => `${entry.name}: ${entry.quantidade}`}
                  >
                    {dadosRecursosPorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_TIPOS[index % CORES_TIPOS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            {expandedChart === 'timeline' && (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={dadosTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Disponível" stroke="#3b82f6" strokeWidth={3} />
                  <Line type="monotone" dataKey="Alocado" stroke="#f97316" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
            {expandedChart === 'centros-trabalho' && (
              <ResponsiveContainer width="100%" height={600}>
                <BarChart data={dadosCentrosTrabalho}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    style={{ fontSize: '14px' }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Capacidade" fill="#3b82f6" />
                  <Bar dataKey="Demanda" fill="#f97316">
                    {dadosCentrosTrabalho.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.ehGargalo ? '#ef4444' : '#f97316'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Simulador */}
      <Dialog open={simuladorOpen} onOpenChange={setSimuladorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Simulador de Novo Projeto
            </DialogTitle>
            <DialogDescription>
              Simule o impacto de adicionar um novo projeto à capacidade atual
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomeProjeto">Nome do Projeto</Label>
                <Input
                  id="nomeProjeto"
                  value={simNomeProjeto}
                  onChange={(e) => setSimNomeProjeto(e.target.value)}
                  placeholder="Ex: Galpão Logístico"
                />
              </div>
              <div>
                <Label htmlFor="horasEstimadas">Horas Estimadas</Label>
                <Input
                  id="horasEstimadas"
                  type="number"
                  value={simHorasEstimadas || ''}
                  onChange={(e) => setSimHorasEstimadas(Number(e.target.value))}
                  placeholder="Ex: 500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={simDataInicio}
                  onChange={(e) => setSimDataInicio(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dataFim">Data de Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={simDataFim}
                  onChange={(e) => setSimDataFim(e.target.value)}
                />
              </div>
            </div>

            {/* Resultado da Simulação */}
            {simulacaoResultado && (
              <Card className={simulacaoResultado.viavel ? 'border-green-500' : 'border-red-500'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {simulacaoResultado.viavel ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    {simulacaoResultado.viavel ? 'Projeto Viável' : 'Projeto Não Viável'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{simulacaoResultado.mensagem}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Utilização Resultante</p>
                      <p className="text-2xl font-bold">
                        {simulacaoResultado.taxaUtilizacaoResultante.toFixed(1)}%
                      </p>
                    </div>
                    {simulacaoResultado.dataIdealInicio && (
                      <div>
                        <p className="text-sm text-muted-foreground">Data Ideal para Início</p>
                        <p className="text-lg font-semibold">
                          {new Date(simulacaoResultado.dataIdealInicio).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {simulacaoResultado.gargalosCriados.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Gargalos Criados:</p>
                      <div className="space-y-2">
                        {simulacaoResultado.gargalosCriados.map((gargalo) => (
                          <div key={gargalo.recursoId} className="text-sm">
                            {gargalo.recursoNome}: {gargalo.taxaUtilizacaoAtual.toFixed(1)}% →{' '}
                            {gargalo.taxaUtilizacaoFutura.toFixed(1)}%
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {simulacaoResultado.sugestoes.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Sugestões:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {simulacaoResultado.sugestoes.map((sugestao, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            {sugestao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleResetSimulador}>
              Limpar
            </Button>
            <Button onClick={handleSimular} disabled={simulando}>
              {simulando ? 'Simulando...' : 'Simular'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
}
