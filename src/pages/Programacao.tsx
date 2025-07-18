
import Layout from '@/components/Layout';
import { AtividadesProgramadasTable } from '@/components/programacao/AtividadesProgramadasTable';
import { Calendar } from 'lucide-react';

const Programacao = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-[#FF7F0E]" />
          <div>
            <h1 className="text-3xl font-bold text-[#003366]">Programação</h1>
            <p className="text-gray-600">Visualize todas as atividades programadas</p>
          </div>
        </div>
        
        <AtividadesProgramadasTable />
      </div>
    </Layout>
  );
};

export default Programacao;
