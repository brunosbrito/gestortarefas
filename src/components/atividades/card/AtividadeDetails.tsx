
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, FileDown, Loader2 } from 'lucide-react';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { Separator } from '@/components/ui/separator';
import { AtividadeImageCarousel } from '../AtividadeImageCarousel';
import { AtividadeInfoBasica } from '../AtividadeInfoBasica';
import { AtividadeEquipe } from '../AtividadeEquipe';
import { AtividadeHistoricoList } from '../AtividadeHistoricoList';
import AtividadeDetailPdfService from '@/services/AtividadeDetailPdfService';

interface AtividadeDetailsProps {
  atividade: AtividadeStatus;
}

export const AtividadeDetails = ({ atividade }: AtividadeDetailsProps) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await AtividadeDetailPdfService.generatePdf(atividade);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
          <Eye className="w-3.5 h-3.5 mr-1" />
          Detalhes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Detalhes da Atividade
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              {isGeneratingPdf ? 'Gerando...' : 'Exportar PDF'}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <AtividadeImageCarousel images={atividade.images} />
          <AtividadeInfoBasica atividade={atividade} />
          <Separator className="my-4" />
          <AtividadeEquipe collaborators={atividade.collaborators || []} />
          <Separator className="my-4" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Histórico de Alterações
            </h3>
            <div className="bg-muted/30 p-4 rounded-lg">
              <AtividadeHistoricoList activityId={atividade.id} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
