import { TarefaMacro } from "@/interfaces/TarefaMacroInterface"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import TarefaMacroService from "@/services/TarefaMacroService"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EditTarefaMacroForm } from "./EditTarefaMacroForm"

interface TarefasMacroListProps {
  reload: boolean
}

export function TarefasMacroList({ reload }: TarefasMacroListProps) {
  const [listTarefasMacro, setListTarefasMacro] = useState<TarefaMacro[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedTarefa, setSelectedTarefa] = useState<TarefaMacro | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast();

  const getTarefasMacro = async () => {
    try {
      const response = await TarefaMacroService.getAll()
      setListTarefasMacro(response.data)
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar as tarefas macro:', err)
      setError('Não foi possível carregar as tarefas macro. Tente novamente mais tarde.')
    }
  }

  useEffect(() => {
    getTarefasMacro();
  }, [reload])

  const handleDeleteClick = (tarefa: TarefaMacro) => {
    setSelectedTarefa(tarefa);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (tarefa: TarefaMacro) => {
    setSelectedTarefa(tarefa);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTarefa) return;

    try {
      await TarefaMacroService.delete(selectedTarefa.id);
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
      getTarefasMacro();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir tarefa",
        description: "Não foi possível excluir a tarefa. Tente novamente.",
      });
      console.error("Erro ao excluir a tarefa:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedTarefa(null);
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedTarefa(null);
    getTarefasMacro();
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listTarefasMacro.map((tarefa) => (
              <TableRow key={tarefa.id}>
                <TableCell>{tarefa.name}</TableCell>
                <TableCell className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleEditClick(tarefa)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline"  
                    size="icon" 
                    onClick={() => handleDeleteClick(tarefa)}
                  >
                    <Trash2 className="h-4 w-4" color="red"/>
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
              Tem certeza que deseja excluir a tarefa macro "{selectedTarefa?.name}"?
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
            <DialogTitle>Editar Tarefa Macro</DialogTitle>
          </DialogHeader>
          {selectedTarefa && (
            <EditTarefaMacroForm
              tarefa={selectedTarefa}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}