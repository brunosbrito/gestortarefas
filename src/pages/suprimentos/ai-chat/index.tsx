import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  AlertCircle,
  TrendingUp,
  DollarSign,
  FileText,
  Target,
} from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        'Olá! Eu sou o Assistente de Custos com IA. Como posso ajudá-lo a otimizar seus custos hoje?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    // Mock AI response
    const aiResponse: Message = {
      id: messages.length + 2,
      role: 'assistant',
      content:
        'Esta é uma resposta simulada. A funcionalidade de IA requer configuração do backend com API Key da OpenAI.',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage, aiResponse]);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    {
      icon: TrendingUp,
      label: 'Analisar tendências de custos',
      action: 'Quais são as principais tendências de custos nos últimos 3 meses?',
    },
    {
      icon: DollarSign,
      label: 'Identificar economia',
      action: 'Onde posso economizar custos neste contrato?',
    },
    {
      icon: FileText,
      label: 'Resumir contrato',
      action: 'Faça um resumo executivo do contrato mais recente',
    },
    {
      icon: Target,
      label: 'Sugerir otimizações',
      action: 'Sugira otimizações para reduzir custos operacionais',
    },
  ];

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
        <p className="text-muted-foreground">
          Assistente inteligente para análise e otimização de custos
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
        {/* Main Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-500" />
                <CardTitle>Chat com IA</CardTitle>
                <Badge variant="outline" className="ml-auto">
                  Demo Mode
                </Badge>
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
                      <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
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

        {/* Sidebar */}
        <div className="space-y-6">
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
                  <p className="text-sm font-medium">Análise de Contratos</p>
                  <p className="text-xs text-muted-foreground">
                    Insights sobre performance e custos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">Otimização de Custos</p>
                  <p className="text-xs text-muted-foreground">
                    Sugestões para reduzir despesas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">Análise Preditiva</p>
                  <p className="text-xs text-muted-foreground">
                    Previsões de custos futuros
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">Recomendações</p>
                  <p className="text-xs text-muted-foreground">
                    Melhores práticas e alertas
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
                analisar seus dados de custos e fornecer insights acionáveis.
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
