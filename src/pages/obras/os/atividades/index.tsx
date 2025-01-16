import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NovaAtividadeForm } from '@/components/atividades/NovaAtividadeForm';
import { StatusList } from '@/components/atividades/StatusList';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { useParams } from 'react-router-dom';
import { getActivitiesByServiceOrderId } from '@/services/ActivityService';

const statusListas = [
  'Planejadas',
  'Em Execução',
  'Concluídas',
  'Paralizadas',
] as const;

const Atividades = () => {
  const [atividades, setAtividades] = useState<AtividadeStatus[]>([]);
  const [openNovaAtividade, setOpenNovaAtividade] = useState(false);
  const { projectId, serviceOrderId } = useParams();

  const getByServiceOrderId = async () => {
    try {
      const data = await getActivitiesByServiceOrderId(serviceOrderId);
      setAtividades(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getByServiceOrderId();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">
            Atividades
          </h1>
          <Dialog open={openNovaAtividade} onOpenChange={setOpenNovaAtividade}>
            <DialogTrigger asChild>
              <Button className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Atividade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Atividade</DialogTitle>
              </DialogHeader>
              <NovaAtividadeForm
                projectId={Number(projectId)}
                orderServiceId={Number(serviceOrderId)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {statusListas.map((status) => (
            <StatusList key={status} status={status} atividades={atividades} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Atividades;
