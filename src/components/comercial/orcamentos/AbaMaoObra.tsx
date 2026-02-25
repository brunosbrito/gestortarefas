import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Orcamento, ComposicaoCustos } from '@/interfaces/OrcamentoInterface';
import OrcamentoService from '@/services/OrcamentoService';
import AbaMaoObraGrid from './AbaMaoObraGrid';

interface AbaMaoObraProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaMaoObra({ orcamento, onUpdate }: AbaMaoObraProps) {
  const moFabricacao = orcamento.composicoes.find((c) => c.tipo === 'mo_fabricacao');
  const moMontagem = orcamento.composicoes.find((c) => c.tipo === 'mo_montagem');

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
            <Users className="h-5 w-5" />
            Mão de Obra - Fabricação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AbaMaoObraGrid
            composicao={moFabricacao}
            tipo="Fabricação"
            categoria="fabricacao"
            onUpdate={handleAtualizarComposicao}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mão de Obra - Montagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AbaMaoObraGrid
            composicao={moMontagem}
            tipo="Montagem"
            categoria="montagem"
            onUpdate={handleAtualizarComposicao}
          />
        </CardContent>
      </Card>
    </div>
  );
}
