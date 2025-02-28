
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { NonConformity } from '@/interfaces/RncInterface';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText } from 'lucide-react';
import PdfService from '@/services/PdfService';
import { useToast } from '@/hooks/use-toast';

interface DetalhesRNCDialogProps {
  rnc: NonConformity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetalhesRNCDialog({
  rnc,
  open,
  onOpenChange,
}: DetalhesRNCDialogProps) {
  const { toast } = useToast();

  if (!rnc) return null;

  const handleGeneratePDF = async () => {
    try {
      const doc = await PdfService.generateRncPdf(rnc);
      doc.save(`RNC-${rnc.id}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso",
        description: "O documento foi baixado para o seu computador.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o documento.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold text-construction-800">
              RNC #{rnc.id}
            </DialogTitle>
            <Button
              onClick={handleGeneratePDF}
              className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Informações Básicas</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Data da Ocorrência:</span>{' '}
                  {format(new Date(rnc.dateOccurrence), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Projeto:</span> {rnc.project.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Ordem de Serviço:</span>{' '}
                  {rnc.serviceOrder.description}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Responsável:</span>{' '}
                  {rnc.responsibleRNC.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Identificado por:</span>{' '}
                  {rnc.responsibleIdentification}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-sm whitespace-pre-wrap">{rnc.description}</p>
            </div>
          </div>

          {rnc.workforce && rnc.workforce.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Mão de Obra</h3>
              <ul className="list-disc list-inside space-y-1">
                {rnc.workforce.map((worker) => (
                  <li key={worker.id} className="text-sm">
                    {worker.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rnc.materials && rnc.materials.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Materiais</h3>
              <ul className="list-disc list-inside space-y-1">
                {rnc.materials.map((material) => (
                  <li key={material.id} className="text-sm">
                    {material.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rnc.images && rnc.images.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Imagens</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {rnc.images.map((image) => (
                  <div key={image.id} className="relative aspect-square">
                    <img
                      src={image.url}
                      alt="Imagem da RNC"
                      className="object-cover rounded-lg w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
