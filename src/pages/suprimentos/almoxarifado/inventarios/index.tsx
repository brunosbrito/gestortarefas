// Página de Listagem de Inventários - Almoxarifado
import { useState, useMemo } from 'react';
import {
  useInventarios,
  useDeleteInventario,
  useConcluirInventario,
  useAjustarEstoque,
} from '@/hooks/suprimentos/almoxarifado/useInventarios';
import {
  Inventario,
  inventarioStatusLabels,
  inventarioStatusVariants,
} from '@/interfaces/suprimentos/almoxarifado/InventarioInterface';
import InventarioFormDialog from './components/InventarioFormDialog';
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
  ArrowUp,
  ArrowDown,
  ClipboardList,
  CheckCircle,
  Settings,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function InventariosPage() {
  const { data: inventarios = [], isLoading, isError } = useInventarios();
  const deleteMutation = useDeleteInventario();
  const concluirMutation = useConcluirInventario();
  const ajustarMutation = useAjustarEstoque();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedInventario, setSelectedInventario] = useState<Inventario | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inventarioToDelete, setInventarioToDelete] = useState<Inventario | null>(null);

  const filteredInventarios = useMemo(() => {
    return inventarios.filter((inv) => {
      const matchesSearch =
        inv.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.responsavel_nome?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventarios, searchTerm, statusFilter]);

  const { sortedData, sortConfig, requestSort } = useSortableData<Inventario>(filteredInventarios);

  const renderSortableHeader = (label: string, key: keyof Inventario) => {
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

  const handleCreateInventario = () => {
    setDialogMode('create');
    setSelectedInventario(null);
    setDialogOpen(true);
  };

  const handleEditInventario = (inventario: Inventario) => {
    setDialogMode('edit');
    setSelectedInventario(inventario);
    setDialogOpen(true);
  };

  const handleDeleteClick = (inventario: Inventario) => {
    setInventarioToDelete(inventario);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (inventarioToDelete) {
      deleteMutation.mutate(inventarioToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setInventarioToDelete(null);
        },
      });
    }
  };

  const handleConcluir = (id: number) => {
    concluirMutation.mutate(id);
  };

  const handleAjustarEstoque = (id: number) => {
    ajustarMutation.mutate(id);
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
          <p className="font-semibold">Erro ao carregar inventários</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: inventarios.length,
    em_andamento: inventarios.filter((i) => i.status === 'em_andamento').length,
    concluidos: inventarios.filter((i) => i.status === 'concluido').length,
    ajustados: inventarios.filter((i) => i.status === 'ajustado').length,
    total_divergencias: inventarios.reduce((sum, i) => sum + i.total_divergencias, 0),
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventários</h1>
          <p className="text-muted-foreground">Gerencie contagens físicas de estoque</p>
        </div>
        <Button onClick={handleCreateInventario}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Inventário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Inventários</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-muted-foreground">Em Andamento</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.em_andamento}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-muted-foreground">Concluídos</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.concluidos}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-600" />
            <p className="text-sm text-muted-foreground">Ajustados</p>
          </div>
          <p className="text-2xl font-bold text-gray-600">{stats.ajustados}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Divergências</p>
          <p className="text-2xl font-bold text-orange-600">{stats.total_divergencias}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, descrição ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluídos</SelectItem>
            <SelectItem value="ajustado">Ajustados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              {renderSortableHeader('Código', 'codigo')}
              <TableHead>Descrição</TableHead>
              {renderSortableHeader('Status', 'status')}
              {renderSortableHeader('Data Início', 'data_inicio')}
              <TableHead>Data Conclusão</TableHead>
              {renderSortableHeader('Responsável', 'responsavel_nome')}
              <TableHead>Progresso</TableHead>
              <TableHead>Divergências</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Nenhum inventário encontrado'
                    : 'Nenhum inventário cadastrado'}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((inv, index) => {
                const progressPercent = inv.total_items > 0
                  ? Math.round((inv.items_contados / inv.total_items) * 100)
                  : 0;

                return (
                  <TableRow key={inv.id}>
                    <TableCell className="text-muted-foreground text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-mono font-semibold">{inv.codigo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inv.descricao || '-'}</p>
                        {inv.observacoes && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {inv.observacoes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={inventarioStatusVariants[inv.status]}>
                        {inventarioStatusLabels[inv.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {format(new Date(inv.data_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </TableCell>
                    <TableCell>
                      {inv.data_conclusao ? (
                        <p className="text-sm">
                          {format(new Date(inv.data_conclusao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{inv.responsavel_nome}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{progressPercent}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {inv.items_contados} / {inv.total_items} items
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {inv.total_divergencias > 0 ? (
                        <span className="text-sm font-semibold text-orange-600">
                          {inv.total_divergencias}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">0</span>
                      )}
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
                          <DropdownMenuItem>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditInventario(inv)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {inv.status === 'em_andamento' && (
                            <DropdownMenuItem onClick={() => handleConcluir(inv.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Concluir
                            </DropdownMenuItem>
                          )}
                          {inv.status === 'concluido' && (
                            <DropdownMenuItem onClick={() => handleAjustarEstoque(inv.id)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Ajustar Estoque
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(inv)}
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
        Mostrando {sortedData.length} de {inventarios.length} inventários
      </div>

      {/* Dialog de Criação/Edição */}
      <InventarioFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        inventario={selectedInventario}
        mode={dialogMode}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o inventário{' '}
              <span className="font-semibold">{inventarioToDelete?.codigo}</span>? Esta ação não
              pode ser desfeita.
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
