import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Eye } from "lucide-react";
import { Colaborador } from "@/interfaces/ColaboradorInterface";
import { EditColaboradorForm } from "./EditColaboradorForm";

export const ColaboradoresList = () => {
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [dialogVisualizarAberto, setDialogVisualizarAberto] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);

  // Mock data - substituir por chamada à API
  const colaboradores: Colaborador[] = [
    {
      id: 1,
      nome: "João Silva",
      cargo: "Engenheiro Civil",
      email: "joao@exemplo.com",
      telefone: "(11) 99999-9999",
      dataAdmissao: "2024-01-01",
      status: "ativo",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {colaboradores.map((colaborador) => (
        <Card key={colaborador.id}>
          <CardHeader>
            <CardTitle>{colaborador.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">{colaborador.cargo}</p>
            <p className="text-sm text-gray-500">{colaborador.email}</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              className="hover:bg-secondary/20"
              onClick={() => {
                setColaboradorSelecionado(colaborador);
                setDialogVisualizarAberto(true);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
            <Button
              variant="outline"
              className="hover:bg-secondary/20"
              onClick={() => {
                setColaboradorSelecionado(colaborador);
                setDialogEditarAberto(true);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </CardFooter>
        </Card>
      ))}

      <Dialog open={dialogVisualizarAberto} onOpenChange={setDialogVisualizarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Colaborador</DialogTitle>
          </DialogHeader>
          {colaboradorSelecionado && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Nome</h4>
                <p>{colaboradorSelecionado.nome}</p>
              </div>
              <div>
                <h4 className="font-semibold">Cargo</h4>
                <p>{colaboradorSelecionado.cargo}</p>
              </div>
              <div>
                <h4 className="font-semibold">Email</h4>
                <p>{colaboradorSelecionado.email}</p>
              </div>
              <div>
                <h4 className="font-semibold">Telefone</h4>
                <p>{colaboradorSelecionado.telefone}</p>
              </div>
              <div>
                <h4 className="font-semibold">Data de Admissão</h4>
                <p>{new Date(colaboradorSelecionado.dataAdmissao).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <h4 className="font-semibold">Status</h4>
                <p>{colaboradorSelecionado.status === 'ativo' ? 'Ativo' : 'Inativo'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogEditarAberto} onOpenChange={setDialogEditarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
          </DialogHeader>
          {colaboradorSelecionado && (
            <EditColaboradorForm
              colaborador={colaboradorSelecionado}
              onSuccess={() => setDialogEditarAberto(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};