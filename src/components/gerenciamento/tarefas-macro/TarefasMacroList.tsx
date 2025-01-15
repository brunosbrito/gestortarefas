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

interface TarefasMacroListProps {
  reload: boolean
}

export function TarefasMacroList({ reload }: TarefasMacroListProps) {
  const [listTarefasMacro, setListTarefasMacro] = useState<TarefaMacro[]>([])
  const [error, setError] = useState<string | null>(null)
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
  }, [reload]) // O reload irá disparar a atualização da lista

  const handleDelete = async (id: number) => {
    try {
      await TarefaMacroService.delete(id);
      setListTarefasMacro(listTarefasMacro.filter((task) => task.id !== id));
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
    }
  };

  return (
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
                <Button variant="outline" size="icon">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="outline"  size="icon" onClick={() => handleDelete(tarefa.id)}>
                  <Trash2 className="h-4 w-4" color="red"/>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
