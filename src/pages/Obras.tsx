import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Building2, ClipboardList, Activity, User } from "lucide-react";
import { useEffect, useState } from "react";
import { NovaOSForm } from "@/components/obras/os/NovaOSForm";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Obra } from "@/interfaces/ObrasInterface";
import ObrasService from "@/services/ObrasService";

const Obras = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchObras = async () => {
    try {
      const obrasData = await ObrasService.getAllObras();
      setObras(obrasData || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar obras',
        description: 'Não foi possível carregar a lista de obras.',
      });
    }
  };

  useEffect(() => {
    fetchObras();
  }, []);

  const getStatusBadge = (status: Obra["status"]) => {
    switch (status) {
      case "em_andamento":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Em Andamento
          </Badge>
        );
      case "finalizado":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Check className="w-3 h-3 mr-1" />
            Finalizado
          </Badge>
        );
      case "interrompido":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Pause className="w-3 h-3 mr-1" />
            Interrompido
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Obras</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Obra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Obra</DialogTitle>
              </DialogHeader>
              <NovaOSForm onSubmit={handleNovaOS} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obras.map((obra) => (
            <Card key={obra.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-[#FF7F0E]" />
                    <CardTitle className="text-xl">{obra.name}</CardTitle>
                  </div>
                  {getStatusBadge(obra.status)}
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
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
                  <span>Início: {new Date(obra.startDate).toLocaleDateString('pt-BR')}</span>
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
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => handleViewClick(obra)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
                <Button 
                  variant="ghost"
                  className="text-[#FF7F0E] hover:text-[#FF7F0E]/90"
                  onClick={() => handleEditClick(obra)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="ghost"
                  className="text-[#FF7F0E] hover:text-[#FF7F0E]/90"
                  onClick={() => navigate(`/obras/os?obra=${obra.id}`)}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Ordens de Serviço
                </Button>
                {obra.status === "em_andamento" && (
                  <Button 
                    variant="ghost"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => handleFinalizarClick(obra)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Finalizar
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Obra</DialogTitle>
            </DialogHeader>
            {selectedObra && (
              <EditObraForm 
                obra={selectedObra} 
                onSuccess={() => {
                  setEditDialogOpen(false);
                  fetchObras();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={finalizarDialogOpen} onOpenChange={setFinalizarDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Finalizar Obra</DialogTitle>
            </DialogHeader>
            <FinalizarObraForm onSubmit={handleFinalizarSubmit} />
          </DialogContent>
        </Dialog>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Obra</DialogTitle>
            </DialogHeader>
            {selectedObra && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Nome da Obra</h3>
                  <p>{selectedObra.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Número do Grupo</h3>
                  <p>{selectedObra.groupNumber}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Cliente</h3>
                  <p>{selectedObra.client}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Endereço</h3>
                  <p>{selectedObra.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Data de Início</h3>
                  <p>{new Date(selectedObra.startDate).toLocaleDateString('pt-BR')}</p>
                </div>
                {selectedObra.endDate && (
                  <div>
                    <h3 className="font-semibold">Data de Finalização</h3>
                    <p>{new Date(selectedObra.endDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {selectedObra.observation && (
                  <div>
                    <h3 className="font-semibold">Observações</h3>
                    <p>{selectedObra.observation}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedObra.status)}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Obras;
