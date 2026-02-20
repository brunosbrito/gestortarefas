import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import MaterialCatalogoService from '@/services/MaterialCatalogoService';
import MaterialPinturaService from '@/services/MaterialPinturaService';
import {
  MaterialCatalogoCreateDTO,
  MaterialCategoria,
} from '@/interfaces/MaterialCatalogoInterface';
import { TipoMaterialPintura } from '@/interfaces/MaterialPinturaInterface';
import { perfisUAcotel, estatisticasPerfisU } from '@/data/perfisUAcotel';

interface PopularMateriaisButtonProps {
  onComplete: () => void;
}

const PopularMateriaisButton = ({ onComplete }: PopularMateriaisButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const materiaisIniciais: MaterialCatalogoCreateDTO[] = [
    // PERFIS W GERDAU
    {
      codigo: 'W150x13,0',
      descricao: 'PERFIL W 150x13,0 kg/m',
      categoria: MaterialCategoria.PERFIL_W,
      fornecedor: 'Gerdau',
      unidade: 'm',
      precoKg: 8.0,
      pesoNominal: 13.0,
      precoUnitario: 104.0,
      dimensoes: { altura: 150, larguraMesa: 100, espessuraAlma: 4.75, espessuraMesa: 7.0 },
      observacoes: 'Perfil estrutural laminado W - Gerdau',
      ativo: true,
    },
    {
      codigo: 'W200x19,3',
      descricao: 'PERFIL W 200x19,3 kg/m',
      categoria: MaterialCategoria.PERFIL_W,
      fornecedor: 'Gerdau',
      unidade: 'm',
      precoKg: 8.0,
      pesoNominal: 19.3,
      precoUnitario: 154.4,
      dimensoes: { altura: 200, larguraMesa: 100, espessuraAlma: 5.5, espessuraMesa: 8.0 },
      observacoes: 'Perfil estrutural laminado W - Gerdau',
      ativo: true,
    },

    // PERFIL I GERDAU
    {
      codigo: 'I254x33',
      descricao: 'PERFIL I 254x33 kg/m',
      categoria: MaterialCategoria.PERFIL_I,
      fornecedor: 'Gerdau',
      unidade: 'm',
      precoKg: 8.0,
      pesoNominal: 33.0,
      precoUnitario: 264.0,
      dimensoes: { altura: 254, larguraMesa: 146, espessuraAlma: 8.6, espessuraMesa: 12.7 },
      observacoes: 'Perfil estrutural laminado I - Gerdau',
      ativo: true,
    },

    // CANTONEIRA GERDAU
    {
      codigo: 'L50,8x50,8x4,76',
      descricao: 'CANTONEIRA L 50,8x50,8x4,76mm',
      categoria: MaterialCategoria.CANTONEIRA,
      fornecedor: 'Gerdau',
      unidade: 'm',
      precoKg: 8.0,
      pesoNominal: 3.57,
      precoUnitario: 28.56,
      dimensoes: { altura: 50.8, larguraMesa: 50.8, espessuraMesa: 4.76 },
      observacoes: 'Cantoneira de abas iguais - Gerdau',
      ativo: true,
    },

    // BARRAS REDONDAS GERDAU
    {
      codigo: 'BR1/2"',
      descricao: 'BARRA REDONDA 1/2" (12,7mm)',
      categoria: MaterialCategoria.BARRA_REDONDA,
      fornecedor: 'Gerdau',
      unidade: 'm',
      precoKg: 8.0,
      pesoNominal: 0.99,
      precoUnitario: 7.92,
      dimensoes: { diametro: 12.7, bitolaPol: '1/2"', bitolaMm: 12.7 },
      observacoes: 'Barra redonda de aço carbono - Gerdau',
      ativo: true,
    },
    {
      codigo: 'BR3/4"',
      descricao: 'BARRA REDONDA 3/4" (19,05mm)',
      categoria: MaterialCategoria.BARRA_REDONDA,
      fornecedor: 'Gerdau',
      unidade: 'm',
      precoKg: 8.0,
      pesoNominal: 2.24,
      precoUnitario: 17.92,
      dimensoes: { diametro: 19.05, bitolaPol: '3/4"', bitolaMm: 19.05 },
      observacoes: 'Barra redonda de aço carbono - Gerdau',
      ativo: true,
    },

    // BARRA CHATA GERDAU
    {
      codigo: 'BC1/4"x1"',
      descricao: 'BARRA CHATA 1/4"x1" (6,35x25,4mm)',
      categoria: MaterialCategoria.BARRA_CHATA,
      fornecedor: 'Gerdau',
      unidade: 'm',
      precoKg: 8.0,
      pesoNominal: 1.27,
      precoUnitario: 10.16,
      dimensoes: { larguraMesa: 25.4, espessuraMesa: 6.35 },
      observacoes: 'Barra chata de aço carbono - Gerdau',
      ativo: true,
    },

    // TUBOS QUADRADOS GERDAU
    {
      codigo: 'TQ50x50x2,00',
      descricao: 'TUBO QUADRADO 50x50x2,00mm',
      categoria: MaterialCategoria.TUBO_QUADRADO,
      fornecedor: 'Gerdau',
      unidade: 'm',
      precoKg: 8.0,
      pesoNominal: 2.94,
      precoUnitario: 23.52,
      dimensoes: { lado: 50, espessura: 2.0 },
      observacoes: 'Tubo estrutural quadrado (Metalon) - Gerdau',
      ativo: true,
    },
    {
      codigo: 'TQ100x100x3,00',
      descricao: 'TUBO QUADRADO 100x100x3,00mm',
      categoria: MaterialCategoria.TUBO_QUADRADO,
      fornecedor: 'Gerdau',
      unidade: 'm',
      precoKg: 8.0,
      pesoNominal: 8.84,
      precoUnitario: 70.72,
      dimensoes: { lado: 100, espessura: 3.0 },
      observacoes: 'Tubo estrutural quadrado (Metalon) - Gerdau',
      ativo: true,
    },

    // TUBO RETANGULAR GERDAU
    {
      codigo: 'TR40x80x2,00',
      descricao: 'TUBO RETANGULAR 40x80x2,00mm',
      categoria: MaterialCategoria.TUBO_RETANGULAR,
      fornecedor: 'Gerdau',
      unidade: 'm',
      precoKg: 8.0,
      pesoNominal: 3.53,
      precoUnitario: 28.24,
      dimensoes: { larguraMesa: 40, larguraB: 80, espessura: 2.0 },
      observacoes: 'Tubo estrutural retangular - Gerdau',
      ativo: true,
    },

    // CHAPAS GERDAU
    {
      codigo: 'CHAPA1200x3000x6,30mm',
      descricao: 'CHAPA DE AÇO 1200x3000x6,30mm (1/4")',
      categoria: MaterialCategoria.CHAPA,
      fornecedor: 'Gerdau',
      unidade: 'm²',
      precoKg: 8.0,
      pesoNominal: 50.0,
      precoUnitario: 400.0,
      dimensoes: { largura: 1200, comprimento: 3000, area: 3.6 },
      observacoes: 'Chapa de aço carbono - espessura 1/4" - Gerdau',
      ativo: true,
    },
    {
      codigo: 'CHAPA1500x3000x4,75mm',
      descricao: 'CHAPA DE AÇO 1500x3000x4,75mm (3/16")',
      categoria: MaterialCategoria.CHAPA,
      fornecedor: 'Gerdau',
      unidade: 'm²',
      precoKg: 8.0,
      pesoNominal: 37.5,
      precoUnitario: 300.0,
      dimensoes: { largura: 1500, comprimento: 3000, area: 4.5 },
      observacoes: 'Chapa de aço carbono - espessura 3/16" - Gerdau',
      ativo: true,
    },

    // TELHAS AÇOTEL
    {
      codigo: 'TELHA TRAP MF-40 e=0,50mm',
      descricao: 'TELHA TRAPEZOIDAL MF-40 espessura 0,50mm',
      categoria: MaterialCategoria.TELHA_TRAPEZOIDAL,
      fornecedor: 'Açotel',
      unidade: 'm',
      precoUnitario: 55.0,
      dimensoes: { larguraTotal: 1000, larguraUtil: 960, recobrimentoDuplo: 40 },
      observacoes: 'Telha trapezoidal galvanizada - Preço: R$ 55,00/ML - Açotel',
      ativo: true,
    },
    {
      codigo: 'TELHA OND TR-40 e=0,43mm',
      descricao: 'TELHA ONDULADA TR-40 espessura 0,43mm',
      categoria: MaterialCategoria.TELHA_ONDULADA,
      fornecedor: 'Açotel',
      unidade: 'm',
      precoUnitario: 55.0,
      dimensoes: { larguraTotal: 1090, larguraUtil: 1020, recobrimentoDuplo: 70 },
      observacoes: 'Telha ondulada galvanizada - Preço: R$ 55,00/ML - Açotel',
      ativo: true,
    },

    // PARAFUSOS CISER
    {
      codigo: 'PF. Sextavado 1/2"x2" - A307',
      descricao: 'PARAFUSO SEXTAVADO 1/2"x2" - A307',
      categoria: MaterialCategoria.PARAFUSO_A307,
      fornecedor: 'Ciser',
      unidade: 'un',
      precoUnitario: 2.5,
      dimensoes: {
        tipo: 'Sextavado',
        diametroPol: '1/2"',
        diametroMm: 12.7,
        comprimentoPol: '2"',
        comprimentoMm: 50.8,
        norma: 'A307',
      },
      observacoes: 'Parafuso sextavado grau A307 - Ciser',
      ativo: true,
    },
    {
      codigo: 'PF. Sextavado 3/4"x2.1/2" - A325',
      descricao: 'PARAFUSO SEXTAVADO 3/4"x2.1/2" - A325',
      categoria: MaterialCategoria.PARAFUSO_A325,
      fornecedor: 'Ciser',
      unidade: 'un',
      precoUnitario: 5.0,
      dimensoes: {
        tipo: 'Sextavado',
        diametroPol: '3/4"',
        diametroMm: 19.05,
        comprimentoPol: '2.1/2"',
        comprimentoMm: 63.5,
        norma: 'A325',
      },
      observacoes: 'Parafuso estrutural sextavado grau A325 - Ciser',
      ativo: true,
    },
    {
      codigo: 'PF. Sextavado 1"x3" - A489',
      descricao: 'PARAFUSO SEXTAVADO 1"x3" - A489',
      categoria: MaterialCategoria.PARAFUSO_A489,
      fornecedor: 'Ciser',
      unidade: 'un',
      precoUnitario: 12.0,
      dimensoes: {
        tipo: 'Sextavado',
        diametroPol: '1"',
        diametroMm: 25.4,
        comprimentoPol: '3"',
        comprimentoMm: 76.2,
        norma: 'A489',
      },
      observacoes: 'Parafuso estrutural sextavado grau A489 - Ciser',
      ativo: true,
    },

    // PERFIS U AÇOTEL (257 perfis: 139 US + 118 UE)
    ...perfisUAcotel,
  ];

  // Mapear MaterialCategoria → TipoMaterialPintura
  const mapearCategoriaParaTipoPintura = (cat: MaterialCategoria): TipoMaterialPintura | null => {
    const mapping: Record<string, TipoMaterialPintura> = {
      [MaterialCategoria.PERFIL_U]: TipoMaterialPintura.US,
      [MaterialCategoria.PERFIL_I]: TipoMaterialPintura.W,
      [MaterialCategoria.PERFIL_W]: TipoMaterialPintura.W,
      [MaterialCategoria.PERFIL_HP]: TipoMaterialPintura.W,
      [MaterialCategoria.CANTONEIRA]: TipoMaterialPintura.L,
      [MaterialCategoria.BARRA_REDONDA]: TipoMaterialPintura.FR,
      [MaterialCategoria.TUBO_REDONDO]: TipoMaterialPintura.TB,
      [MaterialCategoria.TUBO_QUADRADO]: TipoMaterialPintura.MET,
      [MaterialCategoria.TUBO_RETANGULAR]: TipoMaterialPintura.MET,
      [MaterialCategoria.CHAPA]: TipoMaterialPintura.CH,
    };
    return mapping[cat] || null;
  };

  // Calcular área de pintura para um material
  const calcularAreaPintura = (material: MaterialCatalogoCreateDTO): Partial<MaterialCatalogoCreateDTO> => {
    const tipoMapping = mapearCategoriaParaTipoPintura(material.categoria);
    if (!tipoMapping) return {};

    try {
      // Construir dimensões para cálculo
      const dimensoes: any = { tipo: tipoMapping };

      // Mapear campos conforme tipo
      if ([TipoMaterialPintura.UE, TipoMaterialPintura.US, TipoMaterialPintura.W].includes(tipoMapping)) {
        if (material.dimensoes.altura) dimensoes.altura = material.dimensoes.altura;
        if (material.dimensoes.larguraMesa) dimensoes.aba = material.dimensoes.larguraMesa;
        if (material.dimensoes.espessuraAlma) dimensoes.enrijecimento = material.dimensoes.espessuraAlma;
      }

      if (tipoMapping === TipoMaterialPintura.L) {
        if (material.dimensoes.larguraMesa || material.dimensoes.altura) {
          const abaValor = material.dimensoes.larguraMesa || material.dimensoes.altura;
          dimensoes.aba1 = abaValor;
          dimensoes.aba2 = abaValor;
        }
      }

      if ([TipoMaterialPintura.FR, TipoMaterialPintura.TB].includes(tipoMapping)) {
        if (material.dimensoes.diametro) dimensoes.diametro = material.dimensoes.diametro;
      }

      if (tipoMapping === TipoMaterialPintura.MET) {
        if (material.dimensoes.lado) {
          dimensoes.lado = material.dimensoes.lado;
        } else if (material.dimensoes.larguraMesa && material.dimensoes.larguraB) {
          dimensoes.largura = material.dimensoes.larguraMesa;
          dimensoes.altura = material.dimensoes.larguraB;
        }
      }

      if (tipoMapping === TipoMaterialPintura.CH) {
        if (material.dimensoes.largura) dimensoes.largura = material.dimensoes.largura;
        if (material.dimensoes.comprimento) dimensoes.altura = material.dimensoes.comprimento;
      }

      if (material.dimensoes.espessura) dimensoes.espessura = material.dimensoes.espessura;

      // Calcular usando service
      const perimetro = MaterialPinturaService.calcularPerimetro(tipoMapping, dimensoes);
      const area = MaterialPinturaService.calcularAreaM2PorMetroLinear(tipoMapping, dimensoes, perimetro);

      return {
        perimetroM: perimetro,
        areaM2PorMetroLinear: area,
        tipoMaterialPintura: tipoMapping,
      };
    } catch (error) {
      console.warn(`Erro ao calcular área de pintura para ${material.codigo}:`, error);
      return {};
    }
  };

  const handlePopular = async () => {
    try {
      setLoading(true);

      console.log('🚀 Iniciando população de materiais...');

      // Adicionar cálculo de área de pintura a cada material
      const materiaisComPintura = materiaisIniciais.map((material) => {
        const areaPintura = calcularAreaPintura(material);
        console.log(`Calculado para ${material.codigo}:`, areaPintura);
        return {
          ...material,
          ...areaPintura,
        };
      });

      console.log(`📦 Enviando ${materiaisComPintura.length} materiais para API...`);

      const resultado = await MaterialCatalogoService.popularMateriais(materiaisComPintura);

      console.log('✅ Resultado:', resultado);

      if (resultado.erro === 0) {
        toast({
          title: 'Sucesso!',
          description: `${resultado.sucesso} materiais foram criados com sucesso.`,
          duration: 5000,
        });
      } else {
        toast({
          title: 'Parcialmente concluído',
          description: `${resultado.sucesso} materiais criados, ${resultado.erro} já existentes ou com erro.`,
          variant: 'default',
          duration: 5000,
        });
      }

      onComplete();
    } catch (error: any) {
      console.error('❌ Erro ao popular materiais:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Mensagem mais específica baseada no erro
      let mensagemErro = 'Não foi possível popular os materiais';

      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        mensagemErro = 'Erro de conexão. Verifique se a API está rodando.';
      } else if (error.response?.status === 404) {
        mensagemErro = 'Endpoint não encontrado. Tentando criar materiais individualmente...';
      } else if (error.response?.data?.message) {
        mensagemErro = error.response.data.message;
      }

      toast({
        title: 'Erro',
        description: mensagemErro,
        variant: 'destructive',
        duration: 7000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Popular Materiais Iniciais
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Popular materiais iniciais?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação irá criar 275 materiais do catálogo (Gerdau, Açotel, Ciser):
            <div className="mt-3 p-3 bg-muted rounded-md text-sm max-h-60 overflow-y-auto">
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-xs text-blue-600">Perfis Estruturais (4)</p>
                  <ul className="ml-4 space-y-0.5 text-xs">
                    <li>• W 150x13,0</li>
                    <li>• W 200x19,3</li>
                    <li>• I 254x33</li>
                    <li>• L 50,8x50,8x4,76</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-xs text-green-600">Barras (3)</p>
                  <ul className="ml-4 space-y-0.5 text-xs">
                    <li>• BR 1/2", BR 3/4"</li>
                    <li>• BC 1/4"x1"</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-xs text-purple-600">Tubos (3)</p>
                  <ul className="ml-4 space-y-0.5 text-xs">
                    <li>• TQ 50x50x2,00</li>
                    <li>• TQ 100x100x3,00</li>
                    <li>• TR 40x80x2,00</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-xs text-orange-600">Chapas (2)</p>
                  <ul className="ml-4 space-y-0.5 text-xs">
                    <li>• 1200x3000x6,30mm</li>
                    <li>• 1500x3000x4,75mm</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-xs text-cyan-600">
                    Perfis U Açotel ({estatisticasPerfisU.total})
                  </p>
                  <ul className="ml-4 space-y-0.5 text-xs">
                    <li>• {estatisticasPerfisU.totalUS} Perfis US (Simples)</li>
                    <li>• {estatisticasPerfisU.totalUE} Perfis UE (Enrijecidos)</li>
                    <li className="text-muted-foreground">45x17, 50x25, 75x40, 100x40, 100x50...</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-xs text-yellow-600">Telhas Açotel (2)</p>
                  <ul className="ml-4 space-y-0.5 text-xs">
                    <li>• TRAP MF-40, OND TR-40</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-xs text-red-600">Parafusos Ciser (3)</p>
                  <ul className="ml-4 space-y-0.5 text-xs">
                    <li>• A307, A325, A489</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs">
              Os materiais serão criados com preços base (R$ 8,00/kg para aços, R$ 55,00/ML para telhas).
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePopular}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Materiais'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PopularMateriaisButton;
