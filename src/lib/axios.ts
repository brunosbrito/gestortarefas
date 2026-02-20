import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import API_URL from '@/config';
import {
  getStoredRefreshToken,
  refreshAccessToken,
  removeRefreshToken,
} from '@/services/AuthService';

const api = axios.create({
  baseURL: API_URL,
});

// Flag para controlar se já está renovando o token
let isRefreshing = false;
// Fila de requisições que falharam e aguardam o novo token
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('userEmail');

  if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
    window.location.href = '/';
  }
};

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Se não for erro 401 ou já tentou retry, rejeita
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Verifica se tem refresh token
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // Se já está renovando, coloca na fila
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject: (err: AxiosError) => {
            reject(err);
          },
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();

      if (!newAccessToken) {
        processQueue(error, null);
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      // Salva o novo token no mesmo storage que estava antes
      const rememberMe = localStorage.getItem('rememberMe');
      if (rememberMe === 'true') {
        localStorage.setItem('authToken', newAccessToken);
      } else {
        sessionStorage.setItem('authToken', newAccessToken);
      }

      // Processa fila de requisições pendentes
      processQueue(null, newAccessToken);

      // Refaz a requisição original com o novo token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(error, null);
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
