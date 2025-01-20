export interface Funcionario {
  id: number;
  username: string;
  role: 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA';
  shift: number;
  project?: string;
  typeRegister: 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA' | 'FALTA';
  reason?: string;
  sector?: string;
  status: 'PRESENTE' | 'FALTA';
}