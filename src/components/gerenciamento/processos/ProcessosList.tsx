import { Processo } from "@/interfaces/ProcessoInterface"
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

const mockProcessos: Processo[] = [
  {
    id: 1,
    nome: "Processo de Construção",
    descricao: "Processo padrão de construção",
    etapas: ["Planejamento", "Execução", "Finalização"],
    status: "ativo"
  }
]

export function ProcessosList() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockProcessos.map((processo) => (
            <TableRow key={processo.id}>
              <TableCell>{processo.nome}</TableCell>
              <TableCell>{processo.descricao}</TableCell>
              <TableCell>{processo.status}</TableCell>
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