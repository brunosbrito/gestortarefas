import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Send } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface Funcionario {
  id: number;
  nome: string;
  setor: "PRODUCAO" | "ADMINISTRATIVO";
  status: "PRESENTE" | "FALTA";
  turno: 1 | 2;
  obra?: string;
  motivoFalta?: string;
}

const funcionariosIniciais: Funcionario[] = [
  {
    id: 1,
    nome: "João Silva",
    setor: "PRODUCAO",
    status: "PRESENTE",
    turno: 1,
    obra: "Obra A"
  },
  {
    id: 2,
    nome: "Maria Santos",
    setor: "ADMINISTRATIVO",
    status: "PRESENTE",
    turno: 2
  }
];

const obras = ["Obra A", "Obra B", "Obra C"];
const colaboradores = ["João Silva", "Maria Santos", "Pedro Alves"];

const RegistroPonto = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(funcionariosIniciais);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm();
  const [tipoRegistro, setTipoRegistro] = useState<"PRODUCAO" | "ADMINISTRATIVO" | "FALTA">("PRODUCAO");

  const handleDelete = (id: number) => {
    setFuncionarios(prev => prev.filter(f => f.id !== id));
  };

  const handleEnviar = () => {
    console.log("Enviando dados do ponto:", funcionarios);
  };

  const renderFuncionariosPorTurno = (turno: 1 | 2) => {
    const funcionariosFiltrados = funcionarios.filter(f => f.turno === turno);

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-construction-800">{turno}º Turno</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Obra</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcionariosFiltrados.map((funcionario) => (
              <TableRow key={funcionario.id}>
                <TableCell className="font-medium">{funcionario.nome}</TableCell>
                <TableCell>
                  <Badge variant={funcionario.setor === "PRODUCAO" ? "default" : "secondary"}>
                    {funcionario.setor}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={funcionario.status === "PRESENTE" ? "default" : "destructive"}>
                    {funcionario.status}
                  </Badge>
                </TableCell>
                <TableCell>{funcionario.obra || "-"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(funcionario.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Registro de Ponto</h1>
          <div className="space-x-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Registro
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Novo Registro de Ponto</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="turno"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Turno</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o turno" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1º Turno</SelectItem>
                              <SelectItem value="2">2º Turno</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Registro</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              setTipoRegistro(value as typeof tipoRegistro);
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PRODUCAO">Produção</SelectItem>
                              <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                              <SelectItem value="FALTA">Falta</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="colaborador"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Colaborador</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o colaborador" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {colaboradores.map(col => (
                                <SelectItem key={col} value={col}>{col}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {tipoRegistro === "PRODUCAO" && (
                      <FormField
                        control={form.control}
                        name="obra"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Obra</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a obra" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {obras.map(obra => (
                                  <SelectItem key={obra} value={obra}>{obra}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}

                    {tipoRegistro === "ADMINISTRATIVO" && (
                      <FormField
                        control={form.control}
                        name="setor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Setor</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Digite o setor" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}

                    {tipoRegistro === "FALTA" && (
                      <FormField
                        control={form.control}
                        name="motivoFalta"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Motivo da Falta</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Digite o motivo da falta" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}

                    <Button type="submit" className="w-full">
                      Salvar Registro
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button onClick={handleEnviar} variant="secondary">
              <Send className="w-4 h-4 mr-2" />
              Enviar Registros
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {renderFuncionariosPorTurno(1)}
          {renderFuncionariosPorTurno(2)}
        </div>
      </div>
    </Layout>
  );
};

export default RegistroPonto;