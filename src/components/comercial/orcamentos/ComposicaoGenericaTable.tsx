import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ComposicaoCustos } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';

interface ComposicaoGenericaTableProps {
  composicao?: ComposicaoCustos;
  tipo: string;
}

export default function ComposicaoGenericaTable({
  composicao,
  tipo,
}: ComposicaoGenericaTableProps) {
  const handleAdicionar = () => {
    console.log(`Adicionar item ${tipo}`);
  };

  if (!composicao || composicao.itens.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">Nenhum item cadastrado</p>
        <p className="text-sm mt-2 mb-4">Clique no botão abaixo para adicionar</p>
        <Button onClick={handleAdicionar}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Item
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="border-r w-12">#</TableHead>
              <TableHead className="border-r">Descrição</TableHead>
              <TableHead className="border-r text-right">Qtd</TableHead>
              <TableHead className="border-r">Unidade</TableHead>
              <TableHead className="border-r text-right">Valor Unit.</TableHead>
              <TableHead className="border-r text-right">Subtotal</TableHead>
              <TableHead className="text-right w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {composicao.itens.map((item, index) => (
              <TableRow key={item.id} className="hover:bg-muted/30">
                <TableCell className="border-r font-medium">{index + 1}</TableCell>
                <TableCell className="border-r">
                  <div>
                    <p className="font-medium">{item.descricao}</p>
                    {item.cargo && (
                      <p className="text-xs text-muted-foreground">Cargo: {item.cargo}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="border-r text-right font-medium">
                  {item.quantidade}
                </TableCell>
                <TableCell className="border-r">{item.unidade}</TableCell>
                <TableCell className="border-r text-right font-mono">
                  {formatCurrency(item.valorUnitario)}
                </TableCell>
                <TableCell className="border-r text-right font-bold">
                  {formatCurrency(item.subtotal)}
                </TableCell>
                <TableCell className="text-right">{/* Ações */}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Resumo */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-muted-foreground">Custo Direto</Label>
            <p className="text-xl font-bold">{formatCurrency(composicao.custoDirecto)}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">BDI ({composicao.bdi.percentual}%)</Label>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(composicao.bdi.valor)}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Subtotal</Label>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(composicao.subtotal)}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">% do Total</Label>
            <p className="text-xl font-bold">{composicao.percentualDoTotal.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </>
  );
}
