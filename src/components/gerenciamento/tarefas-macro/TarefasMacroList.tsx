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
import { Edit2 } from "lucide-react"

const mockTarefas: TarefaMacro[] = [
  {
    id: 1,
    nome: "Fundação",
    descricao: "Preparação e execução da fundação",
    prazoEstimado: 30,
    status: "ativa"
  }
]

export function TarefasMacroList() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Prazo (dias)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTarefas.map((tarefa) => (
            <TableRow key={tarefa.id}>
              <TableCell>{tarefa.nome}</TableCell>
              <TableCell>{tarefa.descricao}</TableCell>
              <TableCell>{tarefa.prazoEstimado}</TableCell>
              <TableCell>{tarefa.status}</TableCell>
              <TableCell>
                <Button variant="outline" size="icon">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}