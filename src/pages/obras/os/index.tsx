
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  Trash2,
  AlertTriangle,
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
  deleteServiceOrder,
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [osToDelete, setOsToDelete] = useState<ServiceOrder | null>(null);
  const [obra, setObra] = useState<Obra | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const getServiceOrders = async () => {
    const serviceOrders = await getServiceOrderByProjectId(projectId);

    serviceOrders.sort((a, b) => b.serviceOrderNumber - a.serviceOrderNumber);

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

  const handleRemoveOS = async (os: ServiceOrder) => {
    try {
      await deleteServiceOrder(os.id.toString());
      await getServiceOrders();
      toast({
        title: 'Ordem de Serviço removida',
        description: 'A OS foi removida com sucesso.',
      });
      setDeleteDialogOpen(false);
      setOsToDelete(null);
    } catch (error) {
      toast({
        title: 'Erro ao remover OS',
        description: 'Ocorreu um erro ao remover a ordem de serviço.',
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (os: ServiceOrder) => {
    setOsToDelete(os);
    setDeleteDialogOpen(true);
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
                <NovaOSForm
                  onSuccess={() => {
                    setDialogOpen(false);
                    getServiceOrders();
                    toast({
                      title: 'Ordem de Serviço criada',
                      description: 'A OS foi criada com sucesso.',
                    });
                  }}
                />
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
                  <span>Criado por: {os.assignedUser?.username || ''} </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span>
                    Quantidade: {os.progress || 0}/{os.quantity || 0} (
                    {os.quantity
                      ? Math.round((os.progress / os.quantity) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full hover:bg-[#FF7F0E]/10"
                  onClick={() =>
                    navigate(`/obras/${os.projectId.id}/os/${os.id}/atividades`)
                  }
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Atividades
                </Button>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-[#FF7F0E]/10"
                    onClick={() => {
                      setSelectedOS(os);
                      setVisualizarDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-[#FF7F0E]/10"
                    onClick={() => {
                      setSelectedOS(os);
                      setEditarDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => openDeleteDialog(os)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover a{' '}
                <strong>
                  OS-{osToDelete?.serviceOrderNumber.toString().padStart(3, '0')}
                </strong>
                ?
                <br />
                Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOsToDelete(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => osToDelete && handleRemoveOS(osToDelete)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Remover OS
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default OrdensServico;
