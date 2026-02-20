import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, FileDown, FileSpreadsheet, Printer, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AbaQQPProps {
  orcamento: any;
  onUpdate: (orcamento: any) => void;
}

const AbaQQP = ({ orcamento, onUpdate }: AbaQQPProps) => {
  const handleExportarExcel = () => {
    alert('Funcionalidade de exportação Excel em desenvolvimento');
  };

  const handleExportarPDF = () => {
    alert('Funcionalidade de exportação PDF em desenvolvimento');
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de exportação */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-teal-600" />
            QQP - Quadro de Quantidades e Preços
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Resumo financeiro e precificação final
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportarExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar para Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportarPDF}>
              <Receipt className="h-4 w-4 mr-2" />
              Exportar para PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImprimir}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* QQP Suprimentos */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
            <CardTitle className="text-base">QQP Suprimentos (Orçamento Previsto)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Materiais</span>
              <span className="font-bold">R$ {orcamento.qqpSuprimentos?.materiais?.toLocaleString('pt-BR') || '0,00'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Pintura</span>
              <span className="font-bold">R$ {orcamento.qqpSuprimentos?.pintura?.toLocaleString('pt-BR') || '0,00'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Ferramentas</span>
              <span className="font-bold">R$ {orcamento.qqpSuprimentos?.ferramentas?.toLocaleString('pt-BR') || '0,00'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Consumíveis</span>
              <span className="font-bold">R$ {orcamento.qqpSuprimentos?.consumiveis?.toLocaleString('pt-BR') || '0,00'}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-blue-300">
              <span className="font-bold text-base">Total Suprimentos</span>
              <span className="text-xl font-bold text-blue-600">
                R$ {orcamento.qqpSuprimentos?.total?.toLocaleString('pt-BR') || '0,00'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* QQP Cliente */}
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="text-base">QQP Cliente (Precificação Final)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Suprimentos</span>
              <span className="font-bold">R$ {orcamento.qqpCliente?.suprimentos?.toLocaleString('pt-BR') || '0,00'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Mão de Obra</span>
              <span className="font-bold">R$ {orcamento.qqpCliente?.maoObra?.toLocaleString('pt-BR') || '0,00'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">BDI ({(orcamento.configuracoes?.bdi * 100 || 25)}%)</span>
              <span className="font-bold">R$ {orcamento.qqpCliente?.bdi?.toLocaleString('pt-BR') || '0,00'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Subtotal</span>
              <span className="font-bold">R$ {orcamento.qqpCliente?.subtotal?.toLocaleString('pt-BR') || '0,00'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Tributos ({((orcamento.configuracoes?.tributos?.total || 0.148) * 100).toFixed(1)}%)</span>
              <span className="font-bold">R$ {orcamento.qqpCliente?.tributos?.toLocaleString('pt-BR') || '0,00'}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-green-300">
              <span className="font-bold text-base">Total Cliente</span>
              <span className="text-xl font-bold text-green-600">
                R$ {orcamento.qqpCliente?.total?.toLocaleString('pt-BR') || '0,00'}
              </span>
            </div>
            {orcamento.qqpCliente?.precoM2 && (
              <div className="flex justify-between items-center pt-2 text-xs text-muted-foreground">
                <span>Preço por m²:</span>
                <span className="font-medium">R$ {orcamento.qqpCliente.precoM2.toFixed(2)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo Configurações */}
      <Card className="bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900 dark:to-transparent">
        <CardHeader>
          <CardTitle className="text-base">Parâmetros de Cálculo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-white dark:bg-slate-800 border rounded-lg">
              <p className="text-muted-foreground mb-1">BDI</p>
              <p className="text-lg font-bold text-blue-600">
                {((orcamento.configuracoes?.bdi || 0.25) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 border rounded-lg">
              <p className="text-muted-foreground mb-1">Tributos Total</p>
              <p className="text-lg font-bold text-red-600">
                {((orcamento.configuracoes?.tributos?.total || 0.148) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 border rounded-lg">
              <p className="text-muted-foreground mb-1">Encargos Sociais</p>
              <p className="text-lg font-bold text-orange-600">
                {((orcamento.configuracoes?.encargos || 0.58724) * 100).toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 border rounded-lg">
              <p className="text-muted-foreground mb-1">Área Total</p>
              <p className="text-lg font-bold text-purple-600">
                {orcamento.areaTotalM2?.toLocaleString('pt-BR') || '0'} m²
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observações do Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Este QQP foi gerado automaticamente com base nas composições de custos configuradas.
            Os valores incluem BDI de {((orcamento.configuracoes?.bdi || 0.25) * 100).toFixed(0)}% e
            tributos de {((orcamento.configuracoes?.tributos?.total || 0.148) * 100).toFixed(1)}%.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbaQQP;
