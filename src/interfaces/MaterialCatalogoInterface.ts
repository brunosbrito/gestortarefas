// Interface para Catálogo de Materiais (Perfis, Barras, Tubos, Chapas, Telhas, Parafusos)
export interface MaterialCatalogoInterface {
  id?: number;
  codigo: string; // Ex: "W 150 x 13,0" ou "Chapa 1200x2500x6,30mm" ou "PF. Sextavado 1/2\"x2\" - A307"
  descricao: string; // Descrição completa do material
  categoria: MaterialCategoria;

  // Identificação
  fornecedor: string; // 'Gerdau', 'Açotel', 'Ciser'
  unidade: string; // 'm', 'kg', 'm²', 'un'

  // PREÇOS
  precoKg?: number; // R$/kg (base para cálculo) - para perfis/barras/tubos/chapas
  pesoNominal?: number; // kg/m ou kg/m² dependendo da categoria
  precoUnitario: number; // R$/m, R$/m² ou R$/un (CALCULADO ou FIXO)

  // Dimensões (variam por categoria)
  dimensoes: {
    // PARA CHAPAS
    largura?: number; // mm (largura da chapa)
    comprimento?: number; // mm (comprimento da chapa)
    area?: number; // m² (calculado: largura × comprimento)

    // PARA PARAFUSOS
    tipo?: string; // "Sextavado", etc.
    diametroPol?: string; // "1/2"", "3/4"", etc.
    diametroMm?: number; // mm
    comprimentoPol?: string; // "2"", "2.1/2"", etc.
    comprimentoMm?: number; // mm
    norma?: string; // "A307", "A325", "A489"

    // PARA TELHAS
    larguraTotal?: number; // mm (largura total da telha)
    larguraUtil?: number; // mm (largura útil)
    recobrimentoDuplo?: number; // mm

    // PARA PERFIS (I, U, W, HP, Cantoneiras)
    altura?: number; // d (mm)
    larguraMesa?: number; // bf (mm)
    espessuraAlma?: number; // tw (mm)
    espessuraMesa?: number; // tf (mm)

    // PARA BARRAS E TUBOS
    diametro?: number; // mm (barra redonda / tubo redondo)
    lado?: number; // mm (barra quadrada / tubo quadrado)
    larguraB?: number; // mm (segunda dimensão do tubo retangular)
    espessura?: number; // mm (espessura da parede)

    // Bitolas (referência)
    bitolaPol?: string; // Ex: "3/4""
    bitolaMm?: number; // Ex: 19.05
  };

  // DADOS PARA PINTURA (opcional, calculado automaticamente)
  perimetroM?: number; // Perímetro em metros (para cálculo de área de pintura)
  areaM2PorMetroLinear?: number; // Área por metro linear em m²/m (para orçamento de pintura)
  tipoMaterialPintura?: string; // Tipo no sistema de pintura (FR, UE, US, CH, W, L, MET, TB)

  // Propriedades Técnicas (opcional, para perfis estruturais)
  propriedades?: {
    area?: number; // cm²
    inercia?: {
      Ix?: number; // cm⁴
      Iy?: number; // cm⁴
      Wx?: number; // cm³
      Wy?: number; // cm³
    };
    raioGiracao?: {
      rx?: number; // cm
      ry?: number; // cm
      rt?: number; // cm
    };
  };

