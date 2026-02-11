import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';

interface AbaMaoObraProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaMaoObra({ orcamento, onUpdate }: AbaMaoObraProps) {
  const moFabricacao = orcamento.composicoes.find((c) => c.tipo === 'mo_fabricacao');
  const moMontagem = orcamento.composicoes.find((c) => c.tipo === 'mo_montagem');

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
          <ComposicaoGenericaTable composicao={moFabricacao} tipo="Fabricação" />
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
          <ComposicaoGenericaTable composicao={moMontagem} tipo="Montagem" />
        </CardContent>
      </Card>
    </div>
  );
}
