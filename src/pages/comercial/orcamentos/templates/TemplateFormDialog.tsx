import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import OrcamentoTemplateService from '@/services/OrcamentoTemplateService';
import MaterialCatalogoService from '@/services/MaterialCatalogoService';
import ConsumivelService from '@/services/ConsumivelService';
import MobilizacaoService from '@/services/MobilizacaoService';
import FerramentaService from '@/services/FerramentaService';
import {
  OrcamentoTemplateInterface,
  TemplateCategoriaEnum,
  TemplateCategoriaLabels,
  ComposicaoTemplate,
  ItemTemplate,
} from '@/interfaces/OrcamentoTemplateInterface';
import SelecionarCatalogoDialog, {
  CatalogoItemGenerico,
} from '@/components/comercial/orcamentos/SelecionarCatalogoDialog';

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: OrcamentoTemplateInterface | null;
  onSalvar: () => void;
}


const COMPOSICOES_TIPOS: { tipo: string; label: string; bdiPadrao: number }[] = [
  { tipo: 'mobilizacao', label: 'Mobilização', bdiPadrao: 10 },
  { tipo: 'desmobilizacao', label: 'Desmobilização', bdiPadrao: 10 },
  { tipo: 'mo_fabricacao', label: 'MO Fabricação', bdiPadrao: 25 },
  { tipo: 'mo_montagem', label: 'MO Montagem', bdiPadrao: 25 },
  { tipo: 'mo_terceirizados', label: 'MO Terceirizada', bdiPadrao: 20 },
  { tipo: 'jato_pintura', label: 'Jato/Pintura', bdiPadrao: 12 },
  { tipo: 'ferramentas', label: 'Ferramentas Manuais', bdiPadrao: 15 },
  { tipo: 'ferramentas_eletricas', label: 'Ferramentas Elétricas', bdiPadrao: 15 },
  { tipo: 'consumiveis', label: 'Consumíveis', bdiPadrao: 10 },
  { tipo: 'materiais', label: 'Materiais', bdiPadrao: 25 },
];

function getDefaultComposicoes(): ComposicaoTemplate[] {
  return COMPOSICOES_TIPOS.map((c, i) => ({
    tipo: c.tipo as ComposicaoTemplate['tipo'],
    descricao: c.label,
    bdiPercentual: c.bdiPadrao,
    enabled: true,
    ordem: i + 1,
    itens: [],
  }));
}

function novoItem(ordem: number): ItemTemplate {
  return {
    codigo: '',
    descricao: '',
    quantidade: 1,
    unidade: 'Unid.',
    valorUnitario: 0,
    tipoItem: 'outros',
    ordem,
  };
}

// Mapeia tipo de composição para o catálogo correspondente
function getTipoItem(composicaoTipo: string): string {
  switch (composicaoTipo) {
    case 'materiais': return 'material';
    case 'consumiveis': return 'consumivel';
    case 'ferramentas':
    case 'ferramentas_eletricas': return 'ferramenta';
    case 'mo_fabricacao':
    case 'mo_montagem':
    case 'mo_terceirizados': return 'mao_obra';
    default: return 'outros';
  }
}

