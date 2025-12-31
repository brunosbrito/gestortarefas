import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users2, Edit2, Ban, Check, Filter, X, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SortableTableHeader, useTableSort } from '@/components/tables/SortableTableHeader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { EditColaboradorForm } from './EditColaboradorForm';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import ColaboradorService from '@/services/ColaboradorService';
import { cn } from '@/lib/utils';
import { useDataFetching } from '@/hooks/useDataFetching';
import { useDialogState } from '@/hooks/useDialogState';

interface ColaboradoresListProps {
  reload: boolean;
}

const getSetorLabel = (sector: string) => {
  switch (sector) {
    case 'PRODUCAO':
      return 'Produção';
    case 'ADMINISTRATIVO':
      return 'Administrativo';
    case 'ENGENHARIA':
      return 'Engenharia';
    default:
      return sector;
  }
};

const getSetorConfig = (sector: string) => {
  switch (sector) {
    case 'PRODUCAO':
      return {
        label: 'Produção',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-700 dark:text-blue-300',
        borderColor: 'border-blue-500/30',
      };
    case 'ADMINISTRATIVO':
      return {
        label: 'Administrativo',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-700 dark:text-purple-300',
        borderColor: 'border-purple-500/30',
      };
    case 'ENGENHARIA':
      return {
        label: 'Engenharia',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-700 dark:text-orange-300',
        borderColor: 'border-orange-500/30',
      };
    default:
      return {
        label: sector,
        bgColor: 'bg-muted',
        textColor: 'text-muted-foreground',
        borderColor: 'border-muted-foreground/30',
      };
  }
};

