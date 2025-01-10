import { User } from '@/interfaces/UserInterface';
import axios from 'axios';

const API_URL = 'http://localhost:3000/users/';
const token = localStorage.getItem('authToken');

class UserService {
  async getAllUsers() {
    try {
      const response = await axios.get(API_URL, {
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
      const response = await axios.get(`${API_URL}${id}`, {
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
      const response = await axios.put(`${API_URL}${id}`, user, {
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
      const response = await axios.delete(`${API_URL}${id}`, {
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