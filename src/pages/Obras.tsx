import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus, MapPin, Calendar, Users, ClipboardList, Check, X, Edit, Eye, Timer, Pause, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { Obra } from "@/interfaces/ObrasInterface";
import ObrasService from "@/services/ObrasService";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const formSchema = z.object({
  name: z.string().min(1, "Nome da obra é obrigatório"),
  groupNumber: z.string().min(1, "Número do grupo é obrigatório"),
  client: z.string().min(1, "Cliente é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().optional(),
  observation: z.string().optional(),
  id: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ObraDetalhada extends Obra {
  horasTrabalhadas?: number;
  atividades?: string[];
  historico?: string[];
}

const Obras = () => {
  const [obras, setObras] = useState<ObraDetalhada[]>([]);
  const [open, setOpen] = useState(false);
  const [obraSelecionada, setObraSelecionada] = useState<ObraDetalhada | null>(null);
  const [dialogDetalhesAberto, setDialogDetalhesAberto] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false);
  const { toast } = useToast();

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const finalizarForm = useForm({
    resolver: zodResolver(z.object({
      endDate: z.string().min(1, "Data de finalização é obrigatória"),
    })),
  });

  const fetchObras = async () => {
    try {
      const obrasData = await ObrasService.getAllObras();
      const obrasComDetalhes = obrasData?.map(obra => ({
        ...obra,
        horasTrabalhadas: Math.floor(Math.random() * 1000),
        atividades: [
          "Fundação iniciada",
          "Alvenaria em andamento",
          "Instalações elétricas"
        ],
        historico: [
          `${new Date(obra.startDate).toLocaleDateString('pt-BR')} - Início da obra`,
          "15/02/2024 - Fundação concluída",
          "01/03/2024 - Alvenaria iniciada"
        ]
      }));
      setObras(obrasComDetalhes || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar obras',
        description: 'Não foi possível carregar a lista de obras.',
      });
    }
  };

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

  useEffect(() => {
    fetchObras();
  }, []);

  const handleEdit = async (data: FormValues) => {
    try {
      if (obraSelecionada?.id) {
        await ObrasService.updateObra(obraSelecionada.id, {
          id: obraSelecionada.id,
          name: data.name,
          groupNumber: data.groupNumber,
          client: data.client,
          address: data.address,
          startDate: data.startDate,
          endDate: data.endDate,
          observation: data.observation,
          status: obraSelecionada.status,
        });
        toast({
          title: "Obra atualizada com sucesso!",
          description: `A obra ${data.name} foi atualizada.`,
        });
        setEditModalOpen(false);
        fetchObras();
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar obra",
        description: "Não foi possível atualizar a obra. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleFinalizar = async (data: { endDate: string }) => {
    try {
      if (obraSelecionada?.id) {
        await ObrasService.updateObra(obraSelecionada.id, {
          ...obraSelecionada,
          status: "finalizado" as const,
          endDate: data.endDate,
          // Garantindo que todos os campos obrigatórios estejam presentes
          name: obraSelecionada.name,
          groupNumber: obraSelecionada.groupNumber,
          client: obraSelecionada.client,
          address: obraSelecionada.address,
          startDate: obraSelecionada.startDate
        });
        toast({
          title: "Obra finalizada com sucesso!",
          description: `A obra ${obraSelecionada.name} foi finalizada.`,
        });
        setFinalizarModalOpen(false);
        fetchObras();
      }
    } catch (error) {
      toast({
        title: "Erro ao finalizar obra",
        description: "Não foi possível finalizar a obra. Tente novamente mais tarde.",
        variant: "destructive",
      });
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
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Obra</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome da obra" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="groupNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Grupo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o número do grupo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="client"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome do cliente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o endereço completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="observation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Digite observações adicionais sobre a obra"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
                    Cadastrar Obra
                  </Button>
                </form>
              </Form>
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
                <Dialog open={dialogDetalhesAberto && obraSelecionada?.id === obra.id} 
                       onOpenChange={(open) => {
                         setDialogDetalhesAberto(open);
                         if (!open) setObraSelecionada(null);
                       }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setObraSelecionada(obra)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Detalhes da Obra</DialogTitle>
                    </DialogHeader>
                    {obraSelecionada && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-semibold">{obraSelecionada.name}</h2>
                          {getStatusBadge(obraSelecionada.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold mb-2 flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Datas
                            </h3>
                            <p>Início: {new Date(obraSelecionada.startDate).toLocaleDateString('pt-BR')}</p>
                            {obraSelecionada.endDate && (
                              <p>Término: {new Date(obraSelecionada.endDate).toLocaleDateString('pt-BR')}</p>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2 flex items-center">
                              <Timer className="w-4 h-4 mr-2" />
                              Horas Trabalhadas
                            </h3>
                            <p>{obraSelecionada.horasTrabalhadas}h</p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Atividades Recentes</h3>
                          <ul className="space-y-2">
                            {obraSelecionada.atividades?.map((atividade, index) => (
                              <li key={index} className="flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-construction-500" />
                                {atividade}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Histórico</h3>
                          <ul className="space-y-2">
                            {obraSelecionada.historico?.map((evento, index) => (
                              <li key={index} className="flex items-center">
                                <ClipboardList className="w-4 h-4 mr-2 text-construction-500" />
                                {evento}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Dialog open={editModalOpen && obraSelecionada?.id === obra.id}
                       onOpenChange={(open) => {
                         setEditModalOpen(open);
                         if (!open) setObraSelecionada(null);
                         else {
                           editForm.reset(obra);
                         }
                       }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost"
                      className="text-[#FF7F0E] hover:text-[#FF7F0E]/90"
                      onClick={() => setObraSelecionada(obra)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Obra</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                        <FormField
                          control={editForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Obra</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite o nome da obra" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="groupNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número do Grupo</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite o número do grupo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="client"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cliente</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite o nome do cliente" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite o endereço completo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Início</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="observation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observações</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Digite observações adicionais sobre a obra"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
                          Salvar Alterações
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {obra.status === "em_andamento" && (
                  <AlertDialog open={finalizarModalOpen && obraSelecionada?.id === obra.id}
                             onOpenChange={(open) => {
                               setFinalizarModalOpen(open);
                               if (!open) setObraSelecionada(null);
                             }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => setObraSelecionada(obra)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Finalizar
                      </Button>
                    </DialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Finalizar Obra</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja finalizar esta obra? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Form {...finalizarForm}>
                        <form onSubmit={finalizarForm.handleSubmit(handleFinalizar)} className="space-y-4">
                          <FormField
                            control={finalizarForm.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data de Finalização</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction type="submit" className="bg-green-600 hover:bg-green-700">
                              Confirmar Finalização
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </form>
                      </Form>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Obras;