import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { format } from 'date-fns';

interface AtividadeInformacoesProps {
  atividade: AtividadeStatus;
}

export const AtividadeInformacoes = ({ atividade }: AtividadeInformacoesProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-construction-700">
        Informações Gerais
      </h3>
      <div className="grid grid-cols-2 gap-4 bg-construction-50 p-4 rounded-lg">
        <div>
          <p className="font-medium text-construction-600">Descrição</p>
          <p className="text-construction-800">{atividade.description}</p>
        </div>
        <div>
          <p className="font-medium text-construction-600">Status</p>
          <p className="text-construction-800">{atividade.status}</p>
        </div>
        <div>
          <p className="font-medium text-construction-600">Macro Tarefa</p>
          <p className="text-construction-800">{atividade.macroTask}</p>
        </div>
        <div>
          <p className="font-medium text-construction-600">Processo</p>
          <p className="text-construction-800">{atividade.process}</p>
        </div>
        <div>
          <p className="font-medium text-construction-600">Data de Início</p>
          <p className="text-construction-800">
            {format(new Date(atividade.startDate), 'dd/MM/yyyy')}
          </p>
        </div>
        {atividade.endDate && (
          <div>
            <p className="font-medium text-construction-600">Data de Conclusão</p>
            <p className="text-construction-800">
              {format(new Date(atividade.endDate), 'dd/MM/yyyy')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};