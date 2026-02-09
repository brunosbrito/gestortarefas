import { useState, useMemo, useEffect } from 'react';
// TODO: Re-enable drag-and-drop when grid layout compatibility is fixed
// import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, GripVertical, Check, X, FileText, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import { ComposicaoCustos } from '@/interfaces/OrcamentoInterface';
import { formatCurrency, formatPercentage } from '@/lib/currency';
import ItensGridInline from './ItensGridInline';
import ItemComposicaoService from '@/services/ItemComposicaoService';

interface ComposicoesGridInlineProps {
  composicoes: ComposicaoCustos[];
  totalVenda: number;
  onEditBDI: (composicaoId: string, novoBDI: number) => void;
  onEdit: (composicao: ComposicaoCustos) => void;
  onDelete: (composicaoId: string) => void;
  onReorder: (composicoes: ComposicaoCustos[]) => void;
}

type SortField = 'nome' | 'tipo' | 'bdi' | 'custoDirecto' | 'subtotal' | 'percentualDoTotal' | null;
type SortDirection = 'asc' | 'desc' | null;

const TIPOS_COMPOSICAO_LABEL: Record<string, string> = {
  mobilizacao: 'Mobilização',
  desmobilizacao: 'Desmobilização',
  mo_fabricacao: 'MO Fabricação',
  mo_montagem: 'MO Montagem',
  jato_pintura: 'Jato/Pintura',
  ferramentas: 'Ferramentas',
  consumiveis: 'Consumíveis',
  materiais: 'Materiais',
};

