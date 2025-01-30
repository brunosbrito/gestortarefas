import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { NovaRNCDialog } from './NovaRNCDialog';

const NaoConformidades = () => {
  const [showNovaRNCDialog, setShowNovaRNCDialog] = useState(false);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-construction-800">
            RNC - Registro de Não Conformidade
          </h1>
          <Button
            onClick={() => setShowNovaRNCDialog(true)}
            className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova RNC
          </Button>
        </div>

        <NovaRNCDialog
          open={showNovaRNCDialog}
          onOpenChange={setShowNovaRNCDialog}
        />
      </div>
    </Layout>
  );
};

export default NaoConformidades;