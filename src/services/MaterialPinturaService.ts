/**
 * Service para Materiais de Pintura
 * Gerencia cálculos de área superficial para orçamentos de pintura
 */

import {
  MaterialPinturaInterface,
  MaterialPinturaDTO,
  MaterialPinturaFiltros,
  TipoMaterialPintura,
  PI,
  PI_APPROX,
} from '@/interfaces/MaterialPinturaInterface';
import API_URL from '@/config';
import axios from 'axios';

class MaterialPinturaService {
  /**
   * Calcula o perímetro (em metros) baseado no tipo e dimensões do material
   */
  calcularPerimetro(
    tipo: TipoMaterialPintura,
    dimensoes: Partial<MaterialPinturaDTO>
  ): number {
    let perimetroMm = 0;

    switch (tipo) {
      case TipoMaterialPintura.FR:
        // Ferro Redondo: perímetro = diâmetro × 2 × π
        if (dimensoes.diametro == null) throw new Error('Diâmetro é obrigatório para FR');
        perimetroMm = dimensoes.diametro * 2 * PI;
        break;

      case TipoMaterialPintura.UE:
        // Perfil U Enrijecido: perímetro = (altura×2) + (aba×4) + (enrijecimento×4)
        if (dimensoes.altura == null || dimensoes.aba == null || dimensoes.enrijecimento == null) {
          throw new Error('Altura, aba e enrijecimento são obrigatórios para UE');
        }
        perimetroMm =
          dimensoes.altura * 2 +
          dimensoes.aba * 4 +
          dimensoes.enrijecimento * 4;
        break;

      case TipoMaterialPintura.US:
        // Perfil U Simples: perímetro = (altura×2) + (aba×4) + (enrijecimento×4)
        // (usa mesma fórmula do UE, mas sem enrijecimento = 0)
        if (dimensoes.altura == null || dimensoes.aba == null) {
          throw new Error('Altura e aba são obrigatórios para US');
        }
        const enrif = dimensoes.enrijecimento || 0;
        perimetroMm = dimensoes.altura * 2 + dimensoes.aba * 4 + enrif * 4;
        break;

      case TipoMaterialPintura.CH:
        // Chapa: não tem perímetro linear, é calculado direto pela área
        // Retorna 0 pois não é usado
        perimetroMm = 0;
        break;

      case TipoMaterialPintura.W:
        // Viga W: perímetro = altura × 6 (simplificação)
        if (dimensoes.altura == null) throw new Error('Altura é obrigatória para W');
        perimetroMm = dimensoes.altura * 6;
        break;

      case TipoMaterialPintura.L:
        // Cantoneira: perímetro = (aba1×2) + (aba2×2)
        if (dimensoes.aba1 == null || dimensoes.aba2 == null) {
          throw new Error('Aba1 e Aba2 são obrigatórias para L');
        }
        perimetroMm = dimensoes.aba1 * 2 + dimensoes.aba2 * 2;
        break;

      case TipoMaterialPintura.MET:
        // Metalon: perímetro = 4 × lado (quadrado) ou 2 × (lado1 + lado2) (retangular)
        if (dimensoes.lado != null) {
          // Quadrado
          perimetroMm = 4 * dimensoes.lado;
        } else if (dimensoes.largura != null && dimensoes.altura != null) {
          // Retangular
          perimetroMm = 2 * (dimensoes.largura + dimensoes.altura);
        } else {
          throw new Error('Para MET, informe "lado" (quadrado) ou "largura + altura" (retangular)');
        }
        break;

      case TipoMaterialPintura.TB:
        // Tubo Redondo: perímetro = diâmetro × 3 (aproximação π ≈ 3)
        if (dimensoes.diametro == null) throw new Error('Diâmetro é obrigatório para TB');
        perimetroMm = dimensoes.diametro * PI_APPROX;
        break;

      default:
        throw new Error(`Tipo de material desconhecido: ${tipo}`);
    }

    // Converter mm para m
    const perimetroM = perimetroMm / 1000;
    return Math.round(perimetroM * 1000) / 1000; // 3 casas decimais
  }

