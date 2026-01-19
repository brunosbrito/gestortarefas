import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  AlertCircle,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  History,
  Trash2,
  Clock,
} from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'comercial-ai-chat-history';

const AIChat = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        'Olá! Eu sou o Assistente Comercial com IA. Como posso ajudá-lo com orçamentos, propostas ou gestão de clientes hoje?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Load chat history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const sessions: ChatSession[] = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
        setChatHistory(sessions);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save current session to localStorage
  const saveCurrentSession = () => {
    if (messages.length <= 1) return;

    const sessionTitle = generateSessionTitle();
    const now = new Date();

    let updatedHistory = [...chatHistory];

    if (currentSessionId) {
      updatedHistory = updatedHistory.map((session) =>
        session.id === currentSessionId
          ? { ...session, messages, updatedAt: now, title: sessionTitle }
          : session
      );
    } else {
      const newSessionId = Date.now().toString();
      const newSession: ChatSession = {
        id: newSessionId,
        title: sessionTitle,
        messages,
        createdAt: now,
        updatedAt: now,
      };
      updatedHistory = [newSession, ...updatedHistory];
      setCurrentSessionId(newSessionId);
    }

    setChatHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const generateSessionTitle = () => {
    const firstUserMessage = messages.find((m) => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
    }
    return `Conversa ${new Date().toLocaleDateString('pt-BR')}`;
  };

  const startNewConversation = () => {
    if (messages.length > 1) {
      saveCurrentSession();
    }

    setMessages([
      {
        id: 1,
        role: 'assistant',
        content:
          'Olá! Eu sou o Assistente Comercial com IA. Como posso ajudá-lo com orçamentos, propostas ou gestão de clientes hoje?',
        timestamp: new Date(),
      },
    ]);
    setCurrentSessionId(null);
    setInputMessage('');
  };

  const loadConversation = (sessionId: string) => {
    if (messages.length > 1 && currentSessionId !== sessionId) {
      saveCurrentSession();
    }

    const session = chatHistory.find((s) => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(session.id);
      setInputMessage('');
    }
  };

  const deleteConversation = (sessionId: string) => {
    const updatedHistory = chatHistory.filter((s) => s.id !== sessionId);
    setChatHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

    if (currentSessionId === sessionId) {
      startNewConversation();
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    const aiResponse: Message = {
      id: messages.length + 2,
      role: 'assistant',
      content:
        'Esta é uma resposta simulada. A funcionalidade de IA requer configuração do backend com API Key da OpenAI.',
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage, aiResponse];
    setMessages(newMessages);
    setInputMessage('');

    setTimeout(() => {
      saveCurrentSession();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    {
      icon: FileText,
      label: 'Criar orçamento',
      action: 'Como criar um novo orçamento (QQP) com composição de custos?',
    },
    {
      icon: DollarSign,
      label: 'Calcular margem',
      action: 'Como calcular a margem de lucro ideal para uma proposta comercial?',
    },
    {
      icon: Users,
      label: 'Cadastrar cliente',
      action: 'Qual o processo para cadastrar um novo cliente com CNPJ?',
    },
    {
      icon: TrendingUp,
      label: 'Analisar propostas',
      action: 'Gere uma análise das propostas em andamento e taxa de conversão.',
    },
  ];

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Assistant - Comercial</h1>
        <p className="text-muted-foreground">
          Assistente inteligente para orçamentos, propostas e gestão comercial
        </p>
      </div>

      {/* Backend Warning Banner */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Backend Não Configurado</AlertTitle>
        <AlertDescription>
          A funcionalidade de AI Assistant requer configuração do backend com
          credenciais da API OpenAI. As respostas abaixo são simuladas para
          demonstração da interface.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area - 2/3 */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle>Chat com IA</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Demo Mode</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startNewConversation}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Conversa
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-blue-100'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-600 dark:bg-gray-400 flex items-center justify-center">
                        <User className="h-5 w-5 text-white dark:text-gray-900" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Pressione Enter para enviar • Shift+Enter para nova linha
              </p>
            </div>
          </Card>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Chat History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {chatHistory.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {chatHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhuma conversa salva</p>
                  <p className="text-xs mt-1">Inicie um chat para criar o histórico</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2 pr-4">
                    {chatHistory.map((session) => (
                      <div
                        key={session.id}
                        className={`group p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                          currentSessionId === session.id ? 'bg-muted border-primary' : ''
                        }`}
                        onClick={() => loadConversation(session.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {session.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {session.updatedAt.toLocaleDateString('pt-BR')} às{' '}
                                {session.updatedAt.toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {session.messages.length} mensagens
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(session.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleQuickAction(item.action)}
                  >
                    <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Features Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recursos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">Análise de Orçamentos</p>
                  <p className="text-xs text-muted-foreground">
                    Cálculos automáticos de BDI, tributos e DRE
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">Geração de Propostas</p>
                  <p className="text-xs text-muted-foreground">
                    Propostas profissionais formato GMX
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">Gestão de Clientes</p>
                  <p className="text-xs text-muted-foreground">
                    Integração com APIs CNPJ e CEP
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">Análise Preditiva</p>
                  <p className="text-xs text-muted-foreground">
                    Taxa de conversão e recomendações
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Sobre a IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                O Assistente de IA utiliza modelos avançados da OpenAI para
                analisar orçamentos, propostas e sugerir melhorias comerciais.
              </p>
              <p className="text-xs pt-2 border-t">
                <strong className="text-foreground">Requisitos:</strong>
                <br />
                • Backend configurado
                <br />
                • API Key OpenAI válida
                <br />• Permissões adequadas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
