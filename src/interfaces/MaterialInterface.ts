import { NonConformity } from './RncInterface';

export interface Material {
  id: string;
  material: string;
  quantidade: number;
  unidade: 'un' | 'm' | 'kg' | 'cm';
  preco: number;
  total: number;
  createdAt: string; // ou Date, dependendo do formato
  nonConformity: NonConformity;
}
