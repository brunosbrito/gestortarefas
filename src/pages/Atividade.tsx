
import Layout from '@/components/Layout';
import { AtividadesTable } from '@/components/atividade/AtividadesTable';
import { ClipboardList } from 'lucide-react';

const Atividade = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-[#FF7F0E]" />
          <div>
            <h1 className="text-3xl font-bold text-[#003366]">Atividades</h1>
            <p className="text-gray-600">Visualize e gerencie todas as atividades do sistema</p>
          </div>
        </div>
        
        <AtividadesTable />
      </div>
    </Layout>
  );
};

export default Atividade;
