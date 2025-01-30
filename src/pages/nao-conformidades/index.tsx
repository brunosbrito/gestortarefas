import Layout from '@/components/Layout';
import { RNCForm } from '@/components/rnc/RNCForm';
import { useQuery } from '@tanstack/react-query';
import RNCService from '@/services/RNCService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import ProjectService from '@/services/ObrasService';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NaoConformidades = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const { toast } = useToast();

  const { data: rncs, isLoading: isLoadingRNCs, refetch: refetchRNCs } = useQuery({
    queryKey: ['rncs'],
    queryFn: RNCService.getAllRNCs,
    meta: {
      onError: () => {
        toast({
          title: "Erro ao carregar RNCs",
          description: "Houve um erro ao carregar os registros de não conformidade.",
          variant: "destructive"
        });
      }
    }
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: ProjectService.getAllObras,
    meta: {
      onError: () => {
        toast({
          title: "Erro ao carregar projetos",
          description: "Houve um erro ao carregar a lista de projetos.",
          variant: "destructive"
        });
      }
    }
  });

  const handleSuccess = () => {
    refetchRNCs();
    toast({
      title: "RNC registrado com sucesso",
      description: "O registro de não conformidade foi criado.",
    });
  };

  const filteredRNCs = rncs?.filter((rnc) => {
    if (!selectedProjectId && !selectedType) return true;
    
    const project = projects?.find((p) => p.id === rnc.projectId);
    
    if (selectedProjectId && rnc.projectId.toString() === selectedProjectId) return true;
    if (selectedType && project?.type === selectedType) return true;
    
    return false;
  });

  if (isLoadingRNCs || isLoadingProjects) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF7F0E]" />
        </div>
      </Layout>
    );
  }

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

        <div className="flex gap-4 mb-6">
          <div className="w-64">
            <Select onValueChange={setSelectedProjectId} value={selectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Projetos</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-64">
            <Select onValueChange={setSelectedType} value={selectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Tipos</SelectItem>
                <SelectItem value="Obra">Obra</SelectItem>
                <SelectItem value="Fabrica">Fábrica</SelectItem>
                <SelectItem value="Mineradora">Mineradora</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Novo Registro</CardTitle>
              </CardHeader>
              <CardContent>
                <RNCForm onSuccess={handleSuccess} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">RNCs Registrados</h2>
            {filteredRNCs?.map((rnc) => {
              const project = projects?.find((p) => p.id === rnc.projectId);
              return (
                <Card key={rnc.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            Projeto: {project?.name} ({project?.type})
                          </h3>
                          <p className="text-sm text-gray-600">
                            Responsável: {rnc.responsibleIdentification}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(rnc.dateOccurrence).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <p className="text-sm">{rnc.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredRNCs?.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Nenhum RNC encontrado com os filtros selecionados.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NaoConformidades;