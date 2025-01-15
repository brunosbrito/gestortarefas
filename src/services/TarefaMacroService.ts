import { CreateTarefaMacro } from '@/interfaces/TarefaMacroInterface';
import axios from 'axios';

const API_URL = 'http://localhost:3000/macro-tasks';

class TarefaMacroService {
    getAll() {
        return axios.get(API_URL);
    }

    get(id: string) {
        return axios.get(`${API_URL}/${id}`);
    }

    create(data: CreateTarefaMacro) {
        return axios.post(API_URL, data);
    }

    update(id: string, data: CreateTarefaMacro) {
        return axios.put(`${API_URL}/${id}`, data);
    }

    delete(id: number) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new TarefaMacroService();