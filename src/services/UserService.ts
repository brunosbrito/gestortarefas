import api from '@/lib/axios';
import { User } from '@/interfaces/UserInterface';

const URL = '/users/';

class UserService {
  async getAllUsers() {
    try {
      const response = await api.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      const response = await api.get(`${URL}${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar o usuário com ID ${id}:`, error);
      throw error;
    }
  }

  async updateUser(id: string, user: User) {
    try {
      const response = await api.put(`${URL}${id}`, user);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar o usuário com ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const response = await api.delete(`${URL}${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir o usuário com ID ${id}:`, error);
      throw error;
    }
  }
}

export default new UserService();
