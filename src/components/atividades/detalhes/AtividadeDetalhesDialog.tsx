import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtividadeInformacoes } from './AtividadeInformacoes';
import { AtividadeEquipe } from './AtividadeEquipe';
import { AtividadeHistoricoSection } from './AtividadeHistoricoSection';

interface AtividadeDetalhesDialogProps {
  atividade: AtividadeStatus;
}

export const AtividadeDetalhesDialog = ({
  atividade,
}: AtividadeDetalhesDialogProps) => {
  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-construction-800">
          Detalhes da Atividade
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        <AtividadeInformacoes atividade={atividade} />
        <AtividadeEquipe colaboradores={atividade.collaborators} />
        <AtividadeHistoricoSection />
      </div>
    </DialogContent>
  );
};