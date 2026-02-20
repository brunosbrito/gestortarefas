import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AbaFerramentasProps {
  orcamento: any;
  onUpdate: (orcamento: any) => void;
}

const AbaFerramentas = ({ orcamento, onUpdate }: AbaFerramentasProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-yellow-600" />
              Ferramentas
            </CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Ferramenta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manuais">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manuais">Ferramentas Manuais</TabsTrigger>
              <TabsTrigger value="eletricas">Ferramentas Elétricas</TabsTrigger>
            </TabsList>

            <TabsContent value="manuais" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead>Un</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>1</TableCell>
                      <TableCell>FERR-001</TableCell>
                      <TableCell>Marreta 5kg</TableCell>
                      <TableCell className="text-right">2</TableCell>
                      <TableCell>un</TableCell>
                      <TableCell className="text-right">R$ 45,00</TableCell>
                      <TableCell className="text-right font-bold">R$ 90,00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2</TableCell>
                      <TableCell>FERR-002</TableCell>
                      <TableCell>Esquadro de Aço 300mm</TableCell>
                      <TableCell className="text-right">1</TableCell>
                      <TableCell>un</TableCell>
                      <TableCell className="text-right">R$ 35,00</TableCell>
                      <TableCell className="text-right font-bold">R$ 35,00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="eletricas" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead>Un</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>1</TableCell>
                      <TableCell>ELTR-001</TableCell>
                      <TableCell>Esmerilhadeira 9"</TableCell>
                      <TableCell className="text-right">2</TableCell>
                      <TableCell>un</TableCell>
                      <TableCell className="text-right">R$ 450,00</TableCell>
                      <TableCell className="text-right font-bold">R$ 900,00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Ferramentas Manuais:</span>
                <span className="ml-2 font-bold text-yellow-700">R$ 125,00</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Ferramentas Elétricas:</span>
                <span className="ml-2 font-bold text-yellow-700">R$ 900,00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbaFerramentas;
