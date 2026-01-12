import { AlertCircle } from 'lucide-react';

const AIChat = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center space-y-4">
      <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
      <h2 className="text-2xl font-bold">AI Assistant</h2>
      <p className="text-muted-foreground">
        Módulo em desenvolvimento - migração em andamento
      </p>
      <p className="text-xs text-muted-foreground">
        ⚠️ Requer API Key OpenAI configurada no backend
      </p>
    </div>
  </div>
);

export default AIChat;
