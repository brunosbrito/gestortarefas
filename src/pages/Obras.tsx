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
import { useToast } from "@/hooks/use-toast";
import { Obra } from "@/interfaces/ObrasInterface";
import ObrasService from "@/services/ObrasService";
import { Badge } from "@/components/ui/badge";
import { EditObraForm } from "@/components/obras/EditObraForm";
import { FinalizarObraForm } from "@/components/obras/FinalizarObraForm";

const formSchema = z.object({
  name: z.string().min(1, "Nome da obra é obrigatório"),
  groupNumber: z.string().min(1, "Número do grupo é obrigatório"),
  client: z.string().min(1, "Cliente é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  observation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Obras = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [finalizarDialogOpen, setFinalizarDialogOpen] = useState(false);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const { toast } = useToast();

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      groupNumber: "",
      client: "",
      address: "",
      startDate: "",
      observation: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const obraData: Obra = {
      name: data.name,
      groupNumber: data.groupNumber,
      client: data.client,
      address: data.address,
      startDate: data.startDate,
      observation: data.observation,
      status: "em_andamento",
    };
  
    try {
      await ObrasService.createObra(obraData);
      toast({
        title: "Obra cadastrada com sucesso!",
        description: `A obra ${data.name} foi cadastrada.`,
      });
      setOpen(false);
      form.reset();
      fetchObras();
    } catch (error) {
      toast({
        title: "Erro ao cadastrar obra",
        description: "Não foi possível cadastrar a obra. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (obra: Obra) => {
    setSelectedObra(obra);
    setEditDialogOpen(true);
  };

  const handleFinalizarClick = (obra: Obra) => {
    setSelectedObra(obra);
    setFinalizarDialogOpen(true);
  };

  const handleFinalizarSubmit = async (data: { endDate: string }) => {
    if (selectedObra?.id) {
      try {
        await ObrasService.updateObra(selectedObra.id, {
          ...selectedObra,
          endDate: data.endDate,
          status: "finalizado",
        });
        toast({
          title: "Obra finalizada",
          description: "A obra foi finalizada com sucesso.",
        });
        setFinalizarDialogOpen(false);
        fetchObras();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao finalizar obra",
          description: "Não foi possível finalizar a obra.",
        });
      }
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                <Button 
                  variant="ghost"
                  className="text-[#FF7F0E] hover:text-[#FF7F0E]/90"
                  onClick={() => handleEditClick(obra)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
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
      </div>
    </Layout>
  );
};

export default Obras;
