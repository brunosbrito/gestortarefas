import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SortableTableHeader, useTableSort } from '@/components/tables/SortableTableHeader';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtividadesOSTableRow } from './AtividadesOSTableRow';
import { Obra } from '@/interfaces/ObrasInterface';

interface AtividadesOSTableProps {
  atividades: AtividadeStatus[];
  onMoveAtividade: (atividadeId: number, novoStatus: string) => void;
  onDelete: () => void;
  obra: Obra | null;
}

export const AtividadesOSTable = ({
  atividades,
  onMoveAtividade,
  onDelete,
}: AtividadesOSTableProps) => {
  const { sortedData, sortKey, sortDirection, handleSort } = useTableSort(
    atividades,
    'cod_sequencial',
    'asc'
  );

  if (atividades.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        Nenhuma atividade encontrada nesta ordem de serviço.
      </div>
    );
  }

  return (
    <div className="rounded-md border w-full">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <SortableTableHeader
              label="#"
              sortKey="cod_sequencial"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
              align="center"
              className="w-[60px]"
            />
            <SortableTableHeader
              label="Descrição"
              sortKey="description"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
              className="min-w-[150px]"
            />
            <SortableTableHeader
              label="Status"
              sortKey="status"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
              align="center"
              className="w-[100px]"
            />
            <SortableTableHeader
              label="Tarefa Macro"
              sortKey="macroTask.name"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
              className="w-[100px]"
            />
            <SortableTableHeader
              label="Processo"
              sortKey="process.name"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
              className="w-[100px]"
            />
            <TableHead className="w-[120px]">Colaboradores</TableHead>
            <SortableTableHeader
              label="Início"
              sortKey="startDate"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
              align="center"
              className="w-[95px]"
            />
            <SortableTableHeader
              label="Fim"
              sortKey="endDate"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
              align="center"
              className="w-[95px]"
            />
            <SortableTableHeader
              label="T. Previsto"
              sortKey="estimatedTime"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
              align="center"
              className="w-[85px]"
            />
            <SortableTableHeader
              label="T. Decorrido"
              sortKey="totalTime"
              currentSortKey={sortKey}
              currentSortDirection={sortDirection}
              onSort={handleSort}
              align="center"
              className="w-[95px]"
            />
            <TableHead className="w-[100px]">Progresso</TableHead>
            <TableHead className="text-center w-[60px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((atividade) => (
            <AtividadesOSTableRow
              key={atividade.id}
              atividade={atividade}
              onMoveAtividade={onMoveAtividade}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
