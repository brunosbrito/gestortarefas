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
        <Button>
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
              <TableHead>Número</TableHead>
              <TableHead>Requisição</TableHead>
              <TableHead>Data Abertura</TableHead>
              <TableHead>Data Limite</TableHead>
              <TableHead>Fornecedores</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCotacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Nenhuma cotação encontrada'
                    : 'Nenhuma cotação cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCotacoes.map((cotacao) => {
                const fornecedoresInfo = getFornecedoresInfo(cotacao);
                return (
                  <TableRow key={cotacao.id}>
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

                          <DropdownMenuItem>
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
        Mostrando {filteredCotacoes.length} de {cotacoes.length} cotações
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
    </div>
  );
}
