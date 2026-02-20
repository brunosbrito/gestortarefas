import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Paintbrush, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AbaPinturaProps {
  orcamento: any;
  onUpdate: (orcamento: any) => void;
}

const AbaPintura = ({ orcamento, onUpdate }: AbaPinturaProps) => {
  // Calcular área total automaticamente dos materiais
  const areaTotal = useMemo(() => {
    // TODO: Implementar cálculo real quando composicao de materiais estiver pronta
    return 237.6; // Mock
  }, [orcamento]);

  return (
    <div className="space-y-6">
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
        <Info className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong>Cálculo Automático:</strong> A área de pintura é calculada automaticamente a partir dos materiais cadastrados.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-purple-600" />
            Cálculo de Pintura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <Label className="text-muted-foreground">Área Total a Pintar</Label>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {areaTotal.toFixed(2)} m²
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Calculada automaticamente da composição de materiais
              </p>
            </div>

            <div>
              <Label>Especificação de Tinta</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a tinta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primer-epoxi">Primer Epóxi</SelectItem>
                  <SelectItem value="pu-amarelo">PU Amarelo</SelectItem>
                  <SelectItem value="esmalte-sintetico">Esmalte Sintético</SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rendimento:</span>
                    <span className="font-medium">12 m²/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Litros necessários:</span>
                    <span className="font-bold text-blue-600">19.80 L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor estimado:</span>
                    <span className="font-bold text-green-600">R$ 1.485,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar à Composição
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbaPintura;
