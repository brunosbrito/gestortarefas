import API_URL from '@/config';
import { CreateTarefaMacro } from '@/interfaces/TarefaMacroInterface';
import axios from 'axios';

const URL = `${API_URL}/macro-tasks`;

class TarefaMacroService {
  getAll() {
    return axios.get(URL);
  }

  get(id: string) {
    return axios.get(`${URL}/${id}`);
  }

  create(data: CreateTarefaMacro) {
    return axios.post(URL, data);
  }

  update(id: string, data: CreateTarefaMacro) {
    return axios.put(`${URL}/${id}`, data);
  }

  delete(id: number) {
    return axios.delete(`${URL}/${id}`);
  }
}

export default new TarefaMacroService();
