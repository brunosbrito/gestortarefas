import { useState } from 'react';
import { Download, FileDown, FileSpreadsheet, FileText, Printer, ChevronDown, Scissors } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Layout from '@/components/Layout';
import ListaCorteImportService from '@/services/ListaCorteImportService';
import CutOptimizerService from '@/services/CutOptimizerService';
import ListaCortePdfService from '@/services/ListaCortePdfService';
import {
  PecaCorte,
  ListaCorteInterface,
  ListaCorteImportDTO,
} from '@/interfaces/ListaCorteInterface';

const ListaCortePage = () => {
  const { toast } = useToast();

  // Estados
  const [loading, setLoading] = useState(false);
  const [fonteEntrada, setFonteEntrada] = useState<'orcamento' | 'importar'>('importar');
  const [arquivoImportado, setArquivoImportado] = useState<File | null>(null);
  const [pecasImportadas, setPecasImportadas] = useState<PecaCorte[]>([]);
  const [metadadosImportacao, setMetadadosImportacao] = useState<{
    projeto?: string;
    cliente?: string;
    obra?: string;
  }>({});
  const [comprimentoBarra, setComprimentoBarra] = useState<6000 | 12000>(6000);
  const [tolerancia, setTolerancia] = useState<number>(5);
  const [listaGerada, setListaGerada] = useState<ListaCorteInterface | null>(null);

  const handleImportarArquivo = async (file: File) => {
    try {
      setLoading(true);
      let resultado: ListaCorteImportDTO;

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        resultado = await ListaCorteImportService.importarExcel(file);
      } else if (file.name.endsWith('.json')) {
        resultado = await ListaCorteImportService.importarJSON(file);
      } else if (file.name.endsWith('.csv')) {
        resultado = await ListaCorteImportService.importarCSV(file);
      } else {
        throw new Error('Formato de arquivo não suportado. Use .xlsx, .xls, .json ou .csv');
      }

      setPecasImportadas(resultado.pecas);
      setMetadadosImportacao({
        projeto: resultado.projeto,
        cliente: resultado.cliente,
        obra: resultado.obra,
      });
      setArquivoImportado(file);
      toast({
        title: 'Sucesso',
        description: `${resultado.pecas.length} peças importadas com sucesso!`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao importar arquivo',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGerarLista = async () => {
    try {
      setLoading(true);

      if (pecasImportadas.length === 0) {
        throw new Error('Nenhuma peça disponível para gerar lista');
      }

      // Validar peças
      const validacao = CutOptimizerService.validarPecas(
        pecasImportadas,
        comprimentoBarra
      );

      if (!validacao.valido) {
        throw new Error(
          `${validacao.pecasInvalidas.length} peça(s) excedem o comprimento da barra de ${comprimentoBarra}mm`
        );
      }

      // Aplicar algoritmo de otimização
      const barras = CutOptimizerService.otimizar(
        pecasImportadas,
        comprimentoBarra,
        tolerancia
      );

      // Gerar resumo estatístico
      const resumo = CutOptimizerService.gerarResumo(barras);

      // Detectar geometria predominante
      const geometria = CutOptimizerService.agruparPorGeometria(pecasImportadas);
      const geometriaPredominante =
        geometria.size === 1
          ? Array.from(geometria.keys())[0]
          : 'Diversos';

      const lista: ListaCorteInterface = {
        id: Date.now(),
        titulo: `Lista de Corte - ${new Date().toLocaleDateString('pt-BR')}`,
        projeto: metadadosImportacao.projeto,
        cliente: metadadosImportacao.cliente,
        obra: metadadosImportacao.obra,
        geometria: geometriaPredominante,
        comprimentoBarra,
        barras,
        qtdBarras: resumo.qtdBarras,
        qtdPecas: resumo.qtdPecas,
        pesoTotal: resumo.pesoTotal,
        pesoAproveitado: resumo.pesoTotal,
        aproveitamentoGeral: resumo.aproveitamentoGeral,
        perdaTotal: resumo.perdaTotal,
        createdAt: new Date(),
      };

      setListaGerada(lista);

      // Calcular economia
      const economia = CutOptimizerService.calcularEconomia(
        barras,
        pecasImportadas,
        comprimentoBarra
      );

      toast({
        title: 'Lista de corte gerada com sucesso!',
        description: `Otimização: ${economia.barrasEconomizadas} barras economizadas (${economia.percentualEconomia.toFixed(1)}%)`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar lista',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBaixarTemplate = () => {
    const blob = ListaCorteImportService.gerarTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-lista-corte.xlsx';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Template baixado',
      description: 'Arquivo template-lista-corte.xlsx baixado com sucesso',
    });
  };

  const handleBaixarTemplateJSON = () => {
    const blob = ListaCorteImportService.gerarTemplateJSON();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-lista-corte.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Template JSON baixado',
      description: 'Arquivo template-lista-corte.json baixado com sucesso',
    });
  };

  const handleExportarPDF = () => {
    if (!listaGerada) return;
    const blob = ListaCortePdfService.gerarPDF(listaGerada);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-corte-${listaGerada.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'PDF gerado',
      description: 'Lista de corte exportada para PDF',
    });
  };

  const handleExportarResumoPDF = () => {
    if (!listaGerada) return;
    const blob = ListaCortePdfService.gerarPDFResumido(listaGerada);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumo-lista-corte-${listaGerada.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Resumo PDF gerado',
      description: 'Resumo da lista exportado para PDF',
    });
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="w-full px-4 py-4 space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-purple-600" />
              <div>
                <CardTitle>Lista de Corte Otimizada</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerador de mapa de corte com algoritmo de otimização FFD + Best-Fit
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Card de Configuração */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fonte de Dados */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Fonte dos Dados</Label>
              <RadioGroup
                value={fonteEntrada}
                onValueChange={(v) => setFonteEntrada(v as any)}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="importar" id="importar" />
                    <Label htmlFor="importar" className="font-normal cursor-pointer">
                      Importar arquivo de peças (Excel, JSON ou CSV)
                    </Label>
                  </div>

                  {fonteEntrada === 'importar' && (
                    <div className="ml-6 space-y-3 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <Label htmlFor="arquivo">Selecionar arquivo</Label>
                        <Input
                          id="arquivo"
                          type="file"
                          accept=".xlsx,.xls,.json,.csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImportarArquivo(file);
                          }}
                          className="mt-1"
                        />
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleBaixarTemplate}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Baixar Template Excel
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleBaixarTemplateJSON}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Baixar Template JSON
                        </Button>
                      </div>

                      {pecasImportadas.length > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                          <Badge variant="default" className="bg-green-600">
                            ✓ {pecasImportadas.length} peças importadas
                          </Badge>
                          {arquivoImportado && (
                            <span className="text-xs text-muted-foreground">
                              ({arquivoImportado.name})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Configurações de Otimização */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Parâmetros de Otimização
              </Label>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Comprimento da Barra</Label>
                  <RadioGroup
                    value={comprimentoBarra.toString()}
                    onValueChange={(v) => setComprimentoBarra(Number(v) as any)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6000" id="6m" />
                        <Label htmlFor="6m" className="font-normal cursor-pointer">
                          6 metros (6.000 mm)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="12000" id="12m" />
                        <Label htmlFor="12m" className="font-normal cursor-pointer">
                          12 metros (12.000 mm)
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="tolerancia" className="mb-2 block">
                    Tolerância de Perda (%)
                  </Label>
                  <Input
                    id="tolerancia"
                    type="number"
                    value={tolerancia}
                    onChange={(e) => setTolerancia(Number(e.target.value))}
                    min="0"
                    max="20"
                    step="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Perda aceitável por barra (recomendado: 5%)
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGerarLista}
              disabled={pecasImportadas.length === 0 || loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Gerando...' : 'Gerar Mapa de Corte Otimizado'}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Peças Importadas */}
        {pecasImportadas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Preview - {pecasImportadas.length} peças importadas
              </CardTitle>
              {metadadosImportacao.projeto && (
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                  {metadadosImportacao.projeto && (
                    <div>Projeto: {metadadosImportacao.projeto}</div>
                  )}
                  {metadadosImportacao.cliente && (
                    <div>Cliente: {metadadosImportacao.cliente}</div>
                  )}
                  {metadadosImportacao.obra && (
                    <div>Obra: {metadadosImportacao.obra}</div>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border-r">Pos</TableHead>
                      <TableHead className="border-r">Tag</TableHead>
                      <TableHead className="border-r">Fase</TableHead>
                      <TableHead className="border-r">Perfil</TableHead>
                      <TableHead className="text-right border-r">Comp (mm)</TableHead>
                      <TableHead className="text-right border-r">Qtd</TableHead>
                      <TableHead className="text-right">Peso (kg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pecasImportadas.slice(0, 10).map((peca, i) => (
                      <TableRow key={i}>
                        <TableCell className="border-r">{peca.posicao}</TableCell>
                        <TableCell className="border-r font-mono text-xs">
                          {peca.tag}
                        </TableCell>
                        <TableCell className="border-r">{peca.fase}</TableCell>
                        <TableCell className="border-r font-medium">
                          {peca.perfil}
                        </TableCell>
                        <TableCell className="text-right border-r font-mono">
                          {peca.comprimento}
                        </TableCell>
                        <TableCell className="text-right border-r">
                          {peca.quantidade}
                        </TableCell>
                        <TableCell className="text-right">
                          {peca.peso.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {pecasImportadas.length > 10 && (
                <div className="text-sm text-muted-foreground mt-2">
                  Mostrando 10 de {pecasImportadas.length} peças
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lista de Corte Gerada */}
        {listaGerada && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Corte Gerada</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportarPDF}>
                      <FileText className="mr-2 h-4 w-4" />
                      Exportar PDF Completo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportarResumoPDF}>
                      <FileText className="mr-2 h-4 w-4" />
                      Exportar Resumo PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImprimir}>
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {/* Cards de Resumo */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {listaGerada.qtdBarras}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Barras Necessárias
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {listaGerada.qtdPecas}
                    </div>
                    <div className="text-sm text-muted-foreground">Peças Totais</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-orange-600">
                      {listaGerada.aproveitamentoGeral.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Aproveitamento
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600">
                      {listaGerada.pesoTotal.toFixed(1)} kg
                    </div>
                    <div className="text-sm text-muted-foreground">Peso Total</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela Geral de Peças (Padrão GMX) */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-blue-600 text-white">
                    <TableRow>
                      <TableHead className="text-white border-r">Barra</TableHead>
                      <TableHead className="text-white border-r">Tipo</TableHead>
                      <TableHead className="text-white border-r">TAG</TableHead>
                      <TableHead className="text-white border-r">Fase</TableHead>
                      <TableHead className="text-white border-r">Pos</TableHead>
                      <TableHead className="text-white border-r">Qtd</TableHead>
                      <TableHead className="text-white border-r">Comp</TableHead>
                      <TableHead className="text-white border-r">Peso</TableHead>
                      <TableHead className="text-white border-r">Sobra</TableHead>
                      <TableHead className="text-white border-r">Status</TableHead>
                      <TableHead className="text-white border-r">QC</TableHead>
                      <TableHead className="text-white">Obs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listaGerada.barras.map((barra) =>
                      barra.pecas.map(({ peca }, idx) => (
                        <TableRow
                          key={`${barra.numero}-${idx}`}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="border-r font-medium">
                            {barra.numero}
                          </TableCell>
                          <TableCell className="border-r">
                            <Badge variant={barra.tipo === 'Nova' ? 'default' : 'secondary'}>
                              {barra.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="border-r font-mono text-xs">
                            {peca.tag}
                          </TableCell>
                          <TableCell className="border-r">{peca.fase}</TableCell>
                          <TableCell className="border-r">{peca.posicao}</TableCell>
                          <TableCell className="border-r text-right">
                            {peca.quantidade}
                          </TableCell>
                          <TableCell className="border-r text-right font-mono">
                            {peca.comprimento}mm
                          </TableCell>
                          <TableCell className="border-r text-right">
                            {peca.peso.toFixed(2)}kg
                          </TableCell>
                          <TableCell className="border-r text-right">
                            {idx === barra.pecas.length - 1 ? (
                              <span
                                className={
                                  barra.sobra > 500
                                    ? 'text-red-600 font-bold'
                                    : 'text-green-600'
                                }
                              >
                                {(barra.sobra / 1000).toFixed(2)}m
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="border-r"></TableCell>
                          <TableCell className="border-r"></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Rodapé GMX */}
              <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex gap-6">
                  <div>Operador: _________</div>
                  <div>Turno: ___</div>
                  <div>QA: _________</div>
                </div>
                <div>© GMX Soluções Industriais</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ListaCortePage;
