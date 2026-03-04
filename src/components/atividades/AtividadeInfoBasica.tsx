
import { AtividadeStatus } from "@/interfaces/AtividadeStatus";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { format, parseISO } from "date-fns";
import {
  Eye,
  FileText,
  Building2,
  Calendar,
  Clock,
  Timer,
  TrendingUp,
  User,
  Hash,
  Briefcase,
  Settings,
  AlertCircle,
  PlayCircle,
  CheckCircle,
  PauseCircle,
} from "lucide-react";
import { Progress } from "../ui/progress";

interface AtividadeInfoBasicaProps {
  atividade: AtividadeStatus;
}

export function AtividadeInfoBasica({ atividade }: AtividadeInfoBasicaProps) {
  const handleViewImage = () => {
    if (atividade.imageUrl) {
      window.open(`https://api.gmxindustrial.com.br${atividade.imageUrl}`, '_blank');
    }
  };

  const handleViewPDF = () => {
    if (atividade.fileUrl) {
      window.open(`https://api.gmxindustrial.com.br${atividade.fileUrl}`, '_blank');
    }
  };

  const formatMacroTask = () => {
    if (!atividade.macroTask) return "N/A";
    if (typeof atividade.macroTask === "string") return atividade.macroTask;
    return atividade.macroTask.name;
  };

  const formatProcess = () => {
    if (!atividade.process) return "N/A";
    if (typeof atividade.process === "string") return atividade.process;
    return atividade.process.name;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy HH:mm");
    } catch {
      return "N/A";
    }
  };

  const formatEstimatedTime = (estimatedTime: string) => {
    if (!estimatedTime) return "00:00";
    const hoursMatch = estimatedTime.match(/(\d+)\s*h/);
    const minutesMatch = estimatedTime.match(/(\d+)\s*min/);
    const hours = hoursMatch ? hoursMatch[1] : "0";
    const minutes = minutesMatch ? minutesMatch[1] : "0";
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  const formatTotalTime = (totalTime: number) => {
    if (!totalTime || totalTime <= 0) return "00:00";
    const hours = Math.floor(totalTime);
    const minutes = Math.round((totalTime - hours) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const calculateCurrentWorkedTime = () => {
    let total = atividade.totalTime || 0;

    // Se está em execução, adicionar o tempo desde o início
    if (atividade.status === "Em execução" && atividade.startDate) {
      const startDateTime = new Date(atividade.startDate);
      const now = new Date();
      const elapsedHours = (now.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
      total += elapsedHours;
    }

    return total;
  };

  const calculateProgress = () => {
    if (!atividade.quantity || !atividade.completedQuantity) return 0;
    const progress = (atividade.completedQuantity / atividade.quantity) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planejadas":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Em execução":
        return "bg-green-100 text-green-800 border-green-200";
      case "Paralizadas":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Concluídas":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Planejadas":
        return <Clock className="w-4 h-4" />;
      case "Em execução":
        return <PlayCircle className="w-4 h-4" />;
      case "Paralizadas":
        return <PauseCircle className="w-4 h-4" />;
      case "Concluídas":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com código e status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
            #{atividade.cod_sequencial}
          </span>
          <Badge className={`${getStatusColor(atividade.status)} flex items-center gap-1`}>
            {getStatusIcon(atividade.status)}
            {atividade.status}
          </Badge>
        </div>
      </div>

      {/* Descrição */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-sm font-medium text-muted-foreground mb-1">Descrição da Atividade</p>
        <p className="text-lg font-medium">{atividade.description}</p>
      </div>

      {/* Informações do Projeto e OS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
          <Building2 className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Projeto/Obra</p>
            <p className="font-medium">{atividade.project.name}</p>
            <p className="text-sm text-muted-foreground">Cliente: {atividade.project.client}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
          <FileText className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ordem de Serviço</p>
            <p className="font-medium">OS N° {atividade.serviceOrder.serviceOrderNumber}</p>
          </div>
        </div>
      </div>

      {/* Tarefa Macro e Processo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
          <Briefcase className="w-5 h-5 text-orange-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tarefa Macro</p>
            <p className="font-medium">{formatMacroTask()}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
          <Settings className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Processo</p>
            <p className="font-medium">{formatProcess()}</p>
          </div>
        </div>
      </div>

      {/* Progresso */}
      {typeof atividade.quantity === "number" && (
        <div className="p-4 bg-muted/20 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-medium">Progresso da Atividade</span>
            </div>
            <span className="text-lg font-bold text-primary">
              {calculateProgress().toFixed(0)}%
            </span>
          </div>
          <Progress value={calculateProgress()} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Concluído: {atividade.completedQuantity || 0} unidades</span>
            <span>Total: {atividade.quantity} unidades</span>
          </div>
        </div>
      )}

      {/* Tempos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-600">Tempo Previsto</p>
            <p className="text-xl font-bold text-blue-700">{formatEstimatedTime(atividade.estimatedTime)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <Timer className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-600">Tempo Trabalhado</p>
            <p className="text-xl font-bold text-green-700">{formatTotalTime(calculateCurrentWorkedTime())}</p>
            {atividade.status === "Em execução" && (
              <p className="text-xs text-green-600">(em andamento)</p>
            )}
          </div>
        </div>

        {atividade.timePerUnit && (
          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <Hash className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-600">Tempo por Unidade</p>
              <p className="text-xl font-bold text-purple-700">
                {atividade.timePerUnit} {atividade.unidadeTempo === "minutos" ? "min" : "h"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Datas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
          <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Data Criação</p>
            <p className="font-medium">{formatDate(atividade.createdAt)}</p>
          </div>
        </div>

        {atividade.startDate && (
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <PlayCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-600">Data Início</p>
              <p className="font-medium text-green-700">{formatDate(atividade.startDate)}</p>
            </div>
          </div>
        )}

        {atividade.pauseDate && (
          <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
            <PauseCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-600">Data Paralisação</p>
              <p className="font-medium text-yellow-700">{formatDate(atividade.pauseDate)}</p>
            </div>
          </div>
        )}

        {atividade.endDate && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-950/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-600">Data Conclusão</p>
              <p className="font-medium text-gray-700">{formatDate(atividade.endDate)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Criado por */}
      <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
        <User className="w-5 h-5 text-muted-foreground mt-0.5" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Criado por</p>
          <p className="font-medium">{atividade.createdBy.username}</p>
        </div>
      </div>

      {/* Observação */}
      {atividade.observation && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-700 mb-2">Observação</p>
          <p className="text-amber-900 dark:text-amber-100">{atividade.observation}</p>
        </div>
      )}

      {/* Anexos */}
      {(atividade.imageUrl || atividade.fileUrl) && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Anexos</p>
          <div className="flex flex-wrap gap-3">
            {atividade.imageUrl && (
              <Button
                variant="outline"
                onClick={handleViewImage}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Ver Imagem
                {atividade.imageDescription && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({atividade.imageDescription})
                  </span>
                )}
              </Button>
            )}
            {atividade.fileUrl && (
              <Button
                variant="outline"
                onClick={handleViewPDF}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Ver Arquivo
                {atividade.fileDescription && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({atividade.fileDescription})
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
