import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, Award, CheckCircle } from 'lucide-react';

const Metas = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-foreground">Metas</h1>
      <p className="text-muted-foreground">
        Definição e acompanhamento de metas de custos
      </p>
    </div>

    <Card>
      <CardContent className="text-center py-12">
        <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
        <p className="text-muted-foreground mb-4">
          Sistema de definição e tracking de metas
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
          <div className="p-4 border rounded-lg">
            <Target className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="font-medium">Metas</p>
            <p className="text-xs text-muted-foreground mt-1">
              Definição de objetivos
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="font-medium">Progresso</p>
            <p className="text-xs text-muted-foreground mt-1">
              Acompanhamento real-time
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Award className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="font-medium">Resultados</p>
            <p className="text-xs text-muted-foreground mt-1">
              Performance atingida
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <CheckCircle className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <p className="font-medium">Alertas</p>
            <p className="text-xs text-muted-foreground mt-1">
              Desvios e avisos
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Metas;
