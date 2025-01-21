import API_URL from '@/config';
import { CreateProcesso } from '@/interfaces/ProcessoInterface';
import axios from 'axios';

const URL = `${API_URL}/process`;

class ProcessService {
  getAll() {
    return axios.get(URL);
  }

  get(id: number) {
    return axios.get(`${URL}/${id}`);
  }

  create(data: CreateProcesso) {
    return axios.post(URL, data);
  }

  update(id: number, data: CreateProcesso) {
    return axios.put(`${URL}/${id}`, data);
  }

  delete(id: number) {
    return axios.delete(`${URL}/${id}`);
  }
}

export default new ProcessService();
