export interface Funcionario {
  id: number;
  username: string;
  role: 'PRODUCAO' | 'ADMINISTRATIVO';
  shift: number;
  project?: string;
  typeRegister?: string;
  reason?: string;
  sector?: string;
  status: 'PRESENTE' | 'FALTA';
  turno: number;
  setor: 'PRODUCAO' | 'ADMINISTRATIVO';
}