export interface CreateEffectiveDto {
  username: string;
  shift: number;
  role: 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA';
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
  role: 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA';
  project?: string;
  typeRegister: 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA' | 'FALTA';
  reason?: string;
  sector?: string;
}