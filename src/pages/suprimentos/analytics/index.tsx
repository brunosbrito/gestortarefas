import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';

const Analytics = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
      <p className="text-muted-foreground">
        Análise avançada de custos e performance
      </p>
    </div>

    <Card>
      <CardContent className="text-center py-12">
        <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
        <p className="text-muted-foreground mb-4">
          Dashboards interativos e análise preditiva de custos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
          <div className="p-4 border rounded-lg">
            <BarChart3 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="font-medium">Custos por Categoria</p>
            <p className="text-xs text-muted-foreground mt-1">
              Gráficos detalhados
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <PieChart className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="font-medium">Distribuição</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pizza e hierarquia
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="font-medium">Tendências</p>
            <p className="text-xs text-muted-foreground mt-1">
              Evolução temporal
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Activity className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <p className="font-medium">ROI</p>
            <p className="text-xs text-muted-foreground mt-1">
              Análise de retorno
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Analytics;