  /**
   * Calcula a área por metro linear (em m²/m)
   * Para chapa, retorna a área da chapa (ambas as faces)
   */
  calcularAreaM2PorMetroLinear(
    tipo: TipoMaterialPintura,
    dimensoes: Partial<MaterialPinturaDTO>,
    perimetroM: number
  ): number {
    if (tipo === TipoMaterialPintura.CH) {
      // Chapa: área = largura × altura × 2 (ambas as faces)
      if (dimensoes.largura == null || dimensoes.altura == null) {
        throw new Error('Largura e altura são obrigatórias para CH');
      }
      const areaM2 = (dimensoes.largura / 1000) * (dimensoes.altura / 1000) * 2;
      return Math.round(areaM2 * 10000) / 10000; // 4 casas decimais
    }

    // Para todos os outros: área = perímetro × 1m
    return perimetroM;
  }

  /**
   * Calcula área total para uma quantidade e comprimento específicos
   */
  calcularAreaTotal(
    areaM2PorMetro: number,
    quantidade: number,
    comprimentoM: number,
    tipo: TipoMaterialPintura
  ): number {
    if (tipo === TipoMaterialPintura.CH) {
      // Para chapa, área já está calculada (não depende de comprimento)
      return quantidade * areaM2PorMetro;
    }

    // Para perfis/tubos/barras: área = quantidade × perímetro × comprimento
    const areaTotal = quantidade * areaM2PorMetro * comprimentoM;
    return Math.round(areaTotal * 100) / 100; // 2 casas decimais
  }

  /**
   * Gera código automático baseado no tipo e dimensões
   */
  gerarCodigo(tipo: TipoMaterialPintura, dimensoes: Partial<MaterialPinturaDTO>): string {
    const tipoCodigo = tipo.toUpperCase();

    switch (tipo) {
      case TipoMaterialPintura.FR:
        return `${tipoCodigo}-${dimensoes.diametro}`;

      case TipoMaterialPintura.UE:
        return `${tipoCodigo}-${dimensoes.altura}x${dimensoes.aba}x${dimensoes.enrijecimento}`;

      case TipoMaterialPintura.US:
        return `${tipoCodigo}-${dimensoes.altura}x${dimensoes.aba}`;

      case TipoMaterialPintura.CH:
        return `${tipoCodigo}-${dimensoes.largura}x${dimensoes.altura}x${dimensoes.espessura}`;

      case TipoMaterialPintura.W:
        return `${tipoCodigo}-${dimensoes.altura}`;

      case TipoMaterialPintura.L:
        return `${tipoCodigo}-${dimensoes.aba1}x${dimensoes.aba2}`;

      case TipoMaterialPintura.MET:
        if (dimensoes.lado) {
          return `${tipoCodigo}-${dimensoes.lado}x${dimensoes.lado}`;
        }
        return `${tipoCodigo}-${dimensoes.largura}x${dimensoes.altura}`;

      case TipoMaterialPintura.TB:
        return `${tipoCodigo}-${dimensoes.diametro}`;

      default:
        return `${tipoCodigo}-NOVO`;
    }
  }

