import api from '@/lib/axios';

export interface ValuePerPosition {
  id: number;
  position: string;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateValuePerPositionDto {
  position: string;
  value: number;
}

export interface UpdateValuePerPositionDto {
  position?: string;
  value?: number;
}

const valuePerPositionService = {
  getAll: async (): Promise<ValuePerPosition[]> => {
    const { data } = await api.get('/value-per-position');
    return data;
  },

  getById: async (id: number): Promise<ValuePerPosition> => {
    const { data } = await api.get(`/value-per-position/${id}`);
    return data;
  },

  create: async (dto: CreateValuePerPositionDto): Promise<ValuePerPosition> => {
    const { data } = await api.post('/value-per-position', dto);
    return data;
  },

  update: async (id: number, dto: UpdateValuePerPositionDto): Promise<ValuePerPosition> => {
    const { data } = await api.patch(`/value-per-position/${id}`, dto);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/value-per-position/${id}`);
  },
};

export default valuePerPositionService;
