import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, Check, X, FileText, BookmarkPlus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { ItemCatalogo } from '@/interfaces/CatalogoItensInterface';
import { formatCurrency } from '@/lib/currency';
import { normalizarDescricao } from '@/lib/textUtils';
import CatalogoItensService from '@/services/CatalogoItensService';

type SortField = 'descricao' | 'subcategoria' | 'quantidade' | 'valorUnitario' | 'subtotal' | null;
type SortDirection = 'asc' | 'desc' | null;

interface ItensGridInlineProps {
  composicaoId: string;
  composicaoNome: string;
  itens: ItemComposicao[];
  onAddItem: (item: Omit<ItemComposicao, 'id'>) => void;
  onUpdateItem: (itemId: string, data: Partial<ItemComposicao>) => void;
  onDeleteItem: (itemId: string) => void;
}

const SUBCATEGORIAS = [
  { value: 'abrasivos', label: 'Abrasivos' },
  { value: 'gases', label: 'Gases' },
  { value: 'marcador', label: 'Marcador' },
  { value: 'solda', label: 'Solda' },
];

const TIPOS_ITEM = [
  { value: 'material', label: 'Material' },
  { value: 'mao_obra', label: 'Mão de Obra' },
  { value: 'ferramenta', label: 'Ferramenta' },
  { value: 'consumivel', label: 'Consumível' },
  { value: 'outros', label: 'Outros' },
];

const UNIDADES = ['kg', 'h', 'un', 'm²', 'm', 't', 'l', 'CL'];

const CLASSE_ABC_COLORS = {
  A: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
  B: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  C: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
};

