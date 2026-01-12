import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Layers, Tag } from 'lucide-react';

const CentrosCusto = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-foreground">Centros de Custo</h1>
      <p className="text-muted-foreground">
        Gestão e classificação de centros de custo
      </p>
    </div>

    <Card>
      <CardContent className="text-center py-12">
        <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
        <p className="text-muted-foreground mb-4">
          Este módulo permitirá gerenciar centros de custo e regras de classificação
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
          <div className="p-4 border rounded-lg">
            <Tag className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="font-medium">Hierarquia</p>
            <p className="text-xs text-muted-foreground mt-1">
              Organização em níveis (pai-filho)
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="font-medium">Budget Tracking</p>
            <p className="text-xs text-muted-foreground mt-1">
              Alocado vs Consumido
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Layers className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="font-medium">Auto-Classificação</p>
            <p className="text-xs text-muted-foreground mt-1">
              Keywords e regras ML
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default CentrosCusto;
