import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import OrcamentoTemplateService from '@/services/OrcamentoTemplateService';
import { OrcamentoTemplateInterface } from '@/interfaces/OrcamentoTemplateInterface';

interface UsarTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: OrcamentoTemplateInterface | null;
  onCriado: (orcamentoId: string) => void;
}

export default function UsarTemplateDialog({
  open,
  onOpenChange,
  template,
  onCriado,
}: UsarTemplateDialogProps) {
  const { toast } = useToast();
  const [criando, setCriando] = useState(false);

  const [nomeOrcamento, setNomeOrcamento] = useState('');
  const [tipo, setTipo] = useState<'servico' | 'produto'>('servico');
  const [clienteNome, setClienteNome] = useState('');
  const [codigoProjeto, setCodigoProjeto] = useState('');
  const [areaTotalM2, setAreaTotalM2] = useState('');
  const [metrosLineares, setMetrosLineares] = useState('');
  const [pesoTotalProjeto, setPesoTotalProjeto] = useState('');

  useEffect(() => {
    if (open && template) {
      setNomeOrcamento(`Novo Orçamento - ${template.nome}`);
      setTipo('servico');
      setClienteNome('');
      setCodigoProjeto('');
      setAreaTotalM2('');
      setMetrosLineares('');
      setPesoTotalProjeto('');
    }
  }, [open, template]);

  const handleCriar = async () => {
    if (!template) return;

    if (!nomeOrcamento.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do orçamento é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCriando(true);
      const novoOrcamento = await OrcamentoTemplateService.usarTemplate({
        templateId: template.id,
        nomeOrcamento: nomeOrcamento.trim(),
        tipo,
        clienteNome: clienteNome.trim() || undefined,
        codigoProjeto: codigoProjeto.trim() || undefined,
        areaTotalM2: areaTotalM2 ? Number(areaTotalM2) : undefined,
        metrosLineares: metrosLineares ? Number(metrosLineares) : undefined,
        pesoTotalProjeto: pesoTotalProjeto ? Number(pesoTotalProjeto) : undefined,
      });

      toast({
        title: 'Sucesso',
        description: 'Orçamento criado a partir do template',
      });
      onOpenChange(false);
      onCriado(novoOrcamento.id);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o orçamento',
        variant: 'destructive',
      });
    } finally {
      setCriando(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Orçamento a partir do Template</DialogTitle>
          <DialogDescription>
            Template: <strong>{template.nome}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="nomeOrcamento">Nome do Orçamento *</Label>
            <Input
              id="nomeOrcamento"
              value={nomeOrcamento}
              onChange={(e) => setNomeOrcamento(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo *</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as 'servico' | 'produto')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="produto">Produto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="codigoProjeto">Código Projeto</Label>
              <Input
                id="codigoProjeto"
                value={codigoProjeto}
                onChange={(e) => setCodigoProjeto(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="clienteNome">Cliente</Label>
            <Input
              id="clienteNome"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Nome do cliente (opcional)"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="areaTotalM2">Área (m²)</Label>
              <Input
                id="areaTotalM2"
                type="number"
                step="0.01"
                value={areaTotalM2}
                onChange={(e) => setAreaTotalM2(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label htmlFor="metrosLineares">Metros Lin.</Label>
              <Input
                id="metrosLineares"
                type="number"
                step="0.01"
                value={metrosLineares}
                onChange={(e) => setMetrosLineares(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label htmlFor="pesoTotalProjeto">Peso (kg)</Label>
              <Input
                id="pesoTotalProjeto"
                type="number"
                step="0.01"
                value={pesoTotalProjeto}
                onChange={(e) => setPesoTotalProjeto(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCriar} disabled={criando}>
            {criando ? 'Criando...' : 'Criar Orçamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
