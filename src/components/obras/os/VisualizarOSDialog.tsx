import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Building2, ClipboardList } from "lucide-react";
import { ServiceOrder } from "@/interfaces/ServiceOrderInterface";

interface VisualizarOSDialogProps {
  os: ServiceOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VisualizarOSDialog = ({ os, open, onOpenChange }: VisualizarOSDialogProps) => {
  if (!os) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">OS-{os.serviceOrderNumber.toString().padStart(3, '0')}</h2>
            <Badge variant={os.status === "em_andamento" ? "default" : os.status === "concluida" ? "secondary" : "outline"}>
              {os.status === "em_andamento" ? "Em Andamento" : os.status === "concluida" ? "Concluída" : "Pausada"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Obra
              </h3>
              <p>{os.projectId.name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Data de Início
              </h3>
              <p>{new Date(os.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <ClipboardList className="w-4 h-4 mr-2" />
              Descrição
            </h3>
            <p>{os.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Responsável
            </h3>
            <p>{os.assignedUser?.name || "Não atribuído"}</p>
          </div>

          {os.notes && (
            <div>
              <h3 className="font-semibold mb-2">Observações</h3>
              <p>{os.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};