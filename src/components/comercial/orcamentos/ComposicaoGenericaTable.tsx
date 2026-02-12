import { useState } from 'react';
import { Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ComposicaoCustos, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import EditItemDialog from './EditItemDialog';

interface ComposicaoGenericaTableProps {
  composicao?: ComposicaoCustos;
  tipo: string;
  onUpdate?: (composicao: ComposicaoCustos) => Promise<void>;
}

export default function ComposicaoGenericaTable({
  composicao,
  tipo,
  onUpdate,
}: ComposicaoGenericaTableProps) {
  const { toast } = useToast();
  const [dialogEditAberto, setDialogEditAberto] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState<ItemComposicao | null>(null);

  const handleAdicionar = () => {
    toast({
      title: 'Em desenvolvimento',
      description: `Funcionalidade de adicionar ${tipo} em desenvolvimento`,
    });
  };

  const handleEditarItem = (item: ItemComposicao) => {
    setItemParaEditar(item);
    setDialogEditAberto(true);
  };

  const handleAtualizarItem = async (itemAtualizado: ItemComposicao) => {
    if (!composicao || !onUpdate) return;

    try {
      const index = composicao.itens.findIndex((i) => i.id === itemAtualizado.id);
      if (index !== -1) {
        composicao.itens[index] = itemAtualizado;
        await onUpdate(composicao);

        toast({
          title: 'Sucesso',
          description: 'Item atualizado com sucesso',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar item',
        variant: 'destructive',
      });
    }
  };

  const handleExcluirItem = async (itemId: string) => {
    if (!composicao || !onUpdate) return;

    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      composicao.itens = composicao.itens.filter((i) => i.id !== itemId);
      await onUpdate(composicao);

      toast({
        title: 'Sucesso',
        description: 'Item excluído com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir item',
        variant: 'destructive',
      });
    }
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
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditarItem(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExcluirItem(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
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

      {/* Dialog de Edição */}
      <EditItemDialog
        open={dialogEditAberto}
        onOpenChange={setDialogEditAberto}
        onUpdate={handleAtualizarItem}
        item={itemParaEditar}
      />
    </>
  );
}
