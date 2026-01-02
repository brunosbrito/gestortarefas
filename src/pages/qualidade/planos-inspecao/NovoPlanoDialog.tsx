import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import PlanoInspecaoService from '@/services/PlanoInspecaoService';
import { PlanoInspecao, CampoPlanoInspecao } from '@/interfaces/QualidadeInterfaces';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface NovoPlanoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  plano?: PlanoInspecao | null;
}

export const NovoPlanoDialog = ({
  open,
  onOpenChange,
  onSuccess,
  plano,
}: NovoPlanoDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'em_processo',
    produto: '',
    processo: '',
    frequencia: '',
    ativo: true,
  });

  const [campos, setCampos] = useState<Partial<CampoPlanoInspecao>[]>([]);

  useEffect(() => {
    if (plano) {
      setFormData({
        nome: plano.nome,
        descricao: plano.descricao || '',
        tipo: plano.tipo,
        produto: plano.produto || '',
        processo: plano.processo || '',
        frequencia: plano.frequencia || '',
        ativo: plano.ativo,
      });
      setCampos(plano.campos || []);
    } else {
      resetForm();
    }
  }, [plano, open]);

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'em_processo',
      produto: '',
      processo: '',
      frequencia: '',
      ativo: true,
    });
    setCampos([]);
  };

  const adicionarCampo = () => {
    setCampos([
      ...campos,
      {
        id: `temp-${Date.now()}`,
        nome: '',
        tipo: 'texto',
        obrigatorio: true,
        ordem: campos.length,
      },
    ]);
  };

  const removerCampo = (index: number) => {
    setCampos(campos.filter((_, i) => i !== index));
  };

  const atualizarCampo = (index: number, field: string, value: any) => {
    const novosCampos = [...campos];
    novosCampos[index] = { ...novosCampos[index], [field]: value };
    setCampos(novosCampos);
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome do plano é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (campos.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um campo ao plano.',
        variant: 'destructive',
      });
      return;
    }

    // Validar campos
    for (const campo of campos) {
      if (!campo.nome?.trim()) {
        toast({
          title: 'Erro',
          description: 'Todos os campos devem ter um nome.',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);

    try {
      const data = {
        ...formData,
        campos: campos.map((campo, index) => ({
          ...campo,
          ordem: index,
        })),
      };

      if (plano) {
        await PlanoInspecaoService.update(plano.id, data);
        toast({
          title: 'Sucesso',
          description: 'Plano de inspeção atualizado com sucesso.',
        });
      } else {
        await PlanoInspecaoService.create(data);
        toast({
          title: 'Sucesso',
          description: 'Plano de inspeção criado com sucesso.',
        });
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o plano de inspeção.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plano ? 'Editar Plano de Inspeção' : 'Novo Plano de Inspeção'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Nome do Plano *</Label>
                  <Input
                    placeholder="Ex: Inspeção de Soldas Estruturais"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descreva o propósito deste plano de inspeção..."
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Inspeção *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recebimento">Recebimento de Material</SelectItem>
                      <SelectItem value="em_processo">Em Processo (Fabricação)</SelectItem>
                      <SelectItem value="final">Produto Final</SelectItem>
                      <SelectItem value="auditoria">Auditoria Interna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Input
                    placeholder="Ex: A cada lote, Semanal, etc."
                    value={formData.frequencia}
                    onChange={(e) =>
                      setFormData({ ...formData, frequencia: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Produto/Categoria</Label>
                  <Input
                    placeholder="Ex: Aço CA-50, Vigas, etc."
                    value={formData.produto}
                    onChange={(e) =>
                      setFormData({ ...formData, produto: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Processo</Label>
                  <Input
                    placeholder="Ex: Soldagem, Pintura, etc."
                    value={formData.processo}
                    onChange={(e) =>
                      setFormData({ ...formData, processo: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campos de Inspeção */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Campos de Inspeção</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={adicionarCampo}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Campo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {campos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum campo adicionado ainda.</p>
                  <p className="text-sm mt-2">
                    Clique em "Adicionar Campo" para começar.
                  </p>
                </div>
              ) : (
                campos.map((campo, index) => (
                  <Card key={campo.id || index} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-5 h-5 text-muted-foreground mt-2" />
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2 md:col-span-2">
                              <Label>Nome da Característica *</Label>
                              <Input
                                placeholder="Ex: Diâmetro, Comprimento, Aspecto Visual, etc."
                                value={campo.nome || ''}
                                onChange={(e) =>
                                  atualizarCampo(index, 'nome', e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Tipo de Campo</Label>
                              <Select
                                value={campo.tipo || 'texto'}
                                onValueChange={(value) =>
                                  atualizarCampo(index, 'tipo', value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="texto">Texto</SelectItem>
                                  <SelectItem value="numero">Número</SelectItem>
                                  <SelectItem value="medicao">Medição</SelectItem>
                                  <SelectItem value="checkbox">Checkbox</SelectItem>
                                  <SelectItem value="radio">Radio</SelectItem>
                                  <SelectItem value="select">Select</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Especificação/Norma</Label>
                              <Input
                                placeholder="Ex: 12.5mm ± 0.5mm"
                                value={campo.especificacao || ''}
                                onChange={(e) =>
                                  atualizarCampo(index, 'especificacao', e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Tolerância</Label>
                              <Input
                                placeholder="Ex: ± 0.5mm"
                                value={campo.tolerancia || ''}
                                onChange={(e) =>
                                  atualizarCampo(index, 'tolerancia', e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Método de Medição</Label>
                              <Input
                                placeholder="Ex: Paquímetro, Visual, etc."
                                value={campo.metodoMedicao || ''}
                                onChange={(e) =>
                                  atualizarCampo(index, 'metodoMedicao', e.target.value)
                                }
                              />
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                              <Checkbox
                                id={`obrigatorio-${index}`}
                                checked={campo.obrigatorio ?? true}
                                onCheckedChange={(checked) =>
                                  atualizarCampo(index, 'obrigatorio', checked)
                                }
                              />
                              <Label
                                htmlFor={`obrigatorio-${index}`}
                                className="cursor-pointer"
                              >
                                Campo obrigatório
                              </Label>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerCampo(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : plano ? 'Atualizar Plano' : 'Criar Plano'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
