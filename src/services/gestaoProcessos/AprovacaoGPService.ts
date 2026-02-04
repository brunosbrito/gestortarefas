import PriorizacaoProblemaService from './PriorizacaoProblemaService';
import PlanoAcao5W2HService from './PlanoAcao5W2HService';
import DesdobramentoProblemaService from './DesdobramentoProblemaService';
import MetaSMARTService from './MetaSMARTService';
import PDCAService from './PDCAService';
import {
  StatusDocumentoGP,
  AprovacaoDTO,
} from '@/interfaces/GestaoProcessosInterfaces';

export interface DocumentoAprovacao {
  id: string;
  tipo: 'priorizacao' | 'plano-acao' | 'desdobramento' | 'meta' | 'pdca';
  codigo: string;
  titulo: string;
  descricao?: string;
  status: StatusDocumentoGP;
  criadoPorId: string;
  criadoPorNome: string;
  createdAt: string;
  tipoVinculacao: string;
  obraNome?: string;
  setorNome?: string;

  // Dados específicos por tipo
  resumo?: string; // Para exibir informação contextual
}

/**
 * Service para Fila de Aprovação de Gestão de Processos
 *
 * Funcionalidades:
 * - Busca documentos aguardando aprovação de todas as ferramentas
 * - Aprovação em lote
 * - Rejeição em lote
 * - Contagem para badge de notificação
 * - Filtragem por ferramenta
 */
class AprovacaoGPService {
  /**
   * Busca todos os documentos aguardando aprovação
   */
  async getDocumentosAguardandoAprovacao(): Promise<DocumentoAprovacao[]> {
    try {
      // Buscar de todas as ferramentas em paralelo
      const [priorizacoes, planos, desdobramentos, metas, pdcas] = await Promise.all([
        PriorizacaoProblemaService.getAll(),
        PlanoAcao5W2HService.getAll(),
        DesdobramentoProblemaService.getAll(),
        MetaSMARTService.getAll(),
        PDCAService.getAll(),
      ]);

      const documentos: DocumentoAprovacao[] = [];

      // Priorização
      priorizacoes
        .filter((p) => p.status === 'aguardando_aprovacao')
        .forEach((p) => {
          documentos.push({
            id: p.id,
            tipo: 'priorizacao',
            codigo: p.codigo,
            titulo: p.titulo,
            descricao: p.descricao,
            status: p.status,
            criadoPorId: p.criadoPorId,
            criadoPorNome: p.criadoPorNome,
            createdAt: p.createdAt,
            tipoVinculacao: p.tipoVinculacao,
            obraNome: p.obraNome,
            setorNome: p.setorNome,
            resumo: `Problema: ${p.problema} | GUT: ${p.resultado.pontuacao} (${p.resultado.classificacao})`,
          });
        });

      // Planos de Ação
      planos
        .filter((p) => p.status === 'aguardando_aprovacao')
        .forEach((p) => {
          documentos.push({
            id: p.id,
            tipo: 'plano-acao',
            codigo: p.codigo,
            titulo: p.titulo,
            descricao: p.descricao,
            status: p.status,
            criadoPorId: p.criadoPorId,
            criadoPorNome: p.criadoPorNome,
            createdAt: p.createdAt,
            tipoVinculacao: p.tipoVinculacao,
            obraNome: p.obraNome,
            setorNome: p.setorNome,
            resumo: `Objetivo: ${p.objetivo} | ${p.acoesTotal} ações | Custo: R$ ${(p.custoTotal || 0).toLocaleString('pt-BR')}`,
          });
        });

      // Desdobramento
      desdobramentos
        .filter((d) => d.status === 'aguardando_aprovacao')
        .forEach((d) => {
          documentos.push({
            id: d.id,
            tipo: 'desdobramento',
            codigo: d.codigo,
            titulo: d.titulo,
            descricao: d.descricao,
            status: d.status,
            criadoPorId: d.criadoPorId,
            criadoPorNome: d.criadoPorNome,
            createdAt: d.createdAt,
            tipoVinculacao: d.tipoVinculacao,
            obraNome: d.obraNome,
            setorNome: d.setorNome,
            resumo: `Problema: ${d.problema} | ${d.causas.length} causas | ${d.efeitos.length} efeitos`,
          });
        });

      // Metas SMART
      metas
        .filter((m) => m.status === 'aguardando_aprovacao')
        .forEach((m) => {
          documentos.push({
            id: m.id,
            tipo: 'meta',
            codigo: m.codigo,
            titulo: m.titulo,
            descricao: m.descricao,
            status: m.status,
            criadoPorId: m.criadoPorId,
            criadoPorNome: m.criadoPorNome,
            createdAt: m.createdAt,
            tipoVinculacao: m.tipoVinculacao,
            obraNome: m.obraNome,
            setorNome: m.setorNome,
            resumo: `Meta: ${m.meta} | Indicador: ${m.mensuravel.indicador} (${m.mensuravel.valorAtual} → ${m.mensuravel.valorMeta} ${m.mensuravel.unidadeMedida})`,
          });
        });

      // PDCA
      pdcas
        .filter((p) => p.status === 'aguardando_aprovacao')
        .forEach((p) => {
          documentos.push({
            id: p.id,
            tipo: 'pdca',
            codigo: p.codigo,
            titulo: p.titulo,
            descricao: p.descricao,
            status: p.status,
            criadoPorId: p.criadoPorId,
            criadoPorNome: p.criadoPorNome,
            createdAt: p.createdAt,
            tipoVinculacao: p.tipoVinculacao,
            obraNome: p.obraNome,
            setorNome: p.setorNome,
            resumo: `Ciclo ${p.numeroCiclo} | Objetivo: ${p.objetivo} | Fase: ${p.faseAtual.toUpperCase()}`,
          });
        });

      // Ordenar por data de criação (mais recentes primeiro)
      return documentos.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Erro ao buscar documentos para aprovação:', error);
      throw error;
    }
  }

