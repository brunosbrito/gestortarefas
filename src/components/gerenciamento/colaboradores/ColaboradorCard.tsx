import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { Colaborador } from "@/interfaces/ColaboradorInterface";

interface ColaboradorCardProps {
  colaborador: Colaborador;
  onEdit: (colaborador: Colaborador) => void;
  onView: (colaborador: Colaborador) => void;
}

export const ColaboradorCard = ({ colaborador, onEdit, onView }: ColaboradorCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{colaborador.nome}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">{colaborador.cargo}</p>
        <p className="text-sm text-gray-500">{colaborador.email}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="hover:bg-secondary/20"
          onClick={() => onView(colaborador)}
        >
          <Eye className="w-4 h-4 mr-2" />
          Visualizar
        </Button>
        <Button
          variant="outline"
          className="hover:bg-secondary/20"
          onClick={() => onEdit(colaborador)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </CardFooter>
    </Card>
  );
};