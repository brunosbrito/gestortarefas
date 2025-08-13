
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { Separator } from '@/components/ui/separator';
import { AtividadeImageCarousel } from '../AtividadeImageCarousel';
import { AtividadeInfoBasica } from '../AtividadeInfoBasica';
import { AtividadeEquipe } from '../AtividadeEquipe';
import { AtividadeHistoricoList } from '../AtividadeHistoricoList';

interface AtividadeDetailsProps {
  atividade: AtividadeStatus;
}

export const AtividadeDetails = ({ atividade }: AtividadeDetailsProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Eye className="w-4 h-4 mr-1" />
          Detalhes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-construction-800">
            Detalhes da Atividade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <AtividadeImageCarousel images={atividade.images} />
          <AtividadeInfoBasica atividade={atividade} />
          <Separator className="my-4" />
          <AtividadeEquipe collaborators={atividade.collaborators || []} />
          <Separator className="my-4" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-construction-700">
              Histórico de Alterações
            </h3>
            <div className="bg-construction-50 p-4 rounded-lg">
              <AtividadeHistoricoList activityId={atividade.id} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
