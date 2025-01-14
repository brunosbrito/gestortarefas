import { Card } from "@/components/ui/card";
import { Building2, ClipboardList, Activity, Users, Check, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { StatsCard } from "./dashboard/StatsCard";
import { getStatusBadge } from "./dashboard/ObraStatusBadge";
import { ObraDetalhesDialog } from "./dashboard/ObraDetalhesDialog";
import { AtividadesRecentes } from "./dashboard/AtividadesRecentes";

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

export interface ObraDetalhes {
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

const atividadesRecentes = [
  {
    descricao: "Fundação concluída - Residencial Vista Mar",
    data: "Hoje"
  },
  {
    descricao: "Nova OS criada - Edifício Comercial Centro",
    data: "Hoje"
  },
  {
    descricao: "Usuário adicionado - João Silva",
    data: "Hoje"
  }
];

const Dashboard = () => {
  const [obraSelecionada, setObraSelecionada] = useState<ObraDetalhes | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-construction-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      setObraSelecionada(obra);
                      setDialogAberto(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
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

        <AtividadesRecentes atividades={atividadesRecentes} />
      </div>

      <ObraDetalhesDialog
        obra={obraSelecionada}
        open={dialogAberto}
        onOpenChange={setDialogAberto}
      />
    </div>
  );
};

export default Dashboard;
