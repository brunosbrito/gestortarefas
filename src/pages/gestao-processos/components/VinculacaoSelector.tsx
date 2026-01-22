import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Briefcase, MinusCircle } from 'lucide-react';
import { TipoVinculacaoGP } from '@/interfaces/GestaoProcessosInterfaces';
import ObrasService from '@/services/ObrasService';
import { Obra } from '@/interfaces/ObrasInterface';

interface VinculacaoSelectorProps {
  tipoVinculacao?: TipoVinculacaoGP;
  obraId?: string;
  setorId?: string;
  onChange: (data: {
    tipoVinculacao: TipoVinculacaoGP;
    obraId?: string;
    obraNome?: string;
    setorId?: string;
    setorNome?: string;
  }) => void;
  disabled?: boolean;
}

/**
 * Componente para seleção de vinculação de documentos GP
 * Permite vincular a: Obra, Setor ou deixar Independente
 */
export const VinculacaoSelector = ({
  tipoVinculacao = 'independente',
  obraId,
  setorId,
  onChange,
  disabled = false,
}: VinculacaoSelectorProps) => {
  const [tipo, setTipo] = useState<TipoVinculacaoGP>(tipoVinculacao);
  const [obras, setObras] = useState<Obra[]>([]);
  const [selectedObraId, setSelectedObraId] = useState<string | undefined>(obraId);
  const [selectedSetorId, setSelectedSetorId] = useState<string | undefined>(setorId);

  // Mock de setores (TODO: criar SetorService quando backend estiver pronto)
  const setoresMock = [
    { id: '1', nome: 'Produção' },
    { id: '2', nome: 'Qualidade' },
    { id: '3', nome: 'Suprimentos' },
    { id: '4', nome: 'Comercial' },
    { id: '5', nome: 'Engenharia' },
    { id: '6', nome: 'Administrativo' },
    { id: '7', nome: 'Financeiro' },
    { id: '8', nome: 'RH' },
  ];

  useEffect(() => {
    loadObras();
  }, []);

  const loadObras = async () => {
    try {
      const data = await ObrasService.getAllObras();
      setObras(data);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    }
  };

  const handleTipoChange = (novoTipo: TipoVinculacaoGP) => {
    setTipo(novoTipo);
    setSelectedObraId(undefined);
    setSelectedSetorId(undefined);

    onChange({
      tipoVinculacao: novoTipo,
      obraId: undefined,
      obraNome: undefined,
      setorId: undefined,
      setorNome: undefined,
    });
  };

  const handleObraChange = (obraId: string) => {
    const obra = obras.find((o) => o.id === obraId);
    setSelectedObraId(obraId);

    onChange({
      tipoVinculacao: 'obra',
      obraId,
      obraNome: obra?.name || '',
      setorId: undefined,
      setorNome: undefined,
    });
  };

  const handleSetorChange = (setorId: string) => {
    const setor = setoresMock.find((s) => s.id === setorId);
    setSelectedSetorId(setorId);

    onChange({
      tipoVinculacao: 'setor',
      obraId: undefined,
      obraNome: undefined,
      setorId,
      setorNome: setor?.nome || '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Vinculação
        </CardTitle>
        <CardDescription>
          Escolha se este documento será vinculado a uma obra, setor ou ficará independente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de Vinculação */}
        <div className="space-y-2">
          <Label>Tipo de Vinculação</Label>
          <Select
            value={tipo}
            onValueChange={handleTipoChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="obra">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Vinculado a Obra/Projeto</span>
                </div>
              </SelectItem>
              <SelectItem value="setor">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Vinculado a Setor/Departamento</span>
                </div>
              </SelectItem>
              <SelectItem value="independente">
                <div className="flex items-center gap-2">
                  <MinusCircle className="w-4 h-4" />
                  <span>Independente (Geral)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Seletor de Obra */}
        {tipo === 'obra' && (
          <div className="space-y-2">
            <Label>Selecione a Obra/Projeto</Label>
            <Select
              value={selectedObraId}
              onValueChange={handleObraChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma obra..." />
              </SelectTrigger>
              <SelectContent>
                {obras.map((obra) => (
                  <SelectItem key={obra.id} value={obra.id}>
                    {obra.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Seletor de Setor */}
        {tipo === 'setor' && (
          <div className="space-y-2">
            <Label>Selecione o Setor/Departamento</Label>
            <Select
              value={selectedSetorId}
              onValueChange={handleSetorChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um setor..." />
              </SelectTrigger>
              <SelectContent>
                {setoresMock.map((setor) => (
                  <SelectItem key={setor.id} value={setor.id}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Info de Independente */}
        {tipo === 'independente' && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            Este documento não estará vinculado a nenhuma obra ou setor específico.
            Ele será de uso geral da organização.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
