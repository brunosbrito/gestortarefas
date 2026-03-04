import api from '@/lib/axios';
import API_URL from '@/config';
import {
  Cargo,
  CreateCargo,
  UpdateCargo,
  ConfiguracaoSalarial,
  CustosDiversos,
  CustoCompostoRateado,
  CALCULOS_MO,
} from '@/interfaces/CargoInterface';

const STORAGE_KEY_CONFIG = 'gestortarefas_config_salarial';

/**
 * Serviço para gerenciar Cargos e cálculos de Mão de Obra
 * Integrado com API backend
 */
class CargoServiceClass {
  private readonly baseUrl = `${API_URL}/cargos`;

  // ==========================================
  // CONFIGURAÇÃO SALARIAL (localStorage por enquanto)
  // ==========================================

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
      salarioMinimoReferencia: 1412.0,
      percentualEncargos: CALCULOS_MO.ENCARGOS_PADRAO,
      ultimaAtualizacao: new Date(),
    };

    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(defaultConfig));
    return defaultConfig;
  }

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
    return updated;
  }

  // ==========================================
  // CRUD DE CARGOS - API
  // ==========================================

  /**
   * Lista todos os cargos
   */
  async list(): Promise<Cargo[]> {
    const response = await api.get<Cargo[]>(this.baseUrl);
    return this.mapCargosResponse(response.data);
  }

  /**
   * Lista apenas cargos ativos
   */
  async listAtivos(): Promise<Cargo[]> {
    const response = await api.get<Cargo[]>(`${this.baseUrl}/ativos`);
    return this.mapCargosResponse(response.data);
  }

  /**
   * Busca um cargo por ID
   */
  async getById(id: string): Promise<Cargo | null> {
    try {
      const response = await api.get<Cargo>(`${this.baseUrl}/${id}`);
      return this.mapCargoResponse(response.data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Cria um novo cargo
   */
  async create(data: CreateCargo): Promise<Cargo> {
    const response = await api.post<Cargo>(this.baseUrl, data);
    return this.mapCargoResponse(response.data);
  }

  /**
   * Atualiza um cargo existente
   */
  async update(data: UpdateCargo): Promise<Cargo> {
    const { id, ...updateData } = data;
    const response = await api.put<Cargo>(`${this.baseUrl}/${id}`, updateData);
    return this.mapCargoResponse(response.data);
  }

  /**
   * Deleta um cargo (soft delete)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Deleta permanentemente um cargo
   */
  async deletePermanente(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}/hard`);
  }

  /**
   * Popula cargos iniciais (seed)
   */
  async seed(): Promise<{ message: string; total: number }> {
    const response = await api.post<{ message: string; total: number }>(
      `${this.baseUrl}/seed`
    );
    return response.data;
  }

  /**
   * Lista cargos por categoria
   */
  async listPorCategoria(
    categoria: 'fabricacao' | 'montagem'
  ): Promise<Cargo[]> {
    const response = await api.get<Cargo[]>(
      `${this.baseUrl}/categoria/${categoria}`
    );
    return this.mapCargosResponse(response.data);
  }

  // ==========================================
  // HELPERS - MAPEAR RESPOSTA DA API
  // ==========================================

  private mapCargoResponse(cargo: any): Cargo {
    return {
      ...cargo,
      // Garantir que números são números
      salarioBase: Number(cargo.salarioBase),
      valorPericulosidade: Number(cargo.valorPericulosidade),
      valorInsalubridade: Number(cargo.valorInsalubridade),
      totalSalario: Number(cargo.totalSalario),
      valorEncargos: Number(cargo.valorEncargos),
      totalCustosDiversos: Number(cargo.totalCustosDiversos),
      totalCustosMO: Number(cargo.totalCustosMO),
      custoHH: Number(cargo.custoHH),
      horasMes: Number(cargo.horasMes),
      // Datas
      criadoEm: new Date(cargo.createdAt || cargo.criadoEm),
      atualizadoEm: new Date(cargo.updatedAt || cargo.atualizadoEm),
    };
  }

  private mapCargosResponse(cargos: any[]): Cargo[] {
    return cargos.map((c) => this.mapCargoResponse(c));
  }

  // ==========================================
  // CÁLCULOS LOCAIS (para preview antes de salvar)
  // ==========================================

  /**
   * Calcula o valor da insalubridade baseado no salário mínimo
   */
  async calcularInsalubridade(
    grau: Cargo['grauInsalubridade']
  ): Promise<number> {
    const config = await this.getConfiguracao();
    const salarioMinimo = config.salarioMinimoReferencia;

    switch (grau) {
      case 'minimo':
        return salarioMinimo * CALCULOS_MO.INSALUBRIDADE.MINIMO;
      case 'medio':
        return salarioMinimo * CALCULOS_MO.INSALUBRIDADE.MEDIO;
      case 'maximo':
        return salarioMinimo * CALCULOS_MO.INSALUBRIDADE.MAXIMO;
      default:
        return 0;
    }
  }

  /**
   * Calcula o valor da periculosidade (30% do salário base)
   */
  calcularPericulosidade(
    salarioBase: number,
    temPericulosidade: boolean
  ): number {
    return temPericulosidade ? salarioBase * CALCULOS_MO.PERICULOSIDADE : 0;
  }

  /**
   * Soma os itens de um CustoCompostoRateado e retorna o valor mensal rateado
   */
  custoMensalRateado(custo: CustoCompostoRateado): number {
    if (!custo?.itens?.length) return 0;
    const total = custo.itens.reduce(
      (sum, item) => sum + item.quantidade * item.valorUnitario,
      0
    );
    const periodo = Math.max(custo.periodoMeses, 1);
    return total / periodo;
  }

  /**
   * Calcula o custo mensal das despesas admissionais
   */
  custoMensalAdmissional(custos: CustosDiversos['despesasAdmissionais']): number {
    if (!custos) return 0;
    const periodo = Math.max(custos.periodoMeses, 1);
    const numEventos = periodo >= 12 ? 3 : 2;
    return (custos.valorPorEvento * numEventos) / periodo;
  }

  /**
   * Calcula o total de custos diversos
   */
  calcularTotalCustosDiversos(custos: CustosDiversos): number {
    if (!custos) return 0;

    const { alimentacao, transporte, uniforme, despesasAdmissionais,
            assistenciaMedica, epiEpc, outros } = custos;

    const totalAlimentacao = alimentacao
      ? (alimentacao.cafeManha || 0) +
        (alimentacao.almoco || 0) +
        (alimentacao.janta || 0) +
        (alimentacao.cestaBasica || 0)
      : 0;

    return (
      totalAlimentacao +
      (transporte || 0) +
      this.custoMensalRateado(uniforme) +
      this.custoMensalAdmissional(despesasAdmissionais) +
      (assistenciaMedica || 0) +
      this.custoMensalRateado(epiEpc) +
      (outros || 0)
    );
  }

  /**
   * Preview dos cálculos de um cargo (sem salvar)
   */
  async calcularPreview(data: CreateCargo): Promise<Partial<Cargo>> {
    const config = await this.getConfiguracao();

    const valorPericulosidade = this.calcularPericulosidade(
      data.salarioBase,
      data.temPericulosidade
    );

    const valorInsalubridade = await this.calcularInsalubridade(
      data.grauInsalubridade
    );

    const totalSalario =
      data.salarioBase + valorPericulosidade + valorInsalubridade;

    const valorEncargos = totalSalario * config.percentualEncargos;

    const totalCustosDiversos = this.calcularTotalCustosDiversos(data.custos);

    const totalCustosMO = totalSalario + valorEncargos + totalCustosDiversos;

    const custoHH = data.horasMes > 0 ? totalCustosMO / data.horasMes : 0;

    return {
      valorPericulosidade,
      valorInsalubridade,
      totalSalario,
      valorEncargos,
      totalCustosDiversos,
      totalCustosMO,
      custoHH: Math.round(custoHH * 100) / 100,
    };
  }
}

export const CargoService = new CargoServiceClass();
