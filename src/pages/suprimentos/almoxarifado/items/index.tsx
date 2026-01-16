// Página de Listagem de Items - Almoxarifado
import { useState, useMemo } from 'react';
import { useItems, useDeleteItem } from '@/hooks/suprimentos/almoxarifado/useItems';
import {
  Item,
  itemCategoriaLabels,
  itemCategoriaVariants,
  itemUnidadeLabels,
} from '@/interfaces/suprimentos/almoxarifado/ItemInterface';
import ItemFormDialog from './components/ItemFormDialog';
import { useSortableData } from '@/lib/table-utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import {
  Loader2,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ItemsPage() {
  const { data: items = [], isLoading, isError } = useItems();
  const deleteMutation = useDeleteItem();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.localizacao?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategoria = categoriaFilter === 'all' || item.categoria === categoriaFilter;

      return matchesSearch && matchesCategoria;
    });
  }, [items, searchTerm, categoriaFilter]);

  const { sortedData, sortConfig, requestSort } = useSortableData<Item>(filteredItems);

  const renderSortableHeader = (label: string, key: keyof Item) => {
    const isActive = sortConfig?.key === key;
    const direction = sortConfig?.direction;

    return (
      <TableHead
        onClick={() => requestSort(key)}
        className="cursor-pointer hover:bg-accent/50 select-none transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {isActive && (
            direction === 'asc' ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )
          )}
        </div>
      </TableHead>
    );
  };

  const getEstoqueStatus = (item: Item) => {
    if (!item.estoque_minimo) return null;
    if (item.estoque_atual <= item.estoque_minimo) {
      return 'critico';
    }
    if (item.estoque_atual <= item.estoque_minimo * 1.2) {
      return 'baixo';
    }
    return 'normal';
  };

  const handleCreateItem = () => {
    setDialogMode('create');
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setDialogMode('edit');
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
          <p className="font-semibold">Erro ao carregar items</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: items.length,
    ativos: items.filter((i) => i.ativo).length,
    estoque_baixo: items.filter(
      (i) => i.estoque_minimo && i.estoque_atual <= i.estoque_minimo * 1.2
    ).length,
    estoque_critico: items.filter((i) => i.estoque_minimo && i.estoque_atual <= i.estoque_minimo)
      .length,
    valor_total: items
      .filter((i) => i.valor_unitario)
      .reduce((sum, i) => sum + (i.valor_unitario || 0) * i.estoque_atual, 0),
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Items de Almoxarifado</h1>
          <p className="text-muted-foreground">Gerencie o cadastro de items e estoque</p>
        </div>
        <Button onClick={handleCreateItem}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Estoque Baixo</p>
          <p className="text-2xl font-bold text-orange-600">{stats.estoque_baixo}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Estoque Crítico</p>
          <p className="text-2xl font-bold text-red-600">{stats.estoque_critico}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Valor Total</p>
          <p className="text-2xl font-bold">
            {stats.valor_total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nome, descrição ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="materia_prima">Matéria-Prima</SelectItem>
            <SelectItem value="produto_acabado">Produto Acabado</SelectItem>
            <SelectItem value="componente">Componente</SelectItem>
            <SelectItem value="ferramenta">Ferramenta</SelectItem>
            <SelectItem value="epi">EPI</SelectItem>
            <SelectItem value="consumivel">Consumível</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              {renderSortableHeader('Código', 'codigo')}
              {renderSortableHeader('Nome', 'nome')}
              {renderSortableHeader('Categoria', 'categoria')}
              {renderSortableHeader('Unidade', 'unidade')}
              {renderSortableHeader('Estoque Atual', 'estoque_atual')}
              <TableHead>Localização</TableHead>
              {renderSortableHeader('Valor Unit.', 'valor_unitario')}
              {renderSortableHeader('Status', 'ativo')}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  {searchTerm || categoriaFilter !== 'all'
                    ? 'Nenhum item encontrado'
                    : 'Nenhum item cadastrado'}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => {
                const estoqueStatus = getEstoqueStatus(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-mono font-semibold">{item.codigo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{item.nome}</p>
                        {item.descricao && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {item.descricao}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={itemCategoriaVariants[item.categoria]}>
                        {itemCategoriaLabels[item.categoria]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{itemUnidadeLabels[item.unidade]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.estoque_atual.toLocaleString('pt-BR')}</span>
                        {estoqueStatus === 'critico' && (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        {estoqueStatus === 'baixo' && (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      {item.estoque_minimo && (
                        <p className="text-xs text-muted-foreground">
                          Mín: {item.estoque_minimo.toLocaleString('pt-BR')}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.localizacao ? (
                        <span className="text-sm">{item.localizacao}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.valor_unitario ? (
                        <span className="text-sm">
                          {item.valor_unitario.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.ativo ? 'default' : 'secondary'}>
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditItem(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(item)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {sortedData.length} de {items.length} items
      </div>

      {/* Dialog de Criação/Edição */}
      <ItemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
        mode={dialogMode}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o item{' '}
              <span className="font-semibold">{itemToDelete?.nome}</span>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
