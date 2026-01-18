import axios from 'axios';
import API_URL from '@/config';

const api = axios.create({
  baseURL: API_URL,
});

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
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Token inválido ou expirado. Fazendo logout...');

      // Token expirado ou inválido - limpar tokens e redirecionar para login
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('userEmail');

      // Redirecionar para login (apenas se não estiver já na página de login)
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
