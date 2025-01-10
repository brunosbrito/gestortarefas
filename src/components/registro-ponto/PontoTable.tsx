import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Funcionario {
  id: number;
  nome: string;
  setor: "PRODUCAO" | "ADMINISTRATIVO";
  status: "PRESENTE" | "FALTA";
  turno: 1 | 2;
  obra?: string;
  motivoFalta?: string;
}

interface PontoTableProps {
  funcionarios: Funcionario[];
  turno: 1 | 2;
  onEdit: (funcionario: Funcionario) => void;
  onDelete: (id: number) => void;
}

export const PontoTable = ({ funcionarios, turno, onEdit, onDelete }: PontoTableProps) => {
  const funcionariosFiltrados = funcionarios.filter(f => f.turno === turno);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-construction-800">{turno}º Turno</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Obra</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funcionariosFiltrados.map((funcionario) => (
            <TableRow key={funcionario.id}>
              <TableCell className="font-medium">{funcionario.nome}</TableCell>
              <TableCell>
                <Badge variant={funcionario.setor === "PRODUCAO" ? "default" : "secondary"}>
                  {funcionario.setor}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={funcionario.status === "PRESENTE" ? "default" : "destructive"}>
                  {funcionario.status}
                </Badge>
              </TableCell>
              <TableCell>{funcionario.obra || "-"}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(funcionario)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este registro de ponto? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(funcionario.id)}>
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};