import api from '@/lib/axios';

const URL = '/api-keys';

export interface ApiKey {
  id: string;
  prefix: string;
  name: string;
  description: string | null;
  permissions: string[];
  allowedIps: string[];
  isActive: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  usageCount: number;
  createdAt: string;
}

export interface ApiKeyCreated extends ApiKey {
  key: string; // Chave completa (retornada apenas na criação)
}

export interface CreateApiKeyDto {
  name: string;
  description?: string;
  permissions?: string[];
  allowedIps?: string[];
  expiresAt?: string | null;
}

export interface UpdateApiKeyDto {
  name?: string;
  description?: string;
  permissions?: string[];
  allowedIps?: string[];
  isActive?: boolean;
  expiresAt?: string | null;
}

class ApiKeyService {
  async getAll(): Promise<ApiKey[]> {
    const response = await api.get(URL);
    return response.data;
  }

  async getById(id: string): Promise<ApiKey> {
    const response = await api.get(`${URL}/${id}`);
    return response.data;
  }

  async create(data: CreateApiKeyDto): Promise<ApiKeyCreated> {
    const response = await api.post(URL, data);
    return response.data;
  }

  async update(id: string, data: UpdateApiKeyDto): Promise<ApiKey> {
    const response = await api.put(`${URL}/${id}`, data);
    return response.data;
  }

  async revoke(id: string): Promise<void> {
    await api.post(`${URL}/${id}/revoke`);
  }

  async regenerate(id: string): Promise<ApiKeyCreated> {
    const response = await api.post(`${URL}/${id}/regenerate`);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${URL}/${id}`);
  }
}

export default new ApiKeyService();
