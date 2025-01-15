import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Building2, Upload, Edit2, Eye, GripHorizontal } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { NovaAtividadeForm } from "@/components/atividades/NovaAtividadeForm";
import { Activity } from "@/interfaces/AtividadeInterface";

interface AtividadeStatus {
  id: number;
  description: string;
  os: string;
  obra: string;
  responsavel: string;
  prazo: string;
  tarefaMacro: string;
  processo: string;
  status: "Planejadas" | "Em Execução" | "Concluídas" | "Paralizadas";
}

const atividadesIniciais: AtividadeStatus[] = [
  {
    id: 1,
    description: "Escavação para fundação",
    os: "OS-001",
    obra: "Residencial Vista Mar",
    responsavel: "João Silva",
    prazo: "2024-03-01",
    tarefaMacro: "Fundação",
    processo: "Escavação",
    status: "Em Execução",
  },
  {
    id: 2,
    description: "Montagem de formas",
    os: "OS-001",
    obra: "Residencial Vista Mar",
    responsavel: "Maria Santos",
    prazo: "2024-03-05",
    tarefaMacro: "Fundação",
    processo: "Montagem",
    status: "Planejadas",
  }
];

const statusListas = ["Planejadas", "Em Execução", "Concluídas", "Paralizadas"] as const;

const Atividades = () => {
  const [atividades, setAtividades] = useState<AtividadeStatus[]>(atividadesIniciais);
  const [openNovaAtividade, setOpenNovaAtividade] = useState(false);
  const { toast } = useToast();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Atividades</h1>
          <Dialog open={openNovaAtividade} onOpenChange={setOpenNovaAtividade}>
            <DialogTrigger asChild>
              <Button className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Atividade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Atividade</DialogTitle>
              </DialogHeader>
              <NovaAtividadeForm 
                projectId={1} 
                orderServiceId={1}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {statusListas.map((status) => (
            <div key={status} className="flex-none w-80">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{status}</h3>
                  <Badge variant="outline">
                    {atividades.filter(a => a.status === status).length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {atividades
                    .filter(atividade => atividade.status === status)
                    .map((atividade) => (
                      <Card key={atividade.id} className="bg-white cursor-move hover:shadow-md transition-shadow">
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              {atividade.description}
                            </CardTitle>
                            <GripHorizontal className="w-4 h-4 text-gray-400" />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2" />
                            {atividade.obra}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Prazo: {new Date(atividade.prazo).toLocaleDateString('pt-BR')}
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalhes da Atividade</DialogTitle>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Editar Atividade</DialogTitle>
                                </DialogHeader>
                                <NovaAtividadeForm 
                                  editMode={true} 
                                  projectId={1}
                                  orderServiceId={1}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Upload de imagem",
                                  description: "Funcionalidade será implementada em breve",
                                });
                              }}
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Atividades;