import { AtividadeStatus } from "@/interfaces/AtividadeStatus";
import { Button } from "../ui/button";
import { Eye, FileText } from "lucide-react";

interface AtividadeInfoBasicaProps {
  atividade: AtividadeStatus;
}

export function AtividadeInfoBasica({ atividade }: AtividadeInfoBasicaProps) {
  const handleViewImage = () => {
    if (atividade.imageUrl) {
      window.open(`https://api.gmxindustrial.com.br${atividade.imageUrl}`, '_blank');
    }
  };

  const handleViewPDF = () => {
    if (atividade.fileUrl) {
      window.open(`https://api.gmxindustrial.com.br${atividade.fileUrl}`, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-construction-700">
        Informações Básicas
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Descrição</p>
          <p className="text-base">{atividade.description}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Tarefa Macro</p>
          <p className="text-base">{atividade.macroTask}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Processo</p>
          <p className="text-base">{atividade.process}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Status</p>
          <p className="text-base">{atividade.status}</p>
        </div>
        {atividade.observation && (
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Observação</p>
            <p className="text-base">{atividade.observation}</p>
          </div>
        )}
        <div className="col-span-2 flex gap-2">
          {atividade.imageUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewImage}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Ver Imagem
            </Button>
          )}
          {atividade.fileUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewPDF}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Ver PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}