  /**
   * Busca contagem de documentos aguardando aprovação
   */
  async getCount(): Promise<number> {
    try {
      const documentos = await this.getDocumentosAguardandoAprovacao();
      return documentos.length;
    } catch (error) {
      console.error('Erro ao buscar contagem de aprovações:', error);
      return 0;
    }
  }

  /**
   * Aprova um documento
   */
  async aprovar(documento: DocumentoAprovacao, aprovacao: AprovacaoDTO): Promise<void> {
    try {
      switch (documento.tipo) {
        case 'priorizacao':
          await PriorizacaoProblemaService.aprovar(aprovacao);
          break;
        case 'plano-acao':
          await PlanoAcao5W2HService.aprovar(aprovacao);
          break;
        case 'desdobramento':
          await DesdobramentoProblemaService.aprovar(aprovacao);
          break;
        case 'meta':
          await MetaSMARTService.aprovar(aprovacao);
          break;
        case 'pdca':
          await PDCAService.aprovar(aprovacao);
          break;
      }
    } catch (error) {
      console.error('Erro ao aprovar documento:', error);
      throw error;
    }
  }

  /**
   * Rejeita um documento
   */
  async rejeitar(documento: DocumentoAprovacao, aprovacao: AprovacaoDTO): Promise<void> {
    try {
      switch (documento.tipo) {
        case 'priorizacao':
          await PriorizacaoProblemaService.rejeitar(aprovacao);
          break;
        case 'plano-acao':
          await PlanoAcao5W2HService.rejeitar(aprovacao);
          break;
        case 'desdobramento':
          await DesdobramentoProblemaService.rejeitar(aprovacao);
          break;
        case 'meta':
          await MetaSMARTService.rejeitar(aprovacao);
          break;
        case 'pdca':
          await PDCAService.rejeitar(aprovacao);
          break;
      }
    } catch (error) {
      console.error('Erro ao rejeitar documento:', error);
      throw error;
    }
  }

  /**
   * Aprovação em lote
   */
  async aprovarLote(
    documentos: DocumentoAprovacao[],
    aprovadorId: string,
    aprovadorNome: string
  ): Promise<{ sucessos: number; erros: number }> {
    let sucessos = 0;
    let erros = 0;

    for (const doc of documentos) {
      try {
        await this.aprovar(doc, {
          documentoId: doc.id,
          aprovadorId,
          aprovadorNome,
        });
        sucessos++;
      } catch (error) {
        console.error(`Erro ao aprovar ${doc.codigo}:`, error);
        erros++;
      }
    }

    return { sucessos, erros };
  }

  /**
   * Rejeição em lote
   */
  async rejeitarLote(
    documentos: DocumentoAprovacao[],
    aprovadorId: string,
    aprovadorNome: string,
    motivoRejeicao: string
  ): Promise<{ sucessos: number; erros: number }> {
    let sucessos = 0;
    let erros = 0;

    for (const doc of documentos) {
      try {
        await this.rejeitar(doc, {
          documentoId: doc.id,
          aprovadorId,
          aprovadorNome,
          motivoRejeicao,
        });
        sucessos++;
      } catch (error) {
        console.error(`Erro ao rejeitar ${doc.codigo}:`, error);
        erros++;
      }
    }

    return { sucessos, erros };
  }
}

export default new AprovacaoGPService();
