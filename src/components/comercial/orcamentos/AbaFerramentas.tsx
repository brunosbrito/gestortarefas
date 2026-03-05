import { useState, useEffect, useCallback } from 'react';
import { Wrench, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Orcamento, ComposicaoCustos } from '@/interfaces/OrcamentoInterface';
import OrcamentoService from '@/services/OrcamentoService';
import FerramentaService from '@/services/FerramentaService';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';

interface AbaFerramentasProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaFerramentas({ orcamento, onUpdate }: AbaFerramentasProps) {
  const [catalogoFerramentas, setCatalogoFerramentas] = useState<{ codigo: string; descricao: string; unidade: string; valorUnitario: number }[]>([]);

  const carregarCatalogo = useCallback(async () => {
    try {
      const ferramentas = await FerramentaService.listar({ ativo: true });
      setCatalogoFerramentas(
        ferramentas.map((f: any) => ({
          codigo: f.codigo,
          descricao: f.descricao,
          unidade: 'Mês',
          valorUnitario: f.custoMensal || 0,
        }))
      );
    } catch {
      console.error('Erro ao carregar catálogo de ferramentas');
    }
  }, []);

  useEffect(() => {
    carregarCatalogo();
  }, [carregarCatalogo]);

  const composicaoManuais = orcamento.composicoes.find((c) => c.tipo === 'ferramentas');
  const composicaoEletricas = orcamento.composicoes.find((c) => c.tipo === 'ferramentas_eletricas');

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Ferramentas Manuais
          </CardTitle>
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
            catalogoItems={catalogoFerramentas}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Ferramentas Elétricas / Equipamentos
          </CardTitle>
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
            catalogoItems={catalogoFerramentas}
          />
        </CardContent>
      </Card>
    </div>
  );
}
