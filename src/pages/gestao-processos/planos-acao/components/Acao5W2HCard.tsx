import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Calendar,
  DollarSign,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';
import { Acao5W2H } from '@/interfaces/GestaoProcessosInterfaces';

interface Acao5W2HCardProps {
  acao: Acao5W2H;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (campo: keyof Acao5W2H, valor: any) => void;
  onDelete?: () => void;
  readonly?: boolean;
  colaboradores?: Array<{ id: string; name: string }>;
}

/**
 * Card expansível para ação 5W2H
 * 5W: What, Why, Who, When, Where
 * 2H: How, How Much
 */
export const Acao5W2HCard = ({
  acao,
  index,
  expanded,
  onToggle,
  onChange,
  onDelete,
  readonly = false,
  colaboradores = [],
}: Acao5W2HCardProps) => {
  const getStatusIcon = (status?: string) => {
    const config = {
      pendente: { icon: AlertCircle, className: 'text-gray-600' },
      em_andamento: { icon: PlayCircle, className: 'text-blue-600' },
      concluida: { icon: CheckCircle2, className: 'text-green-600' },
      verificada: { icon: ShieldCheck, className: 'text-emerald-600' },
    };

    const cfg = config[status as keyof typeof config] || config.pendente;
    const Icon = cfg.icon;

    return <Icon className={`w-4 h-4 ${cfg.className}`} />;
  };

  const getStatusBadge = (status?: string) => {
    const config = {
      pendente: {
        variant: 'secondary' as const,
        label: 'Pendente',
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      },
      em_andamento: {
        variant: 'default' as const,
        label: 'Em Andamento',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
      },
      concluida: {
        variant: 'default' as const,
        label: 'Concluída',
        className: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
      },
      verificada: {
        variant: 'default' as const,
        label: 'Verificada',
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
      },
    };

    const cfg = config[status as keyof typeof config] || config.pendente;

    return (
      <Badge variant={cfg.variant} className={`flex items-center gap-1 w-fit ${cfg.className}`}>
        {getStatusIcon(status)}
        {cfg.label}
      </Badge>
    );
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{index + 1}</Badge>
              <div className="font-medium line-clamp-1">
                {acao.oQue || `Ação ${index + 1} (clique para editar)`}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {getStatusBadge(acao.status)}
              {acao.quando && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(acao.quando).toLocaleDateString('pt-BR')}
                </Badge>
              )}
              {acao.quantoCusta && (
                <Badge variant="outline" className="gap-1">
                  <DollarSign className="w-3 h-3" />
                  {acao.quantoCusta.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </Badge>
              )}
              {acao.progresso !== undefined && acao.status === 'em_andamento' && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {acao.progresso}%
                </Badge>
              )}
            </div>
          </div>
          {!readonly && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* O Quê (What) */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold">
                O Quê? (What) <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="O que deve ser feito?"
                value={acao.oQue}
                onChange={(e) => onChange('oQue', e.target.value)}
                rows={2}
                className="resize-none"
                disabled={readonly}
              />
            </div>

            {/* Por Quê (Why) */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold">
                Por Quê? (Why) <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Por que esta ação é necessária?"
                value={acao.porque}
                onChange={(e) => onChange('porque', e.target.value)}
                rows={2}
                className="resize-none"
                disabled={readonly}
              />
            </div>

            {/* Quem (Who) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Quem? (Who) <span className="text-red-500">*</span>
              </Label>
              {readonly ? (
                <Input value={acao.quemNome || ''} disabled />
              ) : (
                <Select
                  value={acao.quemId}
                  onValueChange={(value) => {
                    const colab = colaboradores.find((c) => c.id === value);
                    onChange('quemId', value);
                    if (colab) {
                      onChange('quemNome', colab.name);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {colaboradores.map((colab) => (
                      <SelectItem key={colab.id} value={colab.id}>
                        {colab.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Quando (When) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Quando? (When) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={acao.quando}
                onChange={(e) => onChange('quando', e.target.value)}
                disabled={readonly}
              />
            </div>

            {/* Onde (Where) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Onde? (Where) <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Onde será executada?"
                value={acao.onde}
                onChange={(e) => onChange('onde', e.target.value)}
                disabled={readonly}
              />
            </div>

            {/* Quanto Custa (How Much) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Quanto Custa? (How Much)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={acao.quantoCusta || ''}
                  onChange={(e) =>
                    onChange('quantoCusta', parseFloat(e.target.value) || undefined)
                  }
                  className="pl-9"
                  step="0.01"
                  disabled={readonly}
                />
              </div>
            </div>

            {/* Como (How) */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold">
                Como? (How) <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Como será executada? Descreva o método/procedimento..."
                value={acao.como}
                onChange={(e) => onChange('como', e.target.value)}
                rows={3}
                className="resize-none"
                disabled={readonly}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Status</Label>
              <Select
                value={acao.status}
                onValueChange={(value) => onChange('status', value)}
                disabled={readonly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="verificada">Verificada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Progresso (só se em andamento) */}
            {acao.status === 'em_andamento' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Progresso (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={acao.progresso || 0}
                  onChange={(e) => onChange('progresso', parseInt(e.target.value) || 0)}
                  disabled={readonly}
                />
              </div>
            )}

            {/* Observações */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-semibold">Observações</Label>
              <Textarea
                placeholder="Observações adicionais..."
                value={acao.observacoes}
                onChange={(e) => onChange('observacoes', e.target.value)}
                rows={2}
                className="resize-none"
                disabled={readonly}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
