import { Colaborador } from "@/interfaces/ColaboradorInterface";

interface ColaboradorDetalhesProps {
  colaborador: Colaborador;
}

export const ColaboradorDetalhes = ({ colaborador }: ColaboradorDetalhesProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold">Nome</h4>
        <p>{colaborador.nome}</p>
      </div>
      <div>
        <h4 className="font-semibold">Cargo</h4>
        <p>{colaborador.cargo}</p>
      </div>
      <div>
        <h4 className="font-semibold">Email</h4>
        <p>{colaborador.email}</p>
      </div>
      <div>
        <h4 className="font-semibold">Telefone</h4>
        <p>{colaborador.telefone}</p>
      </div>
      <div>
        <h4 className="font-semibold">Data de Admissão</h4>
        <p>{new Date(colaborador.dataAdmissao).toLocaleDateString('pt-BR')}</p>
      </div>
      <div>
        <h4 className="font-semibold">Status</h4>
        <p>{colaborador.status === 'ativo' ? 'Ativo' : 'Inativo'}</p>
      </div>
    </div>
  );
};