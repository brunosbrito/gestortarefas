import api from '@/lib/axios';
import { User } from '@/interfaces/UserInterface';
import axios from 'axios';
import API_URL from '@/config';

export const login = async (email: string, password: string) => {
  try {
    // Login usa axios direto sem interceptor (não tem token ainda)
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
  await api.post('/auth/register', {
    email: data.email,
    password: data.password,
    username: data.username,
    role: data.role,
  });
};

export const getStoredToken = () => {
  return (
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  );
};
