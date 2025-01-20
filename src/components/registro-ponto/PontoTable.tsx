import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Send, MoreVertical } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { updateEffective } from '@/services/EffectiveService';
import { Funcionario } from '@/interfaces/FuncionarioInterface';

interface PontoTableProps {
  funcionarios: Funcionario[];
  turno: number;
  onEdit: (funcionario: Funcionario) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
}

export const PontoTable = ({
  funcionarios,
  turno,
  onEdit,
  onDelete,
  onRefresh,
}: PontoTableProps) => {
  const funcionariosFiltrados = funcionarios.filter((f) => f.shift === turno);

  const getTurnoLabel = (turno: number) => {
    switch (turno) {
      case 1:
        return '1º Turno (06:00 - 14:00)';
      case 2:
        return '2º Turno (14:00 - 22:00)';
      case 3:
        return 'Turno Central (08:00 - 17:00)';
      default:
        return `${turno}º Turno`;
    }
  };

  const handleEnviarTurno = async () => {
    try {
      const registros = funcionariosFiltrados.map((f) => ({
        username: f.username,
        shift: f.shift,
        role: f.role,
        project: f.project,
        typeRegister: f.typeRegister,
        reason: f.reason,
        sector: f.sector,
      }));

      for (const registro of registros) {
        await updateEffective(registro);
      }

      toast.success(`Registros do ${getTurnoLabel(turno)} enviados com sucesso`);
      onRefresh();
    } catch (error) {
      console.error('Erro ao enviar registros:', error);
      toast.error('Erro ao enviar registros. Tente novamente.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-construction-800">
          {getTurnoLabel(turno)}
        </h2>
        <Button onClick={handleEnviarTurno} variant="secondary" size="sm">
          <Send className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Enviar Registros do Turno</span>
          <span className="sm:hidden">Enviar</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Obra</TableHead>
              <TableHead className="hidden md:table-cell">Setor</TableHead>
              <TableHead className="hidden md:table-cell">Motivo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcionariosFiltrados.map((funcionario) => (
              <TableRow key={funcionario.id}>
                <TableCell className="font-medium">
                  {funcionario.username}
                  <div className="md:hidden mt-1 space-y-1">
                    <Badge variant="secondary" className="block">
                      {funcionario.role}
                    </Badge>
                    {funcionario.project && (
                      <div className="text-sm text-gray-500">
                        Obra: {funcionario.project}
                      </div>
                    )}
                    {funcionario.sector && (
                      <div className="text-sm text-gray-500">
                        Setor: {funcionario.sector}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary">
                    {funcionario.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      funcionario.status === 'PRESENTE'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {funcionario.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {funcionario.project || '-'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {funcionario.sector || '-'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {funcionario.reason || '-'}
                </TableCell>
                <TableCell className="text-right">
                  {/* Desktop actions */}
                  <div className="hidden md:flex space-x-2 justify-end">
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
                            Tem certeza que deseja excluir este registro de ponto?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              onDelete(funcionario.id);
                              onRefresh();
                            }}
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Mobile actions */}
                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(funcionario)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmar exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este registro de
                                ponto? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  onDelete(funcionario.id);
                                  onRefresh();
                                }}
                              >
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};