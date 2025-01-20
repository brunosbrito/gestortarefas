export interface CreateEffectiveDto {
  username: string;
  shift: number;
  role: string;
  createdAt?: Date;
  project?: string;
  typeRegister?: string;
  reason?: string;
  sector?: string;
  status?: string;
}

export interface UpdateEffectiveDto extends Partial<CreateEffectiveDto> {
  username: string;
  shift: number;
  role: string;
}