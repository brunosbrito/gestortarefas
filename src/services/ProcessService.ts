import { CreateProcesso } from '@/interfaces/ProcessoInterface';
import axios from 'axios';

const API_URL = 'http://localhost:3000/process';

class ProcessService {
  getAll() {
    return axios.get(API_URL);
  }

  get(id: number) {
    return axios.get(`${API_URL}/${id}`);
  }

  create(data: CreateProcesso) {
    return axios.post(API_URL, data);
  }

  update(id: number, data: CreateProcesso) {
    return axios.put(`${API_URL}/${id}`, data);
  }

  delete(id: number) {
    return axios.delete(`${API_URL}/${id}`);
  }
}

export default new ProcessService();
