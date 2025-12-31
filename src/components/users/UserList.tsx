import { useState, useCallback } from "react";
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
import { SortableTableHeader, useTableSort } from "@/components/tables/SortableTableHeader";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useDialogState } from "@/hooks/useDialogState";

export const UserList = () => {
  const { toast } = useToast();
  const [showInactive, setShowInactive] = useState(false);

  // Fetch de usuários com loading automático
  const { data: users, isLoading, refetch } = useDataFetching({
    fetchFn: () => UserService.getAllUsers(),
    errorMessage: "Erro ao carregar usuários",
  });

  // Diálogos gerenciados com hook customizado
  const editDialog = useDialogState<User>();
  const toggleDialog = useDialogState<User>();

  // Handler de sucesso na edição
  const handleEditSuccess = useCallback(() => {
    editDialog.close();
    refetch();
    toast({
      title: "Usuário atualizado",
      description: "As informações do usuário foram atualizadas com sucesso.",
    });
  }, [editDialog, refetch, toast]);

  // Handler de toggle de status
  const handleToggleStatus = useCallback(async () => {
    if (!toggleDialog.data) return;

    try {
      const updatedUser = {
        ...toggleDialog.data,
        isActive: !toggleDialog.data.isActive,
      };

      await UserService.updateUser(toggleDialog.data.id.toString(), updatedUser);

      toast({
        title: updatedUser.isActive ? "Usuário reativado" : "Usuário desativado",
        description: `${toggleDialog.data.username} foi ${updatedUser.isActive ? 'reativado' : 'desativado'} com sucesso.`,
      });

      refetch();
      toggleDialog.close();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do usuário.",
      });
    }
  }, [toggleDialog, toast, refetch]);

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
    ? (users || [])
    : (users || []).filter(user => user.isActive);

  // Sorting - aplicado aos dados filtrados
  const { sortedData, sortKey, sortDirection, handleSort } = useTableSort(filteredUsers, 'username', 'asc');

  const activeCount = (users || []).filter(u => u.isActive).length;
  const inactiveCount = (users || []).filter(u => !u.isActive).length;

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
                {sortedData.length}
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
        {sortedData.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                  <TableHead className="w-20 text-center font-semibold text-foreground border-r border-border/30">Item</TableHead>
                  <SortableTableHeader
                    label="Nome"
                    sortKey="username"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="border-r border-border/30"
                  />
                  <SortableTableHeader
                    label="Permissão"
                    sortKey="role"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="border-r border-border/30"
                  />
                  <SortableTableHeader
                    label="Status"
                    sortKey="isActive"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="border-r border-border/30"
                  />
                  <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((user, index) => {
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
                      <TableCell className="text-center font-mono text-sm font-bold py-4 border-r border-border/30">
                        {String(index + 1).padStart(3, '0')}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground py-4 border-r border-border/30">{user.username}</TableCell>
                      <TableCell className="py-4 border-r border-border/30">
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
                      <TableCell className="py-4 border-r border-border/30">
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
                            onClick={() => editDialog.open(user)}
                            className="hover:bg-primary/10 hover:text-primary font-medium"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDialog.open(user)}
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

      <Dialog open={editDialog.isOpen} onOpenChange={editDialog.setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editDialog.data && (
            <EditUserForm
              user={editDialog.data}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={toggleDialog.isOpen} onOpenChange={toggleDialog.setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleDialog.data?.isActive ? 'Desativar usuário' : 'Reativar usuário'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleDialog.data?.isActive ? (
                <>
                  Tem certeza que deseja desativar o usuário <strong>{toggleDialog.data.username}</strong>?
                  <br /><br />
                  O usuário não será excluído permanentemente. Ele será apenas desativado e poderá ser reativado posteriormente.
                  Todos os dados históricos serão mantidos.
                </>
              ) : (
                <>
                  Tem certeza que deseja reativar o usuário <strong>{toggleDialog.data?.username}</strong>?
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
                toggleDialog.data?.isActive
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {toggleDialog.data?.isActive ? 'Desativar' : 'Reativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
