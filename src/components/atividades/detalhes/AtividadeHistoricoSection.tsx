import { Separator } from '@/components/ui/separator';
import { AtividadeHistoricoList } from '../AtividadeHistoricoList';

export const AtividadeHistoricoSection = () => {
  const historicoExemplo = [
    {
      id: 1,
      status: 'Criada',
      description: 'Atividade criada',
      changedBy: {
        id: 1,
        username: 'Bruno',
        email: 'bruno@exemplo.com',
        password: '',
        isActive: true,
        role: 'admin'
      },
      timestamp: new Date('2024-01-16T10:00:00')
    },
    {
      id: 2,
      status: 'Em execução',
      description: 'Atividade iniciada',
      changedBy: {
        id: 1,
        username: 'Bruno',
        email: 'bruno@exemplo.com',
        password: '',
        isActive: true,
        role: 'admin'
      },
      timestamp: new Date('2024-01-17T14:30:00')
    }
  ];

  return (
    <>
      <Separator className="my-4" />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-construction-700">
          Histórico de Alterações
        </h3>
        <div className="bg-construction-50 p-4 rounded-lg">
          <AtividadeHistoricoList historico={historicoExemplo} />
        </div>
      </div>
    </>
  );
};