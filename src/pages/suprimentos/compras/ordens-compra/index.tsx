// Página de Listagem de Ordens de Compra
import { useState, useMemo } from 'react';
import {
  useOrdensCompra,
  useDeleteOrdemCompra,
  useConfirmarOrdemCompra,
} from '@/hooks/suprimentos/compras/useOrdensCompra';
import {
  OrdemCompra,
  ordemCompraStatusLabels,
  ordemCompraStatusVariants,
} from '@/interfaces/suprimentos/compras/OrdemCompraInterface';
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
  CheckCircle,
  FileText,
  Download,
  Package,
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

export default function OrdensCompraPage() {
  const { data: ordens = [], isLoading, isError } = useOrdensCompra();
  const deleteMutation = useDeleteOrdemCompra();
  const confirmarMutation = useConfirmarOrdemCompra();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Estado para delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ordemToDelete, setOrdemToDelete] = useState<OrdemCompra | null>(null);

  const filteredOrdens = useMemo(() => {
    return ordens.filter((o) => {
      const matchesSearch =
        o.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.fornecedor_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.requisicao_numero?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [ordens, searchTerm, statusFilter]);

  const handleDeleteClick = (ordem: OrdemCompra) => {
    setOrdemToDelete(ordem);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ordemToDelete) {
      deleteMutation.mutate(ordemToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setOrdemToDelete(null);
        },
      });
    }
  };

  const handleConfirmar = (ordem: OrdemCompra) => {
    confirmarMutation.mutate(ordem.id);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
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
          <p className="font-semibold">Erro ao carregar ordens de compra</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: ordens.length,
    rascunho: ordens.filter((o) => o.status === 'rascunho').length,
    enviadas: ordens.filter((o) => o.status === 'enviada').length,
    confirmadas: ordens.filter((o) => o.status === 'confirmada').length,
    recebidas: ordens.filter((o) => o.status === 'recebida').length,
    valor_total: ordens.reduce((sum, o) => sum + o.valor_total, 0),
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ordens de Compra</h1>
          <p className="text-muted-foreground">Gerencie ordens de compra e recebimentos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ordem de Compra
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Rascunhos</p>
          <p className="text-2xl font-bold text-gray-600">{stats.rascunho}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Enviadas</p>
          <p className="text-2xl font-bold text-blue-600">{stats.enviadas}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Confirmadas</p>
          <p className="text-2xl font-bold text-orange-600">{stats.confirmadas}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Recebidas</p>
          <p className="text-2xl font-bold text-green-600">{stats.recebidas}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Valor Total</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.valor_total)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, fornecedor ou requisição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="rascunho">Rascunhos</SelectItem>
            <SelectItem value="aguardando_envio">Aguardando Envio</SelectItem>
            <SelectItem value="enviada">Enviadas</SelectItem>
            <SelectItem value="confirmada">Confirmadas</SelectItem>
            <SelectItem value="parcialmente_recebida">Parcialmente Recebidas</SelectItem>
            <SelectItem value="recebida">Recebidas</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Data Emissão</TableHead>
              <TableHead>Previsão Entrega</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrdens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Nenhuma ordem encontrada'
                    : 'Nenhuma ordem de compra cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrdens.map((ordem) => (
                <TableRow key={ordem.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-semibold">{ordem.numero}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{ordem.fornecedor_nome}</p>
                      {ordem.fornecedor_cnpj && (
                        <p className="text-xs text-muted-foreground">{ordem.fornecedor_cnpj}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(ordem.data_emissao)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(ordem.data_previsao_entrega)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{ordem.items.length}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{formatCurrency(ordem.valor_total)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ordemCompraStatusVariants[ordem.status]}>
                      {ordemCompraStatusLabels[ordem.status]}
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

                        {ordem.status === 'enviada' && (
                          <>
                            <DropdownMenuItem onClick={() => handleConfirmar(ordem)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}

                        {(ordem.status === 'confirmada' ||
                          ordem.status === 'parcialmente_recebida') && (
                          <>
                            <DropdownMenuItem>
                              <Package className="mr-2 h-4 w-4" />
                              Registrar Recebimento
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}

                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Baixar PDF
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(ordem)}
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
        Mostrando {filteredOrdens.length} de {ordens.length} ordens de compra
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a ordem de compra{' '}
              <span className="font-semibold">{ordemToDelete?.numero}</span>? Esta ação não pode
              ser desfeita.
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
