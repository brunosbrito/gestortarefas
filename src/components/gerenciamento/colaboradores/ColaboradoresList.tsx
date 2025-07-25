import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Ban, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

export function ColaboradoresList({ reload }: ColaboradoresListProps) {
  const [listColaboradores, setListColaboradores] = useState<Colaborador[]>([]);
  const [filteredColaboradores, setFilteredColaboradores] = useState<
    Colaborador[]
  >([]);
  const [filters, setFilters] = useState({ name: '', role: '', sector: '' });
  const [selectedColaborador, setSelectedColaborador] =
    useState<Colaborador | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const getColaboradores = async () => {
    try {
      const response = await ColaboradorService.getAllColaboradores();
      setListColaboradores(response);
    } catch (err) {
      console.error('Erro ao buscar os colaboradores:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar colaboradores',
        description: 'Não foi possível carregar os colaboradores.',
      });
    }
  };

  useEffect(() => {
    getColaboradores();
  }, [reload]);

  useEffect(() => {
    const filtered = listColaboradores.filter(
      (colaborador) =>
        colaborador.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        colaborador.role.toLowerCase().includes(filters.role.toLowerCase()) &&
        colaborador.sector.toLowerCase().includes(filters.sector.toLowerCase())
    );
    setFilteredColaboradores(filtered);
  }, [filters, listColaboradores]);

  const handleEditClick = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsEditDialogOpen(true);
  };

  const handleDeactivate = async (
    colaborador: Colaborador,
    status: boolean
  ) => {
    try {
      await ColaboradorService.desativarColaborador(colaborador.id, status);
      toast({
        title: 'Colaborador desativado',
        description: `O colaborador ${colaborador.name} foi desativado.`,
      });
      getColaboradores();
    } catch (error) {
      console.error('Erro ao desativar colaborador:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao desativar',
        description: 'Não foi possível desativar o colaborador.',
      });
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedColaborador(null);
    getColaboradores();
  };

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-4">
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredColaboradores.map((colaborador) => (
              <TableRow key={colaborador.id}>
                <TableCell>{colaborador.name}</TableCell>
                <TableCell>{colaborador.role}</TableCell>
                <TableCell>{getSetorLabel(colaborador.sector)}</TableCell>
                <TableCell className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditClick(colaborador)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleDeactivate(colaborador, !colaborador.status)
                    }
                  >
                    {colaborador.status ? (
                      <Ban className="h-4 w-4" color="orange" /> // Ícone para desativar
                    ) : (
                      <Check className="h-4 w-4" color="green" /> // Ícone para ativar
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
          </DialogHeader>
          {selectedColaborador && (
            <EditColaboradorForm
              colaborador={selectedColaborador}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
