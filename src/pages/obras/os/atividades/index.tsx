import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Building2, Upload, Edit2, Eye, GripHorizontal } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { NovaAtividadeForm } from "@/components/atividades/NovaAtividadeForm";

interface Atividade {
  id: number;
  descricao: string;
  os: string;
  obra: string;
  responsavel: string;
  prazo: string;
  tarefaMacro: string;
  processo: string;
  status: "Planejadas" | "Em Execução" | "Concluídas" | "Paralizadas";
  horasTrabalhadas?: {
    colaborador: string;
    horas: number;
    tarefaMacro: string;
    processo: string;
  }[];
  historico?: {
    data: string;
    status: string;
    responsavel: string;
  }[];
}

const atividadesIniciais: Atividade[] = [
  {
    id: 1,
    descricao: "Escavação para fundação",
    os: "OS-001",
    obra: "Residencial Vista Mar",
    responsavel: "João Silva",
    prazo: "2024-03-01",
    tarefaMacro: "Fundação",
    processo: "Escavação",
    status: "Em Execução",
    horasTrabalhadas: [
      { colaborador: "João Silva", horas: 8, tarefaMacro: "Fundação", processo: "Escavação" }
    ],
    historico: [
      { data: "2024-02-20", status: "Planejadas", responsavel: "Maria Santos" },
      { data: "2024-02-21", status: "Em Execução", responsavel: "João Silva" }
    ]
  },
  {
    id: 2,
    descricao: "Montagem de formas",
    os: "OS-001",
    obra: "Residencial Vista Mar",
    responsavel: "Maria Santos",
    prazo: "2024-03-05",
    tarefaMacro: "Fundação",
    processo: "Montagem",
    status: "Planejadas",
    horasTrabalhadas: [],
    historico: [
      { data: "2024-02-20", status: "Planejadas", responsavel: "Maria Santos" }
    ]
  }
];

const statusListas = ["Planejadas", "Em Execução", "Concluídas", "Paralizadas"] as const;

const Atividades = () => {
  const [atividades, setAtividades] = useState<Atividade[]>(atividadesIniciais);
  const [openNovaAtividade, setOpenNovaAtividade] = useState(false);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, atividadeId: number) => {
    e.dataTransfer.setData("atividadeId", atividadeId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, novoStatus: Atividade["status"]) => {
    e.preventDefault();
    const atividadeId = Number(e.dataTransfer.getData("atividadeId"));
    
    setAtividades(prev => prev.map(atividade => {
      if (atividade.id === atividadeId && atividade.status !== novoStatus) {
        const novoHistorico = [
          ...(atividade.historico || []),
          {
            data: new Date().toISOString(),
            status: novoStatus,
            responsavel: atividade.responsavel
          }
        ];
        
        toast({
          title: "Status atualizado",
          description: `Atividade movida para ${novoStatus}`,
        });

        return {
          ...atividade,
          status: novoStatus,
          historico: novoHistorico
        };
      }
      return atividade;
    }));
  };

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
              <NovaAtividadeForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {statusListas.map((status) => (
            <div
              key={status}
              className="flex-none w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
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
                      <Card
                        key={atividade.id}
                        className="bg-white cursor-move hover:shadow-md transition-shadow"
                        draggable
                        onDragStart={(e) => handleDragStart(e, atividade.id)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              {atividade.descricao}
                            </CardTitle>
                            <GripHorizontal className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{atividade.tarefaMacro}</Badge>
                            <Badge variant="outline">{atividade.processo}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-gray-500">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Building2 className="w-4 h-4 mr-2" />
                              {atividade.obra}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Prazo: {new Date(atividade.prazo).toLocaleDateString('pt-BR')}
                            </div>
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
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Histórico de Status</h4>
                                  <div className="space-y-2">
                                    {atividade.historico?.map((h, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <span>{new Date(h.data).toLocaleDateString('pt-BR')}</span>
                                        <span>{h.status}</span>
                                        <span>{h.responsavel}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Horas Trabalhadas</h4>
                                  <div className="space-y-2">
                                    {atividade.horasTrabalhadas?.map((h, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <span>{h.colaborador}</span>
                                        <span>{h.horas}h</span>
                                        <span>{h.tarefaMacro}</span>
                                        <span>{h.processo}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <div className="flex gap-2">
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
                                <NovaAtividadeForm editMode={true} atividadeInicial={atividade} />
                              </DialogContent>
                            </Dialog>
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
