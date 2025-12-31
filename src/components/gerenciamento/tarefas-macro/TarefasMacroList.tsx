import { TarefaMacro } from "@/interfaces/TarefaMacroInterface"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, ListTodo } from "lucide-react"
import TarefaMacroService from "@/services/TarefaMacroService"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { SortableTableHeader, useTableSort } from "@/components/tables/SortableTableHeader"
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
import { cn } from "@/lib/utils"

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

  // Sorting
  const { sortedData, sortKey, sortDirection, handleSort } = useTableSort(listTarefasMacro, 'name', 'asc');

  const getTarefasMacro = async () => {
    try {
      const response = await TarefaMacroService.getAll()
      setListTarefasMacro(response.data)
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar as tarefas macro:', err)
      setError('Não foi possível carregar as tarefas macro. Tente novamente mais tarde.')
      toast({
        variant: "destructive",
        title: "Erro ao carregar tarefas",
        description: "Não foi possível carregar as tarefas macro.",
      });
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
      <Card className="overflow-hidden border border-border/50 shadow-elevation-2">
        {/* Header modernizado */}
        <div className="p-4 md:p-6 border-b-2 border-border/50 bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ListTodo className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Tarefas Macro</h3>
                <p className="text-xs text-muted-foreground">
                  Total de {listTarefasMacro.length} {listTarefasMacro.length === 1 ? 'tarefa' : 'tarefas'}
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30 ml-2 font-semibold tabular-nums"
              >
                {listTarefasMacro.length}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabela */}
        {listTarefasMacro.length > 0 ? (
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
                  <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((tarefa, index) => (
                  <TableRow
                    key={tarefa.id}
                    className={cn(
                      "transition-all duration-200 border-b",
                      index % 2 === 0 ? "bg-background" : "bg-muted/20",
                      "hover:bg-accent/50 hover:shadow-sm"
                    )}
                  >
                    <TableCell className="text-center font-mono text-sm font-bold py-4 border-r border-border/30">
                      {String(index + 1).padStart(3, '0')}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground py-4 border-r border-border/30">{tarefa.name}</TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(tarefa)}
                          className="hover:bg-accent"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(tarefa)}
                          className="hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <div className="p-4 rounded-full bg-muted/50">
              <ListTodo className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                Nenhuma tarefa macro encontrada
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Não há tarefas macro cadastradas no sistema
              </p>
            </div>
          </div>
        )}
      </Card>

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
