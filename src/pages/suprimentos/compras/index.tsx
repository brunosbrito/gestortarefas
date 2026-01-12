import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, FileText, Users, TrendingUp } from 'lucide-react';

const Compras = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-foreground">Compras</h1>
      <p className="text-muted-foreground">
        Gestão de requisições, pedidos e cotações
      </p>
    </div>

    <Card>
      <CardContent className="text-center py-12">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
        <p className="text-muted-foreground mb-4">
          Módulo completo de gestão de compras e fornecedores
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
          <div className="p-4 border rounded-lg">
            <FileText className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="font-medium">Requisições</p>
            <p className="text-xs text-muted-foreground mt-1">
              Solicitações de compra
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <ShoppingCart className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="font-medium">Pedidos</p>
            <p className="text-xs text-muted-foreground mt-1">
              Purchase orders
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="font-medium">Cotações</p>
            <p className="text-xs text-muted-foreground mt-1">
              Comparação de preços
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Users className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <p className="font-medium">Fornecedores</p>
            <p className="text-xs text-muted-foreground mt-1">
              Cadastro e avaliação
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Compras;
