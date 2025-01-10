import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Send } from "lucide-react";

interface Funcionario {
  id: number;
  nome: string;
  setor: "PRODUCAO" | "ADMINISTRATIVO";
  status: "PRESENTE" | "FALTA";
  turno: 1 | 2;
}

const funcionariosIniciais: Funcionario[] = [
  {
    id: 1,
    nome: "João Silva",
    setor: "PRODUCAO",
    status: "PRESENTE",
    turno: 1
  },
  {
    id: 2,
    nome: "Maria Santos",
    setor: "ADMINISTRATIVO",
    status: "PRESENTE",
    turno: 2
  }
];

const RegistroPonto = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(funcionariosIniciais);

  const handleDelete = (id: number) => {
    setFuncionarios(prev => prev.filter(f => f.id !== id));
  };

  const handleEnviar = () => {
    // Implementar integração com API posteriormente
    console.log("Enviando dados do ponto:", funcionarios);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Registro de Ponto</h1>
          <div className="space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Registro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Registro de Ponto</DialogTitle>
                </DialogHeader>
                {/* Formulário será implementado posteriormente */}
              </DialogContent>
            </Dialog>
            <Button onClick={handleEnviar} variant="secondary">
              <Send className="w-4 h-4 mr-2" />
              Enviar Registros
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcionarios.map((funcionario) => (
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
                <TableCell>{`${funcionario.turno}º Turno`}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(funcionario.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
};

export default RegistroPonto;