import api from '@/lib/axios';
import { CreateTarefaMacro } from '@/interfaces/TarefaMacroInterface';

const URL = '/macro-tasks';

class TarefaMacroService {
  getAll() {
    return api.get(URL);
  }

  get(id: string) {
    return api.get(`${URL}/${id}`);
  }

  create(data: CreateTarefaMacro) {
    return api.post(URL, data);
  }

  update(id: string, data: CreateTarefaMacro) {
    return api.put(`${URL}/${id}`, data);
  }

  delete(id: number) {
    return api.delete(`${URL}/${id}`);
  }
}

export default new TarefaMacroService();
