import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Box } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AbaConsumiveisProps {
  orcamento: any;
  onUpdate: (orcamento: any) => void;
}

const AbaConsumiveis = ({ orcamento, onUpdate }: AbaConsumiveisProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-pink-600" />
              Consumíveis (Curva ABC)
            </CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Consumível
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">Grupo ABC</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Un</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell>LIXA-80</TableCell>
                  <TableCell>Lixa d'água grão 80</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">Lixas</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-100 text-green-700 font-bold text-xs">A</Badge>
                  </TableCell>
                  <TableCell className="text-right">100</TableCell>
                  <TableCell>un</TableCell>
                  <TableCell className="text-right">R$ 2,50</TableCell>
                  <TableCell className="text-right font-bold">R$ 250,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2</TableCell>
                  <TableCell>DISCO-4.1/2</TableCell>
                  <TableCell>Disco de corte 4.1/2"</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 text-xs">Discos</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-100 text-green-700 font-bold text-xs">A</Badge>
                  </TableCell>
                  <TableCell className="text-right">200</TableCell>
                  <TableCell>un</TableCell>
                  <TableCell className="text-right">R$ 3,80</TableCell>
                  <TableCell className="text-right font-bold">R$ 760,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>3</TableCell>
                  <TableCell>ELET-E6013</TableCell>
                  <TableCell>Eletrodo E6013 Ø3,25mm</TableCell>
                  <TableCell>
                    <Badge className="bg-orange-100 text-orange-700 text-xs">Eletrodos</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-yellow-100 text-yellow-700 font-bold text-xs">B</Badge>
                  </TableCell>
                  <TableCell className="text-right">50</TableCell>
                  <TableCell>kg</TableCell>
                  <TableCell className="text-right">R$ 18,00</TableCell>
                  <TableCell className="text-right font-bold">R$ 900,00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Grupo A (80%):</span>
                  <Badge className="bg-green-100 text-green-700 font-bold">A</Badge>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-2">R$ 4.832,00</p>
                <p className="text-xs text-muted-foreground mt-1">77% do total</p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Grupo B (15%):</span>
                  <Badge className="bg-yellow-100 text-yellow-700 font-bold">B</Badge>
                </div>
                <p className="text-2xl font-bold text-yellow-600 mt-2">R$ 960,00</p>
                <p className="text-xs text-muted-foreground mt-1">15% do total</p>
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Grupo C (5%):</span>
                  <Badge className="bg-red-100 text-red-700 font-bold">C</Badge>
                </div>
                <p className="text-2xl font-bold text-red-600 mt-2">R$ 474,00</p>
                <p className="text-xs text-muted-foreground mt-1">8% do total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbaConsumiveis;
