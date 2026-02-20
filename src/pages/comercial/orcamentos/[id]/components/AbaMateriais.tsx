import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Scissors } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AbaMateriaisProps {
  orcamento: any;
  onUpdate: (orcamento: any) => void;
}

const AbaMateriais = ({ orcamento, onUpdate }: AbaMateriaisProps) => {
  const [dialogAberto, setDialogAberto] = useState(false);

  const handleGerarListaCorte = () => {
    // TODO: Implementar integração com Lista de Corte
    alert('Funcionalidade de Lista de Corte será implementada na FASE 6');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Materiais
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGerarListaCorte}>
                <Scissors className="h-4 w-4 mr-2" />
                Gerar Lista de Corte
              </Button>
              <Button onClick={() => setDialogAberto(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            </div>
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
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Un</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum material adicionado
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Dica:</strong> Use o botão "Gerar Lista de Corte" para criar automaticamente o mapa de corte otimizado dos materiais.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbaMateriais;
