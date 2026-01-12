import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, Filter, Calendar } from 'lucide-react';

const Relatorios = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
      <p className="text-muted-foreground">
        Geração de relatórios customizáveis
      </p>
    </div>

    <Card>
      <CardContent className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
        <p className="text-muted-foreground mb-4">
          Sistema completo de geração e export de relatórios
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
          <div className="p-4 border rounded-lg">
            <FileText className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="font-medium">Templates</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pré-configurados
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Filter className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="font-medium">Filtros</p>
            <p className="text-xs text-muted-foreground mt-1">
              Customização avançada
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Calendar className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="font-medium">Período</p>
            <p className="text-xs text-muted-foreground mt-1">
              Seleção de datas
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Download className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <p className="font-medium">Export</p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, Excel, CSV
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Relatorios;