export default function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSalvar,
}: TemplateFormDialogProps) {
  const { toast } = useToast();
  const isEditando = !!template;
  const [salvando, setSalvando] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<TemplateCategoriaEnum>(
    TemplateCategoriaEnum.OUTROS,
  );
  const [bdi, setBdi] = useState(25);
  const [lucroTemplate, setLucroTemplate] = useState(20);
  const [iss, setIss] = useState(3);
  const [simples, setSimples] = useState(11.8);
  const [encargos, setEncargos] = useState(58.724);
  const [composicoes, setComposicoes] = useState<ComposicaoTemplate[]>(
    getDefaultComposicoes(),
  );

  // Catálogos carregados
  const catalogosRef = useRef<Record<string, CatalogoItemGenerico[]>>({});
  const [catalogosCarregados, setCatalogosCarregados] = useState(false);
  const [catalogoDialogAberto, setCatalogoDialogAberto] = useState(false);
  const [catalogoDialogTipo, setCatalogoDialogTipo] = useState<string | null>(null);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(false);

  const carregarCatalogos = useCallback(async () => {
    try {
      setCarregandoCatalogo(true);
      const [materiais, consumiveis, mobItems, desmobItems, ferramentas] = await Promise.all([
        MaterialCatalogoService.listar({ ativo: true }).catch(() => []),
        ConsumivelService.getAll({ ativo: true }).catch(() => []),
        MobilizacaoService.getAll({ ativo: true, tipo: 'mobilizacao' as any }).catch(() => []),
        MobilizacaoService.getAll({ ativo: true, tipo: 'desmobilizacao' as any }).catch(() => []),
        FerramentaService.listar({ ativo: true }).catch(() => []),
      ]);

      catalogosRef.current = {
        materiais: materiais.map((m: any) => ({
          id: m.id ?? m.codigo,
          codigo: m.codigo,
          descricao: m.descricao,
          unidade: m.unidade || 'kg',
          valorUnitario: m.precoUnitario || 0,
          categoria: m.categoria,
          material: m.norma || '',
          peso: m.pesoNominal,
        })),
        consumiveis: consumiveis.map((c: any) => ({
          id: c.id ?? c.codigo,
          codigo: c.codigo,
          descricao: c.descricao,
          unidade: c.unidade || 'Unid.',
          valorUnitario: c.precoUnitario || 0,
        })),
        mobilizacao: mobItems.map((m: any) => ({
          id: m.id ?? m.codigo,
          codigo: m.codigo,
          descricao: m.descricao,
          unidade: m.unidade || 'VB',
          valorUnitario: m.precoUnitario || 0,
        })),
        desmobilizacao: desmobItems.map((m: any) => ({
          id: m.id ?? m.codigo,
          codigo: m.codigo,
          descricao: m.descricao,
          unidade: m.unidade || 'VB',
          valorUnitario: m.precoUnitario || 0,
        })),
        ferramentas: ferramentas.map((f: any) => ({
          id: f.id ?? f.codigo,
          codigo: f.codigo,
          descricao: f.descricao,
          unidade: 'Mês',
          valorUnitario: f.custoMensal || 0,
        })),
        ferramentas_eletricas: ferramentas.map((f: any) => ({
          id: f.id ?? f.codigo,
          codigo: f.codigo,
          descricao: f.descricao,
          unidade: 'Mês',
          valorUnitario: f.custoMensal || 0,
        })),
      };
      setCatalogosCarregados(true);
    } catch {
      console.error('Erro ao carregar catálogos');
    } finally {
      setCarregandoCatalogo(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setExpandido(null);
      setCatalogosCarregados(false);
      carregarCatalogos();

      if (template) {
        setNome(template.nome);
        setDescricao(template.descricao || '');
        setCategoria(template.categoria);
        setBdi((template.configuracoes.bdi || 0) * 100);
        setLucroTemplate((template.configuracoes.lucro || 0) * 100);
        setIss((template.configuracoes.tributos?.iss || 0) * 100);
        setSimples((template.configuracoes.tributos?.simples || 0) * 100);
        setEncargos((template.configuracoes.encargos || 0) * 100);
        setComposicoes(
          template.composicoesTemplate.length > 0
            ? template.composicoesTemplate.map((c) => ({ ...c, itens: c.itens || [] }))
            : getDefaultComposicoes(),
        );
      } else {
        setNome('');
        setDescricao('');
        setCategoria(TemplateCategoriaEnum.OUTROS);
        setBdi(25);
        setIss(3);
        setSimples(11.8);
        setEncargos(58.724);
        setComposicoes(getDefaultComposicoes());
      }
    }
  }, [open, template, carregarCatalogos]);

  const toggleComposicao = (tipo: string, enabled: boolean) => {
    setComposicoes((prev) =>
      prev.map((c) => (c.tipo === tipo ? { ...c, enabled } : c)),
    );
  };

  const alterarBdiComposicao = (tipo: string, bdiPercentual: number) => {
    setComposicoes((prev) =>
      prev.map((c) => (c.tipo === tipo ? { ...c, bdiPercentual } : c)),
    );
  };

  const adicionarItem = (tipo: string) => {
    setComposicoes((prev) =>
      prev.map((c) => {
        if (c.tipo !== tipo) return c;
        const itens = [...(c.itens || []), { ...novoItem((c.itens?.length || 0) + 1), tipoItem: getTipoItem(tipo) }];
        return { ...c, itens };
      }),
    );
  };

  const removerItem = (tipo: string, index: number) => {
    setComposicoes((prev) =>
      prev.map((c) => {
        if (c.tipo !== tipo) return c;
        const itens = (c.itens || []).filter((_, i) => i !== index)
          .map((item, i) => ({ ...item, ordem: i + 1 }));
        return { ...c, itens };
      }),
    );
  };

  const atualizarItem = (tipo: string, index: number, campo: keyof ItemTemplate, valor: any) => {
    setComposicoes((prev) =>
      prev.map((c) => {
        if (c.tipo !== tipo) return c;
        const itens = (c.itens || []).map((item, i) =>
          i === index ? { ...item, [campo]: valor } : item,
        );
        return { ...c, itens };
      }),
    );
  };

  // Itens do catálogo para o dialog atual
  const catalogoDialogItems = useMemo(() => {
    if (!catalogoDialogTipo) return [];
    return catalogosRef.current[catalogoDialogTipo] || [];
  }, [catalogoDialogTipo, catalogosCarregados]);

  const catalogoDialogTitulo = useMemo(() => {
    if (!catalogoDialogTipo) return 'Catálogo';
    const config = COMPOSICOES_TIPOS.find((c) => c.tipo === catalogoDialogTipo);
    return `Catálogo - ${config?.label || catalogoDialogTipo}`;
  }, [catalogoDialogTipo]);

  const catalogoCategorias = useMemo(() => {
    if (catalogoDialogTipo !== 'materiais') return undefined;
    const cats = new Set(catalogoDialogItems.map((i) => i.categoria).filter(Boolean));
    return Array.from(cats) as string[];
  }, [catalogoDialogTipo, catalogoDialogItems]);

  const abrirCatalogoDialog = (tipo: string) => {
    setCatalogoDialogTipo(tipo);
    setCatalogoDialogAberto(true);
  };

  const handleAdicionarDoCatalogo = (items: CatalogoItemGenerico[]) => {
    if (!catalogoDialogTipo) return;
    const tipo = catalogoDialogTipo;

    setComposicoes((prev) =>
      prev.map((c) => {
        if (c.tipo !== tipo) return c;
        const itensExistentes = c.itens || [];
        const novosItens: ItemTemplate[] = items.map((item, idx) => ({
          codigo: item.codigo,
          descricao: item.descricao,
          quantidade: 1,
          unidade: item.unidade,
          valorUnitario: item.valorUnitario,
          tipoItem: getTipoItem(tipo),
          material: item.material,
          peso: item.peso,
          ordem: itensExistentes.length + idx + 1,
        }));
        return { ...c, itens: [...itensExistentes, ...novosItens] };
      }),
    );
    setCatalogoDialogTipo(null);
  };

  // Lookup de código no catálogo
  const handleCodigoBlur = (composicaoTipo: string, index: number, codigo: string) => {
    if (!codigo.trim() || !catalogosCarregados) return;

    const catalogo = catalogosRef.current[composicaoTipo];
    if (!catalogo) return;

    const codigoNorm = codigo.trim().toLowerCase();
    const encontrado = catalogo.find(
      (item) => item.codigo.toLowerCase() === codigoNorm,
    );

    if (encontrado) {
      setComposicoes((prev) =>
        prev.map((c) => {
          if (c.tipo !== composicaoTipo) return c;
          const itens = (c.itens || []).map((item, i) =>
            i === index
              ? {
                  ...item,
                  codigo: encontrado.codigo,
                  descricao: encontrado.descricao,
                  unidade: encontrado.unidade,
                  valorUnitario: encontrado.valorUnitario,
                }
              : item,
          );
          return { ...c, itens };
        }),
      );
    }
  };

  const handleSalvar = async () => {
    if (!nome.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    const data = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      categoria,
      configuracoes: {
        bdi: bdi / 100,
        lucro: lucroTemplate / 100,
        tributos: {
          iss: iss / 100,
          simples: simples / 100,
          total: (iss + simples) / 100,
        },
        encargos: encargos / 100,
      },
      composicoesTemplate: composicoes,
      ativo: true,
    };

    try {
      setSalvando(true);
      if (isEditando && template) {
        await OrcamentoTemplateService.update({ id: template.id, ...data });
        toast({ title: 'Sucesso', description: 'Template atualizado' });
      } else {
        await OrcamentoTemplateService.create(data);
        toast({ title: 'Sucesso', description: 'Template criado' });
      }
      onOpenChange(false);
      onSalvar();
    } catch {
      toast({
        title: 'Erro',
        description: `Não foi possível ${isEditando ? 'atualizar' : 'criar'} o template`,
        variant: 'destructive',
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditando ? 'Editar Template' : 'Novo Template'}</DialogTitle>
          <DialogDescription>
            {isEditando
              ? 'Altere as configurações e itens do template'
              : 'Configure um novo template com itens pré-definidos'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dados básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Galpão Industrial"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição do template..."
                rows={2}
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v as TemplateCategoriaEnum)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TemplateCategoriaEnum).map(([, value]) => (
                    <SelectItem key={value} value={value}>
                      {TemplateCategoriaLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configurações */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Configurações Gerais</h4>
            <div className="grid grid-cols-5 gap-3">
              <div>
                <Label htmlFor="bdi">BDI (%)</Label>
                <Input
                  id="bdi"
                  type="number"
                  step="0.1"
                  value={bdi}
                  onChange={(e) => setBdi(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="lucro-tmpl">Lucro (%)</Label>
                <Input
                  id="lucro-tmpl"
                  type="number"
                  step="0.1"
                  value={lucroTemplate}
                  onChange={(e) => setLucroTemplate(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="iss">ISS (%)</Label>
                <Input
                  id="iss"
                  type="number"
                  step="0.1"
                  value={iss}
                  onChange={(e) => setIss(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="simples">Simples (%)</Label>
                <Input
                  id="simples"
                  type="number"
                  step="0.1"
                  value={simples}
                  onChange={(e) => setSimples(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="encargos">Encargos (%)</Label>
                <Input
                  id="encargos"
                  type="number"
                  step="0.001"
                  value={encargos}
                  onChange={(e) => setEncargos(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Composições com itens */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Composições e Itens</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Use &quot;Adicionar do Catálogo&quot; para selecionar vários itens de uma vez
            </p>
            <div className="space-y-2">
              {composicoes.map((comp) => {
                const config = COMPOSICOES_TIPOS.find((c) => c.tipo === comp.tipo);
                const isExpanded = expandido === comp.tipo;
                const qtdItens = comp.itens?.length || 0;

                return (
                  <div key={comp.tipo} className="rounded border">
                    {/* Header da composição */}
                    <div className="flex items-center gap-3 p-2">
                      <Checkbox
                        checked={comp.enabled}
                        onCheckedChange={(checked) =>
                          toggleComposicao(comp.tipo, !!checked)
                        }
                      />
                      <button
                        type="button"
                        className="flex items-center gap-1 flex-1 text-left"
                        onClick={() => setExpandido(isExpanded ? null : comp.tipo)}
                        disabled={!comp.enabled}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={`text-sm font-medium ${!comp.enabled ? 'text-muted-foreground line-through' : ''}`}>
                          {config?.label || comp.descricao}
                        </span>
                        {qtdItens > 0 && (
                          <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            {qtdItens}
                          </span>
                        )}
                      </button>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-muted-foreground">BDI:</Label>
                        <Input
                          type="number"
                          step="1"
                          className="w-20 h-8 text-sm"
                          value={comp.bdiPercentual}
                          onChange={(e) =>
                            alterarBdiComposicao(comp.tipo, Number(e.target.value))
                          }
                          disabled={!comp.enabled}
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>

                    {/* Itens expandidos */}
                    {isExpanded && comp.enabled && (
                      <div className="border-t px-3 py-2 bg-muted/30 space-y-2">
                        {(comp.itens || []).length === 0 ? (
                          <p className="text-xs text-muted-foreground py-1">Nenhum item adicionado</p>
                        ) : (
                          <div className="space-y-1">
                            {/* Header da tabela de itens */}
                            <div className="grid grid-cols-[1fr_2fr_60px_70px_80px_32px] gap-1 text-xs text-muted-foreground font-medium px-1">
                              <span>Código</span>
                              <span>Descrição</span>
                              <span>Qtd</span>
                              <span>Unidade</span>
                              <span>Valor</span>
                              <span></span>
                            </div>
                            {(comp.itens || []).map((item, idx) => (
                              <div
                                key={idx}
                                className="grid grid-cols-[1fr_2fr_60px_70px_80px_32px] gap-1 items-center"
                              >
                                <Input
                                  className="h-7 text-xs"
                                  value={item.codigo}
                                  onChange={(e) => atualizarItem(comp.tipo, idx, 'codigo', e.target.value)}
                                  onBlur={(e) => handleCodigoBlur(comp.tipo, idx, e.target.value)}
                                  placeholder="Código"
                                />
                                <Input
                                  className="h-7 text-xs"
                                  value={item.descricao}
                                  onChange={(e) => atualizarItem(comp.tipo, idx, 'descricao', e.target.value)}
                                  placeholder="Descrição"
                                />
                                <Input
                                  className="h-7 text-xs"
                                  type="number"
                                  value={item.quantidade}
                                  onChange={(e) => atualizarItem(comp.tipo, idx, 'quantidade', Number(e.target.value))}
                                />
                                <Input
                                  className="h-7 text-xs"
                                  value={item.unidade}
                                  onChange={(e) => atualizarItem(comp.tipo, idx, 'unidade', e.target.value)}
                                />
                                <Input
                                  className="h-7 text-xs"
                                  type="number"
                                  step="0.01"
                                  value={item.valorUnitario}
                                  onChange={(e) => atualizarItem(comp.tipo, idx, 'valorUnitario', Number(e.target.value))}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => removerItem(comp.tipo, idx)}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => abrirCatalogoDialog(comp.tipo)}
                          >
                            <Package className="h-3 w-3 mr-1" />
                            Adicionar do Catálogo
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => adicionarItem(comp.tipo)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar Manual
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : isEditando ? 'Salvar Alterações' : 'Criar Template'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Dialog de seleção do catálogo */}
      <SelecionarCatalogoDialog
        open={catalogoDialogAberto}
        onOpenChange={setCatalogoDialogAberto}
        items={catalogoDialogItems}
        onSelecionar={handleAdicionarDoCatalogo}
        titulo={catalogoDialogTitulo}
        categorias={catalogoCategorias}
        carregando={carregandoCatalogo}
      />
    </Dialog>
  );
}
