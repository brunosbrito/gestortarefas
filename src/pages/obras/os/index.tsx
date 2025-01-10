import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { useState } from "react";

interface OrdemServico {
  id: number;
  numero: string;
  descricao: string;
  obra: string;
  dataInicio: string;
  status: "EM_ANDAMENTO" | "CONCLUIDA" | "PAUSADA";
}

const ordensServicoIniciais: OrdemServico[] = [
  {
    id: 1,
    numero: "OS-001",
    descricao: "Fundação Bloco A",
    obra: "Residencial Vista Mar",
    dataInicio: "2024-02-20",
    status: "EM_ANDAMENTO"
  },
  {
    id: 2,
    numero: "OS-002",
    descricao: "Alvenaria Bloco B",
    obra: "Edifício Comercial Centro",
    dataInicio: "2024-02-15",
    status: "PAUSADA"
  }
];

const OrdensServico = () => {
  const [ordensServico] = useState<OrdemServico[]>(ordensServicoIniciais);

  const getStatusBadge = (status: OrdemServico["status"]) => {
    const statusConfig = {
      EM_ANDAMENTO: { label: "Em Andamento", variant: "default" as const },
      CONCLUIDA: { label: "Concluída", variant: "secondary" as const },
      PAUSADA: { label: "Pausada", variant: "outline" as const }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Ordens de Serviço</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova OS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Ordem de Serviço</DialogTitle>
              </DialogHeader>
              {/* Formulário será implementado posteriormente */}
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Obra</TableHead>
              <TableHead>Data Início</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordensServico.map((os) => (
              <TableRow key={os.id}>
                <TableCell className="font-medium">{os.numero}</TableCell>
                <TableCell>{os.descricao}</TableCell>
                <TableCell>{os.obra}</TableCell>
                <TableCell>{os.dataInicio}</TableCell>
                <TableCell>{getStatusBadge(os.status)}</TableCell>
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

export default OrdensServico;