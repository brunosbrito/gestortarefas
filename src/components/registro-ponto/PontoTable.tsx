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
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { enviarEfetivo, updateEffective } from '@/services/EffectiveService';
import { Funcionario } from '@/interfaces/FuncionarioInterface';
import { setorLabel, statusLabel } from '@/utils/labels';

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
        return '1º Turno';
      case 2:
        return '2º Turno';
      case 3:
        return 'Turno Central';
      default:
        return `${turno}º Central`;
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

      enviarEfetivo(registros);
      toast.success(
        `Registros do ${getTurnoLabel(turno)} enviados com sucesso`
      );
    } catch (error) {
      console.error('Erro ao enviar registros:', error);
      toast.error('Erro ao enviar registros. Tente novamente.');
    }
  };

  const resumo = {
    total: funcionariosFiltrados.length,
    presentes: funcionariosFiltrados.filter(f => f.status === 'PRESENTE').length,
    faltas: funcionariosFiltrados.filter(f => f.status === 'FALTA').length
  };

  return (
    <div className="space-y-3">
      {/* Header mobile otimizado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-construction-800">
            {getTurnoLabel(turno)}
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              Total: {resumo.total}
            </Badge>
            <Badge variant="default" className="text-xs px-2 py-0.5">
              Presentes: {resumo.presentes}
            </Badge>
            <Badge variant="destructive" className="text-xs px-2 py-0.5">
              Faltas: {resumo.faltas}
            </Badge>
          </div>
        </div>
        <Button onClick={handleEnviarTurno} variant="secondary" size="sm" className="self-start sm:self-auto">
          <Send className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Enviar Registros</span>
          <span className="sm:hidden">Enviar</span>
        </Button>
      </div>

      {/* Layout mobile com cards compactos */}
      <div className="block md:hidden space-y-2">
        {funcionariosFiltrados.map((funcionario) => (
          <div key={funcionario.id} className="bg-card border rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{funcionario.username}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {setorLabel(funcionario.role)}
                  </Badge>
                  <Badge
                    variant={funcionario.status === 'PRESENTE' ? 'default' : 'destructive'}
                    className="text-xs px-1.5 py-0.5"
                  >
                    {statusLabel(funcionario.status)}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este registro de ponto? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { onDelete(funcionario.id); onRefresh(); }}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {(funcionario.project || funcionario.sector || funcionario.reason) && (
              <div className="text-xs text-muted-foreground space-y-0.5">
                {funcionario.project && <div>Obra: {funcionario.project}</div>}
                {funcionario.sector && <div>Setor: {setorLabel(funcionario.sector)}</div>}
                {funcionario.reason && <div>Motivo: {funcionario.reason}</div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Layout desktop com tabela */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
              <TableHead className="font-semibold text-foreground border-r border-border/30">Nome</TableHead>
              <TableHead className="font-semibold text-foreground border-r border-border/30">Função</TableHead>
              <TableHead className="font-semibold text-foreground border-r border-border/30">Status</TableHead>
              <TableHead className="font-semibold text-foreground border-r border-border/30">Obra</TableHead>
              <TableHead className="font-semibold text-foreground border-r border-border/30">Setor</TableHead>
              <TableHead className="font-semibold text-foreground border-r border-border/30">Motivo</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcionariosFiltrados.map((funcionario, index) => (
              <TableRow
                key={funcionario.id}
                className={cn(
                  "transition-all duration-200 border-b",
                  index % 2 === 0 ? "bg-background" : "bg-muted/20",
                  "hover:bg-accent/50 hover:shadow-sm"
                )}
              >
                <TableCell className="font-semibold text-foreground py-4 border-r border-border/30">{funcionario.username}</TableCell>
                <TableCell className="py-4 border-r border-border/30">
                  <Badge variant="secondary" className="font-medium">{setorLabel(funcionario.role)}</Badge>
                </TableCell>
                <TableCell className="py-4 border-r border-border/30">
                  <Badge
                    variant={funcionario.status === 'PRESENTE' ? 'default' : 'destructive'}
                    className="font-medium"
                  >
                    {statusLabel(funcionario.status)}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-muted-foreground border-r border-border/30">{funcionario.project || '-'}</TableCell>
                <TableCell className="py-4 text-muted-foreground border-r border-border/30">{funcionario.sector ? setorLabel(funcionario.sector) : '-'}</TableCell>
                <TableCell className="py-4 text-muted-foreground border-r border-border/30">{funcionario.reason || '-'}</TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex space-x-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(funcionario)}>
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
