import Layout from '@/components/Layout';
import { RNCForm } from '@/components/rnc/RNCForm';

const NaoConformidades = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-construction-800">
            RNC - Registro de Não Conformidade
          </h1>
          <p className="text-construction-600">
            Registre e gerencie as não conformidades identificadas nos projetos.
          </p>
        </div>

        <div className="border border-construction-200 rounded-lg p-4">
          <RNCForm />
        </div>
      </div>
    </Layout>
  );
};

export default NaoConformidades;