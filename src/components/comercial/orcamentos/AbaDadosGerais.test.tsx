import { useState } from 'react';
import { Orcamento } from '@/interfaces/OrcamentoInterface';

interface AbaDadosGeraisProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaDadosGeraisTest({ orcamento, onUpdate }: AbaDadosGeraisProps) {
  const [teste, setTeste] = useState(true);

  return (
    <div className="space-y-6">
      <h1>Teste Básico</h1>
      <p>Se isso funcionar, o problema é específico do componente original</p>
    </div>
  );
}
