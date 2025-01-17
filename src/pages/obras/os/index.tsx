import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Calendar,
  Building2,
  Activity,
  User,
  Eye,
  Edit,
  Hash,
  FileText,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NovaOSForm } from '@/components/obras/os/NovaOSForm';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ServiceOrder,
  CreateServiceOrder,
} from '@/interfaces/ServiceOrderInterface';
import {
  getAllServiceOrders,
  getServiceOrderByProjectId,
} from '@/services/ServiceOrderService';
import { VisualizarOSDialog } from '@/components/obras/os/VisualizarOSDialog';
import { EditarOSDialog } from '@/components/obras/os/EditarOSDialog';
import ObrasService from '@/services/ObrasService';
import { Obra } from '@/interfaces/ObrasInterface';

const OrdensServico = () => {
  const [ordensServico, setOrdensServico] = useState<ServiceOrder[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [visualizarDialogOpen, setVisualizarDialogOpen] = useState(false);
  const [editarDialogOpen, setEditarDialogOpen] = useState(false);
  const [obra, setObra] = useState<Obra | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleNovaOS = async (data: CreateServiceOrder) => {
    try {
      const serviceOrders = await getAllServiceOrders();
      setOrdensServico(serviceOrders || []);
      setDialogOpen(false);

      toast({
        title: 'Ordem de Serviço criada',
        description: 'A OS foi criada com sucesso!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar Ordem de Serviço',
        description: 'Não foi possível criar a ordem de serviço.',
      });
    }
  };

  const getServiceOrders = async () => {
    const serviceOrders = await getServiceOrderByProjectId(projectId);
    setObra(serviceOrders.projectId);
    setOrdensServico(serviceOrders || []);
  };

  useEffect(() => {
    getServiceOrders();
  }, [projectId]);

  const getStatusBadge = (status: ServiceOrder['status']) => {
    const statusConfig = {
      em_andamento: { label: 'Em Andamento', variant: 'default' as const },
      concluida: { label: 'Concluída', variant: 'secondary' as const },
      pausada: { label: 'Pausada', variant: 'outline' as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">
            Ordens de Serviço
          </h1>
          {obra?.status != 'finalizado' && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova OS
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Ordem de Serviço</DialogTitle>
                </DialogHeader>
                <NovaOSForm onSuccess={() => {
                  setDialogOpen(false);
                  getServiceOrders();
                  toast({
                    title: 'Ordem de Serviço criada',
                    description: 'A OS foi criada com sucesso.',
                  });
                }} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordensServico.map((os) => (
            <Card key={os.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    OS-{os.serviceOrderNumber.toString().padStart(3, '0')}
                  </CardTitle>
                  {getStatusBadge(os.status)}
                </div>
                <CardDescription>{os.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span>{os.projectId.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>Nº Projeto: {os.projectNumber}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    Início: {new Date(os.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Usuário: {os.assignedUser?.username || ''} </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span>
                    Quantidade: {os.progress || 0}/{os.quantity || 0}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-[#FF7F0E]/10"
                  onClick={() =>
                    navigate(`/obras/${os.projectId.id}/os/${os.id}/atividades`)
                  }
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Atividades
                </Button>
                <Button
                  variant="outline"
                  className="hover:bg-[#FF7F0E]/10"
                  onClick={() => {
                    setSelectedOS(os);
                    setVisualizarDialogOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hover:bg-[#FF7F0E]/10"
                  onClick={() => {
                    setSelectedOS(os);
                    setEditarDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <VisualizarOSDialog
          os={selectedOS}
          open={visualizarDialogOpen}
          onOpenChange={setVisualizarDialogOpen}
          onUpdateProgress={getServiceOrders}
        />

        <EditarOSDialog
          os={selectedOS}
          open={editarDialogOpen}
          onOpenChange={setEditarDialogOpen}
          onSuccess={getServiceOrders}
        />
      </div>
    </Layout>
  );
};

export default OrdensServico;