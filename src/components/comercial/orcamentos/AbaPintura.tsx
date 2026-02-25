import { useMemo, useState, useEffect } from 'react';
import { Paintbrush, Plus, Info, Edit, Trash2, MoreVertical, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [itemParaExcluir, setItemParaExcluir] = useState<string | null>(null);

  const composicaoPintura = orcamento.composicoes.find((c) => c.tipo === 'jato_pintura');
  const composicaoMateriais = orcamento.composicoes.find((c) => c.tipo === 'materiais');

  // BDI editável por composição
  const [editandoBDI, setEditandoBDI] = useState(false);
  const [bdiInput, setBdiInput] = useState(composicaoPintura?.bdi?.percentual ?? 0);
  const [salvandoBDI, setSalvandoBDI] = useState(false);

  useEffect(() => {
    if (!editandoBDI) setBdiInput(composicaoPintura?.bdi?.percentual ?? 0);
  }, [composicaoPintura?.bdi?.percentual, editandoBDI]);

  const handleSalvarBDI = async () => {
    if (!composicaoPintura) return;
    try {
      setSalvandoBDI(true);
      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoPintura.id
            ? { ...c, bdi: { ...c.bdi, percentual: bdiInput } }
            : c
        ),
      };
      await OrcamentoService.update(orcamento.id, updatedOrcamento);
      setEditandoBDI(false);
      toast({ title: 'Sucesso', description: 'BDI atualizado com sucesso' });
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao atualizar BDI', variant: 'destructive' });
    } finally {
      setSalvandoBDI(false);
    }
  };

  // Calcula peso total dos materiais — usado como base para estimar área de pintura.
  // O campo areaM2PorMetroLinear não é persistido em ItemComposicao,
  // por isso o peso total é o melhor proxy disponível no momento.
  const areaTotal = useMemo(() => {
    if (!composicaoMateriais) return 0;
    return composicaoMateriais.itens.reduce(
      (total, item) => total + (item.peso ?? 0),
      0
    );
  }, [composicaoMateriais]);

  const handleAdicionarItem = async (novoItem: Omit<ItemComposicao, 'id' | 'composicaoId' | 'ordem'>) => {
    if (!composicaoPintura) return;

    try {
      const itemCompleto: ItemComposicao = {
        ...novoItem,
        id: Date.now().toString(),
        composicaoId: composicaoPintura.id,
        ordem: composicaoPintura.itens.length + 1,
      };

      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoPintura.id
            ? { ...c, itens: [...c.itens, itemCompleto] }
            : c
        ),
      };

      await OrcamentoService.update(orcamento.id, updatedOrcamento);

      toast({ title: 'Sucesso', description: 'Item de pintura adicionado com sucesso' });
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao adicionar item de pintura', variant: 'destructive' });
    }
  };

  const handleEditarItem = (item: ItemComposicao) => {
    setItemParaEditar(item);
    setDialogEditAberto(true);
  };

  const handleAtualizarItem = async (itemAtualizado: ItemComposicao) => {
    if (!composicaoPintura) return;

    try {
      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoPintura.id
            ? { ...c, itens: c.itens.map((i) => (i.id === itemAtualizado.id ? itemAtualizado : i)) }
            : c
        ),
      };

      await OrcamentoService.update(orcamento.id, updatedOrcamento);

      toast({ title: 'Sucesso', description: 'Item atualizado com sucesso' });
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao atualizar item', variant: 'destructive' });
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!composicaoPintura || !itemParaExcluir) return;

    try {
      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoPintura.id
            ? { ...c, itens: c.itens.filter((i) => i.id !== itemParaExcluir) }
            : c
        ),
      };

      await OrcamentoService.update(orcamento.id, updatedOrcamento);

      toast({ title: 'Sucesso', description: 'Item excluído com sucesso' });
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao excluir item', variant: 'destructive' });
    } finally {
      setItemParaExcluir(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Explicativo */}
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950/50">
        <Info className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong>Área estimada automaticamente:</strong> O peso total dos materiais cadastrados
          é usado como base para estimar a área de pintura do projeto.
        </AlertDescription>
      </Alert>

      {/* Card de Cálculo Automático */}
      <Card className="border-green-500 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-green-600" />
            Base para Cálculo de Pintura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-muted-foreground">Peso Total dos Materiais</Label>
              <p className="text-4xl font-bold text-green-600 mt-2">{areaTotal.toFixed(2)} kg</p>
              <p className="text-xs text-muted-foreground mt-1">
                Calculado dos {composicaoMateriais?.itens.length ?? 0} materiais do orçamento
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground">Área Estimada</Label>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {(areaTotal / 100).toFixed(2)} m²
              </p>
              <p className="text-xs text-muted-foreground mt-1">Estimativa: peso ÷ 100 kg/m²</p>
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
                              onClick={() => setItemParaExcluir(item.id)}
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
                  <Label className="text-muted-foreground">BDI</Label>
                  {editandoBDI ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number" min={0} max={100} step={0.5}
                        value={bdiInput}
                        onChange={(e) => setBdiInput(parseFloat(e.target.value) || 0)}
                        className="w-20 h-8 text-sm"
                        disabled={salvandoBDI} autoFocus
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
                        onClick={() => { setEditandoBDI(false); setBdiInput(composicaoPintura.bdi?.percentual ?? 0); }}
                        disabled={salvandoBDI}>
                        <X className="h-3 w-3" />
                      </Button>
                      <Button size="sm" className="h-8 w-8 p-0" onClick={handleSalvarBDI} disabled={salvandoBDI}>
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(composicaoPintura.bdi?.valor ?? 0)}
                      </p>
                      <span className="text-sm text-muted-foreground">({composicaoPintura.bdi?.percentual ?? 0}%)</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditandoBDI(true)} title="Editar BDI">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
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
        composicaoId={composicaoPintura?.id ?? ''}
        areaTotal={areaTotal}
      />

      <EditItemDialog
        open={dialogEditAberto}
        onOpenChange={setDialogEditAberto}
        onUpdate={handleAtualizarItem}
        item={itemParaEditar}
      />

      {/* Confirmação de Exclusão */}
      <AlertDialog
        open={!!itemParaExcluir}
        onOpenChange={(open) => { if (!open) setItemParaExcluir(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este item de pintura? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarExclusao}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
