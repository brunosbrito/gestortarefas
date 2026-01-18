// Página de Listagem de Cotações
import { useState, useMemo } from 'react';
import {
  useCotacoes,
  useDeleteCotacao,
  useFinalizarCotacao,
} from '@/hooks/suprimentos/compras/useCotacoes';
import {
  Cotacao,
  cotacaoStatusLabels,
  cotacaoStatusVariants,
} from '@/interfaces/suprimentos/compras/CotacaoInterface';
import { CotacaoFormDialog } from './components/CotacaoFormDialog';
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
  CheckCircle,
  FileText,
  Users,
  ShoppingCart,
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CotacoesPage() {
  const { data: cotacoes = [], isLoading, isError } = useCotacoes();
  const deleteMutation = useDeleteCotacao();
  const finalizarMutation = useFinalizarCotacao();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Estado para delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cotacaoToDelete, setCotacaoToDelete] = useState<Cotacao | null>(null);

  // Estado para formulário
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [cotacaoToEdit, setCotacaoToEdit] = useState<Cotacao | null>(null);

  // User ID (em produção, viria do auth context)
  const userId = 1;

  const filteredCotacoes = useMemo(() => {
    return cotacoes.filter((c) => {
      const matchesSearch =
        c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.requisicao_numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.fornecedores.some((f) =>
          f.fornecedor_nome.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cotacoes, searchTerm, statusFilter]);

  const { sortedData, sortConfig, requestSort } = useSortableData<Cotacao>(filteredCotacoes);

  const renderSortableHeader = (label: string, key: keyof Cotacao) => {
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

  const handleDeleteClick = (cotacao: Cotacao) => {
    setCotacaoToDelete(cotacao);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cotacaoToDelete) {
      deleteMutation.mutate(cotacaoToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setCotacaoToDelete(null);
        },
      });
    }
  };

  const handleFinalizar = (cotacao: Cotacao) => {
    finalizarMutation.mutate(cotacao.id);
  };

  const handleCreateClick = () => {
    setCotacaoToEdit(null);
    setFormDialogOpen(true);
  };

  const handleEditClick = (cotacao: Cotacao) => {
    setCotacaoToEdit(cotacao);
    setFormDialogOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getFornecedoresInfo = (cotacao: Cotacao) => {
    const total = cotacao.fornecedores.length;
    const responderam = cotacao.fornecedores.filter((f) => f.respondeu).length;
    return { total, responderam };
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
          <p className="font-semibold">Erro ao carregar cotações</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: cotacoes.length,
    aguardando: cotacoes.filter((c) => c.status === 'aguardando').length,
    em_analise: cotacoes.filter((c) => c.status === 'em_analise').length,
    finalizadas: cotacoes.filter((c) => c.status === 'finalizada').length,
    total_fornecedores: cotacoes.reduce((sum, c) => sum + c.fornecedores.length, 0),
    fornecedores_responderam: cotacoes.reduce(
      (sum, c) => sum + c.fornecedores.filter((f) => f.respondeu).length,
      0
    ),
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cotações</h1>
          <p className="text-muted-foreground">Gerencie cotações e análise de propostas</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Cotação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Aguardando</p>
          <p className="text-2xl font-bold text-orange-600">{stats.aguardando}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Em Análise</p>
          <p className="text-2xl font-bold text-blue-600">{stats.em_analise}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Finalizadas</p>
          <p className="text-2xl font-bold text-green-600">{stats.finalizadas}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Fornecedores</p>
          <p className="text-2xl font-bold">{stats.total_fornecedores}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Responderam</p>
          <p className="text-2xl font-bold text-green-600">{stats.fornecedores_responderam}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, requisição ou fornecedor..."
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
            <SelectItem value="aguardando">Aguardando</SelectItem>
            <SelectItem value="em_analise">Em Análise</SelectItem>
            <SelectItem value="finalizada">Finalizadas</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              {renderSortableHeader('Número', 'numero')}
              {renderSortableHeader('Requisição', 'requisicao_numero')}
              {renderSortableHeader('Data Abertura', 'data_abertura')}
              {renderSortableHeader('Data Limite', 'data_limite_resposta')}
              <TableHead>Fornecedores</TableHead>
              <TableHead>Items</TableHead>
              {renderSortableHeader('Status', 'status')}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Nenhuma cotação encontrada'
                    : 'Nenhuma cotação cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((cotacao, index) => {
                const fornecedoresInfo = getFornecedoresInfo(cotacao);
                return (
                  <TableRow key={cotacao.id}>
                    <TableCell className="text-muted-foreground text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-semibold">{cotacao.numero}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{cotacao.requisicao_numero}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(cotacao.data_abertura)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(cotacao.data_limite_resposta)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {fornecedoresInfo.responderam}/{fornecedoresInfo.total}
                        </span>
                        {fornecedoresInfo.responderam === fornecedoresInfo.total &&
                          fornecedoresInfo.total > 0 && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{cotacao.requisicao_items.length}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cotacaoStatusVariants[cotacao.status]}>
                        {cotacaoStatusLabels[cotacao.status]}
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

                          {cotacao.status === 'em_analise' && (
                            <>
                              <DropdownMenuItem onClick={() => handleFinalizar(cotacao)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Finalizar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}

                          {cotacao.status === 'finalizada' && (
                            <>
                              <DropdownMenuItem>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Gerar Ordem de Compra
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}

                          <DropdownMenuItem onClick={() => handleEditClick(cotacao)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(cotacao)}
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
        Mostrando {sortedData.length} de {cotacoes.length} cotações
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a cotação{' '}
              <span className="font-semibold">{cotacaoToDelete?.numero}</span>? Esta ação não pode
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

      {/* Dialog de Formulário de Cotação */}
      <CotacaoFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        cotacao={cotacaoToEdit}
        userId={userId}
      />
    </div>
  );
}
