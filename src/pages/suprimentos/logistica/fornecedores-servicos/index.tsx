// Página de Listagem de Fornecedores de Serviços - Logística
import { useState, useMemo } from 'react';
import { useServiceProviders, useDeleteServiceProvider } from '@/hooks/suprimentos/logistica/useServiceProviders';
import { ServiceProvider, serviceProviderTypeLabels } from '@/interfaces/suprimentos/logistica/ServiceProviderInterface';
import ServiceProviderFormDialog from './components/ServiceProviderFormDialog';
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
import { Loader2, Plus, Search, Star, MoreVertical, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FornecedoresServicosPage() {
  const { data: serviceProviders = [], isLoading, isError } = useServiceProviders();
  const deleteMutation = useDeleteServiceProvider();

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedServiceProvider, setSelectedServiceProvider] = useState<ServiceProvider | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceProviderToDelete, setServiceProviderToDelete] = useState<ServiceProvider | null>(null);

  const filteredServiceProviders = useMemo(() => {
    return serviceProviders.filter((sp) => {
      const matchesSearch =
        sp.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sp.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sp.cnpj?.includes(searchTerm);
      const matchesTipo = tipoFilter === 'all' || sp.tipo === tipoFilter;
      return matchesSearch && matchesTipo;
    });
  }, [serviceProviders, searchTerm, tipoFilter]);

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

  const handleCreateServiceProvider = () => {
    setDialogMode('create');
    setSelectedServiceProvider(null);
    setDialogOpen(true);
  };

  const handleEditServiceProvider = (serviceProvider: ServiceProvider) => {
    setDialogMode('edit');
    setSelectedServiceProvider(serviceProvider);
    setDialogOpen(true);
  };

  const handleDeleteClick = (serviceProvider: ServiceProvider) => {
    setServiceProviderToDelete(serviceProvider);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (serviceProviderToDelete) {
      deleteMutation.mutate(serviceProviderToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setServiceProviderToDelete(null);
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
          <p className="font-semibold">Erro ao carregar fornecedores de serviços</p>
          <p className="text-sm">Tente novamente mais tarde ou contate o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fornecedores de Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie fornecedores de manutenção e serviços
          </p>
        </div>
        <Button onClick={handleCreateServiceProvider}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="oficina">Oficina Mecânica</SelectItem>
            <SelectItem value="borracharia">Borracharia</SelectItem>
            <SelectItem value="funilaria">Funilaria e Pintura</SelectItem>
            <SelectItem value="eletrica">Elétrica Automotiva</SelectItem>
            <SelectItem value="mecanica">Mecânica Geral</SelectItem>
            <SelectItem value="seguradora">Seguradora</SelectItem>
            <SelectItem value="despachante">Despachante</SelectItem>
            <SelectItem value="outros">Outros Serviços</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão Social</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>CNPJ/CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServiceProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {searchTerm || tipoFilter !== 'all'
                    ? 'Nenhum fornecedor encontrado'
                    : 'Nenhum fornecedor cadastrado'}
                </TableCell>
              </TableRow>
            ) : (
              filteredServiceProviders.map((serviceProvider) => (
                <TableRow key={serviceProvider.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{serviceProvider.razao_social}</p>
                      {serviceProvider.nome_fantasia && (
                        <p className="text-sm text-muted-foreground">
                          {serviceProvider.nome_fantasia}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {serviceProviderTypeLabels[serviceProvider.tipo]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {serviceProvider.cnpj || serviceProvider.cpf || '-'}
                  </TableCell>
                  <TableCell>{serviceProvider.telefone}</TableCell>
                  <TableCell>{renderStars(serviceProvider.rating)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={serviceProvider.ativo ? 'default' : 'secondary'}>
                        {serviceProvider.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {serviceProvider.credenciado && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Credenciado
                        </Badge>
                      )}
                    </div>
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
                        <DropdownMenuItem onClick={() => handleEditServiceProvider(serviceProvider)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(serviceProvider)}
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
        Mostrando {filteredServiceProviders.length} de {serviceProviders.length} fornecedores
      </div>

      {/* Dialog de Criação/Edição */}
      <ServiceProviderFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        serviceProvider={selectedServiceProvider}
        mode={dialogMode}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o fornecedor{' '}
              <span className="font-semibold">{serviceProviderToDelete?.razao_social}</span>? Esta
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
