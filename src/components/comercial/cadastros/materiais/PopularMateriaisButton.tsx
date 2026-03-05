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
import {
  MaterialCatalogoCreateDTO,
  MaterialCategoria,
} from '@/interfaces/MaterialCatalogoInterface';
import { TipoMaterialPintura } from '@/interfaces/MaterialPinturaInterface';
import MaterialPinturaService from '@/services/MaterialPinturaService';
import { getTodosOsMateriais, ESTATISTICAS_CATALOGO } from '@/data/catalogoMateriais';

interface PopularMateriaisButtonProps {
  onComplete: () => void;
}

const PopularMateriaisButton = ({ onComplete }: PopularMateriaisButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
      const dimensoes: any = { tipo: tipoMapping };

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

      const perimetro = MaterialPinturaService.calcularPerimetro(tipoMapping, dimensoes);
      const area = MaterialPinturaService.calcularAreaM2PorMetroLinear(tipoMapping, dimensoes, perimetro);

      return {
        perimetroM: perimetro,
        areaM2PorMetroLinear: area,
        tipoMaterialPintura: tipoMapping,
      };
    } catch {
      return {};
    }
  };

  const handlePopular = async () => {
    try {
      setLoading(true);

      // Carregar todos os materiais do catálogo estático
      const todosOsMateriais = getTodosOsMateriais();

      // Adicionar cálculo de área de pintura a cada material
      const materiaisComPintura = todosOsMateriais.map((material) => ({
        ...material,
        ...calcularAreaPintura(material),
      }));

      // Enviar via bulk endpoint
      const resultado = await MaterialCatalogoService.popularMateriaisBulk(materiaisComPintura);

      if (resultado.erros === 0) {
        toast({
          title: 'Sucesso!',
          description: `${resultado.criados} materiais foram importados com sucesso.`,
          duration: 5000,
        });
      } else {
        toast({
          title: 'Parcialmente concluído',
          description: `${resultado.criados} materiais importados, ${resultado.erros} com erro.`,
          duration: 5000,
        });
      }

      onComplete();
    } catch (error: any) {
      console.error('Erro ao popular materiais:', error);

      let mensagemErro = 'Não foi possível popular os materiais';
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        mensagemErro = 'Erro de conexão. Verifique se a API está rodando.';
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
          Popular Catálogo Completo
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Popular catálogo de materiais?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação irá importar <strong>{ESTATISTICAS_CATALOGO.total} materiais</strong> do catálogo
            (Gerdau, Açotel, Ciser) para o banco de dados:
            <div className="mt-3 p-3 bg-muted rounded-md text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-blue-600 font-semibold">Cantoneiras:</span> {ESTATISTICAS_CATALOGO.cantoneiras}</div>
                <div><span className="text-blue-600 font-semibold">Perfis W/HP:</span> {ESTATISTICAS_CATALOGO.perfisW}</div>
                <div><span className="text-blue-600 font-semibold">Perfis I:</span> {ESTATISTICAS_CATALOGO.perfisI}</div>
                <div><span className="text-blue-600 font-semibold">Perfis U:</span> {ESTATISTICAS_CATALOGO.perfisU}</div>
                <div><span className="text-green-600 font-semibold">Barras Redondas:</span> {ESTATISTICAS_CATALOGO.barrasRedondas}</div>
                <div><span className="text-green-600 font-semibold">Barras Chatas:</span> {ESTATISTICAS_CATALOGO.barrasChatas}</div>
                <div><span className="text-green-600 font-semibold">Barras Quadradas:</span> {ESTATISTICAS_CATALOGO.barrasQuadradas}</div>
                <div><span className="text-purple-600 font-semibold">Tubos Quadrados:</span> {ESTATISTICAS_CATALOGO.tubosQuadrados}</div>
                <div><span className="text-purple-600 font-semibold">Tubos Retangulares:</span> {ESTATISTICAS_CATALOGO.tubosRetangulares}</div>
                <div><span className="text-orange-600 font-semibold">Chapas:</span> {ESTATISTICAS_CATALOGO.chapas}</div>
                <div><span className="text-yellow-600 font-semibold">Telhas:</span> {ESTATISTICAS_CATALOGO.telhas}</div>
                <div><span className="text-red-600 font-semibold">Parafusos:</span> {ESTATISTICAS_CATALOGO.parafusosA307 + ESTATISTICAS_CATALOGO.parafusosA325 + ESTATISTICAS_CATALOGO.parafusosA489}</div>
              </div>
            </div>
            <p className="mt-3 text-xs">
              Materiais com código já existente serão atualizados. Inclui cálculo automático de área de pintura.
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
                Importando...
              </>
            ) : (
              `Importar ${ESTATISTICAS_CATALOGO.total} Materiais`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PopularMateriaisButton;
