import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus, MapPin, Calendar, Users, ClipboardList } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  nome: z.string().min(1, "Nome da obra é obrigatório"),
  id_grupo: z.string().min(1, "Número do grupo é obrigatório"),
  cliente: z.string().min(1, "Cliente é obrigatório"),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  data_inicio: z.string().min(1, "Data de início é obrigatória"),
  obs: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Obra {
  id: number;
  nome: string;
  id_grupo: string;
  cliente: string;
  endereco: string;
  data_inicio: string;
  obs?: string;
  status: "EM_ANDAMENTO" | "CONCLUIDA" | "PAUSADA";
}

const obrasIniciais: Obra[] = [
  {
    id: 1,
    nome: "Residencial Vista Mar",
    id_grupo: "G001",
    cliente: "Construtora ABC",
    endereco: "Av. Beira Mar, 1000",
    data_inicio: "2024-01-15",
    status: "EM_ANDAMENTO",
    obs: "Projeto residencial de alto padrão"
  },
  {
    id: 2,
    nome: "Edifício Comercial Centro",
    id_grupo: "G002",
    cliente: "Incorporadora XYZ",
    endereco: "Rua Principal, 500",
    data_inicio: "2024-02-01",
    status: "PAUSADA",
    obs: "Centro empresarial com 15 andares"
  }
];

const Obras = () => {
  const [obras] = useState<Obra[]>(obrasIniciais);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      id_grupo: "",
      cliente: "",
      endereco: "",
      data_inicio: "",
      obs: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    toast({
      title: "Obra cadastrada com sucesso!",
      description: `A obra ${data.nome} foi cadastrada.`,
    });
    setOpen(false);
    form.reset();
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
                    name="nome"
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
                    name="id_grupo"
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
                    name="cliente"
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
                    name="endereco"
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
                    name="data_inicio"
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
                    name="obs"
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
                  <CardTitle className="text-xl">{obra.nome}</CardTitle>
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{obra.cliente}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{obra.endereco}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Início: {new Date(obra.data_inicio).toLocaleDateString('pt-BR')}</span>
                </div>
                {obra.obs && (
                  <div className="flex items-center space-x-2 text-sm">
                    <ClipboardList className="w-4 h-4 text-gray-500" />
                    <span>{obra.obs}</span>
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