import { Card } from "@/components/ui/card";
import { Building2, ClipboardList, Activity, Users, Check, X, Edit, Eye, Timer, Calendar, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const stats = [
  {
    title: "Total de Obras",
    value: "12",
    icon: Building2,
    color: "bg-blue-500",
  },
  {
    title: "Ordens de Serviço",
    value: "48",
    icon: ClipboardList,
    color: "bg-green-500",
  },
  {
    title: "Atividades",
    value: "156",
    icon: Activity,
    color: "bg-purple-500",
  },
  {
    title: "Usuários",
    value: "24",
    icon: Users,
    color: "bg-orange-500",
  },
];

interface ObraDetalhes {
  nome: string;
  status: "em_andamento" | "finalizado" | "interrompido";
  dataInicio: string;
  dataFim?: string;
  horasTrabalhadas: number;
  atividades: string[];
  historico: string[];
}

const obrasExemplo: ObraDetalhes[] = [
  {
    nome: "Residencial Vista Mar",
    status: "em_andamento",
    dataInicio: "2024-01-15",
    horasTrabalhadas: 450,
    atividades: [
      "Fundação concluída",
      "Alvenaria em andamento",
      "Instalações elétricas iniciadas"
    ],
    historico: [
      "15/01/2024 - Início da obra",
      "20/01/2024 - Fundação iniciada",
      "15/02/2024 - Fundação concluída"
    ]
  },
  {
    nome: "Edifício Comercial Centro",
    status: "interrompido",
    dataInicio: "2024-02-01",
    horasTrabalhadas: 320,
    atividades: [
      "Terraplanagem concluída",
      "Fundação em andamento"
    ],
    historico: [
      "01/02/2024 - Início da obra",
      "10/02/2024 - Terraplanagem iniciada",
      "25/02/2024 - Terraplanagem concluída",
      "01/03/2024 - Obra interrompida"
    ]
  }
];

const Dashboard = () => {
  const [obraSelecionada, setObraSelecionada] = useState<ObraDetalhes | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  const getStatusBadge = (status: ObraDetalhes["status"]) => {
    switch (status) {
      case "em_andamento":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Em Andamento
          </Badge>
        );
      case "finalizado":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Check className="w-3 h-3 mr-1" />
            Finalizado
          </Badge>
        );
      case "interrompido":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Pause className="w-3 h-3 mr-1" />
            Interrompido
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-construction-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-construction-500">{stat.title}</p>
                <h2 className="text-2xl font-bold text-construction-900">{stat.value}</h2>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Obras em Andamento</h3>
          <div className="space-y-4">
            {obrasExemplo.map((obra) => (
              <div key={obra.nome} className="flex items-center justify-between p-4 bg-construction-50 rounded-lg border border-construction-100">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-construction-700">{obra.nome}</span>
                  {getStatusBadge(obra.status)}
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => setObraSelecionada(obra)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Detalhes da Obra</DialogTitle>
                      </DialogHeader>
                      {obraSelecionada && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">{obraSelecionada.nome}</h2>
                            {obraSelecionada.status === "em_andamento" ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700">Ativo</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700">Finalizado</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold mb-2 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Datas
                              </h3>
                              <p>Início: {new Date(obraSelecionada.dataInicio).toLocaleDateString('pt-BR')}</p>
                              {obraSelecionada.dataFim && (
                                <p>Término: {new Date(obraSelecionada.dataFim).toLocaleDateString('pt-BR')}</p>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2 flex items-center">
                                <Timer className="w-4 h-4 mr-2" />
                                Horas Trabalhadas
                              </h3>
                              <p>{obraSelecionada.horasTrabalhadas}h</p>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Atividades Recentes</h3>
                            <ul className="space-y-2">
                              {obraSelecionada.atividades.map((atividade, index) => (
                                <li key={index} className="flex items-center">
                                  <Activity className="w-4 h-4 mr-2 text-construction-500" />
                                  {atividade}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Histórico</h3>
                            <ul className="space-y-2">
                              {obraSelecionada.historico.map((evento, index) => (
                                <li key={index} className="flex items-center">
                                  <ClipboardList className="w-4 h-4 mr-2 text-construction-500" />
                                  {evento}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#FF7F0E] hover:text-[#FF7F0E]/90"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  {obra.status === "em_andamento" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Finalizar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
          <div className="space-y-4">
            {[
              "Fundação concluída - Residencial Vista Mar",
              "Nova OS criada - Edifício Comercial Centro",
              "Usuário adicionado - João Silva",
            ].map((atividade) => (
              <div key={atividade} className="flex items-center justify-between p-3 bg-construction-50 rounded-lg">
                <span className="font-medium text-construction-700">{atividade}</span>
                <span className="text-sm text-construction-500">Hoje</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
