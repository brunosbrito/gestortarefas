import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface AbaDadosGeraisProps {
  orcamento: any;
  onUpdate: (orcamento: any) => void;
}

const AbaDadosGerais = ({ orcamento, onUpdate }: AbaDadosGeraisProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Informações do Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Número</Label>
              <Input value={orcamento.numero} disabled />
            </div>
            <div>
              <Label>Tipo</Label>
              <Input value={orcamento.tipo === 'servico' ? 'Serviço' : 'Produto'} disabled />
            </div>
          </div>

          <div>
            <Label>Nome do Orçamento</Label>
            <Input
              value={orcamento.nome}
              onChange={(e) => onUpdate({ ...orcamento, nome: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Área Total (m²)</Label>
              <Input
                type="number"
                value={orcamento.areaTotalM2 || ''}
                onChange={(e) => onUpdate({ ...orcamento, areaTotalM2: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Metros Lineares</Label>
              <Input
                type="number"
                value={orcamento.metrosLineares || ''}
                onChange={(e) => onUpdate({ ...orcamento, metrosLineares: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Peso Total (kg)</Label>
              <Input
                type="number"
                value={orcamento.pesoTotalProjeto || ''}
                onChange={(e) => onUpdate({ ...orcamento, pesoTotalProjeto: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>BDI (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={(orcamento.configuracoes?.bdi * 100) || 25}
                onChange={(e) => onUpdate({
                  ...orcamento,
                  configuracoes: {
                    ...orcamento.configuracoes,
                    bdi: Number(e.target.value) / 100
                  }
                })}
              />
            </div>
            <div>
              <Label>ISS (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={(orcamento.configuracoes?.tributos?.iss * 100) || 3}
                onChange={(e) => {
                  const iss = Number(e.target.value) / 100;
                  const simples = orcamento.configuracoes?.tributos?.simples || 0.118;
                  onUpdate({
                    ...orcamento,
                    configuracoes: {
                      ...orcamento.configuracoes,
                      tributos: {
                        iss,
                        simples,
                        total: iss + simples
                      }
                    }
                  });
                }}
              />
            </div>
            <div>
              <Label>Encargos (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={(orcamento.configuracoes?.encargos * 100) || 58.724}
                onChange={(e) => onUpdate({
                  ...orcamento,
                  configuracoes: {
                    ...orcamento.configuracoes,
                    encargos: Number(e.target.value) / 100
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbaDadosGerais;