export function ColaboradoresList({ reload }: ColaboradoresListProps) {
  const { toast } = useToast();
  const [filters, setFilters] = useState({ name: '', role: '', sector: '' });
  const [showInactive, setShowInactive] = useState(false);

  // Fetch de colaboradores com loading automático e refetch on reload
  const { data: listColaboradores, refetch } = useDataFetching({
    fetchFn: () => ColaboradorService.getAllColaboradores(),
    errorMessage: 'Erro ao carregar colaboradores',
    dependencies: [reload],
  });

  // Diálogo gerenciado com hook customizado
  const editDialog = useDialogState<Colaborador>();

  const hasActiveFilters = filters.name || filters.role || filters.sector;

  // Filtrar colaboradores com useMemo para performance
  const filteredColaboradores = useMemo(() => {
    return (listColaboradores || []).filter(
      (colaborador) =>
        colaborador.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        colaborador.role.toLowerCase().includes(filters.role.toLowerCase()) &&
        colaborador.sector.toLowerCase().includes(filters.sector.toLowerCase()) &&
        (showInactive || colaborador.status)
    );
  }, [listColaboradores, filters, showInactive]);

  // Sorting - aplicado aos dados filtrados
  const { sortedData, sortKey, sortDirection, handleSort } = useTableSort(filteredColaboradores, 'name', 'asc');

  // Handler de desativar/ativar com useCallback
  const handleDeactivate = useCallback(async (
    colaborador: Colaborador,
    status: boolean
  ) => {
    try {
      await ColaboradorService.desativarColaborador(colaborador.id, status);
      toast({
        title: status ? 'Colaborador ativado' : 'Colaborador desativado',
        description: `O colaborador ${colaborador.name} foi ${status ? 'ativado' : 'desativado'}.`,
      });
      refetch();
    } catch (error) {
      console.error('Erro ao alterar status do colaborador:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar status',
        description: 'Não foi possível alterar o status do colaborador.',
      });
    }
  }, [toast, refetch]);

  // Handler de sucesso na edição
  const handleEditSuccess = useCallback(() => {
    editDialog.close();
    refetch();
  }, [editDialog, refetch]);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({ name: '', role: '', sector: '' });
  }, []);

  return (
    <>
      {/* Filtros */}
      <Card className="mb-6 overflow-hidden border border-border/50 shadow-elevation-2">
        <div className="p-4 md:p-6 border-b-2 border-border/50 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Filtros</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Filtrar por nome"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
            <Input
              placeholder="Filtrar por cargo"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            />
            <Input
              placeholder="Filtrar por setor"
              value={filters.sector}
              onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden border border-border/50 shadow-elevation-2">
        <div className="p-4 md:p-6 border-b-2 border-border/50 bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Colaboradores</h3>
                <p className="text-xs text-muted-foreground">
                  {showInactive
                    ? `${filteredColaboradores.length} de ${listColaboradores.length} colaboradores`
                    : hasActiveFilters
                      ? `${filteredColaboradores.length} de ${listColaboradores.filter(c => c.status).length} colaboradores ativos`
                      : `${listColaboradores.filter(c => c.status).length} ${listColaboradores.filter(c => c.status).length === 1 ? 'colaborador ativo' : 'colaboradores ativos'}`
                  }
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30 ml-2 font-semibold tabular-nums"
              >
                {filteredColaboradores.length}
              </Badge>
            </div>

            {/* Toggle para mostrar/ocultar inativos */}
            <div className="flex items-center gap-2">
              <Switch
                id="show-inactive-colaboradores"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label
                htmlFor="show-inactive-colaboradores"
                className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
              >
                <EyeOff className="w-4 h-4" />
                Mostrar inativos
              </Label>
            </div>
          </div>
        </div>

        {filteredColaboradores.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                  <TableHead className="w-20 text-center font-semibold text-foreground border-r border-border/30">Item</TableHead>
                  <SortableTableHeader
                    label="Nome"
                    sortKey="name"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="border-r border-border/30"
                  />
                  <SortableTableHeader
                    label="Cargo"
                    sortKey="role"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="border-r border-border/30"
                  />
                  <SortableTableHeader
                    label="Setor"
                    sortKey="sector"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="border-r border-border/30"
                  />
                  <TableHead className="font-semibold text-foreground border-r border-border/30">Status</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((colaborador, index) => {
                  const setorConfig = getSetorConfig(colaborador.sector);

                  return (
                    <TableRow
                      key={colaborador.id}
                      className={cn(
                        "transition-all duration-200 border-b",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20",
                        "hover:bg-accent/50 hover:shadow-sm"
                      )}
                    >
                      <TableCell className="text-center font-mono text-sm font-bold py-4 border-r border-border/30">
                        {String(index + 1).padStart(3, '0')}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground py-4 border-r border-border/30">{colaborador.name}</TableCell>
                      <TableCell className="py-4 text-muted-foreground border-r border-border/30">{colaborador.role}</TableCell>
                      <TableCell className="py-4 border-r border-border/30">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-semibold",
                            setorConfig.bgColor,
                            setorConfig.textColor,
                            setorConfig.borderColor
                          )}
                        >
                          {setorConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 border-r border-border/30">
                        <Badge
                          className={cn(
                            "flex items-center gap-1.5 w-fit px-3 py-1.5 font-medium",
                            colaborador.status
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              colaborador.status ? "bg-green-500" : "bg-red-500"
                            )}
                          />
                          {colaborador.status ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editDialog.open(colaborador)}
                            className="hover:bg-accent"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeactivate(colaborador, !colaborador.status)
                            }
                            className={cn(
                              "hover:bg-accent",
                              colaborador.status
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-green-600 dark:text-green-400"
                            )}
                          >
                            {colaborador.status ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <div className="p-4 rounded-full bg-muted/50">
              <Users2 className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                Nenhum colaborador encontrado
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                {hasActiveFilters
                  ? 'Tente ajustar os filtros para ver mais resultados'
                  : 'Não há colaboradores cadastrados no sistema'}
              </p>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={editDialog.isOpen} onOpenChange={editDialog.setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
          </DialogHeader>
          {editDialog.data && (
            <EditColaboradorForm
              colaborador={editDialog.data}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
