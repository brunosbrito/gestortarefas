import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Building2,
  Calendar,
  ClipboardList,
  Clock,
  Clock1,
  Edit2,
  Eye,
  GripHorizontal,
  Hourglass,
  Upload,
  User,
  Users,
} from 'lucide-react';
import { NovaAtividadeForm } from './NovaAtividadeForm';
import { useToast } from '@/hooks/use-toast';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { useParams } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';
import { AtividadeHistoricoList } from './AtividadeHistoricoList';
import { differenceInSeconds, format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { uploadActivityImage } from '@/services/ActivityImageService';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AtividadeCardProps {
  atividade: AtividadeStatus;
  index: number;
}

export const AtividadeCard = ({ atividade, index }: AtividadeCardProps) => {
  const { toast } = useToast();
  const { projectId, serviceOrderId } = useParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  function formatTime(totalTime) {
    console.log(totalTime);
    if (isNaN(totalTime) || totalTime <= 0) return '00:00';

    const hours = Math.floor(totalTime); // Pega a parte inteira (horas)
    const minutes = Math.round((totalTime - hours) * 60); // Calcula os minutos
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}`;
  }

  const calculateElapsedTime = (totalTime, startDate) => {
    if (!startDate) return totalTime / 3600;

    const startDateTime = new Date(startDate);
    const now = new Date();

    // Garantir que o horário atual seja maior que o horário de início
    if (now < startDateTime) {
      console.error('Erro: A data de início é maior que o horário atual.');
      return 0;
    }

    // Calcular diferença em segundos e somar ao totalTime
    const elapsedSeconds =
      totalTime + (now.getTime() - startDateTime.getTime()) / 1000;

    const hours = Math.floor(elapsedSeconds / 3600); // Horas completas
    const minutes = Math.floor((elapsedSeconds % 3600) / 60); // Minutos restantes

    // Total de horas no formato decimal
    const result = hours + minutes / 60;
    return result;
  };

  const formatEstimatedTime = (estimatedTime: string) => {
    if (!estimatedTime) return '00:00';
    const [hours, minutes] = estimatedTime.split(/[h|min]/).filter(Boolean);
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const calculatePercentage = (elapsedTime, estimatedTime: string) => {
    if (!estimatedTime) return 0;

    const [hours, minutes] = estimatedTime.split(/[h|min]/).filter(Boolean);
    const totalEstimatedSeconds =
      parseInt(hours) * 3600 + parseInt(minutes) * 60;

    elapsedTime += elapsedTime * 3600;

    return Math.round((elapsedTime / totalEstimatedSeconds) * 100);
  };

  const elapsedTime =
    atividade.status === 'Em execução'
      ? calculateElapsedTime(atividade.totalTime, atividade.startDate)
      : atividade.totalTime;

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

  return (
    <Draggable draggableId={String(atividade.id)} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {atividade.description}
                </CardTitle>
                <GripHorizontal className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-gray-500">
              <div className="flex items-center mb-2">
                <Building2 className="w-4 h-4 mr-2" />
                {atividade.project?.name}
              </div>
              <div className="flex items-center mb-2">
                <ClipboardList className="w-4 h-4 mr-2" />
                OS Nº: {atividade.serviceOrder.serviceOrderNumber}
              </div>
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Data Criação:{' '}
                {format(new Date(atividade.originalStartDate), 'dd/MM/yyyy')}
              </div>
              {atividade.status !== 'Planejadas' && (
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  {(() => {
                    switch (atividade.status) {
                      case 'Em execução':
                        return `Em execução (${format(
                          new Date(atividade.startDate),
                          'dd/MM/yyyy'
                        )})`;

                      case 'Paralizadas':
                        return `Data Paralisação: ${format(
                          new Date(atividade.pauseDate),
                          'dd/MM/yyyy'
                        )}`;

                      default:
                        return `Data Conclusão: ${format(
                          new Date(atividade.endDate),
                          'dd/MM/yyyy'
                        )}`;
                    }
                  })()}
                </div>
              )}

              <div className="flex items-center mb-2">
                <Clock1 className="w-4 h-4 mr-2" />
                Tempo Previsto: {formatEstimatedTime(atividade?.estimatedTime)}
              </div>

              {atividade.status === 'Planejadas' ? null : (
                <div className="flex items-center mb-2">
                  <Hourglass className="w-4 h-4 mr-2" />
                  Tempo Atividade: {formatTime(elapsedTime)}
                  {' | '}
                  <span
                    style={{
                      marginLeft: '5px',
                      color:
                        calculatePercentage(
                          elapsedTime,
                          atividade?.estimatedTime
                        ) > 100
                          ? 'red'
                          : 'green',
                    }}
                  >
                    {calculatePercentage(elapsedTime, atividade?.estimatedTime)}
                    %
                  </span>
                </div>
              )}

              <div className="flex items-center mb-2">
                <Users className="w-4 h-4 mr-2" />
                Equipe:{' '}
                {atividade.collaborators
                  ?.map((collaborator) => collaborator.name)
                  .join(', ')}
              </div>
              <div className="flex items-center mb-2">
                <User className="w-4 h-4 mr-2" /> Criado por:{' '}
                {atividade.createdBy?.username}
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
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-construction-800">
                      Detalhes da Atividade
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* Seção de Informações Básicas */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-construction-700">
                        Informações Gerais
                      </h3>
                      <div className="grid grid-cols-2 gap-4 bg-construction-50 p-4 rounded-lg">
                        <div>
                          <p className="font-medium text-construction-600">
                            Descrição
                          </p>
                          <p className="text-construction-800">
                            {atividade.description}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-construction-600">
                            Status
                          </p>
                          <p className="text-construction-800">
                            {atividade.status}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-construction-600">
                            Macro Tarefa
                          </p>
                          <p className="text-construction-800">
                            {atividade.macroTask}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-construction-600">
                            Processo
                          </p>
                          <p className="text-construction-800">
                            {atividade.process}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-construction-600">
                            Data de Início
                          </p>
                          <p className="text-construction-800">
                            {format(
                              new Date(atividade.originalStartDate),
                              'dd/MM/yyyy hh:mm'
                            )}
                          </p>
                        </div>
                        {atividade.endDate && (
                          <div>
                            <p className="font-medium text-construction-600">
                              Data de Conclusão
                            </p>
                            <p className="text-construction-800">
                              {format(
                                new Date(atividade.endDate),
                                'dd/MM/yyyy hh:mm'
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Seção da Equipe */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-construction-700">
                        Equipe Responsável
                      </h3>
                      <div className="bg-construction-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          {atividade.collaborators?.map((collaborator) => (
                            <div
                              key={collaborator.id}
                              className="flex items-center space-x-2 bg-white p-3 rounded-md shadow-sm"
                            >
                              <User className="w-5 h-5 text-construction-600" />
                              <div>
                                <p className="font-medium text-construction-800">
                                  {collaborator.name}
                                </p>
                                <p className="text-sm text-construction-600">
                                  {collaborator.role}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-construction-700">
                        Histórico de Alterações
                      </h3>
                      <div className="bg-construction-50 p-4 rounded-lg">
                        <AtividadeHistoricoList
                          activityId={Number(atividade.id)}
                        />
                      </div>
                    </div>
                  </div>
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
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                    id={`upload-image-${atividade.id}`}
                  />
                  <label htmlFor={`upload-image-${atividade.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4" />
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Descrição da Imagem</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="imageDescription">
                    Adicione uma descrição para a imagem
                  </Label>
                  <Input
                    id="imageDescription"
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    placeholder="Digite a descrição da imagem"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setSelectedFile(null);
                    setImageDescription('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
                  onClick={handleImageUpload}
                >
                  Enviar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Draggable>
  );
};
