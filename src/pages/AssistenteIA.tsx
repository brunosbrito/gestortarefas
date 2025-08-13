import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Settings, Send, Bot, User, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { openaiService } from '@/services/OpenAIService';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useUser } from '@/components/layout/useUser';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function AssistenteIA() {
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
    return user ? `chat_messages_${user.id}` : "chat_messages_guest";
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
      openaiService.resetUserThread(user.id.toString());
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

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user) return;
    
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
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await openaiService.sendMessage(inputMessage.trim(), apiKey, assistantId, user.id.toString());
      
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
      openaiService.resetUserThread(user.id.toString());
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

  const isConfigured = apiKey && assistantId;

  return (
    <Layout>
      <div className="h-full flex flex-col max-w-6xl mx-auto">
        {/* Header fixo */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Assistente IA</h1>
              <p className="text-muted-foreground">
                Faça perguntas sobre atividades, projetos, ordens de serviço e colaboradores
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
                  <DialogTitle>Configurações do Assistente</DialogTitle>
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
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Comece uma conversa com o assistente!</p>
                    <p className="text-sm mt-2">
                      Você pode perguntar sobre atividades, projetos, colaboradores e muito mais.
                    </p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-primary-foreground" />
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
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Assistente está pensando...</span>
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
                  placeholder="Digite sua pergunta sobre atividades, projetos, colaboradores..."
                  className="min-h-[60px] max-h-32 resize-none"
                  disabled={isLoading}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={isLoading || !inputMessage.trim()}
                  className="self-end flex-shrink-0"
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

export default AssistenteIA;