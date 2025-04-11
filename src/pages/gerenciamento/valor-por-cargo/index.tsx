
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ValorPorCargoForm } from "@/components/gerenciamento/valor-por-cargo/ValorPorCargoForm";
import { ValorPorCargoList } from "@/components/gerenciamento/valor-por-cargo/ValorPorCargoList";
import { ValuePerPosition } from "@/services/valuePerPositionService";

const ValorPorCargo = () => {
  const [valorParaEditar, setValorParaEditar] = useState<ValuePerPosition | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditClick = (valor: ValuePerPosition) => {
    setValorParaEditar(valor);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setValorParaEditar(null);
    setIsDialogOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Valor por Cargo</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Valor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {valorParaEditar ? "Editar Valor por Cargo" : "Adicionar Valor por Cargo"}
                </DialogTitle>
              </DialogHeader>
              <ValorPorCargoForm
                valorParaEditar={valorParaEditar}
                onSuccess={handleCloseDialog}
              />
            </DialogContent>
          </Dialog>
        </div>

        <ValorPorCargoList onEdit={handleEditClick} />
      </div>
    </Layout>
  );
};

export default ValorPorCargo;
