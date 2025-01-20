export interface CreateEffectiveDto {
  username: string;
  shift: number;
  role: 'ENGENHARIA' | 'ADMINISTRATIVO' | 'PRODUCAO';
  createdAt?: Date;
  project?: string;
  typeRegister: 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA' | 'FALTA';
  reason?: string;
  sector?: string;
  status: 'PRESENTE' | 'FALTA';
}

export interface UpdateEffectiveDto {
  username: string;
  shift: number;
  role: 'ENGENHARIA' | 'ADMINISTRATIVO' | 'PRODUCAO';
  project?: string;
  typeRegister: 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA' | 'FALTA';
  reason?: string;
  sector?: string;
}