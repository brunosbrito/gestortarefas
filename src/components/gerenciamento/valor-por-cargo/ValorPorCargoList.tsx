import { useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, DollarSign } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { SortableTableHeader, useTableSort } from "@/components/tables/SortableTableHeader";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useDialogState } from "@/hooks/useDialogState";

interface ValorPorCargoListProps {
  onEdit: (valor: ValuePerPosition) => void;
}

export function ValorPorCargoList({ onEdit }: ValorPorCargoListProps) {
  // Fetch de valores com loading automático
  const { data: valores, isLoading, refetch } = useDataFetching({
    fetchFn: () => valuePerPositionService.getAll(),
    errorMessage: "Erro ao carregar valores por cargo",
  });

  // Diálogo de exclusão gerenciado com hook
  const deleteDialog = useDialogState<ValuePerPosition>();

  // Sorting
  const { sortedData, sortKey, sortDirection, handleSort } = useTableSort(valores || [], 'position', 'asc');

  // Handler de exclusão com useCallback
  const handleDelete = useCallback(async () => {
    if (!deleteDialog.data) return;

    try {
      await valuePerPositionService.remove(deleteDialog.data.id);
      toast({
        title: "Valor excluído",
        description: "O valor por cargo foi excluído com sucesso.",
      });
      refetch();
      deleteDialog.close();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o valor por cargo.",
        variant: "destructive",
      });
    }
  }, [deleteDialog, refetch]);

  return (
    <>
      <Card className="overflow-hidden border border-border/50 shadow-elevation-2">
        {/* Header modernizado */}
        <div className="p-4 md:p-6 border-b-2 border-border/50 bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Valor por Cargo</h3>
                <p className="text-xs text-muted-foreground">
                  Total de {(valores || []).length} {(valores || []).length === 1 ? 'valor' : 'valores'}
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30 ml-2 font-semibold tabular-nums"
              >
                {(valores || []).length}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabela */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-muted-foreground">Carregando...</span>
            </div>
          </div>
        ) : (valores || []).length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                  <TableHead className="w-20 text-center font-semibold text-foreground border-r border-border/30">Item</TableHead>
                  <SortableTableHeader
                    label="Cargo"
                    sortKey="position"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="border-r border-border/30"
                  />
                  <SortableTableHeader
                    label="Valor (R$)"
                    sortKey="value"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="border-r border-border/30"
                  />
                  <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((valor, index) => (
                  <TableRow
                    key={valor.id}
                    className={cn(
                      "transition-all duration-200 border-b",
                      index % 2 === 0 ? "bg-background" : "bg-muted/20",
                      "hover:bg-accent/50 hover:shadow-sm"
                    )}
                  >
                    <TableCell className="text-center font-mono text-sm font-bold py-4 border-r border-border/30">
                      {String(index + 1).padStart(3, '0')}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground py-4 border-r border-border/30">{valor.position}</TableCell>
                    <TableCell className="py-4 border-r border-border/30">
                      <span className="font-bold tabular-nums text-green-700 dark:text-green-300 text-base">
                        {formatCurrency(valor.value)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(valor)}
                          className="hover:bg-accent"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteDialog.open(valor)}
                          className="hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <div className="p-4 rounded-full bg-muted/50">
              <DollarSign className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                Nenhum valor por cargo cadastrado
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Não há valores cadastrados no sistema
              </p>
            </div>
          </div>
        )}
      </Card>

      <AlertDialog open={deleteDialog.isOpen} onOpenChange={deleteDialog.setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o valor para o cargo "{deleteDialog.data?.position}"?
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
    </>
  );
}
