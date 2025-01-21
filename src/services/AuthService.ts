import API_URL from '@/config';
import axios from 'axios';

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    const { token } = response.data.access_token;

    localStorage.setItem('authToken', response.data.access_token);
    localStorage.setItem('userId', response.data.userId);
    return token;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
};
