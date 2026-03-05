import { useState, useEffect, useCallback } from 'react';
import { Box, Database, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Orcamento, ComposicaoCustos, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import OrcamentoService from '@/services/OrcamentoService';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';
import ConsumivelService from '@/services/ConsumivelService';
import ConsumivelFormDialog from '@/components/comercial/cadastros/consumiveis/ConsumivelFormDialog';
import SelecionarCatalogoDialog, { CatalogoItemGenerico } from './SelecionarCatalogoDialog';
import { useToast } from '@/hooks/use-toast';

interface AbaConsumiveisProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaConsumiveis({ orcamento, onUpdate }: AbaConsumiveisProps) {
  const { toast } = useToast();

  const composicaoConsumiveis = orcamento.composicoes.find((c) => c.tipo === 'consumiveis');

  const [novoFormAberto, setNovoFormAberto] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [catalogoItems, setCatalogoItems] = useState<CatalogoItemGenerico[]>([]);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(false);

  const carregarCatalogo = useCallback(async () => {
    try {
      setCarregandoCatalogo(true);
      const catalogo = await ConsumivelService.getAll({ ativo: true });
      setCatalogoItems(
        catalogo.map((c) => ({
          id: c.id,
          codigo: c.codigo,
          descricao: c.descricao,
          unidade: c.unidade,
          valorUnitario: c.precoUnitario,
        }))
      );
    } catch {
      console.error('Erro ao carregar catálogo de consumíveis');
    } finally {
      setCarregandoCatalogo(false);
    }
  }, []);

  useEffect(() => {
    carregarCatalogo();
  }, [carregarCatalogo]);

  const handleAtualizarComposicao = async (composicaoAtualizada: ComposicaoCustos) => {
    const updatedOrcamento = {
      ...orcamento,
      composicoes: orcamento.composicoes.map((c) =>
        c.id === composicaoAtualizada.id ? composicaoAtualizada : c
      ),
    };
    await OrcamentoService.update(orcamento.id, updatedOrcamento);
    onUpdate();
  };

  const handleAdicionarDoCatalogo = async (items: CatalogoItemGenerico[]) => {
    if (!composicaoConsumiveis) return;
    try {
      const itensExistentes = composicaoConsumiveis.itens;
      const novosItens: ItemComposicao[] = items.map((c, index) => ({
        id: `cat-${composicaoConsumiveis.id}-${c.id}-${Date.now()}-${index}`,
        composicaoId: composicaoConsumiveis.id,
        codigo: c.codigo,
        descricao: c.descricao,
        quantidade: 1,
        unidade: c.unidade,
        valorUnitario: c.valorUnitario,
        subtotal: c.valorUnitario,
        percentual: 0,
        tipoItem: 'consumivel' as const,
        ordem: itensExistentes.length + index + 1,
      }));
      await handleAtualizarComposicao({
        ...composicaoConsumiveis,
        itens: [...itensExistentes, ...novosItens],
      });
      toast({
        title: 'Itens adicionados',
        description: `${novosItens.length} consumível(is) adicionado(s) ao orçamento`,
      });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível adicionar os itens', variant: 'destructive' });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Consumíveis (Lixas, Discos, EPI, etc.)
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNovoFormAberto(true)}
                title="Cadastrar novo consumível no catálogo"
              >
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Novo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDialogAberto(true)}
                disabled={!composicaoConsumiveis}
                title="Selecionar consumíveis do catálogo para adicionar"
              >
                <Database className="mr-2 h-4 w-4" />
                Adicionar do Catálogo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ComposicaoGenericaTable
            composicao={composicaoConsumiveis}
            tipo="Consumíveis"
            tipoItemPadrao="consumivel"
            onUpdate={handleAtualizarComposicao}
            catalogoItems={catalogoItems}
          />
        </CardContent>
      </Card>

      <SelecionarCatalogoDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        items={catalogoItems}
        onSelecionar={handleAdicionarDoCatalogo}
        titulo="Catálogo de Consumíveis"
        carregando={carregandoCatalogo}
      />

      <ConsumivelFormDialog
        open={novoFormAberto}
        onOpenChange={setNovoFormAberto}
        consumivel={null}
        onSalvar={() => {
          toast({
            title: 'Consumível cadastrado',
            description: 'Item adicionado ao catálogo.',
          });
          carregarCatalogo();
        }}
      />
    </>
  );
}
