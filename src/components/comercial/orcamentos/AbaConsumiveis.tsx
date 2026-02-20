import { Box } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import ComposicaoGenericaTable from './ComposicaoGenericaTable';

interface AbaConsumiveisProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaConsumiveis({ orcamento, onUpdate }: AbaConsumiveisProps) {
  const composicaoConsumiveis = orcamento.composicoes.find((c) => c.tipo === 'consumiveis');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          Consumíveis (Lixas, Discos, EPI, etc.)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ComposicaoGenericaTable composicao={composicaoConsumiveis} tipo="Consumíveis" />
      </CardContent>
    </Card>
  );
}
