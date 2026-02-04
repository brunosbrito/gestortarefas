/**
 * FASE 2 PCP: Dashboard MRP - Material Requirements Planning
 * Cálculo de necessidades multi-projeto com consolidação e pegging
 * Sistema: Gestor Master - GMX Soluções Industriais
 */

import { useState, useEffect } from 'react';
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
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

export default function DashboardMRPPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardMRP | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioMRP | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedProjeto, setSelectedProjeto] = useState<string>('todos');

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
          description: `${resultado.requisicoes.length} requisições de compra foram criadas no módulo de Suprimentos`,
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
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filtrar necessidades por projeto se selecionado
  const necessidadesFiltradas =
    selectedProjeto === 'todos'
      ? relatorio.necessidadesConsolidadas || []
      : (relatorio.necessidadesConsolidadas || []).filter((n) =>
          n.projetosOrigem.some((p) => p.projetoId === Number(selectedProjeto))
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
    <div className="space-y-6 p-6">
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
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Breakdown por Classe ABC
            </CardTitle>
            <CardDescription>
              Distribuição de valor por classificação
            </CardDescription>
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
                <Tooltip
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
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline de Necessidades
            </CardTitle>
            <CardDescription>
              Próximos 90 dias
            </CardDescription>
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
                <Tooltip
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

      {/* Breakdown por Projeto */}
      <Card>
        <CardHeader>
          <CardTitle>Necessidades por Projeto</CardTitle>
          <CardDescription>
            Distribuição de materiais necessários por projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboard.porProjeto}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="projetoNome" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(value)
                }
              />
              <Bar dataKey="valorTotal" fill="#1F77B4" name="Valor Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Itens Mais Críticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Top 10 - Itens Mais Críticos
          </CardTitle>
          <CardDescription>
            Materiais com maior falta de estoque
          </CardDescription>
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
              {dashboard.itensMaisCriticos.map((item, index) => (
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
              <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filtrar por projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Projetos</SelectItem>
                  {dashboard.porProjeto.map((p) => (
                    <SelectItem key={p.projetoId} value={p.projetoId.toString()}>
                      {p.projetoNome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
    </div>
  );
}
