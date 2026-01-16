// Página de Listagem de Tipos de Manutenção - Logística
import { useState, useMemo } from 'react';
import { useMaintenanceTypes, useDeleteMaintenanceType } from '@/hooks/suprimentos/logistica/useMaintenanceTypes';
import { MaintenanceType, maintenanceCategoryLabels, maintenanceFrequencyLabels } from '@/interfaces/suprimentos/logistica/MaintenanceTypeInterface';
import MaintenanceTypeFormDialog from './components/MaintenanceTypeFormDialog';
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
import { Loader2, Plus, Search, MoreVertical, Pencil, Trash2, Clock, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSortableData } from '@/lib/table-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TiposManutencaoPage() {
  const { data: maintenanceTypes = [], isLoading, isError } = useMaintenanceTypes();
  const deleteMutation = useDeleteMaintenanceType();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedMaintenanceType, setSelectedMaintenanceType] = useState<MaintenanceType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [maintenanceTypeToDelete, setMaintenanceTypeToDelete] = useState<MaintenanceType | null>(null);

  const filteredMaintenanceTypes = useMemo(() => {
    return maintenanceTypes.filter((mt) => {
      const matchesSearch = mt.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mt.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategoria = categoriaFilter === 'all' || mt.categoria === categoriaFilter;
      return matchesSearch && matchesCategoria;
    });
  }, [maintenanceTypes, searchTerm, categoriaFilter]);

  const { sortedData, sortConfig, requestSort } = useSortableData<MaintenanceType>(filteredMaintenanceTypes);

  const renderSortableHeader = (label: string, key: keyof MaintenanceType) => {
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

  const getCategoryBadge = (categoria: MaintenanceType['categoria']) => {
    const config = {
      preventiva: { label: 'Preventiva', variant: 'default' as const },
      corretiva: { label: 'Corretiva', variant: 'destructive' as const },
      preditiva: { label: 'Preditiva', variant: 'secondary' as const },
      emergencial: { label: 'Emergencial', variant: 'outline' as const },
    };
    const c = config[categoria];
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const handleCreateMaintenanceType = () => {
    setDialogMode('create');
    setSelectedMaintenanceType(null);
    setDialogOpen(true);
  };

  const handleEditMaintenanceType = (maintenanceType: MaintenanceType) => {
    setDialogMode('edit');
    setSelectedMaintenanceType(maintenanceType);
    setDialogOpen(true);
  };

  const handleDeleteClick = (maintenanceType: MaintenanceType) => {
    setMaintenanceTypeToDelete(maintenanceType);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (maintenanceTypeToDelete) {
      deleteMutation.mutate(maintenanceTypeToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setMaintenanceTypeToDelete(null);
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
          <p className="font-semibold">Erro ao carregar tipos de manutenção</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tipos de Manutenção</h1>
          <p className="text-muted-foreground">
            Gerencie os tipos de manutenção da frota
          </p>
        </div>
        <Button onClick={handleCreateMaintenanceType}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Tipo
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="preventiva">Preventiva</SelectItem>
            <SelectItem value="corretiva">Corretiva</SelectItem>
            <SelectItem value="preditiva">Preditiva</SelectItem>
            <SelectItem value="emergencial">Emergencial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              {renderSortableHeader('Nome', 'nome')}
              {renderSortableHeader('Categoria', 'categoria')}
              {renderSortableHeader('Frequência', 'frequencia')}
              <TableHead>Periodicidade</TableHead>
              <TableHead>Custo Estimado</TableHead>
              <TableHead>Tempo Estimado</TableHead>
              {renderSortableHeader('Status', 'ativo')}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {searchTerm || categoriaFilter !== 'all'
                    ? 'Nenhum tipo de manutenção encontrado'
                    : 'Nenhum tipo de manutenção cadastrado'}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((maintenanceType, index) => (
                <TableRow key={maintenanceType.id}>
                  <TableCell className="text-muted-foreground text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{maintenanceType.nome}</p>
                      {maintenanceType.descricao && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {maintenanceType.descricao}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(maintenanceType.categoria)}</TableCell>
                  <TableCell>
                    {maintenanceFrequencyLabels[maintenanceType.frequencia]}
                  </TableCell>
                  <TableCell>
                    {maintenanceType.periodicidade_km && (
                      <div className="text-sm">
                        <span className="font-medium">{maintenanceType.periodicidade_km.toLocaleString('pt-BR')}</span> km
                      </div>
                    )}
                    {maintenanceType.periodicidade_dias && (
                      <div className="text-sm">
                        <span className="font-medium">{maintenanceType.periodicidade_dias}</span> dias
                      </div>
                    )}
                    {!maintenanceType.periodicidade_km && !maintenanceType.periodicidade_dias && (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {maintenanceType.custo_estimado ? (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        {maintenanceType.custo_estimado.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {maintenanceType.tempo_estimado ? (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        {maintenanceType.tempo_estimado} min
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={maintenanceType.ativo ? 'default' : 'secondary'}>
                      {maintenanceType.ativo ? 'Ativo' : 'Inativo'}
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
                        <DropdownMenuItem onClick={() => handleEditMaintenanceType(maintenanceType)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(maintenanceType)}
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
        Mostrando {sortedData.length} de {maintenanceTypes.length} tipos de manutenção
      </div>

      {/* Dialog de Criação/Edição */}
      <MaintenanceTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        maintenanceType={selectedMaintenanceType}
        mode={dialogMode}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o tipo de manutenção{' '}
              <span className="font-semibold">{maintenanceTypeToDelete?.nome}</span>? Esta
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
