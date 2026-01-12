import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import {
  useAnalytics,
  useCostsByCategory,
  useCostEvolution,
  useSupplierAnalysis,
  useContractPerformance,
  useCategoryTrends,
  useSummaryStats,
} from '@/hooks/suprimentos/useAnalytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Analytics = () => {
  const { data: analytics, isLoading: loadingAnalytics } = useAnalytics();
  const { data: costsByCategory, isLoading: loadingCategory } = useCostsByCategory();
  const { data: costEvolution, isLoading: loadingEvolution } = useCostEvolution();
  const { data: supplierAnalysis, isLoading: loadingSuppliers } = useSupplierAnalysis();
  const { data: contractPerformance, isLoading: loadingContracts } = useContractPerformance();
  const { data: categoryTrends, isLoading: loadingTrends } = useCategoryTrends();
  const { data: summaryStats, isLoading: loadingStats } = useSummaryStats();

  const isLoading =
    loadingAnalytics ||
    loadingCategory ||
    loadingEvolution ||
    loadingSuppliers ||
    loadingContracts ||
    loadingTrends ||
    loadingStats;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Análise avançada de custos e performance
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Análise avançada de custos e performance de suprimentos
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              Valor Total Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summaryStats?.totalSpent || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Orçamento: {formatCurrency(summaryStats?.totalBudget || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {summaryStats && summaryStats.variance < 0 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-500" />
              )}
              Variação Orçamentária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                summaryStats && summaryStats.variance < 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {summaryStats && formatPercent(summaryStats.variancePercent)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summaryStats &&
                (summaryStats.variance < 0
                  ? `Economia: ${formatCurrency(Math.abs(summaryStats.variance))}`
                  : `Estouro: ${formatCurrency(summaryStats.variance)}`)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-500" />
              Compras Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summaryStats?.completedPurchases || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summaryStats?.activeContracts || 0} contratos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Tempo Médio de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summaryStats?.avgDeliveryTime.toFixed(1) || 0} dias
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Principal: {summaryStats?.topSupplier || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Costs by Category - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Custos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={costsByCategory}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, percentage }) =>
                    `${category}: ${percentage.toFixed(1)}%`
                  }
                >
                  {costsByCategory?.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
              </RePieChart>
            </ResponsiveContainer>

            {/* Category Details */}
            <div className="mt-4 space-y-2">
              {costsByCategory?.map((cat, index) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(cat.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.items} itens • Ticket médio: {formatCurrency(cat.avgTicket)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Evolution - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evolução de Custos (Planejado vs Real)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="planned" fill="#94a3b8" name="Planejado" />
                <Bar dataKey="actual" fill="#3b82f6" name="Real" />
              </BarChart>
            </ResponsiveContainer>

            {/* Variance Summary */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {costEvolution?.map((month) => (
                <div key={month.month} className="flex items-center justify-between text-sm border-b pb-2">
                  <span className="font-medium">{month.month}</span>
                  <Badge
                    variant={month.variance < 0 ? 'outline' : 'destructive'}
                    className={month.variance < 0 ? 'bg-green-50 text-green-700' : ''}
                  >
                    {formatPercent(month.variancePercent)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Performance - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance de Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={supplierAnalysis}
                layout="vertical"
                margin={{ left: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={110} />
                <Tooltip />
                <Legend />
                <Bar dataKey="onTimeDelivery" fill="#10b981" name="Pontualidade (%)" />
                <Bar dataKey="qualityScore" fill="#3b82f6" name="Qualidade (x10)" />
              </BarChart>
            </ResponsiveContainer>

            {/* Top Suppliers */}
            <div className="mt-4 space-y-2">
              {supplierAnalysis?.slice(0, 3).map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between text-sm p-2 border rounded">
                  <div>
                    <p className="font-medium">{supplier.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {supplier.orders} pedidos • Nota: {supplier.rating.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(supplier.totalValue)}</p>
                    <p className="text-xs text-muted-foreground">
                      Entrega: {supplier.avgDeliveryTime.toFixed(1)} dias
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Trends - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendências por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  type="category"
                  allowDuplicatedCategory={false}
                />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                {categoryTrends?.map((trend, index) => (
                  <Line
                    key={trend.category}
                    data={trend.data}
                    type="monotone"
                    dataKey="value"
                    name={trend.category}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>

            {/* Trend Analysis */}
            <div className="mt-4 space-y-2">
              {categoryTrends?.map((trend, index) => {
                const first = trend.data[0]?.value || 0;
                const last = trend.data[trend.data.length - 1]?.value || 0;
                const change = ((last - first) / first) * 100;

                return (
                  <div key={trend.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{trend.category}</span>
                    </div>
                    <Badge
                      variant={change < 0 ? 'outline' : 'default'}
                      className={change < 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
                    >
                      {change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {formatPercent(change)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Performance de Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Contrato</th>
                  <th className="text-right py-2 px-4">Orçamento</th>
                  <th className="text-right py-2 px-4">Gasto</th>
                  <th className="text-right py-2 px-4">Variação</th>
                  <th className="text-center py-2 px-4">Execução</th>
                  <th className="text-center py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {contractPerformance?.map((contract) => (
                  <tr key={contract.contractId} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{contract.contractName}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {contract.contractId}
                      </p>
                    </td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(contract.budget)}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      {formatCurrency(contract.spent)}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={
                          contract.variance < 0 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {formatCurrency(Math.abs(contract.variance))}
                        <br />
                        <span className="text-xs">
                          ({formatPercent(contract.variancePercent)})
                        </span>
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">
                          {contract.executionPercent.toFixed(1)}%
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              contract.status === 'under_budget'
                                ? 'bg-green-500'
                                : contract.status === 'on_budget'
                                ? 'bg-blue-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(contract.executionPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge
                        variant={
                          contract.status === 'under_budget'
                            ? 'outline'
                            : contract.status === 'on_budget'
                            ? 'default'
                            : 'destructive'
                        }
                        className={
                          contract.status === 'under_budget'
                            ? 'bg-green-50 text-green-700'
                            : ''
                        }
                      >
                        {contract.status === 'under_budget'
                          ? 'Abaixo'
                          : contract.status === 'on_budget'
                          ? 'No Orçamento'
                          : 'Estouro'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Insights Positivos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics?.insights.positive.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-900">{insight}</p>
              </div>
            ))}

            <div className="pt-4 border-t">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Pontos de Atenção
              </h4>
              {analytics?.insights.attention.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg mb-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-900">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics?.recommendations.map((rec, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <h4 className="font-semibold text-sm mb-1">{rec.title}</h4>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
