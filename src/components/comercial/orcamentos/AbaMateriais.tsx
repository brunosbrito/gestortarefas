import { useState } from 'react';
import { Package, Plus, Scissors, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { MoreVertical } from 'lucide-react';
import { Orcamento, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import OrcamentoService from '@/services/OrcamentoService';
import AddMaterialDialog from './AddMaterialDialog';
import EditItemDialog from './EditItemDialog';

interface AbaMateriaisProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaMateriais({ orcamento, onUpdate }: AbaMateriaisProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogAddAberto, setDialogAddAberto] = useState(false);
  const [dialogEditAberto, setDialogEditAberto] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState<ItemComposicao | null>(null);

  const composicaoMateriais = orcamento.composicoes.find((c) => c.tipo === 'materiais');

  const handleAdicionarMaterial = async (novoItem: Omit<ItemComposicao, 'id' | 'composicaoId' | 'ordem'>) => {
    if (!composicaoMateriais) return;

    try {
      const itemCompleto: ItemComposicao = {
        ...novoItem,
        id: Date.now().toString(),
        composicaoId: composicaoMateriais.id,
        ordem: composicaoMateriais.itens.length + 1,
      };

      composicaoMateriais.itens.push(itemCompleto);
      await OrcamentoService.update(orcamento.id, orcamento);

      toast({
        title: 'Sucesso',
        description: 'Material adicionado com sucesso',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar material',
        variant: 'destructive',
      });
    }
  };

  const handleEditarItem = (item: ItemComposicao) => {
    setItemParaEditar(item);
    setDialogEditAberto(true);
  };

  const handleAtualizarItem = async (itemAtualizado: ItemComposicao) => {
    if (!composicaoMateriais) return;

    try {
      const index = composicaoMateriais.itens.findIndex((i) => i.id === itemAtualizado.id);
      if (index !== -1) {
        composicaoMateriais.itens[index] = itemAtualizado;
        await OrcamentoService.update(orcamento.id, orcamento);

        toast({
          title: 'Sucesso',
          description: 'Item atualizado com sucesso',
        });

        onUpdate();
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
    if (!composicaoMateriais) return;

    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      composicaoMateriais.itens = composicaoMateriais.itens.filter((i) => i.id !== itemId);
      await OrcamentoService.update(orcamento.id, orcamento);

      toast({
        title: 'Sucesso',
        description: 'Item excluído com sucesso',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir item',
        variant: 'destructive',
      });
    }
  };

  const handleGerarListaCorte = () => {
    navigate('/comercial/orcamentos/lista-corte');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Materiais do Orçamento
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGerarListaCorte}>
                <Scissors className="mr-2 h-4 w-4" />
                Gerar Lista de Corte
              </Button>
              <Button onClick={() => setDialogAddAberto(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Material
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {composicaoMateriais && composicaoMateriais.itens.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="border-r w-12">#</TableHead>
                    <TableHead className="border-r">Código</TableHead>
                    <TableHead className="border-r">Descrição</TableHead>
                    <TableHead className="border-r">Material</TableHead>
                    <TableHead className="border-r text-right">Qtd</TableHead>
                    <TableHead className="border-r">Unidade</TableHead>
                    <TableHead className="border-r text-right">Peso (kg)</TableHead>
                    <TableHead className="border-r text-right">Preço Unit.</TableHead>
                    <TableHead className="border-r text-right">Subtotal</TableHead>
                    <TableHead className="text-right w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {composicaoMateriais.itens.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="border-r font-medium">{index + 1}</TableCell>
                      <TableCell className="border-r font-mono text-xs">
                        {item.codigo || '-'}
                      </TableCell>
                      <TableCell className="border-r">
                        <div>
                          <p className="font-medium">{item.descricao}</p>
                          {item.especificacao && (
                            <p className="text-xs text-muted-foreground">{item.especificacao}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="border-r text-xs">{item.material || '-'}</TableCell>
                      <TableCell className="border-r text-right font-medium">
                        {item.quantidade}
                      </TableCell>
                      <TableCell className="border-r">{item.unidade}</TableCell>
                      <TableCell className="border-r text-right font-mono">
                        {item.peso ? item.peso.toFixed(2) : '-'}
                      </TableCell>
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
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum material cadastrado</p>
              <p className="text-sm mt-2">
                Clique em "Adicionar Material" para incluir perfis, chapas e outros materiais
              </p>
            </div>
          )}

          {/* Resumo */}
          {composicaoMateriais && composicaoMateriais.itens.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label className="text-muted-foreground">Total de Itens</Label>
                  <p className="text-xl font-bold">{composicaoMateriais.itens.length}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Peso Total (kg)</Label>
                  <p className="text-xl font-bold">
                    {composicaoMateriais.itens
                      .reduce((total, item) => total + (item.peso || 0) * item.quantidade, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Custo Direto</Label>
                  <p className="text-xl font-bold">{formatCurrency(composicaoMateriais.custoDirecto)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">BDI ({composicaoMateriais.bdi.percentual}%)</Label>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(composicaoMateriais.bdi.valor)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Subtotal</Label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(composicaoMateriais.subtotal)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddMaterialDialog
        open={dialogAddAberto}
        onOpenChange={setDialogAddAberto}
        onAdd={handleAdicionarMaterial}
        composicaoId={composicaoMateriais?.id || ''}
      />

      <EditItemDialog
        open={dialogEditAberto}
        onOpenChange={setDialogEditAberto}
        onUpdate={handleAtualizarItem}
        item={itemParaEditar}
      />
    </div>
  );
}
