/**
 * PERFIS U (US e UE) - AÇOTEL
 * Extraídos da tabela oficial Açotel (Página 2 - PADRÃO DE EMBALAGEM PERFIL)
 *
 * Total: 257 perfis (139 US + 118 UE)
 *
 * Fórmulas aplicadas:
 * - peso/m = PESO MÉDIO PC ÷ 6
 * - preço/m = peso/m × R$ 8,00
 */

import { MaterialCatalogoCreateDTO, MaterialCategoria } from '@/interfaces/MaterialCatalogoInterface';

// Dados compactos da tabela Açotel - [altura, largura, [[espessura, peso6m], ...]]
const dadosPerfisUS: [number, number, [number, number][]][] = [
  [45, 17, [[1.80, 6.30], [2.00, 6.89]]],
  [50, 25, [[1.80, 7.76], [2.00, 8.68], [2.25, 9.72], [2.65, 11.35], [3.00, 12.83]]],
  [68, 30, [[1.80, 10.40], [2.00, 11.67], [2.25, 13.10], [2.65, 15.56], [3.00, 16.40]]],
  [75, 40, [[1.80, 12.70], [2.00, 14.10], [2.25, 15.82], [2.65, 18.28], [3.00, 20.40], [3.35, 22.50], [3.75, 24.80], [4.25, 27.60], [4.75, 30.60]]],
  [80, 30, [[1.80, 12.64], [2.00, 13.65], [2.25, 15.53], [2.65, 18.29], [3.00, 19.78]]],
  [100, 40, [[1.80, 15.86], [2.00, 17.75], [2.25, 19.63], [2.65, 21.72], [3.00, 23.82], [3.35, 26.50], [3.75, 29.18], [4.25, 32.08], [4.75, 35.27]]],
  [100, 50, [[1.80, 16.40], [2.00, 18.20], [2.25, 20.36], [2.65, 23.52], [3.00, 26.78], [3.35, 29.07], [3.75, 32.08], [4.25, 36.74], [4.75, 40.64]]],
  [120, 50, [[1.80, 18.06], [2.00, 19.97], [2.25, 22.36], [2.65, 26.09], [3.00, 29.30]]],
  [127, 50, [[1.80, 19.04], [2.00, 21.22], [2.25, 23.11], [2.65, 27.89], [3.00, 30.77], [3.35, 33.89], [3.75, 37.48], [4.25, 42.32], [4.75, 46.70]]],
  [142, 50, [[1.80, 24.68], [2.00, 22.04], [2.25, 24.69], [2.65, 28.83], [3.00, 32.50]]],
  [150, 50, [[2.00, 23.49], [2.25, 25.99], [2.65, 30.72], [3.00, 33.97], [3.35, 37.63], [3.75, 41.52], [4.25, 46.84], [4.75, 51.98]]],
  [190, 50, [[2.00, 24.88], [2.25, 27.88], [2.65, 32.02], [3.00, 36.28]]],
  [200, 50, [[2.00, 27.79], [2.25, 31.18], [2.65, 36.51], [3.00, 40.78], [3.35, 45.36], [3.75, 50.32], [4.25, 56.75], [4.75, 62.93]]],
  [200, 75, [[1.80, 29.08], [2.00, 32.22], [2.25, 36.14], [2.65, 42.31], [3.00, 47.78], [3.35, 53.17], [3.75, 59.17], [4.25, 66.65], [4.75, 74.05]]],
  [200, 85, [[2.00, 34.10], [2.25, 38.26], [2.65, 44.81], [3.00, 50.58], [3.35, 56.33], [3.75, 62.70], [4.25, 70.68], [4.75, 78.53]]],
  [250, 50, [[2.00, 34.18], [2.25, 40.14], [2.65, 45.78], [3.00, 50.26], [3.35, 56.12], [3.75, 59.51], [4.25, 62.93]]],
  [250, 75, [[2.00, 32.22], [2.25, 36.14], [2.65, 42.31], [3.00, 47.78], [3.35, 53.17], [3.75, 59.17], [4.25, 66.65], [4.75, 74.05]]],
  [250, 85, [[2.00, 38.81], [2.25, 43.56], [2.65, 51.05], [3.00, 57.85], [3.35, 64.22], [3.75, 71.53], [4.25, 80.67], [4.75, 89.71]]],
  [300, 75, [[2.00, 41.64], [2.25, 46.73], [2.65, 54.79], [3.00, 61.89], [3.35, 68.95], [3.75, 76.83], [4.25, 86.68], [4.75, 96.43]]],
  [300, 85, [[2.00, 43.92], [2.25, 49.86], [2.65, 57.20], [3.00, 64.72], [3.35, 72.11], [3.75, 80.36], [4.25, 90.88], [4.75, 100.90]]],
];

