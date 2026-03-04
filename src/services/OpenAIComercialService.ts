import axios from 'axios';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';

export interface ItemMaterial {
  codigo: string;
  descricao: string;
  material: string;
  quantidade: number;
  unidade: string;
  peso?: number;
  valorUnitario: number;
  _status?: 'ok' | 'aviso' | 'erro';
}

export interface StoredChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string — converter com new Date() ao exibir
}

const SYSTEM_PROMPT = `Você é um assistente especializado em orçamentos industriais e estruturais da empresa GMX Soluções Industriais.
Você tem acesso aos dados dos orçamentos do sistema (fornecidos como contexto em cada mensagem).
Suas competências:
- Análise de custos diretos, BDI e margens por composição
- Interpretação de DRE (receita líquida, margem bruta/líquida)
- Análise QQP (Quantidade, Qualidade, Prazo) de suprimentos e cliente
- Identificação de riscos de margem e recomendações de ajuste de BDI
- Comparação entre orçamentos
- Estruturação de listas de materiais extraídas de documentos de projetos
- Identificação de oportunidades de redução de custos e aumento de lucratividade

Responda sempre em português brasileiro. Use formatação clara com marcadores quando listar dados.
Para valores monetários, use o formato R$ 1.500,00.
Para percentuais, use o formato 25,0%.`;

const VALID_UNITS = ['kg', 't', 'm', 'm2', 'm3', 'un', 'pc', 'cj', 'vb', 'l', 'bbl', 'cx', 'fardo', ''];
const MAX_HISTORY = 20;

const MATERIAL_EXTRACTION_SYSTEM_PROMPT = `Você extrai listas de materiais de documentos de engenharia brasileiros.
Retorne JSON com campo "itens" sendo um array de objetos com EXATAMENTE estes campos:
- codigo: string (código do item, pode ser "" se não encontrado)
- descricao: string (OBRIGATÓRIO — descrição completa do material/item)
- material: string (especificação técnica: ASTM A36, AISI 304, NBR 7008, etc. — "" se não encontrado)
- quantidade: number (DEVE ser número positivo — 0 se não encontrado)
- unidade: string (use abreviações padrão: kg, t, m, m2, m3, un, pc, cj, vb, l, bbl, cx, fardo)
- peso: number (peso unitário em kg — 0 se não aplicável)
- valorUnitario: number (valor em R$ — 0 se não encontrado)

REGRAS:
- Números no formato brasileiro: "1.500,50" → 1500.50
- NÃO inclua linhas de cabeçalho, totais ou subtotais de tabela como itens
- NÃO duplique itens que aparecem em múltiplas páginas
- Se a descrição tiver especificação técnica embutida (ex: 'CHAPA 3/16" ASTM A36'), separe: descricao='CHAPA 3/16"', material='ASTM A36'
- Mantenha descricoes em MAIÚSCULAS conforme original`;

class OpenAIComercialService {
  private getHistoryKey(userId: string): string {
    return `ia_comercial_history_${userId}`;
  }

  getUserHistory(userId: string): StoredChatMessage[] {
    try {
      const stored = localStorage.getItem(this.getHistoryKey(userId));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private setUserHistory(userId: string, msgs: StoredChatMessage[]): void {
    localStorage.setItem(this.getHistoryKey(userId), JSON.stringify(msgs));
  }

  clearHistory(userId: string): void {
    localStorage.removeItem(this.getHistoryKey(userId));
  }

  async sendMessage(
    message: string,
    apiKey: string,
    userId: string,
    orcamentoContexto?: string
  ): Promise<string> {
    // ⚠ Dois tracks: API recebe contexto completo, localStorage salva apenas o texto original
    const contextualizedMessage = orcamentoContexto
      ? `Contexto do sistema:\n${orcamentoContexto}\n\n---\nMensagem do usuário: ${message}`
      : message;

    const history = this.getUserHistory(userId).slice(-MAX_HISTORY);
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: contextualizedMessage },
    ];

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        { model: 'gpt-4o', temperature: 0.3, max_tokens: 4000, messages },
        { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
      );

      const assistantContent: string = response.data.choices[0].message.content;

      // Salvar apenas a mensagem original no localStorage (nunca o contexto injetado)
      const newHistory: StoredChatMessage[] = [
        ...history,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: assistantContent, timestamp: new Date().toISOString() },
      ];
      this.setUserHistory(userId, newHistory.slice(-MAX_HISTORY));

