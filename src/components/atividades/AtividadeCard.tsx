import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Calendar, Edit2, Eye, GripHorizontal, Upload } from "lucide-react";
import { NovaAtividadeForm } from "./NovaAtividadeForm";
import { useToast } from "@/hooks/use-toast";
import { AtividadeStatus } from "@/interfaces/AtividadeStatus";
import { useParams } from "react-router-dom";

interface AtividadeCardProps {
  atividade: AtividadeStatus;
}

export const AtividadeCard = ({ atividade }: AtividadeCardProps) => {
  const { toast } = useToast();
  const { projectId, serviceOrderId } = useParams();

  return (
    <Card className="bg-white cursor-move hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {atividade.description}
          </CardTitle>
          <GripHorizontal className="w-4 h-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm text-gray-500">
        <div className="flex items-center">
          <Building2 className="w-4 h-4 mr-2" />
          {atividade.obra}
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Prazo: {new Date(atividade.prazo).toLocaleDateString('pt-BR')}
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
          </DialogContent>
        </Dialog>
        <div className="flex gap-2">
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
              <NovaAtividadeForm 
                editMode={true}
                projectId={Number(projectId)}
                orderServiceId={Number(serviceOrderId)}
              />
            </DialogContent>
          </Dialog>
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
        </div>
      </CardFooter>
    </Card>
  );
};