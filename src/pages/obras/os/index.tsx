import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Building2, ClipboardList, Activity } from "lucide-react";
import { useState } from "react";
import { NovaOSForm } from "@/components/obras/os/NovaOSForm";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>(ordensServicoIniciais);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNovaOS = (data: any) => {
    const novaOS = {
      id: ordensServico.length + 1,
      ...data,
    };
    
    setOrdensServico([...ordensServico, novaOS]);
    setDialogOpen(false);
    toast({
      title: "Ordem de Serviço criada",
      description: "A OS foi criada com sucesso!",
    });
  };

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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova OS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Ordem de Serviço</DialogTitle>
              </DialogHeader>
              <NovaOSForm onSubmit={handleNovaOS} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordensServico.map((os) => (
            <Card key={os.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{os.numero}</CardTitle>
                  {getStatusBadge(os.status)}
                </div>
                <CardDescription>{os.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span>{os.obra}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Início: {new Date(os.dataInicio).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-[#FF7F0E]/10"
                  onClick={() => {
                    console.log(`Ver detalhes da OS ${os.id}`);
                  }}
                >
                  Ver Detalhes
                </Button>
                <Button
                  variant="outline"
                  className="w-full hover:bg-[#FF7F0E]/10"
                  onClick={() => navigate(`/obras/os/atividades?os=${os.id}`)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Atividades
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default OrdensServico;