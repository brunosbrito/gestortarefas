import { Badge } from "@/components/ui/badge";
import { AtividadeStatus } from "@/interfaces/AtividadeStatus";
import { AtividadeCard } from "./AtividadeCard";

interface StatusListProps {
  status: string;
  atividades: AtividadeStatus[];
}

export const StatusList = ({ status, atividades }: StatusListProps) => {
  const atividadesFiltradas = atividades.filter(a => a.status === status);

  return (
    <div className="flex-none w-80">
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{status}</h3>
          <Badge variant="outline">
            {atividadesFiltradas.length}
          </Badge>
        </div>
        <div className="space-y-3">
          {atividadesFiltradas.map((atividade) => (
            <AtividadeCard key={atividade.id} atividade={atividade} />
          ))}
        </div>
      </div>
    </div>
  );
};