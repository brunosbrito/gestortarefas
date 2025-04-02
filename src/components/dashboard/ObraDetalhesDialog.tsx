
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Timer, Activity, ClipboardList } from "lucide-react";
import { ObraDetalhes } from "@/interfaces/ObraDetalhes";

interface ObraDetalhesDialogProps {
  obra: ObraDetalhes | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ObraDetalhesDialog = ({ obra, open, onOpenChange }: ObraDetalhesDialogProps) => {
  if (!obra) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Obra</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{obra.nome}</h2>
            {obra.status === "em_andamento" ? (
              <Badge variant="outline" className="bg-green-50 text-green-700">Ativo</Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700">Finalizado</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Datas
              </h3>
              <p>Início: {new Date(obra.dataInicio).toLocaleDateString('pt-BR')}</p>
              {obra.dataFim && (
                <p>Término: {new Date(obra.dataFim).toLocaleDateString('pt-BR')}</p>
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
              {obra.atividades.map((atividade, index) => (
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
              {obra.historico.map((evento, index) => (
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
  );
};
