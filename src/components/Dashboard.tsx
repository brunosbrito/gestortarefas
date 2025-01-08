import { Card } from "@/components/ui/card";
import { Building2, ClipboardList, Activity, Users } from "lucide-react";

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

const Dashboard = () => {
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
            {["Residencial Vista Mar", "Edifício Comercial Centro", "Condomínio Park"].map((obra) => (
              <div key={obra} className="flex items-center justify-between p-3 bg-construction-50 rounded-lg">
                <span className="font-medium text-construction-700">{obra}</span>
                <span className="text-sm text-construction-500">Em progresso</span>
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