// Página de Listagem de Check-lists de Retorno - Logística
import { useState, useMemo } from 'react';
import { useChecklistsRetorno, useDeleteChecklistRetorno } from '@/hooks/suprimentos/logistica/useChecklistsRetorno';
import { ChecklistRetorno, combustivelNivelLabels } from '@/interfaces/suprimentos/logistica/ChecklistRetornoInterface';
import ChecklistRetornoFormDialog from './components/ChecklistRetornoFormDialog';
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
import { Loader2, Plus, Search, MoreVertical, Pencil, Trash2, Clock, Car, User, AlertTriangle, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSortableData } from '@/lib/table-utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ChecklistsRetornoPage() {
  const { data: checklists = [], isLoading, isError } = useChecklistsRetorno();
  const deleteMutation = useDeleteChecklistRetorno();

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistRetorno | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<ChecklistRetorno | null>(null);

  const filteredChecklists = useMemo(() => {
    return checklists.filter((c) => {
      const matchesSearch =
        c.veiculo_placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.veiculo_modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.motorista_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [checklists, searchTerm]);

  const { sortedData, sortConfig, requestSort } = useSortableData<ChecklistRetorno>(filteredChecklists);

  const renderSortableHeader = (label: string, key: keyof ChecklistRetorno) => {
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

  const handleCreateChecklist = () => {
    setDialogMode('create');
    setSelectedChecklist(null);
    setDialogOpen(true);
  };

  const handleEditChecklist = (checklist: ChecklistRetorno) => {
    setDialogMode('edit');
    setSelectedChecklist(checklist);
    setDialogOpen(true);
  };

  const handleDeleteClick = (checklist: ChecklistRetorno) => {
    setChecklistToDelete(checklist);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (checklistToDelete) {
      deleteMutation.mutate(checklistToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setChecklistToDelete(null);
        },
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
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
          <p className="font-semibold">Erro ao carregar check-lists de retorno</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Check-lists de Retorno</h1>
          <p className="text-muted-foreground">
            Gerencie os check-lists de retorno dos veículos
          </p>
        </div>
        <Button onClick={handleCreateChecklist}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Check-list
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por veículo ou motorista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Motorista</TableHead>
              {renderSortableHeader('KM Final / Rodado', 'km_final')}
              {renderSortableHeader('Combustível', 'combustivel_nivel')}
              {renderSortableHeader('Data/Hora Retorno', 'data_hora_retorno')}
              {renderSortableHeader('Danos', 'novos_danos')}
              {renderSortableHeader('Limpeza', 'limpeza_ok')}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {searchTerm ? 'Nenhum check-list encontrado' : 'Nenhum check-list cadastrado'}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((checklist, index) => (
                <TableRow key={checklist.id}>
                  <TableCell className="text-muted-foreground text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{checklist.veiculo_placa}</p>
                        {checklist.veiculo_modelo && (
                          <p className="text-sm text-muted-foreground">
                            {checklist.veiculo_modelo}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{checklist.motorista_nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {checklist.km_final.toLocaleString('pt-BR')} km
                      </p>
                      {checklist.km_rodado !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          +{checklist.km_rodado} km rodado
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {combustivelNivelLabels[checklist.combustivel_nivel]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      {formatDateTime(checklist.data_hora_retorno)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {checklist.novos_danos ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Com Danos
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Sem Danos
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {checklist.limpeza_ok ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Limpo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Sujo
                      </Badge>
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
                        <DropdownMenuItem onClick={() => handleEditChecklist(checklist)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(checklist)}
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
        Mostrando {sortedData.length} de {checklists.length} check-lists
      </div>

      {/* Dialog de Criação/Edição */}
      <ChecklistRetornoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        checklist={selectedChecklist}
        mode={dialogMode}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o check-list de retorno do veículo{' '}
              <span className="font-semibold">{checklistToDelete?.veiculo_placa}</span>? Esta
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
