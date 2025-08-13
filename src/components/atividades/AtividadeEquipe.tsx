import { User } from 'lucide-react';
import { Colaborador } from '@/interfaces/ColaboradorInterface';

interface AtividadeEquipeProps {
  collaborators: Colaborador[];
}

export const AtividadeEquipe = ({ collaborators }: AtividadeEquipeProps) => {
  if (!collaborators?.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-construction-700">
        Equipe Responsável
      </h3>
      <div className="bg-construction-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center space-x-2 bg-white p-3 rounded-md shadow-sm"
            >
              <User className="w-5 h-5 text-construction-600" />
              <div>
                <p className="font-medium text-construction-800">
                  {collaborator.name}
                </p>
                <p className="text-sm text-construction-600">
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