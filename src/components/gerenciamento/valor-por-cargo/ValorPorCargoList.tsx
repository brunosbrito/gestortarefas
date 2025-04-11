
import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import valuePerPositionService, { ValuePerPosition } from "@/services/valuePerPositionService";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ValorPorCargoListProps {
  onEdit: (valor: ValuePerPosition) => void;
}

export function ValorPorCargoList({ onEdit }: ValorPorCargoListProps) {
  const [valores, setValores] = useState<ValuePerPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [valorParaExcluir, setValorParaExcluir] = useState<ValuePerPosition | null>(null);

  const carregarValores = async () => {
    setIsLoading(true);
    try {
      const data = await valuePerPositionService.getAll();
      setValores(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os valores por cargo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarValores();
  }, []);

  const handleDelete = async () => {
    if (!valorParaExcluir) return;
    
    try {
      await valuePerPositionService.remove(valorParaExcluir.id);
      toast({
        title: "Valor excluído",
        description: "O valor por cargo foi excluído com sucesso.",
      });
      carregarValores();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o valor por cargo.",
        variant: "destructive",
      });
    } finally {
      setValorParaExcluir(null);
    }
  };

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cargo</TableHead>
              <TableHead>Valor (R$)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : valores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Nenhum valor por cargo cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              valores.map((valor) => (
                <TableRow key={valor.id}>
                  <TableCell className="font-medium">{valor.position}</TableCell>
                  <TableCell>{formatCurrency(valor.value)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(valor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setValorParaExcluir(valor)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o valor para o cargo "{valor.position}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
