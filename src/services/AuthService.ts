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

export const getStoredRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const storeRefreshToken = (token: string) => {
  localStorage.setItem('refreshToken', token);
};

export const removeRefreshToken = () => {
  localStorage.removeItem('refreshToken');
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    removeRefreshToken();
    return null;
  }
};

export const logout = async () => {
  const refreshToken = getStoredRefreshToken();

  if (refreshToken) {
    try {
      await axios.post(`${API_URL}/auth/logout`, {
        refresh_token: refreshToken,
      });
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    }
  }

  // Limpar todos os tokens do storage
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('userEmail');
};
