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
import { Draggable } from 'react-beautiful-dnd';
import { AtividadeHistoricoList } from './AtividadeHistoricoList';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface AtividadeCardProps {
  atividade: AtividadeStatus;
  index: number;
}

export const AtividadeCard = ({ atividade, index }: AtividadeCardProps) => {
  const { toast } = useToast();
  const { projectId, serviceOrderId } = useParams();

  const historicoExemplo = [
    {
      id: 1,
      status: 'Criada',
      description: 'Atividade criada',
      changedBy: {
        id: 1,
        username: 'Bruno',
        email: 'bruno@exemplo.com',
        password: '',
        isActive: true,
        role: 'admin'
      },
      timestamp: new Date('2024-01-16T10:00:00')
    },
    {
      id: 2,
      status: 'Em execução',
      description: 'Atividade iniciada',
      changedBy: {
        id: 1,
        username: 'Bruno',
        email: 'bruno@exemplo.com',
        password: '',
        isActive: true,
        role: 'admin'
      },
      timestamp: new Date('2024-01-17T14:30:00')
    }
  ];

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
                Data Criação: {format(new Date(atividade.startDate), 'dd/MM/yyyy')}
              </div>
              {atividade.status !== 'Planejadas' && (
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  {atividade.status === 'Em execução'
                    ? `Em execução (${format(new Date(atividade.startDate), 'dd/MM/yyyy')})`
                    : `Concluída (${format(new Date(atividade.startDate), 'dd/MM/yyyy')})`}
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
                          <p className="font-medium text-construction-600">Descrição</p>
                          <p className="text-construction-800">{atividade.description}</p>
                        </div>
                        <div>
                          <p className="font-medium text-construction-600">Status</p>
                          <p className="text-construction-800">{atividade.status}</p>
                        </div>
                        <div>
                          <p className="font-medium text-construction-600">Macro Tarefa</p>
                          <p className="text-construction-800">{atividade.macroTask}</p>
                        </div>
                        <div>
                          <p className="font-medium text-construction-600">Processo</p>
                          <p className="text-construction-800">{atividade.process}</p>
                        </div>
                        <div>
                          <p className="font-medium text-construction-600">Data de Início</p>
                          <p className="text-construction-800">
                            {format(new Date(atividade.startDate), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        {atividade.endDate && (
                          <div>
                            <p className="font-medium text-construction-600">Data de Conclusão</p>
                            <p className="text-construction-800">
                              {format(new Date(atividade.endDate), 'dd/MM/yyyy')}
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
                            <div key={collaborator.id} className="flex items-center space-x-2 bg-white p-3 rounded-md shadow-sm">
                              <User className="w-5 h-5 text-construction-600" />
                              <div>
                                <p className="font-medium text-construction-800">{collaborator.name}</p>
                                <p className="text-sm text-construction-600">{collaborator.cargo}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Seção de Histórico */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-construction-700">
                        Histórico de Alterações
                      </h3>
                      <div className="bg-construction-50 p-4 rounded-lg">
                        <AtividadeHistoricoList historico={historicoExemplo} />
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
