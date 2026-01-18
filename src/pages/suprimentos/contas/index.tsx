import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, CreditCard, ArrowUpDown, Calendar } from 'lucide-react';

const Contas = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-foreground">Conta Corrente</h1>
      <p className="text-muted-foreground">
        Gestão de conta corrente e fluxo de caixa
      </p>
    </div>

    <Card>
      <CardContent className="text-center py-12">
        <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
        <p className="text-muted-foreground mb-4">
          Controle financeiro e movimentações de conta
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
          <div className="p-4 border rounded-lg">
            <DollarSign className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="font-medium">Saldo</p>
            <p className="text-xs text-muted-foreground mt-1">
              Atual e projetado
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <ArrowUpDown className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="font-medium">Movimentações</p>
            <p className="text-xs text-muted-foreground mt-1">
              Entradas e saídas
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <CreditCard className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="font-medium">Pagamentos</p>
            <p className="text-xs text-muted-foreground mt-1">
              Gestão de débitos
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Calendar className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <p className="font-medium">Previsões</p>
            <p className="text-xs text-muted-foreground mt-1">
              Fluxo de caixa
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Contas;
