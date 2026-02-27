import { useState } from 'react';
import { Truck, ClipboardList, Database, Plus } from 'lucide-react';
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
import { TipoMobilizacao } from '@/interfaces/MobilizacaoInterface';
import OrcamentoService from '@/services/OrcamentoService';
import MobilizacaoService from '@/services/MobilizacaoService';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';
import MobilizacaoFormDialog from '@/components/comercial/cadastros/mobilizacao/MobilizacaoFormDialog';
import { templateMobDesmob, TemplateMobDesmobItem } from '@/data/mockMobDesmobDefault';
import { useToast } from '@/hooks/use-toast';

interface AbaMobDesmobProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

type TipoCard = 'mobilizacao' | 'desmobilizacao';
type AcaoCarregamento = 'template' | 'catalogo';

interface EstadoCarregamento {
  tipo: TipoCard;
  acao: AcaoCarregamento;
}

const buildItensTemplate = (
  composicaoId: string,
  template: TemplateMobDesmobItem[]
): ItemComposicao[] =>
  template.map((item, index) => ({
    id: `tmpl-${composicaoId}-${index}-${Date.now()}`,
    composicaoId,
    descricao: item.descricao,
    quantidade: item.quantidade,
    unidade: item.unidade,
    valorUnitario: item.valorUnitario,
    subtotal: Math.round(item.quantidade * item.valorUnitario * 100) / 100,
    percentual: 0,
    tipoItem: 'outros' as const,
    ordem: index + 1,
  }));