  // Observações e Status
  observacoes?: string;
  ativo: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export enum MaterialCategoria {
  // PERFIS ESTRUTURAIS
  PERFIL_I = 'perfil_i',
  PERFIL_U = 'perfil_u',
  CANTONEIRA = 'cantoneira',
  PERFIL_W = 'perfil_w',
  PERFIL_HP = 'perfil_hp',

  // BARRAS
  BARRA_REDONDA = 'barra_redonda',
  BARRA_CHATA = 'barra_chata',
  BARRA_QUADRADA = 'barra_quadrada',

  // TUBOS
  TUBO_QUADRADO = 'tubo_quadrado',
  TUBO_RETANGULAR = 'tubo_retangular',
  TUBO_REDONDO = 'tubo_redondo',

  // CHAPAS
  CHAPA = 'chapa',

  // TELHAS
  TELHA_TRAPEZOIDAL = 'telha_trapezoidal',
  TELHA_ONDULADA = 'telha_ondulada',
  TELHA_MULTIONDA = 'telha_multionda',

  // PARAFUSOS
  PARAFUSO_A307 = 'parafuso_a307',
  PARAFUSO_A325 = 'parafuso_a325',
  PARAFUSO_A489 = 'parafuso_a489',

  // OUTROS
  OUTRO = 'outro',
}

// Labels para exibição
export const MaterialCategoriaLabels: Record<MaterialCategoria, string> = {
  [MaterialCategoria.PERFIL_I]: 'Perfil I',
  [MaterialCategoria.PERFIL_U]: 'Perfil U',
  [MaterialCategoria.CANTONEIRA]: 'Cantoneira',
  [MaterialCategoria.PERFIL_W]: 'Perfil W',
  [MaterialCategoria.PERFIL_HP]: 'Perfil HP',
  [MaterialCategoria.BARRA_REDONDA]: 'Barra Redonda',
  [MaterialCategoria.BARRA_CHATA]: 'Barra Chata',
  [MaterialCategoria.BARRA_QUADRADA]: 'Barra Quadrada',
  [MaterialCategoria.TUBO_QUADRADO]: 'Tubo Quadrado',
  [MaterialCategoria.TUBO_RETANGULAR]: 'Tubo Retangular',
  [MaterialCategoria.TUBO_REDONDO]: 'Tubo Redondo',
  [MaterialCategoria.CHAPA]: 'Chapa',
  [MaterialCategoria.TELHA_TRAPEZOIDAL]: 'Telha Trapezoidal',
  [MaterialCategoria.TELHA_ONDULADA]: 'Telha Ondulada',
  [MaterialCategoria.TELHA_MULTIONDA]: 'Telha Multionda',
  [MaterialCategoria.PARAFUSO_A307]: 'PF. A307',
  [MaterialCategoria.PARAFUSO_A325]: 'PF. A325',
  [MaterialCategoria.PARAFUSO_A489]: 'PF. A489',
  [MaterialCategoria.OUTRO]: 'Outro',
};

// Agrupamento de categorias por tipo
export const MaterialCategoriaGrupos = {
  perfis: [
    MaterialCategoria.PERFIL_I,
    MaterialCategoria.PERFIL_U,
    MaterialCategoria.CANTONEIRA,
    MaterialCategoria.PERFIL_W,
    MaterialCategoria.PERFIL_HP,
  ],
  barras: [
    MaterialCategoria.BARRA_REDONDA,
    MaterialCategoria.BARRA_CHATA,
    MaterialCategoria.BARRA_QUADRADA,
  ],
  tubos: [
    MaterialCategoria.TUBO_QUADRADO,
    MaterialCategoria.TUBO_RETANGULAR,
    MaterialCategoria.TUBO_REDONDO,
  ],
  chapas: [MaterialCategoria.CHAPA],
  telhas: [
    MaterialCategoria.TELHA_TRAPEZOIDAL,
    MaterialCategoria.TELHA_ONDULADA,
    MaterialCategoria.TELHA_MULTIONDA,
  ],
  parafusos: [
    MaterialCategoria.PARAFUSO_A307,
    MaterialCategoria.PARAFUSO_A325,
    MaterialCategoria.PARAFUSO_A489,
  ],
};

// DTO para criação/edição
export interface MaterialCatalogoCreateDTO {
  codigo: string;
  descricao: string;
  categoria: MaterialCategoria;
  fornecedor: string;
  unidade: string;
  precoKg?: number;
  pesoNominal?: number;
  precoUnitario: number;
  dimensoes: MaterialCatalogoInterface['dimensoes'];
  propriedades?: MaterialCatalogoInterface['propriedades'];
  observacoes?: string;
  ativo: boolean;

  // Dados de pintura (opcionais)
  perimetroM?: number;
  areaM2PorMetroLinear?: number;
  tipoMaterialPintura?: string;
}

export interface MaterialCatalogoUpdateDTO extends Partial<MaterialCatalogoCreateDTO> {
  id: number;
}

// Filtros para pesquisa
export interface MaterialCatalogoFiltros {
  busca?: string; // Busca por código ou descrição
  categoria?: MaterialCategoria;
  fornecedor?: string;
  ativo?: boolean;
}
