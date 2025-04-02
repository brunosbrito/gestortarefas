
import { Badge } from "@/components/ui/badge";
import { Check, Pause } from "lucide-react";
import { ObraDetalhes } from "@/interfaces/ObraDetalhes";

export const getStatusBadge = (status: ObraDetalhes["status"]) => {
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
