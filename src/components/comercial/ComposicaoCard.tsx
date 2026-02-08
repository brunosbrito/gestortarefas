import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Edit, Trash2 } from 'lucide-react';
import { ComposicaoCustos, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { formatCurrency, formatPercentage } from '@/lib/currency';

interface ComposicaoCardProps {
  composicao: ComposicaoCustos;
  onAddItem?: (composicaoId: string) => void;
  onEditItem?: (composicaoId: string, itemId: string) => void;
  onDeleteItem?: (composicaoId: string, itemId: string) => void;
  onEdit?: (composicaoId: string) => void;
  onDelete?: (composicaoId: string) => void;
}

const ComposicaoCard = ({
  composicao,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onEdit,
  onDelete,
}: ComposicaoCardProps) => {
  return (
    <Card key={composicao.id} className="border-blue-200">
      <CardHeader className="bg-blue-50/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{composicao.nome}</CardTitle>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                {composicao.tipo.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {composicao.itens.length} itens • BDI: {formatPercentage(composicao.bdi.percentual)} •
              Custo Direto: {formatCurrency(composicao.custoDirecto)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(composicao.subtotal)}
              </p>
            </div>
            {(onEdit || onDelete) && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(composicao.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(composicao.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {composicao.itens.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum item adicionado
            </p>
            {onAddItem && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => onAddItem(composicao.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {composicao.itens.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      {item.codigo && (
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                          {item.codigo}
                        </span>
                      )}
                      <span className="font-medium">{item.descricao}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{item.quantidade} {item.unidade}</span>
                      <span>×</span>
                      <span>{formatCurrency(item.valorUnitario)}</span>
                      {item.material && <span>• {item.material}</span>}
                      {item.cargo && <span>• {item.cargo}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {formatCurrency(item.subtotal)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPercentage(item.percentual)}
                      </p>
                    </div>
                    {(onEditItem || onDeleteItem) && (
                      <div className="flex gap-1">
                        {onEditItem && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditItem(composicao.id, item.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDeleteItem && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteItem(composicao.id, item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {onAddItem && (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => onAddItem(composicao.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ComposicaoCard;
