import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus, MapPin, Calendar, Users, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { Obra } from "@/interfaces/ObrasInterface";
import ObrasService from "@/services/ObrasService";

const formSchema = z.object({
  name: z.string().min(1, "Nome da obra é obrigatório"), // O nome é obrigatório
  groupNumber: z.string().min(1, "Número do grupo é obrigatório"), // Número do grupo é obrigatório
  client: z.string().min(1, "Cliente é obrigatório"), // Cliente é obrigatório
  address: z.string().min(1, "Endereço é obrigatório"), // Endereço é obrigatório
  startDate: z.string().min(1, "Data de início é obrigatória"), // A data de início é obrigatória
  endDate: z.string().optional(), // O campo 'endDate' é opcional
  observation: z.string().optional(), // O campo 'observation' é opcional
  id: z.number().optional(), // O campo 'id' também é opcional
});

type FormValues = z.infer<typeof formSchema>;

const Obras = () => {
  const [obras, setObras] = useState<Obra[]>([]); // Inicializa com uma lista vazia
  const [open, setOpen] = useState(false); // Controle de modal ou visualização
  const { toast } = useToast();

  const fetchObras = async () => {
    try {
      const obrasData = await ObrasService.getAllObras();
      setObras(obrasData || []);  // Atualiza o estado com os dados recebidos
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
      endDate: "",
      observation: "",
      id: 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Aqui, 'data' já será validado pelo zod com base no seu esquema
  
    // Mapeando o objeto data para o tipo Obra
    const obraData: Obra = {
      name: data.name,
      groupNumber: data.groupNumber,
      client: data.client,
      address: data.address,
      startDate: data.startDate,
      observation: data.observation,
      status : 'Em andamento',
    };
  
    // Aqui você pode passar obraData para seu serviço de cadastro
    try {
      await ObrasService.createObra(obraData);
      toast({
        title: "Obra cadastrada com sucesso!",
        description: `A obra ${data.name} foi cadastrada.`,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Erro ao cadastrar obra",
        description: "Não foi possível cadastrar a obra. Tente novamente mais tarde.",
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
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-[#FF7F0E]" />
                  <CardTitle className="text-xl">{obra.name}</CardTitle>
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
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-[#FF7F0E]/10"
                  onClick={() => {
                    // Implementar navegação para detalhes da obra
                    console.log(`Ver detalhes da obra ${obra.id}`);
                  }}
                >
                  Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Obras;