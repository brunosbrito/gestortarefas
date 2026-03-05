import { useState, useEffect, useCallback } from 'react';
import { Truck, Database, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Orcamento, ComposicaoCustos, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { TipoMobilizacao } from '@/interfaces/MobilizacaoInterface';
import OrcamentoService from '@/services/OrcamentoService';
import MobilizacaoService from '@/services/MobilizacaoService';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';
import MobilizacaoFormDialog from '@/components/comercial/cadastros/mobilizacao/MobilizacaoFormDialog';
import SelecionarCatalogoDialog, { CatalogoItemGenerico } from './SelecionarCatalogoDialog';
import { useToast } from '@/hooks/use-toast';

interface AbaMobDesmobProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

type TipoCard = 'mobilizacao' | 'desmobilizacao';

export default function AbaMobDesmob({ orcamento, onUpdate }: AbaMobDesmobProps) {
  const { toast } = useToast();

  const composicaoMobilizacao = orcamento.composicoes.find((c) => c.tipo === 'mobilizacao');
  const composicaoDesmobilizacao = orcamento.composicoes.find((c) => c.tipo === 'desmobilizacao');

  const [novoFormAberto, setNovoFormAberto] = useState(false);
  const [tipoNovoForm, setTipoNovoForm] = useState<TipoMobilizacao>(TipoMobilizacao.MOBILIZACAO);

  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogTipo, setDialogTipo] = useState<TipoCard>('mobilizacao');
  const [catalogoMob, setCatalogoMob] = useState<CatalogoItemGenerico[]>([]);
  const [catalogoDesmob, setCatalogoDesmob] = useState<CatalogoItemGenerico[]>([]);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(false);

  const carregarCatalogo = useCallback(async () => {
    try {
      setCarregandoCatalogo(true);
      const [mob, desmob] = await Promise.all([
        MobilizacaoService.getAll({ ativo: true, tipo: TipoMobilizacao.MOBILIZACAO }),
        MobilizacaoService.getAll({ ativo: true, tipo: TipoMobilizacao.DESMOBILIZACAO }),
      ]);
      const mapItem = (item: any): CatalogoItemGenerico => ({
        id: item.id,
        codigo: item.codigo,
        descricao: item.descricao,
        unidade: item.unidade,
        valorUnitario: item.precoUnitario,
      });
      setCatalogoMob(mob.map(mapItem));
      setCatalogoDesmob(desmob.map(mapItem));
    } catch {
      console.error('Erro ao carregar catálogo de mobilização');
    } finally {
      setCarregandoCatalogo(false);
    }
  }, []);

  useEffect(() => {
    carregarCatalogo();
  }, [carregarCatalogo]);

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

  const abrirDialog = (tipo: TipoCard) => {
    setDialogTipo(tipo);
    setDialogAberto(true);
  };

  const abrirNovoForm = (tipo: TipoCard) => {
    setTipoNovoForm(
      tipo === 'mobilizacao' ? TipoMobilizacao.MOBILIZACAO : TipoMobilizacao.DESMOBILIZACAO
    );
    setNovoFormAberto(true);
  };

  const handleAdicionarDoCatalogo = async (items: CatalogoItemGenerico[]) => {
    const composicao = getComposicao(dialogTipo);
    if (!composicao) return;

    const nomeAba = dialogTipo === 'mobilizacao' ? 'Mobilização' : 'Desmobilização';

    try {
      const itensExistentes = composicao.itens;
      const novosItens: ItemComposicao[] = items.map((item, index) => ({
        id: `cat-${composicao.id}-${item.id}-${Date.now()}-${index}`,
        composicaoId: composicao.id,
        codigo: item.codigo,
        descricao: item.descricao,
        quantidade: 1,
        unidade: item.unidade,
        valorUnitario: item.valorUnitario,
        subtotal: item.valorUnitario,
        percentual: 0,
        tipoItem: 'outros' as const,
        ordem: itensExistentes.length + index + 1,
      }));

      await handleAtualizarComposicao({
        ...composicao,
        itens: [...itensExistentes, ...novosItens],
      });

      toast({
        title: 'Itens adicionados',
        description: `${novosItens.length} item(s) adicionado(s) em ${nomeAba}`,
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar os itens',
        variant: 'destructive',
      });
    }
  };

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
        onClick={() => abrirDialog(tipo)}
        disabled={!getComposicao(tipo)}
        title="Selecionar itens do catálogo para adicionar"
      >
        <Database className="mr-2 h-4 w-4" />
        Adicionar do Catálogo
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
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
            catalogoItems={catalogoMob}
          />
        </CardContent>
      </Card>

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
            catalogoItems={catalogoDesmob}
          />
        </CardContent>
      </Card>

      <SelecionarCatalogoDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        items={dialogTipo === 'mobilizacao' ? catalogoMob : catalogoDesmob}
        onSelecionar={handleAdicionarDoCatalogo}
        titulo={`Catálogo de ${dialogTipo === 'mobilizacao' ? 'Mobilização' : 'Desmobilização'}`}
        carregando={carregandoCatalogo}
      />

      <MobilizacaoFormDialog
        open={novoFormAberto}
        onOpenChange={setNovoFormAberto}
        item={null}
        tipoInicial={tipoNovoForm}
        onSalvar={() => {
          toast({
            title: 'Item cadastrado',
            description: 'Item adicionado ao catálogo.',
          });
          carregarCatalogo();
        }}
      />
    </div>
  );
}
