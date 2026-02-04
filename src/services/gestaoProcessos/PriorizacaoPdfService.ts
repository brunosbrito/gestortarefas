import { PriorizacaoProblema } from '@/interfaces/GestaoProcessosInterfaces';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Serviço para geração de PDFs de Priorização de Problemas (Matriz GUT)
 *
 * MOCK MODE: Atualmente em modo mock, apenas registra no console.
 * TODO: Implementar geração real com jsPDF quando backend estiver pronto
 *
 * Estrutura do PDF:
 * 1. Header com logo
 * 2. Título do documento
 * 3. Metadados (código, data, criador, vinculação)
 * 4. Status
 * 5. Seções:
 *    - Informações Básicas
 *    - Matriz GUT com pontuação
 *    - Justificativas
 *    - Observações
 * 6. Footer com página e data de geração
 */
class PriorizacaoPdfService {
  private useMock = true; // TODO: Alterar para false quando implementar jsPDF

  /**
   * Gera PDF individual de uma priorização
   */
  async gerarPDF(priorizacao: PriorizacaoProblema): Promise<void> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('====================================');
      console.log('📄 MOCK: Gerando PDF de Priorização');
      console.log('====================================');
      console.log('');
      console.log('HEADER:');
      console.log('  Logo: [GMX INDUSTRIAL]');
      console.log('');
      console.log('TÍTULO:');
      console.log('  PRIORIZAÇÃO DE PROBLEMA - MATRIZ GUT');
      console.log('');
      console.log('METADADOS:');
      console.log(`  Código: ${priorizacao.codigo}`);
      console.log(
        `  Data de Criação: ${format(new Date(priorizacao.createdAt), 'dd/MM/yyyy HH:mm', {
          locale: ptBR,
        })}`
      );
      console.log(`  Criado por: ${priorizacao.criadoPorNome}`);
      console.log(`  Status: ${this.getStatusLabel(priorizacao.status)}`);
      console.log('');
      console.log('VINCULAÇÃO:');
      if (priorizacao.tipoVinculacao === 'obra') {
        console.log(`  Tipo: Obra/Projeto`);
        console.log(`  Nome: ${priorizacao.obraNome}`);
      } else if (priorizacao.tipoVinculacao === 'setor') {
        console.log(`  Tipo: Setor/Departamento`);
        console.log(`  Nome: ${priorizacao.setorNome}`);
      } else {
        console.log(`  Tipo: Independente (Geral)`);
      }
      console.log('');
      console.log('INFORMAÇÕES BÁSICAS:');
      console.log(`  Título: ${priorizacao.titulo}`);
      console.log(`  Descrição: ${priorizacao.descricao || 'N/A'}`);
      console.log(`  Problema: ${priorizacao.problema}`);
      console.log(`  Área: ${priorizacao.area}`);
      console.log(`  Responsável: ${priorizacao.responsavelNome}`);
      console.log(`  Ação Imediata: ${priorizacao.acaoImediata ? 'SIM ⚠️' : 'Não'}`);
      console.log('');
      console.log('MATRIZ GUT:');
      console.log(`  Gravidade (G): ${priorizacao.criterios.gravidade}`);
      console.log(`  Urgência (U): ${priorizacao.criterios.urgencia}`);
      console.log(`  Tendência (T): ${priorizacao.criterios.tendencia}`);
      console.log(`  Pontuação (G×U×T): ${priorizacao.resultado.pontuacao}`);
      console.log(`  Classificação: ${priorizacao.resultado.classificacao.toUpperCase()}`);
      console.log(`  Ranking: #${priorizacao.resultado.ranking}`);
      console.log('');
      console.log('JUSTIFICATIVAS:');
      console.log(`  Gravidade: ${priorizacao.justificativaGravidade}`);
      console.log(`  Urgência: ${priorizacao.justificativaUrgencia}`);
      console.log(`  Tendência: ${priorizacao.justificativaTendencia}`);
      console.log('');
      if (priorizacao.observacoes) {
        console.log('OBSERVAÇÕES:');
        console.log(`  ${priorizacao.observacoes}`);
        console.log('');
      }
      if (priorizacao.aprovadorNome && priorizacao.dataAprovacao) {
        console.log('APROVAÇÃO:');
        console.log(`  Aprovador: ${priorizacao.aprovadorNome}`);
        console.log(
          `  Data: ${format(new Date(priorizacao.dataAprovacao), 'dd/MM/yyyy HH:mm', {
            locale: ptBR,
          })}`
        );
        console.log('');
      }
      console.log('FOOTER:');
      console.log(`  Página 1 de 1`);
      console.log(
        `  Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
      console.log('====================================');
      console.log('✅ PDF gerado com sucesso (MOCK)');
      console.log('====================================');

      return;
    }

    // TODO: Implementar geração real com jsPDF
    throw new Error('Geração real de PDF não implementada');
  }

  /**
   * Gera PDF consolidado com múltiplas priorizações (relatório)
   */
  async gerarRelatorio(priorizacoes: PriorizacaoProblema[]): Promise<void> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      console.log('====================================');
      console.log('📊 MOCK: Gerando Relatório de Priorizações');
      console.log('====================================');
      console.log('');
      console.log('HEADER:');
      console.log('  Logo: [GMX INDUSTRIAL]');
      console.log('');
      console.log('TÍTULO:');
      console.log('  RELATÓRIO DE PRIORIZAÇÃO DE PROBLEMAS');
      console.log('  Matriz GUT (Gravidade × Urgência × Tendência)');
      console.log('');
      console.log('RESUMO:');
      console.log(`  Total de Priorizações: ${priorizacoes.length}`);
      console.log(
        `  Críticas: ${priorizacoes.filter((p) => p.resultado.classificacao === 'critica').length}`
      );
      console.log(
        `  Altas: ${priorizacoes.filter((p) => p.resultado.classificacao === 'alta').length}`
      );
      console.log(
        `  Médias: ${priorizacoes.filter((p) => p.resultado.classificacao === 'media').length}`
      );
      console.log(
        `  Baixas: ${priorizacoes.filter((p) => p.resultado.classificacao === 'baixa').length}`
      );
      console.log('');
      console.log('RANKING (TOP 10):');
      console.log(
        '  Rank | Código           | Título                                   | G×U×T | Pontuação'
      );
      console.log(
        '  ---- | ---------------- | ---------------------------------------- | ----- | ---------'
      );

      priorizacoes
        .slice(0, 10)
        .forEach((p) => {
          const titulo = p.titulo.substring(0, 40).padEnd(40);
          const formula = `${p.criterios.gravidade}×${p.criterios.urgencia}×${p.criterios.tendencia}`.padEnd(
            5
          );
          console.log(
            `  #${String(p.resultado.ranking).padStart(2, '0')}  | ${p.codigo.padEnd(16)} | ${titulo} | ${formula} | ${String(p.resultado.pontuacao).padStart(3)}`
          );
        });

      console.log('');
      console.log('FOOTER:');
      console.log(`  Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
      console.log('====================================');
      console.log('✅ Relatório gerado com sucesso (MOCK)');
      console.log('====================================');

      return;
    }

    // TODO: Implementar geração real com jsPDF
    throw new Error('Geração real de PDF não implementada');
  }

  /**
   * Gera Excel consolidado (via mock log)
   */
  async gerarExcel(priorizacoes: PriorizacaoProblema[]): Promise<void> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('====================================');
      console.log('📗 MOCK: Gerando Excel de Priorizações');
      console.log('====================================');
      console.log('');
      console.log('PLANILHA: Priorizações');
      console.log('');
      console.log('COLUNAS:');
      console.log(
        '  Rank | Código | Título | Problema | Área | Responsável | G | U | T | Pontuação | Classificação | Status'
      );
      console.log('');
      console.log('DADOS:');
      priorizacoes.forEach((p) => {
        console.log(
          `  #${p.resultado.ranking} | ${p.codigo} | ${p.titulo} | ${p.problema.substring(0, 30)}... | ${p.area} | ${p.responsavelNome} | ${p.criterios.gravidade} | ${p.criterios.urgencia} | ${p.criterios.tendencia} | ${p.resultado.pontuacao} | ${p.resultado.classificacao} | ${this.getStatusLabel(p.status)}`
        );
      });
      console.log('');
      console.log('====================================');
      console.log('✅ Excel gerado com sucesso (MOCK)');
      console.log('====================================');

      return;
    }

    // TODO: Implementar geração real com xlsx
    throw new Error('Geração real de Excel não implementada');
  }

  /**
   * Helper para label de status
   */
  private getStatusLabel(status: string): string {
    const labels = {
      rascunho: 'Rascunho',
      aguardando_aprovacao: 'Aguardando Aprovação',
      aprovado: 'Aprovado',
      rejeitado: 'Rejeitado',
    };
    return labels[status as keyof typeof labels] || status;
  }
}

export default new PriorizacaoPdfService();
