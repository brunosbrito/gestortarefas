
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { Obra } from '@/interfaces/ObrasInterface';
import { CreateEffectiveDto } from '@/interfaces/EffectiveInterface';
import { toast } from '@/hooks/use-toast';

interface PontoLoteFormProps {
  colaboradores: Colaborador[];
  obras: Obra[];
  onSubmit: (registros: CreateEffectiveDto[]) => void;
  onClose: () => void;
  turno: string;
}

interface ColaboradorRegistro extends Colaborador {
  presente: boolean;
  faltou: boolean;
  project?: string;
  reason?: string;
}

const getSetorLabel = (sector: string) => {
  switch (sector) {
    case 'PRODUCAO':
      return 'Produção';
    case 'ADMINISTRATIVO':
      return 'Administrativo';
    case 'ENGENHARIA':
      return 'Engenharia';
    default:
      return sector;
  }
};

export const PontoLoteForm: React.FC<PontoLoteFormProps> = ({
  colaboradores,
  obras,
  onSubmit,
  onClose,
  turno
}) => {
  const [etapa, setEtapa] = useState<'presentes' | 'faltas'>('presentes');
  const [registros, setRegistros] = useState<ColaboradorRegistro[]>(
    colaboradores
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(col => ({
        ...col,
        presente: false,
        faltou: false
      }))
  );

  const [filtroSetor, setFiltroSetor] = useState<string>('');

  // Obter setores únicos dos colaboradores
  const setores = Array.from(new Set(colaboradores.map(c => c.sector).filter(Boolean)));

  const colaboradoresFiltrados = registros.filter(col => {
    const matchSetor = !filtroSetor || filtroSetor === 'todos' || col.sector === filtroSetor;
    return matchSetor;
  });

  const proximaEtapa = () => {
    if (etapa === 'presentes') {
      setEtapa('faltas');
      toast({ title: 'Agora selecione os que faltaram' });
    }
  };

  const voltarEtapa = () => {
    if (etapa === 'faltas') {
      setEtapa('presentes');
    }
  };

  const updateRegistro = (id: number, field: keyof ColaboradorRegistro, value: any) => {
    setRegistros(prev => prev.map(reg => 
      reg.id === id ? { ...reg, [field]: value } : reg
    ));
  };

  const handleSubmit = () => {
    const registrosValidos = registros
      .filter(reg => reg.presente || reg.faltou)
      .map(reg => ({
        username: reg.name,
        shift: parseInt(turno),
        role: reg.sector as 'ENGENHARIA' | 'ADMINISTRATIVO' | 'PRODUCAO',
        typeRegister: (reg.presente ? reg.sector : 'FALTA') as 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA' | 'FALTA',
        project: reg.project,
        sector: reg.sector,
        reason: reg.reason,
        status: reg.presente ? 'PRESENTE' as const : 'FALTA' as const
      }));

    onSubmit(registrosValidos);
    onClose();
    toast({ title: `${registrosValidos.length} registros criados com sucesso!` });
  };

  const resumo = {
    total: registros.length,
    presentes: registros.filter(r => r.presente).length,
    faltas: registros.filter(r => r.faltou).length,
    naoRegistrados: registros.filter(r => !r.presente && !r.faltou).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Registro em Lote - Turno {turno} 
          {etapa === 'presentes' ? ' - Marcar Presentes' : ' - Selecionar Faltas'}
        </h2>
        <div className="flex gap-2">
          <Badge variant="secondary">{resumo.total} Total</Badge>
          <Badge variant="default">{resumo.presentes} Presentes</Badge>
          <Badge variant="destructive">{resumo.faltas} Faltas</Badge>
          {resumo.naoRegistrados > 0 && (
            <Badge variant="outline">{resumo.naoRegistrados} Não Registrados</Badge>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <Select value={filtroSetor} onValueChange={setFiltroSetor}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os setores</SelectItem>
            {setores.map(setor => (
              <SelectItem key={setor} value={setor!}>{getSetorLabel(setor)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted sticky top-0">
                <tr>
                  {etapa === 'presentes' ? (
                    <>
                      <th className="p-2">Presente</th>
                      <th className="p-2">Nome</th>
                      <th className="p-2">Cargo</th>
                      <th className="p-2">Setor</th>
                      <th className="p-2">Obra</th>
                    </>
                  ) : (
                    <>
                      <th className="p-2">Faltou</th>
                      <th className="p-2">Nome</th>
                      <th className="p-2">Cargo</th>
                      <th className="p-2">Setor</th>
                      <th className="p-2">Motivo da Falta</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {etapa === 'presentes' ? (
                  colaboradoresFiltrados.map(registro => (
                    <tr key={registro.id} className={!registro.presente ? 'bg-muted/50' : ''}>
                      <td className="p-2 text-center">
                        <Checkbox
                          checked={registro.presente}
                          onCheckedChange={(checked) => 
                            updateRegistro(registro.id, 'presente', checked)
                          }
                        />
                      </td>
                      <td className="p-2 font-medium">{registro.name}</td>
                      <td className="p-2">{registro.role}</td>
                      <td className="p-2">{getSetorLabel(registro.sector)}</td>
                      <td className="p-2">
                        {registro.presente && (
                          <Select 
                            value={registro.project || ''} 
                            onValueChange={(value) => updateRegistro(registro.id, 'project', value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Selecionar obra" />
                            </SelectTrigger>
                            <SelectContent>
                              {obras.map(obra => (
                                <SelectItem key={obra.id} value={obra.name}>
                                  {obra.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  colaboradoresFiltrados.map(registro => (
                    <tr key={registro.id} className={registro.faltou ? 'bg-destructive/10' : 'bg-muted/50'}>
                      <td className="p-2 text-center">
                        <Checkbox
                          checked={registro.faltou}
                          onCheckedChange={(checked) => 
                            updateRegistro(registro.id, 'faltou', checked)
                          }
                        />
                      </td>
                      <td className="p-2 font-medium">{registro.name}</td>
                      <td className="p-2">{registro.role}</td>
                      <td className="p-2">{getSetorLabel(registro.sector)}</td>
                      <td className="p-2">
                        {registro.faltou && (
                          <Input
                            value={registro.reason || ''}
                            onChange={(e) => updateRegistro(registro.id, 'reason', e.target.value)}
                            className="h-8"
                            placeholder="Motivo da falta"
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2">
        <div>
          {etapa === 'faltas' && (
            <Button variant="outline" onClick={voltarEtapa}>
              Voltar aos Presentes
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {etapa === 'presentes' ? (
            <Button onClick={proximaEtapa}>
              Próximo: Selecionar Faltas
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Salvar Registros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
