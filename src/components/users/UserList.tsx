import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  name: string | null;
  permission: string | null;
  cpf: string | null;
}

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>CPF</TableHead>
          <TableHead>Função</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.cpf}</TableCell>
            <TableCell>
              <Badge variant={user.permission === 'admin' ? 'default' : 'secondary'}>
                {user.permission === 'admin' ? 'Administrador' : 'Básico'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};