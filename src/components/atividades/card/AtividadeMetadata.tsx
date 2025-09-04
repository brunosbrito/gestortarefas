
import { CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { format, parseISO } from 'date-fns';
import {
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Clock,
  Timer,
  User,
  Users,
  TrendingUp,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';

interface AtividadeMetadataProps {
  atividade: AtividadeStatus;
  elapsedTime: number;
  calculateProgress: () => number;
  formatTime: (time: number) => string;
  formatEstimatedTime: (time: string) => string;
  calculatePercentage: (elapsedTime: number, estimatedTime: string) => number;
}

export const AtividadeMetadata = ({
  atividade,
  elapsedTime,
  calculateProgress,
  formatTime,
  formatEstimatedTime,
  calculatePercentage,
}: AtividadeMetadataProps) => {
  return (
    <CardContent className="p-4 pt-2 space-y-3">
      <div className="space-y-2 text-sm">
        {/* Projeto e OS */}
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 className="w-4 h-4" />
          <span className="font-medium">{atividade.project.name}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <FileText className="w-4 h-4" />
          <span>OS N°: {atividade.serviceOrder.serviceOrderNumber}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Data Criação: {format(parseISO(atividade.createdAt), 'dd/MM/yyyy')}</span>
        </div>

        {/* Progresso */}
        {typeof atividade.quantity === 'number' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-blue-700">
                Progresso: {calculateProgress().toFixed(0)}% ({atividade.completedQuantity || 0} de {atividade.quantity})
              </span>
            </div>
            <Progress 
              value={calculateProgress()} 
              className="h-2 bg-gray-100"
            />
          </div>
        )}

        {/* Status específico com data */}
        {atividade.status === 'Paralizadas' && atividade.pauseDate && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-orange-700 text-xs">
              Data Paralisação: {format(parseISO(atividade.pauseDate), 'dd/MM/yyyy')}
            </span>
          </div>
        )}

        {atividade.status === 'Em execução' && atividade.startDate && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
            <PlayCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-700 text-xs">
              Data Início: {format(parseISO(atividade.startDate), 'dd/MM/yyyy')}
            </span>
          </div>
        )}

        {atividade.status === 'Concluídas' && atividade.endDate && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-700 text-xs">
              Data Conclusão: {format(parseISO(atividade.endDate), 'dd/MM/yyyy')}
            </span>
          </div>
        )}

        {/* Tempo */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-blue-700 text-xs">
              Tempo Previsto: {formatEstimatedTime(atividade.estimatedTime)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-purple-500" />
            <div className="flex items-center gap-1">
              <span className="text-purple-700 text-xs">
                {formatTime(elapsedTime)}
              </span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                calculatePercentage(elapsedTime, atividade.estimatedTime) > 100 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {calculatePercentage(elapsedTime, atividade.estimatedTime)}%
              </span>
            </div>
          </div>
        </div>

        {/* Equipe e Criador */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-indigo-700 text-xs font-medium">
              Equipe: {atividade.collaborators.map((c) => c.name).join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 text-xs">
              Criado por: {atividade.createdBy.username}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  );
};
