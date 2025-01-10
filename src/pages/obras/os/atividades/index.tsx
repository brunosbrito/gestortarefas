import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, GripHorizontal } from "lucide-react";
import { useState } from "react";

interface Atividade {
  id: number;
  descricao: string;
  os: string;
  obra: string;
  responsavel: string;
  prazo: string;
  tarefaMacro: string;
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
    tarefaMacro: "Fundação",
    status: "EM_ANDAMENTO"
  },
  {
    id: 2,
    descricao: "Montagem de formas",
    os: "OS-001",
    obra: "Residencial Vista Mar",
    responsavel: "Maria Santos",
    prazo: "2024-03-05",
    tarefaMacro: "Fundação",
    status: "PENDENTE"
  },
  {
    id: 3,
    descricao: "Concretagem pilares",
    os: "OS-001",
    obra: "Residencial Vista Mar",
    responsavel: "Pedro Costa",
    prazo: "2024-03-10",
    tarefaMacro: "Estrutura",
    status: "PENDENTE"
  }
];

const Atividades = () => {
  const [atividades] = useState<Atividade[]>(atividadesIniciais);

  const tarefasMacro = Array.from(new Set(atividades.map(a => a.tarefaMacro)));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Atividades</h1>
          <Button className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Atividade
          </Button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {tarefasMacro.map((tarefaMacro) => (
            <div key={tarefaMacro} className="flex-none w-80">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{tarefaMacro}</h3>
                  <Badge variant="outline">{atividades.filter(a => a.tarefaMacro === tarefaMacro).length}</Badge>
                </div>
                <div className="space-y-3">
                  {atividades
                    .filter(atividade => atividade.tarefaMacro === tarefaMacro)
                    .map((atividade) => (
                      <Card key={atividade.id} className="bg-white cursor-move hover:shadow-md transition-shadow">
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm font-medium">
                            {atividade.descricao}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-gray-500">
                          <div className="flex items-center justify-between mb-2">
                            <span>{atividade.os}</span>
                            <GripHorizontal className="w-4 h-4" />
                          </div>
                          <div>Responsável: {atividade.responsavel}</div>
                          <div>Prazo: {new Date(atividade.prazo).toLocaleDateString('pt-BR')}</div>
                        </CardContent>
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