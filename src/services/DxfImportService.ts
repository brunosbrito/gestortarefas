// ⚠ dxf-parser é módulo CJS — import com fallback para default export
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as DxfParserModule from 'dxf-parser';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DxfParserClass = (DxfParserModule as any).default || DxfParserModule;

const readFileAsText = (file: File, encoding: string): Promise<string> =>
  new Promise((resolve, reject) => {
    // ⚠ Sempre criar novo FileReader — nunca reutilizar a mesma instância
    const reader = new FileReader();
    reader.onload = e => resolve(e.target!.result as string);
    reader.onerror = () => reject(new Error(`Erro ao ler arquivo com encoding ${encoding}`));
    reader.readAsText(file, encoding);
  });

class DxfImportService {
  async parseDxf(file: File): Promise<string> {
    // Two-pass encoding: UTF-8 primeiro, fallback para ISO-8859-1 (comum em DXF brasileiros do AutoCAD)
    let text: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any;

    // Tentativa 1: UTF-8
    text = await readFileAsText(file, 'UTF-8');
    try {
      parsed = new DxfParserClass().parseSync(text);
    } catch {
      // Tentativa 2: ISO-8859-1
      text = await readFileAsText(file, 'iso-8859-1');
      try {
        parsed = new DxfParserClass().parseSync(text);
      } catch (e) {
        throw new Error(`Não foi possível interpretar o arquivo DXF: ${e}`);
      }
    }

    if (!parsed || !parsed.entities) {
      throw new Error('Arquivo DXF não contém entidades de texto reconhecíveis.');
    }

    const priorityLines: string[] = [];
    const otherLines: string[] = [];

    for (const entity of parsed.entities) {
      if (entity.type !== 'TEXT' && entity.type !== 'MTEXT') continue;

      const layer: string = entity.layer || '';
      const value: string = (entity.text || entity.string || '').trim();
      if (!value) continue;

      const line = `Camada: ${layer} | Texto: ${value}`;
      const layerUpper = layer.toUpperCase();

      if (['LISTA', 'MATERIAL', 'BOM', 'ITEM'].some(kw => layerUpper.includes(kw))) {
        priorityLines.push(line);
      } else {
        otherLines.push(line);
      }
    }

    return [...priorityLines, ...otherLines].join('\n');
  }

  async tryExtractDwgText(file: File): Promise<{ text: string; limitado: boolean }> {
    // AVISO: funciona bem apenas para DWG antigo (R12/R14). DWG 2013+ é quase binário.
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const runs: string[] = [];
    let current = '';

    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      // ASCII imprimível: 32–126
      if (byte >= 32 && byte <= 126) {
        current += String.fromCharCode(byte);
      } else {
        if (current.length >= 6) {
          runs.push(current);
        }
        current = '';
      }
    }
    if (current.length >= 6) runs.push(current);

    // Filtrar strings de metadados
    const filtered = runs.filter(s => {
      if (/^\d+$/.test(s)) return false;         // Apenas dígitos
      if (/^[0-9A-Fa-f]{8,}$/.test(s)) return false; // Hex longo (≥8 chars) → lixo binário (nomes de camadas são curtos)
      if (/^AC\d{4}/.test(s)) return false;        // Header do formato DWG (AC1015, AC1032, etc.)
      return true;
    });

    const text = filtered.join('\n');
    // Se o resultado for muito esparso (< 3 strings ou < 20 chars), é provavelmente lixo binário
    if (filtered.length < 3 || text.length < 20) {
      throw new Error(
        'Não foi possível extrair texto legível deste arquivo DWG. ' +
        'O formato pode ser DWG 2013 ou superior (binário). ' +
        'Converta para DXF no AutoCAD: Arquivo → Salvar Como → AutoCAD 2000 DXF (.dxf)'
      );
    }
    return { text, limitado: true };
  }
}

export const dxfImportService = new DxfImportService();
