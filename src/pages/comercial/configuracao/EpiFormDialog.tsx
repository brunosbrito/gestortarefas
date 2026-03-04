import { useState, useEffect } from 'react';
import { Save, X as XIcon } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { EpiService } from '@/services/EpiService';
import { EpiCatalogo, EPI_UNIDADES } from '@/interfaces/EpiInterface';
import { formatCurrency } from '@/lib/currency';

interface EpiFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epi: EpiCatalogo | null;
  onSalvar: () => void;
}

const EpiFormDialog = ({ open, onOpenChange, epi, onSalvar }: EpiFormDialogProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [descricao, setDescricao] = useState('');
  const [nomeResumido, setNomeResumido] = useState('');
  const [unidade, setUnidade] = useState('un');
  const [ca, setCa] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [valorReferencia, setValorReferencia] = useState('0.00');

  useEffect(() => {
    if (open) {
      if (epi) {
        setDescricao(epi.descricao);
        setNomeResumido(epi.nomeResumido || '');
        setUnidade(epi.unidade);
        setCa(epi.ca);
        setFabricante(epi.fabricante || '');
        setValorReferencia(epi.valorReferencia.toFixed(2));
      } else {
        setDescricao('');
        setNomeResumido('');
        setUnidade('un');
        setCa('');
        setFabricante('');
        setValorReferencia('0.00');
      }
    }
  }, [open, epi]);

  const handleSalvar = async () => {
    if (!descricao.trim()) {
      toast({ title: 'Erro', description: 'Descrição é obrigatória', variant: 'destructive' });
      return;
    }
    const valor = parseFloat(valorReferencia);
    if (isNaN(valor) || valor < 0) {
      toast({ title: 'Erro', description: 'Valor deve ser ≥ 0', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      const data = {
        descricao: descricao.trim(),
        nomeResumido: nomeResumido.trim() || undefined,
        unidade,
        ca: ca.trim(),
        fabricante: fabricante.trim() || undefined,
        valorReferencia: valor,
      };
      if (epi) {
        await EpiService.update({ id: epi.id, ...data });
        toast({ title: 'Sucesso', description: 'EPI atualizado' });
      } else {
        await EpiService.create(data);
        toast({ title: 'Sucesso', description: 'EPI cadastrado' });
      }
      onSalvar();
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{epi ? 'Editar EPI / EPC' : 'Novo EPI / EPC'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do equipamento de proteção.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Descrição técnica completa */}
          <div className="space-y-1.5">
            <Label>Descrição técnica *</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: BOT FORTLINE ELAST PU BI PLUS PALM RTPR C/BICO..."
              className="bg-green-50 dark:bg-green-950 uppercase"
              onBlur={(e) => setDescricao(e.target.value.toUpperCase())}
            />
            <p className="text-xs text-muted-foreground">Nome completo do produto conforme fabricante / CA</p>
          </div>

          {/* Nome resumido */}
          <div className="space-y-1.5">
            <Label>Nome Resumido <span className="text-muted-foreground font-normal">(exibido na tabela)</span></Label>
            <Input
              value={nomeResumido}
              onChange={(e) => setNomeResumido(e.target.value)}
              placeholder="Ex: Botina Bico Aço - Fortline - Tam. 42"
              className="bg-green-50 dark:bg-green-950"
            />
            <p className="text-xs text-muted-foreground">Opcional. Se preenchido, substitui a descrição técnica na listagem</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Unidade */}
            <div className="space-y-1.5">
              <Label>Unidade *</Label>
              <Select value={unidade} onValueChange={setUnidade}>
                <SelectTrigger className="bg-green-50 dark:bg-green-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EPI_UNIDADES.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CA */}
            <div className="space-y-1.5">
              <Label>CA (Certificado de Aprovação)</Label>
              <Input
                value={ca}
                onChange={(e) => setCa(e.target.value)}
                placeholder="Ex: 45579"
                className="bg-green-50 dark:bg-green-950 font-mono"
              />
            </div>
          </div>

          {/* Fabricante */}
          <div className="space-y-1.5">
            <Label>Fabricante</Label>
            <Input
              value={fabricante}
              onChange={(e) => setFabricante(e.target.value)}
              placeholder="Nome do fabricante (opcional)"
              className="bg-green-50 dark:bg-green-950"
            />
          </div>

          {/* Valor de referência */}
          <div className="space-y-1.5">
            <Label>Valor de Referência (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={valorReferencia}
              onChange={(e) => setValorReferencia(e.target.value)}
              className="bg-green-50 dark:bg-green-950 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Preço mínimo de referência: {formatCurrency(parseFloat(valorReferencia) || 0)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            <XIcon className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EpiFormDialog;
