import { NonConformity } from '@/interfaces/RncInterface';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CraftMyPdfData {
  title: number;
  date: string;
  Obra: string;
  descricao: string;
  data_rnc: string;
  res_ind: string;
  res_rnc: string;
  acao?: string;
  res_acao?: string;
  prazo?: string;
  TotalMaoObra: string;
  TotalMaterial: string;
  TotalGeral: string;
  imagens: Array<{
    key: number;
    url: string;
    descricao?: string;
  }>;
  mao_obra: Array<{
    name: string;
    unid: string;
    item: string;
    qtd: number;
    valor: string;
    total: string;
  }>;
  material: Array<{
    material: string;
    unid: string;
    item: string;
    qtd: number;
    valor: string;
    total: string;
  }>;
}

class CraftMyPdfService {
  private static readonly API_URL = 'https://api.craftmypdf.com/v1/create';
  private static readonly API_KEY =
    '4784MTU4OTU6MTU5NzU6SGZGeWlnMmk3NU1ZWDZvNg=';
  private static readonly TEMPLATE_ID = '64777b23b9b8f6fe';

  private static getImageUrl(url: string): string {
    return url.startsWith('http')
      ? url
      : `https://api.gmxindustrial.com.br${url}`;
  }

  static async generateRncPdf(rnc: NonConformity): Promise<void> {
    try {
      const totalMaoObra =
        rnc.workforce?.reduce((total, w) => total + Number(w.total || 0), 0) ||
        0;

      const totalMaterial =
        rnc.materials?.reduce((total, m) => total + Number(m.total || 0), 0) ||
        0;

      const totalGeral = totalMaoObra + totalMaterial;

      const data: CraftMyPdfData = {
        title: rnc.code || 0,
        date: format(new Date(), 'dd/MM HH:mm', { locale: ptBR }),
        Obra: rnc.project?.name || 'Não informado',
        descricao: rnc.description,
        data_rnc: format(new Date(rnc.dateOccurrence), 'dd/MM', {
          locale: ptBR,
        }),
        res_ind: rnc.responsibleIdentification?.name || 'Não informado',
        res_rnc: rnc.responsibleRNC?.name || 'Não informado',
        acao: rnc.correctiveAction || '',
        res_acao: rnc.responsibleAction?.name || '',
        prazo: rnc.dateConclusion
          ? format(new Date(rnc.dateConclusion), 'dd/MM', { locale: ptBR })
          : '',
        TotalMaoObra: totalMaoObra.toFixed(2).replace('.', ','),
        TotalMaterial: totalMaterial.toFixed(2).replace('.', ','),
        TotalGeral: totalGeral.toFixed(2).replace('.', ','),
        imagens:
          rnc.images?.map((img, index) => ({
            key: index + 1,
            url: this.getImageUrl(img.url),
            descricao: img.description || '',
          })) || [],
        mao_obra:
          rnc.workforce?.map((w, index) => ({
            name: w.name,
            unid: 'h',
            item: (index + 1).toString(),
            qtd: Number(w.hours),
            valor: Number(w.valueHour).toFixed(2).replace('.', ','),
            total: Number(w.total).toFixed(2).replace('.', ','),
          })) || [],
        material:
          rnc.materials?.map((m, index) => ({
            material: m.material,
            unid: m.unidade,
            item: (index + 1).toString(),
            qtd: Number(m.quantidade),
            valor: Number(m.preco).toFixed(2).replace('.', ','),
            total: Number(m.total).toFixed(2).replace('.', ','),
          })) || [],
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.API_KEY,
        },
        body: JSON.stringify({
          data,
          template_id: this.TEMPLATE_ID,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Erro na API: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const pdfUrl = result.file;

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }
}

export default CraftMyPdfService;
