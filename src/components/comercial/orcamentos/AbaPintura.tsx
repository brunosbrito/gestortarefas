import { useMemo, useState } from 'react';
import { Paintbrush, Plus, Info, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Orcamento, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import OrcamentoService from '@/services/OrcamentoService';
import AddPinturaItemDialog from './AddPinturaItemDialog';
import EditItemDialog from './EditItemDialog';

interface AbaPinturaProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaPintura({ orcamento, onUpdate }: AbaPinturaProps) {
  const { toast } = useToast();
  const [dialogAddAberto, setDialogAddAberto] = useState(false);
  const [dialogEditAberto, setDialogEditAberto] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState<ItemComposicao | null>(null);

  // Calcular área total AUTOMATICAMENTE dos materiais do orçamento
  const areaTotal = useMemo(() => {
    const composicaoMateriais = orcamento.composicoes.find((c) => c.tipo === 'materiais');
    if (!composicaoMateriais) return 0;

    return composicaoMateriais.itens.reduce((total, item) => {
      // Assumindo que o material tem campo areaM2PorMetroLinear (da interface MaterialCatalogo)
      const area = (item as any).areaM2PorMetroLinear || 0;
      const quantidade = item.quantidade || 0;
      return total + area * quantidade;
    }, 0);
  }, [orcamento]);

  // Buscar composição de pintura
  const composicaoPintura = orcamento.composicoes.find((c) => c.tipo === 'jato_pintura');
  const composicaoMateriais = orcamento.composicoes.find((c) => c.tipo === 'materiais');

  const handleAdicionarItem = async (novoItem: Omit<ItemComposicao, 'id' | 'composicaoId' | 'ordem'>) => {
    if (!composicaoPintura) return;

    try {
      const itemCompleto: ItemComposicao = {
        ...novoItem,
        id: Date.now().toString(),
        composicaoId: composicaoPintura.id,
        ordem: composicaoPintura.itens.length + 1,
      };

      composicaoPintura.itens.push(itemCompleto);
      await OrcamentoService.update(orcamento.id, orcamento);

      toast({
        title: 'Sucesso',
        description: 'Item de pintura adicionado com sucesso',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar item de pintura',
        variant: 'destructive',
      });
    }
  };

  const handleEditarItem = (item: ItemComposicao) => {
    setItemParaEditar(item);
    setDialogEditAberto(true);
  };

  const handleAtualizarItem = async (itemAtualizado: ItemComposicao) => {
    if (!composicaoPintura) return;

    try {
      const index = composicaoPintura.itens.findIndex((i) => i.id === itemAtualizado.id);
      if (index !== -1) {
        composicaoPintura.itens[index] = itemAtualizado;
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
    if (!composicaoPintura) return;

    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      composicaoPintura.itens = composicaoPintura.itens.filter((i) => i.id !== itemId);
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

  return (
    <div className="space-y-6">
      {/* Alert Explicativo */}
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950/50">
        <Info className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong>Área calculada automaticamente:</strong> A área total de pintura é calculada
          somando (área m²/m × quantidade) de cada material cadastrado neste orçamento.
        </AlertDescription>
      </Alert>

      {/* Card de Cálculo Automático */}
      <Card className="border-green-500 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-green-600" />
            Cálculo Automático de Área
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-muted-foreground">Área Total a Pintar</Label>
              <p className="text-4xl font-bold text-green-600 mt-2">{areaTotal.toFixed(2)} m²</p>
              <p className="text-xs text-muted-foreground mt-1">
                Calculada dos {composicaoMateriais?.itens.length || 0} materiais do orçamento
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground">Perímetro Total Estimado</Label>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {(areaTotal * 2).toFixed(2)} m
              </p>
              <p className="text-xs text-muted-foreground mt-1">Estimativa: área × 2</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Status da Composição</Label>
              <p className="text-lg font-semibold mt-2">
                {composicaoPintura ? (
                  <span className="text-green-600">
                    ✓ {composicaoPintura.itens.length} itens cadastrados
                  </span>
                ) : (
                  <span className="text-amber-600">⚠ Nenhum item cadastrado</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Itens de Pintura */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens de Jateamento e Pintura</CardTitle>
            <Button onClick={() => setDialogAddAberto(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {composicaoPintura && composicaoPintura.itens.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="border-r w-12">#</TableHead>
                    <TableHead className="border-r">Descrição</TableHead>
                    <TableHead className="border-r text-right">Área (m²)</TableHead>
                    <TableHead className="border-r text-right">Qtd</TableHead>
                    <TableHead className="border-r">Unidade</TableHead>
                    <TableHead className="border-r text-right">Preço Unit.</TableHead>
                    <TableHead className="border-r text-right">Subtotal</TableHead>
                    <TableHead className="text-right w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {composicaoPintura.itens.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="border-r font-medium">{index + 1}</TableCell>
                      <TableCell className="border-r">
                        <div>
                          <p className="font-medium">{item.descricao}</p>
                          {item.codigo && (
                            <p className="text-xs text-muted-foreground">{item.codigo}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="border-r text-right font-mono">
                        {areaTotal.toFixed(2)}
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
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Paintbrush className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum item de pintura cadastrado</p>
              <p className="text-sm mt-2">
                Clique em "Adicionar Item" para incluir tintas, jateamento e serviços de pintura
              </p>
            </div>
          )}

          {/* Resumo */}
          {composicaoPintura && composicaoPintura.itens.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-muted-foreground">Custo Direto</Label>
                  <p className="text-xl font-bold">
                    {formatCurrency(composicaoPintura.custoDirecto)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">BDI ({composicaoPintura.bdi?.percentual || 0}%)</Label>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(composicaoPintura.bdi?.valor || 0)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Subtotal</Label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(composicaoPintura.subtotal)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">% do Total</Label>
                  <p className="text-xl font-bold">
                    {composicaoPintura.percentualDoTotal.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddPinturaItemDialog
        open={dialogAddAberto}
        onOpenChange={setDialogAddAberto}
        onAdd={handleAdicionarItem}
        composicaoId={composicaoPintura?.id || ''}
        areaTotal={areaTotal}
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
