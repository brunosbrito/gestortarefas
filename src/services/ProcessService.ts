import api from '@/lib/axios';
import { CreateProcesso } from '@/interfaces/ProcessoInterface';

const URL = '/process';

class ProcessService {
  getAll() {
    return api.get(URL);
  }

  get(id: number) {
    return api.get(`${URL}/${id}`);
  }

  create(data: CreateProcesso) {
    return api.post(URL, data);
  }

  update(id: number, data: CreateProcesso) {
    return api.put(`${URL}/${id}`, data);
  }

  delete(id: number) {
    return api.delete(`${URL}/${id}`);
  }
}

export default new ProcessService();
