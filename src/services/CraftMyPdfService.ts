
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
  }>;
  mao_obra: Array<{
    descricao: string;
    unid: string;
    item: string;
    qtd: number;
    valor: string;
    total: string;
  }>;
  material: Array<{
    descricao: string;
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
    '4784MTU4OTU6MTU5NzU6SGZHeWlnMmk3NU1ZWDZvNg=';
  private static readonly TEMPLATE_ID = '9df77b23bb4ca818';

  private static getImageUrl(url: string): string {
    return url.startsWith('http') ? url : `https://api.gmxindustrial.com.br${url}`;
  }

  static async generateRncPdf(rnc: NonConformity): Promise<void> {
    try {
      // Calcular totais
      const totalMaoObra =
        rnc.workforce?.reduce((total, worker) => {
          const valor = parseFloat(worker.hours) * 20; // Valor exemplo por hora
          return total + valor;
        }, 0) || 0;

      const totalMaterial =
        rnc.materials?.reduce((total, material) => {
          return total + 220; // Valor exemplo por material
        }, 0) || 0;

      const totalGeral = totalMaoObra + totalMaterial;

      // Preparar dados para a API
      const data: CraftMyPdfData = {
        title: parseInt(rnc.id),
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
          rnc.images?.map((image, index) => ({
            key: index + 1,
            url: this.getImageUrl(image.url),
          })) || [],
        mao_obra:
          rnc.workforce?.map((worker, index) => {
            const valorHora = 20; // Valor exemplo por hora
            const qtdHoras = parseFloat(worker.hours) || 0;
            const total = valorHora * qtdHoras;

            return {
              descricao: worker.name,
              unid: 'hrs',
              item: (index + 1).toString(),
              qtd: qtdHoras,
              valor: valorHora.toFixed(2).replace('.', ','),
              total: total.toFixed(2).replace('.', ','),
            };
          }) || [],
        material:
          rnc.materials?.map((material, index) => {
            const valorUnitario = 220; // Valor exemplo por material
            const quantidade = 1;
            const total = valorUnitario * quantidade;

            return {
              descricao: material.name,
              unid: 'un',
              item: (index + 1).toString(),
              qtd: quantidade,
              valor: valorUnitario.toFixed(2).replace('.', ','),
              total: total.toFixed(2).replace('.', ','),
            };
          }) || [],
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
      link.target = '_blank'; // Abre em nova aba
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('PDF gerado com sucesso:', pdfUrl);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }
}

export default CraftMyPdfService;
