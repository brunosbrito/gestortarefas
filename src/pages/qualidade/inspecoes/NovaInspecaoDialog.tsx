import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Obra } from '@/interfaces/ObrasInterface';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import ObrasService from '@/services/ObrasService';
import * as ServiceOrderService from '@/services/ServiceOrderService';
import ColaboradorService from '@/services/ColaboradorService';
import InspecaoService from '@/services/InspecaoService';

interface NovaInspecaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const NovaInspecaoDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: NovaInspecaoDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [projetos, setProjetos] = useState<Obra[]>([]);
  const [ordens, setOrdens] = useState<ServiceOrder[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  const [formData, setFormData] = useState({
    tipo: 'em_processo',
    descricao: '',
    projectId: '',
    serviceOrderId: '',
    inspetorId: '',
    dataInspecao: new Date().toISOString().split('T')[0],
    material: '',
    lote: '',
    fornecedor: '',
    quantidade: '',
    unidade: '',
    resultado: 'aprovado',
    ressalvas: '',
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (formData.projectId) {
      loadOrdens(formData.projectId);
    }
  }, [formData.projectId]);

  const loadData = async () => {
    try {
      const [projetosData, colaboradoresData] = await Promise.all([
        ObrasService.getAllObras(),
        ColaboradorService.getAllColaboradores(),
      ]);
      setProjetos(projetosData);
      setColaboradores(colaboradoresData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadOrdens = async (projectId: string) => {
    try {
      const ordensData = await ServiceOrderService.getServiceOrderByProjectId(projectId);
      setOrdens(ordensData);
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.descricao || !formData.projectId || !formData.inspetorId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const inspecao = {
        tipo: formData.tipo as any,
        descricao: formData.descricao,
        projectId: formData.projectId,
        serviceOrderId: formData.serviceOrderId || undefined,
        inspetorId: formData.inspetorId,
        dataInspecao: formData.dataInspecao,
        material: formData.material || undefined,
        lote: formData.lote || undefined,
        fornecedor: formData.fornecedor || undefined,
        quantidade: formData.quantidade ? parseFloat(formData.quantidade) : undefined,
        unidade: formData.unidade || undefined,
        resultado: formData.resultado as any,
        ressalvas: formData.ressalvas || undefined,
        campos: [],
        imagens: [],
      };

      await InspecaoService.create(inspecao);

      toast({
        title: 'Inspeção criada',
        description: 'A inspeção foi registrada com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar inspeção:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a inspeção.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'em_processo',
      descricao: '',
      projectId: '',
      serviceOrderId: '',
      inspetorId: '',
      dataInspecao: new Date().toISOString().split('T')[0],
      material: '',
      lote: '',
      fornecedor: '',
      quantidade: '',
      unidade: '',
      resultado: 'aprovado',
      ressalvas: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maximized ? "max-w-[95vw] max-h-[95vh] overflow-y-auto" : "max-w-2xl max-h-[90vh] overflow-y-auto"}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Nova Inspeção</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setMaximized(!maximized)}
            >
              {maximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Inspeção *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
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

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva o objeto da inspeção..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={2}
            />
          </div>

          {/* Projeto e OS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Projeto *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) =>
                  setFormData({ ...formData, projectId: value, serviceOrderId: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {projetos.map((projeto) => (
                    <SelectItem key={projeto.id} value={projeto.id}>
                      {projeto.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ordem de Serviço</Label>
              <Select
                value={formData.serviceOrderId}
                onValueChange={(value) => setFormData({ ...formData, serviceOrderId: value })}
                disabled={!formData.projectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ordens.map((ordem) => (
                    <SelectItem key={ordem.id} value={ordem.id}>
                      {ordem.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Inspetor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inspetor *</Label>
              <Select
                value={formData.inspetorId}
                onValueChange={(value) => setFormData({ ...formData, inspetorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map((colab) => (
                    <SelectItem key={colab.id} value={colab.id}>
                      {colab.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data da Inspeção</Label>
              <Input
                type="date"
                value={formData.dataInspecao}
                onChange={(e) => setFormData({ ...formData, dataInspecao: e.target.value })}
              />
            </div>
          </div>

          {/* Material e Lote */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Material/Item</Label>
              <Input
                placeholder="Ex: Aço CA-50"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Lote</Label>
              <Input
                placeholder="Ex: L2024-001"
                value={formData.lote}
                onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
              />
            </div>
          </div>

          {/* Fornecedor */}
          <div className="space-y-2">
            <Label>Fornecedor</Label>
            <Input
              placeholder="Nome do fornecedor"
              value={formData.fornecedor}
              onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
            />
          </div>

          {/* Quantidade e Unidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>Unidade</Label>
              <Input
                placeholder="Ex: kg, m, un"
                value={formData.unidade}
                onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
              />
            </div>
          </div>

          {/* Resultado */}
          <div className="space-y-2">
            <Label>Resultado da Inspeção *</Label>
            <Select
              value={formData.resultado}
              onValueChange={(value) => setFormData({ ...formData, resultado: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="aprovado_com_ressalvas">Aprovado com Ressalvas</SelectItem>
                <SelectItem value="reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ressalvas */}
          {(formData.resultado === 'aprovado_com_ressalvas' || formData.resultado === 'reprovado') && (
            <div className="space-y-2">
              <Label>Ressalvas / Motivo da Reprovação</Label>
              <Textarea
                placeholder="Descreva as ressalvas ou motivo da reprovação..."
                value={formData.ressalvas}
                onChange={(e) => setFormData({ ...formData, ressalvas: e.target.value })}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Criar Inspeção'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
