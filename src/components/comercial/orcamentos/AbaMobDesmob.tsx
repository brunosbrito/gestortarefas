import { Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';

interface AbaMobDesmobProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaMobDesmob({ orcamento, onUpdate }: AbaMobDesmobProps) {
  const composicaoMobilizacao = orcamento.composicoes.find((c) => c.tipo === 'mobilizacao');
  const composicaoDesmobilizacao = orcamento.composicoes.find((c) => c.tipo === 'desmobilizacao');

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
          <ComposicaoGenericaTable composicao={composicaoMobilizacao} tipo="Mobilização" />
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
          <ComposicaoGenericaTable composicao={composicaoDesmobilizacao} tipo="Desmobilização" />
        </CardContent>
      </Card>
    </div>
  );
}
