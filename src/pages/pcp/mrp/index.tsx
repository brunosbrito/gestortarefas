/**
 * FASE 2 PCP: Dashboard MRP - Material Requirements Planning
 * Cálculo de necessidades multi-projeto com consolidação e pegging
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  GitMerge,
  ShoppingCart,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Download,
  ArrowLeft,
  Maximize2,
  FileText,
  BarChart3,
  Filter,
  Info,
  Eye,
  ExternalLink,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import MRPService from '@/services/MRPService';
import {
  DashboardMRP,
  RelatorioMRP,
  NecessidadeConsolidada,
  SugestaoCompra,
} from '@/interfaces/MRPInterface';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

export default function DashboardMRPPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardMRP | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioMRP | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedProjetos, setSelectedProjetos] = useState<string[]>([]);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [origemDialogOpen, setOrigemDialogOpen] = useState<string | null>(null);

  // Filtros para "Necessidades por Projeto"
  const [filtroProjetosPorProjeto, setFiltroProjetosPorProjeto] = useState<string[]>([]);
  const [filtroStatusProjeto, setFiltroStatusProjeto] = useState<'todos' | 'com_falta' | 'sem_falta'>('todos');

  // Filtros para "Top 10 - Itens Mais Críticos"
  const [filtroProjetosTop10, setFiltroProjetosTop10] = useState<string[]>([]);
  const [filtroValorMinimo, setFiltroValorMinimo] = useState<number>(0);

  // Carrega dados do dashboard
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await MRPService.gerarDashboard();
      const relatorioData = await MRPService.gerarRelatorio({ consolidar: true });
      setDashboard(dashboardData);
      setRelatorio(relatorioData);
    } catch (error) {
      console.error('[MRP Dashboard] Erro ao carregar:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      toast({
        title: 'Erro',
        description: error instanceof Error
          ? `Não foi possível carregar os dados do MRP: ${error.message}`
          : 'Não foi possível carregar os dados do MRP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRow = (codigo: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(codigo)) {
        newSet.delete(codigo);
      } else {
        newSet.add(codigo);
      }
      return newSet;
    });
  };

  const handleGerarRequisicoes = async (sugestoes: SugestaoCompra[]) => {
    try {
      const resultado = await MRPService.gerarRequisicoesDeCompra(sugestoes);

      if (resultado.success) {
        toast({
          title: 'Requisições Geradas!',
          description: (
            <div className="space-y-2">
              <p>{resultado.requisicoes.length} requisições de compra foram criadas no módulo de Suprimentos</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => navigate('/suprimentos/requisicoes')}
              >
                Visualizar Requisições
              </Button>
            </div>
          ),
        });
        // Recarrega dashboard para atualizar estado
        await loadDashboard();
      } else {
        toast({
          title: 'Erro Parcial',
          description: `${resultado.requisicoes.length} requisições criadas com sucesso. ${resultado.errors.length} erros encontrados.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar requisições',
        variant: 'destructive',
      });
    }
  };

  const handleExportarExcel = () => {
    toast({
      title: 'Exportação iniciada',
      description: 'Relatório MRP será baixado em instantes',
    });
    // TODO: Implementar exportação Excel
  };

  if (loading || !dashboard || !relatorio) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Filtrar necessidades por projetos selecionados
  const necessidadesFiltradas =
    selectedProjetos.length === 0
      ? relatorio.necessidadesConsolidadas || []
      : (relatorio.necessidadesConsolidadas || []).filter((n) =>
          n.projetosOrigem.some((p) => selectedProjetos.includes(p.projetoId.toString()))
        );

  // Dados para gráficos
  const dadosClasseABC = [
    {
      name: 'Classe A',
      quantidade: dashboard.porClasseABC.classeA.quantidade,
      valor: dashboard.porClasseABC.classeA.valor,
      percentual: dashboard.porClasseABC.classeA.percentualValor,
    },
    {
      name: 'Classe B',
      quantidade: dashboard.porClasseABC.classeB.quantidade,
      valor: dashboard.porClasseABC.classeB.valor,
      percentual: dashboard.porClasseABC.classeB.percentualValor,
    },
    {
      name: 'Classe C',
      quantidade: dashboard.porClasseABC.classeC.quantidade,
      valor: dashboard.porClasseABC.classeC.valor,
      percentual: dashboard.porClasseABC.classeC.percentualValor,
    },
  ];

  const coresABC = ['#FF7F0E', '#1F77B4', '#2CA02C'];

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
            <h1 className="text-3xl font-bold">MRP - Planejamento de Materiais</h1>
            <p className="text-muted-foreground mt-1">
              Análise consolidada de necessidades multi-projeto
            </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadDashboard}>
            Atualizar
          </Button>
          <Button disabled onClick={handleExportarExcel} title="Em desenvolvimento">
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Materiais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Total de Materiais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboard.kpis.totalMateriaisNecessarios}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboard.kpis.quantidadeProjetos} projetos ativos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Itens em Falta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Itens em Falta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboard.kpis.itensEmFalta}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {(dashboard.kpis.percentualFalta || 0).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Valor Total de Compras */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor Total Necessário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                }).format(dashboard.kpis.valorTotalCompras)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboard.kpis.sugestoesPendentes} sugestões pendentes
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conflitos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <GitMerge className="w-4 h-4" />
                Conflitos entre Projetos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboard.kpis.conflitosAtivos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Materiais disputados
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown por Classe ABC */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Breakdown por Classe ABC
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2 text-xs">
                          <p className="font-semibold">Como é calculado:</p>
                          <p>• Classe A: 80% do valor (alta criticidade)</p>
                          <p>• Classe B: 15% do valor (média criticidade)</p>
                          <p>• Classe C: 5% do valor (baixa criticidade)</p>
                          <p className="text-muted-foreground mt-2">
                            Baseado em Service Orders + BOM + Estoque
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription>
                  Distribuição de valor por classificação
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOrigemDialogOpen('abc')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Origem
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpandedChart('abc')}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosClasseABC}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.percentual.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {dadosClasseABC.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={coresABC[index % coresABC.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(value)
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Timeline de Necessidades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timeline de Necessidades
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2 text-xs">
                          <p className="font-semibold">Como é calculado:</p>
                          <p>1. Sistema lê Service Orders ativas</p>
                          <p>2. Explode BOM de cada orçamento</p>
                          <p>3. Consulta estoque no almoxarifado</p>
                          <p>4. Projeta necessidades dos próximos 90 dias</p>
                          <p className="text-muted-foreground mt-2">
                            Dados atualizados em tempo real
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription>
                  Próximos 90 dias
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOrigemDialogOpen('timeline')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Origem
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpandedChart('timeline')}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard.timelineNecessidades}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="data"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                />
                <YAxis />
                <RechartsTooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value: number) =>
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(value)
                  }
                />
                <Line
                  type="monotone"
                  dataKey="valorTotal"
                  stroke="#FF7F0E"
                  strokeWidth={2}
                  name="Valor Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown por Projeto - BARRAS HORIZONTAIS */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Necessidades por Projeto</CardTitle>
              <CardDescription>
                Distribuição de materiais necessários por projeto
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Filtros */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Filtrar Projetos</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {dashboard.porProjeto.map((projeto) => (
                          <div key={projeto.projetoId} className="flex items-center space-x-2">
                            <Checkbox
                              id={`projeto-filter-${projeto.projetoId}`}
                              checked={filtroProjetosPorProjeto.includes(projeto.projetoId.toString())}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFiltroProjetosPorProjeto([...filtroProjetosPorProjeto, projeto.projetoId.toString()]);
                                } else {
                                  setFiltroProjetosPorProjeto(filtroProjetosPorProjeto.filter((id) => id !== projeto.projetoId.toString()));
                                }
                              }}
                            />
                            <label
                              htmlFor={`projeto-filter-${projeto.projetoId}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {projeto.projetoNome}
                            </label>
                          </div>
                        ))}
                      </div>
                      {filtroProjetosPorProjeto.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => setFiltroProjetosPorProjeto([])}
                        >
                          Limpar seleção
                        </Button>
                      )}
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">Status</h4>
                      <Select
                        value={filtroStatusProjeto}
                        onValueChange={(value: any) => setFiltroStatusProjeto(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Projetos</SelectItem>
                          <SelectItem value="com_falta">Com Falta de Material</SelectItem>
                          <SelectItem value="sem_falta">Sem Falta de Material</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Exportar */}
              <Button variant="outline" size="sm" title="Exportar PDF">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" title="Exportar Excel">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>

              {/* Expandir */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpandedChart('projeto')}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Gráfico Customizado de Barras Horizontais */}
          <div className="space-y-4 py-4">
            {dashboard.porProjeto
              .filter((projeto) => {
                // Filtro por projetos selecionados
                if (filtroProjetosPorProjeto.length > 0 && !filtroProjetosPorProjeto.includes(projeto.projetoId.toString())) {
                  return false;
                }
                // Filtro por status
                if (filtroStatusProjeto === 'com_falta' && projeto.quantidadeFalta === 0) {
                  return false;
                }
                if (filtroStatusProjeto === 'sem_falta' && projeto.quantidadeFalta > 0) {
                  return false;
                }
                return true;
              })
              .map((projeto) => {
                const maxValue = Math.max(...dashboard.porProjeto.map(p => p.valorTotal));
                const percentage = (projeto.valorTotal / maxValue) * 100;
                const cor = projeto.quantidadeFalta > 0 ? 'bg-red-400' : 'bg-blue-400';

                return (
                  <div key={projeto.projetoId} className="flex items-center gap-4">
                    <div className="w-48 text-sm font-medium text-muted-foreground text-right truncate">
                      {projeto.projetoNome}
                    </div>
                    <div className="flex-1 relative group">
                      <div className="h-10 bg-muted/20 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${cor} rounded-r-lg transition-all duration-500 ease-out flex items-center justify-end px-3`}
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-sm font-semibold text-white">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                              minimumFractionDigits: 0,
                            }).format(projeto.valorTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Itens Mais Críticos */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Top 10 - Itens Mais Críticos
              </CardTitle>
              <CardDescription>
                Materiais com maior falta de estoque
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Filtros */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Filtrar por Projeto</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {dashboard.porProjeto.map((projeto) => (
                          <div key={projeto.projetoId} className="flex items-center space-x-2">
                            <Checkbox
                              id={`top10-projeto-${projeto.projetoId}`}
                              checked={filtroProjetosTop10.includes(projeto.projetoId.toString())}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFiltroProjetosTop10([...filtroProjetosTop10, projeto.projetoId.toString()]);
                                } else {
                                  setFiltroProjetosTop10(filtroProjetosTop10.filter((id) => id !== projeto.projetoId.toString()));
                                }
                              }}
                            />
                            <label
                              htmlFor={`top10-projeto-${projeto.projetoId}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {projeto.projetoNome}
                            </label>
                          </div>
                        ))}
                      </div>
                      {filtroProjetosTop10.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => setFiltroProjetosTop10([])}
                        >
                          Limpar seleção
                        </Button>
                      )}
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">Valor Mínimo (R$)</h4>
                      <Select
                        value={filtroValorMinimo.toString()}
                        onValueChange={(value) => setFiltroValorMinimo(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Todos os Valores</SelectItem>
                          <SelectItem value="1000">Acima de R$ 1.000</SelectItem>
                          <SelectItem value="5000">Acima de R$ 5.000</SelectItem>
                          <SelectItem value="10000">Acima de R$ 10.000</SelectItem>
                          <SelectItem value="50000">Acima de R$ 50.000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Exportar */}
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
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Quantidade Faltante</TableHead>
                <TableHead className="text-right">Valor Faltante</TableHead>
                <TableHead className="text-center">Projetos</TableHead>
                <TableHead>Prazo Limite</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.itensMaisCriticos
                .filter((item) => {
                  // Filtro por valor mínimo
                  if (item.valorFaltante < filtroValorMinimo) {
                    return false;
                  }
                  // Note: filtro por projeto seria implementado se tivéssemos a lista de projetos por item
                  // Como não temos essa info na estrutura atual, mantemos apenas o filtro de valor
                  return true;
                })
                .map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono font-semibold">
                      {item.codigoMaterial}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {item.descricao}
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums">
                      {item.quantidadeFaltante.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums text-red-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(item.valorFaltante)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{item.quantidadeProjetos}</Badge>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {new Date(item.prazoLimite).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabela de Necessidades Consolidadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Necessidades de Materiais - Consolidado</CardTitle>
              <CardDescription>
                Clique na linha para ver detalhes de cada projeto (pegging)
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Seleção Múltipla de Projetos */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[250px] justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {selectedProjetos.length === 0
                      ? 'Todos os Projetos'
                      : `${selectedProjetos.length} projeto(s) selecionado(s)`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b">
                    <span className="text-sm font-semibold">Selecionar Projetos</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setSelectedProjetos([])}
                      >
                        Todos
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setSelectedProjetos([])}
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {dashboard.porProjeto.map((projeto) => (
                      <div key={projeto.projetoId} className="flex items-center space-x-2">
                        <Checkbox
                          id={`projeto-${projeto.projetoId}`}
                          checked={selectedProjetos.includes(projeto.projetoId.toString())}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProjetos([...selectedProjetos, projeto.projetoId.toString()]);
                            } else {
                              setSelectedProjetos(selectedProjetos.filter((id) => id !== projeto.projetoId.toString()));
                            }
                          }}
                        />
                        <label
                          htmlFor={`projeto-${projeto.projetoId}`}
                          className="text-sm font-normal leading-none cursor-pointer flex-1"
                        >
                          {projeto.projetoNome}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Botões de Exportação */}
              <Button variant="outline" size="sm" title="Exportar PDF">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" title="Exportar Excel">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>

              {/* Gerar Requisições */}
              {relatorio.sugestoes && relatorio.sugestoes.length > 0 && (
                <Button
                  onClick={() => handleGerarRequisicoes(relatorio.sugestoes)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Gerar {relatorio.sugestoes.length} Requisições
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Classe</TableHead>
                <TableHead className="text-right">Qtd. Bruta</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Qtd. Líquida</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Projetos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {necessidadesFiltradas.map((nec) => {
                const isExpanded = expandedRows.has(nec.codigoMaterial);
                return (
                  <>
                    <TableRow
                      key={nec.codigoMaterial}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleToggleRow(nec.codigoMaterial)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {nec.codigoMaterial}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {nec.descricaoMaterial}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            nec.classeABC === 'A'
                              ? 'destructive'
                              : nec.classeABC === 'B'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {nec.classeABC || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {nec.quantidadeBrutaTotal.toLocaleString('pt-BR')} {nec.unidade}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {nec.estoqueDisponivel.toLocaleString('pt-BR')} {nec.unidade}
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {nec.quantidadeLiquidaTotal.toLocaleString('pt-BR')} {nec.unidade}
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(nec.valorTotalConsolidado)}
                      </TableCell>
                      <TableCell className="text-center">
                        {nec.status === 'atendida' ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Atendida
                          </Badge>
                        ) : nec.status === 'parcial' ? (
                          <Badge className="bg-yellow-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Parcial
                          </Badge>
                        ) : (
                          <Badge className="bg-red-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            Crítica
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {nec.projetosOrigem.length}
                        </Badge>
                      </TableCell>
                    </TableRow>

                    {/* Linha Expandida - Pegging */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={10} className="bg-muted/30">
                          <div className="p-4 space-y-4">
                            <h4 className="font-semibold text-sm">
                              Pegging - Origem da Demanda (Rastreabilidade)
                            </h4>

                            {/* Conflitos */}
                            {nec.conflitos && nec.conflitos.length > 0 && (
                              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <h5 className="font-semibold text-sm text-red-700 dark:text-red-400 mb-2">
                                  ⚠️ Conflitos Detectados ({nec.conflitos.length})
                                </h5>
                                {nec.conflitos.map((conflito) => (
                                  <div key={conflito.id} className="text-sm space-y-1">
                                    <p>
                                      <strong>Data:</strong>{' '}
                                      {new Date(conflito.dataConflito).toLocaleDateString('pt-BR')}
                                      {' | '}
                                      <strong>Déficit:</strong> {conflito.deficit.toLocaleString('pt-BR')} {nec.unidade}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {conflito.projetosEmConflito.length} projetos disputando este material
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Breakdown por Projeto */}
                            <div className="space-y-2">
                              <h5 className="font-semibold text-sm">Por Projeto:</h5>
                              {nec.projetosOrigem.map((proj) => (
                                <div
                                  key={proj.projetoId}
                                  className="flex items-center justify-between bg-background border rounded-lg p-3"
                                >
                                  <div>
                                    <p className="font-semibold text-sm">{proj.projetoNome}</p>
                                    <p className="text-xs text-muted-foreground">
                                      OS: {proj.osIds.join(', ')}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold tabular-nums">
                                      {proj.quantidadeDemandada.toLocaleString('pt-BR')} {nec.unidade}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Necessário em: {new Date(proj.dataNecessidade).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Atividades Detalhadas */}
                            <div className="space-y-2">
                              <h5 className="font-semibold text-sm">Atividades (Pegging Completo):</h5>
                              <div className="max-h-[300px] overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Projeto</TableHead>
                                      <TableHead>OS</TableHead>
                                      <TableHead>Atividade</TableHead>
                                      <TableHead className="text-right">Quantidade</TableHead>
                                      <TableHead>Data Necessidade</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {nec.origensConsolidadas.map((origem, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell className="text-xs">{origem.projetoNome}</TableCell>
                                        <TableCell className="text-xs font-mono">{origem.osNumero}</TableCell>
                                        <TableCell className="text-xs max-w-[200px] truncate">
                                          {origem.atividadeDescricao}
                                        </TableCell>
                                        <TableCell className="text-right text-xs font-semibold tabular-nums">
                                          {origem.quantidadeDemandada.toLocaleString('pt-BR')} {nec.unidade}
                                        </TableCell>
                                        <TableCell className="text-xs tabular-nums">
                                          {new Date(origem.dataNecessidade).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Gráfico Expandido */}
      <Dialog open={expandedChart !== null} onOpenChange={(open) => !open && setExpandedChart(null)}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              {expandedChart === 'abc'
                ? 'Breakdown por Classe ABC'
                : expandedChart === 'timeline'
                ? 'Timeline de Necessidades'
                : 'Necessidades por Projeto'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {expandedChart === 'abc' && (
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={dadosClasseABC}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.percentual.toFixed(1)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {dadosClasseABC.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coresABC[index % coresABC.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value)
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            {expandedChart === 'timeline' && (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={dashboard.timelineNecessidades}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="data"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })
                    }
                  />
                  <YAxis />
                  <RechartsTooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    formatter={(value: number) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value)
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="valorTotal"
                    stroke="#FF7F0E"
                    strokeWidth={3}
                    name="Valor Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {expandedChart === 'projeto' && (
              <div className="space-y-6 p-6">
                {dashboard.porProjeto.map((projeto) => {
                  const maxValue = Math.max(...dashboard.porProjeto.map((p) => p.valorTotal));
                  const percentage = (projeto.valorTotal / maxValue) * 100;
                  const cor = projeto.quantidadeFalta > 0 ? 'bg-red-400' : 'bg-blue-400';

                  return (
                    <div key={projeto.projetoId} className="flex items-center gap-6">
                      <div className="w-56 text-base font-medium text-muted-foreground text-right">
                        {projeto.projetoNome}
                      </div>
                      <div className="flex-1 relative group">
                        <div className="h-14 bg-muted/20 rounded-lg overflow-hidden">
                          <div
                            className={`h-full ${cor} rounded-r-lg transition-all duration-500 ease-out flex items-center justify-end px-4`}
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-base font-semibold text-white">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                minimumFractionDigits: 0,
                              }).format(projeto.valorTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Origem dos Dados */}
      <Dialog open={origemDialogOpen !== null} onOpenChange={(open) => !open && setOrigemDialogOpen(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {origemDialogOpen === 'abc' && 'Origem dos Dados - Classe ABC'}
              {origemDialogOpen === 'timeline' && 'Origem dos Dados - Timeline de Necessidades'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {origemDialogOpen === 'abc' && 'Este gráfico exibe materiais classificados por valor (ABC). Os dados são calculados em tempo real a partir de:'}
                {origemDialogOpen === 'timeline' && 'Esta timeline projeta as necessidades de materiais nos próximos 90 dias. Os dados são calculados em tempo real a partir de:'}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-semibold text-base">Fontes de Dados:</h4>

              <div className="space-y-3">
                {/* Service Orders */}
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Package className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">Service Orders Ativas</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {dashboard?.porProjeto?.length || 0} projetos em execução com ordens de produção
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => {
                        setOrigemDialogOpen(null);
                        navigate('/obras');
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver Service Orders →
                    </Button>
                  </div>
                </div>

                {/* BOM */}
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <FileText className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">BOM (Bill of Materials)</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Composições de custos e itens dos orçamentos vinculados às orders
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => {
                        setOrigemDialogOpen(null);
                        navigate('/comercial/orcamentos');
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver Orçamentos →
                    </Button>
                  </div>
                </div>

                {/* Estoque */}
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Database className="w-5 h-5 mt-0.5 text-orange-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">Estoque Atual</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Almoxarifado com itens, quantidades disponíveis e níveis de estoque
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => {
                        setOrigemDialogOpen(null);
                        navigate('/suprimentos/almoxarifado');
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver Estoque →
                    </Button>
                  </div>
                </div>

                {/* Pedidos em Aberto */}
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <ShoppingCart className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">Pedidos em Aberto</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Requisições e ordens de compra já solicitadas mas ainda não recebidas
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => {
                        setOrigemDialogOpen(null);
                        navigate('/suprimentos/requisicoes');
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver Requisições →
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold text-base">Cálculo do MRP:</h4>
              <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs space-y-1">
                <p className="text-foreground">1. <span className="text-blue-500">Explosão de BOM</span> → Necessidades Brutas</p>
                <p className="text-foreground">2. Necessidades Brutas - <span className="text-orange-500">Estoque</span> - <span className="text-purple-500">Pedidos</span> = <span className="font-bold">Necessidades Líquidas</span></p>
                <p className="text-foreground">3. Classificação <span className="text-green-500">ABC</span>: Valor × Criticidade</p>

                {origemDialogOpen === 'abc' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-muted-foreground">• Classe A: 80% do valor (alta criticidade)</p>
                    <p className="text-muted-foreground">• Classe B: 15% do valor (média criticidade)</p>
                    <p className="text-muted-foreground">• Classe C: 5% do valor (baixa criticidade)</p>
                  </div>
                )}

                {origemDialogOpen === 'timeline' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-muted-foreground">• Projeção baseada nas datas de necessidade das Service Orders</p>
                    <p className="text-muted-foreground">• Janela de 90 dias a partir de hoje</p>
                  </div>
                )}
              </div>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Dados em tempo real:</strong> Estes cálculos são executados sempre que você abre esta página,
                garantindo que as informações estejam sempre atualizadas com o estado atual do sistema.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
}
