import { useState } from 'react';
import { Wrench, Zap, ClipboardList } from 'lucide-react';
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
import {
  templateFerramentasManuais,
  templateFerramentasEletricas,
  TemplateItemFerramentas,
} from '@/data/mockFerramentasDefault';
import { useToast } from '@/hooks/use-toast';

interface AbaFerramentasProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

const buildItens = (
  composicaoId: string,
  template: TemplateItemFerramentas[]
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
    tipoItem: 'ferramenta' as const,
    ordem: index + 1,
  }));

export default function AbaFerramentas({ orcamento, onUpdate }: AbaFerramentasProps) {
  const { toast } = useToast();

  const composicaoManuais = orcamento.composicoes.find((c) => c.tipo === 'ferramentas');
  const composicaoEletricas = orcamento.composicoes.find((c) => c.tipo === 'ferramentas_eletricas');

  // Retrocompatibilidade: cria composição elétrica on-the-fly se não existir
  const composicaoEletricasOuPadrao: ComposicaoCustos = composicaoEletricas ?? {
    id: `comp-${orcamento.id}-ferreletrica`,
    orcamentoId: orcamento.id,
    nome: 'Ferramentas Elétricas',
    tipo: 'ferramentas_eletricas' as const,
    itens: [],
    bdi: { percentual: 15, valor: 0 },
    custoDirecto: 0,
    subtotal: 0,
    percentualDoTotal: 0,
    ordem: orcamento.composicoes.length + 1,
  };

  // Confirmação antes de substituir itens existentes
  const [confirmando, setConfirmando] = useState<'manuais' | 'eletricas' | null>(null);
  const [carregando, setCarregando] = useState<'manuais' | 'eletricas' | null>(null);

  // ---- handlers de atualização ----
  const handleAtualizarManuais = async (composicaoAtualizada: ComposicaoCustos) => {
    const updatedOrcamento = {
      ...orcamento,
      composicoes: orcamento.composicoes.map((c) =>
        c.id === composicaoAtualizada.id ? composicaoAtualizada : c
      ),
    };
    await OrcamentoService.update(orcamento.id, updatedOrcamento);
    onUpdate();
  };

  const handleAtualizarEletricas = async (composicaoAtualizada: ComposicaoCustos) => {
    const novasComposicoes = composicaoEletricas
      ? orcamento.composicoes.map((c) => c.id === composicaoAtualizada.id ? composicaoAtualizada : c)
      : [...orcamento.composicoes, composicaoAtualizada];

    const updatedOrcamento = { ...orcamento, composicoes: novasComposicoes };
    await OrcamentoService.update(orcamento.id, updatedOrcamento);
    onUpdate();
  };

  // ---- handlers de template ----
  const solicitarTemplateManuais = () => {
    if ((composicaoManuais?.itens.length ?? 0) > 0) {
      setConfirmando('manuais');
    } else {
      aplicarTemplateManuais();
    }
  };

  const solicitarTemplateEletricas = () => {
    if ((composicaoEletricasOuPadrao.itens.length) > 0) {
      setConfirmando('eletricas');
    } else {
      aplicarTemplateEletricas();
    }
  };

  const aplicarTemplateManuais = async () => {
    if (!composicaoManuais) return;
    try {
      setCarregando('manuais');
      const novosItens = buildItens(composicaoManuais.id, templateFerramentasManuais);
      await handleAtualizarManuais({ ...composicaoManuais, itens: novosItens });
      toast({ title: 'Template carregado', description: `${novosItens.length} itens carregados em Ferramentas Manuais` });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar o template', variant: 'destructive' });
    } finally {
      setCarregando(null);
    }
  };

  const aplicarTemplateEletricas = async () => {
    try {
      setCarregando('eletricas');
      const novosItens = buildItens(composicaoEletricasOuPadrao.id, templateFerramentasEletricas);
      await handleAtualizarEletricas({ ...composicaoEletricasOuPadrao, itens: novosItens });
      toast({ title: 'Template carregado', description: `${novosItens.length} itens carregados em Ferramentas Elétricas` });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar o template', variant: 'destructive' });
    } finally {
      setCarregando(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ferramentas Manuais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Ferramentas Manuais
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={solicitarTemplateManuais}
              disabled={carregando === 'manuais' || !composicaoManuais}
              title="Pré-carregar itens padrão da empresa"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              {carregando === 'manuais' ? 'Carregando...' : 'Carregar Template'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ComposicaoGenericaTable
            composicao={composicaoManuais}
            tipo="Ferramentas Manuais"
            tipoItemPadrao="ferramenta"
            onUpdate={handleAtualizarManuais}
            unidadeOptions={['Unid.', 'VB', 'Mês', 'Quinzena', 'Semana']}
            labelUnidade="Período"
            defaultUnidade="Unid."
            quantidadeInteira
            mostrarQtdPeriodo
            labelQuantidade="Qtd Equip."
          />
        </CardContent>
      </Card>

      {/* Ferramentas Elétricas / Equipamentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Ferramentas Elétricas / Equipamentos
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={solicitarTemplateEletricas}
              disabled={carregando === 'eletricas'}
              title="Pré-carregar itens padrão da empresa"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              {carregando === 'eletricas' ? 'Carregando...' : 'Carregar Template'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ComposicaoGenericaTable
            composicao={composicaoEletricasOuPadrao}
            tipo="Ferramentas Elétricas"
            tipoItemPadrao="ferramenta"
            onUpdate={handleAtualizarEletricas}
            unidadeOptions={['Mês', 'Quinzena', 'Semana', 'Unid.', 'VB']}
            labelUnidade="Período"
            defaultUnidade="Mês"
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
              O grid já possui itens cadastrados. Carregar o template irá{' '}
              <strong>substituir todos os itens atuais</strong> pelos valores padrão.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                if (confirmando === 'manuais') aplicarTemplateManuais();
                else if (confirmando === 'eletricas') aplicarTemplateEletricas();
                setConfirmando(null);
              }}
            >
              Substituir pelo Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
