import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileBarChart,
  FileText,
  FileSpreadsheet,
  Scissors,
  Package,
  Palette,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  Printer,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';

const RelatoriosPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [periodo, setPeriodo] = useState('mes_atual');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const handleGerarRelatorio = (tipo: string) => {
    toast({
      title: 'Gerando relatório...',
      description: `Relatório de ${tipo} será gerado em breve`,
    });
  };

  const relatorios = [
    {
      id: 'materiais',
      titulo: 'Catálogo de Materiais',
      descricao: 'Listagem completa de materiais cadastrados com preços e fornecedores',
      icon: Package,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      acoes: [
        { label: 'PDF Completo', icon: FileText },
        { label: 'Excel', icon: FileSpreadsheet },
        { label: 'PDF Resumido', icon: FileText },
      ],
    },
    {
      id: 'tintas',
      titulo: 'Especificações de Tintas',
      descricao: 'Catálogo de tintas com rendimentos, preços e especificações técnicas',
      icon: Palette,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      acoes: [
        { label: 'PDF Completo', icon: FileText },
        { label: 'Excel', icon: FileSpreadsheet },
      ],
    },
    {
      id: 'lista-corte',
      titulo: 'Lista de Corte',
      descricao: 'Mapas de corte otimizados por orçamento ou período',
      icon: Scissors,
      color: 'indigo',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      acoes: [
        { label: 'Gerar Nova Lista', icon: Scissors },
        { label: 'Histórico', icon: FileText },
      ],
      link: '/comercial/orcamentos/lista-corte',
    },
    {
      id: 'orcamentos',
      titulo: 'Análise de Orçamentos',
      descricao: 'Comparação entre orçamentos com métricas de DRE e margem',
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-950/40',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      acoes: [
        { label: 'Análise Comparativa', icon: TrendingUp },
        { label: 'Exportar Excel', icon: FileSpreadsheet },
      ],
    },
    {
      id: 'financeiro',
      titulo: 'Resumo Financeiro',
      descricao: 'Análise de propostas aprovadas, em análise e valores totais',
      icon: DollarSign,
      color: 'emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      acoes: [
        { label: 'Resumo Mensal', icon: Calendar },
        { label: 'Exportar PDF', icon: FileText },
        { label: 'Exportar Excel', icon: FileSpreadsheet },
      ],
    },
    {
      id: 'consumiveis',
      titulo: 'Curva ABC Consumíveis',
      descricao: 'Análise ABC de consumíveis com valores e percentuais',
      icon: FileBarChart,
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-orange-950/40',
      iconColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-800',
      acoes: [
        { label: 'Análise ABC', icon: TrendingUp },
        { label: 'Exportar Excel', icon: FileSpreadsheet },
      ],
    },
  ];

  return (
    <Layout>
      <div className="w-full px-4 py-4 space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileBarChart className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Central de Relatórios</CardTitle>
                  <CardDescription className="mt-1">
                    Geração e exportação de relatórios gerenciais do módulo comercial
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Filtros Globais */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Filtros Globais</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Período</Label>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="semana_atual">Semana Atual</SelectItem>
                    <SelectItem value="mes_atual">Mês Atual</SelectItem>
                    <SelectItem value="trimestre_atual">Trimestre Atual</SelectItem>
                    <SelectItem value="ano_atual">Ano Atual</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {periodo === 'personalizado' && (
                <>
                  <div>
                    <Label>Data Início</Label>
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Data Fim</Label>
                    <Input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grid de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatorios.map((relatorio) => (
            <Card
              key={relatorio.id}
              className={`hover:shadow-lg transition-all duration-300 border-2 ${relatorio.borderColor}`}
            >
              <CardHeader className={relatorio.bgColor}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${relatorio.bgColor} flex items-center justify-center border-2 ${relatorio.borderColor}`}>
                      <relatorio.icon className={`h-6 w-6 ${relatorio.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{relatorio.titulo}</CardTitle>
                      {relatorio.id === 'lista-corte' && (
                        <Badge variant="outline" className="mt-1">
                          Otimização FFD
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">{relatorio.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {relatorio.acoes.map((acao, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        if (relatorio.link && idx === 0) {
                          navigate(relatorio.link);
                        } else {
                          handleGerarRelatorio(relatorio.titulo);
                        }
                      }}
                    >
                      <acao.icon className="h-4 w-4 mr-2" />
                      {acao.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Card de Ações Rápidas */}
        <Card className="bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900 dark:to-transparent">
          <CardHeader>
            <CardTitle className="text-base">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleGerarRelatorio('Todos os Relatórios')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Tudo (ZIP)
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleGerarRelatorio('Resumo Executivo')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Resumo Executivo
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Página
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => navigate('/comercial/dashboard')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Ver Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sobre os Relatórios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Formatos Disponíveis</h4>
                <ul className="space-y-1">
                  <li>• <strong>PDF:</strong> Formato profissional GMX com bordas e rodapé</li>
                  <li>• <strong>Excel:</strong> Planilhas editáveis com fórmulas</li>
                  <li>• <strong>Impressão:</strong> Otimizada para papel A4</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Recursos</h4>
                <ul className="space-y-1">
                  <li>• Filtros por período personalizáveis</li>
                  <li>• Análises comparativas entre orçamentos</li>
                  <li>• Curva ABC automática de consumíveis</li>
                  <li>• Exportação em lote (ZIP)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RelatoriosPage;