export default function AbaMobDesmob({ orcamento, onUpdate }: AbaMobDesmobProps) {
  const { toast } = useToast();

  const composicaoMobilizacao = orcamento.composicoes.find((c) => c.tipo === 'mobilizacao');
  const composicaoDesmobilizacao = orcamento.composicoes.find((c) => c.tipo === 'desmobilizacao');

  // Estado unificado para confirmação e carregamento
  const [confirmando, setConfirmando] = useState<EstadoCarregamento | null>(null);
  const [carregando, setCarregando] = useState<EstadoCarregamento | null>(null);

  // Formulário inline de cadastro
  const [novoFormAberto, setNovoFormAberto] = useState(false);
  const [tipoNovoForm, setTipoNovoForm] = useState<TipoMobilizacao>(TipoMobilizacao.MOBILIZACAO);

  const getComposicao = (tipo: TipoCard) =>
    tipo === 'mobilizacao' ? composicaoMobilizacao : composicaoDesmobilizacao;

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

  // Solicita carregamento — exibe AlertDialog se o grid já tem itens
  const solicitarCarregamento = (tipo: TipoCard, acao: AcaoCarregamento) => {
    const composicao = getComposicao(tipo);
    if ((composicao?.itens.length ?? 0) > 0) {
      setConfirmando({ tipo, acao });
    } else {
      executarCarregamento(tipo, acao);
    }
  };

  const executarCarregamento = async (tipo: TipoCard, acao: AcaoCarregamento) => {
    const composicao = getComposicao(tipo);
    if (!composicao) return;

    const nomeAba = tipo === 'mobilizacao' ? 'Mobilização' : 'Desmobilização';

    try {
      setCarregando({ tipo, acao });

      let novosItens: ItemComposicao[];

      if (acao === 'template') {
        novosItens = buildItensTemplate(composicao.id, templateMobDesmob);
        toast({
          title: 'Template carregado',
          description: `${novosItens.length} itens carregados em ${nomeAba}`,
        });
      } else {
        // Carregar do catálogo (MobilizacaoService — localStorage)
        const tipoEnum =
          tipo === 'mobilizacao' ? TipoMobilizacao.MOBILIZACAO : TipoMobilizacao.DESMOBILIZACAO;
        const catalogo = await MobilizacaoService.getAll({ ativo: true, tipo: tipoEnum });

        if (catalogo.length === 0) {
          toast({
            title: 'Catálogo vazio',
            description: `Nenhum item de ${nomeAba} ativo encontrado. Cadastre itens no catálogo primeiro.`,
            variant: 'destructive',
          });
          return;
        }

        novosItens = catalogo.map((item, index) => ({
          id: `cat-${composicao.id}-${item.id}-${Date.now()}`,
          composicaoId: composicao.id,
          codigo: item.codigo,
          descricao: item.descricao,
          quantidade: 1,
          unidade: item.unidade,
          valorUnitario: item.precoUnitario,
          subtotal: item.precoUnitario,
          percentual: 0,
          tipoItem: 'outros' as const,
          ordem: index + 1,
        }));

        toast({
          title: 'Catálogo carregado',
          description: `${novosItens.length} itens carregados em ${nomeAba}`,
        });
      }

      await handleAtualizarComposicao({ ...composicao, itens: novosItens });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens',
        variant: 'destructive',
      });
    } finally {
      setCarregando(null);
    }
  };

  const abrirNovoForm = (tipo: TipoCard) => {
    setTipoNovoForm(
      tipo === 'mobilizacao' ? TipoMobilizacao.MOBILIZACAO : TipoMobilizacao.DESMOBILIZACAO
    );
    setNovoFormAberto(true);
  };

  const isCarregando = (tipo: TipoCard, acao: AcaoCarregamento) =>
    carregando?.tipo === tipo && carregando?.acao === acao;

  // Reutilizável: botões do header de cada card
  const BotoesCard = ({ tipo }: { tipo: TipoCard }) => (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => abrirNovoForm(tipo)}
        title="Cadastrar novo item no catálogo"
      >
        <Plus className="mr-2 h-4 w-4" />
        Cadastrar Novo
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => solicitarCarregamento(tipo, 'catalogo')}
        disabled={!!carregando}
        title="Carregar itens do catálogo de Mobilização/Desmobilização"
      >
        <Database className="mr-2 h-4 w-4" />
        {isCarregando(tipo, 'catalogo') ? 'Carregando...' : 'Carregar Catálogo'}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => solicitarCarregamento(tipo, 'template')}
        disabled={!!carregando || !getComposicao(tipo)}
        title="Pré-carregar itens padrão da empresa"
      >
        <ClipboardList className="mr-2 h-4 w-4" />
        {isCarregando(tipo, 'template') ? 'Carregando...' : 'Carregar Template'}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Mobilização */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Mobilização
            </CardTitle>
            <BotoesCard tipo="mobilizacao" />
          </div>
        </CardHeader>
        <CardContent>
          <ComposicaoGenericaTable
            composicao={composicaoMobilizacao}
            tipo="Mobilização"
            tipoItemPadrao="outros"
            onUpdate={handleAtualizarComposicao}
            unidadeOptions={['Mês', 'VB', 'UNID', 'Dia', 'Semana']}
            quantidadeInteira
            mostrarQtdPeriodo
            labelQuantidade="Qtd Equip."
          />
        </CardContent>
      </Card>

      {/* Desmobilização */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 rotate-180" />
              Desmobilização
            </CardTitle>
            <BotoesCard tipo="desmobilizacao" />
          </div>
        </CardHeader>
        <CardContent>
          <ComposicaoGenericaTable
            composicao={composicaoDesmobilizacao}
            tipo="Desmobilização"
            tipoItemPadrao="outros"
            onUpdate={handleAtualizarComposicao}
            unidadeOptions={['Mês', 'VB', 'UNID', 'Dia', 'Semana']}
            quantidadeInteira
            mostrarQtdPeriodo
            labelQuantidade="Qtd Equip."
          />
        </CardContent>
      </Card>

      {/* AlertDialog — confirmação de substituição */}
      <AlertDialog open={!!confirmando} onOpenChange={() => setConfirmando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Substituir itens existentes?</AlertDialogTitle>
            <AlertDialogDescription>
              O grid já possui itens cadastrados. Carregar o{' '}
              <strong>{confirmando?.acao === 'template' ? 'template' : 'catálogo'}</strong> irá{' '}
              <strong>substituir todos os itens atuais</strong>. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                if (confirmando) executarCarregamento(confirmando.tipo, confirmando.acao);
                setConfirmando(null);
              }}
            >
              Substituir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Formulário inline de cadastro no catálogo */}
      <MobilizacaoFormDialog
        open={novoFormAberto}
        onOpenChange={setNovoFormAberto}
        item={null}
        tipoInicial={tipoNovoForm}
        onSalvar={() => {
          toast({
            title: 'Item cadastrado',
            description: 'Item adicionado ao catálogo. Use "Carregar Catálogo" para incluí-lo neste orçamento.',
          });
        }}
      />
    </div>
  );
}