// Dados compactos da tabela Açotel - [altura, largura, enrijecimento, [[espessura, peso6m], ...]]
const dadosPerfisUE: [number, number, number, [number, number][]][] = [
  [50, 25, 10, [[1.80, 10.40], [2.00, 11.67], [2.25, 13.10], [2.65, 15.56], [3.00, 16.40]]],
  [75, 40, 15, [[1.80, 14.83], [2.00, 15.97], [2.25, 17.95], [2.65, 20.68], [3.00, 23.01], [3.35, 20.15], [3.75, 27.55], [4.25, 30.42], [4.75, 33.11]]],
  [100, 40, 15, [[1.80, 17.02], [2.00, 18.87], [2.25, 21.24], [2.65, 24.17], [3.00, 27.63]]],
  [100, 50, 17, [[1.80, 18.38], [2.00, 20.50], [2.25, 23.52], [2.65, 27.30], [3.00, 29.88], [3.35, 32.81], [3.75, 36.20], [4.25, 40.23], [4.75, 44.07]]],
  [127, 50, 17, [[1.80, 21.19], [2.00, 23.59], [2.25, 26.30], [2.65, 31.44], [3.00, 33.16], [3.35, 37.07], [3.75, 40.97], [4.25, 45.64], [4.75, 50.10]]],
  [160, 60, 20, [[1.80, 25.11], [2.00, 27.91], [2.25, 31.65], [2.65, 36.12], [3.00, 40.60], [3.35, 44.81], [3.75, 49.63], [4.25, 55.44], [4.75, 61.07]]],
  [190, 55, 20, [[2.00, 31.10], [2.25, 34.90], [2.65, 40.10], [3.00, 45.00]]],
  [200, 75, 20, [[2.00, 35.52], [2.25, 40.08], [2.65, 47.52], [3.00, 52.04], [3.35, 57.61], [3.75, 63.76], [4.25, 71.66], [4.75, 79.61]]],
  [200, 85, 20, [[2.00, 37.11], [2.25, 41.54], [2.65, 48.56], [3.00, 54.88], [3.35, 60.59], [3.75, 67.29], [4.25, 75.47], [4.75, 83.45]]],
  [200, 75, 25, [[1.80, 32.73], [2.00, 36.17], [2.25, 41.20], [2.65, 48.68], [3.00, 54.30], [3.35, 59.61], [3.75, 65.50], [4.25, 73.46], [4.75, 81.21]]],
  [200, 85, 25, [[2.00, 38.06], [2.25, 42.60], [2.65, 49.80], [3.00, 56.10], [3.35, 62.17], [3.75, 69.08], [4.25, 77.47], [4.75, 85.69]]],
  [210, 30, 15, [[1.80, 24.20], [2.00, 24.25], [2.25, 26.75]]],
  [250, 75, 25, [[2.00, 40.98], [2.25, 45.78], [2.65, 53.54], [3.00, 60.33], [3.35, 66.90], [3.75, 74.36], [4.25, 83.47], [4.75, 92.39]]],
  [250, 85, 25, [[2.00, 42.77], [2.25, 47.90], [2.65, 56.04], [3.00, 63.16], [3.35, 70.06], [3.75, 77.89], [4.25, 87.48], [4.75, 96.87]]],
  [300, 75, 25, [[2.00, 45.59], [2.25, 51.08], [2.65, 59.78], [3.00, 67.40], [3.35, 74.79], [3.75, 83.19], [4.25, 93.48], [4.75, 103.58]]],
  [300, 85, 25, [[2.00, 47.48], [2.25, 53.20], [2.65, 62.28], [3.00, 70.31], [3.35, 77.95], [3.75, 86.72], [4.25, 97.43], [4.75, 108.06]]],
];

// Gerar array de perfis US
const gerarPerfisUS = (): MaterialCatalogoCreateDTO[] => {
  const perfis: MaterialCatalogoCreateDTO[] = [];

  dadosPerfisUS.forEach(([altura, largura, espessuras]) => {
    espessuras.forEach(([espessura, pesoMedioPc]) => {
      const pesoKgM = pesoMedioPc / 6;
      const precoM = pesoKgM * 8.00;

      perfis.push({
        codigo: `US ${altura}x${largura} e=${espessura.toFixed(2)}`,
        descricao: `PERFIL US ${altura}x${largura}mm e=${espessura.toFixed(2)}mm - Açotel`,
        categoria: MaterialCategoria.PERFIL_U,
        fornecedor: 'Açotel',
        unidade: 'm',
        precoKg: 8.00,
        pesoNominal: parseFloat(pesoKgM.toFixed(3)),
        precoUnitario: parseFloat(precoM.toFixed(2)),
        dimensoes: {
          altura,
          larguraMesa: largura,
          enrijecimento: 0,
          espessuraAlma: espessura,
        },
        observacoes: 'Perfil U Simples - Açotel',
        ativo: true,
      });
    });
  });

  return perfis;
};

// Gerar array de perfis UE
const gerarPerfisUE = (): MaterialCatalogoCreateDTO[] => {
  const perfis: MaterialCatalogoCreateDTO[] = [];

  dadosPerfisUE.forEach(([altura, largura, enrijecimento, espessuras]) => {
    espessuras.forEach(([espessura, pesoMedioPc]) => {
      const pesoKgM = pesoMedioPc / 6;
      const precoM = pesoKgM * 8.00;

      perfis.push({
        codigo: `UE ${altura}x${largura}x${enrijecimento} e=${espessura.toFixed(2)}`,
        descricao: `PERFIL UE ${altura}x${largura}x${enrijecimento}mm e=${espessura.toFixed(2)}mm - Açotel`,
        categoria: MaterialCategoria.PERFIL_U,
        fornecedor: 'Açotel',
        unidade: 'm',
        precoKg: 8.00,
        pesoNominal: parseFloat(pesoKgM.toFixed(3)),
        precoUnitario: parseFloat(precoM.toFixed(2)),
        dimensoes: {
          altura,
          larguraMesa: largura,
          enrijecimento,
          espessuraAlma: espessura,
        },
        observacoes: 'Perfil U Enrijecido - Açotel',
        ativo: true,
      });
    });
  });

  return perfis;
};

// Export dos perfis gerados
export const perfisUSAcotel = gerarPerfisUS();
export const perfisUEAcotel = gerarPerfisUE();
export const perfisUAcotel = [...perfisUSAcotel, ...perfisUEAcotel];

// Estatísticas
export const estatisticasPerfisU = {
  totalUS: perfisUSAcotel.length,
  totalUE: perfisUEAcotel.length,
  total: perfisUAcotel.length,
};
