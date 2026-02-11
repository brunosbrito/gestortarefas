import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Download, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AbaMaoObraProps {
  orcamento: any;
  onUpdate: (orcamento: any) => void;
}

const AbaMaoObra = ({ orcamento, onUpdate }: AbaMaoObraProps) => {
  const [usarTabelaGlobal, setUsarTabelaGlobal] = useState(true);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Mão de Obra
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={usarTabelaGlobal ? 'default' : 'outline'}
                onClick={() => setUsarTabelaGlobal(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Usar Tabela Global
              </Button>
              <Button
                variant={!usarTabelaGlobal ? 'default' : 'outline'}
                onClick={() => setUsarTabelaGlobal(false)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Customizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fabricacao">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fabricacao">MO Fabricação</TabsTrigger>
              <TabsTrigger value="montagem">MO Montagem</TabsTrigger>
            </TabsList>

            <TabsContent value="fabricacao" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                      <TableHead className="text-right">Valor/h</TableHead>
                      <TableHead className="text-right">Encargos</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>1</TableCell>
                      <TableCell>Soldador</TableCell>
                      <TableCell className="text-right">2</TableCell>
                      <TableCell className="text-right">160</TableCell>
                      <TableCell className="text-right">R$ 18,00</TableCell>
                      <TableCell className="text-right">58,72%</TableCell>
                      <TableCell className="text-right font-bold">R$ 9.139,20</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2</TableCell>
                      <TableCell>Ajudante</TableCell>
                      <TableCell className="text-right">1</TableCell>
                      <TableCell className="text-right">160</TableCell>
                      <TableCell className="text-right">R$ 12,00</TableCell>
                      <TableCell className="text-right">58,72%</TableCell>
                      <TableCell className="text-right font-bold">R$ 3.046,40</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {usarTabelaGlobal && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                  <p><strong>Tabela Global:</strong> Usando valores padrão configurados em Cadastros → Cargos</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="montagem" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                      <TableHead className="text-right">Valor/h</TableHead>
                      <TableHead className="text-right">Encargos</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum cargo adicionado para montagem
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbaMaoObra;