  /**
   * Gera descrição automática baseada no tipo e dimensões
   */
  gerarDescricao(tipo: TipoMaterialPintura, dimensoes: Partial<MaterialPinturaDTO>): string {
    switch (tipo) {
      case TipoMaterialPintura.FR:
        return `Ferro Redondo Ø${dimensoes.diametro}mm`;

      case TipoMaterialPintura.UE:
        return `Perfil U Enrijecido ${dimensoes.altura}×${dimensoes.aba}×${dimensoes.enrijecimento}mm - Esp. ${dimensoes.espessura}mm`;

      case TipoMaterialPintura.US:
        return `Perfil U Simples ${dimensoes.altura}×${dimensoes.aba}mm - Esp. ${dimensoes.espessura}mm`;

      case TipoMaterialPintura.CH:
        return `Chapa ${dimensoes.largura}×${dimensoes.altura}mm - Esp. ${dimensoes.espessura}mm`;

      case TipoMaterialPintura.W:
        return `Viga W - Altura ${dimensoes.altura}mm`;

      case TipoMaterialPintura.L:
        return `Cantoneira ${dimensoes.aba1}×${dimensoes.aba2}mm`;

      case TipoMaterialPintura.MET:
        if (dimensoes.lado) {
          return `Metalon Quadrado ${dimensoes.lado}×${dimensoes.lado}mm - Esp. ${dimensoes.espessura}mm`;
        }
        return `Metalon Retangular ${dimensoes.largura}×${dimensoes.altura}mm - Esp. ${dimensoes.espessura}mm`;

      case TipoMaterialPintura.TB:
        return `Tubo Redondo Ø${dimensoes.diametro}mm`;

      default:
        return 'Material';
    }
  }

  /**
   * Lista todos os materiais (com filtros opcionais)
   */
  async listar(filtros?: MaterialPinturaFiltros): Promise<MaterialPinturaInterface[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.tipo) params.append('tipo', filtros.tipo);
      if (filtros?.busca) params.append('busca', filtros.busca);
      if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));

      const response = await axios.get(`${API_URL}/materiais-pintura?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar materiais de pintura:', error);
      throw error;
    }
  }

  /**
   * Busca material por ID
   */
  async buscarPorId(id: number): Promise<MaterialPinturaInterface> {
    try {
      const response = await axios.get(`${API_URL}/materiais-pintura/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar material de pintura:', error);
      throw error;
    }
  }

  /**
   * Cria novo material
   */
  async criar(data: MaterialPinturaDTO): Promise<MaterialPinturaInterface> {
    try {
      // Calcular perímetro e área
      const perimetroM = this.calcularPerimetro(data.tipo, data);
      const areaM2PorMetroLinear = this.calcularAreaM2PorMetroLinear(data.tipo, data, perimetroM);

      // Gerar código e descrição se não fornecidos
      const codigo = data.codigo || this.gerarCodigo(data.tipo, data);
      const descricao = data.descricao || this.gerarDescricao(data.tipo, data);

      const payload = {
        ...data,
        codigo,
        descricao,
        perimetroM,
        areaM2PorMetroLinear,
        ativo: true,
      };

      const response = await axios.post(`${API_URL}/materiais-pintura`, payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar material de pintura:', error);
      throw error;
    }
  }

  /**
   * Atualiza material existente
   */
  async atualizar(id: number, data: Partial<MaterialPinturaDTO>): Promise<MaterialPinturaInterface> {
    try {
      // Recalcular perímetro e área se dimensões foram alteradas
      let updates: any = { ...data };

      if (data.tipo) {
        const perimetroM = this.calcularPerimetro(data.tipo, data);
        const areaM2PorMetroLinear = this.calcularAreaM2PorMetroLinear(data.tipo, data, perimetroM);
        updates.perimetroM = perimetroM;
        updates.areaM2PorMetroLinear = areaM2PorMetroLinear;
      }

      const response = await axios.put(`${API_URL}/materiais-pintura/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar material de pintura:', error);
      throw error;
    }
  }

  /**
   * Exclui material
   */
  async excluir(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/materiais-pintura/${id}`);
    } catch (error) {
      console.error('Erro ao excluir material de pintura:', error);
      throw error;
    }
  }

  /**
   * Ativa/desativa material
   */
  async toggleAtivo(id: number, ativo: boolean): Promise<MaterialPinturaInterface> {
    try {
      const response = await axios.patch(`${API_URL}/materiais-pintura/${id}/toggle-ativo`, { ativo });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do material:', error);
      throw error;
    }
  }
}

export default new MaterialPinturaService();
