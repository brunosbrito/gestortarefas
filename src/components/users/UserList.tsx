import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import UserService from "@/services/UserService";
import { User } from "@/interfaces/UserInterface";
import { Users, Edit, EyeOff, Ban, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { EditUserForm } from "./EditUserForm";
import { cn } from "@/lib/utils";

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const usersData = await UserService.getAllUsers();
      setUsers(usersData || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
      });
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    fetchUsers();
    toast({
      title: "Usuário atualizado",
      description: "As informações do usuário foram atualizadas com sucesso.",
    });
  };

  const handleToggleClick = (user: User) => {
    setUserToToggle(user);
    setIsToggleDialogOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!userToToggle) return;

    try {
      const updatedUser = {
        ...userToToggle,
        isActive: !userToToggle.isActive,
      };

      await UserService.updateUser(userToToggle.id.toString(), updatedUser);

      toast({
        title: updatedUser.isActive ? "Usuário reativado" : "Usuário desativado",
        description: `${userToToggle.username} foi ${updatedUser.isActive ? 'reativado' : 'desativado'} com sucesso.`,
      });

      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do usuário.",
      });
    } finally {
      setIsToggleDialogOpen(false);
      setUserToToggle(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleConfig = (role: string) => {
    return role === 'admin'
      ? {
          label: 'Administrador',
          bgColor: 'bg-primary/10 dark:bg-primary/20',
          textColor: 'text-primary',
          borderColor: 'border-primary/30',
        }
      : {
          label: 'Básico',
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground',
          borderColor: 'border-muted-foreground/30',
        };
  };

  const getStatusConfig = (isActive: boolean) => {
    return isActive
      ? {
          label: 'Ativo',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-700 dark:text-green-300',
          dotColor: 'bg-green-500',
        }
      : {
          label: 'Inativo',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-700 dark:text-red-300',
          dotColor: 'bg-red-500',
        };
  };

  // Filtrar usuários baseado no toggle
  const filteredUsers = showInactive
    ? users
    : users.filter(user => user.isActive);

  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;

  return (
    <>
      <Card className="overflow-hidden border border-border/50 shadow-elevation-2">
        {/* Header modernizado */}
        <div className="p-4 md:p-6 border-b-2 border-border/50 bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Usuários</h3>
                <p className="text-xs text-muted-foreground">
                  {showInactive
                    ? `${activeCount} ativos • ${inactiveCount} inativos`
                    : `${activeCount} ${activeCount === 1 ? 'usuário ativo' : 'usuários ativos'}`
                  }
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30 ml-2 font-semibold tabular-nums"
              >
                {filteredUsers.length}
              </Badge>
            </div>

            {/* Toggle para mostrar/ocultar inativos */}
            <div className="flex items-center gap-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label
                htmlFor="show-inactive"
                className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
              >
                <EyeOff className="w-4 h-4" />
                Mostrar inativos
              </Label>
            </div>
          </div>
        </div>

        {/* Tabela */}
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                  <TableHead className="font-semibold text-foreground border-r border-border/50 border-solid">Nome</TableHead>
                  <TableHead className="font-semibold text-foreground border-r border-border/50 border-solid">Permissão</TableHead>
                  <TableHead className="font-semibold text-foreground border-r border-border/50 border-solid">Status</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => {
                  const roleConfig = getRoleConfig(user.role);
                  const statusConfig = getStatusConfig(user.isActive);

                  return (
                    <TableRow
                      key={user.id}
                      className={cn(
                        "transition-all duration-200 border-b",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20",
                        "hover:bg-accent/50 hover:shadow-sm"
                      )}
                    >
                      <TableCell className="font-semibold text-foreground py-4 border-r border-border/50 border-solid">{user.username}</TableCell>
                      <TableCell className="py-4 border-r border-border/50 border-solid">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-semibold",
                            roleConfig.bgColor,
                            roleConfig.textColor,
                            roleConfig.borderColor
                          )}
                        >
                          {roleConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 border-r border-border/50 border-solid">
                        <Badge
                          className={cn(
                            "flex items-center gap-1.5 w-fit px-3 py-1.5 font-medium",
                            statusConfig.bgColor,
                            statusConfig.textColor
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotColor)} />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(user)}
                            className="hover:bg-primary/10 hover:text-primary font-medium"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleClick(user)}
                            className={cn(
                              "font-medium",
                              user.isActive
                                ? "hover:bg-destructive/10 hover:text-destructive"
                                : "hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                            )}
                          >
                            {user.isActive ? (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Reativar
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <div className="p-4 rounded-full bg-muted/50">
              <Users className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                Nenhum usuário encontrado
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Não há usuários cadastrados no sistema
              </p>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isToggleDialogOpen} onOpenChange={setIsToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToToggle?.isActive ? 'Desativar usuário' : 'Reativar usuário'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToToggle?.isActive ? (
                <>
                  Tem certeza que deseja desativar o usuário <strong>{userToToggle.username}</strong>?
                  <br /><br />
                  O usuário não será excluído permanentemente. Ele será apenas desativado e poderá ser reativado posteriormente.
                  Todos os dados históricos serão mantidos.
                </>
              ) : (
                <>
                  Tem certeza que deseja reativar o usuário <strong>{userToToggle?.username}</strong>?
                  <br /><br />
                  O usuário voltará a ter acesso ao sistema e aparecerá na lista de usuários ativos.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              className={cn(
                userToToggle?.isActive
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {userToToggle?.isActive ? 'Desativar' : 'Reativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
