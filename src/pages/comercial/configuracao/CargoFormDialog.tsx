import { useState, useEffect } from 'react';
import { Save, X as XIcon, Calculator, AlertCircle } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CargoService } from '@/services/CargoService';
import {
  Cargo,
  CreateCargo,
  CustosDiversos,
  CALCULOS_MO,
} from '@/interfaces/CargoInterface';
import { formatCurrency } from '@/lib/currency';

interface CargoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargo: Cargo | null;
  onSalvar: () => void;
}

const CargoFormDialog = ({
  open,
  onOpenChange,
  cargo,
  onSalvar,
}: CargoFormDialogProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [salarioMinimoRef, setSalarioMinimoRef] = useState(1612.0);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<'fabricacao' | 'montagem' | 'ambos'>('fabricacao');
  const [salarioBase, setSalarioBase] = useState('');
  const [temPericulosidade, setTemPericulosidade] = useState(false);
  const [grauInsalubridade, setGrauInsalubridade] = useState<'nenhum' | 'minimo' | 'medio' | 'maximo'>('nenhum');
  const [tipoContrato, setTipoContrato] = useState<'mensalista' | 'horista'>('mensalista');
  const [horasMes, setHorasMes] = useState('184');
  const [observacoes, setObservacoes] = useState('');

  // Custos diversos
  const [cafeManha, setCafeManha] = useState('264.00');
  const [almoco, setAlmoco] = useState('440.00');
  const [janta, setJanta] = useState('0.00');
  const [cestaBasica, setCestaBasica] = useState('150.00');
  const [transporte, setTransporte] = useState('0.00');
  const [uniforme, setUniforme] = useState('170.00');
  const [despesasAdmissionais, setDespesasAdmissionais] = useState('291.67');
  const [assistenciaMedica, setAssistenciaMedica] = useState('195.00');
  const [epiEpc, setEpiEpc] = useState('167.00');
  const [outros, setOutros] = useState('0.00');

  useEffect(() => {
    if (open) {
      carregarSalarioMinimo();
      if (cargo) {
        // Edição
        setNome(cargo.nome);
        setCategoria(cargo.categoria);
        setSalarioBase(cargo.salarioBase.toFixed(2));
        setTemPericulosidade(cargo.temPericulosidade);
        setGrauInsalubridade(cargo.grauInsalubridade);
        setTipoContrato(cargo.tipoContrato);
        setHorasMes(cargo.horasMes.toString());
        setObservacoes(cargo.observacoes || '');

        // Custos
        setCafeManha(cargo.custos.alimentacao.cafeManha.toFixed(2));
        setAlmoco(cargo.custos.alimentacao.almoco.toFixed(2));
        setJanta(cargo.custos.alimentacao.janta.toFixed(2));
        setCestaBasica(cargo.custos.alimentacao.cestaBasica.toFixed(2));
        setTransporte(cargo.custos.transporte.toFixed(2));
        setUniforme(cargo.custos.uniforme.toFixed(2));
        setDespesasAdmissionais(cargo.custos.despesasAdmissionais.toFixed(2));
        setAssistenciaMedica(cargo.custos.assistenciaMedica.toFixed(2));
        setEpiEpc(cargo.custos.epiEpc.toFixed(2));
        setOutros(cargo.custos.outros.toFixed(2));
      } else {
        // Novo cargo - limpar campos
        resetForm();
      }
    }
  }, [open, cargo]);

  const carregarSalarioMinimo = async () => {
    const config = await CargoService.getConfiguracao();
    setSalarioMinimoRef(config.salarioMinimoReferencia);
  };

  const resetForm = () => {
    setNome('');
    setCategoria('fabricacao');
    setSalarioBase('');
    setTemPericulosidade(false);
    setGrauInsalubridade('nenhum');
    setTipoContrato('mensalista');
    setHorasMes('184');
    setObservacoes('');
    setCafeManha('264.00');
    setAlmoco('440.00');
    setJanta('0.00');
    setCestaBasica('150.00');
    setTransporte('0.00');
    setUniforme('170.00');
    setDespesasAdmissionais('291.67');
    setAssistenciaMedica('195.00');
    setEpiEpc('167.00');
    setOutros('0.00');
  };

  // Cálculos em tempo real
  const calcularPreview = () => {
    const salarioBaseNum = parseFloat(salarioBase) || 0;
    const horasMesNum = parseFloat(horasMes) || 184;

    // B) Periculosidade
    const valorPericulosidade = temPericulosidade
      ? salarioBaseNum * CALCULOS_MO.PERICULOSIDADE
      : 0;

    // C) Insalubridade
    let valorInsalubridade = 0;
    switch (grauInsalubridade) {
      case 'minimo':
        valorInsalubridade = salarioMinimoRef * CALCULOS_MO.INSALUBRIDADE.MINIMO;
        break;
      case 'medio':
        valorInsalubridade = salarioMinimoRef * CALCULOS_MO.INSALUBRIDADE.MEDIO;
        break;
      case 'maximo':
        valorInsalubridade = salarioMinimoRef * CALCULOS_MO.INSALUBRIDADE.MAXIMO;
        break;
    }

    // D) Total Salário
    const totalSalario = salarioBaseNum + valorPericulosidade + valorInsalubridade;

    // E) Encargos
    const valorEncargos = totalSalario * CALCULOS_MO.ENCARGOS_PADRAO;

    // F) Custos Diversos
    const totalAlimentacao =
      (parseFloat(cafeManha) || 0) +
      (parseFloat(almoco) || 0) +
      (parseFloat(janta) || 0) +
      (parseFloat(cestaBasica) || 0);

    const totalCustosDiversos =
      totalAlimentacao +
      (parseFloat(transporte) || 0) +
      (parseFloat(uniforme) || 0) +
      (parseFloat(despesasAdmissionais) || 0) +
      (parseFloat(assistenciaMedica) || 0) +
      (parseFloat(epiEpc) || 0) +
      (parseFloat(outros) || 0);

    // H) Total Custos MO
    const totalCustosMO = totalSalario + valorEncargos + totalCustosDiversos;

    // Custo HH
    const custoHH = horasMesNum > 0 ? totalCustosMO / horasMesNum : 0;

    return {
      valorPericulosidade,
      valorInsalubridade,
      totalSalario,
      valorEncargos,
      totalCustosDiversos,
      totalCustosMO,
      custoHH,
    };
  };

  const handleSalvar = async () => {
    try {
      // Validações
      if (!nome.trim()) {
        toast({
          title: 'Erro de validação',
          description: 'Nome do cargo é obrigatório',
          variant: 'destructive',
        });
        return;
      }

      const salarioBaseNum = parseFloat(salarioBase);
      if (isNaN(salarioBaseNum) || salarioBaseNum <= 0) {
        toast({
          title: 'Erro de validação',
          description: 'Salário base deve ser um valor positivo',
          variant: 'destructive',
        });
        return;
      }

      // Validação CLT: não pode acumular periculosidade e insalubridade
      if (temPericulosidade && grauInsalubridade !== 'nenhum') {
        toast({
          title: 'Erro de validação',
          description: 'Não é permitido acumular periculosidade e insalubridade (CLT Art. 193, § 2º)',
          variant: 'destructive',
        });
        return;
      }

      const horasMesNum = parseFloat(horasMes);
      if (isNaN(horasMesNum) || horasMesNum <= 0) {
        toast({
          title: 'Erro de validação',
          description: 'Horas/mês deve ser um valor positivo',
          variant: 'destructive',
        });
        return;
      }

      setSaving(true);

      const custos: CustosDiversos = {
        alimentacao: {
          cafeManha: parseFloat(cafeManha) || 0,
          almoco: parseFloat(almoco) || 0,
          janta: parseFloat(janta) || 0,
          cestaBasica: parseFloat(cestaBasica) || 0,
        },
        transporte: parseFloat(transporte) || 0,
        uniforme: parseFloat(uniforme) || 0,
        despesasAdmissionais: parseFloat(despesasAdmissionais) || 0,
        assistenciaMedica: parseFloat(assistenciaMedica) || 0,
        epiEpc: parseFloat(epiEpc) || 0,
        outros: parseFloat(outros) || 0,
      };

      const data: CreateCargo = {
        nome: nome.trim(),
        categoria,
        salarioBase: salarioBaseNum,
        temPericulosidade,
        grauInsalubridade,
        tipoContrato,
        horasMes: horasMesNum,
        custos,
        observacoes: observacoes.trim() || undefined,
      };

      if (cargo) {
        // Edição
        await CargoService.update({
          id: cargo.id,
          ...data,
        });
        toast({
          title: 'Sucesso',
          description: 'Cargo atualizado com sucesso',
        });
      } else {
        // Criação
        await CargoService.create(data);
        toast({
          title: 'Sucesso',
          description: 'Cargo criado com sucesso',
        });
      }

      onSalvar();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar cargo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o cargo',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const preview = calcularPreview();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cargo ? 'Editar Cargo' : 'Novo Cargo'} - Composição de Custos
          </DialogTitle>
          <DialogDescription>
            Preencha os campos verdes. Os valores serão calculados automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dados Básicos */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cargo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: SOLDADOR"
                className="bg-green-50 dark:bg-green-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={categoria} onValueChange={(v: any) => setCategoria(v)}>
                <SelectTrigger className="bg-green-50 dark:bg-green-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fabricacao">Fabricação</SelectItem>
                  <SelectItem value="montagem">Montagem</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seção A: Salário Base */}
          <div className="space-y-3 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              A) Salário Base
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salarioBase">Salário Mensal (sem encargos) *</Label>
                <Input
                  id="salarioBase"
                  type="number"
                  step="0.01"
                  value={salarioBase}
                  onChange={(e) => setSalarioBase(e.target.value)}
                  placeholder="3200.00"
                  className="bg-green-50 dark:bg-green-950 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Seção B e C: Adicionais */}
          <div className="space-y-3 p-4 border rounded-lg bg-orange-50/50 dark:bg-orange-950/20">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">
              B) Periculosidade e C) Insalubridade
            </h3>

            {/* Alert CLT */}
            <Alert className="border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-xs text-orange-900 dark:text-orange-100">
                <strong>CLT Art. 193, § 2º:</strong> Não é permitido acumular periculosidade e insalubridade.
                O trabalhador deve optar pelo adicional mais vantajoso.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {/* Checkbox customizado com X */}
                  <button
                    type="button"
                    id="periculosidade"
                    disabled={grauInsalubridade !== 'nenhum'}
                    onClick={() => {
                      if (grauInsalubridade === 'nenhum') {
                        const newValue = !temPericulosidade;
                        setTemPericulosidade(newValue);
                        if (newValue) {
                          setGrauInsalubridade('nenhum');
                        }
                      }
                    }}
                    className={`
                      h-5 w-5 rounded border-2 flex items-center justify-center
                      transition-all duration-200
                      ${grauInsalubridade !== 'nenhum'
                        ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-100'
                        : temPericulosidade
                        ? 'border-orange-500 bg-orange-500 hover:bg-orange-600'
                        : 'border-gray-300 bg-green-50 dark:bg-green-950 hover:border-orange-400'
                      }
                    `}
                  >
                    {temPericulosidade && (
                      <XIcon className="h-4 w-4 text-white font-bold" strokeWidth={3} />
                    )}
                  </button>
                  <Label
                    htmlFor="periculosidade"
                    className={`cursor-pointer ${grauInsalubridade !== 'nenhum' ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (grauInsalubridade === 'nenhum') {
                        const newValue = !temPericulosidade;
                        setTemPericulosidade(newValue);
                        if (newValue) {
                          setGrauInsalubridade('nenhum');
                        }
                      }
                    }}
                  >
                    Possui Periculosidade (30%)
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Valor: {formatCurrency(preview.valorPericulosidade)}
                </p>
                {grauInsalubridade !== 'nenhum' && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 ml-6">
                    Desative a insalubridade para habilitar
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="insalubridade">Grau de Insalubridade</Label>
                <Select
                  value={grauInsalubridade}
                  disabled={temPericulosidade}
                  onValueChange={(v: any) => {
                    setGrauInsalubridade(v);
                    if (v !== 'nenhum') {
                      // Se marcar insalubridade, desmarcar periculosidade
                      setTemPericulosidade(false);
                    }
                  }}
                >
                  <SelectTrigger className={`bg-green-50 dark:bg-green-950 ${temPericulosidade ? 'opacity-50' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    <SelectItem value="minimo">Mínimo (10%)</SelectItem>
                    <SelectItem value="medio">Médio (20%)</SelectItem>
                    <SelectItem value="maximo">Máximo (40%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Valor: {formatCurrency(preview.valorInsalubridade)}
                </p>
                {temPericulosidade && (
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Desmarque a periculosidade para habilitar
                  </p>
                )}
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-semibold">
                D) Total do Salário: {formatCurrency(preview.totalSalario)}
              </p>
              <p className="text-xs text-muted-foreground">
                E) Encargos Sociais (58,7%): {formatCurrency(preview.valorEncargos)}
              </p>
            </div>
          </div>

          {/* Seção F: Custos Diversos */}
          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-semibold">F) Custos Diversos</h3>

            {/* F1: Alimentação */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">F1) Alimentação</Label>
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <Label htmlFor="cafeManha" className="text-xs">Café Manhã</Label>
                  <Input
                    id="cafeManha"
                    type="number"
                    step="0.01"
                    value={cafeManha}
                    onChange={(e) => setCafeManha(e.target.value)}
                    className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="almoco" className="text-xs">Almoço</Label>
                  <Input
                    id="almoco"
                    type="number"
                    step="0.01"
                    value={almoco}
                    onChange={(e) => setAlmoco(e.target.value)}
                    className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="janta" className="text-xs">Janta</Label>
                  <Input
                    id="janta"
                    type="number"
                    step="0.01"
                    value={janta}
                    onChange={(e) => setJanta(e.target.value)}
                    className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="cestaBasica" className="text-xs">Cesta Básica</Label>
                  <Input
                    id="cestaBasica"
                    type="number"
                    step="0.01"
                    value={cestaBasica}
                    onChange={(e) => setCestaBasica(e.target.value)}
                    className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* F2-F7: Outros custos */}
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label htmlFor="transporte" className="text-xs">F2) Transporte</Label>
                <Input
                  id="transporte"
                  type="number"
                  step="0.01"
                  value={transporte}
                  onChange={(e) => setTransporte(e.target.value)}
                  className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="uniforme" className="text-xs">F3) Uniforme</Label>
                <Input
                  id="uniforme"
                  type="number"
                  step="0.01"
                  value={uniforme}
                  onChange={(e) => setUniforme(e.target.value)}
                  className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="despesasAdmissionais" className="text-xs">
                  F4) Despesas Admissionais
                </Label>
                <Input
                  id="despesasAdmissionais"
                  type="number"
                  step="0.01"
                  value={despesasAdmissionais}
                  onChange={(e) => setDespesasAdmissionais(e.target.value)}
                  className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="assistenciaMedica" className="text-xs">
                  F5) Assistência Médica
                </Label>
                <Input
                  id="assistenciaMedica"
                  type="number"
                  step="0.01"
                  value={assistenciaMedica}
                  onChange={(e) => setAssistenciaMedica(e.target.value)}
                  className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="epiEpc" className="text-xs">F6) EPI's / EPC</Label>
                <Input
                  id="epiEpc"
                  type="number"
                  step="0.01"
                  value={epiEpc}
                  onChange={(e) => setEpiEpc(e.target.value)}
                  className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="outros" className="text-xs">F7) Outros</Label>
                <Input
                  id="outros"
                  type="number"
                  step="0.01"
                  value={outros}
                  onChange={(e) => setOutros(e.target.value)}
                  className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-semibold">
                Total Custos Diversos: {formatCurrency(preview.totalCustosDiversos)}
              </p>
            </div>
          </div>

          {/* Seção G: Horas */}
          <div className="space-y-3 p-4 border rounded-lg bg-purple-50/50 dark:bg-purple-950/20">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">
              G) Horas Trabalhadas
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipoContrato">Tipo de Contrato</Label>
                <Select
                  value={tipoContrato}
                  onValueChange={(v: any) => {
                    setTipoContrato(v);
                    setHorasMes(v === 'mensalista' ? '184' : '220');
                  }}
                >
                  <SelectTrigger className="bg-green-50 dark:bg-green-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensalista">Mensalista (184h)</SelectItem>
                    <SelectItem value="horista">Horista (220h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="horasMes">Horas/Mês *</Label>
                <Input
                  id="horasMes"
                  type="number"
                  value={horasMes}
                  onChange={(e) => setHorasMes(e.target.value)}
                  className="bg-green-50 dark:bg-green-950 font-mono"
                />
              </div>
            </div>
          </div>

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

          {/* Resultado Final */}
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/50">
            <Calculator className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">H) Total dos custos de MO sem BDI:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(preview.totalCustosMO)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-blue-300">
                  <span className="text-xl font-bold">★ CUSTO HOMEM HORA (HH):</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(preview.custoHH)}/h
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cálculo: Total MO ({formatCurrency(preview.totalCustosMO)}) ÷ Horas/mês ({horasMes}h)
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Footer com botões */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            <XIcon className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Cargo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CargoFormDialog;
