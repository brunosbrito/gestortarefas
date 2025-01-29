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
  ClipboardList,
  User,
  Check,
  MapPin,
  Edit,
  Pause,
  Factory,
  Mountain,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NovaObraForm } from '@/components/obras/NovaObraForm';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Obra } from '@/interfaces/ObrasInterface';
import ObrasService from '@/services/ObrasService';
import { EditObraForm } from '@/components/obras/EditObraForm';

interface ObrasProps {
  type?: 'Obra' | 'Fabrica' | 'Mineradora';
}

const Obras = ({ type = 'Obra' }: ObrasProps) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [open, setOpen] = useState(false);
  const [obraSelecionada, setObraSelecionada] = useState<Obra | null>(null);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getTitleByType = () => {
    switch (type) {
      case 'Fabrica':
        return 'Fabricas';
      case 'Mineradora':
        return 'Mineradoras';
      default:
        return 'Obras';
    }
  };

  const getIconByType = () => {
    switch (type) {
      case 'Fabrica':
        return Factory;
      case 'Mineradora':
        return Mountain;
      default:
        return Building2;
    }
  };

  const fetchObras = async () => {
    try {
      const obrasData = await ObrasService.getProjectsByType(type);
      setObras(obrasData || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar projetos',
        description: 'Não foi possível carregar a lista de projetos.',
      });
    }
  };

  useEffect(() => {
    fetchObras();
  }, [type]);

  const getStatusBadge = (status: Obra['status']) => {
    switch (status) {
      case 'em_andamento':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <Check className="w-3 h-3 mr-1" />
            Em Andamento
          </Badge>
        );
      case 'finalizado':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Check className="w-3 h-3 mr-1" />
            Finalizado
          </Badge>
        );
      case 'interrompido':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <Pause className="w-3 h-3 mr-1" />
            Interrompido
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleEditSuccess = () => {
    setDialogEditarAberto(false);
    fetchObras();
    toast({
      title: 'Obra atualizada',
      description: 'As informações da obra foram atualizadas com sucesso.',
    });
  };

  const Icon = getIconByType();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">
            {getTitleByType()}
          </h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
                <Plus className="w-4 h-4 mr-2" />
                {`Nova ${type}`}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{`Cadastrar Nova ${type}`}</DialogTitle>
              </DialogHeader>
              <NovaObraForm
                type={type}
                onSuccess={() => {
                  setOpen(false);
                  fetchObras();
                  toast({
                    title: 'Projeto criado',
                    description: 'O projeto foi criado com sucesso!',
                  });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obras.map((obra) => (
            <Card key={obra.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-[#FF7F0E]" />
                    <CardTitle className="text-xl">{obra.name}</CardTitle>
                  </div>
                  {getStatusBadge(obra.status)}
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{obra.client}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{obra.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    Início:{' '}
                    {new Date(`${obra.startDate}T00:00:00`).toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                </div>
                {obra.observation && (
                  <div className="flex items-center space-x-2 text-sm">
                    <ClipboardList className="w-4 h-4 text-gray-500" />
                    <span>{obra.observation}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  className="hover:bg-secondary/20"
                  onClick={() => navigate(`/obras/${obra.id}/os`)}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Ordens
                </Button>
                {obra.status !== 'finalizado' && (
                  <Button
                    variant="outline"
                    className="hover:bg-secondary/20"
                    onClick={() => {
                      setObraSelecionada(obra);
                      setDialogEditarAberto(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog open={dialogEditarAberto} onOpenChange={setDialogEditarAberto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar {type}</DialogTitle>
            </DialogHeader>
            {obraSelecionada && (
              <EditObraForm
                obra={obraSelecionada}
                onSuccess={handleEditSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Obras;