const ItensGridInline = ({
  composicaoId,
  composicaoNome,
  itens,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: ItensGridInlineProps) => {
  const [editingCell, setEditingCell] = useState<{
    itemId: string;
    field: string;
    value: string;
  } | null>(null);

  const [newItem, setNewItem] = useState<{
    descricao: string;
    tipoItem: string;
    subcategoria: string;
    quantidade: string;
    unidade: string;
    peso: string;
    valorUnitario: string;
  }>({
    descricao: '',
    tipoItem: 'consumivel',
    subcategoria: 'gases',
    quantidade: '',
    unidade: 'kg',
    peso: '',
    valorUnitario: '',
  });

  const [showNewItemRow, setShowNewItemRow] = useState(false);
  const [showCatalogoDialog, setShowCatalogoDialog] = useState(false);
  const [catalogoItens, setCatalogoItens] = useState<ItemCatalogo[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<string>('todos');
  const [busca, setBusca] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Carregar catálogo ao abrir dialog e limpar busca ao fechar
  useEffect(() => {
    if (showCatalogoDialog) {
      carregarCatalogo();
    } else {
      // Limpar busca ao fechar dialog
      setBusca('');
    }
  }, [showCatalogoDialog]);

  const carregarCatalogo = async () => {
    setLoadingCatalogo(true);
    try {
      const itens = await CatalogoItensService.getAll();
      setCatalogoItens(itens);
    } catch (error) {
      console.error('Erro ao carregar catálogo:', error);
    } finally {
      setLoadingCatalogo(false);
    }
  };

  const handleSelecionarDoCatalogo = (itemCatalogo: ItemCatalogo) => {
    // Preencher form com dados do catálogo
    setNewItem({
      descricao: itemCatalogo.descricao,
      tipoItem: 'consumivel',
      subcategoria: itemCatalogo.subcategoria,
      quantidade: '1', // Usuário vai ajustar
      unidade: itemCatalogo.unidade,
      peso: itemCatalogo.pesoUnitario?.toString() || '',
      valorUnitario: itemCatalogo.valorUnitario.toString(),
    });
    setShowCatalogoDialog(false);
    setShowNewItemRow(true);
  };

  const itensExibidos = catalogoItens
    .filter((item) => {
      // Filtro por subcategoria
      const passaSubcategoria = filtroSubcategoria === 'todos' || item.subcategoria === filtroSubcategoria;

      // Filtro por busca textual
      const passaBusca = busca.trim() === '' ||
        item.descricao.toLowerCase().includes(busca.toLowerCase());

      return passaSubcategoria && passaBusca;
    });

  // Função para alternar ordenação
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Ciclo: asc → desc → null
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

  // Renderizar ícone de ordenação
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3 ml-1 text-blue-600" />;
    }
    return <ArrowDown className="h-3 w-3 ml-1 text-blue-600" />;
  };

  // Itens ordenados
  const sortedItens = useMemo(() => {
    if (!sortField || !sortDirection) return itens;

    return [...itens].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'descricao':
          aValue = a.descricao.toLowerCase();
          bValue = b.descricao.toLowerCase();
          break;
        case 'subcategoria':
          aValue = ((a as any).subcategoria || '').toLowerCase();
          bValue = ((b as any).subcategoria || '').toLowerCase();
          break;
        case 'quantidade':
          aValue = a.quantidade;
          bValue = b.quantidade;
          break;
        case 'valorUnitario':
          aValue = a.valorUnitario;
          bValue = b.valorUnitario;
          break;
        case 'subtotal':
          aValue = calcularSubtotal(a);
          bValue = calcularSubtotal(b);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [itens, sortField, sortDirection]);

  const handleStartEdit = (itemId: string, field: string, currentValue: any) => {
    setEditingCell({
      itemId,
      field,
      value: currentValue?.toString() || '',
    });
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    const { itemId, field, value } = editingCell;

    let processedValue: any = value;

    // Converter para número se for campo numérico
    if (['quantidade', 'peso', 'valorUnitario'].includes(field)) {
      processedValue = parseFloat(value) || 0;
    }

    // Normalizar descrição (Title Case)
    if (field === 'descricao') {
      processedValue = normalizarDescricao(value);
    }

    onUpdateItem(itemId, { [field]: processedValue });
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleAddNewItem = () => {
    if (!newItem.descricao || !newItem.quantidade || !newItem.valorUnitario) {
      return;
    }

    const quantidade = parseFloat(newItem.quantidade) || 0;
    const valorUnitario = parseFloat(newItem.valorUnitario) || 0;
    const peso = parseFloat(newItem.peso) || 0;
    const subtotal = quantidade * valorUnitario;

    onAddItem({
      composicaoId,
      descricao: normalizarDescricao(newItem.descricao), // Aplicar normalização
      tipoItem: newItem.tipoItem as ItemComposicao['tipoItem'],
      quantidade,
      unidade: newItem.unidade,
      peso: peso || undefined,
      valorUnitario,
      subtotal,
      percentual: 0, // Será calculado pelo service
    });

    // Reset form
    setNewItem({
      descricao: '',
      tipoItem: 'consumivel',
      subcategoria: 'gases',
      quantidade: '',
      unidade: 'kg',
      peso: '',
      valorUnitario: '',
    });
    setShowNewItemRow(false);
  };

  const calcularSubtotal = (item: ItemComposicao) => {
    return item.quantidade * item.valorUnitario;
  };

  const calcularPesoTotal = (item: ItemComposicao) => {
    if (!item.peso) return 0;
    return item.quantidade * item.peso;
  };

  const totais = itens.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + calcularSubtotal(item),
      pesoTotal: acc.pesoTotal + calcularPesoTotal(item),
    }),
    { subtotal: 0, pesoTotal: 0 }
  );

  return (
    <div className="border rounded-lg overflow-hidden dark:border-slate-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-800 dark:to-transparent border-b dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg dark:text-slate-100">Itens de {composicaoNome}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{itens.length} {itens.length === 1 ? 'item' : 'itens'}</p>
              {sortField && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded dark:bg-blue-900 dark:text-blue-200">
                  Ordenado: {sortField === 'descricao' ? 'Descrição' :
                            sortField === 'subcategoria' ? 'Subcategoria' :
                            sortField === 'quantidade' ? 'Quantidade' :
                            sortField === 'valorUnitario' ? 'Valor Unit.' : 'Subtotal'}
                  ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCatalogoDialog(true)}
              className="gap-2"
            >
              <BookmarkPlus className="h-4 w-4" />
              Selecionar do Catálogo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNewItemRow(!showNewItemRow)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {showNewItemRow ? 'Cancelar' : 'Adicionar Item'}
            </Button>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[40px_200px_120px_100px_80px_80px_120px_120px_80px_100px] gap-px bg-slate-200 dark:bg-slate-700 border-b dark:border-slate-700 font-semibold text-sm">
        <div className="bg-white dark:bg-slate-800 p-3 text-center">#</div>

        <button
          onClick={() => handleSort('descricao')}
          className="bg-white dark:bg-slate-800 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center"
        >
          Descrição
          {renderSortIcon('descricao')}
        </button>

        <button
          onClick={() => handleSort('subcategoria')}
          className="bg-white dark:bg-slate-800 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center"
        >
          Subcategoria
          {renderSortIcon('subcategoria')}
        </button>

        <button
          onClick={() => handleSort('quantidade')}
          className="bg-white dark:bg-slate-800 p-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-end"
        >
          Quantidade
          {renderSortIcon('quantidade')}
        </button>

        <div className="bg-white dark:bg-slate-800 p-3">Unidade</div>
        <div className="bg-white dark:bg-slate-800 p-3 text-right">Peso Unit.</div>

        <button
          onClick={() => handleSort('valorUnitario')}
          className="bg-white dark:bg-slate-800 p-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-end"
        >
          Valor Unit.
          {renderSortIcon('valorUnitario')}
        </button>

        <button
          onClick={() => handleSort('subtotal')}
          className="bg-white dark:bg-slate-800 p-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-end"
        >
          Subtotal
          {renderSortIcon('subtotal')}
        </button>

        <div className="bg-white dark:bg-slate-800 p-3 text-center">ABC</div>
        <div className="bg-white dark:bg-slate-800 p-3 text-center">Ações</div>
      </div>

      {/* Body */}
      <div className="divide-y dark:divide-slate-700">
        {/* Nova linha de item */}
        {showNewItemRow && (
          <div className="grid grid-cols-[40px_200px_120px_100px_80px_80px_120px_120px_80px_100px] gap-px bg-slate-200 dark:bg-slate-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 flex items-center justify-center">
              <Plus className="h-4 w-4 text-blue-600" />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2">
              <Input
                value={newItem.descricao}
                onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
                placeholder="Descrição do item"
                className="h-8"
                autoFocus
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2">
              <Select value={newItem.subcategoria} onValueChange={(value) => setNewItem({ ...newItem, subcategoria: value })}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBCATEGORIAS.map((subcat) => (
                    <SelectItem key={subcat.value} value={subcat.value}>
                      {subcat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2">
              <Input
                type="number"
                value={newItem.quantidade}
                onChange={(e) => setNewItem({ ...newItem, quantidade: e.target.value })}
                placeholder="0"
                className="h-8 text-right"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2">
              <Select value={newItem.unidade} onValueChange={(value) => setNewItem({ ...newItem, unidade: value })}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES.map((unidade) => (
                    <SelectItem key={unidade} value={unidade}>
                      {unidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2">
              <Input
                type="number"
                value={newItem.peso}
                onChange={(e) => setNewItem({ ...newItem, peso: e.target.value })}
                placeholder="0"
                className="h-8 text-right"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2">
              <Input
                type="number"
                value={newItem.valorUnitario}
                onChange={(e) => setNewItem({ ...newItem, valorUnitario: e.target.value })}
                placeholder="R$ 0,00"
                className="h-8 text-right"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 flex items-center justify-end text-sm font-medium">
              {formatCurrency((parseFloat(newItem.quantidade) || 0) * (parseFloat(newItem.valorUnitario) || 0))}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2"></div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 flex items-center justify-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-green-100"
                onClick={handleAddNewItem}
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-red-100"
                onClick={() => setShowNewItemRow(false)}
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        )}

        {/* Items existentes */}
        {itens.length === 0 && !showNewItemRow ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum item adicionado ainda</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowNewItemRow(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Item
            </Button>
          </div>
        ) : (
          sortedItens.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[40px_200px_120px_100px_80px_80px_120px_120px_80px_100px] gap-px bg-slate-200 dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {/* # */}
              <div className="bg-white dark:bg-slate-800 p-3 flex items-center justify-center text-sm text-muted-foreground font-medium">
                {index + 1}
              </div>

              {/* Descrição */}
              <div className="bg-white dark:bg-slate-800 p-3">
                {editingCell?.itemId === item.id && editingCell.field === 'descricao' ? (
                  <Input
                    value={editingCell.value}
                    onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveEdit}
                    className="h-8"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => handleStartEdit(item.id, 'descricao', item.descricao)}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-1 rounded min-h-[2rem] flex items-center"
                  >
                    {item.descricao}
                  </div>
                )}
              </div>

              {/* Subcategoria */}
              <div className="bg-white dark:bg-slate-800 p-3 flex items-center">
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded dark:bg-blue-900 dark:text-blue-200">
                  {item.tipoItem === 'consumivel' && (item as any).subcategoria
                    ? SUBCATEGORIAS.find((s) => s.value === (item as any).subcategoria)?.label
                    : TIPOS_ITEM.find((t) => t.value === item.tipoItem)?.label || item.tipoItem}
                </span>
              </div>

              {/* Quantidade */}
              <div className="bg-white dark:bg-slate-800 p-3 text-right">
                {editingCell?.itemId === item.id && editingCell.field === 'quantidade' ? (
                  <Input
                    type="number"
                    value={editingCell.value}
                    onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveEdit}
                    className="h-8 text-right"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => handleStartEdit(item.id, 'quantidade', item.quantidade)}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-1 rounded min-h-[2rem] flex items-center justify-end"
                  >
                    {item.quantidade.toLocaleString('pt-BR')}
                  </div>
                )}
              </div>

              {/* Unidade */}
              <div className="bg-white dark:bg-slate-800 p-3 flex items-center">
                <span className="text-sm">{item.unidade}</span>
              </div>

              {/* Peso Unitário */}
              <div className="bg-white dark:bg-slate-800 p-3 text-right">
                {editingCell?.itemId === item.id && editingCell.field === 'peso' ? (
                  <Input
                    type="number"
                    value={editingCell.value}
                    onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveEdit}
                    className="h-8 text-right"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => handleStartEdit(item.id, 'peso', item.peso)}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-1 rounded min-h-[2rem] flex items-center justify-end text-sm"
                  >
                    {item.peso ? `${item.peso.toLocaleString('pt-BR')} kg` : '-'}
                  </div>
                )}
              </div>

              {/* Valor Unitário */}
              <div className="bg-white dark:bg-slate-800 p-3 text-right">
                {editingCell?.itemId === item.id && editingCell.field === 'valorUnitario' ? (
                  <Input
                    type="number"
                    value={editingCell.value}
                    onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveEdit}
                    className="h-8 text-right"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => handleStartEdit(item.id, 'valorUnitario', item.valorUnitario)}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-1 rounded min-h-[2rem] flex items-center justify-end font-medium"
                  >
                    {formatCurrency(item.valorUnitario)}
                  </div>
                )}
              </div>

              {/* Subtotal */}
              <div className="bg-white dark:bg-slate-800 p-3 flex items-center justify-end font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(calcularSubtotal(item))}
              </div>

              {/* Classe ABC */}
              <div className="bg-white dark:bg-slate-800 p-3 flex items-center justify-center">
                {item.classeABC && (
                  <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${CLASSE_ABC_COLORS[item.classeABC]}`}>
                    {item.classeABC}
                  </span>
                )}
              </div>

              {/* Ações */}
              <div className="bg-white dark:bg-slate-800 p-3 flex items-center justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteItem(item.id)}
                  className="h-7 w-7 p-0 hover:bg-red-100"
                  title="Deletar item"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer com totais */}
      {itens.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent border-t dark:border-slate-700 p-4">
          <div className="grid grid-cols-[40px_200px_120px_100px_80px_80px_120px_120px_80px_100px] gap-px font-bold">
            <div></div>
            <div className="col-span-5 flex items-center">TOTAIS</div>
            <div className="text-right">-</div>
            <div className="text-right text-lg text-blue-600 dark:text-blue-400">
              {formatCurrency(totais.subtotal)}
            </div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}

      {/* Dialog Catálogo */}
      <Dialog open={showCatalogoDialog} onOpenChange={setShowCatalogoDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Selecionar Item do Catálogo</DialogTitle>
            <DialogDescription>
              Escolha um item pré-cadastrado. Você poderá ajustar quantidade e preço depois.
            </DialogDescription>
          </DialogHeader>

          {/* Busca por Nome */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="🔍 Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filtro por Subcategoria */}
          <div className="flex gap-2 items-center border-b pb-4">
            <span className="text-sm font-medium">Filtrar por:</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filtroSubcategoria === 'todos' ? 'default' : 'outline'}
                onClick={() => setFiltroSubcategoria('todos')}
              >
                Todos ({catalogoItens.length})
              </Button>
              {SUBCATEGORIAS.map((subcat) => (
                <Button
                  key={subcat.value}
                  size="sm"
                  variant={filtroSubcategoria === subcat.value ? 'default' : 'outline'}
                  onClick={() => setFiltroSubcategoria(subcat.value)}
                >
                  {subcat.label} ({catalogoItens.filter((i) => i.subcategoria === subcat.value).length})
                </Button>
              ))}
            </div>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto">
            {loadingCatalogo ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Carregando catálogo...</p>
              </div>
            ) : itensExibidos.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Nenhum item encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {itensExibidos.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelecionarDoCatalogo(item)}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent hover:border-accent-foreground cursor-pointer transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.descricao}</div>
                      <div className="text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs dark:bg-blue-900 dark:text-blue-200">
                            {SUBCATEGORIAS.find((s) => s.value === item.subcategoria)?.label}
                          </span>
                          <span>{item.unidade}</span>
                          {item.pesoUnitario && <span>{item.pesoUnitario} kg/un</span>}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(item.valorUnitario)}</div>
                      <div className="text-xs text-muted-foreground">por {item.unidade}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItensGridInline;
