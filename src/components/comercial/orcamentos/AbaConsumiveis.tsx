import { Box } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Orcamento, ComposicaoCustos } from '@/interfaces/OrcamentoInterface';
import OrcamentoService from '@/services/OrcamentoService';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';

interface AbaConsumiveisProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaConsumiveis({ orcamento, onUpdate }: AbaConsumiveisProps) {
  const composicaoConsumiveis = orcamento.composicoes.find((c) => c.tipo === 'consumiveis');

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          Consumíveis (Lixas, Discos, EPI, etc.)
        </CardTitle>
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
  );
}
