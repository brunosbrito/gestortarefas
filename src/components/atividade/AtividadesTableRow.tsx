import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight, Users, Building2, Calendar, Clock } from 'lucide-react';
import { Activity } from '@/interfaces/AtividadeInterface';
import { cn } from '@/lib/utils';
import {
  calcularKPI,
  calcularProgresso,
  formatarKPI,
  formatarProgresso,
  formatarTempoTotal,
  getKPIColor,
  obterCodigoSequencial,
} from '@/utils/atividadeCalculos';

interface AtividadesTableRowProps {
  atividade: any;
  globalIndex: number;
  onRowClick: (atividade: any) => void;
  formatDate: (date?: string) => string;
  formatTime: (time?: number) => string;
  formatTeam: (collaborators: any[]) => string;
}

// Movido para fora do componente para evitar recriação em cada render
const getStatusConfig = (status: string) => {
  const config = {
    'Planejadas': {
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-700 dark:text-purple-300',
      dotColor: 'bg-purple-500',
      label: 'Planejadas'
    },
    'Em execução': {
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-300',
      dotColor: 'bg-green-500',
      label: 'Em Execução'
    },
    'Concluídas': {
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-300',
      dotColor: 'bg-blue-500',
      label: 'Concluídas'
    },
    'Paralizadas': {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      dotColor: 'bg-yellow-500',
      label: 'Paralizadas'
    }
  };

  return config[status as keyof typeof config] || config['Planejadas'];
};

// Componente otimizado com React.memo para evitar re-renders desnecessários
export const AtividadesTableRow = memo(({
  atividade,
  globalIndex,
  onRowClick,
  formatDate,
  formatTime,
  formatTeam
}: AtividadesTableRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const kpi = calcularKPI(atividade);
  const progresso = calcularProgresso(atividade);
  const statusConfig = getStatusConfig(atividade.status);

  // Formatar código da atividade como ATV-XXX
  const formatAtividadeCodigo = (id: number) => {
    return `ATV-${String(id).padStart(3, '0')}`;
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <TableRow
        onClick={() => onRowClick(atividade)}
        className={cn(
          "cursor-pointer transition-all duration-200 min-h-[60px] border-b",
          globalIndex % 2 === 0 ? "bg-background" : "bg-muted/20",
          "hover:bg-accent/50 hover:shadow-sm",
          isExpanded && "bg-accent/30"
        )}
      >
        {/* Item */}
        <TableCell className="text-center font-mono text-sm font-bold py-4 border-r border-border/30">
          {formatAtividadeCodigo(atividade.id)}
        </TableCell>

        {/* Descrição */}
        <TableCell className="max-w-[250px] py-4 border-r border-border/30">
          <div className="truncate font-semibold text-foreground">
            {atividade.description}
          </div>
        </TableCell>

        {/* Status com dot indicator */}
        <TableCell className="text-center py-4 border-r border-border/30">
          <Badge className={cn(
            statusConfig.bgColor,
            statusConfig.textColor,
            "flex items-center gap-1.5 w-fit mx-auto px-3 py-1.5 font-medium"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotColor)} />
            {statusConfig.label}
          </Badge>
        </TableCell>

        {/* Tarefa Macro */}
        <TableCell className="max-w-[150px] py-4 border-r border-border/30">
          <div className="truncate text-sm text-muted-foreground">
            {typeof atividade.macroTask === 'string'
              ? atividade.macroTask
              : atividade.macroTask?.name || '-'}
          </div>
        </TableCell>

        {/* Tempo Total */}
        <TableCell className="text-center py-4 border-r border-border/30">
          <div className="flex items-center justify-center gap-1.5 text-sm">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-bold tabular-nums">
              {formatarTempoTotal(atividade)}
            </span>
          </div>
        </TableCell>

        {/* Progresso */}
        <TableCell className="text-center py-4 border-r border-border/30">
          <div className="space-y-1.5">
            <div className="text-xs font-bold tabular-nums">
              {formatarProgresso(progresso)}
            </div>
            <Progress
              value={Math.min(progresso, 100)}
              className="h-2 w-20 mx-auto"
            />
          </div>
        </TableCell>

        {/* KPI */}
        <TableCell className="text-center py-4 border-r border-border/30">
          <Badge
            variant="outline"
            className={cn("text-xs font-bold tabular-nums", getKPIColor(kpi))}
          >
            {formatarKPI(kpi)}
          </Badge>
        </TableCell>

        {/* Ações - Expandir */}
        <TableCell className="text-center py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExpand}
            className={cn(
              "transition-all",
              "hover:bg-accent hover:scale-110"
            )}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </TableCell>
      </TableRow>

      {/* Expandable row com detalhes */}
      <AnimatePresence>
        {isExpanded && (
          <TableRow className="bg-muted/20 hover:bg-muted/20">
            <TableCell colSpan={8} className="p-0 overflow-hidden">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Processo */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Processo
                    </div>
                    <div className="text-sm font-medium">
                      {typeof atividade.process === 'string'
                        ? atividade.process
                        : atividade.process?.name || '-'}
                    </div>
                  </div>

                  {/* OS */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Ordem de Serviço
                    </div>
                    <div className="text-sm font-medium">
                      {atividade.serviceOrder?.serviceOrderNumber || 'N/A'}
                    </div>
                  </div>

                  {/* Obra/Projeto */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Obra/Projeto
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {atividade.project?.name || 'N/A'}
                    </div>
                  </div>

                  {/* Tempo Estimado */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Tempo Estimado
                    </div>
                    <div className="text-sm font-medium tabular-nums">
                      {formatTime(atividade.estimatedTime)}
                    </div>
                  </div>

                  {/* Quantidade */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Quantidade
                    </div>
                    <div className="text-sm font-medium tabular-nums">
                      {atividade.completedQuantity || 0} / {atividade.quantity || 0}
                    </div>
                  </div>

                  {/* Equipe */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Equipe
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {formatTeam(atividade.collaborators)}
                    </div>
                  </div>

                  {/* Data de Início */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Data de Início
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium tabular-nums">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(atividade.startDate)}
                    </div>
                  </div>

                  {/* Data de Criação */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Data de Criação
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium tabular-nums">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(atividade.createdAt)}
                    </div>
                  </div>

                  {/* Observações */}
                  {atividade.observations && (
                    <div className="space-y-1.5 lg:col-span-3">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Observações
                      </div>
                      <div className="text-sm">
                        {atividade.observations}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </>
  );
});

// DisplayName para melhorar debugging
AtividadesTableRow.displayName = 'AtividadesTableRow';
