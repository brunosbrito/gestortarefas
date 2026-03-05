import { useState, useMemo } from 'react';
import { Search, Package } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/currency';

export interface CatalogoItemGenerico {
  id: string | number;
  codigo: string;
  descricao: string;
  unidade: string;
  valorUnitario: number;
  categoria?: string;
  material?: string;
  peso?: number;
}

interface SelecionarCatalogoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CatalogoItemGenerico[];
  onSelecionar: (items: CatalogoItemGenerico[]) => void;
  titulo?: string;
  categorias?: string[];
  carregando?: boolean;
}

export default function SelecionarCatalogoDialog({
  open,
  onOpenChange,
  items,
  onSelecionar,
  titulo = 'Catálogo',
  categorias,
  carregando = false,
}: SelecionarCatalogoDialogProps) {
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('_todas');
  const [selecionados, setSelecionados] = useState<Set<string | number>>(new Set());

  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filtrados = useMemo(() => {
    let result = items;
    if (categoriaFiltro !== '_todas') {
      result = result.filter((i) => i.categoria === categoriaFiltro);
    }
    if (busca.trim()) {
      const term = normalize(busca);
      result = result.filter(
        (i) => normalize(i.codigo).includes(term) || normalize(i.descricao).includes(term)
      );
    }
    return result;
  }, [items, busca, categoriaFiltro]);

  const toggleItem = (id: string | number) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    if (filtrados.every((i) => selecionados.has(i.id))) {
      setSelecionados((prev) => {
        const next = new Set(prev);
        filtrados.forEach((i) => next.delete(i.id));
        return next;
      });
    } else {
      setSelecionados((prev) => {
        const next = new Set(prev);
        filtrados.forEach((i) => next.add(i.id));
        return next;
      });
    }
  };

  const handleConfirmar = () => {
    const itensSelecionados = items.filter((i) => selecionados.has(i.id));
    onSelecionar(itensSelecionados);
    setSelecionados(new Set());
    setBusca('');
    setCategoriaFiltro('_todas');
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelecionados(new Set());
      setBusca('');
      setCategoriaFiltro('_todas');
    }
    onOpenChange(open);
  };

  const todosVisivelSelecionados = filtrados.length > 0 && filtrados.every((i) => selecionados.has(i.id));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {titulo}
          </DialogTitle>
        </DialogHeader>

        {/* Filtros */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código ou descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          {categorias && categorias.length > 0 && (
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_todas">Todas as categorias</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filtrados.length} item(s) encontrado(s)</span>
          <span className="font-medium text-foreground">
            {selecionados.size} selecionado(s)
          </span>
        </div>

        {/* Tabela */}
        {carregando ? (
          <div className="text-center py-12 text-muted-foreground">Carregando catálogo...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {items.length === 0
              ? 'Catálogo vazio. Cadastre itens primeiro.'
              : 'Nenhum item encontrado para os filtros aplicados.'}
          </div>
        ) : (
          <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
            <div className="overflow-y-auto max-h-[50vh]">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-10 text-center">
                      <Checkbox
                        checked={todosVisivelSelecionados}
                        onCheckedChange={toggleTodos}
                        aria-label="Selecionar todos"
                      />
                    </TableHead>
                    <TableHead className="w-28">Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-16 text-center">Unid.</TableHead>
                    <TableHead className="w-28 text-right">Preço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((item) => (
                    <TableRow
                      key={item.id}
                      className={`cursor-pointer hover:bg-muted/30 ${selecionados.has(item.id) ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selecionados.has(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.codigo}</TableCell>
                      <TableCell className="text-sm">{item.descricao}</TableCell>
                      <TableCell className="text-center text-sm">{item.unidade}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(item.valorUnitario)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={selecionados.size === 0}
          >
            Adicionar {selecionados.size > 0 ? `${selecionados.size} item(s)` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