const ComposicoesGridInline = ({
  composicoes,
  totalVenda,
  onEditBDI,
  onEdit,
  onDelete,
  onReorder,
}: ComposicoesGridInlineProps) => {
  const [editingBDI, setEditingBDI] = useState<{ id: string; value: string } | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [expandedComposicaoId, setExpandedComposicaoId] = useState<string | null>(null);

  // Column widths (in pixels)
  const [columnWidths, setColumnWidths] = useState({
    drag: 30,
    index: 50,
    nome: 200,
    tipo: 150,
    bdi: 120,
    custoDirecto: 150,
    subtotal: 150,
    percentual: 100,
    acoes: 100,
  });

  const [resizing, setResizing] = useState<{ column: string; startX: number; startWidth: number } | null>(null);

  const handleResizeStart = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    setResizing({
      column,
      startX: e.clientX,
      startWidth: columnWidths[column as keyof typeof columnWidths],
    });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing) return;

    const diff = e.clientX - resizing.startX;
    const newWidth = Math.max(50, resizing.startWidth + diff); // Min 50px

    setColumnWidths(prev => ({
      ...prev,
      [resizing.column]: newWidth,
    }));
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  // Add/remove event listeners for resize
  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing]);

  const gridCols = `${columnWidths.drag}px ${columnWidths.index}px ${columnWidths.nome}px ${columnWidths.tipo}px ${columnWidths.bdi}px ${columnWidths.custoDirecto}px ${columnWidths.subtotal}px ${columnWidths.percentual}px ${columnWidths.acoes}px`;

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Apply sorting
  const sortedComposicoes = useMemo(() => {
    if (!sortField || !sortDirection) {
      return composicoes;
    }

    return [...composicoes].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'nome':
          aValue = a.nome.toLowerCase();
          bValue = b.nome.toLowerCase();
          break;
        case 'tipo':
          aValue = TIPOS_COMPOSICAO_LABEL[a.tipo] || a.tipo;
          bValue = TIPOS_COMPOSICAO_LABEL[b.tipo] || b.tipo;
          break;
        case 'bdi':
          aValue = a.bdi.percentual;
          bValue = b.bdi.percentual;
          break;
        case 'custoDirecto':
          aValue = a.custoDirecto;
          bValue = b.custoDirecto;
          break;
        case 'subtotal':
          aValue = a.subtotal;
          bValue = b.subtotal;
          break;
        case 'percentualDoTotal':
          aValue = a.percentualDoTotal;
          bValue = b.percentualDoTotal;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [composicoes, sortField, sortDirection]);

  // TODO: Re-enable when drag-and-drop is fixed
  // const handleDragEnd = (result: DropResult) => {
  //   if (sortField) return;
  //   if (!result.destination) return;
  //   const items = Array.from(composicoes);
  //   const [reorderedItem] = items.splice(result.source.index, 1);
  //   items.splice(result.destination.index, 0, reorderedItem);
  //   const reordered = items.map((item, index) => ({
  //     ...item,
  //     ordem: index + 1,
  //   }));
  //   onReorder(reordered);
  // };

  const startEditBDI = (composicao: ComposicaoCustos) => {
    setEditingBDI({
      id: composicao.id,
      value: composicao.bdi.percentual.toString(),
    });
  };

  const saveBDI = () => {
    if (!editingBDI) return;

    const novoBDI = parseFloat(editingBDI.value);
    if (isNaN(novoBDI) || novoBDI < 0) {
      cancelEditBDI();
      return;
    }

    // Usar o ID armazenado no estado editingBDI, não o parâmetro
    onEditBDI(editingBDI.id, novoBDI);
    setEditingBDI(null);
  };

  const cancelEditBDI = () => {
    setEditingBDI(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveBDI();
    } else if (e.key === 'Escape') {
      cancelEditBDI();
    }
  };

  // Calcular totais
  const totais = sortedComposicoes.reduce(
    (acc, comp) => ({
      custoDirecto: acc.custoDirecto + comp.custoDirecto,
      bdiValor: acc.bdiValor + comp.bdi.valor,
      subtotal: acc.subtotal + comp.subtotal,
    }),
    { custoDirecto: 0, bdiValor: 0, subtotal: 0 }
  );

  const clearSort = () => {
    setSortField(null);
    setSortDirection(null);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3 ml-1 text-blue-600" />;
    }
    return <ArrowDown className="h-3 w-3 ml-1 text-blue-600" />;
  };

  return (
    <div className="border rounded-lg overflow-hidden dark:border-slate-700">
      {/* Header with Sort Controls */}
      <div className="bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800 dark:to-transparent border-b dark:border-slate-700">
        {sortField && (
          <div className="flex items-center justify-end px-4 py-2 border-b dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSort}
              className="gap-2 text-xs"
            >
              <X className="h-3 w-3" />
              Limpar Ordenação
            </Button>
          </div>
        )}

        {/* Column Headers - Clicáveis para ordenar */}
        <div className="grid font-semibold text-sm text-slate-900 dark:text-slate-100" style={{ gridTemplateColumns: gridCols }}>
          <div className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30 relative"></div>
          <div className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30 relative">
            #
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'index')}
            />
          </div>
          <button
            onClick={() => handleSort('nome')}
            className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30 hover:bg-muted/50 transition-colors cursor-pointer relative"
          >
            Nome
            {getSortIcon('nome')}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
              onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'nome'); }}
            />
          </button>
          <button
            onClick={() => handleSort('tipo')}
            className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30 hover:bg-muted/50 transition-colors cursor-pointer relative"
          >
            Tipo
            {getSortIcon('tipo')}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
              onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'tipo'); }}
            />
          </button>
          <button
            onClick={() => handleSort('bdi')}
            className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30 hover:bg-muted/50 transition-colors cursor-pointer relative"
          >
            BDI (%)
            {getSortIcon('bdi')}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
              onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'bdi'); }}
            />
          </button>
          <button
            onClick={() => handleSort('custoDirecto')}
            className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30 hover:bg-muted/50 transition-colors cursor-pointer relative"
          >
            Custo Direto
            {getSortIcon('custoDirecto')}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
              onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'custoDirecto'); }}
            />
          </button>
          <button
            onClick={() => handleSort('subtotal')}
            className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30 hover:bg-muted/50 transition-colors cursor-pointer relative"
          >
            Subtotal
            {getSortIcon('subtotal')}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
              onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'subtotal'); }}
            />
          </button>
          <button
            onClick={() => handleSort('percentualDoTotal')}
            className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30 hover:bg-muted/50 transition-colors cursor-pointer relative"
          >
            % do Total
            {getSortIcon('percentualDoTotal')}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
              onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e, 'percentual'); }}
            />
          </button>
          <div className="flex items-center justify-center py-3 px-2">Ações</div>
        </div>
      </div>

      {/* Body */}
      {/* TODO: Drag-and-drop temporariamente desabilitado devido a bug com grid layout */}
      {/* Será reimplementado em versão futura - usar ordenação (A-Z) por enquanto */}
      <div>
        {composicoes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-b dark:border-slate-700">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p>Nenhuma composição adicionada ainda</p>
          </div>
        ) : (
          (sortField ? sortedComposicoes : composicoes).map((composicao, index) => (
            <div key={composicao.id}>
              <div
                className="grid border-b dark:border-slate-700 hover:bg-muted/50 transition-colors"
                style={{ gridTemplateColumns: gridCols }}
              >
              <div
                className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30 opacity-30"
                title="Reordenação manual desabilitada - use ordenação nas colunas"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
                        <div className="flex items-center justify-center py-3 px-2 text-sm text-muted-foreground font-medium border-r dark:border-slate-700/30">
                          {index + 1}
                        </div>
                        <div className="flex flex-col items-start justify-center py-3 px-2 border-r dark:border-slate-700/30">
                          <span className="font-medium">{composicao.nome}</span>
                          <span className="text-xs text-muted-foreground">
                            {composicao.itens.length} {composicao.itens.length === 1 ? 'item' : 'itens'}
                          </span>
                        </div>
                        <div className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded dark:bg-blue-900 dark:text-blue-200">
                            {TIPOS_COMPOSICAO_LABEL[composicao.tipo] || composicao.tipo}
                          </span>
                        </div>
                        <div className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30">
                          {editingBDI?.id === composicao.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingBDI.value}
                                onChange={(e) =>
                                  setEditingBDI({ id: editingBDI.id, value: e.target.value })
                                }
                                onKeyDown={handleKeyDown}
                                className="h-8 w-20 text-center"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-green-100"
                                onClick={saveBDI}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                onClick={cancelEditBDI}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditBDI(composicao)}
                              className="hover:bg-muted px-3 py-1 rounded transition-colors"
                            >
                              {formatPercentage(composicao.bdi.percentual)}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-center py-3 px-2 font-medium border-r dark:border-slate-700/30">
                          {formatCurrency(composicao.custoDirecto)}
                        </div>
                        <div className="flex items-center justify-center py-3 px-2 font-bold text-blue-600 dark:text-blue-400 border-r dark:border-slate-700/30">
                          {formatCurrency(composicao.subtotal)}
                        </div>
                        <div className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded dark:bg-slate-700 dark:text-slate-200">
                            {formatPercentage(composicao.percentualDoTotal)}
                          </span>
                        </div>
              <div className="flex items-center justify-center py-3 px-2 gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpandedComposicaoId(expandedComposicaoId === composicao.id ? null : composicao.id)}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                  title={expandedComposicaoId === composicao.id ? "Colapsar itens" : "Ver itens"}
                >
                  {expandedComposicaoId === composicao.id ? (
                    <ChevronUp className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-blue-600" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(composicao)}
                  className="h-8 w-8 p-0 hover:bg-green-100"
                  title="Editar nome/BDI"
                >
                  <Edit className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(composicao.id)}
                  className="h-8 w-8 p-0 hover:bg-red-100"
                  title="Deletar composição"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
              </div>

              {/* Grid de Itens Expandido */}
              {expandedComposicaoId === composicao.id && (
                <div className="px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                  <ItensGridInline
                    composicaoId={composicao.id}
                    composicaoNome={composicao.nome}
                    itens={composicao.itens}
                    onAddItem={async (itemData) => {
                      await ItemComposicaoService.create({
                        ...itemData,
                        composicaoId: composicao.id,
                      });
                      // Recarregar orçamento (será feito pelo componente pai)
                      window.location.reload(); // TODO: Melhorar isso
                    }}
                    onUpdateItem={async (itemId, data) => {
                      await ItemComposicaoService.update({ id: itemId, ...data });
                      window.location.reload(); // TODO: Melhorar isso
                    }}
                    onDeleteItem={async (itemId) => {
                      await ItemComposicaoService.delete(itemId);
                      window.location.reload(); // TODO: Melhorar isso
                    }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {composicoes.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent border-t dark:border-slate-700 font-bold">
          <div className="grid text-slate-900 dark:text-slate-100" style={{ gridTemplateColumns: gridCols }}>
            <div className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30"></div>
            <div className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30"></div>
            <div className="col-span-3 flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30">TOTAIS</div>
            <div className="flex items-center justify-center py-3 px-2 text-lg border-r dark:border-slate-700/30">
              {formatCurrency(totais.custoDirecto)}
            </div>
            <div className="flex items-center justify-center py-3 px-2 text-lg text-blue-600 dark:text-blue-400 border-r dark:border-slate-700/30">
              {formatCurrency(totais.subtotal)}
            </div>
            <div className="flex items-center justify-center py-3 px-2 border-r dark:border-slate-700/30">
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-600 dark:bg-blue-500 text-white rounded">
                100%
              </span>
            </div>
            <div className="flex items-center justify-center py-3 px-2"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComposicoesGridInline;