      return assistantContent;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number } };
      const status = axiosError.response?.status;
      if (status === 404) throw new Error('Modelo gpt-4o não disponível. Verifique se sua API Key tem acesso ao gpt-4o em platform.openai.com');
      if (status === 429) throw new Error('Limite de requisições atingido. Aguarde alguns segundos e tente novamente.');
      if (status === 401) throw new Error('API Key inválida. Verifique a chave em Configurações.');
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Erro ao comunicar com a OpenAI: ${msg}`);
    }
  }

  buildOrcamentoContext(orcamento: Orcamento): string {
    const lines: string[] = [
      `=== ORÇAMENTO: ${orcamento.numero} — ${orcamento.nome} ===`,
      `Status: ${orcamento.status || 'rascunho'}`,
      `Cliente: ${orcamento.clienteNome || 'Não informado'}`,
      `Tipo: ${orcamento.tipo}`,
    ];

    if (orcamento.areaTotalM2) lines.push(`Área total: ${orcamento.areaTotalM2} m²`);
    if (orcamento.pesoTotalProjeto) lines.push(`Peso total: ${orcamento.pesoTotalProjeto} kg`);

    lines.push(
      '',
      `TOTAIS:`,
      `  Custo Direto Total: ${formatCurrency(orcamento.custoDirectoTotal)}`,
      `  BDI Total: ${formatCurrency(orcamento.bdiTotal)} (${(orcamento.bdiMedio * 100).toFixed(1)}% médio)`,
      `  Subtotal (c/ BDI): ${formatCurrency(orcamento.subtotal)}`,
      '',
      `DRE:`,
      `  Receita Líquida: ${formatCurrency(orcamento.dre.receitaLiquida)}`,
      `  Margem Bruta: ${(orcamento.dre.margemBruta * 100).toFixed(1)}%`,
      `  Margem Líquida: ${(orcamento.dre.margemLiquida * 100).toFixed(1)}%`,
      '',
      `QQP SUPRIMENTOS:`,
      `  Materiais: ${formatCurrency(orcamento.qqpSuprimentos.materiais)}`,
      `  Pintura: ${formatCurrency(orcamento.qqpSuprimentos.pintura)}`,
      `  Ferramentas: ${formatCurrency(orcamento.qqpSuprimentos.ferramentas)}`,
      `  Consumíveis: ${formatCurrency(orcamento.qqpSuprimentos.consumiveis)}`,
      `  Total: ${formatCurrency(orcamento.qqpSuprimentos.total)}`,
      '',
      `COMPOSIÇÕES:`
    );

    for (const comp of orcamento.composicoes) {
      lines.push(
        `  [${comp.nome}] BDI: ${comp.bdi.percentual.toFixed(1)}% | Custo Direto: ${formatCurrency(comp.custoDirecto)} | Subtotal: ${formatCurrency(comp.subtotal)}`
      );
      const itens = comp.itens.slice(0, 30);
      for (const item of itens) {
        lines.push(
          `    - ${item.codigo || '-'} | ${item.descricao} | ${item.quantidade} ${item.unidade} | ${formatCurrency(item.valorUnitario)}`
        );
      }
      if (comp.itens.length > 30) {
        lines.push(`    ...e mais ${comp.itens.length - 30} itens`);
      }
    }

    return lines.join('\n');
  }

  buildCarteiraContext(orcamentos: Orcamento[]): string {
    const total = orcamentos.length;
    const aprovados = orcamentos.filter(o => o.status === 'aprovado').length;
    const emAnalise = orcamentos.filter(o => o.status === 'em_analise').length;
    const valorTotal = orcamentos.reduce((sum, o) => sum + o.subtotal, 0);
    const bdiMedioGeral =
      total > 0 ? orcamentos.reduce((sum, o) => sum + o.bdiMedio, 0) / total : 0;

    const lines: string[] = [
      `=== CARTEIRA DE ORÇAMENTOS ===`,
      `Total: ${total} | Aprovados: ${aprovados} | Em análise: ${emAnalise}`,
      `Valor Total da Carteira: ${formatCurrency(valorTotal)}`,
      `BDI Médio Geral: ${(bdiMedioGeral * 100).toFixed(1)}%`,
      '',
      `ORÇAMENTOS:`,
    ];

    for (const orc of orcamentos) {
      lines.push(
        `  ${orc.numero} | ${orc.nome} | Cliente: ${orc.clienteNome || '-'} | Status: ${orc.status || 'rascunho'} | Subtotal: ${formatCurrency(orc.subtotal)} | BDI médio: ${(orc.bdiMedio * 100).toFixed(1)}%`
      );
    }

    return lines.join('\n');
  }

  async estruturarListaMaterial(texto: string, apiKey: string): Promise<ItemMaterial[]> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: MATERIAL_EXTRACTION_SYSTEM_PROMPT },
            { role: 'user', content: texto },
          ],
        },
        { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
      );

      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);
      const itens: ItemMaterial[] = parsed.itens || parsed.items || [];
      return this.validarItens(this.normalizeItens(itens));
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number } };
      const status = axiosError.response?.status;
      if (status === 401) throw new Error('API Key inválida. Verifique a chave em Configurações.');
      if (status === 429) throw new Error('Limite de requisições atingido. Aguarde alguns segundos e tente novamente.');
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Erro ao comunicar com a OpenAI: ${msg}`);
    }
  }

  async estruturarListaMaterialVision(
    pagesBase64: string[],
    apiKey: string
  ): Promise<ItemMaterial[]> {
    const promptTexto = `Analise as imagens e extraia a lista de materiais/itens de engenharia presentes.
Retorne JSON com campo "itens" sendo um array de objetos com EXATAMENTE estes campos:
- codigo: string (código do item, pode ser "" se não encontrado)
- descricao: string (OBRIGATÓRIO — descrição completa do material/item)
- material: string (especificação técnica — "" se não encontrado)
- quantidade: number (0 se não encontrado)
- unidade: string (kg, t, m, m2, m3, un, pc, cj, vb, l, bbl, cx, fardo)
- peso: number (peso unitário em kg — 0 se não aplicável)
- valorUnitario: number (valor em R$ — 0 se não encontrado)

REGRAS:
- Números no formato brasileiro: "1.500,50" → 1500.50
- NÃO inclua cabeçalhos, totais ou subtotais como itens
- NÃO duplique itens que aparecem em múltiplas páginas
- Mantenha descricoes em MAIÚSCULAS conforme original`;

    // ⚠ Formato correto da Vision API: image_url é objeto aninhado
    const imageContents = pagesBase64.slice(0, 5).map(b64 => ({
      type: 'image_url' as const,
      image_url: { url: `data:image/jpeg;base64,${b64}`, detail: 'high' as const },
    }));

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: [{ type: 'text', text: promptTexto }, ...imageContents],
            },
          ],
        },
        { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
      );

      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);
      // ⚠ Defensivo: aceitar 'itens' ou 'items'
      const itens: ItemMaterial[] = parsed.itens || parsed.items || [];
      return this.validarItens(this.normalizeItens(itens));
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number } };
      const status = axiosError.response?.status;
      if (status === 401) throw new Error('API Key inválida. Verifique a chave em Configurações.');
      if (status === 429) throw new Error('Limite de requisições atingido. Aguarde alguns segundos e tente novamente.');
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Erro ao comunicar com a OpenAI: ${msg}`);
    }
  }

  // Público para permitir normalização externa (ex: updateItem na página)
  normalizeItens(itens: ItemMaterial[]): ItemMaterial[] {
    return itens.map(item => ({
      ...item,
      codigo: (item.codigo || '').trim(),
      descricao: (item.descricao || '').trim(),
      material: (item.material || '').trim(),
      unidade: (item.unidade || '').trim().toLowerCase(),
      quantidade: item.quantidade ?? 0,
      peso: item.peso ?? 0,
      valorUnitario: item.valorUnitario ?? 0,
    }));
  }

  validarItens(itens: ItemMaterial[]): ItemMaterial[] {
    // Garante normalização antes de validar — pipeline sempre consistente
    return this.normalizeItens(itens).map(item => {
      if (!item.descricao) {
        return { ...item, _status: 'erro' as const };
      }
      if (item.quantidade === 0) {
        return { ...item, _status: 'aviso' as const };
      }
      if (!VALID_UNITS.includes(item.unidade)) {
        return { ...item, _status: 'aviso' as const };
      }
      return { ...item, _status: 'ok' as const };
    });
  }
}

export const openAIComercialService = new OpenAIComercialService();
