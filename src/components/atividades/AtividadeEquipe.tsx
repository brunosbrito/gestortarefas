import { Users, User } from 'lucide-react';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { Badge } from '@/components/ui/badge';

interface AtividadeEquipeProps {
  collaborators: Colaborador[];
}

export const AtividadeEquipe = ({ collaborators }: AtividadeEquipeProps) => {
  if (!collaborators?.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Equipe Responsável</h3>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg text-center text-muted-foreground">
          Nenhum colaborador atribuído
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Equipe Responsável</h3>
        </div>
        <Badge variant="outline">{collaborators.length} colaborador(es)</Badge>
      </div>
      <div className="bg-muted/20 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center gap-3 bg-background p-3 rounded-lg border shadow-sm"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{collaborator.name}</p>
                <p className="text-sm text-muted-foreground">
                  {collaborator.role || 'Colaborador'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};