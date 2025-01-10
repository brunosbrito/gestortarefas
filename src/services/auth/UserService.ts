import { User } from '@/interfaces/UserInterface';
import axios from 'axios';

const API_URL = 'http://localhost:3000/users/';

class UserService {
  // Método para obter todos os usuários
  async getAllUsers() {
    try {
      const response = await axios.get(API_URL);
      return response.data; // Retorna os dados da resposta
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error; // Relança o erro para ser tratado onde a função for chamada
    }
  }

  // Método para obter um usuário por ID
  async getUserById(id: string) {
    try {
      const response = await axios.get(`${API_URL}${id}`);
      return response.data; // Retorna os dados do usuário
    } catch (error) {
      console.error(`Erro ao buscar o usuário com ID ${id}:`, error);
      throw error; // Relança o erro para ser tratado
    }
  }

  // Método para atualizar um usuário
  async updateUser(id: string, user: User) {
    try {
      const response = await axios.put(`${API_URL}${id}`, user);
      return response.data; // Retorna os dados do usuário atualizado
    } catch (error) {
      console.error(`Erro ao atualizar o usuário com ID ${id}:`, error);
      throw error; // Relança o erro para ser tratado
    }
  }

  // Método para excluir um usuário
  async deleteUser(id: string) {
    try {
      const response = await axios.delete(`${API_URL}${id}`);
      return response.data; // Retorna dados da resposta (caso haja)
    } catch (error) {
      console.error(`Erro ao excluir o usuário com ID ${id}:`, error);
      throw error; // Relança o erro para ser tratado
    }
  }
}

export default new UserService();
