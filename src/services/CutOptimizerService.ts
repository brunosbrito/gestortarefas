/**
 * Serviço de Otimização de Corte
 * Implementa algoritmo FFD (First-Fit Decreasing) + Best-Fit
 * para minimizar desperdício de material
 */

import {
  PecaCorte,
  BarraCorte,
  OtimizacaoConfig,
  OtimizacaoResultado,
} from '@/interfaces/ListaCorteInterface';

class CutOptimizerService {
  /**
   * Otimiza a lista de peças usando algoritmo FFD + Best-Fit
   * @param pecas Array de peças a serem cortadas
   * @param comprimentoBarra Comprimento da barra (6000 ou 12000 mm)
   * @param tolerancia Tolerância de perda aceitável em % (padrão 5%)
   * @returns Array de barras otimizadas
   */
  otimizar(
    pecas: PecaCorte[],
    comprimentoBarra: number = 6000,
    tolerancia: number = 5
  ): BarraCorte[] {
    // 1. Expandir peças pela quantidade (1 peça de qtd=4 vira 4 peças individuais)
    const pecasExpandidas = this.expandirPecas(pecas);

    // 2. Ordenar peças por comprimento (maior → menor) - FFD
    const pecasOrdenadas = pecasExpandidas.sort(
      (a, b) => b.comprimento - a.comprimento
    );

    // 3. Inicializar array de barras
    const barras: BarraCorte[] = [];

    // 4. Para cada peça, tentar encaixar na barra com menor sobra (Best-Fit)
    for (const peca of pecasOrdenadas) {
      let barraEscolhida: BarraCorte | null = null;
      let menorSobra = Infinity;

      // Tentar encaixar em barras existentes
      for (const barra of barras) {
        const espacoDisponivel =
          barra.comprimentoTotal - this.calcularEspacoUsado(barra);
        const sobraDepois = espacoDisponivel - peca.comprimento;

        // Se cabe E resulta em menor sobra
        if (sobraDepois >= 0 && sobraDepois < menorSobra) {
          barraEscolhida = barra;
          menorSobra = sobraDepois;
        }
      }

      // Se não couber em nenhuma barra existente, criar nova
      if (!barraEscolhida) {
        const novaBarra: BarraCorte = {
          numero: barras.length + 1,
          tipo: 'Nova',
          comprimentoTotal: comprimentoBarra,
          pecas: [],
          sobra: comprimentoBarra,
          aproveitamento: 0,
        };
        barras.push(novaBarra);
        barraEscolhida = novaBarra;
      }

      // Adicionar peça à barra escolhida
      barraEscolhida.pecas.push({
        peca,
        ordem: barraEscolhida.pecas.length + 1,
      });

      // Recalcular sobra e aproveitamento
      this.atualizarBarra(barraEscolhida);
    }

    return barras;
  }

  /**
   * Expande peças pela quantidade
   * Exemplo: 1 peça com qtd=4 vira 4 peças individuais
   */
  private expandirPecas(pecas: PecaCorte[]): PecaCorte[] {
    const expandidas: PecaCorte[] = [];

    for (const peca of pecas) {
      for (let i = 0; i < peca.quantidade; i++) {
        expandidas.push({
          ...peca,
          quantidade: 1, // Cada peça expandida tem qtd=1
        });
      }
    }

    return expandidas;
  }

  /**
   * Calcula espaço total usado em uma barra
   */
  private calcularEspacoUsado(barra: BarraCorte): number {
    return barra.pecas.reduce((total, { peca }) => total + peca.comprimento, 0);
  }

  /**
   * Atualiza sobra e aproveitamento de uma barra
   */
  private atualizarBarra(barra: BarraCorte): void {
    const espacoUsado = this.calcularEspacoUsado(barra);
    barra.sobra = barra.comprimentoTotal - espacoUsado;
    barra.aproveitamento = (espacoUsado / barra.comprimentoTotal) * 100;
  }

  /**
   * Gera resumo estatístico da lista de corte
   */
  gerarResumo(barras: BarraCorte[]): OtimizacaoResultado['estatisticas'] {
    const qtdBarras = barras.length;
    const qtdPecas = barras.reduce((total, barra) => total + barra.pecas.length, 0);

    const pesoTotal = barras.reduce((total, barra) => {
      return (
        total +
        barra.pecas.reduce((sum, { peca }) => sum + peca.peso, 0)
      );
    }, 0);

    const perdaTotal = barras.reduce((total, barra) => total + barra.sobra, 0);

    const espacoTotalDisponivel = barras.reduce(
      (total, barra) => total + barra.comprimentoTotal,
      0
    );

    const aproveitamentoGeral =
      ((espacoTotalDisponivel - perdaTotal) / espacoTotalDisponivel) * 100;

    return {
      qtdBarras,
      qtdPecas,
      pesoTotal,
      aproveitamentoGeral,
      perdaTotal,
    };
  }

  /**
   * Agrupa peças por geometria/perfil
   */
  agruparPorGeometria(pecas: PecaCorte[]): Map<string, PecaCorte[]> {
    const grupos = new Map<string, PecaCorte[]>();

    for (const peca of pecas) {
      const geometria = peca.perfil;
      if (!grupos.has(geometria)) {
        grupos.set(geometria, []);
      }
      grupos.get(geometria)!.push(peca);
    }

    return grupos;
  }

  /**
   * Valida se todas as peças cabem nas barras disponíveis
   */
  validarPecas(pecas: PecaCorte[], comprimentoBarra: number): {
    valido: boolean;
    pecasInvalidas: PecaCorte[];
  } {
    const pecasInvalidas = pecas.filter(
      (peca) => peca.comprimento > comprimentoBarra
    );

    return {
      valido: pecasInvalidas.length === 0,
      pecasInvalidas,
    };
  }

  /**
   * Calcula economia de material comparando com corte não otimizado
   */
  calcularEconomia(
    barrasOtimizadas: BarraCorte[],
    pecas: PecaCorte[],
    comprimentoBarra: number
  ): {
    barrasSemOtimizacao: number;
    barrasComOtimizacao: number;
    barrasEconomizadas: number;
    percentualEconomia: number;
  } {
    // Sem otimização: 1 barra por peça (pior caso)
    const barrasSemOtimizacao = pecas.reduce(
      (total, peca) => total + peca.quantidade,
      0
    );

    const barrasComOtimizacao = barrasOtimizadas.length;
    const barrasEconomizadas = barrasSemOtimizacao - barrasComOtimizacao;
    const percentualEconomia =
      (barrasEconomizadas / barrasSemOtimizacao) * 100;

    return {
      barrasSemOtimizacao,
      barrasComOtimizacao,
      barrasEconomizadas,
      percentualEconomia,
    };
  }
}

export default new CutOptimizerService();
