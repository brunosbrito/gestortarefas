// Página de Listagem de Transportadoras - Logística
import { useState, useMemo } from 'react';
import { useTransportadoras, useDeleteTransportadora } from '@/hooks/suprimentos/logistica/useTransportadoras';
import { Transportadora } from '@/interfaces/suprimentos/logistica/TransportInterface';
import TransportadoraFormDialog from './components/TransportadoraFormDialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Loader2, Plus, Search, Star, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TransportadorasPage() {
  const { data: transportadoras = [], isLoading, isError } = useTransportadoras();
  const deleteMutation = useDeleteTransportadora();

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transportadoraToDelete, setTransportadoraToDelete] = useState<Transportadora | null>(null);

  const filteredTransportadoras = useMemo(() => {
    return transportadoras.filter(
      (t) =>
        t.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cnpj.includes(searchTerm)
    );
  }, [transportadoras, searchTerm]);

  const renderStars = (rating: number | undefined) => {
    if (!rating) return <span className="text-muted-foreground text-sm">Sem avaliação</span>;

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  const handleCreateTransportadora = () => {
    setDialogMode('create');
    setSelectedTransportadora(null);
    setDialogOpen(true);
  };

  const handleEditTransportadora = (transportadora: Transportadora) => {
    setDialogMode('edit');
    setSelectedTransportadora(transportadora);
    setDialogOpen(true);
  };

  const handleDeleteClick = (transportadora: Transportadora) => {
    setTransportadoraToDelete(transportadora);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transportadoraToDelete) {
      deleteMutation.mutate(transportadoraToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTransportadoraToDelete(null);
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
          <p className="font-semibold">Erro ao carregar transportadoras</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transportadoras</h1>
          <p className="text-muted-foreground">
            Gerencie as empresas de transporte parceiras
          </p>
        </div>
        <Button onClick={handleCreateTransportadora}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transportadora
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por razão social ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão Social</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransportadoras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchTerm ? 'Nenhuma transportadora encontrada' : 'Nenhuma transportadora cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              filteredTransportadoras.map((transportadora) => (
                <TableRow key={transportadora.id}>
                  <TableCell className="font-semibold">
                    {transportadora.razao_social}
                  </TableCell>
                  <TableCell className="font-mono">{transportadora.cnpj}</TableCell>
                  <TableCell>{transportadora.telefone}</TableCell>
                  <TableCell>{transportadora.email || '-'}</TableCell>
                  <TableCell>{renderStars(transportadora.rating)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditTransportadora(transportadora)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(transportadora)}
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
        Mostrando {filteredTransportadoras.length} de {transportadoras.length}{' '}
        transportadoras
      </div>

      {/* Dialog de Criação/Edição */}
      <TransportadoraFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transportadora={selectedTransportadora}
        mode={dialogMode}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a transportadora{' '}
              <span className="font-semibold">{transportadoraToDelete?.razao_social}</span>? Esta
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
