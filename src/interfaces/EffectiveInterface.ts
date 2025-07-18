export interface CreateEffectiveDto {
  username: string;
  shift: number;
  role: string;
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
  role: string;
  project?: string;
  typeRegister: 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA' | 'FALTA';
  reason?: string;
  sector?: string;
}