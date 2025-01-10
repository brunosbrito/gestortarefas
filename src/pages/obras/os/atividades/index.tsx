import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { useState } from "react";

interface Atividade {
  id: number;
  descricao: string;
  os: string;
  obra: string;
  responsavel: string;
  prazo: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";
}

const atividadesIniciais: Atividade[] = [
  {
    id: 1,
    descricao: "Escavação para fundação",
    os: "OS-001",
    obra: "Residencial Vista Mar",
    responsavel: "João Silva",
    prazo: "2024-03-01",
    status: "EM_ANDAMENTO"
  },
  {
    id: 2,
    descricao: "Montagem de formas",
    os: "OS-001",
    obra: "Residencial Vista Mar",
    responsavel: "Maria Santos",
    prazo: "2024-03-05",
    status: "PENDENTE"
  }
];

const Atividades = () => {
  const [atividades] = useState<Atividade[]>(atividadesIniciais);

  const getStatusBadge = (status: Atividade["status"]) => {
    const statusConfig = {
      PENDENTE: { label: "Pendente", variant: "outline" as const },
      EM_ANDAMENTO: { label: "Em Andamento", variant: "default" as const },
      CONCLUIDA: { label: "Concluída", variant: "secondary" as const }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Atividades</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Atividade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Atividade</DialogTitle>
              </DialogHeader>
              {/* Formulário será implementado posteriormente */}
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>Obra</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atividades.map((atividade) => (
              <TableRow key={atividade.id}>
                <TableCell className="font-medium">{atividade.descricao}</TableCell>
                <TableCell>{atividade.os}</TableCell>
                <TableCell>{atividade.obra}</TableCell>
                <TableCell>{atividade.responsavel}</TableCell>
                <TableCell>{atividade.prazo}</TableCell>
                <TableCell>{getStatusBadge(atividade.status)}</TableCell>
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

export default Atividades;