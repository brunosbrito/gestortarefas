import { Obra } from '@/interfaces/ObrasInterface';
import axios from 'axios';

const API_URL = 'http://localhost:3000/projects/';

class ObraService {
  // Criar uma nova obra
  async createObra(obraData: Obra) {
    try {
      const response = await axios.post(API_URL, obraData);
      return response.data; // Retorna o projeto criado
    } catch (error) {
      console.error('Erro ao criar obra:', error);
      throw error;
    }
  }

  // Buscar todas as obras
  async getAllObras() {
    try {
      const response = await axios.get(API_URL);
      return response.data; // Retorna todos os projetos
    } catch (error) {
      console.error('Erro ao buscar obras:', error);
      throw error;
    }
  }

  // Buscar obra por ID
  async getObraById(id: number) {
    try {
      const response = await axios.get(`${API_URL}${id}`);
      return response.data; // Retorna a obra com o ID especificado
    } catch (error) {
      console.error('Erro ao buscar obra:', error);
      throw error;
    }
  }

  // Atualizar obra
  async updateObra(id: number, obraData: Obra) {
    try {
      const response = await axios.put(`${API_URL}${id}`, obraData);
      return response.data; // Retorna a obra atualizada
    } catch (error) {
      console.error('Erro ao atualizar obra:', error);
      throw error;
    }
  }

  // Deletar obra
  async deleteObra(id: number) {
    try {
      await axios.delete(`${API_URL}${id}`);
    } catch (error) {
      console.error('Erro ao deletar obra:', error);
      throw error;
    }
  }
}

export default new ObraService();
