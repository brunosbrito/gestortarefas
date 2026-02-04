import PriorizacaoProblemaService from './PriorizacaoProblemaService';
import PlanoAcao5W2HService from './PlanoAcao5W2HService';
import DesdobramentoProblemaService from './DesdobramentoProblemaService';
import MetaSMARTService from './MetaSMARTService';
import {
  StatusDocumentoGP,
  PriorizacaoProblema,
  PlanoAcao5W2H,
  DesdobramentoProblema,
  MetaSMART,
} from '@/interfaces/GestaoProcessosInterfaces';

export interface DashboardStats {
  // Totais Gerais
  totalDocumentos: number;
  documentosPorStatus: {
    rascunho: number;
    aguardando_aprovacao: number;
    aprovado: number;
    rejeitado: number;
  };
  documentosPorFerramenta: {
    priorizacao: number;
    planosAcao: number;
    desdobramento: number;
    metas: number;
  };

  // Métricas de Progresso
  progressoMedio: number;
  documentosEmAndamento: number;
  documentosConcluidos: number;

  // Alertas
  aguardandoAprovacao: number;
  metasAtrasadas: number;
  planosAtrasados: number;

  // Distribuições para Gráficos
  distribuicaoStatus: Array<{ name: string; value: number; color: string }>;
  distribuicaoFerramenta: Array<{ name: string; value: number; color: string }>;
  progressoPorFerramenta: Array<{
    ferramenta: string;
    progresso: number;
    total: number;
  }>;

  // Timeline
  documentosRecentes: Array<{
    id: string;
    tipo: 'priorizacao' | 'plano-acao' | 'desdobramento' | 'meta';
    titulo: string;
    status: StatusDocumentoGP;
    data: string;
  }>;

  // Priorização específica
  problemasAltaPrioridade: number;
  problemasResolvendoGUT: number;

  // Planos específicos
  acoesTotais: number;
  acoesCompletadas: number;
  custoTotalPlanos: number;

  // Desdobramento específico
  causasRaizIdentificadas: number;
  totalCausas: number;

  // Metas específicas
  metasAtingidas: number;
  milestonesTotais: number;
  milestonesCompletados: number;
}

/**
 * Service para Dashboard de Gestão de Processos
 *
 * Consolida dados de todas as ferramentas:
 * - Priorização de Problemas (Matriz GUT)
 * - Planos de Ação 5W2H
 * - Desdobramento de Problemas
 * - Metas SMART
 *
 * Fornece KPIs agregados, distribuições e métricas consolidadas
 */
