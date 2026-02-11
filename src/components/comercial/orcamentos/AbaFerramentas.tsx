import { Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';

interface AbaFerramentasProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaFerramentas({ orcamento, onUpdate }: AbaFerramentasProps) {
  const composicaoFerramentas = orcamento.composicoes.find((c) => c.tipo === 'ferramentas');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Ferramentas Manuais e Elétricas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ComposicaoGenericaTable composicao={composicaoFerramentas} tipo="Ferramentas" />
      </CardContent>
    </Card>
  );
}
