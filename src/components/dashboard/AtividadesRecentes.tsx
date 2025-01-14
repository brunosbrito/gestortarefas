import { Card } from "@/components/ui/card";

interface AtividadeRecente {
  descricao: string;
  data: string;
}

interface AtividadesRecentesProps {
  atividades: AtividadeRecente[];
}

export const AtividadesRecentes = ({ atividades }: AtividadesRecentesProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
      <div className="space-y-4">
        {atividades.map((atividade, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-construction-50 rounded-lg">
            <span className="font-medium text-construction-700">{atividade.descricao}</span>
            <span className="text-sm text-construction-500">{atividade.data}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};