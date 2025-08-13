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
    
    console.log('Mensagem do usuário:', userMessage);
    console.log('Mensagem processada:', message);

    try {
      // Verificar se a pergunta é sobre atividades (palavras-chave expandidas)
      if (message.includes('atividade') || message.includes('atividades') || message.includes('tarefa') || 
          message.includes('aberto') || message.includes('pendente') || message.includes('progresso') ||
          message.includes('andamento') || message.includes('finalizada') || message.includes('concluída')) {
        console.log('Coletando dados de atividades...');
        const activities = await getAllActivities();
        console.log('Atividades coletadas:', activities?.length || 0);
        
        if (activities && activities.length > 0) {
          // Formatação melhorada do contexto
          contextData += `ATIVIDADES DO SISTEMA (Total: ${activities.length}):\n`;
          contextData += `Dados das atividades em formato JSON:\n${JSON.stringify(activities, null, 2)}\n\n`;
          
          // Resumo estatístico
          const statusCount = activities.reduce((acc: any, activity: any) => {
            const status = activity.status || 'sem_status';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
          
          contextData += `RESUMO DE STATUS DAS ATIVIDADES:\n${JSON.stringify(statusCount, null, 2)}\n\n`;
        }
      }

      // Verificar se a pergunta é sobre projetos/obras
      if (message.includes('projeto') || message.includes('projetos') || message.includes('obra') || message.includes('obras')) {
        console.log('Coletando dados de projetos...');
        const projects = await ObrasService.getAllObras();
        console.log('Projetos coletados:', projects?.length || 0);
        
        if (projects && projects.length > 0) {
          contextData += `PROJETOS/OBRAS DO SISTEMA (Total: ${projects.length}):\n`;
          contextData += `${JSON.stringify(projects, null, 2)}\n\n`;
        }
      }

      // Verificar se a pergunta é sobre ordens de serviço
      if (message.includes('ordem') || message.includes('serviço') || message.includes('os')) {
        console.log('Coletando dados de ordens de serviço...');
        const serviceOrders = await getAllServiceOrders();
        console.log('Ordens de serviço coletadas:', serviceOrders?.length || 0);
        
        if (serviceOrders && serviceOrders.length > 0) {
          contextData += `ORDENS DE SERVIÇO DO SISTEMA (Total: ${serviceOrders.length}):\n`;
          contextData += `${JSON.stringify(serviceOrders, null, 2)}\n\n`;
        }
      }

      // Verificar se a pergunta é sobre colaboradores
      if (message.includes('colaborador') || message.includes('colaboradores') || message.includes('funcionário') || message.includes('funcionários')) {
        console.log('Coletando dados de colaboradores...');
        const colaboradores = await ColaboradorService.getAllColaboradores();
        console.log('Colaboradores coletados:', colaboradores?.length || 0);
        
        if (colaboradores && colaboradores.length > 0) {
          contextData += `COLABORADORES DO SISTEMA (Total: ${colaboradores.length}):\n`;
          contextData += `${JSON.stringify(colaboradores, null, 2)}\n\n`;
        }
      }

      // Verificar se a pergunta é sobre tarefas macro
      if (message.includes('tarefa macro') || message.includes('tarefas macro') || message.includes('macro')) {
        console.log('Coletando dados de tarefas macro...');
        const tarefasMacro = await TarefaMacroService.getAll();
        console.log('Tarefas macro coletadas:', tarefasMacro?.data?.length || 0);
        
        if (tarefasMacro?.data && tarefasMacro.data.length > 0) {
          contextData += `TAREFAS MACRO DO SISTEMA (Total: ${tarefasMacro.data.length}):\n`;
          contextData += `${JSON.stringify(tarefasMacro.data, null, 2)}\n\n`;
        }
      }

      // Verificar se a pergunta é sobre processos
      if (message.includes('processo') || message.includes('processos')) {
        console.log('Coletando dados de processos...');
        const processos = await ProcessService.getAll();
        console.log('Processos coletados:', processos?.data?.length || 0);
        
        if (processos?.data && processos.data.length > 0) {
          contextData += `PROCESSOS DO SISTEMA (Total: ${processos.data.length}):\n`;
          contextData += `${JSON.stringify(processos.data, null, 2)}\n\n`;
        }
      }

    } catch (error) {
      console.error('Erro ao coletar dados de contexto:', error);
      contextData += `ERRO: Não foi possível coletar alguns dados do sistema. Erro: ${error}\n\n`;
    }

    console.log('Contexto final coletado:', contextData.length > 0 ? 'SIM' : 'NÃO');
    console.log('Tamanho do contexto:', contextData.length, 'caracteres');
    
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

      // Adicionar mensagem com contexto melhorada
      const messageBody = contextData 
        ? `INSTRUÇÕES IMPORTANTES:
Você é um assistente especializado em análise de dados de um sistema de gestão de projetos e atividades.
Os dados abaixo são do sistema atual em tempo real.
Analise os dados JSON fornecidos e responda de forma precisa e detalhada.
Para perguntas sobre quantidades, conte os itens nos arrays JSON.
Para perguntas sobre status, analise os campos de status nos objetos.

${contextData}

PERGUNTA DO USUÁRIO: ${message}

Por favor, analise os dados acima e forneça uma resposta precisa baseada nas informações do sistema.` 
        : message;
      
      console.log('Mensagem final enviada para OpenAI:', messageBody.substring(0, 500) + '...');

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