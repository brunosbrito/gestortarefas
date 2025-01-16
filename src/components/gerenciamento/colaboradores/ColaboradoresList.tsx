import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Colaborador } from "@/interfaces/ColaboradorInterface";
import { EditColaboradorForm } from "./EditColaboradorForm";
import { ColaboradorCard } from "./ColaboradorCard";
import { ColaboradorDetalhes } from "./ColaboradorDetalhes";

export const ColaboradoresList = () => {
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [dialogVisualizarAberto, setDialogVisualizarAberto] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);

  // Mock data - substituir por chamada à API
  const colaboradores: Colaborador[] = [
    {
      id: 1,
      name: "João Silva",
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
        <ColaboradorCard
          key={colaborador.id}
          colaborador={colaborador}
          onEdit={(colaborador) => {
            setColaboradorSelecionado(colaborador);
            setDialogEditarAberto(true);
          }}
          onView={(colaborador) => {
            setColaboradorSelecionado(colaborador);
            setDialogVisualizarAberto(true);
          }}
        />
      ))}

      <Dialog open={dialogVisualizarAberto} onOpenChange={setDialogVisualizarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Colaborador</DialogTitle>
          </DialogHeader>
          {colaboradorSelecionado && <ColaboradorDetalhes colaborador={colaboradorSelecionado} />}
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