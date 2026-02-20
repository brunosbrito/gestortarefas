import { useState, useEffect } from 'react';
import { Save, X as XIcon, Calculator, Package, Paintbrush } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import MaterialCatalogoService from '@/services/MaterialCatalogoService';
import MaterialPinturaService from '@/services/MaterialPinturaService';
import {
  MaterialCatalogoInterface,
  MaterialCategoria,
  MaterialCategoriaLabels,
  MaterialCategoriaGrupos,
  MaterialCatalogoCreateDTO,
} from '@/interfaces/MaterialCatalogoInterface';
import {
  TipoMaterialPintura,
  MaterialPinturaDTO,
} from '@/interfaces/MaterialPinturaInterface';
import { formatCurrency } from '@/lib/currency';

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialCatalogoInterface | null;
  onSalvar: () => void;
}

const MaterialFormDialog = ({
  open,
  onOpenChange,
  material,
  onSalvar,
}: MaterialFormDialogProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Campos do formulário
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<MaterialCategoria>(MaterialCategoria.PERFIL_I);
  const [fornecedor, setFornecedor] = useState('Gerdau');
  const [unidade, setUnidade] = useState('m');
  const [precoKg, setPrecoKg] = useState('8.00');
  const [pesoNominal, setPesoNominal] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Dimensões básicas (para todos os tipos)
  const [altura, setAltura] = useState('');
  const [larguraMesa, setLarguraMesa] = useState('');
  const [espessuraAlma, setEspessuraAlma] = useState('');
  const [espessuraMesa, setEspessuraMesa] = useState('');

  // Para barras e tubos
  const [diametro, setDiametro] = useState('');
  const [lado, setLado] = useState('');
  const [larguraB, setLarguraB] = useState('');
  const [espessura, setEspessura] = useState('');

  // Para chapas
  const [largura, setLargura] = useState('');
  const [comprimento, setComprimento] = useState('');

  // Para telhas
  const [larguraTotal, setLarguraTotal] = useState('');
  const [larguraUtil, setLarguraUtil] = useState('');
  const [recobrimentoDuplo, setRecobrimentoDuplo] = useState('');

  // Para parafusos
  const [tipo, setTipo] = useState('');
  const [diametroPol, setDiametroPol] = useState('');
  const [comprimentoPol, setComprimentoPol] = useState('');
  const [norma, setNorma] = useState('');

  // Cálculos de pintura (automáticos)
  const [perimetroCalculado, setPerimetroCalculado] = useState<number | null>(null);
  const [areaCalculada, setAreaCalculada] = useState<number | null>(null);

  const fornecedores = ['Gerdau', 'Açotel', 'Ciser'];
  const unidades = ['m', 'kg', 'm²', 'un', 'pc'];

  useEffect(() => {
    if (open) {
      if (material) {
        // Edição
        setCodigo(material.codigo);
        setDescricao(material.descricao);
        setCategoria(material.categoria);
        setFornecedor(material.fornecedor);
        setUnidade(material.unidade);
        setPrecoKg(material.precoKg?.toFixed(2) || '');
        setPesoNominal(material.pesoNominal?.toFixed(2) || '');
        setPrecoUnitario(material.precoUnitario.toFixed(2));
        setObservacoes(material.observacoes || '');

        // Dimensões
        setAltura(material.dimensoes?.altura?.toString() || '');
        setLarguraMesa(material.dimensoes?.larguraMesa?.toString() || '');
        setEspessuraAlma(material.dimensoes?.espessuraAlma?.toString() || '');
        setEspessuraMesa(material.dimensoes?.espessuraMesa?.toString() || '');
        setDiametro(material.dimensoes?.diametro?.toString() || '');
        setLado(material.dimensoes?.lado?.toString() || '');
        setLarguraB(material.dimensoes?.larguraB?.toString() || '');
        setEspessura(material.dimensoes?.espessura?.toString() || '');
        setLargura(material.dimensoes?.largura?.toString() || '');
        setComprimento(material.dimensoes?.comprimento?.toString() || '');
        setLarguraTotal(material.dimensoes?.larguraTotal?.toString() || '');
        setLarguraUtil(material.dimensoes?.larguraUtil?.toString() || '');
        setRecobrimentoDuplo(material.dimensoes?.recobrimentoDuplo?.toString() || '');
        setTipo(material.dimensoes?.tipo || '');
        setDiametroPol(material.dimensoes?.diametroPol || '');
        setComprimentoPol(material.dimensoes?.comprimentoPol || '');
        setNorma(material.dimensoes?.norma || '');
      } else {
        // Novo material - limpar campos
        resetForm();
      }
    }
  }, [open, material]);

  // Calcular precoUnitario quando precoKg ou pesoNominal mudam
  useEffect(() => {
    const precoKgNum = parseFloat(precoKg) || 0;
    const pesoNominalNum = parseFloat(pesoNominal) || 0;

    if (precoKgNum > 0 && pesoNominalNum > 0) {
      const calculado = precoKgNum * pesoNominalNum;
      setPrecoUnitario(calculado.toFixed(2));
    }
  }, [precoKg, pesoNominal]);

  // Calcular área de pintura automaticamente quando dimensões mudarem
  useEffect(() => {
    if (!open) return;

    try {
      // Determinar tipo de material pintura baseado na categoria
      const tipoMapping = mapearCategoriaParaTipoPintura(categoria);
      if (!tipoMapping) {
        setPerimetroCalculado(null);
        setAreaCalculada(null);
        return;
      }

      // Montar dimensões conforme tipo
      const dimensoes = construirDimensoesPintura(categoria, {
        altura,
        largura,
        aba: larguraMesa || '', // Usar larguraMesa como aba se não houver aba explícita
        diametro,
        lado,
        larguraB,
        espessura,
        comprimento,
        enrijecimento: espessuraAlma || '', // Usar espessuraAlma como enrijecimento se aplicável
      });

      // Verificar se tem dimensões mínimas
      const temDimensoes = Object.keys(dimensoes).length > 1; // Mais que apenas 'tipo'
      if (!temDimensoes) {
        setPerimetroCalculado(null);
        setAreaCalculada(null);
        return;
      }

      // Calcular usando service
      const perimetro = MaterialPinturaService.calcularPerimetro(tipoMapping, dimensoes);
      const area = MaterialPinturaService.calcularAreaM2PorMetroLinear(tipoMapping, dimensoes, perimetro);

      setPerimetroCalculado(perimetro);
      setAreaCalculada(area);
    } catch (error) {
      // Silenciar erros durante preenchimento
      setPerimetroCalculado(null);
      setAreaCalculada(null);
    }
  }, [categoria, altura, largura, larguraMesa, diametro, lado, larguraB, espessura, comprimento, espessuraAlma, open]);

  const resetForm = () => {
    setCodigo('');
    setDescricao('');
    setCategoria(MaterialCategoria.PERFIL_I);
    setFornecedor('Gerdau');
    setUnidade('m');
    setPrecoKg('8.00');
    setPesoNominal('');
    setPrecoUnitario('');
    setObservacoes('');

    // Limpar dimensões
    setAltura('');
    setLarguraMesa('');
    setEspessuraAlma('');
    setEspessuraMesa('');
    setDiametro('');
    setLado('');
    setLarguraB('');
    setEspessura('');
    setLargura('');
    setComprimento('');
    setLarguraTotal('');
    setLarguraUtil('');
    setRecobrimentoDuplo('');
    setTipo('');
    setDiametroPol('');
    setComprimentoPol('');
    setNorma('');
  };

  const getGrupoCategoria = (cat: MaterialCategoria): string => {
    for (const [grupo, categorias] of Object.entries(MaterialCategoriaGrupos)) {
      if (categorias.includes(cat)) {
        return grupo;
      }
    }
    return 'outro';
  };

  // Mapear MaterialCategoria → TipoMaterialPintura
  const mapearCategoriaParaTipoPintura = (cat: MaterialCategoria): TipoMaterialPintura | null => {
    const mapping: Record<string, TipoMaterialPintura> = {
      [MaterialCategoria.PERFIL_U]: TipoMaterialPintura.US, // Assumir US por padrão
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

  // Construir dimensões para cálculo de pintura
  const construirDimensoesPintura = (cat: MaterialCategoria, valores: any): Partial<MaterialPinturaDTO> => {
    const tipoCalculo = mapearCategoriaParaTipoPintura(cat);
    if (!tipoCalculo) return {};

    const dimensoes: any = { tipo: tipoCalculo };

    // Mapear campos conforme tipo
    if ([TipoMaterialPintura.UE, TipoMaterialPintura.US, TipoMaterialPintura.W].includes(tipoCalculo)) {
      if (valores.altura) dimensoes.altura = parseFloat(valores.altura);
      if (valores.aba) dimensoes.aba = parseFloat(valores.aba);
      if (valores.enrijecimento != null) dimensoes.enrijecimento = parseFloat(valores.enrijecimento) || 0;
    }

    if (tipoCalculo === TipoMaterialPintura.L) {
      // Cantoneira precisa de aba1 e aba2
      // MaterialCatalogo pode ter aba ou larguraMesa, usar para ambas
      if (valores.aba || valores.larguraMesa) {
        const abaValor = valores.aba || valores.larguraMesa;
        dimensoes.aba1 = parseFloat(abaValor);
        dimensoes.aba2 = parseFloat(abaValor);
      }
    }

    if ([TipoMaterialPintura.FR, TipoMaterialPintura.TB].includes(tipoCalculo)) {
      if (valores.diametro) dimensoes.diametro = parseFloat(valores.diametro);
    }

    if (tipoCalculo === TipoMaterialPintura.MET) {
      if (valores.lado) dimensoes.lado = parseFloat(valores.lado);
      else if (valores.larguraB && valores.altura) {
        dimensoes.largura = parseFloat(valores.larguraB);
        dimensoes.altura = parseFloat(valores.altura);
      }
    }

    if (tipoCalculo === TipoMaterialPintura.CH) {
      if (valores.largura) dimensoes.largura = parseFloat(valores.largura);
      if (valores.comprimento) dimensoes.altura = parseFloat(valores.comprimento); // CH usa "altura" para comprimento
    }

    if (valores.espessura) dimensoes.espessura = parseFloat(valores.espessura);

    return dimensoes;
  };

  const handleSalvar = async () => {
    try {
      // Validações
      if (!codigo.trim()) {
        toast({
          title: 'Erro de validação',
          description: 'Código do material é obrigatório',
          variant: 'destructive',
        });
        return;
      }

      if (!descricao.trim()) {
        toast({
          title: 'Erro de validação',
          description: 'Descrição do material é obrigatória',
          variant: 'destructive',
        });
        return;
      }

      const precoUnitarioNum = parseFloat(precoUnitario);
      if (isNaN(precoUnitarioNum) || precoUnitarioNum <= 0) {
        toast({
          title: 'Erro de validação',
          description: 'Preço unitário deve ser um valor positivo',
          variant: 'destructive',
        });
        return;
      }

      setSaving(true);

      // Montar objeto dimensoes baseado na categoria
      const dimensoes: any = {};

      const grupo = getGrupoCategoria(categoria);

      if (grupo === 'perfis') {
        if (altura) dimensoes.altura = parseFloat(altura);
        if (larguraMesa) dimensoes.larguraMesa = parseFloat(larguraMesa);
        if (espessuraAlma) dimensoes.espessuraAlma = parseFloat(espessuraAlma);
        if (espessuraMesa) dimensoes.espessuraMesa = parseFloat(espessuraMesa);
      } else if (grupo === 'barras' || grupo === 'tubos') {
        if (diametro) dimensoes.diametro = parseFloat(diametro);
        if (lado) dimensoes.lado = parseFloat(lado);
        if (larguraB) dimensoes.larguraB = parseFloat(larguraB);
        if (espessura) dimensoes.espessura = parseFloat(espessura);
      } else if (grupo === 'chapas') {
        if (largura) dimensoes.largura = parseFloat(largura);
        if (comprimento) dimensoes.comprimento = parseFloat(comprimento);
        if (largura && comprimento) {
          const areaM2 = (parseFloat(largura) / 1000) * (parseFloat(comprimento) / 1000);
          dimensoes.area = Math.round(areaM2 * 100) / 100;
        }
      } else if (grupo === 'telhas') {
        if (larguraTotal) dimensoes.larguraTotal = parseFloat(larguraTotal);
        if (larguraUtil) dimensoes.larguraUtil = parseFloat(larguraUtil);
        if (recobrimentoDuplo) dimensoes.recobrimentoDuplo = parseFloat(recobrimentoDuplo);
      } else if (grupo === 'parafusos') {
        if (tipo) dimensoes.tipo = tipo;
        if (diametroPol) dimensoes.diametroPol = diametroPol;
        if (comprimentoPol) dimensoes.comprimentoPol = comprimentoPol;
        if (norma) dimensoes.norma = norma;
      }

      const data: MaterialCatalogoCreateDTO = {
        codigo: codigo.trim(),
        descricao: descricao.trim(),
        categoria,
        fornecedor,
        unidade,
        precoKg: precoKg ? parseFloat(precoKg) : undefined,
        pesoNominal: pesoNominal ? parseFloat(pesoNominal) : undefined,
        precoUnitario: precoUnitarioNum,
        dimensoes,
        observacoes: observacoes.trim() || undefined,
        ativo: true,

        // Dados de pintura (calculados automaticamente)
        perimetroM: perimetroCalculado || undefined,
        areaM2PorMetroLinear: areaCalculada || undefined,
        tipoMaterialPintura: mapearCategoriaParaTipoPintura(categoria) || undefined,
      };

      if (material?.id) {
        // Edição
        await MaterialCatalogoService.atualizar(material.id, {
          id: material.id,
          ...data,
        });
        toast({
          title: 'Sucesso',
          description: 'Material atualizado com sucesso',
        });
      } else {
        // Criação
        await MaterialCatalogoService.criar(data);
        toast({
          title: 'Sucesso',
          description: 'Material criado com sucesso',
        });
      }

      onSalvar();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o material',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const grupoCategoria = getGrupoCategoria(categoria);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            {material ? 'Editar Material' : 'Novo Material'}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos do material. Os campos em verde são editáveis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dados Básicos */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex: W 150 x 13,0"
                className="bg-green-50 dark:bg-green-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={categoria} onValueChange={(v: MaterialCategoria) => setCategoria(v)}>
                <SelectTrigger className="bg-green-50 dark:bg-green-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MaterialCategoria.PERFIL_I}>
                    {MaterialCategoriaLabels[MaterialCategoria.PERFIL_I]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.PERFIL_U}>
                    {MaterialCategoriaLabels[MaterialCategoria.PERFIL_U]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.CANTONEIRA}>
                    {MaterialCategoriaLabels[MaterialCategoria.CANTONEIRA]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.PERFIL_W}>
                    {MaterialCategoriaLabels[MaterialCategoria.PERFIL_W]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.PERFIL_HP}>
                    {MaterialCategoriaLabels[MaterialCategoria.PERFIL_HP]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.BARRA_REDONDA}>
                    {MaterialCategoriaLabels[MaterialCategoria.BARRA_REDONDA]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.BARRA_CHATA}>
                    {MaterialCategoriaLabels[MaterialCategoria.BARRA_CHATA]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.BARRA_QUADRADA}>
                    {MaterialCategoriaLabels[MaterialCategoria.BARRA_QUADRADA]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.TUBO_QUADRADO}>
                    {MaterialCategoriaLabels[MaterialCategoria.TUBO_QUADRADO]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.TUBO_RETANGULAR}>
                    {MaterialCategoriaLabels[MaterialCategoria.TUBO_RETANGULAR]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.TUBO_REDONDO}>
                    {MaterialCategoriaLabels[MaterialCategoria.TUBO_REDONDO]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.CHAPA}>
                    {MaterialCategoriaLabels[MaterialCategoria.CHAPA]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.TELHA_TRAPEZOIDAL}>
                    {MaterialCategoriaLabels[MaterialCategoria.TELHA_TRAPEZOIDAL]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.TELHA_ONDULADA}>
                    {MaterialCategoriaLabels[MaterialCategoria.TELHA_ONDULADA]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.TELHA_MULTIONDA}>
                    {MaterialCategoriaLabels[MaterialCategoria.TELHA_MULTIONDA]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.PARAFUSO_A307}>
                    {MaterialCategoriaLabels[MaterialCategoria.PARAFUSO_A307]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.PARAFUSO_A325}>
                    {MaterialCategoriaLabels[MaterialCategoria.PARAFUSO_A325]}
                  </SelectItem>
                  <SelectItem value={MaterialCategoria.PARAFUSO_A489}>
                    {MaterialCategoriaLabels[MaterialCategoria.PARAFUSO_A489]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição completa do material..."
              className="bg-green-50 dark:bg-green-950"
              rows={2}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Select value={fornecedor} onValueChange={setFornecedor}>
                <SelectTrigger className="bg-green-50 dark:bg-green-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade *</Label>
              <Select value={unidade} onValueChange={setUnidade}>
                <SelectTrigger className="bg-green-50 dark:bg-green-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seção de Preços */}
          <div className="space-y-3 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Preços</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="precoKg">Preço por KG (R$/kg)</Label>
                <Input
                  id="precoKg"
                  type="number"
                  step="0.01"
                  value={precoKg}
                  onChange={(e) => setPrecoKg(e.target.value)}
                  className="bg-green-50 dark:bg-green-950 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pesoNominal">Peso Nominal (kg/{unidade})</Label>
                <Input
                  id="pesoNominal"
                  type="number"
                  step="0.01"
                  value={pesoNominal}
                  onChange={(e) => setPesoNominal(e.target.value)}
                  className="bg-green-50 dark:bg-green-950 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precoUnitario">Preço Unitário * (R$/{unidade})</Label>
                <Input
                  id="precoUnitario"
                  type="number"
                  step="0.01"
                  value={precoUnitario}
                  onChange={(e) => setPrecoUnitario(e.target.value)}
                  className="bg-yellow-50 dark:bg-yellow-950 font-mono font-bold"
                />
                <p className="text-xs text-muted-foreground">
                  {precoKg && pesoNominal && parseFloat(precoKg) > 0 && parseFloat(pesoNominal) > 0
                    ? `Calculado: ${formatCurrency(parseFloat(precoKg) * parseFloat(pesoNominal))}`
                    : 'Digite manualmente ou preencha Preço/kg e Peso'}
                </p>
              </div>
            </div>
          </div>

          {/* Dimensões Condicionais */}
          {grupoCategoria === 'perfis' && (
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold">Dimensões do Perfil (mm)</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="altura">Altura (d)</Label>
                  <Input
                    id="altura"
                    type="number"
                    step="0.01"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="larguraMesa">Largura Mesa (bf)</Label>
                  <Input
                    id="larguraMesa"
                    type="number"
                    step="0.01"
                    value={larguraMesa}
                    onChange={(e) => setLarguraMesa(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="espessuraAlma">Espessura Alma (tw)</Label>
                  <Input
                    id="espessuraAlma"
                    type="number"
                    step="0.01"
                    value={espessuraAlma}
                    onChange={(e) => setEspessuraAlma(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="espessuraMesa">Espessura Mesa (tf)</Label>
                  <Input
                    id="espessuraMesa"
                    type="number"
                    step="0.01"
                    value={espessuraMesa}
                    onChange={(e) => setEspessuraMesa(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                  />
                </div>
              </div>
            </div>
          )}

          {(grupoCategoria === 'barras' || grupoCategoria === 'tubos') && (
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold">Dimensões da {grupoCategoria === 'barras' ? 'Barra' : 'Tubo'} (mm)</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="diametro">Diâmetro</Label>
                  <Input
                    id="diametro"
                    type="number"
                    step="0.01"
                    value={diametro}
                    onChange={(e) => setDiametro(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lado">Lado</Label>
                  <Input
                    id="lado"
                    type="number"
                    step="0.01"
                    value={lado}
                    onChange={(e) => setLado(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="larguraB">Largura B</Label>
                  <Input
                    id="larguraB"
                    type="number"
                    step="0.01"
                    value={larguraB}
                    onChange={(e) => setLarguraB(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="espessura">Espessura</Label>
                  <Input
                    id="espessura"
                    type="number"
                    step="0.01"
                    value={espessura}
                    onChange={(e) => setEspessura(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                  />
                </div>
              </div>
            </div>
          )}

          {grupoCategoria === 'chapas' && (
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold">Dimensões da Chapa (mm)</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="largura">Largura</Label>
                  <Input
                    id="largura"
                    type="number"
                    step="0.01"
                    value={largura}
                    onChange={(e) => setLargura(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                    placeholder="1200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comprimento">Comprimento</Label>
                  <Input
                    id="comprimento"
                    type="number"
                    step="0.01"
                    value={comprimento}
                    onChange={(e) => setComprimento(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                    placeholder="3000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Área (m²)</Label>
                  <Input
                    type="text"
                    value={
                      largura && comprimento
                        ? ((parseFloat(largura) / 1000) * (parseFloat(comprimento) / 1000)).toFixed(2)
                        : ''
                    }
                    disabled
                    className="bg-gray-100 dark:bg-gray-800 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {grupoCategoria === 'telhas' && (
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold">Dimensões da Telha (mm)</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="larguraTotal">Largura Total</Label>
                  <Input
                    id="larguraTotal"
                    type="number"
                    step="0.01"
                    value={larguraTotal}
                    onChange={(e) => setLarguraTotal(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="larguraUtil">Largura Útil</Label>
                  <Input
                    id="larguraUtil"
                    type="number"
                    step="0.01"
                    value={larguraUtil}
                    onChange={(e) => setLarguraUtil(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recobrimentoDuplo">Recobrimento Duplo</Label>
                  <Input
                    id="recobrimentoDuplo"
                    type="number"
                    step="0.01"
                    value={recobrimentoDuplo}
                    onChange={(e) => setRecobrimentoDuplo(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                  />
                </div>
              </div>
            </div>
          )}

          {grupoCategoria === 'parafusos' && (
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold">Especificações do Parafuso</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Input
                    id="tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                    placeholder="Sextavado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diametroPol">Diâmetro (pol)</Label>
                  <Input
                    id="diametroPol"
                    value={diametroPol}
                    onChange={(e) => setDiametroPol(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                    placeholder='1/2"'
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comprimentoPol">Comprimento (pol)</Label>
                  <Input
                    id="comprimentoPol"
                    value={comprimentoPol}
                    onChange={(e) => setComprimentoPol(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                    placeholder='2"'
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="norma">Norma</Label>
                  <Input
                    id="norma"
                    value={norma}
                    onChange={(e) => setNorma(e.target.value)}
                    className="bg-green-50 dark:bg-green-950"
                    placeholder="A307"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÁREA DE PINTURA (Calculado Automaticamente) */}
          {(perimetroCalculado !== null || areaCalculada !== null) && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/50">
              <Paintbrush className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold text-green-900 dark:text-green-100">
                    Área para Pintura (Calculado Automaticamente)
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {categoria !== MaterialCategoria.CHAPA && perimetroCalculado !== null && (
                      <div>
                        <span className="text-muted-foreground">Perímetro:</span>
                        <span className="ml-2 font-bold text-green-600">
                          {perimetroCalculado.toFixed(3)} m
                        </span>
                      </div>
                    )}
                    {areaCalculada !== null && (
                      <div>
                        <span className="text-muted-foreground">
                          {categoria === MaterialCategoria.CHAPA ? 'Área (2 faces):' : 'Área/m linear:'}
                        </span>
                        <span className="ml-2 font-bold text-blue-600">
                          {areaCalculada.toFixed(4)} m²{categoria !== MaterialCategoria.CHAPA && '/m'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais..."
              className="bg-green-50 dark:bg-green-950"
              rows={2}
            />
          </div>

          {/* Preview do Preço */}
          {precoUnitario && parseFloat(precoUnitario) > 0 && (
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/50">
              <Calculator className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Preço Unitário:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(parseFloat(precoUnitario))}/{unidade}
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer com botões */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            <XIcon className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Material'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialFormDialog;
