import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Truck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AbaMobDesmobProps {
  orcamento: any;
  onUpdate: (orcamento: any) => void;
}

const AbaMobDesmob = ({ orcamento, onUpdate }: AbaMobDesmobProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Mobilização */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-5 w-5 text-indigo-600" />
                Mobilização
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead>Un</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>Transporte de Equipamentos</TableCell>
                    <TableCell className="text-right">1</TableCell>
                    <TableCell>vb</TableCell>
                    <TableCell className="text-right font-bold">R$ 2.500,00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2</TableCell>
                    <TableCell>Montagem de Canteiro</TableCell>
                    <TableCell className="text-right">1</TableCell>
                    <TableCell>vb</TableCell>
                    <TableCell className="text-right font-bold">R$ 1.800,00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Mobilização:</span>
                <span className="font-bold text-indigo-600">R$ 4.300,00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desmobilização */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-5 w-5 text-purple-600" />
                Desmobilização
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead>Un</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>Desmontagem de Canteiro</TableCell>
                    <TableCell className="text-right">1</TableCell>
                    <TableCell>vb</TableCell>
                    <TableCell className="text-right font-bold">R$ 1.200,00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2</TableCell>
                    <TableCell>Transporte de Retorno</TableCell>
                    <TableCell className="text-right">1</TableCell>
                    <TableCell>vb</TableCell>
                    <TableCell className="text-right font-bold">R$ 1.500,00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Desmobilização:</span>
                <span className="font-bold text-purple-600">R$ 2.700,00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Geral */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Mob/Desmob:</span>
            <span className="text-2xl font-bold text-indigo-600">R$ 7.000,00</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbaMobDesmob;
