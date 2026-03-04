import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Save, X as XIcon, Calculator, AlertCircle, Check, ChevronsUpDown, Plus, Copy, Trash2 } from 'lucide-react';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CargoService } from '@/services/CargoService';
import { EpiService } from '@/services/EpiService';
import {
  Cargo,
  CreateCargo,
  CustosDiversos,
  ItemCustoRateado,
  CALCULOS_MO,
} from '@/interfaces/CargoInterface';
import { EpiCatalogo } from '@/interfaces/EpiInterface';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface CargoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargo: Cargo | null;
  onSalvar: () => void;
}

interface ItemRow {
  descricao: string;
  quantidade: string;
  valorUnitario: string;
}

const CargoFormDialog = ({
  open,
  onOpenChange,
  cargo,
  onSalvar,
}: CargoFormDialogProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [confirmandoPadronizar, setConfirmandoPadronizar] = useState(false);
  const [salvandoPadronizar, setSalvandoPadronizar] = useState(false);
  const [salarioMinimoRef, setSalarioMinimoRef] = useState(1612.0);
  const [nomesDisponiveis, setNomesDisponiveis] = useState<string[]>([]);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [nivel, setNivel] = useState('');
  const [categoria, setCategoria] = useState<'fabricacao' | 'montagem' | 'ambos'>('fabricacao');
  const [salarioBase, setSalarioBase] = useState('');
  const [temPericulosidade, setTemPericulosidade] = useState(false);
  const [grauInsalubridade, setGrauInsalubridade] = useState<'nenhum' | 'minimo' | 'medio' | 'maximo'>('nenhum');
  const [tipoContrato, setTipoContrato] = useState<'mensalista' | 'horista'>('mensalista');
  const [horasMes, setHorasMes] = useState('184');
  const [observacoes, setObservacoes] = useState('');

  // Custos diversos — campos simples (mensais)
  const [cafeManha, setCafeManha] = useState('264.00');
  const [almoco, setAlmoco] = useState('440.00');
  const [janta, setJanta] = useState('0.00');
  const [cestaBasica, setCestaBasica] = useState('150.00');
  const [transporte, setTransporte] = useState('0.00');
  const [assistenciaMedica, setAssistenciaMedica] = useState('195.00');
  const [outros, setOutros] = useState('0.00');

  // F3) Uniforme — composição de itens + período de rateio
  const [uniformeItens, setUniformeItens] = useState<ItemRow[]>([
    { descricao: 'Jaleco', quantidade: '3', valorUnitario: '30.00' },
    { descricao: 'Calça', quantidade: '3', valorUnitario: '25.00' },
  ]);
  const [uniformePeriodo, setUniformePeriodo] = useState('6');

  // F4) Despesas Admissionais — valor por evento + período de vínculo
  const [admissionalValorEvento, setAdmissionalValorEvento] = useState('500.00');
  const [admissionalPeriodo, setAdmissionalPeriodo] = useState('24');

  // F6) EPI's / EPC — composição de itens + período de rateio
  const [epiItens, setEpiItens] = useState<ItemRow[]>([
    { descricao: 'Botina', quantidade: '1', valorUnitario: '120.00' },
    { descricao: 'Capacete', quantidade: '1', valorUnitario: '30.00' },
    { descricao: 'Abafador', quantidade: '1', valorUnitario: '25.00' },
    { descricao: 'Creme Protetor', quantidade: '6', valorUnitario: '8.00' },
  ]);
  const [epiPeriodo, setEpiPeriodo] = useState('12');

  // Catálogo de EPIs para combobox no F6
  const [epiCatalogo, setEpiCatalogo] = useState<EpiCatalogo[]>([]);
  const [epiComboboxOpen, setEpiComboboxOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (open) {
      carregarSalarioMinimo();
      carregarNomesCargos();
      EpiService.listAtivos().then(setEpiCatalogo).catch(() => {});
      if (cargo) {
        // Edição
        setNome(cargo.nome);
        setNivel(cargo.nivel || '');
        setCategoria(cargo.categoria);
        setSalarioBase(cargo.salarioBase.toFixed(2));
        setTemPericulosidade(cargo.temPericulosidade);
        setGrauInsalubridade(cargo.grauInsalubridade);
        setTipoContrato(cargo.tipoContrato);
        setHorasMes(cargo.horasMes.toString());
        setObservacoes(cargo.observacoes || '');

        // Custos simples (mensais)
        setCafeManha(cargo.custos.alimentacao.cafeManha.toFixed(2));
        setAlmoco(cargo.custos.alimentacao.almoco.toFixed(2));
        setJanta(cargo.custos.alimentacao.janta.toFixed(2));
        setCestaBasica(cargo.custos.alimentacao.cestaBasica.toFixed(2));
        setTransporte(cargo.custos.transporte.toFixed(2));
        setAssistenciaMedica(cargo.custos.assistenciaMedica.toFixed(2));
        setOutros(cargo.custos.outros.toFixed(2));

        // Uniforme estruturado
        setUniformeItens(cargo.custos.uniforme.itens.map((i: ItemCustoRateado) => ({
          descricao: i.descricao,
          quantidade: i.quantidade.toString(),
          valorUnitario: i.valorUnitario.toFixed(2),
        })));
        setUniformePeriodo(cargo.custos.uniforme.periodoMeses.toString());

        // Despesas Admissionais estruturado
        setAdmissionalValorEvento(cargo.custos.despesasAdmissionais.valorPorEvento.toFixed(2));
        setAdmissionalPeriodo(cargo.custos.despesasAdmissionais.periodoMeses.toString());

        // EPI estruturado
        setEpiItens(cargo.custos.epiEpc.itens.map((i: ItemCustoRateado) => ({
          descricao: i.descricao,
          quantidade: i.quantidade.toString(),
          valorUnitario: i.valorUnitario.toFixed(2),
        })));
        setEpiPeriodo(cargo.custos.epiEpc.periodoMeses.toString());
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

  const carregarNomesCargos = async () => {
    try {
      const cargos = await CargoService.listAtivos();
      // Extrair nomes únicos e ordenar alfabeticamente
      const nomes = [...new Set(cargos.map(c => c.nome))].sort();
      setNomesDisponiveis(nomes);
    } catch (error) {
      console.error('Erro ao carregar nomes de cargos:', error);
    }
  };

  const resetForm = () => {
    setNome('');
    setNivel('');
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
    setAssistenciaMedica('195.00');
    setOutros('0.00');
    setUniformeItens([
      { descricao: 'Jaleco', quantidade: '3', valorUnitario: '30.00' },
      { descricao: 'Calça', quantidade: '3', valorUnitario: '25.00' },
    ]);
    setUniformePeriodo('6');
    setAdmissionalValorEvento('500.00');
    setAdmissionalPeriodo('24');
    setEpiItens([
      { descricao: 'Botina', quantidade: '1', valorUnitario: '120.00' },
      { descricao: 'Capacete', quantidade: '1', valorUnitario: '30.00' },
      { descricao: 'Abafador', quantidade: '1', valorUnitario: '25.00' },
      { descricao: 'Creme Protetor', quantidade: '6', valorUnitario: '8.00' },
    ]);
    setEpiPeriodo('12');
  };

  // Helpers para linhas de itens
  const addItemRow = (setter: Dispatch<SetStateAction<ItemRow[]>>) =>
    setter((prev) => [...prev, { descricao: '', quantidade: '1', valorUnitario: '0.00' }]);

  const removeItemRow = (setter: Dispatch<SetStateAction<ItemRow[]>>, idx: number) =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  const updateItemRow = (
    setter: Dispatch<SetStateAction<ItemRow[]>>,
    idx: number,
    field: keyof ItemRow,
    value: string
  ) => setter((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

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

    // F3) Uniforme rateado
    const totalUniformeBruto = uniformeItens.reduce(
      (sum, item) => sum + (parseFloat(item.quantidade) || 0) * (parseFloat(item.valorUnitario) || 0), 0
    );
    const unifPer = Math.max(parseFloat(uniformePeriodo) || 1, 1);
    const custoMensalUniforme = totalUniformeBruto / unifPer;

    // F4) Admissional
    const admValor = parseFloat(admissionalValorEvento) || 0;
    const admPer = Math.max(parseFloat(admissionalPeriodo) || 1, 1);
    const admEventos = admPer >= 12 ? 3 : 2;
    const custoMensalAdmissional = (admValor * admEventos) / admPer;

    // F6) EPI rateado
    const totalEpiBruto = epiItens.reduce(
      (sum, item) => sum + (parseFloat(item.quantidade) || 0) * (parseFloat(item.valorUnitario) || 0), 0
    );
    const epiPer = Math.max(parseFloat(epiPeriodo) || 1, 1);
    const custoMensalEpi = totalEpiBruto / epiPer;

    const totalCustosDiversos =
      totalAlimentacao +
      (parseFloat(transporte) || 0) +
      custoMensalUniforme +
      custoMensalAdmissional +
      (parseFloat(assistenciaMedica) || 0) +
      custoMensalEpi +
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
      // Subtotais para display nas seções
      totalUniformeBruto, custoMensalUniforme, unifPer,
      admValor, admPer, admEventos, custoMensalAdmissional,
      totalEpiBruto, custoMensalEpi, epiPer,
    };
  };

  const buildCustosFromForm = (): CustosDiversos => ({
    alimentacao: {
      cafeManha: parseFloat(cafeManha) || 0,
      almoco: parseFloat(almoco) || 0,
      janta: parseFloat(janta) || 0,
      cestaBasica: parseFloat(cestaBasica) || 0,
    },
    transporte: parseFloat(transporte) || 0,
    uniforme: {
      itens: uniformeItens.map((item) => ({
        descricao: item.descricao,
        quantidade: parseFloat(item.quantidade) || 0,
        valorUnitario: parseFloat(item.valorUnitario) || 0,
      })),
      periodoMeses: Math.max(parseFloat(uniformePeriodo) || 1, 1),
    },
    despesasAdmissionais: {
      valorPorEvento: parseFloat(admissionalValorEvento) || 0,
      periodoMeses: Math.max(parseFloat(admissionalPeriodo) || 1, 1),
    },
    assistenciaMedica: parseFloat(assistenciaMedica) || 0,
    epiEpc: {
      itens: epiItens.map((item) => ({
        descricao: item.descricao,
        quantidade: parseFloat(item.quantidade) || 0,
        valorUnitario: parseFloat(item.valorUnitario) || 0,
      })),
      periodoMeses: Math.max(parseFloat(epiPeriodo) || 1, 1),
    },
    outros: parseFloat(outros) || 0,
  });

  const handlePadronizarCustos = async () => {
    try {
      setSalvandoPadronizar(true);
      const total = await CargoService.padronizarCustos(buildCustosFromForm());
      toast({
        title: 'Custos padronizados',
        description: `Custos diversos aplicados a ${total} cargo(s) e recalculados com sucesso.`,
        duration: 5000,
      });
      setConfirmandoPadronizar(false);
      onSalvar();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível padronizar os custos', variant: 'destructive' });
    } finally {
      setSalvandoPadronizar(false);
    }
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

      const custos: CustosDiversos = buildCustosFromForm();

      const data: CreateCargo = {
        nome: nome.trim(),
        nivel: nivel.trim() || undefined,
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cargo *</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900"
                  >
                    {nome || "Selecione ou digite um cargo..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar ou digitar novo cargo..."
                      value={nome}
                      onValueChange={setNome}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && nome.trim()) {
                          e.preventDefault();
                          setComboboxOpen(false);
                        }
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <div className="py-6 text-center text-sm">
                          <p className="text-green-600 dark:text-green-400 font-medium">
                            ✓ Novo cargo: "{nome}"
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Pressione <kbd className="px-1.5 py-0.5 text-xs font-semibold border rounded bg-muted">Enter</kbd> ou clique fora para confirmar
                          </p>
                        </div>
                      </CommandEmpty>
                      <CommandGroup heading="Cargos Cadastrados">
                        {nomesDisponiveis.map((nomeCargo) => (
                          <CommandItem
                            key={nomeCargo}
                            value={nomeCargo}
                            onSelect={(currentValue) => {
                              setNome(currentValue);
                              setComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                nome === nomeCargo ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {nomeCargo}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setNome('');
                            setComboboxOpen(false);
                          }}
                          className="text-green-600 dark:text-green-400 font-medium"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Cadastrar Novo
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Selecione um cargo existente ou digite um novo nome
              </p>
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
            <div className="space-y-2">
              <Label htmlFor="nivel">Nível</Label>
              <Select value={nivel || '_none'} onValueChange={(v) => setNivel(v === '_none' ? '' : v)}>
                <SelectTrigger className="bg-green-50 dark:bg-green-950">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— Sem nível —</SelectItem>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Produção
                  </div>
                  <SelectItem value="I">I</SelectItem>
                  <SelectItem value="II">II</SelectItem>
                  <SelectItem value="III">III</SelectItem>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-t mt-1">
                    Engenharia
                  </div>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Pleno">Pleno</SelectItem>
                  <SelectItem value="Sênior">Sênior</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Nível padrão do cargo (pode ser sobrescrito no orçamento)
              </p>
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

            {/* F2, F5, F7: campos mensais simples */}
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label htmlFor="transporte" className="text-xs">F2) Transporte (mensal)</Label>
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
                <Label htmlFor="assistenciaMedica" className="text-xs">F5) Assistência Médica (mensal)</Label>
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
                <Label htmlFor="outros" className="text-xs">F7) Outros (mensal)</Label>
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

            {/* F3) Uniforme — composição de itens rateada */}
            <div className="space-y-2 p-3 border rounded-md bg-muted/20">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-sm font-medium">F3) Uniforme</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Período:</span>
                  <Select value={uniformePeriodo} onValueChange={setUniformePeriodo}>
                    <SelectTrigger className="h-7 w-28 text-xs bg-green-50 dark:bg-green-950">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['1','2','3','6','9','12'].map((m) => (
                        <SelectItem key={m} value={m}>{m} mês{Number(m) > 1 ? 'es' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button" size="sm" variant="outline"
                    className="h-7 text-xs"
                    onClick={() => addItemRow(setUniformeItens)}
                  >
                    <Plus className="h-3 w-3 mr-1" />Adicionar
                  </Button>
                </div>
              </div>
              {uniformeItens.length > 0 && (
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-1.5 text-left font-medium">Descrição</th>
                        <th className="p-1.5 text-center font-medium w-16">Qtd</th>
                        <th className="p-1.5 text-center font-medium w-28">Valor Unit.</th>
                        <th className="p-1.5 text-center font-medium w-24">Subtotal</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {uniformeItens.map((item, idx) => {
                        const subtotal = (parseFloat(item.quantidade) || 0) * (parseFloat(item.valorUnitario) || 0);
                        return (
                          <tr key={idx} className="border-t">
                            <td className="p-1">
                              <Input
                                value={item.descricao}
                                onChange={(e) => updateItemRow(setUniformeItens, idx, 'descricao', e.target.value)}
                                className="h-7 text-xs bg-green-50 dark:bg-green-950"
                                placeholder="Ex: Jaleco"
                              />
                            </td>
                            <td className="p-1">
                              <Input
                                type="number" min={1}
                                value={item.quantidade}
                                onChange={(e) => updateItemRow(setUniformeItens, idx, 'quantidade', e.target.value)}
                                className="h-7 text-xs text-center font-mono bg-green-50 dark:bg-green-950"
                              />
                            </td>
                            <td className="p-1">
                              <Input
                                type="number" step="0.01" min={0}
                                value={item.valorUnitario}
                                onChange={(e) => updateItemRow(setUniformeItens, idx, 'valorUnitario', e.target.value)}
                                className="h-7 text-xs text-center font-mono bg-green-50 dark:bg-green-950"
                              />
                            </td>
                            <td className="p-1 text-center font-mono text-muted-foreground">
                              {formatCurrency(subtotal)}
                            </td>
                            <td className="p-1 text-center">
                              <Button
                                type="button" size="icon" variant="ghost"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => removeItemRow(setUniformeItens, idx)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-right">
                Total: <span className="font-mono">{formatCurrency(preview.totalUniformeBruto)}</span>
                {' '}÷ {uniformePeriodo} meses ={' '}
                <span className="font-semibold text-foreground">{formatCurrency(preview.custoMensalUniforme)}/mês</span>
              </p>
            </div>

            {/* F4) Despesas Admissionais */}
            <div className="space-y-2 p-3 border rounded-md bg-muted/20">
              <Label className="text-sm font-medium">F4) Despesas Admissionais</Label>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label className="text-xs">Valor por evento (R$)</Label>
                  <Input
                    type="number" step="0.01" min={0}
                    value={admissionalValorEvento}
                    onChange={(e) => setAdmissionalValorEvento(e.target.value)}
                    className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                    placeholder="500.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Produção: R$500 · ADM/Eng: R$125</p>
                </div>
                <div>
                  <Label className="text-xs">Período médio de vínculo (meses)</Label>
                  <Input
                    type="number" min={1}
                    value={admissionalPeriodo}
                    onChange={(e) => setAdmissionalPeriodo(e.target.value)}
                    className="bg-green-50 dark:bg-green-950 font-mono text-sm"
                    placeholder="24"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tempo médio estimado do vínculo empregatício
                  </p>
                </div>
              </div>

              {/* Tabela de eventos */}
              <div className="border rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-1.5 text-left font-medium">Evento</th>
                      <th className="p-1.5 text-center font-medium w-28">Valor</th>
                      <th className="p-1.5 text-left font-medium">Condição</th>
                      <th className="p-1.5 text-center font-medium w-16">Incluso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { nome: 'Admissional',         condicao: 'Sempre',              ativo: true },
                      { nome: 'Demissional',          condicao: 'Sempre',              ativo: true },
                      { nome: 'Periódico (exame)',    condicao: 'Período ≥ 12 meses',  ativo: preview.admEventos >= 3 },
                    ].map((ev) => (
                      <tr key={ev.nome} className={`border-t transition-opacity ${!ev.ativo ? 'opacity-40' : ''}`}>
                        <td className="p-1.5 font-medium">{ev.nome}</td>
                        <td className="p-1.5 text-center font-mono">
                          {ev.ativo ? formatCurrency(preview.admValor) : '—'}
                        </td>
                        <td className="p-1.5 text-muted-foreground">{ev.condicao}</td>
                        <td className="p-1.5 text-center">
                          {ev.ativo
                            ? <span className="text-green-600 font-bold">✓</span>
                            : <span className="text-muted-foreground">✗</span>
                          }
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted/30 font-semibold">
                      <td className="p-1.5">Total</td>
                      <td className="p-1.5 text-center font-mono">
                        {formatCurrency(preview.admValor * preview.admEventos)}
                      </td>
                      <td className="p-1.5 text-muted-foreground text-xs">
                        {preview.admEventos} evento(s) × R${admissionalValorEvento}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-muted-foreground text-right">
                <span className="font-mono">{formatCurrency(preview.admValor * preview.admEventos)}</span>
                {' '}÷ {admissionalPeriodo} meses ={' '}
                <span className="font-semibold text-foreground">{formatCurrency(preview.custoMensalAdmissional)}/mês</span>
                <span className="text-muted-foreground ml-2">
                  (diluído no custo HH — não se acumula entre projetos)
                </span>
              </p>
            </div>

            {/* F6) EPI's / EPC — composição de itens rateada */}
            <div className="space-y-2 p-3 border rounded-md bg-muted/20">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-sm font-medium">F6) EPI's / EPC</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Período:</span>
                  <Select value={epiPeriodo} onValueChange={setEpiPeriodo}>
                    <SelectTrigger className="h-7 w-28 text-xs bg-green-50 dark:bg-green-950">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['1','2','3','6','9','12'].map((m) => (
                        <SelectItem key={m} value={m}>{m} mês{Number(m) > 1 ? 'es' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button" size="sm" variant="outline"
                    className="h-7 text-xs"
                    onClick={() => addItemRow(setEpiItens)}
                  >
                    <Plus className="h-3 w-3 mr-1" />Adicionar
                  </Button>
                </div>
              </div>
              {epiItens.length > 0 && (
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-1.5 text-left font-medium">Descrição</th>
                        <th className="p-1.5 text-center font-medium w-16">Qtd</th>
                        <th className="p-1.5 text-center font-medium w-28">Valor Unit.</th>
                        <th className="p-1.5 text-center font-medium w-24">Subtotal</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {epiItens.map((item, idx) => {
                        const subtotal = (parseFloat(item.quantidade) || 0) * (parseFloat(item.valorUnitario) || 0);
                        const isOpen = epiComboboxOpen[idx] ?? false;
                        return (
                          <tr key={idx} className="border-t">
                            <td className="p-1">
                              <Popover
                                open={isOpen}
                                onOpenChange={(v) =>
                                  setEpiComboboxOpen((prev) => ({ ...prev, [idx]: v }))
                                }
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    className="h-7 w-full justify-between text-xs font-normal bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 px-2"
                                  >
                                    <span className="truncate">
                                      {item.descricao || 'Selecione ou digite...'}
                                    </span>
                                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-0" align="start">
                                  <Command>
                                    <CommandInput
                                      placeholder="Buscar EPI ou digitar..."
                                      value={item.descricao}
                                      onValueChange={(v) =>
                                        updateItemRow(setEpiItens, idx, 'descricao', v)
                                      }
                                    />
                                    <CommandList>
                                      {epiCatalogo.length > 0 ? (
                                        <CommandGroup heading="Catálogo de EPIs">
                                          {epiCatalogo
                                            .filter((e) =>
                                              e.descricao
                                                .toLowerCase()
                                                .includes(item.descricao.toLowerCase())
                                            )
                                            .slice(0, 10)
                                            .map((e) => (
                                              <CommandItem
                                                key={e.id}
                                                value={e.descricao}
                                                onSelect={() => {
                                                  setEpiItens((prev) =>
                                                    prev.map((it, i) =>
                                                      i === idx
                                                        ? {
                                                            ...it,
                                                            descricao: e.descricao,
                                                            valorUnitario: e.valorReferencia.toFixed(2),
                                                          }
                                                        : it
                                                    )
                                                  );
                                                  setEpiComboboxOpen((prev) => ({
                                                    ...prev,
                                                    [idx]: false,
                                                  }));
                                                }}
                                              >
                                                <div className="flex flex-col w-full">
                                                  <span className="text-xs font-medium">{e.descricao}</span>
                                                  <span className="text-xs text-muted-foreground">
                                                    {e.unidade} · CA {e.ca || '—'} · {formatCurrency(e.valorReferencia)}
                                                  </span>
                                                </div>
                                              </CommandItem>
                                            ))}
                                        </CommandGroup>
                                      ) : (
                                        <CommandEmpty>
                                          <p className="text-xs text-muted-foreground py-2">
                                            Catálogo vazio — cadastre EPIs em Configurações
                                          </p>
                                        </CommandEmpty>
                                      )}
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </td>
                            <td className="p-1">
                              <Input
                                type="number" min={1}
                                value={item.quantidade}
                                onChange={(e) => updateItemRow(setEpiItens, idx, 'quantidade', e.target.value)}
                                className="h-7 text-xs text-center font-mono bg-green-50 dark:bg-green-950"
                              />
                            </td>
                            <td className="p-1">
                              <Input
                                type="number" step="0.01" min={0}
                                value={item.valorUnitario}
                                onChange={(e) => updateItemRow(setEpiItens, idx, 'valorUnitario', e.target.value)}
                                className="h-7 text-xs text-center font-mono bg-green-50 dark:bg-green-950"
                              />
                            </td>
                            <td className="p-1 text-center font-mono text-muted-foreground">
                              {formatCurrency(subtotal)}
                            </td>
                            <td className="p-1 text-center">
                              <Button
                                type="button" size="icon" variant="ghost"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => removeItemRow(setEpiItens, idx)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-right">
                Total: <span className="font-mono">{formatCurrency(preview.totalEpiBruto)}</span>
                {' '}÷ {epiPeriodo} meses ={' '}
                <span className="font-semibold text-foreground">{formatCurrency(preview.custoMensalEpi)}/mês</span>
              </p>
            </div>

            <div className="pt-2 border-t flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm font-semibold">
                Total Custos Diversos: {formatCurrency(preview.totalCustosDiversos)}
              </p>

              {!confirmandoPadronizar ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmandoPadronizar(true)}
                  className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950"
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Aplicar a todos os cargos
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Sobrescrever custos em TODOS os cargos?
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handlePadronizarCustos}
                    disabled={salvandoPadronizar}
                    className="bg-amber-600 hover:bg-amber-700 text-white h-7 px-3 text-xs"
                  >
                    {salvandoPadronizar ? 'Aplicando...' : 'Confirmar'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmandoPadronizar(false)}
                    disabled={salvandoPadronizar}
                    className="h-7 px-3 text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
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
