import React, { useState } from 'react';
import { Loader2, Plus, Search, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { useFornecedores, useDeleteFornecedor } from '@/hooks/suprimentos/useFornecedores';
import { FornecedorFilters, FornecedorTipo, FornecedorStatus, Fornecedor } from '@/interfaces/suprimentos/FornecedorInterface';
import { useSortableData } from '@/lib/table-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FornecedorFormDialog } from './components/FornecedorFormDialog';

const FornecedoresPage = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FornecedorFilters>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data, isLoading, error } = useFornecedores(filters);
  const deleteMutation = useDeleteFornecedor();

  const fornecedores = data?.fornecedores || [];
  const { sortedData, sortConfig, requestSort } = useSortableData<Fornecedor>(fornecedores);

  const handleDelete = async (id: number, razaoSocial: string) => {
    if (!confirm(`Deseja realmente excluir o fornecedor "${razaoSocial}"?`)) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Fornecedor excluído',
        description: `${razaoSocial} foi removido com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Ocorreu um erro ao tentar excluir o fornecedor.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: FornecedorStatus) => {
    const variants = {
      ativo: 'default',
      inativo: 'secondary',
      bloqueado: 'destructive',
    } as const;

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getTipoBadge = (tipo: FornecedorTipo) => {
    const labels = {
      material: 'Material',
      servico: 'Serviço',
      ambos: 'Material + Serviço',
    };

    return <Badge variant="outline">{labels[tipo]}</Badge>;
  };

  const renderRating = (rating?: number) => {
    if (!rating) return <span className="text-muted-foreground text-sm">Sem avaliação</span>;

    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderSortableHeader = (label: string, key: keyof Fornecedor) => {
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fornecedores</CardTitle>
              <CardDescription>
                Gerencie o cadastro de fornecedores de materiais e serviços
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Fornecedor
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <Select
              value={filters.tipo || 'todos'}
              onValueChange={(value) =>
                setFilters({ ...filters, tipo: value === 'todos' ? undefined : value as FornecedorTipo })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="servico">Serviço</SelectItem>
                <SelectItem value="ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status || 'todos'}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value === 'todos' ? undefined : value as FornecedorStatus })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Erro ao carregar fornecedores. Tente novamente.
            </div>
          ) : fornecedores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum fornecedor encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  {renderSortableHeader('Razão Social', 'razao_social')}
                  {renderSortableHeader('CNPJ', 'cnpj')}
                  {renderSortableHeader('Tipo', 'tipo')}
                  <TableHead>Contato</TableHead>
                  {renderSortableHeader('Avaliação', 'rating')}
                  {renderSortableHeader('Status', 'status')}
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((fornecedor, index) => (
                  <TableRow key={fornecedor.id}>
                    <TableCell className="text-muted-foreground text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{fornecedor.razao_social}</div>
                        {fornecedor.nome_fantasia && (
                          <div className="text-sm text-muted-foreground">{fornecedor.nome_fantasia}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{fornecedor.cnpj}</TableCell>
                    <TableCell>{getTipoBadge(fornecedor.tipo)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {fornecedor.telefone && <div>{fornecedor.telefone}</div>}
                        {fornecedor.email && <div className="text-muted-foreground">{fornecedor.email}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{renderRating(fornecedor.rating)}</TableCell>
                    <TableCell>{getStatusBadge(fornecedor.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setEditingId(fornecedor.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(fornecedor.id, fornecedor.razao_social)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <FornecedorFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {editingId && (
        <FornecedorFormDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          fornecedorId={editingId}
        />
      )}
    </div>
  );
};

export default FornecedoresPage;
