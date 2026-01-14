import API_URL from '@/config';
import { User } from '@/interfaces/UserInterface';
import { getStoredToken } from '@/services/AuthService';
import axios from 'axios';

const URL = `${API_URL}/users/`;

class UserService {
  async getAllUsers() {
    try {
      const token = getStoredToken(); // ✅ Busca token dinamicamente
      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      const token = getStoredToken(); // ✅ Busca token dinamicamente
      const response = await axios.get(`${URL}${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar o usuário com ID ${id}:`, error);
      throw error;
    }
  }

  async updateUser(id: string, user: User) {
    try {
      const token = getStoredToken(); // ✅ Busca token dinamicamente
      const response = await axios.put(`${URL}${id}`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar o usuário com ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const token = getStoredToken(); // ✅ Busca token dinamicamente
      const response = await axios.delete(`${URL}${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir o usuário com ID ${id}:`, error);
      throw error;
    }
  }
}

export default new UserService();
