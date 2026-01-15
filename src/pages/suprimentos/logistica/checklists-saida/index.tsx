// Página de Listagem de Check-lists de Saída - Logística
import { useState, useMemo } from 'react';
import { useChecklistsSaida, useDeleteChecklistSaida } from '@/hooks/suprimentos/logistica/useChecklistsSaida';
import { ChecklistSaida, combustivelNivelLabels } from '@/interfaces/suprimentos/logistica/ChecklistSaidaInterface';
import ChecklistSaidaFormDialog from './components/ChecklistSaidaFormDialog';
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
import { Loader2, Plus, Search, MoreVertical, Pencil, Trash2, CheckCircle, Clock, Car, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ChecklistsSaidaPage() {
  const { data: checklists = [], isLoading, isError } = useChecklistsSaida();
  const deleteMutation = useDeleteChecklistSaida();

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistSaida | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<ChecklistSaida | null>(null);

  const filteredChecklists = useMemo(() => {
    return checklists.filter((c) => {
      const matchesSearch =
        c.veiculo_placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.veiculo_modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.motorista_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.destino_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [checklists, searchTerm]);

  const handleCreateChecklist = () => {
    setDialogMode('create');
    setSelectedChecklist(null);
    setDialogOpen(true);
  };

  const handleEditChecklist = (checklist: ChecklistSaida) => {
    setDialogMode('edit');
    setSelectedChecklist(checklist);
    setDialogOpen(true);
  };

  const handleDeleteClick = (checklist: ChecklistSaida) => {
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
          <p className="font-semibold">Erro ao carregar check-lists de saída</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Check-lists de Saída</h1>
          <p className="text-muted-foreground">
            Gerencie os check-lists de saída dos veículos
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
          placeholder="Buscar por veículo, motorista ou destino..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead>KM Inicial</TableHead>
              <TableHead>Combustível</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Data/Hora Saída</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChecklists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {searchTerm ? 'Nenhum check-list encontrado' : 'Nenhum check-list cadastrado'}
                </TableCell>
              </TableRow>
            ) : (
              filteredChecklists.map((checklist) => (
                <TableRow key={checklist.id}>
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
                    <span className="font-medium">{checklist.km_inicial.toLocaleString('pt-BR')}</span> km
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {combustivelNivelLabels[checklist.combustivel_nivel]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {checklist.destino_nome ? (
                      <span className="text-sm">{checklist.destino_nome}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      {formatDateTime(checklist.data_hora_saida)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {checklist.viagem_finalizada ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Finalizada
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Em Andamento
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
                          disabled={checklist.viagem_finalizada}
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
        Mostrando {filteredChecklists.length} de {checklists.length} check-lists
      </div>

      {/* Dialog de Criação/Edição */}
      <ChecklistSaidaFormDialog
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
              Tem certeza que deseja deletar o check-list do veículo{' '}
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
