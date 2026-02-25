import { Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Orcamento, ComposicaoCustos } from '@/interfaces/OrcamentoInterface';
import OrcamentoService from '@/services/OrcamentoService';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';

interface AbaFerramentasProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaFerramentas({ orcamento, onUpdate }: AbaFerramentasProps) {
  const composicaoFerramentas = orcamento.composicoes.find((c) => c.tipo === 'ferramentas');

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
          <Wrench className="h-5 w-5" />
          Ferramentas Manuais e Elétricas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ComposicaoGenericaTable
          composicao={composicaoFerramentas}
          tipo="Ferramentas"
          tipoItemPadrao="ferramenta"
          onUpdate={handleAtualizarComposicao}
        />
      </CardContent>
    </Card>
  );
}
