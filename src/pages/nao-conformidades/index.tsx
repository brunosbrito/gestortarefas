import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NovaRNCDialog } from './NovaRNCDialog';
import RncService from '@/services/NonConformityService';
import { NonConformity } from '@/interfaces/RncInterface';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select';
import { Obra } from '@/interfaces/ObrasInterface';
import ObrasService from '@/services/ObrasService';

const NaoConformidades = () => {
  const [showNovaRNCDialog, setShowNovaRNCDialog] = useState(false);
  const [dadosRnc, setDadosRnc] = useState<NonConformity[]>([]);
  const [projetos, setProjetos] = useState<Obra[]>([]);
  const [mostrarFinalizadas, setMostrarFinalizadas] = useState<
    'todas' | 'em_andamento'
  >('todas');

  const getAllRnc = async () => {
    const rnc = await RncService.getAllRnc();
    setDadosRnc(rnc);
  };

  const getProjetos = async () => {
    try {
      const projetos = await ObrasService.getAllObras();
      setProjetos(projetos);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllRnc();
    getProjetos();
  }, []);

  const rncsFiltradas = dadosRnc.filter((rnc) => {
    if (mostrarFinalizadas === 'todas') return true;
    return !rnc.dateConclusion;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-construction-800">
            RNC - Registro de Não Conformidade
          </h1>
          <Button
            onClick={() => setShowNovaRNCDialog(true)}
            className="bg-secondary hover:bg-secondary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova RNC
          </Button>
        </div>

        <div className="flex items-center gap-4 p-4 bg-construction-100 rounded-lg">
          <Filter className="h-5 w-5 text-construction-600" />
          <RadioGroup
            defaultValue="todas"
            onValueChange={(value) =>
              setMostrarFinalizadas(value as 'todas' | 'em_andamento')
            }
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="todas" id="todas" />
              <label htmlFor="todas">Todas</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="em_andamento" id="em_andamento" />
              <label htmlFor="em_andamento">Em Andamento</label>
            </div>
          </RadioGroup>

          <Select>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              {projetos.map((projeto) => (
                <SelectItem key={projeto.id} value={projeto.id.toString()}>
                  {projeto.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rncsFiltradas.map((rnc) => (
            <Card key={rnc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{}</CardTitle>
                <CardDescription>
                  OS: |{' '}
                  {format(new Date(rnc.dateOccurrence), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-construction-600">
                    <strong>Responsável:</strong>
                  </p>
                  <p className="text-sm text-construction-600">
                    <strong>Descrição:</strong> {rnc.description}
                  </p>
                  {rnc.correctiveAction && (
                    <p className="text-sm text-construction-600">
                      <strong>Ação Corretiva:</strong>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
