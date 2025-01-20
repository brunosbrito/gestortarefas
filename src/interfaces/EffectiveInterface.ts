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

export interface UpdateEffectiveDto extends Partial<CreateEffectiveDto> {
  username: string;
  shift: number;
  role: 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA';
}