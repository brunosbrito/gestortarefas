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
} from '@/components/ui/dialog';
import {
  Building2,
  Calendar,
  ClipboardList,
  Clock,
  Edit2,
  Eye,
  GripHorizontal,
  Upload,
  User,
  Users,
} from 'lucide-react';
import { NovaAtividadeForm } from './NovaAtividadeForm';
import { useToast } from '@/hooks/use-toast';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { useParams } from 'react-router-dom';

interface AtividadeCardProps {
  atividade: AtividadeStatus;
  index: number;
}

export const AtividadeCard = ({ atividade, index }: AtividadeCardProps) => {
  const { toast } = useToast();
  const { projectId, serviceOrderId } = useParams();

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
          {atividade.project?.name} {/* Nome da obra */}
        </div>
        <div className="flex items-center mb-2">
          <ClipboardList className="w-4 h-4 mr-2" />
          OS Nº: {atividade.serviceOrder.serviceOrderNumber}{' '}
          {/* Número da OS */}
        </div>
        <div className="flex items-center mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          Data Criação:{' '}
          {new Date(atividade.startDate).toLocaleDateString('pt-BR')}
        </div>
        {atividade.status !== 'Planejadas' && (
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 mr-2" />
            {atividade.status === 'Em Execução'
              ? `Em execução (${new Date(
                  atividade.startDate
                ).toLocaleDateString('pt-BR')})`
              : `Concluída (${new Date(atividade.startDate).toLocaleDateString(
                  'pt-BR'
                )})`}
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
          {atividade.createdBy?.username} {/* Nome do responsável */}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Atividade</DialogTitle>
            </DialogHeader>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast({
                title: 'Upload de imagem',
                description: 'Funcionalidade será implementada em breve',
              });
            }}
          >
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
          </Card>
        </div>
      )}
    </Draggable>
  );
};
