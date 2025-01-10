import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { useState } from "react";

interface Obra {
  id: number;
  nome: string;
  cliente: string;
  endereco: string;
  status: "EM_ANDAMENTO" | "CONCLUIDA" | "PAUSADA";
}

const obrasIniciais: Obra[] = [
  {
    id: 1,
    nome: "Residencial Vista Mar",
    cliente: "Construtora ABC",
    endereco: "Av. Beira Mar, 1000",
    status: "EM_ANDAMENTO"
  },
  {
    id: 2,
    nome: "Edifício Comercial Centro",
    cliente: "Incorporadora XYZ",
    endereco: "Rua Principal, 500",
    status: "PAUSADA"
  }
];

const Obras = () => {
  const [obras] = useState<Obra[]>(obrasIniciais);

  const getStatusBadge = (status: Obra["status"]) => {
    const statusConfig = {
      EM_ANDAMENTO: { label: "Em Andamento", variant: "default" as const },
      CONCLUIDA: { label: "Concluída", variant: "success" as const },
      PAUSADA: { label: "Pausada", variant: "warning" as const }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Obras</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Obra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Obra</DialogTitle>
              </DialogHeader>
              {/* Formulário será implementado posteriormente */}
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {obras.map((obra) => (
              <TableRow key={obra.id}>
                <TableCell className="font-medium">{obra.nome}</TableCell>
                <TableCell>{obra.cliente}</TableCell>
                <TableCell>{obra.endereco}</TableCell>
                <TableCell>{getStatusBadge(obra.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
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

export default Obras;