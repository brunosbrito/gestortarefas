import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Building2, Calendar, Check, ClipboardList, Edit, Eye, MapPin, Pause, Users, Activity, Timer } from "lucide-react";
import { ObraDetalhada } from "./types";
import { EditObraForm } from "./EditObraForm";
import { FinalizarObraForm } from "./FinalizarObraForm";

interface ObraCardProps {
  obra: ObraDetalhada;
  onEdit: (obraId: number, data: any) => void;
  onFinalizar: (obraId: number, data: { endDate: string }) => void;
}

export const ObraCard = ({ obra, onEdit, onFinalizar }: ObraCardProps) => {
  const getStatusBadge = (status: ObraDetalhada["status"]) => {
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#FF7F0E]" />
            <CardTitle className="text-xl">{obra.name}</CardTitle>
          </div>
          {getStatusBadge(obra.status)}
        </div>
        <CardDescription className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>{obra.client}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span>{obra.address}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>Início: {new Date(obra.startDate).toLocaleDateString('pt-BR')}</span>
        </div>
        {obra.observation && (
          <div className="flex items-center space-x-2 text-sm">
            <ClipboardList className="w-4 h-4 text-gray-500" />
            <span>{obra.observation}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Obra</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{obra.name}</h2>
                {getStatusBadge(obra.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Datas
                  </h3>
                  <p>Início: {new Date(obra.startDate).toLocaleDateString('pt-BR')}</p>
                  {obra.endDate && (
                    <p>Término: {new Date(obra.endDate).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Timer className="w-4 h-4 mr-2" />
                    Horas Trabalhadas
                  </h3>
                  <p>{obra.horasTrabalhadas}h</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Atividades Recentes</h3>
                <ul className="space-y-2">
                  {obra.atividades?.map((atividade, index) => (
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
                  {obra.historico?.map((evento, index) => (
                    <li key={index} className="flex items-center">
                      <ClipboardList className="w-4 h-4 mr-2 text-construction-500" />
                      {evento}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost"
              className="text-[#FF7F0E] hover:text-[#FF7F0E]/90"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Obra</DialogTitle>
            </DialogHeader>
            <EditObraForm obra={obra} onSubmit={(data) => onEdit(obra.id!, data)} />
          </DialogContent>
        </Dialog>

        {obra.status === "em_andamento" && (
          <AlertDialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-green-600 hover:text-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Finalizar
              </Button>
            </DialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Finalizar Obra</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja finalizar esta obra? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <FinalizarObraForm onSubmit={(data) => onFinalizar(obra.id!, data)} />
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
};