// Página de Listagem de Requisições de Compra
import { useState, useMemo } from 'react';
import {
  useRequisicoes,
  useDeleteRequisicao,
  useAprovarRequisicao,
  useReprovarRequisicao,
} from '@/hooks/suprimentos/compras/useRequisicoes';
import {
  Requisicao,
  requisicaoStatusLabels,
  requisicaoStatusVariants,
  requisicaoPrioridadeLabels,
  requisicaoPrioridadeVariants,
} from '@/interfaces/suprimentos/compras/RequisicaoInterface';
import RequisicaoFormDialog from './components/RequisicaoFormDialog';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  ShoppingCart,
  FileText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RequisicoesPage() {
  const { data: requisicoes = [], isLoading, isError } = useRequisicoes();
  const deleteMutation = useDeleteRequisicao();
  const aprovarMutation = useAprovarRequisicao();
  const reprovarMutation = useReprovarRequisicao();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Estado para delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requisicaoToDelete, setRequisicaoToDelete] = useState<Requisicao | null>(null);

  // Estado para reprovar dialog
  const [reprovarDialogOpen, setReprovarDialogOpen] = useState(false);
  const [requisicaoToReprovar, setRequisicaoToReprovar] = useState<Requisicao | null>(null);
  const [motivoReprovacao, setMotivoReprovacao] = useState('');

  // Estado para form dialog
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRequisicao, setSelectedRequisicao] = useState<Requisicao | null>(null);

  const filteredRequisicoes = useMemo(() => {
    return requisicoes.filter((r) => {
      const matchesSearch =
        r.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.solicitante_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.obra_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.centro_custo_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.justificativa.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requisicoes, searchTerm, statusFilter]);

  const handleDeleteClick = (requisicao: Requisicao) => {
    setRequisicaoToDelete(requisicao);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (requisicaoToDelete) {
      deleteMutation.mutate(requisicaoToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setRequisicaoToDelete(null);
        },
      });
    }
  };

  const handleAprovar = (requisicao: Requisicao) => {
    // Mock aprovador ID = 1 (em produção, viria do usuário logado)
    aprovarMutation.mutate({ id: requisicao.id, aprovadorId: 1 });
  };

  const handleReprovarClick = (requisicao: Requisicao) => {
    setRequisicaoToReprovar(requisicao);
    setMotivoReprovacao('');
    setReprovarDialogOpen(true);
  };

  const handleConfirmReprovar = () => {
    if (requisicaoToReprovar && motivoReprovacao.trim()) {
      reprovarMutation.mutate(
        {
          id: requisicaoToReprovar.id,
          aprovadorId: 1, // Mock
          motivo: motivoReprovacao,
        },
        {
          onSuccess: () => {
            setReprovarDialogOpen(false);
            setRequisicaoToReprovar(null);
            setMotivoReprovacao('');
          },
        }
      );
    }
  };

  const handleCreateRequisicao = () => {
    setFormMode('create');
    setSelectedRequisicao(null);
    setFormDialogOpen(true);
  };

  const handleEditRequisicao = (requisicao: Requisicao) => {
    setFormMode('edit');
    setSelectedRequisicao(requisicao);
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
          <p className="font-semibold">Erro ao carregar requisições</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: requisicoes.length,
    rascunho: requisicoes.filter((r) => r.status === 'rascunho').length,
    pendente: requisicoes.filter((r) => r.status === 'pendente').length,
    aprovadas: requisicoes.filter((r) => r.status === 'aprovada').length,
    em_cotacao: requisicoes.filter((r) => r.status === 'em_cotacao').length,
    total_items: requisicoes.reduce((sum, r) => sum + r.items.length, 0),
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Requisições de Compra</h1>
          <p className="text-muted-foreground">Gerencie as requisições e aprovações</p>
        </div>
        <Button onClick={handleCreateRequisicao}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Requisição
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
          <p className="text-sm text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pendente}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Aprovadas</p>
          <p className="text-2xl font-bold text-green-600">{stats.aprovadas}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Em Cotação</p>
          <p className="text-2xl font-bold text-blue-600">{stats.em_cotacao}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold">{stats.total_items}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, solicitante, obra ou justificativa..."
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
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="aprovada">Aprovadas</SelectItem>
            <SelectItem value="reprovada">Reprovadas</SelectItem>
            <SelectItem value="em_cotacao">Em Cotação</SelectItem>
            <SelectItem value="cotada">Cotadas</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Obra/Centro Custo</TableHead>
              <TableHead>Data Requisição</TableHead>
              <TableHead>Data Necessidade</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequisicoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Nenhuma requisição encontrada'
                    : 'Nenhuma requisição cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRequisicoes.map((requisicao) => (
                <TableRow key={requisicao.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-semibold">{requisicao.numero}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{requisicao.solicitante_nome}</span>
                  </TableCell>
                  <TableCell>
                    {requisicao.obra_nome ? (
                      <div>
                        <p className="text-sm font-medium">{requisicao.obra_nome}</p>
                        {requisicao.centro_custo_nome && (
                          <p className="text-xs text-muted-foreground">{requisicao.centro_custo_nome}</p>
                        )}
                      </div>
                    ) : requisicao.centro_custo_nome ? (
                      <span className="text-sm">{requisicao.centro_custo_nome}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(requisicao.data_requisicao)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(requisicao.data_necessidade)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{requisicao.items.length}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={requisicaoPrioridadeVariants[requisicao.prioridade]}>
                      {requisicaoPrioridadeLabels[requisicao.prioridade]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={requisicaoStatusVariants[requisicao.status]}>
                      {requisicaoStatusLabels[requisicao.status]}
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

                        {requisicao.status === 'pendente' && (
                          <>
                            <DropdownMenuItem onClick={() => handleAprovar(requisicao)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Aprovar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReprovarClick(requisicao)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reprovar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}

                        {requisicao.status === 'aprovada' && (
                          <>
                            <DropdownMenuItem>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Iniciar Cotação
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}

                        <DropdownMenuItem onClick={() => handleEditRequisicao(requisicao)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(requisicao)}
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
        Mostrando {filteredRequisicoes.length} de {requisicoes.length} requisições
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a requisição{' '}
              <span className="font-semibold">{requisicaoToDelete?.numero}</span>? Esta ação não
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

      {/* Dialog de Reprovação */}
      <Dialog open={reprovarDialogOpen} onOpenChange={setReprovarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprovar Requisição</DialogTitle>
            <DialogDescription>
              Informe o motivo da reprovação da requisição{' '}
              <span className="font-semibold">{requisicaoToReprovar?.numero}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Digite o motivo da reprovação..."
              value={motivoReprovacao}
              onChange={(e) => setMotivoReprovacao(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReprovarDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReprovar}
              disabled={!motivoReprovacao.trim() || reprovarMutation.isPending}
            >
              {reprovarMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Criação/Edição */}
      <RequisicaoFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        requisicao={selectedRequisicao}
        mode={formMode}
      />
    </div>
  );
}
