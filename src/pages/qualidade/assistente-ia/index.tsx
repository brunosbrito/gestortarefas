import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Settings, Send, Bot, User, Loader2, Sparkles, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { openaiService } from '@/services/OpenAIService';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useUser } from '@/components/layout/useUser';
import DashboardQualidadeService from '@/services/DashboardQualidadeService';
import RncService from '@/services/NonConformityService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Sugestões de perguntas pré-definidas
const SUGGESTED_QUESTIONS = [
  {
    icon: TrendingUp,
    text: "Qual a tendência de RNCs nos últimos 6 meses?",
    color: "text-blue-600"
  },
  {
    icon: AlertCircle,
    text: "Quais são as principais causas de não-conformidades?",
    color: "text-orange-600"
  },
  {
    icon: CheckCircle,
    text: "Qual a taxa de conformidade das inspeções este mês?",
    color: "text-green-600"
  },
  {
    icon: Clock,
    text: "Quantas ações corretivas estão atrasadas?",
    color: "text-red-600"
  }
];

function AssistenteIAQualidade() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [assistantId, setAssistantId] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useUser();

  // Função para obter chave de storage das mensagens por usuário
  const getMessagesStorageKey = () => {
    return user ? `chat_messages_qualidade_${user.id}` : "chat_messages_qualidade_guest";
  };

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedApiKey = localStorage.getItem('openai_api_key');
    const savedAssistantId = localStorage.getItem('openai_assistant_id');

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedAssistantId) setAssistantId(savedAssistantId);
  }, []);

  // Resetar thread e limpar mensagens toda vez que a tela é aberta
  useEffect(() => {
    if (user) {
      // Resetar thread do usuário
      openaiService.resetUserThread(`qualidade_${user.id.toString()}`);
      // Limpar mensagens do chat
      setMessages([]);
      localStorage.removeItem(getMessagesStorageKey());
    }
  }, [user]);

  useEffect(() => {
    // Auto scroll para a última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Salvar mensagens no localStorage por usuário
    if (messages.length > 0 && user) {
      localStorage.setItem(getMessagesStorageKey(), JSON.stringify(messages));
    }
  }, [messages, user]);

  const saveConfig = () => {
    if (!apiKey.trim() || !assistantId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('openai_assistant_id', assistantId);
    setIsConfigOpen(false);

    toast({
      title: "Configurações salvas",
      description: "API Key e Assistant ID foram salvos com sucesso"
    });
  };

  // Função para coletar contexto de dados de qualidade
  const getQualidadeContext = async () => {
    try {
      // Buscar métricas do dashboard
      const metricas = await DashboardQualidadeService.getMetrics();

      // Buscar todas as RNCs
      const rncs = await RncService.getAllRnc();

      // Construir contexto rico
      const context = `
      CONTEXTO DE DADOS DE QUALIDADE (GMX Industrial):

      MÉTRICAS GERAIS:
      - Total de RNCs: ${metricas.rncs?.total || 0}
      - RNCs Abertas: ${metricas.rncs?.abertas || 0}
      - RNCs Resolvidas: ${metricas.rncs?.resolvidas || 0}
      - Taxa de Resolução: ${metricas.rncs?.taxaResolucao || 0}%
      - Tempo Médio de Resolução: ${metricas.rncs?.tempoMedioResolucao || 0} dias

      INSPEÇÕES:
      - Total: ${metricas.inspecoes?.total || 0}
      - Aprovadas: ${metricas.inspecoes?.aprovadas || 0}
      - Aprovadas com Ressalvas: ${metricas.inspecoes?.aprovadasComRessalvas || 0}
      - Reprovadas: ${metricas.inspecoes?.reprovadas || 0}
      - Taxa de Conformidade: ${metricas.inspecoes?.taxaConformidade || 0}%

      CERTIFICADOS:
      - Total: ${metricas.certificados?.total || 0}
      - Pendentes: ${metricas.certificados?.pendentes || 0}
      - Recebidos: ${metricas.certificados?.recebidos || 0}
      - Enviados: ${metricas.certificados?.enviados || 0}
      - Próximos do Prazo: ${metricas.certificados?.proximosPrazo || 0}

      CALIBRAÇÃO:
      - Total de Equipamentos: ${metricas.calibracao?.equipamentosTotal || 0}
      - Em Dia: ${metricas.calibracao?.emDia || 0}
      - Próximo do Vencimento: ${metricas.calibracao?.proximoVencimento || 0}
      - Vencidos: ${metricas.calibracao?.vencidos || 0}

      AÇÕES CORRETIVAS:
      - Total: ${metricas.acoesCorretivas?.total || 0}
      - Abertas: ${metricas.acoesCorretivas?.abertas || 0}
      - Concluídas: ${metricas.acoesCorretivas?.concluidas || 0}
      - Atrasadas: ${metricas.acoesCorretivas?.atrasadas || 0}
      - Taxa de Eficácia: ${metricas.acoesCorretivas?.taxaEficacia || 0}%

      RNCs RECENTES (últimas 5):
      ${rncs.slice(0, 5).map((rnc, idx) => `
      ${idx + 1}. RNC #${String(rnc.code).padStart(3, '0')}
         - Descrição: ${rnc.description}
         - Projeto: ${rnc.project?.name || 'N/A'}
         - Identificado por: ${rnc.responsibleIdentification?.name || 'N/A'}
         - Data: ${rnc.dateOccurrence}
         - Status: ${rnc.dateConclusion ? 'Finalizada' : 'Em Andamento'}
      `).join('\n')}

      INSTRUÇÕES IMPORTANTES:
      - Você é um assistente especializado em QUALIDADE (ISO 9001)
      - Analise estes dados para responder às perguntas do usuário
      - Forneça insights acionáveis e sugestões práticas
      - Se identificar tendências preocupantes, alerte o usuário
      - Sugira ações corretivas baseadas em boas práticas
      - Use linguagem profissional mas acessível
      - Sempre contextualize suas respostas com os dados fornecidos
      `;

      return context;
    } catch (error) {
      console.error('Erro ao coletar contexto de qualidade:', error);
      return 'AVISO: Não foi possível carregar dados de qualidade. Responda com base em conhecimento geral sobre gestão da qualidade.';
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();

    if (!textToSend || !user) return;

    if (!apiKey || !assistantId) {
      toast({
        title: "Configuração necessária",
        description: "Configure sua API Key e Assistant ID primeiro",
        variant: "destructive"
      });
      setIsConfigOpen(true);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Coletar contexto de qualidade
      const context = await getQualidadeContext();

      // Enriquecer mensagem com contexto
      const enrichedMessage = `${context}\n\nPERGUNTA DO USUÁRIO:\n${textToSend}`;

      const response = await openaiService.sendMessage(
        enrichedMessage,
        apiKey,
        assistantId,
        `qualidade_${user.id.toString()}`
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao comunicar com o assistente. Verifique suas configurações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (user) {
      localStorage.removeItem(getMessagesStorageKey());
      openaiService.resetUserThread(`qualidade_${user.id.toString()}`);
    }
    toast({
      title: "Chat limpo",
      description: "Todas as mensagens foram removidas e thread resetada"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const isConfigured = apiKey && assistantId;

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex flex-col max-w-6xl mx-auto">
        {/* Header fixo */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                Assistente IA - Qualidade
                <Badge variant="secondary" className="text-xs">Especializado</Badge>
              </h1>
              <p className="text-muted-foreground">
                Análises avançadas, insights e sugestões inteligentes para o módulo de qualidade
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isConfigured ? "default" : "destructive"}>
              {isConfigured ? "Configurado" : "Não configurado"}
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
                  <DialogTitle>Configurações do Assistente IA</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apiKey">API Key da OpenAI</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="assistantId">Assistant ID</Label>
                    <Input
                      id="assistantId"
                      value={assistantId}
                      onChange={(e) => setAssistantId(e.target.value)}
                      placeholder="asst_..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveConfig} className="flex-1">
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearChat}
                      className="flex-1"
                    >
                      Limpar Chat
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Chat container com altura flexível */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Conversa
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Área de mensagens com scroll */}
            <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
              <div className="space-y-4 py-4">
                {messages.length === 0 && (
                  <div className="space-y-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <p className="font-semibold text-lg text-foreground">Assistente IA Especializado em Qualidade</p>
                      <p className="text-sm mt-2">
                        Faça perguntas sobre RNCs, inspeções, certificados, calibração e muito mais.
                      </p>
                      <p className="text-xs mt-1 text-muted-foreground">
                        Suas perguntas são enriquecidas com dados em tempo real do sistema.
                      </p>
                    </div>

                    {/* Sugestões de perguntas */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-center text-muted-foreground">
                        Sugestões de perguntas:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {SUGGESTED_QUESTIONS.map((suggestion, idx) => {
                          const Icon = suggestion.icon;
                          return (
                            <Button
                              key={idx}
                              variant="outline"
                              className="h-auto py-3 px-4 justify-start text-left hover:bg-accent"
                              onClick={() => handleSuggestedQuestion(suggestion.text)}
                              disabled={!isConfigured}
                            >
                              <Icon className={`w-4 h-4 mr-2 flex-shrink-0 ${suggestion.color}`} />
                              <span className="text-sm">{suggestion.text}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analisando dados e gerando insights...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input fixo na parte inferior */}
            <div className="border-t p-4 flex-shrink-0 bg-card">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Pergunte sobre RNCs, tendências, causas raiz, inspeções, certificados..."
                  className="min-h-[60px] max-h-32 resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="self-end flex-shrink-0 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {!isConfigured && (
                <p className="text-sm text-muted-foreground mt-2">
                  Configure sua API Key e Assistant ID nas configurações para começar
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default AssistenteIAQualidade;
