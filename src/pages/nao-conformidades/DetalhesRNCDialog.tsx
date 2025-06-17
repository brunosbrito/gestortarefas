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
import CraftMyPdfService from '@/services/CraftMyPdfService';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/dashboard/LoadingSpinner';
import { useState } from 'react';

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!rnc) return null;

  const getImageUrl = (url: string) => {
    return url.startsWith('http')
      ? url
      : `https://api.gmxindustrial.com.br${url}`;
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPdf(true);

    try {
      await CraftMyPdfService.generateRncPdf(rnc);

      toast({
        title: 'PDF gerado com sucesso',
        description: 'O documento foi aberto em uma nova aba.',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);

      toast({
        variant: 'destructive',
        title: 'Erro ao gerar PDF',
        description: 'Ocorreu um erro ao gerar o documento.',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold text-[#003366]">
              RNC #{rnc.id}
            </DialogTitle>
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPdf}
              className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90 disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Gerando PDF...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar PDF
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {isGeneratingPdf && (
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner />
            <p className="mt-4 text-sm text-gray-600">Gerando PDF da RNC...</p>
          </div>
        )}

        {!isGeneratingPdf && (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-[#003366] border-b border-[#E0E0E0] pb-2">
                  Informações Básicas
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      Data da Ocorrência:
                    </span>
                    <span className="text-sm text-gray-900">
                      {format(new Date(rnc.dateOccurrence), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      Projeto:
                    </span>
                    <span className="text-sm text-gray-900">
                      {rnc.project?.name || 'Não informado'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      Ordem de Serviço:
                    </span>
                    <span className="text-sm text-gray-900">
                      {rnc.serviceOrder?.description || 'Não informado'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      Responsável pela RNC:
                    </span>
                    <span className="text-sm text-gray-900">
                      {rnc.responsibleRNC?.name || 'Não informado'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      Identificado por:
                    </span>
                    <span className="text-sm text-gray-900">
                      {rnc.responsibleIdentification?.name || 'Não informado'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      Data de Criação:
                    </span>
                    <span className="text-sm text-gray-900">
                      {format(new Date(rnc.createdAt), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      Última Atualização:
                    </span>
                    <span className="text-sm text-gray-900">
                      {format(new Date(rnc.updatedAt), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais do Contrato */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-[#003366] border-b border-[#E0E0E0] pb-2">
                  Informações do Contrato
                </h3>
                <div className="space-y-3">
                  {rnc.contractNumber && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        Número do Contrato:
                      </span>
                      <span className="text-sm text-gray-900">
                        {rnc.contractNumber}
                      </span>
                    </div>
                  )}

                  {rnc.contractDuration && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        Duração do Contrato (dias):
                      </span>
                      <span className="text-sm text-gray-900">
                        {rnc.contractDuration}
                      </span>
                    </div>
                  )}

                  {rnc.elapsedTime !== undefined && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        Tempo Decorrido (dias):
                      </span>
                      <span className="text-sm text-gray-900">
                        {rnc.elapsedTime}
                      </span>
                    </div>
                  )}

                  {rnc.remainingTime !== undefined && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        Tempo Restante (dias):
                      </span>
                      <span className="text-sm text-gray-900">
                        {rnc.remainingTime}
                      </span>
                    </div>
                  )}

                  {rnc.location && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        Localização:
                      </span>
                      <span className="text-sm text-gray-900">
                        {rnc.location}
                      </span>
                    </div>
                  )}

                  {rnc.clientName && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        Nome do Cliente:
                      </span>
                      <span className="text-sm text-gray-900">
                        {rnc.clientName}
                      </span>
                    </div>
                  )}

                  {rnc.workSchedule && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">
                        Horário de Trabalho:
                      </span>
                      <div className="pl-2 space-y-1">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">Entrada/Saída:</span>{' '}
                          {rnc.workSchedule.entryExit}
                        </div>
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">Intervalo:</span>{' '}
                          {rnc.workSchedule.interval}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-[#003366] border-b border-[#E0E0E0] pb-2">
                Descrição da Não Conformidade
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap text-gray-900">
                  {rnc.description}
                </p>
              </div>
            </div>

            {/* Ação Corretiva */}
            {rnc.correctiveAction && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-[#003366] border-b border-[#E0E0E0] pb-2">
                  Ação Corretiva
                </h3>
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Descrição da Ação:
                    </span>
                    <p className="text-sm whitespace-pre-wrap text-gray-900 mt-1">
                      {rnc.correctiveAction}
                    </p>
                  </div>

                  {rnc.responsibleAction && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Responsável pela Ação:
                      </span>
                      <p className="text-sm text-gray-900">
                        {rnc.responsibleAction.name}
                      </p>
                    </div>
                  )}

                  {rnc.dateConclusion && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Data de Conclusão:
                      </span>
                      <p className="text-sm text-gray-900">
                        {format(new Date(rnc.dateConclusion), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mão de Obra */}
            {rnc.workforce && rnc.workforce.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-[#003366] border-b border-[#E0E0E0] pb-2">
                  Mão de Obra Envolvida
                </h3>
                <div className="grid gap-4">
                  {rnc.workforce.map((worker) => (
                    <div key={worker.id} className="bg-blue-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Nome:
                          </span>
                          <p className="text-sm text-gray-900">{worker.name}</p>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Horas Trabalhadas:
                          </span>
                          <p className="text-sm text-gray-900">
                            {worker.hours}h
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Valor por Hora (R$):
                          </span>
                          <p className="text-sm text-gray-900">
                            {worker.valueHour.toString().replace('.', ',')}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            total (R$):
                          </span>
                          <p className="text-sm text-gray-900">
                            {worker.total.toString().replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materiais */}
            {rnc.materials && rnc.materials.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-[#003366] border-b border-[#E0E0E0] pb-2">
                  Materiais Utilizados
                </h3>

                <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
                  <ul className="divide-y divide-gray-200">
                    {rnc.materials.map((material) => (
                      <li
                        key={material.id}
                        className="py-2 flex flex-col md:flex-row md:justify-between md:items-center"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-[#FF7F0E] rounded-full" />
                          <span className="font-medium text-gray-800">
                            {material.material}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 md:mt-0 md:text-right">
                          {material.quantidade} {material.unidade} × R${' '}
                          {Number(material.preco).toFixed(2)} ={' '}
                          <strong>
                            R$ {Number(material.total).toFixed(2)}
                          </strong>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Imagens */}
            {rnc.images && rnc.images.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-[#003366] border-b border-[#E0E0E0] pb-2">
                  Registros Fotográficos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rnc.images.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={getImageUrl(image.url)}
                          alt={`Imagem da RNC ${index + 1}`}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        Imagem {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
