import { Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Orcamento, ComposicaoCustos } from '@/interfaces/OrcamentoInterface';
import OrcamentoService from '@/services/OrcamentoService';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';

interface AbaMobDesmobProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaMobDesmob({ orcamento, onUpdate }: AbaMobDesmobProps) {
  const composicaoMobilizacao = orcamento.composicoes.find((c) => c.tipo === 'mobilizacao');
  const composicaoDesmobilizacao = orcamento.composicoes.find((c) => c.tipo === 'desmobilizacao');

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Mobilização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ComposicaoGenericaTable
            composicao={composicaoMobilizacao}
            tipo="Mobilização"
            tipoItemPadrao="outros"
            onUpdate={handleAtualizarComposicao}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 rotate-180" />
            Desmobilização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ComposicaoGenericaTable
            composicao={composicaoDesmobilizacao}
            tipo="Desmobilização"
            tipoItemPadrao="outros"
            onUpdate={handleAtualizarComposicao}
          />
        </CardContent>
      </Card>
    </div>
  );
}
