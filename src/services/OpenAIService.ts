import { getAllActivities } from './ActivityService';
import ObrasService from './ObrasService';
import { getAllServiceOrders } from './ServiceOrderService';
import ColaboradorService from './ColaboradorService';
import TarefaMacroService from './TarefaMacroService';
import ProcessService from './ProcessService';

class OpenAIService {
  private async collectContextData(userMessage: string): Promise<string> {
    let contextData = '';
    const message = userMessage.toLowerCase();

    try {
      // Verificar se a pergunta é sobre atividades
      if (message.includes('atividade') || message.includes('atividades') || message.includes('tarefa')) {
        const activities = await getAllActivities();
        contextData += `ATIVIDADES DO SISTEMA:\n${JSON.stringify(activities, null, 2)}\n\n`;
      }

      // Verificar se a pergunta é sobre projetos/obras
      if (message.includes('projeto') || message.includes('projetos') || message.includes('obra') || message.includes('obras')) {
        const projects = await ObrasService.getAllObras();
        contextData += `PROJETOS/OBRAS DO SISTEMA:\n${JSON.stringify(projects, null, 2)}\n\n`;
      }

      // Verificar se a pergunta é sobre ordens de serviço
      if (message.includes('ordem') || message.includes('serviço') || message.includes('os')) {
        const serviceOrders = await getAllServiceOrders();
        contextData += `ORDENS DE SERVIÇO DO SISTEMA:\n${JSON.stringify(serviceOrders, null, 2)}\n\n`;
      }

      // Verificar se a pergunta é sobre colaboradores
      if (message.includes('colaborador') || message.includes('colaboradores') || message.includes('funcionário') || message.includes('funcionários')) {
        const colaboradores = await ColaboradorService.getAllColaboradores();
        contextData += `COLABORADORES DO SISTEMA:\n${JSON.stringify(colaboradores, null, 2)}\n\n`;
      }

      // Verificar se a pergunta é sobre tarefas macro
      if (message.includes('tarefa macro') || message.includes('tarefas macro') || message.includes('macro')) {
        const tarefasMacro = await TarefaMacroService.getAll();
        contextData += `TAREFAS MACRO DO SISTEMA:\n${JSON.stringify(tarefasMacro.data, null, 2)}\n\n`;
      }

      // Verificar se a pergunta é sobre processos
      if (message.includes('processo') || message.includes('processos')) {
        const processos = await ProcessService.getAll();
        contextData += `PROCESSOS DO SISTEMA:\n${JSON.stringify(processos.data, null, 2)}\n\n`;
      }

    } catch (error) {
      console.error('Erro ao coletar dados de contexto:', error);
      contextData += 'ERRO: Não foi possível coletar alguns dados do sistema.\n\n';
    }

    return contextData;
  }

  async sendMessage(message: string, apiKey: string, assistantId: string): Promise<string> {
    try {
      // Coletar dados de contexto baseado na mensagem
      const contextData = await this.collectContextData(message);

      // Criar thread
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });

      if (!threadResponse.ok) {
        throw new Error('Erro ao criar thread');
      }

      const thread = await threadResponse.json();

      // Adicionar mensagem com contexto
      const messageBody = contextData 
        ? `CONTEXTO DO SISTEMA:\n${contextData}\n\nPERGUNTA DO USUÁRIO:\n${message}` 
        : message;

      await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: messageBody
        })
      });

      // Executar assistente
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: assistantId
        })
      });

      if (!runResponse.ok) {
        throw new Error('Erro ao executar assistente');
      }

      const run = await runResponse.json();

      // Aguardar conclusão
      let runStatus = run;
      while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (!statusResponse.ok) {
          throw new Error('Erro ao verificar status');
        }

        runStatus = await statusResponse.json();
      }

      if (runStatus.status !== 'completed') {
        throw new Error(`Execução falhou com status: ${runStatus.status}`);
      }

      // Buscar resposta
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!messagesResponse.ok) {
        throw new Error('Erro ao buscar mensagens');
      }

      const messages = await messagesResponse.json();
      const assistantMessage = messages.data.find((msg: any) => msg.role === 'assistant');
      
      if (!assistantMessage || !assistantMessage.content || !assistantMessage.content[0]) {
        throw new Error('Resposta do assistente não encontrada');
      }

      return assistantMessage.content[0].text.value;

    } catch (error) {
      console.error('Erro no serviço OpenAI:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro desconhecido na comunicação com OpenAI');
    }
  }
}

export const openaiService = new OpenAIService();