import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { UserForm } from "@/components/users/UserForm";
import { UserList } from "@/components/users/UserList";

const Users = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Novo Usuário</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <UserForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border bg-card">
          <UserList />
        </div>
      </div>
    </Layout>
  );
};

export default Users;