import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { PageContainer } from '@/components/layout/PageContainer';
import { useUser } from '@/components/layout/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Bot, Send, Settings, Loader2, Upload, FileText, BarChart2,
  Trash2, Download, Plus, AlertTriangle, Copy, X, RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import OrcamentoService from '@/services/OrcamentoService';
import { openAIComercialService, ItemMaterial, StoredChatMessage } from '@/services/OpenAIComercialService';
import { pdfImportService } from '@/services/PdfImportService';
import { dxfImportService } from '@/services/DxfImportService';
import { formatCurrency } from '@/lib/currency';
import { Orcamento } from '@/interfaces/OrcamentoInterface';

// ============================================
// TIPOS
// ============================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type ExtractionStatus = 'idle' | 'extracting' | 'structuring' | 'validating' | 'done' | 'error';

const toUiMessage = (msg: StoredChatMessage): ChatMessage => ({
  id: crypto.randomUUID(),
  role: msg.role,
  content: msg.content,
  timestamp: new Date(msg.timestamp),
});

const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  em_analise: 'Em Análise',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function AssistenteIAComercial() {
  const user = useUser();
  const location = useLocation();
  // ⚠ userId ao nível do componente — handleOrcamentoChange e sendMessage precisam dele
  const userId = user?.id?.toString() || 'guest';

  // Page state
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<Error | null>(null);

  // Orçamentos
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [orcamentoAtivo, setOrcamentoAtivo] = useState<Orcamento | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'chat' | 'importar' | 'analises'>('chat');

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Tab Importar
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>('idle');
  const [extractionMsg, setExtractionMsg] = useState('');
  const [dwgLimitado, setDwgLimitado] = useState(false);
  const [itensMaterial, setItensMaterial] = useState<ItemMaterial[]>([]);

  // Tab Análises — select local (sincroniza com orcamentoAtivo)
  const [analiseOrcamentoId, setAnaliseOrcamentoId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // EFFECT 1: dados que não dependem de user
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await OrcamentoService.getAll();
        setOrcamentos(data);

        // URL param ?orcamento=id tem prioridade sobre localStorage
        const urlOrcId = new URLSearchParams(location.search).get('orcamento');
        if (urlOrcId) {
          const orc = data.find(o => o.id === urlOrcId);
          if (orc) {
            setOrcamentoAtivo(orc);
            setAnaliseOrcamentoId(orc.id);
            localStorage.setItem('ia_comercial_orcamento_ativo_id', orc.id);
          }
        } else {
          // Restaurar da sessão anterior
          const savedOrcId = localStorage.getItem('ia_comercial_orcamento_ativo_id');
          if (savedOrcId) {
            const orc = data.find(o => o.id === savedOrcId);
            if (orc) {
              setOrcamentoAtivo(orc);
              setAnaliseOrcamentoId(orc.id);
            }
          }
        }
      } catch (err) {
        setPageError(err instanceof Error ? err : new Error('Erro ao carregar orçamentos'));
      } finally {
        setPageLoading(false);
      }
    };

    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) setApiKey(savedKey);

    // Restaurar itens extraídos
    const cached = localStorage.getItem('ia_comercial_itens_extraidos');
    if (cached) {
      try {
        const itens = JSON.parse(cached) as ItemMaterial[];
        setItensMaterial(itens);
        if (itens.length > 0) setExtractionStatus('done');
      } catch { /* JSON corrompido */ }
    }

    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // EFFECT 2: histórico do chat (depende de user)
  // ============================================
  useEffect(() => {
    if (!user) return;
    const uid = user.id?.toString() || 'guest';
    const history = openAIComercialService.getUserHistory(uid);
    setMessages(history.map(toUiMessage));
  }, [user]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persistir itens extraídos
  useEffect(() => {
    if (itensMaterial.length > 0) {
      localStorage.setItem('ia_comercial_itens_extraidos', JSON.stringify(itensMaterial));
    }
  }, [itensMaterial]);

  // ============================================
  // HANDLERS — CHAT
  // ============================================

  const handleOrcamentoChange = (orcId: string) => {
    // Limpar itens extraídos em cache — pertencem ao contexto anterior
    setItensMaterial([]);
    setExtractionStatus('idle');
    setUploadedFile(null);
    setDwgLimitado(false);
    localStorage.removeItem('ia_comercial_itens_extraidos');

    if (orcId === '__carteira__') {
      setOrcamentoAtivo(null);
      setAnaliseOrcamentoId('');
      localStorage.removeItem('ia_comercial_orcamento_ativo_id');
      setMessages([]);
      openAIComercialService.clearHistory(userId);
      toast({ title: 'Modo: Carteira completa', description: 'Histórico do chat foi limpo.' });
      return;
    }
    const orc = orcamentos.find(o => o.id === orcId);
    if (!orc) return;
    setOrcamentoAtivo(orc);
    setAnaliseOrcamentoId(orc.id);
    localStorage.setItem('ia_comercial_orcamento_ativo_id', orc.id);
    setMessages([]);
    openAIComercialService.clearHistory(userId);
    toast({ title: `Contexto alterado: ${orc.nome}`, description: 'Histórico do chat foi limpo.' });
  };

  const buildContexto = useCallback(
    (chipComparar = false): string => {
      if (chipComparar && orcamentoAtivo) {
        return (
          openAIComercialService.buildOrcamentoContext(orcamentoAtivo) +
          '\n\n---\n\n' +
          openAIComercialService.buildCarteiraContext(orcamentos)
        );
      }
      if (orcamentoAtivo) {
        return openAIComercialService.buildOrcamentoContext(orcamentoAtivo);
      }
      return openAIComercialService.buildCarteiraContext(orcamentos);
    },
    [orcamentoAtivo, orcamentos]
  );

  const sendMessage = async (msg?: string, contextoOverride?: string) => {
    const text = (msg ?? inputMessage).trim();
    if (!text || isLoading) return;

    if (!apiKey) {
      toast({
        title: 'Configuração necessária',
        description: 'Configure sua OpenAI API Key em Configurações.',
        variant: 'destructive',
      });
      setIsConfigOpen(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    if (!msg) setInputMessage('');
    setIsLoading(true);

    try {
      const contexto = contextoOverride ?? buildContexto();
      const response = await openAIComercialService.sendMessage(text, apiKey, userId, contexto);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      toast({
        title: 'Erro ao comunicar com a IA',
        description: err instanceof Error ? err.message : 'Erro desconhecido.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (chipText: string, comparar = false) => {
    if (chipText === 'Extraia Lista de Materiais') {
      setActiveTab('importar');
      toast({ title: 'Importe um arquivo PDF, DXF ou DWG para extrair a lista de materiais.' });
      return;
    }
    sendMessage(chipText, buildContexto(comparar));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLimparHistorico = () => {
    setMessages([]);
    openAIComercialService.clearHistory(userId);
    toast({ title: 'Histórico limpo.' });
  };

  const handleSaveConfig = () => {
    if (!apiKey.trim()) {
      toast({ title: 'Preencha a API Key', variant: 'destructive' });
      return;
    }
    localStorage.setItem('openai_api_key', apiKey);
    setIsConfigOpen(false);
    toast({ title: 'Configurações salvas.' });
  };

  // ============================================
  // HANDLERS — IMPORTAR
  // ============================================

  const processFile = async (file: File) => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast({ title: 'Arquivo muito grande (máx 20MB)', variant: 'destructive' });
      return;
    }

    setUploadedFile(file);
    setDwgLimitado(false);
    setItensMaterial([]);
    setExtractionStatus('idle');
    setExtractionMsg('');

    if (!apiKey) {
      toast({
        title: 'Configure a API Key antes de extrair',
        variant: 'destructive',
      });
      setIsConfigOpen(true);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
      let itens: ItemMaterial[] = [];

      if (ext === 'pdf') {
        setExtractionStatus('extracting');
        setExtractionMsg('Extraindo texto do PDF...');
        const text = await pdfImportService.extractText(file);

        if (pdfImportService.hasTextLayer(text)) {
          setExtractionStatus('structuring');
          setExtractionMsg('Estruturando com IA...');
          itens = await openAIComercialService.estruturarListaMaterial(text, apiKey);
        } else {
          setExtractionMsg('PDF escaneado detectado — usando visão computacional...');
          const totalPages = await pdfImportService.getPageCount(file);

          let pageNums: number[];
          if (totalPages <= 3) {
            pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);
          } else {
            pageNums = [1, 2, 3, totalPages];
          }
          if (totalPages > 30) {
            toast({
              title: 'PDF grande detectado',
              description: 'Analisando apenas as primeiras páginas e a última.',
            });
          }

          setExtractionMsg('Renderizando páginas...');
          const pages = await pdfImportService.renderMultiplePagesToBase64(file, pageNums);

          setExtractionStatus('structuring');
          setExtractionMsg('Analisando imagens com IA...');
          itens = await openAIComercialService.estruturarListaMaterialVision(pages, apiKey);
        }
      } else if (ext === 'dxf') {
        setExtractionStatus('extracting');
        setExtractionMsg('Interpretando arquivo DXF...');
        const text = await dxfImportService.parseDxf(file);

        setExtractionStatus('structuring');
        setExtractionMsg('Estruturando com IA...');
        itens = await openAIComercialService.estruturarListaMaterial(text, apiKey);
      } else if (ext === 'dwg') {
        setExtractionStatus('extracting');
        setExtractionMsg('Tentando extrair texto do DWG (modo experimental)...');
        const { text } = await dxfImportService.tryExtractDwgText(file);
        setDwgLimitado(true);

        setExtractionStatus('structuring');
        setExtractionMsg('Estruturando com IA...');
        itens = await openAIComercialService.estruturarListaMaterial(text, apiKey);
      } else {
        toast({ title: 'Formato não suportado. Use PDF, DXF ou DWG.', variant: 'destructive' });
        return;
      }

      setExtractionStatus('validating');
      setExtractionMsg('Validando itens...');
      // validação já foi aplicada pelo service

      if (itens.length === 0) {
        setExtractionStatus('error');
        setExtractionMsg('Nenhum item encontrado.');
      } else {
        const avisos = itens.filter(i => i._status === 'aviso').length;
        const erros = itens.filter(i => i._status === 'erro').length;
        setExtractionStatus('done');
        setExtractionMsg(
          `Concluído: ${itens.length} itens encontrados` +
          (avisos > 0 ? ` (${avisos} avisos` : '') +
          (erros > 0 ? `, ${erros} erros)` : avisos > 0 ? ')' : '')
        );
        setItensMaterial(itens);
      }
    } catch (err) {
      setExtractionStatus('error');
      setExtractionMsg(err instanceof Error ? err.message : 'Erro na extração.');
      toast({
        title: 'Erro na extração',
        description: err instanceof Error ? err.message : 'Erro desconhecido.',
        variant: 'destructive',
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleNovaExtracao = () => {
    setUploadedFile(null);
    setItensMaterial([]);
    setExtractionStatus('idle');
    setExtractionMsg('');
    setDwgLimitado(false);
    localStorage.removeItem('ia_comercial_itens_extraidos');
  };

  const updateItem = (index: number, field: keyof ItemMaterial, value: string | number) => {
    setItensMaterial(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // Re-validar
      const revalidated = openAIComercialService.validarItens([updated[index]]);
      updated[index] = revalidated[0];
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItensMaterial(prev => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    const newItem: ItemMaterial = {
      codigo: '',
      descricao: '',
      material: '',
      quantidade: 0,
      unidade: 'un',
      peso: 0,
      valorUnitario: 0,
      _status: 'aviso',
    };
    setItensMaterial(prev => [...prev, newItem]);
  };

  const handleBaixarExcelAbaMateriais = () => {
    const rows = itensMaterial.map(item => ({
      'Código': item.codigo,
      'Descrição': item.descricao,
      'Material': item.material,
      'Qtd': item.quantidade,
      'Unidade': item.unidade,
      'Peso unitário (kg)': item.peso ?? 0,
      'Preço Unitário (R$)': item.valorUnitario,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Materiais');
    const date = new Date().toISOString().slice(0, 10);
    const name = uploadedFile?.name.replace(/\.[^.]+$/, '') || 'lista';
    XLSX.writeFile(wb, `lista_materiais_${name}_${date}.xlsx`);
  };

  const handleBaixarExcelPintura = () => {
    const rows = itensMaterial.map(item => ({
      'Código': item.codigo,
      'Descrição': item.descricao,
      'Qtd': item.quantidade,
      'Unidade': item.unidade,
      'Valor Unitário (R$)': item.valorUnitario,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pintura');
    const date = new Date().toISOString().slice(0, 10);
    const name = uploadedFile?.name.replace(/\.[^.]+$/, '') || 'lista';
    XLSX.writeFile(wb, `lista_pintura_${name}_${date}.xlsx`);
  };

  const handleEnviarAoChatAnalise = async () => {
    const fileName = uploadedFile?.name || 'arquivo';
    const summaryMsg = `Extraí ${itensMaterial.length} itens do arquivo ${fileName}. Analise e identifique inconsistências.`;
    const itensSemStatus = itensMaterial.map(({ _status, ...rest }) => rest);
    const fullJsonContext = `Lista de materiais extraída do arquivo ${fileName}:\n${JSON.stringify(itensSemStatus, null, 2)}`;

    setActiveTab('chat');
    try {
      await sendMessage(summaryMsg, fullJsonContext);
    } catch (err) {
      toast({
        title: 'Erro ao enviar para o chat',
        description: err instanceof Error ? err.message : 'Erro desconhecido.',
        variant: 'destructive',
      });
    }
  };

  // ============================================
  // DADOS — ANÁLISES
  // ============================================

  const totalOrcamentos = orcamentos.length;
  const aprovados = orcamentos.filter(o => o.status === 'aprovado').length;
  const valorCarteira = orcamentos.reduce((s, o) => s + o.subtotal, 0);
  const bdiMedioGlobal =
    totalOrcamentos > 0
      ? orcamentos.reduce((s, o) => s + o.bdiMedio, 0) / totalOrcamentos
      : 0;

  const top10 = [...orcamentos]
    .sort((a, b) => b.subtotal - a.subtotal)
    .slice(0, 10)
    .map(o => ({
      nome: o.nome.length > 20 ? o.nome.slice(0, 20) + '…' : o.nome,
      custoDirecto: o.custoDirectoTotal,
      bdiValor: o.bdiTotal,
    }));

  const orcamentoAnalise = orcamentos.find(o => o.id === analiseOrcamentoId) ?? null;

  const composicoesPie = (orcamentoAnalise?.composicoes ?? [])
    .filter(c => c.custoDirecto > 0)
    .map(c => ({ name: c.nome, value: c.custoDirecto }));

  const composicoesBdi = (orcamentoAnalise?.composicoes ?? [])
    .filter(c => c.custoDirecto > 0)
    .map(c => ({ nome: c.nome.slice(0, 18), bdi: c.bdi.percentual }));

  // Derived
  const temErros = itensMaterial.some(i => i._status === 'erro');
  const isConfigured = !!apiKey;
  const avisos = itensMaterial.filter(i => i._status === 'aviso').length;
  const erros = itensMaterial.filter(i => i._status === 'erro').length;

  // ============================================
  // RENDER
  // ============================================

  return (
    <PageContainer loading={pageLoading} error={pageError} onRetry={() => window.location.reload()}>
        <div className="h-[calc(100vh-8rem)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Assistente IA Comercial</h1>
                <p className="text-sm text-muted-foreground">
                  Análise de orçamentos, extração de listas de materiais e KPIs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConfigured ? 'default' : 'destructive'}>
                {isConfigured ? 'Configurado' : 'Não configurado'}
              </Badge>
              <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Configurações do Assistente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="apiKey">OpenAI API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="sk-..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveConfig} className="flex-1">Salvar</Button>
                      <Button variant="outline" onClick={handleLimparHistorico} className="flex-1">
                        Limpar histórico
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={v => setActiveTab(v as typeof activeTab)}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList className="flex-shrink-0 grid grid-cols-3 w-full max-w-sm">
              <TabsTrigger value="chat"><Bot className="w-4 h-4 mr-1" />Chat</TabsTrigger>
              <TabsTrigger value="importar"><Upload className="w-4 h-4 mr-1" />Importar</TabsTrigger>
              <TabsTrigger value="analises"><BarChart2 className="w-4 h-4 mr-1" />Análises</TabsTrigger>
            </TabsList>

            {/* ============================= TAB CHAT ============================= */}
            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-4">
              {/* Seletor de orçamento */}
              <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                <Select
                  value={orcamentoAtivo?.id ?? '__carteira__'}
                  onValueChange={handleOrcamentoChange}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Analisar orçamento específico... (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__carteira__">📊 Carteira completa</SelectItem>
                    {orcamentos.map(o => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.numero} — {o.nome}
                        {o.clienteNome ? ` — ${o.clienteNome}` : ''}
                        {' '}[{STATUS_LABELS[o.status ?? 'rascunho'] ?? o.status}]
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant={orcamentoAtivo ? 'default' : 'secondary'}>
                  {orcamentoAtivo ? `Analisando: ${orcamentoAtivo.nome.slice(0, 25)}` : 'Modo: Carteira completa'}
                </Badge>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0">
                {orcamentoAtivo ? (
                  <>
                    {[
                      { label: 'Analise o BDI', comparar: false },
                      { label: 'Gere DRE resumido', comparar: false },
                      { label: 'Comparar com a carteira', comparar: true },
                      { label: 'Extraia Lista de Materiais', comparar: false },
                      { label: 'Analisar possibilidade de redução de custos', comparar: false },
                      { label: 'Analisar possibilidade de aumento de lucro', comparar: false },
                    ].map(chip => (
                      <Button
                        key={chip.label}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleQuickAction(chip.label, chip.comparar)}
                        className="text-xs"
                      >
                        {chip.label}
                      </Button>
                    ))}
                  </>
                ) : (
                  <>
                    {['Resumo da carteira', 'Orçamentos aprovados', 'Maior custo direto', 'Média de BDI global'].map(chip => (
                      <Button
                        key={chip}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleQuickAction(chip)}
                        className="text-xs"
                      >
                        {chip}
                      </Button>
                    ))}
                  </>
                )}
              </div>

              {/* Área de mensagens */}
              <Card className="flex-1 flex flex-col min-h-0">
                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  <ScrollArea className="flex-1 px-4">
                    <div className="space-y-4 py-4">
                      {messages.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Inicie uma conversa com o assistente!</p>
                          <p className="text-sm mt-2">Use os atalhos acima ou escreva sua pergunta.</p>
                        </div>
                      )}

                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                              <Bot className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}

                          <div
                            className={`max-w-[75%] rounded-lg p-3 relative group ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {msg.role === 'assistant' ? (
                              <>
                                <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                                  {msg.content}
                                </ReactMarkdown>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.content);
                                    toast({ title: 'Copiado!' });
                                  }}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                            )}
                            <p className="text-xs opacity-60 mt-1">
                              {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Assistente está pensando...</span>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="border-t p-3 flex gap-2 flex-shrink-0 bg-card">
                    <Textarea
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Pergunte sobre custos, BDI, margens, materiais..."
                      className="min-h-[52px] max-h-28 resize-none"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => sendMessage()}
                      disabled={isLoading || !inputMessage.trim()}
                      className="self-end flex-shrink-0"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============================= TAB IMPORTAR ============================= */}
            <TabsContent value="importar" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4">
                {/* Aviso DWG */}
                {uploadedFile?.name.endsWith('.dwg') && (
                  <Card className="border-amber-400 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800 dark:text-amber-300">
                          <p className="font-semibold">Suporte experimental a DWG</p>
                          <p>O formato .dwg é proprietário da Autodesk. A extração funciona parcialmente apenas em arquivos antigos (anterior ao AutoCAD 2013).</p>
                          <p className="mt-1">Para melhores resultados: no AutoCAD, use <strong>Arquivo → Salvar Como → AutoCAD 2000/LT 2000 DXF (.dxf)</strong></p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Drag-drop zone */}
                {extractionStatus === 'idle' || extractionStatus === 'error' ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                      isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/30 hover:border-primary/50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium">Arraste um arquivo ou clique para selecionar</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF, DXF, DWG — máx 20MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.dxf,.dwg"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : null}

                {/* Status da extração */}
                {extractionStatus !== 'idle' && (
                  <Card>
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {['extracting', 'structuring', 'validating'].includes(extractionStatus) && (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          )}
                          {extractionStatus === 'done' && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                          {extractionStatus === 'error' && (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{uploadedFile?.name}</p>
                            <p className="text-xs text-muted-foreground">{extractionMsg}</p>
                          </div>
                        </div>
                        {(extractionStatus === 'done' || extractionStatus === 'error') && (
                          <Button variant="outline" size="sm" onClick={handleNovaExtracao}>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Nova extração
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Aviso DWG limitado */}
                {dwgLimitado && extractionStatus !== 'idle' && (
                  <Card className="border-amber-400 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="pt-4 pb-3 flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-300">
                          Resultado parcial — DWG experimental
                        </p>
                        <p className="text-amber-700 dark:text-amber-400 mt-1">
                          O formato .dwg é proprietário da Autodesk. A extração funciona apenas parcialmente
                          em arquivos antigos (anterior ao AutoCAD 2013). Para melhores resultados, no AutoCAD
                          use <strong>Arquivo → Salvar Como → AutoCAD 2000 DXF (.dxf)</strong> e reimporte.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Estado: nenhum item encontrado */}
                {extractionStatus === 'error' && itensMaterial.length === 0 && (
                  <Card className="border-destructive/30">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Não foi possível identificar uma lista de materiais neste documento.
                        Sugestões: verifique se o arquivo contém uma tabela de materiais,
                        tente outro formato (DXF), ou envie o arquivo ao chat para análise manual.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Tabela editável */}
                {itensMaterial.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Lista de Materiais
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            {itensMaterial.length} itens
                            {avisos > 0 && <span className="text-amber-600 ml-1">· {avisos} avisos</span>}
                            {erros > 0 && <span className="text-destructive ml-1">· {erros} erros</span>}
                          </span>
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={addItem}>
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar linha
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <TooltipProvider>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-2 py-2 text-left font-medium w-20">Código</th>
                                <th className="px-2 py-2 text-left font-medium min-w-[180px]">Descrição</th>
                                <th className="px-2 py-2 text-left font-medium w-28">Material</th>
                                <th className="px-2 py-2 text-right font-medium w-16">Qtd</th>
                                <th className="px-2 py-2 text-left font-medium w-16">Unid.</th>
                                <th className="px-2 py-2 text-right font-medium w-16">Peso</th>
                                <th className="px-2 py-2 text-right font-medium w-24">Valor Unit.</th>
                                <th className="px-2 py-2 w-8"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {itensMaterial.map((item, idx) => (
                                <UITooltip key={idx} delayDuration={400}>
                                  <TooltipTrigger asChild>
                                    <tr
                                      className={`border-b hover:bg-muted/30 ${
                                        item._status === 'erro'
                                          ? 'bg-red-50 dark:bg-red-950/20'
                                          : item._status === 'aviso'
                                          ? 'bg-amber-50 dark:bg-amber-950/20'
                                          : ''
                                      }`}
                                    >
                                      <td className="px-1 py-1">
                                        <Input
                                          value={item.codigo}
                                          onChange={e => updateItem(idx, 'codigo', e.target.value)}
                                          className="h-7 text-xs border-0 bg-transparent focus-visible:ring-1 px-1"
                                        />
                                      </td>
                                      <td className="px-1 py-1">
                                        <Input
                                          value={item.descricao}
                                          onChange={e => updateItem(idx, 'descricao', e.target.value)}
                                          className="h-7 text-xs border-0 bg-transparent focus-visible:ring-1 px-1"
                                        />
                                      </td>
                                      <td className="px-1 py-1">
                                        <Input
                                          value={item.material}
                                          onChange={e => updateItem(idx, 'material', e.target.value)}
                                          className="h-7 text-xs border-0 bg-transparent focus-visible:ring-1 px-1"
                                        />
                                      </td>
                                      <td className="px-1 py-1">
                                        <Input
                                          type="number"
                                          value={item.quantidade}
                                          onChange={e => updateItem(idx, 'quantidade', Number(e.target.value))}
                                          className="h-7 text-xs border-0 bg-transparent focus-visible:ring-1 px-1 text-right"
                                        />
                                      </td>
                                      <td className="px-1 py-1">
                                        <Input
                                          value={item.unidade}
                                          onChange={e => updateItem(idx, 'unidade', e.target.value)}
                                          className="h-7 text-xs border-0 bg-transparent focus-visible:ring-1 px-1"
                                        />
                                      </td>
                                      <td className="px-1 py-1">
                                        <Input
                                          type="number"
                                          value={item.peso ?? 0}
                                          onChange={e => updateItem(idx, 'peso', Number(e.target.value))}
                                          className="h-7 text-xs border-0 bg-transparent focus-visible:ring-1 px-1 text-right"
                                        />
                                      </td>
                                      <td className="px-1 py-1">
                                        <Input
                                          type="number"
                                          value={item.valorUnitario}
                                          onChange={e => updateItem(idx, 'valorUnitario', Number(e.target.value))}
                                          className="h-7 text-xs border-0 bg-transparent focus-visible:ring-1 px-1 text-right"
                                        />
                                      </td>
                                      <td className="px-1 py-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="w-6 h-6 text-muted-foreground hover:text-destructive"
                                          onClick={() => removeItem(idx)}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </td>
                                    </tr>
                                  </TooltipTrigger>
                                  {item._status !== 'ok' && (
                                    <TooltipContent>
                                      {item._status === 'erro'
                                        ? 'Descrição obrigatória — corrija antes de exportar'
                                        : 'Quantidade zero ou unidade desconhecida — verifique o item'}
                                    </TooltipContent>
                                  )}
                                </UITooltip>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TooltipProvider>
                    </CardContent>
                  </Card>
                )}

                {/* Próximos Passos */}
                {extractionStatus === 'done' && itensMaterial.length > 0 && (
                  <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-blue-800 dark:text-blue-300">
                        Próximos Passos — Importar no Orçamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Baixe, ajuste se necessário, e importe na aba correspondente do orçamento selecionado.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <TooltipProvider>
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  variant="default"
                                  size="sm"
                                  disabled={temErros}
                                  onClick={handleBaixarExcelAbaMateriais}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Baixar Excel — AbaMateriais
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {temErros && (
                              <TooltipContent>Corrija os itens em vermelho antes de exportar</TooltipContent>
                            )}
                          </UITooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={temErros}
                                  onClick={handleBaixarExcelPintura}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Baixar Excel — Pintura/Genérico
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {temErros && (
                              <TooltipContent>Corrija os itens em vermelho antes de exportar</TooltipContent>
                            )}
                          </UITooltip>
                        </TooltipProvider>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEnviarAoChatAnalise}
                          disabled={isLoading}
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          Enviar ao Chat para análise
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* ============================= TAB ANÁLISES ============================= */}
            <TabsContent value="analises" className="flex-1 overflow-auto mt-4">
              <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground">Total Orçamentos</p>
                      <p className="text-2xl font-bold">{totalOrcamentos}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground">Valor Carteira</p>
                      <p className="text-xl font-bold">{formatCurrency(valorCarteira)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground">BDI Médio Global</p>
                      <p className="text-2xl font-bold">{(bdiMedioGlobal * 100).toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground">Aprovados</p>
                      <p className="text-2xl font-bold text-green-600">{aprovados}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráfico 1 — Top 10 */}
                {top10.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Top 10 Orçamentos — Custo Direto + BDI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={top10} layout="vertical" margin={{ left: 10, right: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            tickFormatter={v => formatCurrency(v).replace('R$\u00a0', 'R$ ')}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis type="category" dataKey="nome" width={110} tick={{ fontSize: 10 }} />
                          <Tooltip formatter={(v: number) => formatCurrency(v)} />
                          <Legend />
                          <Bar dataKey="custoDirecto" name="Custo Direto" stackId="a" fill="#3b82f6" />
                          <Bar dataKey="bdiValor" name="BDI" stackId="a" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Seletor para gráficos 2 e 3 */}
                <div className="flex items-center gap-3">
                  <Label className="text-sm whitespace-nowrap">Orçamento para análise:</Label>
                  <Select value={analiseOrcamentoId || '__none__'} onValueChange={v => setAnaliseOrcamentoId(v === '__none__' ? '' : v)}>
                    <SelectTrigger className="flex-1 max-w-sm">
                      <SelectValue placeholder="Selecione um orçamento..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Selecione —</SelectItem>
                      {orcamentos.map(o => (
                        <SelectItem key={o.id} value={o.id}>{o.numero} — {o.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {orcamentoAnalise ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Gráfico 2 — PieChart composições */}
                    {composicoesPie.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Distribuição de Custo por Composição</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                              <Pie
                                data={composicoesPie}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={90}
                                label={({ name, percent }) =>
                                  `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                              >
                                {composicoesPie.map((_, i) => (
                                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v: number) => formatCurrency(v)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Gráfico 3 — BDI por composição */}
                    {composicoesBdi.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">BDI% por Composição</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={composicoesBdi} margin={{ top: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="nome" tick={{ fontSize: 9 }} />
                              <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
                              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                              <Bar dataKey="bdi" name="BDI%" fill="#3b82f6" />
                              <ReferenceLine
                                y={25}
                                stroke="#ef4444"
                                strokeDasharray="4 4"
                                label={{ value: 'Mínimo 25%', position: 'insideTopRight', fontSize: 10, fill: '#ef4444' }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Selecione um orçamento para ver os gráficos de composições.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
    </PageContainer>
  );
}

export default AssistenteIAComercial;