class DashboardGestaoProcessosService {
  /**
   * Busca estatísticas consolidadas do dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Buscar dados de todas as ferramentas em paralelo
      const [priorizacoes, planos, desdobramentos, metas] = await Promise.all([
        PriorizacaoProblemaService.getAll(),
        PlanoAcao5W2HService.getAll(),
        DesdobramentoProblemaService.getAll(),
        MetaSMARTService.getAll(),
      ]);

      // Totais gerais
      const totalDocumentos =
        priorizacoes.length + planos.length + desdobramentos.length + metas.length;

      // Por status
      const todosDocumentos = [
        ...priorizacoes,
        ...planos,
        ...desdobramentos,
        ...metas,
      ];

      const documentosPorStatus = {
        rascunho: todosDocumentos.filter((d) => d.status === 'rascunho').length,
        aguardando_aprovacao: todosDocumentos.filter(
          (d) => d.status === 'aguardando_aprovacao'
        ).length,
        aprovado: todosDocumentos.filter((d) => d.status === 'aprovado').length,
        rejeitado: todosDocumentos.filter((d) => d.status === 'rejeitado').length,
      };

      // Por ferramenta
      const documentosPorFerramenta = {
        priorizacao: priorizacoes.length,
        planosAcao: planos.length,
        desdobramento: desdobramentos.length,
        metas: metas.length,
      };

      // Progresso médio
      const planosComProgresso = planos.filter((p) => p.progressoGeral > 0);
      const metasComProgresso = metas.filter((m) => m.progresso > 0);
      const progressoTotal =
        planosComProgresso.reduce((sum, p) => sum + p.progressoGeral, 0) +
        metasComProgresso.reduce((sum, m) => sum + m.progresso, 0);
      const progressoMedio =
        planosComProgresso.length + metasComProgresso.length > 0
          ? Math.round(progressoTotal / (planosComProgresso.length + metasComProgresso.length))
          : 0;

      // Em andamento e concluídos
      const documentosEmAndamento =
        planos.filter((p) => p.progressoGeral > 0 && p.progressoGeral < 100).length +
        metas.filter((m) => m.progresso > 0 && m.progresso < 100).length;

      const documentosConcluidos =
        planos.filter((p) => p.progressoGeral === 100).length +
        metas.filter((m) => m.progresso === 100).length;

      // Alertas
      const aguardandoAprovacao = documentosPorStatus.aguardando_aprovacao;

      const metasAtrasadas = metas.filter((m) => {
        const dataFim = new Date(m.temporal.dataFim);
        return dataFim < new Date() && m.progresso < 100;
      }).length;

      const planosAtrasados = planos.filter((p) => {
        if (!p.prazoFim) return false;
        const dataFim = new Date(p.prazoFim);
        return dataFim < new Date() && p.progressoGeral < 100;
      }).length;

      // Distribuição de status
      const distribuicaoStatus = [
        {
          name: 'Rascunho',
          value: documentosPorStatus.rascunho,
          color: '#6b7280',
        },
        {
          name: 'Aguardando Aprovação',
          value: documentosPorStatus.aguardando_aprovacao,
          color: '#f59e0b',
        },
        {
          name: 'Aprovado',
          value: documentosPorStatus.aprovado,
          color: '#10b981',
        },
        {
          name: 'Rejeitado',
          value: documentosPorStatus.rejeitado,
          color: '#ef4444',
        },
      ].filter((item) => item.value > 0);

      // Distribuição por ferramenta
      const distribuicaoFerramenta = [
        {
          name: 'Priorização GUT',
          value: documentosPorFerramenta.priorizacao,
          color: '#3b82f6',
        },
        {
          name: 'Planos 5W2H',
          value: documentosPorFerramenta.planosAcao,
          color: '#8b5cf6',
        },
        {
          name: 'Desdobramento',
          value: documentosPorFerramenta.desdobramento,
          color: '#ec4899',
        },
        {
          name: 'Metas SMART',
          value: documentosPorFerramenta.metas,
          color: '#f59e0b',
        },
      ].filter((item) => item.value > 0);

      // Progresso por ferramenta
      const progressoPorFerramenta = [
        {
          ferramenta: 'Planos 5W2H',
          progresso: planos.filter((p) => p.progressoGeral === 100).length,
          total: planos.length,
        },
        {
          ferramenta: 'Metas SMART',
          progresso: metas.filter((m) => m.progresso === 100).length,
          total: metas.length,
        },
      ];

      // Documentos recentes (últimos 10)
      const documentosRecentes = [
        ...priorizacoes.map((p) => ({
          id: p.id,
          tipo: 'priorizacao' as const,
          titulo: p.titulo,
          status: p.status,
          data: p.createdAt,
        })),
        ...planos.map((p) => ({
          id: p.id,
          tipo: 'plano-acao' as const,
          titulo: p.titulo,
          status: p.status,
          data: p.createdAt,
        })),
        ...desdobramentos.map((d) => ({
          id: d.id,
          tipo: 'desdobramento' as const,
          titulo: d.titulo,
          status: d.status,
          data: d.createdAt,
        })),
        ...metas.map((m) => ({
          id: m.id,
          tipo: 'meta' as const,
          titulo: m.titulo,
          status: m.status,
          data: m.createdAt,
        })),
      ]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 10);

      // Métricas específicas de Priorização
      const problemasAltaPrioridade = priorizacoes.filter(
        (p) => p.resultado.classificacao === 'alta' || p.resultado.classificacao === 'critica'
      ).length;
      const problemasResolvendoGUT = priorizacoes.filter((p) => p.status === 'aprovado').length;

      // Métricas específicas de Planos
      const acoesTotais = planos.reduce((sum, p) => sum + p.acoesTotal, 0);
      const acoesCompletadas = planos.reduce((sum, p) => sum + p.acoesCompletadas, 0);
      const custoTotalPlanos = planos.reduce((sum, p) => sum + (p.custoTotal || 0), 0);

      // Métricas específicas de Desdobramento
      const causasRaizIdentificadas = desdobramentos.filter(
        (d) => d.causas.some((c) => c.causaRaiz)
      ).length;
      const totalCausas = desdobramentos.reduce((sum, d) => sum + d.causas.length, 0);

      // Métricas específicas de Metas
      const metasAtingidas = metas.filter((m) => m.progresso === 100).length;
      const milestonesTotais = metas.reduce((sum, m) => sum + m.temporal.milestones.length, 0);
      const milestonesCompletados = metas.reduce(
        (sum, m) =>
          sum +
          m.temporal.milestones.filter(
            (ms) => ms.status === 'concluida' || ms.status === 'verificada'
          ).length,
        0
      );

      return {
        totalDocumentos,
        documentosPorStatus,
        documentosPorFerramenta,
        progressoMedio,
        documentosEmAndamento,
        documentosConcluidos,
        aguardandoAprovacao,
        metasAtrasadas,
        planosAtrasados,
        distribuicaoStatus,
        distribuicaoFerramenta,
        progressoPorFerramenta,
        documentosRecentes,
        problemasAltaPrioridade,
        problemasResolvendoGUT,
        acoesTotais,
        acoesCompletadas,
        custoTotalPlanos,
        causasRaizIdentificadas,
        totalCausas,
        metasAtingidas,
        milestonesTotais,
        milestonesCompletados,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      throw error;
    }
  }

  /**
   * Busca documentos aguardando aprovação (para badge)
   */
  async getAguardandoAprovacaoCount(): Promise<number> {
    try {
      const [priorizacoes, planos, desdobramentos, metas] = await Promise.all([
        PriorizacaoProblemaService.getAll(),
        PlanoAcao5W2HService.getAll(),
        DesdobramentoProblemaService.getAll(),
        MetaSMARTService.getAll(),
      ]);

      const todosDocumentos = [
        ...priorizacoes,
        ...planos,
        ...desdobramentos,
        ...metas,
      ];

      return todosDocumentos.filter((d) => d.status === 'aguardando_aprovacao').length;
    } catch (error) {
      console.error('Erro ao buscar contagem de aprovações:', error);
      return 0;
    }
  }
}

export default new DashboardGestaoProcessosService();
