import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Tag,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  useCostCenters,
  useCreateCostCenter,
  useUpdateCostCenter,
  useDeleteCostCenter,
  useClassificationRules,
  useCreateClassificationRule,
  useDeleteClassificationRule,
} from '@/hooks/suprimentos/useCostCenters';
import { CostCenter, ClassificationRule } from '@/interfaces/suprimentos/CostCenterInterface';

const CentrosCusto = () => {
  const [activeTab, setActiveTab] = useState('centers');
  const [selectedCenter, setSelectedCenter] = useState<CostCenter | null>(null);
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  // Queries
  const { data: costCenters, isLoading: centersLoading } = useCostCenters();
  const { data: rules, isLoading: rulesLoading } = useClassificationRules();

  // Mutations
  const createCenter = useCreateCostCenter();
  const updateCenter = useUpdateCostCenter();
  const deleteCenter = useDeleteCostCenter();
  const createRule = useCreateClassificationRule();
  const deleteRule = useDeleteClassificationRule();

  const [formData, setFormData] = useState<Partial<CostCenter>>({
    code: '',
    name: '',
    description: '',
    category: 'material',
    parentId: null,
    level: 1,
    keywords: [],
    color: '#3b82f6',
    budget: {
      allocated: 0,
      consumed: 0,
      remaining: 0,
      percentage: 0,
    },
  });

  const [ruleFormData, setRuleFormData] = useState<Partial<ClassificationRule>>({
    name: '',
    description: '',
    costCenterId: 0,
    keywords: [],
    priority: 5,
    matchType: 'contains',
    confidence: 80,
  });

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateCenter = () => {
    setSelectedCenter(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      category: 'material',
      parentId: null,
      level: 1,
      keywords: [],
      color: '#3b82f6',
      budget: {
        allocated: 0,
        consumed: 0,
        remaining: 0,
        percentage: 0,
      },
    });
    setShowCenterModal(true);
  };

  const handleEditCenter = (center: CostCenter) => {
    setSelectedCenter(center);
    setFormData(center);
    setShowCenterModal(true);
  };

  const handleDeleteCenter = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este centro de custo?')) {
      await deleteCenter.mutateAsync(id);
    }
  };

  const handleSubmitCenter = async () => {
    if (selectedCenter) {
      await updateCenter.mutateAsync({ id: selectedCenter.id, data: formData });
    } else {
      await createCenter.mutateAsync(formData);
    }
    setShowCenterModal(false);
  };

  const handleCreateRule = () => {
    setRuleFormData({
      name: '',
      description: '',
      costCenterId: 0,
      keywords: [],
      priority: 5,
      matchType: 'contains',
      confidence: 80,
    });
    setShowRuleModal(true);
  };

  const handleSubmitRule = async () => {
    await createRule.mutateAsync(ruleFormData);
    setShowRuleModal(false);
  };

  const handleDeleteRule = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta regra?')) {
      await deleteRule.mutateAsync(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      material: { label: 'Material', color: 'bg-blue-500' },
      service: { label: 'Serviço', color: 'bg-green-500' },
      equipment: { label: 'Equipamento', color: 'bg-orange-500' },
      overhead: { label: 'Overhead', color: 'bg-gray-500' },
      labor: { label: 'Mão de Obra', color: 'bg-purple-500' },
    };
    const badge = badges[category] || { label: category, color: 'bg-gray-500' };
    return (
      <Badge className={`${badge.color} text-white`}>{badge.label}</Badge>
    );
  };

  const renderCostCenterTree = (parentId: number | null = null, level: number = 1) => {
    const centers = (costCenters || []).filter((c) => c.parentId === parentId);

    return centers.map((center) => {
      const hasChildren = (costCenters || []).some((c) => c.parentId === center.id);
      const isExpanded = expandedIds.includes(center.id);
      const budgetPercent = center.budget?.percentage || 0;
      const isOverBudget = budgetPercent > 90;

      return (
        <div key={center.id} className={`${level > 1 ? 'ml-8' : ''}`}>
          <Card className="mb-3">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {hasChildren && (
                      <button
                        onClick={() => toggleExpand(center.id)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: center.color }}
                    />
                    <h4 className="font-semibold text-lg">{center.name}</h4>
                    <Badge variant="outline">{center.code}</Badge>
                    {getCategoryBadge(center.category)}
                    {!center.isActive && (
                      <Badge variant="destructive">Inativo</Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 ml-7">
                    {center.description}
                  </p>

                  {/* Budget Tracking */}
                  {center.budget && (
                    <div className="ml-7 space-y-2">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Alocado</p>
                          <p className="font-medium">{formatCurrency(center.budget.allocated)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Consumido</p>
                          <p className="font-medium text-blue-600">
                            {formatCurrency(center.budget.consumed)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Restante</p>
                          <p className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(center.budget.remaining)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : ''}`}>
                          {budgetPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {center.keywords && center.keywords.length > 0 && (
                    <div className="mt-3 ml-7 flex flex-wrap gap-1">
                      {center.keywords.slice(0, 5).map((keyword, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {center.keywords.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{center.keywords.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCenter(center)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCenter(center.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Render children recursively */}
          {hasChildren && isExpanded && renderCostCenterTree(center.id, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Centros de Custo</h1>
        <p className="text-muted-foreground">
          Gestão e classificação hierárquica de centros de custo
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Total de Centros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{costCenters?.length || 0}</p>
            <p className="text-xs text-muted-foreground">
              Ativos: {costCenters?.filter((c) => c.isActive).length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(
                costCenters?.reduce((sum, c) => sum + (c.budget?.allocated || 0), 0) || 0
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Consumido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(
                costCenters?.reduce((sum, c) => sum + (c.budget?.consumed || 0), 0) || 0
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Regras Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rules?.filter((r) => r.isActive).length || 0}</p>
            <p className="text-xs text-muted-foreground">
              Total: {rules?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="centers">Centros de Custo</TabsTrigger>
          <TabsTrigger value="rules">Regras de Classificação</TabsTrigger>
        </TabsList>

        {/* Tab: Centros de Custo */}
        <TabsContent value="centers" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Visualização hierárquica dos centros de custo
            </p>
            <Button onClick={handleCreateCenter}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Centro
            </Button>
          </div>

          {centersLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando centros de custo...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">{renderCostCenterTree()}</div>
          )}
        </TabsContent>

        {/* Tab: Regras de Classificação */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Regras para classificação automática de itens
            </p>
            <Button onClick={handleCreateRule}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </div>

          {rulesLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando regras...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {rules?.map((rule) => {
                const center = costCenters?.find((c) => c.id === rule.costCenterId);
                return (
                  <Card key={rule.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{rule.name}</h4>
                            <Badge variant="outline">
                              Prioridade: {rule.priority}
                            </Badge>
                            <Badge variant="outline">
                              Confiança: {rule.confidence}%
                            </Badge>
                            {!rule.isActive && (
                              <Badge variant="destructive">Inativa</Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {rule.description}
                          </p>

                          {center && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-muted-foreground">
                                Classifica como:
                              </span>
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: center.color }}
                              />
                              <span className="text-sm font-medium">
                                {center.name}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1 mt-2">
                            {rule.keywords.map((keyword, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal: Criar/Editar Centro */}
      <Dialog open={showCenterModal} onOpenChange={setShowCenterModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCenter ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do centro de custo
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: MAT-CIM"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="service">Serviço</SelectItem>
                  <SelectItem value="equipment">Equipamento</SelectItem>
                  <SelectItem value="labor">Mão de Obra</SelectItem>
                  <SelectItem value="overhead">Overhead</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cimentos e Argamassas"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o centro de custo"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Centro Pai (opcional)</Label>
              <Select
                value={formData.parentId?.toString() || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value === 'none' ? null : Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (Nível 1)</SelectItem>
                  {costCenters
                    ?.filter((c) => c.level === 1)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="keywords">Palavras-chave (separadas por vírgula)</Label>
              <Input
                id="keywords"
                value={formData.keywords?.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    keywords: e.target.value.split(',').map((k) => k.trim()),
                  })
                }
                placeholder="Ex: cimento, argamassa, massa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allocated">Budget Alocado (R$)</Label>
              <Input
                id="allocated"
                type="number"
                value={formData.budget?.allocated || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: {
                      ...formData.budget!,
                      allocated: Number(e.target.value),
                      remaining:
                        Number(e.target.value) - (formData.budget?.consumed || 0),
                    },
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCenterModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitCenter}>
              {selectedCenter ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Criar Regra */}
      <Dialog open={showRuleModal} onOpenChange={setShowRuleModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Regra de Classificação</DialogTitle>
            <DialogDescription>
              Defina uma regra para classificar automaticamente itens
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="ruleName">Nome da Regra</Label>
              <Input
                id="ruleName"
                value={ruleFormData.name}
                onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                placeholder="Ex: Cimento CP-II"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="ruleDescription">Descrição</Label>
              <Textarea
                id="ruleDescription"
                value={ruleFormData.description}
                onChange={(e) =>
                  setRuleFormData({ ...ruleFormData, description: e.target.value })
                }
                placeholder="Descreva a regra"
                rows={2}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="costCenter">Centro de Custo de Destino</Label>
              <Select
                value={ruleFormData.costCenterId?.toString() || '0'}
                onValueChange={(value) =>
                  setRuleFormData({ ...ruleFormData, costCenterId: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um centro" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters?.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="ruleKeywords">
                Palavras-chave (separadas por vírgula)
              </Label>
              <Input
                id="ruleKeywords"
                value={ruleFormData.keywords?.join(', ')}
                onChange={(e) =>
                  setRuleFormData({
                    ...ruleFormData,
                    keywords: e.target.value.split(',').map((k) => k.trim()),
                  })
                }
                placeholder="Ex: cimento cp-ii, cp-ii, cimento cp2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade (1-10)</Label>
              <Input
                id="priority"
                type="number"
                min={1}
                max={10}
                value={ruleFormData.priority}
                onChange={(e) =>
                  setRuleFormData({ ...ruleFormData, priority: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence">Confiança (%)</Label>
              <Input
                id="confidence"
                type="number"
                min={0}
                max={100}
                value={ruleFormData.confidence}
                onChange={(e) =>
                  setRuleFormData({ ...ruleFormData, confidence: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitRule}>Criar Regra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CentrosCusto;
