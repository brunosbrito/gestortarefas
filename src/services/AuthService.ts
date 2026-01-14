import API_URL from '@/config';
import { User } from '@/interfaces/UserInterface';
import axios from 'axios';

const getToken = () => localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    return response;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

export const createUser = async (data: Partial<User>) => {
  await axios.post(
    `${API_URL}/auth/register`,
    {
      email: data.email,
      password: data.password,
      username: data.username,
      role: data.role,
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

export const getStoredToken = () => {
  return (
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  );
};
