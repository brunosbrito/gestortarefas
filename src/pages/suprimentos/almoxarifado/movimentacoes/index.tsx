// Página de Listagem de Movimentações - Almoxarifado
import { useState, useMemo } from 'react';
import { useMovimentacoes, useDeleteMovimentacao } from '@/hooks/suprimentos/almoxarifado/useMovimentacoes';
import {
  Movimentacao,
  movimentacaoTipoLabels,
  movimentacaoTipoVariants,
} from '@/interfaces/suprimentos/almoxarifado/MovimentacaoInterface';
import MovimentacaoFormDialog from './components/MovimentacaoFormDialog';
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
  Package,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
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

export default function MovimentacoesPage() {
  const { data: movimentacoes = [], isLoading, isError } = useMovimentacoes();
  const deleteMutation = useDeleteMovimentacao();

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedMovimentacao, setSelectedMovimentacao] = useState<Movimentacao | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movimentacaoToDelete, setMovimentacaoToDelete] = useState<Movimentacao | null>(null);

  const filteredMovimentacoes = useMemo(() => {
    return movimentacoes.filter((mov) => {
      const matchesSearch =
        mov.item_codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.item_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.responsavel_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.documento_numero?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTipo = tipoFilter === 'all' || mov.tipo === tipoFilter;

      return matchesSearch && matchesTipo;
    });
  }, [movimentacoes, searchTerm, tipoFilter]);

  const { sortedData, sortConfig, requestSort } = useSortableData<Movimentacao>(filteredMovimentacoes);

  const renderSortableHeader = (label: string, key: keyof Movimentacao) => {
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

  const handleCreateMovimentacao = () => {
    setDialogMode('create');
    setSelectedMovimentacao(null);
    setDialogOpen(true);
  };

  const handleEditMovimentacao = (movimentacao: Movimentacao) => {
    setDialogMode('edit');
    setSelectedMovimentacao(movimentacao);
    setDialogOpen(true);
  };

  const handleDeleteClick = (movimentacao: Movimentacao) => {
    setMovimentacaoToDelete(movimentacao);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (movimentacaoToDelete) {
      deleteMutation.mutate(movimentacaoToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setMovimentacaoToDelete(null);
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
          <p className="font-semibold">Erro ao carregar movimentações</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: movimentacoes.length,
    entradas: movimentacoes.filter((m) => m.tipo === 'entrada').length,
    saidas: movimentacoes.filter((m) => m.tipo === 'saida').length,
    transferencias: movimentacoes.filter((m) => m.tipo === 'transferencia').length,
    quantidade_total: movimentacoes.reduce((sum, m) => sum + m.quantidade, 0),
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
          <p className="text-muted-foreground">Gerencie entradas, saídas e transferências</p>
        </div>
        <Button onClick={handleCreateMovimentacao}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Movimentação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Movimentações</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <p className="text-sm text-muted-foreground">Entradas</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.entradas}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <p className="text-sm text-muted-foreground">Saídas</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.saidas}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-muted-foreground">Transferências</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.transferencias}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Quantidade Total</p>
          <p className="text-2xl font-bold">{stats.quantidade_total.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por item, responsável, motivo ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="entrada">Entradas</SelectItem>
            <SelectItem value="saida">Saídas</SelectItem>
            <SelectItem value="transferencia">Transferências</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              {renderSortableHeader('Data', 'data_movimentacao')}
              {renderSortableHeader('Tipo', 'tipo')}
              {renderSortableHeader('Item', 'item_nome')}
              <TableHead>Quantidade</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Destino</TableHead>
              {renderSortableHeader('Responsável', 'responsavel_nome')}
              <TableHead>Documento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  {searchTerm || tipoFilter !== 'all'
                    ? 'Nenhuma movimentação encontrada'
                    : 'Nenhuma movimentação registrada'}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((mov, index) => (
                <TableRow key={mov.id}>
                  <TableCell className="text-muted-foreground text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {format(new Date(mov.data_movimentacao), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(mov.data_movimentacao), 'HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={movimentacaoTipoVariants[mov.tipo]}>
                      {movimentacaoTipoLabels[mov.tipo]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{mov.item_nome}</p>
                        <p className="text-xs text-muted-foreground">{mov.item_codigo}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {mov.quantidade.toLocaleString('pt-BR')} {mov.item_unidade}
                      </p>
                      {mov.motivo && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {mov.motivo}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {mov.localizacao_origem ? (
                      <span className="text-sm">{mov.localizacao_origem}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {mov.localizacao_destino ? (
                      <span className="text-sm">{mov.localizacao_destino}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{mov.responsavel_nome}</span>
                  </TableCell>
                  <TableCell>
                    {mov.documento_numero ? (
                      <div>
                        <p className="text-sm font-mono">{mov.documento_numero}</p>
                        {mov.documento_tipo && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {mov.documento_tipo.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
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
                        <DropdownMenuItem onClick={() => handleEditMovimentacao(mov)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(mov)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {sortedData.length} de {movimentacoes.length} movimentações
      </div>

      {/* Dialog de Criação/Edição */}
      <MovimentacaoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        movimentacao={selectedMovimentacao}
        mode={dialogMode}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta movimentação de{' '}
              <span className="font-semibold">{movimentacaoToDelete?.item_nome}</span>? Esta ação
              não pode ser desfeita.
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
