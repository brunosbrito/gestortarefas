// Página de Listagem de Rotas/Destinos - Logística
import { useState, useMemo } from 'react';
import { useRoutes, useDeleteRoute } from '@/hooks/suprimentos/logistica/useRoutes';
import { Route, tipoViaLabels } from '@/interfaces/suprimentos/logistica/RouteInterface';
import RouteFormDialog from './components/RouteFormDialog';
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
import { Loader2, Plus, Search, MoreVertical, Pencil, Trash2, MapPin, Clock, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSortableData } from '@/lib/table-utils';

export default function RotasPage() {
  const { data: routes = [], isLoading, isError } = useRoutes();
  const deleteMutation = useDeleteRoute();

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      const matchesSearch =
        r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.destino.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [routes, searchTerm]);

  const { sortedData, sortConfig, requestSort } = useSortableData<Route>(filteredRoutes);

  const renderSortableHeader = (label: string, key: keyof Route) => {
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

  const handleCreateRoute = () => {
    setDialogMode('create');
    setSelectedRoute(null);
    setDialogOpen(true);
  };

  const handleEditRoute = (route: Route) => {
    setDialogMode('edit');
    setSelectedRoute(route);
    setDialogOpen(true);
  };

  const handleDeleteClick = (route: Route) => {
    setRouteToDelete(route);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (routeToDelete) {
      deleteMutation.mutate(routeToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setRouteToDelete(null);
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
          <p className="font-semibold">Erro ao carregar rotas</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rotas e Destinos</h1>
          <p className="text-muted-foreground">
            Gerencie as rotas utilizadas pela frota
          </p>
        </div>
        <Button onClick={handleCreateRoute}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Rota
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, origem ou destino..."
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
              {renderSortableHeader('Nome', 'nome')}
              <TableHead>Origem → Destino</TableHead>
              {renderSortableHeader('Distância', 'km_previsto')}
              {renderSortableHeader('Tempo Médio', 'tempo_medio')}
              {renderSortableHeader('Custo Estimado', 'custo_estimado')}
              {renderSortableHeader('Tipo Via', 'tipo_via')}
              {renderSortableHeader('Status', 'ativo')}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {searchTerm ? 'Nenhuma rota encontrada' : 'Nenhuma rota cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((route, index) => (
                <TableRow key={route.id}>
                  <TableCell className="text-muted-foreground text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{route.nome}</p>
                      {route.descricao && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {route.descricao}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{route.origem}</span>
                      <span className="mx-2">→</span>
                      <span>{route.destino}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{route.km_previsto}</span> km
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      {route.tempo_medio} min
                    </div>
                  </TableCell>
                  <TableCell>
                    {route.custo_estimado ? (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        {route.custo_estimado.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {route.tipo_via ? (
                      <Badge variant="outline">{tipoViaLabels[route.tipo_via]}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={route.ativo ? 'default' : 'secondary'}>
                      {route.ativo ? 'Ativa' : 'Inativa'}
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
                        <DropdownMenuItem onClick={() => handleEditRoute(route)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(route)}
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
        Mostrando {sortedData.length} de {routes.length} rotas
      </div>

      {/* Dialog de Criação/Edição */}
      <RouteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        route={selectedRoute}
        mode={dialogMode}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a rota{' '}
              <span className="font-semibold">{routeToDelete?.nome}</span>? Esta
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
