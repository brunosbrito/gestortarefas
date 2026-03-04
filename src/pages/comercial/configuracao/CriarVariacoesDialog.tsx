import { useState, useEffect } from 'react';
import { GitBranch, X, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CargoService } from '@/services/CargoService';
import { Cargo, CALCULOS_MO } from '@/interfaces/CargoInterface';
import { formatCurrency } from '@/lib/currency';

// Todos os níveis possíveis, em ordem
const TODOS_NIVEIS: { nivel: string; grupo: 'Produção' | 'Engenharia' }[] = [
  { nivel: 'I',      grupo: 'Produção'    },
  { nivel: 'II',     grupo: 'Produção'    },
  { nivel: 'III',    grupo: 'Produção'    },
  { nivel: 'Junior', grupo: 'Engenharia'  },
  { nivel: 'Pleno',  grupo: 'Engenharia'  },
  { nivel: 'Sênior', grupo: 'Engenharia'  },
];

interface NivelRow {
  nivel: string;
  grupo: 'Produção' | 'Engenharia';
  salarioBase: string;
  criar: boolean;
  jaExiste: boolean;
}

interface CriarVariacoesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargo: Cargo | null;
  onCriado: () => void;
}

const CriarVariacoesDialog = ({
  open,
  onOpenChange,
  cargo,
  onCriado,
}: CriarVariacoesDialogProps) => {
  const { toast } = useToast();
  const [niveis, setNiveis] = useState<NivelRow[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Ao abrir, verifica quais níveis já existem para este nome de cargo
  useEffect(() => {
    if (!open || !cargo) return;

    CargoService.listAtivos().then((todos) => {
      const existentes = new Set(
        todos.filter((c) => c.nome === cargo.nome).map((c) => c.nivel ?? '')
      );

      setNiveis(
        TODOS_NIVEIS.map(({ nivel, grupo }) => ({
          nivel,
          grupo,
          salarioBase: cargo.salarioBase.toFixed(2),
          criar: !existentes.has(nivel),   // pré-marca apenas os que ainda não existem
          jaExiste: existentes.has(nivel),
        }))
      );
    });
  }, [open, cargo]);

  // Estimativa de Custo HH ao vivo:
  // - insalubridade permanece igual (baseada no salário mínimo, não no base)
  // - periculosidade recalculada sobre o novo salário base
  // - custos diversos herdados
  const estimarCustoHH = (salarioBaseStr: string): number => {
    if (!cargo) return 0;
    const sal = parseFloat(salarioBaseStr) || 0;
    const peric = cargo.temPericulosidade ? sal * CALCULOS_MO.PERICULOSIDADE : 0;
    const totalSalario = sal + peric + cargo.valorInsalubridade;
    const encargos = totalSalario * CALCULOS_MO.ENCARGOS_PADRAO;
    const totalMO = totalSalario + encargos + cargo.totalCustosDiversos;
    return cargo.horasMes > 0 ? Math.round((totalMO / cargo.horasMes) * 100) / 100 : 0;
  };

  const toggleCriar = (nivel: string, checked: boolean) =>
    setNiveis((prev) => prev.map((n) => (n.nivel === nivel ? { ...n, criar: checked } : n)));

  const setSalario = (nivel: string, value: string) =>
    setNiveis((prev) => prev.map((n) => (n.nivel === nivel ? { ...n, salarioBase: value } : n)));

  const handleSalvar = async () => {
    if (!cargo) return;

    const paraCriar = niveis.filter((n) => n.criar);
    if (paraCriar.length === 0) {
      toast({ title: 'Atenção', description: 'Selecione ao menos um nível', variant: 'destructive' });
      return;
    }

    for (const n of paraCriar) {
      const sal = parseFloat(n.salarioBase);
      if (isNaN(sal) || sal <= 0) {
        toast({ title: 'Erro', description: `Salário inválido para o nível ${n.nivel}`, variant: 'destructive' });
        return;
      }
    }

    try {
      setSalvando(true);
      for (const n of paraCriar) {
        await CargoService.create({
          nome: cargo.nome,
          nivel: n.nivel,
          categoria: cargo.categoria,
          salarioBase: parseFloat(n.salarioBase),
          temPericulosidade: cargo.temPericulosidade,
          grauInsalubridade: cargo.grauInsalubridade,
          custos: cargo.custos,
          horasMes: cargo.horasMes,
          tipoContrato: cargo.tipoContrato,
          observacoes: cargo.observacoes,
        });
      }
      toast({
        title: 'Sucesso',
        description: `${paraCriar.length} variação(ões) de "${cargo.nome}" criadas com sucesso`,
      });
      onCriado();
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível criar as variações', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  if (!cargo) return null;

  const totalParaCriar = niveis.filter((n) => n.criar).length;
  const temExistentes = niveis.some((n) => n.jaExiste && n.criar);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-violet-600" />
            Criar Variações por Nível — {cargo.nome}
          </DialogTitle>
          <DialogDescription>
            Todos os custos (alimentação, EPI, transporte, encargos, etc.) são herdados do cargo base.
            Ajuste apenas o salário de cada nível.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Resumo do cargo base */}
          <div className="p-3 bg-muted/40 rounded-lg border text-sm flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <span className="text-muted-foreground">Cargo base: </span>
              <strong>{cargo.nome}</strong>
              {cargo.nivel && (
                <Badge variant="outline" className="ml-2 text-violet-600 border-violet-300 text-xs">
                  {cargo.nivel}
                </Badge>
              )}
            </span>
            <span>
              <span className="text-muted-foreground">Custos diversos: </span>
              <strong>{formatCurrency(cargo.totalCustosDiversos)}/mês</strong>
            </span>
            <span>
              <span className="text-muted-foreground">Contrato: </span>
              <strong>{cargo.horasMes}h/mês ({cargo.tipoContrato})</strong>
            </span>
          </div>

          {/* Tabela de níveis */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-12 p-3 text-center">Criar</th>
                  <th className="p-3 text-left text-muted-foreground font-medium">Grupo</th>
                  <th className="p-3 text-center font-medium">Nível</th>
                  <th className="p-3 text-center font-medium">Salário Base</th>
                  <th className="p-3 text-center font-bold text-blue-600">Custo HH (est.)</th>
                </tr>
              </thead>
              <tbody>
                {niveis.map((n, idx) => {
                  const isFirstEngenharia = n.grupo === 'Engenharia' && niveis[idx - 1]?.grupo === 'Produção';
                  return (
                    <tr
                      key={n.nivel}
                      className={[
                        'border-t transition-colors',
                        isFirstEngenharia ? 'border-t-2 border-muted-foreground/30' : '',
                        !n.criar ? 'opacity-50 bg-muted/20' : 'hover:bg-muted/20',
                      ].join(' ')}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={n.criar}
                          onCheckedChange={(v) => toggleCriar(n.nivel, !!v)}
                          disabled={salvando}
                        />
                      </td>

                      {/* Grupo */}
                      <td className="p-3 text-muted-foreground text-xs">{n.grupo}</td>

                      {/* Nível */}
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="text-violet-600 border-violet-300">
                          {n.nivel}
                        </Badge>
                        {n.jaExiste && (
                          <span className="ml-2 text-xs text-amber-500">(já existe)</span>
                        )}
                      </td>

                      {/* Salário Base */}
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          className="h-8 text-sm text-center font-mono bg-green-50 dark:bg-green-950 w-36 mx-auto"
                          value={n.salarioBase}
                          onChange={(e) => setSalario(n.nivel, e.target.value)}
                          disabled={!n.criar || salvando}
                        />
                      </td>

                      {/* Custo HH estimado */}
                      <td className="p-3 text-center font-mono font-bold text-blue-600">
                        {n.criar ? `${formatCurrency(estimarCustoHH(n.salarioBase))}/h` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Aviso sobre sobrescrever existentes */}
          {temExistentes && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Níveis marcados com "já existe" serão criados como novos registros (duplicatas).
                Remova a seleção caso não queira recriar.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={salvando}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={salvando || totalParaCriar === 0}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <GitBranch className="mr-2 h-4 w-4" />
            {salvando ? 'Criando...' : `Criar ${totalParaCriar} variação(ões)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CriarVariacoesDialog;
