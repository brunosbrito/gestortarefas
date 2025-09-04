import { Card, CardFooter } from '@/components/ui/card';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { useParams } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AtividadeHeader } from './card/AtividadeHeader';
import { AtividadeMetadata } from './card/AtividadeMetadata';
import { AtividadeActions } from './card/AtividadeActions';
import { AtividadeDetails } from './card/AtividadeDetails';
import { AtividadeUploadDialog } from './AtividadeUploadDialog';
import { MoverAtividadeDialog } from './MoverAtividadeDialog';
import { uploadActivityImage } from '@/services/ActivityImageService';
import { useToast } from '@/hooks/use-toast';
import { AtualizarProgressoDialog } from './AtualizarProgressoDialog';

interface AtividadeCardProps {
  atividade: AtividadeStatus;
  index: number;
  onMoveAtividade?: (atividadeId: number, novoStatus: string) => void;
  onDelete?: () => void;
}

export const AtividadeCard = ({
  atividade,
  index,
  onMoveAtividade,
  onDelete,
}: AtividadeCardProps) => {
  const { toast } = useToast();
  const { projectId, serviceOrderId } = useParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsUploadDialogOpen(true);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    const userId = localStorage.getItem('userId');
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('description', imageDescription);
      formData.append('createdById', userId);

      await uploadActivityImage(atividade.id, formData);

      toast({
        title: 'Upload realizado com sucesso',
        description: 'A imagem foi enviada e será processada em breve.',
      });

      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setImageDescription('');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description:
          'Ocorreu um erro ao fazer o upload da imagem. Tente novamente.',
      });
    }
  };

  const calculateElapsedTime = (totalTime: number, startDate?: string) => {
    if (!startDate) return totalTime / 3600;

    const startDateTime = new Date(startDate);
    const now = new Date();

    const elapsedSeconds = (now.getTime() - startDateTime.getTime()) / 1000;
    console.log('total', totalTime, elapsedSeconds, 'ms');

    const totalElapsedSeconds = totalTime * 3600 + elapsedSeconds;
    const hours = Math.floor(totalElapsedSeconds / 3600);
    const minutes = Math.floor((totalElapsedSeconds % 3600) / 60);
    return hours + minutes / 60;
  };

  const formatTime = (totalTime: number) => {
    if (isNaN(totalTime) || totalTime <= 0) return '00:00';

    const hours = Math.floor(totalTime);
    const minutes = Math.round((totalTime - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}`;
  };

  const formatEstimatedTime = (estimatedTime: string) => {
    if (!estimatedTime) return '00:00';
    const [hours, minutes] = estimatedTime.split(/[h|min]/).filter(Boolean);
    return `${hours.padStart(2, '0')}:${minutes?.padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    if (!atividade.quantity || !atividade.completedQuantity) return 0;
    const progress = (atividade.completedQuantity / atividade.quantity) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const calculatePercentage = (elapsedTime: number, estimatedTime: string) => {
    if (!estimatedTime) return 0;

    const [hours, minutes] = estimatedTime.split(/[h|min]/).filter(Boolean);
    const totalEstimatedSeconds =
      parseInt(hours) * 3600 + parseInt(minutes) * 60;

    const elapsedTimeInSeconds = elapsedTime * 3600;

    return Math.round((elapsedTimeInSeconds / totalEstimatedSeconds) * 100);
  };

  const elapsedTime =
    atividade.status === 'Em execução'
      ? calculateElapsedTime(atividade.totalTime, atividade.startDate)
      : atividade.totalTime;

  const handleProgressSuccess = () => {
    window.location.reload();
  };

  return (
    <Draggable draggableId={String(atividade.id)} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className="hover:shadow-lg dark:hover:shadow-2xl transition-all duration-200 border-l-4 border-l-primary">
            <AtividadeHeader
              sequencialNumber={atividade.cod_sequencial}
              description={atividade.description}
            />

            <AtividadeMetadata
              atividade={atividade}
              elapsedTime={elapsedTime}
              calculateProgress={calculateProgress}
              formatTime={formatTime}
              formatEstimatedTime={formatEstimatedTime}
              calculatePercentage={calculatePercentage}
            />

            <CardFooter className="p-4 pt-0 flex flex-col gap-3">
              <AtividadeActions
                atividade={atividade}
                projectId={projectId}
                serviceOrderId={serviceOrderId}
                isMobile={isMobile}
                onMoveClick={() => setIsMoveDialogOpen(true)}
                onEditSuccess={onDelete}
                onFileSelect={handleFileSelect}
                onDelete={onDelete}
              />
              <AtividadeDetails atividade={atividade} />
            </CardFooter>
          </Card>

          <AtividadeUploadDialog
            imageDescription={imageDescription}
            onDescriptionChange={setImageDescription}
            onCancel={() => {
              setIsUploadDialogOpen(false);
              setSelectedFile(null);
              setImageDescription('');
            }}
            onUpload={handleImageUpload}
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          />

          <MoverAtividadeDialog
            open={isMoveDialogOpen}
            onOpenChange={setIsMoveDialogOpen}
            onMove={(novoStatus) => {
              if (onMoveAtividade) {
                onMoveAtividade(atividade.id, novoStatus);
              }
            }}
          />

          {typeof atividade.quantity === 'number' && (
            <AtualizarProgressoDialog
              open={isProgressDialogOpen}
              onOpenChange={setIsProgressDialogOpen}
              atividade={{
                id: atividade.id,
                quantity: atividade.quantity,
                completedQuantity: atividade.completedQuantity || 0,
              }}
              onSuccess={handleProgressSuccess}
            />
          )}
        </div>
      )}
    </Draggable>
  );
};
