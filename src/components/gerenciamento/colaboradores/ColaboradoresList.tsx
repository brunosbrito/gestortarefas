import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditColaboradorForm } from "./EditColaboradorForm";
import { Colaborador } from "@/interfaces/ColaboradorInterface";
import ColaboradorService from "@/services/ColaboradorService";

interface ColaboradoresListProps {
  reload: boolean;
}

export function ColaboradoresList({ reload }: ColaboradoresListProps) {
  const [listColaboradores, setListColaboradores] = useState<Colaborador[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const getColaboradores = async () => {
    try {
      const response = await ColaboradorService.getAllColaboradores();
      setListColaboradores(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar os colaboradores:', err);
      setError('Não foi possível carregar os colaboradores. Tente novamente mais tarde.');
    }
  };

  useEffect(() => {
    getColaboradores();
  }, [reload]);

  const handleDeleteClick = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedColaborador) return;

    try {
      await ColaboradorService.deleteColaborador(selectedColaborador.id);
      toast({
        title: "Colaborador excluído",
        description: "O colaborador foi excluído com sucesso.",
      });
      getColaboradores();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir colaborador",
        description: "Não foi possível excluir o colaborador. Tente novamente.",
      });
      console.error("Erro ao excluir o colaborador:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedColaborador(null);
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedColaborador(null);
    getColaboradores();
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Valor por Hora</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listColaboradores.map((colaborador) => (
              <TableRow key={colaborador.id}>
                <TableCell>{colaborador.name}</TableCell>
                <TableCell>{colaborador.role}</TableCell>
                <TableCell>
                  {typeof colaborador.pricePerHour === 'number' && !isNaN(colaborador.pricePerHour)
                    ? colaborador.pricePerHour
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      .replace(".", ",")
                    : 'R$ 0,00'}
                </TableCell>
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
                    onClick={() => handleDeleteClick(colaborador)}
                  >
                    <Trash2 className="h-4 w-4" color="red" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o colaborador "{selectedColaborador?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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