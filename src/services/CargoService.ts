import {
  Cargo,
  CreateCargo,
  UpdateCargo,
  ConfiguracaoSalarial,
  CustosDiversos,
  CALCULOS_MO,
} from '@/interfaces/CargoInterface';

const STORAGE_KEY_CARGOS = 'gestortarefas_mock_cargos';
const STORAGE_KEY_CONFIG = 'gestortarefas_mock_config_salarial';

/**
 * Serviço para gerenciar Cargos e cálculos de Mão de Obra
 */
class CargoServiceClass {
  // ==========================================
  // CONFIGURAÇÃO SALARIAL
  // ==========================================

  /**
   * Obtém a configuração salarial (salário mínimo e percentual de encargos)
   */
  async getConfiguracao(): Promise<ConfiguracaoSalarial> {
    const stored = localStorage.getItem(STORAGE_KEY_CONFIG);

    if (stored) {
      const config = JSON.parse(stored);
      return {
        ...config,
        ultimaAtualizacao: new Date(config.ultimaAtualizacao),
      };
    }

    // Configuração padrão
    const defaultConfig: ConfiguracaoSalarial = {
      id: 'config-1',
      salarioMinimoReferencia: 1612.0, // R$ 1.612,00
      percentualEncargos: CALCULOS_MO.ENCARGOS_PADRAO, // 58.7%
      ultimaAtualizacao: new Date(),
    };

    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(defaultConfig));
    return defaultConfig;
  }

  /**
   * Atualiza a configuração salarial
   * IMPORTANTE: Recalcula todos os cargos quando o salário mínimo muda
   */
  async updateConfiguracao(
    config: Partial<ConfiguracaoSalarial>
  ): Promise<ConfiguracaoSalarial> {
    const current = await this.getConfiguracao();
    const updated: ConfiguracaoSalarial = {
      ...current,
      ...config,
      ultimaAtualizacao: new Date(),
    };

    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));

    // Se o salário mínimo mudou, recalcular todos os cargos
    if (config.salarioMinimoReferencia &&
        config.salarioMinimoReferencia !== current.salarioMinimoReferencia) {
      await this.recalcularTodosCargos();
    }

    return updated;
  }

  // ==========================================
  // CÁLCULOS AUTOMÁTICOS
  // ==========================================

  /**
   * Calcula o valor da insalubridade baseado no salário mínimo
   */
  private async calcularInsalubridade(
    grau: Cargo['grauInsalubridade']
  ): Promise<number> {
    const config = await this.getConfiguracao();
    const salarioMinimo = config.salarioMinimoReferencia;

    switch (grau) {
      case 'minimo':
        return salarioMinimo * CALCULOS_MO.INSALUBRIDADE.MINIMO; // 10%
      case 'medio':
        return salarioMinimo * CALCULOS_MO.INSALUBRIDADE.MEDIO; // 20%
      case 'maximo':
        return salarioMinimo * CALCULOS_MO.INSALUBRIDADE.MAXIMO; // 40%
      default:
        return 0;
    }
  }

  /**
   * Calcula o valor da periculosidade (30% do salário base)
   */
  private calcularPericulosidade(
    salarioBase: number,
    temPericulosidade: boolean
  ): number {
    return temPericulosidade ? salarioBase * CALCULOS_MO.PERICULOSIDADE : 0;
  }

  /**
   * Calcula o total de custos diversos
   */
  private calcularTotalCustosDiversos(custos: CustosDiversos): number {
    const { alimentacao, transporte, uniforme, despesasAdmissionais,
            assistenciaMedica, epiEpc, outros } = custos;

    const totalAlimentacao =
      alimentacao.cafeManha +
      alimentacao.almoco +
      alimentacao.janta +
      alimentacao.cestaBasica;

    return (
      totalAlimentacao +
      transporte +
      uniforme +
      despesasAdmissionais +
      assistenciaMedica +
      epiEpc +
      outros
    );
  }

  /**
   * Calcula todos os valores de um cargo
   */
  private async calcularValoresCargo(data: CreateCargo): Promise<Cargo> {
    const config = await this.getConfiguracao();

    // B) Periculosidade
    const valorPericulosidade = this.calcularPericulosidade(
      data.salarioBase,
      data.temPericulosidade
    );

    // C) Insalubridade
    const valorInsalubridade = await this.calcularInsalubridade(
      data.grauInsalubridade
    );

    // D) Total do Salário (A + B + C)
    const totalSalario =
      data.salarioBase + valorPericulosidade + valorInsalubridade;

    // E) Encargos Sociais
    const valorEncargos = totalSalario * config.percentualEncargos;

    // F) Total Custos Diversos
    const totalCustosDiversos = this.calcularTotalCustosDiversos(data.custos);

    // H) Total dos custos de MO sem BDI (D + E + F)
    const totalCustosMO = totalSalario + valorEncargos + totalCustosDiversos;

    // ★ CUSTO HH (H / G)
    const custoHH = data.horasMes > 0 ? totalCustosMO / data.horasMes : 0;

    return {
      id: '', // Será preenchido no create
      nome: data.nome,
      salarioBase: data.salarioBase,
      temPericulosidade: data.temPericulosidade,
      grauInsalubridade: data.grauInsalubridade,
      custos: data.custos,
      horasMes: data.horasMes,
      tipoContrato: data.tipoContrato,
      valorPericulosidade,
      valorInsalubridade,
      totalSalario,
      valorEncargos,
      totalCustosDiversos,
      totalCustosMO,
      custoHH: Math.round(custoHH * 100) / 100, // Arredondar para 2 casas
      categoria: data.categoria,
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      observacoes: data.observacoes,
    };
  }

  // ==========================================
  // CRUD DE CARGOS
  // ==========================================

  /**
   * Lista todos os cargos
   */
  async list(): Promise<Cargo[]> {
    const stored = localStorage.getItem(STORAGE_KEY_CARGOS);

    if (!stored) {
      return [];
    }

    const cargos = JSON.parse(stored);
    return cargos.map((c: any) => ({
      ...c,
      criadoEm: new Date(c.criadoEm),
      atualizadoEm: new Date(c.atualizadoEm),
    }));
  }

  /**
   * Busca um cargo por ID
   */
  async getById(id: string): Promise<Cargo | null> {
    const cargos = await this.list();
    return cargos.find((c) => c.id === id) || null;
  }

  /**
   * Cria um novo cargo
   */
  async create(data: CreateCargo): Promise<Cargo> {
    const cargos = await this.list();
    const novoCargo = await this.calcularValoresCargo(data);

    novoCargo.id = `cargo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    cargos.push(novoCargo);
    localStorage.setItem(STORAGE_KEY_CARGOS, JSON.stringify(cargos));

    return novoCargo;
  }

  /**
   * Atualiza um cargo existente
   */
  async update(data: UpdateCargo): Promise<Cargo> {
    const cargos = await this.list();
    const index = cargos.findIndex((c) => c.id === data.id);

    if (index === -1) {
      throw new Error('Cargo não encontrado');
    }

    const cargoAtual = cargos[index];
    const dadosAtualizados: CreateCargo = {
      nome: data.nome ?? cargoAtual.nome,
      salarioBase: data.salarioBase ?? cargoAtual.salarioBase,
      temPericulosidade: data.temPericulosidade ?? cargoAtual.temPericulosidade,
      grauInsalubridade: data.grauInsalubridade ?? cargoAtual.grauInsalubridade,
      custos: data.custos ?? cargoAtual.custos,
      horasMes: data.horasMes ?? cargoAtual.horasMes,
      tipoContrato: data.tipoContrato ?? cargoAtual.tipoContrato,
      categoria: data.categoria ?? cargoAtual.categoria,
      observacoes: data.observacoes ?? cargoAtual.observacoes,
    };

    const cargoAtualizado = await this.calcularValoresCargo(dadosAtualizados);
    cargoAtualizado.id = data.id;
    cargoAtualizado.criadoEm = cargoAtual.criadoEm;
    cargoAtualizado.atualizadoEm = new Date();

    cargos[index] = cargoAtualizado;
    localStorage.setItem(STORAGE_KEY_CARGOS, JSON.stringify(cargos));

    return cargoAtualizado;
  }

  /**
   * Deleta um cargo (soft delete - marca como inativo)
   */
  async delete(id: string): Promise<void> {
    const cargos = await this.list();
    const index = cargos.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error('Cargo não encontrado');
    }

    cargos[index].ativo = false;
    cargos[index].atualizadoEm = new Date();

    localStorage.setItem(STORAGE_KEY_CARGOS, JSON.stringify(cargos));
  }

  /**
   * Deleta permanentemente um cargo
   */
  async deletePermanente(id: string): Promise<void> {
    const cargos = await this.list();
    const filtered = cargos.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CARGOS, JSON.stringify(filtered));
  }

  /**
   * Recalcula todos os cargos (usado quando o salário mínimo muda)
   */
  private async recalcularTodosCargos(): Promise<void> {
    const cargos = await this.list();

    const cargosRecalculados = await Promise.all(
      cargos.map(async (cargo) => {
        const dadosBase: CreateCargo = {
          nome: cargo.nome,
          salarioBase: cargo.salarioBase,
          temPericulosidade: cargo.temPericulosidade,
          grauInsalubridade: cargo.grauInsalubridade,
          custos: cargo.custos,
          horasMes: cargo.horasMes,
          tipoContrato: cargo.tipoContrato,
          categoria: cargo.categoria,
          observacoes: cargo.observacoes,
        };

        const recalculado = await this.calcularValoresCargo(dadosBase);
        return {
          ...recalculado,
          id: cargo.id,
          ativo: cargo.ativo,
          criadoEm: cargo.criadoEm,
          atualizadoEm: new Date(),
        };
      })
    );

    localStorage.setItem(STORAGE_KEY_CARGOS, JSON.stringify(cargosRecalculados));
  }

  /**
   * Lista apenas cargos ativos
   */
  async listAtivos(): Promise<Cargo[]> {
    const cargos = await this.list();
    return cargos.filter((c) => c.ativo);
  }

  /**
   * Lista cargos por categoria
   */
  async listPorCategoria(
    categoria: 'fabricacao' | 'montagem'
  ): Promise<Cargo[]> {
    const cargos = await this.listAtivos();
    return cargos.filter(
      (c) => c.categoria === categoria || c.categoria === 'ambos'
    );
  }
}

export const CargoService = new CargoServiceClass();
