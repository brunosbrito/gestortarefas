import { useState } from 'react';
import { Box, ClipboardList, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Orcamento, ComposicaoCustos, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import OrcamentoService from '@/services/OrcamentoService';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';
import ConsumivelService from '@/services/ConsumivelService';
import ConsumivelFormDialog from '@/components/comercial/cadastros/consumiveis/ConsumivelFormDialog';
import { useToast } from '@/hooks/use-toast';

interface AbaConsumiveisProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaConsumiveis({ orcamento, onUpdate }: AbaConsumiveisProps) {
  const { toast } = useToast();

  const composicaoConsumiveis = orcamento.composicoes.find((c) => c.tipo === 'consumiveis');

  const [confirmando, setConfirmando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [novoFormAberto, setNovoFormAberto] = useState(false);

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

  const solicitarCarregarCatalogo = () => {
    if ((composicaoConsumiveis?.itens.length ?? 0) > 0) {
      setConfirmando(true);
    } else {
      carregarCatalogo();
    }
  };

  const carregarCatalogo = async () => {
    if (!composicaoConsumiveis) return;
    try {
      setCarregando(true);
      const catalogo = await ConsumivelService.getAll({ ativo: true });
      if (catalogo.length === 0) {
        toast({
          title: 'Catálogo vazio',
          description: 'Nenhum consumível ativo encontrado. Cadastre itens no catálogo primeiro.',
          variant: 'destructive',
        });
        return;
      }
      const novosItens: ItemComposicao[] = catalogo.map((c, index) => ({
        id: `cat-${composicaoConsumiveis.id}-${c.id}-${Date.now()}`,
        composicaoId: composicaoConsumiveis.id,
        codigo: c.codigo,
        descricao: c.descricao,
        quantidade: 1,
        unidade: c.unidade,
        valorUnitario: c.precoUnitario,
        subtotal: c.precoUnitario,
        percentual: 0,
        tipoItem: 'consumivel' as const,
        ordem: index + 1,
      }));
      await handleAtualizarComposicao({ ...composicaoConsumiveis, itens: novosItens });
      toast({
        title: 'Catálogo carregado',
        description: `${novosItens.length} itens carregados do catálogo de consumíveis`,
      });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar o catálogo', variant: 'destructive' });
    } finally {
      setCarregando(false);
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
                onClick={solicitarCarregarCatalogo}
                disabled={carregando}
                title="Carregar todos os consumíveis ativos do catálogo"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                {carregando ? 'Carregando...' : 'Carregar Catálogo'}
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
          />
        </CardContent>
      </Card>

      {/* AlertDialog — confirmação de substituição */}
      <AlertDialog open={confirmando} onOpenChange={setConfirmando}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Substituir itens existentes?</AlertDialogTitle>
            <AlertDialogDescription>
              O grid já possui itens cadastrados. Carregar o catálogo irá{' '}
              <strong>substituir todos os itens atuais</strong> pelos consumíveis ativos.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                carregarCatalogo();
                setConfirmando(false);
              }}
            >
              Substituir pelo Catálogo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Formulário inline para cadastrar novo consumível no catálogo */}
      <ConsumivelFormDialog
        open={novoFormAberto}
        onOpenChange={setNovoFormAberto}
        consumivel={null}
        onSalvar={() => {
          toast({
            title: 'Consumível cadastrado',
            description: 'Item adicionado ao catálogo. Use "Carregar Catálogo" para incluí-lo neste orçamento.',
          });
        }}
      />
    </>
  );
}
