import API_URL from '@/config';
import { User } from '@/interfaces/UserInterface';
import axios from 'axios';

const token = localStorage.getItem('authToken');

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
    `${URL}/auth/register`,
    {
      email: data.email,
      password: data.password,
      username: data.username,
      role: data.role,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
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
