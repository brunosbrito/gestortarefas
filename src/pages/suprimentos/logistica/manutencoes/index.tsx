// Página de Listagem de Manutenções - Logística
import { useState, useMemo } from 'react';
import {
  useManutencoes,
  useDeleteManutencao,
  useIniciarManutencao,
  useConcluirManutencao,
} from '@/hooks/suprimentos/logistica/useManutencoes';
import { Manutencao, manutencaoStatusLabels, manutencaoStatusVariants } from '@/interfaces/suprimentos/logistica/ManutencaoInterface';
import ManutencaoFormDialog from './components/ManutencaoFormDialog';
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
  Car,
  Play,
  CheckCircle,
  DollarSign,
  Calendar,
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

export default function ManutencoesPage() {
  const { data: manutencoes = [], isLoading, isError } = useManutencoes();
  const deleteMutation = useDeleteManutencao();
  const iniciarMutation = useIniciarManutencao();
  const concluirMutation = useConcluirManutencao();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedManutencao, setSelectedManutencao] = useState<Manutencao | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manutencaoToDelete, setManutencaoToDelete] = useState<Manutencao | null>(null);

  const filteredManutencoes = useMemo(() => {
    return manutencoes.filter((m) => {
      const matchesSearch =
        m.veiculo_placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.veiculo_modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.tipo_manutencao_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.descricao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [manutencoes, searchTerm, statusFilter]);

  const handleCreateManutencao = () => {
    setDialogMode('create');
    setSelectedManutencao(null);
    setDialogOpen(true);
  };

  const handleEditManutencao = (manutencao: Manutencao) => {
    setDialogMode('edit');
    setSelectedManutencao(manutencao);
    setDialogOpen(true);
  };

  const handleDeleteClick = (manutencao: Manutencao) => {
    setManutencaoToDelete(manutencao);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (manutencaoToDelete) {
      deleteMutation.mutate(manutencaoToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setManutencaoToDelete(null);
        },
      });
    }
  };

  const handleIniciar = (manutencao: Manutencao) => {
    iniciarMutation.mutate(manutencao.id);
  };

  const handleConcluir = (manutencao: Manutencao) => {
    concluirMutation.mutate(manutencao.id);
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
          <p className="font-semibold">Erro ao carregar manutenções</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: manutencoes.length,
    agendadas: manutencoes.filter((m) => m.status === 'agendada').length,
    em_andamento: manutencoes.filter((m) => m.status === 'em_andamento').length,
    concluidas: manutencoes.filter((m) => m.status === 'concluida').length,
    custo_total: manutencoes
      .filter((m) => m.status === 'concluida')
      .reduce((sum, m) => sum + m.custo_total, 0),
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manutenções</h1>
          <p className="text-muted-foreground">Gerencie o histórico de manutenções dos veículos</p>
        </div>
        <Button onClick={handleCreateManutencao}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Manutenção
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Agendadas</p>
          <p className="text-2xl font-bold text-orange-600">{stats.agendadas}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Em Andamento</p>
          <p className="text-2xl font-bold text-blue-600">{stats.em_andamento}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Concluídas</p>
          <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Custo Total</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.custo_total)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por veículo, tipo ou descrição..."
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
            <SelectItem value="agendada">Agendadas</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluídas</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>KM</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Custo Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManutencoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Nenhuma manutenção encontrada'
                    : 'Nenhuma manutenção cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              filteredManutencoes.map((manutencao) => (
                <TableRow key={manutencao.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{manutencao.veiculo_placa}</p>
                        {manutencao.veiculo_modelo && (
                          <p className="text-sm text-muted-foreground">
                            {manutencao.veiculo_modelo}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{manutencao.tipo_manutencao_nome}</span>
                  </TableCell>
                  <TableCell>
                    {manutencao.fornecedor_servico_nome ? (
                      <span className="text-sm">{manutencao.fornecedor_servico_nome}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {manutencao.km_atual.toLocaleString('pt-BR')} km
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {manutencao.status === 'agendada' && formatDate(manutencao.data_agendada)}
                      {manutencao.status === 'em_andamento' && formatDate(manutencao.data_inicio)}
                      {manutencao.status === 'concluida' && formatDate(manutencao.data_conclusao)}
                      {manutencao.status === 'cancelada' && '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                      {formatCurrency(manutencao.custo_total)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={manutencaoStatusVariants[manutencao.status]}>
                      {manutencaoStatusLabels[manutencao.status]}
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

                        {manutencao.status === 'agendada' && (
                          <DropdownMenuItem onClick={() => handleIniciar(manutencao)}>
                            <Play className="mr-2 h-4 w-4" />
                            Iniciar
                          </DropdownMenuItem>
                        )}

                        {manutencao.status === 'em_andamento' && (
                          <DropdownMenuItem onClick={() => handleConcluir(manutencao)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Concluir
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => handleEditManutencao(manutencao)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(manutencao)}
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
        Mostrando {filteredManutencoes.length} de {manutencoes.length} manutenções
      </div>

      {/* Dialog de Criação/Edição */}
      <ManutencaoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        manutencao={selectedManutencao}
        mode={dialogMode}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a manutenção do veículo{' '}
              <span className="font-semibold">{manutencaoToDelete?.veiculo_placa}</span>? Esta
              ação não pode ser desfeita.
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
